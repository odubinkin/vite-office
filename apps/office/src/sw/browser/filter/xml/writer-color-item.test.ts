/** @fileoverview Genuine Writer character-color values,slot default and lossless worker transfer boundaries. */
import { expect, it } from "vitest";
import { encodeComplexColor } from "../../../../docmodel/browser/complex-color-codec";
import { ComplexColor } from "../../../../docmodel/inc/color/ComplexColor";
import { ThemeColorUsage } from "../../../../docmodel/inc/theme/ThemeColorType";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { SID_ATTR_CHAR_COLOR } from "../../../../editeng/inc/editids";
import { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import { Color } from "../../../../tools/inc/color";
import {
  RES_CHRATR_COLOR,
  RES_CHRATR_ESCAPEMENT,
  RES_PARATR_LINESPACING,
  RES_CHRATR_HIGHLIGHT,
  RES_PARATR_CONNECT_BORDER,
} from "../../../inc/hintids";
import { SwParaConnectBorderItem } from "../../../source/core/para/paratr";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { MID_SHADING_VALUE } from "../../../../editeng/inc/memberids";
import {
  createWriterHighlightItem,
  createWriterTextColorItem,
  writerHighlightColorValue,
  writerTextColorValue,
} from "../../../source/core/attr/swatrset";
import { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import { SvxEscapementItem } from "../../../../editeng/inc/escapementitem";
import { SwDoc } from "../../../source/core/doc/doc";
import { decodeSfxPoolItem, encodeSfxPoolItem } from "./item-codec";
it("uses the native black pool default and preserves opaque,automatic and transparency worker values", /** Uses actual pool factory and browser codec,including legacy input records. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    pool = doc.GetAttrPool();
  expect(pool.GetWhichIDFromSlotID(SID_ATTR_CHAR_COLOR)).toBe(RES_CHRATR_COLOR);
  const item = pool.GetUserOrPoolDefaultItem(RES_CHRATR_COLOR) as SvxColorItem;
  expect(item).toBeInstanceOf(SvxColorItem);
  expect(writerTextColorValue(item)).toBe("#000000");
  for (const input of ["#12aBcD", "auto", 0, 0xffffffff, 0x80123456]) {
    const native = createWriterTextColorItem(input),
      record = encodeSfxPoolItem(native);
    expect(typeof record.value).toBe("number");
    const restored = decodeSfxPoolItem(pool, record) as SvxColorItem;
    expect(restored.GetValue().equals(native.GetValue())).toBe(true);
    expect(writerTextColorValue(restored)).toBe(writerTextColorValue(native));
  }
  expect(writerTextColorValue(createWriterTextColorItem(0x80123456))).toBe(
    `rgba(18, 52, 86, ${127 / 255})`,
  );
  expect(
    writerTextColorValue(
      decodeSfxPoolItem(pool, { which: RES_CHRATR_COLOR, value: "auto" }) as SvxColorItem,
    ),
  ).toBe("auto");
  for (const invalid of [null, undefined, {}, "red", "#123", -1, 0x100000000, 1.5])
    expect(
      /** Sends an invalid transport value. @returns No valid item. */ () =>
        createWriterTextColorItem(invalid),
    ).toThrow("invalid");
});

it("preserves represented brush metadata and rejects the unrepresented graphic filter state", /** Uses concrete decoded brushes and exact complex fields. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    complex = createWriterHighlightItem("#123456"),
    rgb = new ComplexColor();
  rgb.setRGB(0x123456);
  complex.setComplexColor(rgb);
  const usage = createWriterHighlightItem("#123456"),
    theme = new ComplexColor();
  theme.setThemeColorUsage(ThemeColorUsage.Text);
  usage.setComplexColor(theme);
  const graphic = createWriterHighlightItem("#123456");
  graphic.setGraphicTransparency(50);
  const shading = createWriterHighlightItem("#123456"),
    value = new Any([1], "sal_Int32");
  try {
    expect(shading.PutValue(value, MID_SHADING_VALUE)).toBe(true);
    for (const item of [complex, usage, graphic, shading]) {
      const record = encodeSfxPoolItem(item),
        restored = decodeSfxPoolItem(doc.GetAttrPool(), structuredClone(record));
      expect(restored).toBeInstanceOf(SvxBrushItem);
      expect(encodeSfxPoolItem(restored)).toEqual(record);
      expect(encodeComplexColor((restored as SvxBrushItem).getComplexColor())).toEqual(
        encodeComplexColor(item.getComplexColor()),
      );
    }
    const filter = createWriterHighlightItem("#123456");
    filter.SetFiltColor(new Color(0xabcdef));
    expect(
      /** Refuses a field without an actual represented restore owner. @returns No snapshot. */ () =>
        encodeSfxPoolItem(filter),
    ).toThrow("graphic filter color transfer");
  } finally {
    value.dispose();
    doc.Dispose();
  }
});

