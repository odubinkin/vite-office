/** @fileoverview Original SfxGrabBagItem property-map contracts from grabbagitem.cxx; JS Map UTF16 value keys replace std::map key representation without native lifetime/cache machinery. */
import { SfxPoolItem } from "../../inc/poolitem";
import type { SfxItemPool } from "../../inc/itempool";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { uno_type_any_assign } from "../../../cppu/inc/uno/any2";
import type { uno_Any } from "../../../cppu/inc/uno/any2";
import { cpp_acquire, cpp_release } from "../../../cppu/inc/com/sun/star/uno/genfunc";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { cppu_detail_getUnoType_PropertyValue as propertyType } from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { rtl_uString_assign, rtl_ustr_hashCode_WithLength } from "../../../sal/inc/rtl/ustring.h";
import { hash_combine } from "../../../o3tl/inc/hash_combine";
/** Original const Any reference returned by the const map, borrowing the existing owner without a wrapper or extra lifetime protocol. */
export type GrabBagValueConstReference = Readonly<
  Omit<Any, "dispose" | "assign" | "moveAssign" | "setValue" | "clear" | "insert">
>;
/** Original PropertyValue compound member addresses in existing transport. */
type PropertyAddress = { get(offset: number): unknown };
/** Original compiler specialization over the real PropertyValue type and existing compound dispatcher. */
const Properties = Sequence.specialize<PropertyAddress>(propertyType, 48);
/** Original ordered key-to-Any value item. Native OUString map keys bind to primitive UTF16 strings for value equality, including embedded nul and surrogate units. */
export class SfxGrabBagItem extends SfxPoolItem {
  private readonly m_aMap = new Map<string, Any>();
  /** Original default/Which/map/implicit-copy forms; native rvalue lifetime syntax is erased without resetting the caller. @param args - Original constructor form. @returns Item. */
  constructor(
    ...args:
      | []
      | [which: number]
      | [which: number, map: ReadonlyMap<string, GrabBagValueConstReference>]
      | [source: Readonly<SfxGrabBagItem>]
  ) {
    const source = typeof args[0] === "object" ? args[0] : undefined;
    super(source === undefined ? ((args[0] as number | undefined) ?? 0) : source.Which());
    const map = source === undefined ? args[1] : source.GetGrabBag();
    if (map !== undefined)
      for (const [key, value] of sorted(map)) this.m_aMap.set(key, new Any(value as Any));
  }
  /** Original stable const map reference in native UTF16 key order. @returns Borrowed map. */
  GetGrabBag(): ReadonlyMap<string, GrabBagValueConstReference> {
    return this.m_aMap;
  }
  /** Original concrete value copy. @param pool - Unused native pool. @returns Independent copy. */
  override Clone(pool?: SfxItemPool): SfxGrabBagItem {
    void pool;
    return new SfxGrabBagItem(this);
  }
  /** Original type/payload comparison; base comparison does not compare Which. @param other - Actual pooled item. @returns Equality. */
  override equals(other: SfxPoolItem): boolean {
    if (!(other instanceof SfxGrabBagItem) || this.m_aMap.size !== other.m_aMap.size) return false;
    for (const [key, value] of this.m_aMap) {
      const rhs = other.m_aMap.get(key);
      if (rhs === undefined || !value.operatorEquals(rhs)) return false;
    }
    return true;
  }
  /** Original explicit hash support. @returns True. */
  supportsHashCode(): boolean {
    return true;
  }
  /** Original keys-only hash over sorted UTF16 values; Any payload is intentionally omitted. @returns Native unsigned64 seed. */
  hashCode(): bigint {
    const seed: [bigint] = [0n];
    for (const key of this.m_aMap.keys()) {
      const units = unitsOf(key);
      hash_combine(seed, rtl_ustr_hashCode_WithLength(units, units.length));
    }
    return seed[0];
  }
  /** Original inherited no-argument unsupported query. @returns Undefined. */
  override QueryValue(): undefined;
  /** Original complete Sequence<PropertyValue> query, selector ignored. @param output - Actual Any. @param member - Ignored selector. @returns True. */
  override QueryValue(output: Any, member?: number): boolean;
  /** Original property sequence projection, retaining default Handle/State. @param output - Optional original output. @param member - Ignored native selector. @returns Success or inherited unsupported value. */
  override QueryValue(output?: Any, member = 0): boolean | undefined {
    void member;
    if (output === undefined) return undefined;
    const sequence = new Properties(this.m_aMap.size);
    try {
      let i = 0;
      for (const [key, value] of this.m_aMap) {
        const fields = sequence.operatorIndex(i++),
          name = new OUString(unitsOf(key), key.length);
        rtl_uString_assign(fields.get(0) as rtl_uStringSlot, name.pData);
        name.dispose();
        uno_type_any_assign(
          fields.get(16) as uno_Any,
          value.pData,
          value.pType,
          cpp_acquire,
          cpp_release,
        );
      }
      output.insert(sequence.getAddress(), ["Sequence", propertyType]);
    } finally {
      sequence.dispose();
    }
    return true;
  }
  /** Original exact typed sequence extraction: failure unchanged; success clears then keeps the last duplicate and ignores Handle/State. @param input - Real Any. @param member - Ignored native selector. @returns Success. */
  override PutValue(input: unknown, member = 0): boolean {
    void member;
    const sequence = new Properties();
    try {
      if (
        !(input instanceof Any) ||
        !input.extract(sequence.getAddress(), ["Sequence", propertyType])
      )
        return false;
      this.m_aMap.clear();
      for (let i = 0; i < sequence.getLength(); i++) {
        const fields = sequence.operatorIndex(i),
          name = OUString.unacquired(fields.get(0) as rtl_uStringSlot),
          key = stringOf(name);
        this.m_aMap.set(key, new Any(fields.get(16) as Any));
      }
      const ordered = sorted(this.m_aMap);
      this.m_aMap.clear();
      for (const [key, value] of ordered) this.m_aMap.set(key, value as Any);
      return true;
    } finally {
      sequence.dispose();
    }
  }
}
/** Native UTF16 key order is JS lexicographic string order, without locale collation or normalization. @param map - Source values. @returns Ordered entries. */
function sorted(
  map: ReadonlyMap<string, GrabBagValueConstReference>,
): [string, GrabBagValueConstReference][] {
  return [...map].sort(
    /** Compares unsigned UTF16 units, exactly matching OUString map ordering. @param left - Left entry. @param right - Right entry. @returns Order. */ (
      left,
      right,
    ) => (left[0] < right[0] ? -1 : 1),
  );
}
/** Converts the existing Unicode owner's complete logical code units to the primitive map key. @param value - Borrowed original string. @returns Value key. */
function stringOf(value: ReturnType<typeof OUString.unacquired>): string {
  let result = "";
  for (let i = 0; i < value.getLength(); i++)
    result += String.fromCharCode(value.getStr()[i] as number);
  return result;
}
/** Creates a logical UTF16 view for the existing SAL hash/string owners. @param value - Primitive key. @returns Code units. */
function unitsOf(value: string): Uint16Array {
  return Uint16Array.from(
    { length: value.length },
    /** Reads one exact UTF16 unit. @param _ - Unused value. @param index - Unit index. @returns Unit. */ (
      _,
      index,
    ) => value.charCodeAt(index),
  );
}
