/** @fileoverview Implements original UL spacing state and value contracts from ulspitem.hxx and frmitems.cxx; source aggregate query/write quirks are preserved. */
import { SfxPoolItem } from "../../svl/source/items/poolitem";

/** Owns five native unsigned spacing/proportion fields and contextual behavior. */
export class SvxULSpaceItem extends SfxPoolItem {
  private upper = 0;
  private lower = 0;
  private contextual = false;
  private propUpper = 100;
  private propLower = 100;
  /** Creates native zero spacing defaults. @param which - Item identity. @returns Nothing. */
  public constructor(which: number);
  /** Creates native spacing; the prior contextual argument remains an ingress compatibility boundary. @param upper - Upper twips. @param lower - Lower twips. @param which - Item identity. @param contextual - Prior browser constructor flag. @returns Nothing. */
  public constructor(upper: number, lower: number, which: number, contextual?: boolean);
  /** Initializes native fields and both100 proportions. @param first - Which or upper. @param lower - Lower twips. @param which - Explicit item identity. @param contextual - Prior context ingress. @returns Nothing. */
  public constructor(first: number, lower?: number, which?: number, contextual = false) {
    super(which ?? first);
    if (lower !== undefined) {
      if (!Number.isInteger(first) || !Number.isInteger(lower))
        throw new Error("SvxULSpaceItem value is invalid.");
      this.upper = first & 0xffff;
      this.lower = lower & 0xffff;
      this.contextual = contextual;
    }
  }
  /** Reads upper spacing. @returns Unsigned twips. */
  public GetUpper(): number {
    return this.upper;
  }
  /** Reads lower spacing. @returns Unsigned twips. */
  public GetLower(): number {
    return this.lower;
  }
  /** Reads contextual policy. @returns Context flag. */
  public GetContext(): boolean {
    return this.contextual;
  }
  /** Reads upper proportion. @returns Unsigned percentage. */
  public GetPropUpper(): number {
    return this.propUpper;
  }
  /** Reads lower proportion. @returns Unsigned percentage. */
  public GetPropLower(): number {
    return this.propLower;
  }
  /** Sets upper measure with source unsigned input, scaled truncation and proportion storage. @param value - Native unsigned twips. @param proportion - Native percentage. @returns Nothing. */
  public SetUpper(value: number, proportion = 100): void {
    this.propUpper = proportion & 0xffff;
    this.upper = Math.trunc(((value & 0xffff) * this.propUpper) / 100) & 0xffff;
  }
  /** Sets lower measure with source unsigned input, scaled truncation and proportion storage. @param value - Native unsigned twips. @param proportion - Native percentage. @returns Nothing. */
  public SetLower(value: number, proportion = 100): void {
    this.propLower = proportion & 0xffff;
    this.lower = Math.trunc(((value & 0xffff) * this.propLower) / 100) & 0xffff;
  }
  /** Sets raw upper spacing without changing proportion. @param value - Native unsigned twips. @returns Nothing. */
  public SetUpperValue(value: number): void {
    this.upper = value & 0xffff;
  }
  /** Sets raw lower spacing without changing proportion. @param value - Native unsigned twips. @returns Nothing. */
  public SetLowerValue(value: number): void {
    this.lower = value & 0xffff;
  }
  /** Sets contextual policy. @param value - Native flag. @returns Nothing. */
  public SetContextValue(value: boolean): void {
    this.contextual = value;
  }
  /** Sets independent upper proportion. @param value - Native percentage. @returns Nothing. */
  public SetPropUpper(value: number): void {
    this.propUpper = value & 0xffff;
  }
  /** Sets independent lower proportion. @param value - Native percentage. @returns Nothing. */
  public SetPropLower(value: number): void {
    this.propLower = value & 0xffff;
  }
  /** Copies all five original fields and identity. @returns Independent native item. */
  public Clone(): SvxULSpaceItem {
    return Object.assign(new SvxULSpaceItem(this.Which()), this);
  }
  /** Compares original identity, measures, context and both proportions. @param other - Candidate. @returns Native equality. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxULSpaceItem &&
      other.Which() === this.Which() &&
      other.upper === this.upper &&
      other.lower === this.lower &&
      other.contextual === this.contextual &&
      other.propUpper === this.propUpper &&
      other.propLower === this.propLower
    );
  }
  /** Queries native UNO members, retaining the pinned unconverted aggregate Lower=nPropUpper quirk. @param member - Native member and conversion flag. @returns Native value or unknown-member absence. */
  public QueryValue(member = 0): unknown {
    const convert = (member & 0x80) !== 0;
    const metric =
      /** Converts unsigned native twips to mm100. @param value - Twips. @returns Native measure. */
      (value: number): number => (convert ? Math.trunc((value * 127 + 36) / 72) : value);
    switch (member & ~0x80) {
      case 0:
        return {
          Upper: metric(this.upper),
          Lower: convert ? metric(this.lower) : this.propUpper,
          ScaleUpper: (this.propUpper << 16) >> 16,
          ScaleLower: (this.propLower << 16) >> 16,
        };
      case 3:
        return metric(this.upper);
      case 4:
        return metric(this.lower);
      case 5:
        return (this.propUpper << 16) >> 16;
      case 6:
        return (this.propLower << 16) >> 16;
      case 7:
        return this.contextual;
      default:
        return undefined;
    }
  }
  /** Applies native UNO values including the pinned ScaleLower-to-nPropUpper aggregate write quirk. @param value - UNO payload. @param member - Native member and conversion flag. @returns Whether admitted and applied. */
  public PutValue(value: unknown, member = 0): boolean {
    const convert = (member & 0x80) !== 0,
      id = member & ~0x80;
    const integer =
      /** Admits a native signed32 UNO field. @param field - Candidate. @returns Whether signed32 integer. */
      (field: unknown): field is number =>
        typeof field === "number" &&
        Number.isInteger(field) &&
        field >= -2147483648 &&
        field <= 2147483647;
    const metric =
      /** Converts signed mm100 before native unsigned16 setter admission. @param field - UNO measure. @returns Twips. */
      (field: number): number =>
        convert ? Math.trunc((field * 72 + (field >= 0 ? 63 : -63)) / 127) : field;
    if (id === 0) {
      if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
      const data = value as Record<string, unknown>;
      if (
        ![data.Upper, data.Lower].every(integer) ||
        ![data.ScaleUpper, data.ScaleLower].every(
          /** Admits native signed16 aggregate scale. @param field - Scale candidate. @returns Whether signed16. */
          (field) => integer(field) && field >= -32768 && field <= 32767,
        )
      )
        return false;
      this.SetUpper(metric(data.Upper as number));
      this.SetLower(metric(data.Lower as number));
      if ((data.ScaleUpper as number) > 1) this.propUpper = data.ScaleUpper as number;
      if ((data.ScaleLower as number) > 1) this.propUpper = data.ScaleLower as number;
      return true;
    }
    if (id === 7) {
      if (typeof value !== "boolean") return false;
      this.SetContextValue(value);
      return true;
    }
    if (!integer(value)) return false;
    switch (id) {
      case 3:
        this.SetUpper(metric(value));
        break;
      case 4:
        if (value < 0) return false;
        this.SetLower(metric(value));
        break;
      case 5:
      case 6:
        if (value <= 1) return false;
        if (id === 5) this.propUpper = value & 0xffff;
        else this.propLower = value & 0xffff;
        break;
      default:
        return false;
    }
    return true;
  }
}
