/** @fileoverview Explicit shared test fixture for actual EditEngine member groups. Constructor/service/deletion/undo/view/layout dependencies are prepared test values, not production implementations. */
import { expect } from "vitest";
import {
  ImpEditEngine,
  type EditView,
  type ImpEditView,
} from "../editeng/source/editeng/impedit.lifecycle";
import { EditEngine } from "../editeng/source/editeng/editeng.lifecycle";
import { EditDoc } from "../editeng/inc/editdoc";
import { ParaPortion } from "../editeng/inc/ParagraphPortion";
import { ParaPortionList } from "../editeng/inc/ParagraphPortionList";
import { InternalEditStatus } from "../editeng/source/editeng/editstt2";
import { EEControlBits as Control } from "../editeng/inc/editstat";
import { EditPaM } from "../editeng/inc/EditPaM";
import { EditSelection } from "../editeng/inc/EditSelection";

import { ESelection } from "../editeng/inc/ESelection";
import { EENotify } from "../editeng/inc/editdata";
import type { ContentNode } from "../editeng/inc/ContentNode";
import type { OUString, OUStringConstReference } from "../sal/inc/rtl/ustring";
import { Rectangle, Size } from "../tools/inc/gen";
import type { SfxBroadcaster } from "../svl/source/notify/SfxBroadcaster";
import type { SfxHint } from "../svl/inc/hint";

import { EditUndo, type OutlinerViewShell } from "../editeng/source/editeng/editund2";

import { DICTIONARY_WORD } from "../offapi/com/sun/star/i18n/WordType";
import { ScalingParameters, EEHorizontalTextDirection } from "../editeng/inc/editdata";
import type { SfxItemSet } from "../svl/source/items/itemset";
import { LANGUAGE_DONTKNOW } from "../i18nlangtag/inc/lang";
import { BreakIteratorImpl } from "../i18npool/source/breakiterator/breakiteratorImpl";
import type { XBreakIteratorService } from "../offapi/com/sun/star/i18n/XBreakIterator";
import { unicode, text } from "../i18nlangtag/source/isolang/isolang.tables";

