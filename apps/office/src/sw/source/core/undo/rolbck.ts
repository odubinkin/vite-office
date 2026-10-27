/** @fileoverview Restores bounded native text-attribute history from sw/source/core/undo/rolbck.cxx. */
import type { TextAttributeOutput } from "../txtnode/thints-setattr";
import { SwFormatCharFormat } from "../txtnode/fmtatr2";
import { SwClient, type SwModify } from "../../../inc/calbck";
import { SwFormat } from "../attr/format";
import type { SwModelHint } from "../../../inc/hints";
import { RES_BOXATR_FORMULA, RES_BOXATR_VALUE } from "../../../inc/hintids";
import { SetAttrMode } from "../../../inc/swtypes";
import type { SwDoc } from "../doc/doc";
import type { SwBookmark } from "../doc/docbm";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwTextNode } from "../txtnode/ndtxt";
import type { SwpHints } from "../txtnode/ndhints";
import type { SwFormatAutoFormat, SwTextAttrEnd } from "../txtnode/txatbase";
import type { SwFormatINetFormat } from "../txtnode/fmtatr2";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwContentNode, SwTableNode, type SwNode, type SwNodeType } from "../docnode/node";
import type { SwFormatColl, SwTextFormatColl } from "../doc/fmtcol";

/** Native history discriminants;registered old ranged text,direct format and text collection entries are implemented. */
export enum HISTORY_HINT {
  HSTRY_SETFMTHNT,
  HSTRY_RESETFMTHNT,
  HSTRY_SETTXTHNT,
  HSTRY_SETTXTFLDHNT,
  HSTRY_SETREFMARKHNT,
  HSTRY_SETTOXMARKHNT,
  HSTRY_RESETTXTHNT,
  HSTRY_SETFTNHNT,
  HSTRY_CHGFMTCOLL,
  HSTRY_FLYCNT,
  HSTRY_BOOKMARK,
  HSTRY_SETATTRSET,
  HSTRY_CHGFLYANCHOR,
  HSTRY_CHGFLYCHAIN,
  HSTRY_CHGCHARFMT,
  HSTRY_NOTEXTFIELDMARK,
  HSTRY_TEXTFIELDMARK,
}
/** Native history entry with a stable discriminant. */
export abstract class SwHistoryHint {
  /** Creates the native entry. @param which - History kind. @returns Nothing. */
  protected constructor(private readonly m_eWhichId: HISTORY_HINT) {}
  /** Reads the history kind. @returns Native discriminant. */
  public Which(): HISTORY_HINT {
    return this.m_eWhichId;
  }
  /** Returns the default native empty description. @returns Description. */
  public GetDescription(): string {
    return "";
  }
  /** Logical native virtual destructor; value-only entries own no resources. @returns Nothing. */
  public Dispose(): void {}
  /** Restores the entry into the graph. @param doc - Destination graph. @param tmp - Temporary rollback. @returns Nothing. */
  public abstract SetInDoc(doc: SwDoc, tmp: boolean): void;
}

/** Native cloned direct format item,retained by temporary rollback and released by destructive rollback. */
export class SwHistorySetFormat extends SwHistoryHint {
  private m_pAttr: SfxPoolItem | undefined;
  /** Clones one old registered direct item. @param item - Original value. @param m_nNodeIndex - Original content node index. @returns Nothing. */
  public constructor(
    item: SfxPoolItem,
    private readonly m_nNodeIndex: number,
  ) {
    super(HISTORY_HINT.HSTRY_SETFMTHNT);
    this.m_pAttr = item.Clone() as SfxPoolItem;
  }
  /** Restores registered content-node items;table frame/formula/drop variants remain outside this implemented profile. @param doc - Actual graph. @param tmp - Whether retain the item. @returns Nothing. */
  public override SetInDoc(doc: SwDoc, tmp: boolean): void {
    const node = doc.GetNodes().at(this.m_nNodeIndex);
    if (node instanceof SwContentNode) node.SetAttr(this.m_pAttr as SfxPoolItem);
    else if (node instanceof SwTableNode)
      node
        .GetTable()
        .GetFrameFormat()
        .SetFormatAttr(this.m_pAttr as SfxPoolItem);
    if (!tmp) this.Dispose();
  }
  /** Native unique-item member destruction. @returns Nothing. */
  public override Dispose(): void {
    this.m_pAttr?.Dispose();
    this.m_pAttr = undefined;
  }
}

