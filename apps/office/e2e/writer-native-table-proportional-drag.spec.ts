/** @fileoverview Measures native solitary Control following-column resizing in the production browser. */
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { SwDocShell } from "../src/sw/source/uibase/app/docsh";
import { SwWrtShell } from "../src/sw/source/uibase/wrtsh/wrtsh1";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
import { HoriOrientation } from "../src/offapi/com/sun/star/text/HoriOrientation";

for (const width of [1280, 390])
  test(
    "Writer solitary Control proportionally resizes following columns width=" + width,
    /** Checks real editing capture, geometry, cancellation and native history. @param fixtures - Browser fixtures. @param fixtures.page - Actual page. @returns Completion. */ async ({
      page,
    }) => {
      const doc = new SwDoc(),
        table = doc.nodes.MakeTableNode(
          "Proportional",
          { width: 4500, horiOrient: HoriOrientation.LEFT },
          doc.paragraphs[0],
        );
      for (let column = 0; column < 3; column++) table.AddColumnWidth(1500);
      for (let row = 0; row < 2; row++)
        for (const box of doc.nodes.AppendTableRow(table, 3).GetTabBoxes()) {
          const node = box.GetParagraphs()[0];
          if (node === undefined) throw Error("Missing proportional owner");
          node.SetText("Cell");
        }
      const first = table.GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0];
      if (first === undefined) throw Error("Missing first cell");
      const metadata = createDocument({
          id: "proportional",
          suiteId: "writer",
          title: "Proportional",
        }),
        shell = new SwWrtShell(new SwDocShell(doc, metadata));
      shell.FocusNode(first);
      shell.SetParagraphListKind("bullet");
      const bytes = writeOdtDocument(doc, metadata);
      shell.Close();
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/writer");
      await page.getByRole("button", { name: "Open", exact: true }).click();
      await page.getByRole("tab", { name: "On computer" }).click();
      await page.getByLabel("Browse").setInputFiles({
        buffer: Buffer.from(bytes),
        mimeType: "application/vnd.oasis.opendocument.text",
        name: "proportional.odt",
      });
      const mounted = page.locator("[data-writer-table='Proportional']"),
        paragraph = page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" });
      await expect(paragraph).toHaveText("Cell");
      /** Measures all original physical cell widths and boundaries. @returns Device geometry. */
      async function geometry() {
        return mounted
          .locator("tr")
          .first()
          .locator("td,th")
          .evaluateAll(
            /** Reads actual immutable table projection. @param cells - Native cell projections. @returns Rectangles. */ (
              cells,
            ) =>
              cells.map(
                /** Reads one cell. @param cell - DOM cell. @returns Physical bounds. */ (cell) => {
                  const r = cell.getBoundingClientRect();
                  return {
                    left: r.left,
                    right: r.right,
                    width: r.width,
                    top: r.top,
                    bottom: r.bottom,
                  };
                },
              ),
          );
      }
      const initial = await geometry(),
        a = initial[0],
        b = initial[1],
        c = initial[2];
      if (a === undefined || b === undefined || c === undefined)
        throw Error("Missing measured columns");
      const edges = {
        first: a.right + 20,
        second: b.right + 10,
        middleWidth: b.width - 10,
        lastWidth: c.width - 10,
        right: c.right,
      };
      const y = (a.top + a.bottom) / 2,
        x = a.right;
      await page.mouse.move(x, y);
      await expect(mounted).toHaveCSS("cursor", "col-resize");
      await page.keyboard.down("Control");
      await page.mouse.down();
      await page.mouse.move(x + 20, y);
      await expect(page.locator("[data-writer-table-column-guide]")).toBeVisible();
      expect((await geometry())[0]?.width).toBeCloseTo(a.width, 0);
      await page.keyboard.up("Control");
      await page.mouse.up();
      /** Verifies accepted source proportional placement. @returns Completion. */
      async function accepted() {
        const next = await geometry();
        expect(next[0]?.right).toBeCloseTo(edges.first, 0);
        expect(next[1]?.right).toBeCloseTo(edges.second, 0);
        expect(next[1]?.width).toBeCloseTo(edges.middleWidth, 0);
        expect(next[2]?.width).toBeCloseTo(edges.lastWidth, 0);
        expect(next[2]?.right).toBeCloseTo(edges.right, 0);
      }
      await accepted();
      await expect(paragraph).toHaveText("Cell");
      await expect(paragraph.locator("..").locator("[data-writer-list-marker]")).toHaveText("•");
      for (let cycle = 0; cycle < 3; cycle++) {
        await page.keyboard.press("Control+z");
        expect((await geometry())[0]?.width).toBeCloseTo(a.width, 0);
        await page.keyboard.press("Control+y");
        await accepted();
      }
      await page.mouse.move(a.right + 20, y);
      await page.keyboard.down("Control");
      await page.mouse.down();
      await page.mouse.move(a.right + 30, y);
      await page.keyboard.press("Escape");
      await page.keyboard.up("Control");
      await page.mouse.up();
      await accepted();
      await page.keyboard.press("Control+z");
      await page.mouse.move(x, y);
      await page.keyboard.down("Control");
      await page.mouse.down();
      await page.mouse.move(x + 20, y);
      await page.keyboard.press("Enter");
      await page.keyboard.up("Control");
      await page.mouse.up();
      await accepted();
      await paragraph.click();
      await paragraph.evaluate(
        /** Places the actual browser caret after the retained cell text. @param element - Original text host. @returns Nothing. */ (
          element,
        ) => {
          const selection = window.getSelection();
          if (selection === null) throw Error("Missing editing selection");
          const range = document.createRange();
          range.selectNodeContents(element);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        },
      );
      await page.keyboard.type("X");
      await expect(paragraph).toHaveText("CellX");
      await paragraph.press("Control+z");
      await expect(paragraph).toHaveText("Cell");
      await accepted();
    },
  );
