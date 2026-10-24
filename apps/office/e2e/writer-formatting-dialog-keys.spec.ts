/** @fileoverview Verifies native formatting dialog keyboard,draft and actual frame focus paths in production Chromium. */
import { expect, test } from "@playwright/test";
import { openBrowserMenu, hoverBrowserMenuItem } from "../test-support/menu-pointer-e2e";
import { readFile } from "node:fs/promises";
import { ZipFile } from "../src/package/source/zipapi/ZipFile";
for (const width of [1280, 390])
  test(`Writer formatting dialog keys width=${width}`, /** Uses actual menus,requests,document and ODT owners. @param fixtures - Fixtures. @param fixtures.page - Actual page. @returns Completion. */ async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on(
      "pageerror",
      /** Records page errors. @param e - Actual error. @returns Nothing. */ (e) => {
        errors.push(e.message);
      },
    );
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    const editor = page.getByRole("textbox", { name: "Writer document text", exact: true });
    await editor.fill("Keyboard");
    /** Opens a real Format command. @param name - Native command label. @returns Completion. */ async function format(
      name: RegExp,
    ) {
      await openBrowserMenu(page, "Format");
      await page.getByRole("menuitem", { name }).click();
    }
    await format(/^Paragraph/);
    let dialog = page.getByRole("dialog", { name: "Paragraph", exact: true });
    const spacing = dialog.getByRole("tab", { name: "Indents & Spacing", exact: true }),
      flow = dialog.getByRole("tab", { name: "Text Flow", exact: true }),
      tabs = dialog.getByRole("tab", { name: "Tabs", exact: true });
    await expect(spacing).toBeFocused();
    const oldAbove = await dialog
      .getByRole("spinbutton", { name: "Above paragraph (cm)", exact: true })
      .inputValue();
    await dialog
      .getByRole("spinbutton", { name: "Above paragraph (cm)", exact: true })
      .press("Control+PageDown");
    await expect(flow).toBeFocused();
    await flow.press("ArrowRight");
    await expect(tabs).toBeFocused();
    await dialog.getByRole("combobox", { name: "Position", exact: true }).fill("1 cm");
    await dialog.getByRole("button", { name: "New", exact: true }).click();
    await dialog.getByRole("combobox", { name: "Position", exact: true }).press("Control+PageDown");
    await expect(spacing).toBeFocused();
    await expect(
      dialog.getByRole("spinbutton", { name: "Above paragraph (cm)", exact: true }),
    ).toHaveValue(oldAbove);
    await spacing.press("Control+PageUp");
    await expect(tabs).toBeFocused();
    await expect(
      dialog.getByRole("listbox", { name: "Tab stops", exact: true }).locator("option"),
    ).toHaveCount(1);
    await page.screenshot({
      path: `output/playwright/writer-full-checkpoint/VBNV75-tabs-${width}.png`,
    });
    await tabs.press("Control+PageDown");
    await dialog
      .getByRole("spinbutton", { name: "Above paragraph (cm)", exact: true })
      .fill("1 cm");
    await dialog
      .getByRole("spinbutton", { name: "Above paragraph (cm)", exact: true })
      .press("Enter");
    await expect(dialog).toBeHidden();
    await page.keyboard.type("!");
    await expect(editor).toHaveText("Keyboard!");
    await format(/^Paragraph/);
    dialog = page.getByRole("dialog", { name: "Paragraph", exact: true });
    await dialog
      .getByRole("spinbutton", { name: "Above paragraph (cm)", exact: true })
      .fill("2 cm");
    await dialog.locator("..").click({ position: { x: 2, y: 2 } });
    await expect(dialog).toBeVisible();
    await dialog.press("Escape");
    await expect(dialog).toBeHidden();
    await page.keyboard.type("?");
    await expect(editor).toHaveText("Keyboard!?");
    await format(/^Page Style/);
    dialog = page.getByRole("dialog", { name: "Page Style", exact: true });
    await expect(dialog.getByLabel("Paper format")).toBeFocused();
    const oldLeft = await dialog
      .getByRole("spinbutton", { name: "Left (cm)", exact: true })
      .inputValue();
    await dialog.getByRole("spinbutton", { name: "Left (cm)", exact: true }).fill("3 cm");
    await dialog.click({ position: { x: 2, y: 2 } });
    await dialog.press("Escape");
    await expect(dialog).toBeHidden();
    await page.keyboard.type("P");
    await expect(editor).toHaveText("Keyboard!?P");
    await format(/^Page Style/);
    dialog = page.getByRole("dialog", { name: "Page Style", exact: true });
    await expect(dialog.getByRole("spinbutton", { name: "Left (cm)", exact: true })).toHaveValue(
      oldLeft,
    );
    await dialog.getByRole("spinbutton", { name: "Left (cm)", exact: true }).fill("3 cm");
    await dialog.getByRole("spinbutton", { name: "Left (cm)", exact: true }).press("Enter");
    await expect(dialog).toBeHidden();
    await page.keyboard.type("S");
    await expect(editor).toHaveText("Keyboard!?PS");
    /** Opens the actual More Breaks submenu. @returns Completion. */ async function breakDialog() {
      await openBrowserMenu(page, "Insert");
      await hoverBrowserMenuItem(
        page,
        page.getByRole("menuitem", { name: "More Breaks", exact: true }),
      );
      await page.getByRole("menuitem", { name: /Manual Break/ }).click();
    }
    await breakDialog();
    dialog = page.getByRole("dialog", { name: "Insert Break", exact: true });
    await expect(dialog.getByRole("radio")).toBeFocused();
    await dialog.click({ position: { x: 2, y: 2 } });
    await expect(dialog.getByRole("radio")).toBeFocused();
    await dialog.press("Escape");
    await expect(dialog).toBeHidden();
    await page.keyboard.type("B");
    await expect(editor).toHaveText("Keyboard!?PSB");
    await breakDialog();
    dialog = page.getByRole("dialog", { name: "Insert Break", exact: true });
    await dialog.getByRole("radio").press("Enter");
    await expect(dialog).toBeHidden();
    await page.keyboard.type("After");
    await expect(page.getByRole("textbox", { name: "Writer paragraph 2", exact: true })).toHaveText(
      "After",
    );
    const pending = page.waitForEvent("download");
    await openBrowserMenu(page, "File");
    await page.getByRole("menuitem", { name: "Export…", exact: true }).click();
    await page.getByRole("button", { name: "Download ODT", exact: true }).click();
    const file = await (await pending).path();
    if (file === null) throw Error("Missing ODT");
    const zip = new ZipFile(new Uint8Array(await readFile(file))),
      xml = await zip.readTextEntry("content.xml");
    expect(xml).toContain('fo:margin-top="');
    expect(xml).toContain("style:tab-stop");
    expect(xml).toContain('fo:break-before="page"');
    expect(errors).toEqual([]);
  });