/** Original reset history stores only Which and node index, restoring inherited formatting. */
export class SwHistoryResetFormat extends SwHistoryHint {
  private readonly m_nWhich: number;
  /** Records the changed identity without retaining or flattening its value. @param item - New original item. @param m_nNodeIndex - Native index. @returns Nothing. */
  public constructor(
    item: SfxPoolItem,
    private readonly m_nNodeIndex: number,
  ) {
    super(HISTORY_HINT.HSTRY_RESETFMTHNT);
    this.m_nWhich = item.Which();
  }
  /** Clears only the recorded direct item at the current native slot. @param doc - Native graph. @param tmp - Temporary policy, identical for resets. @returns Nothing. */
  public override SetInDoc(doc: SwDoc, tmp: boolean): void {
    void tmp;
    const node = doc.GetNodes().at(this.m_nNodeIndex);
    if (node instanceof SwContentNode) node.ResetAttr(this.m_nWhich);
    else if (node instanceof SwTableNode)
      node.GetTable().GetFrameFormat().ResetFormatAttr(this.m_nWhich);
  }
}
/** Original multi-item history partitions old direct items from reset WhichIds. */
export class SwHistorySetAttrSet extends SwHistoryHint {
  private readonly m_OldSet: SfxItemSet;
  private readonly m_ResetArray: number[] = [];
  /** Copies generic represented format values and records newly authored identities. @param set - Original old delta. @param m_nNodeIndex - Original slot. @param whichIds - Direct identities before mutation. @returns Nothing. */
  public constructor(
    set: SfxItemSet,
    private readonly m_nNodeIndex: number,
    whichIds: ReadonlySet<number>,
  ) {
    super(HISTORY_HINT.HSTRY_SETATTRSET);
    this.m_OldSet = new SfxItemSet(set.GetPool(), set.GetRanges());
    for (const item of set.entries()) {
      if (!whichIds.has(item.Which())) this.m_ResetArray.push(item.Which());
      else if (item.Which() === RES_BOXATR_FORMULA)
        throw new Error("Writer history formula external-name conversion is not implemented.");
      else if (item.Which() !== RES_BOXATR_VALUE) this.m_OldSet.Put(item);
    }
  }
  /** Restores old items before source-defined resets without recording nested history. @param doc - Native graph. @param tmp - Temporary policy; owned items remain available. @returns Nothing. */
  public override SetInDoc(doc: SwDoc, tmp: boolean): void {
    void tmp;
    const manager = doc.GetUndoManager(),
      enabled = manager.DoesUndo();
    manager.DoUndo(false);
    try {
      const node = doc.GetNodes().at(this.m_nNodeIndex);
      if (node instanceof SwContentNode) {
        node.SetAttr(this.m_OldSet);
        if (this.m_ResetArray.length !== 0) node.ResetAttr(this.m_ResetArray);
      } else if (node instanceof SwTableNode) {
        const format = node.GetTable().GetFrameFormat();
        format.SetFormatAttrSet(this.m_OldSet);
        if (this.m_ResetArray.length !== 0) format.ResetFormatAttr(this.m_ResetArray[0] as number);
      }
    } finally {
      manager.DoUndo(enabled);
    }
  }
  /** Native contained item-set destruction. @returns Nothing. */
  public override Dispose(): void {
    this.m_OldSet.Dispose();
  }
}
/** Native collection identity and content type,with a live-owner check before restoration. */
export class SwHistoryChangeFormatColl extends SwHistoryHint {
  /** Records the collection pointer rather than its name. @param m_pColl - Original collection. @param m_nNodeIndex - Original index. @param m_nNodeType - Content category. @returns Nothing. */
  public constructor(
    private readonly m_pColl: SwFormatColl,
    private readonly m_nNodeIndex: number,
    private readonly m_nNodeType: SwNodeType,
  ) {
    super(HISTORY_HINT.HSTRY_CHGFMTCOLL);
  }
  /** Restores only a matching text node and still-live paragraph collection. @param doc - Actual graph. @param tmp - Temporary policy;collection identity is retained in both modes. @returns Nothing. */
  public override SetInDoc(doc: SwDoc, tmp: boolean): void {
    void tmp;
    const node = doc.GetNodes().at(this.m_nNodeIndex);
    if (!(node instanceof SwTextNode) || node.GetNodeType() !== this.m_nNodeType) return;
    if (doc.GetTextFormatColls().includes(this.m_pColl as SwTextFormatColl))
      node.ChgFormatColl(this.m_pColl);
  }
}
/** Cloned native item and original coordinates,retaining only format-ignore flags. */
export class SwHistorySetText extends SwHistoryHint {
  private readonly m_pAttr: SwFormatAutoFormat | SwFormatINetFormat | SwFormatCharFormat;
  private readonly m_nStart: number;
  private readonly m_nEnd: number;
  private readonly m_bFormatIgnoreStart: boolean;
  private readonly m_bFormatIgnoreEnd: boolean;
  /** Records the old item independently of subsequent edits. @param hint - Original attribute. @param m_nNodeIndex - Native node index. @returns Nothing. */
  public constructor(
    hint: SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat | SwFormatCharFormat>,
    private readonly m_nNodeIndex: number,
  ) {
    super(HISTORY_HINT.HSTRY_SETTXTHNT);
    this.m_pAttr =
      hint.format instanceof SwFormatCharFormat
        ? new SwFormatCharFormat(hint.format.GetCharFormat())
        : hint.format.Clone();
    this.m_nStart = hint.GetStart();
    this.m_nEnd = hint.GetAnyEnd();
    this.m_bFormatIgnoreStart = hint.IsFormatIgnoreStart();
    this.m_bFormatIgnoreEnd = hint.IsFormatIgnoreEnd();
  }
  /** Inserts a fresh attribute with native constructor defaults and retained format-ignore flags. @param doc - Actual graph. @param tmp - Native temporary policy;this entry restores identically in either mode. @returns Nothing. */
  public override SetInDoc(doc: SwDoc, tmp: boolean): void {
    void tmp;
    if (this.m_pAttr instanceof SwFormatCharFormat) {
      const format = this.m_pAttr.GetCharFormat();
      if (format === undefined || !doc.GetCharFormats().includes(format)) return;
    }
    const node = doc.GetNodes().at(this.m_nNodeIndex);
    if (!(node instanceof SwTextNode)) return;
    const attr = node.InsertItem(
      this.m_pAttr,
      this.m_nStart,
      this.m_nEnd,
      SetAttrMode.NOTXTATRCHR | SetAttrMode.NOHINTADJUST,
    );
    if (attr === undefined) return;
    if (this.m_bFormatIgnoreStart) attr.SetFormatIgnoreStart(true);
    if (this.m_bFormatIgnoreEnd) attr.SetFormatIgnoreEnd(true);
  }
  /** Native unique ranged-item destruction releases its automatic style. @returns Nothing. */
  public override Dispose(): void {
    this.m_pAttr.Dispose();
  }
}
/** Original reset history retains family and exact coordinates, never the inserted item. */
export class SwHistoryResetText extends SwHistoryHint {
  /** Records native reset identity. @param m_nAttr - Original Which. @param m_nStart - Exact start. @param m_nEnd - Exact end. @param m_nNodeIndex - Original node slot. @returns Entry. */
  public constructor(
    private readonly m_nAttr: number,
    private readonly m_nStart: number,
    private readonly m_nEnd: number,
    private readonly m_nNodeIndex: number,
  ) {
    super(HISTORY_HINT.HSTRY_RESETTXTHNT);
  }
  /** Original Which query used by insertion-history invariants. @returns Family. */
  public GetWhich(): number {
    return this.m_nAttr;
  }
  /** Removes exact registered attributes through the actual text-node owner. @param doc - Destination graph. @param tmp - Temporary policy; reset entries restore identically. @returns Nothing. */
  public override SetInDoc(doc: SwDoc, tmp: boolean): void {
    void tmp;
    const node = doc.GetNodes().at(this.m_nNodeIndex);
    if (node instanceof SwTextNode) node.DeleteAttributes(this.m_nAttr, this.m_nStart, this.m_nEnd);
  }
}

