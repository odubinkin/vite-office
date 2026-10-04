/** @fileoverview Checks native manual offset wrapping in the real browser without rewriting authored ODT values. */
import { expect, test } from "@playwright/test";
import {
  SvxFirstLineIndentItem,
  SvxTextLeftMarginItem,
} from "../src/editeng/source/items/frmitems";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import { RES_MARGIN_FIRSTLINE, RES_MARGIN_TEXTLEFT } from "../src/sw/inc/hintids";
import { createWriterDocument } from "../src/sw/source/core/doc/doc";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
import { SwDocShell } from "../src/sw/source/uibase/app/docsh";
import { SwWrtShell } from "../src/sw/source/uibase/wrtsh/wrtsh1";

for (const width of [1280, 390])
  for (const raw of [65537, -65537])
    test(`Writer manual signed-short layout width=${width} raw=${raw}`, /** Checks glyph placement, authored dialog and mode history through the real product ODT boundary. @param fixtures - Chromium page. @param testInfo - Screenshot destination. @returns Completion. */ async ({
      page,
    }, testInfo) => {
      const metadata = createDocument({
        id: "manual-layout",
        suiteId: "writer",
        title: "Manual layout",
      });
      const document = createWriterDocument();
      const shell = new SwWrtShell(new SwDocShell(document, metadata));
      shell.Insert("ManualBoundaryLayoutProof");
      shell.SetParagraphItems([
        new SvxFirstLineIndentItem(raw, RES_MARGIN_FIRSTLINE),
        new SvxTextLeftMarginItem(487, RES_MARGIN_TEXTLEFT),
      ]);
      shell.SplitNode();
      shell.Insert("UntouchedBoundaryProof");
      shell.SetParagraphItems([new SvxFirstLineIndentItem(120, RES_MARGIN_FIRSTLINE)]);
      const bytes = writeOdtDocument(document, metadata);
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/writer");
      await page.getByRole("button", { name: "Open", exact: true }).click();
      await page.getByRole("tab", { name: "On computer" }).click();
      await page.getByLabel("Browse").setInputFiles({
        buffer: Buffer.from(bytes),
        mimeType: "application/vnd.oasis.opendocument.text",
        name: "manual-boundary.odt",
      });
      const editor = page.getByLabel("Writer document body", { exact: true });
      const paragraph = page
        .locator("[data-writer-paragraph-id]")
        .filter({ hasText: "ManualBoundaryLayoutProof" });
      const untouched = page
        .locator("[data-writer-paragraph-id]")
        .filter({ hasText: "UntouchedBoundaryProof" });
      await expect(paragraph).toHaveText("ManualBoundaryLayoutProof");
      await expect(untouched).toHaveText("UntouchedBoundaryProof");
      const untouchedStyle = await untouched.getAttribute("style");
      const checkLayout =
        /** Checks actual first-glyph bounds and CSS against independent literal placement. @param points - Layout offset. @returns Completion. */ async (
          points: number,
        ) => {
          await expect
            .poll(
              /** Reads resolved browser CSS. @returns Offset in pixels. */ async () =>
                paragraph.evaluate(
                  /** Reads layout CSS. @param element - Paragraph. @returns Pixel offset. */ (
                    element,
                  ) => Number.parseFloat(getComputedStyle(element).textIndent),
                ),
            )
            .toBeCloseTo((points * 4) / 3, 3);
          const glyph = await paragraph.evaluate(
            /** Reads shaped first-glyph geometry relative to the paragraph box. @param element - Rendered paragraph. @returns Pixel offset. */ (
              element,
            ) => {
              const walker = element.ownerDocument.createTreeWalker(element, NodeFilter.SHOW_TEXT);
              const first = walker.nextNode();
              if (first === null) throw new Error("Manual first glyph is missing");
              const range = element.ownerDocument.createRange();
              range.setStart(first, 0);
              range.setEnd(first, 1);
              return range.getBoundingClientRect().left - element.getBoundingClientRect().left;
            },
          );
          expect(glyph).toBeCloseTo((points * 4) / 3, 1);
        };
      const wrappedPoints = raw > 0 ? 0.05 : -0.05;
      await checkLayout(wrappedPoints);
      const ruler = page.getByRole("toolbar", { name: "Writer horizontal ruler" });
      const firstMarker = ruler.getByRole("button", { name: "First line indent", exact: true });
      await expect(firstMarker).toHaveCount(1);
      const rawMarkerPosition = await firstMarker.getAttribute("style");
      await page.getByRole("button", { name: "Format", exact: true }).click();
      await page.getByRole("menuitem", { name: "Paragraph…", exact: true }).click();
      const dialog = page.getByRole("dialog", { name: "Paragraph", exact: true });
      await expect(dialog.getByLabel("First line indent (pt)")).toHaveValue(String(raw / 20));
      await expect(dialog.getByLabel("Automatic first-line indent")).not.toBeChecked();
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
      await checkLayout(wrappedPoints);
      await page.getByRole("button", { name: "Format", exact: true }).click();
      await page.getByRole("menuitem", { name: "Paragraph…", exact: true }).click();
      // The existing authoring command admits signed16 values only. Choose
      // a valid new draft; Undo must restore the complete imported raw item.
      await dialog.getByLabel("First line indent (pt)").fill("1");
      await dialog.getByLabel("Automatic first-line indent").check();
      await dialog.getByRole("button", { name: "OK", exact: true }).click();
      await expect(dialog).toHaveCount(0);
      await checkLayout(24);
      await expect(firstMarker).toHaveCount(0);
      await editor.press("Control+z");
      await checkLayout(wrappedPoints);
      await expect(firstMarker).toHaveAttribute("style", rawMarkerPosition as string);
      await editor.press("Control+Shift+z");
      await checkLayout(24);
      await editor.press("Control+z");
      await checkLayout(wrappedPoints);
      await expect(untouched).toHaveAttribute("style", untouchedStyle as string);
      await expect(untouched).toHaveText("UntouchedBoundaryProof");
      await page.screenshot({
        path: testInfo.outputPath("manual-body-layout.png"),
        scale: "css",
        fullPage: true,
      });
      await editor.press("Control+a");
      await page.keyboard.insertText("ManualBoundaryInputProof");
      await expect(editor).toContainText("ManualBoundaryInputProof");
    });
