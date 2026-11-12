/** @fileoverview Original stoc type converter, numeric parsing/ranges and complete XTypeConverter/XServiceInfo implementation from convert.cxx. Actual UNO descriptions, values and ownership remain in shared owners. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { supportsService } from "../../../cppuhelper/inc/supportsservice";
import { XTypeConverter } from "../../../udkapi/com/sun/star/script/XTypeConverter";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { CannotConvertException } from "../../../udkapi/com/sun/star/script/CannotConvertException";
import { FailReason } from "../../../udkapi/com/sun/star/script/FailReason";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Type } from "../../../cppu/inc/com/sun/star/uno/Type";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { type UnoTypeArgument } from "../../../cppu/inc/unotype";
import {
  cpp_acquire,
  cpp_release,
  cpp_queryInterface,
} from "../../../cppu/inc/com/sun/star/uno/genfunc";
import { TypeClass as C } from "../../../udkapi/com/sun/star/uno/TypeClass";
import { typelib_TypeClass as TC } from "../../../cppu/inc/typelib/typeclass";
import { TypeDescription } from "../../../cppu/inc/typelib/typedescription.hxx";
import {
  TYPELIB_DANGER_GET,
  TYPELIB_DANGER_RELEASE,
  typelib_typedescription_isAssignableFrom,
  type typelib_TypeDescription as D,
  type typelib_TypeDescriptionReference as R,
  type typelib_EnumTypeDescription as E,
  type typelib_IndirectTypeDescription as I,
} from "../../../cppu/inc/typelib/typedescription";
import { uno_sequence_construct, type uno_Sequence } from "../../../cppu/inc/uno/sequence2";
import { uno_assignData, uno_destructData } from "../../../cppu/inc/uno/data";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { rtl_uString, rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { trim, toDouble as stringToDouble } from "../../../o3tl/inc/string_view";

const MIN_I64 = -(1n << 63n),
  MAX_I64 = (1n << 63n) - 1n,
  MAX_U64 = (1n << 64n) - 1n;
const FLT_MAX = 3.4028234663852886e38;
const Names = Sequence.specialize<rtl_uStringSlot>("OUString", 8);
/** Compiler lowering of a source UTF16 expression to its counted RTL constructor. @param text - Actual expression. @returns Owned string. */
function string(text: string): OUString {
  const units = new Uint16Array(text.length);
  for (let i = 0; i < text.length; ++i) units[i] = text.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Compiler UTF16 expression rendering, without argument-count limits or scalar normalization. @param value - Actual counted RTL string. @returns Exact code-unit sequence. */
function utf16(value: OUStringConstReference): string {
  let result = "";
  for (let i = 0; i < value.getLength(); ++i)
    result += String.fromCharCode(value.getStr()[i] as number);
  return result;
}
/** Original cannot-convert construction with empty Context and index0. @param message - Original message. @param destination - Original class field, sometimes the source class. @param reason - Original FailReason. @returns Never. */
function cannot(message: string, destination: C, reason: number): never {
  const name = string(message),
    context = new Reference();
  try {
    throw new CannotConvertException(name, context, destination, reason, 0);
  } finally {
    context.dispose();
    name.dispose();
  }
}
/** Original local rounding helper rounds ties away from zero, including its signed-zero behavior. @param value - Binary64 value. @returns Original rounded value. */
function round(value: number): number {
  const positive = value >= 0.0,
    upper = Math.ceil(Math.abs(value));
  value = upper - Math.abs(value) <= 0.5 ? upper : upper - 1.0;
  return positive ? value : -value;
}
/** Original numeric string helper, with original permissive prefix parsing and special zero/hex validation. @param output - Original double lvalue. @param source - Borrowed counted UTF16. @returns Success. */
function getNumericValue(output: [number], source: Uint16Array): boolean {
  const value = stringToDouble(source);
  if (value === 0.0) {
    const length = source.length;
    if (!length || (length === 1 && source[0] === 48)) {
      output[0] = 0;
      return true;
    }
    const text = trim(source);
    let x = text.indexOf(120);
    if (x < 0) x = text.indexOf(88);
    if (x > 0 && text[x - 1] === 48) {
      let negative = false;
      switch (x) {
        case 2:
          if (text[0] === 45) negative = true;
          else if (text[0] !== 43) return false;
          break;
        case 1:
          break;
        default:
          return false;
      }
      const rest = new OUString(text.subarray(x + 1), text.length - x - 1);
      try {
        const integer = rest.toUInt64(16);
        if (integer === 0n)
          for (let i = rest.getLength(); i--;) if (rest.getStr()[i] !== 48) return false;
        output[0] = negative ? -Number(integer) : Number(integer);
        return true;
      } finally {
        rest.dispose();
      }
    }
    let position = 0;
    if (text.length && (text[0] === 45 || text[0] === 43)) ++position;
    while (position < text.length) {
      if (text[position] !== 48) {
        if (text[position] !== 46) return false;
        ++position;
        while (position < text.length) {
          if (text[position] !== 48) return false;
          ++position;
        }
        break;
      }
      ++position;
    }
  }
  output[0] = value;
  return true;
}
/** Original hyper parsing retains signed casts and the original double-based decimal route. Native undefined floating-integral overflow is not certified. @param output - Original signed64 lvalue. @param source - Counted UTF16. @returns Success. */
function getHyperValue(output: [bigint], source: Uint16Array): boolean {
  const length = source.length;
  if (!length || (length === 1 && source[0] === 48)) {
    output[0] = 0n;
    return true;
  }
  const text = trim(source);
  let x = text.indexOf(120);
  if (x < 0) x = text.indexOf(88);
  if (x >= 0) {
    if (x > 0 && text[x - 1] === 48) {
      let negative = false;
      switch (x) {
        case 2:
          if (text[0] === 45) negative = true;
          else if (text[0] !== 43) return false;
          break;
        case 1:
          break;
        default:
          return false;
      }
      const rest = new OUString(text.subarray(x + 1), text.length - x - 1);
      try {
        const integer = rest.toUInt64(16);
        if (integer === 0n)
          for (let i = rest.getLength(); i--;) if (rest.getStr()[i] !== 48) return false;
        output[0] = BigInt.asIntN(64, negative ? -BigInt.asIntN(64, integer) : integer);
        return true;
      } finally {
        rest.dispose();
      }
    }
    return false;
  }
  const value: [number] = [0];
  if (
    getNumericValue(value, source) &&
    value[0] >= Number(MIN_I64) &&
    value[0] <= Number(MAX_U64)
  ) {
    output[0] = BigInt.asIntN(64, BigInt(round(value[0])));
    return true;
  }
  return false;
}
/** Source forceAccess<OUString> on the actual Any field; no new owner is created. @param value - Borrowed Any. @returns Actual string view. */
function text(value: Readonly<Any>): OUStringConstReference {
  return OUString.unacquired(value.getValue() as rtl_uStringSlot);
}
/** Original anonymous concrete component, implementing both full interfaces in their declared order. */
class TypeConverter_Impl
  extends WeakImplHelper.specialize(XTypeConverter, XServiceInfo)
  implements XTypeConverter, XServiceInfo
{
  /** Original implementation name. @returns Owned RTL string. */
  getImplementationName(): OUString {
    return string("com.sun.star.comp.stoc.TypeConverter");
  }
  /** Original single service helper call. @param service - Borrowed name. @returns Source membership. */
  supportsService(service: OUStringConstReference): boolean {
    return supportsService(this, service as OUString);
  }
  /** Original singleton initializer list, with source temporary lifetime. @returns Owned sequence. */
  getSupportedServiceNames(): Sequence<rtl_uStringSlot> {
    const name = string("com.sun.star.script.Converter");
    try {
      return new Names(
        {
          /** Source initializer element address. @param offset - Zero offset. @returns Actual string field. */ get(
            offset: number,
          ): unknown {
            void offset;
            return name.getDataAddress();
          },
        },
        1,
      );
    } finally {
      name.dispose();
    }
  }
  /** Original integral conversion helper and ranges. Exception DestinationTypeClass deliberately contains the source class. @param value - Borrowed Any. @param min - Signed64 lower bound. @param max - Unsigned64 upper bound. @returns Signed64 bit pattern. */
  private static toHyper(value: Readonly<Any>, min: bigint, max = MAX_U64): bigint {
    const source = value.getValueTypeClass(),
      data = value.getValue() as [number | bigint | boolean];
    let result: bigint;
    switch (source) {
      case C.ENUM:
      case C.CHAR:
      case C.BYTE:
      case C.SHORT:
      case C.UNSIGNED_SHORT:
      case C.LONG:
      case C.UNSIGNED_LONG:
      case C.HYPER:
        result = BigInt(data[0] as number | bigint);
        break;
      case C.BOOLEAN:
        result = data[0] ? 1n : 0n;
        break;
      case C.UNSIGNED_HYPER: {
        const integer = data[0] as bigint;
        if ((min < 0n || integer >= min) && integer <= max) return BigInt.asIntN(64, integer);
        return cannot("UNSIGNED HYPER out of range!", source, FailReason.OUT_OF_RANGE);
      }
      case C.FLOAT:
      case C.DOUBLE: {
        const number = round(data[0] as number);
        if (number >= Number(min) && number <= Number(max))
          return BigInt.asIntN(64, BigInt(number));
        return cannot(
          source === C.FLOAT ? "FLOAT out of range!" : "DOUBLE out of range!",
          source,
          FailReason.OUT_OF_RANGE,
        );
      }
      case C.STRING: {
        const integer: [bigint] = [0n];
        if (!getHyperValue(integer, text(value).getStr().subarray(0, text(value).getLength())))
          cannot("invalid STRING value!", source, FailReason.IS_NOT_NUMBER);
        result = integer[0];
        if (result >= min && (result < 0n || BigInt.asUintN(64, result) <= max)) return result;
        return cannot("STRING value out of range!", source, FailReason.OUT_OF_RANGE);
      }
      default:
        cannot("Type " + source + " is not supported!", source, FailReason.TYPE_NOT_SUPPORTED);
    }
    if (result >= min && (result < 0n || BigInt.asUintN(64, result) <= max)) return result;
    cannot("VALUE is out of range!", source, FailReason.OUT_OF_RANGE);
  }
  /** Original binary64 conversion and inclusive bounds. @param value - Borrowed Any. @param min - Lower bound. @param max - Upper bound. @returns Binary64 value. */
  private static toDouble(
    value: Readonly<Any>,
    min = -Number.MAX_VALUE,
    max = Number.MAX_VALUE,
  ): number {
    const source = value.getValueTypeClass(),
      data = value.getValue() as [number | bigint | boolean];
    let result: number;
    switch (source) {
      case C.ENUM:
      case C.CHAR:
      case C.BYTE:
      case C.SHORT:
      case C.UNSIGNED_SHORT:
      case C.LONG:
      case C.UNSIGNED_LONG:
      case C.HYPER:
      case C.UNSIGNED_HYPER:
      case C.FLOAT:
      case C.DOUBLE:
        result = Number(data[0]);
        break;
      case C.BOOLEAN:
        result = data[0] ? 1.0 : 0.0;
        break;
      case C.STRING: {
        const output: [number] = [0],
          str = text(value);
        if (!getNumericValue(output, str.getStr().subarray(0, str.getLength())))
          cannot("invalid STRING value!", source, FailReason.IS_NOT_NUMBER);
        result = output[0];
        break;
      }
      default:
        cannot("Type " + source + " is not supported!", source, FailReason.TYPE_NOT_SUPPORTED);
    }
    if (result >= min && result <= max) return result;
    cannot("VALUE is out of range!", source, FailReason.OUT_OF_RANGE);
  }
  /** Complete original typed conversion, including recursive sequence conversion and interface querying. @param value - Borrowed Any. @param destination - Borrowed destination Type. @returns Owned converted Any. */
  convertTo(value: Readonly<Any>, destination: Type): Any {
    const sourceType = value.getValueType();
    if (sourceType.equals(destination)) return new Any(value as Any);
    const sourceClass = sourceType.getTypeClass(),
      target = destination.getTypeClass();
    const result = new Any();
    try {
      switch (target) {
        case C.VOID:
          return result;
        case C.ANY:
          result.assign(value as Any);
          return result;
        case C.STRUCT:
        case C.EXCEPTION: {
          const source = new TypeDescription(sourceType),
            dest = new TypeDescription(destination);
          try {
            if (!typelib_typedescription_isAssignableFrom(dest.get() as D, source.get() as D))
              cannot(
                "value is not of same or derived type!",
                target,
                FailReason.SOURCE_IS_NO_DERIVED_TYPE,
              );
            result.setValue(value.getValue(), dest.get());
          } finally {
            dest.dispose();
            source.dispose();
          }
          break;
        }
        case C.INTERFACE: {
          if (!value.hasValue()) {
            result.setValue([null], destination);
            break;
          }
          // Original tryAccess<Reference<XInterface>> borrows the existing interface field without a root query/acquire.
          const pointer =
            sourceClass === C.INTERFACE ? (value.getValue() as [XInterface | null])[0] : null;
          if (!pointer) cannot("value is not interface", target, FailReason.NO_SUCH_INTERFACE);
          const queried = pointer.queryInterface(destination);
          try {
            result.moveAssign(queried);
          } finally {
            queried.dispose();
          }
          if (!result.hasValue()) {
            const name = destination.getTypeName();
            try {
              cannot(
                "value does not implement " + utf16(name),
                target,
                FailReason.NO_SUCH_INTERFACE,
              );
            } finally {
              name.dispose();
            }
          }
          break;
        }
        case C.SEQUENCE: {
          if (sourceClass === C.SEQUENCE) this.convertSequence(value, destination, result);
          break;
        }
        case C.ENUM: {
          const desc = new TypeDescription(destination);
          try {
            desc.makeComplete();
            const enumeration = (desc.get() as D).pSelf as unknown as E;
            let position = -1;
            if (sourceClass === C.STRING) {
              for (position = enumeration.nEnumValues; position--;)
                if (
                  text(value).equalsIgnoreAsciiCase(
                    OUString.unacquired([
                      (enumeration.ppEnumNames as rtl_uString[])[position] as rtl_uString,
                    ]),
                  )
                )
                  break;
            } else if (
              sourceClass !== C.ENUM &&
              sourceClass !== C.BOOLEAN &&
              sourceClass !== C.CHAR
            ) {
              const integer = Number(TypeConverter_Impl.toHyper(value, -0x80000000n, 0x7fffffffn));
              for (position = enumeration.nEnumValues; position--;)
                if (integer === (enumeration.pEnumValues as Int32Array)[position]) break;
            }
            if (position < 0)
              cannot("value cannot be converted to demanded ENUM!", target, FailReason.IS_NOT_ENUM);
            result.setValue(
              (enumeration.pEnumValues as Int32Array).subarray(position, position + 1),
              desc.get(),
            );
          } finally {
            desc.dispose();
          }
          break;
        }
        default:
          try {
            const converted = this.convertToSimpleType(value, target);
            try {
              result.moveAssign(converted);
            } finally {
              converted.dispose();
            }
          } catch (error) {
            if (!(error instanceof IllegalArgumentException)) throw error;
            error.dispose();
          }
      }
      if (result.hasValue()) return result;
      cannot("conversion not possible!", target, FailReason.INVALID);
    } catch (error) {
      result.dispose();
      throw error;
    }
  }
  /** Original sequence-case body retains reverse element traversal and actual UNO assignment. The extracted private body preserves the switch branch and its local ownership boundaries. @param value - Actual sequence Any. @param destination - Destination sequence Type. @param result - Actual result Any local. @returns Nothing. */
  private convertSequence(value: Readonly<Any>, destination: Type, result: Any): void {
    const source = new TypeDescription(value.getValueType()),
      dest = new TypeDescription(destination);
    try {
      if (!dest.is()) {
        const prefix = string("Bad XTypeConverter::convertTo destination "),
          name = destination.getTypeName(),
          context = new Reference(this);
        try {
          prefix.append(name);
          throw new IllegalArgumentException(prefix, context, 1);
        } finally {
          context.dispose();
          name.dispose();
          prefix.dispose();
        }
      }
      const sourceElement: [D | null] = [null],
        destElement: [D | null] = [null];
      TYPELIB_DANGER_GET(sourceElement, ((source.get() as D).pSelf as unknown as I).pType as R);
      TYPELIB_DANGER_GET(destElement, ((dest.get() as D).pSelf as unknown as I).pType as R);
      // The original two danger references are manually released after the loop, not on an element conversion exception.
      let position = (value.getValue() as [uno_Sequence])[0].nElements;
      const sequence: [uno_Sequence | null] = [null];
      uno_sequence_construct(sequence, dest.get() as D, null, position, cpp_acquire);
      result.setValue(sequence, dest.get());
      uno_destructData(sequence, dest.get() as D, cpp_release);
      const destElements = (result.getValue() as [uno_Sequence])[0].elements as SequenceElements;
      const sourceElements = (value.getValue() as [uno_Sequence])[0].elements as SequenceElements;
      while (position--) {
        const target = destElement[0] as D,
          input = sourceElement[0] as D;
        const element = new Any(sourceElements.get(position * input.nSize), input);
        let converted: Any;
        const type = new Type(target.pWeakRef as R);
        try {
          converted = this.convertTo(element, type);
        } finally {
          type.dispose();
          element.dispose();
        }
        try {
          uno_assignData(
            destElements.get(position * target.nSize),
            target,
            target.eTypeClass === TC.ANY ? converted : converted.getValue(),
            target,
            cpp_queryInterface,
            cpp_acquire,
            cpp_release,
          );
        } finally {
          converted.dispose();
        }
      }
      TYPELIB_DANGER_RELEASE(destElement[0] as D);
      TYPELIB_DANGER_RELEASE(sourceElement[0] as D);
    } finally {
      dest.dispose();
      source.dispose();
    }
  }
  /** Complete original simple-type switch and source exclusions. @param value - Borrowed input Any. @param target - Destination TypeClass. @returns Owned converted Any. */
  convertToSimpleType(value: Readonly<Any>, target: C): Any {
    if (
      ![
        C.VOID,
        C.BOOLEAN,
        C.BYTE,
        C.SHORT,
        C.UNSIGNED_SHORT,
        C.LONG,
        C.UNSIGNED_LONG,
        C.HYPER,
        C.UNSIGNED_HYPER,
        C.FLOAT,
        C.DOUBLE,
        C.CHAR,
        C.STRING,
        C.ANY,
      ].includes(target)
    ) {
      const message = string("destination type is not simple!"),
        context = new Reference();
      try {
        throw new IllegalArgumentException(message, context, 1);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
    const source = value.getValueTypeClass();
    if (target === source) return new Any(value as Any);
    const result = new Any();
    try {
      switch (target) {
        case C.VOID:
          return result;
        case C.ANY:
          result.assign(value as Any);
          return result;
        case C.BOOLEAN:
          if (source === C.STRING) {
            const str = text(value),
              zero = string("0"),
              one = string("1"),
              no = string("false"),
              yes = string("true");
            try {
              if (str.equals(zero) || str.equalsIgnoreAsciiCase(no)) result.insert([false], "bool");
              else if (str.equals(one) || str.equalsIgnoreAsciiCase(yes))
                result.insert([true], "bool");
              else
                cannot(
                  "STRING has no boolean value, " + utf16(str),
                  target,
                  FailReason.IS_NOT_BOOL,
                );
            } finally {
              yes.dispose();
              no.dispose();
              one.dispose();
              zero.dispose();
            }
          } else if (source !== C.ENUM)
            result.insert([TypeConverter_Impl.toDouble(value) !== 0], "bool");
          break;
        case C.CHAR:
          if (source === C.STRING) {
            const str = text(value);
            if (str.getLength() === 1) result.insert([str.getStr()[0]], "sal_Unicode");
          } else if (source !== C.ENUM && source !== C.CHAR)
            result.insert([Number(TypeConverter_Impl.toHyper(value, 0n, 0xffffn))], "sal_Unicode");
          break;
        case C.BYTE:
        case C.SHORT:
        case C.UNSIGNED_SHORT:
        case C.LONG:
        case C.UNSIGNED_LONG:
        case C.HYPER:
        case C.UNSIGNED_HYPER: {
          const limits: Partial<Record<C, readonly [bigint, bigint, UnoTypeArgument]>> = {
            [C.BYTE]: [-0x80n, 0x7fn, "sal_Int8"],
            [C.SHORT]: [-0x8000n, 0x7fffn, "sal_Int16"],
            [C.UNSIGNED_SHORT]: [0n, 0xffffn, "sal_uInt16"],
            [C.LONG]: [-0x80000000n, 0x7fffffffn, "sal_Int32"],
            [C.UNSIGNED_LONG]: [0n, 0xffffffffn, "sal_uInt32"],
            [C.HYPER]: [MIN_I64, MAX_I64, "sal_Int64"],
            [C.UNSIGNED_HYPER]: [0n, MAX_U64, "sal_uInt64"],
          };
          const [min, max, type] = limits[target] as readonly [bigint, bigint, UnoTypeArgument],
            number = TypeConverter_Impl.toHyper(value, min, max);
          result.insert(
            [
              target === C.HYPER
                ? number
                : target === C.UNSIGNED_HYPER
                  ? BigInt.asUintN(64, number)
                  : Number(number),
            ],
            type as Exclude<UnoTypeArgument, "Any">,
          );
          break;
        }
        case C.FLOAT:
          result.insert(
            [Math.fround(TypeConverter_Impl.toDouble(value, -FLT_MAX, FLT_MAX))],
            "float",
          );
          break;
        case C.DOUBLE:
          result.insert([TypeConverter_Impl.toDouble(value)], "double");
          break;
        case C.STRING: {
          let converted: OUString;
          if (source === C.ENUM) {
            const desc = new TypeDescription(value.getValueType());
            try {
              desc.makeComplete();
              const enumeration = (desc.get() as D).pSelf as unknown as E,
                integer = (value.getValue() as [number])[0];
              let position = enumeration.nEnumValues;
              while (position--)
                if (integer === (enumeration.pEnumValues as Int32Array)[position]) break;
              if (position < 0) cannot("value is not ENUM!", target, FailReason.IS_NOT_ENUM);
              result.insert([(enumeration.ppEnumNames as rtl_uString[])[position]], "OUString");
            } finally {
              desc.dispose();
            }
            break;
          }
          if (source === C.BOOLEAN)
            converted = string((value.getValue() as [boolean])[0] ? "true" : "false");
          else if (source === C.CHAR)
            converted = new OUString(new Uint16Array([(value.getValue() as [number])[0]]), 1);
          else if (
            [C.BYTE, C.SHORT, C.UNSIGNED_SHORT, C.LONG, C.UNSIGNED_LONG, C.HYPER].includes(source)
          )
            converted = new OUString(
              OUString.number(
                source === C.UNSIGNED_LONG
                  ? BigInt((value.getValue() as [number])[0])
                  : (value.getValue() as [number | bigint])[0],
              ),
            );
          else converted = OUString.numberDouble(TypeConverter_Impl.toDouble(value));
          try {
            result.insert(converted.getDataAddress(), "OUString");
          } finally {
            converted.dispose();
          }
          break;
        }
      }
      if (result.hasValue()) return result;
      cannot("conversion not possible!", target, FailReason.INVALID);
    } catch (error) {
      result.dispose();
      throw error;
    }
  }
}
/** Original component constructor export ignores context/arguments and returns one acquired root pointer. @param context - Original unused context pointer. @param args - Original unused argument sequence. @returns Acquired actual component. */
export function com_sun_star_comp_stoc_TypeConverter_get_implementation(
  context: XComponentContext | null,
  args: Sequence<Any>,
): XInterface {
  void context;
  void args;
  const component = new TypeConverter_Impl();
  component.acquire();
  return component;
}
