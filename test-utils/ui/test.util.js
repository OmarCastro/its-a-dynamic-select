/* eslint-disable no-empty-pattern */
import { test as base, expect as baseExpect } from '@playwright/test'
import { mkdir, writeFile, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'
export { expect } from '@playwright/test'
/**
 * Get path stats, or null if it doesn't exist
 * @param {import('node:fs').PathLike} path - path
 */
const statOrNull = (path) => stat(path).catch(() => null)
const rootPath = process.cwd()

export const test = base.extend({
  step: async ({}, use) => {
    await use(test.step)
  },
  expect: async ({}, use) => {
    await use(baseExpect)
  },

  page: async ({ browserName, page }, use, testInfo) => {
    if (browserName !== 'chromium') {
      return await use(page)
    }

    await mkdir('reports/.tmp/coverage/ui/tmp', { recursive: true })

    await page.coverage.startJSCoverage()
    await use(page)
    const jsCoverage = await page.coverage.stopJSCoverage()

    const coverage = jsCoverage.map(entry => {
      const url = new URL(entry.url)
      const scriptPath = `file://${rootPath}${url.pathname}`
      return {
        ...entry,
        url: scriptPath,
      }
    })

    for (const entry of coverage) {
      const fileToWrite = join(process.cwd(), `reports/.tmp/coverage/ui/tmp/coverage-ui-${Date.now()}-${entry.scriptId}.json`)
      const fileContent = JSON.stringify({ result: [entry] })
      await writeFile(fileToWrite, fileContent)
    }
  },

  testPageLocation: async ({}, use, testInfo) => {
    const fileName = testInfo.file
    const htmlFileName = fileName.replace(/\.js$/, '.html')
    const stats = await statOrNull(htmlFileName)
    if (stats) {
      use(relative(rootPath, htmlFileName))
      return
    }
    use('./build/docs/test-page.html')
  },
})
