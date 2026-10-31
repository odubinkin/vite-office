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
