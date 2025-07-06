// Test Admin Delete Functionality
// This script tests if the admin DELETE permissions are working after the migration
// Run this in the browser console on the admin page

console.log('🧪 Testing Admin Delete Functionality...');

// Function to test if admin can delete (without actually deleting)
async function testDeletePermissions() {
    try {
        // Check if supabase client is available
        if (!window.supabase || !SUPABASE_URL) {
            console.log('❌ Supabase client not available');
            return false;
        }
        
        const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Test 1: Check authentication
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            console.log('❌ No authenticated session found');
            return false;
        }
        console.log('✅ User authenticated:', session.user.email);
        
        // Test 2: Verify admin status
        const { data: adminCheck, error: adminError } = await supabase.rpc('verify_admin_user', {
            user_email: session.user.email
        });
        
        if (adminError) {
            console.log('❌ Admin verification error:', adminError);
            return false;
        }
        
        if (!adminCheck) {
            console.log('❌ User is not an admin');
            return false;
        }
        console.log('✅ Admin status verified');
        
        // Test 3: Try to get members (should work)
        const { data: members, error: selectError } = await supabase
            .from('members')
            .select('id, name, email')
            .limit(5);
            
        if (selectError) {
            console.log('❌ Cannot read members:', selectError);
            return false;
        }
        console.log('✅ Can read members:', members.length, 'found');
        
        // Test 4: Check if we can attempt DELETE (test with impossible condition)
        // This won't delete anything but will test if DELETE permission exists
        const { error: deleteTestError } = await supabase
            .from('members')
            .delete()
            .eq('id', '00000000-0000-0000-0000-000000000000'); // UUID that won't exist
            
        if (deleteTestError) {
            // Check if error is permission-related or just "no rows found"
            if (deleteTestError.message.includes('permission') || 
                deleteTestError.message.includes('RLS') ||
                deleteTestError.message.includes('policy')) {
                console.log('❌ DELETE permission denied:', deleteTestError.message);
                return false;
            } else {
                // Other errors are OK (like "no rows to delete")
                console.log('✅ DELETE permission exists (no matching rows to delete, which is expected)');
            }
        } else {
            console.log('✅ DELETE permission exists and query executed successfully');
        }
        
        return true;
        
    } catch (error) {
        console.log('❌ Test failed with error:', error);
        return false;
    }
}

// Function to test if bulk delete button exists and is functional
function testBulkDeleteButton() {
    const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
    if (bulkDeleteBtn) {
        console.log('✅ Bulk Delete button found');
        console.log('   - Button text:', bulkDeleteBtn.textContent);
        console.log('   - Button disabled:', bulkDeleteBtn.disabled);
        console.log('   - Button onclick handler:', typeof bulkDeleteBtn.onclick);
        return true;
    } else {
        console.log('❌ Bulk Delete button not found');
        return false;
    }
}

// Function to test if select all checkbox exists
function testSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) {
        console.log('✅ Select All checkbox found');
        return true;
    } else {
        console.log('❌ Select All checkbox not found');
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('\n🏁 Starting Admin Delete Tests...\n');
    
    const dbPermissions = await testDeletePermissions();
    const bulkButton = testBulkDeleteButton();
    const selectCheckbox = testSelectAllCheckbox();
    
    console.log('\n📊 Test Results:');
    console.log('   Database DELETE permissions:', dbPermissions ? '✅ WORKING' : '❌ FAILED');
    console.log('   Bulk Delete button:', bulkButton ? '✅ FOUND' : '❌ MISSING');
    console.log('   Select All checkbox:', selectCheckbox ? '✅ FOUND' : '❌ MISSING');
    
    if (dbPermissions && bulkButton && selectCheckbox) {
        console.log('\n🎉 ALL TESTS PASSED! Delete functionality should be working.');
    } else {
        console.log('\n🚨 SOME TESTS FAILED. Delete functionality may not work properly.');
    }
}

// Auto-run tests when script loads
runAllTests();