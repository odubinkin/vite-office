/** @fileoverview Real Writer request, native CUI controls, complete paragraph history and ODT transport in one UI flow. */
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { TabulatorDialogSession } from "../../../cui/browser/tabpages/tabstpge-session";
import { WriterParagraphDialog } from "./WriterParagraphDialog";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import type { SwWrtShell } from "../../source/uibase/wrtsh/wrtsh1";
import { SwPosition } from "../../source/core/crsr/pam";
import { SvxFrameDirection } from "../../../editeng/inc/frmdir";
import { SwTextGrid, SwTextGridItem } from "../../inc/tgrditem";
import { SvxAdjust, SvxAdjustItem } from "../../../editeng/inc/adjustitem";
import {
  ParaVertAlign,
  SvxParaVertAlignItem,
} from "../../../editeng/source/items/paraitem.controls";
import { SvxULSpaceItem } from "../../../editeng/inc/ulspitem";
import {
  SvxHangingPunctuationItem,
  SvxHyphenZoneItem,
  SvxScriptSpaceItem,
} from "../../../editeng/source/items/paraitem";
import {
  RES_FRAMEDIR,
  RES_PARATR_ADJUST,
  RES_PARATR_AUTOFRAMEDIR,
  RES_PARATR_SNAPTOGRID,
  RES_PARATR_VERTALIGN,
  RES_PARATR_FORBIDDEN_RULES,
  RES_PARATR_HANGINGPUNCTUATION,
  RES_PARATR_SCRIPTSPACE,
  RES_PARATR_HYPHENZONE as H,
  RES_UL_SPACE,
  RES_PARATR_TABSTOP as T,
} from "../../inc/hintids";
import { SvxTabStopItem, SvxTabAdjust as A } from "../../../editeng/inc/tstpitem";
import { FieldUnit as U } from "../../../tools/inc/fldunit";
import { exportParagraphAdjustment } from "../../source/filter/xml/xmlexpit";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
import { readOdtDocument } from "../../source/filter/xml/swxml";
/** Opens a real asynchronous Writer command and renders its actual pending request. @param unit - Module unit. @param prepare - Optional selection setup. @returns Real owners and command completion. */
function open(unit = U.CM, prepare?: (shell: SwWrtShell) => void) {
  const session = createWriterDocumentSession(),
    shell = session.view.GetWrtShell(),
    dialogs = session.view.GetDialogController();
  shell.Insert("Native\ttabs");
  prepare?.(shell);
  const result = session.view.Execute(WRITER_COMMAND_IDS.paragraphDialog);
  if (result.status !== "executed") throw new Error("Missing actual paragraph command");
  const pending = dialogs.GetSnapshot();
  if (pending?.request.kind !== "paragraph") throw new Error("Missing actual paragraph request");
  render(
    <WriterParagraphDialog
      dialogRequest={{ id: pending.id, request: pending.request }}
      fontSizePt={12}
      unit={unit}
      onDialogSubmit={
        /** Completes actual request. @param id - Request ID. @param value - Complete result. @returns Nothing. */ (
          id,
          value,
        ) => {
          dialogs.Complete(id, value);
        }
      }
      onDialogCancel={
        /** Cancels actual request. @param id - Request ID. @returns Nothing. */ (id) => {
          dialogs.Cancel(id);
        }
      }
    />,
  );
  return { session, shell, result, pending: { id: pending.id, request: pending.request } };
}
it("accepts pending Decimal/custom fill through the real dialog, retains controls across tabs and roundtrips native fields", /** Uses production command/item/history/filter owners. @returns Completion. */ async () => {
  const f = open(U.INCH);
  try {
    const before = f.shell.GetDoc().GetUndoManager().GetUndoActionCount();
    fireEvent.click(screen.getByRole("tab", { name: "Tabs" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Position" }), {
      target: { value: "1 in" },
    });
    fireEvent.click(screen.getByRole("radio", { name: "Decimal" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Decimal character" }), {
      target: { value: ";suffix" },
    });
    fireEvent.blur(screen.getByRole("textbox", { name: "Decimal character" }));
    fireEvent.click(screen.getByRole("radio", { name: "Character" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Fill character" }), {
      target: { value: "·extra" },
    });
    fireEvent.blur(screen.getByRole("textbox", { name: "Fill character" }));
    fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
    fireEvent.click(screen.getByRole("tab", { name: "Tabs" }));
    expect(screen.getByRole("option", { name: "1.00″" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Decimal" })).toBeChecked();
    expect(screen.getByRole("textbox", { name: "Decimal character" })).toHaveValue(";suffix");
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(await f.result.value).toBe(true);
    const item = f.shell.GetActiveParagraph().GetAttr(T) as SvxTabStopItem;
    expect(item.Count()).toBe(1);
    expect(item.At(0).GetTabPos()).toBe(1440);
    expect(item.At(0).GetAdjustment()).toBe(A.Decimal);
    expect(item.At(0).GetDecimal()).toBe(";");
    expect(item.At(0).GetFill()).toBe("·");
    expect(f.shell.GetDoc().GetUndoManager().GetUndoActionCount()).toBe(before + 1);
    f.shell.Undo();
    expect((f.shell.GetActiveParagraph().GetAttr(T) as SvxTabStopItem).At(0).GetAdjustment()).toBe(
      A.Default,
    );
    f.shell.Redo();
    const loaded = await readOdtDocument(
      await writeOdtDocument(f.shell.GetDoc(), { title: "Tabs" }),
      {
        title: "Reopen",
      },
    );
    try {
      const reopened = loaded.document.paragraphs[0]?.GetAttr(T) as SvxTabStopItem;
      expect(reopened.At(0).GetTabPos()).toBe(1440);
      expect(reopened.At(0).GetDecimal()).toBe(";");
      expect(reopened.At(0).GetFill()).toBe("·");
    } finally {
      loaded.document.Dispose();
    }
  } finally {
    cleanup();
    f.session.Close();
  }
});
it("retains native defaults when Tabs is unvisited and cancellation discards pending page output", /** Uses native lazy page and actual command cancellation. @returns Completion. */ async () => {
  for (const visit of [false, true]) {
    const f = open();
    try {
      const before = (f.shell.GetActiveParagraph().GetAttr(T) as SvxTabStopItem).Clone();
      if (visit) {
        fireEvent.click(screen.getByRole("tab", { name: "Tabs" }));
        fireEvent.change(screen.getByRole("combobox", { name: "Position" }), {
          target: { value: "2 cm" },
        });
        fireEvent.click(screen.getByRole("button", { name: "New" }));
        fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
      }
      fireEvent.click(screen.getByRole("button", { name: visit ? "Cancel" : "OK" }));
      await f.result.value;
      expect((f.shell.GetActiveParagraph().GetAttr(T) as SvxTabStopItem).equals(before)).toBe(true);
    } finally {
      cleanup();
      f.session.Close();
    }
  }
});
it("supports explicit zero and selected native row deletion with centimeter positions", /** Exercises native source New zero and actual list activation. @returns Completion. */ async () => {
  const f = open();
  try {
    fireEvent.click(screen.getByRole("tab", { name: "Tabs" }));
    fireEvent.click(screen.getByRole("button", { name: "New" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Position" }), {
      target: { value: "2.54 cm" },
    });
    fireEvent.click(screen.getByRole("radio", { name: "Right" }));
    fireEvent.click(screen.getByRole("button", { name: "New" }));
    fireEvent.change(screen.getByRole("listbox", { name: "Tab stops" }), {
      target: { value: "0" },
    });
    expect(screen.getByRole("combobox", { name: "Position" })).toHaveValue("0.00 cm");
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    await f.result.value;
    const tabs = f.shell.GetActiveParagraph().GetAttr(T) as SvxTabStopItem;
    expect(tabs.Count()).toBe(1);
    expect(tabs.At(0).GetTabPos()).toBe(1440);
    expect(tabs.At(0).GetAdjustment()).toBe(A.Right);
  } finally {
    cleanup();
    f.session.Close();
  }
});

it("routes actual tree activation and entry blur independently and retains committed filler choices", /** Exercises real DOM keyboard/double-click/focus events. @returns Completion. */ async () => {
  const f = open();
  try {
    fireEvent.click(screen.getByRole("tab", { name: "Tabs" }));
    const position = screen.getByRole("combobox", { name: "Position" });
    fireEvent.change(position, { target: { value: "2 cm" } });
    fireEvent.blur(position);
    expect(position).toHaveValue("2.00 cm");
    fireEvent.click(screen.getByRole("radio", { name: "Centered" }));
    fireEvent.click(screen.getByRole("radio", { name: "........" }));
    fireEvent.click(screen.getByRole("button", { name: "New" }));
    const list = screen.getByRole("listbox", { name: "Tab stops" });
    fireEvent.doubleClick(list);
    fireEvent.keyDown(list, { key: "ArrowDown" });
    fireEvent.keyDown(list, { key: "Enter" });
    expect(screen.getByRole("radio", { name: "Centered" })).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "Delete All" }));
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    await f.result.value;
    expect((f.shell.GetActiveParagraph().GetAttr(T) as SvxTabStopItem).At(0).GetAdjustment()).toBe(
      A.Default,
    );
  } finally {
    cleanup();
    f.session.Close();
  }
});

it("keeps an uncreated tab page inert and maps an empty actual tree selection to empty entry text", /** Uses actual session owners and DOM selection without a fake provider. @returns Completion. */ async () => {
  const f = open();
  try {
    const tabs = new TabulatorDialogSession(f.pending.request.pageInput, U.CM);
    tabs.Deactivate(0);
    expect(tabs.output.Count()).toBe(0);
    fireEvent.click(screen.getByRole("tab", { name: "Tabs" }));
    fireEvent.change(screen.getByRole("listbox", { name: "Tab stops" }), { target: { value: "" } });
    expect(screen.getByRole("combobox", { name: "Position" })).toHaveValue("");
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await f.result.value;
  } finally {
    cleanup();
    f.session.Close();
  }
});

it("selects the complete reformatted position after native New updates the actual entry", /** React commits the source text before the deferred browser focus/select operation. @returns Completion. */ async () => {
  const f = open(U.INCH);
  try {
    fireEvent.click(screen.getByRole("tab", { name: "Tabs" }));
    const entry = screen.getByRole("combobox", { name: "Position" }) as HTMLInputElement;
    fireEvent.change(entry, { target: { value: "1 in" } });
    fireEvent.click(screen.getByRole("button", { name: "New" }));
    expect(entry).toHaveValue("1.00″");
    expect(document.activeElement).toBe(entry);
    expect(entry.selectionStart).toBe(0);
    expect(entry.selectionEnd).toBe(entry.value.length);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await f.result.value;
  } finally {
    cleanup();
    f.session.Close();
  }
});

it("synthetic-only: pins browser focus without selection for the native unreachable deletion request", /** The actual registered browser callback receives false explicitly; this verifies its contract without claiming that normal native handlers emit it. @returns Completion. */ async () => {
  const registration = vi.spyOn(TabulatorDialogSession.prototype, "SetFocus");
  const f = open();
  try {
    fireEvent.click(screen.getByRole("tab", { name: "Tabs" }));
    const callback = registration.mock.calls.find(
      /** Borrows the actual mounted browser callback. @param call - Real registration. @returns Whether installed. */
      (call) => call[0] !== undefined,
    )?.[0];
    if (!callback) throw new Error("Missing actual browser focus callback");
    const entry = screen.getByRole("combobox", { name: "Position" }) as HTMLInputElement;
    callback(false);
    fireEvent.change(entry, { target: { value: "3 cm" } });
    expect(document.activeElement).toBe(entry);
    expect(entry.selectionStart).toBe(entry.selectionEnd);
    expect(entry.selectionEnd).toBe(entry.value.length);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await f.result.value;
  } finally {
    cleanup();
    f.session.Close();
    registration.mockRestore();
  }
});

it("applies one typed hyphenation edit to mixed paragraphs, with independent spacing and undo", /** Exercises the native Paragraph Text Flow request, page exchange and selected item history. @returns Completion. */ async () => {
  const f = open(
    U.CM,
    /** Creates two selected paragraphs with different hyphenation and spacing. @param shell - Real Writer editing shell. @returns Nothing. */
    (shell) => {
      shell.SplitNode();
      shell.Insert("Next paragraph");
      const [first, second] = shell.GetDoc().paragraphs;
      if (!first || !second) throw new Error("Missing test paragraphs.");
      first.SetAttr(new SvxHyphenZoneItem(true, H, { minLead: 2 }));
      second.SetAttr(new SvxHyphenZoneItem(true, H, { minLead: 5 }));
      first.SetAttr(new SvxULSpaceItem(40, 0, RES_UL_SPACE));
      second.SetAttr(new SvxULSpaceItem(80, 0, RES_UL_SPACE));
      const start = new SwPosition(first, 0);
      const end = new SwPosition(second, second.Len());
      shell.SetPaM(end, start);
      start.Dispose();
      end.Dispose();
    },
  );
  try {
    const document = f.shell.GetDoc();
    const before = document.GetUndoManager().GetUndoActionCount();
    fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
    const automatic = screen.getByRole("checkbox", { name: "Automatically" });
    const lead = screen.getByRole("spinbutton", { name: "Characters at line end" });
    expect(automatic).toBePartiallyChecked();
    expect(lead).toBeDisabled();
    fireEvent.click(automatic);
    fireEvent.click(automatic);
    fireEvent.change(lead, { target: { value: "4" } });
    fireEvent.click(screen.getByRole("tab", { name: "Tabs" }));
    fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
    expect(lead).toHaveValue(4);
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(await f.result.value).toBe(true);
    for (const [index, node] of document.paragraphs.entries()) {
      expect((node.GetAttr(H) as SvxHyphenZoneItem).QueryValue()).toMatchObject({
        hyphen: true,
        minLead: 4,
      });
      expect((node.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetUpper()).toBe(40 * (index + 1));
    }
    expect(document.GetUndoManager().GetUndoActionCount()).toBe(before + 1);
    expect(f.shell.Undo()).toBe(true);
    expect(document.paragraphs[0]?.GetAttr(H).QueryValue()).toMatchObject({ minLead: 2 });
    expect(document.paragraphs[1]?.GetAttr(H).QueryValue()).toMatchObject({ minLead: 5 });
  } finally {
    cleanup();
    f.session.Close();
  }
});

it("persists paragraph alignment and justification from the upstream dialog scenario", /** Uses the regular command, native item history and ODT document reopening. @returns Completion. */ async () => {
  const f = open(
    U.CM,
    /** Enables a native page line grid to test its paragraph participation. @param shell - Editing shell. @returns Nothing. */
    (shell) => {
      const grid = new SwTextGridItem();
      grid.SetGridType(SwTextGrid.LinesOnly);
      grid.SetBaseHeight(400);
      grid.SetRubyHeight(0);
      shell.GetDoc().GetPageDesc().GetMaster().SetFormatAttr(grid);
    },
  );
  try {
    const before = f.shell.GetDoc().GetUndoManager().GetUndoActionCount();
    fireEvent.click(screen.getByRole("tab", { name: "Alignment" }));
    const textDirection = screen.getByRole("combobox", { name: "Text direction" });
    const automatic = screen.getByRole("checkbox", { name: "Automatically set direction" });
    const snap = screen.getByRole("checkbox", { name: "Snap to text grid (if active)" });
    const beforeStyle = f.session.viewStore.GetSnapshot().activeParagraph.computedStyle;
    expect(beforeStyle.lineHeight * beforeStyle.fontSizePt).toBeCloseTo(20);
    expect(automatic).toBeChecked();
    expect(snap).toBeChecked();
    fireEvent.change(textDirection, {
      target: { value: String(SvxFrameDirection.Horizontal_LR_TB) },
    });
    fireEvent.click(automatic);
    fireEvent.click(snap);
    fireEvent.click(screen.getByRole("radio", { name: "Justified" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Last line" }), {
      target: { value: String(SvxAdjust.Block) },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: "Expand single word" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Alignment" }), {
      target: { value: String(ParaVertAlign.Top) },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: /^Desired word spacing/ }), {
      target: { value: "115" },
    });
    fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
    fireEvent.click(screen.getByRole("tab", { name: "Alignment" }));
    expect(screen.getByRole("radio", { name: "Justified" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Expand single word" })).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(await f.result.value).toBe(true);
    const node = f.shell.GetActiveParagraph();
    const adjust = node.GetAttr(RES_PARATR_ADJUST) as SvxAdjustItem;
    expect(node.GetAttr(RES_FRAMEDIR).QueryValue()).toBe(0);
    expect(node.GetAttr(RES_PARATR_AUTOFRAMEDIR).QueryValue()).toBe(false);
    expect(node.GetAttr(RES_PARATR_SNAPTOGRID).QueryValue()).toBe(false);
    const style = f.session.viewStore.GetSnapshot().activeParagraph.computedStyle;
    expect(style.lineHeight * style.fontSizePt).toBeLessThan(20);
    expect(adjust.GetAdjust()).toBe(SvxAdjust.Block);
    expect(adjust.GetLastBlock()).toBe(SvxAdjust.Block);
    expect(adjust.GetOneWord()).toBe(SvxAdjust.Block);
    expect(adjust.GetPropWordSpacing()).toBe(115);
    expect((node.GetAttr(RES_PARATR_VERTALIGN) as SvxParaVertAlignItem).GetValue()).toBe(
      ParaVertAlign.Top,
    );
    expect(f.shell.GetDoc().GetUndoManager().GetUndoActionCount()).toBe(before + 1);
    f.shell.Undo();
    expect(
      (f.shell.GetActiveParagraph().GetAttr(RES_PARATR_ADJUST) as SvxAdjustItem).GetAdjust(),
    ).not.toBe(SvxAdjust.Block);
    f.shell.Redo();
    const loaded = await readOdtDocument(
      await writeOdtDocument(f.shell.GetDoc(), { title: "Alignment" }),
      { title: "Alignment" },
    );
    try {
      const reopened = loaded.document.paragraphs[0];
      expect(reopened?.GetAttr(RES_FRAMEDIR).QueryValue()).toBe(0);
      expect(reopened?.GetAttr(RES_PARATR_AUTOFRAMEDIR).QueryValue()).toBe(false);
      expect(reopened?.GetAttr(RES_PARATR_SNAPTOGRID).QueryValue()).toBe(false);
      const reopenedAdjustment = reopened?.GetAttr(RES_PARATR_ADJUST) as SvxAdjustItem;
      expect(reopenedAdjustment.GetAdjust()).toBe(adjust.GetAdjust());
      expect(exportParagraphAdjustment(reopenedAdjustment)).toEqual(
        exportParagraphAdjustment(adjust),
      );
      expect(reopenedAdjustment.equals(adjust)).toBe(true);
      expect((reopened?.GetAttr(RES_PARATR_VERTALIGN) as SvxParaVertAlignItem).GetValue()).toBe(
        ParaVertAlign.Top,
      );
    } finally {
      loaded.document.Dispose();
    }
  } finally {
    cleanup();
    f.session.Close();
  }
});

it("leaves mixed horizontal alignment untouched when only text-to-text alignment changes", /** Exercises per-item deltas on a real multi-paragraph selection. @returns Completion. */ async () => {
  const f = open(
    U.CM,
    /** Creates a selected range with mixed item values. @param shell - Writer editing shell. @returns Nothing. */
    (shell) => {
      shell.SplitNode();
      shell.Insert("Next paragraph");
      const [first, second] = shell.GetDoc().paragraphs;
      if (!first || !second) throw new Error("Missing test paragraphs.");
      first.SetAttr(new SvxAdjustItem(SvxAdjust.Left, RES_PARATR_ADJUST));
      second.SetAttr(new SvxAdjustItem(SvxAdjust.ParaEnd, RES_PARATR_ADJUST));
      first.SetAttr(new SvxParaVertAlignItem(ParaVertAlign.Top, RES_PARATR_VERTALIGN));
      second.SetAttr(new SvxParaVertAlignItem(ParaVertAlign.Bottom, RES_PARATR_VERTALIGN));
      const start = new SwPosition(first, 0);
      const end = new SwPosition(second, second.Len());
      shell.SetPaM(end, start);
      start.Dispose();
      end.Dispose();
    },
  );
  try {
    fireEvent.click(screen.getByRole("tab", { name: "Alignment" }));
    for (const radio of screen.getAllByRole("radio")) expect(radio).not.toBeChecked();
    const vertical = screen.getByRole("combobox", { name: "Alignment" });
    expect(vertical).toHaveValue("");
    fireEvent.change(vertical, { target: { value: String(ParaVertAlign.Center) } });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(await f.result.value).toBe(true);
    for (const [index, node] of f.shell.GetDoc().paragraphs.entries()) {
      expect((node.GetAttr(RES_PARATR_ADJUST) as SvxAdjustItem).GetAdjust()).toBe(
        index === 0 ? SvxAdjust.Left : SvxAdjust.ParaEnd,
      );
      expect((node.GetAttr(RES_PARATR_VERTALIGN) as SvxParaVertAlignItem).GetValue()).toBe(
        ParaVertAlign.Center,
      );
    }
  } finally {
    cleanup();
    f.session.Close();
  }
});

it("updates native direction after typing and deletion with a single history entry", /** Ports the Writer auto-RTL editing scenario and checks the independent explicit flag. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  try {
    expect(shell.Insert("שלום")).toBe(true);
    const node = shell.GetActiveParagraph();
    expect(node.GetAttr(RES_PARATR_AUTOFRAMEDIR).QueryValue()).toBe(true);
    expect(node.GetSwAttrSet().GetFrameDir().GetValue()).toBe(SvxFrameDirection.Horizontal_RL_TB);
    const start = new SwPosition(node, 0);
    shell.SetCursor(start);
    start.Dispose();
    const before = shell.GetDoc().GetUndoManager().GetUndoActionCount();
    expect(shell.Insert("a")).toBe(true);
    expect(node.GetSwAttrSet().GetFrameDir().GetValue()).toBe(SvxFrameDirection.Horizontal_LR_TB);
    expect(shell.GetDoc().GetUndoManager().GetUndoActionCount()).toBe(before + 1);
    expect(shell.DelLeft()).toBe(true);
    expect(node.GetText()).toBe("שלום");
    expect(node.GetSwAttrSet().GetFrameDir().GetValue()).toBe(SvxFrameDirection.Horizontal_RL_TB);
    expect(shell.Undo()).toBe(true);
    expect(node.GetText()).toBe("aשלום");
    expect(node.GetSwAttrSet().GetFrameDir().GetValue()).toBe(SvxFrameDirection.Horizontal_LR_TB);
    expect(shell.Redo()).toBe(true);
    expect(node.GetSwAttrSet().GetFrameDir().GetValue()).toBe(SvxFrameDirection.Horizontal_RL_TB);
  } finally {
    session.Close();
  }
});

it("retains the three native Asian typography choices when reopening the dialog and the ODT", /** Ports the upstream Asian Typography dialog scenario and checks XML transport. @returns Completion. */ async () => {
  const f = open();
  try {
    const fields = [
      [
        RES_PARATR_FORBIDDEN_RULES,
        "Apply list of forbidden characters to the beginning and end of lines",
      ],
      [RES_PARATR_HANGINGPUNCTUATION, "Allow hanging punctuation"],
      [RES_PARATR_SCRIPTSPACE, "Apply spacing between Asian and non-Asian text"],
    ] as const;
    const node = f.shell.GetActiveParagraph();
    const undo = f.shell.GetDoc().GetUndoManager();
    const before = undo.GetUndoActionCount();
    fireEvent.click(screen.getByRole("tab", { name: "Asian Typography" }));
    for (const [, name] of fields) {
      const checkbox = screen.getByRole("checkbox", { name });
      expect(checkbox).toBeChecked();
      fireEvent.click(checkbox);
    }
    fireEvent.click(screen.getByRole("tab", { name: "Tabs" }));
    fireEvent.click(screen.getByRole("tab", { name: "Asian Typography" }));
    for (const [, name] of fields) expect(screen.getByRole("checkbox", { name })).not.toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(await f.result.value).toBe(true);
    for (const [which] of fields) expect(node.GetAttr(which).QueryValue()).toBe(false);
    expect(undo.GetUndoActionCount()).toBe(before + 1);
    expect(f.shell.Undo()).toBe(true);
    for (const [which] of fields) expect(node.GetAttr(which).QueryValue()).toBe(true);
    expect(f.shell.Redo()).toBe(true);
    const loaded = await readOdtDocument(
      await writeOdtDocument(f.shell.GetDoc(), { title: "Asian typography" }),
      { title: "Asian typography" },
    );
    try {
      const paragraph = loaded.document.paragraphs[0];
      for (const [which] of fields) expect(paragraph?.GetAttr(which).QueryValue()).toBe(false);
    } finally {
      loaded.document.Dispose();
    }
  } finally {
    cleanup();
    f.session.Close();
  }
});

it("keeps untouched mixed Asian typography values while applying an explicit checkbox", /** Uses an actual multi-paragraph selection with independent boolean WhichIds. @returns Completion. */ async () => {
  const f = open(
    U.CM,
    /** Creates two differently formatted paragraphs. @param shell - Editing shell. @returns Nothing. */ (
      shell,
    ) => {
      shell.SplitNode();
      shell.Insert("第二段");
      const [first, second] = shell.GetDoc().paragraphs;
      if (!first || !second) throw new Error("Missing test paragraphs.");
      first.SetAttr(new SvxHangingPunctuationItem(false, RES_PARATR_HANGINGPUNCTUATION));
      second.SetAttr(new SvxScriptSpaceItem(false, RES_PARATR_SCRIPTSPACE));
      const start = new SwPosition(first, 0);
      const end = new SwPosition(second, second.Len());
      shell.SetPaM(end, start);
      start.Dispose();
      end.Dispose();
    },
  );
  try {
    fireEvent.click(screen.getByRole("tab", { name: "Asian Typography" }));
    expect(
      screen.getByRole("checkbox", { name: "Allow hanging punctuation" }),
    ).toBePartiallyChecked();
    const spacing = screen.getByRole("checkbox", {
      name: "Apply spacing between Asian and non-Asian text",
    });
    expect(spacing).toBePartiallyChecked();
    fireEvent.click(spacing);
    expect(spacing).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(await f.result.value).toBe(true);
    const [first, second] = f.shell.GetDoc().paragraphs;
    expect(first?.GetAttr(RES_PARATR_HANGINGPUNCTUATION).QueryValue()).toBe(false);
    expect(second?.GetAttr(RES_PARATR_HANGINGPUNCTUATION).QueryValue()).toBe(true);
    expect(first?.GetAttr(RES_PARATR_SCRIPTSPACE).QueryValue()).toBe(true);
    expect(second?.GetAttr(RES_PARATR_SCRIPTSPACE).QueryValue()).toBe(true);
  } finally {
    cleanup();
    f.session.Close();
  }
});

it("applies a pool list style and authored outline level through the regular Paragraph command", /** Ports the upstream outline and list-style selection through history and ODT reopening. @returns Completion. */ async () => {
  const owner = open();
  try {
    const node = owner.shell.GetActiveParagraph();
    const document = owner.shell.GetDoc();
    const before = document.GetUndoManager().GetUndoActionCount();
    expect(document.FindNumRulePtr("Bullet •")).toBeUndefined();
    fireEvent.click(screen.getByRole("tab", { name: "Outline & List" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Outline level" }), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "List style" }), {
      target: { value: "Bullet •" },
    });
    fireEvent.click(screen.getByRole("tab", { name: "Tabs" }));
    fireEvent.click(screen.getByRole("tab", { name: "Outline & List" }));
    expect(screen.getByRole("combobox", { name: "Outline level" })).toHaveValue("1");
    expect(screen.getByRole("combobox", { name: "List style" })).toHaveValue("Bullet •");
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(await owner.result.value).toBe(true);
    expect(node.GetAttrOutlineLevel()).toBe(1);
    expect(node.GetListLabel()).toBe("•");
    expect(node.GetNumRule()?.Get(0).GetIndentAt()).toBe(227);
    expect(document.GetUndoManager().GetUndoActionCount()).toBe(before + 1);
    expect(owner.shell.Undo()).toBe(true);
    expect(node.GetAttrOutlineLevel()).toBe(0);
    expect(node.GetListLabel()).toBeUndefined();
    expect(owner.shell.Redo()).toBe(true);
    const reopened = await readOdtDocument(await writeOdtDocument(document, { title: "Outline" }), {
      title: "Outline",
    });
    try {
      expect(reopened.document.paragraphs[0]?.GetAttrOutlineLevel()).toBe(1);
      expect(reopened.document.paragraphs[0]?.GetListLabel()).toBe("•");
    } finally {
      reopened.document.Dispose();
    }
  } finally {
    cleanup();
    owner.session.Close();
  }
});

it("exchanges a restart flag and value in one undo group through the original paragraph dialog", /** Verifies the separate native slots before ODT export and reopening. @returns Completion. */ async () => {
  const owner = open();
  try {
    const node = owner.shell.GetActiveParagraph();
    const document = owner.shell.GetDoc();
    fireEvent.click(screen.getByRole("tab", { name: "Outline & List" }));
    fireEvent.change(screen.getByRole("combobox", { name: "List style" }), {
      target: { value: "Numbering 123" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: "Restart numbering at this paragraph" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Start with" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Numbering start value" }), {
      target: { value: "7" },
    });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(await owner.result.value).toBe(true);
    expect(node.IsListRestart()).toBe(true);
    expect(node.GetAttrListRestartValue()).toBe(7);
    expect(node.GetListLabel()).toBe("7.");
    expect(owner.shell.Undo()).toBe(true);
    expect(node.IsListRestart()).toBe(false);
    expect(node.HasAttrListRestartValue()).toBe(false);
    expect(node.GetListLabel()).toBeUndefined();
    expect(owner.shell.Redo()).toBe(true);
    const reopened = await readOdtDocument(await writeOdtDocument(document, { title: "Restart" }), {
      title: "Restart",
    });
    try {
      expect(reopened.document.paragraphs[0]?.IsListRestart()).toBe(true);
      expect(reopened.document.paragraphs[0]?.GetAttrListRestartValue()).toBe(7);
      expect(reopened.document.paragraphs[0]?.GetListLabel()).toBe("7.");
    } finally {
      reopened.document.Dispose();
    }
  } finally {
    cleanup();
    owner.session.Close();
  }
});
