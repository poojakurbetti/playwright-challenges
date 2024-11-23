import { Page, expect, test } from '@playwright/test';


// define string locators getting reused at multiple places
const animatedForm = '#animatedForm'
const email = '#email'
const password = '#password'
const submitBtn = '#submitButton'
const submitBtnLoader = '.submit-btn.loading'
const successMessageShow = '.success-message.show'
const successMessageEmailContent= '#emailDisplay'
const successMessagePasswordContent = '#passwordDisplay'
const welcomeMessage = '.welcome-message'
const userEmail = '#userEmail'
const menuButton= '#menuButton'
const dropdownShown = '.dropdown-menu.show'
const accountMenu = '#accountMenu'
const logoutOption = '#logoutOption'
const profileBtn = '#profileButton'

//Fix the below scripts to work consistently and do not use static waits. Add proper assertions to the tests
// Login 3 times sucessfully
test('Login multiple times sucessfully @c1', async ({ page }) => {
  await page.goto('/');
  await page.locator(`//*[@href='/challenge1.html']`).click();
   // Login multiple times
  for (let i = 1; i <= 3; i++) {
    await page.waitForSelector(animatedForm, { state: 'visible' })
    await page.waitForSelector(email, { state: 'visible' })
    await validateLoginForm(page)
    await waitForSelectorAndFill(page, email, `test${i}@example.com`)
    await waitForSelectorAndFill(page, password, `password${i}`)
    await waitForVisibilityAndClick(page, submitBtn)
    await waitForDisappearanceOfSelector(page, submitBtnLoader)
    await page.waitForSelector(successMessageShow, { state: 'visible' })
    await expect(page.locator(successMessageShow)).toContainText('Successfully submitted!');
    await expect(page.locator(successMessageEmailContent)).toHaveText('Email: '+`test${i}@example.com`);
    await expect(page.locator(successMessagePasswordContent)).toHaveText('Password: '+`password${i}`);
    await page.waitForSelector(successMessageShow, { state: 'hidden' })
  }
});

// Login and logout successfully with animated form and delayed loading
test('Login animated form and logout sucessfully @c2', async ({ page }) => {
  await page.goto('/');
  await page.locator(`//*[@href='/challenge2.html']`).click();
  await page.waitForLoadState("domcontentloaded");
  await waitForSelectorAndFill(page, email, `test1@example.com`)
  await waitForSelectorAndFill(page, password, `password1`)
  await waitForToAnimationEnd(page, '#submitButton')
  await page.getByRole('button', { name: 'Sign In' }).click()
  await expect(page.locator(welcomeMessage)).toHaveText("Welcome!")
  await expect(page.locator(userEmail)).toContainText("test1@example.com")
  await page.waitForSelector('[data-initialized="true"]', { state: 'visible' })
  await waitForVisibilityAndClick(page, menuButton)
  await page.waitForSelector(dropdownShown, { state: 'visible' })
  await waitForVisibilityAndClick(page, accountMenu)
  await waitForVisibilityAndClick(page, logoutOption)
  await expect(page.locator(email)).toBeVisible()
  await expect(page.locator(password)).toBeVisible()
});

// Fix the Forgot password test and add proper assertions
test('Forgot password @c3', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('heading', { name: 'Form Animation Challenges' }).waitFor({state:"visible"})
  await page.locator(`//*[@href='/challenge3.html']`).click();
  await page.waitForSelector('#email', { state: 'visible' })
  await expect(page.getByRole('button', { name: 'Forgot Password?' })).toBeVisible()
  await page.getByRole('button', { name: 'Forgot Password?' }).click();
  await page.getByRole('heading', { name: 'Reset Password' }).waitFor({state:"visible"})
  await waitForSelectorAndFill(page,'#email','test@example.com')
  await page.getByRole('button', { name: 'Reset Password' }).click();
  await expect(page.getByRole('button', { name: 'Reset Password?' })).not.toBeVisible()
  await page.waitForSelector('.success-message', { state: 'visible' })
  await page.waitForSelector('.submit-btn', { state: 'visible' })
  await expect(page.getByRole('heading', { name: 'Success!' })).toBeVisible();
  await expect(page.locator('#mainContent')).toContainText('Password reset link sent!');
});

//Fix the login test. Hint: There is a global variable that you can use to check if the app is in ready state
test('Login and logout @c4', async ({ page }) => {
  await page.goto('/');
  await page.locator(`//*[@href='/challenge4.html']`).click();
  await page.waitForFunction("window.isAppReady===true")
  await waitForSelectorAndFill(page, email, `test@example.com`)
  await waitForSelectorAndFill(page, password, `password`)
  await waitForVisibilityAndClick(page, submitBtn)
  await waitForVisibilityAndClick(page, profileBtn)
  await page.getByText('Logout').click();
  await expect(page.locator(email)).toBeVisible()
  await expect(page.locator(password)).toBeVisible()
});


// wait for animation to end
function waitForToAnimationEnd(page: Page, selector: string) {
  return page
    .locator(selector)
    .evaluate((element) =>
      Promise.all(
        element
          .getAnimations()
          .map((animation) => animation.finished)
      )
    )
}

//wait for selector and then fill data
async function waitForSelectorAndFill(page: Page, selector: string, fillData: string) {
  await page.waitForSelector(selector, { state: 'visible' })
  await page.locator(selector).pressSequentially(fillData);
}

// wait for selector and then click
async function waitForVisibilityAndClick(page: Page, selector: string) {
  await page.waitForSelector(selector, { state: 'visible' })
  await page.locator(selector).click();
}

// wait for disappearance of locator
async function waitForDisappearanceOfSelector(page: Page, selector: string) {
  await page.waitForSelector(selector, { state: 'visible' })
  await page.waitForSelector(selector, { state: 'hidden' });
}

// validate login form
async function validateLoginForm(page: Page) {
  await expect(page.getByRole('heading', { name: 'Login Form' })).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByLabel('Password')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
}