/** Native SwHistoryBookmark payload for the existing collapsed ordinary bookmark model. Expanded/typed marks and unrepresented metadata remain unsupported. */
export class SwHistoryBookmark extends SwHistoryHint {
  private readonly m_aName: string;
  private readonly m_nNode: number;
  private readonly m_nContent: number;
  /** Saves original numeric/name identity rather than retaining a disposed mark or registered position. @param bookmark - Existing ordinary collapsed mark. @param m_bSavePos - Whether capture its position. @param saveOtherPos - Expanded-end capture, unsupported by the represented model. @returns History entry. */
  public constructor(
    bookmark: SwBookmark,
    private readonly m_bSavePos: boolean,
    saveOtherPos: boolean,
  ) {
    super(HISTORY_HINT.HSTRY_BOOKMARK);
    if (saveOtherPos) throw new Error("Writer expanded bookmark history is not implemented.");
    this.m_aName = bookmark.GetName();
    this.m_nNode = m_bSavePos ? bookmark.GetMarkPos().GetNodeIndex() : 0;
    this.m_nContent = m_bSavePos ? bookmark.GetMarkPos().GetContentIndex() : 0;
  }
  /** Original name/node/content comparison. @param bookmark - Current mark. @returns Whether the saved identity agrees. */
  public IsEqualBookmark(bookmark: SwBookmark): boolean {
    return (
      this.m_nNode === bookmark.GetMarkPos().GetNodeIndex() &&
      this.m_nContent === bookmark.GetMarkPos().GetContentIndex() &&
      this.m_aName === bookmark.GetName()
    );
  }
  /** Finds a possibly surviving mark, resolves current node slots and recreates the source mark with undo disabled. @param doc - Destination graph. @param tmp - Native policy, unused for bookmark restoration. @returns Nothing. */
  public override SetInDoc(doc: SwDoc, tmp: boolean): void {
    void tmp;
    const undo = doc.GetUndoManager(),
      enabled = undo.DoesUndo();
    undo.DoUndo(false);
    try {
      const access = doc.GetIDocumentMarkAccess(),
        mark = access.FindMark(this.m_aName);
      if (!this.m_bSavePos && mark === undefined)
        throw new Error("Writer unsaved bookmark position requires an existing mark.");
      const node = this.m_bSavePos ? doc.GetNodes().at(this.m_nNode) : mark?.GetMarkPos().GetNode();
      if (!(node instanceof SwTextNode)) return;
      const content = this.m_bSavePos
        ? this.m_nContent
        : (mark as SwBookmark).GetMarkPos().GetContentIndex();
      const position = new SwPosition(node, content),
        range = new SwPaM(position);
      position.Dispose();
      try {
        if (mark !== undefined) access.DeleteMark(this.m_aName);
        const point = range.GetPoint();
        access.MakeMark(point.GetNode() as SwTextNode, point.GetContentIndex(), this.m_aName);
      } finally {
        range.Dispose();
      }
    } finally {
      undo.DoUndo(enabled);
    }
  }
}

