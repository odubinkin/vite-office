/** @fileoverview Original PropertyValueSet XRow/XColumnLocate component, closed native template instantiations, value cache and actual Converter service lookup. No row/type/default provider is substituted. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { UnoType, type UnoTypeArgument } from "../../../cppu/inc/unotype";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import type { XNameAccess } from "../../../cppu/inc/com/sun/star/container/XNameAccess";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import { XPropertyAccess } from "../../../udkapi/com/sun/star/beans/XPropertyAccess";
import { Property } from "../../../udkapi/com/sun/star/beans/Property";
import { UnknownPropertyException } from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { WrappedTargetException } from "../../../cppu/inc/com/sun/star/lang/WrappedTargetException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { CannotConvertException } from "../../../udkapi/com/sun/star/script/CannotConvertException";
import { Converter } from "../../../udkapi/com/sun/star/script/Converter";
import type { XTypeConverter } from "../../../udkapi/com/sun/star/script/XTypeConverter";
import { XRow } from "../../../offapi/com/sun/star/sdbc/XRow";
import { XColumnLocate } from "../../../offapi/com/sun/star/sdbc/XColumnLocate";
import { XRef } from "../../../offapi/com/sun/star/sdbc/XRef";
import { XBlob } from "../../../offapi/com/sun/star/sdbc/XBlob";
import { XClob } from "../../../offapi/com/sun/star/sdbc/XClob";
import { XArray } from "../../../offapi/com/sun/star/sdbc/XArray";
import {
  Date,
  cppu_detail_getUnoType_Date as dateType,
} from "../../../offapi/com/sun/star/util/Date";
import {
  Time,
  cppu_detail_getUnoType_Time as timeType,
} from "../../../offapi/com/sun/star/util/Time";
import {
  DateTime,
  cppu_detail_getUnoType_DateTime as timestampType,
} from "../../../offapi/com/sun/star/util/DateTime";

const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Original bit flags and NONE default. */
enum PropsSet {
  NONE = 0,
  String = 0x1,
  Boolean = 0x2,
  Byte = 0x4,
  Short = 0x8,
  Int = 0x10,
  Long = 0x20,
  Float = 0x40,
  Double = 0x80,
  Bytes = 0x100,
  Date = 0x200,
  Time = 0x400,
  Timestamp = 0x800,
  BinaryStream = 0x1000,
  CharacterStream = 0x2000,
  Ref = 0x4000,
  Blob = 0x8000,
  Clob = 0x10000,
  Array = 0x20000,
  Object = 0x40000,
}
/** Actual original private value record, with fields in source order. */
class PropertyValue {
  sPropertyName = new OUString();
  nPropsSet = PropsSet.NONE;
  nOrigValue = PropsSet.NONE;
  aString: OUString = new OUString();
  bBoolean: [boolean] = [false];
  nByte: [number] = [0];
  nShort: [number] = [0];
  nInt: [number] = [0];
  nLong: [bigint] = [0n];
  nFloat: [number] = [0];
  nDouble: [number] = [0];
  aBytes: Sequence<number> = new Bytes();
  aDate: Date = new Date();
  aTime: Time = new Time();
  aTimestamp: DateTime = new DateTime();
  xBinaryStream: Reference<XInputStream> = new Reference<XInputStream>();
  xCharacterStream: Reference<XInputStream> = new Reference<XInputStream>();
  xRef: Reference<XRef> = new Reference<XRef>();
  xBlob: Reference<XBlob> = new Reference<XBlob>();
  xClob: Reference<XClob> = new Reference<XClob>();
  xArray: Reference<XArray> = new Reference<XArray>();
  aObject: Any = new Any();
  /** Original implicit struct move: scalar/date copies, real managed moves and Sequence's original copying rvalue constructor. @param source - Actual rvalue record. @returns Moved record. */
  static move(source: PropertyValue): PropertyValue {
    const result = Object.create(PropertyValue.prototype) as PropertyValue;
    result.sPropertyName = OUString.move(source.sPropertyName);
    result.nPropsSet = source.nPropsSet;
    result.nOrigValue = source.nOrigValue;
    result.aString = OUString.move(source.aString);
    result.bBoolean = [source.bBoolean[0]];
    result.nByte = [source.nByte[0]];
    result.nShort = [source.nShort[0]];
    result.nInt = [source.nInt[0]];
    result.nLong = [source.nLong[0]];
    result.nFloat = [source.nFloat[0]];
    result.nDouble = [source.nDouble[0]];
    result.aBytes = new Bytes(source.aBytes);
    result.aDate = new Date(source.aDate);
    result.aTime = new Time(source.aTime);
    result.aTimestamp = new DateTime(source.aTimestamp);
    result.xBinaryStream = Reference.move(source.xBinaryStream);
    result.xCharacterStream = Reference.move(source.xCharacterStream);
    result.xRef = Reference.move(source.xRef);
    result.xBlob = Reference.move(source.xBlob);
    result.xClob = Reference.move(source.xClob);
    result.xArray = Reference.move(source.xArray);
    result.aObject = Any.move(source.aObject);
    return result;
  }
  /** Original reverse managed-member destruction. @returns Nothing. */
  dispose(): void {
    this.aObject.dispose();
    this.xArray.dispose();
    this.xClob.dispose();
    this.xBlob.dispose();
    this.xRef.dispose();
    this.xCharacterStream.dispose();
    this.xBinaryStream.dispose();
    this.aBytes.dispose();
    this.aString.dispose();
    this.sPropertyName.dispose();
  }
}
/** Original template member-pointer domain; property name and flags are not value members. */
type ValueMember =
  | "aString"
  | "bBoolean"
  | "nByte"
  | "nShort"
  | "nInt"
  | "nLong"
  | "nFloat"
  | "nDouble"
  | "aBytes"
  | "aDate"
  | "aTime"
  | "aTimestamp"
  | "xBinaryStream"
  | "xCharacterStream"
  | "xRef"
  | "xBlob"
  | "xClob"
  | "xArray"
  | "aObject";
