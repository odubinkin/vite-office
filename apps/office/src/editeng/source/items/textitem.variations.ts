/** @fileoverview Original SvxFontVariationsItem owned vector/copy/equality,serialization and Any boundary from textitem.cxx;native float-hash responsibility remains unported. */
import { SfxPoolItem } from "../../../svl/source/items/poolitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import {
  Variation,
  VariationsFromString,
  VariationsToString,
} from "../../../vcl/inc/font/Variation";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import type { MapUnit } from "../../../tools/inc/mapunit";
import type { SfxItemPresentation } from "../../../svl/inc/poolitem";

/** Original font-axis pooled value;vector order,duplicates and IEEE float values are retained. */
export class SvxFontVariationsItem extends SfxPoolItem {
  private maVariations: Variation[];
  /** Original empty/vector and implicit-copy construction. Native moved-vector syntax is erased into a value copy. @param args - Original constructor form. @returns Owned item. */
  constructor(
    ...args:
      | [which: number]
      | [variations: readonly Readonly<Variation>[], which: number]
      | [source: Readonly<SvxFontVariationsItem>]
  ) {
    const input = args[0];
    super(
      typeof input === "number"
        ? input
        : "GetVariations" in input
          ? input.Which()
          : (args[1] as number),
    );
    const values =
      typeof input === "number" ? [] : "GetVariations" in input ? input.GetVariations() : input;
    this.maVariations = values.map(
      /** Original aggregate value copy. @param value - Actual axis. @returns Independent aggregate. */
      (value) => new Variation(value),
    );
  }
  /** Original stable const vector reference. @returns Borrowed ordered values. */
  GetVariations(): readonly Readonly<Variation>[] {
    return this.maVariations;
  }
  /** Original vector equality,including IEEE NaN inequality and signed-zero equality;Which is outside payload comparison. @param other - Compared pool value. @returns Equality. */
  override equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxFontVariationsItem &&
      this.maVariations.length === other.maVariations.length &&
      this.maVariations.every(
        /** Original ordered aggregate comparison. @param value - Left axis. @param index - Position. @returns Equality. */
        (value, index) => value.equals(other.maVariations[index] as Variation),
      )
    );
  }
  /** Original independent implicit-copy clone. @param pool - Unused native pool. @returns Owned concrete value. */
  override Clone(pool?: SfxItemPool): SvxFontVariationsItem {
    void pool;
    return new SvxFontVariationsItem(this);
  }
  /** Original content presentation uses the same native serialization as UNO. @param presentation - Ignored degree. @param coreMetric - Ignored unit. @param presentationMetric - Ignored unit. @param output - Native string output. @param intl - Unused provider. @returns True. */
  GetPresentation(
    presentation: SfxItemPresentation,
    coreMetric: MapUnit,
    presentationMetric: MapUnit,
    output: OUString,
    intl: unknown,
  ): boolean {
    void presentation;
    void coreMetric;
    void presentationMetric;
    void intl;
    const value = VariationsToString(this.maVariations);
    try {
      output.assign(value);
    } finally {
      value.dispose();
    }
    return true;
  }
  /** Inherited browser no-argument unsupported projection. @returns Undefined. */
  override QueryValue(): undefined;
  /** Original typed Unicode Any query. @param output - Real Any output. @param member - Ignored selector. @returns True. */
  override QueryValue(output: Any, member?: number): boolean;
  /** Original query retains actual native string/Any ownership. @param output - Optional actual output. @param member - Ignored selector. @returns Success or unsupported browser projection. */
  override QueryValue(output?: Any, member = 0): boolean | undefined {
    void member;
    if (output === undefined) return undefined;
    const value = VariationsToString(this.maVariations);
    try {
      output.insert([value.pData], "OUString");
    } finally {
      value.dispose();
    }
    return true;
  }
  /** Original string-only extraction replaces the vector even for an empty or entirely invalid string. @param input - Actual typed Any. @param member - Ignored selector. @returns Whether extracted,without mutation on failure. */
  override PutValue(input: unknown, member: number): boolean {
    void member;
    const value = new OUString();
    try {
      if (!(input instanceof Any) || !input.extract(value, "OUString")) return false;
      this.maVariations = VariationsFromString(value.getStr().subarray(0, value.getLength()));
      return true;
    } finally {
      value.dispose();
    }
  }
}
