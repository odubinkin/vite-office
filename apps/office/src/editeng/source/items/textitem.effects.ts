/** @fileoverview Original strikeout/emphasis value and Any methods from textitem.cxx; localized resources and native caches remain separate. */
import { SfxEnumItem } from "../../../svl/inc/eitem";
import { SfxUInt16Item } from "../../../svl/inc/intitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import { Any2Bool } from "../../../svl/inc/poolitem";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { FontStrikeout as S, FontEmphasisMark as M } from "../../../tools/inc/fontenum";
import { FontEmphasis as F } from "../../../offapi/com/sun/star/text/FontEmphasis";
import { MID_CROSSED_OUT, MID_CROSS_OUT, MID_EMPHASIS } from "../../inc/memberids";
/** Original strikeout enum with bool and short member projections. */
export class SvxCrossedOutItem extends SfxEnumItem<S> {
  /** Original value/Which and implicit copy forms. @param args - Native selected form. @returns Item. */
  constructor(...args: [value: S, which: number] | [source: Readonly<SvxCrossedOutItem>]) {
    if (args.length === 1) super(args[0]);
    else super(args[1], args[0]);
  }
  /** Original default NONE factory. @returns Item. */
  public static CreateDefault(): SvxCrossedOutItem {
    return new SvxCrossedOutItem(S.STRIKEOUT_NONE, 0);
  }
  /** Original copy Clone retaining Which. @param pool - Unused pool. @returns Independent item. */
  public override Clone(pool?: SfxItemPool): SvxCrossedOutItem {
    void pool;
    return new SvxCrossedOutItem(this);
  }
  /** Original enum cast getter. @returns Strikeout. */
  public GetStrikeout(): S {
    return this.GetValue();
  }
  /** Original bool support. @returns True. */
  public override HasBoolValue(): boolean {
    return true;
  }
  /** Original all-non-NONE bool projection. @returns Whether active. */
  public override GetBoolValue(): boolean {
    return this.GetValue() !== S.STRIKEOUT_NONE;
  }
  /** Original bool writes select only SINGLE/NONE. @param value - Bool. @returns Nothing. */
  public override SetBoolValue(value: boolean): void {
    this.SetValue(value ? S.STRIKEOUT_SINGLE : S.STRIKEOUT_NONE);
  }
  /** Existing browser scalar enum projection. @returns Unsigned enum payload. */
  public override QueryValue(): number;
  /** Original member query. @param output - Actual Any. @param member - Member. @returns True including unknown members. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original unknown-member success leaves output untouched. @param output - Optional actual Any. @param member - Native member. @returns Native success or scalar. */
  public override QueryValue(output?: Any, member = 0): boolean | number {
    if (output === undefined) return this.GetEnumValue();
    switch (member & 0xff & ~0x80) {
      case MID_CROSSED_OUT:
        output.insert([this.GetBoolValue()], "bool");
        break;
      case MID_CROSS_OUT:
        output.insert([(this.GetValue() << 16) >> 16], "sal_Int16");
        break;
    }
    return true;
  }
  /** Original bool fallback and signed32 enum extraction. @param input - Actual Any or scalar. @param member - Native member. @returns Success; unknown member is unchanged success. */
  public override PutValue(input: unknown, member = 0): boolean {
    switch (member & 0xff & ~0x80) {
      case MID_CROSSED_OUT:
        this.SetBoolValue(Any2Bool(input));
        break;
      case MID_CROSS_OUT: {
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
        this.SetValue(value[0]);
        break;
      }
    }
    return true;
  }
}
/** Original unsigned16 emphasis storage and nine native wire mappings. */
export class SvxEmphasisMarkItem extends SfxUInt16Item {
  /** Original typed flag/Which and implicit copy forms. @param args - Selected native form. @returns Item. */
  constructor(...args: [value: M, which: number] | [source: Readonly<SvxEmphasisMarkItem>]) {
    if (args.length === 1) super(args[0]);
    else super(args[1], args[0] & 0xffff);
  }
  /** Original NONE factory. @returns Item. */
  public static override CreateDefault(): SvxEmphasisMarkItem {
    return new SvxEmphasisMarkItem(M.NONE, 0);
  }
  /** Original copy Clone retains Which. @param pool - Unused pool. @returns Independent item. */
  public override Clone(pool?: SfxItemPool): SvxEmphasisMarkItem {
    void pool;
    return new SvxEmphasisMarkItem(this);
  }
  /** Original flag cast getter. @returns Flags. */
  public GetEmphasisMark(): M {
    return this.GetValue();
  }
  /** Existing browser scalar storage projection. @returns Unsigned stored value. */
  public override QueryValue(): number;
  /** Original short member output. @param output - Actual Any. @param member - Native member. @returns True. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original unknown-member unchanged success and style fallback to NONE. @param output - Optional Any. @param member - Native member. @returns Native success or browser scalar. */
  public override QueryValue(output?: Any, member = 0): boolean | number {
    if (output === undefined) return this.GetValue();
    if ((member & 0xff & ~0x80) === MID_EMPHASIS) {
      const value = this.GetEmphasisMark();
      let result = 0;
      switch (value & M.Style) {
        case M.NONE:
          result = F.NONE;
          break;
        case M.Dot:
          result = F.DOT_ABOVE;
          break;
        case M.Circle:
          result = F.CIRCLE_ABOVE;
          break;
        case M.Disc:
          result = F.DISK_ABOVE;
          break;
        case M.Accent:
          result = F.ACCENT_ABOVE;
          break;
        default:
          break;
      }
      if (result && value & M.PosBelow) result += 10;
      output.insert([result], "sal_Int16");
    }
    return true;
  }
  /** Original signed32 input with ignored-extraction sentinel and exact nine-value map. @param input - Actual Any or scalar. @param member - Native member. @returns Success; unknown member is unchanged success. */
  public override PutValue(input: unknown, member = 0): boolean {
    if ((member & 0xff & ~0x80) === MID_EMPHASIS) {
      const value: [number] = [-1];
      if (input instanceof Any) input.extract(value, "sal_Int32");
      else if (
        typeof input === "number" &&
        Number.isInteger(input) &&
        input >= -2147483648 &&
        input <= 2147483647
      )
        value[0] = input;
      let mark: M;
      switch (value[0]) {
        case F.NONE:
          mark = M.NONE;
          break;
        case F.DOT_ABOVE:
          mark = M.Dot | M.PosAbove;
          break;
        case F.CIRCLE_ABOVE:
          mark = M.Circle | M.PosAbove;
          break;
        case F.DISK_ABOVE:
          mark = M.Disc | M.PosAbove;
          break;
        case F.ACCENT_ABOVE:
          mark = M.Accent | M.PosAbove;
          break;
        case F.DOT_BELOW:
          mark = M.Dot | M.PosBelow;
          break;
        case F.CIRCLE_BELOW:
          mark = M.Circle | M.PosBelow;
          break;
        case F.DISK_BELOW:
          mark = M.Disc | M.PosBelow;
          break;
        case F.ACCENT_BELOW:
          mark = M.Accent | M.PosBelow;
          break;
        default:
          return false;
      }
      this.SetValue(mark);
    }
    return true;
  }
}
