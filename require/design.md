# PromptLens - 디자인 시스템 문서

## 1. 디자인 철학

### 1.1 핵심 가치
- **명확성 (Clarity)**: 복잡한 정보를 직관적으로 전달
- **신뢰성 (Trust)**: 전문적이고 정확한 분석 결과 제공
- **효율성 (Efficiency)**: 빠르고 간편한 사용자 경험
- **접근성 (Accessibility)**: 모든 사용자가 쉽게 이용할 수 있는 인터페이스

### 1.2 디자인 원칙
- **극단적 미니멀리즘**: 전통적인 웹 레이아웃을 벗어난 혁신적 디자인
  - 헤더/푸터 제거
  - 라벨 최소화
  - 플로팅 인터페이스 활용
- **일관성**: 모든 화면과 컴포넌트에서 통일된 디자인 언어 사용
- **반응성**: 다양한 디바이스에서 최적화된 경험 제공
- **직관성**: 사용자가 별도 학습 없이 즉시 사용 가능한 인터페이스
- **몰입감**: 풀스크린 레이아웃으로 집중력 극대화

## 2. 디자인 토큰

### 2.1 색상 시스템

#### Primary Colors (주 색상)
```css
--primary-50: #f0f9ff    /* 매우 연한 파란색 */
--primary-100: #e0f2fe   /* 연한 파란색 */
--primary-200: #bae6fd   /* 밝은 파란색 */
--primary-300: #7dd3fc   /* 중간 파란색 */
--primary-400: #38bdf8   /* 진한 파란색 */
--primary-500: #0ea5e9   /* 메인 파란색 */
--primary-600: #0284c7   /* 어두운 파란색 */
--primary-700: #0369a1   /* 매우 어두운 파란색 */
--primary-800: #075985   /* 가장 어두운 파란색 */
--primary-900: #0c4a6e   /* 초어두운 파란색 */
```

#### Secondary Colors (보조 색상)
```css
--secondary-50: #f8fafc   /* 매우 연한 회색 */
--secondary-100: #f1f5f9  /* 연한 회색 */
--secondary-200: #e2e8f0  /* 밝은 회색 */
--secondary-300: #cbd5e1  /* 중간 회색 */
--secondary-400: #94a3b8  /* 진한 회색 */
--secondary-500: #64748b  /* 메인 회색 */
--secondary-600: #475569  /* 어두운 회색 */
--secondary-700: #334155  /* 매우 어두운 회색 */
--secondary-800: #1e293b  /* 가장 어두운 회색 */
--secondary-900: #0f172a  /* 초어두운 회색 */
```

#### Semantic Colors (의미 색상)
```css
/* 성공/우수 */
--success-50: #f0fdf4
--success-500: #22c55e
--success-600: #16a34a

/* 경고/주의 */
--warning-50: #fffbeb
--warning-500: #f59e0b
--warning-600: #d97706

/* 오류/미흡 */
--error-50: #fef2f2
--error-500: #ef4444
--error-600: #dc2626

/* 정보 */
--info-50: #eff6ff
--info-500: #3b82f6
--info-600: #2563eb
```

#### 점수 등급별 색상
```css
--score-excellent: #22c55e    /* 90-100점: 초록 */
--score-good: #84cc16         /* 75-89점: 연두 */
--score-fair: #eab308         /* 60-74점: 노랑 */
--score-poor: #f97316         /* 45-59점: 주황 */
--score-very-poor: #ef4444    /* 0-44점: 빨강 */
```

### 2.2 타이포그래피

#### 폰트 패밀리
```css
--font-primary: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

#### 폰트 크기
```css
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */
--text-6xl: 3.75rem;     /* 60px */
```

#### 폰트 두께
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

#### 라인 높이
```css
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

### 2.3 간격 시스템

#### 기본 간격 (8px 기준)
```css
--space-0: 0;
--space-1: 0.25rem;     /* 4px */
--space-2: 0.5rem;      /* 8px */
--space-3: 0.75rem;     /* 12px */
--space-4: 1rem;        /* 16px */
--space-5: 1.25rem;     /* 20px */
--space-6: 1.5rem;      /* 24px */
--space-8: 2rem;         /* 32px */
--space-10: 2.5rem;      /* 40px */
--space-12: 3rem;        /* 48px */
--space-16: 4rem;        /* 64px */
--space-20: 5rem;        /* 80px */
--space-24: 6rem;        /* 96px */
--space-32: 8rem;        /* 128px */
```

### 2.4 보더 및 둥근 모서리

