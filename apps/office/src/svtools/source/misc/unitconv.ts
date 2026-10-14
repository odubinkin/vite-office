/** @fileoverview Original five scalar metric helpers over common Tools/o3tl owners; native tools::Long uses bigint. */
import { convert, Length } from "../../../o3tl/inc/unit_conversion";
import { MapUnit, MapToO3tlLength } from "../../../tools/inc/mapunit";
import { FieldUnit, FieldToO3tlLength } from "../../../tools/inc/fldunit";
/** Original float-point to tools::Long conversion, including std::round halfway away from zero. @param input - Native float point value. @param unit - Target map unit. @returns Rounded native integer or0 for unsupported units. */
export function CalcToUnit(input: number, unit: MapUnit): bigint {
  const to = MapToO3tlLength(unit);
  if (to === Length.invalid) return 0n;
  const converted = convert(Math.fround(input), Length.pt, to);
  return BigInt(converted < 0 ? -Math.round(-converted) : Math.round(converted));
}
/** Original integer conversion from item/map to control/field. @param input - Native tools::Long. @param item - Item unit. @param control - Field unit. @returns Rounded integer or0 when either unit is unsupported. */
export function ItemToControl(input: bigint, item: MapUnit, control: FieldUnit): bigint {
  const from = MapToO3tlLength(item),
    to = FieldToO3tlLength(control);
  if (from !== Length.invalid && to !== Length.invalid) return convert(input, from, to);
  return 0n;
}
/** Original same-direction delegation, deliberately not a reconstructed inverse; CALC109. @param input - Native tools::Long. @param control - Field unit. @param item - Map unit. @returns Original ItemToControl result. */
export function ControlToItem(input: bigint, control: FieldUnit, item: MapUnit): bigint {
  return ItemToControl(input, item, control);
}
/** Original coarse field-unit selection, including unsupported NONE fallback. @param unit - Source map unit. @returns Field unit. */
export function MapToFieldUnit(unit: MapUnit): FieldUnit {
  switch (unit) {
    case MapUnit.Map100thMM:
    case MapUnit.Map10thMM:
    case MapUnit.MapMM:
      return FieldUnit.MM;
    case MapUnit.MapCM:
      return FieldUnit.CM;
    case MapUnit.Map1000thInch:
    case MapUnit.Map100thInch:
    case MapUnit.Map10thInch:
    case MapUnit.MapInch:
      return FieldUnit.INCH;
    case MapUnit.MapPoint:
      return FieldUnit.POINT;
    case MapUnit.MapTwip:
      return FieldUnit.TWIP;
    default:
      return FieldUnit.NONE;
  }
}
/** Original signed64 integral conversion with native unsigned16 factor. Overflow preconditions are delegated to the common owner. @param input - Native tools::Long. @param unit - Source map unit. @param factor - Native unsigned16 factor. @returns Rounded point integer or0. */
export function CalcToPoint(input: bigint, unit: MapUnit, factor: number): bigint {
  const from = MapToO3tlLength(unit);
  if (from !== Length.invalid) return convert(input * BigInt(factor & 0xffff), from, Length.pt);
  return 0n;
}
