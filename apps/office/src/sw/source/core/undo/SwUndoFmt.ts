/** @fileoverview Native generic format-create history and consumed paragraph subtype from SwUndoFmt.cxx. Frame factory/delete/broadcast and full undo identity/localization contracts remain unported. */
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SwDoc } from "../doc/doc";
import type { SwFormat } from "../attr/format";
import type { SwTextFormatColl } from "../doc/fmtcol";
import { COLL_GET_RANGE_BITS } from "../../../inc/poolfmt";
import { SwUndo, type SwUndoRedoContext } from "./undobj";
import { SwRewriter } from "./SwRewriter";
import { SwUndoArg } from "../../../inc/SwRewriter";

/** Original abstract create action owns late captured direct items, names and source pool-range/auto state. */
export abstract class SwUndoFormatCreate extends SwUndo {
  protected m_pNew: SwFormat | undefined;
  protected m_sNewName = "";
  protected readonly m_sDerivedFrom: string;
  protected readonly m_rDoc: SwDoc;
  private m_pNewSet: SfxItemSet | undefined;
  private m_nId = 0;
  private m_bAuto = false;
  /** Original source constructor retains the borrowed owner and parent name, without eagerly reading the created format name or serializing its identity. @param comment - Current English native resource template. @param created - Actual new owner. @param parent - Actual original parent. @param document - Actual document. @returns Action. */
  protected constructor(
    comment: string,
    created: SwFormat | undefined,
    parent: SwFormat | undefined,
    document: SwDoc,
  ) {
    super(comment);
    this.m_pNew = created;
    this.m_sDerivedFrom = parent?.GetName() ?? "";
    this.m_rDoc = document;
  }
  /** Original virtual family lookup. @param name - Native name. @returns Actual borrowed format or absent. */
  protected abstract Find(name: string): SwFormat | undefined;
  /** Original virtual family construction. @param parent - Actual found parent or absent. @returns Actual created owner or absent. */
  protected abstract Create(parent: SwFormat | undefined): SwFormat | undefined;
  /** Original virtual deletion consumes the actual current new pointer. @returns Nothing. */
  protected abstract Delete(): void;
  /** Source captures current name once, re-finds by name, owns a value set and deletes through the actual family. @param context - Original context, unused by this source body. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    void context;
    if (!this.m_pNew) return;
    if (this.m_sNewName === "") this.m_sNewName = this.m_pNew.GetName();
    if (this.m_sNewName !== "") this.m_pNew = this.Find(this.m_sNewName);
    if (this.m_pNew) {
      const set = new SfxItemSet(this.m_pNew.GetAttrSet());
      this.m_pNewSet?.Dispose();
      this.m_pNewSet = set;
      this.m_nId = this.m_pNew.GetPoolFormatId() & COLL_GET_RANGE_BITS;
      this.m_bAuto = this.m_pNew.IsAuto();
      this.Delete();
    }
  }
  /** Original redo always calls Create, restores only when both format and saved set exist, and replaces only source range bits. @param context - Original context, unused here. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    void context;
    const parent = this.Find(this.m_sDerivedFrom),
      format = this.Create(parent);
    if (format && this.m_pNewSet) {
      format.SetAuto(this.m_bAuto);
      this.m_rDoc.ChgFormat(format, this.m_pNewSet);
      format.SetPoolFormatId((format.GetPoolFormatId() & ~COLL_GET_RANGE_BITS) | this.m_nId);
      this.m_pNew = format;
    } else this.m_pNew = undefined;
  }
  /** Source argument rewriting lazily captures the created name and returns an independent real rule owner. @returns Native rewriter. */
  protected override GetRewriter(): SwRewriter {
    if (this.m_sNewName === "" && this.m_pNew) this.m_sNewName = this.m_pNew.GetName();
    const rewriter = new SwRewriter();
    rewriter.AddRule(SwUndoArg.UndoArg1, this.m_sNewName);
    return rewriter;
  }
  /** Original owned optional item-set destructor runs before base action cursor members. @returns Nothing. */
  override Dispose(): void {
    this.m_pNewSet?.Dispose();
    this.m_pNewSet = undefined;
    super.Dispose();
  }
}

/** Original paragraph family delegates lookup/create/delete to actual document owners; no browser-id or separate style snapshot is stored. */
export class SwUndoTextFormatCollCreate extends SwUndoFormatCreate {
  /** Original consumed family constructor. @param collection - Actual new style. @param parent - Actual parent. @param document - Actual document. @returns Action. */
  constructor(collection: SwTextFormatColl, parent: SwTextFormatColl | undefined, document: SwDoc) {
    super("Create paragraph style: $1", collection, parent, document);
  }
  /** Original name-based paragraph lookup. @param name - Source name. @returns Actual style or absence. */
  protected override Find(name: string): SwTextFormatColl | undefined {
    return this.m_rDoc.FindTextFormatCollByName(name);
  }
  /** Original paragraph creation does not supply a serialized browser id. @param parent - Source lookup result. @returns Actual recreated style. */
  protected override Create(parent: SwFormat | undefined): SwTextFormatColl {
    return this.m_rDoc.MakeTextFormatColl(this.m_sNewName, parent as SwTextFormatColl | undefined);
  }
  /** Original family deletion through the actual document operation; broader native style broadcast remains unported. @returns Nothing. */
  protected override Delete(): void {
    this.m_rDoc.DelTextFormatColl(this.m_pNew as SwTextFormatColl);
  }
}
