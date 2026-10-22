/** @fileoverview Exercises native row balancing from actual ODT owners and natural device geometry on desktop/mobile. */
import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { SwFormatFrameSize, SwFrameSize } from "../src/sw/inc/fmtfsize";
import { HoriOrientation } from "../src/offapi/com/sun/star/text/HoriOrientation";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
import { readOdtDocument } from "../src/sw/source/filter/xml/swxml";

/** Opens actual fixed rows through the normal document UI. @param page - Browser. @param longContent - Last row overflows its authored fixed height. @returns Original rendered table. */
async function open(page: Page, longContent = false) {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Balancing", {
      width: 6000,
      horiOrient: HoriOrientation.LEFT,
      headerRows: 0,
      repeatHeaderRows: false,
    });
  table.AddColumnWidth(6000);
  for (const [index, height] of [900, 300, 600].entries()) {
    const row = doc.nodes.AppendTableRow(table, 1, {
        frameSize: new SwFormatFrameSize(SwFrameSize.Fixed, 0, height),
      }),
      node = row.GetTabBoxes()[0]?.GetParagraphs()[0];
    if (!node) throw new Error("Missing balance fixture node");
    node.SetText(
      index === 2 && longContent
        ? "Line one\nLine two\nLine three\nLine four\nLine five\nLine six\nLine seven\nLine eight"
        : "Row " + (index + 1),
    );
  }
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: Buffer.from(writeOdtDocument(doc, { title: "Balancing" })),
    mimeType: "application/vnd.oasis.opendocument.text",
    name: "row-balancing.odt",
  });
  doc.Dispose();
  const rendered = page.getByRole("table", { name: "Balancing", exact: true });
  await expect(rendered).toHaveCount(1);
  await page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true }).click();
  return rendered;
}
/** Reads actual projected physical rows. @param table - Original table locator. @returns Heights in device pixels. */
async function heights(table: ReturnType<Page["getByRole"]>) {
  return table
    .locator("tr")
    .evaluateAll(
      /** Reads original DOM bounds without altering layout. @param rows - Actual rows. @returns Device heights. */ (
        rows,
      ) =>
        rows.map(
          /** Reads one original row. @param row - DOM row. @returns Height. */ (row) =>
            row.getBoundingClientRect().height,
        ),
    );
}
for (const width of [1280, 390])
  for (const optimize of [false, true]) {
    test(`Native row sizing optimize=${optimize} width=${width}`, /** Checks original controls, real heights/history and ODT. @param fixtures - Fixtures. @param fixtures.page - Browser. @param info - Artifact paths. @returns Completion. */ async ({
      page,
    }, info) => {
      await page.setViewportSize({ width, height: 900 });
      const table = await open(page),
        group = page
          .getByRole("complementary", { name: "Writer properties sidebar" })
          .getByRole("group", { name: "Row sizing" }),
        command = group.getByRole("button", {
          name: optimize ? "Optimal Row Height" : "Distribute Rows Evenly",
          exact: true,
        });
      await expect(command).toBeDisabled();
      await expect
        .poll(
          /** Reads initial actual fixed heights. @returns Device heights. */ () => heights(table),
        )
        .toEqual([60, 20, 40]);
      await page
        .getByRole("toolbar", { name: "Writer table toolbar" })
        .getByRole("button", { name: "Select Table", exact: true })
        .click();
      await expect(command).toBeEnabled();
      await command.click();
      const expected = optimize ? 40 : 60;
      await expect
        .poll(
          /** Reads completed source layout. @returns Actual row heights. */ () => heights(table),
        )
        .toEqual([expected, expected, expected]);
      await expect(table.locator('[data-writer-fixed-row-content="true"]')).toHaveCount(0);
      await page.getByRole("button", { name: "Undo", exact: true }).click();
      if (optimize) await page.getByRole("button", { name: "Undo", exact: true }).click();
      await expect
        .poll(
          /** Reads restored original fixed rows. @returns Device heights. */ () => heights(table),
        )
        .toEqual([60, 20, 40]);
      await page.getByRole("button", { name: "Redo", exact: true }).click();
      if (optimize) await page.getByRole("button", { name: "Redo", exact: true }).click();
      await expect
        .poll(
          /** Reads restored accepted geometry. @returns Device heights. */ () => heights(table),
        )
        .toEqual([expected, expected, expected]);
      await group.scrollIntoViewIfNeeded();
      await page.screenshot({ path: info.outputPath("row-balancing.png") });
      const pending = page.waitForEvent("download");
      await page.getByRole("menuitem", { name: "File", exact: true }).click();
      await page.getByRole("menuitem", { name: "Export…", exact: true }).click();
      await page.getByRole("button", { name: "Download ODT", exact: true }).click();
      const artifact = info.outputPath("row-balancing.odt");
      await (await pending).saveAs(artifact);
      const opened = await readOdtDocument(new Uint8Array(await readFile(artifact)), {
        title: "Balancing",
      });
      try {
        expect(
          opened.document
            .GetTables()[0]
            ?.GetTabLines()
            .map(
              /** Reads reopened native mode and height. @param row - Original imported row. @returns Pair. */ (
                row,
              ) => [row.GetFrameSize().GetHeightSizeType(), row.GetFrameSize().GetHeight()],
            ),
        ).toEqual([
          [SwFrameSize.Minimum, expected * 15],
          [SwFrameSize.Minimum, expected * 15],
          [SwFrameSize.Minimum, expected * 15],
        ]);
      } finally {
        opened.document.Dispose();
      }
    });
  }
