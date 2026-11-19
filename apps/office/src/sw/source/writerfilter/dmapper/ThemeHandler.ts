/** @fileoverview Native Writer ThemeHandler language-to-script and font scheme resolution. */
import type { ThemeFontLanguages } from "../../../inc/doc";
import type { Theme } from "../../../../docmodel/inc/theme/Theme";
import { LanguageTag } from "../../../../i18nlangtag/inc/languagetag";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import type { Id } from "../inc/dmapper/resourcemodel";

const scripts = [
  [
    "Arab",
    [
      0x429, 0x401, 0x801, 0xc01, 0x1001, 0x1401, 0x1801, 0x1c01, 0x2001, 0x2401, 0x2801, 0x2c01,
      0x3001, 0x3401, 0x3801, 0x3c01, 0x4001, 0x420, 0x846, 0x859, 0x45f, 0x460, 0x463, 0x48c,
    ],
  ],
  ["Armn", [0x42b]],
  ["Beng", [0x445, 0x845, 0x44d, 0x458]],
  ["Cans", [0x45d]],
  ["Cher", [0x45c]],
  [
    "Cyrl",
    [
      0x419, 0x402, 0x281a, 0x422, 0x819, 0xc1a, 0x1c1a, 0x201a, 0x301a, 0x423, 0x428, 0x82c, 0x42f,
      0x43f, 0x440, 0x843, 0x444, 0x450, 0x46d, 0x485,
    ],
  ],
  ["Deva", [0x439, 0x44e, 0x44f, 0x457, 0x459, 0x860, 0x461, 0x861]],
  ["Ethi", [0x45e, 0x473, 0x873]],
  ["Geor", [0x437]],
  ["Grek", [0x408]],
  ["Gujr", [0x447]],
  ["Guru", [0x446]],
  ["Hang", [0x412]],
  ["Hans", [0x804, 0x1004]],
  ["Hant", [0x404, 0xc04, 0x1404]],
  ["Hebr", [0x40d, 0x43d]],
  ["Jpan", [0x411]],
  ["Khmr", [0x453]],
  ["Knda", [0x44b]],
  ["Laoo", [0x454]],
  [
    "Latn",
    [
      0x409, 0xc09, 0x809, 0x1009, 0x403, 0x406, 0x413, 0x813, 0x479, 0x40b, 0x40c, 0xc0c, 0x407,
      0x807, 0xc07, 0x1007, 0x1407, 0x410, 0x414, 0x814, 0x416, 0x816, 0x40a, 0x41d, 0x405, 0x40e,
      0x415, 0x41f, 0x42d, 0x424, 0x426, 0x427, 0x418, 0x818, 0x241a, 0x41a, 0x491, 0x83c, 0x430,
      0x431, 0x432, 0x433, 0x434, 0x435, 0x436, 0x425, 0x456, 0x41b, 0x1409, 0x1809, 0x1c09, 0x2009,
      0x2409, 0x2809, 0x2c09, 0x3009, 0x3409, 0x3809, 0x3c09, 0x4009, 0x4409, 0x4809, 0x80a, 0xc0a,
      0x100a, 0x140a, 0x180a, 0x1c0a, 0x200a, 0x240a, 0x280a, 0x2c0a, 0x300a, 0x340a, 0x380a,
      0x3c0a, 0x400a, 0x440a, 0x480a, 0x4c0a, 0x500a, 0x540a, 0x80c, 0x100c, 0x140c, 0x180c, 0x1c0c,
      0x200c, 0x240c, 0x280c, 0x2c0c, 0x300c, 0x340c, 0x3c0c, 0x380c, 0x40f, 0x810, 0x417, 0x81a,
      0x101a, 0x141a, 0x181a, 0x2c1a, 0x41c, 0x81d, 0x421, 0x42c, 0x42e, 0x82e, 0x438, 0x43a, 0x43b,
      0x83b, 0xc3b, 0x103b, 0x143b, 0x183b, 0x1c3b, 0x203b, 0x243b, 0x43e, 0x83e, 0x441, 0x442,
      0x443, 0x452, 0x85d, 0x85f, 0x462, 0x464, 0x466, 0x467, 0x468, 0x469, 0x46a, 0x46b, 0x86b,
      0xc6b, 0x46c, 0x46e, 0x46f, 0x470, 0x471, 0x472, 0x474, 0x475, 0x476, 0x477, 0x47a, 0x47c,
      0x47e, 0x481, 0x482, 0x483, 0x484, 0x486, 0x487, 0x488,
    ],
  ],
  ["Mlym", [0x44c]],
  ["Mong", [0x850]],
  ["Mymr", [0x455]],
  ["Orya", [0x448]],
  ["Sinh", [0x45b]],
  ["Syrc", [0x45a]],
  ["Taml", [0x449]],
  ["Telu", [0x44a]],
  ["Thaa", [0x465]],
  ["Thai", [0x41e]],
  ["Tibt", [0x451, 0x851]],
  ["Uigh", [0x480]],
  ["Viet", [0x42a]],
  ["Yiii", [0x478]],
] as const;

