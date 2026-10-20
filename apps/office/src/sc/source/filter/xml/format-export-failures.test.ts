/** @fileoverview Exporter failure propagation retains native omission semantics for handler conversion failures. */
import { FontRelief } from "../../../../vcl/inc/fntstyle";
import { expect, it, vi } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScPatternAttr } from "../../../inc/patattr";
import { SvxCharReliefItem } from "../../../../editeng/source/items/textitem";
import { ScIndentItem } from "../../../inc/attrib";
import { exportFontEffectProperties } from "./xmlstyle.font-effects";
import { exportCellParagraphProperties } from "./xmlstyle";
import { XMLMeasurePropHdl } from "../../../../xmloff/source/style/xmlbahdl";
it("omits unmapped native relief and failed metric conversion without emitting malformed XML", /** omits unmapped native relief and failed metric conversion without emitting malformed XML. @returns Observed test result. */ () => {
  const d = new ScDocument(),
    p = new ScPatternAttr(d.getCellAttributeHelper());
  try {
    p.ItemSetPut(new SvxCharReliefItem(99 as FontRelief, 124));
    expect(exportFontEffectProperties(p)).toBe("");
    p.ItemSetPut(new ScIndentItem(200));
    const fail = vi.spyOn(XMLMeasurePropHdl.prototype, "exportXML").mockReturnValue(false);
    try {
      expect(exportCellParagraphProperties(p)).toBe("");
    } finally {
      fail.mockRestore();
    }
  } finally {
    p.Dispose();
    d.DisposeAttributes();
    d.GetSharedStringPool().dispose();
  }
});
