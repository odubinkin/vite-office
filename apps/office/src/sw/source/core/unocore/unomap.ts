/** @fileoverview Consumed Writer cursor/paragraph/style property entries from pinned unomap.cxx/unomap1.cxx; unrepresented properties are not advertised. */
import { cppu_detail_getUnoType_FillStyle as fillStyleType } from "../../../../offapi/com/sun/star/drawing/FillStyle";
import { XATTR_FILLSTYLE, XATTR_FILLCOLOR, XATTR_FILLTRANSPARENCE } from "../../../../svx/inc/xdef";
import { UnoType, type UnoTypeArgument } from "../../../../cppu/inc/unotype";
import { cppu_detail_getUnoType_BreakType as breakType } from "../../../../offapi/com/sun/star/style/BreakType";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { SfxItemPropertySet } from "../../../../svl/source/items/itemprop";
import { SfxItemPropertyMapEntry } from "../../../../svl/inc/itemprop";

import { cppu_detail_getUnoType_Locale as localeType } from "../../../../udkapi/com/sun/star/lang/Locale";
import { FN_UNO_PARA_NUM_AUTO_FORMAT } from "../../../inc/cmdid";
import { cppu_detail_getUnoType_NamedValue as namedValueType } from "../../../../udkapi/com/sun/star/beans/NamedValue";
import * as M from "../../../../editeng/inc/memberids";
import { cppu_detail_getUnoType_FontSlant as fontSlantType } from "../../../../offapi/com/sun/star/awt/FontSlant";
import { cppu_detail_getUnoType_LineSpacing as lineSpacingType } from "../../../../offapi/com/sun/star/style/LineSpacing";
import { cppu_detail_getUnoType_TabStop as tabStopType } from "../../../../offapi/com/sun/star/style/TabStop";
import { cppu_detail_getUnoType_BorderLine as borderLineType } from "../../../../offapi/com/sun/star/table/BorderLine";
import * as H from "../../../inc/hintids";
import { WID_DOC_DEFAULT_PAGE_MODE } from "../../../inc/unomap";
import * as Grid from "../../../inc/unomid";
import { MID_PAGEDESC_PAGEDESCNAME, MID_PAGEDESC_PAGENUMOFFSET } from "../../../inc/unomid";
/** Native item member transport already provided by the bounded core item. */
export interface SwUnoPropertyEntry {
  readonly which: number;
  readonly type: UnoTypeArgument;
  readonly attributes?: number;
  readonly member: number;
  readonly kind:
    | "any"
    | "long"
    | "short"
    | "byte"
    | "bool"
    | "string"
    | "font"
    | "color"
    | "autostyle"
    | "hyperlink"
    | "pagedesc"
    | "break"
    | "border";
}
/** Original document-model property entry from unomap.cxx; special document dispatch never enters a pool item setter. */
export const SwUnoTextDocumentPropertyMap: ReadonlyMap<
  string,
  SwUnoPropertyEntry & { readonly type: UnoTypeArgument }
> = new Map([
  ["DefaultPageMode", { which: WID_DOC_DEFAULT_PAGE_MODE, member: 0, kind: "bool", type: "bool" }],
]);
/** Original page-style grid and direction entries from unomap1.cxx. */
type PageStylePropertyEntry = SwUnoPropertyEntry & { readonly type: UnoTypeArgument };
export const SwUnoPageStylePropertyMap: ReadonlyMap<string, PageStylePropertyEntry> = new Map<
  string,
  PageStylePropertyEntry
