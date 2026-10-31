/** @fileoverview Original EditEngine notification member bodies, with mandatory actual implementation access and no concrete constructor admission. */
import type { ImpEditEngine } from "./impedit.lifecycle";
import { EENotify, EENotifyType } from "../../inc/editdata";
import { CreatePool } from "./editeng";
import type { EditPaM } from "../../inc/EditPaM";
import type { EditSelection } from "../../inc/EditSelection";
import type { EPaM } from "../../inc/EPaM";
import type { OUString, OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { EditView } from "./impedit.lifecycle";
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
  /** Original unported localized undo-comment API; no default label provider. @param id - Source undo ID. @returns Owned source string. */
  abstract GetUndoComment(id: number): OUString;
  /** Original unported paragraph-connection dependency. @param left - Left paragraph index. @param backward - Source direction flag. @returns Actual resulting position. */
  abstract ConnectContents(left: number, backward: boolean): EditPaM;
  /** Original unported paragraph-split dependency. @param paragraph - Paragraph index. @param position - Source split index. @returns Actual resulting position. */
  abstract SplitContent(paragraph: number, position: number): EditPaM;
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
