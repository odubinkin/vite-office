/** @fileoverview Implements Writer's hyperlink pool item from pinned LibreOffice `sw/source/core/txtnode/fmtatr2.cxx` and `sw/inc/fmtinfmt.hxx`. */

import { SfxPoolItem, type SfxPoolItemSnapshot } from "../../../../svl/source/items/poolitem";
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
  /** Creates one hyperlink value. @param hyperlink - Canonical hyperlink metadata. @returns Nothing. */
  public constructor(private readonly hyperlink: WriterHyperlink) {
    super(RES_TXTATR_INETFMT);
    if (hyperlink.url.length === 0) throw new Error("Writer hyperlink URL must not be empty.");
  }

  /** Returns independent hyperlink metadata. @returns Hyperlink value. */
  public GetHyperlink(): WriterHyperlink {
    return { ...this.hyperlink };
  }

  /** Returns the stored destination. @returns URL string. */
  public GetValue(): string {
    return this.hyperlink.url;
  }

  /** Creates an independent hyperlink item. @returns Cloned item. */
  public Clone(): SwFormatINetFormat {
    return new SwFormatINetFormat(this.GetHyperlink());
  }

  /** Compares all supported hyperlink metadata. @param other - Candidate pool item. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SwFormatINetFormat && equalWriterHyperlinks(other.hyperlink, this.hyperlink)
    );
  }

  /** Serializes the hyperlink as a JSON string accepted by the shared pool snapshot contract. @returns Snapshot. */
  public toSnapshot(): SfxPoolItemSnapshot {
    return {
      type: "SwFormatINetFormat",
      value: JSON.stringify(this.hyperlink),
      which: RES_TXTATR_INETFMT,
    };
  }
}

/** Restores a hyperlink item from a persisted snapshot. @param snapshot - Candidate snapshot. @returns Restored item. */
export function restoreSwFormatINetFormat(snapshot: SfxPoolItemSnapshot): SwFormatINetFormat {
  if (
    snapshot.which !== RES_TXTATR_INETFMT ||
    snapshot.type !== "SwFormatINetFormat" ||
    typeof snapshot.value !== "string"
  )
    throw new Error("SwFormatINetFormat snapshot is invalid.");
  let parsed: unknown;
  try {
    parsed = JSON.parse(snapshot.value);
  } catch {
    throw new Error("SwFormatINetFormat snapshot is invalid.");
  }
  const hyperlink = normalizeWriterHyperlink(parsed);
  if (hyperlink === undefined) throw new Error("SwFormatINetFormat snapshot is invalid.");
  return new SwFormatINetFormat(hyperlink);
}
