-- PromptLens Migration: Enable RLS and policies for prompt_analyses

-- Ensure RLS is enabled on prompt_analyses
ALTER TABLE IF EXISTS public.prompt_analyses ENABLE ROW LEVEL SECURITY;

-- Select: users can read their own rows
CREATE POLICY IF NOT EXISTS "Users can view their own analyses"
  ON public.prompt_analyses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Insert: users can insert for themselves only
CREATE POLICY IF NOT EXISTS "Users can insert their own analyses"
  ON public.prompt_analyses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update: users can update their own rows
CREATE POLICY IF NOT EXISTS "Users can update their own analyses"
  ON public.prompt_analyses
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Delete: users can delete their own rows
CREATE POLICY IF NOT EXISTS "Users can delete their own analyses"
  ON public.prompt_analyses
  FOR DELETE
  USING (auth.uid() = user_id);


