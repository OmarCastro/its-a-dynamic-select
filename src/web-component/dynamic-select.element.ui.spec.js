import { test } from '../../test-utils/ui/test.util.js'

test('dynamic-select element visual test', async ({ page, expect }) => {
  await page.goto('./build/docs/test-page.html')
  const selectbox = page.locator('.dynamic-select--hello-world')
  await expect.soft(await selectbox.screenshot()).toMatchSnapshot('dynamic-select--hello-world.png')
})