#### 보더 반지름
```css
--radius-none: 0;
--radius-sm: 0.125rem;   /* 2px */
--radius-base: 0.25rem;   /* 4px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-3xl: 1.5rem;    /* 24px */
--radius-full: 9999px;
```

#### 보더 두께
```css
--border-0: 0;
--border-1: 1px;
--border-2: 2px;
--border-4: 4px;
--border-8: 8px;
```

### 2.5 그림자

#### 그림자 레벨
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
--shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
```

### 2.6 애니메이션

#### 트랜지션 지속 시간
```css
--duration-75: 75ms;
--duration-100: 100ms;
--duration-150: 150ms;
--duration-200: 200ms;
--duration-300: 300ms;
--duration-500: 500ms;
--duration-700: 700ms;
--duration-1000: 1000ms;
```

#### 이징 함수
```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

## 3. 컴포넌트 디자인

### 3.1 버튼

#### Primary Button
```css
.btn-primary {
  background-color: var(--primary-500);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  font-weight: var(--font-semibold);
  font-size: var(--text-base);
  border: none;
  cursor: pointer;
  transition: all var(--duration-200) var(--ease-in-out);
}

.btn-primary:hover {
  background-color: var(--primary-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
```

#### Secondary Button
```css
.btn-secondary {
  background-color: transparent;
  color: var(--secondary-700);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  font-weight: var(--font-medium);
  font-size: var(--text-base);
  border: var(--border-2) solid var(--secondary-300);
  cursor: pointer;
  transition: all var(--duration-200) var(--ease-in-out);
}

.btn-secondary:hover {
  background-color: var(--secondary-50);
  border-color: var(--secondary-400);
}
```

### 3.2 입력 필드

#### Textarea (프롬프트 입력)
```css
.prompt-textarea {
  width: 100%;
  min-height: 200px;
  padding: var(--space-4);
  border: var(--border-2) solid var(--secondary-300);
  border-radius: var(--radius-lg);
  font-family: var(--font-primary);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  resize: vertical;
  transition: border-color var(--duration-200) var(--ease-in-out);
}

.prompt-textarea:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px var(--primary-100);
}
```

### 3.3 점수 게이지

#### 원형 게이지
```css
.score-gauge {
  width: 200px;
  height: 200px;
  position: relative;
  border-radius: var(--radius-full);
  background: conic-gradient(
    var(--score-color) 0deg,
    var(--score-color) var(--score-angle),
    var(--secondary-200) var(--score-angle),
    var(--secondary-200) 360deg
  );
}

.score-gauge::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 140px;
  height: 140px;
  background: white;
  border-radius: var(--radius-full);
  transform: translate(-50%, -50%);
}
```

### 3.4 카드

#### 기본 카드
```css
.card {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  border: var(--border-1) solid var(--secondary-200);
  transition: all var(--duration-200) var(--ease-in-out);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
```

## 4. 레이아웃 시스템

### 4.1 풀스크린 2단 레이아웃
메인 페이지의 핵심 레이아웃:

```css
.fullscreen-split-layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.left-panel {
  width: 50%;
  height: 100%;
  background: white;
  border-right: 1px solid var(--secondary-200);
  position: relative;
}

.right-panel {
  width: 50%;
  height: 100%;
  background: linear-gradient(135deg, var(--primary-50) 0%, white 50%, var(--primary-100) 100%);
  overflow-y: auto;
}
```

### 4.2 플로팅 요소 디자인

#### 플로팅 분석 버튼
```css
.floating-analyze-button {
  position: absolute;
  bottom: var(--space-8);
  left: 50%;
  transform: translateX(-50%);

  padding: var(--space-4) var(--space-8);
  background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
  color: white;

  border-radius: 9999px; /* 완전한 둥근 모양 */
  box-shadow: var(--shadow-2xl);

  font-size: var(--text-lg);
  font-weight: var(--font-semibold);

  transition: all var(--duration-300) var(--ease-out);
  cursor: pointer;
}

.floating-analyze-button:hover {
  transform: translateX(-50%) scale(1.05);
  box-shadow: 0 30px 60px -15px rgba(14, 165, 233, 0.5);
}

.floating-analyze-button:active {
  transform: translateX(-50%) scale(0.95);
}
```

#### 플로팅 메뉴 버튼
```css
.floating-menu-button {
  position: fixed;
  bottom: var(--space-8);
  right: var(--space-8);
  z-index: 50;

  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%);
  color: white;

  border-radius: 50%;
  box-shadow: var(--shadow-2xl);

  display: flex;
  align-items: center;
  justify-content: center;

  transition: all var(--duration-300) var(--ease-out);
  cursor: pointer;
}

.floating-menu-button:hover {
  transform: scale(1.1);
  box-shadow: 0 25px 50px -12px rgba(14, 165, 233, 0.5);
}
```

