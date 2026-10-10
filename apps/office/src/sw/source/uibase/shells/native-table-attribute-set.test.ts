/** @fileoverview Verifies original combined table ItemSet dispatch, separator order and complete native history. */
import { afterEach, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SvxULSpaceItem } from "../../../../editeng/source/items/frmitems";
import { SwFormatLayoutSplit } from "../../../inc/fmtlsplt";
import {
  RES_UL_SPACE,
  RES_LAYOUT_SPLIT,
  RES_COLLAPSING_BORDERS,
  RES_FRM_SIZE,
  RES_LR_SPACE,
  RES_HORI_ORIENT,
} from "../../../inc/hintids";
import { FN_TABLE_REP } from "../../../inc/cmdid";
import { SwPtrItem } from "../utlui/uiitems";
import { SwTableRep } from "../table/swtablerep";
import { SwTabCols } from "../../core/bastyp/tabcol";
import { SwFrameFormat } from "../../core/layout/atrfrm";
import { ItemSetToTableParam } from "./tabsh";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
const ids = [RES_UL_SPACE, RES_LAYOUT_SPLIT, RES_COLLAPSING_BORDERS];
afterEach(
  /** Restores native dispatch spies. @returns Nothing. */ () => {
    vi.restoreAllMocks();
  },
);
/** Requires a native owner. @param value - Optional owner. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing combined table owner");
  return value;
}
/** Creates the actual table, list and original shell. @returns Original owners. */
function fixture() {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  const table = doc.nodes.MakeTableNode("Combined", { width: 3000, horiOrient: 0 });
  table.AddColumnWidth(1500);
  table.AddColumnWidth(1500);
  const row = doc.nodes.AppendTableRow(table, 2),
    box = required(row.GetTabBoxes()[0]),
    node = required(box.GetParagraphs()[0]),
    format = table.GetFrameFormat();
  node.SetText("Original bulleted cell");
  shell.FocusNode(node);
  shell.SetParagraphListKind("bullet");
  return { session, doc, shell, table, row, box, node, format };
}
it.each([false, true])(
  "one native attribute set preserves complete flags and spacing inherited=%s",
  /** Checks independent native copies and three original history cycles. @param inherited - Parent owns original items. @returns Nothing. */ (
    inherited,
  ) => {
    const f = fixture(),
      parent = new SwFrameFormat(f.doc.GetAttrPool(), "CombinedParent");
    try {
      const owner = inherited ? parent : f.format;
      if (inherited) f.format.SetDerivedFrom(parent);
      const before = [
        new SvxULSpaceItem(120, 240, RES_UL_SPACE, true),
        new SwFormatLayoutSplit(true),
        new SfxBoolItem(RES_COLLAPSING_BORDERS, false),
      ];
      for (const item of before) owner.SetFormatAttr(item);
      const cursor = f.shell.GetCursor(),
        cursorState = f.shell.CaptureCursorState(),
        nodes = [...f.doc.nodes.entries()],
        list = f.node.GetListId(),
        width = f.format.GetFrameSize().Clone();
      const input = new SfxItemSet(f.doc.GetAttrPool(), [[1, 32767]]),
        changed = [
          new SvxULSpaceItem(360, 480, RES_UL_SPACE, true),
          new SwFormatLayoutSplit(false),
          new SfxBoolItem(RES_COLLAPSING_BORDERS, true),
        ];
      for (const item of changed) input.Put(item);
      const originalInput = ids.map(
        /** Captures original owned input items. @param id - Which ID. @returns Input owner. */ (
          id,
        ) => input.Get(id, false),
      );
      f.doc.GetUndoManager().Clear();
      const attrs = vi.spyOn(f.shell, "SetTableAttr"),
        scalar = vi.spyOn(f.table, "SetFormat");
      expect(ItemSetToTableParam(f.shell, input)).toBe(true);
      expect(attrs).toHaveBeenCalledTimes(1);
      expect(scalar).not.toHaveBeenCalled();
      const applied = required(attrs.mock.calls[0]?.[0]);
      expect(applied).toBeInstanceOf(SfxItemSet);
      if (!(applied instanceof SfxItemSet)) throw Error("Scalar table dispatch");
      expect(applied.Count()).toBe(3);
      for (const [index, id] of ids.entries()) {
        expect(applied.Get(id, false)).toEqual(changed[index]);
        expect(applied.Get(id, false)).not.toBe(originalInput[index]);
        expect(input.Get(id, false)).toBe(originalInput[index]);
      }
      expect(ulValues(f.format.GetULSpace())).toEqual([360, 480, 1]);
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
      for (let cycle = 0; cycle < 3; cycle++) {
        expect(f.shell.Undo()).toBe(true);
        for (const [index, id] of ids.entries()) {
          expect(f.format.GetAttrSet().Get(id)).toEqual(before[index]);
          expect(f.format.GetAttrSet().GetItemIfSet(id, false) === undefined).toBe(inherited);
        }
        expect(f.shell.Redo()).toBe(true);
        for (const [index, id] of ids.entries())
          expect(f.format.GetAttrSet().Get(id)).toEqual(changed[index]);
        expect(f.format.GetFrameSize()).toEqual(width);
        expect(f.table.GetFrameFormat()).toBe(f.format);
        expect(f.table.GetTabLines()[0]).toBe(f.row);
        expect(f.row.GetTabBoxes()[0]).toBe(f.box);
        expect(f.box.GetParagraphs()[0]).toBe(f.node);
        expect(f.node.GetText()).toBe("Original bulleted cell");
        expect(f.node.GetListId()).toBe(list);
        expect(f.shell.GetCursor()).toBe(cursor);
        expect(f.shell.CaptureCursorState()).toEqual(cursorState);
        expect(f.doc.nodes.entries()).toEqual(nodes);
      }
    } finally {
      f.session.Close();
      parent.DisposeModify();
    }
  },
);
it("combined geometry and original frame attributes apply once after native separators", /** Checks source separator ordering and complete accepted item set. @returns Nothing. */ () => {
  const f = fixture();
  try {
    const columns = new SwTabCols();
    f.shell.GetTabCols(columns);
    const rep = new SwTableRep(f.table, columns.GetRightMax(), columns),
      input = new SfxItemSet(f.doc.GetAttrPool(), [[1, 32767]]);
    rep.width = 3000;
    required(rep.columns[0]).nWidth = 1800;
    required(rep.columns[1]).nWidth = 1200;
    rep.SetColsChanged();
    input.Put(new SwPtrItem(FN_TABLE_REP, rep));
    input.Put(new SvxULSpaceItem(240, 120, RES_UL_SPACE, true));
    input.Put(new SwFormatLayoutSplit(false));
    input.Put(new SfxBoolItem(RES_COLLAPSING_BORDERS, true));
    f.doc.GetUndoManager().Clear();
    const attrs = vi.spyOn(f.shell, "SetTableAttr"),
      separators = vi.spyOn(f.shell, "SetTabCols"),
      scalar = vi.spyOn(f.table, "SetFormat");
    expect(ItemSetToTableParam(f.shell, input)).toBe(true);
    expect(attrs).toHaveBeenCalledTimes(1);
    expect(separators).toHaveBeenCalledTimes(1);
    expect(required(separators.mock.invocationCallOrder[0])).toBeLessThan(
      required(attrs.mock.invocationCallOrder[0]),
    );
    expect(scalar).not.toHaveBeenCalled();
    const applied = required(attrs.mock.calls[0]?.[0]);
    if (!(applied instanceof SfxItemSet)) throw Error("Scalar table geometry dispatch");
    expect(applied.Count()).toBe(6);
    for (const id of [...ids, RES_FRM_SIZE, RES_LR_SPACE, RES_HORI_ORIENT])
      expect(applied.GetItemIfSet(id, false)).toBeDefined();
    expect(
      f.row
        .GetTabBoxes()
        .map(
          /** Reads original column widths. @param box - Original owner. @returns Native width. */ (
            box,
          ) => box.GetFrameSize().GetWidth(),
        ),
    ).toEqual([1800, 1200]);
    expect(ulValues(f.format.GetULSpace())).toEqual([240, 120, 1]);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  } finally {
    f.session.Close();
  }
});
it("inherited disabled and invalid table frame items remain unadvertised", /** Checks explicit SET admission without default materialization. @returns Nothing. */ () => {
  const f = fixture();
  try {
    const parent = new SfxItemSet(f.doc.GetAttrPool(), [[1, 32767]]),
      input = new SfxItemSet(f.doc.GetAttrPool(), [[1, 32767]]);
    parent.Put(new SvxULSpaceItem(120, 240, RES_UL_SPACE, true));
    parent.Put(new SwFormatLayoutSplit(false));
    parent.Put(new SfxBoolItem(RES_COLLAPSING_BORDERS, true));
    input.SetParent(parent);
    input.DisableItem(RES_LAYOUT_SPLIT);
    input.InvalidateItem(RES_COLLAPSING_BORDERS);
    const before = f.table.GetFormat(),
      attrs = vi.spyOn(f.shell, "SetTableAttr");
    f.doc.GetUndoManager().Clear();
    expect(ItemSetToTableParam(f.shell, input)).toBe(true);
    expect(attrs).not.toHaveBeenCalled();
    expect(f.table.GetFormat()).toEqual(before);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    for (const id of ids) expect(f.format.GetAttrSet().GetItemIfSet(id, false)).toBeUndefined();
  } finally {
    f.session.Close();
  }
});
it.each([
  [WRITER_COMMAND_IDS.entireCell, "cell"],
  [WRITER_COMMAND_IDS.entireRow, "row"],
  [WRITER_COMMAND_IDS.entireColumn, "column"],
] as const)(
  "native table context selection retains original owners %s",
  /** Checks actual dispatcher selection scope before unchanged properties and native copy ownership. @param command - Native selection slot. @param scope - Expected selection shape. @returns Nothing. */ (
    command,
    scope,
  ) => {
    const f = fixture();
    try {
      const second = f.doc.nodes.AppendTableRow(f.table, 2),
        original = [...f.doc.nodes.entries()],
        list = f.node.GetListId();
      f.doc.GetUndoManager().Clear();
      const dispatcher = f.session.view.GetViewFrame().GetDispatcher();
      expect(dispatcher.QueryState(command).enabled).toBe(true);
      expect(dispatcher.Execute(command).status).toBe("executed");
      const selected = f.shell.GetTableSel();
      expect(selected).toEqual(
        scope === "cell"
          ? [f.box]
          : scope === "row"
            ? [...f.row.GetTabBoxes()]
            : [f.box, required(second.GetTabBoxes()[0])],
      );
      const cursor = f.shell.CaptureCursorState(),
        attrs = vi.spyOn(f.shell, "SetTableAttr");
      expect(ItemSetToTableParam(f.shell, new SfxItemSet(f.doc.GetAttrPool(), [[1, 32767]]))).toBe(
        true,
      );
      expect(attrs).not.toHaveBeenCalled();
      expect(f.shell.CaptureCursorState()).toEqual(cursor);
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
      expect(f.doc.nodes.entries()).toEqual(original);
      expect(f.box.GetParagraphs()[0]).toBe(f.node);
      expect(f.node.GetListId()).toBe(list);
      expect(f.node.GetText()).toBe("Original bulleted cell");
    } finally {
      f.session.Close();
    }
  },
);

/** Observes unchanged native measure/context acceptance through explicit UNO members after removing the core browser tuple. @param item - Original native spacing or direct absence. @returns Native member values for historical acceptance. */
function ulValues(item: SvxULSpaceItem | undefined): readonly unknown[] | undefined {
  if (item === undefined) return undefined;
  const values = [item.QueryValue(3), item.QueryValue(4)];
  return item.QueryValue(7) === true ? [...values, 1] : values;
}
