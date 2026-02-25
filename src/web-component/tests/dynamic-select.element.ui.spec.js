import { test, expect } from '#ui-test'

test('dynamic-select element visual test', async ({ page, testPageLocation }) => {
  await page.goto(testPageLocation)
  const selectbox = page.getByRole('button').filter({ visible: true })
  await expect(selectbox).toHaveScreenshot()
})
