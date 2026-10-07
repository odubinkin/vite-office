/** @fileoverview Verifies production ODT repeated table headlines share actual native editing and history on desktop/mobile. */
import { SwFormatFrameSize, SwFrameSize } from "../src/sw/inc/fmtfsize";
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { SwDocShell } from "../src/sw/source/uibase/app/docsh";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";

test("Writer headline-adjacent text reflow retains a source caret beyond the old page fragment", /** Checks actual font reflow uses source offset before focused-frame preference. @param fixtures - Browser owners. @param fixtures.page - Browser. @returns Completion. */ async ({
  page,
}) => {
  const doc = new SwDoc(),
    body = doc.paragraphs[0];
  if (body === undefined) throw new Error("Missing actual body");
  body.SetText("abcdefghij ".repeat(24));
  doc.GetPageDesc().SetValue({
    ...doc.GetPageDesc().GetValue(),
    height: 4400,
    topMargin: 600,
    bottomMargin: 600,
    width: 8000,
    leftMargin: 600,
    rightMargin: 600,
  });
  const table = doc.nodes.MakeTableNode(
    "Reflow",
    { width: 5000, headerRows: 1, repeatHeaderRows: true },
    body,
  );
  table.AddColumnWidth(5000);
  for (let row = 0; row < 4; row++) {
    const node = doc.nodes
      .AppendTableRow(table, 1, { frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 1000) })
      .GetTabBoxes()[0]
      ?.GetParagraphs()[0];
    if (node === undefined) throw new Error("Missing actual table row");
    node.SetText(row === 0 ? "Header" : "Body" + row);
  }
  const metadata = createDocument({
      id: "header-reflow",
      suiteId: "writer",
      title: "Header reflow",
    }),
    shell = new SwDocShell(doc, metadata),
    bytes = writeOdtDocument(doc, metadata);
  shell.Close();
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: Buffer.from(bytes),
    mimeType: "application/vnd.oasis.opendocument.text",
    name: "header-reflow.odt",
  });
  const bodyFrames = page.getByRole("textbox", { name: "Writer document text", exact: true });
  await expect(bodyFrames.first()).toHaveText("abcdefghij ".repeat(24).trim());
  await expect(bodyFrames).toHaveCount(1);
  await bodyFrames.first().evaluate(
    /** Selects actual source text before device reflow. @param element - Initial master paragraph. @returns Nothing. */ (
      element,
    ) => {
      const text = document.createTreeWalker(element, NodeFilter.SHOW_TEXT).nextNode();
      if (text === null) throw new Error("Missing actual text");
      window.getSelection()?.setBaseAndExtent(text, 0, text, 100);
      document.dispatchEvent(new Event("selectionchange"));
    },
  );
  await page.locator('select:has(option[value="48"])').selectOption("48");
  await expect
    .poll(
      /** Counts actual source text-frame fragments. @returns Fragment count. */ () =>
        bodyFrames.count(),
    )
    .toBeGreaterThan(1);
  await expect
    .poll(
      /** Reads actual browser source offset after reflow. @returns Source coordinate. */ () =>
        page.evaluate(
          /** Converts actual DOM focus into a source UTF16 position. @returns Source offset. */ () => {
            const selection = window.getSelection(),
              node = selection?.focusNode;
            if (
              selection === null ||
              selection === undefined ||
              node === null ||
              node === undefined
            )
              return -1;
            const element = node instanceof HTMLElement ? node : node.parentElement,
              p = element?.closest<HTMLElement>("[data-writer-paragraph-id]");
            if (p === null || p === undefined) return -2;
            const range = document.createRange();
            range.selectNodeContents(p);
            range.setEnd(node, selection.focusOffset);
            return Number(p.dataset.writerFragmentStart) + range.toString().length;
          },
        ),
    )
    .toBe(100);
  await expect(
    page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true }).first(),
  ).toHaveText("Header");
  await expect(
    page.getByRole("textbox", { name: "Row 4 column 1 paragraph 1", exact: true }),
  ).toHaveText("Body3");
});

for (const width of [1280, 390])
  test(`Writer repeated table headlines edit the original native header width=${width}`, /** Opens genuine ODT and edits a follow occurrence with real history. @param fixtures - Browser owners. @param fixtures.page - Browser. @returns Completion. */ async ({
    page,
  }) => {
    const doc = new SwDoc(),
      body = doc.paragraphs[0];
    if (body === undefined) throw new Error("Missing native fixture body");
    body.SetText("Before");
    doc.GetPageDesc().SetValue({
      ...doc.GetPageDesc().GetValue(),
      height: 4400,
      topMargin: 600,
      bottomMargin: 600,
      width: 8000,
      leftMargin: 600,
      rightMargin: 600,
    });
    const table = doc.nodes.MakeTableNode(
      "Headlines",
      { width: 5000, headerRows: 1, repeatHeaderRows: true },
      body,
    );
    table.AddColumnWidth(5000);
    for (let row = 0; row < 5; row++) {
      const node = doc.nodes
        .AppendTableRow(table, 1, {
          frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 1000),
        })
        .GetTabBoxes()[0]
        ?.GetParagraphs()[0];
      if (node === undefined) throw new Error("Missing native fixture row");
      node.SetText(row === 0 ? "Header" : "Body" + row);
    }
    doc.nodes.MakeTextNode("After");
    const metadata = createDocument({ id: "headlines", suiteId: "writer", title: "Headlines" }),
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
      name: "headlines.odt",
    });
    const copies = page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true });
    await expect(copies).toHaveCount(3);
    const originalId = await copies.first().getAttribute("data-writer-node-index");
    expect(originalId).toBeTruthy();
    for (let index = 0; index < 3; index++) {
      await expect(copies.nth(index)).toHaveText("Header");
      await expect(copies.nth(index)).toHaveAttribute(
        "data-writer-node-index",
        originalId as string,
      );
    }
    await expect(page.locator('[data-writer-repeated-headline="true"]')).toHaveCount(2);
    await expect(
      page.locator(
        'table[aria-label="Headlines"] tr[data-writer-table-row="0"]:not([data-writer-repeated-headline])',
      ),
    ).toHaveCount(1);
    const current = copies.nth(1);
    await current.click();
    await current.press("End");
    await page.keyboard.type("X");
    for (let index = 0; index < 3; index++) await expect(copies.nth(index)).toHaveText("HeaderX");
    expect(
      await current.evaluate(
        /** Checks actual follow occurrence retains caret. @param element - Current occurrence. @returns Actual ownership. */ (
          element,
        ) => element.contains(window.getSelection()?.focusNode ?? null),
      ),
    ).toBe(true);
    await page.keyboard.press("Control+z");
    for (let index = 0; index < 3; index++) await expect(copies.nth(index)).toHaveText("Header");
    await page.keyboard.press("Control+Shift+z");
    for (let index = 0; index < 3; index++) await expect(copies.nth(index)).toHaveText("HeaderX");
    for (let row = 2; row <= 5; row++)
      await expect(
        page.getByRole("textbox", { name: `Row ${row} column 1 paragraph 1`, exact: true }),
      ).toHaveText("Body" + (row - 1));
    await expect(
      page.getByRole("textbox", { name: "Writer document text", exact: true }),
    ).toHaveText("Before");
    await expect(page.getByRole("textbox", { name: "Writer paragraph 2", exact: true })).toHaveText(
      "After",
    );
  });
