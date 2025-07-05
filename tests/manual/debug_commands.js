// Check if key elements exist
console.log('=== DOM ELEMENT DEBUGGING ===');
console.log('signupForm element:', document.getElementById('signupForm'));
console.log('confirmationStep element:', document.getElementById('confirmationStep'));
console.log('typeof showFormStep:', typeof showFormStep);

// Try to execute showFormStep with debugging
console.log('=== EXECUTING showFormStep() WITH DEBUGGING ===');
try {
    showFormStep();
    console.log('✅ showFormStep() executed without throwing errors');
} catch (error) {
    console.error('❌ showFormStep() threw an error:', error);
    console.error('Error stack:', error.stack);
}
EOF < /dev/null