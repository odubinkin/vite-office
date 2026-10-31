/** @fileoverview Original ImpEditEngine lifecycle, selection conversion and notification member groups. Unported state/constructor/undo/layout members are mandatory abstract dependencies: this is not an instantiable engine or a production fallback. */
import { DuplicateHandling, SfxListener } from "../../../svl/source/notify/lstner";
import type { SfxBroadcaster } from "../../../svl/source/notify/SfxBroadcaster";
import type { SfxHint } from "../../../svl/inc/hint";
import type { StyleSheetUser } from "../../../svl/inc/stylesheetuser";
import type { EditDoc } from "../../inc/editdoc";
import { ParaPortion } from "../../inc/ParagraphPortion";
import type { ParaPortionList } from "../../inc/ParagraphPortionList";
import type { InternalEditStatus } from "./editstt2";
import { EditPaM } from "../../inc/EditPaM";
import { EditSelection } from "../../inc/EditSelection";
import { EPaM, EE_PARA_MAX } from "../../inc/EPaM";
import { ESelection } from "../../inc/ESelection";
import { EDITUNDO_INSERT, EENotify, EENotifyType } from "../../inc/editdata";
import { Rectangle, Size } from "../../../tools/inc/gen";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { ContentNode } from "../../inc/ContentNode";
import type { EditEngine } from "./editeng.lifecycle";
import { SfxVoidItem } from "../../../svl/inc/voiditem";
import { EE_FEATURE_TAB } from "../../inc/eeitem";
import { convertLineEnd, LINEEND_LF } from "../../../tools/inc/lineend";
import { DICTIONARY_WORD } from "../../../offapi/com/sun/star/i18n/WordType";
import { PrepareInsertTextLine } from "./impedit2.text";
import { LINE_SEP } from "./impedit.constants";
import { EditUndoInsertChars, EditUndoSplitPara } from "./editundo";
import type { EditUndo, OutlinerViewShell } from "./editund2";
import type { WrongList } from "../../inc/edtspell";