#### 플로팅 메뉴 패널
```css
.floating-menu-panel {
  position: fixed;
  bottom: calc(56px + var(--space-8) + var(--space-4));
  right: var(--space-8);
  z-index: 50;

  background: white;
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-2xl);
  border: var(--border-1) solid var(--secondary-200);

  min-width: 200px;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);

  font-weight: var(--font-medium);
  color: var(--secondary-700);

  transition: background-color var(--duration-200) var(--ease-out);
  cursor: pointer;
}

.menu-item:hover {
  background-color: var(--primary-50);
  color: var(--primary-600);
}

.menu-item.active {
  background-color: var(--primary-50);
  color: var(--primary-600);
}

.menu-divider {
  height: 1px;
  background-color: var(--secondary-200);
}
```

### 4.3 그리드 시스템 (소개 페이지용)
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

.grid {
  display: grid;
  gap: var(--space-6);
}

.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
```

### 4.4 반응형 브레이크포인트
```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### 4.5 반응형 레이아웃 조정

#### 데스크톱 (1024px 이상)
- 2단 레이아웃 유지 (50:50)
- 모든 플로팅 요소 표시

#### 태블릿 (768px - 1023px)
- 2단 레이아웃 유지
- 입력 영역 약간 넓게 (55:45)

#### 모바일 (767px 이하)
```css
@media (max-width: 767px) {
  .fullscreen-split-layout {
    flex-direction: column;
  }

  .left-panel,
  .right-panel {
    width: 100%;
    height: 50vh;
  }

  .floating-analyze-button {
    padding: var(--space-3) var(--space-6);
    font-size: var(--text-base);
  }

  .floating-menu-button {
    width: 48px;
    height: 48px;
    bottom: var(--space-6);
    right: var(--space-6);
  }
}
```

## 5. 접근성 가이드라인

### 5.1 색상 대비
- 일반 텍스트: 최소 4.5:1 대비율
- 큰 텍스트 (18px 이상): 최소 3:1 대비율
- UI 컴포넌트: 최소 3:1 대비율

### 5.2 포커스 표시
```css
.focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
```

### 5.3 키보드 네비게이션
- Tab 순서: 논리적 순서로 구성
- Enter/Space: 버튼 및 인터랙티브 요소 활성화
- Escape: 모달 및 드롭다운 닫기

## 6. 아이콘 시스템

### 6.1 아이콘 스타일
- 선 스타일 (outline) 우선 사용
- 일관된 선 두께 (2px)
- 24px 기본 크기
- SVG 형식 사용

### 6.2 주요 아이콘
- 분석 아이콘: 망원경 또는 분석 기호
- 복사 아이콘: 클립보드 또는 복사 기호
- 점수 아이콘: 별 또는 게이지
- 개선 아이콘: 화살표 또는 업그레이드 기호

## 7. 다크 모드 지원

### 7.1 다크 모드 색상
```css
[data-theme="dark"] {
  --primary-50: #0c4a6e;
  --primary-100: #075985;
  --primary-500: #38bdf8;
  --primary-600: #0ea5e9;
  
  --secondary-50: #0f172a;
  --secondary-100: #1e293b;
  --secondary-500: #94a3b8;
  --secondary-600: #cbd5e1;
  
  --background: #0f172a;
  --surface: #1e293b;
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
}
```

## 8. 디자인 라이브러리 및 도구

### 8.1 선택된 디자인 라이브러리

#### **Tailwind CSS** (주요 CSS 프레임워크)
**선택 이유:**
- 유틸리티 퍼스트 접근법으로 빠른 개발 가능
- 커스텀 디자인 토큰과 완벽 호환
- 반응형 디자인 내장 지원
- 접근성 기능 내장
- 번들 크기 최적화

**설치 및 설정:**
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**tailwind.config.js 설정:**
```javascript
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        score: {
          excellent: '#22c55e',
          good: '#84cc16',
          fair: '#eab308',
          poor: '#f97316',
          'very-poor': '#ef4444',
        }
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

#### **Radix UI** (컴포넌트 라이브러리)
**선택 이유:**
- 접근성 우선 설계 (WCAG 2.1 AA 준수)
- 헤드리스 컴포넌트로 스타일링 자유도 높음
- TypeScript 완벽 지원
- 키보드 네비게이션 내장

**주요 사용 컴포넌트:**
```bash
npm install @radix-ui/react-dialog @radix-ui/react-tooltip @radix-ui/react-progress
```

- **Dialog**: 모달 및 분석 결과 팝업
- **Tooltip**: 개선 제안 설명
- **Progress**: 로딩 상태 표시

#### **Framer Motion** (애니메이션 라이브러리)
**선택 이유:**
- React 친화적 애니메이션 라이브러리
- 성능 최적화된 애니메이션
- 복잡한 인터랙션 구현 가능
- 점수 게이지 애니메이션에 최적

**설치:**
```bash
npm install framer-motion
```

**사용 예시:**
```jsx
import { motion } from 'framer-motion'