for (const width of [1280, 390])
  test(`Optimal height uses unclipped natural text width=${width}`, /** Checks real content growth after fixed-height clipping. @param fixtures - Fixtures. @param fixtures.page - Browser. @returns Completion. */ async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const table = await open(page, true);
    await expect
      .poll(
        /** Reads initial clipped physical rows. @returns Device heights. */ () => heights(table),
      )
      .toEqual([60, 20, 40]);
    await page
      .getByRole("toolbar", { name: "Writer table toolbar" })
      .getByRole("button", { name: "Select Table", exact: true })
      .click();
    await page
      .getByRole("complementary", { name: "Writer properties sidebar" })
      .getByRole("button", { name: "Optimal Row Height", exact: true })
      .click();
    await expect
      .poll(
        /** Reads whether all source rows now fit the actual long text. @returns Whether balanced and unclipped. */ async () => {
          const sizes = await heights(table),
            content = await page
              .getByRole("textbox", { name: "Row 3 column 1 paragraph 1", exact: true })
              .boundingBox();
          return (
            sizes.length === 3 &&
            sizes.every(
              /** Compares each actual row with natural content. @param height - Device height. @returns Whether matching the completed maximum. */ (
                height,
              ) =>
                Math.abs(height - (sizes[0] ?? 0)) <= 1 / 15 &&
                height > 60 &&
                height + 1 / 15 >= (content?.height ?? Infinity),
            )
          );
        },
      )
      .toBe(true);
    await expect(table.locator('[data-writer-fixed-row-content="true"]')).toHaveCount(0);
  });

for (const width of [1280, 390])
  test(`Row height edit completes before distribution width=${width}`, /** Checks ordinary metric editing followed by source balancing and native geometry. @param fixtures - Fixtures. @param fixtures.page - Browser. @returns Completion. */ async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const table = await open(page);
    const panel = page.getByRole("complementary", { name: "Writer properties sidebar" });
    await panel.getByRole("spinbutton", { name: "Row height", exact: true }).fill("1 in");
    await panel.getByRole("spinbutton", { name: "Row height", exact: true }).blur();
    await expect
      .poll(
        /** Reads completed authored height geometry. @returns Native projected heights. */ () =>
          heights(table),
      )
      .toEqual([96, 20, 40]);
    await page
      .getByRole("toolbar", { name: "Writer table toolbar" })
      .getByRole("button", { name: "Select Table", exact: true })
      .click();
    await panel.getByRole("button", { name: "Distribute Rows Evenly", exact: true }).click();
    await expect
      .poll(
        /** Reads completed distribution over the new frame areas. @returns Native projected heights. */ () =>
          heights(table),
      )
      .toEqual([96, 96, 96]);
  });
