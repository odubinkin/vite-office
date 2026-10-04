/** @fileoverview Checks real automatic first-glyph layout independently of authored ruler/dialog values. */
import { expect, test } from "@playwright/test";
import {
  SvxFirstLineIndentItem,
  SvxTextLeftMarginItem,
} from "../src/editeng/source/items/frmitems";
import { SvxLineSpacingItem } from "../src/editeng/source/items/paraitem";
import { SvxFontHeightItem } from "../src/editeng/source/items/textitem";
import type { OdtWorkerImportResult } from "../src/sw/browser/filter/xml/odt-worker-runtime";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import {
  RES_CHRATR_CJK_FONTSIZE,
  RES_CHRATR_CTL_FONTSIZE,
  RES_CHRATR_FONTSIZE,
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_TEXTLEFT,
  RES_PARATR_LINESPACING,
} from "../src/sw/inc/hintids";
import { createWriterDocument } from "../src/sw/source/core/doc/doc";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
import { SwDocShell } from "../src/sw/source/uibase/app/docsh";
import { SwWrtShell } from "../src/sw/source/uibase/wrtsh/wrtsh1";

for (const width of [1280, 390])
  for (const disregard of [true, false]) {
    test(`Writer automatic body layout width=${width} disregard=${disregard}`, /** Checks actual glyph geometry, preserved authored values, mode history and later editing. @param fixtures - Chromium fixtures. @param testInfo - Screenshot destination. @returns Completion. */ async ({
      page,
    }, testInfo) => {
      const metadata = createDocument({
        id: "automatic-layout",
        suiteId: "writer",
        title: "Automatic layout",
      });
      const document = createWriterDocument();
      document
        .GetDocumentSettingManager()
        .set("AUTO_FIRST_LINE_INDENT_DISREGARD_LINE_SPACE", disregard);
      const shell = new SwWrtShell(new SwDocShell(document, metadata));
      shell.Insert("AutomaticBodyLayoutProof");
      shell.SetParagraphItems([
        new SvxFirstLineIndentItem(367, RES_MARGIN_FIRSTLINE, true),
        new SvxTextLeftMarginItem(487, RES_MARGIN_TEXTLEFT),
        new SvxFontHeightItem(360, RES_CHRATR_FONTSIZE),
        new SvxFontHeightItem(360, RES_CHRATR_CJK_FONTSIZE),
        new SvxFontHeightItem(360, RES_CHRATR_CTL_FONTSIZE),
        new SvxLineSpacingItem(500, RES_PARATR_LINESPACING, "fixed"),
      ]);
      shell.SplitNode();
      shell.Insert("UntouchedLayoutProof");
      shell.SetParagraphItems([
        new SvxFirstLineIndentItem(-120, RES_MARGIN_FIRSTLINE),
        new SvxFontHeightItem(240, RES_CHRATR_FONTSIZE),
        new SvxFontHeightItem(240, RES_CHRATR_CJK_FONTSIZE),
        new SvxFontHeightItem(240, RES_CHRATR_CTL_FONTSIZE),
      ]);
      const bytes = writeOdtDocument(document, metadata);
      if (!disregard) {
        // The current ODT filter omits compatibility settings. Admit the existing
        // graph setting before canonical restore; this case does not test its ODT transport.
        await page.addInitScript(
          /** Supplies only the supported compatibility boolean at the existing graph input. @returns Nothing. */ () => {
            const NativeWorker = window.Worker;
            window.Worker = /** Actual Worker fixture retaining decoding before the supported graph setting is restored. */ class extends (
              NativeWorker
            ) {
              /** Retains the actual Worker and its ODT decoding. @param args - Existing Worker arguments. @returns Nothing. */
              public constructor(...args: ConstructorParameters<typeof Worker>) {
                super(...args);
                this.addEventListener(
                  "message",
                  /** Sets the fixture flag before the canonical codec receives the graph. @param event - Actual Worker response. @returns Nothing. */ (
                    event,
                  ) => {
                    const message = event.data as {
                      type?: string;
                      payload?: OdtWorkerImportResult;
                    };
                    if (message.type === "result" && message.payload?.operation === "import") {
                      Object.defineProperty(
                        message.payload.document.document.graph.documentSettings,
                        "AUTO_FIRST_LINE_INDENT_DISREGARD_LINE_SPACE",
                        { value: false, enumerable: true, writable: true, configurable: true },
                      );
                      window.document.documentElement.dataset.automaticLayoutCompatibilityFixture =
                        "admitted";
                    }
                  },
                );
              }
            };
          },
        );
      }
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/writer");
      await page.getByRole("button", { name: "Open" }).click();
      await page.getByRole("tab", { name: "On computer" }).click();
      await page.getByLabel("Browse").setInputFiles({
        buffer: Buffer.from(bytes),
        mimeType: "application/vnd.oasis.opendocument.text",
        name: "automatic-layout.odt",
      });
      const editor = page.getByLabel("Writer document body", { exact: true });
      const paragraph = page
        .locator("[data-writer-paragraph-id]")
        .filter({ hasText: "AutomaticBodyLayoutProof" });
      const untouched = page
        .locator("[data-writer-paragraph-id]")
        .filter({ hasText: "UntouchedLayoutProof" });
      await expect(paragraph).toHaveText("AutomaticBodyLayoutProof");
      await expect(untouched).toHaveText("UntouchedLayoutProof");
      if (!disregard)
        await expect(page.locator("html")).toHaveAttribute(
          "data-automatic-layout-compatibility-fixture",
          "admitted",
        );
      const untouchedStyle = await untouched.getAttribute("style");
      const toolbar = page.getByRole("toolbar", { name: "Writer horizontal ruler" });
      const checkLayout =
        /** Checks CSS and real first-glyph bounds against an independent literal offset. @param points - Expected resolved first-line offset. @returns Completion. */ async (
          points: number,
        ) => {
          await expect
            .poll(
              /** Waits for resolved CSS after actual model formatting. @returns Pixel indent. */ async () =>
                paragraph.evaluate(
                  /** Reads the CSS device value. @param element - Rendered paragraph. @returns Pixel indent. */ (
                    element,
                  ) => Number.parseFloat(getComputedStyle(element).textIndent),
                ),
            )
            .toBeCloseTo((points * 4) / 3, 3);
          const measured = await paragraph.evaluate(
            /** Reads actual shaped first-character bounds relative to the paragraph box. @param element - Rendered Writer paragraph. @returns Pixel offset. */ (
              element,
            ) => {
              const walker = element.ownerDocument.createTreeWalker(element, NodeFilter.SHOW_TEXT);
              const first = walker.nextNode();
              if (first === null) throw new Error("First Writer glyph is missing");
              const range = element.ownerDocument.createRange();
              range.setStart(first, 0);
              range.setEnd(first, 1);
              return range.getBoundingClientRect().left - element.getBoundingClientRect().left;
            },
          );
          expect(measured).toBeCloseTo((points * 4) / 3, 1);
        };
      const automaticPoints = disregard ? 36 : 25;
      await checkLayout(automaticPoints);
      await expect(
        toolbar.getByRole("button", { name: "First line indent", exact: true }),
      ).toHaveCount(0);
      await expect(toolbar.getByRole("button", { name: "Paragraph left indent" })).toHaveCSS(
        "left",
        "152px",
      );
      await page.getByRole("button", { name: "Format", exact: true }).click();
      await page.getByRole("menuitem", { name: "Paragraph…", exact: true }).click();
      const dialog = page.getByRole("dialog", { name: "Paragraph", exact: true });
      await expect(dialog.getByLabel("First line indent (pt)")).toHaveValue("18.35");
      await expect(dialog.getByLabel("Automatic first-line indent")).toBeChecked();
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
      await checkLayout(automaticPoints);
      await page.getByRole("button", { name: "Format", exact: true }).click();
      await page.getByRole("menuitem", { name: "Paragraph…", exact: true }).click();
      await dialog.getByLabel("Automatic first-line indent").uncheck();
      await dialog.getByRole("button", { name: "OK", exact: true }).click();
      await expect(dialog).toHaveCount(0);
      await checkLayout(18.35);
      await expect(
        toolbar.getByRole("button", { name: "First line indent", exact: true }),
      ).toHaveCSS("left", "177px");
      await editor.press("Control+z");
      await checkLayout(automaticPoints);
      await expect(
        toolbar.getByRole("button", { name: "First line indent", exact: true }),
      ).toHaveCount(0);
      await editor.press("Control+Shift+z");
      await checkLayout(18.35);
      await editor.press("Control+z");
      await checkLayout(automaticPoints);
      await expect(untouched).toHaveAttribute("style", untouchedStyle as string);
      await expect(untouched).toHaveText("UntouchedLayoutProof");
      await page.screenshot({
        path: testInfo.outputPath("automatic-body-layout.png"),
        scale: "css",
        fullPage: true,
      });
      await editor.press("Control+a");
      await page.keyboard.insertText("AutomaticLayoutInputProof");
      await expect(editor).toContainText("AutomaticLayoutInputProof");
    });
  }
