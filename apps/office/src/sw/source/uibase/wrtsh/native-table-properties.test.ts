/** @fileoverview Verifies native table-property owners, selection, attribute-only history and lifecycle without upstream execution. */
import { nativeBoxFormat, tableBoxFormatForTest } from "../../../../test/table-box-test-helpers";
import { VertOrientation } from "./../../../../offapi/com/sun/star/text/VertOrientation";
import { SwFormatVertOrient } from "./../../../inc/fmtornt";

import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { describe, it, expect, vi } from "vitest";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SwTabCols } from "../../core/bastyp/tabcol";
import { SwDoc } from "../../core/doc/doc";
import { subscribeToSwModify } from "../../../inc/calbck";
import { SwDocShell } from "../app/docsh";

import { SwEditWin } from "../docvw/edtwin";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SwFEShell } from "../../core/frmedt/fetab";
import { ItemSetToTableParam, type SwTableProperties } from "../shells/tabsh";
import { SwView } from "../uiview/view";

/** Requires an actual fixture owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native property owner");
  return value;
}
/** Builds original table graph and actual shell. @returns Connected owners. */
function fixture() {
  const doc = new SwDoc(),
    body = required(doc.paragraphs[0]);
  body.SetText("Before");
  const table = doc.nodes.MakeTableNode(
    "Grid",
    { width: 6000, align: "left", headerRows: 1, repeatHeaderRows: true },
    body,
  );
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  for (let index = 0; index < 2; index++)
    doc.nodes.AppendTableRow(
      table,
      2,
      { frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 100), keepTogether: false },
      [
        nativeBoxFormat({
          padding: 50,
          border: "none",
          vertOrient: new SwFormatVertOrient(0, VertOrientation.NONE),
        }),
        nativeBoxFormat({
          padding: 50,
          border: "none",
          vertOrient: new SwFormatVertOrient(0, VertOrientation.NONE),
        }),
      ],
    );
  const boxes = table
      .GetTabLines()
      .flatMap(
        /** Reads original boxes. @param row - Actual row. @returns Actual boxes. */ (row) =>
          row.GetTabBoxes(),
      ),
    nodes = boxes.map(
      /** Requires original text. @param box - Actual box. @returns Actual node. */ (box) =>
        required(box.GetParagraphs()[0]),
    );
  nodes.forEach(
    /** Authors original text. @param node - Actual node. @param index - Box index. @returns Nothing. */ (
      node,
      index,
    ) => node.SetText("Cell" + index),
  );
  const docShell = new SwDocShell(
      doc,
      createDocument({ id: "table-properties", suiteId: "writer", title: "Properties" }),
    ),
    shell = new SwView(docShell).GetWrtShell(),
    invalidate = vi.fn(),
    edit = new SwEditWin(shell.GetView());
  subscribeToSwModify(shell, invalidate);
  const value: SwTableProperties = {
    width: 5000,
    columnWidths: [2000, 3000],
    padding: 200,
    border: "0.5pt solid #666666",
    verticalAlign: VertOrientation.BOTTOM,
    headerRows: 0,
    repeatHeaderRows: false,
    rowSplit: false,
  };
  return { doc, body, table, boxes, nodes, docShell, shell, edit, invalidate, value };
}
/** Builds invalid native geometry for the existing admission cases. @param widths - Original malformed widths. @returns Native carrier. */
function invalidColumns(widths: readonly number[]): SwTabCols {
  const result = new SwTabCols();
  result.SetRight(
    widths.reduce(
      /** Sums original inputs. @param sum - Prior width. @param width - Next width. @returns Total. */ (
        sum,
        width,
      ) => sum + width,
      0,
    ),
  );
  if (widths.length > 1) result.Insert(widths[0] as number, false, 0);
  return result;
}
describe("native table property application", /** Registers actual-owner contracts. @returns Nothing. */ () => {
  it.each([false, true])(
    "uses native selection scope and one attribute history selected=%s",
    /** Checks actual graph and history. @param selected - Native table selection. @returns Nothing. */ (
      selected,
    ) => {
      const f = fixture(),
        first = required(f.nodes[0]);
      expect(f.shell).toBeInstanceOf(SwFEShell);
      f.edit.SetSelection({ point: { nodeIndex: first.GetIndex(), contentIndex: 2 } });
      if (selected) expect(f.shell.SelectTableRow()).toBe(true);
      f.invalidate.mockClear();
      const initialCursor = f.shell.CaptureCursorState(),
        rows = [...f.table.GetTabLines()],
        formats = f.boxes.map(
          /** Retains independent original attributes. @param box - Actual box. @returns Attributes. */ (
            box,
          ) => box.GetFormat(),
        );
      f.doc.GetUndoManager().SetSavePosition();
      expect(ItemSetToTableParam(f.shell, f.value)).toBe(true);
      expect(f.invalidate).toHaveBeenCalledTimes(1);
      expect(f.docShell.IsModified()).toBe(true);
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
      expect(f.doc.GetUndoManager().GetUndoAction()?.GetComment()).toBe("Table Properties");
      expect(f.doc.GetUndoManager().GetUndoAction()?.GetPayloadSize()).toBe(54);
      expect(f.table.GetColumnWidths()).toEqual([2000, 3000]);
      expect(f.table.GetFormat()).toEqual({
        width: 5000,
        align: undefined,
        horiOrient: HoriOrientation.LEFT,
        marginLeft: 0,
        marginRight: 3640,
        headerRows: 0,
        repeatHeaderRows: false,
      });
      expect(rows[0]?.GetFormat()).toEqual({
        frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 100),
        keepTogether: true,
      });
      expect(rows[1]?.GetFormat()).toEqual({
        frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 100),
        keepTogether: !selected,
      });
      expect(
        f.boxes.map(
          /** Projects actual box attributes. @param box - Original box. @returns Current attributes. */ (
            box,
          ) => box.GetFormat(),
        ),
      ).toEqual(
        selected
          ? [
              nativeBoxFormat(
                {
                  padding: 200,
                  border: f.value.border,
                  vertOrient: new SwFormatVertOrient(0, VertOrientation.BOTTOM),
                },
                [3],
              ),
              nativeBoxFormat({
                padding: 200,
                border: f.value.border,
                vertOrient: new SwFormatVertOrient(0, VertOrientation.BOTTOM),
              }),
              formats[2],
              formats[3],
            ]
          : [
              nativeBoxFormat(
                {
                  padding: 200,
                  border: f.value.border,
                  vertOrient: new SwFormatVertOrient(0, VertOrientation.BOTTOM),
                },
                [3],
              ),
              nativeBoxFormat({
                padding: 200,
                border: f.value.border,
                vertOrient: new SwFormatVertOrient(0, VertOrientation.NONE),
              }),
              nativeBoxFormat(
                {
                  padding: 200,
                  border: f.value.border,
                  vertOrient: new SwFormatVertOrient(0, VertOrientation.NONE),
                },
                [0, 3],
              ),
              nativeBoxFormat(
                {
                  padding: 200,
                  border: f.value.border,
                  vertOrient: new SwFormatVertOrient(0, VertOrientation.NONE),
                },
                [0],
              ),
            ],
      );
      for (let cycle = 0; cycle < 2; cycle++) {
        expect(f.shell.Undo()).toBe(true);
        expect(f.docShell.IsModified()).toBe(false);
        expect(f.table.GetColumnWidths()).toEqual([3000, 3000]);
        expect(f.table.GetFormat().width).toBe(6000);
        expect(
          f.boxes.map(
            /** Reads restored native attributes. @param box - Actual box. @returns Attributes. */ (
              box,
            ) => box.GetFormat(),
          ),
        ).toEqual(formats);
        expect(f.shell.CaptureCursorState().point).toEqual(initialCursor.point);
        expect(f.shell.HasBoxSelection()).toBe(selected);
        expect(f.shell.Redo()).toBe(true);
        expect(f.docShell.IsModified()).toBe(true);
        expect(f.table.GetColumnWidths()).toEqual([2000, 3000]);
        expect(f.table.GetTabLines()).toEqual(rows);
        expect(f.table.GetTabLines()[0]).toBe(rows[0]);
        expect(f.table.GetTabLines()[0]?.GetTabBoxes()[0]).toBe(f.boxes[0]);
        expect(required(f.boxes[0]).GetParagraphs()[0]).toBe(first);
        expect(
          f.nodes.map(
            /** Reads unchanged native text. @param node - Actual node. @returns Text. */ (node) =>
              node.GetText(),
          ),
        ).toEqual(["Cell0", "Cell1", "Cell2", "Cell3"]);
        expect(f.shell.HasBoxSelection()).toBe(selected);
        expect([...f.shell.GetCursor().GetRingContainer()]).toHaveLength(selected ? 2 : 1);
      }
      f.shell.Close();
    },
  );
  it("rejects non-table context without model or history mutations", /** Checks native admission. @returns Nothing. */ () => {
    const f = fixture();
    f.edit.SetSelection({ point: { nodeIndex: f.body.GetIndex(), contentIndex: 1 } });
    expect(ItemSetToTableParam(f.shell, f.value)).toBe(false);
    expect(f.shell.SetTableAttr({ width: 4000 })).toBe(false);
    expect(f.shell.SetTabCols(new SwTabCols(), false)).toBe(false);
    expect(f.shell.SetRowHeight(new SwFormatFrameSize(SwFrameSize.Minimum, 0, 20))).toBe(false);
    expect(f.shell.SetBoxAlign(VertOrientation.CENTER)).toBe(false);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    expect(f.table.GetFormat().width).toBe(6000);
    f.shell.Close();
  });
  it.each([[[1000]], [[1000, 0]], [[1000, Number.NaN]], [[1000, Number.POSITIVE_INFINITY]]])(
    "rejects column values before a partial property edit %j",
    /** Checks native validation and unchanged graph. @param widths - Invalid columns. @returns Nothing. */ (
      widths,
    ) => {
      const f = fixture();
      f.edit.SetSelection({
        point: { nodeIndex: required(f.nodes[0]).GetIndex(), contentIndex: 0 },
      });
      expect(
        /** Invokes actual dialog application. @returns Admission. */ () =>
          ItemSetToTableParam(f.shell, { ...f.value, columnWidths: widths }),
      ).toThrow("Writer table column width is invalid.");
      expect(
        /** Invokes native column admission. @returns Admission. */ () =>
          f.shell.SetTabCols(invalidColumns(widths), false),
      ).toThrow("Writer table column width is invalid.");
      expect(f.table.GetColumnWidths()).toEqual([3000, 3000]);
      expect(f.table.GetFormat().width).toBe(6000);
      expect(
        f.boxes.map(
          /** Reads unchanged borders. @param box - Actual box. @returns Border. */ (box) =>
            tableBoxFormatForTest(box.GetFormat()).border,
        ),
      ).toEqual(["none", "none", "none", "none"]);
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
      f.shell.Close();
    },
  );
});
