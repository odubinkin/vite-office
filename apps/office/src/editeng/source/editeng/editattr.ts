/** @fileoverview Original EditCharAttrib pooled-item/range owner and concrete attribute constructor/value groups. Device-dependent SetFont rendering remains outside this consumed group. */
import { SfxPoolItemHolder } from "../../../svl/source/items/itemset";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import type { SfxPoolItem } from "../../../svl/source/items/poolitem";
import * as EE from "../../inc/eeitem";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { Color } from "../../../tools/inc/color";
import type { FontLineStyle } from "../../../tools/inc/fontenum";
import { EE_ITEMS_START, EE_ITEMS_END, EE_FEATURE_START, EE_FEATURE_END } from "../../inc/eeitem";
/** Original feature marker, independent of the actual tab/line-break attribute Which. */
export const CH_FEATURE = 0x0001;
/** Binds a mutable optional Color lvalue while retaining C++ value assignment on replacement. @returns Stable slot whose assigned Color is copied into the owner. */
function optionalColorLvalue(): [Color | null] {
  let value: Color | null = null;
  const slot: [Color | null] = [null];
  Object.defineProperty(slot, 0, {
    /** Borrows the actual optional value. @returns Owned color or absence. */
    get(): Color | null {
      return value;
    },
    /** Original optional value assignment copies the incoming color. @param incoming - Borrowed assigned value. @returns Nothing. */
    set(incoming: Color | null): void {
      value = incoming === null ? null : new Color(incoming);
    },
  });
  return slot;
}
/** Original common attribute owner; mutable scalar cells bind C++ lvalues without copying the attribute. */
export class EditCharAttrib {
  private readonly maItemHolder: SfxPoolItemHolder;
  private readonly nStart: [number];
  private readonly nEnd: [number];
  private bFeature = false;
  private bEdge = false;
  private bExpandable = true;
  /** Original item retention, independent endpoints and source constructor assertions. @param pool - Actual pool. @param item - Borrowed source item. @param start - Source start. @param end - Source end. @returns Attribute owner. */
  constructor(pool: SfxItemPool, item: SfxPoolItem, start: number, end: number) {
    this.maItemHolder = new SfxPoolItemHolder(pool, item);
    this.nStart = [start];
    this.nEnd = [end];
    if (
      !(item.Which() >= EE_ITEMS_START && item.Which() <= EE_ITEMS_END) ||
      !(item.Which() < EE_FEATURE_START || item.Which() > EE_FEATURE_END || end === start + 1)
    ) {
      this.maItemHolder.Dispose();
      throw new Error("EditCharAttrib source constructor assertion");
    }
  }
  /** Original empty destructor implicitly destroys the actual item-holder member. @returns Nothing. */
  dispose(): void {
    this.maItemHolder.Dispose();
  }
  /** Original borrowed holder. @returns Actual owner association. */
  GetHolder(): SfxPoolItemHolder {
    return this.maItemHolder;
  }
  /** Original borrowed item pointer. @returns Actual pooled item or null. */
  GetItem(): SfxPoolItem | null {
    return this.maItemHolder.getItem();
  }
  /** Original item ID or zero for an absent holder. @returns Original Which. */
  Which(): number {
    return this.GetItem()?.Which() ?? 0;
  }
  /** Original const start. @returns Scalar. */
  GetStart(): number;
  /** Original mutable start lvalue. @param mutable - Erased mutable overload. @returns Stable scalar cell. */
  GetStart(mutable: true): [number];
  /** Binds original scalar/reference overload selection. @param mutable - Mutable selector. @returns Scalar or original cell. */
  GetStart(mutable?: true): number | [number] {
    return mutable ? this.nStart : this.nStart[0];
  }
  /** Original const end. @returns Scalar. */
  GetEnd(): number;
  /** Original mutable end lvalue. @param mutable - Erased mutable overload. @returns Stable scalar cell. */
  GetEnd(mutable: true): [number];
  /** Binds original scalar/reference overload selection. @param mutable - Mutable selector. @returns Scalar or original cell. */
  GetEnd(mutable?: true): number | [number] {
    return mutable ? this.nEnd : this.nEnd[0];
  }
  /** Original endpoint difference in its defined signed32 domain. @returns Length. */
  GetLen(): number {
    return this.nEnd[0] - this.nStart[0];
  }
  /** Original forward range translation. @param difference - Source increment. @returns Nothing. */
  MoveForward(difference: number): void {
    this.nStart[0] += difference;
    this.nEnd[0] += difference;
  }
  /** Original backward range translation. @param difference - Source decrement. @returns Nothing. */
  MoveBackward(difference: number): void {
    this.nStart[0] -= difference;
    this.nEnd[0] -= difference;
  }
  /** Original end-only expansion. @param difference - Source increment. @returns Nothing. */
  Expand(difference: number): void {
    this.nEnd[0] += difference;
  }
  /** Original end-only collapse, retaining source spelling. @param difference - Source decrement. @returns Nothing. */
  Collaps(difference: number): void {
    this.nEnd[0] -= difference;
  }
  /** Original closed interval predicate. @param position - Source index. @returns Membership. */
  IsIn(position: number): boolean {
    return this.nStart[0] <= position && this.nEnd[0] >= position;
  }
  /** Original half-open predicate. @param position - Source index. @returns Membership. */
  IsInLeftClosedRightOpen(position: number): boolean {
    return this.nStart[0] <= position && this.nEnd[0] > position;
  }
  /** Original open interval predicate. @param position - Source index. @returns Membership. */
  IsInside(position: number): boolean {
    return this.nStart[0] < position && this.nEnd[0] > position;
  }
  /** Original empty-range predicate. @returns Equal endpoints. */
  IsEmpty(): boolean {
    return this.nStart[0] === this.nEnd[0];
  }
  /** Original feature flag. @returns Flag. */
  IsFeature(): boolean {
    return this.bFeature;
  }
  /** Original feature flag assignment. @param value - Source flag. @returns Nothing. */
  SetFeature(value: boolean): void {
    this.bFeature = value;
  }
  /** Original edge flag. @returns Flag. */
  IsEdge(): boolean {
    return this.bEdge;
  }
  /** Original edge flag assignment. @param value - Source flag. @returns Nothing. */
  SetEdge(value: boolean): void {
    this.bEdge = value;
  }
  /** Original features-never-expand conjunction. @returns Predicate. */
  IsExpandable(): boolean {
    return !this.bFeature && this.bExpandable;
  }
  /** Original independent expandable flag. @param value - Source flag. @returns Nothing. */
  SetExpandable(value: boolean): void {
    this.bExpandable = value;
  }
}
/** Original one-unit tab feature; it is never an expandable ordinary character range. */
export class EditCharAttribTab extends EditCharAttrib {
  /** Original base construction followed by feature marking. @param pool - Actual pool. @param item - Actual tab item. @param position - Source position. @returns Feature owner. */
  constructor(pool: SfxItemPool, item: SfxPoolItem, position: number) {
    super(pool, item, position, position + 1);
    this.SetFeature(true);
  }
}
/** Original one-unit soft line-break feature. Paragraph breaks remain an EditDoc operation. */
export class EditCharAttribLineBreak extends EditCharAttrib {
  /** Original base construction followed by feature marking. @param pool - Actual pool. @param item - Actual line-break item. @param position - Source position. @returns Feature owner. */
  constructor(pool: SfxItemPool, item: SfxPoolItem, position: number) {
    super(pool, item, position, position + 1);
    this.SetFeature(true);
  }
}

