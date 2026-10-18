/** @fileoverview Original ShadowFormat IDL value and normal static type binding; ordinary scalar cells expose only existing CPPU member lvalues. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import {
  ShadowLocation,
  cppu_detail_getUnoType_ShadowLocation as locationType,
} from "./ShadowLocation";
/** Original generated normal static type cell. */
const the_type: [R | null] = [null];
/** Original member types in IDL order; util.Color is a published long alias. @returns Actual borrowed struct type. */
export function cppu_detail_getUnoType_ShadowFormat(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.table.ShadowFormat\0"),
      null,
      4,
      [
        locationType().getTypeLibType() as R,
        UnoType.get("sal_Int16").getTypeLibType() as R,
        UnoType.get("sal_Bool").getTypeLibType() as R,
        UnoType.get("sal_Int32").getTypeLibType() as R,
      ],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original four member values; JS GC owns the cells, with no binary buffer or allocation manager. */
export class ShadowFormat {
  private readonly location: [ShadowLocation] = [ShadowLocation.NONE];
  private readonly width: [number] = [0];
  private readonly transparent: [boolean] = [false];
  private readonly color: [number] = [0];
  /** Original default, copy and ordered field forms. @param args - Selected original form. @returns Struct. */
  constructor(
    ...args:
      | []
      | [source: Readonly<ShadowFormat>]
      | [location: ShadowLocation, width: number, transparent: boolean, color: number]
  ) {
    if (args.length === 1) this.assign(args[0]);
    else if (args.length === 4) {
      this.Location = args[0];
      this.ShadowWidth = args[1];
      this.IsTransparent = args[2];
      this.Color = args[3];
    }
  }
  /** Original enum value. @returns Location. */
  get Location(): ShadowLocation {
    return this.location[0];
  }
  /** Original enum assignment. @param value - Location. @returns Nothing. */
  set Location(value: ShadowLocation) {
    this.location[0] = value;
  }
  /** Original signed short width. @returns Width. */
  get ShadowWidth(): number {
    return this.width[0];
  }
  /** Original signed16 assignment. @param value - Width. @returns Nothing. */
  set ShadowWidth(value: number) {
    this.width[0] = (value << 16) >> 16;
  }
  /** Original boolean. @returns Transparency flag. */
  get IsTransparent(): boolean {
    return this.transparent[0];
  }
  /** Original boolean assignment. @param value - Transparency. @returns Nothing. */
  set IsTransparent(value: boolean) {
    this.transparent[0] = value;
  }
  /** Original util.Color long. @returns Packed signed value. */
  get Color(): number {
    return this.color[0];
  }
  /** Original signed32 assignment. @param value - Color. @returns Nothing. */
  set Color(value: number) {
    this.color[0] = value | 0;
  }
  /** Actual stable member lvalues at offsets computed by the existing shared type owner; no persisted binary layout. @param offset - Actual member offset. @returns Cell. */
  get(offset: number): [number] | [boolean] {
    return { 0: this.location, 4: this.width, 6: this.transparent, 8: this.color }[
      offset as 0 | 4 | 6 | 8
    ];
  }
  /** Original memberwise assignment. @param source - Source. @returns Recipient. */
  assign(source: Readonly<ShadowFormat>): this {
    this.Location = source.Location;
    this.ShadowWidth = source.ShadowWidth;
    this.IsTransparent = source.IsTransparent;
    this.Color = source.Color;
    return this;
  }
  /** Original generated ordered equality. @param other - Candidate. @returns Equal fields. */
  equals(other: Readonly<ShadowFormat>): boolean {
    return (
      this.Location === other.Location &&
      this.ShadowWidth === other.ShadowWidth &&
      this.IsTransparent === other.IsTransparent &&
      this.Color === other.Color
    );
  }
  /** Original generated inequality. @param other - Candidate. @returns Different fields. */
  notEquals(other: Readonly<ShadowFormat>): boolean {
    return !this.equals(other);
  }
}
