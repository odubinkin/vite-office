/** @fileoverview Verifies direct original native format subscriptions, actual cache invalidation and model lifetime without upstream runtime. */
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterNativeFormatObserver } from "./writer-native-format-observer";
import { SwFormatVertOrient } from "../../inc/fmtornt";
import { SwFormatFrameSize, SwFrameSize } from "../../inc/fmtfsize";
import { SvxFontHeightItem } from "../../../editeng/source/items/textitem";
import { RES_CHRATR_FONTSIZE } from "../../inc/hintids";
import { SwPosition } from "../../source/core/crsr/pam";
import { SwDoc } from "../../source/core/doc/doc";
import {
  MoveTableBoxHint,
  MoveTableLineHint,
  TableBoxFormatChanged,
  TableLineFormatChanged,
} from "../../inc/hints";

/** Requires an original native owner. @param value - Optional owner. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing original format owner");
  return value;
}

it("native format store invalidates actual root and Sfx caches from original row cell and style hints without model signals", /** Checks original identity, revision, direct values and subscription cleanup. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc();
  try {
    const table = doc.nodes.MakeTableNode("Native store"),
      row = doc.nodes.AppendTableRow(table, 2);
    const first = required(row.GetTabBoxes()[0]),
      second = required(row.GetTabBoxes()[1]);
    const format = first.GetFrameFormat(),
      rowFormat = row.GetFrameFormat();
    const node = required(first.GetParagraphs()[0]);
    node.SetText("Original cell text");
    const style = doc.GetDfltTextFormatColl();
    const baseline = session.viewStore.GetSnapshot(),
      cursor = session.view.GetWrtShell().CaptureCursorState();
    const root = vi.spyOn(session.view.GetLayout(), "Invalidate");
    const bindings = vi.spyOn(session.frame.GetBindings(), "Invalidate");
    const signal = vi.spyOn(doc.GetDocumentStateManager(), "CallSwClientNotify");
    const publish = vi.fn(),
      unsubscribe = session.viewStore.Subscribe(publish);
    expect(format.GetNotifier().HasListeners()).toBe(true);
    expect(format.HasWriterListeners()).toBe(true);
    format.SetFormatAttr(new SwFormatVertOrient(720, 2, 7));
    rowFormat.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Fixed, 0, 720));
    style.SetFormatAttr(new SvxFontHeightItem(360, RES_CHRATR_FONTSIZE));
    const after = session.viewStore.GetSnapshot();
    expect(after).not.toBe(baseline);
    expect(session.viewStore.GetSnapshot()).toBe(after);
    expect(after.modelRevision).toBe(baseline.modelRevision);
    expect(after.viewVersion).toBeGreaterThan(baseline.viewVersion);
    expect(after.paragraphs[0]?.computedStyle.fontSizePt).toBe(18);
    expect(publish).toHaveBeenCalledTimes(3);
    expect(root).toHaveBeenCalledTimes(3);
    expect(bindings).toHaveBeenCalledWith("document", "selection");
    expect(signal).not.toHaveBeenCalled();
    expect(first.GetFrameFormat()).toBe(format);
    expect(row.GetFrameFormat()).toBe(rowFormat);
    expect(second.GetFrameFormat().GetVertOrient()).toEqual(new SwFormatVertOrient());
    expect(first.GetParagraphs()[0]).toBe(node);
    expect(node.GetText()).toBe("Original cell text");
    expect(session.view.GetWrtShell().CaptureCursorState()).toEqual(cursor);
    unsubscribe();
    format.ResetFormatAttr(109);
    expect(publish).toHaveBeenCalledTimes(3);
    session.viewStore.Close();
    expect(format.GetNotifier().HasListeners()).toBe(false);
    expect(rowFormat.GetNotifier().HasListeners()).toBe(false);
    expect(style.GetNotifier().HasListeners()).toBe(false);
    expect(format.HasWriterListeners()).toBe(true);
    const version = session.frame.GetBindings().GetVersion();
    format.SetFormatAttr(new SwFormatVertOrient(0, 3, 0));
    expect(session.frame.GetBindings().GetVersion()).toBe(version);
  } finally {
    vi.restoreAllMocks();
    session.Close();
  }
});

it("native format store follows actual inherited styles default reset and exact effective font items", /** Checks direct original parent deltas without document or text DTO writes. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc();
  try {
    const root = doc.GetDfltTextFormatColl(),
      parent = doc.MakeTextFormatColl("Native parent", root);
    const child = doc.MakeTextFormatColl("Native child", parent),
      node = required(doc.paragraphs[0]);
    node.ChgFormatColl(child);
    node.SetText("Original inherited text");
    const signal = vi.spyOn(doc.GetDocumentStateManager(), "CallSwClientNotify");
    const revision = doc.GetDocumentStateManager().GetModelRevision();
    parent.SetFormatAttr(new SvxFontHeightItem(440, RES_CHRATR_FONTSIZE));
    expect(session.viewStore.GetSnapshot().paragraphs[0]?.computedStyle.fontSizePt).toBe(22);
    child.SetFormatAttr(new SvxFontHeightItem(280, RES_CHRATR_FONTSIZE));
    parent.SetFormatAttr(new SvxFontHeightItem(480, RES_CHRATR_FONTSIZE));
    expect(session.viewStore.GetSnapshot().paragraphs[0]?.computedStyle.fontSizePt).toBe(14);
    child.ResetFormatAttr(RES_CHRATR_FONTSIZE);
    expect(session.viewStore.GetSnapshot().paragraphs[0]?.computedStyle.fontSizePt).toBe(24);
    parent.ResetFormatAttr(RES_CHRATR_FONTSIZE);
    expect(session.viewStore.GetSnapshot().paragraphs[0]?.computedStyle.fontSizePt).toBe(
      (root.GetAttrSet().Get(RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight() / 20,
    );
    expect(signal).not.toHaveBeenCalled();
    expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
    expect(node.GetTextFormatColl()).toBe(child);
    expect(node.GetText()).toBe("Original inherited text");
  } finally {
    vi.restoreAllMocks();
    session.Close();
  }
});

it("native format store rebinds original shared claims repeated history and native changes then releases deleted and replaced owners", /** Checks format lifetime independently of presentation subscriptions. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  try {
    const table = doc.nodes.MakeTableNode("Claims"),
      row = doc.nodes.AppendTableRow(table, 2);
    const first = required(row.GetTabBoxes()[0]),
      second = required(row.GetTabBoxes()[1]),
      shared = first.GetFrameFormat();
    second.ChgFrameFormat(shared);
    const node = required(first.GetParagraphs()[0]),
      position = new SwPosition(node, 0);
    shell.SetCursor(position);
    position.Dispose();
    doc.GetUndoManager().Clear();
    expect(doc.SetBoxAttr(shell.GetCursor(), new SwFormatVertOrient(0, 2, 0))).toBe(true);
    const claimed = first.GetFrameFormat();
    expect(claimed).not.toBe(shared);
    expect(claimed.GetNotifier().HasListeners()).toBe(true);
    expect(second.GetFrameFormat()).toBe(shared);
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(shell.Undo()).toBe(true);
      expect(shell.Redo()).toBe(true);
      expect(first.GetFrameFormat().GetNotifier().HasListeners()).toBe(true);
    }
    const replacement = doc.MakeTableBoxFormat(),
      old = first.GetFrameFormat();
    first.ChgFrameFormat(replacement);
    expect(old.IsDisposed()).toBe(true);
    expect(old.GetNotifier().HasListeners()).toBe(false);
    const cached = session.viewStore.GetSnapshot();
    replacement.SetFormatAttr(new SwFormatVertOrient(0, 3, 0));
    expect(session.viewStore.GetSnapshot()).not.toBe(cached);
    expect(replacement.GetNotifier().HasListeners()).toBe(true);
    doc.GetUndoManager().Clear();
    doc.nodes.MakeTextNode("Following native table paragraph");
    doc.nodes.DeleteTable(table.GetTableNode());
    expect(replacement.IsDisposed()).toBe(true);
    expect(shared.IsDisposed()).toBe(true);
    expect(replacement.GetNotifier().HasListeners()).toBe(false);
    const previousStyle = doc.GetDfltTextFormatColl();
    const newDoc = new SwDoc();
    session.docShell.ReplaceDocument(newDoc, session.docShell.GetDocumentState(), {
      kind: "untitled",
      name: "New",
    });
    expect(previousStyle.GetNotifier().HasListeners()).toBe(false);
    expect(newDoc.GetDfltTextFormatColl().GetNotifier().HasListeners()).toBe(true);
    const newSnapshot = session.viewStore.GetSnapshot();
    old.CallSwClientNotify({ kind: "cursor-selection-changed" });
    expect(session.viewStore.GetSnapshot()).toBe(newSnapshot);
  } finally {
    session.Close();
  }
});

it("native browser observer ignores intermediate moves while subscribing to exact original replacement owners and atomic batches", /** Checks hints supply original notifier identities before model re-registration. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc();
  const observer = new WriterNativeFormatObserver(session.view);
  try {
    const table = doc.nodes.MakeTableNode("Moves"),
      row = doc.nodes.AppendTableRow(table, 1),
      box = required(row.GetTabBoxes()[0]);
    observer.Sync();
    const replacementRow = doc.MakeTableLineFormat(),
      replacementBox = doc.MakeTableBoxFormat();
    const invalidate = vi.spyOn(session.frame.GetBindings(), "Invalidate");
    observer.Notify({
      kind: "model-transaction",
      hints: [
        new MoveTableBoxHint(replacementBox, box),
        new MoveTableLineHint(replacementRow, row),
        new TableBoxFormatChanged(replacementBox, box),
        new TableLineFormatChanged(replacementRow, row),
      ],
    });
    expect(replacementRow.GetNotifier().GetAllListeners()).toContain(observer);
    expect(replacementBox.GetNotifier().GetAllListeners()).toContain(observer);
    expect(invalidate).not.toHaveBeenCalled();
    observer.Notify({ kind: "cursor-selection-changed" });
    observer.Notify({ kind: "dying" });
    expect(invalidate).not.toHaveBeenCalled();
    observer.Notify({ kind: "format-inheritance-changed", formatId: "Moves" });
    expect(invalidate).toHaveBeenCalledOnce();
    observer.Sync();
    expect(replacementBox.GetNotifier().GetAllListeners()).not.toContain(observer);
    observer.Sync();
    observer.Close();
    observer.Close();
    expect(observer.HasBroadcaster()).toBe(false);
    replacementBox.DisposeModify();
    replacementRow.DisposeModify();
  } finally {
    observer.Close();
    vi.restoreAllMocks();
    session.Close();
  }
});
