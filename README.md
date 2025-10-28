# PromptLens

AI 프롬프트의 품질을 객관적으로 평가하고, 구체적인 개선 방향을 제시하는 웹 기반 분석 도구입니다.

## 🚀 시작하기

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.example` 파일을 복사하여 `.env.local` 파일을 생성합니다:

```bash
cp .env.example .env.local
```

`.env.local` 파일을 열어 필요한 환경변수를 설정합니다:

```env
# 애플리케이션 설정
NEXT_PUBLIC_APP_NAME=PromptLens
NEXT_PUBLIC_APP_URL=http://localhost:3000

# API 엔드포인트
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# 환경 설정
NODE_ENV=development

# 분석 설정
NEXT_PUBLIC_MIN_PROMPT_LENGTH=10
NEXT_PUBLIC_MAX_PROMPT_LENGTH=5000
NEXT_PUBLIC_ANALYSIS_TIMEOUT=5000
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

## 📁 프로젝트 구조

```
prompt-lens/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 메인 랜딩 페이지
│   └── globals.css        # 전역 스타일
├── src/
│   ├── components/        # 재사용 가능한 컴포넌트
│   │   ├── ui/           # 기본 UI 컴포넌트
│   │   ├── forms/        # 폼 관련 컴포넌트
│   │   └── layout/       # 레이아웃 컴포넌트
│   ├── lib/              # 유틸리티 함수 및 환경변수
│   └── types/            # TypeScript 타입 정의
└── require/              # 프로젝트 명세서
```

## 🛠 기술 스택

- **프레임워크**: Next.js 16 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **폼 관리**: React Hook Form
- **애니메이션**: Framer Motion
- **아이콘**: Lucide React
- **컴포넌트 유틸리티**: Radix UI, CVA

## ✨ 주요 기능

### Phase 1 (현재)
- ✅ 프롬프트 입력 인터페이스
- ✅ 실시간 글자 수 카운터
- ✅ 로컬 스토리지 자동 저장
- ✅ 반응형 UI/UX
- ✅ 애니메이션 및 인터랙션
- 🚧 5가지 평가 지표 분석 (개발 예정)
- 🚧 100점 만점 점수 시스템 (개발 예정)
- 🚧 상세 분석 결과 화면 (개발 예정)
- 🚧 개선된 프롬프트 제안 (개발 예정)

### Phase 2 (향후 계획)
- 프롬프트 히스토리 저장 및 관리
- 사용자 계정 및 로그인
- 프롬프트 템플릿 라이브러리
- 팀 협업 기능

### Phase 3 (향후 계획)
- API 제공
- 브라우저 익스텐션
- 실시간 프롬프트 개선 제안
- A/B 테스트 기능

## 📝 환경변수 설명

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `NEXT_PUBLIC_APP_NAME` | 애플리케이션 이름 | PromptLens |
| `NEXT_PUBLIC_APP_URL` | 애플리케이션 URL | http://localhost:3000 |
| `NEXT_PUBLIC_API_URL` | API 엔드포인트 | http://localhost:3000/api |
| `NEXT_PUBLIC_MIN_PROMPT_LENGTH` | 최소 프롬프트 길이 | 10 |
| `NEXT_PUBLIC_MAX_PROMPT_LENGTH` | 최대 프롬프트 길이 | 5000 |
| `NEXT_PUBLIC_ANALYSIS_TIMEOUT` | 분석 타임아웃 (ms) | 5000 |

## 🔧 개발 가이드

### 빌드

```bash
npm run build
```

### TypeScript 타입 체크

```bash
npx tsc --noEmit
```

### 린트

```bash
npm run lint
```

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 👥 팀

PromptLens Team

## 📮 문의

이슈나 질문이 있으시면 GitHub Issues를 통해 문의해주세요.

---

**Made with ❤️ by PromptLens Team**