/** Maps the original LanguageTag result through ThemeHandler's exact LCID assignments. @param locale - Persisted locale. @returns Font scheme script or empty. */
function fromLocaleToScriptTag(locale: string | undefined): string {
  if (!locale) return "";
  const name = unicode(locale);
  try {
    const id = LanguageTag.convertToLanguageType(name) & 0xffff;
    for (const [script, languages] of scripts)
      if ((languages as readonly number[]).includes(id)) return script;
    return "";
  } finally {
    name.dispose();
  }
}

const themeNames: ReadonlyMap<Id, string> = new Map([
  [N.LN_Value_ST_Theme_majorEastAsia, "majorEastAsia"],
  [N.LN_Value_ST_Theme_majorBidi, "majorBidi"],
  [N.LN_Value_ST_Theme_majorAscii, "majorAscii"],
  [N.LN_Value_ST_Theme_majorHAnsi, "majorHAnsi"],
  [N.LN_Value_ST_Theme_minorEastAsia, "minorEastAsia"],
  [N.LN_Value_ST_Theme_minorBidi, "minorBidi"],
  [N.LN_Value_ST_Theme_minorAscii, "minorAscii"],
  [N.LN_Value_ST_Theme_minorHAnsi, "minorHAnsi"],
]);

/** Resolves native supplemental and primary font slots using the document theme. */
export class ThemeHandler {
  private readonly eastAsia: string;
  private readonly bidi: string;

  /** Captures original supplemental script selectors from SettingsTable. @param theme - Document theme. @param languages - Source theme languages. @returns Theme handler. */
  constructor(
    private readonly theme: Theme,
    languages: ThemeFontLanguages | undefined,
  ) {
    this.eastAsia = fromLocaleToScriptTag(languages?.eastAsia);
    this.bidi = fromLocaleToScriptTag(languages?.bidi);
  }

  /** Returns the native lexical name associated with the resource ID. @param id - ST_Theme value. @returns Name or empty. */
  static getStringForTheme(id: Id): string {
    return themeNames.get(id) ?? "";
  }

  /** Uses a nonempty supplemental face before the original primary slot. @param id - ST_Theme value. @returns Resolved typeface or empty. */
  getFontNameForTheme(id: Id): string {
    const name = ThemeHandler.getStringForTheme(id);
    if (!name) return "";
    const scope = this.theme.fontScheme;
    const major = name.startsWith("major");
    const script = name.endsWith("EastAsia") ? "ea" : name.endsWith("Bidi") ? "cs" : "latin";
    const supplementalScript = script === "ea" ? this.eastAsia : script === "cs" ? this.bidi : "";
    const supplemental = major ? scope.majorSupplemental : scope.minorSupplemental;
    const match =
      supplementalScript &&
      supplemental.find(
        /** Uses the first original script match. @param font - Source font entry. @returns Whether its script matches. */
        (font) => font.script === supplementalScript,
      );
    return (
      (match && match.typeface) ||
      (major ? scope.majorFont : scope.minorFont).get(script)?.typeface ||
      ""
    );
  }
}
