/** @fileoverview Measures glyph/label separation in production body and table-cell lists. */
import { expect, test, type Locator } from "@playwright/test";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import { createWriterDocument } from "../src/sw/source/core/doc/doc";
import { createWriterNumFormat } from "../src/sw/source/core/doc/number";
import { SwDocShell } from "../src/sw/source/uibase/app/docsh";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
import { SvxFontHeightItem } from "../src/editeng/source/items/textitem";
import {
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_CJK_FONTSIZE,
  RES_CHRATR_CTL_FONTSIZE,
} from "../src/sw/inc/hintids";
/** Reads actual label and text glyph rectangles, including wrapped lines. @param paragraph - Mounted immutable paragraph host. @returns Device geometry. */
async function geometry(paragraph: Locator) {
  return paragraph.evaluate(
    /** Measures browser ranges without accessing the model. @param p - Text host. @returns Glyph edges and flow geometry. */ (
      p,
    ) => {
      const label = p.parentElement?.querySelector("[data-writer-list-marker]");
      if (label === null || label === undefined || p.firstChild === null)
        throw new Error("Missing label/text");
      const markerRange = document.createRange(),
        textRange = document.createRange();
      markerRange.selectNodeContents(label);
      textRange.setStart(p.firstChild, 0);
      textRange.setEnd(p.firstChild, 1);
      const marker = markerRange.getBoundingClientRect(),
        first = textRange.getBoundingClientRect();
      const wholeText = document.createRange();
      wholeText.selectNodeContents(p);
      const lines = Array.from(wholeText.getClientRects());
      const lineLefts = new Map<number, number>();
      for (const rect of lines)
        lineLefts.set(rect.top, Math.min(lineLefts.get(rect.top) ?? Infinity, rect.left));
      return {
        markerRight: marker.right,
        textLeft: first.left,
        gap: first.left - marker.right,
        slot: label.getBoundingClientRect().width,
        labelWidth: marker.width,
        padding: parseFloat(getComputedStyle(label).paddingInlineEnd),
        lineTops: [
          ...new Set(
            lines.map(
              /** Reads a line top. @param r - Device rectangle. @returns Vertical coordinate. */ (
                r,
              ) => r.top,
            ),
          ),
        ],
        lineLefts: [...lineLefts.values()],
      };
    },
  );
}
for (const width of [1280, 390])
  for (const cell of [false, true])
    test(`Writer native label width prevents overlap width=${width} cell=${cell}`, /** Checks imported rules, glyph geometry, wrapping and editing/history on real Chromium. @param fixtures - Browser fixtures. @param fixtures.page - Production page. @returns Completion. */ async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      const doc = createWriterDocument(),
        body = doc.paragraphs[0];
      if (body === undefined) throw new Error("Missing body");
      const table = cell ? doc.nodes.MakeTableNode("LabelWidth", {}, body) : undefined;
      table?.AddColumnWidth(6000);
      const profiles = [
        { name: "Collapsed", slot: 0, font: 36, level: 0, legacy: false, numbered: false },
        { name: "Narrow", slot: 40, font: 36, level: 0, legacy: false, numbered: false },
        { name: "Normal", slot: 360, font: 12, level: 0, legacy: false, numbered: false },
        { name: "Nested", slot: 0, font: 36, level: 2, legacy: false, numbered: false },
        { name: "Legacy", slot: 0, font: 36, level: 0, legacy: true, numbered: false },
        { name: "Numbered", slot: 0, font: 36, level: 0, legacy: false, numbered: true },
        { name: "Wrapped", slot: 0, font: 12, level: 0, legacy: false, numbered: false },
      ];
      for (const [index, profile] of profiles.entries()) {
        const node =
          table === undefined
            ? index === 0
              ? body
              : doc.nodes.MakeTextNode()
            : doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0];
        if (node === undefined) throw new Error("Missing list owner");
        const text =
          profile.name === "Wrapped"
            ? "WrappedProof " + "list text wraps beyond its label ".repeat(10)
            : profile.name + "Proof";
        node.SetText(text);
        node.SetAttr(new SvxFontHeightItem(profile.font * 20, RES_CHRATR_FONTSIZE));
        node.SetAttr(new SvxFontHeightItem(profile.font * 20, RES_CHRATR_CJK_FONTSIZE));
        node.SetAttr(new SvxFontHeightItem(profile.font * 20, RES_CHRATR_CTL_FONTSIZE));
        const kind = profile.numbered ? "numbered" : "bullet",
          rule = doc.EnsureNumRule(profile.name, kind),
          indent = 720 + profile.level * 360;
        rule.Set(
          profile.level,
          createWriterNumFormat(kind, "•", {
            positionAndSpaceMode: profile.legacy ? "label-width-and-position" : "label-alignment",
            indentAt: indent,
            firstLineIndent: -profile.slot,
            listTabPosition: indent,
            absLSpace: indent,
            firstLineOffset: 0,
            charTextDistance: 216,
            labelFollowedBy: "listtab",
            suffix: profile.numbered ? "." : "",
          }),
        );
        node.SetNumRule(profile.name);
        node.SetAttrListLevel(profile.level);
        node.AddToList();
      }
      const meta = createDocument({ id: "label-width", suiteId: "writer", title: "Label width" }),
        shell = new SwDocShell(doc, meta),
        bytes = writeOdtDocument(doc, meta);
      shell.Close();
      await page.goto("/writer");
      await page.getByRole("button", { name: "Open", exact: true }).click();
      await page.getByRole("tab", { name: "On computer" }).click();
      await page.getByLabel("Browse").setInputFiles({
        buffer: Buffer.from(bytes),
        mimeType: "application/vnd.oasis.opendocument.text",
        name: "label-width.odt",
      });
      for (const profile of profiles) {
        const paragraph = page
          .locator("[data-writer-paragraph-id]")
          .filter({ hasText: profile.name + "Proof" });
        await expect(paragraph).toHaveCount(1);
        const measured = await geometry(paragraph);
        expect(measured.labelWidth).toBeGreaterThan(0);
        expect(measured.gap).toBeGreaterThanOrEqual(-0.1);
        expect(measured.slot).toBeGreaterThanOrEqual(measured.labelWidth + measured.padding - 0.1);
        if (profile.name === "Normal") expect(measured.slot).toBeCloseTo(24, 1);
        if (profile.legacy) expect(measured.gap).toBeGreaterThanOrEqual(14.3);
        if (profile.name === "Wrapped") {
          expect(measured.lineTops.length).toBeGreaterThan(1);
          expect(Math.max(...measured.lineLefts) - Math.min(...measured.lineLefts)).toBeLessThan(
            0.1,
          );
        }
      }
      const editable = page
        .locator("[data-writer-paragraph-id]")
        .filter({ hasText: "CollapsedProof" });
      await editable.click();
      await editable.evaluate(
        /** Places the browser caret at the item end independently of platform End-key semantics. @param p - Editable text host. @returns Nothing. */ (
          p,
        ) => {
          const selection = window.getSelection();
          if (selection === null) throw new Error("Missing browser selection");
          const range = document.createRange();
          range.selectNodeContents(p);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        },
      );
      await page.keyboard.type("!");
      await expect(editable).toHaveText("CollapsedProof!");
      expect((await geometry(editable)).gap).toBeGreaterThanOrEqual(-0.1);
      for (let cycle = 0; cycle < 3; cycle++) {
        await editable.press("Control+z");
        await expect(editable).toHaveText("CollapsedProof");
        await editable.press("Control+y");
        await expect(editable).toHaveText("CollapsedProof!");
        expect((await geometry(editable)).gap).toBeGreaterThanOrEqual(-0.1);
      }
    });