/** Existing source native value owners and scalar lvalue cells, without a constructor/default callback provider. */
type ValueLocal = PropertyValue[ValueMember];

const scalar =
    PropsSet.Boolean |
    PropsSet.Byte |
    PropsSet.Short |
    PropsSet.Int |
    PropsSet.Long |
    PropsSet.Float |
    PropsSet.Double,
  references =
    PropsSet.BinaryStream |
    PropsSet.CharacterStream |
    PropsSet.Ref |
    PropsSet.Blob |
    PropsSet.Clob |
    PropsSet.Array,
  destructible = PropsSet.String | PropsSet.Bytes | references | PropsSet.Object;
/** Compiler lowering of T assignment for the closed source instantiations; no constructor/type/value callback is supplied. @param flag - Original compile-time selected type bit. @param destination - Actual initialized local/member. @param source - Actual same-T value. @returns Nothing. */
function assignValue(flag: PropsSet, destination: ValueLocal, source: ValueLocal): void {
  if (flag & scalar) (destination as [unknown])[0] = (source as [unknown])[0];
  else (destination as { assign(value: unknown): unknown }).assign(source);
}
/** Existing native address-of lowering for the actual local/member. @param flag - Original selected type bit. @param value - Actual initialized value. @param insert - Original insertion versus extraction overload. @returns Existing lvalue address. */
function valueAddress(flag: PropsSet, value: ValueLocal, insert: boolean): unknown {
  if (flag & (references | PropsSet.Bytes))
    return (value as Reference | Sequence<number>).getAddress();
  if (flag === PropsSet.String && insert) return (value as OUString).getDataAddress();
  return value;
}
/** Compiler lowering of the original local T destructor. @param flag - Original selected type bit. @param value - Actual local. @returns Nothing. */
function destroyValue(flag: PropsSet, value: ValueLocal): void {
  if (flag & destructible) (value as { dispose(): void }).dispose();
}
/** Original std::vector-owned element sequence; native capacity/address/reallocation ABI remains unqualified. */
class PropertyValues extends Array<PropertyValue> {}
/** Complete original interface implementation, with private native fields and no external compiler-binding injection. */
export class PropertyValueSet
  extends WeakImplHelper.specialize(XRow, XColumnLocate)
  implements XRow, XColumnLocate
{
  private readonly m_xContext: Reference<XComponentContext>;
  private readonly m_xTypeConverter: Reference<XTypeConverter>;
  private readonly m_pValues: PropertyValues;
  private m_bWasNull: boolean;
  private m_bTriedToGetTypeConverter: boolean;
  /** Original context copy and defaults. @param context - Borrowed component context. @returns Actual component. */
  constructor(context: Reference<XComponentContext>) {
    super();
    this.m_xContext = new Reference(context);
    this.m_xTypeConverter = new Reference<XTypeConverter>();
    this.m_pValues = new PropertyValues();
    this.m_bWasNull = false;
    this.m_bTriedToGetTypeConverter = false;
  }
  /** Original reverse fields/base destruction; scalar flags and native mutex have no separate JS owner. @returns Nothing. */
  protected override destroy(): void {
    for (let i = this.m_pValues.length - 1; i >= 0; --i)
      (this.m_pValues[i] as PropertyValue).dispose();
    this.m_xTypeConverter.dispose();
    this.m_xContext.dispose();
    super.destroy();
  }
  /** Original getValue template body; aValue is the actual default-constructed T local emitted by its closed caller instantiation. Native mutex scheduling is unqualified. @param flag - Original selected type bit. @param column - Signed32 index. @param member - Original member pointer. @param type - Declared UnoType of T. @param value - Actual T local. @returns Owned T result. */
  private getValue<K extends ValueMember>(
    flag: PropsSet,
    column: number,
    member: K,
    type: Exclude<UnoTypeArgument, "Any">,
    value: PropertyValue[K],
  ): PropertyValue[K] {
    try {
      this.m_bWasNull = true;
      if (column < 1 || column >>> 0 > this.m_pValues.length) return value;
      const stored = this.m_pValues[column - 1] as PropertyValue;
      if (stored.nOrigValue === PropsSet.NONE) return value;
      if (stored.nPropsSet & flag) {
        assignValue(flag, value, stored[member]);
        this.m_bWasNull = false;
        return value;
      }
      if (!(stored.nPropsSet & PropsSet.Object)) {
        const object = this.getObjectImpl(column);
        object.dispose();
      }
      if (stored.nPropsSet & PropsSet.Object && stored.aObject.hasValue()) {
        if (stored.aObject.extract(valueAddress(flag, value, false), type)) {
          assignValue(flag, stored[member], value);
          stored.nPropsSet |= flag;
          this.m_bWasNull = false;
        } else {
          const converter = new Reference(this.getTypeConverter());
          try {
            if (converter.is()) {
              try {
                const converted = converter
                  .operatorStar()
                  .convertTo(stored.aObject, UnoType.get(type));
                try {
                  if (converted.extract(valueAddress(flag, value, false), type)) {
                    assignValue(flag, stored[member], value);
                    stored.nPropsSet |= flag;
                    this.m_bWasNull = false;
                  }
                } finally {
                  converted.dispose();
                }
              } catch (error) {
                if (
                  !(error instanceof IllegalArgumentException) &&
                  !(error instanceof CannotConvertException)
                )
                  throw error;
                error.dispose();
              }
            }
          } finally {
            converter.dispose();
          }
        }
      }
      return value;
    } catch (error) {
      destroyValue(flag, value);
      throw error;
    }
  }
  /** Original unsynchronized shared last-read flag. @returns Original flag. */
  wasNull(): boolean {
    return this.m_bWasNull;
  }
  /** Original getObjectImpl body and native original-type switch. @param column - Original signed32 index. @returns Owned Any. */
  private getObjectImpl(column: number): Any {
    const value = new Any();
    try {
      this.m_bWasNull = true;
      if (column >= 1 && column >>> 0 <= this.m_pValues.length) {
        const stored = this.m_pValues[column - 1] as PropertyValue;
        if (stored.nPropsSet & PropsSet.Object) {
          value.assign(stored.aObject);
          this.m_bWasNull = false;
        } else {
          switch (stored.nOrigValue) {
            case PropsSet.NONE:
              break;
            case PropsSet.String:
              value.insert(valueAddress(PropsSet.String, stored.aString, true), "OUString");
              break;
            case PropsSet.Boolean:
              value.insert(valueAddress(PropsSet.Boolean, stored.bBoolean, true), "bool");
              break;
            case PropsSet.Byte:
              value.insert(valueAddress(PropsSet.Byte, stored.nByte, true), "sal_Int8");
              break;
            case PropsSet.Short:
              value.insert(valueAddress(PropsSet.Short, stored.nShort, true), "sal_Int16");
              break;
            case PropsSet.Int:
              value.insert(valueAddress(PropsSet.Int, stored.nInt, true), "sal_Int32");
              break;
            case PropsSet.Long:
              value.insert(valueAddress(PropsSet.Long, stored.nLong, true), "sal_Int64");
              break;
            case PropsSet.Float:
              value.insert(valueAddress(PropsSet.Float, stored.nFloat, true), "float");
              break;
            case PropsSet.Double:
              value.insert(valueAddress(PropsSet.Double, stored.nDouble, true), "double");
              break;
            case PropsSet.Bytes:
              value.insert(valueAddress(PropsSet.Bytes, stored.aBytes, true), [
                "Sequence",
                "sal_Int8",
              ]);
              break;
            case PropsSet.Date:
              value.insert(valueAddress(PropsSet.Date, stored.aDate, true), dateType);
              break;
            case PropsSet.Time:
              value.insert(valueAddress(PropsSet.Time, stored.aTime, true), timeType);
              break;
            case PropsSet.Timestamp:
              value.insert(
                valueAddress(PropsSet.Timestamp, stored.aTimestamp, true),
                timestampType,
              );
              break;
            case PropsSet.BinaryStream:
              value.insert(
                valueAddress(PropsSet.BinaryStream, stored.xBinaryStream, true),
                XInputStream.static_type,
              );
              break;
            case PropsSet.CharacterStream:
              value.insert(
                valueAddress(PropsSet.CharacterStream, stored.xCharacterStream, true),
                XInputStream.static_type,
              );
              break;
            case PropsSet.Ref:
              value.insert(valueAddress(PropsSet.Ref, stored.xRef, true), XRef.static_type);
              break;
            case PropsSet.Blob:
              value.insert(valueAddress(PropsSet.Blob, stored.xBlob, true), XBlob.static_type);
              break;
            case PropsSet.Clob:
              value.insert(valueAddress(PropsSet.Clob, stored.xClob, true), XClob.static_type);
              break;
            case PropsSet.Array:
              value.insert(valueAddress(PropsSet.Array, stored.xArray, true), XArray.static_type);
              break;
            case PropsSet.Object: // Original intentional fallthrough to the diagnostic-only default.
            default:
              break;
          }
          if (value.hasValue()) {
            stored.aObject.assign(value);
            stored.nPropsSet |= PropsSet.Object;
            this.m_bWasNull = false;
          }
        }
      }
      return value;
    } catch (error) {
      value.dispose();
      throw error;
    }
  }
  /** Original ignored type-map parameter and scoped getObjectImpl call. @param column - Original index. @param typeMap - Ignored original map. @returns Owned Any. */
  getObject(column: number, typeMap: Reference<XNameAccess>): Any {
    void typeMap;
    return this.getObjectImpl(column);
  }
  /** Original getString template instantiation. @param column - Signed32 index. @returns Owned native value. */
  getString(column: number): OUString {
    return this.getValue(PropsSet.String, column, "aString", "OUString", new OUString());
  }
  /** Original getBoolean template instantiation. @param column - Signed32 index. @returns Declared scalar. */
  getBoolean(column: number): boolean {
    return this.getValue(PropsSet.Boolean, column, "bBoolean", "bool", [false])[0];
  }
  /** Original getByte template instantiation. @param column - Signed32 index. @returns Declared scalar. */
  getByte(column: number): number {
    return this.getValue(PropsSet.Byte, column, "nByte", "sal_Int8", [0])[0];
  }
  /** Original getShort template instantiation. @param column - Signed32 index. @returns Declared scalar. */
  getShort(column: number): number {
    return this.getValue(PropsSet.Short, column, "nShort", "sal_Int16", [0])[0];
  }
  /** Original getInt template instantiation. @param column - Signed32 index. @returns Declared scalar. */
  getInt(column: number): number {
    return this.getValue(PropsSet.Int, column, "nInt", "sal_Int32", [0])[0];
  }
  /** Original getLong template instantiation. @param column - Signed32 index. @returns Declared scalar. */
  getLong(column: number): bigint {
    return this.getValue(PropsSet.Long, column, "nLong", "sal_Int64", [0n])[0];
  }
  /** Original getFloat template instantiation. @param column - Signed32 index. @returns Declared scalar. */
  getFloat(column: number): number {
    return this.getValue(PropsSet.Float, column, "nFloat", "float", [0])[0];
  }
  /** Original getDouble template instantiation. @param column - Signed32 index. @returns Declared scalar. */
  getDouble(column: number): number {
    return this.getValue(PropsSet.Double, column, "nDouble", "double", [0])[0];
  }
  /** Original getBytes template instantiation. @param column - Signed32 index. @returns Owned native value. */
  getBytes(column: number): Sequence<number> {
    return this.getValue(PropsSet.Bytes, column, "aBytes", ["Sequence", "sal_Int8"], new Bytes());
  }
  /** Original getDate template instantiation. @param column - Signed32 index. @returns Owned native value. */
  getDate(column: number): Date {
    return this.getValue(PropsSet.Date, column, "aDate", dateType, new Date());
  }
  /** Original getTime template instantiation. @param column - Signed32 index. @returns Owned native value. */
  getTime(column: number): Time {
    return this.getValue(PropsSet.Time, column, "aTime", timeType, new Time());
  }
  /** Original getTimestamp template instantiation. @param column - Signed32 index. @returns Owned native value. */
  getTimestamp(column: number): DateTime {
    return this.getValue(PropsSet.Timestamp, column, "aTimestamp", timestampType, new DateTime());
  }
  /** Original getBinaryStream template instantiation. @param column - Signed32 index. @returns Owned native value. */
  getBinaryStream(column: number): Reference<XInputStream> {
    return this.getValue(
      PropsSet.BinaryStream,
      column,
      "xBinaryStream",
      XInputStream.static_type,
      new Reference<XInputStream>(),
    );
  }
  /** Original getCharacterStream template instantiation. @param column - Signed32 index. @returns Owned native value. */
  getCharacterStream(column: number): Reference<XInputStream> {
    return this.getValue(
      PropsSet.CharacterStream,
      column,
      "xCharacterStream",
      XInputStream.static_type,
      new Reference<XInputStream>(),
    );
  }
  /** Original getRef template instantiation. @param column - Signed32 index. @returns Owned native value. */
  getRef(column: number): Reference<XRef> {
    return this.getValue(PropsSet.Ref, column, "xRef", XRef.static_type, new Reference<XRef>());
  }
  /** Original getBlob template instantiation. @param column - Signed32 index. @returns Owned native value. */
  getBlob(column: number): Reference<XBlob> {
    return this.getValue(PropsSet.Blob, column, "xBlob", XBlob.static_type, new Reference<XBlob>());
  }
  /** Original getClob template instantiation. @param column - Signed32 index. @returns Owned native value. */
  getClob(column: number): Reference<XClob> {
    return this.getValue(PropsSet.Clob, column, "xClob", XClob.static_type, new Reference<XClob>());
  }
  /** Original getArray template instantiation. @param column - Signed32 index. @returns Owned native value. */
  getArray(column: number): Reference<XArray> {
    return this.getValue(
      PropsSet.Array,
      column,
      "xArray",
      XArray.static_type,
      new Reference<XArray>(),
    );
  }
  /** Original exact nonempty-name search returns a one-based index or zero. @param name - Borrowed column name. @returns Original index. */
  findColumn(name: OUStringConstReference): number {
    if (!name.isEmpty())
      for (let n = 0; n < this.m_pValues.length; ++n)
        if ((this.m_pValues[n] as PropertyValue).sPropertyName.equals(name)) return n + 1;
    return 0;
  }
  /** Original successful-or-failed once converter lookup, setting the tried flag before the real service call. @returns Borrowed native field. */
  private getTypeConverter(): Reference<XTypeConverter> {
    if (!this.m_bTriedToGetTypeConverter && !this.m_xTypeConverter.is()) {
      this.m_bTriedToGetTypeConverter = true;
      const converter = Converter.create(this.m_xContext);
      try {
        this.m_xTypeConverter.assign(converter);
      } finally {
        converter.dispose();
      }
    }
    return this.m_xTypeConverter;
  }
  /** Original appendValue template over the actual local PropertyValue and source vector move. @param name - Borrowed name. @param flag - Original selected type bit. @param member - Original member pointer. @param value - Borrowed same-T input. @returns Nothing. */
  private appendValue<K extends ValueMember>(
    name: OUStringConstReference,
    flag: PropsSet,
    member: K,
    value: PropertyValue[K],
  ): void {
    const stored = new PropertyValue();
    try {
      stored.sPropertyName.assign(name);
      stored.nPropsSet = flag;
      stored.nOrigValue = flag;
      assignValue(flag, stored[member], value);
      this.m_pValues.push(PropertyValue.move(stored));
    } finally {
      stored.dispose();
    }
  }
  /** Original appendString name and Property overloads. @param property - Actual descriptor or name. @param value - Borrowed native value. @returns Nothing. */
  appendString(property: Property | OUStringConstReference, value: OUStringConstReference): void {
    this.appendValue(this.propertyName(property), PropsSet.String, "aString", value as OUString);
  }
  /** Original appendBoolean name and Property overloads. @param property - Actual descriptor or name. @param value - Borrowed native value. @returns Nothing. */
  appendBoolean(property: Property | OUStringConstReference, value: boolean): void {
    this.appendValue(this.propertyName(property), PropsSet.Boolean, "bBoolean", [value]);
  }
  /** Original appendLong name and Property overloads. @param property - Actual descriptor or name. @param value - Borrowed native value. @returns Nothing. */
  appendLong(property: Property | OUStringConstReference, value: bigint): void {
    this.appendValue(this.propertyName(property), PropsSet.Long, "nLong", [value]);
  }
  /** Original appendTimestamp name and Property overloads. @param property - Actual descriptor or name. @param value - Borrowed native value. @returns Nothing. */
  appendTimestamp(property: Property | OUStringConstReference, value: DateTime): void {
    this.appendValue(this.propertyName(property), PropsSet.Timestamp, "aTimestamp", value);
  }
  /** Original appendObject name and Property overloads. @param property - Actual descriptor or name. @param value - Borrowed native value. @returns Nothing. */
  appendObject(property: Property | OUStringConstReference, value: Any): void {
    this.appendValue(this.propertyName(property), PropsSet.Object, "aObject", value);
  }
  /** Original name and Property header overloads. @param property - Actual property or name. @returns Borrowed native name. */
  private propertyName(property: Property | OUStringConstReference): OUStringConstReference {
    return property instanceof Property ? property.Name : property;
  }
  /** Original void append constructs a real temporary Any and keeps NONE as original/cache flags. @param property - Actual property or name. @returns Nothing. */
  appendVoid(property: Property | OUStringConstReference): void {
    const value = new Any();
    try {
      this.appendValue(this.propertyName(property), PropsSet.NONE, "aObject", value);
    } finally {
      value.dispose();
    }
  }
  /** Original property-set metadata, efficient access query and fallback paths. @param set - Actual source property set. @returns Nothing. */
  appendPropertySet(set: Reference<XPropertySet>): void {
    if (!set.is()) return;
    const info = set.operatorStar().getPropertySetInfo();
    try {
      if (!info.is()) return;
      const properties = info.operatorStar().getProperties();
      try {
        const access = new Reference<XPropertyAccess>(set, UNO_QUERY, XPropertyAccess.static_type);
        try {
          const props = properties.getConstArray() as SequenceElements;
          if (access.is()) {
            const values = access.operatorStar().getPropertyValues();
            try {
              const data = values.getConstArray() as SequenceElements;
              for (let n = 0; n < values.getLength(); ++n) {
                const item = data.get(n * 48) as SequenceElements,
                  name = OUString.unacquired(item.get(0) as rtl_uStringSlot);
                for (let i = 0; i < properties.getLength(); ++i) {
                  const prop = props.get(i * 32) as SequenceElements,
                    propName = OUString.unacquired(prop.get(0) as rtl_uStringSlot);
                  if (propName.equals(name)) {
                    this.appendObject(propName, item.get(16) as Any);
                    break;
                  }
                }
              }
            } finally {
              values.dispose();
            }
          } else {
            for (let n = 0; n < properties.getLength(); ++n) {
              const prop = props.get(n * 32) as SequenceElements,
                name = OUString.unacquired(prop.get(0) as rtl_uStringSlot);
              try {
                const value = set.operatorStar().getPropertyValue(name);
                try {
                  if (value.hasValue()) this.appendObject(name, value);
                } finally {
                  value.dispose();
                }
              } catch (error) {
                if (
                  !(error instanceof UnknownPropertyException) &&
                  !(error instanceof WrappedTargetException)
                )
                  throw error;
                error.dispose();
              }
            }
          }
        } finally {
          access.dispose();
        }
      } finally {
        properties.dispose();
      }
    } finally {
      info.dispose();
    }
  }
  /** Original single-property fallback, catching only the two declared lookup failures. @param set - Actual source property set. @param property - Borrowed descriptor. @returns Success. */
  appendPropertySetValue(set: Reference<XPropertySet>, property: Readonly<Property>): boolean {
    if (set.is()) {
      try {
        const value = set.operatorStar().getPropertyValue(property.Name);
        try {
          if (value.hasValue()) {
            this.appendObject(property.Name, value);
            return true;
          }
        } finally {
          value.dispose();
        }
      } catch (error) {
        if (
          !(error instanceof UnknownPropertyException) &&
          !(error instanceof WrappedTargetException)
        )
          throw error;
        error.dispose();
      }
    }
    return false;
  }
}
