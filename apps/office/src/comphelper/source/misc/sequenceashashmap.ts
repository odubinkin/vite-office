/** @fileoverview Original SequenceAsHashMap sequence/Any overloads, value merging and named/property sequence output over actual shared owners. Host Map binds unspecified unordered storage; native bucket layout, iterator invalidation and physical order are not certified. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { uno_type_any_assign } from "../../../cppu/inc/uno/any2";
import { cpp_acquire, cpp_release } from "../../../cppu/inc/com/sun/star/uno/genfunc";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { UnoTypeArgument } from "../../../cppu/inc/unotype";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import {
  NamedValue,
  cppu_detail_getUnoType_NamedValue as namedType,
} from "../../../udkapi/com/sun/star/beans/NamedValue";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyType,
} from "../../../udkapi/com/sun/star/beans/PropertyValue";
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";
import { rtl_uString_assign } from "../../../sal/rtl/ustring";
const NamedValues = Sequence.specialize<NamedValue>(namedType, 32);
const PropertyValues = Sequence.specialize<PropertyValue>(propertyType, 48);
/** Original erased sequence overload selection is a caller-declared compiler witness, not inferred from values. */
type Input =
  | [source: Any]
  | [source: Sequence<Any>, kind: "Any"]
  | [source: Sequence<PropertyValue>, kind: "PropertyValue"]
  | [source: Sequence<NamedValue>, kind: "NamedValue"];
