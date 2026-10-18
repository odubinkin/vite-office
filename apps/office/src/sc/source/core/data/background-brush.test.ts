/** @fileoverview Actual Calc background brush default from ScDocumentPool, with shared value identity. */
import { expect, it } from "vitest";
import { SvxBrushItem } from "../../../../editeng/inc/brushitem";
import { Color, COL_TRANSPARENT } from "../../../../tools/inc/color";
import { ATTR_BACKGROUND } from "../../../inc/scitems";
it("uses original transparent background148 and independent shared brush copies", /** No document-pool facade or graphic provider is fabricated. @returns Nothing. */ () => {
  expect(ATTR_BACKGROUND).toBe(148);
  const item = new SvxBrushItem(COL_TRANSPARENT, ATTR_BACKGROUND);
  expect(item.isUsed()).toBe(false);
  expect(item.Which()).toBe(148);
  const copy = item.Clone();
  copy.SetColor(new Color(0x336699));
  expect(copy.isUsed()).toBe(true);
  expect(item.GetColor().equals(COL_TRANSPARENT)).toBe(true);
});
