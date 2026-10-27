/** @fileoverview Original DateTime IDL value and normal generated CPPU type binding, preserving scalar defaults, declared widths and compound member lvalues. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
const the_type: [R | null] = [null];
/** Original normal struct type getter uses native IDL member order and shared static metadata. @returns Actual borrowed type. */
export function cppu_detail_getUnoType_DateTime(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.util.DateTime\0"),
      null,
      8,
      [
        UnoType.get("sal_uInt32").getTypeLibType() as R,
        UnoType.get("sal_uInt16").getTypeLibType() as R,
        UnoType.get("sal_uInt16").getTypeLibType() as R,
        UnoType.get("sal_uInt16").getTypeLibType() as R,
        UnoType.get("sal_uInt16").getTypeLibType() as R,
        UnoType.get("sal_uInt16").getTypeLibType() as R,
        UnoType.get("sal_Int16").getTypeLibType() as R,
        UnoType.get("bool").getTypeLibType() as R,
      ],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original generated scalar value; actual shared compound algorithms address the stable native member cells. */
export class DateTime {
  private readonly members = {
    0: [0],
    4: [0],
    6: [0],
    8: [0],
    10: [0],
    12: [0],
    14: [0],
    16: [false],
  } as {
    0: [number];
    4: [number];
    6: [number];
    8: [number];
    10: [number];
    12: [number];
    14: [number];
    16: [boolean];
  };
  /** Original generated default, copy and all-member constructors. @param args - Native selected form. @returns Date-time value. */
  constructor(
    ...args:
      | []
      | [source: Readonly<DateTime>]
      | [
          nanoseconds: number,
          seconds: number,
          minutes: number,
          hours: number,
          day: number,
          month: number,
          year: number,
          isUTC: boolean,
        ]
  ) {
    if (args.length === 1) this.assign(args[0]);
    else if (args.length === 8) {
      this.NanoSeconds = args[0];
      this.Seconds = args[1];
      this.Minutes = args[2];
      this.Hours = args[3];
      this.Day = args[4];
      this.Month = args[5];
      this.Year = args[6];
      this.IsUTC = args[7];
    }
  }
  /** Original sal_uInt32 NanoSeconds field. @returns Native scalar. */
  get NanoSeconds(): number {
    return this.members[0][0];
  }
  /** Original declared-width NanoSeconds assignment. @param value - Native scalar. @returns Nothing. */
  set NanoSeconds(value: number) {
    this.members[0][0] = value >>> 0;
  }
  /** Original sal_uInt16 Seconds field. @returns Native scalar. */
  get Seconds(): number {
    return this.members[4][0];
  }
  /** Original declared-width Seconds assignment. @param value - Native scalar. @returns Nothing. */
  set Seconds(value: number) {
    this.members[4][0] = value & 0xffff;
  }
  /** Original sal_uInt16 Minutes field. @returns Native scalar. */
  get Minutes(): number {
    return this.members[6][0];
  }
  /** Original declared-width Minutes assignment. @param value - Native scalar. @returns Nothing. */
  set Minutes(value: number) {
    this.members[6][0] = value & 0xffff;
  }
  /** Original sal_uInt16 Hours field. @returns Native scalar. */
  get Hours(): number {
    return this.members[8][0];
  }
  /** Original declared-width Hours assignment. @param value - Native scalar. @returns Nothing. */
  set Hours(value: number) {
    this.members[8][0] = value & 0xffff;
  }
  /** Original sal_uInt16 Day field. @returns Native scalar. */
  get Day(): number {
    return this.members[10][0];
  }
  /** Original declared-width Day assignment. @param value - Native scalar. @returns Nothing. */
  set Day(value: number) {
    this.members[10][0] = value & 0xffff;
  }
  /** Original sal_uInt16 Month field. @returns Native scalar. */
  get Month(): number {
    return this.members[12][0];
  }
  /** Original declared-width Month assignment. @param value - Native scalar. @returns Nothing. */
  set Month(value: number) {
    this.members[12][0] = value & 0xffff;
  }
  /** Original sal_Int16 Year field. @returns Native scalar. */
  get Year(): number {
    return this.members[14][0];
  }
  /** Original declared-width Year assignment. @param value - Native scalar. @returns Nothing. */
  set Year(value: number) {
    this.members[14][0] = (value << 16) >> 16;
  }
  /** Original bool IsUTC field. @returns Native scalar. */
  get IsUTC(): boolean {
    return this.members[16][0];
  }
  /** Original declared-width IsUTC assignment. @param value - Native scalar. @returns Nothing. */
  set IsUTC(value: boolean) {
    this.members[16][0] = value;
  }
  /** Original generated fieldwise copy assignment. @param source - Actual value. @returns This value. */
  assign(source: Readonly<DateTime>): this {
    this.NanoSeconds = source.NanoSeconds;
    this.Seconds = source.Seconds;
    this.Minutes = source.Minutes;
    this.Hours = source.Hours;
    this.Day = source.Day;
    this.Month = source.Month;
    this.Year = source.Year;
    this.IsUTC = source.IsUTC;
    return this;
  }
  /** Original generated member equality. @param other - Actual value. @returns Equality. */
  equals(other: Readonly<DateTime>): boolean {
    return (
      this.NanoSeconds === other.NanoSeconds &&
      this.Seconds === other.Seconds &&
      this.Minutes === other.Minutes &&
      this.Hours === other.Hours &&
      this.Day === other.Day &&
      this.Month === other.Month &&
      this.Year === other.Year &&
      this.IsUTC === other.IsUTC
    );
  }
  /** Original generated member inequality. @param other - Actual value. @returns Inequality. */
  notEquals(other: Readonly<DateTime>): boolean {
    return !DateTime.prototype.equals.call(this, other);
  }
  /** Borrows actual declared compound member lvalues; valid offsets are the shared metadata producer contract. @param offset - Native logical offset. @returns Stable scalar cell. */
  get(offset: number): [number] | [boolean] {
    return this.members[offset as keyof typeof this.members];
  }
}
