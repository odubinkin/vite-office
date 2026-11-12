/** @fileoverview Original DateWithTimezone IDL value and normal generated CPPU type binding, preserving scalar defaults, declared widths and compound member lvalues. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { Date, cppu_detail_getUnoType_Date as innerType } from "./Date";
const the_type: [R | null] = [null];
/** Original generated nested struct type. @returns Borrowed static type. */
export function cppu_detail_getUnoType_DateWithTimezone(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.util.DateWithTimezone\0"),
      null,
      2,
      [innerType().getTypeLibType() as R, UnoType.get("sal_Int16").getTypeLibType() as R],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original generated two-member value. */
export class DateWithTimezone {
  private readonly value = new Date();
  private readonly timezone: [number] = [0];
  /** Original default/copy/all-member constructors. @param args - Declared arguments. @returns Value. */ constructor(
    ...args: [] | [source: Readonly<DateWithTimezone>] | [value: Readonly<Date>, timezone: number]
  ) {
    if (args.length === 1) this.assign(args[0]);
    else if (args.length === 2) {
      this.DateInTZ = args[0];
      this.Timezone = args[1];
    }
  }
  /** Original nested member. @returns Actual owned field. */ get DateInTZ(): Date {
    return this.value;
  }
  /** Original nested assignment. @param value - Source. @returns Nothing. */ set DateInTZ(
    value: Readonly<Date>,
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
    source: Readonly<DateWithTimezone>,
  ): this {
    this.DateInTZ = source.DateInTZ;
    this.Timezone = source.Timezone;
    return this;
  }
  /** Original generated equality. @param other - Value. @returns Equality. */ equals(
    other: Readonly<DateWithTimezone>,
  ): boolean {
    return this.DateInTZ.equals(other.DateInTZ) && this.Timezone === other.Timezone;
  }
  /** Original generated inequality. @param other - Value. @returns Inequality. */ notEquals(
    other: Readonly<DateWithTimezone>,
  ): boolean {
    return !DateWithTimezone.prototype.equals.call(this, other);
  }
  /** Existing nested/scalar lvalue. @param offset - Declared offset. @returns Actual member address. */ get(
    offset: number,
  ): Date | [number] {
    return offset === 0 ? this.value : this.timezone;
  }
}
