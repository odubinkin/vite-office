/** @fileoverview Implements Writer's hyperlink pool item from pinned LibreOffice `sw/source/core/txtnode/fmtatr2.cxx` and `sw/inc/fmtinfmt.hxx`. */

import type { SwTextINetFormat } from "./txtatr2";
import { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { RES_TXTATR_INETFMT } from "../../../inc/hintids";

/** Supported hyperlink metadata retained by the bounded Writer model and ODF filter. */
export interface WriterHyperlink {
  readonly name?: string;
  readonly targetFrame?: string;
  readonly url: string;
  readonly styleName?: string;
  readonly visitedStyleName?: string;
}

/** Normalizes a hyperlink boundary value, rejecting blank destinations. @param candidate - Unknown hyperlink value. @returns Canonical hyperlink or undefined. */
export function normalizeWriterHyperlink(candidate: unknown): WriterHyperlink | undefined {
  if (typeof candidate !== "object" || candidate === null || Array.isArray(candidate))
    return undefined;
  const value = candidate as Record<string, unknown>;
  if (typeof value.url !== "string" || value.url.length === 0) return undefined;
  return {
    ...(typeof value.name === "string" && value.name.length > 0 ? { name: value.name } : {}),
    ...(typeof value.targetFrame === "string" && value.targetFrame.length > 0
      ? { targetFrame: value.targetFrame }
      : {}),
    url: value.url,
    ...(typeof value.styleName === "string" && value.styleName.length > 0
      ? { styleName: value.styleName }
      : {}),
    ...(typeof value.visitedStyleName === "string" && value.visitedStyleName.length > 0
      ? { visitedStyleName: value.visitedStyleName }
      : {}),
  };
}

/** Compares two normalized hyperlink values. @param left - First hyperlink. @param right - Second hyperlink. @returns Whether all supported metadata matches. */
export function equalWriterHyperlinks(
  left: WriterHyperlink | undefined,
  right: WriterHyperlink | undefined,
): boolean {
  return (
    left?.url === right?.url &&
    left?.name === right?.name &&
    left?.targetFrame === right?.targetFrame &&
    left?.styleName === right?.styleName &&
    left?.visitedStyleName === right?.visitedStyleName
  );
}

/** Writer pool item backing one `RES_TXTATR_INETFMT` range. */
export class SwFormatINetFormat extends SfxPoolItem {
  private readonly msURL: string;
  private readonly msTargetFrame: string;
  private readonly msINetFormatName: string;
  private readonly msVisitedFormatName: string;
  private msHyperlinkName: string;
  /** Internal friend-access backlink assigned by the concrete internet attribute. */
  public mpTextAttr: SwTextINetFormat | undefined;

  /** Returns the concrete text attribute owning this item. @returns Attribute if bound. */
  public GetTextINetFormat(): SwTextINetFormat | undefined {
    return this.mpTextAttr;
  }

  /** Creates native zero/copy values or ingests the existing portable metadata boundary. @param hyperlink - Copied native item or projected strings. @returns Nothing. */
  public constructor(hyperlink: WriterHyperlink | SwFormatINetFormat = { url: "" }) {
    super(RES_TXTATR_INETFMT);
    this.setNonShareable();
    if (hyperlink instanceof SwFormatINetFormat) {
      this.msURL = hyperlink.msURL;
      this.msTargetFrame = hyperlink.msTargetFrame;
      this.msINetFormatName = hyperlink.msINetFormatName;
      this.msVisitedFormatName = hyperlink.msVisitedFormatName;
      this.msHyperlinkName = hyperlink.msHyperlinkName;
    } else {
      this.msURL = hyperlink.url;
      this.msTargetFrame = hyperlink.targetFrame ?? "";
      this.msINetFormatName = hyperlink.styleName ?? "";
      this.msVisitedFormatName = hyperlink.visitedStyleName ?? "";
      this.msHyperlinkName = hyperlink.name ?? "";
    }
  }

  /** Creates the native type-info default item. @returns Empty non-shareable item. */
  public static CreateDefault(): SwFormatINetFormat {
    return new SwFormatINetFormat();
  }

  /** Returns the native link name. @returns Owned string. */
  public GetName(): string {
    return this.msHyperlinkName;
  }

  /** Sets the native link name without changing the text-attribute backlink. @param name - New owned string. @returns Nothing. */
  public SetName(name: string): void {
    this.msHyperlinkName = name;
  }

  /** Returns the native target frame. @returns Owned string. */
  public GetTargetFrame(): string {
    return this.msTargetFrame;
  }

  /** Returns the normal character-format name. @returns Owned string. */
  public GetINetFormat(): string {
    return this.msINetFormatName;
  }

  /** Returns the visited character-format name. @returns Owned string. */
  public GetVisitedFormat(): string {
    return this.msVisitedFormatName;
  }

  /** Returns independent hyperlink metadata. @returns Hyperlink value. */
  public GetHyperlink(): WriterHyperlink {
    return {
      url: this.msURL,
      ...(this.msHyperlinkName.length > 0 ? { name: this.msHyperlinkName } : {}),
      ...(this.msTargetFrame.length > 0 ? { targetFrame: this.msTargetFrame } : {}),
      ...(this.msINetFormatName.length > 0 ? { styleName: this.msINetFormatName } : {}),
      ...(this.msVisitedFormatName.length > 0
        ? { visitedStyleName: this.msVisitedFormatName }
        : {}),
    };
  }

  /** Returns the stored destination. @returns URL string. */
  public GetValue(): string {
    return this.msURL;
  }

  /** Creates an independent hyperlink item. @returns Cloned item. */
  public Clone(): SwFormatINetFormat {
    return new SwFormatINetFormat(this);
  }

  /** Compares all supported hyperlink metadata. @param other - Candidate pool item. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SwFormatINetFormat &&
      other.msURL === this.msURL &&
      other.msHyperlinkName === this.msHyperlinkName &&
      other.msTargetFrame === this.msTargetFrame &&
      other.msINetFormatName === this.msINetFormatName &&
      other.msVisitedFormatName === this.msVisitedFormatName
    );
  }

  /** Exposes the bounded hyperlink value for filter/persistence codecs. @returns JSON value. */
  public QueryValue(): string {
    return JSON.stringify(this.GetHyperlink());
  }
}
