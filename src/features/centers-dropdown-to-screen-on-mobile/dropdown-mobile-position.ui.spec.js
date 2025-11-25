import { test } from '../../../test-utils/ui/test.util.js'
import { devices } from '@playwright/test'

test.use({
  ...devices['Galaxy S8']
})

test('dynamic-select dropdown position test', async ({ page, expect }) => {
  await page.goto('./build/docs/test-page.html')
  await page.reload()
  const selectbox = page.locator('.dynamic-select--hello-world')
  await selectbox.click()
  await expect.soft(await page.screenshot()).toMatchSnapshot('dropdown-visible-on-click.png')
})
