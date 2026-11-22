/** @fileoverview Native Writer page, paragraph, and character box property members from unomap1.cxx. */
import { UnoType } from "../../../../cppu/inc/unotype";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { PropertyMoreFlags, SfxItemPropertyMapEntry } from "../../../../svl/inc/itemprop";
import * as Member from "../../../../editeng/inc/memberids";
import { cppu_detail_getUnoType_BorderLine as borderLineType } from "../../../../offapi/com/sun/star/table/BorderLine";
import { CONVERT_TWIPS } from "../../../../svl/inc/poolitem";
import {
  RES_BOX,
  RES_CHRATR_BOX,
  RES_LINENUMBER,
  RES_PARATR_ADJUST,
  RES_PARATR_AUTOFRAMEDIR,
  RES_PARATR_FORBIDDEN_RULES,
  RES_PARATR_HANGINGPUNCTUATION,
  RES_PARATR_SCRIPTSPACE,
  RES_PARATR_SNAPTOGRID,
  RES_PARATR_HYPHENZONE,
} from "../../../inc/hintids";
import { MID_LINENUMBER_COUNT, MID_LINENUMBER_STARTVALUE } from "../../../inc/unomid";
import { MAYBEVOID } from "../../../../udkapi/com/sun/star/beans/PropertyAttribute";
import type { SwUnoPropertyEntry } from "./unomap";

/** Source box property descriptors for the four physical sides. @param attributes - Original property flags. @param which - Native box item identity. @param prefix - Original character property prefix. @returns Original UNO descriptors. */
export function boxMembers(
  attributes: number,
  which: number = RES_BOX,
  prefix = "",
): [string, SwUnoPropertyEntry][] {
  return (["Left", "Right", "Top", "Bottom"] as const).flatMap(
    /** Binds each original box member. @param side - Physical side. @param index - Native member order. @returns UNO property entries. */
    (side, index): [string, SwUnoPropertyEntry][] => [
      [
        `${prefix}${side}Border`,
        {
          which,
          member: (index + 1) | CONVERT_TWIPS,
          kind: "border",
          type: borderLineType,
          attributes,
        },
      ],
      [
        `${prefix}${side}BorderDistance`,
        { which, member: (index + 6) | CONVERT_TWIPS, kind: "long", type: "sal_Int32", attributes },
      ],
    ],
  );
}

/** Real Writer character box property rows. */
export const charBoxMembers: readonly [string, SwUnoPropertyEntry][] = boxMembers(
  0,
  RES_CHRATR_BOX,
  "Char",
);

/** Character box names admitted to the original style and default property maps. */
export const charBoxNames: readonly string[] = charBoxMembers.map(
  /** Projects each original UNO property name. @param entry - Native descriptor. @returns Name. */
  ([name]) => name,
);

/** Native adjustment properties shared by Writer UNO map families. */
export const adjustmentMembers = (
  [
    ["ParaAdjust", Member.MID_PARA_ADJUST],
    ["ParaLastLineAdjust", Member.MID_LAST_LINE_ADJUST],
    ["ParaExpandSingleWord", Member.MID_EXPAND_SINGLE, "bool"],
    ["ParaWordSpacing", Member.MID_WORD_SPACING],
    ["ParaWordSpacingMinimum", Member.MID_WORD_SPACING_MIN],
    ["ParaWordSpacingMaximum", Member.MID_WORD_SPACING_MAX],
    ["ParaLetterSpacingMinimum", Member.MID_LETTER_SPACING_MIN],
    ["ParaLetterSpacingMaximum", Member.MID_LETTER_SPACING_MAX],
    ["ParaScaleWidthMinimum", Member.MID_SCALE_WIDTH_MIN],
    ["ParaScaleWidthMaximum", Member.MID_SCALE_WIDTH_MAX],
    ["ParaComposer", Member.MID_PARAGRAPH_COMPOSER, "bool"],
  ] as const
).map(
  /** Converts the original member descriptor. @param descriptor - Name, member and optional boolean type. @returns UNO entry. */
  ([name, member, boolean]): [string, SwUnoPropertyEntry] => [
    name,
    {
      which: RES_PARATR_ADJUST,
      member,
      type: boolean ?? "sal_Int16",
      kind: "any",
      attributes: 1,
    },
  ],
);

