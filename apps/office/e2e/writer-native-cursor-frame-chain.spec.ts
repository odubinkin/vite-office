/** @fileoverview Checks actual Chromium Home on a native body follow and editing/history over physical pages. */
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
test("native body follow Home retains its original model offset and edit history", /** Checks actual device pagination and native line movement in a later physical frame. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  if (node === undefined) throw Error("Missing original body");
  const text = "Native original cursor follows across physical Writer pages. ".repeat(180);
  node.SetText(text);
  const bytes = writeOdtDocument(doc, { title: "Cursor chain" });
  doc.Dispose();
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: Buffer.from(bytes),
    mimeType: "application/vnd.oasis.opendocument.text",
    name: "chain.odt",
  });
  const fragments = page.locator("[data-writer-page] p[data-writer-node-index]");
  await expect
    .poll(/** Reads actual device pagination. @returns Fragment count. */ () => fragments.count())
    .toBeGreaterThan(1);
  const last = fragments.last();
  await last.focus();
  const start = await last.evaluate(
    /** Positions the actual caret inside the first line of a later source frame. @param element - Actual mounted follow. @returns Original model start. */ (
      element,
    ) => {
      const text = document.createTreeWalker(element, NodeFilter.SHOW_TEXT).nextNode();
      if (text === null) throw Error("Missing actual text");
      window.getSelection()?.setBaseAndExtent(text, 2, text, 2);
      document.dispatchEvent(new Event("selectionchange"));
      return Number((element as HTMLElement).dataset.writerFragmentStart);
    },
  );
  expect(start).toBeGreaterThan(0);
  await page.keyboard.press("Home");
  expect(
    await last.evaluate(
      /** Reads current model offset from the actual DOM selection. @param element - Current native follow. @returns Original model offset. */ (
        element,
      ) => {
        const selection = window.getSelection();
        if (selection === null || selection.focusNode === null) throw Error("Missing point");
        const range = document.createRange();
        range.selectNodeContents(element);
        range.setEnd(selection.focusNode, selection.focusOffset);
        return (
          Number((element as HTMLElement).dataset.writerFragmentStart) + range.toString().length
        );
      },
    ),
  ).toBe(start);
  await page.keyboard.type("X");
  const edited = text.slice(0, start) + "X" + text.slice(start);
  await expect
    .poll(
      /** Reads all actual original fragments after editing. @returns Complete original text. */ async () =>
        (await fragments.allTextContents()).join(""),
    )
    .toBe(edited);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect
    .poll(
      /** Reads source undo over current physical frames. @returns Complete original text. */ async () =>
        (await fragments.allTextContents()).join(""),
    )
    .toBe(text);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect
    .poll(
      /** Reads source redo over original text. @returns Complete text. */ async () =>
        (await fragments.allTextContents()).join(""),
    )
    .toBe(edited);
});
