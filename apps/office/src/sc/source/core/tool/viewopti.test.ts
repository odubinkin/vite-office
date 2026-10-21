/** @fileoverview Native boolean view defaults and document/view value boundaries without configuration or window substitutes. */
import { expect, it } from "vitest";
import { ScViewOptions, ViewOption } from "../../../inc/viewopti";
import { ScDocument } from "../../../inc/document";
import { ScViewData } from "../../ui/inc/viewdata";
it("retains every original boolean ordinal/default and independently copies/assigns/resets the array", /** Checks actual value owners. @returns Nothing. */ () => {
  const a = new ScViewOptions(),
    expected = [
      false,
      true,
      false,
      true,
      true,
      false,
      true,
      true,
      true,
      true,
      true,
      true,
      false,
      false,
      true,
      true,
      true,
      false,
      false,
    ];
  for (let i = 0; i < expected.length; i++) {
    expect(a.GetOption(i)).toBe(expected[i]);
    a.SetOption(i, !expected[i]);
  }
  const b = new ScViewOptions(a),
    c = new ScViewOptions();
  expect(c.copy_assign(b)).toBe(c);
  a.SetDefaults();
  b.SetDefaults();
  for (let i = 0; i < expected.length; i++) {
    expect(a.GetOption(i)).toBe(expected[i]);
    expect(b.GetOption(i)).toBe(expected[i]);
    expect(c.GetOption(i)).toBe(!expected[i]);
  }
  expect(ViewOption.THEMEDCURSOR).toBe(18);
});
it("copies document flags into independent views and preserves borrowed document/view owner identity", /** Verifies actual native assignment boundaries. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    defaults = doc.GetViewOptions(),
    first = new ScViewData(doc),
    borrowed = first.GetOptions();
  first.SetHeaderMode(false);
  expect(doc.GetViewOptions().GetOption(ViewOption.HEADER)).toBe(true);
  const options = new ScViewOptions(first.GetOptions());
  options.SetOption(ViewOption.FORMULAS, true);
  first.SetOptions(options);
  doc.SetViewOptions(options);
  options.SetDefaults();
  expect(first.GetOptions()).toBe(borrowed);
  expect(doc.GetViewOptions()).toBe(defaults);
  const second = new ScViewData(doc);
  expect(second.IsHeaderMode()).toBe(false);
  expect(second.GetOptions().GetOption(ViewOption.FORMULAS)).toBe(true);
  second.SetHeaderMode(true);
  expect(first.IsHeaderMode()).toBe(false);
});
it("allocates all selected tab data on SetShowGrid but only changes the current sheet", /** Replays CreateSelectedTabData and per-sheet ownership. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    view = new ScViewData(doc),
    marks = view.GetMarkData();
  marks.SelectTable(2, true);
  expect(view.GetCurXForTab(2)).toBe(-1);
  view.SetShowGrid(false);
  expect(view.GetShowGrid()).toBe(false);
  expect(view.GetCurXForTab(2)).toBe(0);
  view.SetTabNo(2);
  expect(view.GetShowGrid()).toBe(true);
  view.SetShowGrid(false);
  view.SetTabNo(0);
  expect(view.GetShowGrid()).toBe(false);
  view.SetTabNo(1);
  expect(view.GetShowGrid()).toBe(true);
});
