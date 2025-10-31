# PromptLens - 백엔드 개발 명세서

## 1. 프로젝트 개요

### 1.1 기술 스택
- **데이터베이스**: Supabase (PostgreSQL)
- **인증**: Supabase Auth (카카오, 구글 소셜 로그인)
- **API**: Next.js API Routes
- **AI 분석**: Solar-Pro API
- **파일 저장**: Supabase Storage
- **실시간**: Supabase Realtime
- **모니터링**: Supabase Analytics

### 1.2 아키텍처 개요
```
Frontend (Next.js) 
    ↓
API Routes (/api/*)
    ↓
Supabase Services
    ├── Database (PostgreSQL)
    ├── Auth (소셜 로그인)
    ├── Storage (파일 저장)
    └── Realtime (실시간 업데이트)
    ↓
External APIs
    ├── Solar-Pro (프롬프트 분석)
    ├── Kakao OAuth
    └── Google OAuth
```

## 2. 데이터베이스 설계

### 2.1 테이블 구조

#### users 테이블 (Supabase Auth 확장)
```sql
-- Supabase Auth의 auth.users 테이블을 확장
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  provider TEXT NOT NULL, -- 'kakao' | 'google'
  provider_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT profiles_provider_provider_id_key UNIQUE (provider, provider_id)
);

-- RLS (Row Level Security) 정책
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
```

#### saved_prompts 테이블 (신규 추가 - Phase 2)
```sql
CREATE TABLE public.saved_prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- 프롬프트 내용
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,

  -- 메타데이터
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,

  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 제약조건
  CONSTRAINT saved_prompts_content_length CHECK (char_length(content) >= 10 AND char_length(content) <= 5000)
);

-- 인덱스 생성
CREATE INDEX idx_saved_prompts_user_id ON public.saved_prompts(user_id);
CREATE INDEX idx_saved_prompts_created_at ON public.saved_prompts(created_at DESC);
CREATE INDEX idx_saved_prompts_is_favorite ON public.saved_prompts(user_id, is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX idx_saved_prompts_tags ON public.saved_prompts USING GIN(tags);

-- RLS 정책
ALTER TABLE public.saved_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved prompts" ON public.saved_prompts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved prompts" ON public.saved_prompts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved prompts" ON public.saved_prompts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved prompts" ON public.saved_prompts
  FOR DELETE USING (auth.uid() = user_id);
```

#### prompt_analyses 테이블 (확장됨)
```sql
CREATE TABLE public.prompt_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  original_prompt TEXT NOT NULL,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),

  -- 세부 점수
  clarity_score INTEGER NOT NULL CHECK (clarity_score >= 0 AND clarity_score <= 25),
  specificity_score INTEGER NOT NULL CHECK (specificity_score >= 0 AND specificity_score <= 25),
  structure_score INTEGER NOT NULL CHECK (structure_score >= 0 AND structure_score <= 20),
  completeness_score INTEGER NOT NULL CHECK (completeness_score >= 0 AND completeness_score <= 20),
  efficiency_score INTEGER NOT NULL CHECK (efficiency_score >= 0 AND efficiency_score <= 10),

  -- 피드백
  clarity_feedback TEXT NOT NULL,
  specificity_feedback TEXT NOT NULL,
  structure_feedback TEXT NOT NULL,
  completeness_feedback TEXT NOT NULL,
  efficiency_feedback TEXT NOT NULL,

  -- 개선 제안
  improved_prompt TEXT NOT NULL,
  improvements JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- 신규 추가 컬럼 (v2.0)
  grade VARCHAR(50) NOT NULL, -- 'Excellent', 'Good', 'Fair', 'Poor', 'Very Poor'
  summary JSONB DEFAULT '{}'::jsonb, -- 종합 평가 (overall_assessment, key_strengths, priority_improvements, action_items)
  is_saved BOOLEAN DEFAULT FALSE, -- saved_prompts에 저장 여부
  saved_prompt_id UUID REFERENCES public.saved_prompts(id) ON DELETE SET NULL,

  -- 메타데이터
  analysis_version TEXT DEFAULT '1.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_prompt_analyses_user_id ON public.prompt_analyses(user_id);
CREATE INDEX idx_prompt_analyses_created_at ON public.prompt_analyses(created_at DESC);
CREATE INDEX idx_prompt_analyses_overall_score ON public.prompt_analyses(overall_score);
CREATE INDEX idx_prompt_analyses_grade ON public.prompt_analyses(grade);
CREATE INDEX idx_prompt_analyses_is_saved ON public.prompt_analyses(user_id, is_saved) WHERE is_saved = TRUE;

-- RLS 정책
ALTER TABLE public.prompt_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses" ON public.prompt_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON public.prompt_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses" ON public.prompt_analyses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses" ON public.prompt_analyses
  FOR DELETE USING (auth.uid() = user_id);
```

