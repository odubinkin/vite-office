/** @fileoverview Original textitem.cxx pair/manual kerning and character-width value contracts; localized presentation deferred. */
import { SfxBoolItem } from "../../../svl/inc/eitem";
import { SfxInt16Item, SfxUInt16Item } from "../../../svl/inc/intitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import { CONVERT_TWIPS } from "../../../svl/inc/poolitem";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { convertTwipToMm100 } from "../../../tools/inc/UnitConversion";
import { toTwips, Length } from "../../../o3tl/inc/unit_conversion";

/** Original automatic pair-kerning bool item, reusing the actual shared bool contracts. */
export class SvxAutoKernItem extends SfxBoolItem {
  /** Original bool/Which and implicit-copy forms. @param args - Original arguments. @returns Item. */
  public constructor(
    ...args: [value: boolean, which: number] | [source: Readonly<SvxAutoKernItem>]
  ) {
    if (args.length === 1) super(args[0]);
    else super(args[1], args[0]);
  }
  /** Original false/Which0 factory. @returns Default item. */
  public static override CreateDefault(): SvxAutoKernItem {
    return new SvxAutoKernItem(false, 0);
  }
  /** Original independent concrete copy clone. @param pool - Unused pool. @returns Item. */
  public override Clone(pool?: SfxItemPool): SvxAutoKernItem {
    void pool;
    return new SvxAutoKernItem(this);
  }
}

/** Original manual character spacing, stored as signed16 twips. */
export class SvxKerningItem extends SfxInt16Item {
  /** Original value/Which and implicit-copy forms over the shared checked signed16 host domain. @param args - Original arguments. @returns Item. */
  public constructor(...args: [value: number, which: number] | [source: Readonly<SvxKerningItem>]) {
    if (args.length === 1) super(args[0]);
    else super(args[1], args[0]);
  }
  /** Original zero/Which0 factory. @returns Default item. */
  public static override CreateDefault(): SvxKerningItem {
    return new SvxKerningItem(0, 0);
  }
  /** Original independent concrete copy clone. @param pool - Unused pool. @returns Item. */
  public override Clone(pool?: SfxItemPool): SvxKerningItem {
    void pool;
    return new SvxKerningItem(this);
  }
  /** Original BigInt::Scale(double) is llround, represented by the existing JS sign-corrected Math.round pattern. Finite signed64 results are the native defined producer domain. @param scale - Factor. @returns Nothing. */
  public override ScaleMetrics(scale: number): void {
    const scaled = this.GetValue() * scale;
    this.SetValue(
      Number(BigInt.asIntN(16, BigInt(scaled < 0 ? -Math.round(-scaled) : Math.round(scaled)))),
    );
  }
  /** Original metric flag. @returns True. */
  public override HasMetrics(): boolean {
    return true;
  }
  /** Existing inherited scalar query. @returns Stored twips. */
  public override QueryValue(): number;
  /** Original typed short query, converting only when requested. @param output - Actual Any. @param member - Selector. @returns True. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original integral conversion and short narrowing, ignoring other selector bits. @param output - Optional actual Any. @param member - Unsigned8 selector. @returns Success or scalar. */
  public override QueryValue(output?: Any, member = 0): number | boolean {
    if (output === undefined) return this.GetValue();
    const value =
      (member & 0xff & CONVERT_TWIPS) !== 0
        ? Number(BigInt.asIntN(16, convertTwipToMm100(BigInt(this.GetValue()))))
        : this.GetValue();
    output.insert([value], "sal_Int16");
    return true;
  }
  /** Original short extraction and optional integral mm100-to-twip conversion. @param input - Actual Any. @param member - Unsigned8 selector. @returns Success, retaining value on extraction failure. */
  public override PutValue(input: unknown, member: number): boolean {
    const value: [number] = [0];
    if (!(input instanceof Any) || !input.extract(value, "sal_Int16")) return false;
    this.SetValue(
      (member & 0xff & CONVERT_TWIPS) !== 0
        ? Number(BigInt.asIntN(16, toTwips(BigInt(value[0]), Length.mm100)))
        : value[0],
    );
    return true;
  }
}

/** Original unsigned16 character-width percentage item with signed16 UNO transport. */
export class SvxCharScaleWidthItem extends SfxUInt16Item {
  /** Original value/Which and implicit-copy forms, retaining the shared checked unsigned16 host domain. @param args - Original arguments. @returns Item. */
  public constructor(
    ...args: [value: number, which: number] | [source: Readonly<SvxCharScaleWidthItem>]
  ) {
    if (args.length === 1) super(args[0]);
    else super(args[1], args[0]);
  }
  /** Original100percent/Which0 factory. @returns Default item. */
  public static override CreateDefault(): SvxCharScaleWidthItem {
    return new SvxCharScaleWidthItem(100, 0);
  }
  /** Original independent concrete copy clone. @param pool - Unused pool. @returns Item. */
  public override Clone(pool?: SfxItemPool): SvxCharScaleWidthItem {
    void pool;
    return new SvxCharScaleWidthItem(this);
  }
  /** Existing inherited unsigned16 scalar query. @returns Width percentage. */
  public override QueryValue(): number;
  /** Original short Any query with ignored member. @param output - Actual Any. @param member - Ignored selector. @returns True. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original unsigned-to-signed16 projection. @param output - Optional actual Any. @param member - Ignored selector. @returns Success or scalar. */
  public override QueryValue(output?: Any, member = 0): number | boolean {
    void member;
    if (output === undefined) return this.GetValue();
    output.insert([(this.GetValue() << 16) >> 16], "sal_Int16");
    return true;
  }
  /** Original signed16 extraction then unsigned16 assignment without percentage bounds. @param input - Actual Any. @param member - Ignored selector. @returns Extraction success. */
  public override PutValue(input: unknown, member: number): boolean {
    void member;
    const value: [number] = [0];
    if (!(input instanceof Any) || !input.extract(value, "sal_Int16")) return false;
    this.SetValue(value[0] & 0xffff);
    return true;
  }
}
