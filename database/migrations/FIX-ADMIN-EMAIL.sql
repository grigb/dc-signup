-- Fix admin email to match the Supabase Auth user
-- Run this in Supabase SQL Editor

-- Step 1: Check current admin users
SELECT 'Current admin users:' as step;
SELECT email, name, is_active FROM admin_users;

-- Step 2: Update the admin email to match what we created in Supabase Auth
UPDATE admin_users 
SET email = 'team@distributedcreatives.org' 
WHERE email = 'admin@distributed-creatives.org';

-- Step 3: If no records were updated, insert the correct admin user
INSERT INTO admin_users (email, name, role, is_active) 
VALUES (
  'team@distributedcreatives.org',
  'System Administrator',
  'admin',
  true
) ON CONFLICT (email) DO NOTHING;

-- Step 4: Verify the fix
SELECT 'Updated admin users:' as step;
SELECT email, name, is_active FROM admin_users;

-- Step 5: Test the verification function
SELECT 'Testing admin verification:' as step;
SELECT verify_admin_user('team@distributedcreatives.org') as is_admin_verified;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Admin email fixed!';
  RAISE NOTICE '📧 Admin email: team@distributedcreatives.org';
  RAISE NOTICE '🔑 Password: gem0qck-KGT-pen@bfk';
  RAISE NOTICE '🎯 Ready to test login!';
END $$;