/** @fileoverview Original integer item value contracts; existing browser scalar range guards remain explicit boundaries. */
import { SfxPoolItem } from "./poolitem";
import type { SfxItemPool } from "./itempool";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { hash_combine } from "../../../o3tl/inc/hash_combine";

/** Original unsigned32 item; ordinary JS values replace native object storage. */
export class CntUInt32Item extends SfxPoolItem {
  private value: number;
  /** Original scalar and implicit-copy forms, retaining checked browser scalar inputs. @param args - Native value or actual const source. @returns Item. */
  constructor(...args: [which: number, value: number] | [source: Readonly<CntUInt32Item>]) {
    const source = args[0];
    super(typeof source === "number" ? source : source.Which());
    this.value = typeof source === "number" ? (args[1] as number) : source.GetValue();
    this.SetValue(this.value);
  }
  /** Original unsigned value query. @returns Stored payload. */
  public GetValue(): number {
    return this.value;
  }
  /** Original value assignment over the existing checked browser unsigned32 scalar domain. @param value - Valid scalar. @returns Nothing. */
  public SetValue(value: number): void {
    if (!Number.isInteger(value) || value < 0 || value > 0xffffffff)
      throw new Error("CntUInt32Item value is outside the unsigned 32-bit range.");
    this.value = value;
  }
  /** Original implicit-copy Clone retains Which. @param pool - Unused native pool. @returns Independent item. */
  public Clone(pool?: SfxItemPool): CntUInt32Item {
    void pool;
    return new CntUInt32Item(this);
  }
  /** Original same-type payload comparison; invalid native-type inputs have only a host false guard. @param other - Candidate. @returns Equality. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof CntUInt32Item &&
      other.constructor === this.constructor &&
      other.value === this.value
    );
  }
  /** Original hash support. @returns True. */
  public supportsHashCode(): boolean {
    return true;
  }
  /** Original Which/value fold through the existing unsigned64 seed family and unsigned identity-key binding. @returns Logical unsigned64 hash, not persisted data. */
  public hashCode(): bigint {
    const seed: [bigint] = [0n];
    hash_combine(seed, this.Which());
    hash_combine(seed, this.value);
    return seed[0];
  }
  /** Existing browser scalar projection. @returns Queried numeric payload. */
  public override QueryValue(): number;
  /** Original typed Any output form. @param output - Actual output Any. @param member - Ignored native member. @returns True. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original unconditional payload query with existing scalar browser projection. @param output - Optional native output. @param member - Ignored member. @returns Native success or numeric value. */
  public override QueryValue(output?: Any, member = 0): boolean | number {
    void member;
    const value = this.value | 0;
    if (output === undefined) return value;
    output.insert([value], "sal_Int32");
    return true;
  }
  /** Original typed Any extraction and explicit legacy signed32 browser transport. @param input - Actual Any or signed32 scalar. @param member - Ignored member, optional in the existing browser API. @returns Success without mutation on failure. */
  public override PutValue(input: unknown, member = 0): boolean {
    void member;
    const result: [number] = [this.value];
    if (input instanceof Any) {
      if (!input.extract(result, "sal_Int32")) return false;
    } else {
      if (
        typeof input !== "number" ||
        !Number.isInteger(input) ||
        input < -2147483648 ||
        input > 2147483647
      )
        return false;
      result[0] = input;
    }
    this.value = result[0] >>> 0;
    return true;
  }
}

