-- CLEAN FUNCTION CONFLICTS - Fix PostgreSQL function overloading issues
-- Date: 2025-07-07 05:10
-- CRITICAL: This completely cleans and recreates all admin functions with consistent signatures
-- Fixes PGRST203 error: Could not choose the best candidate function

-- =============================================================================
-- STEP 1: COMPLETE CLEANUP - Remove ALL conflicting functions
-- =============================================================================

-- Drop all versions of conflicting functions (both VARCHAR and TEXT versions)
DROP FUNCTION IF EXISTS verify_admin_user(VARCHAR);
DROP FUNCTION IF EXISTS verify_admin_user(TEXT);
DROP FUNCTION IF EXISTS get_admin_user_info(VARCHAR);
DROP FUNCTION IF EXISTS get_admin_user_info(TEXT);
DROP FUNCTION IF EXISTS update_admin_last_login(VARCHAR);
DROP FUNCTION IF EXISTS update_admin_last_login(TEXT);

-- Drop and recreate the is_admin function to ensure it's clean
DROP FUNCTION IF EXISTS is_admin();

-- =============================================================================
-- STEP 2: CREATE CLEAN, CONSISTENT FUNCTIONS - TEXT PARAMETERS ONLY
-- =============================================================================

-- Create is_admin function (no parameters, clean)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_user_email TEXT;
BEGIN
    -- Get current user's email from auth.users
    SELECT email INTO current_user_email
    FROM auth.users
    WHERE id = auth.uid();
    
    -- If no email found, not admin
    IF current_user_email IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Check if email exists in admin_users and is active
    RETURN EXISTS(
        SELECT 1
        FROM admin_users
        WHERE email = current_user_email
        AND is_active = true
    );
    
EXCEPTION
    WHEN OTHERS THEN
        -- If anything goes wrong, deny access
        RETURN FALSE;
END;
$$;

-- Create verify_admin_user function - TEXT parameter only
CREATE OR REPLACE FUNCTION verify_admin_user(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM admin_users
        WHERE email = user_email
        AND is_active = true
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

-- Create get_admin_user_info function - TEXT parameter only
CREATE OR REPLACE FUNCTION get_admin_user_info(user_email TEXT)
RETURNS TABLE(
    id UUID,
    email TEXT,
    name TEXT,
    role TEXT,
    is_active BOOLEAN,
    last_login_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Create update_admin_last_login function - TEXT parameter only
CREATE OR REPLACE FUNCTION update_admin_last_login(user_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE admin_users
    SET last_login_at = NOW(),
        updated_at = NOW()
    WHERE email = user_email
    AND is_active = true;
END;
$$;

-- =============================================================================
-- STEP 3: GRANT PERMISSIONS TO ALL FUNCTIONS
-- =============================================================================

-- Grant execution rights to all functions
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO anon;
GRANT EXECUTE ON FUNCTION verify_admin_user(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_user_info(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_admin_last_login(TEXT) TO authenticated;

-- =============================================================================
-- STEP 4: VERIFICATION
-- =============================================================================

-- Verify the admin user exists (this is safe due to ON CONFLICT)
INSERT INTO admin_users (email, name, role, is_active, created_at, updated_at)
VALUES (
    'team@distributedcreatives.org',
    'System Administrator',
    'admin',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    is_active = true,
    updated_at = NOW();

-- Success notification
SELECT 'Function conflicts resolved successfully!' AS status;