/** Original EditCharAttribFont pooled range constructor; device rendering is a separate unported member group. */
export class EditCharAttribFont extends EditCharAttrib {
  /** Original base range and Which assertion. @param pool - Actual item pool. @param item - Borrowed source item. @param start - Source start. @param end - Source end. @returns Actual range owner. */
  constructor(pool: SfxItemPool, item: SfxPoolItem, start: number, end: number) {
    super(pool, item, start, end);
    if (!(
      item.Which() === EE.EE_CHAR_FONTINFO ||
      item.Which() === EE.EE_CHAR_FONTINFO_CJK ||
      item.Which() === EE.EE_CHAR_FONTINFO_CTL
    )) {
      this.dispose();
      throw new Error("EditCharAttribFont source constructor assertion");
    }
  }
}

/** Original EditCharAttribItalic pooled range constructor; device rendering is a separate unported member group. */
export class EditCharAttribItalic extends EditCharAttrib {
  /** Original base range and Which assertion. @param pool - Actual item pool. @param item - Borrowed source item. @param start - Source start. @param end - Source end. @returns Actual range owner. */
  constructor(pool: SfxItemPool, item: SfxPoolItem, start: number, end: number) {
    super(pool, item, start, end);
    if (!(
      item.Which() === EE.EE_CHAR_ITALIC ||
      item.Which() === EE.EE_CHAR_ITALIC_CJK ||
      item.Which() === EE.EE_CHAR_ITALIC_CTL
    )) {
      this.dispose();
      throw new Error("EditCharAttribItalic source constructor assertion");
    }
  }
}

