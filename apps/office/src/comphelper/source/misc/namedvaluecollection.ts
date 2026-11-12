/** @fileoverview Original NamedValueCollection non-template implementation over owned UNO values. Unordered bucket order and native allocator ABI are not qualified; generic getOrDefault/typed-put template instantiations are not advertised. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import type { uno_Any } from "../../../cppu/inc/uno/any2";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Type } from "../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType } from "../../../cppu/inc/unotype";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { uno_type_assignData } from "../../../cppu/inc/uno/data";
import {
  cpp_acquire,
  cpp_release,
  cpp_queryInterface,
} from "../../../cppu/inc/com/sun/star/uno/genfunc";
import type { typelib_TypeDescriptionReference as R } from "../../../cppu/inc/typelib/typedescription";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import {
  NamedValue,
  cppu_detail_getUnoType_NamedValue as namedType,
} from "../../../udkapi/com/sun/star/beans/NamedValue";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyType,
} from "../../../udkapi/com/sun/star/beans/PropertyValue";
const NamedValues = Sequence.specialize<NamedValue>(namedType, 32),
  PropertyValues = Sequence.specialize<PropertyValue>(propertyType, 48),
  AnyValues = Sequence.specialize<Any>("Any", 24);
/** Caller-declared constructor overload; sequence element types are erased without inspecting values. */
type Input =
  | [source: uno_Any]
  | [source: Sequence<Any>, kind: "Any"]
  | [source: Sequence<NamedValue>, kind: "NamedValue"]
  | [source: Sequence<PropertyValue>, kind: "PropertyValue"];
