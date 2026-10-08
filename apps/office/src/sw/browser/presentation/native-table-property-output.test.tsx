/** @fileoverview Verifies mounted properties publish native changed items without snapshot-default history. */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { SwPosition } from "../../source/core/crsr/pam";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { WriterTableDialog } from "./WriterTableDialog";
import {
  FN_TABLE_REP,
  FN_PARAM_TABLE_NAME,
  FN_PARAM_TABLE_HEADLINE,
  FN_TABLE_SET_VERT_ALIGN,
} from "../../inc/cmdid";
import { SID_ATTR_BORDER_INNER } from "../../../svx/inc/svxids";
import { RES_UL_SPACE, RES_LAYOUT_SPLIT } from "../../inc/hintids";
import { HoriOrientation as H } from "../../../offapi/com/sun/star/text/HoriOrientation";
import * as tableShell from "../../source/uibase/shells/tabsh";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Unmounts original native sessions. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Requires the actual original owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native publication owner");
  return value;
}
/** Builds native rows with omitted frame defaults and an actual current cursor. @returns Original owners and spies. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    table = doc.nodes.MakeTableNode("Original", { width: 6000, horiOrient: H.LEFT });
  table.AddColumnWidth(1000);
  table.AddColumnWidth(5000);
  for (const values of [
    [1000, 5000],
    [1000, 1000, 4000],
  ])
    for (const [c, box] of doc.nodes.AppendTableRow(table, values.length).GetTabBoxes().entries()) {
      const size = box.GetFrameSize();
      size.SetWidth(required(values[c]));
      box.SetFrameSize(size);
      required(box.GetParagraphs()[0]).SetText("Original cell");
    }
  const lines = [...table.GetTabLines()],
    boxes = lines.flatMap(
      /** Captures owners. @param line - Row. @returns Boxes. */ (line) => [...line.GetTabBoxes()],
    ),
    node = required(required(required(lines[1]).GetTabBoxes()[2]).GetParagraphs()[0]),
    position = new SwPosition(node, 2);
  shell.SetCursor(position);
  position.Dispose();
  doc.GetUndoManager().Clear();
  const cursor = shell.CaptureCursorState(),
    format = table.GetFormat(),
    boxFormats = boxes.map(
      /** Captures original items. @param box - Original owner. @returns Complete format. */ (
        box,
      ) => box.GetFormat(),
    ),
    acceptance = vi.spyOn(tableShell, "ItemSetToTableParam"),
    attrs = vi.spyOn(shell, "SetTableAttr"),
    header = vi.spyOn(shell, "SetRowsToRepeat"),
    columns = vi.spyOn(shell, "SetTabCols");
  render(<WriterWorkbench isActive view={session.view} />);
  return {
    doc,
    shell,
    table,
    node,
    lines,
    boxes,
    cursor,
    format,
    boxFormats,
    originalBoxItems: boxes.map(
      /** Reads complete inherited border items. @param box - Owner. @returns Item. */ (box) =>
        box.GetBox(),
    ),
    acceptance,
    attrs,
    header,
    columns,
  };
}
/** Requires the actual native UI output. @param f - Mounted original graph. @returns Native item set. */
function accepted(f: ReturnType<typeof fixture>): SfxItemSet {
  const input = required(f.acceptance.mock.calls[0]?.[1]);
  expect(input).toBeInstanceOf(SfxItemSet);
  if (!(input instanceof SfxItemSet)) throw new Error("UI used explicit snapshot ingress");
  return input;
}
it.each(["Table", "Text Flow"])(
  "mounted untouched page%s submits an empty native set and preserves exact defaults",
  /** Checks actual UI-to-native-shell empty output. @param page - Native tab. @returns Nothing. */ (
    page,
  ) => {
    const f = fixture();
    fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
    fireEvent.click(screen.getByRole("tab", { name: page }));
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(accepted(f).Count()).toBe(0);
    expect(f.attrs).not.toHaveBeenCalled();
    expect(f.header).not.toHaveBeenCalled();
    expect(f.columns).not.toHaveBeenCalled();
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    expect(f.table.GetFormat()).toStrictEqual(f.format);
    expect(
      f.boxes.map(
        /** Reads complete current items. @param box - Original owner. @returns Format. */ (box) =>
          box.GetFormat(),
      ),
    ).toStrictEqual(f.boxFormats);
    expect(f.shell.CaptureCursorState()).toEqual(f.cursor);
    expect(f.node.GetText()).toBe("Original cell");
  },
);
it("mounted name-only publication advertises one native name item and retains frame defaults", /** Checks original owner rename through grouped history. @returns Nothing. */ () => {
  const f = fixture();
  fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
    target: { value: "Renamed" },
  });
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  const input = accepted(f);
  expect(input.Count()).toBe(1);
  expect(input.GetItemIfSet(FN_PARAM_TABLE_NAME, false)).toBeDefined();
  expect(input.GetItemIfSet(FN_TABLE_REP, false)).toBeUndefined();
  expect(f.attrs).not.toHaveBeenCalled();
  expect(f.table.GetName()).toBe("Renamed");
  expect(f.table.GetFormat()).toStrictEqual(f.format);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  for (let i = 0; i < 3; i++) {
    act(
      /** Undoes the native rename. @returns Nothing. */ () => {
        expect(f.shell.Undo()).toBe(true);
      },
    );
    expect(f.table.GetName()).toBe("Original");
    act(
      /** Redoes the native rename. @returns Nothing. */ () => {
        expect(f.shell.Redo()).toBe(true);
      },
    );
    expect(f.table.GetName()).toBe("Renamed");
  }
  expect(f.table.GetTabLines()).toEqual(f.lines);
  expect(f.shell.CaptureCursorState()).toEqual(f.cursor);
});
it("mounted upper spacing emits only native upper-lower items and one frame action", /** Checks isolated spacing without headline or geometry defaults. @returns Nothing. */ () => {
  const f = fixture();
  fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
  fireEvent.change(screen.getByRole("spinbutton", { name: "Above (cm)" }), {
    target: { value: "2.54" },
  });
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  const input = accepted(f);
  expect(input.Count()).toBe(1);
  expect(input.GetItemIfSet(RES_UL_SPACE, false)).toBeDefined();
  expect(input.GetItemIfSet(FN_TABLE_REP, false)).toBeUndefined();
  expect(f.header).not.toHaveBeenCalled();
  expect(f.columns).not.toHaveBeenCalled();
  expect(f.table.GetFormat()).toStrictEqual({ ...f.format, marginTop: 1440, marginBottom: 0 });
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  act(
    /** Restores the complete original frame attributes. @returns Nothing. */ () => {
      expect(f.shell.Undo()).toBe(true);
    },
  );
  expect(f.table.GetFormat()).toStrictEqual(f.format);
});
it("mounted Text Flow publishes changed headline and split without a table representation", /** Checks actual saved widget flags and original geometry. @returns Nothing. */ () => {
  const f = fixture();
  fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
  fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "Repeat header" }));
  fireEvent.click(
    screen.getByRole("checkbox", {
      name: "Allow table to split across pages and columns",
    }),
  );
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  const input = accepted(f);
  expect(input.Count()).toBe(2);
  expect(input.GetItemIfSet(FN_PARAM_TABLE_HEADLINE, false)).toBeDefined();
  expect(input.GetItemIfSet(RES_LAYOUT_SPLIT, false)).toBeDefined();
  expect(input.GetItemIfSet(FN_TABLE_REP, false)).toBeUndefined();
  expect(f.columns).not.toHaveBeenCalled();
  expect(f.table.GetRowsToRepeat()).toBe(1);
  expect(f.table.GetFormat().layoutSplit).toBe(false);
  expect(f.table.GetFormat().width).toBe(6000);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
});

