-- Create chat history table for Health Assistant
CREATE TABLE public.chat_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX idx_chat_history_user_session ON public.chat_history(user_id, session_id, created_at);

-- Enable Row Level Security
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own chat history"
ON public.chat_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages"
ON public.chat_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Optional: Limit chat history to last 50 messages per user per session for performance
-- This can be adjusted based on needs
CREATE OR REPLACE FUNCTION public.limit_chat_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Keep only the most recent 100 messages per user per session
  DELETE FROM public.chat_history
  WHERE id IN (
    SELECT id FROM public.chat_history
    WHERE user_id = NEW.user_id AND session_id = NEW.session_id
    ORDER BY created_at DESC
    OFFSET 100
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to limit chat history
CREATE TRIGGER trigger_limit_chat_history
AFTER INSERT ON public.chat_history
FOR EACH ROW
EXECUTE FUNCTION public.limit_chat_history();