let emptyMember: Any | undefined, emptyStatic: Any | undefined;
/** Exact Unicode unordered lookup key. @param name - Borrowed native string. @returns Key. */
function key(name: OUStringConstReference): string {
  let text = "";
  for (let i = 0; i < name.getLength(); ++i)
    text += String.fromCharCode(name.getStr()[i] as number);
  return text;
}
/** Original assignment/conversion and exact diagnostic. @param name - Value name. @param value - Actual Any. @param output - Initialized declared destination. @param expected - Caller-declared type. @returns True or original exception. */
function ensure(
  name: OUStringConstReference,
  value: uno_Any,
  output: unknown,
  expected: Type,
): boolean {
  if (
    uno_type_assignData(
      output,
      expected.getTypeLibType() as R,
      value.pData,
      value.pType,
      cpp_queryInterface,
      cpp_acquire,
      cpp_release,
    )
  )
    return true;
  const buffer = new OUStringBuffer(),
    context = new Reference(),
    expectedName = expected.getTypeName(),
    foundName = Any.prototype.getValueTypeName.call(value);
  try {
    buffer
      .append(new Uint8Array(new TextEncoder().encode("Invalid value type for '\0")))
      .append(name)
      .append(new Uint8Array(new TextEncoder().encode("'.\nExpected: \0")))
      .append(expectedName)
      .append(new Uint8Array(new TextEncoder().encode("\nFound: \0")))
      .append(foundName);
    const message = buffer.makeStringAndClear();
    try {
      throw new IllegalArgumentException(message, context, 0);
    } finally {
      message.dispose();
    }
  } finally {
    foundName.dispose();
    expectedName.dispose();
    context.dispose();
    buffer.dispose();
  }
}
/** Actual map owns copied Unicode keys and native Any values. */
export class NamedValueCollection {
  private readonly maValues = new Map<string, readonly [OUString, Any]>();
  /** Original default/copy and declared source overloads. Sequence kind is the erased static C++ overload witness. @param args - Native constructor arguments. @returns Collection. */
  constructor(...args: [] | [source: NamedValueCollection] | Input) {
    if (args.length === 1 && args[0] instanceof NamedValueCollection) this.merge(args[0], true);
    else if (args.length) this.impl_assign(...(args as Input));
  }
  /** Original direct type test excludes sequence<Any>. @param value - Borrowed Any. @returns Whether declared supported type. */
  static canExtractFrom(value: uno_Any): boolean {
    const type = Any.prototype.getValueType.call(value);
    return (
      type.equals(UnoType.get(namedType)) ||
      type.equals(UnoType.get(propertyType)) ||
      type.equals(UnoType.get(["Sequence", namedType])) ||
      type.equals(UnoType.get(["Sequence", propertyType]))
    );
  }
  /** Original source assignments; unsupported Any types only diagnose. @param args - Statically selected source. @returns Nothing. */
  private impl_assign(...args: Input): void {
    const [source, kind] = args;
    if (kind === undefined) {
      const named = new NamedValues(),
        properties = new PropertyValues(),
        oneNamed = new NamedValue(),
        oneProperty = new PropertyValue();
      try {
        if (Any.prototype.extract.call(source, named.getAddress(), ["Sequence", namedType]))
          this.impl_assign(named, "NamedValue");
        else if (
          Any.prototype.extract.call(source, properties.getAddress(), ["Sequence", propertyType])
        )
          this.impl_assign(properties, "PropertyValue");
        else if (Any.prototype.extract.call(source, oneNamed, namedType))
          this.put(oneNamed.Name, oneNamed.Value);
        else if (Any.prototype.extract.call(source, oneProperty, propertyType))
          this.put(oneProperty.Name, oneProperty.Value);
      } finally {
        oneProperty.dispose();
        oneNamed.dispose();
        properties.dispose();
        named.dispose();
      }
      return;
    }
    this.clear();
    if (kind === "Any") {
      const property = new PropertyValue(),
        named = new NamedValue();
      try {
        for (let i = 0; i < source.getLength(); ++i) {
          const value = source.operatorIndex(i);
          if (Any.prototype.extract.call(value, property, propertyType))
            this.put(property.Name, property.Value);
          else if (Any.prototype.extract.call(value, named, namedType))
            this.put(named.Name, named.Value);
        }
      } finally {
        named.dispose();
        property.dispose();
      }
    } else
      for (let i = 0; i < source.getLength(); ++i) {
        const address = source.operatorIndex(i) as { get(offset: number): unknown },
          fields =
            kind === "NamedValue"
              ? NamedValue.unacquired(address)
              : PropertyValue.unacquired(address);
        this.put(fields.Name, fields.Value);
      }
  }
  /** Original public sequence<Any> assignment. @param source - Arguments. @returns Nothing. */
  assign(source: Sequence<Any>): void {
    this.impl_assign(source, "Any");
  }
  /** Original copy assignment of native map members. @param source - Other collection. @returns This collection. */
  copyAssign(source: NamedValueCollection): this {
    if (source !== this) {
      this.clear();
      this.merge(source, true);
    }
    return this;
  }
  /** Original map clear. @returns Nothing. */
  clear(): void {
    for (const [name, value] of this.maValues.values()) {
      value.dispose();
      name.dispose();
    }
    this.maValues.clear();
  }
  /** Original member destruction. @returns Nothing. */
  dispose(): void {
    this.clear();
  }
  /** Original count. @returns Count. */
  size(): number {
    return this.maValues.size;
  }
  /** Original empty predicate. @returns Empty. */
  empty(): boolean {
    return this.maValues.size === 0;
  }
  /** Original name copies in unspecified unordered order. @returns Owned names. */
  getNames(): OUString[] {
    return Array.from(
      this.maValues.values(),
      /** Copies the actual source Unicode name. @param value0 - Declared source operand. @returns Original operation result. */ ([
        name,
      ]) => new OUString(name),
    );
  }
  /** Original merge with overwrite choice. @param source - Additional values. @param overwrite - Replace existing. @returns This collection. */
  merge(source: NamedValueCollection, overwrite: boolean): this {
    for (const [name, value] of source.maValues.values())
      if (overwrite || !this.has(name)) this.put(name, value);
    return this;
  }
  /** Original borrowed result or function-local static VOID. @param name - Name. @returns Borrowed actual Any. */
  get(name: OUStringConstReference): uno_Any {
    return this.maValues.get(key(name))?.[1] ?? (emptyMember ??= new Any());
  }
  /** Original first matching sequence item or separate function-local static VOID. @param source - Property sequence. @param name - Name. @returns Borrowed Any. */
  static get(source: Sequence<PropertyValue>, name: OUStringConstReference): uno_Any {
    for (let i = 0; i < source.getLength(); ++i) {
      const item = PropertyValue.unacquired(
        source.operatorIndex(i) as { get(offset: number): unknown },
      );
      if (item.Name.equals(name)) return item.Value;
    }
    return (emptyStatic ??= new Any());
  }
  /** Original presence test. @param name - Name. @returns Presence. */
  has(name: OUStringConstReference): boolean {
    return this.maValues.has(key(name));
  }
  /** Original operator[] assignment returns prior presence. @param name - Name. @param value - Native Any. @returns Already present. */
  put(name: OUStringConstReference, value: uno_Any): boolean {
    const spelling = key(name);
    let entry = this.maValues.get(spelling);
    const present = entry !== undefined;
    if (!entry) {
      entry = [new OUString(name), new Any()];
      this.maValues.set(spelling, entry);
    }
    Any.prototype.assign.call(entry[1], value as Any);
    return present;
  }
  /** Original erase destroys pair owners. @param name - Name. @returns Previously present. */
  remove(name: OUStringConstReference): boolean {
    const spelling = key(name),
      entry = this.maValues.get(spelling);
    if (!entry) return false;
    this.maValues.delete(spelling);
    entry[1].dispose();
    entry[0].dispose();
    return true;
  }
  /** Original conversion leaves absent output untouched and rejects incompatible existing values. @param name - Name. @param output - Actual initialized destination. @param expected - Static destination type. @returns Present and converted. */
  get_ensureType(name: OUStringConstReference, output: unknown, expected: Type): boolean {
    const entry = this.maValues.get(key(name));
    return entry === undefined ? false : ensure(name, entry[1], output, expected);
  }
  /** Original first-match sequence conversion. @param source - Properties. @param name - Name. @param output - Destination. @param expected - Static type. @returns Present and converted. */
  static get_ensureType(
    source: Sequence<PropertyValue>,
    name: OUStringConstReference,
    output: unknown,
    expected: Type,
  ): boolean {
    for (let i = 0; i < source.getLength(); ++i) {
      const item = PropertyValue.unacquired(
        source.operatorIndex(i) as { get(offset: number): unknown },
      );
      if (item.Name.equals(name)) return ensure(name, item.Value, output, expected);
    }
    return false;
  }
  /** Original transform constructs complete fresh generated structs, resetting Handle and State. @param output - Actual sequence. @param kind - Declared output overload. @returns Count. */
  extract(
    output: Sequence<PropertyValue> | Sequence<NamedValue>,
    kind: "PropertyValue" | "NamedValue",
  ): number {
    output.realloc(this.size());
    const storage = output.getArray() as ReadonlyMap<number, unknown>;
    let i = 0;
    for (const [name, value] of this.maValues.values()) {
      const item =
        kind === "PropertyValue"
          ? new PropertyValue(name, 0, value, 0)
          : new NamedValue(name, value);
      try {
        const destination = storage.get(i++ * (kind === "PropertyValue" ? 48 : 32));
        this.assignStruct(destination, item, kind);
      } finally {
        item.dispose();
      }
    }
    return output.getLength();
  }
  /** Source generated struct operator= uses the shared typed assignment. @param destination - Live C field address. @param source - Generated owner. @param kind - Static compound type. @returns Nothing. */
  private assignStruct(
    destination: unknown,
    source: PropertyValue | NamedValue,
    kind: "PropertyValue" | "NamedValue",
  ): void {
    uno_type_assignData(
      destination,
      UnoType.get(kind === "PropertyValue" ? propertyType : namedType).getTypeLibType() as R,
      source,
      UnoType.get(kind === "PropertyValue" ? propertyType : namedType).getTypeLibType() as R,
      cpp_queryInterface,
      cpp_acquire,
      cpp_release,
    );
  }
  /** Original property sequence. @returns Owned sequence. */
  getPropertyValues(): Sequence<PropertyValue> {
    const result = new PropertyValues();
    this.extract(result, "PropertyValue");
    return result;
  }
  /** Original named sequence. @returns Owned sequence. */
  getNamedValues(): Sequence<NamedValue> {
    const result = new NamedValues();
    this.extract(result, "NamedValue");
    return result;
  }
  /** Original instantiated wrap transform. @param kind - Static template instantiation. @returns Owned sequence. */
  private wrap(kind: "PropertyValue" | "NamedValue"): Sequence<Any> {
    const values = kind === "PropertyValue" ? this.getPropertyValues() : this.getNamedValues(),
      result = new AnyValues(values.getLength());
    try {
      for (let i = 0; i < values.getLength(); ++i) {
        const item = new Any(
          values.operatorIndex(i),
          kind === "PropertyValue" ? propertyType : namedType,
        );
        try {
          Any.prototype.assign.call(result.operatorIndex(i), item);
        } finally {
          item.dispose();
        }
      }
      return result;
    } catch (error) {
      result.dispose();
      throw error;
    } finally {
      values.dispose();
    }
  }
  /** Original property wrapping. @returns Owned sequence. */
  getWrappedPropertyValues(): Sequence<Any> {
    return this.wrap("PropertyValue");
  }
  /** Original named wrapping. @returns Owned sequence. */
  getWrappedNamedValues(): Sequence<Any> {
    return this.wrap("NamedValue");
  }
}
