/** @fileoverview Owns supported numbering position property conversion from pinned SwXNumberingRules in unosett.cxx. */
import { SwNumFormat, SvxNumType, type SwNumRule, type ConstSwNumFormat } from "../doc/number";
import { WRITER_MAX_LIST_LEVEL } from "../doc/list";
import { fontFromUnoDescriptorName } from "../../../../editeng/source/uno/unofdesc";

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
  readonly numberingType?: SvxNumType;
  readonly bulletChar?: string;
  /** Represented Name member of the native UNO BulletFont descriptor. */
  readonly bulletFont?: Readonly<{ name: string }>;
  readonly suffix: string;
  readonly prefix?: string;
  readonly startWith?: number;
  readonly parentNumbering?: number;
  readonly listFormat?: string;
}

/** Writer-owned copy, validation and commit boundary corresponding to SwXNumberingRules. */
export class SwXNumberingRules {
  /** Binds the native numbering-rule service to its Writer rule. @param rule - Document-owned rule. @returns Service. */
  public constructor(private readonly rule: SwNumRule) {}

  /** Reads the represented native property record through the rule service. @param level - Zero-based level. @returns Independent supported properties in MM100. */
  public getByIndex(level: number): WriterNumberingRuleProperties {
    return this.getRuleByIndex(level);
  }

  /** Validates native MAXLEVEL bounds before reading the borrowed rule. @param level - Zero-based level. @returns Independent represented properties. */
  public getRuleByIndex(level: number): WriterNumberingRuleProperties {
    if (!Number.isInteger(level) || level < 0 || level > WRITER_MAX_LIST_LEVEL)
      throw new RangeError("Numbering rule index is out of range.");
    return this.GetNumberingRuleByIndex(this.rule, level);
  }

  /** Resolves the original document-owned level without cloning its format. @param rule - Borrowed native rule. @param level - Validated level. @returns Supported property record. */
  public GetNumberingRuleByIndex(rule: SwNumRule, level: number): WriterNumberingRuleProperties {
    return SwXNumberingRules.GetPropertiesForNumFormat(rule.Get(level));
  }

  /** Publishes only native active geometry and represented optional marker properties. @param format - Borrowed const format. @returns Independent supported record; full UNO sequence remains unrepresented. */
  public static GetPropertiesForNumFormat(format: ConstSwNumFormat): WriterNumberingRuleProperties {
    const mode = format.GetPositionAndSpaceMode(),
      type = format.GetNumberingType(),
      font = format.GetBulletFont();
    const position = numberingPositionToMM100(
      mode === "label-width-and-position"
        ? {
            absLSpace: format.GetAbsLSpace(),
            firstLineOffset: format.GetFirstLineOffset(),
            charTextDistance: format.GetCharTextDistance(),
          }
        : {
            labelFollowedBy: format.GetLabelFollowedBy(),
            listTabPosition: format.GetListtabPos(),
            firstLineIndent: format.GetFirstLineIndent(),
            indentAt: format.GetIndentAt(),
          },
    );
    return {
      kind: type === SvxNumType.SVX_NUM_CHAR_SPECIAL ? "bullet" : "numbered",
      numberingType: type,
      prefix: format.GetPrefix(),
      suffix: format.GetSuffix(),
      startWith: (format.GetStart() << 16) >> 16,
      parentNumbering: format.GetIncludeUpperLevels(),
      ...(format.HasListFormat() ? { listFormat: format.GetListFormat() } : {}),
      ...position,
      positionAndSpaceMode: mode,
      ...(type === SvxNumType.SVX_NUM_CHAR_SPECIAL
        ? {
            bulletChar: String.fromCodePoint(format.GetBulletChar()),
            ...(font === undefined ? {} : { bulletFont: { name: font.GetFamilyName() } }),
          }
        : {}),
    };
  }

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
    const applied = new SwNumFormat(rule.Get(level));
    const bulletFont = properties.bulletFont;
    if (
      bulletFont !== undefined &&
      (bulletFont === null || typeof bulletFont !== "object" || typeof bulletFont.name !== "string")
    )
      throw new NumberingRulePropertyError("Invalid bullet font descriptor.");
    const converted = numberingPositionToTwips(properties);
    const type =
      properties.numberingType ??
      (properties.kind === "bullet" ? SvxNumType.SVX_NUM_CHAR_SPECIAL : SvxNumType.SVX_NUM_ARABIC);
    if ((properties.charTextDistance ?? 0) < 0 || (converted.listTabPosition ?? 0) < 0 || type < 0)
      throw new NumberingRulePropertyError("Invalid numbering property.");
    applied.SetNumberingType(type);
    if (properties.bulletChar !== undefined)
      applied.SetBulletChar(properties.bulletChar.codePointAt(0) ?? 0);
    // Native UNO ignores a valid descriptor with an empty Name, preserving
    // the copied format's optional font rather than clearing its owner.
    if (bulletFont !== undefined && bulletFont.name !== "") {
      applied.SetBulletFont(fontFromUnoDescriptorName(bulletFont.name));
    }
    if (converted.absLSpace !== undefined) applied.SetAbsLSpace(converted.absLSpace);
    if (converted.firstLineOffset !== undefined)
      applied.SetFirstLineOffset(converted.firstLineOffset);
    if (converted.charTextDistance !== undefined)
      applied.SetCharTextDistance(converted.charTextDistance);
    if (converted.firstLineIndent !== undefined)
      applied.SetFirstLineIndent(converted.firstLineIndent);
    if (converted.indentAt !== undefined) applied.SetIndentAt(converted.indentAt);
    if (converted.labelFollowedBy !== undefined)
      applied.SetLabelFollowedBy(converted.labelFollowedBy);
    if (converted.listTabPosition !== undefined) applied.SetListtabPos(converted.listTabPosition);
    if (converted.positionAndSpaceMode !== undefined)
      applied.SetPositionAndSpaceMode(converted.positionAndSpaceMode);
    if (properties.prefix !== undefined) applied.SetPrefix(properties.prefix);
    applied.SetSuffix(properties.suffix);
    if (properties.startWith !== undefined) applied.SetStart(properties.startWith);
    if (
      properties.parentNumbering !== undefined &&
      properties.parentNumbering >= 0 &&
      properties.parentNumbering <= 10
    )
      applied.SetIncludeUpperLevels(properties.parentNumbering);
    if (properties.listFormat !== undefined) applied.SetListFormat(properties.listFormat);
    rule.Set(level, applied);
  }
}
