/** @fileoverview Verifies production six-line border editing, independent padding and selected native history in Chromium. */
import { expect, test } from "@playwright/test";
import { selectBrowserTableRow } from "../test-support/table-mouse-e2e";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { SvxBoxItem } from "../src/editeng/source/items/frmitems";
import { RES_BOX } from "../src/sw/inc/hintids";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
for (const width of [1280, 390])
  test(
    "native empty-hit focus and keyboard selection width=" + width,
    /** Verifies actual pointer focus suppresses native auto-selection before keyboard navigation. @param fixtures - Browser fixtures. @param fixtures.page - Production page. @returns Completion. */ async ({
      page,
    }) => {
      const doc = new SwDoc(),
        table = doc.nodes.MakeTableNode("FocusBrowser", { width: 3000 });
      table.AddColumnWidth(3000);
      const cell = doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0];
      if (cell === undefined) throw Error("Missing focus owner");
      cell.SetFormat({ box: new SvxBoxItem(RES_BOX) });
      (cell.GetParagraphs()[0] as (typeof doc.paragraphs)[number]).SetText("Focus original");
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/writer");
      await page.getByRole("button", { name: "Open", exact: true }).click();
      await page.getByRole("tab", { name: "On computer" }).click();
      await page.getByLabel("Browse").setInputFiles({
        buffer: Buffer.from(writeOdtDocument(doc, { title: "Focus" })),
        mimeType: "application/vnd.oasis.opendocument.text",
        name: "focus.odt",
      });
      await page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true }).click();
      await page.getByRole("button", { name: "Table Properties", exact: true }).click();
      await page.getByRole("tab", { name: "Borders", exact: true }).click();
      const group = page.getByRole("group", { name: "User-defined borders" });
      await group.click({ position: { x: 70, y: 60 } });
      await expect(page.getByRole("button", { name: "Left border", exact: true })).toHaveAttribute(
        "aria-pressed",
        "false",
      );
      await group.press("ArrowRight");
      await expect(page.getByRole("button", { name: "Right border", exact: true })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await expect(page.getByRole("button", { name: "Right border", exact: true })).toHaveAttribute(
        "data-writer-border-state",
        "1",
      );
      await group.press(" ");
      await expect(page.getByRole("button", { name: "Right border", exact: true })).toHaveAttribute(
        "data-writer-border-state",
        "0",
      );
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(
        page.getByRole("table", { name: "FocusBrowser", exact: true }).locator("td, th"),
      ).toHaveCSS("border-right-style", "none");
    },
  );
