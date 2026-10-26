/** @fileoverview Original default-font role IDs and UTF16 token declaration from include/unotools/fontdefs.hxx. */
/** Native default-font roles; these numeric IDs are distinct from language IDs. */
export enum DefaultFontType {
  SANS_UNICODE = 1,
  SANS = 2,
  SERIF = 3,
  FIXED = 4,
  SYMBOL = 5,
  UI_SANS = 1000,
  UI_FIXED = 1001,
  LATIN_TEXT = 2000,
  LATIN_PRESENTATION = 2001,
  LATIN_SPREADSHEET = 2002,
  LATIN_HEADING = 2003,
  LATIN_DISPLAY = 2004,
  LATIN_FIXED = 2005,
  CJK_TEXT = 3000,
  CJK_PRESENTATION = 3001,
  CJK_SPREADSHEET = 3002,
  CJK_HEADING = 3003,
  CJK_DISPLAY = 3004,
  CTL_TEXT = 4000,
  CTL_PRESENTATION = 4001,
  CTL_SPREADSHEET = 4002,
  CTL_HEADING = 4003,
  CTL_DISPLAY = 4004,
}
export {
  GetNextFontToken,
  GetEnglishSearchFontName,
  StripScriptFromName,
  AddTokenFontName,
  IsOpenSymbol,
} from "../source/misc/fontdefs";

/** Original substitution flag bits. */
export enum SubsFontFlags {
  ONLYONE = 1,
  MS = 2,
}
export { GetSubsFontName } from "../source/misc/fontdefs";
