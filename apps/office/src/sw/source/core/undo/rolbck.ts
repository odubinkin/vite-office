/** @fileoverview Restores bounded native text-attribute history from sw/source/core/undo/rolbck.cxx. */
import { SetAttrMode } from "../../../inc/swtypes";
import type { SwDoc } from "../doc/doc";
import { SwTextNode } from "../txtnode/ndtxt";
import type { SwpHints } from "../txtnode/ndhints";
import type { SwFormatAutoFormat, SwTextAttrEnd } from "../txtnode/txatbase";
import type { SwFormatINetFormat } from "../txtnode/fmtatr2";

/** Native history discriminants from core/inc/rolbck.hxx;only old ranged text history is implemented. */
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
  /** Restores the entry into the graph. @param doc - Destination graph. @param tmp - Temporary rollback. @returns Nothing. */
  public abstract SetInDoc(doc: SwDoc, tmp: boolean): void;
}
/** Cloned native item and original coordinates,retaining only format-ignore flags. */
export class SwHistorySetText extends SwHistoryHint {
  private readonly m_pAttr: SwFormatAutoFormat | SwFormatINetFormat;
  private readonly m_nStart: number;
  private readonly m_nEnd: number;
  private readonly m_bFormatIgnoreStart: boolean;
  private readonly m_bFormatIgnoreEnd: boolean;
  /** Records the old item independently of subsequent edits. @param hint - Original attribute. @param m_nNodeIndex - Native node index. @returns Nothing. */
  public constructor(
    hint: SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat>,
    private readonly m_nNodeIndex: number,
  ) {
    super(HISTORY_HINT.HSTRY_SETTXTHNT);
    this.m_pAttr = hint.format.Clone();
    this.m_nStart = hint.GetStart();
    this.m_nEnd = hint.GetAnyEnd();
    this.m_bFormatIgnoreStart = hint.IsFormatIgnoreStart();
    this.m_bFormatIgnoreEnd = hint.IsFormatIgnoreEnd();
  }
  /** Inserts a fresh attribute with native constructor defaults and retained format-ignore flags. @param doc - Actual graph. @param tmp - Native temporary policy;this entry restores identically in either mode. @returns Nothing. */
  public override SetInDoc(doc: SwDoc, tmp: boolean): void {
    void tmp;
    const node = doc.GetNodes().at(this.m_nNodeIndex);
    if (!(node instanceof SwTextNode)) return;
    const attr = node.InsertItem(
      this.m_pAttr,
      this.m_nStart,
      this.m_nEnd,
      SetAttrMode.NOTXTATRCHR | SetAttrMode.NOHINTADJUST,
    );
    if (this.m_bFormatIgnoreStart) attr.SetFormatIgnoreStart(true);
    if (this.m_bFormatIgnoreEnd) attr.SetFormatIgnoreEnd(true);
  }
}
/** Owns native old-text entries and the temporary rollback end difference. */
export class SwHistory {
  private readonly m_SwpHstry: SwHistoryHint[] = [];
  private m_nEndDiff = 0;
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
  /** Captures the implemented old-ranged-attribute variant. @param hint - Attribute. @param nodeIndex - Original node index. @param newAttr - New-attribute reset history is not yet implemented. @returns Nothing. */
  public AddTextAttr(
    hint: SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat>,
    nodeIndex: number,
    newAttr: boolean,
  ): void {
    if (newAttr) throw new Error("Writer new-attribute reset history is not implemented.");
    this.m_SwpHstry.push(new SwHistorySetText(hint, nodeIndex));
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
    this.m_SwpHstry.splice(start);
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
  /** Re-enables retained text entries for another undo cycle. @param end - New active end. @returns Previous active end. */
  public SetTmpEnd(end: number): number {
    const old = this.GetTmpEnd();
    this.m_nEndDiff = this.Count() - end;
    return old;
  }
}