>([
  [
    "WritingMode",
    { which: H.RES_FRAMEDIR, member: 0, kind: "short", type: "sal_Int16", attributes: 0 },
  ],
  ...[
    ["GridColor", Grid.MID_GRID_COLOR, "sal_Int32"],
    ["GridLines", Grid.MID_GRID_LINES, "sal_Int16"],
    ["GridBaseHeight", Grid.MID_GRID_BASEHEIGHT | 0x80, "sal_Int32"],
    ["GridRubyHeight", Grid.MID_GRID_RUBYHEIGHT | 0x80, "sal_Int32"],
    ["GridMode", Grid.MID_GRID_TYPE, "sal_Int16"],
    ["RubyBelow", Grid.MID_GRID_RUBY_BELOW, "bool"],
    ["GridPrint", Grid.MID_GRID_PRINT, "bool"],
    ["GridDisplay", Grid.MID_GRID_DISPLAY, "bool"],
    ["GridBaseWidth", Grid.MID_GRID_BASEWIDTH | 0x80, "sal_Int32"],
    ["GridSnapToChars", Grid.MID_GRID_SNAPTOCHARS, "bool"],
    ["StandardPageMode", Grid.MID_GRID_STANDARD_MODE, "bool"],
  ].map(
    /** Retains original Which/member/type descriptors. @param row - Original property row. @returns Entry. */ (
      row,
    ) =>
      [
        row[0] as string,
        {
          which: H.RES_TEXTGRID,
          member: row[1] as number,
          kind: "any" as const,
          type: row[2] as UnoTypeArgument,
        },
      ] as const,
  ),
]);
/** Exact property identity and member selection; numeric values stay in their original item owners. */
export const SwUnoPropertyMap: ReadonlyMap<string, SwUnoPropertyEntry> = new Map([
  [
    "ListAutoFormat",
    {
      type: ["Sequence", namedValueType],
      which: FN_UNO_PARA_NUM_AUTO_FORMAT,
      member: 0,
      kind: "any",
      attributes: 1,
    },
  ],
  [
    "CharAutoStyleName",
    { type: "OUString", attributes: 1, which: H.RES_TXTATR_AUTOFMT, member: 0, kind: "autostyle" },
  ],
  ...["", "Asian", "Complex"].flatMap(
    /** Processes one ordered native value at this boundary. @param suffix - Original suffix input. @param index - Native zero-based index. @returns The represented native operation result. */
    (suffix, index) =>
      [
        [
          `CharLocale${suffix}`,
          {
            type: localeType,
            attributes: 1,
            which: [H.RES_CHRATR_LANGUAGE, H.RES_CHRATR_CJK_LANGUAGE, H.RES_CHRATR_CTL_LANGUAGE][
              index
            ] as number,
            member: M.MID_LANG_LOCALE,
            kind: "any",
          },
        ],
        [
          `CharWeight${suffix}`,
          {
            type: "float",
            attributes: 1,
            which: [H.RES_CHRATR_WEIGHT, H.RES_CHRATR_CJK_WEIGHT, H.RES_CHRATR_CTL_WEIGHT][
              index
            ] as number,
            member: M.MID_WEIGHT,
            kind: "any",
          },
        ],
        [
          `CharPosture${suffix}`,
          {
            type: fontSlantType,
            attributes: 1,
            which: [H.RES_CHRATR_POSTURE, H.RES_CHRATR_CJK_POSTURE, H.RES_CHRATR_CTL_POSTURE][
              index
            ] as number,
            member: M.MID_POSTURE,
            kind: "any",
          },
        ],
        [
          `CharHeight${suffix}`,
          {
            type: "float",
            attributes: 1,
            which: [H.RES_CHRATR_FONTSIZE, H.RES_CHRATR_CJK_FONTSIZE, H.RES_CHRATR_CTL_FONTSIZE][
              index
            ] as number,
            member: M.MID_FONTHEIGHT | 0x80,
            kind: "any",
          },
        ],
        [
          `CharFontName${suffix}`,
          {
            type: "OUString",
            attributes: 1,
            which: [H.RES_CHRATR_FONT, H.RES_CHRATR_CJK_FONT, H.RES_CHRATR_CTL_FONT][
              index
            ] as number,
            member: 1,
            kind: "font",
          },
        ],
      ] as [string, SwUnoPropertyEntry][],
  ),
  [
    "HyperLinkURL",
    { type: "OUString", attributes: 1, which: H.RES_TXTATR_INETFMT, member: 4, kind: "hyperlink" },
  ],
  [
    "HyperLinkTarget",
    { type: "OUString", attributes: 1, which: H.RES_TXTATR_INETFMT, member: 5, kind: "hyperlink" },
  ],
  [
    "HyperLinkName",
    { type: "OUString", attributes: 1, which: H.RES_TXTATR_INETFMT, member: 1, kind: "hyperlink" },
  ],
  ...["", "Asian", "Complex"].flatMap(
    /** Executes this bounded native operation. @param suffix - Native operation input. @param index - Native operation input. @returns Native operation result. */ (
      suffix,
      index,
    ) => [
      ...[
        ["CharFontStyleName", 2, "OUString"],
        ["CharFontFamily", 3, "sal_Int16"],
        ["CharFontCharSet", 4, "sal_Int16"],
        ["CharFontPitch", 5, "sal_Int16"],
      ].map(
        /** Executes this bounded native operation. @param namemember - Native operation input. @returns Native operation result. */ ([
          name,
          member,
          fontType,
        ]) =>
          [
            `${name}${suffix}`,
            {
              type: fontType as UnoTypeArgument,
              attributes: 1,
              which: [H.RES_CHRATR_FONT, H.RES_CHRATR_CJK_FONT, H.RES_CHRATR_CTL_FONT][
                index
              ] as number,
              member: member as number,
              kind: "font",
            },
          ] as [string, SwUnoPropertyEntry],
      ),
    ],
  ),
  [
    "CharUnderlineColor",
    {
      type: "sal_Int32",
      attributes: 1,
      which: H.RES_CHRATR_UNDERLINE,
      member: M.MID_TL_COLOR,
      kind: "any",
    },
  ],
  [
    "CharUnderlineHasColor",
    {
      type: "bool",
      attributes: 1,
      which: H.RES_CHRATR_UNDERLINE,
      member: M.MID_TL_HASCOLOR,
      kind: "any",
    },
  ],
  [
    "ParaIsAutoFirstLineIndent",
    {
      type: "bool",
      attributes: 1,
      which: H.RES_MARGIN_FIRSTLINE,
      member: M.MID_FIRST_AUTO,
      kind: "bool",
    },
  ],
  [
    "ParaLineNumberCount",
    { type: "bool", attributes: 1, which: H.RES_LINENUMBER, member: 0, kind: "bool" },
  ],
  [
    "ParaIsConnectBorder",
    { type: "bool", attributes: 1, which: H.RES_PARATR_CONNECT_BORDER, member: 0, kind: "bool" },
  ],
  [
    "BorderDistance",
    { type: "sal_Int32", attributes: 1, which: H.RES_BOX, member: 5 | 0x80, kind: "long" },
  ],
  ...(["Left", "Right", "Top", "Bottom"] as const).flatMap(
    /** Exposes source paragraph edge and distance properties, retaining the existing cell paragraph aliases. @param side - Side. @param index - Native member order. @returns Property entries. */ (
      side,
      index,
    ): [string, SwUnoPropertyEntry][] => {
      const border = {
        type: borderLineType,
        attributes: 1,
        which: H.RES_BOX,
        member: (index + 1) | 0x80,
        kind: "border",
      } as const;
      return [
        [`${side}Border`, border],
        [
          `${side}BorderDistance`,
          {
            type: "sal_Int32",
            attributes: 1,
            which: H.RES_BOX,
            member: (index + 6) | 0x80,
            kind: "long",
          },
        ],
      ];
    },
  ),
  ["BreakType", { type: breakType, attributes: 1, which: H.RES_BREAK, member: 0, kind: "break" }],
  [
    "PageDescName",
    {
      type: "OUString",
      attributes: 1,
      which: H.RES_PAGEDESC,
      member: MID_PAGEDESC_PAGEDESCNAME,
      kind: "pagedesc",
    },
  ],
  [
    "PageNumberOffset",
    {
      type: "sal_Int16",
      attributes: 1,
      which: H.RES_PAGEDESC,
      member: MID_PAGEDESC_PAGENUMOFFSET,
      kind: "pagedesc",
    },
  ],
  [
    "NumberingStyleName",
    { type: "OUString", attributes: 1, which: H.RES_PARATR_NUMRULE, member: 0, kind: "string" },
  ],
  [
    "VisitedCharStyleName",
    { type: "OUString", attributes: 1, which: H.RES_TXTATR_INETFMT, member: 6, kind: "hyperlink" },
  ],
  [
    "UnvisitedCharStyleName",
    { type: "OUString", attributes: 1, which: H.RES_TXTATR_INETFMT, member: 7, kind: "hyperlink" },
  ],
  [
    "CharUnderline",
    {
      type: "sal_Int16",
      attributes: 1,
      which: H.RES_CHRATR_UNDERLINE,
      member: M.MID_TL_STYLE,
      kind: "short",
    },
  ],
  [
    "CharStrikeout",
    {
      type: "sal_Int16",
      attributes: 1,
      which: H.RES_CHRATR_CROSSEDOUT,
      member: M.MID_CROSS_OUT,
      kind: "any",
    },
  ],
  [
    "CharWordMode",
    { type: "bool", attributes: 1, which: H.RES_CHRATR_WORDLINEMODE, member: 0, kind: "bool" },
  ],
  [
    "CharAutoKerning",
    { type: "bool", attributes: 1, which: H.RES_CHRATR_AUTOKERN, member: 0, kind: "bool" },
  ],
  [
    "CharEscapement",
    { type: "sal_Int16", attributes: 1, which: H.RES_CHRATR_ESCAPEMENT, member: 0, kind: "any" },
  ],
  [
    "CharEscapementHeight",
    { type: "sal_Int8", attributes: 1, which: H.RES_CHRATR_ESCAPEMENT, member: 1, kind: "any" },
  ],
  [
    "FillStyle",
    { type: fillStyleType, attributes: 0, which: XATTR_FILLSTYLE, member: 0, kind: "any" },
  ],
  [
    "FillColor",
    { type: "sal_Int32", attributes: 0, which: XATTR_FILLCOLOR, member: 0, kind: "any" },
  ],
  [
    "FillTransparence",
    { type: "sal_Int16", attributes: 0, which: XATTR_FILLTRANSPARENCE, member: 0, kind: "any" },
  ],
  [
    "CharColor",
    { type: "sal_Int32", attributes: 1, which: H.RES_CHRATR_COLOR, member: 0, kind: "color" },
  ],
  [
    "CharHighlight",
    { type: "sal_Int32", attributes: 1, which: H.RES_CHRATR_HIGHLIGHT, member: 0, kind: "color" },
  ],
  [
    "WritingMode",
    { type: "sal_Int16", which: H.RES_FRAMEDIR, member: 0, kind: "short", attributes: 0 },
  ],
  [
    "ParaAdjust",
    { type: "sal_Int16", attributes: 1, which: H.RES_PARATR_ADJUST, member: 0, kind: "any" },
  ],
  [
    "ParaLastLineAdjust",
    { type: "sal_Int16", attributes: 1, which: H.RES_PARATR_ADJUST, member: 1, kind: "any" },
  ],
  [
    "ParaExpandSingleWord",
    { type: "bool", attributes: 1, which: H.RES_PARATR_ADJUST, member: 2, kind: "any" },
  ],
  [
    "ParaLeftMargin",
    {
      type: "sal_Int32",
      attributes: 1,
      which: H.RES_MARGIN_TEXTLEFT,
      member: M.MID_TXT_LMARGIN | 0x80,
      kind: "long",
    },
  ],
  [
    "ParaRightMargin",
    { type: "sal_Int32", attributes: 1, which: H.RES_MARGIN_RIGHT, member: 5 | 0x80, kind: "long" },
  ],
  [
    "ParaFirstLineIndent",
    {
      type: "sal_Int32",
      attributes: 1,
      which: H.RES_MARGIN_FIRSTLINE,
      member: M.MID_FIRST_LINE_INDENT | 0x80,
      kind: "long",
    },
  ],
  [
    "ParaTopMargin",
    { type: "sal_Int32", attributes: 1, which: H.RES_UL_SPACE, member: 3 | 0x80, kind: "long" },
  ],
  [
    "ParaBottomMargin",
    { type: "sal_Int32", attributes: 1, which: H.RES_UL_SPACE, member: 4 | 0x80, kind: "long" },
  ],
  [
    "ParaTabStops",
    {
      type: ["Sequence", tabStopType],
      attributes: 1,
      which: H.RES_PARATR_TABSTOP,
      member: 0x80,
      kind: "any",
    },
  ],
  [
    "ParaContextMargin",
    { type: "bool", attributes: 1, which: H.RES_UL_SPACE, member: 7, kind: "bool" },
  ],
  [
    "ParaLineSpacing",
    {
      type: lineSpacingType,
      attributes: 1,
      which: H.RES_PARATR_LINESPACING,
      member: 0x80,
      kind: "any",
    },
  ],
  ["ParaKeepTogether", { type: "bool", attributes: 1, which: H.RES_KEEP, member: 0, kind: "bool" }],
  [
    "ParaSplit",
    { type: "bool", attributes: 1, which: H.RES_PARATR_SPLIT, member: 0, kind: "bool" },
  ],
  [
    "ParaOrphans",
    { type: "sal_Int8", attributes: 1, which: H.RES_PARATR_ORPHANS, member: 0, kind: "byte" },
  ],
  [
    "ParaWidows",
    { type: "sal_Int8", attributes: 1, which: H.RES_PARATR_WIDOWS, member: 0, kind: "byte" },
  ],
  [
    "OutlineLevel",
    {
      type: "sal_Int16",
      attributes: 1,
      which: H.RES_PARATR_OUTLINELEVEL,
      member: 0,
      kind: "short",
    },
  ],
]);

