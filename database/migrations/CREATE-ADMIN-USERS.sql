-- Admin Users Table Migration
-- Run this in Supabase SQL Editor to create admin role system
-- Date: 2025-07-05

-- STEP 1: Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin' NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES admin_users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_users table
DROP POLICY IF EXISTS "Admin users can select admin users" ON admin_users;
DROP POLICY IF EXISTS "Admin users can insert admin users" ON admin_users;
DROP POLICY IF EXISTS "Admin users can update admin users" ON admin_users;

-- Only authenticated users who are in admin_users table can access admin data
CREATE POLICY "Admin users can select admin users" ON admin_users
  FOR SELECT USING (
    auth.uid() IN (
      SELECT auth.uid() FROM auth.users au
      JOIN admin_users adu ON au.email = adu.email
      WHERE adu.is_active = true
    )
  );

CREATE POLICY "Admin users can insert admin users" ON admin_users
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT auth.uid() FROM auth.users au
      JOIN admin_users adu ON au.email = adu.email
      WHERE adu.is_active = true
    )
  );

CREATE POLICY "Admin users can update admin users" ON admin_users
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT auth.uid() FROM auth.users au
      JOIN admin_users adu ON au.email = adu.email
      WHERE adu.is_active = true
    )
  );

-- STEP 2: Create admin verification function
CREATE OR REPLACE FUNCTION verify_admin_user(user_email VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = user_email 
    AND is_active = true
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION verify_admin_user(VARCHAR) TO authenticated;

-- STEP 3: Create function to get admin user info
CREATE OR REPLACE FUNCTION get_admin_user_info(user_email VARCHAR)
RETURNS TABLE(
  id UUID,
  email VARCHAR,
  name VARCHAR,
  role VARCHAR,
  is_active BOOLEAN,
  last_login_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    au.name,
    au.role,
    au.is_active,
    au.last_login_at
  FROM admin_users au
  WHERE au.email = user_email 
  AND au.is_active = true;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_admin_user_info(VARCHAR) TO authenticated;

-- STEP 4: Create function to update last login
CREATE OR REPLACE FUNCTION update_admin_last_login(user_email VARCHAR)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE admin_users 
  SET last_login_at = NOW(),
      updated_at = NOW()
  WHERE email = user_email 
  AND is_active = true;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_admin_last_login(VARCHAR) TO authenticated;

-- STEP 5: Insert initial admin user (CHANGE THIS EMAIL!)
-- Replace with your actual admin email address
INSERT INTO admin_users (email, name, role, is_active) 
VALUES (
  'team@distributedcreatives.org',
  'System Administrator',
  'admin',
  true
) ON CONFLICT (email) DO NOTHING;

-- STEP 6: Test the functions
SELECT 'Testing admin verification function...' as test_step;
SELECT verify_admin_user('team@distributedcreatives.org') as is_admin;

SELECT 'Testing admin user info function...' as test_step;
SELECT * FROM get_admin_user_info('team@distributedcreatives.org');

-- Success message
DO $$
BEGIN
  RAISE NOTICE '🎉 Admin users system created successfully!';
  RAISE NOTICE '✅ admin_users table created with RLS policies';
  RAISE NOTICE '✅ Admin verification functions created';
  RAISE NOTICE '✅ Initial admin user inserted';
  RAISE NOTICE '';
  RAISE NOTICE '🚨 IMPORTANT: Create Supabase Auth user for team@distributedcreatives.org';
  RAISE NOTICE '🚨 IMPORTANT: Update admin email in this script before running';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Next steps:';
  RAISE NOTICE '1. Create Supabase Auth user with admin email';
  RAISE NOTICE '2. Update admin.html to use admin verification';
  RAISE NOTICE '3. Test admin login with role verification';
END $$;