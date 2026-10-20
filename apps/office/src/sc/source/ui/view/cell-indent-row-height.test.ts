/** @fileoverview Native indentation and manual row geometry contracts over real marks,attributes,filter segments and undo documents. */
import { ScViewUtil } from "./viewutil";
import { expect, it } from "vitest";
import { createCalcSession } from "../../../browser/composition/calc-module";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScPatternAttr, CellAttributeHolder } from "../../../inc/patattr";
import { ScIndentItem } from "../../../inc/attrib";
import { SvxHorJustifyItem } from "../../../../editeng/inc/justifyitem";
import { SvxCellHorJustify as H } from "../../../../editeng/inc/svxenum";
import { ScTable } from "../../../inc/table";
import { ScViewFunc } from "./viewfunc";
import { ScSizeMode, CRFlags } from "../../../inc/global";
import { SfxRequest } from "../../../../sfx2/source/control/request";
import { SfxUInt16Item, SfxInt32Item } from "../../../../svl/source/items/intitem";
import { ScDocument } from "../../../inc/document";
import { ScMarkData } from "../../../inc/markdata";
/** Reads native indentation and justification. @param doc - Document. @param col - Column. @param row - Row. @param tab - Sheet. @returns Native pair. */
function values(doc: ScDocument, col = 0, row = 0, tab = 0): number[] {
  const pattern = doc.GetPattern(new ScAddress(col, row, tab)) as ScPatternAttr;
  return [
    (pattern.GetItem(131) as ScIndentItem).GetValue(),
    (pattern.GetItem(129) as SvxHorJustifyItem).GetValue(),
  ];
}
it("coerces unsupported alignment independently of the 200-twip width cap and preserves source right alignment", /** Actual source attr runs. @returns Nothing. */ () => {
  const session = createCalcSession(),
    c = session.controller,
    doc = c.shell.GetDocument();
  try {
    doc.SetColWidth(0, 0, 250);
    c.SetAlignment("horizontal", H.Center, false);
    c.ChangeIndent(false);
    expect(values(doc)).toEqual([0, H.Left]);
    c.ChangeIndent(true);
    expect(values(doc)).toEqual([50, H.Left]);
    c.ChangeIndent(true);
    expect(values(doc)).toEqual([50, H.Left]);
    c.SetAlignment("horizontal", H.Right, false);
    c.ChangeIndent(false);
    expect(values(doc)).toEqual([0, H.Right]);
    doc.SetColHidden(0, 0, 0, true);
    c.SetAlignment("horizontal", H.Center, false);
    c.ChangeIndent(true);
    expect(values(doc)).toEqual([0, H.Left]);
    doc.SetColHidden(0, 0, 0, false);
    doc.SetColWidth(0, 0, 65535);
    const pattern = new ScPatternAttr(doc.getCellAttributeHelper());
    pattern.ItemSetPut(new ScIndentItem(65000));
    pattern.ItemSetPut(new SvxHorJustifyItem(H.Left, 129));
    const holder = new CellAttributeHolder(pattern, true);
    try {
      doc.ApplyPatternAreaTab(0, 0, 0, 0, 0, holder.getScPatternAttr() as ScPatternAttr);
    } finally {
      holder.Dispose();
    }
    c.ChangeIndent(true);
    expect(values(doc)[0]).toBe(65200);
    c.ChangeIndent(true);
    expect(values(doc)[0]).toBe(65335);
    c.ChangeIndent(true);
    expect(values(doc)[0]).toBe(65335);
  } finally {
    session.Close();
  }
});
it("subtracts filtered marks,keeps disjoint/grouped sheets and restores original marked attributes on undo", /** Real native operation and block history. @returns Nothing. */ () => {
  const session = createCalcSession(),
    c = session.controller,
    doc = c.shell.GetDocument();
  try {
    c.InsertSheet();
    c.SelectTab(0);
    c.viewData.GetMarkData().SelectTable(1, true);
    const marks = c.viewData.GetMarkData();
    marks.SetMultiMarkArea(new ScRange(0, 0, 0, 0, 2, 0));
    marks.SetMultiMarkArea(new ScRange(2, 4, 0, 2, 4, 0));
    doc.SetRowHidden(1, 1, 0, true);
    doc.SetRowFiltered(1, 1, 0, true);
    const before = new ScMarkData(marks);
    c.ChangeIndent(true);
    expect(values(doc, 0, 0)).toEqual([200, H.Left]);
    expect(values(doc, 0, 1)).toEqual([0, H.Standard]);
    expect(values(doc, 0, 2, 1)[0]).toBe(200);
    expect(values(doc, 2, 4)[0]).toBe(200);
    expect(values(doc, 1, 4)[0]).toBe(0);
    expect(marks.GetMultiMarkArea()).toEqual(before.GetMultiMarkArea());
    c.Undo();
    expect(values(doc, 2, 4)[0]).toBe(0);
    c.Redo();
    expect(values(doc, 2, 4)[0]).toBe(200);
  } finally {
    session.Close();
  }
});
it("changes the real default-column tail without allocating the whole sheet and follows moved sheet positions", /** Actual minimal-allocation owner. @returns Nothing. */ () => {
  const session = createCalcSession(),
    c = session.controller,
    doc = c.shell.GetDocument();
  try {
    const marks = c.viewData.GetMarkData();
    marks.SetMarkArea(new ScRange(0, 0, 0, doc.MaxCol(), 2, 0));
    c.ChangeIndent(true);
    expect((doc.FetchTable(0) as ScTable).GetAllocatedColumnsCount()).toBe(0);
    expect(values(doc, doc.MaxCol(), 1)[0]).toBe(200);
    doc.SetValue(new ScAddress(3, 1, 0), 7);
    expect(values(doc, 3, 1)[0]).toBe(200);
    c.Undo();
    expect(values(doc, doc.MaxCol(), 1)[0]).toBe(0);
    c.Redo();
    expect(values(doc, 3, 1)[0]).toBe(200);
  } finally {
    session.Close();
  }
});
it("uses UInt16 HMM and optional Int32 one-based Row and retains manual geometry across undo/redo", /** Actual shell request and geometry snapshot. @returns Nothing. */ () => {
  const session = createCalcSession(),
    c = session.controller,
    doc = c.shell.GetDocument();
  try {
    const request = new SfxRequest(26286);
    request.AppendItem(new SfxUInt16Item(26286, 2540));
    request.AppendItem(new SfxInt32Item(21160, 4));
    expect(c.ExecuteRowHeight(request)).toBe(true);
    expect(request.IsDone()).toBe(false);
    expect(doc.GetRowHeight(3, 0, false)).toBe(1440);
    expect((doc.FetchTable(0) as ScTable).GetRowFlagsRange(3).maValue & CRFlags.ManualSize).toBe(
      CRFlags.ManualSize,
    );
    c.Undo();
    expect(doc.GetRowHeight(3, 0, false)).toBe(doc.GetSheetOptimalMinRowHeight(0));
    c.Redo();
    expect(doc.GetRowHeight(3, 0, false)).toBe(1440);
    c.Select(0, 3);
    const done = c.CompleteRowHeight(720);
    expect(done.IsDone()).toBe(true);
    expect(doc.GetRowHeight(3, 0, false)).toBe(720);
  } finally {
    session.Close();
  }
});
it("manual sizing skips filtered visibility while explicit show clears both flags and retains stored heights", /** Real hidden/filtered row segments. @returns Nothing. */ () => {
  const session = createCalcSession(),
    c = session.controller,
    doc = c.shell.GetDocument(),
    view = new ScViewFunc(c.viewData, c.shell);
  try {
    doc.SetRowHidden(1, 1, 0, true);
    doc.SetRowFiltered(1, 1, 0, true);
    c.viewData.GetMarkData().SetMarkArea(new ScRange(0, 0, 0, 0, 2, 0));
    view.SetMarkedWidthOrHeight(false, ScSizeMode.SC_SIZE_DIRECT, 600);
    expect(doc.GetRowHeight(1, 0)).toBe(0);
    expect(doc.GetRowHeight(1, 0, false)).toBe(600);
    expect(doc.RowFiltered(1, 0)).toBe(true);
    c.ShowRows(false);
    expect(doc.RowHidden(0, 0)).toBe(true);
    expect(c.viewData.GetCurY()).toBe(3);
    c.Undo();
    expect(doc.RowHidden(0, 0)).toBe(false);
    expect(doc.RowFiltered(1, 0)).toBe(true);
    c.Redo();
    c.ShowRows(true);
    expect(doc.RowHidden(1, 0)).toBe(false);
    expect(doc.RowFiltered(1, 0)).toBe(false);
    expect(doc.GetRowHeight(1, 0)).toBe(600);
  } finally {
    session.Close();
  }
});
it("preserves native invalid-row and missing-sheet outputs without synthetic geometry", /** Real document fallback rules. @returns Nothing. */ () => {
  const session = createCalcSession(),
    doc = session.controller.shell.GetDocument();
  try {
    const first: [number] = [91],
      last: [number] = [92];
    expect(doc.RowHidden(-1, 0, first, last)).toBe(true);
    expect([first[0], last[0]]).toEqual([-1, -1]);
    first[0] = 91;
    last[0] = 92;
    expect(doc.RowFiltered(-1, 0, first, last)).toBe(false);
    expect(doc.RowHidden(2, 9, first, last)).toBe(false);
    expect([first[0], last[0]]).toEqual([91, 92]);
    expect(doc.GetRowHeight(-1, 0)).toBe(doc.GetSheetOptimalMinRowHeight(0));
    expect(doc.GetRowHeight(0, 9)).toBe(0);
    expect(doc.GetSheetOptimalMinRowHeight(9)).toBe(doc.GetSheetOptimalMinRowHeight(0));
  } finally {
    session.Close();
  }
});
it("restores disjoint manual row spans on original grouped sheets without changing values or cursor marks", /** Actual geometry-only document snapshot. @returns Nothing. */ () => {
  const session = createCalcSession(),
    c = session.controller,
    doc = c.shell.GetDocument();
  try {
    c.InsertSheet();
    c.SelectTab(0);
    const marks = c.viewData.GetMarkData();
    marks.SelectTable(1, true);
    marks.SetMultiMarkArea(new ScRange(0, 2, 0, 0, 2, 0));
    marks.SetMultiMarkArea(new ScRange(2, 5, 0, 2, 6, 0));
    doc.SetValue(new ScAddress(2, 5, 1), 19);
    c.CompleteRowHeight(720);
    for (const tab of [0, 1]) {
      expect(doc.GetRowHeight(2, tab, false)).toBe(720);
      expect(doc.GetRowHeight(3, tab, false)).toBe(doc.GetSheetOptimalMinRowHeight(tab));
      expect(doc.GetRowHeight(6, tab, false)).toBe(720);
    }
    const before = marks.GetMultiMarkArea();
    c.Undo();
    expect(marks.GetMultiMarkArea()).toEqual(before);
    expect(doc.GetRowHeight(5, 1, false)).toBe(doc.GetSheetOptimalMinRowHeight(1));
    expect(doc.GetValue(new ScAddress(2, 5, 1))).toBe(19);
    c.Redo();
    expect(doc.GetRowHeight(5, 1, false)).toBe(720);
  } finally {
    session.Close();
  }
});
it("retains native all-filtered selection fallback to current cell and typed height request completion", /** Pinned view fallback and request recording. @returns Nothing. */ () => {
  const session = createCalcSession(),
    c = session.controller,
    doc = c.shell.GetDocument();
  try {
    c.viewData.GetMarkData().SetMarkArea(new ScRange(0, 0, 0, 0, 0, 0));
    doc.SetRowFiltered(0, 0, 0, true);
    c.ChangeIndent(true);
    expect(values(doc)[0]).toBe(200);
    const ordinary = new SfxRequest(26286);
    ordinary.AppendItem(new SfxUInt16Item(26286, 1270));
    expect(c.ExecuteRowHeight(ordinary)).toBe(true);
    expect(ordinary.IsDone()).toBe(true);
    expect(doc.GetRowHeight(0, 0, false)).toBe(720);
  } finally {
    session.Close();
  }
});

