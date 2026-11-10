/** @fileoverview Original EECharAttrib span and EENotify value/ordinal contracts from editdata.hxx; no engine observer or view is fabricated. */
import type { SfxPoolItem } from "../../svl/source/items/poolitem";
/** Original independent signed32 span with a borrowed const item pointer. */
export class EECharAttrib {
  public nStart: number;
  public nEnd: number;
  /** Original span/pointer constructor. @param start - Signed32 start. @param end - Signed32 end. @param pAttr - Borrowed actual item. @returns Value. */
  constructor(
    start: number,
    end: number,
    public pAttr: SfxPoolItem | null = null,
  ) {
    this.nStart = start | 0;
    this.nEnd = end | 0;
  }
}

import { EE_PARA_MAX } from "./EPaM";
/** Original unscoped EditEngine notification ordinals. */
export enum EENotifyType {
  EE_NOTIFY_TEXTMODIFIED,
  EE_NOTIFY_PARAGRAPHINSERTED,
  EE_NOTIFY_PARAGRAPHREMOVED,
  EE_NOTIFY_PARAGRAPHSMOVED,
  EE_NOTIFY_TextHeightChanged,
  EE_NOTIFY_TEXTVIEWSCROLLED,
  EE_NOTIFY_TEXTVIEWSELECTIONCHANGED,
  EE_NOTIFY_PROCESSNOTIFICATIONS,
  EE_NOTIFY_TEXTVIEWSELECTIONCHANGED_ENDD_PARA,
}
/** Original notification value, with independent per-call paragraph/parameter defaults. */
export class EENotify {
  public eNotificationType: EENotifyType;
  public nParagraph = EE_PARA_MAX;
  public nParam1 = 0;
  public nParam2 = 0;
  /** Original notification-type and implicit-copy construction. @param source - Source type or copied value. @returns Notification. */
  constructor(source: EENotifyType | EENotify) {
    this.eNotificationType = source instanceof EENotify ? source.eNotificationType : source;
    if (source instanceof EENotify) this.assign(source);
  }
  /** Original implicit fieldwise assignment. @param source - Borrowed value. @returns This value. */
  assign(source: EENotify): this {
    this.eNotificationType = source.eNotificationType;
    this.nParagraph = source.nParagraph;
    this.nParam1 = source.nParam1;
    this.nParam2 = source.nParam2;
    return this;
  }
}

/** Original unscoped notification enumerator. */
export const EE_NOTIFY_TEXTMODIFIED = EENotifyType.EE_NOTIFY_TEXTMODIFIED;
/** Original unscoped notification enumerator. */
export const EE_NOTIFY_PARAGRAPHINSERTED = EENotifyType.EE_NOTIFY_PARAGRAPHINSERTED;
/** Original unscoped notification enumerator. */
export const EE_NOTIFY_PARAGRAPHREMOVED = EENotifyType.EE_NOTIFY_PARAGRAPHREMOVED;
/** Original unscoped notification enumerator. */
export const EE_NOTIFY_PARAGRAPHSMOVED = EENotifyType.EE_NOTIFY_PARAGRAPHSMOVED;
/** Original unscoped notification enumerator. */
export const EE_NOTIFY_TextHeightChanged = EENotifyType.EE_NOTIFY_TextHeightChanged;
/** Original unscoped notification enumerator. */
export const EE_NOTIFY_TEXTVIEWSCROLLED = EENotifyType.EE_NOTIFY_TEXTVIEWSCROLLED;
/** Original unscoped notification enumerator. */
export const EE_NOTIFY_TEXTVIEWSELECTIONCHANGED = EENotifyType.EE_NOTIFY_TEXTVIEWSELECTIONCHANGED;
/** Original unscoped notification enumerator. */
export const EE_NOTIFY_PROCESSNOTIFICATIONS = EENotifyType.EE_NOTIFY_PROCESSNOTIFICATIONS;
/** Original unscoped notification enumerator. */
export const EE_NOTIFY_TEXTVIEWSELECTIONCHANGED_ENDD_PARA =
  EENotifyType.EE_NOTIFY_TEXTVIEWSELECTIONCHANGED_ENDD_PARA;