#### analysis_feedback 테이블 (사용자 피드백)
```sql
CREATE TABLE public.analysis_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID REFERENCES public.prompt_analyses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('helpful', 'not_helpful', 'report')),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_user_analysis_feedback UNIQUE (analysis_id, user_id)
);

-- RLS 정책
ALTER TABLE public.analysis_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own feedback" ON public.analysis_feedback
  FOR ALL USING (auth.uid() = user_id);
```

### 2.2 함수 및 트리거

#### updated_at 자동 업데이트 함수
```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- saved_prompts 트리거
CREATE TRIGGER update_saved_prompts_updated_at
  BEFORE UPDATE ON public.saved_prompts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- prompt_analyses 트리거 (기존)
CREATE TRIGGER update_prompt_analyses_updated_at
  BEFORE UPDATE ON public.prompt_analyses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- profiles 트리거 (기존)
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

#### 프로필 자동 생성 함수
```sql
-- 사용자 가입 시 프로필 자동 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url, provider, provider_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    COALESCE(NEW.raw_user_meta_data->>'provider', 'unknown'),
    COALESCE(NEW.raw_user_meta_data->>'provider_id', NEW.id::text)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```


## 3. 인증 시스템

### 3.1 Supabase Auth 설정

#### 환경 변수 설정
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OAuth 설정
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### Supabase 클라이언트 설정
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 서버 사이드 클라이언트 (서비스 롤 키 사용)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

### 3.2 소셜 로그인 구현

#### 카카오 로그인 API
```typescript
// app/api/auth/kakao/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    
    // 카카오 토큰 교환
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_CLIENT_ID!,
        client_secret: process.env.KAKAO_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback/kakao`,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()
    
    if (!tokenData.access_token) {
      return NextResponse.json({ error: '카카오 인증 실패' }, { status: 400 })
    }

    // 카카오 사용자 정보 조회
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const userData = await userResponse.json()
    
    // Supabase Auth로 사용자 생성/로그인
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${userData.id}@kakao.temp`, // 임시 이메일
      password: 'kakao_user', // 임시 비밀번호
    })

    if (error) {
      // 사용자가 없으면 새로 생성
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: `${userData.id}@kakao.temp`,
        password: 'kakao_user',
        options: {
          data: {
            display_name: userData.kakao_account.profile.nickname,
            avatar_url: userData.kakao_account.profile.profile_image_url,
            provider: 'kakao',
            provider_id: userData.id.toString(),
          }
        }
      })

      if (signUpError) {
        return NextResponse.json({ error: '사용자 생성 실패' }, { status: 500 })
      }

      return NextResponse.json({ user: signUpData.user })
    }

    return NextResponse.json({ user: data.user })
  } catch (error) {
    console.error('카카오 로그인 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
```

#### 구글 로그인 API
```typescript
// app/api/auth/google/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    
    // 구글 토큰 교환
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback/google`,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()
    
    if (!tokenData.access_token) {
      return NextResponse.json({ error: '구글 인증 실패' }, { status: 400 })
    }

    // 구글 사용자 정보 조회
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const userData = await userResponse.json()
    
    // Supabase Auth로 사용자 생성/로그인
    const { data, error } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: 'google_user',
    })

    if (error) {
      // 사용자가 없으면 새로 생성
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: 'google_user',
        options: {
          data: {
            display_name: userData.name,
            avatar_url: userData.picture,
            provider: 'google',
            provider_id: userData.id,
          }
        }
      })

      if (signUpError) {
        return NextResponse.json({ error: '사용자 생성 실패' }, { status: 500 })
      }

      return NextResponse.json({ user: signUpData.user })
    }

    return NextResponse.json({ user: data.user })
  } catch (error) {
    console.error('구글 로그인 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
```

## 4. 프롬프트 분석 API

### 4.1 분석 요청 API
```typescript
// app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { analyzePromptWithAI } from '@/lib/ai-analysis'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()
    
    // 입력 검증
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: '프롬프트가 필요합니다' }, { status: 400 })
    }

    if (prompt.length < 10) {
      return NextResponse.json({ error: '프롬프트는 최소 10자 이상이어야 합니다' }, { status: 400 })
    }

    if (prompt.length > 5000) {
      return NextResponse.json({ error: '프롬프트는 최대 5000자까지 가능합니다' }, { status: 400 })
    }

    // 사용자 인증 확인
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: '인증 실패' }, { status: 401 })
    }

    // AI 분석 수행
    const analysisResult = await analyzePromptWithAI(prompt)
    
    // 데이터베이스에 분석 결과 저장
    const { data: analysis, error: dbError } = await supabaseAdmin
      .from('prompt_analyses')
      .insert({
        user_id: user.id,
        original_prompt: prompt,
        overall_score: analysisResult.overallScore,
        clarity_score: analysisResult.scores.clarity,
        specificity_score: analysisResult.scores.specificity,
        structure_score: analysisResult.scores.structure,
        completeness_score: analysisResult.scores.completeness,
        efficiency_score: analysisResult.scores.efficiency,
        clarity_feedback: analysisResult.feedback.clarity,
        specificity_feedback: analysisResult.feedback.specificity,
        structure_feedback: analysisResult.feedback.structure,
        completeness_feedback: analysisResult.feedback.completeness,
        efficiency_feedback: analysisResult.feedback.efficiency,
        improved_prompt: analysisResult.improvedPrompt,
        improvements: analysisResult.improvements,
      })
      .select()
      .single()

    if (dbError) {
      console.error('데이터베이스 저장 오류:', dbError)
      return NextResponse.json({ error: '분석 결과 저장 실패' }, { status: 500 })
    }

    return NextResponse.json({
      id: analysis.id,
      overallScore: analysis.overall_score,
      scores: {
        clarity: analysis.clarity_score,
        specificity: analysis.specificity_score,
        structure: analysis.structure_score,
        completeness: analysis.completeness_score,
        efficiency: analysis.efficiency_score,
      },
      feedback: {
        clarity: analysis.clarity_feedback,
        specificity: analysis.specificity_feedback,
        structure: analysis.structure_feedback,
        completeness: analysis.completeness_feedback,
        efficiency: analysis.efficiency_feedback,
      },
      improvedPrompt: analysis.improved_prompt,
      improvements: analysis.improvements,
    })
  } catch (error) {
    console.error('분석 API 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
```

### 4.2 AI 분석 로직
```typescript
// lib/ai-analysis.ts
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.SOLAR_API_KEY, // Solar-Pro는 Claude 기반이므로 Anthropic SDK 사용
  baseURL: process.env.SOLAR_BASE_URL || 'https://api.solar.pro', // Solar-Pro 엔드포인트
})

interface AnalysisResult {
  overallScore: number
  scores: {
    clarity: number
    specificity: number
    structure: number
    completeness: number
    efficiency: number
  }
  feedback: {
    clarity: string
    specificity: string
    structure: string
    completeness: string
    efficiency: string
  }
  improvedPrompt: string
  improvements: string[]
}

export async function analyzePromptWithAI(prompt: string): Promise<AnalysisResult> {
  const systemPrompt = `
당신은 프롬프트 엔지니어링 전문가입니다. 주어진 프롬프트를 다음 5개 항목으로 평가하고 JSON 형태로 응답해주세요:

1. 명확성 (Clarity) - 25점 만점
   - 프롬프트의 목적과 의도가 명확한가?
   - 요청 사항이 구체적으로 기술되어 있는가?
   - 모호한 표현이나 중의적 해석의 여지는 없는가?

2. 구체성 (Specificity) - 25점 만점
   - 필요한 세부 정보가 충분히 포함되어 있는가?
   - 출력 형식, 길이, 스타일 등이 명시되어 있는가?
   - 구체적인 예시나 컨텍스트가 제공되는가?

3. 구조화 (Structure) - 20점 만점
   - 논리적인 순서로 정보가 배열되어 있는가?
   - 단락이나 구분이 적절히 사용되었는가?
   - 복잡한 요청이 단계별로 나뉘어 있는가?

4. 완전성 (Completeness) - 20점 만점
   - AI가 답변하는 데 필요한 모든 정보가 포함되어 있는가?
   - 제약 조건이나 주의사항이 명시되어 있는가?
   - 역할, 맥락, 목표가 적절히 설명되어 있는가?

5. 효율성 (Efficiency) - 10점 만점
   - 불필요한 반복이나 장황한 설명이 없는가?
   - 핵심 내용을 간결하게 전달하는가?
   - 토큰 효율성이 고려되었는가?

응답 형식:
{
  "overallScore": 전체점수(0-100),
  "scores": {
    "clarity": 명확성점수(0-25),
    "specificity": 구체성점수(0-25),
    "structure": 구조화점수(0-20),
    "completeness": 완전성점수(0-20),
    "efficiency": 효율성점수(0-10)
  },
  "feedback": {
    "clarity": "명확성 피드백 (2-3문장)",
    "specificity": "구체성 피드백 (2-3문장)",
    "structure": "구조화 피드백 (2-3문장)",
    "completeness": "완전성 피드백 (2-3문장)",
    "efficiency": "효율성 피드백 (2-3문장)"
  },
  "improvedPrompt": "개선된 프롬프트 전문",
  "improvements": ["개선사항1", "개선사항2", "개선사항3"]
}
`

  try {
    // Solar-Pro를 사용한 AI 분석
    const completion = await anthropic.messages.create({
      model: "solar-pro", // Solar-Pro 모델 지정
      max_tokens: 2000,
      temperature: 0.3,
      system: systemPrompt,
      messages: [
        { role: "user", content: prompt }
      ],
    })

    const responseText = completion.content[0].type === 'text' 
      ? completion.content[0].text 
      : null
    
    if (!responseText) {
      throw new Error('AI 응답이 비어있습니다')
    }

    const analysisResult = JSON.parse(responseText) as AnalysisResult
    
    // 점수 검증
    if (analysisResult.overallScore < 0 || analysisResult.overallScore > 100) {
      throw new Error('전체 점수가 범위를 벗어났습니다')
    }

    return analysisResult
  } catch (error) {
    console.error('AI 분석 오류:', error)
    throw new Error('프롬프트 분석 중 오류가 발생했습니다')
  }
}
```

## 5. 사용자 데이터 관리 API

### 5.1 분석 히스토리 조회
```typescript
// app/api/analyses/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // 사용자 인증 확인
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: '인증 실패' }, { status: 401 })
    }

    // 페이지네이션 파라미터
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // 분석 히스토리 조회
    const { data: analyses, error } = await supabaseAdmin
      .from('prompt_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('분석 히스토리 조회 오류:', error)
      return NextResponse.json({ error: '데이터 조회 실패' }, { status: 500 })
    }

    // 총 개수 조회
    const { count } = await supabaseAdmin
      .from('prompt_analyses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    return NextResponse.json({
      analyses,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      }
    })
  } catch (error) {
    console.error('분석 히스토리 API 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
```

### 5.2 특정 분석 결과 조회
```typescript
// app/api/analyses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // 사용자 인증 확인
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: '인증 실패' }, { status: 401 })
    }

    // 분석 결과 조회
    const { data: analysis, error } = await supabaseAdmin
      .from('prompt_analyses')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: '분석 결과를 찾을 수 없습니다' }, { status: 404 })
      }
      console.error('분석 결과 조회 오류:', error)
      return NextResponse.json({ error: '데이터 조회 실패' }, { status: 500 })
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('분석 결과 API 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
```

## 6. 피드백 시스템

### 6.1 분석 피드백 API
```typescript
// app/api/feedback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { analysisId, feedbackType, comment } = await request.json()

    // 사용자 인증 확인
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: '인증 실패' }, { status: 401 })
    }

    // 피드백 저장
    const { data: feedback, error } = await supabaseAdmin
      .from('analysis_feedback')
      .upsert({
        analysis_id: analysisId,
        user_id: user.id,
        feedback_type: feedbackType,
        comment: comment || null,
      })
      .select()
      .single()

    if (error) {
      console.error('피드백 저장 오류:', error)
      return NextResponse.json({ error: '피드백 저장 실패' }, { status: 500 })
    }

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('피드백 API 오류:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
```

## 7. 실시간 기능

### 7.1 분석 진행 상황 실시간 업데이트
```typescript
// lib/realtime.ts
import { supabase } from '@/lib/supabase'

export function subscribeToAnalysisProgress(
  analysisId: string,
  onUpdate: (progress: number) => void
) {
  const channel = supabase
    .channel(`analysis-progress-${analysisId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'prompt_analyses',
        filter: `id=eq.${analysisId}`,
      },
      (payload) => {
        // 분석 진행 상황 업데이트
        onUpdate(payload.new.progress || 100)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
```

## 8. 보안 및 검증

### 8.1 입력 검증 미들웨어
```typescript
// lib/validation.ts
import { z } from 'zod'

export const promptSchema = z.object({
  prompt: z.string()
    .min(10, '프롬프트는 최소 10자 이상이어야 합니다')
    .max(5000, '프롬프트는 최대 5000자까지 가능합니다')
    .regex(/^[\s\S]*$/, '유효하지 않은 문자가 포함되어 있습니다'),
})

export const feedbackSchema = z.object({
  analysisId: z.string().uuid('유효하지 않은 분석 ID입니다'),
  feedbackType: z.enum(['helpful', 'not_helpful', 'report']),
  comment: z.string().max(500, '댓글은 최대 500자까지 가능합니다').optional(),
})

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`입력 검증 실패: ${error.errors.map(e => e.message).join(', ')}`)
    }
    throw error
  }
}
```

### 8.2 Rate Limiting
```typescript
// lib/rate-limit.ts
import { NextRequest } from 'next/server'

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(
  request: NextRequest,
  limit: number = 10,
  windowMs: number = 60000 // 1분
): boolean {
  const ip = request.ip || 'unknown'
  const now = Date.now()
  const windowStart = now - windowMs

  // 오래된 데이터 정리
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < windowStart) {
      rateLimitMap.delete(key)
    }
  }

  const current = rateLimitMap.get(ip)
  
  if (!current) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (current.count >= limit) {
    return false
  }

  current.count++
  return true
}
```

## 9. 모니터링 및 로깅

### 9.1 에러 로깅
```typescript
// lib/logger.ts
export function logError(error: Error, context?: Record<string, any>) {
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  })
  
  // Supabase에 에러 로그 저장 (선택사항)
  // supabaseAdmin.from('error_logs').insert({ ... })
}

export function logAnalytics(event: string, properties?: Record<string, any>) {
  console.log('Analytics:', {
    event,
    properties,
    timestamp: new Date().toISOString(),
  })
}
```

## 10. 환경 설정

### 10.1 Supabase 프로젝트 설정
```sql
-- Supabase 프로젝트에서 실행할 초기 설정

-- 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- RLS 활성화
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'your-jwt-secret';

-- 사용자 정의 함수들 (위에서 정의한 함수들 실행)
```

### 10.2 환경 변수 설정
```bash
# .env.local
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OAuth
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Solar-Pro (AI 분석)
SOLAR_API_KEY=your-solar-pro-api-key
SOLAR_BASE_URL=https://api.solar.pro

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

**문서 버전:** 1.0  
**최종 수정일:** 2025-01-27  
**작성자:** PromptLens Backend Team