it("retains source captured coordinates when filter subtraction expands the multi-mark bounding rectangle", /** Real grouped filter ranges,not a fabricated filter provider. @returns Nothing. */ () => {
  const session = createCalcSession(),
    c = session.controller,
    doc = c.shell.GetDocument();
  try {
    c.InsertSheet();
    c.SelectTab(0);
    const marks = c.viewData.GetMarkData();
    marks.SelectTable(1, true);
    marks.SetMultiMarkArea(new ScRange(0, 0, 0, 0, 2, 0));
    marks.SetMultiMarkArea(new ScRange(2, 0, 0, 2, 2, 0));
    doc.SetRowFiltered(1, 10, 0, true);
    doc.SetRowFiltered(5, 100, 1, true);
    ScViewUtil.UnmarkFiltered(marks, doc);
    expect(marks.GetMultiMarkArea().aEnd.Row()).toBe(10);
  } finally {
    session.Close();
  }
});
it("clamps an indent step crossing a nonmultiple column width", /** Literal source width cap and view-tab restoration. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    d = c.shell.GetDocument(),
    p = new ScPatternAttr(d.getCellAttributeHelper());
  try {
    d.SetColWidth(0, 0, 450);
    p.ItemSetPut(new ScIndentItem(190));
    d.ApplyPattern(0, 0, 0, p);
    c.ChangeIndent(true);
    expect(values(d)[0]).toBe(250);
    c.ChangeIndent(false);
    expect(values(d)[0]).toBe(50);
  } finally {
    p.Dispose();
    s.Close();
  }
});