it("restores the native paragraph border-connection item from worker snapshots", /** Checks the merged pool factory keeps its concrete item type and boolean value. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    for (const value of [false, true]) {
      const item = decodeSfxPoolItem(doc.GetAttrPool(), {
        which: RES_PARATR_CONNECT_BORDER,
        value,
      });
      expect(item).toBeInstanceOf(SwParaConnectBorderItem);
      expect((item as SwParaConnectBorderItem).GetValue()).toBe(value);
    }
  } finally {
    doc.Dispose();
  }
});
it("keeps native highlight brushes and complete color words across worker snapshots", /** Checks keeps native highlight brushes and complete color words across worker snapshots. @returns Test completion or assertion result. */ () => {
  const doc = new SwDoc(),
    pool = doc.GetAttrPool();
  expect(pool.GetUserOrPoolDefaultItem(RES_CHRATR_HIGHLIGHT)).toBeInstanceOf(SvxBrushItem);
  for (const input of ["#12abcd", "transparent", 0x80123456]) {
    const native = createWriterHighlightItem(input);
    const encoded = encodeSfxPoolItem(native);
    expect(typeof encoded.value).toBe("number");
    const restored = decodeSfxPoolItem(pool, encoded) as SvxBrushItem;
    expect(restored.GetColor().equals(native.GetColor())).toBe(true);
    expect(writerHighlightColorValue(restored)).toBe(writerHighlightColorValue(native));
  }
  const alpha = createWriterHighlightItem(0x80123456);
  expect(writerHighlightColorValue(alpha)).toBe(`rgba(18, 52, 86, ${127 / 255})`);
  expect(
    createWriterHighlightItem(writerHighlightColorValue(alpha)).GetColor().equals(alpha.GetColor()),
  ).toBe(true);
});
it("preserves complex metadata independently of native source equality", /** Includes usage/final-only differences that equality omits. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    item = createWriterTextColorItem("#123456"),
    final = new ComplexColor(),
    usage = new ComplexColor(),
    rgb = new ComplexColor();
  final.setFinalColor(new Color(0xabcdef));
  usage.setThemeColorUsage(ThemeColorUsage.Text);
  rgb.setRGB(0x123456);
  try {
    for (const state of [final, usage, rgb]) {
      item.setComplexColor(state);
      const record = encodeSfxPoolItem(item),
        restored = decodeSfxPoolItem(doc.GetAttrPool(), structuredClone(record));
      expect(restored).toBeInstanceOf(SvxColorItem);
      expect(encodeComplexColor((restored as SvxColorItem).getComplexColor())).toEqual(
        encodeComplexColor(state),
      );
      expect(encodeSfxPoolItem(restored)).toEqual(record);
    }
  } finally {
    doc.Dispose();
  }
});

it("rejects malformed structured color and brush snapshots before replacing pool defaults", /** Checks untrusted Worker records, numeric bounds and native Which ownership. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    pool = doc.GetAttrPool(),
    original = pool.GetPoolDefaultItem(RES_CHRATR_COLOR),
    complex = encodeComplexColor(new ComplexColor()),
    color = { kind: "svx-color", color: 0, complex },
    brush = { kind: "svx-brush", color: 0, complex, shading: 0, graphicTransparency: 0 };
  try {
    for (const invalid of ["0", 0.5, -1, 0x100000000, NaN, Infinity])
      expect(
        /** Rejects a non-uint32 packed color. @returns No item. */ () =>
          decodeSfxPoolItem(pool, { which: RES_CHRATR_COLOR, value: { ...color, color: invalid } }),
      ).toThrow("Native color record is invalid");
    expect(
      /** Rejects a color record using a boolean Which identity. @returns No item. */ () =>
        decodeSfxPoolItem(pool, { which: RES_PARATR_CONNECT_BORDER, value: color }),
    ).toThrow("Native color Which is invalid");
    expect(
      /** Rejects a brush record using the color-only Which identity. @returns No item. */ () =>
        decodeSfxPoolItem(pool, { which: RES_CHRATR_COLOR, value: brush }),
    ).toThrow("Native brush record is invalid");
    for (const shading of ["0", 0.5, -2147483649, 2147483648])
      expect(
        /** Rejects a shading value outside signed32. @returns No item. */ () =>
          decodeSfxPoolItem(pool, { which: RES_CHRATR_HIGHLIGHT, value: { ...brush, shading } }),
      ).toThrow("Native brush record is invalid");
    for (const graphicTransparency of ["0", 0.5, -129, 128])
      expect(
        /** Rejects a graphic-transparency value outside signed8. @returns No item. */ () =>
          decodeSfxPoolItem(pool, {
            which: RES_CHRATR_HIGHLIGHT,
            value: { ...brush, graphicTransparency },
          }),
      ).toThrow("Native brush record is invalid");
    expect(pool.GetPoolDefaultItem(RES_CHRATR_COLOR)).toBe(original);
    expect((original as SvxColorItem).GetValue().toUInt32()).toBe(0);
  } finally {
    doc.Dispose();
  }
});

it("roundtrips native escapement fields through the generic Worker item envelope", /** Verifies the registered concrete item retains both explicit values. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    item = new SvxEscapementItem(33, 58, RES_CHRATR_ESCAPEMENT);
  try {
    const snapshot = encodeSfxPoolItem(item);
    expect(snapshot).toEqual({ which: RES_CHRATR_ESCAPEMENT, value: { offset: 33, height: 58 } });
    const restored = decodeSfxPoolItem(doc.GetAttrPool(), structuredClone(snapshot));
    expect(restored).toBeInstanceOf(SvxEscapementItem);
    expect(restored.equals(item)).toBe(true);
    restored.Dispose();
  } finally {
    item.Dispose();
    doc.Dispose();
  }
});

it("roundtrips native line spacing through the generic Worker item envelope", /** Preserves the concrete paragraph item and its physical height rather than flattening its UNO projection. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    item = new SvxLineSpacingItem(360, RES_PARATR_LINESPACING);
  try {
    const snapshot = encodeSfxPoolItem(item);
    expect(snapshot.value).toMatchObject({ nLineHeight: 360, nPropLineSpace: 100 });
    const restored = decodeSfxPoolItem(doc.GetAttrPool(), structuredClone(snapshot));
    expect(restored).toBeInstanceOf(SvxLineSpacingItem);
    expect(restored.equals(item)).toBe(true);
    expect(encodeSfxPoolItem(restored)).toEqual(snapshot);
    restored.Dispose();
  } finally {
    item.Dispose();
    doc.Dispose();
  }
});
