/** @fileoverview Original MapUnit identifiers and complete o3tl length mapping. */
import { Length } from "../../o3tl/inc/unit_conversion";
/** Original unsigned8 enum order, last alias and error sentinel. */
export enum MapUnit {
  Map100thMM,
  Map10thMM,
  MapMM,
  MapCM,
  Map1000thInch,
  Map100thInch,
  Map10thInch,
  MapInch,
  MapPoint,
  MapTwip,
  MapPixel,
  MapSysFont,
  MapAppFont,
  MapRelative,
  LAST = 13,
  LASTENUMDUMMY,
}
/** Original constexpr mapping including caller-selected pixel length. @param unit - Map unit. @param pixelValue - Pixel representation. @returns Length or invalid. */
export function MapToO3tlLength(unit: MapUnit, pixelValue = Length.px): Length {
  switch (unit) {
    case MapUnit.Map100thMM:
      return Length.mm100;
    case MapUnit.Map10thMM:
      return Length.mm10;
    case MapUnit.MapMM:
      return Length.mm;
    case MapUnit.MapCM:
      return Length.cm;
    case MapUnit.Map1000thInch:
      return Length.in1000;
    case MapUnit.Map100thInch:
      return Length.in100;
    case MapUnit.Map10thInch:
      return Length.in10;
    case MapUnit.MapInch:
      return Length.in;
    case MapUnit.MapPoint:
      return Length.pt;
    case MapUnit.MapTwip:
      return Length.twip;
    case MapUnit.MapPixel:
      return pixelValue;
    default:
      return Length.invalid;
  }
}
