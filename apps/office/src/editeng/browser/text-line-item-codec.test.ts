/** @fileoverview Shared literal-color Worker transport preserves native underline values and rejects unsupported state without flattening. */
import { expect, it } from "vitest";
import { encodeTextLineItem, decodeTextLineItem } from "./text-line-item-codec";
import { SvxUnderlineItem, FontLineStyle } from "../source/items/textitem";
import { Color, ColorTransparency } from "../../tools/inc/color";
import { ComplexColor, ColorType } from "../../docmodel/inc/color/ComplexColor";
import { createWriterDocument } from "../../sw/source/core/doc/doc";
import { RES_CHRATR_UNDERLINE, RES_CHRATR_WEIGHT } from "../../sw/inc/hintids";
import type { SfxPoolItemSnapshot } from "../../svl/source/items/poolitem";
it("transfers full represented style and packed alpha/color through the actual pool", /** Exercises a cloneable Worker record rather than core QueryValue as a persistence format. @returns Nothing. */ () => {
  const doc = createWriterDocument(),
    item = new SvxUnderlineItem(FontLineStyle.LINESTYLE_DOUBLEWAVE, RES_CHRATR_UNDERLINE);
  item.SetColor(new Color(ColorTransparency, 0x7fabcdef, "ColorTransparencyTag"));
  const record = structuredClone(encodeTextLineItem(item));
  expect(record).toEqual({
    which: RES_CHRATR_UNDERLINE,
    value: { kind: "svx-text-line", style: 11, color: 0x7fabcdef },
  });
  const restored = decodeTextLineItem(doc.GetAttrPool(), record) as SvxUnderlineItem;
  expect(restored).not.toBe(item);
  expect(restored.equals(item)).toBe(true);
  for (const value of [null, 0, true, "string", [], {}, { kind: "other" }])
    expect(
      decodeTextLineItem(doc.GetAttrPool(), {
        which: RES_CHRATR_UNDERLINE,
        value,
      } as SfxPoolItemSnapshot),
    ).toBeUndefined();
  for (const value of [
    { kind: "svx-text-line", color: 0 },
    { kind: "svx-text-line", style: "1", color: 0 },
    { kind: "svx-text-line", style: 1.5, color: 0 },
    { kind: "svx-text-line", style: 1 },
    { kind: "svx-text-line", style: 1, color: "0" },
    { kind: "svx-text-line", style: 1, color: 0.5 },
    { kind: "svx-text-line", style: 1, color: -1 },
    { kind: "svx-text-line", style: 1, color: 0x100000000 },
  ])
    expect(
      /** Decodes an invalid external record. @returns Invalid item. */ () =>
        decodeTextLineItem(doc.GetAttrPool(), {
          which: RES_CHRATR_UNDERLINE,
          value,
        } as SfxPoolItemSnapshot),
    ).toThrow("value is invalid");
  expect(
    /** Rejects a record bound to another concrete item family. @returns Invalid item. */ () =>
      decodeTextLineItem(doc.GetAttrPool(), {
        which: RES_CHRATR_WEIGHT,
        value: { kind: "svx-text-line", style: 1, color: 0 },
      }),
  ).toThrow("WhichId is invalid");
});
it("rejects unported complex-color state instead of losing fields in a Worker transfer", /** Distinguishes source equality omissions for usage/final color. @returns Nothing. */ () => {
  const item = new SvxUnderlineItem(FontLineStyle.LINESTYLE_SINGLE, RES_CHRATR_UNDERLINE);
  for (const field of ["type", "usage", "final"] as const) {
    const complex = new ComplexColor();
    if (field === "type") complex.setType(ColorType.Theme);
    else if (field === "usage") complex.setThemeColorUsage(complex.getThemeColorUsage() + 1);
    else complex.setFinalColor(new Color(1));
    item.setComplexColor(complex);
    expect(
      /** Prevents unsupported complex values from becoming a plain RGB record. @returns Invalid snapshot. */ () =>
        encodeTextLineItem(item),
    ).toThrow("not implemented");
  }
});
