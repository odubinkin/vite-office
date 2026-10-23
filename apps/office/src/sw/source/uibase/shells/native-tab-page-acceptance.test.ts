/** @fileoverview Complete original tab-page item acceptance through actual Writer dialog, grouped history and physical ODT. */
import { TabulatorDialogSession } from "../../../../cui/browser/tabpages/tabstpge-session";
import { FieldUnit } from "../../../../tools/inc/fldunit";
import { GetTabDist } from "../utlui/uitool";
import { expect, it } from "vitest";
import { SwPosition } from "../../core/crsr/pam";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { createWriterTabulatorInput } from "./textsh1-tabs";
import { SvxTextLeftMarginItem, SvxIndentValue } from "../../../../editeng/inc/lrspitem";
import {
  SID_ATTR_TABSTOP,
  SID_ATTR_LRSPACE,
  SID_ATTR_TABSTOP_DEFAULTS,
  SID_ATTR_TABSTOP_POS,
  SID_ATTR_TABSTOP_OFFSET,
} from "../../../../editeng/inc/editids";
import { SfxUInt16Item, SfxInt32Item } from "../../../../svl/inc/intitem";
import { RES_MARGIN_TEXTLEFT, RES_LR_SPACE } from "../../../inc/hintids";
import { SfxItemSet, SfxItemState } from "../../../../svl/inc/itemset";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SvxTabStop, SvxTabStopItem, SvxTabAdjust } from "../../../../editeng/inc/tstpitem";
import { RES_PARATR_TABSTOP } from "../../../inc/hintids";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { readOdtDocument } from "../../filter/xml/swxml";
/** Reads complete actual tab values without rebuilding them from positions. @param item - Actual pooled item. @returns Native fields. */
function stops(item: SvxTabStopItem): unknown[] {
  return Array.from(
    { length: item.Count() },
    /** Preserves actual independent value fields. @param _unused - Sequence slot. @param index - Stop index. @returns Position/type/decimal/fill. */ (
      _unused,
      index,
    ) => {
      const stop = item.At(index);
      return [stop.GetTabPos(), stop.GetAdjustment(), stop.GetDecimal(), stop.GetFill()];
    },
  );
}
it("accepts complete tab-page fields in the same paragraph history action and reopens explicit zero/decimal/leader stops", /** Uses original native result item and actual browser-independent document I/O. @returns Completion. */ async () => {
  const session = createWriterDocumentSession(),
    shell = session.view.GetWrtShell(),
    doc = shell.GetDoc(),
    dialogs = session.view.GetDialogController();
  try {
    shell.Insert("Alpha\t12;34\tOmega");
    const before = (
        shell.GetActiveParagraph().GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem
      ).Clone(),
      count = doc.GetUndoManager().GetUndoActionCount();
    const result = session.view.Execute(WRITER_COMMAND_IDS.paragraphDialog);
    if (result.status !== "executed") throw new Error("Missing actual paragraph command");
    const request = dialogs.GetSnapshot();
    if (request?.request.kind !== "paragraph") throw new Error("Missing native paragraph request");
    const item = new SvxTabStopItem(0, 0, SvxTabAdjust.Left, RES_PARATR_TABSTOP);
    item.SetDefaultDistance(1134);
    item.Insert(new SvxTabStop(0, SvxTabAdjust.Left, ".", " "));
    item.Insert(new SvxTabStop(720, SvxTabAdjust.Decimal, ";", "."));
    item.Insert(new SvxTabStop(1440, SvxTabAdjust.Right, ".", "_"));
    const tabStopItems = new SfxItemSet(doc.GetAttrPool(), [
      [RES_PARATR_TABSTOP, RES_PARATR_TABSTOP],
    ]);
    tabStopItems.Put(item);
    expect(
      dialogs.Complete(request.id, {
        paragraphFormat: request.request.initialValue,
        paintLineNumbers: request.request.paintLineNumbers,
        tabStopItems,
      }),
    ).toBe(true);
    expect(await result.value).toBe(true);
    const accepted = shell.GetActiveParagraph().GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem;
    expect(stops(accepted)).toEqual([
      [0, SvxTabAdjust.Left, ".", " "],
      [720, SvxTabAdjust.Decimal, ";", "."],
      [1440, SvxTabAdjust.Right, ".", "_"],
    ]);
    expect(accepted.GetDefaultDistance()).toBe(1134);
    expect(item.Which()).toBe(RES_PARATR_TABSTOP);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(count + 1);
    shell.Undo();
    expect(stops(shell.GetActiveParagraph().GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem)).toEqual(
      stops(before),
    );
    shell.Redo();
    expect(stops(shell.GetActiveParagraph().GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem)).toEqual(
      stops(item),
    );
    const loaded = await readOdtDocument(writeOdtDocument(doc, { title: "Native tabs" }), {
      title: "Reopened",
    });
    try {
      expect(
        stops(loaded.document.paragraphs[0]?.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem),
      ).toEqual([
        [0, SvxTabAdjust.Left, ",", " "],
        [720, SvxTabAdjust.Decimal, ";", "."],
        [1440, SvxTabAdjust.Right, ",", "_"],
      ]);
    } finally {
      loaded.document.Dispose();
    }
  } finally {
    session.Close();
  }
});

