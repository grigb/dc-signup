// Diagnostic script for bulk delete functionality
// Run this in browser console on admin.html page

console.log('🔍 Testing Bulk Delete Functionality...');

// Test 1: Check if key functions exist
console.log('1. Checking if functions exist:');
console.log('  - showBulkDeleteConfirmation:', typeof showBulkDeleteConfirmation);
console.log('  - deleteSelectedMembers:', typeof deleteSelectedMembers);
console.log('  - showConfirmModal:', typeof showConfirmModal);
console.log('  - hideConfirmModal:', typeof hideConfirmModal);

// Test 2: Check selectedMemberIds set
console.log('2. Selected members state:');
console.log('  - selectedMemberIds exists:', typeof selectedMemberIds !== 'undefined');
console.log('  - selectedMemberIds size:', selectedMemberIds?.size || 'N/A');
console.log('  - selectedMemberIds values:', Array.from(selectedMemberIds || []));

// Test 3: Check bulk delete button
console.log('3. Bulk delete button:');
const bulkDeleteBtn = document.querySelector('button[onclick*="showBulkDeleteConfirmation"], .bulk-delete-btn, button:contains("Delete Selected")');
console.log('  - Button found:', !!bulkDeleteBtn);
console.log('  - Button disabled:', bulkDeleteBtn?.disabled);
console.log('  - Button onclick:', bulkDeleteBtn?.onclick?.toString().substring(0, 100));

// Test 4: Check modal element
console.log('4. Confirmation modal:');
const modal = document.getElementById('confirmModal');
console.log('  - Modal exists:', !!modal);
console.log('  - Modal classes:', modal?.className);
console.log('  - Modal display style:', modal?.style.display);
console.log('  - Modal computed display:', modal ? getComputedStyle(modal).display : 'N/A');

// Test 5: Check checkboxes
console.log('5. Member checkboxes:');
const checkboxes = document.querySelectorAll('.rowCheckbox');
console.log('  - Total checkboxes found:', checkboxes.length);
console.log('  - Checked checkboxes:', document.querySelectorAll('.rowCheckbox:checked').length);

// Test 6: Simulate clicking select all
console.log('6. Testing select all functionality:');
const selectAllCheckbox = document.getElementById('selectAllCheckbox');
console.log('  - Select all checkbox exists:', !!selectAllCheckbox);

if (selectAllCheckbox) {
    console.log('  - Simulating select all click...');
    selectAllCheckbox.click();
    console.log('  - After click - selected count:', selectedMemberIds?.size || 'N/A');
    console.log('  - Bulk delete button disabled:', bulkDeleteBtn?.disabled);
}

// Test 7: Try to trigger bulk delete
console.log('7. Testing bulk delete trigger:');
if (selectedMemberIds?.size > 0) {
    console.log('  - Attempting to call showBulkDeleteConfirmation...');
    try {
        showBulkDeleteConfirmation();
        console.log('  - ✅ showBulkDeleteConfirmation called successfully');
    } catch (error) {
        console.log('  - ❌ Error calling showBulkDeleteConfirmation:', error);
    }
} else {
    console.log('  - No members selected, cannot test bulk delete');
}

console.log('🏁 Bulk delete diagnostic complete');