it("mounted visited Borders publishes native inner-border metadata and one source history group", /** Checks the created native border page output. @returns Nothing. */ () => {
  const f = fixture();
  fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
  fireEvent.click(screen.getByRole("tab", { name: "Borders" }));
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  const input = accepted(f);
  expect(input.Count()).toBe(1);
  expect(input.GetItemIfSet(SID_ATTR_BORDER_INNER, false)).toBeDefined();
  expect(input.GetItemIfSet(FN_TABLE_REP, false)).toBeUndefined();
  expect(f.attrs).not.toHaveBeenCalled();
  expect(f.header).not.toHaveBeenCalled();
  expect(f.columns).not.toHaveBeenCalled();
  expect(f.table.GetFormat()).toStrictEqual(f.format);
  expect(
    f.boxes.map(
      /** Reads complete original box formats. @param box - Owner. @returns Format. */ (box) =>
        box.GetFormat(),
    ),
  ).toStrictEqual(
    f.boxFormats.map(
      /** Includes explicitly admitted inherited border items. @param format - Original format. @param index - Cell index. @returns Format. */ (
        format,
        index,
      ) => ({ ...format, box: f.originalBoxItems[index] }),
    ),
  );
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(f.shell.CaptureCursorState()).toEqual(f.cursor);
  act(
    /** Reverts admitted native metadata history. @returns Nothing. */ () => {
      expect(f.shell.Undo()).toBe(true);
    },
  );
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  expect(
    f.boxes.map(
      /** Reads fully restored original formats. @param box - Owner. @returns Format. */ (box) =>
        box.GetFormat(),
    ),
  ).toStrictEqual(f.boxFormats);
  expect(f.shell.CaptureCursorState()).toEqual(f.cursor);
});

