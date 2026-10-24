/** @fileoverview Genuine Writer character-color values,slot default and lossless worker transfer boundaries. */
import { expect, it } from "vitest";
import { SwDoc } from "../../../source/core/doc/doc";
import {
  createWriterTextColorItem,
  writerTextColorValue,
} from "../../../source/core/attr/swatrset";
import { SID_ATTR_CHAR_COLOR } from "../../../../editeng/inc/editids";
import { RES_CHRATR_COLOR } from "../../../inc/hintids";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { ComplexColor } from "../../../../docmodel/inc/color/ComplexColor";
import { ThemeColorUsage } from "../../../../docmodel/inc/theme/ThemeColorType";
import { Color } from "../../../../tools/inc/color";
import { encodeSfxPoolItem, decodeSfxPoolItem } from "./item-codec";
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
