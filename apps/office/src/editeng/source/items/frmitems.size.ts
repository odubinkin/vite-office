/** @fileoverview Original SvxSizeItem value and Any member contracts over actual shared tools Size;presentation/localization remain pending. */
import { SfxPoolItem, CONVERT_TWIPS } from "../../../svl/inc/poolitem";
import type { SfxItemPool } from "../../../svl/inc/itempool";
import { Size, type ReadonlySize } from "../../../tools/inc/gen";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import {
  Size as UnoSize,
  cppu_detail_getUnoType_Size as sizeType,
} from "../../../offapi/com/sun/star/awt/Size";
import { convertTwipToMm100 } from "../../../tools/inc/UnitConversion";
import { toTwips, Length } from "../../../o3tl/inc/unit_conversion";
import { MID_SIZE_SIZE, MID_SIZE_WIDTH, MID_SIZE_HEIGHT } from "../../../svl/inc/memberid";
/** Actual source-owned size item with a stable by-value geometry member. */
export class SvxSizeItem extends SfxPoolItem {
  private readonly m_aSize: Size;
  /** Original Which-only/explicit-size/implicit-copy constructors. @param source - Identity or actual item. @param size - Native geometry. @returns Item. */
  constructor(source: number | Readonly<SvxSizeItem>, size?: ReadonlySize) {
    super(typeof source === "number" ? source : source.Which());
    this.m_aSize = new Size(typeof source === "number" ? size : source.GetSize());
  }
  /** Original default factory Which0 and empty geometry. @returns Default item. */ static CreateDefault(): SvxSizeItem {
    return new SvxSizeItem(0);
  }
  /** Original borrowed const member,not a detached snapshot. @returns Stable geometry. */ GetSize(): ReadonlySize {
    return this.m_aSize;
  }
  /** Original value assignment retains member identity. @param size - Actual geometry. @returns Nothing. */ SetSize(
    size: ReadonlySize,
  ): void {
    this.m_aSize.setWidth(size.Width());
    this.m_aSize.setHeight(size.Height());
  }
  /** Original width. @returns Width. */ GetWidth(): number {
    return this.m_aSize.getWidth();
  }
  /** Original height. @returns Height. */ GetHeight(): number {
    return this.m_aSize.getHeight();
  }
  /** Original width mutation. @param value - Width. @returns Nothing. */ SetWidth(
    value: number,
  ): void {
    this.m_aSize.setWidth(value);
  }
  /** Original height mutation. @param value - Height. @returns Nothing. */ SetHeight(
    value: number,
  ): void {
    this.m_aSize.setHeight(value);
  }
  /** Original implicit value copy and ignored pool. @param pool - Unused pool. @returns Independent item. */ override Clone(
    pool?: SfxItemPool,
  ): SvxSizeItem {
    void pool;
    return new SvxSizeItem(this);
  }
  /** Native same-type payload equality omits Which. Cross-type comparisons lie outside the asserted native domain. @param other - Candidate. @returns Equal dimensions. */ override equals(
    other: SfxPoolItem,
  ): boolean {
    return (
      other instanceof SvxSizeItem &&
      other.constructor === this.constructor &&
      this.GetWidth() === other.GetWidth() &&
      this.GetHeight() === other.GetHeight()
    );
  }
  /** Existing no-output browser projection;real native calls use Any. @returns Scalar dimensions. */ override QueryValue(): Readonly<{
    Width: number;
    Height: number;
  }>;
  /** Original Any/member contract. @param output - Actual destination. @param member - Native member. @returns Native result. */ override QueryValue(
    output: Any,
    member?: number,
  ): boolean;
  /** Native narrows to awt signed32 before optional metric conversion. @param output - Optional actual Any. @param member - Member/convert flag. @returns Native success or browser data. */ override QueryValue(
    output?: Any,
    member = 0,
  ): boolean | Readonly<{ Width: number; Height: number }> {
    const value = new UnoSize(this.GetWidth(), this.GetHeight()),
      convert = (member & CONVERT_TWIPS) !== 0;
    member &= ~CONVERT_TWIPS;
    if (convert) {
      value.Height = Number(convertTwipToMm100(BigInt(value.Height)));
      value.Width = Number(convertTwipToMm100(BigInt(value.Width)));
    }
    if (output === undefined) return { Width: value.Width, Height: value.Height };
    switch (member) {
      case MID_SIZE_SIZE:
        output.insert(value, sizeType);
        break;
      case MID_SIZE_WIDTH:
        output.insert([value.Width], "sal_Int32");
        break;
      case MID_SIZE_HEIGHT:
        output.insert([value.Height], "sal_Int32");
        break;
      default:
        return false;
    }
    return true;
  }
  /** Original typed extraction and conversion,including HEIGHT failure success without mutation. @param value - Actual input Any. @param member - Native member/flag. @returns Native result. */ override PutValue(
    value: Any,
    member: number,
  ): boolean {
    const convert = (member & CONVERT_TWIPS) !== 0;
    member &= ~CONVERT_TWIPS;
    switch (member) {
      case MID_SIZE_SIZE: {
        const size = new UnoSize();
        if (!value.extract(size, sizeType)) return false;
        if (convert) {
          size.Height = Number(toTwips(BigInt(size.Height), Length.mm100));
          size.Width = Number(toTwips(BigInt(size.Width), Length.mm100));
        }
        this.SetSize(new Size(size.Width, size.Height));
        break;
      }
      case MID_SIZE_WIDTH: {
        const scalar: [number] = [0];
        if (!value.extract(scalar, "sal_Int32")) return false;
        this.SetWidth(convert ? Number(toTwips(BigInt(scalar[0]), Length.mm100)) : scalar[0]);
        break;
      }
      case MID_SIZE_HEIGHT: {
        const scalar: [number] = [0];
        if (!value.extract(scalar, "sal_Int32")) return true;
        this.SetHeight(convert ? Number(toTwips(BigInt(scalar[0]), Length.mm100)) : scalar[0]);
        break;
      }
      default:
        return false;
    }
    return true;
  }
  /** Original llround scaling in the finite safe-integer geometry domain. @param scale - Factor. @returns Nothing. */ override ScaleMetrics(
    scale: number,
  ): void {
    const width = this.GetWidth() * scale,
      height = this.GetHeight() * scale;
    this.SetWidth(width < 0 ? -Math.round(-width) : Math.round(width));
    this.SetHeight(height < 0 ? -Math.round(-height) : Math.round(height));
  }
  /** Original metric support. @returns True. */ override HasMetrics(): boolean {
    return true;
  }
}
