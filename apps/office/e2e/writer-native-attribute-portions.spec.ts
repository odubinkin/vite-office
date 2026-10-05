/** @fileoverview Checks production body/cell native attribute display, real selection/history and ODT reopen at two widths. */
import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { SetAttrMode } from "../src/sw/inc/swtypes";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { SwDocShell } from "../src/sw/source/uibase/app/docsh";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import { SfxItemSet } from "../src/svl/source/items/itemset";
import { SvxWeightItem, SvxPostureItem, SvxFontItem } from "../src/editeng/source/items/textitem";
import { SwFormatINetFormat } from "../src/sw/source/core/txtnode/fmtatr2";
import { SwFormatAutoFormat } from "../src/sw/source/core/txtnode/txatbase";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";

/** Requires an actual native fixture owner. @param value - Native owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native portion fixture");
  return value;
}
for (const width of [1280, 390])
  test(`Writer native body and cell portions retain formatting and editing width=${width}`, /** Checks the committed production bundle through ordinary document UI. @param fixtures - Browser fixtures. @param fixtures.page - Page. @param fixtures.browser - Browser. @returns Completion. */ async ({
    page,
    browser,
  }) => {
    const doc = new SwDoc(),
      body = required(doc.paragraphs[0]);
    body.SetText("Body");
    const table = doc.nodes.MakeTableNode("Portions", {}, body);
    table.AddColumnWidth(2200);
    table.AddColumnWidth(2200);
    const row = doc.nodes.AppendTableRow(table, 2),
      cell = required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]),
      neighbor = required(required(row.GetTabBoxes()[1]).GetParagraphs()[0]);
    neighbor.SetText("Neighbor");
    for (const node of [body, cell]) {
      node.SetText("abcdef");
      node.SetAttr(new SvxFontItem("Liberation Serif", 7, "Liberation Serif", "roman"));
      const bold = new SfxItemSet(doc.GetAttrPool(), [[1, 49]]);
      bold.Put(new SvxWeightItem(8, 15));
      const both = new SfxItemSet(doc.GetAttrPool(), [[1, 49]]);
      both.Put(new SvxWeightItem(8, 15));
      both.Put(new SvxPostureItem(2, 11));
      node.InsertItem(new SwFormatAutoFormat(bold), 0, 2, SetAttrMode.NOHINTADJUST);
      node.InsertItem(new SwFormatAutoFormat(both), 2, 4, SetAttrMode.NOHINTADJUST);
      node.InsertItem(
        new SwFormatINetFormat({ url: "https://example.test/native", targetFrame: "_blank" }),
        2,
        4,
        SetAttrMode.NOHINTADJUST,
      );
    }
    const metadata = createDocument({
        id: "native-portions",
        suiteId: "writer",
        title: "Native portions",
      }),
      shell = new SwDocShell(doc, metadata),
      bytes = writeOdtDocument(doc, metadata);
    shell.Close();
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      buffer: Buffer.from(bytes),
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "native-portions.odt",
    });
    await expect(page.getByRole("dialog", { name: "Open", exact: true })).toBeHidden();
    const bodyEditor = page.getByRole("textbox", { name: "Writer document text", exact: true }),
      editor = page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true }),
      other = page.getByRole("textbox", { name: "Row 1 column 2 paragraph 1", exact: true });
    for (const target of [bodyEditor, editor]) {
      await expect(target).toHaveText("abcdef");
      await expect(target.locator("strong")).toHaveCount(2);
      await expect(target.getByRole("link", { name: "cd" }).locator("strong em")).toHaveText("cd");
      await expect(target.getByRole("link", { name: "cd" })).toHaveAttribute("target", "_blank");
    }
    await editor.click({ position: { x: 10, y: 8 } });
    await page.keyboard.press("Control+Home");
    await page.keyboard.press("Shift+ArrowRight");
    await page.keyboard.press("Shift+ArrowRight");
    await expect
      .poll(
        /** Reads the real DOM selection before the command. @returns Selected text. */ () =>
          editor.evaluate(
            /** Reads the mounted editing host's selection. @param element - Paragraph. @returns Selected text. */ (
              element,
            ) => element.ownerDocument.getSelection()?.toString(),
          ),
      )
      .toBe("ab");
    await page
      .getByRole("toolbar", { name: "Writer formatting toolbar" })
      .getByRole("button", { name: "Bold", exact: true })
      .click();
    await expect(editor.locator("strong")).toHaveCount(1);
    await expect(editor.getByRole("link", { name: "cd" }).locator("strong em")).toHaveText("cd");
    await page.keyboard.press("Control+z");
    await expect(editor.locator("strong")).toHaveCount(2);
    await page.keyboard.press("Control+y");
    await expect(editor.locator("strong")).toHaveCount(1);
    await expect(bodyEditor.locator("strong")).toHaveCount(2);
    await expect(other).toHaveText("Neighbor");
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "File", exact: true }).click();
    await page.getByRole("menuitem", { name: "Export…" }).click();
    await page.getByRole("button", { name: "Download ODT" }).click();
    const path = await (await download).path();
    if (path === null) throw new Error("Missing ODT export");
    const reopenedContext = await browser.newContext({
      viewport: { width, height: 900 },
      baseURL: "http://127.0.0.1:4173",
    });
    try {
      const reopenedPage = await reopenedContext.newPage();
      await reopenedPage.goto("/writer");
      await reopenedPage.getByRole("button", { name: "Open", exact: true }).click();
      await reopenedPage.getByRole("tab", { name: "On computer" }).click();
      await reopenedPage.getByLabel("Browse").setInputFiles({
        buffer: await readFile(path),
        mimeType: "application/vnd.oasis.opendocument.text",
        name: "reopened-portions.odt",
      });
      await expect(reopenedPage.getByRole("dialog", { name: "Open", exact: true })).toBeHidden();
      const reopenedEditor = reopenedPage.getByRole("textbox", {
          name: "Row 1 column 1 paragraph 1",
          exact: true,
        }),
        reopenedOther = reopenedPage.getByRole("textbox", {
          name: "Row 1 column 2 paragraph 1",
          exact: true,
        }),
        reopenedBody = reopenedPage.getByRole("textbox", {
          name: "Writer document text",
          exact: true,
        });
      await expect(reopenedEditor).toHaveText("abcdef");
      await expect(reopenedEditor.locator("strong")).toHaveCount(1);
      await expect(
        reopenedEditor.getByRole("link", { name: "cd" }).locator("strong em"),
      ).toHaveText("cd");
      await expect(reopenedEditor.getByRole("link", { name: "cd" })).toHaveAttribute(
        "target",
        "_blank",
      );
      await expect(reopenedBody.locator("strong")).toHaveCount(2);
      await expect(reopenedOther).toHaveText("Neighbor");
      await reopenedEditor.click({ position: { x: 10, y: 8 } });
      await reopenedPage.keyboard.press("Control+End");
      await expect
        .poll(
          /** Reads the native command's restored DOM caret. @returns Paragraph offset. */ () =>
            reopenedEditor.evaluate(
              /** Reads only a collapsed caret inside this mounted paragraph. @param element - Paragraph. @returns UTF-16 offset. */ (
                element,
              ) => {
                const selection = element.ownerDocument.getSelection();
                if (
                  selection === null ||
                  !selection.isCollapsed ||
                  selection.focusNode === null ||
                  !element.contains(selection.focusNode)
                )
                  return undefined;
                const range = element.ownerDocument.createRange();
                range.selectNodeContents(element);
                range.setEnd(selection.focusNode, selection.focusOffset);
                return range.toString().length;
              },
            ),
        )
        .toBe(6);
      await reopenedPage.keyboard.insertText("Z");
      await expect(reopenedEditor).toHaveText("abcdefZ");
      await reopenedPage.keyboard.press("Control+z");
      await expect(reopenedEditor).toHaveText("abcdef");
      await expect(reopenedEditor.locator("strong")).toHaveCount(1);
      await expect(
        reopenedEditor.getByRole("link", { name: "cd" }).locator("strong em"),
      ).toHaveText("cd");
      await expect(reopenedOther).toHaveText("Neighbor");
    } finally {
      await reopenedContext.close();
    }
  });
