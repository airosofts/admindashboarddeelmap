-- Create settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES public.admin(id) ON DELETE CASCADE,
  name VARCHAR(255),
  logo TEXT,
  auto_approve_sellers BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  CONSTRAINT settings_user_id_unique UNIQUE (user_id)
);

-- Add comment
COMMENT ON COLUMN public.settings.auto_approve_sellers IS 'When enabled, automatically approves new seller applications and sends login credentials';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_auto_approve
ON public.settings(auto_approve_sellers)
WHERE auto_approve_sellers = true;

-- If settings table already exists but doesn't have auto_approve_sellers column, add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'settings'
    AND column_name = 'auto_approve_sellers'
  ) THEN
    ALTER TABLE public.settings ADD COLUMN auto_approve_sellers BOOLEAN DEFAULT false;
  END IF;
END $$;