/** Original EditCharAttribWeight pooled range constructor; device rendering is a separate unported member group. */
export class EditCharAttribWeight extends EditCharAttrib {
  /** Original base range and Which assertion. @param pool - Actual item pool. @param item - Borrowed source item. @param start - Source start. @param end - Source end. @returns Actual range owner. */
  constructor(pool: SfxItemPool, item: SfxPoolItem, start: number, end: number) {
    super(pool, item, start, end);
    if (!(
      item.Which() === EE.EE_CHAR_WEIGHT ||
      item.Which() === EE.EE_CHAR_WEIGHT_CJK ||
      item.Which() === EE.EE_CHAR_WEIGHT_CTL
    )) {
      this.dispose();
      throw new Error("EditCharAttribWeight source constructor assertion");
    }
  }
}

/** Original EditCharAttribUnderline pooled range constructor; device rendering is a separate unported member group. */
export class EditCharAttribUnderline extends EditCharAttrib {
  /** Original base range and Which assertion. @param pool - Actual item pool. @param item - Borrowed source item. @param start - Source start. @param end - Source end. @returns Actual range owner. */
  constructor(pool: SfxItemPool, item: SfxPoolItem, start: number, end: number) {
    super(pool, item, start, end);
    if (!(item.Which() === EE.EE_CHAR_UNDERLINE)) {
      this.dispose();
      throw new Error("EditCharAttribUnderline source constructor assertion");
    }
  }
}

/** Original EditCharAttribOverline pooled range constructor; device rendering is a separate unported member group. */
export class EditCharAttribOverline extends EditCharAttrib {
  /** Original base range and Which assertion. @param pool - Actual item pool. @param item - Borrowed source item. @param start - Source start. @param end - Source end. @returns Actual range owner. */
  constructor(pool: SfxItemPool, item: SfxPoolItem, start: number, end: number) {
    super(pool, item, start, end);
    if (!(item.Which() === EE.EE_CHAR_OVERLINE)) {
      this.dispose();
      throw new Error("EditCharAttribOverline source constructor assertion");
    }
  }
}

/** Original EditCharAttribFontHeight pooled range constructor; device rendering is a separate unported member group. */
export class EditCharAttribFontHeight extends EditCharAttrib {
  /** Original base range and Which assertion. @param pool - Actual item pool. @param item - Borrowed source item. @param start - Source start. @param end - Source end. @returns Actual range owner. */
  constructor(pool: SfxItemPool, item: SfxPoolItem, start: number, end: number) {
    super(pool, item, start, end);
    if (!(
      item.Which() === EE.EE_CHAR_FONTHEIGHT ||
      item.Which() === EE.EE_CHAR_FONTHEIGHT_CJK ||
      item.Which() === EE.EE_CHAR_FONTHEIGHT_CTL
    )) {
      this.dispose();
      throw new Error("EditCharAttribFontHeight source constructor assertion");
    }
  }
}

