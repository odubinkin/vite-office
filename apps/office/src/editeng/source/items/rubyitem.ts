/** @fileoverview Original SvxRubyItem document-content values, typed Any and locale-independent content presentation. */
import { SfxPoolItem } from "../../../svl/source/items/poolitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import { CONVERT_TWIPS, type SfxItemPresentation } from "../../../svl/inc/poolitem";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { MapUnit } from "../../../tools/inc/mapunit";
import { RubyAdjust } from "../../../offapi/com/sun/star/text/RubyAdjust";
import * as RubyPosition from "../../../offapi/com/sun/star/text/RubyPosition";
import { MID_RUBY_TEXT, MID_RUBY_ADJUST, MID_RUBY_POSITION } from "../../inc/memberids";

/** Original ruby text, alignment and signed16 position value. */
export class SvxRubyItem extends SfxPoolItem {
  private readonly m_aText = new OUString();
  private m_eAdjustment = RubyAdjust.LEFT;
  private m_ePosition = RubyPosition.ABOVE;
  /** Original Which-only and implicit-copy constructors. @param source - Which or copied item. @returns Item. */
  public constructor(source: number | Readonly<SvxRubyItem>) {
    super(typeof source === "number" ? source : source.Which());
    if (typeof source !== "number") {
      this.m_aText.assign(source.GetText());
      this.m_eAdjustment = source.GetAdjustment();
      this.m_ePosition = source.GetPosition();
    }
  }
  /** Original borrowed const text member. @returns Stable read-only string reference. */
  public GetText(): OUStringConstReference {
    return this.m_aText;
  }
  /** Original by-value text assignment, without moving/resetting the caller in JS. @param text - Copied text. @returns Nothing. */
  public SetText(text: OUStringConstReference): void {
    this.m_aText.assign(text);
  }
  /** Original adjustment enum query. @returns Adjustment. */
  public GetAdjustment(): RubyAdjust {
    return this.m_eAdjustment;
  }
  /** Original enum argument assignment without property range validation. @param value - Enum value. @returns Nothing. */
  public SetAdjustment(value: RubyAdjust): void {
    this.m_eAdjustment = (value | 0) as RubyAdjust;
  }
  /** Original signed16 position query. @returns Position. */
  public GetPosition(): number {
    return this.m_ePosition;
  }
  /** Original short argument conversion without property position bounds. @param value - Position. @returns Nothing. */
  public SetPosition(value: number): void {
    this.m_ePosition = (value << 16) >> 16;
  }
  /** Original text/adjustment/position payload comparison excluding Which. @param other - Compared item. @returns Equality. */
  public override equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxRubyItem &&
      this.m_aText.equals(other.m_aText) &&
      this.m_eAdjustment === other.m_eAdjustment &&
      this.m_ePosition === other.m_ePosition
    );
  }
  /** Original independent copy clone. @param pool - Unused pool. @returns Copied item. */
  public override Clone(pool?: SfxItemPool): SvxRubyItem {
    void pool;
    return new SvxRubyItem(this);
  }
  /** Original content-only presentation, without translated interface resources. @param presentation - Ignored degree. @param coreMetric - Ignored unit. @param presentationMetric - Ignored unit. @param text - Actual output string. @param intl - Unused provider parameter. @returns True. */
  public GetPresentation(
    presentation: SfxItemPresentation,
    coreMetric: MapUnit,
    presentationMetric: MapUnit,
    text: OUString,
    intl: unknown,
  ): boolean {
    void presentation;
    void coreMetric;
    void presentationMetric;
    void intl;
    text.assign(this.m_aText);
    return true;
  }
  /** Inherited unsupported no-argument query. @returns No projection. */
  public override QueryValue(): undefined;
  /** Original actual string/short Any query. @param output - Actual Any. @param member - Selector. @returns Success. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original byte/twips selector and unknown-member failure. @param output - Optional actual Any. @param member - Native selector. @returns Success or absent base projection. */
  public override QueryValue(output?: Any, member = 0): boolean | undefined {
    if (output === undefined) return undefined;
    switch (member & 0xff & ~CONVERT_TWIPS) {
      case MID_RUBY_TEXT:
        output.insert([this.m_aText.pData], "OUString");
        return true;
      case MID_RUBY_ADJUST:
        output.insert([(this.m_eAdjustment << 16) >> 16], "sal_Int16");
        return true;
      case MID_RUBY_POSITION:
        output.insert([this.m_ePosition], "sal_Int16");
        return true;
    }
    return false;
  }
  /** Original string/short extraction and adjustment-only validation. @param input - Actual Any. @param member - Native selector. @returns Success with no mutation on rejection. */
  public override PutValue(input: unknown, member: number): boolean {
    switch (member & 0xff & ~CONVERT_TWIPS) {
      case MID_RUBY_TEXT: {
        const text = new OUString();
        if (input instanceof Any && input.extract(text, "OUString")) {
          this.SetText(text);
          return true;
        }
        break;
      }
      case MID_RUBY_ADJUST: {
        const value: [number] = [0];
        if (
          input instanceof Any &&
          input.extract(value, "sal_Int16") &&
          value[0] >= RubyAdjust.LEFT &&
          value[0] <= RubyAdjust.INDENT_BLOCK
        ) {
          this.SetAdjustment(value[0]);
          return true;
        }
        break;
      }
      case MID_RUBY_POSITION: {
        const value: [number] = [0];
        if (input instanceof Any && input.extract(value, "sal_Int16")) {
          this.SetPosition(value[0]);
          return true;
        }
        break;
      }
    }
    return false;
  }
}
