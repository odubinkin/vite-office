/** @fileoverview Checks ODT alignment spellings and normal character values. */

import { describe, expect, it } from "vitest";
import { SvxAdjust, SvxAdjustItem } from "../../../../editeng/source/items/paraitem";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { RES_PARATR_ADJUST } from "../../../inc/hintids";
import { createWriterDocument } from "../../core/doc/doc";
import { exportContentXml, exportMetaXml, exportStylesXml } from "./xmlexp";
import { importWriterXml } from "./xmlimp";

/** Supplies shell metadata for focused XML imports. @returns Test metadata. */
function metadata() {
  return createDocument({ id: "alignment", suiteId: "writer", title: "Imported" });
}

describe("Writer ODT alignment validation", /** Registers alignment import checks. @returns Nothing. */ () => {
  it("imports normal character values and every ODF alignment spelling" /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */, () => {
    const writer = createWriterDocument();
    const styles = exportStylesXml(writer);
    const baseContent = exportContentXml(writer);
    const meta = exportMetaXml(metadata().title);
    for (const [value, expected] of [
      ["start", "left"],
      ["left", "left"],
      ["end", "right"],
      ["right", "right"],
      ["center", "center"],
      ["justify", "justify"],
    ] as const) {
      const content = baseContent
        .replace(
          "</office:automatic-styles>",
          `<style:style style:name="P9" style:family="paragraph"><style:paragraph-properties fo:text-align="${value}"/></style:style></office:automatic-styles>`,
        )
        .replace('text:style-name="Standard"', 'text:style-name="P9"');
      expect(
        importWriterXml(
          styles,
          content,
          metadata(),
          meta,
        ).document.paragraphs[0]?.GetParagraphAlignment(),
      ).toBe(expected);
    }
    const content = baseContent
      .replace(
        "</office:automatic-styles>",
        '<style:style style:name="T9" style:family="text"><style:text-properties fo:font-weight="normal" fo:font-style="normal" style:text-underline-style="none" style:text-underline-width="auto"/></style:style></office:automatic-styles>',
      )
      .replace("</text:p>", '<text:span text:style-name="T9">plain</text:span></text:p>');
    expect(
      importWriterXml(styles, content, metadata(), meta).document.paragraphs[0]?.GetText(),
    ).toBe("plain");

    for (const [adjust, expected] of [
      [SvxAdjust.Left, "left"],
      [SvxAdjust.Right, "right"],
      [SvxAdjust.Center, "center"],
      [SvxAdjust.Block, "justify"],
    ] as const) {
      const styledWriter = createWriterDocument();
      styledWriter
        .GetDfltTextFormatColl()
        .SetFormatAttr(new SvxAdjustItem(adjust, RES_PARATR_ADJUST));
      const imported = importWriterXml(
        exportStylesXml(styledWriter),
        exportContentXml(styledWriter),
        metadata(),
      );
      expect(imported.document.GetDfltTextFormatColl().GetAttrSet().GetAdjust().GetAdjust()).toBe(
        expected === "left"
          ? SvxAdjust.ParaStart
          : expected === "right"
            ? SvxAdjust.ParaEnd
            : expected === "center"
              ? SvxAdjust.Center
              : SvxAdjust.Block,
      );
    }
    const headingWriter = createWriterDocument();
    headingWriter
      .GetTextFormatColl("heading-1")
      .SetFormatAttr(new SvxAdjustItem(SvxAdjust.Right, RES_PARATR_ADJUST));
    expect(
      importWriterXml(exportStylesXml(headingWriter), exportContentXml(headingWriter), metadata())
        .document.GetTextFormatColl("heading-1")
        .GetAttrSet()
        .GetAdjust()
        .GetAdjust(),
    ).toBe(SvxAdjust.ParaEnd);
    expect(
      /** Executes the enclosing deterministic test or transformation callback. @returns Callback result. */
      () =>
        importWriterXml(
          styles.replace("</style:style>", "<style:paragraph-properties/></style:style>"),
          baseContent,
          metadata(),
        ),
    ).not.toThrow();
  });
});
