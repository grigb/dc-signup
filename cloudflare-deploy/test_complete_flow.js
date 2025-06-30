const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('http://localhost:4100');
  
  // Enable console logging
  page.on('console', msg => console.log('Browser console:', msg.text()));
  
  // Wait for the page to load
  await page.waitForTimeout(2000);
  
  // Fill out the form
  await page.fill('#name', 'Test Edit Flow');
  await page.fill('#email', 'test@example.com');
  
  // Select a creator type
  await page.click('text=Click to select your creator types');
  await page.waitForTimeout(500);
  await page.click('text=Visual Arts');
  await page.click('button:has-text("Save Selection")');
  await page.waitForTimeout(500);
  
  // Click Review Submission
  console.log('Clicking Review Submission...');
  await page.click('button:has-text("Review Submission")');
  await page.waitForTimeout(2000);
  
  // Check the confirmation step visibility
  const confirmationInfo = await page.evaluate(() => {
    const confirmStep = document.getElementById('confirmationStep');
    const formStep = document.getElementById('signupForm');
    const editBtn = document.getElementById('editBtn');
    
    return {
      confirmStep: {
        exists: \!\!confirmStep,
        display: confirmStep ? confirmStep.style.display : null,
        visibility: confirmStep ? confirmStep.style.visibility : null,
        zIndex: confirmStep ? confirmStep.style.zIndex : null,
        computedDisplay: confirmStep ? window.getComputedStyle(confirmStep).display : null
      },
      formStep: {
        exists: \!\!formStep,
        display: formStep ? formStep.style.display : null,
        computedDisplay: formStep ? window.getComputedStyle(formStep).display : null
      },
      editBtn: {
        exists: \!\!editBtn,
        visible: editBtn ? editBtn.offsetParent \!== null : false
      }
    };
  });
  
  console.log('Confirmation step info:', JSON.stringify(confirmationInfo, null, 2));
  
  // If the confirmation step is visible, try to click Edit Details
  if (confirmationInfo.confirmStep.computedDisplay \!== 'none') {
    console.log('Confirmation step is visible, trying to click Edit Details...');
    try {
      await page.click('#editBtn', { force: true });
      console.log('Edit Details clicked successfully');
    } catch (e) {
      console.log('Failed to click Edit Details:', e.message);
    }
  } else {
    console.log('Confirmation step is not visible');
  }
  
  await page.waitForTimeout(2000);
  await browser.close();
})();
