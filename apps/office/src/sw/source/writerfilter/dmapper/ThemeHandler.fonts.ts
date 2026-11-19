/** @fileoverview Original DomainMapper font-theme attribute dispatch and character interoperability keys. */
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { GrabBagValueConstReference } from "../../../../svl/source/items/grabbagitem";
import { stringAny } from "../../core/unocore/unocrsrhelper";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { PropertyIds as P } from "./PropertyIds";
import { GrabBagType, type PropertyMap } from "./PropertyMap";
import { ThemeHandler } from "./ThemeHandler";
import type { SwDoc } from "../../core/doc/doc";

const themeAttributes = new Map<number, readonly [P, P?, P?]>([
  [
    N.LN_CT_Fonts_asciiTheme,
    [P.PROP_CHAR_THEME_NAME_ASCII, P.PROP_CHAR_FONT_NAME, P.PROP_CHAR_THEME_FONT_NAME_ASCII],
  ],
  [N.LN_CT_Fonts_hAnsiTheme, [P.PROP_CHAR_THEME_NAME_H_ANSI]],
  [
    N.LN_CT_Fonts_eastAsiaTheme,
    [
      P.PROP_CHAR_THEME_NAME_EAST_ASIA,
      P.PROP_CHAR_FONT_NAME_ASIAN,
      P.PROP_CHAR_THEME_FONT_NAME_EAST_ASIA,
    ],
  ],
  [
    N.LN_CT_Fonts_cstheme,
    [P.PROP_CHAR_THEME_NAME_CS, P.PROP_CHAR_FONT_NAME_COMPLEX, P.PROP_CHAR_THEME_FONT_NAME_CS],
  ],
] as const);

/** The DOCX font interop names and the emitted concrete and theme attributes. */
export const fontThemeProperties = [
  ["CharThemeNameAscii", "asciiTheme", "ascii", "CharThemeFontNameAscii"],
  ["CharThemeNameHAnsi", "hAnsiTheme", "ascii", "CharThemeFontNameAscii"],
  ["CharThemeNameEastAsia", "eastAsiaTheme", "eastAsia", "CharThemeFontNameEastAsia"],
  ["CharThemeNameCs", "cstheme", "cs", "CharThemeFontNameCs"],
] as const;

const themePropertyNames = new Set<string>(
  fontThemeProperties.flatMap(
    /** Admits both original metadata members. @param property - Original binding. @returns Names. */
    ([name, , , original]) => [name, original],
  ),
);

/** Tests for a native Writer theme-font grab bag member. @param key - Property name. @returns Membership. */
export function isThemeFontProperty(key: string): boolean {
  return themePropertyNames.has(key);
}

/** Applies original theme reference and resolved font to one native context. @param id - Font attribute resource. @param value - Native ST_Theme token. @param doc - Current document, whose settings precede styles. @param context - Original Writer property map. @returns Whether handled. */
export function resolveThemeFont(
  id: number,
  value: number,
  doc: SwDoc,
  context: PropertyMap,
): boolean {
  const attribute = themeAttributes.get(id);
  if (!attribute) return false;
  const [theme, font, original] = attribute;
  const name = stringAny(ThemeHandler.getStringForTheme(value));
  try {
    context.Insert(theme, name, true, GrabBagType.CHAR_GRAB_BAG);
  } finally {
    name.dispose();
  }
  if (font !== undefined && original !== undefined) {
    const family = stringAny(
      doc.theme
        ? new ThemeHandler(doc.theme, doc.themeFontLanguages).getFontNameForTheme(value)
        : "",
    );
    try {
      context.Insert(font, family);
      context.Insert(original, family, true, GrabBagType.CHAR_GRAB_BAG);
    } finally {
      family.dispose();
    }
  }
  return true;
}

/** Reads an original string-valued theme grab bag entry. @param value - Borrowed interoperability value. @returns Native string or absence for a wrong type. */
export function readThemeFontProperty(value: GrabBagValueConstReference): string | undefined {
  const result = new OUString();
  try {
    return value.extract(result, "OUString") ? text(result) : undefined;
  } finally {
    result.dispose();
  }
}
