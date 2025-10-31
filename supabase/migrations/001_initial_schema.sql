-- PromptLens Database Schema Migration
-- Version: 2.0
-- Description: 기존 테이블(profiles, prompt_analyses, analysis_feedback) 확장 및 saved_prompts 추가
-- 기존 테이블: profiles, prompt_analyses, analysis_feedback (backend.md 기준)
-- 새로 추가: saved_prompts, prompt_analyses 컬럼 확장

-- Enable UUID extension (이미 있을 수 있음)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Table: saved_prompts (신규 추가)
-- Description: 사용자가 저장한 프롬프트 목록
-- ============================================================
CREATE TABLE IF NOT EXISTS public.saved_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- 프롬프트 내용
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,

  -- 메타데이터
  tags TEXT[] DEFAULT '{}', -- 사용자 정의 태그
  is_favorite BOOLEAN DEFAULT FALSE, -- 즐겨찾기 여부

  -- 타임스탬프
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 인덱스를 위한 제약조건
  CONSTRAINT saved_prompts_content_length CHECK (char_length(content) >= 10 AND char_length(content) <= 5000)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_saved_prompts_user_id ON public.saved_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_prompts_created_at ON public.saved_prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_prompts_is_favorite ON public.saved_prompts(user_id, is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS idx_saved_prompts_tags ON public.saved_prompts USING GIN(tags);

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- saved_prompts 테이블에 트리거 적용
CREATE TRIGGER update_saved_prompts_updated_at
  BEFORE UPDATE ON public.saved_prompts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Extend Existing Table: prompt_analyses
-- Description: 기존 prompt_analyses 테이블에 부족한 컬럼 추가
-- ============================================================

-- grade 컬럼 추가 (등급: Excellent, Good, Fair, Poor, Very Poor)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'prompt_analyses'
    AND column_name = 'grade'
  ) THEN
    ALTER TABLE public.prompt_analyses
    ADD COLUMN grade VARCHAR(50);

    -- 기존 데이터에 대한 grade 계산 (overall_score 기반)
    UPDATE public.prompt_analyses SET grade =
      CASE
        WHEN overall_score >= 90 THEN 'Excellent'
        WHEN overall_score >= 75 THEN 'Good'
        WHEN overall_score >= 60 THEN 'Fair'
        WHEN overall_score >= 45 THEN 'Poor'
        ELSE 'Very Poor'
      END
    WHERE grade IS NULL;

    -- NOT NULL 제약 조건 추가
    ALTER TABLE public.prompt_analyses ALTER COLUMN grade SET NOT NULL;
  END IF;
END $$;

-- summary 컬럼 추가 (종합 평가 JSONB)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'prompt_analyses'
    AND column_name = 'summary'
  ) THEN
    ALTER TABLE public.prompt_analyses
    ADD COLUMN summary JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- is_saved 컬럼 추가 (saved_prompts 저장 여부)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'prompt_analyses'
    AND column_name = 'is_saved'
  ) THEN
    ALTER TABLE public.prompt_analyses
    ADD COLUMN is_saved BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- saved_prompt_id 컬럼 추가 (saved_prompts 참조)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'prompt_analyses'
    AND column_name = 'saved_prompt_id'
  ) THEN
    ALTER TABLE public.prompt_analyses
    ADD COLUMN saved_prompt_id UUID REFERENCES public.saved_prompts(id) ON DELETE SET NULL;
  END IF;
END $$;

-- grade 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_prompt_analyses_grade ON public.prompt_analyses(grade);
CREATE INDEX IF NOT EXISTS idx_prompt_analyses_is_saved ON public.prompt_analyses(user_id, is_saved) WHERE is_saved = TRUE;

-- ============================================================
-- Row Level Security (RLS) Policies for saved_prompts
-- ============================================================

-- saved_prompts RLS 활성화
ALTER TABLE public.saved_prompts ENABLE ROW LEVEL SECURITY;

-- saved_prompts 정책: 사용자는 자신의 프롬프트만 조회 가능
-- profiles.id와 auth.uid()가 동일하므로 auth.uid() 사용
CREATE POLICY "Users can view their own saved prompts"
  ON public.saved_prompts
  FOR SELECT
  USING (auth.uid() = user_id);

-- saved_prompts 정책: 사용자는 자신의 프롬프트만 생성 가능
CREATE POLICY "Users can insert their own saved prompts"
  ON public.saved_prompts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- saved_prompts 정책: 사용자는 자신의 프롬프트만 업데이트 가능
CREATE POLICY "Users can update their own saved prompts"
  ON public.saved_prompts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- saved_prompts 정책: 사용자는 자신의 프롬프트만 삭제 가능
CREATE POLICY "Users can delete their own saved prompts"
  ON public.saved_prompts
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- Helper Functions (기존 함수 수정)
-- ============================================================

-- 사용자의 총 분석 횟수 조회 (prompt_analyses 테이블 사용)
CREATE OR REPLACE FUNCTION public.get_user_analysis_count(p_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.prompt_analyses
  WHERE user_id = p_user_id;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- 사용자의 평균 점수 조회 (prompt_analyses 테이블 사용)
CREATE OR REPLACE FUNCTION public.get_user_average_score(p_user_id UUID)
RETURNS NUMERIC AS $$
  SELECT COALESCE(AVG(overall_score), 0)
  FROM public.prompt_analyses
  WHERE user_id = p_user_id;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- 사용자의 최근 분석 기록 조회 (prompt_analyses 테이블 사용)
CREATE OR REPLACE FUNCTION public.get_recent_analysis(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  original_prompt TEXT,
  overall_score INTEGER,
  grade VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
  SELECT id, original_prompt, overall_score, grade, created_at
  FROM public.prompt_analyses
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT p_limit;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ============================================================
-- Comments (문서화)
-- ============================================================

COMMENT ON TABLE public.saved_prompts IS '사용자가 저장한 프롬프트 목록';

COMMENT ON COLUMN public.saved_prompts.title IS '프롬프트 제목 (사용자 정의)';
COMMENT ON COLUMN public.saved_prompts.content IS '프롬프트 전체 내용';
COMMENT ON COLUMN public.saved_prompts.tags IS '사용자 정의 태그 배열';
COMMENT ON COLUMN public.saved_prompts.is_favorite IS '즐겨찾기 여부';

COMMENT ON COLUMN public.prompt_analyses.grade IS '등급 (Excellent, Good, Fair, Poor, Very Poor)';
COMMENT ON COLUMN public.prompt_analyses.summary IS '종합 평가 JSON (overall_assessment, key_strengths, priority_improvements, action_items)';
COMMENT ON COLUMN public.prompt_analyses.is_saved IS 'saved_prompts에 저장 여부';