/** Original adjustment names admitted to style properties and document defaults. */
export const adjustmentNames = adjustmentMembers.map(
  /** Gets a property's original UNO name. @param entry - Native row. @returns Name. */
  ([name]) => name,
);

/** Original paragraph booleans advertised by the Writer cursor, style and text-default maps. */
export const paragraphBooleanMembers = (
  [
    ["SnapToGrid", RES_PARATR_SNAPTOGRID],
    ["WritingModeAutomatic", RES_PARATR_AUTOFRAMEDIR],
    ["ParaIsHangingPunctuation", RES_PARATR_HANGINGPUNCTUATION],
    ["ParaIsCharacterDistance", RES_PARATR_SCRIPTSPACE],
    ["ParaIsForbiddenRules", RES_PARATR_FORBIDDEN_RULES],
  ] as const
).map(
  /** Binds each boolean to its original WhichId. @param property - Native name and ID. @returns UNO descriptor. */
  ([name, which]): [string, SwUnoPropertyEntry] => [
    name,
    { which, member: 0, type: "bool", kind: "any", attributes: MAYBEVOID },
  ],
);

/** Original boolean paragraph names shared between property maps. */
export const paragraphBooleanNames = paragraphBooleanMembers.map(
  /** Selects the original property name. @param entry - Native row. @returns Name. */
  ([name]) => name,
);

/** Native compound paragraph line-number UNO properties. */
export const paragraphLineNumberMembers: [string, SwUnoPropertyEntry][] = [
  [
    "ParaLineNumberCount",
    {
      which: RES_LINENUMBER,
      member: MID_LINENUMBER_COUNT,
      type: "bool",
      kind: "any",
      attributes: MAYBEVOID,
    },
  ],
  [
    "ParaLineNumberStartValue",
    {
      which: RES_LINENUMBER,
      member: MID_LINENUMBER_STARTVALUE,
      type: "sal_Int32",
      kind: "any",
      attributes: MAYBEVOID,
    },
  ],
];

/** Original names admitted into the native style and text-default maps. */
export const paragraphLineNumberNames = paragraphLineNumberMembers.map(
  /** Reads the native UNO name. @param entry - Property descriptor. @returns Name. */
  ([name]) => name,
);

