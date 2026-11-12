/** @fileoverview Original Duration IDL value and normal generated CPPU type binding, preserving scalar defaults, declared widths and compound member lvalues. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
const the_type: [R | null] = [null];
/** Original generated Duration struct type. @returns Borrowed static type. */
export function cppu_detail_getUnoType_Duration(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.util.Duration\0"),
      null,
      8,
      [
        UnoType.get("bool").getTypeLibType() as R,
        UnoType.get("sal_uInt16").getTypeLibType() as R,
        UnoType.get("sal_uInt16").getTypeLibType() as R,
        UnoType.get("sal_uInt16").getTypeLibType() as R,
        UnoType.get("sal_uInt16").getTypeLibType() as R,
        UnoType.get("sal_uInt16").getTypeLibType() as R,
        UnoType.get("sal_uInt16").getTypeLibType() as R,
        UnoType.get("sal_uInt32").getTypeLibType() as R,
      ],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Complete generated Duration value with declared-width field lvalues. */
export class Duration {
  private readonly members = {
    0: [false],
    2: [0],
    4: [0],
    6: [0],
    8: [0],
    10: [0],
    12: [0],
    16: [0],
  } as {
    0: [boolean];
    2: [number];
    4: [number];
    6: [number];
    8: [number];
    10: [number];
    12: [number];
    16: [number];
  };
  /** Original default/copy/all-member constructors. @param args - Declared arguments. @returns Value. */
  constructor(
    ...args:
      | []
      | [source: Readonly<Duration>]
      | [
          negative: boolean,
          years: number,
          months: number,
          days: number,
          hours: number,
          minutes: number,
          seconds: number,
          nanoseconds: number,
        ]
  ) {
    if (args.length === 1) this.assign(args[0]);
    else if (args.length === 8) {
      this.Negative = args[0];
      this.Years = args[1];
      this.Months = args[2];
      this.Days = args[3];
      this.Hours = args[4];
      this.Minutes = args[5];
      this.Seconds = args[6];
      this.NanoSeconds = args[7];
    }
  }
  /** Original bool member. @returns Scalar. */ get Negative(): boolean {
    return this.members[0][0];
  }
  /** Original declared-width assignment. @param value - Scalar. @returns Nothing. */ set Negative(
    value: boolean,
  ) {
    this.members[0][0] = value;
  }
  /** Original sal_uInt16 member. @returns Scalar. */ get Years(): number {
    return this.members[2][0];
  }
  /** Original declared-width assignment. @param value - Scalar. @returns Nothing. */ set Years(
    value: number,
  ) {
    this.members[2][0] = value & 65535;
  }
  /** Original sal_uInt16 member. @returns Scalar. */ get Months(): number {
    return this.members[4][0];
  }
  /** Original declared-width assignment. @param value - Scalar. @returns Nothing. */ set Months(
    value: number,
  ) {
    this.members[4][0] = value & 65535;
  }
  /** Original sal_uInt16 member. @returns Scalar. */ get Days(): number {
    return this.members[6][0];
  }
  /** Original declared-width assignment. @param value - Scalar. @returns Nothing. */ set Days(
    value: number,
  ) {
    this.members[6][0] = value & 65535;
  }
  /** Original sal_uInt16 member. @returns Scalar. */ get Hours(): number {
    return this.members[8][0];
  }
  /** Original declared-width assignment. @param value - Scalar. @returns Nothing. */ set Hours(
    value: number,
  ) {
    this.members[8][0] = value & 65535;
  }
  /** Original sal_uInt16 member. @returns Scalar. */ get Minutes(): number {
    return this.members[10][0];
  }
  /** Original declared-width assignment. @param value - Scalar. @returns Nothing. */ set Minutes(
    value: number,
  ) {
    this.members[10][0] = value & 65535;
  }
  /** Original sal_uInt16 member. @returns Scalar. */ get Seconds(): number {
    return this.members[12][0];
  }
  /** Original declared-width assignment. @param value - Scalar. @returns Nothing. */ set Seconds(
    value: number,
  ) {
    this.members[12][0] = value & 65535;
  }
  /** Original sal_uInt32 member. @returns Scalar. */ get NanoSeconds(): number {
    return this.members[16][0];
  }
  /** Original declared-width assignment. @param value - Scalar. @returns Nothing. */ set NanoSeconds(
    value: number,
  ) {
    this.members[16][0] = value >>> 0;
  }
  /** Original generated memberwise assignment. @param source - Value. @returns This value. */
  assign(source: Readonly<Duration>): this {
    this.Negative = source.Negative;
    this.Years = source.Years;
    this.Months = source.Months;
    this.Days = source.Days;
    this.Hours = source.Hours;
    this.Minutes = source.Minutes;
    this.Seconds = source.Seconds;
    this.NanoSeconds = source.NanoSeconds;
    return this;
  }
  /** Original generated equality. @param other - Value. @returns Equality. */
  equals(other: Readonly<Duration>): boolean {
    return (
      this.Negative === other.Negative &&
      this.Years === other.Years &&
      this.Months === other.Months &&
      this.Days === other.Days &&
      this.Hours === other.Hours &&
      this.Minutes === other.Minutes &&
      this.Seconds === other.Seconds &&
      this.NanoSeconds === other.NanoSeconds
    );
  }
  /** Original generated inequality. @param other - Value. @returns Inequality. */
  notEquals(other: Readonly<Duration>): boolean {
    return !Duration.prototype.equals.call(this, other);
  }
  /** Original scalar lvalue address. @param offset - Declared offset. @returns Actual member cell. */ get(
    offset: number,
  ): [number] | [boolean] {
    return this.members[offset as keyof typeof this.members];
  }
}
