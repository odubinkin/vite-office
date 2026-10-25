/** @fileoverview Actual editable native Writer size/Grow/Shrink controls, grouped history and physical ODT download/reopen at desktop/mobile widths. */
import { expect, test } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import { openBrowserMenu } from "../test-support/menu-pointer-e2e";
import { readOdtDocument } from "../src/sw/source/filter/xml/swxml";
import { SfxItemSet } from "../src/svl/inc/itemset";
import { SvxFontHeightItem } from "../src/editeng/inc/fhgtitem";
for (const width of [1280, 390]) {
  test(`Native Writer font sizing and history ODT width=${width}`, /** Uses only visible production controls and real document package I/O. @param fixtures - Browser fixtures. @param fixtures.page - Actual page. @param info - Artifact output. @returns Completion. */ async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on(
      "pageerror",
      /** Observes real application failures. @param error - Actual browser error. @returns Nothing. */ (
        error,
      ) => {
        errors.push(error.message);
      },
    );
    await page.goto("/writer");
    const editor = page.getByRole("textbox", { name: "Writer document text", exact: true });
    await editor.fill("Size sample");
    await editor.press("ControlOrMeta+A");
    const sidebar = page.getByRole("complementary", { name: "Writer properties sidebar" }),
      toolbar = page.getByRole("toolbar", { name: "Writer formatting toolbar" }),
      size = toolbar.getByRole("combobox", { name: "Font size", exact: true });
    await size.fill("13.3");
    await size.press("Enter");
    await expect(sidebar.getByRole("combobox", { name: "Font size", exact: true })).toHaveValue(
      "13.3 pt",
    );
    const observed = page.evaluate(
      /** Observes the next actual nonmodifier platform key without changing application state. @returns Event fields. */ () =>
        new Promise(
          /** Captures a real device event. @param resolve - Event completion. @returns Nothing. */ (
            resolve,
          ) => {
            const handler =
              /** Captures actual key fields after framework dispatch. @param event - Device event. @returns Nothing. */ (
                event: KeyboardEvent,
              ) => {
                if (["Meta", "Control", "Shift", "Alt"].includes(event.key)) return;
                window.removeEventListener("keydown", handler);
                queueMicrotask(
                  /** Reads the completed actual dispatch. @returns Nothing. */ () =>
                    resolve({
                      key: event.key,
                      ctrl: event.ctrlKey,
                      meta: event.metaKey,
                      shift: event.shiftKey,
                      prevented: event.defaultPrevented,
                      active: document.activeElement?.outerHTML.slice(0, 250),
                    }),
                );
              };
            window.addEventListener("keydown", handler);
          },
        ),
    );
    await page.keyboard.press("ControlOrMeta+]");
    await writeFile(info.outputPath("shortcut-event.json"), JSON.stringify(await observed));
    await expect(size).toHaveValue("15.3 pt");
    await page.keyboard.press("ControlOrMeta+[");
    await expect(size).toHaveValue("13.3 pt");
    await sidebar
      .getByRole("group", { name: "Direct Formatting and Font Size", exact: true })
      .getByRole("button", { name: "Increase", exact: true })
      .click();
    await expect(size).toHaveValue("15.3 pt");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(size).toHaveValue("13.3 pt");
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(size).toHaveValue("15.3 pt");
    await sidebar
      .getByRole("group", { name: "Direct Formatting and Font Size", exact: true })
      .getByRole("button", { name: "Decrease", exact: true })
      .click();
    await expect(size).toHaveValue("13.3 pt");
    await sidebar
      .getByRole("group", { name: "Direct Formatting and Font Size", exact: true })
      .scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath("font-sizing.png") });
    expect(
      await page.evaluate(
        /** Reads real viewport overflow. @returns Browser root width. */ () =>
          document.documentElement.scrollWidth,
      ),
    ).toBeLessThanOrEqual(width);
    const download = page.waitForEvent("download");
    await openBrowserMenu(page, "File");
    await page.getByRole("menuitem", { name: "Export…", exact: true }).click();
    await page.getByRole("button", { name: "Download ODT", exact: true }).click();
    const path = info.outputPath("font-sizing.odt");
    await (await download).saveAs(path);
    const imported = await readOdtDocument(new Uint8Array(await readFile(path)), {
      title: "Native size",
    });
    try {
      const node = imported.document.paragraphs[0];
      if (!node) throw new Error("Missing original imported text");
      expect(node.GetText()).toBe("Size sample");
      const attributes = new SfxItemSet(imported.document.GetAttrPool(), [
        [8, 8],
        [23, 23],
        [28, 28],
      ]);
      node.GetParaAttr(attributes, 0, node.Len());
      for (const which of [8, 23, 28])
        expect((attributes.Get(which) as SvxFontHeightItem).GetHeight()).toBe(266);
    } finally {
      imported.document.Dispose();
    }
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles(path);
    await expect(size).toHaveValue("13.3 pt");
    expect(errors).toEqual([]);
  });
}
