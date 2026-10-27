/** @fileoverview Source-based INET nesting geometry, actual node/style ownership and native hint-history tests. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwFormatINetFormat } from "./fmtatr2";
import { SwTextINetFormat } from "./txtatr2";
import { SwPoolFormatId } from "../../../inc/poolfmt";
import { SwHistory, SwRegHistory } from "../undo/rolbck";
import { SetAttrMode } from "../../../inc/swtypes";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { Color } from "../../../../tools/inc/color";
import { RES_CHRATR_COLOR, RES_UPDATEATTR_ATTRSET_CHG } from "../../../inc/hintids";
import { UpdateAttrHint } from "../../../inc/hints";
/** Original old extent and insertion extent cases. */
const cases: [number, number, number, number][] = [];
for (let a = 0; a <= 4; a++)
  for (let b = a; b <= 4; b++)
    for (let c = 0; c <= 4; c++) for (let d = c; d <= 4; d++) cases.push([a, b, c, d]);
it.each(cases)(
  "preserves native old [%s,%s] and inserts [%s,%s] without nesting hyperlinks",
  /** Compares actual produced ranges to independently defined hyperlink replacement coverage, including source empty-boundary asymmetry. @param a - Old start. @param b - Old end. @param c - New start. @param d - New end. @returns Nothing. */ (
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
      node.InsertItem(new SwFormatINetFormat("old", ""), a, b);
      const incoming = node.InsertItem(new SwFormatINetFormat("new", ""), c, d);
      const swallowed = c === d && a < c && c < b;
      if (swallowed) expect(incoming).toBeUndefined();
      else assert(incoming instanceof SwTextINetFormat);
      const expected: [number, number, string][] = swallowed ? [] : [[c, d, "new"]];
      if (a === b) {
        if (a < c || d < a) expected.push([a, b, "old"]);
      } else if (c === d) {
        if (a < c && c < b) expected.push([a, c, "old"], [c, b, "old"]);
        else expected.push([a, b, "old"]);
      } else {
        if (a < c) expected.push([a, Math.min(b, c), "old"]);
        if (d < b) expected.push([Math.max(a, d), b, "old"]);
      }
      const hints = node.GetOrCreateSwpHints();
      expect(
        hints.entries().map(
          /** Captures actual source endpoints and URL. @param hint - Native attribute. @returns Primitive tuple. */ (
            hint,
          ) => {
            assert(hint instanceof SwTextINetFormat);
            return [hint.start, hint.end, hint.GetAttr().GetValue()];
          },
        ),
      ).toEqual(expect.arrayContaining(expected));
      expect(hints.Count()).toBe(expected.length);
      for (const hint of hints.entries()) {
        assert(hint instanceof SwTextINetFormat);
        expect(hint.GetpTextNode()).toBe(node);
        expect(hint.GetRegisteredIn()).toBe(
          doc.GetCharFormatFromPool(SwPoolFormatId.CHR_INET_NORMAL),
        );
        expect([hint.DontExpand(), hint.IsDontExpandStartAttr(), hint.IsLockExpandFlag()]).toEqual([
          true,
          true,
          true,
        ]);
      }
    } finally {
      doc.Dispose();
    }
  },
);
it("preserves truncated owners, creates fresh right fragments and detaches fully overwritten style clients", /** Checks original pass2/pass4 ownership rather than only visible URL coverage. @returns Nothing. */ () => {
  for (const [a, b, c, d, range] of [
    [2, 6, 0, 4, [4, 6]],
    [0, 4, 2, 6, [0, 2]],
    [0, 6, 2, 4, [0, 2]],
    [2, 4, 0, 6, undefined],
  ] as const) {
    const doc = new SwDoc(),
      node = doc.paragraphs[0];
    assert(node);
    node.SetText("abcdef");
    try {
      const original = node.InsertItem(new SwFormatINetFormat("old", ""), a, b);
      assert(original instanceof SwTextINetFormat);
      node.InsertItem(new SwFormatINetFormat("new", ""), c, d, SetAttrMode.DONTREPLACE);
      if (range === undefined) {
        expect(original.GetRegisteredIn()).toBeUndefined();
        expect(node.GetOrCreateSwpHints().entries()).not.toContain(original);
      } else {
        expect([original.start, original.end]).toEqual(range);
        expect(node.GetOrCreateSwpHints().entries()).toContain(original);
      }
    } finally {
      doc.Dispose();
    }
  }
});
it("restores nested link replacement through original reset/old-value history", /** Uses real native history receiver and source metadata, without fragment replacement. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("abcdef");
  const original = node.InsertItem(new SwFormatINetFormat("old", "target"), 0, 6);
  assert(original);
  const history = new SwHistory(),
    recorder = new SwRegHistory(node, node, history);
  node.GetOrCreateSwpHints().Register(recorder);
  try {
    node.InsertItem(new SwFormatINetFormat("new", "other"), 2, 4);
    node.GetOrCreateSwpHints().DeRegister();
    expect(history.Count()).toBeGreaterThan(2);
    history.Rollback(doc);
    const hints = node.GetOrCreateSwpHints();
    expect(hints.Count()).toBe(1);
    const restored = hints.Get(0);
    assert(restored instanceof SwTextINetFormat);
    expect([restored.start, restored.end, restored.GetAttr().GetValue()]).toEqual([0, 6, "old"]);
    expect(hints.Get(0).GetAttr().equals(original.GetAttr())).toBe(true);
  } finally {
    node.GetpSwpHints()?.DeRegister();
    recorder.Dispose();
    doc.Dispose();
  }
});
it("initializes original transient flags and forwards actual pool-style changes only while node-bound", /** Observes genuine source range notifications and native independent validity setters. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("abcd");
  const attr = node.InsertItem(new SwFormatINetFormat("url", ""), 1, 3);
  assert(attr instanceof SwTextINetFormat);
  try {
    expect([attr.IsVisited(), attr.IsVisitedValid()]).toEqual([false, false]);
    attr.SetVisited(true);
    expect(attr.IsVisitedValid()).toBe(false);
    attr.SetVisitedValid(true);
    expect(attr.IsVisited()).toBe(true);
    const updates: UpdateAttrHint[] = [];
    const trigger = node.TriggerNodeUpdate.bind(node);
    node.TriggerNodeUpdate =
      /** Captures original source callback values. @param hint - Native update. @returns Nothing. */ (
        hint,
      ) => {
        updates.push(hint);
        trigger(hint);
      };
    const style = doc.GetCharFormatFromPool(SwPoolFormatId.CHR_INET_NORMAL);
    assert(style);
    expect(attr.GetRegisteredIn()).toBe(style);
    style.SetFormatAttr(new SvxColorItem(new Color(0x123456), RES_CHRATR_COLOR));
    expect(updates).toHaveLength(1);
    expect(updates[0]?.m_pNew?.getWhichAttr()).toBe(RES_UPDATEATTR_ATTRSET_CHG);
    expect([updates[0]?.m_pNew?.getStart(), updates[0]?.m_pNew?.getEnd()]).toEqual([1, 3]);
    attr.ChgTextNode(undefined);
    style.SetFormatAttr(new SvxColorItem(new Color(0xabcdef), RES_CHRATR_COLOR));
    expect(updates).toHaveLength(1);
    attr.ChgTextNode(node);
    style.SetFormatAttr(new SvxColorItem(new Color(0x010203), RES_CHRATR_COLOR));
    expect(updates).toHaveLength(2);
  } finally {
    attr.EndListeningAll();
    doc.Dispose();
  }
});
it("retains success independently of the incoming identity and nesting independently of NOHINTADJUST", /** Source InsertHint can succeed while recursive repairs destroy the inserted empty attribute. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("abcd");
  try {
    node.InsertItem(new SwFormatINetFormat("old", ""), 0, 4);
    const incoming = new SwTextINetFormat(new SwFormatINetFormat("point", ""), 2, 2);
    expect(node.InsertHint(incoming, SetAttrMode.NOHINTADJUST)).toBe(true);
    expect(node.GetOrCreateSwpHints().entries()).not.toContain(incoming);
    expect(incoming.GetRegisteredIn()).toBeUndefined();
    expect(
      node
        .GetOrCreateSwpHints()
        .entries()
        .map(
          /** Reads surviving original pieces. @param hint - Actual attribute. @returns Native range. */ (
            hint,
          ) => [hint.start, hint.end],
        ),
    ).toEqual([
      [0, 2],
      [2, 4],
    ]);
  } finally {
    doc.Dispose();
  }
});
it("releases the independent native client on exact deletion, clear and browser node-map replacement", /** Actual source style registrations are retained only while the attribute's lifetime requires them. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText("abcd");
  try {
    const style = doc.GetCharFormatFromPool(SwPoolFormatId.CHR_INET_NORMAL);
    assert(style);
    for (const removal of ["delete", "clear", "replace"] as const) {
      const attr = node.InsertItem(new SwFormatINetFormat("url", ""), 0, 4);
      assert(attr instanceof SwTextINetFormat);
      expect(style.HasWriterListeners()).toBe(true);
      if (removal === "delete") node.DeleteAttributes(attr.Which(), 0, 4);
      else if (removal === "clear") node.ClearSwpHintsArr(false);
      else node.SetText("abcd");
      expect(attr.GetRegisteredIn()).toBeUndefined();
      expect(style.HasWriterListeners()).toBe(false);
    }
  } finally {
    doc.Dispose();
  }
});
