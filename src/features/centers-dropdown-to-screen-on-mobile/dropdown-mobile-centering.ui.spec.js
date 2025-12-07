import { test } from '../../../test-utils/ui/test.util.js'
import { devices } from '@playwright/test'
/** @import { Page } from '@playwright/test' */

test.use({
  ...devices['Galaxy S8']
})
/**
 * @param {Page} page
 */
test('dynamic-select dropdown centers on mobile', async ({ page, expect }) => {
  await page.goto('./build/docs/test-page.html#test-basic-select')
  const selectbox = page.getByRole('button').filter({ visible: true })
  await selectbox.click()
  await expect.soft(await page.screenshot()).toMatchSnapshot('dropdown-centers-on-mobile.png')
})

test('dynamic-select dropdown is scrollable if its content overflows the screen ', async ({ page, expect }) => {
  await page.goto('./build/docs/test-page.html#test-group-select')
  const selectbox = page.getByRole('button').filter({ visible: true })
  await selectbox.click()
  await expect.soft(await page.screenshot()).toMatchSnapshot('dropdown-scrollable-on-overflow.png')
})
