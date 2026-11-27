/** @fileoverview Implements Writer's hyperlink pool item from pinned LibreOffice `sw/source/core/txtnode/fmtatr2.cxx` and `sw/inc/fmtinfmt.hxx`. */

import * as RubyMember from "../../../../editeng/inc/memberids";
import { RubyAdjust } from "../../../../offapi/com/sun/star/text/RubyAdjust";
import * as RubyPosition from "../../../../offapi/com/sun/star/text/RubyPosition";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { CONVERT_TWIPS } from "../../../../svl/inc/poolitem";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { RES_TXTATR_CJK_RUBY } from "../../../inc/hintids";
import type { SwTextRuby } from "./txtatr2";
import {
  StylePool,
  acquireStyleHandle,
  releaseStyleHandle,
} from "../../../../svl/source/items/stylepool";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { RES_TXTATR_AUTOFMT } from "../../../inc/hintids";
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

/** SfxPoolItem wrapper around the character item set referenced by RES_TXTATR_AUTOFMT. */
export class SwFormatAutoFormat<
  TInput extends SfxItemSet | number = SfxItemSet,
> extends SfxPoolItem {
  private styleHandle: SfxItemSet | undefined;
  /** Native Which/copy constructor, retaining the established initialized-handle host binding. The generic preserves that binding's non-null handle precondition without concealing the native default's absence. @param input - Which, native copy or existing initialized handle. @param which - Which for the initialized-handle binding. @returns Actual item. */
  public constructor(
    input: TInput | SwFormatAutoFormat<TInput>,
    which: number = RES_TXTATR_AUTOFMT,
  ) {
    super(
      input instanceof SwFormatAutoFormat
        ? input.Which()
        : typeof input === "number"
          ? input & 0xffff
          : which & 0xffff,
    );
    this.setNonShareable();
    const handle =
      input instanceof SwFormatAutoFormat
        ? input.styleHandle
        : typeof input === "number"
          ? undefined
          : input;
    if (handle instanceof SfxItemSet) this.styleHandle = acquireStyleHandle(handle);
  }
  /** Borrows the native shared pointer; Which-constructed defaults may have no handle. @returns Original pointee. */
  public GetStyleHandle(): TInput extends number ? SfxItemSet | undefined : SfxItemSet {
    return this.styleHandle as TInput extends number ? SfxItemSet | undefined : SfxItemSet;
  }
  /** Original shared-pointer assignment, including reset to empty. @param handle - New borrowed pointee. @returns Nothing. */
  public SetStyleHandle(handle: TInput extends number ? SfxItemSet | undefined : SfxItemSet): void {
    const copy = handle ? acquireStyleHandle(handle) : undefined;
    if (this.styleHandle) releaseStyleHandle(this.styleHandle);
    this.styleHandle = copy;
  }
  /** Releases the actual owned pointer, including native empty defaults. @returns Nothing. */
  public override Dispose(): void {
    if (this.styleHandle) releaseStyleHandle(this.styleHandle);
  }
  /** Original independent item copy shares its handle. @returns Copy. */
  public Clone(): SwFormatAutoFormat<TInput> {
    return new SwFormatAutoFormat<TInput>(this);
  }
  /** Original base identity and shared-pointer equality. @param other - Candidate. @returns Equality. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SwFormatAutoFormat &&
      other.Which() === this.Which() &&
      other.styleHandle === this.styleHandle
    );
  }
  /** Native style-name projection at the existing host scalar boundary. @returns Native pointer-derived style name. */
  public override QueryValue(): string;
  /** Native Any receives StylePool::nameOf, not nested persistence records. @param output - Actual Any. @param member - Ignored source selector. @returns True. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original pointer-name query. @param output - Optional actual Any. @param member - Ignored source member. @returns Style name or source success. */
  public override QueryValue(output?: Any, member = 0): string | boolean {
    void member;
    const name = StylePool.nameOf(this.styleHandle);
    if (!output) return name;
    const text = new OUString(
      Uint16Array.from(
        name,
        /** Copies native UTF16 units. @param c - Character. @returns Unit. */ (c) =>
          c.charCodeAt(0),
      ),
      name.length,
    );
    try {
      output.insert([text.pData], "OUString");
    } finally {
      text.dispose();
    }
    return true;
  }
  /** Original automatic styles cannot be renamed through this item. @param value - Ignored native Any. @param member - Ignored selector. @returns False. */
  public override PutValue(value: unknown, member = 0): boolean {
    void value;
    void member;
    return false;
  }
}

/** Owns the phonetic text and style settings of a native Writer ruby range. */
export class SwFormatRuby extends SfxPoolItem {
  private readonly m_sRubyText = new OUString();
  private m_sCharFormatName = "";
  private m_nCharFormatId = SwPoolFormatId.ZERO;
  private m_nPosition = RubyPosition.ABOVE;
  private m_eAdjustment = RubyAdjust.LEFT;
  m_pTextAttr: SwTextRuby | undefined;

  /** Constructs an independent non-shareable source item. @param source - Reading text or native source item. @returns Ruby item. */
  constructor(source?: OUStringConstReference | SwFormatRuby) {
    super(RES_TXTATR_CJK_RUBY);
    this.setNonShareable();
    if (source instanceof SwFormatRuby) {
      this.m_sRubyText.assign(source.m_sRubyText);
      this.m_sCharFormatName = source.m_sCharFormatName;
      this.m_nCharFormatId = source.m_nCharFormatId;
      this.m_nPosition = source.m_nPosition;
      this.m_eAdjustment = source.m_eAdjustment;
    } else if (source !== undefined) this.m_sRubyText.assign(source);
  }

