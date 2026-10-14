/** @fileoverview Original FieldUnit declarations and complete o3tl length mapping. */
import { Length } from "../../o3tl/inc/unit_conversion";
/** Original unsigned16 field-unit order. */
export enum FieldUnit {
  NONE,
  MM,
  CM,
  M,
  KM,
  TWIP,
  POINT,
  PICA,
  INCH,
  FOOT,
  MILE,
  CUSTOM,
  PERCENT,
  MM_100TH,
  CHAR,
  LINE,
  PIXEL,
  DEGREE,
  SECOND,
  MILLISECOND,
  FONT_EM,
  FONT_CJK_ADVANCE,
}
/** Original constexpr field mapping with pixel override. @param unit - Field unit. @param pixelValue - Pixel representation. @returns Length or invalid. */
export function FieldToO3tlLength(unit: FieldUnit, pixelValue = Length.px): Length {
  switch (unit) {
    case FieldUnit.MM:
      return Length.mm;
    case FieldUnit.CM:
      return Length.cm;
    case FieldUnit.M:
      return Length.m;
    case FieldUnit.KM:
      return Length.km;
    case FieldUnit.TWIP:
      return Length.twip;
    case FieldUnit.POINT:
      return Length.pt;
    case FieldUnit.PICA:
      return Length.pc;
    case FieldUnit.INCH:
      return Length.in;
    case FieldUnit.FOOT:
      return Length.ft;
    case FieldUnit.MILE:
      return Length.mi;
    case FieldUnit.CHAR:
      return Length.ch;
    case FieldUnit.LINE:
      return Length.line;
    case FieldUnit.MM_100TH:
      return Length.mm100;
    case FieldUnit.PIXEL:
      return pixelValue;
    default:
      return Length.invalid;
  }
}
