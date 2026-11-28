/** @fileoverview Original Sfx2 ordered file-link registration from linkmgr2.cxx. */
import { SfxLinkUpdateMode, SvBaseLinkObjectType, type SvBaseLink } from "./lnkbase2";

const cTokenSeparator = "\uFFFF";

/** Owns registered links independently of clients' cached document contents. */
export class LinkManager {
  private readonly aLinkTbl: SvBaseLink[] = [];

  /** Borrows the native registration order. @returns Registered client links. */
  GetLinks(): readonly SvBaseLink[] {
    return this.aLinkTbl;
  }

  /** Inserts a file client using the native source name representation. @param link - Actual link. @param type - File client type. @param file - Source document URL. @param filter - Filter name. @param range - Source range. @returns Nothing. */
  InsertFileLink(
    link: SvBaseLink,
    type: SvBaseLinkObjectType.ClientFile,
    file: string,
    filter?: string,
    range?: string,
  ): void {
    if (!(link.GetObjType() & SvBaseLinkObjectType.ClientSo)) return;
    const name =
      file +
      cTokenSeparator +
      (range ?? "") +
      (filter === undefined ? "" : cTokenSeparator + filter);
    link.SetObjType(type);
    link.SetLinkSourceName(name);
    link.SetUpdateMode(SfxLinkUpdateMode.ONCALL);
    if (this.aLinkTbl.includes(link)) return;
    link.SetLinkManager(this);
    this.aLinkTbl.push(link);
  }

  /** Detaches the links when their document closes. @returns Nothing. */
  Dispose(): void {
    for (const link of this.aLinkTbl) link.SetLinkManager(undefined);
    this.aLinkTbl.length = 0;
  }
}