/** Owns native old-text entries and the temporary rollback end difference. */
export class SwHistory {
  private readonly m_SwpHstry: SwHistoryHint[] = [];
  private m_nEndDiff = 0;
  /** Appends the original friend-owned history entry without serialization. @param hint - Native record. @returns Nothing. */
  public AddHint(hint: SwHistoryHint): void {
    this.m_SwpHstry.push(hint);
  }
  /** Original represented ordinary mark variant of AddIMark. @param bookmark - Live mark. @param savePos - Save primary position. @param saveOtherPos - Save expanded end. @returns Nothing. */
  public AddIMark(bookmark: SwBookmark, savePos: boolean, saveOtherPos: boolean): void {
    this.m_SwpHstry.push(new SwHistoryBookmark(bookmark, savePos, saveOtherPos));
  }
  /** Original ownership move; neither history's temporary-end counter is reset, even when moving a nonempty suffix. @param position - Destination insertion slot. @param source - Source history. @param start - First moved entry. @returns Nothing. */
  public Move(position: number, source: SwHistory, start = 0): void {
    if (start === source.Count()) return;
    const moved = source.m_SwpHstry.splice(start),
      tail = this.m_SwpHstry.splice(position);
    for (const hint of moved) this.m_SwpHstry.push(hint);
    for (const hint of tail) this.m_SwpHstry.push(hint);
  }
  /** Reads retained entries. @returns Count. */
  public Count(): number {
    return this.m_SwpHstry.length;
  }
  /** Reads the active temporary end. @returns Active end. */
  public GetTmpEnd(): number {
    return this.Count() - this.m_nEndDiff;
  }
  /** Reads a native history entry. @param index - Entry index. @returns Actual entry. */
  public at(index: number): SwHistoryHint {
    const entry = this.m_SwpHstry[index];
    if (entry === undefined) throw new Error("Missing Writer history entry.");
    return entry;
  }
  /** Captures old values or original new-attribute reset entries. @param hint - Attribute. @param nodeIndex - Original node index. @param newAttr - Whether record the new family/range reset. @returns Nothing. */
  public AddTextAttr(
    hint: SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat | SwFormatCharFormat>,
    nodeIndex: number,
    newAttr: boolean,
  ): void {
    this.m_SwpHstry.push(
      newAttr
        ? new SwHistoryResetText(hint.Which(), hint.GetStart(), hint.GetAnyEnd(), nodeIndex)
        : new SwHistorySetText(hint, nodeIndex),
    );
  }