  /** Borrows the reading stored by the text attribute. @returns Native text. */
  GetText(): OUStringConstReference {
    return this.m_sRubyText;
  }

  /** Returns the native display name of the reading's character style. @returns Style name. */
  GetCharFormatName(): string {
    return this.m_sCharFormatName;
  }

  /** Sets the native reading style's display name. @param value - Original UI name. @returns Nothing. */
  SetCharFormatName(value: string): void {
    this.m_sCharFormatName = value;
  }

  /** Returns the native pool identity of the reading's character style. @returns Pool identifier. */
  GetCharFormatId(): SwPoolFormatId {
    return this.m_nCharFormatId;
  }

  /** Sets the chosen character style's original pool identifier. @param value - Native pool identifier. @returns Nothing. */
  SetCharFormatId(value: SwPoolFormatId): void {
    this.m_nCharFormatId = value;
  }

  /** Returns the native ruby position. @returns Position value. */
  GetPosition(): number {
    return this.m_nPosition;
  }

  /** Sets the native unsigned16 ruby position. @param value - Original position. @returns Nothing. */
  SetPosition(value: number): void {
    this.m_nPosition = value & 0xffff;
  }

  /** Returns the native ruby adjustment. @returns Adjustment value. */
  GetAdjustment(): RubyAdjust {
    return this.m_eAdjustment;
  }

  /** Sets the independent ruby adjustment. @param value - Original adjustment. @returns Nothing. */
  SetAdjustment(value: RubyAdjust): void {
    this.m_eAdjustment = value;
  }

  /** Copies this item without its text-node backlink. @returns Detached ruby item. */
  override Clone(): SwFormatRuby {
    return new SwFormatRuby(this);
  }

  /** Compares the original properties independently from the attached text position. @param other - Item to compare. @returns Equality. */
  override equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SwFormatRuby &&
      this.m_sRubyText.equals(other.m_sRubyText) &&
      this.m_sCharFormatName === other.m_sCharFormatName &&
      this.m_nCharFormatId === other.m_nCharFormatId &&
      this.m_nPosition === other.m_nPosition &&
      this.m_eAdjustment === other.m_eAdjustment
    );
  }

  /** Returns the original UNO member with the native scalar width and style name. @param result - Destination Any. @param member - Original member identifier. @returns Whether the member is represented. */
  override QueryValue(): string;
  override QueryValue(result: Any, member?: number): boolean;
  override QueryValue(result?: Any, member = RubyMember.MID_RUBY_TEXT): string | boolean {
    if (result === undefined) return text(this.m_sRubyText);
    switch (member & ~CONVERT_TWIPS) {
      case RubyMember.MID_RUBY_TEXT:
        result.insert(this.m_sRubyText, "OUString");
        return true;
      case RubyMember.MID_RUBY_ADJUST:
        result.insert([this.m_eAdjustment], "sal_Int16");
        return true;
      case RubyMember.MID_RUBY_POSITION:
        result.insert([this.m_nPosition], "sal_Int16");
        return true;
      case RubyMember.MID_RUBY_ABOVE:
        result.insert([this.m_nPosition === RubyPosition.ABOVE], "bool");
        return true;
      case RubyMember.MID_RUBY_CHARSTYLE: {
        const value = unicode(
          SwStyleNameMapper.FillProgName(this.m_sCharFormatName, SwGetPoolIdFromName.ChrFmt),
        );
        try {
          result.insert(value, "OUString");
        } finally {
          value.dispose();
        }
        return true;
      }
      default:
        return false;
    }
  }

  /** Writes the original UNO member and preserves its extraction behavior. @param value - Borrowed native Any. @param member - Original member identifier. @returns Whether accepted. */
  override PutValue(value: Any, member: number): boolean {
    switch (member & ~CONVERT_TWIPS) {
      case RubyMember.MID_RUBY_TEXT:
        return value.extract(this.m_sRubyText, "OUString");
      case RubyMember.MID_RUBY_ADJUST: {
        const adjustment: [number] = [0];
        value.extract(adjustment, "sal_Int16");
        if (adjustment[0] < RubyAdjust.LEFT || adjustment[0] > RubyAdjust.INDENT_BLOCK)
          return false;
        this.m_eAdjustment = adjustment[0];
        return true;
      }
      case RubyMember.MID_RUBY_POSITION: {
        const position: [number] = [0];
        value.extract(position, "sal_Int16");
        if (position[0] < RubyPosition.ABOVE || position[0] > RubyPosition.INTER_CHARACTER)
          return false;
        this.m_nPosition = position[0];
        return true;
      }
      case RubyMember.MID_RUBY_ABOVE: {
        const above: [boolean] = [false];
        if (value.extract(above, "bool"))
          this.m_nPosition = above[0] ? RubyPosition.ABOVE : RubyPosition.BELOW;
        return true;
      }
      case RubyMember.MID_RUBY_CHARSTYLE: {
        const name = new OUString();
        try {
          if (!value.extract(name, "OUString")) return false;
          this.m_sCharFormatName = SwStyleNameMapper.GetUIName(
            text(name),
            SwGetPoolIdFromName.ChrFmt,
          );
          return true;
        } finally {
          name.dispose();
        }
      }
      default:
        return false;
    }
  }

  /** Releases the actual owned reading string. @returns Nothing. */
  override Dispose(): void {
    this.m_sRubyText.dispose();
    super.Dispose();
  }
}
