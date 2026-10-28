/** @fileoverview Original zforscan.cxx English keyword table and complete SetDependentKeywords locale overrides. Language cases and precedence are copied from the pinned source; no language-family inference is used. */
import * as L from "../../../i18nlangtag/inc/lang";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { NfKeywordIndex as K } from "../../inc/nfkeytab";
/** Original constant English table in exact NfKeywordIndex order. */
export const englishKeywordText: readonly string[] = [
  "",
  "E",
  "AM/PM",
  "A/P",
  "M",
  "MM",
  "M",
  "MM",
  "MMM",
  "MMMM",
  "MMMMM",
  "H",
  "HH",
  "S",
  "SS",
  "Q",
  "QQ",
  "D",
  "DD",
  "DDD",
  "DDDD",
  "YY",
  "YYYY",
  "NN",
  "NNN",
  "NNNN",
  "AAA",
  "AAAA",
  "E",
  "EE",
  "G",
  "GG",
  "GGG",
  "R",
  "RR",
  "WW",
  "t",
  "CCC",
  "BOOLEAN",
  "GENERAL",
  "TRUE",
  "FALSE",
  "COLOR",
  "BLACK",
  "BLUE",
  "GREEN",
  "CYAN",
  "RED",
  "MAGENTA",
  "BROWN",
  "GREY",
  "YELLOW",
  "WHITE",
];
/** Original source-owned English keywords, borrowed as const from the scanner. */
export const sEnglishKeyword: readonly OUString[] = englishKeywordText.map(unicode);
/** Original German-only color names, in COLOR-through-WHITE order. */
const germanColorNames = [
  "FARBE",
  "SCHWARZ",
  "BLAU",
  "GRÜN",
  "CYAN",
  "ROT",
  "MAGENTA",
  "BRAUN",
  "GRAU",
  "GELB",
  "WEISS",
] as const;
/** Original indexed German color lookup; callers obey the source asserted range. @param index - Source color index. @returns Native text. */
export function GermanColorName(index: number): string {
  return germanColorNames[index] as string;
}
/** Assigns a source UTF16 literal into its actual owned OUString member. @param target - Existing member. @param value - Literal. @returns Nothing. */
function assign(target: OUString, value: string): void {
  const text = unicode(value);
  try {
    target.assign(text);
  } finally {
    text.dispose();
  }
}
/** Original locale override branches after the source bL10n guard. @param language - Loaded language ID. @param keywords - Original scanner table. @returns Nothing. */
export function SetDependentKeywordOverrides(language: number, keywords: OUString[]): void {
  if (
    [
      L.LANGUAGE_GERMAN,
      L.LANGUAGE_GERMAN_SWISS,
      L.LANGUAGE_GERMAN_AUSTRIAN,
      L.LANGUAGE_GERMAN_LUXEMBOURG,
      L.LANGUAGE_GERMAN_LIECHTENSTEIN,
    ].includes(language)
  ) {
    //! all capital letters
    assign(keywords[K.M] as OUString, "M"); // month 1
    assign(keywords[K.MM] as OUString, "MM"); // month 01
    assign(keywords[K.MMM] as OUString, "MMM"); // month Jan
    assign(keywords[K.MMMM] as OUString, "MMMM"); // month Januar
    assign(keywords[K.MMMMM] as OUString, "MMMMM"); // month J
    assign(keywords[K.H] as OUString, "H"); // hour 2
    assign(keywords[K.HH] as OUString, "HH"); // hour 02
    assign(keywords[K.D] as OUString, "T");
    assign(keywords[K.DD] as OUString, "TT");
    assign(keywords[K.DDD] as OUString, "TTT");
    assign(keywords[K.DDDD] as OUString, "TTTT");
    assign(keywords[K.YY] as OUString, "JJ");
    assign(keywords[K.YYYY] as OUString, "JJJJ");
    assign(keywords[K.BOOLEAN] as OUString, "LOGISCH");
    assign(keywords[K.COLOR] as OUString, GermanColorName(K.COLOR - K.COLOR));
    assign(keywords[K.BLACK] as OUString, GermanColorName(K.BLACK - K.COLOR));
    assign(keywords[K.BLUE] as OUString, GermanColorName(K.BLUE - K.COLOR));
    assign(keywords[K.GREEN] as OUString, GermanColorName(K.GREEN - K.COLOR));
    assign(keywords[K.CYAN] as OUString, GermanColorName(K.CYAN - K.COLOR));
    assign(keywords[K.RED] as OUString, GermanColorName(K.RED - K.COLOR));
    assign(keywords[K.MAGENTA] as OUString, GermanColorName(K.MAGENTA - K.COLOR));
    assign(keywords[K.BROWN] as OUString, GermanColorName(K.BROWN - K.COLOR));
    assign(keywords[K.GREY] as OUString, GermanColorName(K.GREY - K.COLOR));
    assign(keywords[K.YELLOW] as OUString, GermanColorName(K.YELLOW - K.COLOR));
    assign(keywords[K.WHITE] as OUString, GermanColorName(K.WHITE - K.COLOR));
  } else {
    // day
    if ([L.LANGUAGE_ITALIAN, L.LANGUAGE_ITALIAN_SWISS].includes(language)) {
      assign(keywords[K.D] as OUString, "G");
      assign(keywords[K.DD] as OUString, "GG");
      assign(keywords[K.DDD] as OUString, "GGG");
      assign(keywords[K.DDDD] as OUString, "GGGG");
      // must exchange the era code, same as Xcl
      assign(keywords[K.G] as OUString, "X");
      assign(keywords[K.GG] as OUString, "XX");
      assign(keywords[K.GGG] as OUString, "XXX");
    } else if (
      [
        L.LANGUAGE_FRENCH,
        L.LANGUAGE_FRENCH_BELGIAN,
        L.LANGUAGE_FRENCH_CANADIAN,
        L.LANGUAGE_FRENCH_SWISS,
        L.LANGUAGE_FRENCH_LUXEMBOURG,
        L.LANGUAGE_FRENCH_MONACO,
      ].includes(language)
    ) {
      assign(keywords[K.D] as OUString, "J");
      assign(keywords[K.DD] as OUString, "JJ");
      assign(keywords[K.DDD] as OUString, "JJJ");
      assign(keywords[K.DDDD] as OUString, "JJJJ");
    } else if (language === L.LANGUAGE_FINNISH) {
      assign(keywords[K.D] as OUString, "P");
      assign(keywords[K.DD] as OUString, "PP");
      assign(keywords[K.DDD] as OUString, "PPP");
      assign(keywords[K.DDDD] as OUString, "PPPP");
    }

    // month
    if (language === L.LANGUAGE_FINNISH) {
      assign(keywords[K.M] as OUString, "K");
      assign(keywords[K.MM] as OUString, "KK");
      assign(keywords[K.MMM] as OUString, "KKK");
      assign(keywords[K.MMMM] as OUString, "KKKK");
      assign(keywords[K.MMMMM] as OUString, "KKKKK");
    }

    // year
    if (
      [
        L.LANGUAGE_ITALIAN,
        L.LANGUAGE_ITALIAN_SWISS,
        L.LANGUAGE_FRENCH,
        L.LANGUAGE_FRENCH_BELGIAN,
        L.LANGUAGE_FRENCH_CANADIAN,
        L.LANGUAGE_FRENCH_SWISS,
        L.LANGUAGE_FRENCH_LUXEMBOURG,
        L.LANGUAGE_FRENCH_MONACO,
        L.LANGUAGE_PORTUGUESE,
        L.LANGUAGE_PORTUGUESE_BRAZILIAN,
        L.LANGUAGE_SPANISH_MODERN,
        L.LANGUAGE_SPANISH_DATED,
        L.LANGUAGE_SPANISH_MEXICAN,
        L.LANGUAGE_SPANISH_GUATEMALA,
        L.LANGUAGE_SPANISH_COSTARICA,
        L.LANGUAGE_SPANISH_PANAMA,
        L.LANGUAGE_SPANISH_DOMINICAN_REPUBLIC,
        L.LANGUAGE_SPANISH_VENEZUELA,
        L.LANGUAGE_SPANISH_COLOMBIA,
        L.LANGUAGE_SPANISH_PERU,
        L.LANGUAGE_SPANISH_ARGENTINA,
        L.LANGUAGE_SPANISH_ECUADOR,
        L.LANGUAGE_SPANISH_CHILE,
        L.LANGUAGE_SPANISH_URUGUAY,
        L.LANGUAGE_SPANISH_PARAGUAY,
        L.LANGUAGE_SPANISH_BOLIVIA,
        L.LANGUAGE_SPANISH_EL_SALVADOR,
        L.LANGUAGE_SPANISH_HONDURAS,
        L.LANGUAGE_SPANISH_NICARAGUA,
        L.LANGUAGE_SPANISH_PUERTO_RICO,
      ].includes(language)
    ) {
      assign(keywords[K.YY] as OUString, "AA");
      assign(keywords[K.YYYY] as OUString, "AAAA");
      // must exchange the day of week name code, same as Xcl
      assign(keywords[K.AAA] as OUString, "OOO");
      assign(keywords[K.AAAA] as OUString, "OOOO");
    } else if ([L.LANGUAGE_DUTCH, L.LANGUAGE_DUTCH_BELGIAN].includes(language)) {
      assign(keywords[K.YY] as OUString, "JJ");
      assign(keywords[K.YYYY] as OUString, "JJJJ");
    } else if (language === L.LANGUAGE_FINNISH) {
      assign(keywords[K.YY] as OUString, "VV");
      assign(keywords[K.YYYY] as OUString, "VVVV");
    }

    // hour
    if ([L.LANGUAGE_DUTCH, L.LANGUAGE_DUTCH_BELGIAN].includes(language)) {
      assign(keywords[K.H] as OUString, "U");
      assign(keywords[K.HH] as OUString, "UU");
    } else if (
      [
        L.LANGUAGE_FINNISH,
        L.LANGUAGE_SWEDISH,
        L.LANGUAGE_SWEDISH_FINLAND,
        L.LANGUAGE_DANISH,
        L.LANGUAGE_NORWEGIAN,
        L.LANGUAGE_NORWEGIAN_BOKMAL,
        L.LANGUAGE_NORWEGIAN_NYNORSK,
      ].includes(language)
    ) {
      assign(keywords[K.H] as OUString, "T");
      assign(keywords[K.HH] as OUString, "TT");
    }
  }
}