/** Original admitted STANDARD/CJK/CTL and paragraph-style rows expanded from unomapproperties.hxx/unomap1.cxx; these are literal schema flags, not name-pattern guesses. */
const characterMaybeVoidProperties = new Set([
  "CharLocale",
  "CharWeight",
  "CharPosture",
  "CharHeight",
  "CharFontName",
  "CharLocaleAsian",
  "CharWeightAsian",
  "CharPostureAsian",
  "CharHeightAsian",
  "CharFontNameAsian",
  "CharLocaleComplex",
  "CharWeightComplex",
  "CharPostureComplex",
  "CharHeightComplex",
  "CharFontNameComplex",
  "CharFontStyleName",
  "CharFontFamily",
  "CharFontCharSet",
  "CharFontPitch",
  "CharFontStyleNameAsian",
  "CharFontFamilyAsian",
  "CharFontCharSetAsian",
  "CharFontPitchAsian",
  "CharFontStyleNameComplex",
  "CharFontFamilyComplex",
  "CharFontCharSetComplex",
  "CharFontPitchComplex",
  "CharStrikeout",
]);
const paragraphStyleProperties = new Set([
  "CharLocale",
  "CharWeight",
  "CharPosture",
  "CharHeight",
  "CharFontName",
  "CharLocaleAsian",
  "CharWeightAsian",
  "CharPostureAsian",
  "CharHeightAsian",
  "CharFontNameAsian",
  "CharLocaleComplex",
  "CharWeightComplex",
  "CharPostureComplex",
  "CharHeightComplex",
  "CharFontNameComplex",
  "CharFontStyleName",
  "CharFontFamily",
  "CharFontCharSet",
  "CharFontPitch",
  "CharFontStyleNameAsian",
  "CharFontFamilyAsian",
  "CharFontCharSetAsian",
  "CharFontPitchAsian",
  "CharFontStyleNameComplex",
  "CharFontFamilyComplex",
  "CharFontCharSetComplex",
  "CharFontPitchComplex",
  "CharUnderlineColor",
  "CharUnderlineHasColor",
  "ParaIsAutoFirstLineIndent",
  "ParaLineNumberCount",
  "ParaIsConnectBorder",
  "BorderDistance",
  "LeftBorder",
  "LeftBorderDistance",
  "RightBorder",
  "RightBorderDistance",
  "TopBorder",
  "TopBorderDistance",
  "BottomBorder",
  "BottomBorderDistance",
  "BreakType",
  "PageDescName",
  "PageNumberOffset",
  "NumberingStyleName",
  "CharUnderline",
  "CharStrikeout",
  "CharWordMode",
  "CharAutoKerning",
  "CharEscapement",
  "CharEscapementHeight",
  "FillStyle",
  "FillColor",
  "FillTransparence",
  "CharColor",
  "CharHighlight",
  "WritingMode",
  "ParaAdjust",
  "ParaLastLineAdjust",
  "ParaExpandSingleWord",
  "ParaLeftMargin",
  "ParaRightMargin",
  "ParaFirstLineIndent",
  "ParaTopMargin",
  "ParaBottomMargin",
  "ParaTabStops",
  "ParaContextMargin",
  "ParaLineSpacing",
  "ParaKeepTogether",
  "ParaSplit",
  "ParaOrphans",
  "ParaWidows",
  "OutlineLevel",
  "FollowStyle",
]);
const paragraphMaybeVoidProperties = new Set([
  "CharLocale",
  "CharWeight",
  "CharPosture",
  "CharHeight",
  "CharFontName",
  "CharLocaleAsian",
  "CharWeightAsian",
  "CharPostureAsian",
  "CharHeightAsian",
  "CharFontNameAsian",
  "CharLocaleComplex",
  "CharWeightComplex",
  "CharPostureComplex",
  "CharHeightComplex",
  "CharFontNameComplex",
  "CharFontStyleName",
  "CharFontFamily",
  "CharFontCharSet",
  "CharFontPitch",
  "CharFontStyleNameAsian",
  "CharFontFamilyAsian",
  "CharFontCharSetAsian",
  "CharFontPitchAsian",
  "CharFontStyleNameComplex",
  "CharFontFamilyComplex",
  "CharFontCharSetComplex",
  "CharFontPitchComplex",
  "ParaIsConnectBorder",
  "PageDescName",
  "PageNumberOffset",
  "NumberingStyleName",
  "CharStrikeout",
  "ParaTabStops",
  "ParaOrphans",
  "ParaWidows",
  "OutlineLevel",
]);
/** Represented entries of GetCharStylePropertyMap; cursor-only text hints and paragraph/frame items are excluded. */
export const SwUnoCharStylePropertyMap: ReadonlyMap<string, SwUnoPropertyEntry> = new Map(
  [...SwUnoPropertyMap]
    .filter(
      /** Admits only original character item properties. @param entry - Shared represented entry. @returns Whether admitted. */ ([
        ,
        entry,
      ]) => entry.which >= H.RES_CHRATR_BEGIN && entry.which < H.RES_CHRATR_END,
    )
    .map(
      /** Original STANDARD/CJK/CTL font macros and strikeout use MAYBEVOID; other admitted character-style entries use PROPERTY_NONE. @param pair - Original property. @returns Exact represented descriptor flags. */ ([
        name,
        entry,
      ]) => [
        name,
        {
          ...entry,
          attributes: characterMaybeVoidProperties.has(name) ? 1 : 0,
        },
      ],
    ),
);