/** Original cache-key owner. */
export class OUStringAndHashCode {
  readonly maString: OUString;
  readonly mnHashCode: number;
  /** Original by-value string and move into member, with its actual cached hash. @param source - Borrowed source. @returns Key. */
  constructor(source: OUStringConstReference) {
    this.maString = new OUString(source);
    this.mnHashCode = this.maString.hashCode();
  }
  /** Original string member destruction. @returns Nothing. */
  dispose(): void {
    this.maString.dispose();
  }
}
/** Original cached-hash then Unicode equality functor. */
export class OUStringAndHashCodeEqual {
  /** Original operator(). @param left - Left key. @param right - Right key. @returns Equality. */
  call(left: OUStringAndHashCode, right: OUStringAndHashCode): boolean {
    return left.mnHashCode === right.mnHashCode && left.maString.equals(right.maString);
  }
}
/** Original signed32-to-size_t hash functor on the selected64-bit target. */
export class OUStringAndHashCodeHash {
  /** Original operator(). @param key - Cached key. @returns Original size_t. */
  call(key: OUStringAndHashCode): bigint {
    return BigInt.asUintN(64, BigInt(key.mnHashCode));
  }
}
/** Original owned unordered pair; callers borrow it and must not destroy its members. */
export type SequenceAsHashMapEntry = readonly [OUStringAndHashCode, Any];
/** Host unordered lookup spelling preserves every UTF16 code unit, including embedded NUL and lone surrogates; original key ownership/hash remains in each pair. @param source - Native string. @returns Exact lookup key. */
function keyString(source: OUStringConstReference): string {
  let result = "";
  for (let i = 0; i < source.getLength(); ++i)
    result += String.fromCharCode(source.getStr()[i] as number);
  return result;
}
/** Original generated struct fields viewed from an actual sequence address, without a serialized value projection. @param source - Actual sequence. @param index - Element index. @param offset - Declared Any member offset. @returns Borrowed original name and Any. */
function fields(
  source: Sequence<unknown>,
  index: number,
  offset: number,
): readonly [OUStringConstReference, Any] {
  const value = source.operatorIndex(index) as { get(offset: number): unknown };
  return [OUString.unacquired(value.get(0) as [rtl_uString]), value.get(offset) as Any];
}
/** Original IllegalArgumentException constructor and temporary destruction. @param text - Original literal. @returns Never. */
function fail(text: string): never {
  const message = OUString.createFromAscii(new TextEncoder().encode(text + "\0")),
    context = new Reference();
  try {
    throw new IllegalArgumentException(message, context, -1);
  } finally {
    context.dispose();
    message.dispose();
  }
}
/** Actual original map stores owned Unicode keys and Any values; no alternate type/default/sequence provider or document representation. */
export class SequenceAsHashMap {
  private readonly m_aMap = new Map<string, SequenceAsHashMapEntry>();
  /** Original default, copy and source overloads. @param args - Declared native source overload. @returns Map. */
  constructor(...args: [] | [source: SequenceAsHashMap] | Input) {
    if (args.length === 1 && args[0] instanceof SequenceAsHashMap) this.update(args[0]);
    else if (args.length) this.insert(...(args as Input));
  }
  /** Original operator[] creates an empty Any only for a missing key and returns its stable member reference. @param key - Borrowed string or cached key. @returns Borrowed mutable Any. */
  operatorIndex(key: OUStringConstReference | OUStringAndHashCode): Any {
    const name = key instanceof OUStringAndHashCode ? key.maString : key,
      spelling = keyString(name);
    let entry = this.m_aMap.get(spelling);
    if (entry === undefined) {
      entry = [new OUStringAndHashCode(name), new Any()];
      this.m_aMap.set(spelling, entry);
    }
    return entry[1];
  }
  /** Original operator<< overloads retain reset-versus-merge and partial writes on failure. @param args - Caller-declared native overload. @returns Nothing. */
  insert(...args: Input): void {
    const [source, kind] = args;
    if (source instanceof Any) {
      if (!source.hasValue()) {
        this.clear();
        return;
      }
      const named = new NamedValues();
      try {
        if (source.extract(named.getAddress(), ["Sequence", namedType])) {
          this.insert(named, "NamedValue");
          return;
        }
      } finally {
        named.dispose();
      }
      const properties = new PropertyValues();
      try {
        if (source.extract(properties.getAddress(), ["Sequence", propertyType])) {
          this.insert(properties, "PropertyValue");
          return;
        }
      } finally {
        properties.dispose();
      }
      fail("Any contains wrong type.");
    } else if (kind === "Any") {
      for (let i = 0; i < source.getLength(); ++i) {
        const value = (source as Sequence<Any>).operatorIndex(i),
          property = new PropertyValue();
        try {
          if (Any.prototype.extract.call(value, property, propertyType)) {
            if (property.Name.isEmpty() || !property.Value.hasValue())
              fail("PropertyValue struct contains no useful information.");
            this.operatorIndex(property.Name).assign(property.Value);
            continue;
          }
          const named = new NamedValue();
          try {
            if (Any.prototype.extract.call(value, named, namedType)) {
              if (named.Name.isEmpty() || !named.Value.hasValue())
                fail("NamedValue struct contains no useful information.");
              this.operatorIndex(named.Name).assign(named.Value);
              continue;
            }
          } finally {
            named.dispose();
          }
          if (Any.prototype.hasValue.call(value)) fail("Any contains wrong type.");
        } finally {
          property.Value.dispose();
          property.Name.dispose();
        }
      }
    } else {
      this.clear();
      for (let i = 0; i < source.getLength(); ++i) {
        const [name, value] = fields(source, i, kind === "PropertyValue" ? 16 : 8);
        this.operatorIndex(name).assign(value);
      }
    }
  }
  /** Original operator>> reallocates destination, retaining existing PropertyValue Handle/State in reused slots. @param destination - Actual destination. @param kind - Original declared struct overload. @returns Nothing. */
  extract(
    destination: Sequence<PropertyValue> | Sequence<NamedValue>,
    kind: "PropertyValue" | "NamedValue",
  ): void {
    destination.realloc(this.size());
    const storage = destination.getArray();
    let index = 0;
    for (const [key, value] of this.m_aMap.values()) {
      const member = (storage as ReadonlyMap<number, { get(offset: number): unknown }>).get(
        index * (kind === "PropertyValue" ? 48 : 32),
      ) as { get(offset: number): unknown };
      rtl_uString_assign(member.get(0) as [rtl_uString], key.maString.pData);
      uno_type_any_assign(
        member.get(kind === "PropertyValue" ? 16 : 8) as Any,
        value.pData,
        value.pType,
        cpp_acquire,
        cpp_release,
      );
      ++index;
    }
  }
  /** Original actual property sequence result. @returns Owned sequence. */
  getAsConstPropertyValueList(): Sequence<PropertyValue> {
    const result = new PropertyValues();
    this.extract(result, "PropertyValue");
    return result;
  }
  /** Original actual named sequence result. @returns Owned sequence. */
  getAsConstNamedValueList(): Sequence<NamedValue> {
    const result = new NamedValues();
    this.extract(result, "NamedValue");
    return result;
  }
  /** Original independent Any containing the selected actual sequence. @param asProperties - Original selector. @returns Owned Any. */
  getAsConstAny(asProperties: boolean): Any {
    if (asProperties) {
      const values = this.getAsConstPropertyValueList();
      try {
        return new Any(values.getAddress(), ["Sequence", propertyType]);
      } finally {
        values.dispose();
      }
    }
    const values = this.getAsConstNamedValueList();
    try {
      return new Any(values.getAddress(), ["Sequence", namedType]);
    } finally {
      values.dispose();
    }
  }
  /** Original getValue returns an acquired copy or an empty Any without inserting. @param key - Borrowed name. @returns Owned Any. */
  getValue(key: OUStringConstReference): Any {
    const entry = this.find(key);
    return entry === undefined ? new Any() : new Any(entry[1]);
  }
  /** Original signed32 getUnpackedValueOrDefault template instantiation: missing or failed extraction returns the supplied default, while the temporary starts at zero. Other template instantiations remain unported. @param key - Borrowed key. @param defaultValue - Original signed32 default. @param argument - Declared template specialization. @returns Extracted value or supplied default. */
  getUnpackedValueOrDefault(
    key: OUStringConstReference,
    defaultValue: number,
    argument: "sal_Int32",
  ): number {
    const entry = this.find(key);
    if (entry === undefined) return defaultValue;
    const value: [number] = [0];
    if (!entry[1].extract(value, argument)) return defaultValue;
    return value[0];
  }
  /** Original creates a typed item only if its name is absent. @param key - Borrowed name. @param value - Declared value address. @param argument - Native template witness. @returns Whether added. */
  createItemIfMissing(
    key: OUStringConstReference,
    value: unknown,
    argument: Exclude<UnoTypeArgument, "Any">,
  ): boolean {
    if (this.contains(key)) return false;
    const temporary = new Any(value, argument);
    try {
      this.operatorIndex(key).assign(temporary);
    } finally {
      temporary.dispose();
    }
    return true;
  }
  /** Original subset test compares both names and actual UNO Any equality. @param check - Borrowed search map. @returns Match. */
  match(check: SequenceAsHashMap): boolean {
    for (const [key, value] of check.m_aMap.values()) {
      const found = this.find(key.maString);
      if (found === undefined || found[1].operatorNotEquals(value)) return false;
    }
    return true;
  }
  /** Original update overwrites/creates but retains unspecified existing names. @param source - Borrowed source. @returns Nothing. */
  update(source: SequenceAsHashMap): void {
    for (const [key, value] of source.m_aMap.values())
      this.operatorIndex(key.maString).assign(value);
  }
  /** Original lookup borrows the actual pair, with undefined representing end; physical iterator representation/invalidation is outside this host binding. @param key - Borrowed name or cached key. @returns Pair or end. */
  find(key: OUStringConstReference | OUStringAndHashCode): SequenceAsHashMapEntry | undefined {
    return this.m_aMap.get(keyString(key instanceof OUStringAndHashCode ? key.maString : key));
  }
  /** Original presence test. @param key - Borrowed name. @returns Presence. */
  contains(key: OUStringConstReference): boolean {
    return this.find(key) !== undefined;
  }
  /** Original erase(key) count, followed by actual pair member destruction. @param key - Borrowed name. @returns Erased count. */
  erase(key: OUStringConstReference): number {
    const spelling = keyString(key),
      entry = this.m_aMap.get(spelling);
    if (entry === undefined) return 0;
    this.m_aMap.delete(spelling);
    entry[1].dispose();
    entry[0].dispose();
    return 1;
  }
  /** Original unordered range borrows pairs; no stable order contract is added. @returns Borrowed entries. */
  begin(): IterableIterator<SequenceAsHashMapEntry> {
    return this.m_aMap.values();
  }
  /** Original size. @returns Count. */
  size(): number {
    return this.m_aMap.size;
  }
  /** Original empty predicate. @returns Empty. */
  empty(): boolean {
    return this.m_aMap.size === 0;
  }
  /** Original clear destroys actual pair values then their keys; unordered physical iteration order is unverified. @returns Nothing. */
  clear(): void {
    for (const [key, value] of this.m_aMap.values()) {
      value.dispose();
      key.dispose();
    }
    this.m_aMap.clear();
  }
  /** Original map member destructor at its host lifetime boundary. @returns Nothing. */
  dispose(): void {
    this.clear();
  }
}
