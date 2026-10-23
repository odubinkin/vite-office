/** @fileoverview Original superscript/subscript controls, native measured body/cell placement and complete ODT download/reopen at desktop/mobile widths. */
import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { SvxEscapementItem as Item } from "../src/editeng/inc/escapementitem";
import { RES_CHRATR_ESCAPEMENT as WHICH } from "../src/sw/inc/hintids";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
import { readOdtDocument } from "../src/sw/source/filter/xml/swxml";
import { SwAttrIter } from "../src/sw/source/core/text/itratr";
const values = [
  [0, 100],
  [14000, 58],
  [-14000, 58],
  [33, 75],
  [-8, 83],
] as const;
/** Uses the actual open-document flow. @param page - Browser. @param buffer - Original ODT bytes. @returns Completion. */
async function open(page: Page, buffer: Buffer) {
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer,
    mimeType: "application/vnd.oasis.opendocument.text",
    name: "position.odt",
  });
}
for (const width of [1280, 390]) {
  test(`Native character position, history and ODT width=${width}`, /** Checks actual native values and accessible browser surface. @param fixtures - Browser fixture. @param fixtures.page - Browser. @param info - Artifact locations. @returns Completion. */ async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    const doc = new SwDoc(false);
    for (const [offset, height] of values) {
      const node = doc.nodes.MakeTextNode(`Native position ${offset}: editable text`);
      node.SetAttr(new Item(offset, height, WHICH));
    }
    const buffer = Buffer.from(writeOdtDocument(doc, { title: "Native position" }));
    doc.Dispose();
    await open(page, buffer);
    const first = page.getByRole("textbox", { name: "Writer document text", exact: true });
    await expect(first).toHaveText("Native position 0: editable text");
    for (const [offset, height] of values.slice(1)) {
      const span = page.locator(`p [data-native-escapement="${offset}"]`).first();
      await expect(span).toHaveAttribute("data-native-escapement-height", String(height));
      await expect
        .poll(
          /** Reads real device-computed position rather than a synthetic model. @returns Baseline direction. */ async () =>
            span.evaluate(
              /** Reads actual platform CSS metrics. @param element - Device span. @returns Native-sign placement. */ (
                element,
              ) => {
                const style = getComputedStyle(element.firstElementChild as Element);
                return Math.sign(Number.parseFloat(style.verticalAlign));
              },
            ),
        )
        .toBe(offset > 0 ? 1 : -1);
      const ratio = await span.evaluate(
        /** Reads actual proportional device size. @param element - Original font wrapper. @returns Font ratio. */ (
          element,
        ) =>
          Number.parseFloat(getComputedStyle(element.firstElementChild as Element).fontSize) /
          Number.parseFloat(getComputedStyle(element).fontSize),
      );
      expect(ratio).toBeCloseTo(height / 100, 2);
    }
    const position = page
        .getByRole("complementary", { name: "Writer properties sidebar" })
        .getByRole("group", { name: "Character Position" }),
      superButton = position.getByRole("button", { name: "Superscript", exact: true }),
      subButton = position.getByRole("button", { name: "Subscript", exact: true });
    await expect(position.getByRole("button")).toHaveCount(2);
    await first.click();
    await page.keyboard.press("Home");
    await page.keyboard.press("Shift+End");
    await superButton.click();
    await expect(superButton).toHaveAttribute("aria-pressed", "true");
    await subButton.click();
    await expect(subButton).toHaveAttribute("aria-pressed", "true");
    await expect(superButton).toHaveAttribute("aria-pressed", "false");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(superButton).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(subButton).toHaveAttribute("aria-pressed", "true");
    await position.scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath("position.png") });
    const pending = page.waitForEvent("download");
    await page.getByRole("menuitem", { name: "File", exact: true }).click();
    await page.getByRole("menuitem", { name: "Export…", exact: true }).click();
    await page.getByRole("button", { name: "Download ODT", exact: true }).click();
    const path = info.outputPath("position.odt");
    await (await pending).saveAs(path);
    const reopened = await readOdtDocument(new Uint8Array(await readFile(path)), {
      title: "Native position",
    });
    try {
      expect(
        reopened.document.paragraphs.map(
          /** Reads actual imported complete native items. @param node - Native owner. @returns Pair. */ (
            node,
          ) => {
            const iterator = new SwAttrIter(node);
            iterator.Seek(0);
            const item = iterator.GetAttrHandler().ReadItem(WHICH) as Item;
            return [item.GetEsc(), item.GetProportionalHeight()];
          },
        ),
      ).toEqual([[-14000, 58], ...values.slice(1)]);
    } finally {
      reopened.document.Dispose();
    }
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles(path);
    await expect(
      page
        .getByRole("textbox", { name: "Writer document text", exact: true })
        .locator('[data-native-escapement="-14000"]'),
    ).toHaveAttribute("data-native-escapement-height", "58");
  });
  test(`Empty selected cell position survives typing and ODT width=${width}`, /** Native cursor rings include empty cell owners. @param fixtures - Browser fixture. @param fixtures.page - Browser. @param info - Artifact locations. @returns Completion. */ async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode("Position cells");
    table.AddColumnWidth(3000);
    table.AddColumnWidth(3000);
    doc.nodes.AppendTableRow(table, 2);
    const buffer = Buffer.from(writeOdtDocument(doc, { title: "Position cells" }));
    doc.Dispose();
    await open(page, buffer);
    const cell = page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true });
    await cell.click();
    await page
      .getByRole("toolbar", { name: "Writer table toolbar" })
      .getByRole("button", { name: "Select Table", exact: true })
      .click();
    const command = page
      .getByRole("complementary", { name: "Writer properties sidebar" })
      .getByRole("group", { name: "Character Position" })
      .getByRole("button", { name: "Superscript", exact: true });
    await command.click();
    await expect(command).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(command).toHaveAttribute("aria-pressed", "false");
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(command).toHaveAttribute("aria-pressed", "true");
    await cell.click();
    await page.keyboard.type("S");
    await expect(cell).toHaveText("S");
    await expect(cell.locator('[data-native-escapement="14000"]')).toHaveAttribute(
      "data-native-escapement-height",
      "58",
    );
    const pending = page.waitForEvent("download");
    await page.getByRole("menuitem", { name: "File", exact: true }).click();
    await page.getByRole("menuitem", { name: "Export…", exact: true }).click();
    await page.getByRole("button", { name: "Download ODT", exact: true }).click();
    const path = info.outputPath("cells.odt");
    await (await pending).saveAs(path);
    const reopened = await readOdtDocument(new Uint8Array(await readFile(path)), {
      title: "Position cells",
    });
    try {
      expect(
        reopened.document
          .GetTables()[0]
          ?.GetTabLines()[0]
          ?.GetTabBoxes()
          .map(
            /** Reads actual native empty/nonempty paragraph ownership. @param box - Original cell. @returns Pair. */ (
              box,
            ) => {
              const item = box.GetParagraphs()[0]?.GetAttr(WHICH) as Item;
              return [item.GetEsc(), item.GetProportionalHeight()];
            },
          ),
      ).toEqual([
        [14000, 58],
        [14000, 58],
      ]);
    } finally {
      reopened.document.Dispose();
    }
  });
}
