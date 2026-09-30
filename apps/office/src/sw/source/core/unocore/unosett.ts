/** @fileoverview Owns supported numbering label-alignment property conversion from pinned SwXNumberingRules in unosett.cxx. */

/** Supported native numbering properties; the owning conversion determines numeric units. */
export interface NumberingLabelAlignmentProperties {
  readonly firstLineIndent?: number;
  readonly indentAt?: number;
  readonly labelFollowedBy?: "listtab" | "nothing" | "space";
  readonly listTabPosition?: number;
}

/** Applies native MM100 numbering properties to Writer Twip values. @param properties - Parsed native values. @returns Writer core values. */
export function numberingLabelAlignmentToTwips(
  properties: NumberingLabelAlignmentProperties,
): NumberingLabelAlignmentProperties {
  return convertLabelAlignment(properties, 72, 127);
}

/** Projects Writer numbering values into their native UNO MM100 properties. @param properties - Writer core values. @returns Native MM100 properties. */
export function numberingLabelAlignmentToMM100(
  properties: NumberingLabelAlignmentProperties,
): NumberingLabelAlignmentProperties {
  return convertLabelAlignment(properties, 127, 72);
}

/** Uses the pinned signed integer ratio for each present numeric property. @param properties - Source properties. @param multiplier - Unit numerator. @param divisor - Unit denominator. @returns Converted property set. */
function convertLabelAlignment(
  properties: NumberingLabelAlignmentProperties,
  multiplier: number,
  divisor: number,
): NumberingLabelAlignmentProperties {
  /** Rounds one integer like o3tl::convert. @param value - Source integer. @returns Converted integer. */
  function measure(value: number): number {
    return Math.trunc(
      (value * multiplier + (value >= 0 ? Math.trunc(divisor / 2) : -Math.trunc(divisor / 2))) /
        divisor,
    );
  }
  return {
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
