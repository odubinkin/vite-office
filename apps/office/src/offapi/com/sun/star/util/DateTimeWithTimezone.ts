/** @fileoverview Original DateTimeWithTimezone IDL value and normal generated CPPU type binding, preserving scalar defaults, declared widths and compound member lvalues. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { DateTime, cppu_detail_getUnoType_DateTime as innerType } from "./DateTime";
const the_type: [R | null] = [null];
/** Original generated nested struct type. @returns Borrowed static type. */
export function cppu_detail_getUnoType_DateTimeWithTimezone(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.util.DateTimeWithTimezone\0"),
      null,
      2,
      [innerType().getTypeLibType() as R, UnoType.get("sal_Int16").getTypeLibType() as R],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original generated two-member value. */
export class DateTimeWithTimezone {
  private readonly value = new DateTime();
  private readonly timezone: [number] = [0];
  /** Original default/copy/all-member constructors. @param args - Declared arguments. @returns Value. */ constructor(
    ...args:
      [] | [source: Readonly<DateTimeWithTimezone>] | [value: Readonly<DateTime>, timezone: number]
  ) {
    if (args.length === 1) this.assign(args[0]);
    else if (args.length === 2) {
      this.DateTimeInTZ = args[0];
      this.Timezone = args[1];
    }
  }
  /** Original nested member. @returns Actual owned field. */ get DateTimeInTZ(): DateTime {
    return this.value;
  }
  /** Original nested assignment. @param value - Source. @returns Nothing. */ set DateTimeInTZ(
    value: Readonly<DateTime>,
  ) {
    this.value.assign(value);
  }
  /** Original signed16 offset. @returns Minutes. */ get Timezone(): number {
    return this.timezone[0];
  }
  /** Original declared-width assignment. @param value - Minutes. @returns Nothing. */ set Timezone(
    value: number,
  ) {
    this.timezone[0] = (value << 16) >> 16;
  }
  /** Original generated assignment. @param source - Value. @returns This value. */ assign(
    source: Readonly<DateTimeWithTimezone>,
  ): this {
    this.DateTimeInTZ = source.DateTimeInTZ;
    this.Timezone = source.Timezone;
    return this;
  }
  /** Original generated equality. @param other - Value. @returns Equality. */ equals(
    other: Readonly<DateTimeWithTimezone>,
  ): boolean {
    return this.DateTimeInTZ.equals(other.DateTimeInTZ) && this.Timezone === other.Timezone;
  }
  /** Original generated inequality. @param other - Value. @returns Inequality. */ notEquals(
    other: Readonly<DateTimeWithTimezone>,
  ): boolean {
    return !DateTimeWithTimezone.prototype.equals.call(this, other);
  }
  /** Existing nested/scalar lvalue. @param offset - Declared offset. @returns Actual member address. */ get(
    offset: number,
  ): DateTime | [number] {
    return offset === 0 ? this.value : this.timezone;
  }
}
