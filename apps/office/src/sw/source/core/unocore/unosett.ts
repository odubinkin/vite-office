/** @fileoverview Owns supported numbering position property conversion from pinned SwXNumberingRules in unosett.cxx. */

import type { NumberingPositionProperties } from "../../../../editeng/source/items/numitem";

/** Applies native MM100 numbering properties to Writer Twip values. @param properties - Parsed native values. @returns Writer core values. */
export function numberingPositionToTwips(
  properties: NumberingPositionProperties,
): NumberingPositionProperties {
  return convertPosition(properties, 72, 127);
}

/** Projects Writer numbering values into their native UNO MM100 properties. @param properties - Writer core values. @returns Native MM100 properties. */
export function numberingPositionToMM100(
  properties: NumberingPositionProperties,
): NumberingPositionProperties {
  return convertPosition(properties, 127, 72);
}

/** Uses the pinned signed integer ratio for each present numeric property. @param properties - Source properties. @param multiplier - Unit numerator. @param divisor - Unit denominator. @returns Converted property set. */
function convertPosition(
  properties: NumberingPositionProperties,
  multiplier: number,
  divisor: number,
): NumberingPositionProperties {
  /** Rounds one integer like o3tl::convert. @param value - Source integer. @returns Converted integer. */
  function measure(value: number): number {
    return Math.trunc(
      (value * multiplier + (value >= 0 ? Math.trunc(divisor / 2) : -Math.trunc(divisor / 2))) /
        divisor,
    );
  }
  return {
    ...(properties.absLSpace === undefined ? {} : { absLSpace: measure(properties.absLSpace) }),
    ...(properties.firstLineOffset === undefined
      ? {}
      : { firstLineOffset: measure(properties.firstLineOffset) }),
    ...(properties.charTextDistance === undefined
      ? {}
      : { charTextDistance: measure(properties.charTextDistance) }),
    ...(properties.positionAndSpaceMode === undefined
      ? {}
      : { positionAndSpaceMode: properties.positionAndSpaceMode }),
    ...(properties.firstLineIndent === undefined
      ? {}
      : { firstLineIndent: measure(properties.firstLineIndent) }),
    ...(properties.indentAt === undefined ? {} : { indentAt: measure(properties.indentAt) }),
    ...(properties.labelFollowedBy === undefined
      ? {}
      : { labelFollowedBy: properties.labelFollowedBy }),
    ...(properties.listTabPosition === undefined
      ? {}
      : { listTabPosition: measure(properties.listTabPosition) }),
  };
}