/** Original EditCharAttribFontWidth pooled range constructor; device rendering is a separate unported member group. */
export class EditCharAttribFontWidth extends EditCharAttrib {
  /** Original base range and Which assertion. @param pool - Actual item pool. @param item - Borrowed source item. @param start - Source start. @param end - Source end. @returns Actual range owner. */
  constructor(pool: SfxItemPool, item: SfxPoolItem, start: number, end: number) {
    super(pool, item, start, end);
    if (!(item.Which() === EE.EE_CHAR_FONTWIDTH)) {
      this.dispose();
      throw new Error("EditCharAttribFontWidth source constructor assertion");
    }
  }
}

/** Original EditCharAttribStrikeout pooled range constructor; device rendering is a separate unported member group. */
export class EditCharAttribStrikeout extends EditCharAttrib {
  /** Original base range and Which assertion. @param pool - Actual item pool. @param item - Borrowed source item. @param start - Source start. @param end - Source end. @returns Actual range owner. */
  constructor(pool: SfxItemPool, item: SfxPoolItem, start: number, end: number) {
    super(pool, item, start, end);
    if (!(item.Which() === EE.EE_CHAR_STRIKEOUT)) {
      this.dispose();
      throw new Error("EditCharAttribStrikeout source constructor assertion");
    }
  }
}

/** Original EditCharAttribCaseMap pooled range constructor; device rendering is a separate unported member group. */
export class EditCharAttribCaseMap extends EditCharAttrib {
  /** Original base range and Which assertion. @param pool - Actual item pool. @param item - Borrowed source item. @param start - Source start. @param end - Source end. @returns Actual range owner. */
  constructor(pool: SfxItemPool, item: SfxPoolItem, start: number, end: number) {
    super(pool, item, start, end);
    if (!(item.Which() === EE.EE_CHAR_CASEMAP)) {
      this.dispose();
      throw new Error("EditCharAttribCaseMap source constructor assertion");
    }
  }
}

/** Original EditCharAttribColor pooled range constructor; device rendering is a separate unported member group. */
export class EditCharAttribColor extends EditCharAttrib {
  /** Original base range and Which assertion. @param pool - Actual item pool. @param item - Borrowed source item. @param start - Source start. @param end - Source end. @returns Actual range owner. */
  constructor(pool: SfxItemPool, item: SfxPoolItem, start: number, end: number) {
    super(pool, item, start, end);
    if (!(item.Which() === EE.EE_CHAR_COLOR)) {
      this.dispose();
      throw new Error("EditCharAttribColor source constructor assertion");
    }
  }
}

/** Original EditCharAttribBackgroundColor pooled range constructor; device rendering is a separate unported member group. */
export class EditCharAttribBackgroundColor extends EditCharAttrib {
  /** Original base range and Which assertion. @param pool - Actual item pool. @param item - Borrowed source item. @param start - Source start. @param end - Source end. @returns Actual range owner. */
  constructor(pool: SfxItemPool, item: SfxPoolItem, start: number, end: number) {
    super(pool, item, start, end);
    if (!(item.Which() === EE.EE_CHAR_BKGCOLOR)) {
      this.dispose();
      throw new Error("EditCharAttribBackgroundColor source constructor assertion");
    }
  }
}

/** Original EditCharAttribLanguage pooled range constructor; device rendering is a separate unported member group. */
export class EditCharAttribLanguage extends EditCharAttrib {
  /** Original base range and Which assertion. @param pool - Actual item pool. @param item - Borrowed source item. @param start - Source start. @param end - Source end. @returns Actual range owner. */
  constructor(pool: SfxItemPool, item: SfxPoolItem, start: number, end: number) {
    super(pool, item, start, end);
    if (!(
      item.Which() === EE.EE_CHAR_LANGUAGE ||
      item.Which() === EE.EE_CHAR_LANGUAGE_CJK ||
      item.Which() === EE.EE_CHAR_LANGUAGE_CTL
    )) {
      this.dispose();
      throw new Error("EditCharAttribLanguage source constructor assertion");
    }
  }
}

