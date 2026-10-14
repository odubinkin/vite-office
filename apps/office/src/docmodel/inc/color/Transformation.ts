/** @fileoverview Native color transformation values; application belongs to the actual Color/ComplexColor owners. */
import { hash_combine } from "../../../o3tl/inc/hash_combine";
/** Original transformation identifiers. */
export enum TransformationType {
  Undefined,
  Red,
  RedMod,
  RedOff,
  Green,
  GreenMod,
  GreenOff,
  Blue,
  BlueMod,
  BlueOff,
  Alpha,
  AlphaMod,
  AlphaOff,
  Hue,
  HueMod,
  HueOff,
  Sat,
  SatMod,
  SatOff,
  Lum,
  LumMod,
  LumOff,
  Shade,
  Tint,
  Gray,
  Comp,
  Inv,
  Gamma,
  InvGamma,
}
/** Original independent transformation value. */
export class Transformation {
  public meType: TransformationType;
  public mnValue: number;
  /** Original authored or implicit-copy construction. @param args - Native value or actual source. @returns Transformation. */
  constructor(
    ...args: [type: TransformationType, value: number] | [source: Readonly<Transformation>]
  ) {
    const source = args[0];
    this.meType = typeof source === "number" ? source : source.meType;
    this.mnValue = typeof source === "number" ? (args[1] as number) : source.mnValue;
  }
  /** Original value equality. @param other - Candidate. @returns Equality. */
  public equals(other: Readonly<Transformation>): boolean {
    return this.meType === other.meType && this.mnValue === other.mnValue;
  }
  /** Original field fold with existing browser32 logical scalar hash binding, not native ABI std::hash. @returns Logical hash. */
  public getHash(): number {
    const seed: [number] = [0];
    hash_combine(seed, this.meType);
    hash_combine(seed, this.mnValue);
    return seed[0];
  }
}