it("retains each selected paragraph's complete tabs when the native page output is empty", /** Unchanged native page state must not replace a mixed selection with the active paragraph positions. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    shell = session.view.GetWrtShell(),
    doc = shell.GetDoc();
  try {
    const first = doc.paragraphs[0] as SwTextNode,
      second = doc.nodes.MakeTextNode("second"),
      a = new SvxTabStopItem(0, 0, SvxTabAdjust.Left, RES_PARATR_TABSTOP),
      b = a.Clone();
    first.SetText("first");
    a.Insert(new SvxTabStop(720, SvxTabAdjust.Decimal, ";", "."));
    b.Insert(new SvxTabStop(1440, SvxTabAdjust.Right, ".", "_"));
    first.SetAttr(a);
    second.SetAttr(b);
    const point = new SwPosition(second, second.Len()),
      mark = new SwPosition(first, 0);
    shell.SetPaM(point, mark);
    point.Dispose();
    mark.Dispose();
    const empty = new SfxItemSet(doc.GetAttrPool(), [[RES_PARATR_TABSTOP, RES_PARATR_TABSTOP]]),
      count = doc.GetUndoManager().GetUndoActionCount();
    expect(
      shell
        .GetTextShell()
        .ApplyParagraphFormat({ ...shell.GetTextShell().GetParagraphFormat(), upperPt: 1 }, empty),
    ).toBe(true);
    expect(stops(first.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem)).toEqual(stops(a));
    expect(stops(second.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem)).toEqual(stops(b));
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(count + 1);
    shell.Undo();
    expect(stops(second.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem)).toEqual(stops(b));
  } finally {
    session.Close();
  }
});

it("builds original tab input from actual pool defaults, mixed selection and the document indent-offset setting", /** Native Which/slot metadata and source fallback are tested against the actual document. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    shell = session.view.GetWrtShell(),
    doc = shell.GetDoc();
  try {
    const pool = doc.GetAttrPool(),
      first = shell.GetActiveParagraph(),
      second = doc.nodes.MakeTextNode("second");
    const a = new SvxTabStopItem(0, 0, SvxTabAdjust.Left, RES_PARATR_TABSTOP);
    a.Insert(new SvxTabStop(720, SvxTabAdjust.Decimal, ";", "."));
    first.SetAttr(a);
    const left = new SvxTextLeftMarginItem(RES_MARGIN_TEXTLEFT);
    left.SetTextLeft(SvxIndentValue.twips(360));
    first.SetAttr(left);
    let input = createWriterTabulatorInput(shell.GetTextShell());
    expect(pool.GetWhichIDFromSlotID(SID_ATTR_TABSTOP)).toBe(RES_PARATR_TABSTOP);
    expect(pool.GetWhichIDFromSlotID(SID_ATTR_LRSPACE)).toBe(RES_LR_SPACE);
    expect((input.Get(SID_ATTR_TABSTOP_DEFAULTS) as SfxUInt16Item).GetValue()).toBe(1134);
    expect((input.Get(SID_ATTR_TABSTOP_POS) as SfxUInt16Item).GetValue()).toBe(0);
    expect((input.Get(SID_ATTR_TABSTOP_OFFSET) as SfxInt32Item).GetValue()).toBe(360);
    doc.GetDocumentSettingManager().set("TABS_RELATIVE_TO_INDENT", false);
    input = createWriterTabulatorInput(shell.GetTextShell());
    expect((input.Get(SID_ATTR_TABSTOP_OFFSET) as SfxInt32Item).GetValue()).toBe(0);
    doc.GetDocumentSettingManager().set("TABS_RELATIVE_TO_INDENT", true);
    const point = new SwPosition(second, 0),
      mark = new SwPosition(first, 0);
    shell.SetPaM(point, mark);
    point.Dispose();
    mark.Dispose();
    input = createWriterTabulatorInput(shell.GetTextShell());
    expect(input.GetItemState(RES_PARATR_TABSTOP, false)).toBe(SfxItemState.INVALID);
    expect(input.GetItemState(RES_LR_SPACE, false)).toBe(SfxItemState.INVALID);
    expect((input.Get(SID_ATTR_TABSTOP_OFFSET) as SfxInt32Item).GetValue()).toBe(0);
    const empty = new SvxTabStopItem(0, 777, SvxTabAdjust.Default, RES_PARATR_TABSTOP);
    expect(GetTabDist(empty)).toBe(1134);
    expect(GetTabDist(a)).toBe(720);
  } finally {
    session.Close();
  }
});

it("retains legacy invalid-position rejection while native output bypasses that obsolete DTO validation", /** Uses real Writer attributes and history rather than a command mock. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    shell = session.view.GetWrtShell();
  try {
    const text = shell.GetTextShell(),
      base = text.GetParagraphFormat();
    for (const position of [-1, 0, 2000, Number.NaN])
      expect(text.ApplyParagraphFormat({ ...base, tabStopsPt: [position] })).toBe(false);
    const output = new SfxItemSet(shell.GetDoc().GetAttrPool(), [
      [RES_PARATR_TABSTOP, RES_PARATR_TABSTOP],
    ]);
    expect(text.ApplyParagraphFormat({ ...base, upperPt: 1, tabStopsPt: [0] }, output)).toBe(true);
  } finally {
    session.Close();
  }
});

it("accepts complete native tab-page output across actual selected table cells in one paragraph history action", /** Table selection uses the same original paragraph attribute traversal and native items. @returns Completion. */ async () => {
  const session = createWriterDocumentSession(),
    shell = session.view.GetWrtShell(),
    doc = shell.GetDoc();
  try {
    const table = doc.nodes.MakeTableNode("Native tabs");
    table.AddColumnWidth(3000);
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 2),
      cells = row
        .GetTabBoxes()
        .map(
          /** Borrows actual cell text. @param box - Native cell. @returns Paragraph. */ (box) =>
            box.GetParagraphs()[0] as SwTextNode,
        );
    const a = new SvxTabStopItem(0, 0, SvxTabAdjust.Left, RES_PARATR_TABSTOP),
      b = a.Clone();
    a.Insert(new SvxTabStop(720, SvxTabAdjust.Left));
    b.Insert(new SvxTabStop(1440, SvxTabAdjust.Right, ",", "_"));
    (cells[0] as SwTextNode).SetAttr(a);
    (cells[1] as SwTextNode).SetAttr(b);
    const position = new SwPosition(cells[0] as SwTextNode, 0);
    shell.SetCursor(position);
    position.Dispose();
    expect(shell.SelectTableRow()).toBe(true);
    const result = session.view.Execute(WRITER_COMMAND_IDS.paragraphDialog),
      dialogs = session.view.GetDialogController(),
      pending = dialogs.GetSnapshot();
    if (result.status !== "executed" || pending?.request.kind !== "paragraph")
      throw new Error("Missing actual paragraph dialog");
    expect(pending.request.tabContext.GetItemState(RES_PARATR_TABSTOP, false)).toBe(
      SfxItemState.INVALID,
    );
    const page = new TabulatorDialogSession(pending.request.tabContext, FieldUnit.CM);
    page.Run(
      /** Adds complete actual page fields. @param value - Native page. @returns Nothing. */ (
        value,
      ) => {
        value.entryText = "2.54 cm";
        value.ModifyHdl_Impl();
        value.TabTypeCheckHdl_Impl(SvxTabAdjust.Decimal);
        value.decimalText = ";";
        value.GetDezCharHdl_Impl();
        value.FillTypeCheckHdl_Impl("points");
        value.NewHdl_Impl(true);
      },
    );
    page.Deactivate(0);
    const before = doc.GetUndoManager().GetUndoActionCount();
    dialogs.Complete(pending.id, {
      paragraphFormat: pending.request.initialValue,
      paintLineNumbers: pending.request.paintLineNumbers,
      tabStopItems: page.output,
    });
    expect(await result.value).toBe(true);
    for (const cell of cells)
      expect(stops(cell.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem)).toEqual([
        [1440, SvxTabAdjust.Decimal, ";", "."],
      ]);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(before + 1);
    expect(shell.IsTableMode()).toBe(true);
    shell.Undo();
    expect(stops((cells[0] as SwTextNode).GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem)).toEqual(
      stops(a),
    );
    expect(stops((cells[1] as SwTextNode).GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem)).toEqual(
      stops(b),
    );
    shell.Redo();
    for (const cell of cells)
      expect((cell.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem).At(0).GetFill()).toBe(".");
  } finally {
    session.Close();
  }
});