/** Original undo identifier for paragraph splitting. */
export const EDITUNDO_SPLITPARA = 105;
/** Original undo identifier for inserted characters. */
export const EDITUNDO_INSERTCHARS = 106;
/** Original compound text-insertion undo identifier. */
export const EDITUNDO_INSERT = 111;

/** Original removechars action identifier. */
export const EDITUNDO_REMOVECHARS = 100;
/** Original connectparas action identifier. */
export const EDITUNDO_CONNECTPARAS = 101;
/** Original moveparagraphs action identifier. */
export const EDITUNDO_MOVEPARAGRAPHS = 103;
/** Original insertfeature action identifier. */
export const EDITUNDO_INSERTFEATURE = 104;
/** Original delcontent action identifier. */
export const EDITUNDO_DELCONTENT = 107;
/** Original delete action identifier. */
export const EDITUNDO_DELETE = 108;
/** Original cut action identifier. */
export const EDITUNDO_CUT = 109;
/** Original paste action identifier. */
export const EDITUNDO_PASTE = 110;
/** Original moveparas action identifier. */
export const EDITUNDO_MOVEPARAS = 113;
/** Original paraattribs action identifier. */
export const EDITUNDO_PARAATTRIBS = 114;
/** Original attribs action identifier. */
export const EDITUNDO_ATTRIBS = 115;
/** Original draganddrop action identifier. */
export const EDITUNDO_DRAGANDDROP = 116;
/** Original read action identifier. */
export const EDITUNDO_READ = 117;
/** Original stylesheet action identifier. */
export const EDITUNDO_STYLESHEET = 118;
/** Original replaceall action identifier. */
export const EDITUNDO_REPLACEALL = 119;
/** Original resetattribs action identifier. */
export const EDITUNDO_RESETATTRIBS = 121;
/** Original indentblock action identifier. */
export const EDITUNDO_INDENTBLOCK = 122;
/** Original unindentblock action identifier. */
export const EDITUNDO_UNINDENTBLOCK = 123;
/** Original transliterate action identifier. */
export const EDITUNDO_TRANSLITERATE = 125;

/** Original default horizontal paragraph direction selector. */
export enum EEHorizontalTextDirection {
  Default,
  L2R,
  R2L,
}
/** Original mutable four-double scaling aggregate. */
export class ScalingParameters {
  fFontX = 1.0;
  fFontY = 1.0;
  fSpacingX = 1.0;
  fSpacingY = 1.0;
  /** Original default/implicit-copy construction. @param source - Optional original value. @returns Aggregate. */
  constructor(source?: ScalingParametersConstReference) {
    if (source !== undefined) this.assign(source);
  }
  /** Original implicit fieldwise assignment. @param source - Original value. @returns Receiver. */
  assign(source: ScalingParametersConstReference): this {
    this.fFontX = source.fFontX;
    this.fFontY = source.fFontY;
    this.fSpacingX = source.fSpacingX;
    this.fSpacingY = source.fSpacingY;
    return this;
  }
  /** Original defaulted double equality, including NaN inequality. @param other - Original aggregate. @returns Equality. */
  equals(other: ScalingParametersConstReference): boolean {
    return (
      this.fFontX === other.fFontX &&
      this.fFontY === other.fFontY &&
      this.fSpacingX === other.fSpacingX &&
      this.fSpacingY === other.fSpacingY
    );
  }
  /** Original exact four-value default test. @returns Default predicate. */
  areValuesDefault(): boolean {
    return this.fFontX === 1 && this.fFontY === 1 && this.fSpacingX === 1 && this.fSpacingY === 1;
  }
}

/** Original const ScalingParameters reference excludes native nonconst assignment/default-query methods. */
export type ScalingParametersConstReference = Readonly<
  Pick<ScalingParameters, "fFontX" | "fFontY" | "fSpacingX" | "fSpacingY" | "equals">
>;