  /** Copies explicit registered old format values in native item order. @param set - Direct node set. @param nodeIndex - Original index. @returns Nothing. */
  public CopyFormatAttr(set: SfxItemSet, nodeIndex: number): void {
    for (const item of set.entries()) this.m_SwpHstry.push(new SwHistorySetFormat(item, nodeIndex));
  }

  /** Captures the live collection pointer and node type. @param collection - Original collection. @param nodeIndex - Original index. @param nodeType - Original category. @returns Nothing. */
  public AddColl(collection: SwFormatColl, nodeIndex: number, nodeType: SwNodeType): void {
    this.m_SwpHstry.push(new SwHistoryChangeFormatColl(collection, nodeIndex, nodeType));
  }
  /** Copies old ranged items using native half-open overlap tests. @param hints - Optional original maps. @param nodeIndex - Original node index. @param start - Range start. @param end - Range end. @param copyFields - Native field policy;no field hints are currently implemented. @returns Nothing. */
  public CopyAttr(
    hints: SwpHints | undefined,
    nodeIndex: number,
    start: number,
    end: number,
    copyFields: boolean,
  ): void {
    void copyFields;
    if (hints === undefined) return;
    for (let index = 0; index < hints.Count(); index++) {
      const hint = hints.Get(index),
        attrStart = hint.GetStart();
      if (attrStart > end) break;
      if (start <= attrStart) {
        if (end > attrStart) this.AddTextAttr(hint, nodeIndex, false);
      } else if (start < hint.GetAnyEnd()) this.AddTextAttr(hint, nodeIndex, false);
    }
  }
  /** Restores in reverse order and releases the restored suffix. @param doc - Graph. @param start - First restored entry,default zero. @returns Whether entries existed. */
  public Rollback(doc: SwDoc, start = 0): boolean {
    if (this.Count() === 0) return false;
    for (let index = this.Count(); index > start;) this.at(--index).SetInDoc(doc, false);
    for (const entry of this.m_SwpHstry.splice(start)) entry.Dispose();
    this.m_nEndDiff = 0;
    return true;
  }
  /** Restores active entries without releasing them. @param doc - Graph. @param start - First restored entry. @param toFirst - Native default reverse ordering. @returns Whether anything was restored. */
  public TmpRollback(doc: SwDoc, start: number, toFirst = true): boolean {
    let end = this.GetTmpEnd();
    if (this.Count() === 0 || end === 0 || start >= end) return false;
    if (toFirst) {
      for (; end > start; this.m_nEndDiff++) this.at(--end).SetInDoc(doc, true);
    } else {
      for (; start < end; this.m_nEndDiff++, start++) this.at(start).SetInDoc(doc, true);
    }
    return true;
  }
  /** Native history-vector destruction releases every retained unique entry. @returns Nothing. */
  public Dispose(): void {
    for (const entry of this.m_SwpHstry.splice(0)) entry.Dispose();
    this.m_nEndDiff = 0;
  }
  /** Re-enables retained text entries for another undo cycle. @param end - New active end. @returns Previous active end. */
  public SetTmpEnd(end: number): number {
    const old = this.GetTmpEnd();
    this.m_nEndDiff = this.Count() - end;
    return old;
  }
}

