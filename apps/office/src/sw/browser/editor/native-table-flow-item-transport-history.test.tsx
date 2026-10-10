/** @fileoverview Verifies transported original split/border item ownership, painted pages/borders and three native ItemSet UndoRedo cycles without scalar replay. */
import { act, cleanup, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { encodeTableFormat, restoreTableFlow } from "../filter/xml/writer-table-item-codec";
import { RES_LAYOUT_SPLIT, RES_COLLAPSING_BORDERS } from "../../inc/hintids";
import { SwFormatLayoutSplit } from "../../inc/fmtlsplt";
import { SfxBoolItem } from "../../../svl/source/items/cenumitm";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { nativeBoxFormat } from "../../../test/table-box-test-helpers";
import { SwFormatFrameSize, SwFrameSize } from "../../inc/fmtfsize";
/** Requires an original native owner. @param value - Candidate. @returns Native owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing original flow owner");
  return value;
}
/** Reads original table fragments' physical page ownership. @returns Page indexes. */
function pages(): number[] {
  return [...document.querySelectorAll('table[aria-label="FlowHistory"]')].map(
    /** Reads the containing native page. @param table - Painted fragment. @returns Page index. */
    (table) => Number(table.closest("[data-writer-page]")?.getAttribute("data-writer-page")),
  );
}
it.each([
  [undefined, undefined],
  [false, true],
  [true, false],
] as const)(
  "transported native split%s borders%s preserve paint and original history ownership",
  /** Changes only owned native items, preserving direct absence across history. @param beforeSplit - Original split state. @param beforeBorders - Original border state. @returns Nothing. */ (
    beforeSplit,
    beforeBorders,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell();
    try {
      const body = required(doc.paragraphs[0]);
      body.SetText("Before");
      const table = doc.nodes.MakeTableNode("FlowHistory", { width: 4000, headerRows: 0 }, body);
      table.AddColumnWidth(4000);
      for (let r = 0; r < 3; r++)
        required(
          required(
            doc.nodes
              .AppendTableRow(
                table,
                1,
                { frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 200) },
                [nativeBoxFormat({ padding: 0, border: "none" })],
              )
              .GetTabBoxes()[0],
          ).GetParagraphs()[0],
        ).SetText("Cell" + r);
      const row = required(table.GetTabLines()[0]),
        box = required(row.GetTabBoxes()[0]),
        node = required(box.GetParagraphs()[0]),
        frame = table.GetFrameFormat(),
        set = frame.GetAttrSet();
      if (beforeSplit !== undefined) frame.SetFormatAttr(new SwFormatLayoutSplit(beforeSplit));
      if (beforeBorders !== undefined)
        frame.SetFormatAttr(new SfxBoolItem(RES_COLLAPSING_BORDERS, beforeBorders));
      const transfer = JSON.parse(JSON.stringify(encodeTableFormat(table)));
      frame.ResetFormatAttr(RES_LAYOUT_SPLIT);
      frame.ResetFormatAttr(RES_COLLAPSING_BORDERS);
      restoreTableFlow(frame, transfer.nativeFlow);
      shell.SetPageDescriptor({
        ...doc.GetPageDesc().GetValue(),
        height: 1000,
        topMargin: 100,
        bottomMargin: 100,
        width: 6000,
        leftMargin: 100,
        rightMargin: 100,
      });
      shell.FocusNode(node);
      doc.GetUndoManager().Clear();
      render(<WriterWorkbench isActive view={session.view} />);
      expect(pages()).toEqual(beforeSplit === false ? [2] : [1, 2]);
      for (const element of screen.getAllByRole("table", { name: "FlowHistory" }))
        expect(element).toHaveStyle({
          borderCollapse: beforeBorders === true ? "collapse" : "separate",
        });
      const afterSplit = !(beforeSplit ?? true),
        afterBorders = !(beforeBorders ?? false),
        input = new SfxItemSet(doc.GetAttrPool(), [
          [RES_LAYOUT_SPLIT, RES_LAYOUT_SPLIT],
          [RES_COLLAPSING_BORDERS, RES_COLLAPSING_BORDERS],
        ]);
      input.Put(new SwFormatLayoutSplit(afterSplit));
      input.Put(new SfxBoolItem(RES_COLLAPSING_BORDERS, afterBorders));
      const cursor = shell.GetCursor(),
        nodes = [...doc.nodes.entries()];
      act(
        /** Applies both original native items together. @returns Nothing. */ () => {
          expect(shell.SetTableAttr(input)).toBe(true);
        },
      );
      expect(pages()).toEqual(afterSplit === false ? [2] : [1, 2]);
      for (let cycle = 0; cycle < 3; cycle++) {
        act(
          /** Restores original native direct items or absence. @returns Nothing. */ () => {
            expect(shell.Undo()).toBe(true);
          },
        );
        expect(
          (set.GetItemIfSet(RES_LAYOUT_SPLIT, false) as SfxBoolItem | undefined)?.GetValue(),
        ).toBe(beforeSplit);
        expect(
          (set.GetItemIfSet(RES_COLLAPSING_BORDERS, false) as SfxBoolItem | undefined)?.GetValue(),
        ).toBe(beforeBorders);
        expect(pages()).toEqual(beforeSplit === false ? [2] : [1, 2]);
        for (const element of screen.getAllByRole("table", { name: "FlowHistory" }))
          expect(element).toHaveStyle({
            borderCollapse: beforeBorders === true ? "collapse" : "separate",
          });
        act(
          /** Reapplies both original native items. @returns Nothing. */ () => {
            expect(shell.Redo()).toBe(true);
          },
        );
        expect((set.GetItemIfSet(RES_LAYOUT_SPLIT, false) as SwFormatLayoutSplit).GetValue()).toBe(
          afterSplit,
        );
        expect((set.GetItemIfSet(RES_COLLAPSING_BORDERS, false) as SfxBoolItem).GetValue()).toBe(
          afterBorders,
        );
        expect(pages()).toEqual(afterSplit === false ? [2] : [1, 2]);
        for (const element of screen.getAllByRole("table", { name: "FlowHistory" }))
          expect(element).toHaveStyle({ borderCollapse: afterBorders ? "collapse" : "separate" });
        expect(shell.GetCursor()).toBe(cursor);
        expect(doc.nodes.entries()).toEqual(nodes);
        expect(table.GetFrameFormat()).toBe(frame);
        expect(table.GetTabLines()[0]).toBe(row);
        expect(row.GetTabBoxes()[0]).toBe(box);
        expect(box.GetParagraphs()[0]).toBe(node);
      }
      expect((input.Get(RES_LAYOUT_SPLIT) as SwFormatLayoutSplit).GetValue()).toBe(afterSplit);
      expect((input.Get(RES_COLLAPSING_BORDERS) as SfxBoolItem).GetValue()).toBe(afterBorders);
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    } finally {
      cleanup();
      session.Close();
    }
  },
);
