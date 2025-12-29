-- Add features column to lists table
ALTER TABLE public.lists ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{}'::jsonb;

-- Update RLS policies if needed (usually update policy covers all columns, but good to check)
-- Existing policies likely allow update for owner.
