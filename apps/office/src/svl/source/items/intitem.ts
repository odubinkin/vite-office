/** @fileoverview Shared integer item value families from pinned svl/source/items/intitem.cxx. */

import { SfxPoolItem } from "./poolitem";
import { CntByteItem, CntInt32Item, CntUInt16Item, CntUInt32Item } from "./cintitem";

import type { SfxItemPool } from "./itempool";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { SfxItemPresentation } from "../../inc/poolitem";
import type { MapUnit } from "../../../tools/inc/mapunit";
/** Original unsigned32 subclass with default factory and implicit copying. */
export class SfxUInt32Item extends CntUInt32Item {
  /** Original zero/default/value and copy forms. @param source - Which or actual const source. @param value - Unsigned payload. @returns Item. */
  constructor(source: number | Readonly<SfxUInt32Item> = 0, value = 0) {
    if (typeof source === "number") super(source, value);
    else super(source);
  }
  /** Original zero-Which/zero-value factory. @returns Default item. */
  public static CreateDefault(): SfxUInt32Item {
    return new SfxUInt32Item();
  }
  /** Original copy-based Clone retains concrete type and Which. @param pool - Unused native pool. @returns Independent item. */
  public override Clone(pool?: SfxItemPool): SfxUInt32Item {
    void pool;
    return new SfxUInt32Item(this);
  }
}
/** Original unsigned16 subclass with default factory and implicit copying. */
export class SfxUInt16Item extends CntUInt16Item {
  /** Original zero/default/value and copy forms. @param source - Which or actual const source. @param value - Unsigned payload. @returns Item. */
  constructor(source: number | Readonly<SfxUInt16Item> = 0, value = 0) {
    if (typeof source === "number") super(source, value);
    else super(source);
  }
  /** Original zero-Which/zero-value factory. @returns Default item. */
  public static CreateDefault(): SfxUInt16Item {
    return new SfxUInt16Item();
  }
  /** Original copy-based Clone retains concrete type and Which. @param pool - Unused native pool. @returns Independent item. */
  public override Clone(pool?: SfxItemPool): SfxUInt16Item {
    void pool;
    return new SfxUInt16Item(this);
  }
}
/** Original signed16 pooled value with explicit checked JS scalar inputs. */
export class SfxInt16Item extends SfxPoolItem {
  private value: number;
  /** Original default/value/implicit-copy forms over the existing checked host scalar domain. @param source - Which or copied value. @param value - Signed16 scalar. @returns Item. */
  public constructor(source: number | Readonly<SfxInt16Item> = 0, value = 0) {
    super(typeof source === "number" ? source : source.Which());
    this.value = typeof source === "number" ? value : source.GetValue();
    this.SetValue(this.value);
  }
  /** Original zero-Which/zero-value factory. @returns Default item. */
  public static CreateDefault(): SfxInt16Item {
    return new SfxInt16Item();
  }
  /** Original signed16 value query. @returns Stored payload. */
  public GetValue(): number {
    return this.value;
  }
  /** Original value assignment over the established checked JS signed16 input domain. @param value - Signed16 scalar. @returns Nothing. */
  public SetValue(value: number): void {
    if (!Number.isInteger(value) || value < -32768 || value > 32767)
      throw new Error("SfxInt16Item value is outside the signed 16-bit range.");
    this.value = value;
  }
  /** Original independent copy clone. @param pool - Unused native pool. @returns Copied item. */
  public Clone(pool?: SfxItemPool): SfxInt16Item {
    void pool;
    return new SfxInt16Item(this);
  }
  /** Original same-concrete-type payload equality; Which comparison belongs to areSame. @param other - Candidate item. @returns Whether stored values equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SfxInt16Item &&
      other.constructor === this.constructor &&
      other.value === this.value
    );
  }
  /** Original final hash-support flag. @returns True. */
  public supportsHashCode(): boolean {
    return true;
  }
  /** Original value-only size_t hash using the existing unsigned64 logical hash convention, never persisted as document data. @returns Value hash. */
  public hashCode(): bigint {
    return BigInt.asUintN(64, BigInt(this.value));
  }
  /** Existing browser scalar projection. @returns Signed16 value. */
  public override QueryValue(): number;
  /** Original short Any query ignoring the member selector. @param output - Actual output. @param member - Ignored member. @returns True. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original typed query alongside the existing browser scalar boundary. @param output - Optional actual Any. @param member - Ignored native selector. @returns Native success or scalar. */
  public override QueryValue(output?: Any, member = 0): number | boolean {
    void member;
    if (output === undefined) return this.value;
    output.insert([this.value], "sal_Int16");
    return true;
  }
  /** Original short extraction, preserving the value on failure. @param input - Actual Any. @param member - Ignored selector. @returns Extraction success. */
  public override PutValue(input: unknown, member: number): boolean {
    void member;
    const value: [number] = [0];
    if (!(input instanceof Any) || !input.extract(value, "sal_Int16")) return false;
    this.value = value[0];
    return true;
  }
  /** Original locale-independent OUString number presentation; no resources or locale service are used. @param presentation - Ignored degree. @param coreMetric - Ignored unit. @param presentationMetric - Ignored unit. @param text - Actual mutable output string. @param intl - Unused native provider parameter. @returns True. */
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
    text.assign(new OUString(OUString.number(this.value)));
    return true;
  }
}

/** Original signed32 subclass with default factory and implicit copying. */
export class SfxInt32Item extends CntInt32Item {
  /** Original zero/default/value and copy forms. @param source - Which or actual const source. @param value - Signed payload. @returns Item. */
  constructor(source: number | Readonly<SfxInt32Item> = 0, value = 0) {
    if (typeof source === "number") super(source, value);
    else super(source);
  }
  /** Original zero-Which/zero-value factory. @returns Default item. */
  public static CreateDefault(): SfxInt32Item {
    return new SfxInt32Item();
  }
  /** Original copy-based Clone retains concrete type and Which. @param pool - Unused native pool. @returns Independent item. */
  public override Clone(pool?: SfxItemPool): SfxInt32Item {
    void pool;
    return new SfxInt32Item(this);
  }
}

/** Original byte subclass with default factory and concrete copy cloning. */
export class SfxByteItem extends CntByteItem {
  /** Original default/value and implicit-copy forms. @param source - Which or const source. @param value - Unsigned byte. @returns Item. */
  constructor(source: number | Readonly<SfxByteItem> = 0, value = 0) {
    if (typeof source === "number") super(source, value);
    else super(source);
  }
  /** Original zero-Which/zero-value factory. @returns Default byte item. */
  public static CreateDefault(): SfxByteItem {
    return new SfxByteItem();
  }
  /** Original concrete copy clone. @param pool - Unused native pool. @returns Independent byte item. */
  public override Clone(pool?: SfxItemPool): SfxByteItem {
    void pool;
    return new SfxByteItem(this);
  }
}
