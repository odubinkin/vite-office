/** @fileoverview Original cell margin/orientation value and Any responsibilities; native presentation remains pending. */
import { SfxPoolItem } from "../../../svl/source/items/poolitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import { SfxEnumItem } from "../../../svl/inc/eitem";
import { CONVERT_TWIPS } from "../../../svl/inc/poolitem";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { SvxCellOrientation as O } from "../../../editeng/inc/svxenum";
import type { Degree100 } from "../../../tools/inc/degree";
import { convertTwipToMm100 } from "../../../tools/inc/UnitConversion";
import { toTwips, Length } from "../../../o3tl/inc/unit_conversion";
import {
  CellOrientation as U,
  cppu_detail_getUnoType_CellOrientation as orientationType,
} from "../../../offapi/com/sun/star/table/CellOrientation";
import {
  MID_MARGIN_L_MARGIN as L,
  MID_MARGIN_R_MARGIN as R,
  MID_MARGIN_UP_MARGIN as T,
  MID_MARGIN_LO_MARGIN as B,
} from "../../inc/unomid";
/** Original shared orientation item over actual SfxEnumItem. */
export class SvxOrientationItem extends SfxEnumItem<O> {
  /** Original explicit enum, rotation+stacked and implicit copy forms. @param args - Selected native form. @returns Item. */
  constructor(
    ...args:
      | [value: O, which: number]
      | [rotation: Degree100, stacked: boolean, which: number]
      | [source: Readonly<SvxOrientationItem>]
  ) {
    if (args.length === 1) super(args[0]);
    else if (args.length === 2) super(args[1], args[0]);
    else {
      super(args[2], O.Standard);
      if (args[1]) this.SetValue(O.Stacked);
      else
        switch (args[0]) {
          case 9000:
            this.SetValue(O.BottomUp);
            break;
          case 27000:
            this.SetValue(O.TopBottom);
            break;
          default:
            this.SetValue(O.Standard);
        }
    }
  }
  /** Original copy-based Clone. @param pool - Unused pool. @returns Independent item. */
  public override Clone(pool?: SfxItemPool): SvxOrientationItem {
    void pool;
    return new SvxOrientationItem(this);
  }
  /** Existing browser enum scalar projection. @returns Orientation. */
  public override QueryValue(): number;
  /** Original Any output query. @param output - Actual output. @param member - Ignored member. @returns True. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original enum mapping; original member is ignored. @param output - Optional Any. @param member - Ignored member. @returns Success or browser scalar. */
  public override QueryValue(output?: Any, member = 0): boolean | number {
    void member;
    let value = U.STANDARD;
    switch (this.GetValue()) {
      case O.Standard:
        value = U.STANDARD;
        break;
      case O.TopBottom:
        value = U.TOPBOTTOM;
        break;
      case O.BottomUp:
        value = U.BOTTOMTOP;
        break;
      case O.Stacked:
        value = U.STACKED;
        break;
    }
    if (output === undefined) return value;
    output.insert([value], orientationType);
    return true;
  }
  /** Original enum extraction followed by signed32 fallback. @param input - Actual Any or browser signed32. @param member - Ignored member. @returns Success. */
  public override PutValue(input: unknown, member = 0): boolean {
    void member;
    const value: [number] = [0];
    if (input instanceof Any) {
      if (!input.extract(value, orientationType) && !input.extract(value, "sal_Int32"))
        return false;
    } else {
      if (
        typeof input !== "number" ||
        !Number.isInteger(input) ||
        input < -2147483648 ||
        input > 2147483647
      )
        return false;
      value[0] = input;
    }
    let result = O.Standard;
    switch (value[0]) {
      case U.STANDARD:
        result = O.Standard;
        break;
      case U.TOPBOTTOM:
        result = O.TopBottom;
        break;
      case U.BOTTOMTOP:
        result = O.BottomUp;
        break;
      case U.STACKED:
        result = O.Stacked;
        break;
      default:
        break;
    }
    this.SetValue(result);
    return true;
  }
}
/** Original signed16 four-sided cell margins, default20twips on each side. */
export class SvxMarginItem extends SfxPoolItem {
  private nLeftMargin: number;
  private nTopMargin: number;
  private nRightMargin: number;
  private nBottomMargin: number;
  /** Original Which/default, explicit fields or implicit copy. @param args - Native form. @returns Item. */
  constructor(
    ...args:
      | [which: number]
      | [left: number, top: number, right: number, bottom: number, which: number]
      | [source: Readonly<SvxMarginItem>]
  ) {
    const source = args[0];
    super(args.length === 5 ? args[4] : typeof source === "number" ? source : source.Which());
    if (args.length === 5) {
      this.nLeftMargin = (args[0] << 16) >> 16;
      this.nTopMargin = (args[1] << 16) >> 16;
      this.nRightMargin = (args[2] << 16) >> 16;
      this.nBottomMargin = (args[3] << 16) >> 16;
    } else if (typeof source === "number") {
      this.nLeftMargin = 20;
      this.nTopMargin = 20;
      this.nRightMargin = 20;
      this.nBottomMargin = 20;
    } else {
      this.nLeftMargin = source.GetLeftMargin();
      this.nTopMargin = source.GetTopMargin();
      this.nRightMargin = source.GetRightMargin();
      this.nBottomMargin = source.GetBottomMargin();
    }
  }
  /** Original zero-Which default factory. @returns Item. */
  public static CreateDefault(): SvxMarginItem {
    return new SvxMarginItem(0);
  }
  /** Original copy Clone. @param pool - Unused pool. @returns Independent item. */
  public Clone(pool?: SfxItemPool): SvxMarginItem {
    void pool;
    return new SvxMarginItem(this);
  }
  /** Original same-type payload comparison, ignoringWhich. @param other - Candidate. @returns Equality. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxMarginItem &&
      this.nLeftMargin === other.nLeftMargin &&
      this.nTopMargin === other.nTopMargin &&
      this.nRightMargin === other.nRightMargin &&
      this.nBottomMargin === other.nBottomMargin
    );
  }
  /** Original signed16 field read. @returns Margin in twips. */
  public GetLeftMargin(): number {
    return this.nLeftMargin;
  }
  /** Original signed16 field write. @param value - Native signed16 argument. @returns Nothing. */
  public SetLeftMargin(value: number): void {
    this.nLeftMargin = (value << 16) >> 16;
  }
  /** Original signed16 field read. @returns Margin in twips. */
  public GetTopMargin(): number {
    return this.nTopMargin;
  }
  /** Original signed16 field write. @param value - Native signed16 argument. @returns Nothing. */
  public SetTopMargin(value: number): void {
    this.nTopMargin = (value << 16) >> 16;
  }
  /** Original signed16 field read. @returns Margin in twips. */
  public GetRightMargin(): number {
    return this.nRightMargin;
  }
  /** Original signed16 field write. @param value - Native signed16 argument. @returns Nothing. */
  public SetRightMargin(value: number): void {
    this.nRightMargin = (value << 16) >> 16;
  }
  /** Original signed16 field read. @returns Margin in twips. */
  public GetBottomMargin(): number {
    return this.nBottomMargin;
  }
  /** Original signed16 field write. @param value - Native signed16 argument. @returns Nothing. */
  public SetBottomMargin(value: number): void {
    this.nBottomMargin = (value << 16) >> 16;
  }
  /** Existing browser scalar member query. @param member - Native member. @returns Value or absent for unsupported member. */
  public override QueryValue(member?: number): number | undefined;
  /** Original native Any query. @param output - Actual destination. @param member - Native member. @returns Success. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original signed long output with twip conversion selected by the member bit. @param output - Actual Any or browser selector. @param member - Native output member. @returns Success or scalar. */
  public override QueryValue(output: Any | number = 0, member = 0): boolean | number | undefined {
    const id = (output instanceof Any ? member : output) & 0xff;
    let value: number;
    switch (id & ~CONVERT_TWIPS) {
      case L:
        value = this.nLeftMargin;
        break;
      case R:
        value = this.nRightMargin;
        break;
      case T:
        value = this.nTopMargin;
        break;
      case B:
        value = this.nBottomMargin;
        break;
      default:
        return output instanceof Any ? false : undefined;
    }
    if (id & CONVERT_TWIPS) value = Number(convertTwipToMm100(BigInt(value)));
    if (output instanceof Any) {
      output.insert([value], "sal_Int32");
      return true;
    }
    return value;
  }
  /** Original upper-only limit and signed16 conversion, including negative wrap. @param input - Actual Any or signed32 scalar. @param member - Native member. @returns Admission success. */
  public override PutValue(input: unknown, member: number): boolean {
    const id = member & 0xff;
    const convert = (id & CONVERT_TWIPS) !== 0;
    const max = convert ? Number(convertTwipToMm100(32767n)) : 32767;
    const value: [number] = [0];
    if (input instanceof Any) {
      if (!input.extract(value, "sal_Int32")) return false;
    } else {
      if (
        typeof input !== "number" ||
        !Number.isInteger(input) ||
        input < -2147483648 ||
        input > 2147483647
      )
        return false;
      value[0] = input;
    }
    if (value[0] > max) return false;
    const result =
      (Number(convert ? toTwips(BigInt(value[0]), Length.mm100) : value[0]) << 16) >> 16;
    switch (id & ~CONVERT_TWIPS) {
      case L:
        this.nLeftMargin = result;
        break;
      case R:
        this.nRightMargin = result;
        break;
      case T:
        this.nTopMargin = result;
        break;
      case B:
        this.nBottomMargin = result;
        break;
      default:
        return false;
    }
    return true;
  }
}
