/** @fileoverview Native ordinary formula block input and real default clipboard/Undo orchestration. */
import { expect, it } from "vitest";
import { ScDocShell } from "../docshell/docsh";
import { ScTabViewShell } from "../inc/tabvwsh";
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScPatternAttr } from "../../../inc/patattr";
import { ScMergeAttr } from "../../../inc/attrib";
import { ScPasteFunc, InsCellCmd, InsertDeleteFlags as F } from "../../../inc/global";
import { scPasteResourcesEnglish as R } from "../../../inc/globstr";
import { ScEditableTester } from "../inc/editable";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { readOdsDocument, writeOdsDocument } from "../../filter/xml/xmlwrap";
/** Creates the actual copy-mode document sharing live resources. @param doc - Source. @param range - Clip range. @returns Owned native clipboard. */
function clipboard(doc: ScDocument, range = new ScRange()): ScDocument {
  const clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  clip.ResetClip(doc, range.aStart.Tab());
  clip.SetClipArea(range);
  clip.SetValue(range.aStart, 7);
  return clip;
}
it("fills relative formulas over a rectangle with one native paste action preserving styles and fresh ODS reopen", /** One original formula is cloned by clipboard contexts,not reparsed per cell. @returns Completion. */ async () => {
  const shell = new ScDocShell(),
    doc = shell.GetDocument(),
    view = new ScTabViewShell(shell),
    data = view.GetViewData();
  doc.SetValue(new ScAddress(), 3);
  doc.SetValue(new ScAddress(1, 0, 0), 5);
  const pattern = new ScPatternAttr(doc.getCellAttributeHelper());
  pattern.ItemSetPut(new SvxFontHeightItem(320, 100, 101));
  doc.ApplyPatternAreaTab(0, 1, 1, 2, 0, pattern);
  data.SetCurX(0);
  data.SetCurY(1);
  data.GetMarkData().SetMarkArea(new ScRange(0, 1, 0, 1, 2, 0));
  view.EnterBlock(unicode("=A1+$A$1"), null);
  expect([
    doc.GetValue(new ScAddress(0, 1, 0)),
    doc.GetValue(new ScAddress(1, 1, 0)),
    doc.GetValue(new ScAddress(0, 2, 0)),
    doc.GetValue(new ScAddress(1, 2, 0)),
  ]).toEqual([6, 8, 9, 11]);
  const cell = doc.GetFormulaCell(new ScAddress(1, 2, 0));
  if (!cell) throw Error("Missing actual formula");
  expect(text(cell.GetFormula(doc.GetGrammar()))).toBe("=B2+$A$1");
  expect(
    (
      (doc.GetPattern(new ScAddress(1, 2, 0)) as ScPatternAttr).GetItem(101) as SvxFontHeightItem
    ).GetHeight(),
  ).toBe(320);
  expect(shell.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(shell.GetUndoManager().GetListActionDepth()).toBe(0);
  expect(shell.Undo()).toBe(true);
  expect(doc.GetFormulaCell(new ScAddress(1, 2, 0))).toBeNull();
  expect(shell.Redo()).toBe(true);
  expect(doc.GetValue(new ScAddress(1, 2, 0))).toBe(11);
  const reopened = await readOdsDocument(writeOdsDocument(doc));
  expect(reopened.GetValue(new ScAddress(1, 2, 0))).toBe(11);
  reopened.Dispose();
  pattern.Dispose();
  shell.Close();
});
it("uses native multi-selection error then single-cell EnterData fallback and admits reducible marks", /** Genuine disjoint marks preserve the native fallback instead of repeating block input. @returns Nothing. */ () => {
  const shell = new ScDocShell(),
    doc = shell.GetDocument(),
    view = new ScTabViewShell(shell),
    data = view.GetViewData(),
    marks = data.GetMarkData();
  const errors: string[] = [];
  view.SetErrorMessageHandler(
    /** Captures actual presentation output. @param message - Resource. @returns Nothing. */ (
      message,
    ) => {
      errors.push(message);
    },
  );
  marks.SetMultiMarkArea(new ScRange(), true);
  marks.SetMultiMarkArea(new ScRange(2, 2, 0, 2, 2, 0), true);
  view.EnterBlock(unicode("=5"), null);
  expect(errors).toEqual([R.STR_MSSG_PASTEFROMCLIP_0]);
  expect(doc.GetValue(new ScAddress())).toBe(5);
  expect(doc.GetFormulaCell(new ScAddress(2, 2, 0))).toBeNull();
  marks.ResetMark();
  marks.SetMultiMarkArea(new ScRange(1, 1, 0, 1, 2, 0), true);
  data.SetCurX(1);
  data.SetCurY(1);
  view.EnterBlock(unicode("=9"), null);
  expect(doc.GetValue(new ScAddress(1, 2, 0))).toBe(9);
  view.SetErrorMessageHandler(undefined);
  view.ErrorMessage(R.STR_PASTE_FULL);
  expect(ScEditableTester.CreateAndTestBlock(doc, 0, 0, 0, 0, 0).GetMessageId()).toBe("");
  expect(ScEditableTester.CreateAndTestBlock(doc, 1, 0, 0, 0, 0).GetMessageId()).toBe(
    R.STR_PROTECTIONERR,
  );
  shell.Close();
});
it("rejects native fill bounds and unavailable input families before changing cells", /** Real sheet limits and public parameters drive boundary checks. @returns Nothing. */ () => {
  const shell = new ScDocShell(),
    view = new ScTabViewShell(shell),
    doc = shell.GetDocument(),
    data = view.GetViewData();
  data.GetMarkData().SetMarkArea(new ScRange(0, 0, 0, doc.MaxCol(), doc.MaxRow(), 0));
  view.EnterBlock(unicode("=2"), null);
  const clip = clipboard(doc);
  expect(view.PasteFromClip(F.CONTENTS, clip)).toBe(false);
  clip.Dispose();
  expect(shell.GetUndoManager().GetUndoActionCount()).toBe(0);
  data.GetMarkData().ResetMark();
  expect(
    /** Actual unported input boundary. @returns Nothing. */ () =>
      view.EnterBlock(unicode("plain"), null),
  ).toThrow("nonformula EnterBlock");
  expect(
    /** Runtime ABI rejects an actual supplied rich object. @returns Nothing. */ () =>
      view.EnterBlock(unicode("=2"), {} as unknown as null),
  ).toThrow("rich-edit EnterBlock");
  shell.Close();
});
it("pastes cursor and expanded selections through real snapshots and balances history on actual foreign-formatter failure", /** Source bounds,resource identity and actual clipboard geometry are retained. @returns Nothing. */ () => {
  const shell = new ScDocShell(),
    view = new ScTabViewShell(shell),
    doc = shell.GetDocument(),
    data = view.GetViewData(),
    clip = clipboard(doc, new ScRange(0, 0, 0, 1, 1, 0));
  clip.SetValue(new ScAddress(1, 0, 0), 8);
  clip.SetValue(new ScAddress(0, 1, 0), 9);
  expect(view.PasteFromClip(F.CONTENTS, null)).toBe(false);
  expect(view.PasteFromClip(F.CONTENTS, clip)).toBe(true);
  expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(8);
  expect(doc.GetValue(new ScAddress(0, 1, 0))).toBe(9);
  data.GetMarkData().SetMarkArea(new ScRange(4, 4, 0, 4, 4, 0));
  expect(view.PasteFromClip(F.CONTENTS, clip)).toBe(true);
  expect(doc.GetValue(new ScAddress(5, 4, 0))).toBe(8);
  const other = new ScDocument();
  other.InsertTab(0, unicode("Foreign"));
  const foreign = clipboard(other);
  expect(
    /** Real independent formatter identity triggers the native unavailable merge path. @returns Nothing. */ () =>
      view.PasteFromClip(F.CONTENTS, foreign),
  ).toThrow("Foreign number-formatter");
  expect(shell.GetUndoManager().GetListActionDepth()).toBe(0);
  foreign.Dispose();
  other.Dispose();
  clip.Dispose();
  shell.Close();
});
it("keeps nondefault paste families explicit and reports actual sheet overflow through native resources", /** Real parameter flags,filter runs and merge attributes reach admission boundaries without fake services. @returns Nothing. */ () => {
  const shell = new ScDocShell(),
    view = new ScTabViewShell(shell),
    doc = shell.GetDocument(),
    data = view.GetViewData(),
    clip = clipboard(doc);
  const requests: Parameters<ScTabViewShell["PasteFromClip"]>[] = [
    [F.ATTRIB, clip],
    [F.CONTENTS, clip, ScPasteFunc.ADD],
    [F.CONTENTS, clip, ScPasteFunc.NONE, true],
    [F.CONTENTS, clip, ScPasteFunc.NONE, false, true],
    [F.CONTENTS, clip, ScPasteFunc.NONE, false, false, true],
    [F.CONTENTS, clip, ScPasteFunc.NONE, false, false, false, InsCellCmd.INS_CELLSDOWN],
    [F.CONTENTS, clip, ScPasteFunc.NONE, false, false, false, InsCellCmd.INS_NONE, F.ALL],
    [F.CONTENTS, clip, ScPasteFunc.NONE, false, false, false, InsCellCmd.INS_NONE, F.NONE, true],
  ];
  for (const request of requests)
    expect(
      /** Uses the actual public native signature. @returns Paste result. */ () =>
        view.PasteFromClip(...request),
    ).toThrow("Nondefault native paste");
  expect(
    /** A normal document is a real owner but violates clipboard admission. @returns Paste result. */ () =>
      view.PasteFromClip(F.CONTENTS, doc),
  ).toThrow("copy-mode clipboard");
  clip.SetClipArea(new ScRange(), true);
  expect(
    /** Actual cut clipboard. @returns Paste result. */ () => view.PasteFromClip(F.CONTENTS, clip),
  ).toThrow("copy-mode clipboard");
  clip.SetClipArea(new ScRange());
  clip.GetClipParam().maRanges.push_back(new ScRange(2, 2, 0, 2, 2, 0));
  expect(
    /** Actual multi-range source. @returns Paste result. */ () =>
      view.PasteFromClip(F.CONTENTS, clip),
  ).toThrow("multi-range paste");
  clip.SetClipArea(new ScRange());
  const marks = data.GetMarkData();
  marks.SetMultiMarkArea(new ScRange(), true);
  marks.SetMultiMarkArea(new ScRange(2, 2, 0, 2, 2, 0), true);
  expect(
    /** Actual disjoint destination. @returns Paste result. */ () =>
      view.PasteFromClip(F.CONTENTS, clip),
  ).toThrow("multi-range paste");
  marks.ResetMark();
  clip.SetRowFiltered(0, 0, 0, true);
  expect(
    /** Actual filtered source geometry. @returns Paste result. */ () =>
      view.PasteFromClip(F.CONTENTS, clip),
  ).toThrow("filtered-source");
  clip.SetRowFiltered(0, 0, 0, false);
  doc.SetRowFiltered(0, 0, 0, true);
  expect(
    /** Actual cursor destination filter. @returns Paste result. */ () =>
      view.PasteFromClip(F.CONTENTS, clip),
  ).toThrow("filtered destination");
  marks.SetMarkArea(new ScRange());
  expect(
    /** Actual marked destination filter. @returns Paste result. */ () =>
      view.PasteFromClip(F.CONTENTS, clip),
  ).toThrow("filtered destination");
  doc.SetRowFiltered(0, 0, 0, false);
  marks.SetMarkArea(new ScRange(0, 0, 0, 1, 1, 0));
  clip.SetClipArea(new ScRange(0, 0, 0, 2, 2, 0));
  expect(
    /** Native larger-clipboard confirmation is an explicit presentation family. @returns Paste result. */ () =>
      view.PasteFromClip(F.CONTENTS, clip),
  ).toThrow("confirmation dialog");
  marks.SetMarkArea(new ScRange(0, 0, 0, 0, 1, 0));
  clip.SetClipArea(new ScRange(0, 0, 0, 0, 2, 0));
  expect(
    /** The independent row confirmation branch retains the source rule. @returns Paste result. */ () =>
      view.PasteFromClip(F.CONTENTS, clip),
  ).toThrow("confirmation dialog");
  marks.ResetMark();
  clip.SetClipArea(new ScRange(0, 0, 0, 1, 1, 0));
  const errors: string[] = [];
  view.SetErrorMessageHandler(
    /** Observes resolved native messages. @param message - Resource. @returns Nothing. */ (
      message,
    ) => {
      errors.push(message);
    },
  );
  data.SetCurX(doc.MaxCol());
  expect(view.PasteFromClip(F.CONTENTS, clip)).toBe(false);
  data.SetCurX(0);
  data.SetCurY(doc.MaxRow());
  expect(view.PasteFromClip(F.CONTENTS, clip)).toBe(false);
  expect(errors).toEqual([R.STR_PASTE_FULL, R.STR_PASTE_FULL]);
  data.SetCurY(0);
  clip.SetClipArea(new ScRange());
  const pattern = new ScPatternAttr(doc.getCellAttributeHelper());
  pattern.ItemSetPut(new ScMergeAttr(2, 2));
  clip.ApplyPattern(0, 0, 0, pattern);
  expect(
    /** Genuine source merge envelope requires the unported overlap/unmerge family. @returns Paste result. */ () =>
      view.PasteFromClip(F.CONTENTS, clip),
  ).toThrow("merged-source");
  expect(shell.GetUndoManager().GetUndoActionCount()).toBe(0);
  pattern.Dispose();
  clip.Dispose();
  shell.Close();
});
it("retains native full-column and full-row Undo geometry for genuinely empty clipboard content", /** Actual sparse stores exercise full logical axes without allocating per-cell stand-ins. @returns Nothing. */ () => {
  for (const column of [true, false]) {
    const shell = new ScDocShell(),
      doc = shell.GetDocument(),
      view = new ScTabViewShell(shell),
      data = view.GetViewData();
    const clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
    clip.ResetClip(doc, 0);
    clip.SetClipArea(new ScRange());
    const range = column
      ? new ScRange(0, 0, 0, 0, doc.MaxRow(), 0)
      : new ScRange(0, 0, 0, doc.MaxCol(), 0, 0);
    data.GetMarkData().SetMarkArea(range);
    expect(view.PasteFromClip(F.CONTENTS, clip)).toBe(true);
    expect(shell.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(shell.Undo()).toBe(true);
    expect(shell.Redo()).toBe(true);
    expect(doc.GetFormulaCell(new ScAddress())).toBeNull();
    clip.Dispose();
    shell.Close();
  }
});
it("queries native first-existing clipboard filters including empty range and table domains", /** Real sparse clipboard tabs preserve the source's first-used-table rule. @returns Nothing. */ () => {
  const clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  expect(clip.HasClipFilteredRows()).toBe(false);
  clip.SetClipArea(new ScRange());
  expect(clip.HasClipFilteredRows()).toBe(false);
  const doc = new ScDocument();
  for (let tab = 0; tab < 3; ++tab) doc.InsertTab(tab, unicode(`Sheet${tab}`));
  clip.ResetClip(doc, 2);
  clip.SetClipArea(new ScRange(0, 1, 2, 0, 2, 2));
  expect(clip.HasClipFilteredRows()).toBe(false);
  clip.SetRowFiltered(2, 2, 2, true);
  expect(clip.HasClipFilteredRows()).toBe(true);
  clip.Dispose();
  doc.Dispose();
});
it("retains sparse clipboard sheet lookup and native failed-editability feedback after a missing target sheet", /** Actual table owners and source validation drive both paths. @returns Nothing. */ () => {
  const shell = new ScDocShell(),
    doc = shell.GetDocument(),
    view = new ScTabViewShell(shell),
    data = view.GetViewData();
  doc.InsertTab(1, unicode("Second"));
  doc.InsertTab(2, unicode("Third"));
  const clip = clipboard(doc, new ScRange(0, 0, 2, 0, 0, 2));
  expect(view.PasteFromClip(F.CONTENTS, clip)).toBe(true);
  expect(doc.GetValue(new ScAddress())).toBe(7);
  const errors: string[] = [];
  view.SetErrorMessageHandler(
    /** Observes actual native resource output. @param message - Resolved resource. @returns Nothing. */ (
      message,
    ) => {
      errors.push(message);
    },
  );
  data.GetMarkData().ResetMark();
  data.SetTabNo(3);
  expect(view.PasteFromClip(F.CONTENTS, clip)).toBe(false);
  expect(errors).toEqual([R.STR_PROTECTIONERR]);
  clip.Dispose();
  shell.Close();
});
it("checks filtered rows newly introduced by original destination expansion", /** The native check runs after expanding a one-row marked area. @returns Nothing. */ () => {
  const shell = new ScDocShell(),
    doc = shell.GetDocument(),
    view = new ScTabViewShell(shell),
    data = view.GetViewData();
  const clip = clipboard(doc, new ScRange(0, 0, 0, 0, 1, 0));
  data.GetMarkData().SetMarkArea(new ScRange());
  doc.SetRowFiltered(1, 1, 0, true);
  expect(
    /** Actual expansion reaches the unsupported filtered-mark family before any document copy. @returns Paste result. */ () =>
      view.PasteFromClip(F.CONTENTS, clip),
  ).toThrow("filtered destination");
  expect(shell.GetUndoManager().GetUndoActionCount()).toBe(0);
  clip.Dispose();
  shell.Close();
});
it("returns from native block input when an actual edge merge selection extends beyond the sheet", /** A genuine attribute accepted at the last row reaches PasteFromClip's overflow guard before any block mutation. @returns Nothing. */ () => {
  const shell = new ScDocShell(),
    doc = shell.GetDocument(),
    view = new ScTabViewShell(shell),
    data = view.GetViewData();
  const pattern = new ScPatternAttr(doc.getCellAttributeHelper());
  pattern.ItemSetPut(new ScMergeAttr(1, 2));
  doc.ApplyPattern(0, doc.MaxRow(), 0, pattern);
  data.SetCurY(doc.MaxRow());
  data.GetMarkData().SetMarkArea(new ScRange(0, doc.MaxRow(), 0, 0, doc.MaxRow() + 1, 0));
  const errors: string[] = [];
  view.SetErrorMessageHandler(
    /** Records actual native overflow feedback. @param message - Resolved resource. @returns Nothing. */ (
      message,
    ) => {
      errors.push(message);
    },
  );
  view.EnterBlock(unicode("=2"), null);
  expect(errors).toEqual([R.STR_PASTE_FULL]);
  expect(doc.GetFormulaCell(new ScAddress(0, doc.MaxRow(), 0))).toBeNull();
  expect(shell.GetUndoManager().GetUndoActionCount()).toBe(0);
  pattern.Dispose();
  shell.Close();
});
