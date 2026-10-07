/** @fileoverview Measures native next-tab separation after occupied bullet glyphs in real production body/cell lists. */
import { expect, test } from "@playwright/test";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import { createWriterDocument } from "../src/sw/source/core/doc/doc";
import { createWriterNumFormat } from "../src/sw/source/core/doc/number";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
import { SvxFontHeightItem } from "../src/editeng/source/items/textitem";
import { SvxTabAdjust, SvxTabStop, SvxTabStopItem } from "../src/editeng/source/items/paraitem";
import {
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_CJK_FONTSIZE,
  RES_CHRATR_CTL_FONTSIZE,
  RES_PARATR_TABSTOP,
} from "../src/sw/inc/hintids";
for (const width of [1280, 390])
  for (const cell of [false, true])
    test(`Writer exhausted bullet tab keeps native text gap width=${width} cell=${cell}`, /** Checks independent target positions, glyph ranges, typing and history on the real product. @param fixtures - Browser context. @param fixtures.page - Production page. @returns Completion. */ async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      const doc = createWriterDocument(),
        body = doc.paragraphs[0];
      if (body === undefined) throw Error("Missing body");
      const table = cell ? doc.nodes.MakeTableNode("ExhaustedTab", {}, body) : undefined;
      table?.AddColumnWidth(6000);
      const profiles = [
        { name: "CollapsedTab", offset: 0, font: 36, explicit: false, expectedSlot: 75.6 },
        { name: "NarrowTab", offset: -20, font: 36, explicit: false, expectedSlot: 1154 / 15 },
        { name: "ExplicitTab", offset: 0, font: 36, explicit: true, expectedSlot: 24 },
        { name: "NormalTab", offset: -360, font: 12, explicit: false, expectedSlot: 24 },
      ];
      for (const [index, profile] of profiles.entries()) {
        const node =
          table === undefined
            ? index === 0
              ? body
              : doc.nodes.MakeTextNode()
            : doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0];
        if (node === undefined) throw Error("Missing item");
        node.SetText(profile.name + "Proof");
        for (const which of [RES_CHRATR_FONTSIZE, RES_CHRATR_CJK_FONTSIZE, RES_CHRATR_CTL_FONTSIZE])
          node.SetAttr(new SvxFontHeightItem(profile.font * 20, which));
        if (profile.explicit)
          node.SetAttr(
            SvxTabStopItem.FromStops(RES_PARATR_TABSTOP, [new SvxTabStop(360, SvxTabAdjust.Left)]),
          );
        const rule = doc.EnsureNumRule(profile.name, "bullet");
        rule.Set(
          0,
          createWriterNumFormat("bullet", "•", {
            positionAndSpaceMode: "label-alignment",
            indentAt: 720,
            firstLineIndent: profile.offset,
            listTabPosition: 720,
            labelFollowedBy: "listtab",
          }),
        );
        node.SetNumRule(profile.name);
        node.AddToList();
      }
      const bytes = writeOdtDocument(
        doc,
        createDocument({ id: "exhausted-tab", suiteId: "writer", title: "Exhausted tab" }),
      );
      doc.Dispose();
      await page.goto("/writer");
      await page.getByRole("button", { name: "Open", exact: true }).click();
      await page.getByRole("tab", { name: "On computer" }).click();
      await page.getByLabel("Browse").setInputFiles({
        buffer: Buffer.from(bytes),
        mimeType: "application/vnd.oasis.opendocument.text",
        name: "exhausted-tab.odt",
      });
      for (const profile of profiles) {
        const paragraph = page
          .locator("[data-writer-paragraph-id]")
          .filter({ hasText: profile.name + "Proof" });
        await expect(paragraph).toHaveCount(1);
        await expect
          .poll(
            /** Reads actual logical slot, normalized for device transforms. @returns Slot width in CSS px. */ async () =>
              paragraph.evaluate(
                /** Measures occupied glyph and native text start. @param p - Editable paragraph. @returns Device geometry. */
                (p) => {
                  const marker = p.parentElement?.querySelector<HTMLElement>(
                      "[data-writer-list-marker]",
                    ),
                    glyph = marker?.querySelector("[data-writer-list-label]");
                  if (marker == null || glyph == null) throw Error("Missing label");
                  return parseFloat(getComputedStyle(marker).width);
                },
              ),
          )
          .toBeCloseTo(profile.expectedSlot, 1);
        const gap = await paragraph.evaluate(
          /** Checks the first text glyph clears the measured bullet. @param p - Editable text owner. @returns CSS gap normalized to layout units. */
          (p) => {
            const marker = p.parentElement?.querySelector<HTMLElement>("[data-writer-list-marker]"),
              glyph = marker?.querySelector("[data-writer-list-label]");
            if (marker == null || glyph == null || p.firstChild === null)
              throw Error("Missing label/text");
            const range = document.createRange();
            range.setStart(p.firstChild, 0);
            range.setEnd(p.firstChild, 1);
            const scale =
              marker.getBoundingClientRect().width / parseFloat(getComputedStyle(marker).width);
            return (
              (range.getBoundingClientRect().left - glyph.getBoundingClientRect().right) / scale
            );
          },
        );
        expect(gap).toBeGreaterThan(2);
      }
      const text = page
        .locator("[data-writer-paragraph-id]")
        .filter({ hasText: "CollapsedTabProof" });
      await text.click();
      await text.evaluate(
        /** Places caret at actual text end. @param p - Editable owner. @returns Nothing. */ (
          p,
        ) => {
          const range = document.createRange();
          range.selectNodeContents(p);
          range.collapse(false);
          const selection = window.getSelection();
          if (selection === null) throw Error("Missing selection");
          selection.removeAllRanges();
          selection.addRange(range);
        },
      );
      await page.keyboard.type("!");
      await expect(text).toHaveText("CollapsedTabProof!");
      await text.press("Control+z");
      await expect(text).toHaveText("CollapsedTabProof");
      await text.press("Control+y");
      await expect(text).toHaveText("CollapsedTabProof!");
    });
