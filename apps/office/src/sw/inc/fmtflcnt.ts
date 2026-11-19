/** @fileoverview Native non-shareable format item for an as-character fly. */
import { SfxPoolItem } from "../../svl/source/items/poolitem";
import type { SwFrameFormat } from "../source/core/layout/atrfrm";
import type { SwTextFlyCnt } from "./txtflcnt";
import { RES_TXTATR_FLYCNT } from "./hintids";

/** The point item borrows the fly format and its owning text hint. */
export class SwFormatFlyCnt extends SfxPoolItem {
  private m_pTextAttr: SwTextFlyCnt | null = null;

  /** Creates a format item with no owning text hint. @param m_pFormat - Borrowed native format or null. @returns Item. */
  constructor(private m_pFormat: SwFrameFormat | null) {
    super(RES_TXTATR_FLYCNT);
    this.setNonShareable();
  }

  /** Returns the linked Writer fly or draw format. @returns Native format or null. */
  GetFrameFormat(): SwFrameFormat | null {
    return this.m_pFormat;
  }

  /** Replaces the borrowed format link. Undo can remove the link while holding the object. @param format - Replacement format or null. @returns Nothing. */
  SetFlyFormat(format: SwFrameFormat | null = null): void {
    this.m_pFormat = format;
  }

  /** Returns the owning text hint. @returns Text hint or null. */
  GetTextFlyCnt(): SwTextFlyCnt | null {
    return this.m_pTextAttr;
  }

  /** Binds the non-shareable item to the native text hint constructed with it. @param hint - Owner. @returns Nothing. */
  SetTextFlyCnt(hint: SwTextFlyCnt): void {
    this.m_pTextAttr = hint;
  }

  /** Compares linked format identity and live text offsets only when both items are attached. @param other - Compared pool item. @returns Whether the native payloads match. */
  override equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SwFormatFlyCnt &&
      this.m_pTextAttr !== null &&
      other.m_pTextAttr !== null &&
      this.m_pTextAttr.GetStart() === other.m_pTextAttr.GetStart() &&
      this.m_pFormat === other.m_pFormat
    );
  }

  /** Copies the format link with a fresh text-owner backlink, as in the native Clone. @returns Detached item. */
  override Clone(): SwFormatFlyCnt {
    return new SwFormatFlyCnt(this.m_pFormat);
  }
}
