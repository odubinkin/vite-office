/** @fileoverview Exercises native crossed-out values, original sidebar command, real device paint and actual ODT on desktop/mobile. */
import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { SvxCrossedOutItem } from "../src/editeng/inc/crossedoutitem";
import { FontStrikeout as S } from "../src/tools/inc/fontenum";
import { RES_CHRATR_CROSSEDOUT as WHICH } from "../src/sw/inc/hintids";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
import { readOdtDocument } from "../src/sw/source/filter/xml/swxml";
import { SwAttrIter } from "../src/sw/source/core/text/itratr";

const modes = [
  S.STRIKEOUT_NONE,
  S.STRIKEOUT_SINGLE,
  S.STRIKEOUT_DOUBLE,
  S.STRIKEOUT_BOLD,
  S.STRIKEOUT_SLASH,
  S.STRIKEOUT_X,
] as const;
/** Opens original native values through normal file UI. @param page - Browser. @returns Original first paragraph. */
async function open(page: Page) {
  const doc = new SwDoc(false);
  for (const mode of modes) {
    const node = doc.nodes.MakeTextNode(`Native decoration ${mode}: editable text`);
    node.SetAttr(new SvxCrossedOutItem(mode, WHICH));
  }
  const buffer = Buffer.from(writeOdtDocument(doc, { title: "Native strikeout" }));
  doc.Dispose();
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer,
    mimeType: "application/vnd.oasis.opendocument.text",
    name: "strikeout.odt",
  });
  const first = page.getByRole("textbox", { name: "Writer document text", exact: true });
  await expect(first).toHaveText("Native decoration 0: editable text");
  return first;
}
for (const width of [1280, 390]) {
  test(`Empty selected cells retain native strikethrough for typing and ODT width=${width}`, /** Checks empty-node ownership through actual browser commands and ODT. @param fixtures - Fixtures. @param fixtures.page - Browser. @param info - Artifacts. @returns Completion. */ async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode("Empty strikeout");
    table.AddColumnWidth(3000);
    table.AddColumnWidth(3000);
    doc.nodes.AppendTableRow(table, 2);
    const buffer = Buffer.from(writeOdtDocument(doc, { title: "Empty native strikeout" }));
    doc.Dispose();
    await page.goto("/writer");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      buffer,
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "empty-strikeout.odt",
    });
    const first = page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true });
    await first.click();
    await page
      .getByRole("toolbar", { name: "Writer table toolbar" })
      .getByRole("button", { name: "Select Table", exact: true })
      .click();
    const command = page
      .getByRole("complementary", { name: "Writer properties sidebar" })
      .getByRole("group", { name: "Font Effects" })
      .getByRole("button", { name: "Strikethrough", exact: true });
    await expect(command).toHaveAttribute("aria-pressed", "false");
    await command.click();
    await expect(command).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(command).toHaveAttribute("aria-pressed", "false");
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(command).toHaveAttribute("aria-pressed", "true");
    await first.click();
    await page.keyboard.type("A");
    await expect(first).toHaveText("A");
    await expect(first.locator('[data-native-strikeout="1"]')).toHaveCSS(
      "background-image",
      /data:image\/png/,
    );
    const pending = page.waitForEvent("download");
    await page.getByRole("menuitem", { name: "File", exact: true }).click();
    await page.getByRole("menuitem", { name: "Export…", exact: true }).click();
    await page.getByRole("button", { name: "Download ODT", exact: true }).click();
    const artifact = info.outputPath("empty-strikeout.odt");
    await (await pending).saveAs(artifact);
    const restored = await readOdtDocument(new Uint8Array(await readFile(artifact)), {
      title: "Empty native strikeout",
    });
    try {
      const boxes = restored.document.GetTables()[0]?.GetTabLines()[0]?.GetTabBoxes();
      expect(
        boxes?.map(
          /** Reads complete actual native paragraph items. @param box - Original cell. @returns Enum. */ (
            box,
          ) => (box.GetParagraphs()[0]?.GetAttr(WHICH) as SvxCrossedOutItem).GetStrikeout(),
        ),
      ).toEqual([S.STRIKEOUT_SINGLE, S.STRIKEOUT_SINGLE]);
    } finally {
      restored.document.Dispose();
    }
  });
  test(`Native strikethrough command, history, paint and ODT width=${width}`, /** Verifies original enum data and browser interactions without private app ports. @param fixtures - Fixtures. @param fixtures.page - Browser. @param info - Artifact locations. @returns Completion. */ async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    const first = await open(page);
    for (const mode of modes.slice(1)) {
      const span = page.locator(`p [data-native-strikeout="${mode}"]`).first();
      await expect(span).toHaveCSS("background-image", /data:image\/png/);
    }
    const sidebar = page.getByRole("complementary", { name: "Writer properties sidebar" });
    const effects = sidebar.getByRole("group", { name: "Font Effects" });
    await expect(effects.getByRole("button")).toHaveCount(4);
    const strikeout = effects.getByRole("button", { name: "Strikethrough", exact: true });
    await first.click();
    await page.keyboard.press("Home");
    await page.keyboard.press("Shift+End");
    await expect(strikeout).toHaveAttribute("aria-pressed", "false");
    await strikeout.click();
    await expect(strikeout).toHaveAttribute("aria-pressed", "true");
    await expect(first.locator('[data-native-strikeout="1"]')).toHaveCSS(
      "background-image",
      /data:image\/png/,
    );
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(strikeout).toHaveAttribute("aria-pressed", "false");
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(strikeout).toHaveAttribute("aria-pressed", "true");
    await effects.scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath("strikeout.png") });
    const pending = page.waitForEvent("download");
    await page.getByRole("menuitem", { name: "File", exact: true }).click();
    await page.getByRole("menuitem", { name: "Export…", exact: true }).click();
    await page.getByRole("button", { name: "Download ODT", exact: true }).click();
    const artifact = info.outputPath("strikeout.odt");
    await (await pending).saveAs(artifact);
    const opened = await readOdtDocument(new Uint8Array(await readFile(artifact)), {
      title: "Native strikeout",
    });
    try {
      expect(
        opened.document.paragraphs.map(
          /** Reads actual imported item stacks. @param node - Native text. @returns Full enum. */ (
            node,
          ) => {
            const iterator = new SwAttrIter(node);
            iterator.Seek(0);
            return (iterator.GetAttrHandler().ReadItem(WHICH) as SvxCrossedOutItem).GetStrikeout();
          },
        ),
      ).toEqual([S.STRIKEOUT_SINGLE, ...modes.slice(1)]);
    } finally {
      opened.document.Dispose();
    }
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles(artifact);
    await expect(
      page
        .getByRole("textbox", { name: "Writer document text", exact: true })
        .locator('[data-native-strikeout="1"]'),
    ).toHaveCSS("background-image", /data:image\/png/);
  });
}
