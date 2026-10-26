/** @fileoverview Implements Writer's hyperlink pool item from pinned LibreOffice `sw/source/core/txtnode/fmtatr2.cxx` and `sw/inc/fmtinfmt.hxx`. */

import type { SwTextCharFormat } from "./txtatr2";
import type { SwCharFormat } from "../../../inc/charfmt";
import type { SwModelHint } from "../../../inc/hints";
import { SwGetPoolIdFromName } from "../../../inc/SwGetPoolIdFromName";
import { SvtListener, type SvtDyingHint } from "../../../../svl/source/notify/listener";
import { RES_TXTATR_CHARFMT } from "../../../inc/hintids";
import type { SwTextINetFormat } from "./txtatr2";
import { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { RES_TXTATR_INETFMT } from "../../../inc/hintids";
import { SwPoolFormatId } from "../../../inc/poolfmt";
import { SwStyleNameMapper } from "../doc/SwStyleNameMapper";

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
  private msINetFormatName: string;
  private msVisitedFormatName: string;
  private msHyperlinkName: string;
  private mnINetFormatId = SwPoolFormatId.ZERO;
  private mnVisitedFormatId = SwPoolFormatId.ZERO;
  /** Internal friend-access backlink assigned by the concrete internet attribute. */
  public mpTextAttr: SwTextINetFormat | undefined;

  /** Returns the concrete text attribute owning this item. @returns Attribute if bound. */
  public GetTextINetFormat(): SwTextINetFormat | undefined {
    return this.mpTextAttr;
  }

  /** Creates native zero, URL/target or copy values, or ingests the existing portable metadata boundary. @param hyperlink - Native URL, copied item or projected strings. @param targetFrame - Native URL constructor target. @returns Nothing. */
  public constructor(
    hyperlink: string | WriterHyperlink | SwFormatINetFormat = { url: "" },
    targetFrame = "",
  ) {
    super(RES_TXTATR_INETFMT);
    this.setNonShareable();
    if (hyperlink instanceof SwFormatINetFormat) {
      this.msURL = hyperlink.msURL;
      this.msTargetFrame = hyperlink.msTargetFrame;
      this.msINetFormatName = hyperlink.msINetFormatName;
      this.msVisitedFormatName = hyperlink.msVisitedFormatName;
      this.msHyperlinkName = hyperlink.msHyperlinkName;
      this.mnINetFormatId = hyperlink.mnINetFormatId;
      this.mnVisitedFormatId = hyperlink.mnVisitedFormatId;
    } else if (typeof hyperlink === "string") {
      this.msURL = hyperlink;
      this.msTargetFrame = targetFrame;
      this.msHyperlinkName = "";
      this.mnINetFormatId = SwPoolFormatId.CHR_INET_NORMAL;
      this.mnVisitedFormatId = SwPoolFormatId.CHR_INET_VISIT;
      this.msINetFormatName = SwStyleNameMapper.GetUIName(this.mnINetFormatId, "");
      this.msVisitedFormatName = SwStyleNameMapper.GetUIName(this.mnVisitedFormatId, "");
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

  /** Returns the native normal-style pool identity. @returns Pool ID. */
  public GetINetFormatId(): SwPoolFormatId {
    return this.mnINetFormatId;
  }

  /** Returns the native visited-style pool identity. @returns Pool ID. */
  public GetVisitedFormatId(): SwPoolFormatId {
    return this.mnVisitedFormatId;
  }

  /** Sets normal-style name and identity independently of visited style and backlink. @param name - UI style name. @param id - Native pool ID. @returns Nothing. */
  public SetINetFormatAndId(name: string, id: SwPoolFormatId): void {
    this.msINetFormatName = name;
    this.mnINetFormatId = id;
  }

  /** Sets visited-style name and identity independently of normal style and backlink. @param name - UI style name. @param id - Native pool ID. @returns Nothing. */
  public SetVisitedFormatAndId(name: string, id: SwPoolFormatId): void {
    this.msVisitedFormatName = name;
    this.mnVisitedFormatId = id;
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
      other.msVisitedFormatName === this.msVisitedFormatName &&
      other.mnINetFormatId === this.mnINetFormatId &&
      other.mnVisitedFormatId === this.mnVisitedFormatId
    );
  }

  /** Exposes the bounded hyperlink value for filter/persistence codecs. @returns JSON value. */
  public override QueryValue(): string {
    return JSON.stringify(this.GetHyperlink());
  }
}

/** Original non-shareable character-format reference and synchronous notifier forwarding. */
export class SwFormatCharFormat extends SfxPoolItem {
  /** Internal native item-to-text-attribute backlink; copies start unbound. */
  public m_pTextAttribute: SwTextCharFormat | undefined;
  private m_pCharFormat: SwCharFormat | undefined;
  private readonly listener: CharacterFormatListener;
  /** Borrows an actual style or copies the reference without the text backlink. @param format - Native style/copy source. @returns Item. */
  constructor(format?: SwCharFormat | SwFormatCharFormat) {
    super(RES_TXTATR_CHARFMT);
    this.setNonShareable();
    this.m_pCharFormat = format instanceof SwFormatCharFormat ? format.GetCharFormat() : format;
    this.listener = new CharacterFormatListener(this);
    if (this.m_pCharFormat !== undefined)
      this.listener.StartListening(this.m_pCharFormat.GetNotifier());
    characterFormatFinalizers.register(this, new WeakRef(this.listener));
  }
  /** Returns the borrowed native character owner. @returns Style or undefined. */
  GetCharFormat(): SwCharFormat | undefined {
    return this.m_pCharFormat;
  }
  /** Copies native pointer identity with a fresh notifier receiver. @returns Non-shareable item. */
  Clone(): SwFormatCharFormat {
    return new SwFormatCharFormat(this);
  }
  /** Compares actual style identity independently of native backlinks. @param other - Candidate item. @returns Equality. */
  equals(other: SfxPoolItem): boolean {
    return other instanceof SwFormatCharFormat && other.m_pCharFormat === this.m_pCharFormat;
  }
  /** Forwards represented native hints; unbound items retain the source early return before death clearing. @param hint - Original notification. @returns Nothing. */
  Notify(hint: SwModelHint): void {
    if (this.m_pTextAttribute === undefined) return;
    switch (hint.kind) {
      case "format-change":
      case "attr-set-change":
      case "legacy-modify":
        this.m_pTextAttribute.TriggerNodeUpdate(hint);
        break;
      case "object-dying":
        this.m_pTextAttribute.TriggerNodeUpdate(hint);
        this.m_pCharFormat = undefined;
        break;
    }
  }
  /** Exposes the native programmatic character name through the existing primitive value boundary. @returns Programmatic name. */
  override QueryValue(): string {
    return this.m_pCharFormat === undefined
      ? ""
      : SwStyleNameMapper.FillProgName(this.m_pCharFormat.GetName(), SwGetPoolIdFromName.ChrFmt);
  }
  /** Native assignment through UNO is intentionally unsupported. @returns False. */
  override PutValue(): false {
    return false;
  }
}
/** JS GC binding for native multiple inheritance: the broadcaster borrows the item without extending its lifetime. */
class CharacterFormatListener extends SvtListener<SwModelHint> {
  private readonly owner: WeakRef<SwFormatCharFormat>;
  /** Borrows the actual item. @param owner - Native item. @returns Receiver. */
  constructor(owner: SwFormatCharFormat) {
    super();
    this.owner = new WeakRef(owner);
  }
  /** Delivers original synchronous hints; broadcaster teardown is handled by SvtListener itself. @param hint - Original hint. @returns Nothing. */
  override Notify(hint: SwModelHint | SvtDyingHint): void {
    if (hint.kind !== "dying") this.owner.deref()?.Notify(hint);
  }
}
/** Native item destruction's listener detach follows actual JS collection; no refcount/address state is emulated. */
const characterFormatFinalizers = new FinalizationRegistry<WeakRef<SvtListener<SwModelHint>>>(
  /** Ends registrations when the actual item becomes unreachable. @param listener - Native receiver. @returns Nothing. */
  (listener) => listener.deref()?.Dispose(),
);