/** Original unsigned16 item; ordinary JS values replace native object storage. */
export class CntUInt16Item extends SfxPoolItem {
  private value: number;
  /** Original scalar and implicit-copy forms, retaining checked browser scalar inputs. @param args - Native value or actual const source. @returns Item. */
  constructor(...args: [which: number, value: number] | [source: Readonly<CntUInt16Item>]) {
    const source = args[0];
    super(typeof source === "number" ? source : source.Which());
    this.value = typeof source === "number" ? (args[1] as number) : source.GetValue();
    this.SetValue(this.value);
  }
  /** Original unsigned value query. @returns Stored payload. */
  public GetValue(): number {
    return this.value;
  }
  /** Original value assignment over the existing checked browser unsigned16 scalar domain. @param value - Valid scalar. @returns Nothing. */
  public SetValue(value: number): void {
    if (!Number.isInteger(value) || value < 0 || value > 65535)
      throw new Error("CntUInt16Item value is outside the unsigned 16-bit range.");
    this.value = value;
  }
  /** Original implicit-copy Clone retains Which. @param pool - Unused native pool. @returns Independent item. */
  public Clone(pool?: SfxItemPool): CntUInt16Item {
    void pool;
    return new CntUInt16Item(this);
  }
  /** Original same-type payload comparison; invalid native-type inputs have only a host false guard. @param other - Candidate. @returns Equality. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof CntUInt16Item &&
      other.constructor === this.constructor &&
      other.value === this.value
    );
  }
  /** Original hash support. @returns True. */
  public supportsHashCode(): boolean {
    return true;
  }
  /** Original Which/value fold through the existing unsigned64 seed family and unsigned identity-key binding. @returns Logical unsigned64 hash, not persisted data. */
  public hashCode(): bigint {
    const seed: [bigint] = [0n];
    hash_combine(seed, this.Which());
    hash_combine(seed, this.value);
    return seed[0];
  }
  /** Existing browser scalar projection. @returns Queried numeric payload. */
  public override QueryValue(): number;
  /** Original typed Any output form. @param output - Actual output Any. @param member - Ignored native member. @returns True. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original unconditional payload query with existing scalar browser projection. @param output - Optional native output. @param member - Ignored member. @returns Native success or numeric value. */
  public override QueryValue(output?: Any, member = 0): boolean | number {
    void member;
    const value = this.value;
    if (output === undefined) return value;
    output.insert([value], "sal_uInt16");
    return true;
  }
  /** Original typed Any extraction and explicit legacy signed32 browser transport. @param input - Actual Any or signed32 scalar. @param member - Ignored member, optional in the existing browser API. @returns Success without mutation on failure. */
  public override PutValue(input: unknown, member = 0): boolean {
    void member;
    const result: [number] = [this.value];
    if (input instanceof Any) {
      if (!input.extract(result, "sal_uInt16") && !input.extract(result, "sal_Int32")) return false;
    } else {
      if (
        typeof input !== "number" ||
        !Number.isInteger(input) ||
        input < -2147483648 ||
        input > 2147483647
      )
        return false;
      result[0] = input;
    }
    this.value = result[0] & 0xffff;
    return true;
  }
}

/** Original signed32 item; ordinary JS values replace native object storage. */
export class CntInt32Item extends SfxPoolItem {
  private value: number;
  /** Original scalar and implicit-copy forms, retaining checked browser scalar inputs. @param args - Native value or actual const source. @returns Item. */
  constructor(...args: [which: number, value: number] | [source: Readonly<CntInt32Item>]) {
    const source = args[0];
    super(typeof source === "number" ? source : source.Which());
    this.value = typeof source === "number" ? (args[1] as number) : source.GetValue();
    this.SetValue(this.value);
  }
  /** Original signed value query. @returns Stored payload. */
  public GetValue(): number {
    return this.value;
  }
  /** Original value assignment over the existing checked browser signed32 scalar domain. @param value - Valid scalar. @returns Nothing. */
  public SetValue(value: number): void {
    if (!Number.isInteger(value) || value < -2147483648 || value > 2147483647)
      throw new Error("CntInt32Item value is outside the signed 32-bit range.");
    this.value = value | 0;
  }
  /** Original implicit-copy Clone retains Which. @param pool - Unused native pool. @returns Independent item. */
  public Clone(pool?: SfxItemPool): CntInt32Item {
    void pool;
    return new CntInt32Item(this);
  }
  /** Original same-type payload comparison; invalid native-type inputs have only a host false guard. @param other - Candidate. @returns Equality. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof CntInt32Item &&
      other.constructor === this.constructor &&
      other.value === this.value
    );
  }
  /** Original hash support. @returns True. */
  public supportsHashCode(): boolean {
    return true;
  }
  /** Original Which/value fold through the existing unsigned64 seed family and integer identity-key binding. @returns Logical unsigned64 hash, not persisted data. */
  public hashCode(): bigint {
    const seed: [bigint] = [0n];
    hash_combine(seed, this.Which());
    hash_combine(seed, this.value);
    return seed[0];
  }
  /** Existing browser scalar projection. @returns Queried numeric payload. */
  public override QueryValue(): number;
  /** Original typed Any output form. @param output - Actual output Any. @param member - Ignored native member. @returns True. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original unconditional payload query with existing scalar browser projection. @param output - Optional native output. @param member - Ignored member. @returns Native success or numeric value. */
  public override QueryValue(output?: Any, member = 0): boolean | number {
    void member;
    const value = this.value | 0;
    if (output === undefined) return value;
    output.insert([value], "sal_Int32");
    return true;
  }
  /** Original typed Any extraction and explicit signed32 browser transport. @param input - Actual Any or signed32 scalar. @param member - Ignored member, optional in the existing browser API. @returns Success without mutation on failure. */
  public override PutValue(input: unknown, member = 0): boolean {
    void member;
    const result: [number] = [this.value];
    if (input instanceof Any) {
      if (!input.extract(result, "sal_Int32")) return false;
    } else {
      if (
        typeof input !== "number" ||
        !Number.isInteger(input) ||
        input < -2147483648 ||
        input > 2147483647
      )
        return false;
      result[0] = input;
    }
    this.value = result[0] | 0;
    return true;
  }
}
