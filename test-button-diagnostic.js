const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Capture all console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      time: new Date().toISOString()
    });
  });
  
  await page.goto('http://localhost:4100/');
  
  // Fill form quickly
  await page.fill('input[name="name"]', 'Test User');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.click('.simple-creator-input');
  await page.waitForSelector('.creator-modal');
  await page.getByText('Writing').click();
  await page.getByRole('button', { name: 'Save Selection' }).click();
  await page.click('#submitBtn');
  await page.waitForSelector('#confirmationStep');
  
  console.log('\n=== DIAGNOSTIC TEST FOR EDIT DETAILS BUTTON ===\n');
  
  // Test 1: Check if handleEditDetails is in global scope
  const test1 = await page.evaluate(() => {
    return {
      handleEditDetailsExists: typeof handleEditDetails !== 'undefined',
      handleEditDetailsType: typeof handleEditDetails,
      isInWindow: 'handleEditDetails' in window,
      windowHandleEditDetails: typeof window.handleEditDetails
    };
  });
  console.log('1. Function accessibility:', test1);
  
  // Test 2: Check the button element
  const test2 = await page.evaluate(() => {
    const btn = document.getElementById('editBtn');
    return {
      buttonExists: btn !== null,
      onclick: btn ? btn.onclick : 'no button',
      onclickAttribute: btn ? btn.getAttribute('onclick') : 'no button',
      eventListeners: btn ? btn.getEventListeners ? btn.getEventListeners() : 'API not available' : 'no button'
    };
  });
  console.log('\n2. Button element check:', test2);
  
  // Test 3: Try different click methods
  console.log('\n3. Testing different click methods:');
  
  // Method A: Regular click
  consoleMessages.length = 0;
  await page.click('#editBtn');
  await page.waitForTimeout(100);
  console.log('   A. Regular click - Console messages:', consoleMessages.length > 0 ? consoleMessages : 'No messages');
  
  // Method B: Force click
  consoleMessages.length = 0;
  await page.click('#editBtn', { force: true });
  await page.waitForTimeout(100);
  console.log('   B. Force click - Console messages:', consoleMessages.length > 0 ? consoleMessages : 'No messages');
  
  // Method C: Evaluate click
  consoleMessages.length = 0;
  await page.evaluate(() => {
    const btn = document.getElementById('editBtn');
    if (btn) btn.click();
  });
  await page.waitForTimeout(100);
  console.log('   C. Evaluate click - Console messages:', consoleMessages.length > 0 ? consoleMessages : 'No messages');
  
  // Method D: Direct function call
  consoleMessages.length = 0;
  const directCallResult = await page.evaluate(() => {
    try {
      if (typeof handleEditDetails === 'function') {
        handleEditDetails();
        return 'Success';
      }
      return 'Function not found';
    } catch (e) {
      return 'Error: ' + e.message;
    }
  });
  await page.waitForTimeout(100);
  console.log('   D. Direct function call:', directCallResult);
  console.log('      Console messages:', consoleMessages.length > 0 ? consoleMessages : 'No messages');
  
  // Test 4: Check what's preventing navigation
  const test4 = await page.evaluate(() => {
    return {
      confirmationStepDisplay: document.getElementById('confirmationStep').style.display,
      formDisplay: document.getElementById('signupForm').style.display,
      currentSubmissionExists: typeof currentSubmission !== 'undefined'
    };
  });
  console.log('\n4. UI state check:', test4);
  
  // Test 5: Check for event propagation issues
  const test5 = await page.evaluate(() => {
    // Add a test listener
    const btn = document.getElementById('editBtn');
    let clickFired = false;
    if (btn) {
      btn.addEventListener('click', () => {
        clickFired = true;
      }, true);
      btn.click();
    }
    return {
      testClickFired: clickFired
    };
  });
  console.log('\n5. Event propagation test:', test5);
  
  await browser.close();
})();