/** Prepared native view dependency records calls and copies real selection/rectangle values; it is not a shipped window implementation. */
export class PreparedView implements EditView, ImpEditView {
  readonly selection = new EditSelection();
  readonly changes: EditSelection[] = [];
  readonly invalidations: Rectangle[] = [];
  readonly area = new Rectangle(10, 20, 59, 99);
  shell: OutlinerViewShell | null = null;
  /** Original prepared actual view implementation identity. @returns This fixture. */
  getImpl(): ImpEditView {
    return this;
  }
  /** Prepared source shell pointer for the no-shell fixture. @returns Null. */
  GetViewShell(): OutlinerViewShell | null {
    return this.shell;
  }
  /** Borrows the prepared native selection value. @returns Actual selection. */
  GetEditSelection(): EditSelection {
    return this.selection;
  }
  /** Copies the prepared original selection dependency and records the source caller. @param selection - Source value. @returns Nothing. */
  SetEditSelection(selection: EditSelection): void {
    this.selection.assign(selection);
    this.changes.push(new EditSelection(selection));
  }
  /** Borrows explicitly prepared output geometry. @returns Actual rectangle. */
  GetOutputArea(): Rectangle {
    return this.area;
  }
  /** Records the source window request, without supplying a renderer. @param area - Actual invalid rectangle. @returns Nothing. */
  InvalidateWindow(area: Rectangle): void {
    this.invalidations.push(new Rectangle(area));
  }
}
/** Prepared outer pointer binds the actual implemented source notification methods. */
export class PreparedOuter extends EditEngine {
  readonly implementation = new PreparedEngine(this);
  readonly paragraphChanges: number[] = [];
  /** Returns actual fixture owner state. @returns Prepared internal owner. */
  getImpl(): PreparedEngine {
    return this.implementation;
  }
  /** Explicit prepared native label dependency for action tests. @param id - Source identifier. @returns Owned label. */
  override GetUndoComment(id: number): OUString {
    return unicode(`Prepared ${id}`);
  }
  /** Prepared underlying connection dependency, with actual document/portion values. @param left - Left index. @param backward - Expected source flag. @returns Actual joined position. */
  ConnectContents(left: number, backward: boolean): EditPaM {
    expect(backward).toBe(false);
    const doc = this.implementation.GetEditDoc(),
      portions = this.implementation.GetParaPortions(),
      result = doc.ConnectParagraphs(
        doc.GetObject(left) as ContentNode,
        doc.GetObject(left + 1) as ContentNode,
      );
    portions.Remove(left + 1);
    return result;
  }
  /** Prepared underlying splitting dependency invokes the actual implemented split body. @param paragraph - Actual index. @param position - Source split index. @returns Actual split result. */
  SplitContent(paragraph: number, position: number): EditPaM {
    return this.implementation.ImpInsertParaBreak(
      new EditPaM(this.implementation.GetEditDoc().GetObject(paragraph), position),
    );
  }
  /** Observes the source virtual callback dispatch. @param paragraph - Actual source index. @returns Nothing. */
  override ParaAttribsChanged(paragraph: number): void {
    this.paragraphChanges.push(paragraph);
  }
}
/** Explicit source-state fixture. Abstract parser/undo/height/style-notification dependencies remain prepared and are not implemented by a production fallback. */
export class PreparedEngine extends ImpEditEngine {
  protected readonly maEditDoc = new EditDoc();
  protected readonly maParaPortionList = new ParaPortionList();
  protected readonly maStatus = new InternalEditStatus();
  readonly maEditViews: PreparedView[] = [];
  protected readonly mpEditEngine: PreparedOuter;
  readonly maPaperSize = new Size(0x7fffffff, 0x7fffffff);
  readonly maScalingParameters = new ScalingParameters();
  mnBigTextObjectStart = 20;
  mnColumns = 1;
  mnColumnSpacing = 0;
  meDefLanguage = LANGUAGE_DONTKNOW;
  meDefaultHorizontalTextDirection = EEHorizontalTextDirection.Default;
  mpRefDev: object | null = null;
  pEmptyItemSet: SfxItemSet | null = null;
  readonly writingRequests: number[] = [];
  readonly breakIterator = new BreakIteratorImpl();
  protected mbFuzzing = false;
  mpActiveView: EditView | null = null;
  useActualInsertion = false;
  readonly actions: EditUndo[] = [];
  readonly undoEvents: number[] = [];
  readonly deleted: EditSelection[] = [];
  wordSelection: EditSelection | null = null;
  mnCurTextHeight = 0;
  mbFormatted = false;
  protected mbUndoEnabled = true;
  protected mbIsInUndo = false;
  mbUpdateLayout = true;
  protected mbCallParaInsertedOrDeleted = false;
  protected maModifyHdl: ((argument: null) => void) | null = null;
  protected maNotifyHdl: ((notification: EENotify) => void) | null = null;
  resets = 0;
  readonly inserted: { text: string; undo: boolean; selection: EditSelection }[] = [];
  readonly heights: ParaPortion[] = [];
  readonly hints: SfxHint[] = [];
  failure: Error | null = null;
  /** Prepares exact consumed source state; deliberately does not model unported devices/application/constructor/timers. @param outer - Prepared actual source outer pointer. @returns Prepared owner. */
  constructor(outer: PreparedOuter) {
    super();
    this.mpEditEngine = outer;
    this.maStatus.GetControlWord()[0] =
      Control.USECHARATTRIBS |
      Control.DOIDLEFORMAT |
      Control.PASTESPECIAL |
      Control.UNDOATTRIBS |
      Control.ALLOWBIGOBJS |
      Control.RTFSTYLESHEETS;
    this.InitDoc(false);
    this.SetCallParaInsertedOrDeleted(true);
    this.maEditDoc.SetModifyHdl(
      /** Binds the original prepared DocModified target. @param argument - Original null. @returns Nothing. */ (
        argument,
      ) => {
        expect(argument).toBeNull();
        this.DocModified();
      },
    );
  }
  /** Supplies the actual source script-query implementation as an explicit test dependency, without a service factory. @returns Real script service. */
  override ImplGetBreakIterator(): XBreakIteratorService {
    return this.breakIterator;
  }
  /** Observes the actual original writing-direction initializer without replacing its output. @param paragraph - Actual source request. @returns Nothing. */
  override InitWritingDirections(paragraph: number): void {
    this.writingRequests.push(paragraph);
    super.InitWritingDirections(paragraph);
  }
  /** Explicit prepared observer dependency; no style notification behavior is claimed. @param broadcaster - Actual registered source. @param hint - Actual source hint. @returns Nothing. */
  override Notify(broadcaster: SfxBroadcaster, hint: SfxHint): void {
    expect(this.IsListening(broadcaster)).toBe(true);
    this.hints.push(hint);
  }
  /** Explicit prepared single-paragraph deletion dependency; no production deletion implementation is supplied. @param selection - Source range. @returns Actual range start after raw deletion. */
  ImpDeleteSelection(selection: EditSelection): EditPaM {
    this.deleted.push(new EditSelection(selection));
    expect(selection.Min().GetNode()).toBe(selection.Max().GetNode());
    this.maEditDoc.RemoveChars(
      selection.Min(),
      selection.Max().GetIndex() - selection.Min().GetIndex(),
    );
    return new EditPaM(selection.Min());
  }
  /** Explicit prepared word-boundary result, with no inferred/heuristic boundary. @param selection - Source caret. @param wordType - Actual WordType. @returns Prepared actual selection. */
  override SelectWord(selection: EditSelection, wordType: number): EditSelection {
    expect(wordType).toBe(DICTIONARY_WORD);
    expect(selection.HasRange()).toBe(false);
    if (!this.wordSelection) throw new Error("Prepare the source word boundary dependency.");
    return new EditSelection(this.wordSelection);
  }
  /** Records original compound undo entry; no manager behavior is fabricated. @param id - Actual source identifier. @returns Nothing. */
  override UndoActionStart(id: number): void {
    this.undoEvents.push(id);
  }
  /** Records original compound undo exit. @returns Nothing. */
  override UndoActionEnd(): void {
    this.undoEvents.push(-1);
  }
  /** Records ownership of actual concrete source actions. @param action - Actual source action. @param merge - Original omitted/default flag. @returns Nothing. */
  override InsertUndo(action: EditUndo, merge = false): void {
    expect(merge).toBe(false);
    this.actions.push(action);
  }
  /** Explicit fuzzing-state preparation. @param value - Source flag. @returns Nothing. */
  setFuzzing(value: boolean): void {
    this.mbFuzzing = value;
  }
  /** Prepared history-reset dependency records the source call; full undo execution is outside this fixture. @returns Nothing. */
  override ResetUndoManager(): void {
    this.resets++;
  }
  /** Prepared measurement dependency only observes the requested actual next paragraph; no height is fabricated. @param portion - Actual next paragraph. @returns Nothing. */
  override CalcHeight(portion: ParaPortion): void {
    this.heights.push(portion);
  }
  /** Prepared single-plain-line callee for lifecycle tests only; uses real document insertion/selection-update/notification bodies. This is not a production parser or multiline implementation. @param selection - Source collapsed selection. @param value - Explicit plain fixture text. @returns Actual inserted end. */
  override ImpInsertText(selection: EditSelection, value: OUStringConstReference): EditPaM {
    if (this.useActualInsertion) return super.ImpInsertText(selection, value);
    this.inserted.push({
      text: text(value),
      undo: this.IsUndoEnabled(),
      selection: new EditSelection(selection),
    });
    if (this.failure) throw this.failure;
    const before = new EditPaM(selection.Max()),
      result = this.maEditDoc.InsertText(before, value),
      inserted = new ESelection(this.CreateEPaM(before));
    inserted.end = this.CreateEPaM(result);
    this.UpdateSelectionsInsert(inserted);
    this.TextModified();
    return result;
  }
  /** Prepares source document/portion state before the member under test, without simulating the enclosing parser. @param value - Single raw paragraph text. @returns Actual paragraph node. */
  appendParagraph(value: string): ContentNode {
    const start = this.maEditDoc.InsertParaBreak(this.maEditDoc.GetEndPaM(), true),
      string = unicode(value);
    try {
      this.maEditDoc.InsertText(start, string);
    } finally {
      string.dispose();
    }
    const node = start.GetNode() as ContentNode;
    this.maParaPortionList.Append(new ParaPortion(node));
    return node;
  }
  /** Explicit fixture cleanup of real owned state and registrations. @returns Nothing. */
  dispose(): void {
    this.mxBI.dispose();
    for (const action of this.actions) action.Dispose();
    this.pEmptyItemSet?.Dispose();
    this.pEmptyItemSet = null;
    this.EndListeningAll();
    this.maParaPortionList.Reset();
    this.maEditDoc.dispose();
  }
}

/** Reads actual expanded source paragraph values, without a parallel input parser. @param engine - Actual prepared owner. @returns Expanded paragraphs. */
export function paragraphs(engine: PreparedEngine): string[] {
  const result: string[] = [],
    doc = engine.GetEditDoc();
  for (let index = 0; index < doc.Count(); index++) {
    const value = doc.GetParaAsString(index);
    try {
      result.push(text(value));
    } finally {
      value.dispose();
    }
  }
  return result;
}
