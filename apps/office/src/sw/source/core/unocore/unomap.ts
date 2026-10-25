/** @fileoverview Consumed Writer cursor/paragraph/style property entries from pinned unomap.cxx/unomap1.cxx; unrepresented properties are not advertised. */
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { cppu_detail_getUnoType_BreakType as breakType } from "../../../../offapi/com/sun/star/style/BreakType";
import { Property } from "../../../../udkapi/com/sun/star/beans/Property";
import { SfxItemPropertySetInfo } from "../../../../svl/source/items/itemprop";
import { UnoType, type UnoTypeArgument } from "../../../../cppu/inc/unotype";

import { cppu_detail_getUnoType_FontSlant as fontSlantType } from "../../../../offapi/com/sun/star/awt/FontSlant";
import { cppu_detail_getUnoType_LineSpacing as lineSpacingType } from "../../../../offapi/com/sun/star/style/LineSpacing";
import { cppu_detail_getUnoType_TabStop as tabStopType } from "../../../../offapi/com/sun/star/style/TabStop";
import * as H from "../../../inc/hintids";
import * as M from "../../../../editeng/inc/memberids";
import { MID_PAGEDESC_PAGEDESCNAME, MID_PAGEDESC_PAGENUMOFFSET } from "../../../inc/unomid";
/** Native item member transport already provided by the bounded core item. */
export interface SwUnoPropertyEntry {
  readonly which: number;
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
    | "break";
}
/** Exact property identity and member selection; numeric values stay in their original item owners. */
export const SwUnoPropertyMap: ReadonlyMap<string, SwUnoPropertyEntry> = new Map([
  ["CharAutoStyleName", { which: H.RES_TXTATR_AUTOFMT, member: 0, kind: "autostyle" }],
  ...["", "Asian", "Complex"].flatMap(
    /** Processes one ordered native value at this boundary. @param suffix - Original suffix input. @param index - Native zero-based index. @returns The represented native operation result. */
    (suffix, index) =>
      [
        [
          `CharWeight${suffix}`,
          {
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
            which: [H.RES_CHRATR_FONT, H.RES_CHRATR_CJK_FONT, H.RES_CHRATR_CTL_FONT][
              index
            ] as number,
            member: 1,
            kind: "font",
          },
        ],
      ] as [string, SwUnoPropertyEntry][],
  ),
  ["HyperLinkURL", { which: H.RES_TXTATR_INETFMT, member: 4, kind: "hyperlink" }],
  ["HyperLinkTarget", { which: H.RES_TXTATR_INETFMT, member: 5, kind: "hyperlink" }],
  ["HyperLinkName", { which: H.RES_TXTATR_INETFMT, member: 1, kind: "hyperlink" }],
  ...["", "Asian", "Complex"].flatMap(
    /** Executes this bounded native operation. @param suffix - Native operation input. @param index - Native operation input. @returns Native operation result. */ (
      suffix,
      index,
    ) => [
      ...[
        ["CharFontStyleName", 2],
        ["CharFontFamily", 3],
        ["CharFontCharSet", 4],
        ["CharFontPitch", 5],
      ].map(
        /** Executes this bounded native operation. @param namemember - Native operation input. @returns Native operation result. */ ([
          name,
          member,
        ]) =>
          [
            `${name}${suffix}`,
            {
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
  ["CharUnderlineColor", { which: H.RES_CHRATR_UNDERLINE, member: M.MID_TL_COLOR, kind: "any" }],
  [
    "CharUnderlineHasColor",
    { which: H.RES_CHRATR_UNDERLINE, member: M.MID_TL_HASCOLOR, kind: "any" },
  ],
  [
    "ParaIsAutoFirstLineIndent",
    { which: H.RES_MARGIN_FIRSTLINE, member: M.MID_FIRST_AUTO, kind: "bool" },
  ],
  ["ParaLineNumberCount", { which: H.RES_LINENUMBER, member: 0, kind: "bool" }],
  ["BreakType", { which: H.RES_BREAK, member: 0, kind: "break" }],
  ["PageDescName", { which: H.RES_PAGEDESC, member: MID_PAGEDESC_PAGEDESCNAME, kind: "pagedesc" }],
  [
    "PageNumberOffset",
    { which: H.RES_PAGEDESC, member: MID_PAGEDESC_PAGENUMOFFSET, kind: "pagedesc" },
  ],
  ["NumberingStyleName", { which: H.RES_PARATR_NUMRULE, member: 0, kind: "string" }],
  ["VisitedCharStyleName", { which: H.RES_TXTATR_INETFMT, member: 6, kind: "hyperlink" }],
  ["UnvisitedCharStyleName", { which: H.RES_TXTATR_INETFMT, member: 7, kind: "hyperlink" }],
  ["CharUnderline", { which: H.RES_CHRATR_UNDERLINE, member: M.MID_TL_STYLE, kind: "short" }],
  ["CharStrikeout", { which: H.RES_CHRATR_CROSSEDOUT, member: M.MID_CROSS_OUT, kind: "any" }],
  ["CharWordMode", { which: H.RES_CHRATR_WORDLINEMODE, member: 0, kind: "bool" }],
  ["CharAutoKerning", { which: H.RES_CHRATR_AUTOKERN, member: 0, kind: "bool" }],
  ["CharEscapement", { which: H.RES_CHRATR_ESCAPEMENT, member: 0, kind: "any" }],
  ["CharEscapementHeight", { which: H.RES_CHRATR_ESCAPEMENT, member: 1, kind: "any" }],
  ["CharColor", { which: H.RES_CHRATR_COLOR, member: 0, kind: "color" }],
  ["CharHighlight", { which: H.RES_CHRATR_HIGHLIGHT, member: 0, kind: "color" }],
  ["ParaAdjust", { which: H.RES_PARATR_ADJUST, member: 0, kind: "any" }],
  ["ParaLastLineAdjust", { which: H.RES_PARATR_ADJUST, member: 1, kind: "any" }],
  ["ParaExpandSingleWord", { which: H.RES_PARATR_ADJUST, member: 2, kind: "any" }],
  [
    "ParaLeftMargin",
    { which: H.RES_MARGIN_TEXTLEFT, member: M.MID_TXT_LMARGIN | 0x80, kind: "long" },
  ],
  ["ParaRightMargin", { which: H.RES_MARGIN_RIGHT, member: 5 | 0x80, kind: "long" }],
  [
    "ParaFirstLineIndent",
    { which: H.RES_MARGIN_FIRSTLINE, member: M.MID_FIRST_LINE_INDENT | 0x80, kind: "long" },
  ],
  ["ParaTopMargin", { which: H.RES_UL_SPACE, member: 3 | 0x80, kind: "long" }],
  ["ParaBottomMargin", { which: H.RES_UL_SPACE, member: 4 | 0x80, kind: "long" }],
  ["ParaTabStops", { which: H.RES_PARATR_TABSTOP, member: 0x80, kind: "any" }],
  ["ParaContextMargin", { which: H.RES_UL_SPACE, member: 7, kind: "bool" }],
  ["ParaLineSpacing", { which: H.RES_PARATR_LINESPACING, member: 0x80, kind: "any" }],
  ["ParaKeepTogether", { which: H.RES_KEEP, member: 0, kind: "bool" }],
  ["ParaSplit", { which: H.RES_PARATR_SPLIT, member: 0, kind: "bool" }],
  ["ParaOrphans", { which: H.RES_PARATR_ORPHANS, member: 0, kind: "byte" }],
  ["ParaWidows", { which: H.RES_PARATR_WIDOWS, member: 0, kind: "byte" }],
  ["OutlineLevel", { which: H.RES_PARATR_OUTLINELEVEL, member: 0, kind: "short" }],
]);

/** Builds native property descriptors for the represented property map and explicit semantic properties. @param extra - Extra name/type pairs consumed by the caller. @returns Independent metadata owner. @param includeItems - Original includeItems input. */
export function createPropertySetInfo(
  extra: readonly (readonly [string, UnoTypeArgument])[] = [],
  includeItems = true,
): SfxItemPropertySetInfo {
  const properties: Property[] = [];
  for (const [name, entry] of includeItems ? SwUnoPropertyMap : []) {
    const argument: UnoTypeArgument =
      entry.kind === "break"
        ? breakType
        : entry.kind === "pagedesc"
          ? entry.member === MID_PAGEDESC_PAGEDESCNAME
            ? "OUString"
            : "sal_Int16"
          : entry.kind === "string"
            ? "OUString"
            : entry.kind === "font"
              ? entry.member < 3
                ? "OUString"
                : "sal_Int16"
              : entry.kind === "bool"
                ? "bool"
                : entry.kind === "byte"
                  ? "sal_Int8"
                  : entry.kind === "short"
                    ? "sal_Int16"
                    : entry.kind === "hyperlink" || entry.kind === "autostyle"
                      ? "OUString"
                      : entry.kind === "color" || entry.kind === "long"
                        ? "sal_Int32"
                        : name.includes("Posture")
                          ? fontSlantType
                          : name === "ParaLineSpacing"
                            ? lineSpacingType
                            : name === "ParaTabStops"
                              ? ["Sequence", tabStopType]
                              : name === "CharUnderlineColor"
                                ? "sal_Int32"
                                : name === "CharUnderlineHasColor"
                                  ? "bool"
                                  : name === "CharStrikeout" ||
                                      name === "CharEscapement" ||
                                      name === "ParaAdjust" ||
                                      name === "ParaLastLineAdjust"
                                    ? "sal_Int16"
                                    : name === "CharEscapementHeight"
                                      ? "sal_Int8"
                                      : name === "ParaExpandSingleWord"
                                        ? "bool"
                                        : "float";
    const key = unicode(name);
    properties.push(new Property(key, entry.which, UnoType.get(argument), 1));
    key.dispose();
  }
  for (const [name, argument] of extra) {
    const key = unicode(name);
    properties.push(new Property(key, -1, UnoType.get(argument), 1));
    key.dispose();
  }
  return new SfxItemPropertySetInfo(properties);
}

/** Creates the existing known-length Unicode value from browser UTF16 units. @param value - Logical text. @returns Owned native string. */
function unicode(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; i++) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}
