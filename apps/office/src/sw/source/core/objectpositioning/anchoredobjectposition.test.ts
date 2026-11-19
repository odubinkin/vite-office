/** @fileoverview Checks the native Writer content fly's vertical placement. */
import { expect, it } from "vitest";
import { RelOrientation as R } from "../../../../offapi/com/sun/star/text/RelOrientation";
import { VertOrientation as V } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { WrapTextMode } from "../../../../offapi/com/sun/star/text/WrapTextMode";
import { SwFormatVertOrient } from "../../../inc/fmtornt";
import { SwFormatSurround } from "../../../inc/fmtsrnd";
import { SwDoc } from "../doc/doc";
import { CalcRelPosY } from "./anchoredobjectposition";

it("uses the actual fly item and physical page or paragraph extents for vertical alignment", /** Covers Word's negative paragraph offset, page areas, and original no-wrap bottom alignment. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const format = doc.MakeFlyFrameFormat("Picture", doc.GetDfltFrameFormat());
    const page = { ...doc.GetPageDesc().GetValue(), height: 10000 };
    const body = { ...page, topMargin: 1500, bottomMargin: 1200 };
    const env = { page, body, anchorTop: 2000, anchorHeight: 400 };
    /** Stores a native orientation and resolves its offset. @param relation - Reference area. @param align - Vertical alignment. @param pos - Manual position. @returns Relative top in twips. */
    function position(relation: number, align: number, pos = 0): number {
      const item = new SwFormatVertOrient(pos, align, relation);
      try {
        format.SetFormatAttr(item);
        return CalcRelPosY(format, 100, env);
      } finally {
        item.Dispose();
      }
    }
    expect(position(R.FRAME, V.NONE, -180)).toBe(-180);
    expect(position(R.PAGE_FRAME, V.TOP)).toBe(-2000);
    expect(position(R.PAGE_PRINT_AREA, V.NONE, 200)).toBe(-300);
    expect(position(R.PAGE_PRINT_AREA_BOTTOM, V.NONE, 25)).toBe(6825);
    expect(position(R.PAGE_PRINT_AREA_TOP, V.CENTER)).toBe(-1300);
    expect(position(R.PAGE_PRINT_AREA_TOP, V.BOTTOM)).toBe(-600);
    expect(position(R.FRAME, V.CENTER)).toBe(150);
    expect(position(R.TEXT_LINE, V.TOP)).toBe(-100);
    expect(position(R.TEXT_LINE, V.CENTER)).toBe(-50);
    expect(position(R.TEXT_LINE, V.BOTTOM)).toBe(0);
    expect(position(R.TEXT_LINE, V.NONE, 25)).toBe(-25);
    expect(position(R.FRAME, V.BOTTOM)).toBe(300);
    const surround = new SwFormatSurround(WrapTextMode.NONE);
    try {
      format.SetFormatAttr(surround);
      expect(position(R.FRAME, V.BOTTOM)).toBe(400);
    } finally {
      surround.Dispose();
    }
  } finally {
    doc.Dispose();
  }
});
