/** @fileoverview Owns native Writer frame-size values, defaults, equality and clone from fmtfsize.hxx and atrfrm.cxx. */
import { SvxSizeItem } from "../../editeng/source/items/frmitems";
import type { SfxPoolItem } from "../../svl/source/items/poolitem";
import { RES_FRM_SIZE } from "./hintids";

/** Native height and width sizing modes. */
export enum SwFrameSize {
  Variable,
  Fixed,
  Minimum,
}

/** Complete native frame-size value over the original size item. */
export class SwFormatFrameSize extends SvxSizeItem {
  public static readonly SYNCED = 0xff;
  private widthType = SwFrameSize.Fixed;
  private widthPercent = 0;
  private widthPercentRelation = 0;
  private heightPercent = 0;
  private heightPercentRelation = 0;
  /** Creates the native Variable-height/Fixed-width default item. @param heightType - Native height type. @param width - Twip width. @param height - Twip height. @returns Nothing. */
  public constructor(
    private heightType = SwFrameSize.Variable,
    width = 0,
    height = 0,
  ) {
    super(RES_FRM_SIZE, { width, height });
  }
  /** Reads the native height type. @returns Height mode. */
  public GetHeightSizeType(): SwFrameSize {
    return this.heightType;
  }
  /** Replaces height type. @param type - Native height mode. @returns Nothing. */
  public SetHeightSizeType(type: SwFrameSize): void {
    this.heightType = type;
  }
  /** Reads width type. @returns Native width mode. */
  public GetWidthSizeType(): SwFrameSize {
    return this.widthType;
  }
  /** Replaces width type. @param type - Native width mode. @returns Nothing. */
  public SetWidthSizeType(type: SwFrameSize): void {
    this.widthType = type;
  }
  /** Reads authored width percentage, including the synced sentinel. @returns Percent value. */
  public GetWidthPercent(): number {
    return this.widthPercent;
  }
  /** Replaces width percentage. @param value - Native byte value. @returns Nothing. */
  public SetWidthPercent(value: number): void {
    this.widthPercent = value;
  }
  /** Reads the width percentage reference. @returns Native relation. */
  public GetWidthPercentRelation(): number {
    return this.widthPercentRelation;
  }
  /** Replaces width percentage reference. @param value - Native relation. @returns Nothing. */
  public SetWidthPercentRelation(value: number): void {
    this.widthPercentRelation = value;
  }
  /** Reads authored height percentage, including the synced sentinel. @returns Percent value. */
  public GetHeightPercent(): number {
    return this.heightPercent;
  }
  /** Replaces height percentage. @param value - Native byte value. @returns Nothing. */
  public SetHeightPercent(value: number): void {
    this.heightPercent = value;
  }
  /** Reads height percentage reference. @returns Native relation. */
  public GetHeightPercentRelation(): number {
    return this.heightPercentRelation;
  }
  /** Replaces height percentage reference. @param value - Native relation. @returns Nothing. */
  public SetHeightPercentRelation(value: number): void {
    this.heightPercentRelation = value;
  }
  /** Copies all native dimensions, types, percentages and references. @returns Independent complete item. */
  public override Clone(): SwFormatFrameSize {
    const copy = new SwFormatFrameSize(this.heightType, this.GetWidth(), this.GetHeight());
    copy.widthType = this.widthType;
    copy.widthPercent = this.widthPercent;
    copy.widthPercentRelation = this.widthPercentRelation;
    copy.heightPercent = this.heightPercent;
    copy.heightPercentRelation = this.heightPercentRelation;
    return copy;
  }
  /** Compares the complete native frame-size item. @param other - Candidate item. @returns Whether equal. */
  public override equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SwFormatFrameSize &&
      super.equals(other) &&
      this.heightType === other.heightType &&
      this.widthType === other.widthType &&
      this.widthPercent === other.widthPercent &&
      this.widthPercentRelation === other.widthPercentRelation &&
      this.heightPercent === other.heightPercent &&
      this.heightPercentRelation === other.heightPercentRelation
    );
  }
  /** Exposes the supported default native size value in hundredths of a millimetre. @returns Converted native dimensions. */
  public override QueryValue(): Readonly<{ Width: number; Height: number }> {
    return {
      Width: Math.round((this.GetWidth() * 127) / 72),
      Height: Math.round((this.GetHeight() * 127) / 72),
    };
  }
}
