/** @fileoverview Original EditUndoInsertChars and EditUndoSplitPara actions from editundo.cxx, with actual engine dependencies and original selection/merge ordering. Other action families and the concrete manager remain unported. */
import { EditUndo } from "./editund2";
import type { EditEngine } from "./editeng.lifecycle";
import type { EditView } from "./impedit.lifecycle";
import { EPaM } from "../../inc/EPaM";
import { EditPaM } from "../../inc/EditPaM";
import { EditSelection } from "../../inc/EditSelection";
import { EDITUNDO_INSERTCHARS, EDITUNDO_SPLITPARA } from "../../inc/editdata";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { SfxUndoAction } from "../../../svl/source/undo/undo";
/** Original paragraph split action stores a signed32 node and narrowed unsigned16 split index. */
export class EditUndoSplitPara extends EditUndo {
  private readonly nNode: number;
  private readonly nSepPos: number;
  /** Original concrete action construction. @param engine - Actual source engine. @param node - Source paragraph. @param position - Source unsigned16 index. @returns Action. */
  constructor(engine: EditEngine | null, node: number, position: number) {
    super(EDITUNDO_SPLITPARA, engine);
    this.nNode = node | 0;
    this.nSepPos = position & 0xffff;
  }
  /** Original connection and collapsed active-view selection. @returns Nothing. */
  override Undo(): void {
    const engine = this.GetEditEngine() as EditEngine,
      position = engine.ConnectContents(this.nNode, false);
    (engine.GetActiveView() as EditView)
      .getImpl()
      .SetEditSelection(new EditSelection(position, position));
  }
  /** Original source split and collapsed active-view selection. @returns Nothing. */
  override Redo(): void {
    const engine = this.GetEditEngine() as EditEngine,
      position = engine.SplitContent(this.nNode, this.nSepPos);
    (engine.GetActiveView() as EditView)
      .getImpl()
      .SetEditSelection(new EditSelection(position, position));
  }
}
/** Original inserted-character action owns independent position/text values; source undo/redo does not substitute a parser. */
export class EditUndoInsertChars extends EditUndo {
  private readonly aEPaM: EPaM;
  private readonly aText: OUString;
  /** Original by-value action payload; native move syntax is represented by owned SAL value construction. @param engine - Actual engine. @param position - Source public position. @param text - Borrowed source value copied into the owned payload. @returns Action. */
  constructor(engine: EditEngine | null, position: EPaM, text: OUStringConstReference) {
    super(EDITUNDO_INSERTCHARS, engine);
    this.aEPaM = new EPaM(position);
    this.aText = new OUString(text);
  }
  /** Original range construction, actual deletion and collapsed active-view result. @returns Nothing. */
  override Undo(): void {
    const engine = this.GetEditEngine() as EditEngine,
      position = engine.CreateEditPaM(this.aEPaM),
      selection = new EditSelection(position, position);
    selection.Max().SetIndex(selection.Max().GetIndex() + this.aText.getLength());
    const result = engine.DeleteSelection(selection);
    (engine.GetActiveView() as EditView)
      .getImpl()
      .SetEditSelection(new EditSelection(result, result));
  }
  /** Original insertion and selected reinserted range, using the source stored length rather than the returned position. @returns Nothing. */
  override Redo(): void {
    const engine = this.GetEditEngine() as EditEngine,
      position = engine.CreateEditPaM(this.aEPaM);
    engine.InsertText(new EditSelection(position, position), this.aText);
    const result = new EditPaM(position);
    result.SetIndex(result.GetIndex() + this.aText.getLength());
    (engine.GetActiveView() as EditView)
      .getImpl()
      .SetEditSelection(new EditSelection(position, result));
  }
  /** Original dynamic type, paragraph and exact adjacency tests; no engine-identity or whitespace condition is added. @param action - Next actual shared action. @returns Source merge predicate. */
  override Merge(action: SfxUndoAction<unknown, unknown> | null): boolean {
    if (!(action instanceof EditUndoInsertChars)) return false;
    if (this.aEPaM.nPara !== action.aEPaM.nPara) return false;
    if (this.aEPaM.nIndex + this.aText.getLength() === action.aEPaM.nIndex) {
      this.aText.append(action.aText);
      return true;
    }
    return false;
  }
  /** Binds native owned-string destruction to the existing shared manager's payload release entry. @returns Nothing. */
  override Dispose(): void {
    this.aText.dispose();
  }
}
