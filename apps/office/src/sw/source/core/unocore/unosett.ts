/** @fileoverview Owns supported numbering position property conversion from pinned SwXNumberingRules in unosett.cxx. */
import { illegal, stringAny, stringValue, scalar, text, unicode, unknown } from "./unocrsrhelper";
import { queryInterface } from "../../../../cppuhelper/inc/queryinterface";
import { UnoType } from "../../../../cppu/inc/unotype";
import { Type } from "../../../../cppu/inc/com/sun/star/uno/Type";
import { cppu_detail_getUnoType as indexReplaceType } from "../../../../cppu/inc/com/sun/star/container/XIndexReplace";
import { cppu_detail_getUnoType as indexAccessType } from "../../../../cppu/inc/com/sun/star/container/XIndexAccess";
import { cppu_detail_getUnoType as elementAccessType } from "../../../../cppu/inc/com/sun/star/container/XElementAccess";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { IndexOutOfBoundsException } from "../../../../cppu/inc/com/sun/star/lang/IndexOutOfBoundsException";
import { numberingToSequence, numberingFromAny, numberingSequenceType } from "./unosett-properties";
import type { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { PropertyValue } from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { SwNumFormat, SvxNumType, SwNumRule, type ConstSwNumFormat } from "../doc/number";
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
  private references = 1;
  /** Erased owning service reference retains logical lifetime while browser GC owns allocation. @returns Nothing. */
  public acquire(): void {
    this.references++;
  }
  /** Releases an acquired service reference. @returns Nothing. */
  public release(): void {
    this.references--;
  }
  /** Native index-container interface query uses existing CPPU type and acquired Any owners. @param type - Requested interface. @returns Owned result. */
  public queryInterface(type: Type): Any {
    return queryInterface(type, [
      [indexReplaceType, this],
      [indexAccessType, this],
      [elementAccessType, this],
      [
        /** Processes one ordered native value at this boundary. @returns The represented native operation result. */
        () => UnoType.get(["Reference", "XInterface"]),
        this,
      ],
    ]);
  }
  /** Native element type is Sequence<PropertyValue>. @returns Owned Type. */
  public getElementType(): Type {
    return new Type(UnoType.get(numberingSequenceType));
  }

  private readonly rule: SwNumRule;
  /** Native rule-copy and document-created-rule constructor paths share one real rule owner. @param source - Rule or document. @returns Service. */
  public constructor(source: SwNumRule | import("../doc/doc").SwDoc) {
    this.rule =
      source instanceof SwNumRule
        ? source
        : source.AddNumRule(new SwNumRule(source.GetUniqueNumRuleName(), "label-alignment"));
  }

  /** Reads the represented native property record through the rule service. @param level - Zero-based level. @returns Independent supported properties in MM100. */
  public getByIndex(level: number): Any {
    const sequence = this.getRuleByIndex(level);
    try {
      return new Any(sequence.getAddress(), numberingSequenceType);
    } finally {
      sequence.dispose();
    }
  }

  /** Publishes the original typed property sequence for this level. @param level - Native index. @returns Owned sequence. */
  public getRuleByIndex(level: number): Sequence<PropertyValue> {
    return numberingToSequence(this.GetPropertiesByIndex(level));
  }

  /** Existing ODF transport projection of the same rule; this does not own numbering state. @param level - Native index. @returns Independent represented values. */
  public GetPropertiesByIndex(level: number): WriterNumberingRuleProperties {
    if (!Number.isInteger(level) || level < 0 || level > WRITER_MAX_LIST_LEVEL)
      throw new IndexOutOfBoundsException();
    return this.GetNumberingRuleByIndex(this.rule, level);
  }

  /** Original XNamed numbering-rule identity. @returns Owned native name. */
  public getName(): import("../../../../sal/inc/rtl/ustring").OUString {
    return unicode(this.rule.GetName());
  }
  /** Queries the source DefaultListId used by XMLTextListsHelper. @param name - Native property name. @returns Owned Any. */
  public getPropertyValue(
    name: import("../../../../sal/inc/rtl/ustring").OUStringConstReference,
  ): Any {
    if (text(name) !== "DefaultListId") unknown(text(name));
    return stringAny(this.rule.GetDefaultListId());
  }
  /** Native ten-level index container. @returns Level count. */
  public getCount(): number {
    return 10;
  }
  /** Native nonempty container. @returns True. */
  public hasElements(): boolean {
    return true;
  }
  /** Borrows the actual core rule for application by Writer's property owner. @returns Core owner. */
  public GetNumRule(): SwNumRule {
    return this.rule;
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
  public replaceByIndex(level: number, properties: WriterNumberingRuleProperties | Any): void {
    const previous = this.GetPropertiesByIndex(level);
    try {
      this.SetNumberingRuleByIndex(
        this.rule,
        properties instanceof Any ? numberingFromAny(properties, previous) : properties,
        level,
      );
    } catch (error) {
      if (properties instanceof Any && error instanceof NumberingRulePropertyError)
        illegal(error.message);
      throw error;
    }
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

import type { SwDoc } from "../doc/doc";
import { Length, toTwips } from "../../../../o3tl/inc/unit_conversion";
import { convertTwipToMm100 } from "../../../../tools/inc/UnitConversion";
/** Original represented SwXLineNumberingProperties property owner over SwDoc's copied SwLineNumberInfo. */
export class SwXLineNumberingProperties {
  /** Borrows the canonical document. @param doc - Writer owner. @returns Service. */
  constructor(private readonly doc: SwDoc) {}
  /** Applies the original supported line-numbering properties to a copied value before committing it. @param property - Native property name. @param value - Typed Any. @returns Nothing. */
  setPropertyValue(
    property: import("../../../../sal/inc/rtl/ustring").OUStringConstReference,
    value: Any,
  ): void {
    const name = text(property),
      info = this.doc.GetLineNumberInfo();
    if (name === "SeparatorText") info.SetDivider(stringValue(value));
    else if (name === "Distance")
      info.SetPosFromLeft(
        Math.min(
          65535,
          Number(toTwips(BigInt(scalar(value, "sal_Int32") as number), Length.mm100)),
        ) & 0xffff,
      );
    else if (name === "Interval") {
      const count = scalar(value, "sal_Int16") as number;
      if (count > 0) info.SetCountBy(count);
    } else if (name === "SeparatorInterval") {
      const count = scalar(value, "sal_Int16") as number;
      if (count >= 0) info.SetDividerCountBy(count);
    } else if (name === "NumberPosition") {
      const position = scalar(value, "sal_Int16") as number;
      if (position >= 0 && position <= 3) info.SetPos(position);
    } else if (name === "IsOn") info.SetPaintLineNumbers(scalar(value, "bool") as boolean);
    else if (name === "CountEmptyLines") info.SetCountBlankLines(scalar(value, "bool") as boolean);
    else if (name === "CountLinesInFrames") info.SetCountInFlys(scalar(value, "bool") as boolean);
    else if (name === "RestartAtEachPage")
      info.SetRestartEachPage(scalar(value, "bool") as boolean);
    else unknown(name);
    this.doc.SetLineNumberInfo(info);
  }
  /** Queries a supported original line-numbering property. @param property - Native name. @returns Owned Any. */
  getPropertyValue(
    property: import("../../../../sal/inc/rtl/ustring").OUStringConstReference,
  ): Any {
    const name = text(property),
      info = this.doc.GetLineNumberInfo();
    if (name === "SeparatorText") return stringAny(info.GetDivider());
    if (name === "Distance")
      return new Any([Number(convertTwipToMm100(BigInt(info.GetPosFromLeft())))], "sal_Int32");
    if (name === "Interval" || name === "SeparatorInterval" || name === "NumberPosition")
      return new Any(
        [
          ((name === "Interval"
            ? info.GetCountBy()
            : name === "SeparatorInterval"
              ? info.GetDividerCountBy()
              : info.GetPos()) <<
            16) >>
            16,
        ],
        "sal_Int16",
      );
    if (name === "IsOn") return new Any([info.IsPaintLineNumbers()], "bool");
    if (name === "CountEmptyLines") return new Any([info.IsCountBlankLines()], "bool");
    if (name === "CountLinesInFrames") return new Any([info.IsCountInFlys()], "bool");
    if (name === "RestartAtEachPage") return new Any([info.IsRestartEachPage()], "bool");
    return unknown(name);
  }
}
