-- FIX INFINITE RECURSION IN ADMIN POLICIES
-- This fixes the circular dependency in admin_users RLS policies
-- Date: 2025-07-06
-- Issue: Policies reference admin_users table which causes infinite recursion

-- STEP 1: Fix admin_users policies by using functions instead of direct queries
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admin users can select admin users" ON admin_users;
DROP POLICY IF EXISTS "Admin users can insert admin users" ON admin_users;
DROP POLICY IF EXISTS "Admin users can update admin users" ON admin_users;

-- Create simple policies that avoid recursion
CREATE POLICY "Admin users can select admin users" ON admin_users
  FOR SELECT USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR
    verify_admin_user((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

CREATE POLICY "Admin users can insert admin users" ON admin_users
  FOR INSERT WITH CHECK (
    verify_admin_user((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

CREATE POLICY "Admin users can update admin users" ON admin_users
  FOR UPDATE USING (
    verify_admin_user((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- STEP 2: Fix members table policies to avoid recursion
-- Drop existing policies
DROP POLICY IF EXISTS "Admin users can select members" ON members;
DROP POLICY IF EXISTS "Admin users can update members" ON members;
DROP POLICY IF EXISTS "Admin users can delete members" ON members;

-- Create policies using the verification function
CREATE POLICY "Admin users can select members" ON members
  FOR SELECT USING (
    verify_admin_user((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

CREATE POLICY "Admin users can update members" ON members
  FOR UPDATE USING (
    verify_admin_user((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

CREATE POLICY "Admin users can delete members" ON members
  FOR DELETE USING (
    verify_admin_user((SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- STEP 3: Update the verify_admin_user function to be more robust
CREATE OR REPLACE FUNCTION verify_admin_user(user_email VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Simple check without causing recursion
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = user_email 
    AND is_active = true
  );
EXCEPTION
  WHEN OTHERS THEN
    -- If any error occurs, deny access
    RETURN FALSE;
END;
$$;

-- STEP 4: Create a helper function for getting current user email
CREATE OR REPLACE FUNCTION get_current_user_email()
RETURNS VARCHAR
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (SELECT email FROM auth.users WHERE id = auth.uid());
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_current_user_email() TO authenticated;

-- STEP 5: Test the functions
SELECT 'Testing infinite recursion fix...' as test_step;
SELECT verify_admin_user('team@distributedcreatives.org') as is_admin;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '🎉 Infinite recursion in admin policies FIXED!';
  RAISE NOTICE '✅ Removed circular dependencies in admin_users policies';
  RAISE NOTICE '✅ Updated members table policies to use verification function';
  RAISE NOTICE '✅ Made verify_admin_user function more robust';
  RAISE NOTICE '';
  RAISE NOTICE '🚨 IMPORTANT: Run this in Supabase SQL Editor to fix the issue';
  RAISE NOTICE '🚨 After running, delete operations should work without 500 errors';
  RAISE NOTICE '';
  RAISE NOTICE '📋 This fixes:';
  RAISE NOTICE '1. 500 Internal Server Error on member deletion';
  RAISE NOTICE '2. Infinite recursion in admin_users policy';
  RAISE NOTICE '3. Bulk delete functionality should now work';
END $$;