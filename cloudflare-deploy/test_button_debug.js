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
  
  // Click Review Submission
  await page.click('button:has-text("Review Submission")');
  await page.waitForTimeout(1000);
  
  // Check the actual button in the DOM
  const buttonInfo = await page.evaluate(() => {
    const btn = document.getElementById('editBtn');
    if (!btn) return { exists: false };
    
    // Get computed styles
    const styles = window.getComputedStyle(btn);
    const parent = btn.closest('#confirmationStep');
    const parentStyles = parent ? window.getComputedStyle(parent) : {};
    
    return {
      exists: true,
      id: btn.id,
      onclick: btn.getAttribute('onclick'),
      textContent: btn.textContent.trim(),
      visible: styles.display !== 'none' && styles.visibility !== 'hidden',
      display: styles.display,
      visibility: styles.visibility,
      zIndex: styles.zIndex,
      position: styles.position,
      parentDisplay: parentStyles.display,
      parentVisibility: parentStyles.visibility,
      parentZIndex: parentStyles.zIndex,
      clickable: btn.offsetParent !== null
    };
  });
  
  console.log('Button info:', buttonInfo);
  
  // Try different ways to click the button
  console.log('\nTrying different click methods:');
  
  // Method 1: Direct click on element
  try {
    await page.click('#editBtn');
    console.log('Method 1 (direct click): Success');
  } catch (e) {
    console.log('Method 1 (direct click): Failed -', e.message);
  }
  
  await page.waitForTimeout(1000);
  
  // Check if we're back at the form
  const afterClick = await page.evaluate(() => {
    return {
      formDisplay: document.getElementById('signupForm').style.display,
      confirmDisplay: document.getElementById('confirmationStep').style.display
    };
  });
  
  console.log('After click states:', afterClick);
  
  await browser.close();
})();
