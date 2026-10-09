/** @fileoverview Original mdds3.2.1 standard scalar block type IDs and unmanaged aliases; scalar callbacks retain explicit native type witnesses; traits are a separate dependency. */
// SPDX-FileCopyrightText: 2022 - 2025 Kohei Yoshida
// SPDX-License-Identifier: MIT
import { MDDS_MTV_DEFINE_ELEMENT_CALLBACKS } from "./macro.ts";
import { default_element_block, element_type_reserved_start } from "./types.ts";
export const element_type_boolean = element_type_reserved_start;
export const element_type_int8 = element_type_reserved_start + 1;
export const element_type_uint8 = element_type_reserved_start + 2;
export const element_type_int16 = element_type_reserved_start + 3;
export const element_type_uint16 = element_type_reserved_start + 4;
export const element_type_int32 = element_type_reserved_start + 5;
export const element_type_uint32 = element_type_reserved_start + 6;
export const element_type_int64 = element_type_reserved_start + 7;
export const element_type_uint64 = element_type_reserved_start + 8;
export const element_type_float = element_type_reserved_start + 9;
export const element_type_double = element_type_reserved_start + 10;
export const element_type_string = element_type_reserved_start + 11;
/** Retains native bool conversion at typed scalar call boundaries. @param value - Scalar. @returns Native bool. */
function boolean_value(value: boolean): boolean {
  return Boolean(value);
}
/** Retains native signed8 narrowing. @param value - Scalar. @returns Native int8. */
function int8_value(value: number): number {
  return (value << 24) >> 24;
}
/** Retains native unsigned8 narrowing. @param value - Scalar. @returns Native uint8. */
function uint8_value(value: number): number {
  return value & 255;
}
/** Retains native signed16 narrowing. @param value - Scalar. @returns Native int16. */
function int16_value(value: number): number {
  return (value << 16) >> 16;
}
/** Retains native unsigned16 narrowing. @param value - Scalar. @returns Native uint16. */
function uint16_value(value: number): number {
  return value & 65535;
}
/** Retains native signed32 narrowing. @param value - Scalar. @returns Native int32. */
function int32_value(value: number): number {
  return value | 0;
}
/** Retains native unsigned32 narrowing. @param value - Scalar. @returns Native uint32. */
function uint32_value(value: number): number {
  return value >>> 0;
}
/** Retains native signed64 narrowing with exact bigint storage. @param value - Scalar. @returns Native int64. */
function int64_value(value: bigint): bigint {
  return BigInt.asIntN(64, value);
}
/** Retains native unsigned64 narrowing with exact bigint storage. @param value - Scalar. @returns Native uint64. */
function uint64_value(value: bigint): bigint {
  return BigInt.asUintN(64, value);
}
/** Retains native float rounding. @param value - Scalar. @returns Native float. */
function float_value(value: number): number {
  return Math.fround(value);
}
/** Retains native double scalar. @param value - Scalar. @returns Native double. */
function double_value(value: number): number {
  return value;
}
/** Borrows immutable scalar string value; native string allocation/ABI is unverified. @param value - Scalar. @returns Native value adaptation. */
function string_value(value: string): string {
  return value;
}
export const boolean_element_block = default_element_block<boolean>(
  element_type_boolean,
  false,
  boolean_value,
);
export const int8_element_block = default_element_block<number>(element_type_int8, 0, int8_value);
export const uint8_element_block = default_element_block<number>(
  element_type_uint8,
  0,
  uint8_value,
);
export const int16_element_block = default_element_block<number>(
  element_type_int16,
  0,
  int16_value,
);
export const uint16_element_block = default_element_block<number>(
  element_type_uint16,
  0,
  uint16_value,
);
export const int32_element_block = default_element_block<number>(
  element_type_int32,
  0,
  int32_value,
);
export const uint32_element_block = default_element_block<number>(
  element_type_uint32,
  0,
  uint32_value,
);
export const int64_element_block = default_element_block<bigint>(
  element_type_int64,
  0n,
  int64_value,
);
export const uint64_element_block = default_element_block<bigint>(
  element_type_uint64,
  0n,
  uint64_value,
);
export const float_element_block = default_element_block<number>(
  element_type_float,
  0,
  float_value,
);
export const double_element_block = default_element_block<number>(
  element_type_double,
  0,
  double_value,
);
export const string_element_block = default_element_block<string>(
  element_type_string,
  "",
  string_value,
);

/** Original boolean value-type callback specialization, explicit because TS erases native overload types. */
export const boolean_element_callbacks = MDDS_MTV_DEFINE_ELEMENT_CALLBACKS(
  element_type_boolean,
  false,
  boolean_element_block,
);

/** Original int8 value-type callback specialization, explicit because TS erases native overload types. */
export const int8_element_callbacks = MDDS_MTV_DEFINE_ELEMENT_CALLBACKS(
  element_type_int8,
  0,
  int8_element_block,
);

/** Original uint8 value-type callback specialization, explicit because TS erases native overload types. */
export const uint8_element_callbacks = MDDS_MTV_DEFINE_ELEMENT_CALLBACKS(
  element_type_uint8,
  0,
  uint8_element_block,
);

/** Original int16 value-type callback specialization, explicit because TS erases native overload types. */
export const int16_element_callbacks = MDDS_MTV_DEFINE_ELEMENT_CALLBACKS(
  element_type_int16,
  0,
  int16_element_block,
);

/** Original uint16 value-type callback specialization, explicit because TS erases native overload types. */
export const uint16_element_callbacks = MDDS_MTV_DEFINE_ELEMENT_CALLBACKS(
  element_type_uint16,
  0,
  uint16_element_block,
);

/** Original int32 value-type callback specialization, explicit because TS erases native overload types. */
export const int32_element_callbacks = MDDS_MTV_DEFINE_ELEMENT_CALLBACKS(
  element_type_int32,
  0,
  int32_element_block,
);

/** Original uint32 value-type callback specialization, explicit because TS erases native overload types. */
export const uint32_element_callbacks = MDDS_MTV_DEFINE_ELEMENT_CALLBACKS(
  element_type_uint32,
  0,
  uint32_element_block,
);

/** Original int64 value-type callback specialization, explicit because TS erases native overload types. */
export const int64_element_callbacks = MDDS_MTV_DEFINE_ELEMENT_CALLBACKS(
  element_type_int64,
  0n,
  int64_element_block,
);

/** Original uint64 value-type callback specialization, explicit because TS erases native overload types. */
export const uint64_element_callbacks = MDDS_MTV_DEFINE_ELEMENT_CALLBACKS(
  element_type_uint64,
  0n,
  uint64_element_block,
);

/** Original float value-type callback specialization, explicit because TS erases native overload types. */
export const float_element_callbacks = MDDS_MTV_DEFINE_ELEMENT_CALLBACKS(
  element_type_float,
  0,
  float_element_block,
);

/** Original double value-type callback specialization, explicit because TS erases native overload types. */
export const double_element_callbacks = MDDS_MTV_DEFINE_ELEMENT_CALLBACKS(
  element_type_double,
  0,
  double_element_block,
);

/** Original string value-type callback specialization, explicit because TS erases native overload types. */
export const string_element_callbacks = MDDS_MTV_DEFINE_ELEMENT_CALLBACKS(
  element_type_string,
  "",
  string_element_block,
);
