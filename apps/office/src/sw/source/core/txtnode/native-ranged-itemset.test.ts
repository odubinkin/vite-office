/** @fileoverview Original ranged SetAttr, reset geometry, expansion flags and SwRegHistory::InsertItems contracts. */
import { assert, expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { Color } from "../../../../tools/inc/color";
import {
  RES_CHRATR_COLOR,
  RES_CHRATR_WEIGHT,
  RES_TXTATR_AUTOFMT,
  RES_TXTATR_CHARFMT,
  RES_TXTATR_INETFMT,
  WRITER_CHARACTER_WHICH_RANGES,
} from "../../../inc/hintids";
import { SwFormatCharFormat, SwFormatINetFormat } from "./fmtatr2";
import { SwFormatAutoFormat } from "./txatbase";
import { SwTextCharFormat } from "./txtatr2";
import { MakeTextAttr } from "./thints";
import { SetAttrMode } from "../../../inc/swtypes";
import type { TextAttributeOutput } from "./thints-setattr";
import { SwHistory, SwRegHistory, HISTORY_HINT } from "../undo/rolbck";
/** Builds complete actual values without a browser formatting projection. @param doc - Actual pool. @returns Direct native set. */
function colors(doc: SwDoc): SfxItemSet {
  const set = new SfxItemSet(doc.GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES);
  set.Put(new SvxColorItem(new Color(0x123456), RES_CHRATR_COLOR));
  set.Put(new SvxWeightItem(8, RES_CHRATR_WEIGHT));
  return set;
}
it("uses direct paragraph attributes only for a full range without character-format hints", /** Checks original direct/noformat branches and source return values. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("abcd");
  try {
    const set = colors(doc),
      output: TextAttributeOutput = [undefined];
    expect(node.SetAttr(set, 0, 4, SetAttrMode.DEFAULT, output)).toBe(true);
    expect(node.GetpSwpHints()).toBeUndefined();
    expect(output[0]).toBeUndefined();
    expect(
      node
        .GetpSwAttrSet()
        ?.GetItemIfSet(RES_CHRATR_COLOR, false)
        ?.equals(set.Get(RES_CHRATR_COLOR)),
    ).toBe(true);
    expect(node.SetAttr(set, 0, 4)).toBe(false);
    // A redundant hint insertion still reports native insertion success even when portion optimization removes its identity.
    expect(node.SetAttr(set, 1, 3)).toBe(true);
    expect(node.GetpSwpHints()).toBeUndefined();
  } finally {
    doc.Dispose();
  }
});
it("keeps full-span character changes as hints when a named style or hyperlink is present", /** IsCharFormatAttr includes both original concrete families. @returns Nothing. */ () => {
  for (const family of ["named", "link"] as const) {
    const doc = new SwDoc(),
      node = doc.paragraphs[0];
    assert(node);
    node.SetText("abcd");
    try {
      node.InsertItem(
        family === "named"
          ? new SwFormatCharFormat(doc.MakeCharFormat("Named", doc.GetDfltCharFormat()))
          : new SwFormatINetFormat("url", ""),
        0,
        4,
      );
      const output: TextAttributeOutput = [undefined];
      expect(node.SetAttr(colors(doc), 0, 4, SetAttrMode.DEFAULT, output)).toBe(true);
      expect(node.GetpSwAttrSet()?.GetItemIfSet(RES_CHRATR_COLOR, false)).toBeUndefined();
      expect(
        node
          .GetOrCreateSwpHints()
          .entries()
          .filter(
            /** Selects actual automatic hints. @param hint - Attribute. @returns Family match. */ (
              hint,
            ) => hint.Which() === RES_TXTATR_AUTOFMT,
          ),
      ).toHaveLength(1);
      expect(output[0]).toBeUndefined();
    } finally {
      doc.Dispose();
    }
  }
});
it("honors NOFORMATATTR and exposes only the first explicit text-attribute output", /** Original automatic grouping does not write the optional pointer output. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("abcd");
  try {
    const set = colors(doc),
      output: TextAttributeOutput = [undefined];
    expect(node.SetAttr(set, 0, 4, SetAttrMode.NOFORMATATTR, output)).toBe(true);
    expect(node.GetpSwAttrSet()).toBeUndefined();
    expect(output[0]).toBeUndefined();
    const text = new SfxItemSet(doc.GetAttrPool(), [[53, 55]]);
    text.Put(new SwFormatCharFormat(doc.MakeCharFormat("Named", doc.GetDfltCharFormat())));
    text.Put(new SwFormatINetFormat("url", ""));
    expect(node.SetAttr(text, 1, 3, SetAttrMode.DEFAULT, output)).toBe(true);
    expect(output[0]?.Which()).toBe(RES_TXTATR_CHARFMT);
    const retained = output[0];
    node.SetAttr(text, 0, 1, SetAttrMode.DEFAULT, output);
    expect(output[0]).toBe(retained);
  } finally {
    doc.Dispose();
  }
});
it("reports the native default-character-style reset result and closes the left boundary", /** The source insertion counter excludes reset-only mutations. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("abcdef");
  try {
    const style = doc.MakeCharFormat("Named", doc.GetDfltCharFormat());
    node.InsertItem(new SwFormatCharFormat(style), 0, 6);
    const set = new SfxItemSet(doc.GetAttrPool(), [[55, 55]]);
    set.Put(new SwFormatCharFormat(doc.GetDfltCharFormat()));
    expect(node.SetAttr(set, 2, 4)).toBe(false);
    const hints = node.GetOrCreateSwpHints().entries();
    expect(
      hints.map(
        /** Reads exact native reset remnants. @param hint - Attribute. @returns Range. */ (
          hint,
        ) => [hint.start, hint.end],
      ),
    ).toEqual([
      [0, 2],
      [4, 6],
    ]);
    expect(hints[0]?.DontExpand()).toBe(true);
    expect(hints[1]?.DontExpand()).toBe(false);
    for (const hint of hints) {
      assert(hint instanceof SwTextCharFormat);
      expect(hint.GetAttr().GetCharFormat()).toBe(style);
    }
  } finally {
    doc.Dispose();
  }
});
it("records direct and ranged sets through the original scoped history owner", /** Uses actual registered node dispatch and refetches the map after insertion/deletion. @returns Nothing. */ () => {
  for (const direct of [false, true]) {
    const doc = new SwDoc(),
      node = doc.paragraphs[0];
    assert(node);
    node.SetText("abcd");
    const history = new SwHistory(),
      recorder = new SwRegHistory(node, node, history);
    try {
      expect(
        recorder.InsertItems(colors(doc), direct ? 0 : 1, direct ? 4 : 3, SetAttrMode.DEFAULT),
      ).toBe(true);
      expect(history.Count()).toBeGreaterThan(0);
      expect(node.GetpSwpHints()?.GetHistory()).toBeUndefined();
      history.Rollback(doc);
      expect(node.GetpSwAttrSet()?.GetItemIfSet(RES_CHRATR_COLOR, false)).toBeUndefined();
      expect(node.GetpSwpHints()?.Count() ?? 0).toBe(0);
      expect(node.GetText()).toBe("abcd");
    } finally {
      recorder.Dispose();
      doc.Dispose();
    }
  }
});
/** Independent interval coverage cases for all registered ranged families. */
const cases: [number, number, number, number, number][] = [];
for (const family of [53, 54, 55])
  for (let a = 0; a <= 4; a++)
    for (let b = a; b <= 4; b++)
      for (let c = 0; c <= 4; c++) for (let d = c; d <= 4; d++) cases.push([family, a, b, c, d]);
