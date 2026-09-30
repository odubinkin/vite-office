/** @fileoverview Owns supported numbering position property conversion from pinned SwXNumberingRules in unosett.cxx. */

import { SwNumFormat, type SwNumRule } from "../doc/number";

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

/** Native invalid-argument failure at the supported numbering property boundary. */
export class NumberingRulePropertyError extends Error {}

/** Supported UNO numbering property sequence in native MM100. */
export interface WriterNumberingRuleProperties extends NumberingPositionProperties {
  readonly kind: "bullet" | "numbered";
  readonly bulletChar?: string;
  readonly suffix: string;
}

/** Writer-owned copy, validation and commit boundary corresponding to SwXNumberingRules. */
export class SwXNumberingRules {
  /** Binds the native numbering-rule service to its Writer rule. @param rule - Document-owned rule. @returns Service. */
  public constructor(private readonly rule: SwNumRule) {}

  /** Replaces one level through the native UNO application boundary. @param level - Zero-based level. @param properties - Supported property sequence. @returns Nothing. */
  public replaceByIndex(level: number, properties: WriterNumberingRuleProperties): void {
    this.SetNumberingRuleByIndex(this.rule, properties, level);
  }

  /** Applies supported UNO properties to one independent format, then commits the complete level. @param rule - Writer rule. @param properties - MM100 properties and marker attributes. @param level - Zero-based level. @returns Nothing. */
  private SetNumberingRuleByIndex(
    rule: SwNumRule,
    properties: WriterNumberingRuleProperties,
    level: number,
  ): void {
    const previous = rule.GetNumFormat(level).clone();
    const converted = numberingPositionToTwips(properties);
    if ((properties.charTextDistance ?? 0) < 0 || (converted.listTabPosition ?? 0) < 0)
      throw new NumberingRulePropertyError("Invalid numbering position property.");
    const applied = new SwNumFormat(
      properties.kind,
      properties.bulletChar ?? previous.GetBulletChar(),
      {
        ...previous.GetPositionProperties(),
        ...converted,
        bulletFont: previous.GetBulletFont(),
        includeUpperLevels: previous.GetIncludeUpperLevels(),
        prefix: previous.GetPrefix(),
        start: previous.GetStart(),
        suffix: properties.suffix,
      },
    );
    rule.Set(level, applied);
  }
}
