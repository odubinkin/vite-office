/** @fileoverview Native SwFormatSurround state/default/copy/equality from fmtsrnd.hxx and atrfrm.cxx; UNO property conversion/presentation are separate unported responsibilities. */
import { SfxEnumItem } from "../../svl/inc/eitem";
import type { SfxPoolItem } from "../../svl/source/items/poolitem";
import type { SfxItemPool } from "../../svl/source/items/itempool";
import { WrapTextMode } from "../../offapi/com/sun/star/text/WrapTextMode";
import { RES_SURROUND } from "./hintids";
/** Original wrap enum and independent false anchor-only/contour/outside bits. */
export class SwFormatSurround extends SfxEnumItem<WrapTextMode> {
  private m_bAnchorOnly = false;
  private m_bContour = false;
  private m_bOutside = false;
  /** Original declared or implicit-copy construction. @param value - Wrap mode or actual const source. @returns Item. */
  constructor(value: WrapTextMode | SwFormatSurround = WrapTextMode.PARALLEL) {
    if (value instanceof SwFormatSurround) {
      super(value);
      this.m_bAnchorOnly = value.m_bAnchorOnly;
      this.m_bContour = value.m_bContour;
      this.m_bOutside = value.m_bOutside;
    } else super(RES_SURROUND, value);
  }
  /** Original wrap query. @returns Stored native enum. */ GetSurround(): WrapTextMode {
    return this.GetValue();
  }
  /** Original wrap write. @param value - Native enum. @returns Nothing. */ SetSurround(
    value: WrapTextMode,
  ): void {
    this.SetValue(value);
  }
  /** Original anchor-only query. @returns Flag. */ IsAnchorOnly(): boolean {
    return this.m_bAnchorOnly;
  }
  /** Original anchor-only write. @param value - Flag. @returns Nothing. */ SetAnchorOnly(
    value: boolean,
  ): void {
    this.m_bAnchorOnly = value;
  }
  /** Original contour query. @returns Flag. */ IsContour(): boolean {
    return this.m_bContour;
  }
  /** Original contour write. @param value - Flag. @returns Nothing. */ SetContour(
    value: boolean,
  ): void {
    this.m_bContour = value;
  }
  /** Original outside query. @returns Flag. */ IsOutside(): boolean {
    return this.m_bOutside;
  }
  /** Original outside write. @param value - Flag. @returns Nothing. */ SetOutside(
    value: boolean,
  ): void {
    this.m_bOutside = value;
  }
  /** Original copy clone retains complete independent bit state. @param pool - Unused original pool. @returns Actual copied item. */
  public override Clone(pool?: SfxItemPool): SwFormatSurround {
    void pool;
    return new SwFormatSurround(this);
  }
  /** Original value/three-bit equality; no flag is inferred from wrap mode. @param other - Actual compared item. @returns Equal payload. */
  public override equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SwFormatSurround &&
      super.equals(other) &&
      this.m_bAnchorOnly === other.m_bAnchorOnly &&
      this.m_bContour === other.m_bContour &&
      this.m_bOutside === other.m_bOutside
    );
  }
}
