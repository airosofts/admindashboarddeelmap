# Admin Portal Setup Instructions

## Step 1: Create the Admin Table in Supabase

You need to run the SQL script to create the admin table in your Supabase database.

### How to Run the SQL Script:

1. Open your Supabase dashboard: https://app.supabase.com
2. Select your project (the one with URL: `https://axpskqzdbvouodzsswbs.supabase.co`)
3. Click on the **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the entire content from `database/create_admin_table.sql`
6. Click **Run** to execute the script

This will:
- Create the `admin` table
- Add an index for better performance
- Insert a default admin user with these credentials:
  - **Email:** admin@deelmap.com
  - **Password:** admin123

## Step 2: Restart Your Development Server

After creating the table:

1. Stop your current dev server (Ctrl+C in terminal)
2. Clear the cache: `rm -rf .next`
3. Start the server again: `npm run dev`
4. Visit: http://localhost:3002/login

## Step 3: Test Login

Use these credentials to login:
- **Email:** admin@deelmap.com
- **Password:** admin123

**IMPORTANT:** Change this password immediately after first login for security!

## Troubleshooting

If you see errors:
1. Make sure the SQL script ran successfully in Supabase
2. Check that your `.env.local` file has the correct Supabase credentials
3. Verify the admin table exists by running: `SELECT * FROM admin;` in Supabase SQL Editor
4. Check browser console (F12) for any JavaScript errors
