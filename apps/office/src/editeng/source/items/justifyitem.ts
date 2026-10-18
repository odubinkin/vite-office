/** @fileoverview Original shared cell alignment value/Any contracts from justifyitem.hxx/cxx; localized presentation remains pending. */
import { SfxEnumItem } from "../../../svl/inc/eitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import { CONVERT_TWIPS } from "../../../svl/inc/poolitem";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import type { UnoTypeArgument } from "../../../cppu/inc/unotype";
import {
  SvxCellHorJustify as H,
  SvxCellVerJustify as V,
  SvxCellJustifyMethod as J,
} from "../../inc/svxenum";
import { MID_HORJUST_ADJUST, MID_HORJUST_HORJUST } from "../../inc/memberids";
import {
  CellHoriJustify as UH,
  cppu_detail_getUnoType_CellHoriJustify as horiType,
} from "../../../offapi/com/sun/star/table/CellHoriJustify";
import {
  VerticalAlignment as UV,
  cppu_detail_getUnoType_VerticalAlignment as verticalType,
} from "../../../offapi/com/sun/star/style/VerticalAlignment";
import { ParagraphAdjust as P } from "../../../offapi/com/sun/star/style/ParagraphAdjust";
import { CellVertJustify2 as CV } from "../../../offapi/com/sun/star/table/CellVertJustify2";
import { CellJustifyMethod as CJ } from "../../../offapi/com/sun/star/table/CellJustifyMethod";
/** Explicit existing-browser scalar binding alongside original actual Any extraction. @param input - Actual Any or plain scalar. @param result - Native numeric destination. @param type - Original declared destination type. @returns Extraction success. */
function extract(input: unknown, result: [number], type: Exclude<UnoTypeArgument, "Any">): boolean {
  if (input instanceof Any) return input.extract(result, type);
  if (typeof input !== "number" || !Number.isInteger(input)) return false;
  const narrow = type === "sal_Int16";
  if (input < (narrow ? -32768 : -2147483648) || input > (narrow ? 32767 : 2147483647))
    return false;
  result[0] = input | 0;
  return true;
}
/** Original Any insertion or explicit plain numeric browser output. @param output - Actual Any or member selector. @param value - Original payload. @param type - Original declared payload type. @returns Native success or numeric projection. */
function query(
  output: Any | number,
  value: number,
  type: Exclude<UnoTypeArgument, "Any">,
): boolean | number {
  if (output instanceof Any) {
    output.insert([value], type);
    return true;
  }
  return value;
}
/** Original shared horizontal cell alignment item. */
export class SvxHorJustifyItem extends SfxEnumItem<H> {
  /** Original Which/default, explicit-value and implicit-copy forms. @param args - Native constructor selection. @returns Item. */
  constructor(
    ...args: [which: number] | [value: H, which: number] | [source: Readonly<SvxHorJustifyItem>]
  ) {
    if (args.length === 2) super(args[1], args[0]);
    else if (typeof args[0] === "number") super(args[0], H.Standard);
    else super(args[0]);
  }
  /** Original zero-Which Standard factory. @returns Default item. */
  public static CreateDefault(): SvxHorJustifyItem {
    return new SvxHorJustifyItem(H.Standard, 0);
  }
  /** Original implicit-copy Clone retains Which. @param pool - Unused pool. @returns Independent item. */
  public override Clone(pool?: SfxItemPool): SvxHorJustifyItem {
    void pool;
    return new SvxHorJustifyItem(this);
  }
  /** Default browser member has a numeric projection. @returns Native mapped value. */
  public override QueryValue(): number;
  /** Explicit browser member projection. @param member - Original member. @returns Mapped value, or absent for unknown horizontal member. */
  public override QueryValue(member: number): number | undefined;
  /** Original actual Any output form. @param output - Native destination. @param member - Original member. @returns Success. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original unsigned8 member/CONVERT_TWIPS selection. @param output - Actual Any or browser member. @param member - Native output member. @returns Native success or plain value. */
  public override QueryValue(output: Any | number = 0, member = 0): boolean | number | undefined {
    const id = (output instanceof Any ? member : output) & 0xff & ~CONVERT_TWIPS;
    if (id === MID_HORJUST_HORJUST) {
      let value = UH.STANDARD;
      switch (this.GetValue()) {
        case H.Standard:
          value = UH.STANDARD;
          break;
        case H.Left:
          value = UH.LEFT;
          break;
        case H.Center:
          value = UH.CENTER;
          break;
        case H.Right:
          value = UH.RIGHT;
          break;
        case H.Block:
          value = UH.BLOCK;
          break;
        case H.Repeat:
          value = UH.REPEAT;
          break;
      }
      return query(output, value, horiType);
    }
    if (id === MID_HORJUST_ADJUST) {
      let value = P.LEFT;
      switch (this.GetValue()) {
        case H.Standard:
        case H.Repeat:
        case H.Left:
          value = P.LEFT;
          break;
        case H.Center:
          value = P.CENTER;
          break;
        case H.Right:
          value = P.RIGHT;
          break;
        case H.Block:
          value = P.BLOCK;
          break;
      }
      return query(output, value, "sal_Int16");
    }
    return output instanceof Any ? true : undefined;
  }
  /** Original enum/integer and short paragraph extraction; unknown member succeeds without mutation. @param input - Actual Any or plain scalar. @param member - Original member. @returns Success. */
  public override PutValue(input: unknown, member = 0): boolean {
    const id = member & 0xff & ~CONVERT_TWIPS;
    switch (id) {
      case MID_HORJUST_HORJUST: {
        const value: [number] = [0];
        if (!extract(input, value, horiType) && !extract(input, value, "sal_Int32")) return false;
        let result = H.Standard;
        switch (value[0]) {
          case UH.STANDARD:
            result = H.Standard;
            break;
          case UH.LEFT:
            result = H.Left;
            break;
          case UH.CENTER:
            result = H.Center;
            break;
          case UH.RIGHT:
            result = H.Right;
            break;
          case UH.BLOCK:
            result = H.Block;
            break;
          case UH.REPEAT:
            result = H.Repeat;
            break;
          default:
            break;
        }
        this.SetValue(result);
        break;
      }
      case MID_HORJUST_ADJUST: {
        const value: [number] = [0];
        if (!extract(input, value, "sal_Int16")) return false;
        let result = H.Standard;
        switch (value[0]) {
          case P.LEFT:
            result = H.Left;
            break;
          case P.RIGHT:
            result = H.Right;
            break;
          case P.STRETCH:
          case P.BLOCK:
            result = H.Block;
            break;
          case P.CENTER:
            result = H.Center;
            break;
          default:
            break;
        }
        this.SetValue(result);
        break;
      }
    }
    return true;
  }
}
/** Original shared vertical cell alignment item. */
export class SvxVerJustifyItem extends SfxEnumItem<V> {
  /** Original Which/default, explicit-value and implicit-copy forms. @param args - Native constructor selection. @returns Item. */
  constructor(
    ...args: [which: number] | [value: V, which: number] | [source: Readonly<SvxVerJustifyItem>]
  ) {
    if (args.length === 2) super(args[1], args[0]);
    else if (typeof args[0] === "number") super(args[0], V.Standard);
    else super(args[0]);
  }
  /** Original zero-Which Standard factory. @returns Default item. */
  public static CreateDefault(): SvxVerJustifyItem {
    return new SvxVerJustifyItem(V.Standard, 0);
  }
  /** Original implicit-copy Clone retains Which. @param pool - Unused pool. @returns Independent item. */
  public override Clone(pool?: SfxItemPool): SvxVerJustifyItem {
    void pool;
    return new SvxVerJustifyItem(this);
  }
  /** Default browser member has a numeric projection. @returns Native mapped value. */
  public override QueryValue(): number;
  /** Explicit browser member projection. @param member - Original member. @returns Mapped value, or absent for unknown horizontal member. */
  public override QueryValue(member: number): number | undefined;
  /** Original actual Any output form. @param output - Native destination. @param member - Original member. @returns Success. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original unsigned8 member/CONVERT_TWIPS selection. @param output - Actual Any or browser member. @param member - Native output member. @returns Native success or plain value. */
  public override QueryValue(output: Any | number = 0, member = 0): boolean | number | undefined {
    const id = (output instanceof Any ? member : output) & 0xff & ~CONVERT_TWIPS;
    if (id === MID_HORJUST_ADJUST) {
      let value = UV.TOP;
      switch (this.GetValue()) {
        case V.Top:
          value = UV.TOP;
          break;
        case V.Center:
          value = UV.MIDDLE;
          break;
        case V.Bottom:
          value = UV.BOTTOM;
          break;
        default:
          break;
      }
      return query(output, value, verticalType);
    }
    let value: number = CV.STANDARD;
    switch (this.GetValue()) {
      case V.Standard:
        value = CV.STANDARD;
        break;
      case V.Top:
        value = CV.TOP;
        break;
      case V.Center:
        value = CV.CENTER;
        break;
      case V.Bottom:
        value = CV.BOTTOM;
        break;
      case V.Block:
        value = CV.BLOCK;
        break;
      default:
        break;
    }
    return query(output, value, "sal_Int32");
  }
  /** Original typed enum member and default integer path, including ignored extraction failure. @param input - Actual Any or scalar. @param member - Original member. @returns Original success. */
  public override PutValue(input: unknown, member = 0): boolean {
    const id = member & 0xff & ~CONVERT_TWIPS;
    if (id === MID_HORJUST_ADJUST) {
      const value: [number] = [UV.TOP];
      if (!extract(input, value, verticalType)) return false;
      let result = V.Standard;
      switch (value[0]) {
        case UV.TOP:
          result = V.Top;
          break;
        case UV.MIDDLE:
          result = V.Center;
          break;
        case UV.BOTTOM:
          result = V.Bottom;
          break;
        default:
          break;
      }
      this.SetValue(result);
    } else {
      const value: [number] = [CV.STANDARD];
      extract(input, value, "sal_Int32");
      let result = V.Standard;
      switch (value[0]) {
        case CV.STANDARD:
          result = V.Standard;
          break;
        case CV.TOP:
          result = V.Top;
          break;
        case CV.CENTER:
          result = V.Center;
          break;
        case CV.BOTTOM:
          result = V.Bottom;
          break;
        case CV.BLOCK:
          result = V.Block;
          break;
        default:
          break;
      }
      this.SetValue(result);
    }
    return true;
  }
}
/** Original shared cell justification method item. */
export class SvxJustifyMethodItem extends SfxEnumItem<J> {
  /** Original explicit method/Which or implicit copy. @param args - Selected native form. @returns Item. */
  constructor(...args: [method: J, which: number] | [source: Readonly<SvxJustifyMethodItem>]) {
    if (args.length === 2) super(args[1], args[0]);
    else super(args[0]);
  }
  /** Original copy Clone retains Which. @param pool - Unused pool. @returns Independent item. */
  public override Clone(pool?: SfxItemPool): SvxJustifyMethodItem {
    void pool;
    return new SvxJustifyMethodItem(this);
  }
  /** Existing plain browser projection. @returns Method. */
  public override QueryValue(): number;
  /** Original Any output and ignored member. @param output - Actual Any. @param member - Ignored member. @returns True. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original method mapping; browser accepts no output argument. @param output - Native destination. @param member - Ignored member. @returns Native success or value. */
  public override QueryValue(output?: Any, member = 0): boolean | number {
    void member;
    let value: number = CJ.AUTO;
    switch (this.GetValue()) {
      case J.Auto:
        value = CJ.AUTO;
        break;
      case J.Distribute:
        value = CJ.DISTRIBUTE;
        break;
      default:
        break;
    }
    return query(output === undefined ? 0 : output, value, "sal_Int32");
  }
  /** Original integer extraction and unknown-value Auto fallback. @param input - Actual Any or scalar. @param member - Ignored member. @returns Extraction success. */
  public override PutValue(input: unknown, member = 0): boolean {
    void member;
    const value: [number] = [CJ.AUTO];
    if (!extract(input, value, "sal_Int32")) return false;
    let result = J.Auto;
    switch (value[0]) {
      case CJ.AUTO:
        result = J.Auto;
        break;
      case CJ.DISTRIBUTE:
        result = J.Distribute;
        break;
      default:
        break;
    }
    this.SetValue(result);
    return true;
  }
}
