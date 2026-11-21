/** @fileoverview ImpEditEngine construction for document text objects with layout and undo disabled by the document owner. */
import { LANGUAGE_DONTKNOW } from "../../../i18nlangtag/inc/lang";
import {
  EEHorizontalTextDirection,
  EENotify,
  EENotifyType,
  ScalingParameters,
} from "../../inc/editdata";
import { EditDoc } from "../../inc/editdoc";
import { EditPaM } from "../../inc/EditPaM";
import { EditSelection } from "../../inc/EditSelection";
import { EEControlBits } from "../../inc/editstat";
import { ParaPortionList } from "../../inc/ParagraphPortionList";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import type { SfxItemSet } from "../../../svl/source/items/itemset";
import { Size } from "../../../tools/inc/gen";
import { InternalEditStatus } from "./editstt2";
import type { EditEngine } from "./editeng.lifecycle";
import { ImpEditEngine, type EditView } from "./impedit.lifecycle";

import type { EditTextObject } from "./editobj";
import { SetTextObject } from "./impedit4.textobject";
import { UpdateFields } from "./impedit2.fields";

/** Original constructor and state consumed by the no-view EditEngine document path. */
export class DocumentImpEditEngine extends ImpEditEngine {
  protected readonly maEditDoc: EditDoc;
  protected readonly maParaPortionList = new ParaPortionList();
  protected readonly maStatus = new InternalEditStatus();
  protected readonly maEditViews: EditView[] = [];
  protected readonly maPaperSize = new Size(0x7fffffff, 0x7fffffff);
  protected readonly maScalingParameters = new ScalingParameters();
  protected mnBigTextObjectStart = 20;
  protected mnColumns = 1;
  protected mnColumnSpacing = 0;
  protected meDefLanguage = LANGUAGE_DONTKNOW;
  protected meDefaultHorizontalTextDirection = EEHorizontalTextDirection.Default;
  protected mpRefDev = null;
  protected pEmptyItemSet: SfxItemSet | null = null;
  protected mbFuzzing = false;
  protected mpActiveView = null;
  protected mnCurTextHeight = 0;
  protected mbFormatted = false;
  protected mbUndoEnabled = true;
  protected mbIsInUndo = false;
  protected mbUpdateLayout = true;
  protected mbCallParaInsertedOrDeleted = false;
  protected maModifyHdl: ((argument: null) => void) | null = null;
  protected maNotifyHdl: ((notification: EENotify) => void) | null = null;

  /** Initializes the actual document and portion list before enabling paragraph notifications. @param mpEditEngine - Actual outer owner. @param pool - Borrowed item pool. @returns The internal editor. */
  constructor(
    protected readonly mpEditEngine: EditEngine,
    pool: SfxItemPool,
  ) {
    super();
    this.maEditDoc = new EditDoc(pool);
    this.maStatus.GetControlWord()[0] =
      EEControlBits.USECHARATTRIBS |
      EEControlBits.DOIDLEFORMAT |
      EEControlBits.PASTESPECIAL |
      EEControlBits.UNDOATTRIBS |
      EEControlBits.ALLOWBIGOBJS |
      EEControlBits.RTFSTYLESHEETS;
    this.InitDoc(false);
    this.SetCallParaInsertedOrDeleted(true);
    this.maEditDoc.SetModifyHdl(
      /** Original EditDoc modification link. @returns Nothing. */ () => this.DocModified(),
    );
  }

  /** Original rich-text overload through the document insertion body. @param object - Borrowed native object. @returns Nothing. */
  SetTextObject(object: EditTextObject): void {
    SetTextObject(this, object);
  }

  /** Original field text update for the no-view editor. @returns Whether any field value changed. */
  UpdateFields(): boolean {
    return UpdateFields(this);
  }

  /** Releases the engine's owned history, references and paragraphs before the borrowed pool. @returns Nothing. */
  override Dispose(): void {
    this.SetUpdateLayout(false);
    this.ResetUndoManager();
    super.Dispose();
    this.mxBI.dispose();
    this.pEmptyItemSet?.Dispose();
    this.pEmptyItemSet = null;
    this.maParaPortionList.Reset();
    this.maEditDoc.dispose();
  }

  /** With layout disabled, source FormatDoc and UpdateViews both return before layout or painting. @returns Nothing. */
  override FormatAndLayout(): void {
    if (this.IsUpdateLayout()) throw new Error("Document EditEngine requires disabled layout");
    this.GetNotifyHdl()?.(new EENotify(EENotifyType.EE_NOTIFY_PROCESSNOTIFICATIONS));
  }

  /** Native no-view deletion preserves surviving nodes, attributes, and the matching portion list. @param selection - Actual edit selection. @returns Collapsed caret. */
  override ImpDeleteSelection(selection: EditSelection): EditPaM {
    if (!selection.HasRange()) return selection.Min();
    const range = new EditSelection(selection);
    const doc = this.GetEditDoc();
    range.Adjust(doc);
    const start = range.Min(),
      end = range.Max();
    const left = start.GetNode(),
      right = end.GetNode();
    if (!left || !right) return start;
    const deleted = this.CreateESel(range);
    left.checkAndDeleteEmptyAttribs();
    if (left === right) {
      const count = end.GetIndex() - start.GetIndex();
      doc.RemoveChars(start, count);
      this.FindParaPortion(left)?.MarkInvalid(end.GetIndex(), -count);
    } else {
      right.checkAndDeleteEmptyAttribs();
      const first = doc.GetPos(left);
      const last = doc.GetPos(right);
      for (let index = last - 1; index > first; index--) {
        const style = doc.GetObject(index)?.GetStyleSheet();
        if (style) this.EndListening(style);
        this.GetParaPortions().Remove(index);
        doc.Remove(index);
      }
      doc.RemoveChars(start, left.Len() - start.GetIndex());
      doc.RemoveChars(new EditPaM(right, 0), end.GetIndex());
      const style = right.GetStyleSheet();
      if (style) this.EndListening(style);
      this.GetParaPortions().Remove(first + 1);
      doc.ConnectParagraphs(left, right);
      this.FindParaPortion(left)?.MarkSelectionInvalid(start.GetIndex());
    }
    this.UpdateSelectionsDelete(deleted);
    this.TextModified();
    return start;
  }
}
