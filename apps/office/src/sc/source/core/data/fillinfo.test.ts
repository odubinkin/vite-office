/** @fileoverview Calc conditional paint precedence across entries and cell keys. */
import { assert, expect, it } from "vitest";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { Color } from "../../../../tools/inc/color";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScColorScaleEntry, ScColorScaleFormat, ScDataBarFormat } from "../../../inc/colorscale";
import { ScCondFormatEntry, ScConditionalFormat, ScConditionMode } from "../../../inc/conditio";
import { ScDocument } from "../../../inc/document";
import { ScRangeList } from "../../../inc/rangelst";
import { handleConditionalFormat } from "./fillinfo";

it("uses the first available style, scale and data bar independently in native order", /** Exercises ordered conditional attribute keys with actual Calc rule owners. @returns Nothing. */ () => {
  const document = new ScDocument();
  const name = unicode("Data");
  const position = new ScAddress();
  try {
    document.InsertTab(0, name);
    document.SetValue(position, 5);
    const existingStyle = document.GetStyleSheetPool()?.GetDefaultStyle(true);
    assert(existingStyle);
    const first = new ScConditionalFormat(0, document);
    const second = new ScConditionalFormat(0, document);
    for (const [format, style, scaleColor, barColor] of [
      [first, "Missing Style", 0xff0000, 0x0000ff],
      [second, text(existingStyle.GetName()), 0x00ff00, 0xffff00],
    ] as const) {
      format.SetRange(new ScRangeList(new ScRange(position, position)));
      format.AddEntry(
        new ScCondFormatEntry(
          ScConditionMode.Direct,
          ["1"],
          document,
          position,
          FormulaGrammar.Grammar.GRAM_NATIVE,
          style,
        ),
      );
      const scale = new ScColorScaleFormat(document);
      scale.AddEntry(new ScColorScaleEntry(0, new Color(scaleColor)));
      scale.AddEntry(new ScColorScaleEntry(10, new Color(scaleColor)));
      format.AddEntry(scale);
      const bar = new ScDataBarFormat(document);
      const data = bar.GetDataBarData();
      data.mpLowerLimit = new ScColorScaleEntry(-10);
      data.mpUpperLimit = new ScColorScaleEntry(10);
      data.maPositiveColor = new Color(barColor);
      format.AddEntry(bar);
      document.AddCondFormatData(format.GetRange(), 0, document.AddCondFormat(format, 0));
    }

    const paint = handleConditionalFormat(document, position);
    assert(paint);
    const style = document.GetCondResult(position);
    assert(style);
    expect(paint.pConditionSet).toBe(style);
    expect(paint.mxColorScale?.toUInt32()).toBe(0xff0000);
    expect(paint.pDataBar?.maColor.toUInt32()).toBe(0x0000ff);
    expect(first.GetData(document.GetRefCellValue(position), position).aStyleName).toBe(
      "Missing Style",
    );
    expect(handleConditionalFormat(document, new ScAddress(1, 0, 0))).toBeUndefined();
  } finally {
    name.dispose();
    document.Dispose();
  }
});
