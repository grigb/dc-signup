# Admin User Setup Guide

**Date:** 2025-07-05  
**Version:** 1.0  
**Status:** Production Ready

## Overview

This guide explains how to set up secure admin access for the DC Signup System. The admin system uses role-based authentication to ensure only authorized users can access the admin panel.

## Security Features

- **Dual Authentication**: Users must have both valid Supabase Auth credentials AND admin role
- **Role Verification**: Every login and session checks admin privileges
- **Automatic Logout**: Non-admin users are automatically logged out
- **Audit Trail**: Last login timestamps for all admin users
- **Row Level Security**: Database policies prevent unauthorized access

## Prerequisites

1. Access to Supabase project dashboard
2. Admin privileges in Supabase (to run SQL and create auth users)
3. Production deployment of DC Signup System

## Step-by-Step Setup

### Step 1: Run Database Migration

1. **Open Supabase Dashboard**
   - Navigate to your DC Signup System project
   - Go to SQL Editor

2. **Run Admin Users Migration**
   - Open file: `/database/migrations/CREATE-ADMIN-USERS.sql`
   - **IMPORTANT**: Edit the admin email address first (line 98)
   - Copy the entire SQL script
   - Paste into Supabase SQL Editor
   - Click "Run" to execute

3. **Verify Migration Success**
   - Check for success message in output
   - Verify `admin_users` table exists in Table Editor
   - Confirm functions created: `verify_admin_user`, `get_admin_user_info`, `update_admin_last_login`

### Step 2: Create Admin Auth Users

1. **Create Supabase Auth User**
   - In Supabase Dashboard, go to Authentication > Users
   - Click "Create User"
   - Enter admin email (must match email in admin_users table)
   - Set secure password
   - Click "Create User"

2. **Verify User Creation**
   - User should appear in Users list
   - Email should match admin_users table entry
   - Status should be "Confirmed"

### Step 3: Test Admin Access

1. **Access Admin Panel**
   - Navigate to `https://yourdomain.com/admin.html`
   - Enter admin email and password
   - Click "Login"

2. **Verify Admin Login**
   - Should successfully log in
   - Admin name should display in header
   - Should have access to member management

3. **Test Non-Admin Access**
   - Try logging in with regular user credentials
   - Should receive "Access denied" message
   - User should be automatically logged out

### Step 4: Add Additional Admin Users

1. **Add to Database**
   ```sql
   INSERT INTO admin_users (email, name, role, is_active) 
   VALUES (
     'new-admin@example.com',
     'Admin Name',
     'admin',
     true
   );
   ```

2. **Create Auth User**
   - Follow Step 2 with new admin email
   - Ensure email matches database entry

## Admin User Management

### Current Admin Users
```sql
-- View all admin users
SELECT email, name, role, is_active, last_login_at 
FROM admin_users 
ORDER BY created_at DESC;
```

### Deactivate Admin User
```sql
-- Deactivate without deleting
UPDATE admin_users 
SET is_active = false 
WHERE email = 'admin@example.com';
```

### Reactivate Admin User
```sql
-- Reactivate admin user
UPDATE admin_users 
SET is_active = true 
WHERE email = 'admin@example.com';
```

## Security Features Details

### Role Verification Process

1. **Login Flow**:
   - User enters email/password
   - Supabase Auth validates credentials
   - System calls `verify_admin_user(email)`
   - If not admin, user is logged out immediately
   - If admin, user info is loaded and login proceeds

2. **Session Check**:
   - On page load, existing sessions are verified
   - Admin role is re-checked for every session
   - Invalid sessions are terminated

3. **Database Security**:
   - Row Level Security (RLS) enabled on admin_users table
   - Only authenticated admin users can access admin data
   - All admin functions use SECURITY DEFINER

### Admin Permissions

Current admin role grants access to:
- View all members
- Delete individual members
- Bulk delete members
- Export member data
- Edit creator types
- Admin user management (planned)

## Troubleshooting

### Common Issues

1. **"Access denied" for valid admin email**
   - Check admin_users table for correct email
   - Verify is_active = true
   - Ensure email matches exactly (case sensitive)

2. **"Unable to verify admin access"**
   - Check database functions exist
   - Verify RLS policies are correct
   - Check Supabase logs for errors

3. **Admin user not found**
   - Verify admin_users table contains the email
   - Check if admin_users migration ran successfully
   - Confirm is_active = true

### Debug Commands

```sql
-- Check if admin user exists
SELECT * FROM admin_users WHERE email = 'your-admin@example.com';

-- Test admin verification function
SELECT verify_admin_user('your-admin@example.com');

-- Check admin user info
SELECT * FROM get_admin_user_info('your-admin@example.com');
```

## Production Considerations

1. **Change Default Admin Email**
   - Update email in CREATE-ADMIN-USERS.sql before running
   - Use organization email domain

2. **Strong Passwords**
   - Use complex passwords for admin accounts
   - Consider password rotation policy

3. **Regular Auditing**
   - Review admin_users table regularly
   - Monitor last_login_at timestamps
   - Deactivate unused admin accounts

4. **Backup Strategy**
   - Include admin_users table in database backups
   - Test admin access after restores

## File Changes

This implementation modified:
- `src/admin.html` - Added role verification to login process
- `database/migrations/CREATE-ADMIN-USERS.sql` - New admin users table and functions
- `docs/deployment/ADMIN-SETUP.md` - This documentation file

## Next Steps

1. Run the database migration
2. Create your first admin user
3. Test admin access
4. Add additional admin users as needed
5. Document your admin user emails securely

---

**Security Note**: Keep admin credentials secure and limit admin access to trusted personnel only. The admin panel has full access to member data and system functionality.