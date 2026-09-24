/** @fileoverview Verifies ODT layout attributes used by LibreOffice Writer. */
/* eslint-disable @typescript-eslint/no-non-null-assertion -- Test fixture documents provide the first paragraph. */

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

import { SvxLineSpacingItem, SvxULSpaceItem } from "../../../../editeng/source/items/paraitem";
import { SvxFontHeightItem } from "../../../../editeng/source/items/textitem";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { RES_CHRATR_FONTSIZE, RES_PARATR_LINESPACING, RES_UL_SPACE } from "../../../inc/hintids";
import { exportContentXml } from "./xmlexp";
import { importWriterXml } from "./xmlimp";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";
import { projectSwTextPrintBounds } from "../../core/layout/newfrm";
import { WriterViewProjection } from "../../../browser/presentation/writer-view-projection";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";

const namespaces = `xmlns:office="${ODF_NAMESPACES.office}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:fo="${ODF_NAMESPACES.fo}"`;
const metadata = createDocument({ id: "odt-layout", suiteId: "writer", title: "Layout" });

/** Wraps named styles in a minimal Writer styles stream. @param definitions - ODF style children. @returns XML. */
function styles(definitions: string): string {
  return `<office:document-styles ${namespaces}><office:styles>${definitions}<style:style style:name="Standard" style:family="paragraph"/></office:styles></office:document-styles>`;
}

/** Wraps list styles and body paragraphs in a Writer content stream. @param automaticStyles - ODF automatic styles. @param body - Body XML. @returns XML. */
function content(automaticStyles: string, body: string): string {
  return `<office:document-content ${namespaces}><office:automatic-styles>${automaticStyles}</office:automatic-styles><office:body><office:text>${body}</office:text></office:body></office:document-content>`;
}

