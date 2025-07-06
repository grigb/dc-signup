-- FIX ADMIN DELETE PERMISSIONS
-- This migration adds DELETE policies to allow admin users to delete members
-- Date: 2025-07-05
-- Issue: Admin delete functionality not working due to missing RLS DELETE policies

-- STEP 1: Add UPDATE policy for members table (for admin updates)
DROP POLICY IF EXISTS "Admin users can update members" ON members;
CREATE POLICY "Admin users can update members" ON members
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT auth.uid() FROM auth.users au
      JOIN admin_users adu ON au.email = adu.email
      WHERE adu.is_active = true
    )
  );

-- STEP 2: Add DELETE policy for members table (for admin deletion)
DROP POLICY IF EXISTS "Admin users can delete members" ON members;
CREATE POLICY "Admin users can delete members" ON members
  FOR DELETE USING (
    auth.uid() IN (
      SELECT auth.uid() FROM auth.users au
      JOIN admin_users adu ON au.email = adu.email
      WHERE adu.is_active = true
    )
  );

-- STEP 3: Verify policies are in place
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'members'
ORDER BY cmd, policyname;

-- STEP 4: Test the DELETE permission (should return true for admin users)
-- This will only work if run by an authenticated admin user
-- SELECT verify_admin_user('team@distributedcreatives.org') as can_verify_admin;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '🎉 Admin DELETE permissions fixed!';
  RAISE NOTICE '✅ Added UPDATE policy for members table';
  RAISE NOTICE '✅ Added DELETE policy for members table';
  RAISE NOTICE '';
  RAISE NOTICE '🚨 IMPORTANT: Run this migration in Supabase SQL Editor';
  RAISE NOTICE '🚨 Admin users can now delete members through the admin panel';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Test the fix:';
  RAISE NOTICE '1. Login to admin panel as team@distributedcreatives.org';
  RAISE NOTICE '2. Select members using checkboxes';
  RAISE NOTICE '3. Click "Delete Selected" button';
  RAISE NOTICE '4. Confirm deletion in modal';
END $$;