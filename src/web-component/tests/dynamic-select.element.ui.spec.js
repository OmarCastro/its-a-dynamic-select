import { test, expect } from '../../../test-utils/ui/test.util.js'

test('dynamic-select element visual test', async ({ page, testPageLocation }) => {
  await page.goto(testPageLocation)
  const selectbox = page.getByRole('button').filter({ visible: true })
  await expect(selectbox).toHaveScreenshot()
})
