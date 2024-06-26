// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import { test } from '@jupyterlab/galata';
import { Page } from '@playwright/test';
import { expect } from '@playwright/test';

const DEFAULT_NAME = 'untitled.py';

const TEST_FILE_CONTENT = `first
second
third`;

test.beforeEach(async ({ page }) => {
  await page.menu.clickMenuItem('File>New>Python File');
  await page.locator(`[role="main"] >> text=${DEFAULT_NAME}`).waitFor();
  await page.locator('[role="main"] .cm-content').fill(TEST_FILE_CONTENT);
});

test.describe('File Edit Operations', () => {
  test('Should remove a line on Control + D', async ({ page }) => {
    await page.getByRole('textbox').getByText('second').last().dblclick();

    await page.keyboard.press('Control+d');

    expect(await getEditorText(page)).toBe('first\nthird');
  });

  test('Should toggle line comment on Control + /', async ({ page }) => {
    // Select "second" and "third"
    await page.getByRole('textbox').getByText('second').last().dblclick();
    await page.keyboard.press('Shift+ArrowDown');

    // Toggle line comment
    await page.keyboard.press('Control+/');

    expect(await getEditorText(page)).toBe('first\n# second\n# third');
  });

  test('Should toggle a block comment on Alt + A', async ({ page }) => {
    const currentDir = await page.filebrowser.getCurrentDirectory();
    await page.contents.renameFile(
      `${currentDir}/${DEFAULT_NAME}`,
      `${currentDir}/untitled.js`
    );
    // Select "second" and "third"
    await page.getByRole('textbox').getByText('second').last().dblclick();
    await page.keyboard.press('Shift+ArrowDown');

    // Toggle block comment
    await page.keyboard.press('Alt+A');

    expect(await getEditorText(page)).toBe('first\n/* second\nthird */');
  });
});

async function getEditorText(page: Page): Promise<string> {
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Control+C');
  await page.context().grantPermissions(['clipboard-read']);
  const handle = await page.evaluateHandle(() =>
    navigator.clipboard.readText()
  );
  return await handle.jsonValue();
}
