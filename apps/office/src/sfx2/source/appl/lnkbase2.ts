/** @fileoverview Represented client link identity from Sfx2's lnkbase2.cxx. */
import type { SotClipboardFormatId } from "../../../sot/inc/formats";
import type { LinkManager } from "./linkmgr2";

/** The persisted update mode of a link client. */
export enum SfxLinkUpdateMode {
  NONE = 0,
  ALWAYS = 1,
  ONCALL = 3,
}

/** The native object discriminants used by file links. */
export enum SvBaseLinkObjectType {
  ClientSo = 0x80,
  ClientFile = 0x90,
}

/** Sfx2 client link registration state. */
export class SvBaseLink {
  private mnObjType = SvBaseLinkObjectType.ClientSo;
  private m_sLinkName = "";
  private m_pLinkMgr: LinkManager | undefined;

  /** Constructs a client with the original update and content types. @param mode - Update mode. @param content - Clipboard content type. @returns The initialized SvBaseLink instance. */
  constructor(
    private mode: SfxLinkUpdateMode,
    private readonly content: SotClipboardFormatId,
  ) {}

  /** Reads the native type. @returns Object type. */
  GetObjType(): SvBaseLinkObjectType {
    return this.mnObjType;
  }

  /** Reads the native update mode. @returns Update mode. */
  GetUpdateMode(): SfxLinkUpdateMode {
    return this.mode;
  }

  /** Reads the native source command. @returns Encoded file, range and filter. */
  GetLinkSourceName(): string {
    return this.m_sLinkName;
  }

  /** Borrows the manager currently holding the link. @returns Owning manager. */
  GetLinkManager(): LinkManager | undefined {
    return this.m_pLinkMgr;
  }

  /** Reports the client clipboard format. @returns Native content type. */
  GetContentType(): SotClipboardFormatId {
    return this.content;
  }

  /** Sets the native client type. @param type - Client type. @returns Nothing. */
  SetObjType(type: SvBaseLinkObjectType): void {
    this.mnObjType = type;
  }

  /** Sets the client update mode. @param mode - Persisted update mode. @returns Nothing. */
  SetUpdateMode(mode: SfxLinkUpdateMode): void {
    this.mode = mode;
  }

  /** Sets the encoded source name for the client. @param name - Encoded source. @returns Nothing. */
  SetLinkSourceName(name: string): void {
    this.m_sLinkName = name;
  }

  /** Sets the original owner backlink. @param owner - Current manager, if assigned. @returns Nothing. */
  SetLinkManager(owner: LinkManager | undefined): void {
    this.m_pLinkMgr = owner;
  }
}
