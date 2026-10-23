/** @fileoverview Actual native line-spacing popup modes, history and physical ODT reopen at desktop/mobile widths. */
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { openBrowserMenu } from "../test-support/menu-pointer-e2e";
import { readOdtDocument } from "../src/sw/source/filter/xml/swxml";
import { SvxLineSpacingItem } from "../src/editeng/inc/lspcitem";
import { SvxLineSpaceRule } from "../src/editeng/inc/svxenum";
import { RES_PARATR_LINESPACING } from "../src/sw/inc/hintids";
for (const [width, inch] of [
  [1280, false],
  [390, false],
  [1280, true],
] as const) {
  test(`Native Writer line spacing width=${width} inch=${inch}`, /** Visible production control and actual package I/O. @param fixtures - Real browser. @param fixtures.page - Page. @param info - Artifact output. @returns Completion. */ async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    if (inch) {
      await openBrowserMenu(page, "Tools");
      await page.getByRole("menuitem", { name: "Options…", exact: true }).click();
      const options = page.getByRole("dialog", { name: "Options", exact: true });
      await options
        .getByRole("combobox", { name: "Measurement unit", exact: true })
        .selectOption("8");
      await options.getByRole("button", { name: "OK", exact: true }).click();
    }
    const errors: string[] = [];
    page.on(
      "pageerror",
      /** Observes actual runtime errors. @param error - Browser failure. @returns Nothing. */ (
        error,
      ) => {
        errors.push(error.message);
      },
    );
    const editor = page.getByRole("textbox", { name: "Writer document text", exact: true });
    await editor.fill("Native line spacing");
    const toolbar = page.getByRole("toolbar", { name: "Writer formatting toolbar" }),
      trigger = toolbar.getByRole("button", { name: "Line Spacing", exact: true });
    await trigger.click();
    let popup = page.getByRole("dialog", { name: "Line Spacing", exact: true });
    await expect(
      popup.getByRole("combobox", { name: "Line spacing mode" }).locator("option"),
    ).toHaveCount(8);
    await popup.getByRole("combobox", { name: "Line spacing mode" }).selectOption("4");
    await popup.getByRole("spinbutton", { name: "Line spacing value" }).fill("137");
    await expect(popup).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(popup.getByRole("spinbutton", { name: "Line spacing value" })).toHaveValue("137%");
    await page.keyboard.press("Escape");
    await trigger.click();
    popup = page.getByRole("dialog", { name: "Line Spacing", exact: true });
    await expect(popup.getByRole("combobox", { name: "Line spacing mode" })).toHaveValue("4");
    await popup.getByRole("combobox", { name: "Line spacing mode" }).selectOption("7");
    await popup
      .getByRole("spinbutton", { name: "Line spacing value" })
      .fill(inch ? '0.5"' : "0.5 cm");
    await popup.getByRole("combobox", { name: "Line spacing mode" }).focus();
    await expect(popup.getByRole("spinbutton", { name: "Line spacing value" })).toHaveValue(
      inch ? "0.50″" : "0.50 cm",
    );
    await popup.getByRole("button", { name: "Increase line spacing value" }).click();
    await expect(popup.getByRole("spinbutton", { name: "Line spacing value" })).toHaveValue(
      inch ? "0.52″" : "0.60 cm",
    );
    await popup.getByRole("button", { name: "Decrease line spacing value" }).click();
    await expect(popup.getByRole("spinbutton", { name: "Line spacing value" })).toHaveValue(
      inch ? "0.50″" : "0.50 cm",
    );
    const box = await popup.boundingBox();
    expect(box?.x).toBeGreaterThanOrEqual(0);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(width);
    await page.screenshot({ path: info.outputPath("line-spacing.png") });
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    const download = page.waitForEvent("download");
    await openBrowserMenu(page, "File");
    await page.getByRole("menuitem", { name: "Export…", exact: true }).click();
    await page.getByRole("button", { name: "Download ODT", exact: true }).click();
    const path = info.outputPath("line-spacing.odt");
    await (await download).saveAs(path);
    const loaded = await readOdtDocument(new Uint8Array(await readFile(path)), {
      title: "Spacing",
    });
    try {
      const item = loaded.document.paragraphs[0]?.GetAttr(
        RES_PARATR_LINESPACING,
      ) as SvxLineSpacingItem;
      expect(item.GetLineSpaceRule()).toBe(SvxLineSpaceRule.Fix);
      expect(item.GetLineHeight()).toBe(inch ? 720 : 283);
    } finally {
      loaded.document.Dispose();
    }
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles(path);
    await trigger.click();
    popup = page.getByRole("dialog", { name: "Line Spacing", exact: true });
    await expect(popup.getByRole("combobox", { name: "Line spacing mode" })).toHaveValue("7");
    await expect(popup.getByRole("spinbutton", { name: "Line spacing value" })).toHaveValue(
      inch ? "0.50″" : "0.50 cm",
    );
    expect(errors).toEqual([]);
  });
}