for (const width of [1280, 390])
  test(
    "native six-line border page and selected history width=" + width,
    /** Uses real ODT ingress and pointer/widget actions on production native owners. @param fixtures - Browser fixtures. @param fixtures.page - Production page. @returns Completion. */ async ({
      page,
    }) => {
      const doc = new SwDoc(),
        table = doc.nodes.MakeTableNode("NativeBrowser", { width: 6000 });
      table.AddColumnWidth(3000);
      table.AddColumnWidth(3000);
      for (let row = 0; row < 2; row++)
        for (const [column, cell] of doc.nodes.AppendTableRow(table, 2).GetTabBoxes().entries()) {
          const box = new SvxBoxItem(RES_BOX);
          for (const edge of [0, 1, 2, 3]) box.SetDistance(100 + edge * 10, edge);
          cell.SetFormat({ box });
          (cell.GetParagraphs()[0] as (typeof doc.paragraphs)[number]).SetText(
            "Original " + row + column,
          );
        }
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/writer");
      await page.getByRole("button", { name: "Open", exact: true }).click();
      await page.getByRole("tab", { name: "On computer" }).click();
      await page.getByLabel("Browse").setInputFiles({
        buffer: Buffer.from(writeOdtDocument(doc, { title: "Native" })),
        mimeType: "application/vnd.oasis.opendocument.text",
        name: "native.odt",
      });
      const cells = page
        .getByRole("table", { name: "NativeBrowser", exact: true })
        .locator("[data-writer-table-box]");
      await expect(cells).toHaveCount(4);
      await selectBrowserTableRow(page, "NativeBrowser", 2);
      await page.getByRole("button", { name: "Table Properties", exact: true }).click();
      await page.getByRole("tab", { name: "Borders", exact: true }).click();
      await expect(page.getByRole("checkbox", { name: "Synchronize" })).not.toBeChecked();
      await page
        .getByRole("button", { name: "Outer Border and All Inner Lines", exact: true })
        .click();
      await page.getByRole("spinbutton", { name: "Top padding (cm)" }).fill("0.3");
      await page.getByRole("button", { name: "Reset", exact: true }).click();
      await expect(page.getByRole("button", { name: "Top border", exact: true })).toHaveAttribute(
        "data-writer-border-state",
        "1",
      );
      await expect(page.getByRole("spinbutton", { name: "Top padding (cm)" })).toHaveValue("0.18");
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(cells.nth(2)).toHaveCSS("padding-top", "6.66667px");
      await page.getByRole("button", { name: "Table Properties", exact: true }).click();
      await page.getByRole("tab", { name: "Borders", exact: true }).click();
      await page
        .getByRole("button", { name: "Outer Border and All Inner Lines", exact: true })
        .click();
      await page.getByRole("combobox", { name: "Border line style" }).selectOption("2");
      await page.getByRole("combobox", { name: "Border thickness" }).selectOption("225");
      await page.getByLabel("Border line color", { exact: true }).fill("#abcdef");
      await page
        .getByRole("button", { name: "Top border", exact: true })
        .click({ position: { x: 24, y: 8 } });
      await expect(page.getByRole("button", { name: "Top border", exact: true })).toHaveAttribute(
        "data-writer-border-state",
        "2",
      );
      await page
        .getByRole("button", { name: "Top border", exact: true })
        .click({ position: { x: 24, y: 8 } });
      await expect(page.getByRole("button", { name: "Top border", exact: true })).toHaveAttribute(
        "data-writer-border-state",
        "1",
      );
      await page
        .getByRole("button", { name: "Top border", exact: true })
        .click({ position: { x: 24, y: 8 } });
      await page.getByRole("combobox", { name: "Border line style" }).selectOption("1");
      await page.getByRole("spinbutton", { name: "Top padding (cm)" }).fill("0.3");
      await page.getByRole("button", { name: "OK", exact: true }).click();
      await expect(cells.nth(0)).toHaveCSS("border-top-style", "none");
      await expect(cells.nth(2)).toHaveCSS("border-top-style", "dotted");
      await expect(cells.nth(2)).toHaveCSS("border-left-style", "dashed");
      await expect(cells.nth(2)).toHaveCSS("border-right-style", "none");
      await expect(cells.nth(3)).toHaveCSS("border-left-style", "dashed");
      await expect(cells.nth(2)).toHaveCSS("border-top-color", "rgb(171, 205, 239)");
      await expect(cells.nth(2)).toHaveCSS("padding-top", "11.3333px");
      await expect(cells.nth(2)).toHaveCSS("padding-left", "8px");
      for (let cycle = 0; cycle < 3; cycle++) {
        await page.getByRole("button", { name: "Undo", exact: true }).click();
        await expect(cells.nth(2)).toHaveCSS("border-top-style", "none");
        await expect(cells.nth(2)).toHaveCSS("padding-top", "6.66667px");
        await page.getByRole("button", { name: "Redo", exact: true }).click();
        await expect(cells.nth(2)).toHaveCSS("border-top-style", "dotted");
        await expect(cells.nth(3)).toHaveCSS("border-left-style", "dashed");
      }
      const paragraph = page.getByRole("textbox", {
        name: "Row 2 column 1 paragraph 1",
        exact: true,
      });
      await paragraph.click();
      await paragraph.press("End");
      await paragraph.pressSequentially("!");
      await expect(paragraph).toHaveText("Original 10!");
    },
  );
