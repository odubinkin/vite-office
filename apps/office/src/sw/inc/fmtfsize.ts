/** @fileoverview Owns native Writer frame-size values, defaults, equality and clone from fmtfsize.hxx and atrfrm.cxx. */
import { SvxSizeItem } from "../../editeng/inc/sizeitem";
import { Size } from "../../tools/inc/gen";
import { SfxPoolItem, CONVERT_TWIPS } from "../../svl/inc/poolitem";
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import {
  Size as UnoSize,
  cppu_detail_getUnoType_Size as sizeType,
} from "../../offapi/com/sun/star/awt/Size";
import { convertTwipToMm100 } from "../../tools/inc/UnitConversion";
import { toTwips, Length } from "../../o3tl/inc/unit_conversion";
import { MINLAY } from "./swtypes";
import {
  MID_FRMSIZE_SIZE,
  MID_FRMSIZE_REL_HEIGHT,
  MID_FRMSIZE_REL_WIDTH,
  MID_FRMSIZE_WIDTH,
  MID_FRMSIZE_HEIGHT,
  MID_FRMSIZE_SIZE_TYPE,
  MID_FRMSIZE_IS_AUTO_HEIGHT,
  MID_FRMSIZE_IS_SYNC_WIDTH_TO_HEIGHT,
  MID_FRMSIZE_IS_SYNC_HEIGHT_TO_WIDTH,
  MID_FRMSIZE_WIDTH_TYPE,
  MID_FRMSIZE_REL_WIDTH_RELATION,
  MID_FRMSIZE_REL_HEIGHT_RELATION,
} from "./unomid";
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
  private heightType: SwFrameSize;
  /** Creates the native Variable-height/Fixed-width default item. @param source - Native height type or actual copy source. @param width - Twip width. @param height - Twip height. @returns Nothing. */
  public constructor(
    source: SwFrameSize | Readonly<SwFormatFrameSize> = SwFrameSize.Variable,
    width = 0,
    height = 0,
  ) {
    super(typeof source === "number" ? RES_FRM_SIZE : source, new Size(width, height));
    this.heightType = typeof source === "number" ? source : source.GetHeightSizeType();
    if (typeof source !== "number") {
      this.widthType = source.GetWidthSizeType();
      this.widthPercent = source.GetWidthPercent();
      this.widthPercentRelation = source.GetWidthPercentRelation();
      this.heightPercent = source.GetHeightPercent();
      this.heightPercentRelation = source.GetHeightPercentRelation();
    }
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
    this.widthPercent = value & 0xff;
  }
  /** Reads the width percentage reference. @returns Native relation. */
  public GetWidthPercentRelation(): number {
    return this.widthPercentRelation;
  }
  /** Replaces width percentage reference. @param value - Native relation. @returns Nothing. */
  public SetWidthPercentRelation(value: number): void {
    this.widthPercentRelation = (value << 16) >> 16;
  }
  /** Reads authored height percentage, including the synced sentinel. @returns Percent value. */
  public GetHeightPercent(): number {
    return this.heightPercent;
  }
  /** Replaces height percentage. @param value - Native byte value. @returns Nothing. */
  public SetHeightPercent(value: number): void {
    this.heightPercent = value & 0xff;
  }
  /** Reads height percentage reference. @returns Native relation. */
  public GetHeightPercentRelation(): number {
    return this.heightPercentRelation;
  }
  /** Replaces height percentage reference. @param value - Native relation. @returns Nothing. */
  public SetHeightPercentRelation(value: number): void {
    this.heightPercentRelation = (value << 16) >> 16;
  }
  /** Copies all native dimensions, types, percentages and references. @returns Independent complete item. */
  public override Clone(): SwFormatFrameSize {
    return new SwFormatFrameSize(this);
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
  /** Native deliberately bypasses dimensional scaling inherited from SvxSizeItem. @param scale - Ignored native factor. @returns Nothing. */
  public override ScaleMetrics(scale: number): void {
    SfxPoolItem.prototype.ScaleMetrics.call(this, scale);
  }
  /** Native deliberately bypasses the base dimensional metric flag. @returns False. */
  public override HasMetrics(): boolean {
    return SfxPoolItem.prototype.HasMetrics.call(this);
  }
  /** Existing browser size transport follows the native always-converted SIZE query. @returns Dimensions. */
  public override QueryValue(): Readonly<{ Width: number; Height: number }>;
  /** Native Writer query contract. @param output - Actual Any. @param member - Writer member. @returns True. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Native Writer always converts dimensions,ignores unknown members with unchanged output,and maps SYNCED percentages to zero. @param output - Optional native output. @param member - Native member/flag. @returns True or browser dimensions. */
  public override QueryValue(
    output?: Any,
    member = 0,
  ): boolean | Readonly<{ Width: number; Height: number }> {
    member &= ~CONVERT_TWIPS;
    const size = new UnoSize(
      Number(convertTwipToMm100(BigInt(this.GetWidth()))),
      Number(convertTwipToMm100(BigInt(this.GetHeight()))),
    );
    if (output === undefined) return { Width: size.Width, Height: size.Height };
    switch (member) {
      case MID_FRMSIZE_SIZE:
        output.insert(size, sizeType);
        break;
      case MID_FRMSIZE_REL_HEIGHT:
        output.insert(
          [this.GetHeightPercent() !== SwFormatFrameSize.SYNCED ? this.GetHeightPercent() : 0],
          "sal_Int16",
        );
        break;
      case MID_FRMSIZE_REL_WIDTH:
        output.insert(
          [this.GetWidthPercent() !== SwFormatFrameSize.SYNCED ? this.GetWidthPercent() : 0],
          "sal_Int16",
        );
        break;
      case MID_FRMSIZE_REL_HEIGHT_RELATION:
        output.insert([this.GetHeightPercentRelation()], "sal_Int16");
        break;
      case MID_FRMSIZE_REL_WIDTH_RELATION:
        output.insert([this.GetWidthPercentRelation()], "sal_Int16");
        break;
      case MID_FRMSIZE_IS_SYNC_HEIGHT_TO_WIDTH:
        output.insert([this.GetHeightPercent() === SwFormatFrameSize.SYNCED], "bool");
        break;
      case MID_FRMSIZE_IS_SYNC_WIDTH_TO_HEIGHT:
        output.insert([this.GetWidthPercent() === SwFormatFrameSize.SYNCED], "bool");
        break;
      case MID_FRMSIZE_WIDTH:
        output.insert([size.Width], "sal_Int32");
        break;
      case MID_FRMSIZE_HEIGHT:
        output.insert(
          [
            Number(
              convertTwipToMm100(BigInt(this.GetHeight() < MINLAY ? MINLAY : this.GetHeight())),
            ) | 0,
          ],
          "sal_Int32",
        );
        break;
      case MID_FRMSIZE_SIZE_TYPE:
        output.insert([this.GetHeightSizeType()], "sal_Int16");
        break;
      case MID_FRMSIZE_IS_AUTO_HEIGHT:
        output.insert([this.GetHeightSizeType() !== SwFrameSize.Fixed], "bool");
        break;
      case MID_FRMSIZE_WIDTH_TYPE:
        output.insert([this.GetWidthSizeType()], "sal_Int16");
        break;
    }
    return true;
  }
  /** Original Writer member extraction,conversion,clamps and failed-extraction destinations. @param value - Actual Any. @param member - Writer member/flag. @returns Native result. */
  public override PutValue(value: Any, member: number): boolean {
    const convert = (member & CONVERT_TWIPS) !== 0;
    member &= ~CONVERT_TWIPS;
    switch (member) {
      case MID_FRMSIZE_SIZE: {
        const size = new UnoSize();
        if (!value.extract(size, sizeType)) return false;
        this.SetSize(
          new Size(
            convert ? Number(toTwips(BigInt(size.Width), Length.mm100)) : size.Width,
            convert ? Number(toTwips(BigInt(size.Height), Length.mm100)) : size.Height,
          ),
        );
        break;
      }
      case MID_FRMSIZE_REL_HEIGHT:
      case MID_FRMSIZE_REL_WIDTH: {
        const n: [number] = [0];
        value.extract(n, "sal_Int16");
        if (n[0] < 0 || n[0] >= SwFormatFrameSize.SYNCED) return false;
        if (member === MID_FRMSIZE_REL_HEIGHT) this.SetHeightPercent(n[0]);
        else this.SetWidthPercent(n[0]);
        break;
      }
      case MID_FRMSIZE_REL_HEIGHT_RELATION:
      case MID_FRMSIZE_REL_WIDTH_RELATION: {
        const n: [number] = [0];
        value.extract(n, "sal_Int16");
        if (member === MID_FRMSIZE_REL_HEIGHT_RELATION) this.SetHeightPercentRelation(n[0]);
        else this.SetWidthPercentRelation(n[0]);
        break;
      }
      case MID_FRMSIZE_IS_SYNC_HEIGHT_TO_WIDTH:
      case MID_FRMSIZE_IS_SYNC_WIDTH_TO_HEIGHT: {
        const n: [boolean] = [false];
        if (!value.extract(n, "bool")) throw new TypeError("Native bool access precondition");
        if (member === MID_FRMSIZE_IS_SYNC_HEIGHT_TO_WIDTH) {
          if (n[0]) this.SetHeightPercent(SwFormatFrameSize.SYNCED);
          else if (this.GetHeightPercent() === SwFormatFrameSize.SYNCED) this.SetHeightPercent(0);
        } else {
          if (n[0]) this.SetWidthPercent(SwFormatFrameSize.SYNCED);
          else if (this.GetWidthPercent() === SwFormatFrameSize.SYNCED) this.SetWidthPercent(0);
        }
        break;
      }
      case MID_FRMSIZE_WIDTH:
      case MID_FRMSIZE_HEIGHT: {
        const n: [number] = [0];
        if (!value.extract(n, "sal_Int32")) return false;
        let v = convert ? Number(toTwips(BigInt(n[0]), Length.mm100)) | 0 : n[0];
        if (v < MINLAY) v = MINLAY;
        if (member === MID_FRMSIZE_WIDTH) this.SetWidth(v);
        else this.SetHeight(v);
        break;
      }
      case MID_FRMSIZE_SIZE_TYPE:
      case MID_FRMSIZE_WIDTH_TYPE: {
        const n: [number] = [0];
        if (!value.extract(n, "sal_Int16") || n[0] < 0 || n[0] > SwFrameSize.Minimum) return false;
        if (member === MID_FRMSIZE_SIZE_TYPE) this.SetHeightSizeType(n[0]);
        else this.SetWidthSizeType(n[0]);
        break;
      }
      case MID_FRMSIZE_IS_AUTO_HEIGHT: {
        const n: [boolean] = [false];
        if (!value.extract(n, "bool")) throw new TypeError("Native bool access precondition");
        this.SetHeightSizeType(n[0] ? SwFrameSize.Variable : SwFrameSize.Fixed);
        break;
      }
      default:
        return false;
    }
    return true;
  }
}