describe("Writer ODT layout parity", /** Groups ODT layout regressions. @returns Nothing. */ () => {
  it("preserves tdf114287 exact print bounds across ODT export", /** Mirrors upstream list and paragraph geometry assertions. @returns Completion after ODT reopen. */ async () => {
    const warning = vi
      .spyOn(console, "warn")
      .mockImplementation(
        /** Suppresses diagnostics for unrelated fixture properties. @returns Nothing. */ () =>
          undefined,
      );
    try {
      const file = path.resolve("src/sw/qa/extras/odfexport/data/tdf114287.odt");
      const bytes = new Uint8Array(fs.readFileSync(file));
      const imported = await readOdtDocument(bytes, metadata);
      /** Checks upstream numbering, paragraph, and print metrics. @param document - Imported Writer graph. @returns Nothing. */
      function assertGeometry(document: typeof imported.document): void {
        const [second, ninth, sixteenth] = [1, 8, 15].map(
          /** Selects one upstream one-based paragraph. @param index - Zero-based index. @returns Text node. */ (
            index,
          ) => document.paragraphs[index],
        );
        if (second === undefined || ninth === undefined || sixteenth === undefined)
          throw new Error("tdf114287 fixture has fewer than 16 paragraphs");
        const format = second.GetNumRule()?.GetNumFormat(0);
        const mm100 =
          /** Converts Writer twips to hundredths of a millimetre. @param twips - Writer length. @returns mm100 length. */ (
            twips: number,
          ) => Math.round((twips * 2540) / 1440);
        expect(mm100(format?.GetFirstLineIndent() ?? 0)).toBe(-700);
        expect(mm100(format?.GetIndentAt() ?? 0)).toBe(1330);
        expect(ninth.GetNumRuleName()).toBe(second.GetNumRuleName());
        expect(sixteenth.GetNumRuleName()).toBe(second.GetNumRuleName());
        for (const paragraph of [second, ninth, sixteenth]) {
          expect(mm100(paragraph.GetParagraphFirstLineIndent())).toBe(-1000);
          expect(mm100(paragraph.GetParagraphTextLeftMargin())).toBe(5001);
          expect(mm100(paragraph.GetParagraphRightMargin())).toBe(0);
        }
        const page = document.GetPageDesc().GetValue();
        expect(projectSwTextPrintBounds(second, page)).toEqual({ left: 2268, right: 11339 });
        expect(projectSwTextPrintBounds(ninth, page)).toEqual({ left: 2268, right: 11339 });
        expect(projectSwTextPrintBounds(sixteenth, page)).toEqual({ left: 357, right: 11339 });
      }
      assertGeometry(imported.document);
      const sixteenth = imported.document.paragraphs[15];
      if (sixteenth === undefined) throw new Error("tdf114287 fixture has no sixteenth paragraph");
      const view = new WriterViewProjection().Project(
        imported.document,
        sixteenth,
        new SwPaM(new SwPosition(sixteenth, 0)),
        metadata,
      );
      expect(view.paragraphs[15]?.listGeometryWins).toBe(true);
      assertGeometry(decodeWriterDocument(encodeWriterDocument(imported.document)));
      const reopened = await readOdtDocument(
        writeOdtDocument(imported.document, { title: imported.title }),
        metadata,
      );
      assertGeometry(reopened.document);
    } finally {
      warning.mockRestore();
    }
  });

  it("applies paragraph default style before named style overrides", /** Verifies shared defaults reach canonical paragraph items. @returns Nothing. */ () => {
    const definitions =
      '<style:default-style style:family="paragraph"><style:paragraph-properties fo:line-height="140%"/><style:text-properties fo:font-size="12pt"/></style:default-style>';
    const document = importWriterXml(
      styles(definitions),
      content("", "<text:p>Default</text:p>"),
      metadata,
    ).document;
    const node = document.paragraphs[0];
    expect((node?.GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem).GetPropLineSpace()).toBe(
      140,
    );
    expect((node?.GetAttr(RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight()).toBe(240);
  });

  it("inherits default alignment and margin into the Standard paragraph style", /** Checks inherits default alignment and margin into the Standard paragraph style. @returns Test callback result. */ () => {
    const definitions =
      '<style:default-style style:family="paragraph"><style:paragraph-properties fo:text-align="center" fo:margin-left="0.5in"/></style:default-style>';
    const document = importWriterXml(
      styles(definitions),
      content("", "<text:p>Default</text:p>"),
      metadata,
    ).document;
    expect(document.paragraphs[0]?.GetParagraphAlignment()).toBe("center");
    expect(document.paragraphs[0]?.GetParagraphTextLeftMargin()).toBe(720);
  });

  it("retains certification-style spacing and inherited paragraph deltas", /** Reproduces the supplied document's style metrics without copying its content. @returns Nothing. */ () => {
    const definitions =
      '<style:style style:name="Base" style:family="paragraph" style:parent-style-name="Standard"><style:paragraph-properties fo:text-align="center" fo:margin-left="0.5in" fo:margin-top="0.1665in" fo:line-height="100%"/></style:style><style:style style:name="Child" style:family="paragraph" style:parent-style-name="Base"><style:paragraph-properties fo:margin-bottom="0.1665in" style:contextual-spacing="false"/></style:style>';
    const document = importWriterXml(
      styles(definitions),
      content("", '<text:p text:style-name="Child">Body</text:p>'),
      metadata,
    ).document;
    const node = document.paragraphs[0]!;
    const spacing = node.GetAttr(RES_UL_SPACE) as SvxULSpaceItem;
    expect(spacing.GetUpper()).toBe(240);
    expect(spacing.GetLower()).toBe(240);
    expect(spacing.GetContext()).toBe(false);
    expect(node.GetParagraphAlignment()).toBe("center");
    expect(node.GetParagraphTextLeftMargin()).toBe(720);
    expect((node.GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem).GetPropLineSpace()).toBe(
      100,
    );
    const exported = exportContentXml(document);
    expect(exported).toContain('style:contextual-spacing="false"');
  });

  it("imports and exports fixed, minimum, and extra line spacing", /** Checks upstream ODF line-spacing modes and font-independent round trips. @returns Nothing. */ () => {
    const modes = [
      ['fo:line-height="0.25in"', "fixed", 360],
      ['style:line-height-at-least="0.3in"', "minimum", 432],
      ['style:line-spacing="0.1in"', "leading", 144],
    ] as const;
    for (const [attribute, mode, value] of modes) {
      const automatic = `<style:style style:name="P" style:family="paragraph" style:parent-style-name="Standard"><style:paragraph-properties ${attribute} style:font-independent-line-spacing="true"/></style:style>`;
      const source = importWriterXml(
        styles(""),
        content(automatic, '<text:p text:style-name="P">Line</text:p>'),
        metadata,
      ).document;
      const line = source.paragraphs[0]!.GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem;
      expect(line.GetMode()).toBe(mode);
      expect(line.GetValue()).toBe(value);
      expect(line.IsFontIndependent()).toBe(true);
      const exported = exportContentXml(source);
      expect(exported).toContain(`${attribute.split("=")[0]}=`);
      const reopened = importWriterXml(styles(""), exported, metadata).document;
      expect(
        (reopened.paragraphs[0]!.GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem).GetMode(),
      ).toBe(mode);
    }
  });

  it("rejects contradictory ODF line-spacing modes", /** Ensures one Writer item receives only one mode. @returns Nothing. */ () => {
    const conflicting =
      '<style:style style:name="P" style:family="paragraph"><style:paragraph-properties fo:line-height="120%" style:line-spacing="0.1in"/></style:style>';
    expect(
      /** Rejects conflicting style modes. @returns Invalid import. */ () =>
        importWriterXml(
          styles(""),
          content(conflicting, '<text:p text:style-name="P">Line</text:p>'),
          metadata,
        ),
    ).toThrow("Conflicting ODF paragraph line-spacing modes");
  });

  it("preserves label-alignment list geometry through the Writer model and ODT export", /** Verifies modern ODF list geometry round-trips. @returns Nothing. */ () => {
    const listStyle =
      '<text:list-style style:name="L1"><text:list-level-style-bullet text:level="1" text:bullet-char="•"><style:list-level-properties><style:list-level-label-alignment text:label-followed-by="listtab" text:list-tab-stop-position="0.8in" fo:text-indent="-0.25in" fo:margin-left="0.8in"/></style:list-level-properties></text:list-level-style-bullet></text:list-style>';
    const source = importWriterXml(
      styles(""),
      content(
        listStyle,
        '<text:list text:style-name="L1"><text:list-item><text:p>Item</text:p></text:list-item></text:list>',
      ),
      metadata,
    ).document;
    const format = source.FindNumRulePtr("L1")?.GetNumFormat(0);
    expect(format?.GetFirstLineIndent()).toBe(-360);
    expect(format?.GetIndentAt()).toBe(1152);
    expect(format?.GetListtabPos()).toBe(1152);
    expect(format?.GetLabelFollowedBy()).toBe("listtab");
    const exported = exportContentXml(source);
    expect(exported).toContain("style:list-level-label-alignment");
    const roundTripped = importWriterXml(styles(""), exported, metadata).document;
    expect(roundTripped.FindNumRulePtr("L1")?.GetNumFormat(0).GetIndentAt()).toBe(1152);
  });

  it("maps legacy list spacing into the same bounded numbering geometry", /** Verifies bounded legacy positioning import. @returns Nothing. */ () => {
    const listStyle =
      '<text:list-style style:name="Legacy"><text:list-level-style-number text:level="1" style:num-format="1"><style:list-level-properties text:space-before="0.3in" text:min-label-width="0.2in" text:min-label-distance="0.1in"/></text:list-level-style-number></text:list-style>';
    const document = importWriterXml(
      styles(""),
      content(
        listStyle,
        '<text:list text:style-name="Legacy"><text:list-item><text:p>First</text:p></text:list-item></text:list>',
      ),
      metadata,
    ).document;
    const format = document.FindNumRulePtr("Legacy")?.GetNumFormat(0);
    expect(format?.GetFirstLineIndent()).toBe(-288);
    expect(format?.GetIndentAt()).toBe(720);
    expect(format?.GetListtabPos()).toBe(864);
  });

  it("retains partial modern and legacy list alignment defaults", /** Checks retains partial modern and legacy list alignment defaults. @returns Test callback result. */ () => {
    const levels = [
      '<text:list-level-style-bullet text:level="1" text:bullet-char="•"><style:list-level-properties><style:list-level-label-alignment text:label-followed-by="space"/></style:list-level-properties></text:list-level-style-bullet>',
      '<text:list-level-style-bullet text:level="2" text:bullet-char="◦"><style:list-level-properties><style:list-level-label-alignment text:label-followed-by="nothing" fo:margin-left="0.8in"/></style:list-level-properties></text:list-level-style-bullet>',
      '<text:list-level-style-bullet text:level="3" text:bullet-char="▪"><style:list-level-properties><style:list-level-label-alignment text:list-tab-stop-position="0.9in"/></style:list-level-properties></text:list-level-style-bullet>',
      '<text:list-level-style-bullet text:level="4" text:bullet-char="•"><style:list-level-properties text:space-before="0.3in"/></text:list-level-style-bullet>',
      '<text:list-level-style-bullet text:level="5" text:bullet-char="•"><style:list-level-properties text:min-label-width="0.2in"/></text:list-level-style-bullet>',
      '<text:list-level-style-bullet text:level="6" text:bullet-char="•"><style:list-level-properties text:min-label-distance="0.1in"/></text:list-level-style-bullet>',
    ].join("");
    const source = importWriterXml(
      styles(""),
      content(
        `<text:list-style style:name="Partial">${levels}</text:list-style>`,
        '<text:list text:style-name="Partial"><text:list-item><text:p>Body</text:p></text:list-item></text:list>',
      ),
      metadata,
    ).document;
    const rule = source.FindNumRulePtr("Partial")!;
    expect(rule.GetNumFormat(0).GetLabelFollowedBy()).toBe("space");
    expect(rule.GetNumFormat(1).GetLabelFollowedBy()).toBe("nothing");
    expect(rule.GetNumFormat(2).GetListtabPos()).toBe(1296);
    expect(rule.GetNumFormat(3).GetFirstLineIndent()).toBeCloseTo(0);
    expect(rule.GetNumFormat(4).GetFirstLineIndent()).toBe(-288);
    expect(rule.GetNumFormat(5).GetListtabPos()).toBe(144);
    expect(exportContentXml(source)).toContain('text:label-followed-by="space"');
  });

  it("rejects unsupported list label-follow and page orientation values", /** Checks rejects unsupported list label-follow and page orientation values. @returns Test callback result. */ () => {
    const invalidList =
      '<text:list-style style:name="Invalid"><text:list-level-style-bullet text:level="1" text:bullet-char="•"><style:list-level-properties><style:list-level-label-alignment text:label-followed-by="custom"/></style:list-level-properties></text:list-level-style-bullet></text:list-style>';
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        importWriterXml(styles(""), content(invalidList, "<text:p>Item</text:p>"), metadata),
    ).toThrow(/Unsupported ODF label-followed-by/);
    const invalidPage = `<office:document-styles ${namespaces}><office:automatic-styles><style:page-layout style:name="P1"><style:page-layout-properties fo:page-width="8.5in" fo:page-height="11in" style:print-orientation="diagonal"/></style:page-layout></office:automatic-styles><office:styles/></office:document-styles>`;
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        importWriterXml(invalidPage, content("", "<text:p>Item</text:p>"), metadata),
    ).toThrow(/Unsupported ODF page orientation/);
  });

  it("rejects duplicate paragraph defaults and page layouts", /** Checks rejects duplicate paragraph defaults and page layouts. @returns Test callback result. */ () => {
    const defaultStyle = '<style:default-style style:family="paragraph"/>';
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        importWriterXml(
          styles(defaultStyle + defaultStyle),
          content("", "<text:p>Item</text:p>"),
          metadata,
        ),
    ).toThrow(/Duplicate ODF default paragraph style/);
    const layout =
      '<style:page-layout style:name="P1"><style:page-layout-properties fo:page-width="8.5in" fo:page-height="11in"/></style:page-layout>';
    const duplicated = `<office:document-styles ${namespaces}><office:automatic-styles>${layout}${layout}</office:automatic-styles><office:styles><style:style style:name="Standard" style:family="paragraph"/></office:styles></office:document-styles>`;
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        importWriterXml(duplicated, content("", "<text:p>Item</text:p>"), metadata),
    ).toThrow(/Duplicate ODF page layout/);
  });

  it("ignores unrelated page and list children while rejecting duplicate page properties", /** Checks ignores unrelated page and list children while rejecting duplicate page properties. @returns Test callback result. */ () => {
    const pageWithoutProperties = `<office:document-styles ${namespaces}><office:automatic-styles><style:page-layout style:name="Empty"><style:text-properties/></style:page-layout></office:automatic-styles><office:styles><style:style style:name="Standard" style:family="paragraph"/></office:styles></office:document-styles>`;
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        importWriterXml(pageWithoutProperties, content("", "<text:p>Body</text:p>"), metadata),
    ).not.toThrow();
    const duplicateProperties = `<office:document-styles ${namespaces}><office:automatic-styles><style:page-layout style:name="P1"><style:page-layout-properties fo:page-width="8.5in" fo:page-height="11in"/><style:page-layout-properties fo:page-width="8.5in" fo:page-height="11in"/></style:page-layout></office:automatic-styles><office:styles><style:style style:name="Standard" style:family="paragraph"/></office:styles></office:document-styles>`;
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        importWriterXml(duplicateProperties, content("", "<text:p>Body</text:p>"), metadata),
    ).toThrow(/Duplicate ODF page layout properties/);
    const list =
      '<text:list-style style:name="Extra"><text:list-level-style-bullet text:level="1" text:bullet-char="•"><style:text-properties/><style:list-level-properties><style:text-properties/><style:list-level-label-alignment text:label-followed-by="space"/></style:list-level-properties></text:list-level-style-bullet></text:list-style>';
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        importWriterXml(styles(""), content(list, "<text:p>Body</text:p>"), metadata),
    ).not.toThrow();
  });

  it("prefers the Standard master page after unrelated master-page entries", /** Checks prefers the Standard master page after unrelated master-page entries. @returns Test callback result. */ () => {
    const pageStyles = `<office:document-styles ${namespaces}><office:automatic-styles><style:page-layout style:name="P1"><style:page-layout-properties fo:page-width="8in" fo:page-height="11in"/></style:page-layout><style:page-layout style:name="P2"><style:page-layout-properties fo:page-width="8.5in" fo:page-height="11in"/></style:page-layout></office:automatic-styles><office:styles><style:style style:name="Standard" style:family="paragraph"/></office:styles><office:master-styles><style:text-properties/><style:master-page style:name="Other" style:page-layout-name="P1"/><style:master-page style:name="Another" style:page-layout-name="P1"/><style:master-page style:name="Standard" style:page-layout-name="P2"/></office:master-styles></office:document-styles>`;
    const document = importWriterXml(
      pageStyles,
      content("", "<text:p>Body</text:p>"),
      metadata,
    ).document;
    expect(document.GetPageDesc().GetValue().width).toBe(12240);
  });

  it("rejects duplicate list definitions across ODF style streams", /** Checks rejects duplicate list definitions across ODF style streams. @returns Test callback result. */ () => {
    const attributes = [
      'fo:text-indent="-0.25in"',
      'fo:margin-left="0.5in"',
      'text:label-followed-by="listtab"',
      'text:list-tab-stop-position="0.5in"',
    ];
    const listStyle =
      /** Runs the test callback. @param values - Test input. @returns Test callback result. */ (
        values: readonly string[],
      ) =>
        `<text:list-style style:name="Shared"><text:list-level-style-bullet text:level="1" text:bullet-char="•"><style:list-level-properties><style:list-level-label-alignment ${values.join(" ")}/></style:list-level-properties></text:list-level-style-bullet></text:list-style>`;
    for (const [index, replacement] of [
      'fo:text-indent="-0.3in"',
      'fo:margin-left="0.6in"',
      'text:label-followed-by="space"',
      'text:list-tab-stop-position="0.6in"',
    ].entries()) {
      const changed = [...attributes];
      changed[index] = replacement;
      expect(
        /** Runs the test callback. @returns Test callback result. */ () =>
          importWriterXml(
            styles(listStyle(attributes)),
            content(listStyle(changed), "<text:p>Body</text:p>"),
            metadata,
          ),
      ).toThrow(/Duplicate ODF list style/);
    }
  });

  it("rejects canonical list aliases with conflicting positioning fields", /** Checks rejects canonical list aliases with conflicting positioning fields. @returns Test callback result. */ () => {
    const attributes = [
      'fo:text-indent="-0.25in"',
      'fo:margin-left="0.5in"',
      'text:label-followed-by="listtab"',
      'text:list-tab-stop-position="0.5in"',
    ];
    const listStyle =
      /** Runs the test callback. @param name - Test input. @param values - Test input. @returns Test callback result. */ (
        name: string,
        values: readonly string[],
      ) =>
        `<text:list-style style:name="${name}" style:display-name="Shared"><text:list-level-style-bullet text:level="1" text:bullet-char="•"><style:list-level-properties><style:list-level-label-alignment ${values.join(" ")}/></style:list-level-properties></text:list-level-style-bullet></text:list-style>`;
    for (const [index, replacement] of [
      'fo:text-indent="-0.3in"',
      'fo:margin-left="0.6in"',
      'text:label-followed-by="space"',
      'text:list-tab-stop-position="0.6in"',
    ].entries()) {
      const changed = [...attributes];
      changed[index] = replacement;
      expect(
        /** Runs the test callback. @returns Test callback result. */ () =>
          importWriterXml(
            styles(""),
            content(
              listStyle("AliasBase", attributes) + listStyle("AliasChanged", changed),
              "<text:p>Body</text:p>",
            ),
            metadata,
          ),
      ).toThrow(/Conflicting ODF list rule/);
    }
  });
});
