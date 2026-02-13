-- Add blocked status to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS blocked BOOLEAN DEFAULT false;

-- Add index for blocked status for faster queries
CREATE INDEX IF NOT EXISTS idx_users_blocked ON public.users USING btree (blocked) TABLESPACE pg_default;

-- Add index for active users (combining active and blocked for common queries)
CREATE INDEX IF NOT EXISTS idx_users_active_blocked ON public.users USING btree (active, blocked) TABLESPACE pg_default;

-- Update existing users to ensure blocked is set to false
UPDATE public.users SET blocked = false WHERE blocked IS NULL;
