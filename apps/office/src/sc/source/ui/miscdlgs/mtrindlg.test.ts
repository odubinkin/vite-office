/** @fileoverview Source column metric dialog normalization,default restoration and original quantization. */
import { expect, it } from "vitest";
import { ScMetricInputDlg } from "./mtrindlg";
import { FieldUnit as F } from "../../../../tools/inc/fldunit";
it("preserves original unit quantization,default comparison and user-toggle current restoration", /** Actual native metric model. @returns Nothing. */ () => {
  const cm = new ScMetricInputDlg(1280, F.CM),
    inch = new ScMetricInputDlg(1280, F.INCH);
  expect(cm.IsDefault()).toBe(true);
  expect(cm.value.get_value(F.NONE)).toBe(226n);
  expect(cm.GetInputValue()).toBe(1281);
  expect(inch.GetInputValue()).toBe(1282);
  cm.value.set_text("3 cm", ".", "");
  expect(cm.IsDefault()).toBe(false);
  cm.SetDefValHdl(true);
  expect(cm.IsDefault()).toBe(true);
  cm.SetDefValHdl(false);
  expect(cm.value.get_value(F.NONE)).toBe(300n);
  cm.value.set_text("0 cm", ".", "");
  expect(cm.GetInputValue()).toBe(0);
  cm.value.set_text("999 cm", ".", "");
  expect(cm.GetInputValue()).toBe(56693);
});
