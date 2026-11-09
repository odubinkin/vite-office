/** @fileoverview Original EditEngine notification member bodies, with mandatory actual implementation access and no concrete constructor admission. */
import type { ImpEditEngine } from "./impedit.lifecycle";
import * as EditData from "../../inc/editdata";
import { EENotify, EENotifyType } from "../../inc/editdata";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { CreatePool } from "./editeng";
import type { EditPaM } from "../../inc/EditPaM";
import { ESelection } from "../../inc/ESelection";
import type { EditTextObject } from "./editobj";
import type { EditSelection } from "../../inc/EditSelection";
import type { EPaM } from "../../inc/EPaM";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { EditView } from "./impedit.lifecycle";
import type { EEControlBits } from "../../inc/editstat";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
/** Source outer-owner member group; original concrete constructor/layout/other APIs remain mandatory before production instantiation. */
export abstract class EditEngine {
  /** Original static factory shares the existing single source implementation with ESM namespace callers. @returns Actual EditEngine item pool. */
  static CreatePool(): SfxItemPool {
    return CreatePool();
  }
  /** Original actual internal owner access. @returns Actual implementation. */
  abstract getImpl(): ImpEditEngine;
  /** Original actual active-view delegation. @returns Actual pointer or null. */
  GetActiveView(): EditView | null {
    return this.getImpl().GetActiveView();
  }
  /** Original source position conversion delegation. @param position - Source public position. @returns Actual node/index. */
  CreateEditPaM(position: EPaM): EditPaM {
    return this.getImpl().CreateEditPaM(position);
  }
  /** Original actual text-insertion delegation. @param selection - Actual source selection. @param text - Borrowed text. @returns Actual resulting position. */
  InsertText(selection: EditSelection, text: OUStringConstReference): EditPaM {
    return this.getImpl().InsertText(selection, text);
  }
  /** Original actual deletion delegation; its implementation remains mandatory. @param selection - Source range. @returns Actual resulting position. */
  DeleteSelection(selection: EditSelection): EditPaM {
    return this.getImpl().ImpDeleteSelection(selection);
  }
  /** Original undo-comment dispatch over the bundled source English EditResId values. @param id - Source undo ID. @returns Owned source string. */
  GetUndoComment(id: number): OUString {
    switch (id) {
      case EditData.EDITUNDO_REMOVECHARS:
      case EditData.EDITUNDO_CONNECTPARAS:
      case EditData.EDITUNDO_DELCONTENT:
      case EditData.EDITUNDO_DELETE:
      case EditData.EDITUNDO_CUT:
        return unicode("Delete");
      case EditData.EDITUNDO_MOVEPARAGRAPHS:
      case EditData.EDITUNDO_MOVEPARAS:
      case EditData.EDITUNDO_DRAGANDDROP:
        return unicode("Move");
      case EditData.EDITUNDO_INSERTFEATURE:
      case EditData.EDITUNDO_SPLITPARA:
      case EditData.EDITUNDO_INSERTCHARS:
      case EditData.EDITUNDO_PASTE:
      case EditData.EDITUNDO_INSERT:
      case EditData.EDITUNDO_READ:
        return unicode("Insert");
      case EditData.EDITUNDO_REPLACEALL:
        return unicode("Replace");
      case EditData.EDITUNDO_ATTRIBS:
      case EditData.EDITUNDO_PARAATTRIBS:
        return unicode("Apply attributes");
      case EditData.EDITUNDO_RESETATTRIBS:
        return unicode("Reset attributes");
      case EditData.EDITUNDO_STYLESHEET:
        return unicode("Apply Styles");
      case EditData.EDITUNDO_TRANSLITERATE:
        return unicode("Change Case");
      case EditData.EDITUNDO_INDENTBLOCK:
      case EditData.EDITUNDO_UNINDENTBLOCK:
        return unicode("Indent");
      default:
        return new OUString();
    }
  }
  /** Original unported paragraph-connection dependency. @param left - Left paragraph index. @param backward - Source direction flag. @returns Actual resulting position. */
  abstract ConnectContents(left: number, backward: boolean): EditPaM;
  /** Original unported paragraph-split dependency. @param paragraph - Paragraph index. @param position - Source split index. @returns Actual resulting position. */
  abstract SplitContent(paragraph: number, position: number): EditPaM;
  /** Original actual public selection conversion, without normalization. @param selection - Original public value. @returns Actual node selection. */
  CreateSelection(selection: ESelection): EditSelection {
    return this.getImpl().CreateSel(selection);
  }
  /** Original outer default-language assignment. @param language - Native language identifier. @returns Nothing. */
  SetDefaultLanguage(language: number): void {
    this.getImpl().SetDefaultLanguage(language);
  }
  /** Original paragraph count from the actual EditDoc. @returns Native count. */
  GetParagraphCount(): number {
    return this.getImpl().GetEditDoc().Count();
  }
  /** Original control-word read through the internal status owner. @returns Native control bits. */
  GetControlWord(): EEControlBits {
    return this.getImpl().GetStatus().GetControlWord()[0];
  }
  /** Original public undo flag dispatch. @param enabled - Native enable flag. @returns Nothing. */
  EnableUndo(enabled: boolean): void {
    this.getImpl().EnableUndo(enabled);
  }
  /** Original public undo flag read. @returns Native flag. */
  IsUndoEnabled(): boolean {
    return this.getImpl().IsUndoEnabled();
  }
  /** Original plain-text setter delegates to the actual internal engine. @param text - Counted original text. @returns Nothing. */
  SetText(text: OUStringConstReference): void {
    this.getImpl().SetText(text);
  }
  /** Original paragraph range with public default count one. @param paragraph - Source start. @param count - Original default one. @returns Actual object or source null. */
  CreateTextObject(paragraph: number, count?: number): EditTextObject | null;
  /** Original whole-document and public-selection overloads, unified at the host declaration boundary. @param selection - Source public range, or absent for the whole document. @returns Actual owned object. */
  CreateTextObject(selection?: ESelection): EditTextObject;
  /** Original outer owner delegation for all three public overloads. @param source - Source overload value. @param count - Original paragraph-count default one. @returns Actual owned object or paragraph-range null. */
  CreateTextObject(source?: number | ESelection, count = 1): EditTextObject | null {
    if (source === undefined) return this.getImpl().CreateTextObject();
    if (typeof source === "number") return this.getImpl().CreateTextObject(source, count);
    return this.getImpl().CreateTextObject(this.CreateSelection(source));
  }
  /** Original optional notification Link assignment. @param handler - Actual callback or empty Link. @returns Nothing. */
  SetNotifyHdl(handler: ((notification: EENotify) => void) | null): void {
    this.getImpl().SetNotifyHdl(handler);
  }
  /** Original borrowed notification callback. @returns Actual callable or empty Link. */
  GetNotifyHdl(): ((notification: EENotify) => void) | null {
    return this.getImpl().GetNotifyHdl();
  }
  /** Original undo-state delegation. @returns Actual execution flag. */
  IsInUndo(): boolean {
    return this.getImpl().IsInUndo();
  }
  /** Original inserted-paragraph notification with source default parameters. @param paragraph - Source index. @returns Nothing. */
  ParagraphInserted(paragraph: number): void {
    if (this.GetNotifyHdl()) {
      const notification = new EENotify(EENotifyType.EE_NOTIFY_PARAGRAPHINSERTED);
      notification.nParagraph = paragraph;
      this.getImpl().GetNotifyHdl()?.(notification);
    }
  }
  /** Original removed-paragraph notification, including the all-paragraphs sentinel. @param paragraph - Source index. @returns Nothing. */
  ParagraphDeleted(paragraph: number): void {
    if (this.GetNotifyHdl()) {
      const notification = new EENotify(EENotifyType.EE_NOTIFY_PARAGRAPHREMOVED);
      notification.nParagraph = paragraph;
      this.getImpl().GetNotifyHdl()?.(notification);
    }
  }
  /** Original empty virtual callback body; this is source behavior, not an unported provider substitute. @param paragraph - Original unused index. @returns Nothing. */
  ParaAttribsChanged(paragraph: number): void {
    void paragraph;
  }
}
