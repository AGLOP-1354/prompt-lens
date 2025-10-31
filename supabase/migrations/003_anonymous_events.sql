-- Anonymous events logging
CREATE TABLE IF NOT EXISTS public.anonymous_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  anon_token TEXT NOT NULL,
  event TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anonymous_events_token ON public.anonymous_events(anon_token);
CREATE INDEX IF NOT EXISTS idx_anonymous_events_event ON public.anonymous_events(event);
CREATE INDEX IF NOT EXISTS idx_anonymous_events_created_at ON public.anonymous_events(created_at DESC);

COMMENT ON TABLE public.anonymous_events IS '비로그인 사용자 방문/분석 등 익명 이벤트 로그';