/** Consumed original ImpEditView declarations; the actual view/window implementation remains mandatory and unported. */
export interface ImpEditView {
  /** Original borrowed edit selection. @returns Actual view selection. */
  GetEditSelection(): EditSelection;
  /** Original actual view-shell pointer, without a fabricated shell. @returns Actual shell or null. */
  GetViewShell(): OutlinerViewShell | null;
  /** Original selection value assignment. @param selection - Source selection. @returns Nothing. */
  SetEditSelection(selection: EditSelection): void;
}
/** Consumed original EditView declarations, without any default window, region or selection provider. */
export interface EditView {
  /** Original actual implementation reference. @returns Actual view implementation. */
  getImpl(): ImpEditView;
  /** Original borrowed output rectangle. @returns Actual area. */
  GetOutputArea(): Rectangle;
  /** Original window invalidation call. @param area - Source invalid rectangle. @returns Nothing. */
  InvalidateWindow(area: Rectangle): void;
}
/** Original internal owner member groups. Concrete construction, application/device resources, full undo/layout and view implementations are not admitted by this abstract declaration. */
export abstract class ImpEditEngine extends SfxListener implements StyleSheetUser {
  protected abstract readonly maEditDoc: EditDoc;
  protected abstract readonly maParaPortionList: ParaPortionList;
  protected abstract readonly maStatus: InternalEditStatus;
  protected abstract readonly maEditViews: EditView[];
  protected abstract readonly mpEditEngine: EditEngine;
  protected abstract readonly maPaperSize: Size;
  protected abstract mbFuzzing: boolean;
  protected abstract mpActiveView: EditView | null;
  protected abstract mnCurTextHeight: number;
  protected abstract mbFormatted: boolean;
  protected abstract mbUndoEnabled: boolean;
  protected abstract mbIsInUndo: boolean;
  protected abstract mbUpdateLayout: boolean;
  protected abstract mbCallParaInsertedOrDeleted: boolean;
  protected abstract maModifyHdl: ((argument: null) => void) | null;
  protected abstract maNotifyHdl: ((notification: EENotify) => void) | null;
  /** Original unported style/application notification override, with no inherited substitute implementation. @param broadcaster - Actual source. @param hint - Actual hint. @returns Nothing. */
  abstract override Notify(broadcaster: SfxBroadcaster, hint: SfxHint): void;
  /** Original mandatory range-deletion dependency; no alternative deletion provider. @param selection - Source range. @returns Actual resulting position. */
  abstract ImpDeleteSelection(selection: EditSelection): EditPaM;
  /** Original mandatory word-boundary service consumer. @param selection - Source caret/range. @param wordType - Original WordType. @returns Actual selected word. */
  abstract SelectWord(selection: EditSelection, wordType: number): EditSelection;
  /** Original compound undo entry, mandatory until the real undo owner is bound. @param id - Source action identifier. @returns Nothing. */
  abstract UndoActionStart(id: number): void;
  /** Original compound undo exit. @returns Nothing. */
  abstract UndoActionEnd(): void;
  /** Original actual undo-action ownership transfer. @param action - Owned source action. @param tryMerge - Source default false. @returns Nothing. */
  abstract InsertUndo(action: EditUndo, tryMerge?: boolean): void;
  /** Original undo-manager reset, with no default manager/provider. @returns Nothing. */
  abstract ResetUndoManager(): void;
  /** Original paragraph-height calculation dependency. @param portion - Actual next portion. @returns Nothing. */
  abstract CalcHeight(portion: ParaPortion): void;
  /** Original borrowed active-view pointer. @returns Actual view or null. */
  GetActiveView(): EditView | null {
    return this.mpActiveView;
  }
  /** Original plain-text public insertion delegation. @param selection - Actual source selection. @param text - Borrowed input. @returns Actual resulting position. */
  InsertText(selection: EditSelection, text: OUStringConstReference): EditPaM {
    return this.ImpInsertText(selection, text);
  }
  /** Original complete text-insertion orchestration: source line normalization/capacity, tab features, paragraph splits, invalidation, undo and notifications. Unported deletion/word/undo dependencies remain mandatory. @param selection - Actual source selection. @param input - Borrowed original input. @returns Actual inserted end. */
  ImpInsertText(selection: EditSelection, input: OUStringConstReference): EditPaM {
    this.UndoActionStart(EDITUNDO_INSERT);
    let position = selection.HasRange()
      ? this.ImpDeleteSelection(selection)
      : new EditPaM(selection.Max());
    const original = new EditPaM(position);
    let word = new EditSelection();
    if (this.GetStatus().DoOnlineSpelling())
      word = this.SelectWord(new EditSelection(original), DICTIONARY_WORD);
    let value = convertLineEnd(input, LINEEND_LF);
    try {
      if (this.mbFuzzing) {
        const replaced = value.replaceAll(new Uint16Array([9]), new Uint16Array([45]));
        value.dispose();
        value = replaced;
      }
      const tab = new SfxVoidItem(EE_FEATURE_TAB);
      let start = 0;
      while (start < value.getLength()) {
        const end: [number] = [!this.maStatus.IsSingleLine() ? value.indexOf(LINE_SEP, start) : -1];
        if (end[0] === -1) end[0] = value.getLength();
        if (end[0] > start) {
          const line = PrepareInsertTextLine(value, start, end, position);
          try {
            if (this.IsUndoEnabled() && !this.IsInUndo())
              this.InsertUndo(
                new EditUndoInsertChars(this.mpEditEngine, this.CreateEPaM(position), line),
              );
            if (line.indexOf(9) === -1) position = this.maEditDoc.InsertText(position, line);
            else {
              let fragmentStart = 0;
              while (fragmentStart < line.getLength()) {
                let fragmentEnd = line.indexOf(9, fragmentStart);
                if (fragmentEnd === -1) fragmentEnd = line.getLength();
                if (fragmentEnd > fragmentStart) {
                  const fragment = line.copy(fragmentStart, fragmentEnd - fragmentStart);
                  try {
                    position = this.maEditDoc.InsertText(position, fragment);
                  } finally {
                    fragment.dispose();
                  }
                }
                if (fragmentEnd < line.getLength())
                  position = this.maEditDoc.InsertFeature(position, tab);
                fragmentStart = fragmentEnd + 1;
              }
            }
            const portion = this.FindParaPortion(position.GetNode()) as ParaPortion;
            if (this.GetStatus().DoOnlineSpelling()) {
              const wrongs = (original.GetNode() as ContentNode).GetWrongList();
              if (wrongs && !wrongs.empty())
                wrongs.ClearWrongs(
                  BigInt(word.Min().GetIndex()),
                  BigInt(position.GetIndex()),
                  position.GetNode() as ContentNode,
                );
              portion.MarkInvalid(word.Min().GetIndex(), line.getLength());
            } else portion.MarkInvalid(original.GetIndex(), line.getLength());
          } finally {
            line.dispose();
          }
        }
        if (end[0] < value.getLength()) position = this.ImpInsertParaBreak(position);
        start = end[0] + 1;
      }
    } finally {
      value.dispose();
    }
    this.UndoActionEnd();
    const inserted = new ESelection(this.CreateEPaM(original));
    inserted.end = this.CreateEPaM(position);
    this.UpdateSelectionsInsert(inserted);
    this.TextModified();
    return position;
  }
  /** Original selection-only overload uses the source default ending-attribute policy. @param selection - Actual source selection. @returns Actual split result. */
  ImpInsertParaBreak(selection: EditSelection): EditPaM;
  /** Original caret overload exposes the source ending-attribute flag. @param position - Actual source caret. @param keepEnding - Original default true. @returns Actual split result. */
  ImpInsertParaBreak(position: EditPaM, keepEnding?: boolean): EditPaM;
  /** Original selection overload and actual paragraph split, including source style listeners, misspell transfer, portion ownership, callback and view update order. @param source - Actual caret or selection. @param keepEnding - Original default true. @returns Actual right-paragraph start, or original caret at the source limit. */
  ImpInsertParaBreak(source: EditPaM | EditSelection, keepEnding = true): EditPaM {
    if (source instanceof EditSelection) {
      const position = source.HasRange()
        ? this.ImpDeleteSelection(source)
        : new EditPaM(source.Max());
      return this.ImpInsertParaBreak(position);
    }
    if (this.maEditDoc.Count() >= EE_PARA_MAX) return source;
    if (this.IsUndoEnabled() && !this.IsInUndo())
      this.InsertUndo(
        new EditUndoSplitPara(
          this.mpEditEngine,
          this.maEditDoc.GetPos(source.GetNode()),
          source.GetIndex(),
        ),
      );
    const position = this.maEditDoc.InsertParaBreak(source, keepEnding);
    const node = position.GetNode() as ContentNode,
      style = node.GetStyleSheet();
    if (style) this.StartListening(style, DuplicateHandling.Allow);
    if (this.GetStatus().DoOnlineSpelling()) {
      const end = (source.GetNode() as ContentNode).Len();
      node.CreateWrongList();
      const left = (source.GetNode() as ContentNode).GetWrongList() as WrongList,
        right = node.GetWrongList() as WrongList;
      for (const range of left) {
        if (range.mnStart > BigInt(end)) {
          right.push_back(range);
          const copied = right.back();
          copied.mnStart = BigInt.asUintN(64, copied.mnStart - BigInt(end));
          copied.mnEnd = BigInt.asUintN(64, copied.mnEnd - BigInt(end));
        } else if (range.mnStart < BigInt(end) && range.mnEnd > BigInt(end))
          range.mnEnd = BigInt(end);
      }
      const invalid = end ? end - 1 : end;
      if (end) left.SetInvalidRange(BigInt(invalid), BigInt(end));
      else left.SetValid();
      right.SetValid();
      right.SetInvalidRange(0n, 1n);
    }
    const portion = this.FindParaPortion(source.GetNode()) as ParaPortion;
    portion.MarkInvalid(source.GetIndex(), 0);
    const index = this.GetParaPortions().GetPos(portion),
      newPortion = new ParaPortion(node);
    this.GetParaPortions().Insert(index + 1, newPortion);
    this.ParaAttribsChanged(node);
    if (this.IsCallParaInsertedOrDeleted()) this.GetEditEnginePtr().ParagraphInserted(index + 1);
    source.GetNode()?.checkAndDeleteEmptyAttribs();
    const inserted = new ESelection(this.CreateEPaM(source));
    inserted.end = this.CreateEPaM(position);
    this.UpdateSelectionsInsert(inserted);
    this.TextModified();
    return position;
  }
  /** Original StyleSheetUser override. @returns True. */
  isUsedByModel(): boolean {
    return true;
  }
  /** Original actual document reference. @returns Owned document. */
  GetEditDoc(): EditDoc {
    return this.maEditDoc;
  }
  /** Original actual paragraph-portions reference. @returns Owned list. */
  GetParaPortions(): ParaPortionList {
    return this.maParaPortionList;
  }
  /** Original actual status reference. @returns Actual status. */
  GetStatus(): InternalEditStatus {
    return this.maStatus;
  }
  /** Original outer engine pointer. @returns Actual outer owner. */
  GetEditEnginePtr(): EditEngine {
    return this.mpEditEngine;
  }
  /** Original undo-enable query. @returns Flag. */
  IsUndoEnabled(): boolean {
    return this.mbUndoEnabled;
  }
  /** Original undo execution query. @returns Flag. */
  IsInUndo(): boolean {
    return this.mbIsInUndo;
  }
  /** Original undo execution flag assignment. @param value - Source flag. @returns Nothing. */
  SetUndoMode(value: boolean): void {
    this.mbIsInUndo = value;
  }
  /** Original undo-enable assignment clears history only on a mode transition. @param enabled - Source flag. @returns Nothing. */
  EnableUndo(enabled: boolean): void {
    if (enabled !== this.IsUndoEnabled()) this.ResetUndoManager();
    this.mbUndoEnabled = enabled;
  }
  /** Original layout-enable query. @returns Flag. */
  IsUpdateLayout(): boolean {
    return this.mbUpdateLayout;
  }
  /** Original formatted-state query. @returns Flag. */
  IsFormatted(): boolean {
    return this.mbFormatted;
  }
  /** Original paragraph callback enable flag. @param value - Source flag. @returns Nothing. */
  SetCallParaInsertedOrDeleted(value: boolean): void {
    this.mbCallParaInsertedOrDeleted = value;
  }
  /** Original paragraph callback query. @returns Flag. */
  IsCallParaInsertedOrDeleted(): boolean {
    return this.mbCallParaInsertedOrDeleted;
  }
  /** Original optional Link assignment, bound to its actual JavaScript callable. @param handler - Actual callable or empty Link. @returns Nothing. */
  SetModifyHdl(handler: ((argument: null) => void) | null): void {
    this.maModifyHdl = handler;
  }
  /** Original optional notification Link assignment. @param handler - Actual callable or empty Link. @returns Nothing. */
  SetNotifyHdl(handler: ((notification: EENotify) => void) | null): void {
    this.maNotifyHdl = handler;
  }
  /** Original borrowed notification Link callable. @returns Actual callback or absence. */
  GetNotifyHdl(): ((notification: EENotify) => void) | null {
    return this.maNotifyHdl;
  }
  /** Original DocModified Link target passes null, also for Outliner. @returns Nothing. */
  DocModified(): void {
    this.maModifyHdl?.(null);
  }
  /** Original node-to-portion lookup, without an alternate index store. @param node - Actual source pointer. @returns Actual portion or source null. */
  FindParaPortion(node: ContentNode | null): ParaPortion | null {
    return this.maParaPortionList.SafeGetObject(this.maEditDoc.GetPos(node));
  }
  /** Original node position to public value conversion. @param position - Source nonowning value. @returns Independent paragraph/index value. */
  CreateEPaM(position: EditPaM): EPaM {
    return new EPaM(this.maEditDoc.GetPos(position.GetNode()), position.GetIndex());
  }
  /** Original public value to actual node value, within source asserted index preconditions. @param position - Source public value. @returns Nonowning node/index value. */
  CreateEditPaM(position: EPaM): EditPaM {
    return new EditPaM(this.maEditDoc.GetObject(position.nPara), position.nIndex);
  }
  /** Original complete public selection value conversion. @param selection - Source selection. @returns Independent value. */
  CreateESel(selection: EditSelection): ESelection {
    const result = new ESelection();
    result.start = this.CreateEPaM(selection.Min());
    result.end = this.CreateEPaM(selection.Max());
    return result;
  }
  /** Original direct selection conversion without normalization. @param selection - Source public endpoints satisfying original preconditions. @returns Actual selection value. */
  CreateSel(selection: ESelection): EditSelection {
    return new EditSelection(
      this.CreateEditPaM(selection.start),
      this.CreateEditPaM(selection.end),
    );
  }
  /** Original normalized conversion delegates the original missing-paragraph/upper-bound behavior. @param selection - Source public selection. @returns Actual selection. */
  CreateNormalizedSel(selection: ESelection): EditSelection {
    return this.ConvertSelection(
      selection.start.nPara,
      selection.start.nIndex,
      selection.end.nPara,
      selection.end.nIndex,
    );
  }
  /** Original missing paragraphs select document end; only oversized existing-node indexes are clamped. Endpoint order and negative indexes are not corrected. @param startPara - Original start paragraph. @param start - Original raw start. @param endPara - Original end paragraph. @param end - Original raw end. @returns Actual converted selection. */
  ConvertSelection(startPara: number, start: number, endPara: number, end: number): EditSelection {
    const result = new EditSelection();
    let node = this.maEditDoc.GetObject(startPara),
      index = start;
    if (!node) {
      node = this.maEditDoc.GetObject(this.maEditDoc.Count() - 1) as ContentNode;
      index = node.Len();
    } else if (index > node.Len()) index = node.Len();
    result.Min().SetNode(node);
    result.Min().SetIndex(index);
    node = this.maEditDoc.GetObject(endPara);
    index = end;
    if (!node) {
      node = this.maEditDoc.GetObject(this.maEditDoc.Count() - 1) as ContentNode;
      index = node.Len();
    } else if (index > node.Len()) index = node.Len();
    result.Max().SetNode(node);
    result.Max().SetIndex(index);
    return result;
  }
  /** Original document reset order, real listener release and fresh paragraph-portion/spelling state. @param keep - Preserve first paragraph formatting. @returns Nothing. */
  InitDoc(keep: boolean): void {
    const count = this.maEditDoc.Count();
    for (let index = keep ? 1 : 0; index < count; index++) {
      const style = (this.maEditDoc.GetObject(index) as ContentNode).GetStyleSheet();
      if (style) this.EndListening(style);
    }
    if (keep) this.maEditDoc.RemoveText();
    else this.maEditDoc.Clear();
    this.maParaPortionList.Reset();
    this.maParaPortionList.Insert(0, new ParaPortion(this.maEditDoc.GetObject(0)));
    this.mbFormatted = false;
    if (this.IsCallParaInsertedOrDeleted()) {
      this.mpEditEngine.ParagraphDeleted(EE_PARA_MAX);
      this.mpEditEngine.ParagraphInserted(0);
    }
    if (this.maStatus.DoOnlineSpelling())
      (this.maEditDoc.GetObject(0) as ContentNode).CreateWrongList();
  }
  /** Original text removal preserves paragraph formatting, resets every view selection, then clears undo. @returns Source document start. */
  RemoveText(): EditPaM {
    this.InitDoc(true);
    const start = this.maEditDoc.GetStartPaM(),
      empty = new EditSelection(start, start);
    for (const view of this.maEditViews) view.getImpl().SetEditSelection(empty);
    this.ResetUndoManager();
    return this.maEditDoc.GetStartPaM();
  }
  /** Original SetText orchestration, including source undo restoration only on normal return and old-height invalidation before empty-text height reset. @param text - Original text. @returns Nothing. */
  SetText(text: OUStringConstReference): void {
    const start = this.RemoveText(),
      undoEnabled = this.IsUndoEnabled();
    this.EnableUndo(false);
    const empty = new EditSelection(start, start);
    let position = new EditPaM(start);
    if (!text.isEmpty()) position = this.ImpInsertText(empty, text);
    for (const view of this.maEditViews) {
      view.getImpl().SetEditSelection(new EditSelection(position, position));
      if (text.isEmpty() && this.IsUpdateLayout()) {
        const invalid = new Rectangle(
          view.GetOutputArea().TopLeft(),
          new Size(this.maPaperSize.Width(), this.mnCurTextHeight),
        );
        invalid.Intersection(view.GetOutputArea());
        view.InvalidateWindow(invalid);
      }
    }
    if (text.isEmpty()) this.mnCurTextHeight = 0;
    this.EnableUndo(undoEnabled);
  }
  /** Original formatted-state invalidation and optional fresh notification; document modification itself is a separate source path. @returns Nothing. */
  TextModified(): void {
    this.mbFormatted = false;
    if (this.maNotifyHdl) this.maNotifyHdl(new EENotify(EENotifyType.EE_NOTIFY_TEXTMODIFIED));
  }
  /** Original paragraph change order and conditional following-paragraph height recalculation. @param node - Actual paragraph. @param ignoreUndo - Source callback selection. @returns Nothing. */
  ParaAttribsChanged(node: ContentNode, ignoreUndo = false): void {
    this.maEditDoc.SetModified(true);
    this.mbFormatted = false;
    (this.FindParaPortion(node) as ParaPortion).MarkSelectionInvalid(0);
    const paragraph = this.maEditDoc.GetPos(node);
    if (ignoreUndo || this.mpEditEngine.IsInUndo()) this.mpEditEngine.ParaAttribsChanged(paragraph);
    const next = this.maParaPortionList.SafeGetObject(paragraph + 1);
    if (next && !next.IsInvalid()) this.CalcHeight(next);
  }
  /** Original post-insertion view update: first compensate already shifted node numbers, then update both endpoints eagerly. @param inserted - Original adjusted inserted range. @returns Nothing. */
  UpdateSelectionsInsert(inserted: ESelection): void {
    for (const view of this.maEditViews) {
      const selection = new EditSelection(view.getImpl().GetEditSelection()),
        external = this.CreateESel(selection);
      if (inserted.start.nPara < external.start.nPara)
        external.start.nPara -= inserted.end.nPara - inserted.start.nPara;
      if (inserted.start.nPara < external.end.nPara)
        external.end.nPara -= inserted.end.nPara - inserted.start.nPara;
      const startChanged = UpdatePosInsert(external.start, inserted),
        endChanged = UpdatePosInsert(external.end, inserted);
      if (startChanged || endChanged) view.getImpl().SetEditSelection(this.CreateSel(external));
    }
  }
  /** Original regular-view deletion update is disabled by upstream #if0/FIXME. This group represents the non-YRS branch and does not invent cursor repair. @param deleted - Source deleted range. @returns Nothing. */
  UpdateSelectionsDelete(deleted: ESelection): void {
    const adjusted = new ESelection(deleted);
    adjusted.Adjust();
    for (const view of this.maEditViews) {
      void view;
      void adjusted;
    }
  }
}
/** Original static UpdatePosInsert helper, within its asserted adjusted-range precondition. @param position - Mutable public position. @param inserted - Original inserted range. @returns Original changed predicate. */
export function UpdatePosInsert(position: EPaM, inserted: ESelection): boolean {
  if (inserted.start.nPara === position.nPara) {
    if (inserted.start.nIndex <= position.nIndex) {
      position.nPara = inserted.end.nPara;
      position.nIndex = inserted.end.nIndex + position.nIndex - inserted.start.nIndex;
      return true;
    }
  } else if (inserted.start.nPara < position.nPara && inserted.start.nPara !== inserted.end.nPara) {
    position.nPara += inserted.end.nPara - inserted.start.nPara;
    return true;
  }
  return false;
}
