import { test, expect } from '../../../../test-utils/ui/test.util.js'
import { devices } from '@playwright/test'
/** @import { Page } from '@playwright/test' */

test.use({
  ...devices['Galaxy S8']
})

test('dynamic-select dropdown centers on mobile', async ({ page, testPageLocation }) => {
  await page.goto(testPageLocation + '#test-basic-select')
  const selectbox = page.getByRole('button').filter({ visible: true })
  await selectbox.click()
  await expect(page).toHaveScreenshot()
})

test('dynamic-select dropdown is scrollable if its content overflows the screen ', async ({ page, testPageLocation }) => {
  await page.goto(testPageLocation + '#test-group-select')
  const selectbox = page.getByRole('button').filter({ visible: true })
  await selectbox.click()
  await expect(page).toHaveScreenshot()
})