/** Original scoped native client records old format deltas with pre-mutation directness. */
export class SwRegHistory extends SwClient {
  private readonly m_WhichIdSet = new Set<number>();
  private readonly m_nNodeIndex: number;
  /** Registers at the original node or format for one native mutation scope. @param source - Native emitting owner or absent. @param node - Target slot. @param m_pHistory - Optional original history. @returns Nothing. */
  public constructor(
    source: SwModify | undefined,
    node: SwNode,
    private readonly m_pHistory?: SwHistory,
  ) {
    super();
    this.m_nNodeIndex = node.GetIndex();
    if (source !== undefined) this.RegisterToModify(source);
    if (m_pHistory !== undefined) {
      const set =
        source instanceof SwContentNode
          ? source.GetpSwAttrSet()
          : source instanceof SwFormat
            ? source.GetAttrSet()
            : undefined;
      if (set !== undefined) for (const item of set.entries()) this.m_WhichIdSet.add(item.Which());
    }
  }
  /** Original scoped range insertion records direct and ranged native mutations through this registered node. @param set - Original set. @param start - Native start. @param end - Native end. @param mode - Original flags. @param output - Optional first text-attribute pointer. @returns Native setter result. */
  public InsertItems(
    set: SfxItemSet,
    start: number,
    end: number,
    mode: SetAttrMode,
    output?: TextAttributeOutput,
  ): boolean {
    if (!set.Count()) return false;
    const node = this.GetRegisteredIn();
    if (!(node instanceof SwTextNode)) return false;
    if (this.m_pHistory !== undefined) node.GetOrCreateSwpHints().Register(this);
    const inserted = node.SetAttr(set, start, end, mode, output);
    if (this.m_pHistory !== undefined) node.GetpSwpHints()?.DeRegister();
    return inserted;
  }
  /** Original ranged-attribute history forwarding uses the registered native node slot. @param hint - Actual old or new attribute. @param isNew - Whether record its exact reset. @returns Nothing. */
  public AddHint(
    hint: SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat | SwFormatCharFormat>,
    isNew: boolean,
  ): void {
    this.m_pHistory?.AddTextAttr(hint, this.m_nNodeIndex, isNew);
  }
  /** Records original old deltas only while a distinct new delta exists. @param source - Original emitting modify. @param hint - Borrowed source hint. @returns Nothing. */
  protected override SwClientNotify(source: SwModify, hint: SwModelHint): void {
    void source;
    if (
      hint.kind !== "attr-set-change" ||
      this.m_pHistory === undefined ||
      hint.m_pNew === undefined ||
      hint.m_pOld === hint.m_pNew ||
      hint.m_pOld === undefined
    )
      return;
    const set = hint.m_pOld.GetChgSet();
    if (set.Count() > 1)
      this.m_pHistory.AddHint(new SwHistorySetAttrSet(set, this.m_nNodeIndex, this.m_WhichIdSet));
    else {
      const item = set.entries()[0];
      if (item !== undefined)
        this.m_pHistory.AddHint(
          this.m_WhichIdSet.has(item.Which())
            ? new SwHistorySetFormat(item, this.m_nNodeIndex)
            : new SwHistoryResetFormat(item, this.m_nNodeIndex),
        );
    }
  }
}
