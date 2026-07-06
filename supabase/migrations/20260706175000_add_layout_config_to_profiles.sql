-- Add layout_config JSONB column to profiles table for BlockCanvasEngine
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS layout_config JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.profiles.layout_config IS 'User customizable block canvas layout configuration';
