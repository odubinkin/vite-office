/** @fileoverview Native formatting boundary admission, complete item requests, fallback view and headless history behavior. */
import { expect, it, vi } from "vitest";
import { createCalcSession } from "../../../browser/composition/calc-module";
import { GetSelectionPattern } from "./viewfunc";
import { ScFormatShell } from "./formatsh";
import { ScViewData } from "../inc/viewdata";
import { ScCellShell } from "./cellsh3";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScPatternAttr } from "../../../inc/patattr";
import { ScMarkData } from "../../../inc/markdata";
import { ScDocument } from "../../../inc/document";
import {
  SvxBoxItem,
  SvxBoxInfoItem,
  SvxBoxItemLine as E,
  SvxBoxInfoItemLine as I,
  SvxBoxInfoItemValidFlags as V,
} from "../../../../editeng/source/items/frmitems";
import { SvxLineItem } from "../../../../editeng/inc/lineitem";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import { SvxShadowedItem, SvxCharReliefItem } from "../../../../editeng/source/items/textitem";
import { Color } from "../../../../tools/inc/color";
import { SfxRequest } from "../../../../sfx2/source/control/request";
import { SfxUInt16Item, SfxInt32Item } from "../../../../svl/source/items/intitem";
import { SfxItemSet } from "../../../../svl/inc/itemset";
import { SfxUnoAnyItem } from "../../../../sfx2/source/view/frame";
import { ScUndoWidthOrHeight } from "../undo/undoblk2";
import { ScUndoIndent } from "../undo/undoblk";
import { ScUndoSelectionAttr } from "../undo/undoblk3";
import { ScUndoCursorAttr } from "../undo/undocell";
import {
  ApplyAttributesToCellOperation,
  ApplyAttributesWithChangedRangeOperation,
} from "../operation/ApplyAttributesOperation";
/** Original operation record flag is inherited and can be disabled by derived operations. */
class CursorNoRecord extends ApplyAttributesToCellOperation {
  /** Checks the native boundary contract against actual owners. @returns Observed test result. */ disable() {
    this.mbRecord = false;
  }
}
/** Original operation recording branch. */
class SelectionNoRecord extends ApplyAttributesWithChangedRangeOperation {
  /** Checks the native boundary contract against actual owners. @returns Observed test result. */ disable() {
    this.mbRecord = false;
  }
}
it("rejects unsupported requests and uses actual fallback view with original no-argument command rules", /** rejects unsupported requests and uses actual fallback view with original no-argument command rules. @returns Observed test result. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    doc = c.shell.GetDocument(),
    data = new ScViewData(doc),
    format = new ScFormatShell(data, c.shell);
  try {
    expect(format.ExecuteBorder(new SfxRequest(10188))).toBe(false);
    expect(format.GetFrameLineState(true).enabled).toBe(true);
    expect(new ScFormatShell(c.viewData, c.shell).ExecuteBorder(new SfxRequest(10188))).toBe(false);
    const unsupported = new SfxRequest(999, [new SvxLineItem(141)]);
    expect(c.ExecuteBorder(unsupported)).toBe(false);
    expect(c.ExecuteBorder(new SfxRequest(11013, [new SvxBoxItem(150)]))).toBe(false);
    expect(c.ExecuteRowHeight(new SfxRequest(26286))).toBe(false);
    const blocked = vi.spyOn(c, "Commit").mockReturnValue(false);
    expect(c.ChangeIndent(true)).toBe(false);
    expect(c.ExecuteBorder(new SfxRequest(10188))).toBe(false);
    expect(c.SetShadowed()).toBe(false);
    expect(c.SetCharacterRelief(new SvxCharReliefItem(0, 124))).toBe(false);
    c.ShowRows(true);
    blocked.mockRestore();
  } finally {
    s.Close();
  }
});
it("validates browser border/effect transport before native mutation", /** validates browser border/effect transport before native mutation. @returns Observed test result. */ () => {
  const s = createCalcSession(),
    d = s.frame.GetDispatcher(),
    c = s.controller;
  try {
    for (const input of [null, 7, {}, { OuterBorder: 7 }]) {
      expect(
        /** Sends malformed native transport. @returns Dispatch result. */ () =>
          d.ExecuteRequest(new SfxRequest(10188, [new SfxUnoAnyItem(10188, input)])),
      ).toThrow("Border command requires");
    }
    expect(
      /** Rejects wrong shadow item. @returns Dispatch result. */ () =>
        d.Execute(".uno:Shadowed", [new SvxLineItem(141)]),
    ).toThrow("SvxShadowedItem");
    expect(
      /** Rejects wrong relief item. @returns Dispatch result. */ () =>
        d.Execute(".uno:CharacterRelief", [new SvxLineItem(141)]),
    ).toThrow("SvxCharReliefItem");
    expect(d.Execute(".uno:CharacterRelief")).toMatchObject({ value: false });
    d.Execute(".uno:Shadowed", [new SvxShadowedItem(true, 108)]);
    expect(c.GetShadowState()).toBe(true);
    const up = new SvxLineItem(142);
    up.SetLine(new SvxBorderLine(null, 20));
    d.Execute(".uno:BorderBLTR", { BorderBLTR: up });
    const box = new SvxBoxItem(150);
    box.SetLine(new SvxBorderLine(new Color(0xff0000), 20), E.TOP);
    box.SetLine(new SvxBorderLine(new Color(0x0000ff), 20), E.BOTTOM);
    d.Execute(".uno:SetBorderStyle", { OuterBorder: box, InnerBorder: new SvxBoxInfoItem(151) });
    expect(c.GetFrameLineState(true).mixed).toBe(true);
    expect(c.GetFrameLineState(false).mixed).toBe(true);
    c.Select(1, 0);
    c.viewData.GetMarkData().SetMarkArea(new ScRange(0, 0, 0, 1, 0, 0));
    expect(c.GetDiagonalState(142).mixed).toBe(true);
    expect(d.QueryState(".uno:Shadowed").mixed).toBe(true);
    d.Execute(".uno:CharacterRelief", [new SvxCharReliefItem(1, 124)]);
    c.viewData.GetMarkData().ResetMark();
    c.Select(2, 0);
    c.viewData.GetMarkData().SetMarkArea(new ScRange(0, 0, 0, 2, 0, 0));
    expect(d.QueryState(".uno:CharacterRelief").mixed).toBe(true);
  } finally {
    s.Close();
  }
});
it("consumes source three-width and missing-inner border branches and zero-width inner substitution", /** consumes source three-width and missing-inner border branches and zero-width inner substitution. @returns Observed test result. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    view = required(c.viewData.GetViewShell());
  try {
    const line = new SvxLineItem(10201);
    line.SetLine(new SvxBorderLine(null, 20));
    view.SetDefaultFrameLine(undefined);
    c.ExecuteBorder(
      new SfxRequest(10201, [
        line,
        ...[21160, 21161, 21162].map(
          /** Checks the native boundary contract against actual owners. @param n - Actual test input. @returns Observed test result. */ (
            n,
          ) => new SfxUInt16Item(n, 15),
        ),
      ]),
    );
    expect(view.GetDefaultFrameLine()?.GetColor().toUInt32()).toBe(0);
    view.SetDefaultFrameLine(undefined);
    c.ExecuteBorder(new SfxRequest(10202, [new SvxColorItem(new Color(0x123456), 10202)]));
    expect(view.GetDefaultFrameLine()?.GetColor().toUInt32()).toBe(0x123456);
    c.ExecuteBorder(new SfxRequest(10024, [new SvxBoxItem(150)]));
    const inner = new SvxBoxInfoItem(151);
    inner.SetLine(new SvxBorderLine(), I.HORI);
    inner.SetLine(new SvxBorderLine(), I.VERT);
    c.ExecuteBorder(new SfxRequest(10188, [inner]));
    const actual = new ScFormatShell(c.viewData, c.shell);
    expect(actual.GetFrameLineState(false).enabled).toBe(false);
  } finally {
    s.Close();
  }
});
it("records optional operation outputs and preserves no-view/no-record semantics and copied history ranges", /** records optional operation outputs and preserves no-view/no-record semantics and copied history ranges. @returns Observed test result. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    doc = c.shell.GetDocument(),
    p = new ScPatternAttr(doc.getCellAttributeHelper()),
    m = new ScMarkData(c.viewData.GetMarkData()),
    pos = new ScAddress();
  p.ItemSetPut(new SvxShadowedItem(true, 108));
  m.SetMarkArea(new ScRange(0, 0, 0, 0, 1, 0));
  m.MarkToMulti();
  try {
    const missing = new ApplyAttributesToCellOperation(c.shell, pos, p, false),
      missingSelection = new ApplyAttributesWithChangedRangeOperation(c.shell, m, true, p, false);
    expect(missing.run()).toBe(false);
    expect(missingSelection.run()).toBe(false);
    expect(missing.getChangedRangeList().size()).toBe(0);
    expect(missingSelection.getChangedRangeList().size()).toBe(0);
    const a = new CursorNoRecord(c.shell, pos, p, false, c.viewData),
      b = new SelectionNoRecord(c.shell, m, true, p, false, c.viewData);
    a.disable();
    b.disable();
    expect(a.run()).toBe(true);
    expect(b.run()).toBe(true);
    expect(a.getChangedRangeList().size()).toBe(1);
    expect(b.getChangedRangeList().size()).toBe(1);
    expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(0);
    const action = new ScUndoCursorAttr(c.shell, pos, p, p, p);
    action.UndoWithContext();
    action.RedoWithContext();
    expect(action.getAffectedRange()).toEqual(new ScRange(pos));
    action.Dispose();
    const undo = new ScDocument(),
      selection = new ScUndoSelectionAttr(c.shell, m, new ScRange(pos), undo, p);
    selection.Dispose();
    const indent = new ScUndoIndent(c.shell, m, new ScDocument(), false);
    expect(indent.GetComment()).toBe("Decrease Indent");
    expect(indent.GetMarkData()).toEqual(m);
    indent.Dispose();
    const shell = new ScCellShell(required(c.viewData.GetViewShell()));
    m.ResetMark();
    c.viewData.GetMarkData().SetMarkArea(new ScRange(0, 1, 0, doc.MaxCol(), 2, 0));
    const request = new SfxRequest(26286, [
      new SfxUInt16Item(26286, 1270),
      new SfxInt32Item(21160, 2),
    ]);
    expect(shell.ExecuteRowHeight(request, c.viewData)).toBe(true);
  } finally {
    p.Dispose();
    s.Close();
  }
});
it("separates attribute-only, frame-only and selective-validity apply paths including mixed diagonals", /** separates attribute-only, frame-only and selective-validity apply paths including mixed diagonals. @returns Observed test result. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    view = required(c.viewData.GetViewShell()),
    doc = c.shell.GetDocument(),
    pool = doc.GetPool(),
    old = new SfxItemSet(pool, [[100, 151]]),
    next = new SfxItemSet(pool, [[100, 151]]);
  try {
    next.Put(new SvxShadowedItem(true, 108));
    view.ApplyAttributes(next, old, false);
    expect(c.GetShadowState()).toBe(true);
    const o = new SvxBoxItem(150);
    o.SetLine(new SvxBorderLine(null, 20), E.TOP);
    next.ClearItem();
    next.Put(o);
    view.ApplyAttributes(next, old);
    next.ClearItem();
    const i = new SvxBoxInfoItem(151);
    i.SetValid(V.ALL, false);
    next.Put(i);
    view.ApplyAttributes(next, old);
    c.viewData.GetMarkData().SetMarkArea(new ScRange(0, 0, 0, 1, 1, 0));
    view.ApplyAttributes(next, old);
    c.viewData.GetMarkData().MarkToMulti();
    view.ApplyAttributes(next, old);
    c.viewData.GetMarkData().ResetMark();
    const diag = new SvxLineItem(141);
    diag.SetLine(new SvxBorderLine(null, 20));
    c.ExecuteBorder(new SfxRequest(11013, [diag]));
    view.SetSelectionFrameLines(new SvxBorderLine(new Color(0xff0000), 40), true);
    expect(
      (required(doc.GetPattern(new ScAddress())).GetItem(141) as SvxLineItem)
        .GetLine()
        ?.GetColor()
        .toUInt32(),
    ).toBe(0xff0000);
    c.viewData.GetMarkData().SetMarkArea(new ScRange(0, 0, 0, 1, 1, 0));
    doc.ApplyPattern(1, 0, 0, new ScPatternAttr(doc.getCellAttributeHelper()));
    view.GetSelectionFrame();
    expect(c.GetFrameLineState(true).mixed).toBe(true);
  } finally {
    old.ClearItem();
    next.ClearItem();
    s.Close();
  }
});

/** Requires an actual test fixture owner and fails at its missing boundary. @param value - Actual fixture value. @returns Present fixture. */
function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error("Missing actual fixture owner");
  return value;
}
it("retains actual request items when native virtual cloning cannot produce a mapped copy", /** Failed-clone admission has no invented substitute item. @returns Nothing. */ () => {
  const s = createCalcSession(),
    item = new SvxBoxItem(10024),
    clone = vi.spyOn(item, "Clone").mockReturnValue(null as unknown as SvxBoxItem);
  try {
    expect(s.frame.GetDispatcher().Execute(".uno:SetBorderStyle", [item])).toMatchObject({
      value: true,
    });
  } finally {
    clone.mockRestore();
    s.Close();
  }
});
it("restores the original active sheet before redoing a native height action", /** Original redo view-tab branch over real history. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller;
  try {
    c.InsertSheet();
    c.SelectTab(0);
    c.CompleteRowHeight(600);
    const action = c.shell.GetUndoManager().GetUndoAction() as ScUndoWidthOrHeight;
    expect(action.GetComment()).toBe("Row Height");
    expect(c.Undo()).toBe(true);
    c.SelectTab(1);
    action.RedoWithContext();
    expect(c.viewData.GetTabNumber()).toBe(0);
  } finally {
    s.Close();
  }
});
it("retains headless formatting, native history labels and API row-height completion boundaries", /** Actual fallback view and source call mode. @returns Nothing. */ async () => {
  const { SfxCallMode } = await import("../../../../sfx2/source/control/bindings"),
    { ScSizeMode } = await import("../../../inc/global"),
    { ColRowSpan } = await import("../../../inc/columnspanset"),
    s = createCalcSession(),
    c = s.controller,
    doc = c.shell.GetDocument(),
    p = new ScPatternAttr(doc.getCellAttributeHelper()),
    m = new ScMarkData(c.viewData.GetMarkData());
  try {
    const format = new ScFormatShell(new ScViewData(doc), c.shell);
    expect(format.SetShadowed()).toBe(true);
    const cursor = new ScUndoCursorAttr(c.shell, new ScAddress(), p, p, p);
    expect(cursor.GetComment()).toBe("Attributes");
    cursor.Dispose();
    const indent = new ScUndoIndent(c.shell, m, new ScDocument(), true);
    expect(indent.GetComment()).toBe("Increase Indent");
    indent.Dispose();
    const req = new SfxRequest(26286, [new SfxUInt16Item(26286, 1270)], SfxCallMode.API);
    expect(c.ExecuteRowHeight(req)).toBe(true);
    expect(req.IsDone()).toBe(false);
    required(c.viewData.GetViewShell()).SetWidthOrHeight(
      false,
      [new ColRowSpan(0, 0)],
      ScSizeMode.SC_SIZE_ORIGINAL,
      0,
      false,
    );
  } finally {
    p.Dispose();
    s.Close();
  }
});
it("retains native empty destination handling after a diagonal virtual clone loses its line", /** Fault at the source virtual clone boundary does not manufacture an existing destination line. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    doc = c.shell.GetDocument(),
    view = required(c.viewData.GetViewShell()),
    line = new SvxLineItem(141);
  line.SetLine(new SvxBorderLine(null, 20));
  try {
    c.ExecuteBorder(new SfxRequest(11013, [line]));
    const selected = GetSelectionPattern(c.viewData),
      selection = vi.spyOn(doc, "GetSelectionPattern").mockReturnValue(selected);
    const original = selected.GetItem(141) as SvxLineItem,
      clone = vi
        .spyOn(original, "Clone")
        .mockImplementation(
          /** Models an empty native virtual clone. @returns Native item with no line. */ () =>
            new SvxLineItem(141),
        );
    try {
      view.SetSelectionFrameLines(new SvxBorderLine(null, 40), true);
      expect(
        (required(doc.GetPattern(new ScAddress())).GetItem(141) as SvxLineItem)
          .GetLine()
          ?.GetWidth(),
      ).toBe(0);
    } finally {
      clone.mockRestore();
      selection.mockRestore();
    }
  } finally {
    s.Close();
  }
});
