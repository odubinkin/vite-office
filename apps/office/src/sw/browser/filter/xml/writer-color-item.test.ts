/** @fileoverview Genuine Writer character-color values,slot default and lossless worker transfer boundaries. */
import { expect, it } from "vitest";
import { ComplexColor } from "../../../../docmodel/inc/color/ComplexColor";
import { ThemeColorUsage } from "../../../../docmodel/inc/theme/ThemeColorType";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { SID_ATTR_CHAR_COLOR } from "../../../../editeng/inc/editids";
import { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import { Color } from "../../../../tools/inc/color";
import {
  RES_CHRATR_COLOR,
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

it("rejects highlight metadata that a scalar color snapshot cannot preserve", /** Checks actual native brush values before worker transport. @returns Nothing. */ () => {
  const complex = createWriterHighlightItem("#123456");
  const rgb = new ComplexColor();
  rgb.setRGB(0x123456);
  complex.setComplexColor(rgb);
  expect(
    /** Rejects metadata absent from the scalar transport. @returns No snapshot. */ () =>
      encodeSfxPoolItem(complex),
  ).toThrow("complex highlight transfer");
  const usage = createWriterHighlightItem("#123456");
  const theme = new ComplexColor();
  theme.setThemeColorUsage(ThemeColorUsage.Text);
  usage.setComplexColor(theme);
  expect(
    /** Rejects metadata absent from the scalar transport. @returns No snapshot. */ () =>
      encodeSfxPoolItem(usage),
  ).toThrow("complex highlight transfer");
  const filter = createWriterHighlightItem("#123456");
  filter.SetFiltColor(new Color(0xabcdef));
  expect(
    /** Rejects metadata absent from the scalar transport. @returns No snapshot. */ () =>
      encodeSfxPoolItem(filter),
  ).toThrow("complex highlight transfer");
  const graphic = createWriterHighlightItem("#123456");
  graphic.setGraphicTransparency(50);
  expect(
    /** Rejects metadata absent from the scalar transport. @returns No snapshot. */ () =>
      encodeSfxPoolItem(graphic),
  ).toThrow("complex highlight transfer");
  const shading = createWriterHighlightItem("#123456");
  expect(shading.PutValue(new Any([1], "sal_Int32"), MID_SHADING_VALUE)).toBe(true);
  expect(
    /** Rejects metadata absent from the scalar transport. @returns No snapshot. */ () =>
      encodeSfxPoolItem(shading),
  ).toThrow("complex highlight transfer");
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
it("rejects complex metadata rather than silently losing it in worker transfer", /** Tests real native complex-color values omitted from source equality as well as ordinary theme state. @returns Nothing. */ () => {
  const item = createWriterTextColorItem("#123456");
  const final = new ComplexColor();
  final.setFinalColor(new Color(0xabcdef));
  item.setComplexColor(final);
  expect(
    /** Rejects unsupported real complex metadata. @returns No valid transfer record. */ () =>
      encodeSfxPoolItem(item),
  ).toThrow("complex color transfer");
  const usage = new ComplexColor();
  usage.setThemeColorUsage(ThemeColorUsage.Text);
  item.setComplexColor(usage);
  expect(
    /** Rejects unsupported real complex metadata. @returns No valid transfer record. */ () =>
      encodeSfxPoolItem(item),
  ).toThrow("complex color transfer");
  const rgb = new ComplexColor();
  rgb.setRGB(0x123456);
  item.setComplexColor(rgb);
  expect(
    /** Rejects unsupported real complex metadata. @returns No valid transfer record. */ () =>
      encodeSfxPoolItem(item),
  ).toThrow("complex color transfer");
});
