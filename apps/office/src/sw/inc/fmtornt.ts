/** @fileoverview Owns native vertical orientation position, orientation and relation from fmtornt.hxx and atrfrm.cxx. */
import { SfxPoolItem } from "../../svl/source/items/poolitem";
import { VertOrientation } from "../../offapi/com/sun/star/text/VertOrientation";
import { RelOrientation } from "../../offapi/com/sun/star/text/RelOrientation";
import { RES_VERT_ORIENT } from "./hintids";

/** Complete native vertical frame orientation item. */
export class SwFormatVertOrient extends SfxPoolItem {
  /** Creates the native NONE/PRINT_AREA default. @param position - Twip relative position. @param orientation - Native orientation ID. @param relation - Native reference ID. @returns Nothing. */
  public constructor(
    private position = 0,
    private orientation: number = VertOrientation.NONE,
    private relation: number = RelOrientation.PRINT_AREA,
  ) {
    super(RES_VERT_ORIENT);
  }
  /** Reads relative position. @returns Twip position. */
  public GetPos(): number {
    return this.position;
  }
  /** Replaces relative position. @param value - Twip position. @returns Nothing. */
  public SetPos(value: number): void {
    this.position = value;
  }
  /** Reads vertical orientation. @returns Native ID. */
  public GetVertOrient(): number {
    return this.orientation;
  }
  /** Replaces vertical orientation. @param value - Native ID. @returns Nothing. */
  public SetVertOrient(value: number): void {
    this.orientation = value;
  }
  /** Reads reference orientation. @returns Native ID. */
  public GetRelationOrient(): number {
    return this.relation;
  }
  /** Replaces reference orientation. @param value - Native ID. @returns Nothing. */
  public SetRelationOrient(value: number): void {
    this.relation = value;
  }
  /** Copies all native values independently. @returns Complete cloned item. */
  public override Clone(): SwFormatVertOrient {
    return new SwFormatVertOrient(this.position, this.orientation, this.relation);
  }
  /** Compares native identity and all three values. @param other - Candidate item. @returns Whether equal. */
  public override equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SwFormatVertOrient &&
      this.Which() === other.Which() &&
      this.position === other.position &&
      this.orientation === other.orientation &&
      this.relation === other.relation
    );
  }
  /** Queries native member IDs 0/1/2, always converting position to mm100. @param memberId - Native member ID with optional conversion flag. @returns Member value or absent for unsupported IDs. */
  public override QueryValue(memberId = 0): number | undefined {
    switch (memberId & ~0x80) {
      case 0:
        return this.orientation;
      case 1:
        return this.relation;
      case 2:
        return Math.trunc((this.position * 127 + (this.position >= 0 ? 36 : -36)) / 72);
      default:
        return undefined;
    }
  }
  /** Updates native members, retaining native extraction defaults and optional position conversion. @param value - UNO scalar input. @param memberId - Native member and conversion flag. @returns Whether member is supported. */
  public PutValue(value: unknown, memberId: number): boolean {
    const numeric = typeof value === "number" && Number.isInteger(value) ? value : 0;
    switch (memberId & ~0x80) {
      case 0:
        this.orientation =
          numeric >= 0 && numeric <= 65535 ? (numeric > 32767 ? numeric - 65536 : numeric) : 0;
        break;
      case 1:
        this.relation = numeric >= -32768 && numeric <= 32767 ? numeric : 0;
        break;
      case 2:
        const position = numeric >= -2147483648 && numeric <= 2147483647 ? numeric : 0;
        this.position =
          memberId & 0x80
            ? Math.trunc((position * 72 + (position >= 0 ? 63 : -63)) / 127)
            : position;
        break;
      default:
        return false;
    }
    return true;
  }
}