it("mounted visited Columns advertises the borrowed native representation even without edits", /** Checks native unconditional deactivation output and original widths. @returns Nothing. */ () => {
  const f = fixture();
  fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
  fireEvent.click(screen.getByRole("tab", { name: "Columns" }));
  fireEvent.click(screen.getByRole("tab", { name: "Table" }));
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  const input = accepted(f);
  expect(input.Count()).toBe(1);
  const item = input.Get(FN_TABLE_REP) as import("../../source/uibase/utlui/uiitems").SwPtrItem;
  const rep = item.GetValue() as import("../../source/uibase/table/swtablerep").SwTableRep;
  expect(rep.HasWidthChanged()).toBe(false);
  expect(rep.HasColsChanged()).toBe(false);
  expect(f.columns).not.toHaveBeenCalled();
  expect(f.header).not.toHaveBeenCalled();
  expect(f.table.GetFormat()).toStrictEqual({
    ...f.format,
    width: 6000,
    horiOrient: H.LEFT,
    marginLeft: 0,
    marginRight: rep.space - 6000,
    align: undefined,
  });
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(
    f.boxes.map(
      /** Reads complete unmodified cells. @param box - Owner. @returns Format. */ (box) =>
        box.GetFormat(),
    ),
  ).toStrictEqual(f.boxFormats);
  act(
    /** Reverts admitted frame attributes. @returns Nothing. */ () => {
      expect(f.shell.Undo()).toBe(true);
    },
  );
  expect(f.table.GetFormat()).toStrictEqual(f.format);
  expect(f.shell.CaptureCursorState()).toEqual(f.cursor);
});

it("native publication rejects a spaced name before both page exchange and OK", /** Checks no accepted native payload during failed page admission. @returns Nothing. */ () => {
  const f = fixture();
  fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
    target: { value: "Invalid name" },
  });
  fireEvent.click(screen.getByRole("tab", { name: "Columns" }));
  expect(screen.getByRole("tab", { name: "Table" })).toHaveAttribute("aria-selected", "true");
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(screen.getByText("The name of the table must not contain spaces.")).toBeVisible();
  expect(screen.getByRole("textbox", { name: "Name" })).toHaveFocus();
  expect(f.acceptance).not.toHaveBeenCalled();
  expect(f.table.GetFormat()).toStrictEqual(f.format);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});

it("native publication refuses an empty table graph without accepting changed name items", /** Checks dimensional validation before native output acceptance. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    table = doc.nodes.MakeTableNode("Empty", { width: 6000 }),
    submit = vi.fn();
  render(
    <WriterTableDialog table={table} availableWidth={9000} onCancel={vi.fn()} onSubmit={submit} />,
  );
  fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
    target: { value: "Accepted" },
  });
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(
    screen.getByText("Enter valid table dimensions and positive column widths."),
  ).toBeVisible();
  expect(submit).not.toHaveBeenCalled();
  expect(table.GetName()).toBe("Empty");
  expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});

it("native vertical-only UI output advertises the literal alignment item and restores original cell formats", /** Checks represented cell attributes through native changed items. @returns Nothing. */ () => {
  const f = fixture();
  fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
  fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
  fireEvent.change(screen.getByRole("combobox", { name: "Cell vertical alignment" }), {
    target: { value: "3" },
  });
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  const input = accepted(f);
  expect(input.Count()).toBe(1);
  expect(input.GetItemIfSet(FN_TABLE_SET_VERT_ALIGN, false)?.QueryValue()).toBe(3);
  expect(input.GetItemIfSet(FN_TABLE_REP, false)).toBeUndefined();
  expect(f.attrs).not.toHaveBeenCalled();
  expect(f.columns).not.toHaveBeenCalled();
  expect(f.table.GetFormat()).toStrictEqual(f.format);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(required(f.boxes[4]).GetVertOrient().GetVertOrient()).toBe(3);
  act(
    /** Restores original cell item owners. @returns Nothing. */ () => {
      expect(f.shell.Undo()).toBe(true);
    },
  );
  expect(
    f.boxes.map(
      /** Reads complete original cell formats. @param box - Owner. @returns Format. */ (box) =>
        box.GetFormat(),
    ),
  ).toStrictEqual(f.boxFormats);
  expect(f.shell.CaptureCursorState()).toEqual(f.cursor);
});

