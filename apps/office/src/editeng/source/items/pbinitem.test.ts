/** @fileoverview Source paper-bin default and inherited signed byte UNO contracts. */
import { expect, it } from "vitest";
import { SvxPaperBinItem, PAPERBIN_PRINTER_SETTINGS } from "../../inc/pbinitem";
import { SvxPaperBinItem as FramePaperBin } from "./frmitems";
import { SfxByteItem } from "../../../svl/inc/intitem";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
it("uses the original255 default and concrete independent copies with shared byte storage", /** Keeps the source constructor order Which then tray. @returns Nothing. */ () => {
  expect(FramePaperBin).toBe(SvxPaperBinItem);
  expect(PAPERBIN_PRINTER_SETTINGS).toBe(255);
  const d = SvxPaperBinItem.CreateDefault(),
    item = new SvxPaperBinItem(159);
  expect(d).toBeInstanceOf(SfxByteItem);
  expect([d.Which(), d.GetValue()]).toEqual([0, 255]);
  expect(item.GetValue()).toBe(255);
  item.SetValue(3);
  const copy = new SvxPaperBinItem(item),
    clone = item.Clone();
  item.SetValue(4);
  for (const result of [copy, clone]) {
    expect(result.constructor).toBe(SvxPaperBinItem);
    expect(result).not.toBe(item);
    expect([result.Which(), result.GetValue()]).toEqual([159, 3]);
  }
  expect(copy.equals(new SvxPaperBinItem(160, 3))).toBe(true);
  expect(copy.equals(new SfxByteItem(159, 3))).toBe(false);
  const out = new Any();
  expect(d.QueryValue(out)).toBe(true);
  const value: [number] = [0];
  expect(out.extract(value, "sal_Int8")).toBe(true);
  expect(value[0]).toBe(-1);
  expect(item.PutValue(out)).toBe(true);
  expect(item.GetValue()).toBe(255);
  out.dispose();
});