/** Original EditCharAttribRuby pooled range constructor; device rendering is a separate unported member group. */
export class EditCharAttribRuby extends EditCharAttrib {
  /** Original base range and Which assertion. @param pool - Actual item pool. @param item - Borrowed source item. @param start - Source start. @param end - Source end. @returns Actual range owner. */
  constructor(pool: SfxItemPool, item: SfxPoolItem, start: number, end: number) {
    super(pool, item, start, end);
    if (!(item.Which() === EE.EE_CHAR_RUBY)) {
      this.dispose();
      throw new Error("EditCharAttribRuby source constructor assertion");
    }
    this.SetExpandable(false);
  }
}

/** Original EditCharAttribScriptHint pooled range constructor; device rendering is a separate unported member group. */
export class EditCharAttribScriptHint extends EditCharAttrib {
  /** Original base range and Which assertion. @param pool - Actual item pool. @param item - Borrowed source item. @param start - Source start. @param end - Source end. @returns Actual range owner. */
  constructor(pool: SfxItemPool, item: SfxPoolItem, start: number, end: number) {
    super(pool, item, start, end);
    if (!(item.Which() === EE.EE_CHAR_SCRIPT_HINT)) {
      this.dispose();
      throw new Error("EditCharAttribScriptHint source constructor assertion");
    }
  }
}

/** Original EditCharAttribShadow pooled range constructor; device rendering is a separate unported member group. */
export class EditCharAttribShadow extends EditCharAttrib {
  /** Original base range and Which assertion. @param pool - Actual item pool. @param item - Borrowed source item. @param start - Source start. @param end - Source end. @returns Actual range owner. */
  constructor(pool: SfxItemPool, item: SfxPoolItem, start: number, end: number) {
    super(pool, item, start, end);
    if (!(item.Which() === EE.EE_CHAR_SHADOW)) {
      this.dispose();
      throw new Error("EditCharAttribShadow source constructor assertion");
    }
  }
}

/** Original EditCharAttribEscapement pooled range constructor; device rendering is a separate unported member group. */
export class EditCharAttribEscapement extends EditCharAttrib {
  /** Original base range and Which assertion. @param pool - Actual item pool. @param item - Borrowed source item. @param start - Source start. @param end - Source end. @returns Actual range owner. */
  constructor(pool: SfxItemPool, item: SfxPoolItem, start: number, end: number) {
    super(pool, item, start, end);
    if (!(item.Which() === EE.EE_CHAR_ESCAPEMENT)) {
      this.dispose();
      throw new Error("EditCharAttribEscapement source constructor assertion");
    }
  }
}

/** Original EditCharAttribOutline pooled range constructor; device rendering is a separate unported member group. */
export class EditCharAttribOutline extends EditCharAttrib {
  /** Original base range and Which assertion. @param pool - Actual item pool. @param item - Borrowed source item. @param start - Source start. @param end - Source end. @returns Actual range owner. */
  constructor(pool: SfxItemPool, item: SfxPoolItem, start: number, end: number) {
    super(pool, item, start, end);
    if (!(item.Which() === EE.EE_CHAR_OUTLINE)) {
      this.dispose();
      throw new Error("EditCharAttribOutline source constructor assertion");
    }
  }
}

/** Original EditCharAttribPairKerning pooled range constructor; device rendering is a separate unported member group. */
export class EditCharAttribPairKerning extends EditCharAttrib {
  /** Original base range and Which assertion. @param pool - Actual item pool. @param item - Borrowed source item. @param start - Source start. @param end - Source end. @returns Actual range owner. */
  constructor(pool: SfxItemPool, item: SfxPoolItem, start: number, end: number) {
    super(pool, item, start, end);
    if (!(item.Which() === EE.EE_CHAR_PAIRKERNING)) {
      this.dispose();
      throw new Error("EditCharAttribPairKerning source constructor assertion");
    }
  }
}

