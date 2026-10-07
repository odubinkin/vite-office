/** @fileoverview Checks real custom bullet-face ODT persistence, Chromium fonts and body/cell glyph separation. */
import { expect, test } from "@playwright/test";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { applyWriterParagraphList } from "../src/sw/source/core/doc/list";
import { createWriterNumFormat } from "../src/sw/source/core/doc/number";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
import {
  FontItalic,
  FontWeight,
  SvxFontItem,
  SvxFontHeightItem,
  SvxPostureItem,
  SvxWeightItem,
} from "../src/editeng/source/items/textitem";
import {
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_POSTURE,
  RES_CHRATR_WEIGHT,
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CJK_FONTSIZE,
  RES_CHRATR_CJK_POSTURE,
  RES_CHRATR_CJK_WEIGHT,
  RES_CHRATR_CTL_FONT,
  RES_CHRATR_CTL_FONTSIZE,
  RES_CHRATR_CTL_POSTURE,
  RES_CHRATR_CTL_WEIGHT,
} from "../src/sw/inc/hintids";
for (const width of [1280, 390])
  test(`native bullet font ODT body cell width=${width}`, /** Checks imported actual rule/paragraph owners, marker style, real font loading, glyph gap and subsequent typing/history. @param fixtures - Browser fixtures. @param fixtures.page - Production browser. @returns Completion. */ async ({
    page,
  }) => {
    const doc = new SwDoc(),
      body = doc.paragraphs[0];
    if (body === undefined) throw Error("Missing body");
    const table = doc.GetNodes().MakeTableNode("Number font");
    table.AddColumnWidth(6000);
    for (const cell of [false, true])
      for (const [index, kind] of ["bullet", "numbered"].entries()) {
        const node = cell
          ? doc.GetNodes().AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0]
          : index === 0
            ? body
            : doc.GetNodes().MakeTextNode();
        if (node === undefined || (kind !== "bullet" && kind !== "numbered"))
          throw Error("Missing node");
        node.SetText(`${cell ? "Cell" : "Body"} ${kind} font`);
        for (const [family, height, weight, posture] of [
          [RES_CHRATR_FONT, RES_CHRATR_FONTSIZE, RES_CHRATR_WEIGHT, RES_CHRATR_POSTURE],
          [
            RES_CHRATR_CJK_FONT,
            RES_CHRATR_CJK_FONTSIZE,
            RES_CHRATR_CJK_WEIGHT,
            RES_CHRATR_CJK_POSTURE,
          ],
          [
            RES_CHRATR_CTL_FONT,
            RES_CHRATR_CTL_FONTSIZE,
            RES_CHRATR_CTL_WEIGHT,
            RES_CHRATR_CTL_POSTURE,
          ],
        ] as const) {
          node.SetAttr(new SvxFontItem("Liberation Serif", family));
          node.SetAttr(new SvxFontHeightItem(480, height));
          node.SetAttr(new SvxWeightItem(FontWeight.BOLD, weight));
          node.SetAttr(new SvxPostureItem(FontItalic.NORMAL, posture));
        }
        applyWriterParagraphList(node, {
          kind,
          level: 0,
          ruleName: `${cell ? "Cell" : "Body"}${kind}`,
        });
        const rule = node.GetNumRule();
        if (rule === undefined) throw Error("Missing rule");
        rule.Set(
          0,
          createWriterNumFormat(kind, "•", {
            bulletFont: "Liberation Mono",
            firstLineIndent: 0,
            indentAt: 720,
            listTabPosition: 720,
            positionAndSpaceMode: "label-alignment",
          }),
        );
      }
    const bytes = writeOdtDocument(doc, { title: "Number font" });
    doc.Dispose();
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles({
      buffer: Buffer.from(bytes),
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "number-font.odt",
    });
    await expect(
      page.locator("p[data-writer-node-index]").filter({ hasText: "Body bullet font" }).first(),
    ).toBeVisible();
    const loaded = await page.evaluate(
      /** Loads and checks actual requested device faces after import, rather than relying on an earlier font readiness promise. @returns Font readiness evidence. */ async () => {
        const markerFaces = await document.fonts.load('400 24pt "Liberation Mono"');
        const textFaces = await document.fonts.load('italic 700 24pt "Liberation Serif"');
        await document.fonts.ready;
        return {
          markerFaces: markerFaces.length,
          textFaces: textFaces.length,
          markerReady: document.fonts.check('400 24pt "Liberation Mono"'),
          textReady: document.fonts.check('italic 700 24pt "Liberation Serif"'),
        };
      },
    );
    expect(loaded.markerFaces).toBeGreaterThan(0);
    expect(loaded.textFaces).toBeGreaterThan(0);
    expect(loaded.markerReady && loaded.textReady).toBe(true);
    for (const scope of ["Body", "Cell"])
      for (const kind of ["bullet", "numbered"]) {
        const text = `${scope} ${kind} font`,
          paragraph = page.locator("p[data-writer-node-index]").filter({ hasText: text }).first(),
          marker = paragraph.locator("..").locator("[data-writer-list-marker]");
        await expect(marker).toHaveCSS(
          "font-family",
          kind === "bullet" ? /^"?Liberation Mono"?(,|$)/ : /^"?Liberation Serif"?(,|$)/,
        );
        await expect(marker).toHaveCSS("font-weight", kind === "bullet" ? "400" : "700");
        await expect(marker).toHaveCSS("font-style", kind === "bullet" ? "normal" : "italic");
        await expect(paragraph).toHaveCSS("font-weight", "700");
        await expect(paragraph).toHaveCSS("font-style", "italic");
        const gap = await paragraph.evaluate(
          /** Measures actual first glyph separation from the number glyph. @param element - Native text host. @returns Gap. */ (
            element,
          ) => {
            const label = element.parentElement?.querySelector("[data-writer-list-marker]"),
              textNode = document.createTreeWalker(element, NodeFilter.SHOW_TEXT).nextNode();
            if (label == null || textNode === null) throw Error("Missing glyph owners");
            const markerRange = document.createRange(),
              textRange = document.createRange();
            markerRange.selectNodeContents(label);
            textRange.setStart(textNode, 0);
            textRange.setEnd(textNode, 1);
            return (
              textRange.getBoundingClientRect().left - markerRange.getBoundingClientRect().right
            );
          },
        );
        expect(gap).toBeGreaterThanOrEqual(-0.1);
        await paragraph.focus();
        await paragraph.evaluate(
          /** Places the browser caret inside actual text before native Home transitions. @param element - Text host. @returns Nothing. */ (
            element,
          ) => {
            const node = document.createTreeWalker(element, NodeFilter.SHOW_TEXT).nextNode();
            if (node === null) throw Error("Missing text");
            window.getSelection()?.setBaseAndExtent(node, 2, node, 2);
            document.dispatchEvent(new Event("selectionchange"));
          },
        );
        await page.keyboard.press("Home");
        await page.keyboard.press("Home");
        await expect(marker.locator("[data-writer-label-caret]")).toBeVisible();
        await expect(marker).toHaveCSS("background-color", "rgb(192, 192, 192)");
        await page.keyboard.type("X");
        await expect(paragraph).toHaveText("X" + text);
        await expect(marker).toHaveCSS("font-weight", kind === "bullet" ? "400" : "700");
        await page.getByRole("button", { name: "Undo", exact: true }).click();
        await expect(paragraph).toHaveText(text);
        await page.getByRole("button", { name: "Redo", exact: true }).click();
        await expect(paragraph).toHaveText("X" + text);
      }
  });
