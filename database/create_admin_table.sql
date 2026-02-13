-- Create admin table for admin authentication
CREATE TABLE IF NOT EXISTS public.admin (
  id SERIAL NOT NULL,
  name CHARACTER VARYING(255) NOT NULL,
  email CHARACTER VARYING(255) NOT NULL,
  password CHARACTER VARYING(255) NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE NULL DEFAULT NOW(),
  role CHARACTER VARYING(100) NULL,
  permissions TEXT[] NULL DEFAULT ARRAY['view_properties'::TEXT, 'view_inquiries'::TEXT],
  CONSTRAINT admin_pkey PRIMARY KEY (id),
  CONSTRAINT admin_email_key UNIQUE (email)
) TABLESPACE pg_default;

-- Create index on role for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_role ON public.admin USING btree (role) TABLESPACE pg_default;

-- Insert a default admin user (password: admin123 - CHANGE THIS IN PRODUCTION!)
INSERT INTO public.admin (name, email, password, role, permissions)
VALUES (
  'Admin User',
  'admin@deelmap.com',
  'admin123',
  'super_admin',
  ARRAY['view_properties', 'edit_properties', 'delete_properties', 'view_inquiries', 'manage_users', 'view_analytics']::TEXT[]
)
ON CONFLICT (email) DO NOTHING;
