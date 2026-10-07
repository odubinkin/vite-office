/** @fileoverview Verifies existing table border models through native items, mounted UI, history and ODT. */
import { useState } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { WriterBorderPage } from "./WriterBorderPage";
import { WriterTableDialog, type WriterTableDialogValue } from "./WriterTableDialog";
import { SvxBorderTabPage } from "../../../cui/source/tabpages/border";
import { SfxBoolItem } from "../../../svl/source/items/cenumitm";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { SvxBoxItem, SvxBoxInfoItem } from "../../../editeng/source/items/frmitems";
import { SID_ATTR_BORDER_INNER } from "../../../svx/inc/svxids";
import { RES_BOX, RES_COLLAPSING_BORDERS } from "../../inc/hintids";
import { ItemSetToTableParam, TableParamToItemSet } from "../../source/uibase/shells/tabsh";
import { selectMountedTableRow } from "../../../../test-support/table-mouse-dom";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
import { readOdtDocument } from "../../source/filter/xml/swxml";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases actual model/view owners. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Creates a connected two-by-two native table. @param model - Existing native model. @returns Actual owners. */
function fixture(model: "collapsing" | "separating" | undefined) {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  const table = doc.nodes.MakeTableNode("Collapse", { width: 6000, borderModel: model });
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const boxes = [doc.nodes.AppendTableRow(table, 2), doc.nodes.AppendTableRow(table, 2)].flatMap(
    /** Reads original native row owners. @param row - Connected row. @returns Original cells. */ (
      row,
    ) => row.GetTabBoxes(),
  );
  for (const [index, box] of boxes.entries()) {
    const node = box.GetParagraphs()[0];
    if (node === undefined) throw Error("Missing collapse cell");
    node.SetText("Original " + index);
  }
  render(<WriterWorkbench isActive view={session.view} />);
  return { session, doc, shell, table, boxes };
}
/** Opens native table border controls. @returns Native checkbox device. */
function open() {
  fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
  fireEvent.click(screen.getByRole("tab", { name: "Borders" }));
  return screen.getByRole("checkbox", { name: "Merge adjacent line styles" });
}
it.each(["collapsing", "separating", undefined] as const)(
  "native border model %s retains Reset/Cancel and selected table history/ODT",
  /** Checks actual document, cursor and original graph over three history cycles. @param model - Existing original format. @returns Completion. */ async (
    model,
  ) => {
    const f = fixture(model),
      node = f.boxes[2]?.GetParagraphs()[0];
    if (node === undefined) throw Error("Missing selected owner");
    expect(
      (
        f.doc.GetAttrPool().GetUserOrPoolDefaultItem(RES_COLLAPSING_BORDERS) as SfxBoolItem
      ).GetValue(),
    ).toBe(false);
    const initial = model === "collapsing",
      next = initial ? "separating" : "collapsing";
    expect(screen.getByRole("table", { name: "Collapse" })).toHaveStyle({
      borderCollapse: initial ? "collapse" : "separate",
      borderSpacing: "0",
    });
    selectMountedTableRow("Collapse", 2);
    const before = f.shell.CaptureCursorState(),
      rows = [...f.table.GetTabLines()],
      boxes = [...f.boxes],
      values = boxes.map(
        /** Captures every original native box without mutation. @param box - Cell owner. @returns Independent attributes. */ (
          box,
        ) => box.GetBox().QueryValue(),
      );
    const input = TableParamToItemSet(f.shell);
    expect((input.Get(RES_COLLAPSING_BORDERS) as SfxBoolItem).GetValue()).toBe(initial);
    let check = open();
    expect(check).toHaveProperty("checked", initial);
    fireEvent.click(check);
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(check).toHaveProperty("checked", initial);
    fireEvent.click(check);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(f.table.GetFormat().borderModel).toBe(model);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    check = open();
    fireEvent.click(check);
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(f.table.GetFormat().borderModel).toBe(next);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    for (let cycle = 0; cycle < 3; cycle++) {
      act(
        /** Reverts accepted native properties. @returns Nothing. */ () => {
          expect(f.shell.Undo()).toBe(true);
        },
      );
      expect(f.table.GetFormat().borderModel).toBe(model);
      expect(f.shell.CaptureCursorState().point).toEqual(before.point);
      expect(f.shell.HasBoxSelection()).toBe(true);
      act(
        /** Reapplies accepted native properties. @returns Nothing. */ () => {
          expect(f.shell.Redo()).toBe(true);
        },
      );
      expect(f.table.GetFormat().borderModel).toBe(next);
      expect(f.table.GetTabLines()).toEqual(rows);
      for (const [index, box] of f.boxes.entries()) {
        expect(box).toBe(boxes[index]);
        expect(box.GetBox().QueryValue()).toEqual(values[index]);
        expect(box.GetParagraphs()[0]?.GetText()).toBe("Original " + index);
      }
    }
    const reopened = await readOdtDocument(writeOdtDocument(f.doc, { title: "Collapse" }), {
      title: "Collapse",
    });
    expect(reopened.document.GetTables()[0]?.GetFormat().borderModel).toBe(next);
    fireEvent.click(screen.getByRole("textbox", { name: "Row 2 column 1 paragraph 1" }));
    f.session.view
      .GetEditWin()
      .SetSelection({ point: { nodeIndex: node.GetIndex(), contentIndex: 2 } });
    act(
      /** Continues editing on the retained native paragraph. @returns Nothing. */ () => {
        f.session.view.GetEditWin().InsertText("!");
      },
    );
    expect(node.GetText()).toContain("!");
  },
);
it("table-only boolean items do not request cell-border writes and stored false reconstructs through the pool", /** Checks native table attribute routing without extra cell-selection mutation. @returns Nothing. */ () => {
  const f = fixture("collapsing");
  selectMountedTableRow("Collapse", 1);
  const setter = vi.spyOn(f.shell, "SetTabBorders"),
    items = new SfxItemSet(f.doc.GetAttrPool(), [[RES_COLLAPSING_BORDERS, RES_COLLAPSING_BORDERS]]);
  items.Put(new SfxBoolItem(RES_COLLAPSING_BORDERS, false));
  expect(
    ItemSetToTableParam(f.shell, {
      width: 6000,
      columnWidths: [3000, 3000],
      headerRows: 0,
      repeatHeaderRows: false,
      borderItems: items,
    }),
  ).toBe(true);
  expect(setter).not.toHaveBeenCalled();
  expect(f.table.GetFormat().borderModel).toBe("separating");
  const stored = f.doc.GetAttrPool().CreateItem({ which: RES_COLLAPSING_BORDERS, value: false });
  expect((stored as SfxBoolItem).GetValue()).toBe(false);
});
/** Presents a standalone native indeterminate table checkbox. @param props - Native page. @returns Browser controls. */
function Host({ page }: Readonly<{ page: SvxBorderTabPage }>) {
  const [, refresh] = useState(0);
  return (
    <WriterBorderPage
      page={page}
      onChange={
        /** Invalidates native presentation. @returns Nothing. */ () =>
          refresh(
            /** Advances presentation only. @param n - Previous version. @returns New version. */ (
              n,
            ) => n + 1,
          )
      }
    />
  );
}
it("native unknown table item stays indeterminate until actual checkbox activation", /** Checks native unknown state survives browser mount and reference teardown. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const input = new SfxItemSet(session.docShell.GetDoc().GetAttrPool(), [
    [RES_BOX, RES_BOX],
    [RES_COLLAPSING_BORDERS, RES_COLLAPSING_BORDERS],
    [SID_ATTR_BORDER_INNER, SID_ATTR_BORDER_INNER],
  ]);
  input.Put(new SvxBoxItem(RES_BOX));
  input.Put(new SvxBoxInfoItem(SID_ATTR_BORDER_INNER));
  input.InvalidateItem(RES_COLLAPSING_BORDERS);
  const page = new SvxBorderTabPage(input, RES_BOX, RES_COLLAPSING_BORDERS);
  render(<Host page={page} />);
  const check = screen.getByRole("checkbox", { name: "Merge adjacent line styles" });
  expect(check).toHaveAttribute("aria-checked", "mixed");
  expect(check).toHaveProperty("indeterminate", true);
  fireEvent.click(check);
  expect(check).toHaveAttribute("aria-checked", "true");
  expect(page.GetMergeAdjacentState()).toBe(true);
});

it.each(["invalid", "disabled", "default", "parent", "narrow", "fallback"] as const)(
  "native dialog preserves original merging input %s over table format fallback",
  /** Checks item-state authority, owned Reset and source missing-original output behavior. @param kind - Original native state/range. @returns Nothing. */ (
    kind,
  ) => {
    const f = fixture(kind === "parent" ? "separating" : "collapsing");
    cleanup();
    const input =
      kind === "fallback"
        ? undefined
        : new SfxItemSet(f.doc.GetAttrPool(), [
            [RES_BOX, RES_BOX],
            ...(kind === "narrow"
              ? []
              : [[RES_COLLAPSING_BORDERS, RES_COLLAPSING_BORDERS] as const]),
            [SID_ATTR_BORDER_INNER, SID_ATTR_BORDER_INNER],
          ]);
    if (kind === "invalid") input?.InvalidateItem(RES_COLLAPSING_BORDERS);
    if (kind === "disabled") input?.DisableItem(RES_COLLAPSING_BORDERS);
    if (kind === "parent") {
      const parent = input?.Clone(false);
      parent?.Put(new SfxBoolItem(RES_COLLAPSING_BORDERS, true));
      input?.SetParent(parent);
    }
    const original = input?.GetItemState(RES_COLLAPSING_BORDERS, false),
      submit = vi.fn<(value: WriterTableDialogValue) => void>();
    render(
      <WriterTableDialog
        table={f.table}
        borderItems={input}
        availableWidth={6000}
        onCancel={vi.fn()}
        onSubmit={submit}
      />,
    );
    fireEvent.click(screen.getByRole("tab", { name: "Borders" }));
    const check = screen.getByRole("checkbox", { name: "Merge adjacent line styles" }),
      value = kind === "invalid" || kind === "disabled" ? undefined : kind !== "default";
    expect(check).toHaveAttribute("aria-checked", value === undefined ? "mixed" : String(value));
    fireEvent.click(check);
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(check).toHaveAttribute("aria-checked", value === undefined ? "mixed" : String(value));
    fireEvent.click(check);
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    const item = submit.mock.calls[0]?.[0].borderItems?.GetItemIfSet(RES_COLLAPSING_BORDERS);
    if (kind === "invalid" || kind === "disabled") expect(item).toBeUndefined();
    else expect((item as SfxBoolItem).GetValue()).toBe(!value);
    expect(input?.GetItemState(RES_COLLAPSING_BORDERS, false)).toBe(original);
    expect(input?.GetParent()?.Get(RES_COLLAPSING_BORDERS).QueryValue()).toBe(
      kind === "parent" ? true : undefined,
    );
    expect(f.table.GetFormat().borderModel).toBe(kind === "parent" ? "separating" : "collapsing");
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    expect(
      (
        f.doc.GetAttrPool().GetUserOrPoolDefaultItem(RES_COLLAPSING_BORDERS) as SfxBoolItem
      ).GetValue(),
    ).toBe(false);
  },
);