/** Original EditCharAttribKerning pooled range constructor; device rendering is a separate unported member group. */
export class EditCharAttribKerning extends EditCharAttrib {
  /** Original base range and Which assertion. @param pool - Actual item pool. @param item - Borrowed source item. @param start - Source start. @param end - Source end. @returns Actual range owner. */
  constructor(pool: SfxItemPool, item: SfxPoolItem, start: number, end: number) {
    super(pool, item, start, end);
    if (!(item.Which() === EE.EE_CHAR_KERNING)) {
      this.dispose();
      throw new Error("EditCharAttribKerning source constructor assertion");
    }
  }
}

/** Original EditCharAttribWordLineMode pooled range constructor; device rendering is a separate unported member group. */
export class EditCharAttribWordLineMode extends EditCharAttrib {
  /** Original base range and Which assertion. @param pool - Actual item pool. @param item - Borrowed source item. @param start - Source start. @param end - Source end. @returns Actual range owner. */
  constructor(pool: SfxItemPool, item: SfxPoolItem, start: number, end: number) {
    super(pool, item, start, end);
    if (!(item.Which() === EE.EE_CHAR_WLM)) {
      this.dispose();
      throw new Error("EditCharAttribWordLineMode source constructor assertion");
    }
  }
}

/** Original EditCharAttribEmphasisMark pooled range constructor; device rendering is a separate unported member group. */
export class EditCharAttribEmphasisMark extends EditCharAttrib {
  /** Original base range and Which assertion. @param pool - Actual item pool. @param item - Borrowed source item. @param start - Source start. @param end - Source end. @returns Actual range owner. */
  constructor(pool: SfxItemPool, item: SfxPoolItem, start: number, end: number) {
    super(pool, item, start, end);
    if (!(item.Which() === EE.EE_CHAR_EMPHASISMARK)) {
      this.dispose();
      throw new Error("EditCharAttribEmphasisMark source constructor assertion");
    }
  }
}

/** Original EditCharAttribRelief pooled range constructor; device rendering is a separate unported member group. */
export class EditCharAttribRelief extends EditCharAttrib {
  /** Original base range and Which assertion. @param pool - Actual item pool. @param item - Borrowed source item. @param start - Source start. @param end - Source end. @returns Actual range owner. */
  constructor(pool: SfxItemPool, item: SfxPoolItem, start: number, end: number) {
    super(pool, item, start, end);
    if (!(item.Which() === EE.EE_CHAR_RELIEF)) {
      this.dispose();
      throw new Error("EditCharAttribRelief source constructor assertion");
    }
  }
}

/** Original EditCharAttribOpticalSizing pooled range constructor; device rendering is a separate unported member group. */
export class EditCharAttribOpticalSizing extends EditCharAttrib {
  /** Original base range and Which assertion. @param pool - Actual item pool. @param item - Borrowed source item. @param start - Source start. @param end - Source end. @returns Actual range owner. */
  constructor(pool: SfxItemPool, item: SfxPoolItem, start: number, end: number) {
    super(pool, item, start, end);
    if (!(item.Which() === EE.EE_CHAR_OPTICALSIZING)) {
      this.dispose();
      throw new Error("EditCharAttribOpticalSizing source constructor assertion");
    }
  }
}

/** Original EditCharAttribFontVariations pooled range constructor; device rendering is a separate unported member group. */
export class EditCharAttribFontVariations extends EditCharAttrib {
  /** Original base range and Which assertion. @param pool - Actual item pool. @param item - Borrowed source item. @param start - Source start. @param end - Source end. @returns Actual range owner. */
  constructor(pool: SfxItemPool, item: SfxPoolItem, start: number, end: number) {
    super(pool, item, start, end);
    if (!(item.Which() === EE.EE_CHAR_FONTVARIATIONS)) {
      this.dispose();
      throw new Error("EditCharAttribFontVariations source constructor assertion");
    }
  }
}