it.each(cases)(
  "retains source reset coverage for family%s [%s,%s] minus [%s,%s]",
  /** Checks all half-open interval boundaries, including source end-of-paragraph point handling. @param family - Original Which. @param a - Hint start. @param b - Hint end. @param c - Reset start. @param d - Reset end. @returns Nothing. */ (
    family,
    a,
    b,
    c,
    d,
  ) => {
    const doc = new SwDoc(),
      node = doc.paragraphs[0];
    assert(node);
    node.SetText("abcd");
    try {
      const item =
        family === 53
          ? MakeTextAttr(doc, colors(doc), a, b).GetAttr()
          : family === 54
            ? new SwFormatINetFormat("url", "")
            : new SwFormatCharFormat(doc.MakeCharFormat("Named", doc.GetDfltCharFormat()));
      node.InsertItem(item, a, b, SetAttrMode.NOHINTADJUST);
      node.RstTextAttr(c, d - c);
      const expected: [number, number][] = [];
      if (a === b) {
        if (!((c <= a && a < d) || (a === d && d === 4) || (c === d && a === c)))
          expected.push([a, b]);
      } else if (c === d || b <= c || d <= a) expected.push([a, b]);
      else {
        if (a < c) expected.push([a, c]);
        if (d < b) expected.push([d, b]);
      }
      expect(
        (node.GetpSwpHints()?.entries() ?? []).map(
          /** Reads actual surviving coverage. @param hint - Native attribute. @returns Native interval. */ (
            hint,
          ) => [hint.start, hint.end],
        ),
      ).toEqual(expected);
      expect(node.GetText()).toBe("abcd");
    } finally {
      doc.Dispose();
    }
  },
);
it("retains exact-range precedence and its original missing final notification", /** Exact range ignores Which/set and only removes matching automatic hints in the represented model. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("abcd");
  try {
    node.InsertItem(MakeTextAttr(doc, colors(doc), 0, 4).GetAttr(), 0, 4, SetAttrMode.NOHINTADJUST);
    node.InsertItem(new SwFormatINetFormat("url", ""), 0, 4);
    const native = vi.spyOn(node, "CallSwClientNotify"),
      browser = vi.spyOn(doc, "NotifyModelChange");
    node.RstTextAttr(
      0,
      4,
      RES_TXTATR_INETFMT,
      new SfxItemSet(doc.GetAttrPool(), [[1, 48]]),
      false,
      true,
    );
    expect(
      node
        .GetOrCreateSwpHints()
        .entries()
        .map(
          /** Reads actual remaining family. @param hint - Attribute. @returns Native Which. */ (
            hint,
          ) => hint.Which(),
        ),
    ).toEqual([RES_TXTATR_INETFMT]);
    expect(native).not.toHaveBeenCalled();
    expect(browser).not.toHaveBeenCalled();
  } finally {
    vi.restoreAllMocks();
    doc.Dispose();
  }
});
it("sets expansion only on nonempty unlocked ending hints and records only the old value", /** Checks source end-map traversal and original one-entry history behavior. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("abcd");
  const history = new SwHistory(),
    recorder = new SwRegHistory(node, node, history);
  try {
    const item = MakeTextAttr(doc, colors(doc), 0, 2).GetAttr();
    const full = node.InsertItem(item, 0, 2, SetAttrMode.NOHINTADJUST),
      empty = node.InsertItem(item, 2, 2, SetAttrMode.NOHINTADJUST);
    assert(full);
    assert(empty);
    node.InsertItem(new SwFormatINetFormat("url", ""), 0, 2);
    node.GetOrCreateSwpHints().Register(recorder);
    expect(node.DontExpandFormat(2, true, false)).toBe(true);
    expect(full.DontExpand()).toBe(true);
    expect(empty.DontExpand()).toBe(false);
    expect(history.Count()).toBe(1);
    expect(history.at(0).Which()).toBe(HISTORY_HINT.HSTRY_SETTXTHNT);
    expect(node.DontExpandFormat(2, true, false)).toBe(false);
  } finally {
    node.GetpSwpHints()?.DeRegister();
    recorder.Dispose();
    doc.Dispose();
  }
});
it.each(
  cases.filter(
    /** Selects the actual automatic-style family. @param value - Interval case. @returns Automatic case. */ (
      value,
    ) => value[0] === RES_TXTATR_AUTOFMT,
  ),
)(
  "selectively removes only color from automatic family%s [%s,%s] in [%s,%s]",
  /** Checks independent per-character coverage of the reduced and retained native item sets. @param _family - Automatic family. @param a - Original start. @param b - Original end. @param c - Reset start. @param d - Reset end. @returns Nothing. */ (
    _family,
    a,
    b,
    c,
    d,
  ) => {
    const doc = new SwDoc(),
      node = doc.paragraphs[0];
    assert(node);
    node.SetText("abcd");
    try {
      node.InsertItem(
        MakeTextAttr(doc, colors(doc), a, b).GetAttr(),
        a,
        b,
        SetAttrMode.NOHINTADJUST,
      );
      node.RstTextAttr(c, d - c, RES_CHRATR_COLOR);
      for (let offset = 0; offset < 4; ++offset) {
        const collected = new SfxItemSet(doc.GetAttrPool(), WRITER_CHARACTER_WHICH_RANGES);
        node.GetParaAttr(collected, offset, offset + 1, true);
        const covered = a <= offset && offset < b;
        expect(collected.GetItemIfSet(RES_CHRATR_WEIGHT, false) !== undefined).toBe(covered);
        expect(collected.GetItemIfSet(RES_CHRATR_COLOR, false) !== undefined).toBe(
          covered && !(c <= offset && offset < d),
        );
      }
    } finally {
      doc.Dispose();
    }
  },
);
it("rolls back a selective interior reset through its real old/new ranged history", /** Exercises original split remnants and automatic-style reset records together. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("abcdef");
  const original = colors(doc),
    history = new SwHistory(),
    recorder = new SwRegHistory(node, node, history);
  try {
    node.InsertItem(MakeTextAttr(doc, original, 0, 6).GetAttr(), 0, 6, SetAttrMode.NOHINTADJUST);
    node.GetOrCreateSwpHints().Register(recorder);
    node.RstTextAttr(2, 2, RES_CHRATR_COLOR);
    node.GetpSwpHints()?.DeRegister();
    expect(node.GetpSwpHints()?.Count()).toBe(3);
    history.Rollback(doc);
    const hints = node.GetOrCreateSwpHints().entries();
    expect(hints).toHaveLength(1);
    expect([hints[0]?.GetStart(), hints[0]?.GetEnd()]).toEqual([0, 6]);
    const item = hints[0]?.GetAttr();
    assert(item instanceof SwFormatAutoFormat);
    expect(item.GetStyleHandle().Equals(original, true)).toBe(true);
  } finally {
    node.GetpSwpHints()?.DeRegister();
    recorder.Dispose();
    doc.Dispose();
  }
});
