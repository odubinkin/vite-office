/** @fileoverview Native RTF line-height boundary requires a real finite default-device metric. */
import { assert, expect, it } from "vitest";
import * as ScriptType from "../../../../offapi/com/sun/star/i18n/ScriptType";
import { createWriterDocument } from "../doc/doc";
import { AttrSetToLineHeight } from "./swfont";

it("rejects missing, nonfinite and negative output-device heights", /** Checks admission before RTF leading uses platform font metrics. @returns Nothing. */ () => {
  const document = createWriterDocument();
  try {
    const paragraph = document.paragraphs[0];
    assert(paragraph);
    const set = paragraph.GetSwAttrSet();
    expect(
      /** Missing device has no invented metric. @returns No height. */ () =>
        AttrSetToLineHeight(set, ScriptType.LATIN, undefined),
    ).toThrow("default output device font height");
    for (const measured of [Number.NaN, Number.POSITIVE_INFINITY, -1]) {
      expect(
        /** Rejects unusable platform measurement. @returns No height. */ () =>
          AttrSetToLineHeight(set, ScriptType.LATIN, {
            getDefaultFont:
              /** Leaves the actual native default font in place. @returns No replacement. */ () =>
                undefined,
            measureTextHeight:
              /** Supplies the platform error result. @returns Invalid height. */ () => measured,
          }),
      ).toThrow("default output device font height");
    }
    expect(
      AttrSetToLineHeight(set, ScriptType.LATIN, {
        getDefaultFont: /** Leaves the native default unchanged. @returns No replacement. */ () =>
          undefined,
        measureTextHeight: /** Supplies a valid zero metric. @returns Zero. */ () => 0,
      }),
    ).toBe(0);
  } finally {
    document.Dispose();
  }
});
