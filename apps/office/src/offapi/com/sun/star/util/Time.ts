/** @fileoverview Original Time IDL value and normal generated CPPU type binding, preserving scalar defaults, declared widths and compound member lvalues. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
const the_type: [R | null] = [null];
/** Original normal struct type getter uses native IDL member order and shared static metadata. @returns Actual borrowed type. */
export function cppu_detail_getUnoType_Time(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.util.Time\0"),
      null,
      5,
      [
        UnoType.get("sal_uInt32").getTypeLibType() as R,
        UnoType.get("sal_uInt16").getTypeLibType() as R,
        UnoType.get("sal_uInt16").getTypeLibType() as R,
        UnoType.get("sal_uInt16").getTypeLibType() as R,
        UnoType.get("bool").getTypeLibType() as R,
      ],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original generated scalar value; actual shared compound algorithms address the stable native member cells. */
export class Time {
  private readonly members = {
    0: [0],
    4: [0],
    6: [0],
    8: [0],
    10: [false],
  } as {
    0: [number];
    4: [number];
    6: [number];
    8: [number];
    10: [boolean];
  };
  /** Original generated default, copy and all-member constructors. @param args - Native selected form. @returns Time value. */
  constructor(
    ...args:
      | []
      | [source: Readonly<Time>]
      | [nanoseconds: number, seconds: number, minutes: number, hours: number, isUTC: boolean]
  ) {
    if (args.length === 1) this.assign(args[0]);
    else if (args.length === 5) {
      this.NanoSeconds = args[0];
      this.Seconds = args[1];
      this.Minutes = args[2];
      this.Hours = args[3];
      this.IsUTC = args[4];
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
  /** Original bool IsUTC field. @returns Native scalar. */
  get IsUTC(): boolean {
    return this.members[10][0];
  }
  /** Original declared-width IsUTC assignment. @param value - Native scalar. @returns Nothing. */
  set IsUTC(value: boolean) {
    this.members[10][0] = value;
  }
  /** Original generated fieldwise copy assignment. @param source - Actual value. @returns This value. */
  assign(source: Readonly<Time>): this {
    this.NanoSeconds = source.NanoSeconds;
    this.Seconds = source.Seconds;
    this.Minutes = source.Minutes;
    this.Hours = source.Hours;
    this.IsUTC = source.IsUTC;
    return this;
  }
  /** Original generated member equality. @param other - Actual value. @returns Equality. */
  equals(other: Readonly<Time>): boolean {
    return (
      this.NanoSeconds === other.NanoSeconds &&
      this.Seconds === other.Seconds &&
      this.Minutes === other.Minutes &&
      this.Hours === other.Hours &&
      this.IsUTC === other.IsUTC
    );
  }
  /** Original generated member inequality. @param other - Actual value. @returns Inequality. */
  notEquals(other: Readonly<Time>): boolean {
    return !Time.prototype.equals.call(this, other);
  }
  /** Borrows actual declared compound member lvalues; valid offsets are the shared metadata producer contract. @param offset - Native logical offset. @returns Stable scalar cell. */
  get(offset: number): [number] | [boolean] {
    return this.members[offset as keyof typeof this.members];
  }
}
