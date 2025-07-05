const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Capture console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });
  
  await page.goto('http://localhost:4100/');
  
  console.log('=== Testing handleEditDetails function ===\n');
  
  // Check if handleEditDetails exists
  const functionCheck = await page.evaluate(() => {
    return {
      exists: typeof handleEditDetails !== 'undefined',
      type: typeof handleEditDetails,
      isFunction: typeof handleEditDetails === 'function'
    };
  });
  
  console.log('Function check:', functionCheck);
  
  // Fill form
  await page.fill('input[name="name"]', 'Test User');
  await page.fill('input[name="email"]', 'test@example.com');
  
  // Click the creator type selector
  await page.click('.simple-creator-input');
  
  // Wait for modal and select Music
  await page.waitForSelector('.creator-modal', { state: 'visible' });
  await page.click('text="Music"');
  await page.click('button:has-text("Save Selection")');
  
  // Go to review
  await page.click('button#submitBtn');
  
  // Wait for confirmation step
  await page.waitForSelector('#confirmationStep', { state: 'visible' });
  console.log('\nConfirmation step is visible');
  
  // Find the Edit Details button
  const editButton = page.locator('#editBtn');
  const buttonCount = await editButton.count();
  console.log('Edit button found:', buttonCount > 0);
  
  if (buttonCount > 0) {
    const onclick = await editButton.getAttribute('onclick');
    console.log('Button onclick attribute:', onclick);
    
    // Clear console to see only click-related messages
    consoleMessages.length = 0;
    
    // Try clicking the button
    console.log('\nClicking Edit Details button...');
    await editButton.click();
    
    // Wait for any console messages
    await page.waitForTimeout(500);
    
    console.log('\nConsole messages after click:');
    if (consoleMessages.length === 0) {
      console.log('  (No console messages)');
    } else {
      consoleMessages.forEach(msg => console.log('  ' + msg));
    }
    
    // Check visibility states
    const states = await page.evaluate(() => {
      return {
        confirmationVisible: document.getElementById('confirmationStep').style.display !== 'none',
        formVisible: document.getElementById('signupForm').style.display !== 'none',
        currentSubmission: typeof currentSubmission !== 'undefined' ? 'exists' : 'undefined'
      };
    });
    
    console.log('\nVisibility states after click:', states);
    
    // Try calling the function directly
    console.log('\nTrying direct function call...');
    consoleMessages.length = 0;
    
    const directCallResult = await page.evaluate(() => {
      try {
        if (typeof handleEditDetails === 'function') {
          handleEditDetails();
          return 'Function called successfully';
        }
        return 'Function not found';
      } catch (e) {
        return 'Error: ' + e.message;
      }
    });
    
    console.log('Direct call result:', directCallResult);
    
    await page.waitForTimeout(500);
    console.log('Console messages from direct call:');
    if (consoleMessages.length === 0) {
      console.log('  (No console messages)');
    } else {
      consoleMessages.forEach(msg => console.log('  ' + msg));
    }
  }
  
  await page.waitForTimeout(2000);
  await browser.close();
})();