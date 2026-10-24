/** @fileoverview Native Clear menu/shortcut command,original deletion/history/mark paths and actual ODS cleared-item transport. */
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { ScAddress, ScRange } from "../../inc/address";
import { ScInputMode, InsertDeleteFlags } from "../../inc/global";
import { SvxContourItem } from "../../../editeng/inc/contouritem";
import { SfxItemState } from "../../../svl/inc/itemset";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { ScXMLImport } from "../../source/filter/xml/xmlimprt";
import { ScDocument } from "../../inc/document";
import { createDeleteContentsUndoDoc } from "../../source/ui/docshell/docfuncutil";
import { ScDocShell } from "../../source/ui/docshell/docsh";
import { ScViewData } from "../../source/ui/view/viewdata";
import { ScViewFunc } from "../../source/ui/view/viewfunc";
import { readOdsDocument, writeOdsDocument } from "../../source/filter/xml/xmlwrap";
afterEach(cleanup);
/** Reads native text while releasing the owning SharedString returned by the document. @param doc - Actual model. @returns Text. */
function cellText(doc: ScDocument): string {
  const value = doc.GetSharedString(new ScAddress());
  try {
    return text(value.getString());
  } finally {
    value.dispose();
  }
}

it("uses the actual shared Clear menu and native attribute deletion without changing cell text", /** Executes source slot26067 and actual history. @returns Completion. */ async () => {
  const s = createCalcSession(),
    c = s.controller,
    doc = c.shell.GetDocument();
  try {
    c.EnterString("Clear formatting");
    c.SetCharacterFormat("bold", true);
    c.SetOutlineFont(new SvxContourItem(true, 107));
    render(
      <CalcWorkbench
        controller={c}
        frame={s.frame}
        fileWorkflows={s.fileWorkflows}
        sheetWorkflows={s.sheetWorkflows}
      />,
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Format" }));
    const clear = screen.getByRole("menuitem", { name: "Clear" });
    expect(clear).toBeEnabled();
    fireEvent.click(clear);
    expect(screen.getByRole("gridcell", { name: "A1" })).toHaveTextContent("Clear formatting");
    expect(doc.GetPattern(new ScAddress())?.GetItemSet().Count()).toBe(0);
    const manager = c.shell.GetUndoManager();
    expect(manager.GetUndoAction()?.GetComment()).toBe("Delete");
    manager.SetSavePosition();
    cleanup();
    c.Undo();
    expect(c.shell.GetDocumentState().isModified).toBe(true);
    expect((doc.GetPattern(new ScAddress())?.GetItem(107) as SvxContourItem).GetValue()).toBe(true);
    c.Redo();
    expect(manager.IsAtSavePosition()).toBe(true);
    expect(c.shell.GetDocumentState().isModified).toBe(false);
    expect(doc.GetPattern(new ScAddress())?.GetItemSet().Count()).toBe(0);
    let bytes = writeOdsDocument(doc);
    for (let i = 0; i < 2; i++) {
      const restored = await readOdsDocument(bytes);
      try {
        expect(restored.GetPattern(new ScAddress())?.GetItemSet().GetItemState(107, false)).toBe(
          SfxItemState.DEFAULT,
        );
        expect(cellText(restored)).toBe("Clear formatting");
        bytes = writeOdsDocument(restored);
      } finally {
        restored.DisposeAttributes();
      }
    }
    const count = manager.GetUndoActionCount();
    expect(c.ResetAttributes()).toBe(true);
    expect(manager.GetUndoActionCount()).toBe(count + 1);
  } finally {
    s.Close();
  }
});
it("keeps disjoint gaps and grouped sheets through actual marked deletion and history", /** Executes actual column mark iterators and restores native marks in the controller. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    doc = c.shell.GetDocument(),
    marks = c.viewData.GetMarkData();
  try {
    c.EnterString("Marked text");
    marks.SetMarkArea(new ScRange(0, 0, 0, 2, 0, 0));
    c.SetOutlineFont(new SvxContourItem(true, 107));
    marks.ResetMark();
    marks.SetMultiMarkArea(new ScRange(0, 0, 0, 0, 0, 0));
    marks.SetMultiMarkArea(new ScRange(2, 0, 0, 2, 0, 0));
    expect(c.ResetAttributes()).toBe(true);
    expect(
      (doc.GetPattern(new ScAddress(1, 0, 0))?.GetItem(107) as SvxContourItem).GetValue(),
    ).toBe(true);
    c.Undo();
    expect(
      (doc.GetPattern(new ScAddress(2, 0, 0))?.GetItem(107) as SvxContourItem).GetValue(),
    ).toBe(true);
    c.Redo();
    const name = unicode("Other");
    doc.InsertTab(1, name);
    name.dispose();
    marks.ResetMark();
    marks.SelectTable(1, true);
    c.SetOutlineFont(new SvxContourItem(true, 107));
    expect(c.ResetAttributes()).toBe(true);
    expect(
      doc
        .GetPattern(new ScAddress(0, 0, 1))
        ?.GetItemSet()
        .Count(),
    ).toBe(0);
    c.Undo();
    expect(
      (doc.GetPattern(new ScAddress(0, 0, 1))?.GetItem(107) as SvxContourItem).GetValue(),
    ).toBe(true);
    c.Redo();
    marks.SetMarkArea(new ScRange(0, 0, 0, 2, 0, 0));
    c.SetOutlineFont(new SvxContourItem(true, 107));
    c.ResetAttributes();
    c.Undo();
    c.Redo();
    c.StartInput(ScInputMode.SC_INPUT_TOP, "=UNPORTED(A1)");
    const count = c.shell.GetUndoManager().GetUndoActionCount();
    expect(c.ResetAttributes()).toBe(false);
    expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(count);
  } finally {
    s.Close();
  }
});
it("honors native no-mark refusal and nonrecording document-operation paths", /** No synthetic browser document or history snapshots are used. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    doc = c.shell.GetDocument(),
    marks = c.viewData.GetMarkData(),
    func = c.shell.GetDocFunc(),
    flags = InsertDeleteFlags.HARDATTR | InsertDeleteFlags.EDITATTR;
  try {
    expect(func.DeleteContents(marks, flags, true, true)).toBe(false);
    c.EnterString("Native text");
    c.SetOutlineFont(new SvxContourItem(true, 107));
    func.DeleteCell(new ScAddress(), marks, flags, false, true);
    expect(doc.GetPattern(new ScAddress())?.GetItemSet().Count()).toBe(0);
    marks.SetMarkArea(new ScRange(0, 0, 0, 0, 0, 0));
    func.DeleteContents(marks, flags, false, true);
    expect(doc.GetPattern(new ScAddress())?.GetItemSet().Count()).toBe(0);
  } finally {
    s.Close();
  }
});

it("clears independently authored automatic style XML while retaining text,numeric and formula cells", /** Source import and repeated real packages exercise deletion independent of the exporter. @returns Completion. */ async () => {
  const doc = new ScDocument();
  new ScXMLImport(doc).importContent(
    `<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:of="urn:oasis:names:tc:opendocument:xmlns:of:1.2"><office:automatic-styles><style:style style:name="Direct" style:family="table-cell"><style:text-properties fo:font-weight="bold" style:text-outline="true"/></style:style></office:automatic-styles><office:body><office:spreadsheet><table:table table:name="Sheet"><table:table-row><table:table-cell table:style-name="Direct" office:value-type="string"><text:p>Kept text</text:p></table:table-cell><table:table-cell table:style-name="Direct" office:value-type="float" office:value="7"/><table:table-cell table:style-name="Direct" table:formula="of:=[.B1]+2" office:value-type="float" office:value="9"/></table:table-row></table:table></office:spreadsheet></office:body></office:document-content>`,
  );
  const shell = new ScDocShell(doc);
  try {
    const view = new ScViewData(doc);
    view.GetMarkData().SetMarkArea(new ScRange(0, 0, 0, 2, 0, 0));
    new ScViewFunc(view, shell).DeleteContents(
      InsertDeleteFlags.HARDATTR | InsertDeleteFlags.EDITATTR,
    );
    expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(7);
    expect(doc.GetValue(new ScAddress(2, 0, 0))).toBe(9);
    expect(doc.GetPattern(new ScAddress())?.GetItemSet().Count()).toBe(0);
    let bytes = writeOdsDocument(doc);
    for (let i = 0; i < 2; i++) {
      const next = await readOdsDocument(bytes);
      try {
        expect(cellText(next)).toBe("Kept text");
        expect(next.GetValue(new ScAddress(1, 0, 0))).toBe(7);
        expect(next.GetValue(new ScAddress(2, 0, 0))).toBe(9);
        expect(next.GetPattern(new ScAddress())?.GetItemSet().Count()).toBe(0);
        bytes = writeOdsDocument(next);
      } finally {
        next.DisposeAttributes();
      }
    }
  } finally {
    shell.Close();
  }
});
it("captures original STRING undo payload only when EDITATTR is requested", /** Distinguishes actual native snapshot behavior from an attribute-only shortcut. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    doc = c.shell.GetDocument(),
    pos = new ScAddress(),
    marks = c.viewData.GetMarkData(),
    changed = unicode("Unrecorded replacement");
  try {
    c.EnterString("Original text");
    c.SetCharacterFormat("bold", true);
    c.ResetAttributes();
    doc.SetTextCell(pos, changed);
    c.Undo();
    const original = doc.GetSharedString(pos);
    try {
      expect(text(original.getString())).toBe("Original text");
    } finally {
      original.dispose();
    }
    c.Redo();
    c.shell.GetDocFunc().DeleteCell(pos, marks, InsertDeleteFlags.HARDATTR, true, true);
    doc.SetTextCell(pos, changed);
    c.Undo();
    const kept = doc.GetSharedString(pos);
    try {
      expect(text(kept.getString())).toBe("Unrecorded replacement");
    } finally {
      kept.dispose();
    }
  } finally {
    changed.dispose();
    s.Close();
  }
});
it("releases actual string snapshot ownership when delete history is discarded", /** Existing native shared-string refcounts witness undo-document lifetime. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller;
  try {
    c.EnterString("Owned snapshot");
    const manager = c.shell.GetUndoManager();
    manager.Clear();
    const borrowed = c.shell.GetDocument().GetSharedString(new ScAddress()),
      data = borrowed.getData() as NonNullable<ReturnType<typeof borrowed.getData>>;
    try {
      c.ResetAttributes();
      const held = data.refCount;
      manager.Clear();
      expect(data.refCount).toBeLessThan(held);
    } finally {
      borrowed.dispose();
    }
  } finally {
    s.Close();
  }
});

it("preserves compiled string-result formulas across clear-format undo and redo", /** Uses real controller history and native undo-mode snapshots. @returns Nothing. */ () => {
  const session = createCalcSession(),
    controller = session.controller,
    doc = controller.shell.GetDocument(),
    position = new ScAddress();
  try {
    controller.EnterString('="Formula text"');
    const formula = doc.GetFormulaCell(position) as NonNullable<
      ReturnType<ScDocument["GetFormulaCell"]>
    >;
    expect(formula).not.toBeNull();
    controller.SetCharacterFormat("bold", true);
    expect(controller.ResetAttributes()).toBe(true);
    expect(controller.Undo()).toBe(true);
    expect(doc.GetFormulaCell(position)).toBe(formula);
    expect(text(formula.GetString().getString())).toBe("Formula text");
    expect(controller.Redo()).toBe(true);
    expect(doc.GetFormulaCell(position)).toBe(formula);
    expect(controller.Undo()).toBe(true);
    expect(doc.GetFormulaCell(position)).toBe(formula);
  } finally {
    session.Close();
  }
});

it("refuses unported note-content snapshots through the actual document-copy boundary", /** Native flags request full content for notes;this slice cannot copy note owners. @returns Nothing. */ () => {
  const session = createCalcSession();
  try {
    expect(
      /** Requests actual native note-copy flags. @returns Snapshot or the real unsupported boundary. */ () =>
        createDeleteContentsUndoDoc(
          session.controller.shell.GetDocument(),
          session.controller.viewData.GetMarkData(),
          new ScRange(new ScAddress()),
          false,
          InsertDeleteFlags.NOTE,
        ),
    ).toThrow("Only attribute document copying is implemented");
  } finally {
    session.Close();
  }
});
