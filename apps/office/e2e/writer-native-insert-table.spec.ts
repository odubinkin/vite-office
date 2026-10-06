/** @fileoverview Chromium table insertion splits actual body text and shares native history. */
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import type { SwTextNode } from "../src/sw/source/core/txtnode/ndtxt";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
for (const width of [1280, 390])
  test(`native table insertion history width=${width}`, /** Verifies actual rendered cursor and complete table undo/redo. @param fixtures - Browser fixtures. @param fixtures.page - Browser. @returns Completion. */ async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    const doc = new SwDoc();
    (doc.paragraphs[0] as SwTextNode).SetText("leftRIGHT");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      buffer: Buffer.from(writeOdtDocument(doc, { title: "Native insertion" })),
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "native-insertion.odt",
    });
    const body = page.getByRole("textbox", { name: "Writer document text", exact: true });
    await expect(body).toHaveText("leftRIGHT");
    await body.click();
    await page.keyboard.press("Control+Home");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect
      .poll(
        /** Verifies the actual pre-command text caret. @returns Content offset. */ () =>
          body.evaluate(
            /** Reads native selection offset. @returns Offset. */ () =>
              window.getSelection()?.anchorOffset,
          ),
      )
      .toBe(4);
    await page.getByRole("button", { name: "Insert Table", exact: true }).click();
    await page.getByRole("button", { name: "3 columns, 2 rows", exact: true }).click();
    const table = page.getByRole("table", { name: "Table1" });
    await expect(table).toHaveCount(1);
    await expect(table.locator("tr")).toHaveCount(2);
    const first = page.getByLabel("Row 1 column 1 paragraph 1", { exact: true });
    await expect
      .poll(
        /** Reads actual native DOM caret and editing focus. @returns Whether first cell is active. */ () =>
          first.evaluate(
            /** Compares the browser selection with the actual mounted cell. @param cell - Cell paragraph. @returns Native caret membership. */ (
              cell,
            ) => {
              const selection = window.getSelection(),
                node = selection?.anchorNode;
              const paragraph =
                node instanceof Element ? node.closest("p") : node?.parentElement?.closest("p");
              return (
                paragraph === cell &&
                selection?.anchorOffset === 0 &&
                cell.closest("[data-writer-editing-host]")?.contains(document.activeElement) ===
                  true
              );
            },
          ),
      )
      .toBe(true);
    await expect(
      page.locator("p[data-writer-paragraph-id]").filter({ hasText: /^left$/ }),
    ).toHaveCount(1);
    await expect(
      page.locator("p[data-writer-paragraph-id]").filter({ hasText: /^RIGHT$/ }),
    ).toHaveCount(1);
    await page.keyboard.press("Control+z");
    await expect(table).toHaveCount(0);
    await expect(body).toHaveText("leftRIGHT");
    await page.keyboard.press("Control+y");
    await expect(table).toHaveCount(1);
    const cell = page.getByLabel("Row 1 column 1 paragraph 1", { exact: true });
    await page.keyboard.type("cell");
    await expect(cell).toHaveText("cell");
  });