/** Native paragraph hyphenation properties shared by Writer UNO map families. */
export const hyphenationMembers: [string, SwUnoPropertyEntry][] = [
  [
    "ParaIsHyphenation",
    {
      which: RES_PARATR_HYPHENZONE,
      member: Member.MID_IS_HYPHEN,
      attributes: 1,
      kind: "bool",
      type: "bool",
    },
  ],
  [
    "ParaHyphenationMaxLeadingChars",
    {
      which: RES_PARATR_HYPHENZONE,
      member: Member.MID_HYPHEN_MIN_LEAD,
      attributes: 1,
      kind: "short",
      type: "sal_Int16",
    },
  ],
  [
    "ParaHyphenationMaxTrailingChars",
    {
      which: RES_PARATR_HYPHENZONE,
      member: Member.MID_HYPHEN_MIN_TRAIL,
      attributes: 1,
      kind: "short",
      type: "sal_Int16",
    },
  ],
  [
    "ParaHyphenationMaxHyphens",
    {
      which: RES_PARATR_HYPHENZONE,
      member: Member.MID_HYPHEN_MAX_HYPHENS,
      attributes: 1,
      kind: "short",
      type: "sal_Int16",
    },
  ],
  [
    "ParaHyphenationNoCaps",
    {
      which: RES_PARATR_HYPHENZONE,
      member: Member.MID_HYPHEN_NO_CAPS,
      attributes: 1,
      kind: "bool",
      type: "bool",
    },
  ],
  [
    "ParaHyphenationNoLastWord",
    {
      which: RES_PARATR_HYPHENZONE,
      member: Member.MID_HYPHEN_NO_LAST_WORD,
      attributes: 1,
      kind: "bool",
      type: "bool",
    },
  ],
  [
    "ParaHyphenationMinWordLength",
    {
      which: RES_PARATR_HYPHENZONE,
      member: Member.MID_HYPHEN_MIN_WORD_LENGTH,
      attributes: 1,
      kind: "short",
      type: "sal_Int16",
    },
  ],
  [
    "ParaHyphenationZone",
    {
      which: RES_PARATR_HYPHENZONE,
      member: Member.MID_HYPHEN_ZONE,
      attributes: 1,
      kind: "short",
      type: "sal_Int16",
    },
  ],
  [
    "ParaHyphenationZoneAlways",
    {
      which: RES_PARATR_HYPHENZONE,
      member: Member.MID_HYPHEN_ZONE_ALWAYS,
      attributes: 1,
      kind: "short",
      type: "sal_Int16",
    },
  ],
  [
    "ParaHyphenationZoneColumn",
    {
      which: RES_PARATR_HYPHENZONE,
      member: Member.MID_HYPHEN_ZONE_COLUMN,
      attributes: 1,
      kind: "short",
      type: "sal_Int16",
    },
  ],
  [
    "ParaHyphenationZonePage",
    {
      which: RES_PARATR_HYPHENZONE,
      member: Member.MID_HYPHEN_ZONE_PAGE,
      attributes: 1,
      kind: "short",
      type: "sal_Int16",
    },
  ],
  [
    "ParaHyphenationZoneSpread",
    {
      which: RES_PARATR_HYPHENZONE,
      member: Member.MID_HYPHEN_ZONE_SPREAD,
      attributes: 1,
      kind: "short",
      type: "sal_Int16",
    },
  ],
  [
    "ParaHyphenationKeep",
    {
      which: RES_PARATR_HYPHENZONE,
      member: Member.MID_HYPHEN_KEEP,
      attributes: 1,
      kind: "bool",
      type: "bool",
    },
  ],
  [
    "ParaHyphenationKeepType",
    {
      which: RES_PARATR_HYPHENZONE,
      member: Member.MID_HYPHEN_KEEP_TYPE,
      attributes: 1,
      kind: "short",
      type: "sal_Int16",
    },
  ],
  [
    "ParaHyphenationCompoundMinLeadingChars",
    {
      which: RES_PARATR_HYPHENZONE,
      member: Member.MID_HYPHEN_COMPOUND_MIN_LEAD,
      attributes: 1,
      kind: "short",
      type: "sal_Int16",
    },
  ],
  [
    "ParaHyphenationCompoundMinTrailingChars",
    {
      which: RES_PARATR_HYPHENZONE,
      member: Member.MID_HYPHEN_COMPOUND_MIN_TRAIL,
      attributes: 1,
      kind: "short",
      type: "sal_Int16",
    },
  ],
  [
    "ParaHyphenationKeepLine",
    {
      which: RES_PARATR_HYPHENZONE,
      member: Member.MID_HYPHEN_KEEP_LINE,
      attributes: 1,
      kind: "bool",
      type: "bool",
    },
  ],
];

/** Names retained in the native shared paragraph property groups. */
export const hyphenationNames = hyphenationMembers.map(
  /** Reads the property name. @param entry - Native property row. @returns Name. */ ([name]) =>
    name,
);

/** Compiler binding for original static property-table initializers over the current admitted core entries. Names/types remain genuine owned values with static lifetime. @param entries - Native Which/member descriptors. @returns Static schema values. */
export function nativeEntries(
  entries: ReadonlyMap<string, SwUnoPropertyEntry>,
): readonly SfxItemPropertyMapEntry[] {
  const values: SfxItemPropertyMapEntry[] = [];
  for (const [name, entry] of entries) {
    const units = new Uint16Array(name.length);
    for (let i = 0; i < name.length; i++) units[i] = name.charCodeAt(i);
    const key = new OUString(units, units.length);
    try {
      values.push(
        new SfxItemPropertyMapEntry(
          key,
          entry.which,
          UnoType.get(entry.type),
          entry.attributes ?? 1,
          entry.member,
          entry.more ?? PropertyMoreFlags.NONE,
        ),
      );
    } finally {
      key.dispose();
    }
  }
  return values;
}
