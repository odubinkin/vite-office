/** @fileoverview Original Date.idl scalar value and normal CPPUMaker type binding; unsigned day/month and signed year retain their declared widths without calendar validation. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
const the_type: [R | null] = [null];
/** Original cached struct metadata in declared member order. @returns Borrowed shared type. */
export function cppu_detail_getUnoType_Date(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.util.Date\0"),
      null,
      3,
      [
        UnoType.get("sal_uInt16").getTypeLibType() as R,
        UnoType.get("sal_uInt16").getTypeLibType() as R,
        UnoType.get("sal_Int16").getTypeLibType() as R,
      ],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Complete original generated scalar value. */
export class Date {
  private readonly members = { 0: [0], 2: [0], 4: [0] } as {
    0: [number];
    2: [number];
    4: [number];
  };
  /** Original default/copy/all-member constructors. @param args - Selected original inputs. @returns Value. */
  constructor(...args: [] | [source: Readonly<Date>] | [day: number, month: number, year: number]) {
    if (args.length === 1) this.assign(args[0]);
    else if (args.length === 3) {
      this.Day = args[0];
      this.Month = args[1];
      this.Year = args[2];
    }
  }
  /** Original unsigned16 day. @returns Scalar. */ get Day(): number {
    return this.members[0][0];
  }
  /** Original declared-width assignment. @param value - New day. @returns Nothing. */ set Day(
    value: number,
  ) {
    this.members[0][0] = value & 0xffff;
  }
  /** Original unsigned16 month. @returns Scalar. */ get Month(): number {
    return this.members[2][0];
  }
  /** Original declared-width assignment. @param value - New month. @returns Nothing. */ set Month(
    value: number,
  ) {
    this.members[2][0] = value & 0xffff;
  }
  /** Original signed16 year. @returns Scalar. */ get Year(): number {
    return this.members[4][0];
  }
  /** Original declared-width assignment. @param value - New year. @returns Nothing. */ set Year(
    value: number,
  ) {
    this.members[4][0] = (value << 16) >> 16;
  }
  /** Original fieldwise assignment. @param source - Borrowed source. @returns This value. */ assign(
    source: Readonly<Date>,
  ): this {
    this.Day = source.Day;
    this.Month = source.Month;
    this.Year = source.Year;
    return this;
  }
  /** Original generated field equality. @param other - Borrowed other value. @returns Equality. */ equals(
    other: Readonly<Date>,
  ): boolean {
    return this.Day === other.Day && this.Month === other.Month && this.Year === other.Year;
  }
  /** Original generated inequality. @param other - Borrowed other value. @returns Inequality. */ notEquals(
    other: Readonly<Date>,
  ): boolean {
    return !Date.prototype.equals.call(this, other);
  }
  /** Existing logical scalar member addresses. @param offset - Declared field offset. @returns Existing scalar cell. */ get(
    offset: number,
  ): [number] {
    return this.members[offset as keyof typeof this.members];
  }
}
