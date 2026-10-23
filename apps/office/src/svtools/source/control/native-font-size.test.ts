/** @fileoverview Independent original FontList/absolute FontSizeBox fixtures over actual VCL field conversions. */
import { expect, it } from "vitest";
import { FontList } from "../../inc/ctrltool";
import { FontSizeBox } from "./ctrlbox";
import { FieldUnit } from "../../../tools/inc/fldunit";

it("retains the exact scalable resource and one terminating zero", /** Source values are tenths of a point, not an invented short toolbar list. @returns Nothing. */ () => {
  expect(FontList.GetStdSizeAry()).toEqual([
    60, 70, 80, 90, 100, 105, 110, 120, 130, 140, 150, 160, 180, 200, 210, 220, 240, 260, 280, 320,
    360, 400, 420, 440, 480, 540, 600, 660, 720, 800, 880, 960, 0,
  ]);
  const box = new FontSizeBox(".", "");
  expect(box.GetEntries()).toEqual([]);
  box.Fill();
  expect(box.GetEntries()).toHaveLength(32);
  expect(box.GetEntries().at(-1)).toBe(960);
  box.Fill();
  expect(box.GetEntries()).toHaveLength(32);
  expect(Object.isFrozen(box.GetEntries())).toBe(true);
});

it.each([
  ["", 0],
  ["invalid", 20],
  [" ", 20],
  ["1", 20],
  ["-3 pt", 20],
  ["2", 20],
  ["13.3", 133],
  ["13.35 pt", 134],
  ["1/2 inch", 360],
  ["1 in", 720],
  ["1000 pt", 9999],
  ["999.94", 9999],
  ["0", 20],
] as const)(
  "preserves original ignored parse status and absolute bounds for %s",
  /** Invalid nonempty input uses zero then the20 lower bound; empty stays zero until reformat. @param text - Independent input. @param expected - Scaled result. @returns Nothing. */ (
    text,
    expected,
  ) => {
    const box = new FontSizeBox(".", "");
    box.set_active_or_entry_text(text);
    expect(box.get_active_text()).toBe(text);
    expect(box.get_value()).toBe(expected);
    box.ReformatHdl();
    expect(box.get_value()).toBe(Math.max(20, expected));
  },
);

it("retains locale decimal fields and original normalized conversion", /** No native locale provider or font service is replaced. @returns Nothing. */ () => {
  const box = new FontSizeBox(",", ".");
  box.set_active_or_entry_text("13,35 pt");
  expect(box.get_value()).toBe(134);
  box.ReformatHdl();
  expect(box.get_active_text()).toBe("13,4 pt");
  box.set_active_or_entry_text("13.3");
  expect(box.get_value()).toBe(133);
  box.SetValue(10, FieldUnit.INCH);
  expect(box.get_active_text()).toBe("72 pt");
  box.set_value(0);
  expect(box.get_active_text()).toBe("2 pt");
  box.set_value(99999);
  expect(box.get_active_text()).toBe("999,9 pt");
});