// 점수 게이지 애니메이션
<motion.div
  className="score-gauge"
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ duration: 0.5, ease: "easeOut" }}
>
  <motion.div
    className="gauge-fill"
    initial={{ pathLength: 0 }}
    animate={{ pathLength: score / 100 }}
    transition={{ duration: 1, ease: "easeInOut" }}
  />
</motion.div>
```

#### **Recharts** (차트 라이브러리)
**선택 이유:**
- React 전용 차트 라이브러리
- 반응형 차트 자동 지원
- 접근성 기능 내장
- 커스터마이징 용이

**설치:**
```bash
npm install recharts
```

**사용 예시:**
```jsx
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

// 평가 항목별 레이더 차트
<RadarChart width={400} height={300} data={scoreData}>
  <PolarGrid />
  <PolarAngleAxis dataKey="category" />
  <PolarRadiusAxis angle={90} domain={[0, 100]} />
  <Radar name="점수" dataKey="score" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
</RadarChart>
```

### 8.2 아이콘 라이브러리

#### **Lucide React** (아이콘 라이브러리)
**선택 이유:**
- 일관된 선 스타일 디자인
- 가벼운 SVG 아이콘
- React 컴포넌트로 제공
- 커스터마이징 용이

**설치:**
```bash
npm install lucide-react
```

**주요 아이콘:**
```jsx
import { Search, Copy, Star, TrendingUp, AlertCircle } from 'lucide-react'

// 분석 아이콘
<Search className="w-6 h-6 text-primary-500" />

// 복사 아이콘
<Copy className="w-5 h-5 text-secondary-500" />

// 점수 아이콘
<Star className="w-5 h-5 text-score-excellent" />
```

### 8.3 폰트 라이브러리

#### **Pretendard** (한국어 최적화 폰트)
**설치:**
```bash
npm install pretendard
```

**CSS 설정:**
```css
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css');

:root {
  font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
}
```

### 8.4 개발 도구

#### **Storybook** (컴포넌트 문서화)
**설치:**
```bash
npx storybook@latest init
```

**용도:**
- 디자인 시스템 컴포넌트 문서화
- 컴포넌트 테스트 및 개발
- 디자인 토큰 시각화

#### **ESLint + Prettier** (코드 품질 관리)
**설치:**
```bash
npm install -D eslint prettier eslint-config-prettier eslint-plugin-prettier
```

**설정 파일:**
```javascript
// .eslintrc.js
module.exports = {
  extends: ['next/core-web-vitals', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
  },
}
```

### 8.5 성능 최적화 도구

#### **Next.js** (프레임워크)
**선택 이유:**
- React 기반 풀스택 프레임워크
- 자동 코드 분할 및 최적화
- 이미지 최적화 내장
- SEO 친화적

#### **Bundle Analyzer** (번들 분석)
```bash
npm install -D @next/bundle-analyzer
```

### 8.6 접근성 도구

#### **axe-core** (접근성 테스트)
```bash
npm install -D @axe-core/react
```

#### **React Aria** (접근성 훅)
```bash
npm install react-aria react-stately
```

## 9. 브랜드 아이덴티티

### 9.1 로고 디자인
- 텍스트 기반 로고: "PromptLens"
- 폰트: Pretendard Bold
- 색상: Primary-600
- 간단하고 기억하기 쉬운 형태

### 9.2 브랜드 색상 조합
- Primary: 파란색 계열 (신뢰성, 전문성)
- Secondary: 회색 계열 (중립성, 균형)
- Accent: 점수별 색상 (직관적 피드백)

---

**문서 버전:** 1.1
**최종 수정일:** 2025-10-29
**작성자:** PromptLens Design Team

## 변경 이력
- **v1.1 (2025-10-29)**:
  - 디자인 철학 업데이트 (극단적 미니멀리즘 추가)
  - 풀스크린 2단 레이아웃 시스템 추가
  - 플로팅 요소 디자인 가이드 추가
  - 반응형 레이아웃 조정 가이드 추가
- **v1.0 (2025-01-27)**: 초기 문서 작성
