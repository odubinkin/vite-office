/** @fileoverview Shared Writer/Calc border paint projection uses actual native lines and resolved frame styles without owning document attributes. */
import { expect, it } from "vitest";
import { browserBorderLine } from "./border-line";
import {
  SvxBorderLine,
  SvxBorderLineStyle as LineStyle,
} from "../../../editeng/source/items/borderline";
import { Color } from "../../../tools/inc/color";
import { Style } from "../../source/dialog/framelink";
it("retains shared Writer empty-line guides and paints actual line colors and native scaled widths", /** Original browser device projection. @returns Nothing. */ () => {
  expect(browserBorderLine(undefined, false)).toBe("none");
  expect(browserBorderLine(new SvxBorderLine(), true)).toBe("1px dashed #cbd5e1");
  expect(browserBorderLine(new Style(), false)).toBe("none");
  const line = new SvxBorderLine(new Color(0x223344), 40, LineStyle.DASHED);
  expect(browserBorderLine(line, false)).toBe("2pt dashed #223344");
  expect(browserBorderLine(new Style(line), false)).toBe("2pt dashed #223344");
  expect(line.GetWidth()).toBe(40);
});
it("preserves all native style families in the common browser paint mapping", /** Actual style enums and frame styles. @returns Nothing. */ () => {
  for (const [style, css] of [
    [LineStyle.SOLID, "solid"],
    [LineStyle.DOTTED, "dotted"],
    [LineStyle.FINE_DASHED, "dashed"],
    [LineStyle.DASH_DOT, "dashed"],
    [LineStyle.DASH_DOT_DOT, "dashed"],
    [LineStyle.DOUBLE, "double"],
    [LineStyle.DOUBLE_THIN, "double"],
    [LineStyle.THINTHICK_SMALLGAP, "double"],
    [LineStyle.THICKTHIN_LARGEGAP, "double"],
    [LineStyle.EMBOSSED, "ridge"],
    [LineStyle.ENGRAVED, "groove"],
    [LineStyle.OUTSET, "outset"],
    [LineStyle.INSET, "inset"],
  ] as const) {
    const line = new SvxBorderLine(null, 100, style);
    expect(browserBorderLine(line, false)).toContain(` ${css} #000000`);
    expect(browserBorderLine(new Style(line), false)).toContain(` ${css} #000000`);
  }
});
