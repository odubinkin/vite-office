/** @fileoverview Verifies mounted combined native table attributes, reset, original history and real ODT transport. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { SfxBoolItem } from "../../../svl/source/items/cenumitm";
import { SvxULSpaceItem } from "../../../editeng/source/items/frmitems";
import { SwFormatLayoutSplit } from "../../inc/fmtlsplt";
import { RES_UL_SPACE, RES_LAYOUT_SPLIT, RES_COLLAPSING_BORDERS } from "../../inc/hintids";
import { SwFrameFormat } from "../../source/core/layout/atrfrm";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
import { readOdtDocument } from "../../source/filter/xml/swxml";
const split = "Allow table to split across pages and columns",
  merge = "Merge adjacent line styles";
/** Requires an original owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing mounted combined owner");
  return value;
}
/** Changes the actual represented controls across three native pages. @returns Nothing. */
function changeControls() {
  fireEvent.change(screen.getByRole("spinbutton", { name: "Above (cm)" }), {
    target: { value: "1" },
  });
  fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
  fireEvent.click(screen.getByRole("checkbox", { name: split }));
  fireEvent.click(screen.getByRole("tab", { name: "Borders" }));
  fireEvent.click(screen.getByRole("checkbox", { name: merge }));
}
it.each([false, true])(
  "mounted combined properties retain original native attributes inherited=%s",
  /** Checks one native dispatch, reset, three real history cycles and ODT values. @param inherited - Native parent owns input. @returns Completion. */ async (
    inherited,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell();
    let parent: SwFrameFormat | undefined;
    try {
      const table = doc.nodes.MakeTableNode(
        "CombinedUI",
        { width: 3000 },
        required(doc.paragraphs[0]),
      );
      table.AddColumnWidth(3000);
      const row = doc.nodes.AppendTableRow(table, 1),
        box = required(row.GetTabBoxes()[0]),
        node = required(box.GetParagraphs()[0]),
        format = table.GetFrameFormat();
      node.SetText("Original combined UI cell");
      shell.FocusNode(node);
      shell.SetParagraphListKind("bullet");
      let owner = format;
      if (inherited) {
        parent = owner = new SwFrameFormat(doc.GetAttrPool(), "CombinedUIParent");
        format.SetDerivedFrom(parent);
      }
      const before = new SvxULSpaceItem(150, 300, RES_UL_SPACE, true);
      owner.SetFormatAttr(before);
      owner.SetFormatAttr(new SwFormatLayoutSplit(true));
      owner.SetFormatAttr(new SfxBoolItem(RES_COLLAPSING_BORDERS, false));
      const cursor = shell.CaptureCursorState(),
        nodes = [...doc.nodes.entries()],
        list = node.GetListId(),
        width = format.GetFrameSize().Clone();
      doc.GetUndoManager().Clear();
      render(<WriterWorkbench isActive view={session.view} />);
      fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
      changeControls();
      fireEvent.click(screen.getByRole("button", { name: "Reset" }));
      expect(screen.getByRole("checkbox", { name: merge })).not.toBeChecked();
      fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
      fireEvent.click(screen.getByRole("button", { name: "Reset" }));
      expect(screen.getByRole("checkbox", { name: split })).toBeChecked();
      fireEvent.click(screen.getByRole("tab", { name: "Table" }));
      fireEvent.click(screen.getByRole("button", { name: "Reset" }));
      expect(screen.getByRole("spinbutton", { name: "Above (cm)" })).toHaveValue(0.26);
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
      expect(format.GetULSpace()).toEqual(before);
      const attrs = vi.spyOn(shell, "SetTableAttr"),
        scalar = vi.spyOn(table, "SetFormat");
      fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
      changeControls();
      fireEvent.click(screen.getByRole("button", { name: "OK" }));
      expect(attrs).toHaveBeenCalledTimes(1);
      expect(scalar).not.toHaveBeenCalled();
      const applied = required(attrs.mock.calls[0]?.[0]);
      if (!(applied instanceof SfxItemSet)) throw Error("Mounted scalar table dispatch");
      expect(applied.Get(RES_UL_SPACE, false)).toBeInstanceOf(SvxULSpaceItem);
      expect((applied.Get(RES_UL_SPACE, false) as SvxULSpaceItem).GetUpper()).toBe(567);
      expect(applied.Get(RES_LAYOUT_SPLIT, false)).toBeInstanceOf(SwFormatLayoutSplit);
      expect((applied.Get(RES_LAYOUT_SPLIT, false) as SwFormatLayoutSplit).GetValue()).toBe(false);
      expect(applied.Get(RES_COLLAPSING_BORDERS, false)).toBeInstanceOf(SfxBoolItem);
      expect((applied.Get(RES_COLLAPSING_BORDERS, false) as SfxBoolItem).GetValue()).toBe(true);
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
      for (let cycle = 0; cycle < 3; cycle++) {
        act(
          /** Reverts original combined items. @returns Nothing. */ () => {
            expect(shell.Undo()).toBe(true);
          },
        );
        expect(format.GetULSpace()).toEqual(before);
        expect((format.GetAttrSet().Get(RES_LAYOUT_SPLIT) as SwFormatLayoutSplit).GetValue()).toBe(
          true,
        );
        expect((format.GetAttrSet().Get(RES_COLLAPSING_BORDERS) as SfxBoolItem).GetValue()).toBe(
          false,
        );
        for (const id of [RES_UL_SPACE, RES_LAYOUT_SPLIT, RES_COLLAPSING_BORDERS])
          expect(format.GetAttrSet().GetItemIfSet(id, false) === undefined).toBe(inherited);
        expect(screen.getByRole("table", { name: "CombinedUI" })).toHaveStyle({
          marginTop: "10px",
          marginBottom: "20px",
          borderCollapse: "separate",
        });
        act(
          /** Replays original combined items. @returns Nothing. */ () => {
            expect(shell.Redo()).toBe(true);
          },
        );
        expect(format.GetULSpace().GetUpper()).toBe(567);
        expect(table.GetFormat().layoutSplit).toBe(false);
        expect(screen.getByRole("table", { name: "CombinedUI" })).toHaveStyle({
          borderCollapse: "collapse",
        });
        expect(format.GetFrameSize()).toEqual(width);
        expect(table.GetFrameFormat()).toBe(format);
        expect(table.GetTabLines()[0]).toBe(row);
        expect(row.GetTabBoxes()[0]).toBe(box);
        expect(box.GetParagraphs()[0]).toBe(node);
        expect(node.GetText()).toBe("Original combined UI cell");
        expect(node.GetListId()).toBe(list);
        expect(shell.CaptureCursorState()).toEqual(cursor);
        expect(doc.nodes.entries()).toEqual(nodes);
        expect(
          screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" }),
        ).toHaveTextContent("Original combined UI cell");
      }
      const reopened = await readOdtDocument(writeOdtDocument(doc, { title: "CombinedUI" }), {
        title: "CombinedUI",
      });
      try {
        const restored = required(reopened.document.GetTables()[0]);
        expect(ulValues(restored.GetFrameFormat().GetULSpace())).toEqual([567, 300]);
        expect(restored.GetFormat().layoutSplit).toBe(false);
        expect(restored.GetFormat().borderModel).toBe("collapsing");
      } finally {
        reopened.document.Dispose();
      }
    } finally {
      cleanup();
      vi.restoreAllMocks();
      session.Close();
      parent?.DisposeModify();
    }
  },
);

/** Observes unchanged native measure/context acceptance through explicit UNO members after removing the core browser tuple. @param item - Original native spacing or direct absence. @returns Native member values for historical acceptance. */
function ulValues(item: SvxULSpaceItem | undefined): readonly unknown[] | undefined {
  if (item === undefined) return undefined;
  const values = [item.QueryValue(3), item.QueryValue(4)];
  return item.QueryValue(7) === true ? [...values, 1] : values;
}
