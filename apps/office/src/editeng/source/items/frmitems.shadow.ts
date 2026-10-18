/** @fileoverview Native SvxShadowItem value, space, metrics and typed Any contracts from shaditem.hxx/frmitems.cxx; presentation/XML diagnostics remain unported. */
import { SfxPoolItem } from "../../../svl/source/items/poolitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import { MID_WIDTH } from "../../../svl/inc/memberid";
import { Color, ColorTransparency, COL_GRAY } from "../../../tools/inc/color";
import { hash_combine } from "../../../o3tl/inc/hash_combine";
import { convert, Length } from "../../../o3tl/inc/unit_conversion";
import { convertTwipToMm100 } from "../../../tools/inc/UnitConversion";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import {
  ShadowFormat,
  cppu_detail_getUnoType_ShadowFormat as shadowType,
} from "../../../offapi/com/sun/star/table/ShadowFormat";
import {
  ShadowLocation,
  cppu_detail_getUnoType_ShadowLocation as locationType,
} from "../../../offapi/com/sun/star/table/ShadowLocation";
import { SvxShadowLocation } from "../../inc/svxenum";
import {
  MID_LOCATION,
  MID_TRANSPARENT,
  MID_BG_COLOR,
  MID_SHADOW_TRANSPARENCE,
} from "../../inc/memberids";
/** Original shadow side order. */
export enum SvxShadowItemSide {
  TOP,
  BOTTOM,
  LEFT,
  RIGHT,
}
/** Original native shadow item; Color is an owned ordinary value, not a CSS string or lifetime wrapper. */
export class SvxShadowItem extends SfxPoolItem {
  private readonly aShadowColor: Color;
  private nWidth: number;
  private eLocation: SvxShadowLocation;
  /** Original Which/color/width/location form. @param which - Identity. @param color - Optional color value. @param width - Unsigned16 width. @param location - Native location. @returns Item. */
  constructor(
    which: number,
    color?: Readonly<Color> | null,
    width?: number,
    location?: SvxShadowLocation,
  );
  /** Original implicit copy form. @param source - Actual item. @returns Independent copy. */
  constructor(source: Readonly<SvxShadowItem>);
  /** Selects original construction; ordinary JS GC owns copied values. @param source - Which or item. @param color - Optional color. @param width - Width. @param location - Location. @returns Item. */
  constructor(
    source: number | Readonly<SvxShadowItem>,
    color: Readonly<Color> | null = null,
    width = 100,
    location = SvxShadowLocation.NONE,
  ) {
    super(typeof source === "number" ? source : source.Which());
    this.aShadowColor = new Color(
      typeof source === "number" ? (color ?? COL_GRAY) : source.GetColor(),
    );
    this.nWidth = typeof source === "number" ? width & 0xffff : source.GetWidth();
    this.eLocation = typeof source === "number" ? location : source.GetLocation();
  }
  /** Original default Which0. @returns Default shadow. */
  static CreateDefault(): SvxShadowItem {
    return new SvxShadowItem(0);
  }
  /** Original borrowed const Color value. @returns Color. */
  GetColor(): Readonly<Color> {
    return this.aShadowColor;
  }
  /** Original value assignment preserves the member's identity. @param color - New value. @returns Nothing. */
  SetColor(color: Readonly<Color>): void {
    this.aShadowColor.assign(color);
  }
  /** Original unsigned16 width. @returns Width. */
  GetWidth(): number {
    return this.nWidth;
  }
  /** Original parameter conversion. @param width - Width. @returns Nothing. */
  SetWidth(width: number): void {
    this.nWidth = width & 0xffff;
  }
  /** Original location. @returns Location. */
  GetLocation(): SvxShadowLocation {
    return this.eLocation;
  }
  /** Original location assignment. @param location - Location. @returns Nothing. */
  SetLocation(location: SvxShadowLocation): void {
    this.eLocation = location;
  }
  /** Original implicit deep value copy. @param pool - Unused pool. @returns Clone. */
  override Clone(pool?: SfxItemPool): SvxShadowItem {
    void pool;
    return new SvxShadowItem(this);
  }
  /** Original value comparison ignores Which. @param other - Candidate. @returns Equal value. */
  override equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxShadowItem &&
      this.aShadowColor.equals(other.aShadowColor) &&
      this.nWidth === other.nWidth &&
      this.eLocation === other.eLocation
    );
  }
  /** Original item advertises value hashing. @returns True. */
  supportsHashCode(): boolean {
    return true;
  }
  /** Original signed color/width/location fold without Which. @returns Logical hash. */
  hashCode(): bigint {
    const seed: [bigint] = [0n];
    for (const value of [this.aShadowColor.toInt32(), this.nWidth, this.eLocation])
      hash_combine(seed, value);
    return seed[0];
  }
  /** Original side switch and NONE/End/default behavior. @param side - Requested side. @returns Occupied width. */
  CalcShadowSpace(side: SvxShadowItemSide): number {
    switch (side) {
      case SvxShadowItemSide.TOP:
        return this.eLocation === SvxShadowLocation.TopLeft ||
          this.eLocation === SvxShadowLocation.TopRight
          ? this.nWidth
          : 0;
      case SvxShadowItemSide.BOTTOM:
        return this.eLocation === SvxShadowLocation.BottomLeft ||
          this.eLocation === SvxShadowLocation.BottomRight
          ? this.nWidth
          : 0;
      case SvxShadowItemSide.LEFT:
        return this.eLocation === SvxShadowLocation.TopLeft ||
          this.eLocation === SvxShadowLocation.BottomLeft
          ? this.nWidth
          : 0;
      case SvxShadowItemSide.RIGHT:
        return this.eLocation === SvxShadowLocation.TopRight ||
          this.eLocation === SvxShadowLocation.BottomRight
          ? this.nWidth
          : 0;
      default:
        return 0;
    }
  }
  /** Original BigInt::Scale llround then unsigned16 assignment on defined finite numeric inputs. @param scale - Factor. @returns Nothing. */
  override ScaleMetrics(scale: number): void {
    const value = this.nWidth * scale;
    this.nWidth = (value < 0 ? -Math.round(-value) : Math.round(value)) & 0xffff;
  }
  /** Original metric support. @returns True. */
  override HasMetrics(): boolean {
    return true;
  }
  /** Original Any query; absent output retains the existing failed base browser projection. @param output - Native output. @param member - Unsigned8 member and convert flag. @returns Success or absent base projection. */
  override QueryValue(output?: Any, member = 0): boolean | undefined {
    if (output === undefined) return undefined;
    const convertTwips = (member & 0x80) !== 0;
    member &= 0x7f;
    let location = ShadowLocation.NONE;
    switch (this.eLocation) {
      case SvxShadowLocation.TopLeft:
        location = ShadowLocation.TOP_LEFT;
        break;
      case SvxShadowLocation.TopRight:
        location = ShadowLocation.TOP_RIGHT;
        break;
      case SvxShadowLocation.BottomLeft:
        location = ShadowLocation.BOTTOM_LEFT;
        break;
      case SvxShadowLocation.BottomRight:
        location = ShadowLocation.BOTTOM_RIGHT;
        break;
    }
    const shadow = new ShadowFormat(
      location,
      convertTwips ? convertTwipToMm100(this.nWidth) : this.nWidth,
      this.aShadowColor.IsTransparent(),
      this.aShadowColor.toInt32(),
    );
    switch (member) {
      case MID_LOCATION:
        output.insert([shadow.Location], locationType);
        break;
      case MID_WIDTH:
        output.insert([shadow.ShadowWidth], "sal_Int16");
        break;
      case MID_TRANSPARENT:
        output.insert([shadow.IsTransparent], "sal_Bool");
        break;
      case MID_BG_COLOR:
        output.insert([shadow.Color], "sal_Int32");
        break;
      case 0:
        output.insert(shadow, shadowType);
        break;
      case MID_SHADOW_TRANSPARENCE:
        output.insert(
          [Math.round(Math.fround(((255 - this.aShadowColor.GetAlpha()) * 100) / 255))],
          "sal_Int8",
        );
        break;
      default:
        return false;
    }
    return true;
  }
  /** Original Put switch, including ignored extraction results and unused IsTransparent field. @param value - Actual Any input. @param member - Unsigned8 member and convert flag. @returns Native result. */
  override PutValue(value: Any, member: number): boolean {
    const convertTwips = (member & 0x80) !== 0;
    member &= 0x7f;
    const shadow = new ShadowFormat(),
      initial = new Any();
    let result: boolean;
    try {
      this.QueryValue(initial, convertTwips ? 0x80 : 0);
      result = initial.extract(shadow, shadowType);
    } finally {
      initial.dispose();
    }
    switch (member) {
      case MID_LOCATION: {
        const location: [ShadowLocation] = [shadow.Location];
        result = value.extract(location, locationType);
        if (!result) {
          const scalar: [number] = [0];
          result = value.extract(scalar, "sal_Int16");
          location[0] = scalar[0];
        }
        shadow.Location = location[0];
        break;
      }
      case MID_WIDTH: {
        const width: [number] = [shadow.ShadowWidth];
        value.extract(width, "sal_Int16");
        shadow.ShadowWidth = width[0];
        break;
      }
      case MID_TRANSPARENT: {
        const flag: [boolean] = [shadow.IsTransparent];
        value.extract(flag, "bool");
        shadow.IsTransparent = flag[0];
        break;
      }
      case MID_BG_COLOR: {
        const color: [number] = [shadow.Color];
        value.extract(color, "sal_Int32");
        shadow.Color = color[0];
        break;
      }
      case 0:
        value.extract(shadow, shadowType);
        break;
      case MID_SHADOW_TRANSPARENCE: {
        const transparency: [number] = [0];
        if (value.extract(transparency, "sal_Int32")) {
          const product = transparency[0] * 255;
          if (product >= -2147483648 && product <= 2147483647) {
            const color = new Color(ColorTransparency, shadow.Color, "ColorTransparencyTag"),
              fraction = Math.fround(Math.fround(product) / 100);
            color.SetAlpha(255 - (fraction < 0 ? -Math.round(-fraction) : Math.round(fraction)));
            shadow.Color = color.toInt32();
          }
        }
        break;
      }
      default:
        return false;
    }
    if (result) {
      switch (shadow.Location) {
        case ShadowLocation.NONE:
          this.eLocation = SvxShadowLocation.NONE;
          break;
        case ShadowLocation.TOP_LEFT:
          this.eLocation = SvxShadowLocation.TopLeft;
          break;
        case ShadowLocation.TOP_RIGHT:
          this.eLocation = SvxShadowLocation.TopRight;
          break;
        case ShadowLocation.BOTTOM_LEFT:
          this.eLocation = SvxShadowLocation.BottomLeft;
          break;
        case ShadowLocation.BOTTOM_RIGHT:
          this.eLocation = SvxShadowLocation.BottomRight;
          break;
      }
      this.nWidth =
        Number(
          convertTwips
            ? convert(BigInt(shadow.ShadowWidth), Length.mm100, Length.twip)
            : shadow.ShadowWidth,
        ) & 0xffff;
      this.aShadowColor.assign(new Color(ColorTransparency, shadow.Color, "ColorTransparencyTag"));
    }
    return result;
  }
}
