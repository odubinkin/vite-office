/** @fileoverview Checks repeated actual Chromium Home/End on a later native body fragment through editing and history. */
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
test("repeated physical follow Home/End retains text and source edit/history boundaries", /** Checks actual browser shaping and native key movement after repeated paragraph-cache replacement. @param fixtures - Browser fixture. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  if (node === undefined) throw Error("Missing body");
  const text =
    "Original formatted frames serve both page layout and native cursor movement. ".repeat(150);
  node.SetText(text);
  const bytes = writeOdtDocument(doc, { title: "Formatted clients" });
  doc.Dispose();
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: Buffer.from(bytes),
    mimeType: "application/vnd.oasis.opendocument.text",
    name: "formatted.odt",
  });
  const fragments = page.locator("[data-writer-page] p[data-writer-node-index]");
  await expect
    .poll(/** Reads actual physical pagination. @returns Fragment count. */ () => fragments.count())
    .toBeGreaterThan(1);
  const last = fragments.last();
  await last.focus();
  const start = await last.evaluate(
    /** Places the caret in the real first line of the follow. @param element - Actual body follow. @returns Original model offset. */ (
      element,
    ) => {
      const textNode = document.createTreeWalker(element, NodeFilter.SHOW_TEXT).nextNode();
      if (textNode === null) throw Error("Missing text");
      window.getSelection()?.setBaseAndExtent(textNode, 2, textNode, 2);
      document.dispatchEvent(new Event("selectionchange"));
      return Number((element as HTMLElement).dataset.writerFragmentStart);
    },
  );
  expect(start).toBeGreaterThan(0);
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press("Home");
    await page.keyboard.press("End");
  }
  await page.keyboard.press("Home");
  const offset = await last.evaluate(
    /** Reads actual source cursor offset. @param element - Current follow. @returns Native offset. */ (
      element,
    ) => {
      const selection = window.getSelection();
      if (selection?.focusNode === null || selection === null) throw Error("Missing caret");
      const range = document.createRange();
      range.selectNodeContents(element);
      range.setEnd(selection.focusNode, selection.focusOffset);
      return Number((element as HTMLElement).dataset.writerFragmentStart) + range.toString().length;
    },
  );
  expect(offset).toBe(start);
  await page.keyboard.type("X");
  const edited = text.slice(0, start) + "X" + text.slice(start);
  await expect
    .poll(
      /** Reads actual edited physical frames. @returns Original text. */ async () =>
        (await fragments.allTextContents()).join(""),
    )
    .toBe(edited);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect
    .poll(
      /** Reads original undo text. @returns Text. */ async () =>
        (await fragments.allTextContents()).join(""),
    )
    .toBe(text);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect
    .poll(
      /** Reads original redo text. @returns Text. */ async () =>
        (await fragments.allTextContents()).join(""),
    )
    .toBe(edited);
});
