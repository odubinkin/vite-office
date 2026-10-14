/** @fileoverview Original configmgr type.hxx/type.cxx values and classification, reusing actual shared UNO types rather than inferring types from JS values. */
import type { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import type { Type as UnoTypeValue } from "../../cppu/inc/com/sun/star/uno/Type";
import { UnoType } from "../../cppu/inc/unotype";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";
import { OUString } from "../../sal/inc/rtl/ustring";
import { TypeClass } from "../../udkapi/com/sun/star/uno/TypeClass";

/** Original configuration schema enum, distinct from UNO runtime TypeClass. */
export enum Type {
  TYPE_ERROR,
  TYPE_NIL,
  TYPE_ANY,
  TYPE_BOOLEAN,
  TYPE_SHORT,
  TYPE_INT,
  TYPE_LONG,
  TYPE_DOUBLE,
  TYPE_STRING,
  TYPE_HEXBINARY,
  TYPE_BOOLEAN_LIST,
  TYPE_SHORT_LIST,
  TYPE_INT_LIST,
  TYPE_LONG_LIST,
  TYPE_DOUBLE_LIST,
  TYPE_STRING_LIST,
  TYPE_HEXBINARY_LIST,
}
/** Original lower-bound list predicate. @param type - Schema enum. @returns Whether list type. */
export function isListType(type: Type): boolean {
  return type >= Type.TYPE_BOOLEAN_LIST;
}
/** Original list-element mapping and explicit release exception fallback. @param type - List enum. @returns Element enum. */
export function elementType(type: Type): Type {
  switch (type) {
    case Type.TYPE_BOOLEAN_LIST:
      return Type.TYPE_BOOLEAN;
    case Type.TYPE_SHORT_LIST:
      return Type.TYPE_SHORT;
    case Type.TYPE_INT_LIST:
      return Type.TYPE_INT;
    case Type.TYPE_LONG_LIST:
      return Type.TYPE_LONG;
    case Type.TYPE_DOUBLE_LIST:
      return Type.TYPE_DOUBLE;
    case Type.TYPE_STRING_LIST:
      return Type.TYPE_STRING;
    case Type.TYPE_HEXBINARY_LIST:
      return Type.TYPE_HEXBINARY;
    default:
      throw new RuntimeException(
        new OUString(
          new Uint8Array([
            116, 104, 105, 115, 32, 99, 97, 110, 110, 111, 116, 32, 104, 97, 112, 112, 101, 110, 0,
          ]),
        ),
        new Reference(),
      );
  }
}
/** Original static type mapping returns the actual borrowed shared UnoType cache view. @param type - Schema enum. @returns Actual UNO type. */
export function mapType(type: Type): UnoTypeValue {
  switch (type) {
    case Type.TYPE_ANY:
      return UnoType.get("Any");
    case Type.TYPE_BOOLEAN:
      return UnoType.get("sal_Bool");
    case Type.TYPE_SHORT:
      return UnoType.get("sal_Int16");
    case Type.TYPE_INT:
      return UnoType.get("sal_Int32");
    case Type.TYPE_LONG:
      return UnoType.get("sal_Int64");
    case Type.TYPE_DOUBLE:
      return UnoType.get("double");
    case Type.TYPE_STRING:
      return UnoType.get("OUString");
    case Type.TYPE_HEXBINARY:
      return UnoType.get(["Sequence", "sal_Int8"]);
    case Type.TYPE_BOOLEAN_LIST:
      return UnoType.get(["Sequence", "sal_Bool"]);
    case Type.TYPE_SHORT_LIST:
      return UnoType.get(["Sequence", "sal_Int16"]);
    case Type.TYPE_INT_LIST:
      return UnoType.get(["Sequence", "sal_Int32"]);
    case Type.TYPE_LONG_LIST:
      return UnoType.get(["Sequence", "sal_Int64"]);
    case Type.TYPE_DOUBLE_LIST:
      return UnoType.get(["Sequence", "double"]);
    case Type.TYPE_STRING_LIST:
      return UnoType.get(["Sequence", "OUString"]);
    case Type.TYPE_HEXBINARY_LIST:
      return UnoType.get(["Sequence", ["Sequence", "sal_Int8"]]);
    default:
      throw new RuntimeException(
        new OUString(
          new Uint8Array([
            116, 104, 105, 115, 32, 99, 97, 110, 110, 111, 116, 32, 104, 97, 112, 112, 101, 110, 0,
          ]),
        ),
        new Reference(),
      );
  }
}
/** Original dynamic classifier uses actual Any type/assignability and the exact sequence-name whitelist. @param value - Real initialized Any. @returns Configuration enum. */
export function getDynamicType(value: Any): Type {
  switch (value.getValueTypeClass()) {
    case TypeClass.VOID:
      return Type.TYPE_NIL;
    case TypeClass.BOOLEAN:
      return Type.TYPE_BOOLEAN;
    case TypeClass.BYTE:
    case TypeClass.SHORT:
      return Type.TYPE_SHORT;
    // Boolean indexing preserves the original has<T> choice and its type-cache call.
    // The original primitive compatibility table currently makes the false result unreachable
    // for these initialized unsigned owners; do not invent a payload-range check (CALC-091).
    case TypeClass.UNSIGNED_SHORT:
      return [Type.TYPE_INT, Type.TYPE_SHORT][Number(value.has("sal_Int16"))] as Type;
    case TypeClass.LONG:
      return Type.TYPE_INT;
    case TypeClass.UNSIGNED_LONG:
      return [Type.TYPE_LONG, Type.TYPE_INT][Number(value.has("sal_Int32"))] as Type;
    case TypeClass.HYPER:
      return Type.TYPE_LONG;
    case TypeClass.UNSIGNED_HYPER:
      return [Type.TYPE_ERROR, Type.TYPE_LONG][Number(value.has("sal_Int64"))] as Type;
    case TypeClass.FLOAT:
    case TypeClass.DOUBLE:
      return Type.TYPE_DOUBLE;
    case TypeClass.STRING:
      return Type.TYPE_STRING;
    case TypeClass.SEQUENCE: {
      const name = value.getValueTypeName();
      if (name.equalsAsciiL(new Uint8Array([91, 93, 98, 121, 116, 101]), 6))
        return Type.TYPE_HEXBINARY;
      if (name.equalsAsciiL(new Uint8Array([91, 93, 98, 111, 111, 108, 101, 97, 110]), 9))
        return Type.TYPE_BOOLEAN_LIST;
      if (name.equalsAsciiL(new Uint8Array([91, 93, 115, 104, 111, 114, 116]), 7))
        return Type.TYPE_SHORT_LIST;
      if (name.equalsAsciiL(new Uint8Array([91, 93, 108, 111, 110, 103]), 6))
        return Type.TYPE_INT_LIST;
      if (name.equalsAsciiL(new Uint8Array([91, 93, 104, 121, 112, 101, 114]), 7))
        return Type.TYPE_LONG_LIST;
      if (name.equalsAsciiL(new Uint8Array([91, 93, 100, 111, 117, 98, 108, 101]), 8))
        return Type.TYPE_DOUBLE_LIST;
      if (name.equalsAsciiL(new Uint8Array([91, 93, 115, 116, 114, 105, 110, 103]), 8))
        return Type.TYPE_STRING_LIST;
      if (name.equalsAsciiL(new Uint8Array([91, 93, 91, 93, 98, 121, 116, 101]), 8))
        return Type.TYPE_HEXBINARY_LIST;
      return Type.TYPE_ERROR;
    }
    default:
      return Type.TYPE_ERROR;
  }
}
