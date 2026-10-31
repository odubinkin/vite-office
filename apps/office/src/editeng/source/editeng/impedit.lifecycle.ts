/** @fileoverview Original ImpEditEngine lifecycle, selection conversion and notification member groups. Unported state/constructor/undo/layout members are mandatory abstract dependencies: this is not an instantiable engine or a production fallback. */
import { DuplicateHandling, SfxListener } from "../../../svl/source/notify/lstner";
import type { SfxBroadcaster } from "../../../svl/source/notify/SfxBroadcaster";
import type { SfxHint } from "../../../svl/inc/hint";
import type { StyleSheetUser } from "../../../svl/inc/stylesheetuser";
import type { EditDoc } from "../../inc/editdoc";
import { ParaPortion, ScriptTypePosInfo } from "../../inc/ParagraphPortion";
import type { ParaPortionList } from "../../inc/ParagraphPortionList";
import type { InternalEditStatus } from "./editstt2";
import { EditPaM } from "../../inc/EditPaM";
import { EditSelection } from "../../inc/EditSelection";
import { EPaM, EE_PARA_MAX } from "../../inc/EPaM";
import { ESelection } from "../../inc/ESelection";
import {
  EDITUNDO_INSERT,
  EENotify,
  EENotifyType,
  EEHorizontalTextDirection,
  type ScalingParameters,
  type ScalingParametersConstReference,
} from "../../inc/editdata";
import { Rectangle, Size, type ReadonlySize } from "../../../tools/inc/gen";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { ContentNode } from "../../inc/ContentNode";
import type { EditEngine } from "./editeng.lifecycle";
import { SfxVoidItem } from "../../../svl/inc/voiditem";
import {
  EE_FEATURE_TAB,
  EE_FEATURE_FIELD,
  EE_CHAR_SCRIPT_HINT,
  EE_PARA_WRITINGDIR,
  EE_ITEMS_START,
  EE_ITEMS_END,
  EE_CHAR_END,
} from "../../inc/eeitem";
import type { EditCharAttribField } from "../../inc/editattr";
import { SvxFrameDirectionItem } from "../../inc/frmdiritem";
import { SvxFrameDirection } from "../../inc/frmdir";
import type { SvxScriptHintItem } from "../../inc/scripthintitem";
import type { TextRotation } from "../../inc/editobj";
import type { EditTextObject } from "./editobj";
import { CreateTextObject as CreateTextObjectBody } from "./impedit4.textobject";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import type { SfxPoolItem } from "../../../svl/source/items/poolitem";
import type { XBreakIterator } from "../../../offapi/com/sun/star/i18n/XBreakIterator";
import * as ScriptType from "../../../offapi/com/sun/star/i18n/ScriptType";
import {
  SvtScriptType,
  FromI18NToSvtScriptType,
  GetScriptTypeOfLanguage,
  GetI18NScriptTypeOfLanguage,
} from "../../../svl/inc/languageoptions";
import {
  MakeDirectionChangeScanner,
  MakeScriptChangeScanner,
  ScriptHintProvider,
} from "../../../i18nutil/inc/scriptchangescanner";
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
  protected abstract readonly maScalingParameters: ScalingParameters;
  protected abstract mnBigTextObjectStart: number;
  protected abstract mnColumns: number;
  protected abstract mnColumnSpacing: number;
  protected abstract meDefLanguage: number;
  protected abstract meDefaultHorizontalTextDirection: EEHorizontalTextDirection;
  protected abstract mpRefDev: object | null;
  protected abstract pEmptyItemSet: SfxItemSet | null;
  /** Original mandatory cached BreakIterator service getter; no alternative factory/provider. @returns Actual source service. */
  abstract ImplGetBreakIterator(): XBreakIterator;
  /** Original mandatory writing-direction initializer; actual ICU service state remains unported by this declaration. @param paragraph - Source index. @returns Nothing. */
  abstract InitWritingDirections(paragraph: number): void;
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
  /** Original raw default language. @returns Source language identity. */
  GetDefaultLanguage(): number {
    return this.meDefLanguage;
  }
  /** Original raw default horizontal direction. @returns Source selector. */
  GetDefaultHorizontalTextDirection(): EEHorizontalTextDirection {
    return this.meDefaultHorizontalTextDirection;
  }
  /** Original actual document orientation. @returns Vertical flag. */
  GetVertical(): boolean {
    return this.GetEditDoc().GetVertical();
  }
  /** Original actual document rotation. @returns Source rotation. */
  GetRotation(): TextRotation {
    return this.GetEditDoc().GetRotation();
  }
  /** Original effective orientation. @returns Source predicate. */
  IsEffectivelyVertical(): boolean {
    return this.GetEditDoc().IsEffectivelyVertical();
  }
  /** Original borrowed device identity; device operations are not supplied by this getter. @returns Actual source pointer. */
  GetRefDevice(): object | null {
    return this.mpRefDev;
  }
  /** Original borrowed paper-size value. @returns Actual const size view. */
  GetPaperSize(): ReadonlySize {
    return this.maPaperSize;
  }
  /** Original actual scaling reference. @returns Source aggregate. */
  getScalingParameters(): ScalingParametersConstReference {
    return this.maScalingParameters;
  }
  /** Original cache-size threshold. @returns Source threshold. */
  GetBigTextObjectStart(): number {
    return this.mnBigTextObjectStart;
  }
  /** Original column geometry with signed integral division, within the source columns>=1 and defined signed-arithmetic preconditions. @param paper - Actual source size. @returns Integral width. */
  GetColumnWidth(paper: ReadonlySize): number {
    const width = this.IsEffectivelyVertical() ? paper.Height() : paper.Width(),
      result = Math.trunc((width - this.mnColumnSpacing * (this.mnColumns - 1)) / this.mnColumns);
    return result === 0 ? 0 : result;
  }
  /** Original lazy fixed-range empty set retains actual pool defaults; feature ranges are not substituted. @returns Actual owned set. */
  GetEmptyItemSet(): SfxItemSet {
    if (!this.pEmptyItemSet) {
      this.pEmptyItemSet = new SfxItemSet(this.maEditDoc.GetItemPool(), [
        [EE_ITEMS_START, EE_ITEMS_END],
      ]);
      for (let which = EE_ITEMS_START; which <= EE_CHAR_END; which++)
        this.pEmptyItemSet.ClearItem(which);
    }
    return this.pEmptyItemSet;
  }
  /** Original hard/style/default paragraph lookup. @param paragraph - Source index. @param which - Source item ID. @returns Actual item. */
  GetParaAttrib(paragraph: number, which: number): SfxPoolItem {
    return (this.maEditDoc.GetObject(paragraph) as ContentNode).GetContentAttribs().GetItem(which);
  }
  /** Original paragraph direction precedence, including Environment fallback to the actual pool and vertical suppression. @param paragraph - Source index. @returns RTL flag. */
  IsRightToLeft(paragraph: number): boolean {
    let rtl = false,
      item: SvxFrameDirectionItem | null = null;
    if (!this.IsEffectivelyVertical()) {
      rtl = this.GetDefaultHorizontalTextDirection() === EEHorizontalTextDirection.R2L;
      item = this.GetParaAttrib(paragraph, EE_PARA_WRITINGDIR) as SvxFrameDirectionItem;
      if (item.GetValue() === SvxFrameDirection.Environment) {
        if (this.GetDefaultHorizontalTextDirection() !== EEHorizontalTextDirection.Default)
          item = null;
        else item = this.GetEmptyItemSet().Get(EE_PARA_WRITINGDIR) as SvxFrameDirectionItem;
      }
    }
    if (item) rtl = item.GetValue() === SvxFrameDirection.Horizontal_RL_TB;
    return rtl;
  }
  /** Original complete script initialization uses field display units, ordered script hints and the actual direction/script scanners. Service/direction admission remains mandatory. @param paragraph - Source index. @returns Nothing. */
  InitScriptTypes(paragraph: number): void {
    const portion = this.GetParaPortions().SafeGetObject(paragraph);
    if (!portion) return;
    const types = portion.getScriptTypePosInfos();
    types.length = 0;
    const node = portion.GetNode() as ContentNode;
    if (!node.Len()) return;
    const iterator = this.ImplGetBreakIterator();
    let value = new OUString(node.GetString());
    try {
      let field = node.GetCharAttribs().FindNextAttrib(EE_FEATURE_FIELD, 0);
      while (field) {
        const display = (field as EditCharAttribField).GetFieldValue();
        if (!display.isEmpty()) {
          let replaced = value.replaceAt(field.GetStart(), 1, display.subView(0, 1));
          value.dispose();
          value = replaced;
          let fieldScript = iterator.getScriptType(display.subView(0), 0);
          for (let index = 1; index < display.getLength(); index++) {
            const script = iterator.getScriptType(display.subView(0), index);
            if (fieldScript === ScriptType.WEAK) {
              fieldScript = script;
              replaced = value.replaceAt(field.GetStart(), 1, display.subView(index, 1));
              value.dispose();
              value = replaced;
            }
            if (script === ScriptType.ASIAN || script === ScriptType.COMPLEX) {
              replaced = value.replaceAt(field.GetStart(), 1, display.subView(index, 1));
              value.dispose();
              value = replaced;
              break;
            }
          }
        }
        field = field.GetEnd()
          ? node.GetCharAttribs().FindNextAttrib(EE_FEATURE_FIELD, field.GetEnd())
          : null;
      }
      const hints = new ScriptHintProvider();
      let hint = node.GetCharAttribs().FindNextAttrib(EE_CHAR_SCRIPT_HINT, 0);
      while (hint) {
        hints.AddHint(
          (hint.GetItem() as SvxScriptHintItem).GetValue(),
          hint.GetStart(),
          hint.GetEnd(),
        );
        hint = hint.GetEnd()
          ? node.GetCharAttribs().FindAttribRightOpen(EE_CHAR_SCRIPT_HINT, hint.GetEnd())
          : null;
      }
      const direction = MakeDirectionChangeScanner(value, this.IsRightToLeft(paragraph) ? 1 : 0),
        scanner = MakeScriptChangeScanner(
          value,
          GetI18NScriptTypeOfLanguage(this.GetDefaultLanguage()),
          direction,
          hints,
        );
      while (!scanner.AtEnd() || types.length === 0) {
        const change = scanner.Peek();
        types.push(
          new ScriptTypePosInfo(change.m_nScriptType, change.m_nStartIndex, change.m_nEndIndex),
        );
        scanner.Advance();
      }
      if (portion.getWritingDirectionInfos().length === 0) this.InitWritingDirections(paragraph);
    } finally {
      value.dispose();
    }
  }
  /** Original multiparagraph script query, retaining endpoint-only membership, bare-cursor bias and one final language fallback. @param selection - Actual source selection. @returns Source script mask. */
  GetItemScriptType(selection: EditSelection): SvtScriptType {
    const adjusted = new EditSelection(selection);
    adjusted.Adjust(this.maEditDoc);
    let script = SvtScriptType.NONE;
    const first = this.GetEditDoc().GetPos(adjusted.Min().GetNode()),
      last = this.GetEditDoc().GetPos(adjusted.Max().GetNode());
    for (let paragraph = first; paragraph <= last; paragraph++) {
      const portion = this.GetParaPortions().SafeGetObject(paragraph);
      if (!portion) continue;
      const types = portion.getScriptTypePosInfos();
      if (types.length === 0) this.InitScriptTypes(paragraph);
      let start = paragraph === first ? adjusted.Min().GetIndex() : 0,
        end =
          paragraph === last ? adjusted.Max().GetIndex() : (portion.GetNode() as ContentNode).Len();
      if (first === last && start === end) {
        if (start !== 0) --start;
        else ++end;
      }
      for (const type of types) {
        const startInRange = type.nStartPos <= start && start < type.nEndPos,
          endInRange = type.nStartPos < end && end <= type.nEndPos;
        if ((startInRange || endInRange) && type.nScriptType !== ScriptType.WEAK)
          script |= FromI18NToSvtScriptType(type.nScriptType);
      }
    }
    return script !== SvtScriptType.NONE
      ? script
      : GetScriptTypeOfLanguage(this.GetDefaultLanguage());
  }
  /** Original paragraph-range overload, within native asserted count/range preconditions. @param paragraph - Source start. @param count - Source count. @returns Owned object or original null. */
  CreateTextObject(paragraph: number, count: number): EditTextObject | null;
  /** Original whole-document, current-pool/status and private pool/flags overloads, unified only at the host declaration boundary. @param selection - Source by-value selection, or absent for the whole document. @param pool - Actual destination pool or null, or absent for current-pool/status dispatch. @param allowBig - Original default false. @param threshold - Original default zero. @returns Owned source object. */
  CreateTextObject(
    selection?: EditSelection,
    pool?: SfxItemPool | null,
    allowBig?: boolean,
    threshold?: number,
  ): EditTextObject;
  /** Original object creation copies actual paragraphs/attributes/styles/spelling and eligible formatted payloads with original narrowing/copy semantics. @param source - Original selected overload. @param destination - Original pool or paragraph count. @param allowBig - Original private-overload default false. @param threshold - Original private-overload default zero. @returns Actual source object or paragraph-range null. */
  CreateTextObject(
    source?: EditSelection | number,
    destination?: SfxItemPool | null | number,
    allowBig = false,
    threshold = 0,
  ): EditTextObject | null {
    if (source === undefined)
      return this.CreateTextObject(
        new EditSelection(this.maEditDoc.GetStartPaM(), this.maEditDoc.GetEndPaM()),
      );
    if (typeof source === "number") {
      const start = this.maEditDoc.GetObject(source),
        end = this.maEditDoc.GetObject(source + (destination as number) - 1);
      return start && end
        ? this.CreateTextObject(
            new EditSelection(new EditPaM(start, 0), new EditPaM(end, end.Len())),
          )
        : null;
    }
    if (destination === undefined)
      return this.CreateTextObject(
        source,
        this.maEditDoc.GetItemPool(),
        this.maStatus.AllowBigObjects(),
        this.mnBigTextObjectStart,
      );
    return CreateTextObjectBody(
      this,
      source,
      destination as SfxItemPool | null,
      allowBig,
      threshold,
    );
  }
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
