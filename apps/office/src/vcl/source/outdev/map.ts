/** @fileoverview Original scalar OutputDevice::LogicToLogic and lcl_convertLogicValue from map.cxx. No device, mapping cache or drawing service is supplied. */
import { MapUnit, MapToO3tlLength } from "../../../tools/inc/mapunit";
import { Length, getConversionMulDiv } from "../../../o3tl/inc/unit_conversion";
import { SAL_MIN_INT64, SAL_MAX_INT64 } from "../../../sal/inc/types";
/** Original static scalar map conversion, including72PPI pixel correction and BigInt overflow fallback. JS BigInt directly supplies the native integral calculation without allocation emulation. @param value - Native signed64 scalar. @param source - Source map unit. @param destination - Destination map unit. @returns Native rounded signed64 result; release BigInt cast returns0 out of range. */
export function LogicToLogic(value: bigint, source: MapUnit, destination: MapUnit): bigint {
  if (source === destination) return value;
  const from = source > MapUnit.MapPixel ? Length.invalid : MapToO3tlLength(source, Length.pt),
    to = destination > MapUnit.MapPixel ? Length.invalid : MapToO3tlLength(destination, Length.pt);
  if (value === 0n || from === Length.invalid || to === Length.invalid) return 0n;
  const [mul, div] = getConversionMulDiv(from, to),
    product = value * mul,
    result = (product < 0n ? product - div / 2n : product + div / 2n) / div;
  return result < SAL_MIN_INT64 || result > SAL_MAX_INT64 ? 0n : result;
}
