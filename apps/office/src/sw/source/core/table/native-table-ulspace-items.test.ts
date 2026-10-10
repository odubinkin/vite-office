/** @fileoverview Verifies original native table UL spacing ownership, inheritance, dialog capture and physical page budgets. */
import { expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwFrameFormat } from "../layout/atrfrm";
import { SvxULSpaceItem } from "../../../../editeng/source/items/frmitems";
import { RES_UL_SPACE } from "../../../inc/hintids";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwFormatTablePage } from "../../ui/table/tabledlg";
import { createSwPageFrames } from "../layout/newfrm";
import { createDefaultWriterPageDescriptor } from "../layout/pagedesc";
import type { SwTableFormat } from "./swtable";
/** Creates an original flat graph. @param input - Explicit construction input. @returns Native owners. */
function fixture(input: SwTableFormat = {}) {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("NativeSpacing", { headerRows: 0, width: 3000, ...input });
  table.AddColumnWidth(3000);
  for (let index = 0; index < 3; index++) doc.nodes.AppendTableRow(table, 1);
  return { doc, table, format: table.GetFrameFormat() };
}
it.each([
  [{}, undefined, [0, 0]],
  [{ marginTop: 120 }, [120, 0], [120, 0]],
  [{ marginBottom: 240 }, [0, 240], [0, 240]],
  [{ marginTop: 0, marginBottom: 0 }, [0, 0], [0, 0]],
] as const)(
  "native table construction spacing %j",
  /** Checks direct ownership and source pooled zero. @param input - Builder input. @param direct - Expected direct item. @param effective - Expected effective tuple. @returns Nothing. */ (
    input,
    direct,
    effective,
  ) => {
    const f = fixture(input);
    try {
      const item = f.format.GetAttrSet().GetItemIfSet(RES_UL_SPACE, false) as
        SvxULSpaceItem | undefined;
      expect(ulValues(item)).toEqual(direct);
      expect(ulValues(f.format.GetULSpace())).toEqual(effective);
      expect(f.table.GetFormat().marginTop).toBe(direct?.[0]);
      expect(f.table.GetFormat().marginBottom).toBe(direct?.[1]);
    } finally {
      f.table.Dispose();
    }
  },
);
it("effective parent spacing drives original dialog and page budgets despite stale transport", /** Checks inherited native items and actual page movement without model copies. @returns Nothing. */ () => {
  const f = fixture({ layoutSplit: false }),
    parent = new SwFrameFormat(f.doc.GetAttrPool(), "Parent");
  parent.SetFormatAttr(new SvxULSpaceItem(100, 700, RES_UL_SPACE, true));
  f.format.SetDerivedFrom(parent);
  const rows = [...f.table.GetTabLines()],
    nodes = [...f.doc.nodes.entries()],
    native = f.table.GetFormat.bind(f.table),
    stale = vi.spyOn(f.table, "GetFormat");
  stale.mockImplementation(
    /** Retains obsolete transport spacing. @returns Detached stale input. */ () => ({
      ...native(),
      marginTop: 0,
      marginBottom: 0,
    }),
  );
  try {
    expect(f.format.GetULSpace()).toBe(parent.GetULSpace());
    expect(ulValues(f.format.GetULSpace(false))).toEqual([0, 0]);
    expect(f.format.GetULSpace().GetContext()).toBe(true);
    const draft = new SwFormatTablePage(f.table, 8000);
    expect([draft.above, draft.below]).toEqual([100, 700]);
    const output = new SfxItemSet(f.doc.GetAttrPool(), [[RES_UL_SPACE, RES_UL_SPACE]]);
    expect(draft.FillItemSet(undefined, output)).toBe(false);
    expect(output.Count()).toBe(0);
    draft.ValueChangedHdl("above", 240);
    expect(draft.FillItemSet(undefined, output)).toBe(true);
    expect(ulValues(output.Get(RES_UL_SPACE) as SvxULSpaceItem)).toEqual([240, 700]);
    draft.Reset();
    expect([draft.above, draft.below]).toEqual([100, 700]);
    const page = {
      ...createDefaultWriterPageDescriptor("en-GB").GetValue(),
      width: 6000,
      leftMargin: 100,
      rightMargin: 100,
      height: 1000,
      topMargin: 100,
      bottomMargin: 100,
    };
    const before = [
      {
        id: "before",
        lines: [{ start: 0, end: 6, height: 200 }],
        style: "body-text" as const,
        upperSpacing: 0,
        lowerSpacing: 0,
        contextualSpacing: false,
      },
    ];
    const pages = createSwPageFrames(before, page, undefined, [
      {
        table: f.table,
        tableName: "NativeSpacing",
        afterParagraphIndex: 0,
        rowHeights: [200, 200, 200],
      },
    ]);
    expect(
      pages.map(
        /** Reads original row placement. @param p - Physical page. @returns Row ranges. */ (p) =>
          p.tableFrames.map(
            /** Reads physical original range. @param frame - Table fragment. @returns Range. */ (
              frame,
            ) => [frame.firstRow, frame.lastRow],
          ),
      ),
    ).toEqual([[], [[0, 2]]]);
    expect(f.table.GetTabLines()).toEqual(rows);
    expect(f.doc.nodes.entries()).toEqual(nodes);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  } finally {
    stale.mockRestore();
    f.table.Dispose();
    parent.DisposeModify();
  }
});
it("table boundary keeps original complete native spacing and resets to inherited item", /** Checks native borrowed ownership, contextual state and direct reset. @returns Nothing. */ () => {
  const f = fixture(),
    parent = new SwFrameFormat(f.doc.GetAttrPool(), "Parent"),
    item = new SvxULSpaceItem(150, 300, RES_UL_SPACE, true);
  parent.SetFormatAttr(new SvxULSpaceItem(60, 90, RES_UL_SPACE));
  f.format.SetDerivedFrom(parent);
  f.format.SetFormatAttr(item);
  try {
    expect(f.format.GetULSpace()).not.toBe(item);
    expect(ulValues(f.format.GetULSpace())).toEqual([150, 300, 1]);
    f.table.SetFormat({ ...f.table.GetFormat(), width: 4500 });
    expect(ulValues(f.format.GetULSpace())).toEqual([150, 300, 1]);
    expect(ulValues(item)).toEqual([150, 300, 1]);
    f.table.SetFormat({ width: 4500 });
    expect(f.table.GetFormat().marginTop).toBeUndefined();
    expect(f.table.GetFormat().marginBottom).toBeUndefined();
    expect(f.format.GetULSpace()).toBe(parent.GetULSpace());
  } finally {
    f.table.Dispose();
    parent.DisposeModify();
  }
});

/** Observes unchanged native measure/context acceptance through explicit UNO members after removing the core browser tuple. @param item - Original native spacing or direct absence. @returns Native member values for historical acceptance. */
function ulValues(item: SvxULSpaceItem | undefined): readonly unknown[] | undefined {
  if (item === undefined) return undefined;
  const values = [item.QueryValue(3), item.QueryValue(4)];
  return item.QueryValue(7) === true ? [...values, 1] : values;
}