it("native active Columns acceptance applies its representation without separator writes", /** Checks native exchange output on final active page. @returns Nothing. */ () => {
  const f = fixture();
  fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
  fireEvent.click(screen.getByRole("tab", { name: "Columns" }));
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  const input = accepted(f);
  expect(input.Count()).toBe(1);
  expect(input.GetItemIfSet(FN_TABLE_REP, false)).toBeDefined();
  expect(f.columns).not.toHaveBeenCalled();
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(f.shell.CaptureCursorState()).toEqual(f.cursor);
});

it.each(["Table", "Columns", "Text Flow", "Borders"])(
  "native Reset%s clears that page exchanged items without leaking cancelled spacing",
  /** Checks page-scoped output reset with original model preservation. @param page - Reset native page. @returns Nothing. */ (
    page,
  ) => {
    const f = fixture();
    fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Above (cm)" }), {
      target: { value: "2.54" },
    });
    fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
    fireEvent.click(screen.getByRole("tab", { name: "Table" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    fireEvent.click(screen.getByRole("tab", { name: page }));
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    const input = accepted(f);
    expect(input.GetItemIfSet(RES_UL_SPACE, false)).toBeUndefined();
    expect(f.table.GetFormat().marginTop).toBeUndefined();
    expect(f.table.GetFormat().marginBottom).toBeUndefined();
    expect(f.header).not.toHaveBeenCalled();
    expect(f.columns).not.toHaveBeenCalled();
    expect(f.shell.CaptureCursorState()).toEqual(f.cursor);
    expect(f.node.GetText()).toBe("Original cell");
  },
);

it.each([true, false])(
  "native insertion branch remains separate from properties item output header%s",
  /** Checks unchanged insertion options beside direct native properties ingress. @param header - Explicit headline admission. @returns Nothing. */ (
    header,
  ) => {
    const session = createWriterDocumentSession();
    sessions.push(session);
    const shell = session.view.GetWrtShell(),
      insert = vi.spyOn(shell, "InsertTable");
    render(<WriterWorkbench isActive view={session.view} />);
    fireEvent.click(screen.getByRole("button", { name: "Insert Table" }));
    fireEvent.click(
      within(screen.getByLabelText("Table size").parentElement as HTMLElement).getByRole("button", {
        name: "More Options",
      }),
    );
    const dialog = within(screen.getByRole("dialog", { name: "Insert Table" }));
    if (header) {
      fireEvent.click(dialog.getByRole("checkbox", { name: "Header" }));
      fireEvent.click(dialog.getByRole("checkbox", { name: "Repeat header rows on new pages" }));
      fireEvent.click(dialog.getByRole("checkbox", { name: "Don’t split table over pages" }));
    }
    fireEvent.click(dialog.getByRole("button", { name: "Insert" }));
    expect(insert).toHaveBeenCalled();
    expect(insert.mock.calls[0]?.[0]).toEqual({ mnInsMode: header ? 2 : 8, mnRowsToRepeat: 0 });
    expect(session.docShell.GetDoc().GetTables()).toHaveLength(1);
  },
);

it("native repeated-headline insertion retains the existing explicit insertion contract", /** Checks headline count on the original graph beside native property output. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const shell = session.view.GetWrtShell(),
    insert = vi.spyOn(shell, "InsertTable");
  render(<WriterWorkbench isActive view={session.view} />);
  fireEvent.click(screen.getByRole("button", { name: "Insert Table" }));
  fireEvent.click(
    within(screen.getByLabelText("Table size").parentElement as HTMLElement).getByRole("button", {
      name: "More Options",
    }),
  );
  const dialog = within(screen.getByRole("dialog", { name: "Insert Table" }));
  fireEvent.click(dialog.getByRole("checkbox", { name: "Header" }));
  fireEvent.click(dialog.getByRole("button", { name: "Insert" }));
  expect(insert.mock.calls[0]?.[0]).toEqual({ mnInsMode: 10, mnRowsToRepeat: 1 });
  expect(session.docShell.GetDoc().GetTables()[0]?.GetRowsToRepeat()).toBe(1);
  expect(session.docShell.GetDoc().GetUndoManager().GetUndoActionCount()).toBe(1);
  act(
    /** Restores the original native insertion graph. @returns Nothing. */ () => {
      expect(shell.Undo()).toBe(true);
    },
  );
  expect(session.docShell.GetDoc().GetTables()).toHaveLength(0);
});
