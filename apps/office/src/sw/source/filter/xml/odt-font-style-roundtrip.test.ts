/** @fileoverview Verifies complete Writer style and font ODT round-trip compatibility. */

import { describe, expect, it } from "vitest";

import { SvxFontItem } from "../../../../editeng/source/items/textitem";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT, RES_CHRATR_FONT } from "../../../inc/hintids";
import { getWriterOdfStyleName, WRITER_PARAGRAPH_STYLE_POOL } from "../../../inc/poolfmt";
import { createWriterDocument } from "../../core/doc/writer";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

describe("Writer ODT font and style compatibility", /** Groups file compatibility tests. @returns Nothing. */ () => {
  it("round-trips the complete LibreOffice paragraph-style hierarchy and font-face references", /** Verifies open-save-reopen semantics. @returns Nothing. */ async () => {
    const writer = createWriterDocument("all-styles");
    for (const style of WRITER_PARAGRAPH_STYLE_POOL) writer.GetTextFormatColl(style.id);
    const textBody = writer.GetTextFormatColl("text-body");
    for (const which of [RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT])
      textBody.SetFormatAttr(new SvxFontItem("Source Serif 4", which));
    const paragraph = writer.paragraphs[0];
    paragraph?.ChgFormatColl(writer.GetTextFormatColl("numbering-1-cont"));
    for (const which of [RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT])
      paragraph?.SetAttr(new SvxFontItem("Paragraph Serif", which));
    paragraph?.ReplaceRange(0, 0, [
      {
        attributes: {
          bold: false,
          fontFamily: "Noto Sans",
          italic: false,
          underline: false,
        },
        text: "font round trip",
      },
    ]);

    const state = createDocument({ id: "odt-all", suiteId: "writer", title: "All styles" });
    const firstBytes = writeOdtDocument(writer, state);
    const firstArchive = new ZipFile(firstBytes);
    const stylesXml = await firstArchive.readTextEntry("styles.xml");
    const contentXml = await firstArchive.readTextEntry("content.xml");
    expect(stylesXml).toContain(
      '<style:font-face style:name="Source Serif 4" svg:font-family="&apos;Source Serif 4&apos;"/>',
    );
    expect(contentXml).toContain(
      '<style:font-face style:name="Noto Sans" svg:font-family="&apos;Noto Sans&apos;"/>',
    );
    expect(contentXml).toContain('style:parent-style-name="Numbering_20_1_20_Cont."');
    for (const style of WRITER_PARAGRAPH_STYLE_POOL) {
      const name = getWriterOdfStyleName(style.id);
      const start = stylesXml.indexOf(`<style:style style:name="${name}"`);
      expect(start, name).toBeGreaterThanOrEqual(0);
      const openingTag = stylesXml.slice(start, stylesXml.indexOf(">", start) + 1);
      if (style.parentId === undefined) expect(openingTag).not.toContain("style:parent-style-name");
      else
        expect(openingTag).toContain(
          `style:parent-style-name="${getWriterOdfStyleName(style.parentId)}"`,
        );
      if (style.followId === style.id) expect(openingTag).not.toContain("style:next-style-name");
      else
        expect(openingTag).toContain(
          `style:next-style-name="${getWriterOdfStyleName(style.followId)}"`,
        );
    }

    const opened = await readOdtDocument(firstBytes, state);
    expect(opened.document.GetTextFormatColls()).toHaveLength(126);
    expect(
      (
        opened.document
          .GetTextFormatColl("text-body")
          .GetAttrSet()
          .GetItemIfSet(RES_CHRATR_FONT, false) as SvxFontItem
      ).GetFamilyName(),
    ).toBe("Source Serif 4");
    expect(opened.document.paragraphs[0]?.style).toBe("numbering-1-cont");
    expect(opened.document.paragraphs[0]?.runs[0]?.attributes.fontFamily).toBe("Noto Sans");

    const reopened = await readOdtDocument(
      writeOdtDocument(opened.document, opened.documentState),
      state,
    );
    const projectStyles =
      /** Projects file-relevant style state. @param document - Writer snapshot. @returns Comparable styles. */ (
        document: ReturnType<typeof opened.document.toSnapshot>,
      ) =>
        document.textFormatCollections.map(
          /** Projects one style. @param style - Snapshot style. @returns Comparable style. */ (
            style,
          ) => ({
            followId: style.followId,
            id: style.id,
            items: style.items,
            parentId: style.parentId,
          }),
        );
    expect(projectStyles(reopened.document.toSnapshot())).toEqual(
      projectStyles(opened.document.toSnapshot()),
    );
    expect(reopened.document.paragraphs[0]?.style).toBe("numbering-1-cont");
    expect(reopened.document.paragraphs[0]?.runs[0]?.attributes.fontFamily).toBe("Noto Sans");
  });
});