/** Represented native GetAutoCharStylePropertyMap entries, with original direct character properties and hint references. */
export const SwUnoCharAutoStylePropertyMap: ReadonlyMap<string, SwUnoPropertyEntry> = new Map([
  ...[...SwUnoCharStylePropertyMap].filter(
    /** Legacy host background aliases are not native character-auto-style highlight properties. @param property - Name and entry. @returns Whether its native Which is represented. */
    ([name]) => name !== "CharBackColor" && name !== "CharBackTransparent",
  ),
  [
    "CharAutoStyleName",
    { type: "OUString", which: H.RES_TXTATR_AUTOFMT, member: 0, kind: "any", attributes: 1 },
  ],
  [
    "CharStyleName",
    { type: "OUString", which: H.RES_TXTATR_CHARFMT, member: 0, kind: "any", attributes: 1 },
  ],
]);

import * as MapId from "../../../inc/unomap";
import * as Command from "../../../inc/cmdid";
import { SID_ATTR_PAGE, SID_ATTR_PAGE_SIZE } from "../../../../svx/inc/svxids";
import { MID_PAGE_ORIENTATION, MID_PAGE_LAYOUT } from "../../../../svx/inc/unomid";
import { MID_SIZE_WIDTH, MID_SIZE_HEIGHT } from "../../../../svl/inc/memberid";
import { cppu_detail_getUnoType as indexReplaceType } from "../../../../cppu/inc/com/sun/star/container/XIndexReplace";
import { cppu_detail_getUnoType_PageStyleLayout as pageLayoutType } from "../../../../offapi/com/sun/star/style/PageStyleLayout";
/** Compiler binding for original static property-table initializers over the current admitted core entries. Names/types remain genuine owned values with static lifetime. @param entries - Native Which/member descriptors. @returns Static schema values. */
function nativeEntries(
  entries: ReadonlyMap<string, SwUnoPropertyEntry>,
): readonly SfxItemPropertyMapEntry[] {
  const values: SfxItemPropertyMapEntry[] = [];
  for (const [name, entry] of entries) {
    const key = unicode(name);
    try {
      values.push(
        new SfxItemPropertyMapEntry(
          key,
          entry.which,
          UnoType.get(entry.type),
          entry.attributes ?? 1,
          entry.member,
        ),
      );
    } finally {
      key.dispose();
    }
  }
  return values;
}
/** Original static-table initializer row. @param which - Native Which/dispatch identity. @param type - Original declared type. @param member - Original member. @param attributes - Original flags. @returns Descriptor row. */
function row(which: number, type: UnoTypeArgument, member = 0, attributes = 0): SwUnoPropertyEntry {
  return { which, type, member, attributes, kind: "any" };
}
/** Compiler-erased function-local static tables and sets are shared across actual provider instances, as in the original Get*PropertyMap/GetPropertySet functions. */
const staticMapEntries: (readonly SfxItemPropertyMapEntry[] | undefined)[] = [];
const staticPropertySets: (SfxItemPropertySet | undefined)[] = [];
/** Original COMMON_CRSR_PARA_PROPERTIES_WITHOUT_FN and hyperlink rows represented by this core. */
const textDefaultProperties = new Set([
  "CharLocale",
  "CharWeight",
  "CharPosture",
  "CharHeight",
  "CharFontName",
  "CharLocaleAsian",
  "CharWeightAsian",
  "CharPostureAsian",
  "CharHeightAsian",
  "CharFontNameAsian",
  "CharLocaleComplex",
  "CharWeightComplex",
  "CharPostureComplex",
  "CharHeightComplex",
  "CharFontNameComplex",
  "HyperLinkURL",
  "HyperLinkTarget",
  "HyperLinkName",
  "CharFontStyleName",
  "CharFontFamily",
  "CharFontCharSet",
  "CharFontPitch",
  "CharFontStyleNameAsian",
  "CharFontFamilyAsian",
  "CharFontCharSetAsian",
  "CharFontPitchAsian",
  "CharFontStyleNameComplex",
  "CharFontFamilyComplex",
  "CharFontCharSetComplex",
  "CharFontPitchComplex",
  "CharUnderlineColor",
  "CharUnderlineHasColor",
  "ParaIsAutoFirstLineIndent",
  "ParaLineNumberCount",
  "ParaIsConnectBorder",
  "BorderDistance",
  "LeftBorder",
  "LeftBorderDistance",
  "RightBorder",
  "RightBorderDistance",
  "TopBorder",
  "TopBorderDistance",
  "BottomBorder",
  "BottomBorderDistance",
  "BreakType",
  "PageDescName",
  "PageNumberOffset",
  "NumberingStyleName",
  "VisitedCharStyleName",
  "UnvisitedCharStyleName",
  "CharUnderline",
  "CharStrikeout",
  "CharWordMode",
  "CharAutoKerning",
  "CharEscapement",
  "CharEscapementHeight",
  "CharColor",
  "CharHighlight",
  "WritingMode",
  "ParaAdjust",
  "ParaLastLineAdjust",
  "ParaExpandSingleWord",
  "ParaLeftMargin",
  "ParaRightMargin",
  "ParaFirstLineIndent",
  "ParaTopMargin",
  "ParaBottomMargin",
  "ParaContextMargin",
  "ParaLineSpacing",
  "ParaKeepTogether",
  "ParaSplit",
  "ParaOrphans",
  "ParaWidows",
]);
/** Original provider caches borrowed spans and pointers to static property-set owners. Only map families used by the admitted current model are represented; unsupported families fail explicitly. */
export class SwUnoPropertyMapProvider {
  private readonly m_aMapEntriesArr: (readonly SfxItemPropertyMapEntry[] | undefined)[] = [];
  private readonly m_aPropertySetArr: (SfxItemPropertySet | undefined)[] = [];
  /** Original lazy per-map span selection and static table lifetime. @param propertyId - Original map identity. @returns Borrowed immutable static entries. */
  GetPropertyMapEntries(propertyId: number): readonly SfxItemPropertyMapEntry[] {
    propertyId &= 0xffff;
    if (!(propertyId >= 0 && propertyId < MapId.PROPERTY_MAP_END))
      throw new Error("assert(nPropertyId < PROPERTY_MAP_END)");
    const previous = this.m_aMapEntriesArr[propertyId];
    if (previous) return previous;
    const cached = staticMapEntries[propertyId];
    if (cached) {
      this.m_aMapEntriesArr[propertyId] = cached;
      return cached;
    }
    let entries: ReadonlyMap<string, SwUnoPropertyEntry>;
    switch (propertyId) {
      case MapId.PROPERTY_MAP_TEXT_CURSOR:
        entries = new Map([
          ...[...SwUnoPropertyMap].filter(
            /** Original cursor table has no drawing-fill style rows. @param pair - Admitted transport entry. @returns Original cursor-table membership. */ ([
              name,
            ]) => name !== "FillStyle" && name !== "FillColor" && name !== "FillTransparence",
          ),
          ["ParaStyleName", row(Command.FN_UNO_PARA_STYLE, "OUString", 0, 1)],
          [
            "NumberingRules",
            row(Command.FN_UNO_NUM_RULES, ["Reference", indexReplaceType], CONVERT_TWIPS, 1),
          ],
          ["NumberingLevel", row(Command.FN_UNO_NUM_LEVEL, "sal_Int16", 0, 1)],
          [
            "NumberingStartValue",
            row(Command.FN_UNO_NUM_START_VALUE, "sal_Int16", CONVERT_TWIPS, 1),
          ],
          ["NumberingIsNumber", row(Command.FN_UNO_IS_NUMBER, "bool", 0, 1)],
          ["ParaIsNumberingRestart", row(Command.FN_NUMBER_NEWSTART, "bool", 0, 1)],
          ["ListId", row(Command.FN_UNO_LIST_ID, "OUString", 0, 1)],
        ]);
        break;
      case MapId.PROPERTY_MAP_TEXT_DEFAULT:
        entries = new Map([
          [
            "TabStopDistance",
            row(H.RES_PARATR_TABSTOP, "sal_Int32", M.MID_STD_TAB | CONVERT_TWIPS),
          ],
          ...[...SwUnoPropertyMap].filter(
            /** Original default table membership. @param pair - Represented native row. @returns Source table membership. */ ([
              name,
            ]) => textDefaultProperties.has(name),
          ),
          ["CharStyleName", row(H.RES_TXTATR_CHARFMT, "OUString", 0, 1)],
          ["IsSplitAllowed", row(H.RES_ROW_SPLIT, "bool", 0, 1)],
          ["CollapsingBorders", row(H.RES_COLLAPSING_BORDERS, "bool")],
          ["StandardPageMode", row(H.RES_TEXTGRID, "bool", Grid.MID_GRID_STANDARD_MODE)],
        ]);
        break;
      case MapId.PROPERTY_MAP_CHAR_STYLE:
        entries = SwUnoCharStylePropertyMap;
        break;
      case MapId.PROPERTY_MAP_PARA_STYLE:
        entries = new Map([
          ...[...SwUnoPropertyMap]
            .filter(
              /** Original common paragraph-style table excludes cursor-only entries. @param pair - Admitted transport entry. @returns Original table membership. */ ([
                name,
              ]) => paragraphStyleProperties.has(name),
            )
            .map(
              /** Original literal per-row flags distinguish paragraph styles from cursors. @param pair - Original admitted row. @returns Native descriptor. */ ([
                name,
                value,
              ]) =>
                [
                  name,
                  { ...value, attributes: paragraphMaybeVoidProperties.has(name) ? 1 : 0 },
                ] as const,
            ),
          ["FollowStyle", row(Command.FN_UNO_FOLLOW_STYLE, "OUString")],
        ]);
        break;
      case MapId.PROPERTY_MAP_PAGE_STYLE:
        entries = new Map(
          [...SwUnoPageStylePropertyMap].map(
            /** Original page-style item properties use PROPERTY_NONE. @param pair - Admitted descriptor. @returns Native row. */ ([
              name,
              value,
            ]) => [name, { ...value, attributes: 0 }] as const,
          ),
        );
        entries = new Map([
          ...entries,
          ["FollowStyle", row(Command.FN_UNO_FOLLOW_STYLE, "OUString")],
          ["Width", row(SID_ATTR_PAGE_SIZE, "sal_Int32", MID_SIZE_WIDTH | CONVERT_TWIPS)],
          ["Height", row(SID_ATTR_PAGE_SIZE, "sal_Int32", MID_SIZE_HEIGHT | CONVERT_TWIPS)],
          ["LeftMargin", row(H.RES_LR_SPACE, "sal_Int32", M.MID_L_MARGIN | CONVERT_TWIPS)],
          ["RightMargin", row(H.RES_LR_SPACE, "sal_Int32", M.MID_R_MARGIN | CONVERT_TWIPS)],
          ["TopMargin", row(H.RES_UL_SPACE, "sal_Int32", M.MID_UP_MARGIN | CONVERT_TWIPS)],
          ["BottomMargin", row(H.RES_UL_SPACE, "sal_Int32", M.MID_LO_MARGIN | CONVERT_TWIPS)],
          ["IsLandscape", row(SID_ATTR_PAGE, "bool", MID_PAGE_ORIENTATION)],
          ["PageStyleLayout", row(SID_ATTR_PAGE, pageLayoutType, MID_PAGE_LAYOUT)],
        ]);
        break;
      case MapId.PROPERTY_MAP_NUM_STYLE:
        entries = new Map([
          [
            "NumberingRules",
            row(Command.FN_UNO_NUM_RULES, ["Reference", indexReplaceType], CONVERT_TWIPS),
          ],
        ]);
        break;
      case MapId.PROPERTY_MAP_TEXT_DOCUMENT:
        entries = new Map(
          [...SwUnoTextDocumentPropertyMap].map(
            /** Original document dispatch uses PROPERTY_NONE. @param pair - Admitted document row. @returns Original entry. */ ([
              name,
              value,
            ]) => [name, { ...value, attributes: 0 }] as const,
          ),
        );
        break;
      default:
        throw new Error("Unported Writer property-map family: " + propertyId);
    }
    const result = nativeEntries(entries);
    if (propertyId === MapId.PROPERTY_MAP_TEXT_DEFAULT) {
      for (const entry of result) {
        // Original provider clears MAYBEVOID except PageDescName after constructing the mutable static default table.
        if (entry.nWID !== H.RES_PAGEDESC || entry.nMemberId !== MID_PAGEDESC_PAGEDESCNAME)
          entry.nFlags &= ~MAYBEVOID;
      }
    }
    staticMapEntries[propertyId] = result;
    this.m_aMapEntriesArr[propertyId] = result;
    return result;
  }
  /** Original lazy static SfxItemPropertySet per admitted map family. @param propertyId - Original map identity. @returns Borrowed static owner. */
  GetPropertySet(propertyId: number): SfxItemPropertySet {
    propertyId &= 0xffff;
    let result = this.m_aPropertySetArr[propertyId];
    if (!result) {
      const entries = this.GetPropertyMapEntries(propertyId);
      result = staticPropertySets[propertyId] ?? new SfxItemPropertySet(entries);
      staticPropertySets[propertyId] = result;
      this.m_aPropertySetArr[propertyId] = result;
    }
    return result;
  }
}
/** Original process-static provider. Its schema and property-set owners retain process lifetime. */
export const aSwMapProvider = new SwUnoPropertyMapProvider();

/** Creates the existing known-length Unicode value from browser UTF16 units. @param value - Logical text. @returns Owned native string. */
function unicode(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; i++) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}

import { CONVERT_TWIPS } from "../../../../svl/inc/poolitem";

import { MAYBEVOID } from "../../../../udkapi/com/sun/star/beans/PropertyAttribute";