/** Original EditCharAttribGrabBag pooled range constructor; device rendering is a separate unported member group. */
export class EditCharAttribGrabBag extends EditCharAttrib {
  /** Original base range and Which assertion. @param pool - Actual item pool. @param item - Borrowed source item. @param start - Source start. @param end - Source end. @returns Actual range owner. */
  constructor(pool: SfxItemPool, item: SfxPoolItem, start: number, end: number) {
    super(pool, item, start, end);
    if (!(item.Which() === EE.EE_CHAR_GRABBAG)) {
      this.dispose();
      throw new Error("EditCharAttribGrabBag source constructor assertion");
    }
  }
}

/** Original field range and expanded display value, including the source copy constructor's feature-flag behavior. */
export class EditCharAttribField extends EditCharAttrib {
  private readonly aFieldValue: OUString;
  private readonly mxTxtColor = optionalColorLvalue();
  private readonly mxFldColor = optionalColorLvalue();
  private readonly mxFldLineStyle: [FontLineStyle | null] = [null];
  /** Original pool/item/position and field-copy overloads. @param args - Original selected constructor. @returns Actual field owner. */
  constructor(
    ...args:
      [pool: SfxItemPool, item: SfxPoolItem, position: number] | [source: EditCharAttribField]
  ) {
    const source = args.length === 1 ? args[0] : null;
    if (args.length === 1) {
      super(
        args[0].GetHolder().getPool(),
        args[0].GetItem() as SfxPoolItem,
        args[0].GetStart(),
        args[0].GetEnd(),
      );
    } else super(args[0], args[1], args[2], args[2] + 1);
    this.aFieldValue = source ? new OUString(source.aFieldValue) : new OUString();
    if (source) {
      this.mxTxtColor[0] = source.mxTxtColor[0];
      this.mxFldColor[0] = source.mxFldColor[0];
      this.mxFldLineStyle[0] = source.mxFldLineStyle[0];
    } else this.SetFeature(true);
  }
  /** Original derived destructor resets the value before base/member destruction. @returns Nothing. */
  override dispose(): void {
    this.Reset();
    this.aFieldValue.dispose();
    super.dispose();
  }
  /** Original borrowed expanded text. @returns Actual field-value member. */
  GetFieldValue(): OUStringConstReference {
    return this.aFieldValue;
  }
  /** Original text value assignment. @param value - Source value. @returns Nothing. */
  SetFieldValue(value: OUStringConstReference): void {
    this.aFieldValue.assign(value);
  }
  /** Original mutable optional text color. @returns Stable optional lvalue. */
  GetTextColor(): [Color | null] {
    return this.mxTxtColor;
  }
  /** Original mutable optional field color. @returns Stable optional lvalue. */
  GetFieldColor(): [Color | null] {
    return this.mxFldColor;
  }
  /** Original mutable optional field line style. @returns Stable optional lvalue. */
  GetFldLineStyle(): [FontLineStyle | null] {
    return this.mxFldLineStyle;
  }
  /** Original clear text and all three independent optionals. @returns Nothing. */
  Reset(): void {
    this.aFieldValue.clear();
    this.mxTxtColor[0] = null;
    this.mxFldColor[0] = null;
    this.mxFldLineStyle[0] = null;
  }
  /** Original equality compares expanded value and optionals, without comparing the base item/range/flags. @param other - Compared field. @returns Source equality. */
  equals(other: EditCharAttribField): boolean {
    if (!this.aFieldValue.equals(other.aFieldValue)) return false;
    if ((this.mxTxtColor[0] === null) !== (other.mxTxtColor[0] === null)) return false;
    if (
      this.mxTxtColor[0] &&
      other.mxTxtColor[0] &&
      !this.mxTxtColor[0].equals(other.mxTxtColor[0])
    )
      return false;
    if ((this.mxFldColor[0] === null) !== (other.mxFldColor[0] === null)) return false;
    if (
      this.mxFldColor[0] &&
      other.mxFldColor[0] &&
      !this.mxFldColor[0].equals(other.mxFldColor[0])
    )
      return false;
    return this.mxFldLineStyle[0] === other.mxFldLineStyle[0];
  }
  /** Original negated value equality. @param other - Compared field. @returns Inequality. */
  notEquals(other: EditCharAttribField): boolean {
    return !this.equals(other);
  }
}
