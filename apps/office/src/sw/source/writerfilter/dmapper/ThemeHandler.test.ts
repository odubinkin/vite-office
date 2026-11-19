/** @fileoverview Native font-theme script resolution and empty source overrides. */
import { expect, it } from "vitest";
import { Theme } from "../../../../docmodel/inc/theme/Theme";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { SwDoc } from "../../core/doc/doc";
import { stringAny } from "../../core/unocore/unocrsrhelper";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { PropertyIds as P } from "./PropertyIds";
import { PropertyMap } from "./PropertyMap";
import { ThemeHandler } from "./ThemeHandler";
import { readThemeFontProperty, resolveThemeFont } from "./ThemeHandler.fonts";

it("uses primary font slots when the supplemental script or family is unavailable", /** Exercises empty supplemental entries, missing slots and an unmapped locale. @returns Nothing. */ () => {
  const theme = new Theme();
  theme.fontScheme.majorSupplemental.push({ script: "Jpan", typeface: "" });
  const handler = new ThemeHandler(theme, { eastAsia: "ja-JP", bidi: "zz-ZZ" });
  expect(handler.getFontNameForTheme(N.LN_Value_ST_Theme_majorEastAsia)).toBe("DejaVu Sans");
  expect(handler.getFontNameForTheme(N.LN_Value_ST_Theme_minorBidi)).toBe("DejaVu Sans");
  expect(handler.getFontNameForTheme(N.LN_Value_ST_Theme_majorHAnsi)).toBe("Arial");
  theme.fontScheme.minorFont.clear();
  expect(handler.getFontNameForTheme(N.LN_Value_ST_Theme_minorAscii)).toBe("");
  expect(handler.getFontNameForTheme(0)).toBe("");
});

it("retains the native empty theme override even when a literal font was supplied", /** Exercises absent theme and the string-valued grab bag contract. @returns Nothing. */ () => {
  const document = new SwDoc();
  const context = new PropertyMap();
  const name = stringAny("Literal font");
  const wrong = new Any();
  try {
    context.Insert(P.PROP_CHAR_FONT_NAME, name);
    expect(
      resolveThemeFont(N.LN_CT_Fonts_asciiTheme, N.LN_Value_ST_Theme_majorAscii, document, context),
    ).toBe(true);
    expect(readThemeFontProperty(context.getProperty(P.PROP_CHAR_FONT_NAME)?.[1] ?? wrong)).toBe(
      "",
    );
    expect(readThemeFontProperty(wrong)).toBeUndefined();
    expect(resolveThemeFont(N.LN_CT_Fonts_hAnsi, 0, document, context)).toBe(false);
    expect(
      resolveThemeFont(N.LN_CT_Fonts_hAnsiTheme, N.LN_Value_ST_Theme_majorHAnsi, document, context),
    ).toBe(true);
    expect(
      readThemeFontProperty(context.getProperty(P.PROP_CHAR_THEME_NAME_H_ANSI)?.[1] ?? wrong),
    ).toBe("majorHAnsi");
  } finally {
    context.dispose();
    name.dispose();
    wrong.dispose();
    document.Dispose();
  }
});
