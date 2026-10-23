/** @fileoverview Browser counterpart of LibreOffice `svtools/ctrltool.hxx` FontList. */
import { lower, text } from "../../i18nlangtag/source/isolang/isolang.tables";
import { decodeBrowserFontFamily } from "./font-family";
import { Font } from "../source/font/font";
import { GetEnglishSearchFontName } from "../../unotools/source/misc/fontdefs";
import { RTL_TEXTENCODING_SYMBOL } from "../../sal/inc/rtl/textenc";

/** Original aStarSymbolRecodeTable input names; only converter availability is needed by makeMissing. */
const symbolRecodeNames = new Set([
  "starbats",
  "starmath",
  "symbol",
  "standardsymbols",
  "standardsymbolsl",
  "monotypesorts",
  "zapfdingbats",
  "itczapfdingbats",
  "dingbats",
  "webdings",
  "wingdings",
  "wingdings2",
  "wingdings3",
  "mtextra",
]);

/** Browser font-list metadata boundary matching FontList::Get's missing-metric branch. Local Font Access exposes names,not native family/pitch metrics,so their native unknown values are retained. @param name - Selected original family spelling. @returns Complete represented VCL font value. */
export function getBrowserFont(name: string): Font {
  const font = new Font();
  font.SetFamilyName(name);
  const units = new Uint16Array(name.length);
  for (let i = 0; i < name.length; ++i) units[i] = name.charCodeAt(i);
  const searchName = GetEnglishSearchFontName(units);
  try {
    if (symbolRecodeNames.has(text(searchName))) font.SetCharSet(RTL_TEXTENCODING_SYMBOL);
  } finally {
    searchName.dispose();
  }
  return font;
}

export const FALLBACK_FONT_FAMILIES = [
  "Liberation Serif",
  "Liberation Sans",
  "Liberation Mono",
  "Arial",
  "Calibri",
  "Cambria",
  "Courier New",
  "DejaVu Sans",
  "DejaVu Serif",
  "Noto Sans",
  "Noto Serif",
  "Times New Roman",
] as const;

/** Browser local-font query result used by FontList. */
interface LocalFontData {
  readonly family: string;
}
/** Local Font Access API signature kept optional for unsupported browsers. */
type LocalFontQuery = () => Promise<readonly LocalFontData[]>;

/** Ordered, deduplicated font-family list populated from the active output device. */
export class FontList {
  /** Creates a font list from normalized names. @param names - Ordered unique families. @returns Nothing. */
  public constructor(private readonly names: readonly string[]) {}
  /** Returns the number of family names. @returns Font count. */
  public GetFontNameCount(): number {
    return this.names.length;
  }
  /** Returns one family by index. @param index - Zero-based position. @returns Font family. */
  public GetFontName(index: number): string {
    const name = this.names[index];
    if (name === undefined) throw new Error(`FontList index is outside the list: ${index}`);
    return name;
  }
  /** Returns the immutable ordered family list. @returns Font families. */
  public GetFontNames(): readonly string[] {
    return this.names;
  }
  /** Queries Local Font Access and falls back offline. @param window_ - Browser boundary. @returns Populated list. */
  public static async FromBrowser(window_: Window = window): Promise<FontList> {
    const query = (window_ as Window & { queryLocalFonts?: LocalFontQuery }).queryLocalFonts;
    const registered: string[] = [];
    window_.document?.fonts?.forEach(
      /** Includes actual bundled and document FontFaces even when system enumeration is unavailable. @param face - Registered browser face. @returns Nothing. */
      (face) => {
        if (face.status !== "error") registered.push(decodeBrowserFontFamily(face.family));
      },
    );
    let local: readonly LocalFontData[] = [];
    if (query !== undefined)
      try {
        local = await query.call(window_);
      } catch {
        local = [];
      }
    const available = [
      ...registered,
      ...local
        .map(
          /** Projects a family. @param font - Local font. @returns Family. */ (font) =>
            font.family,
        )
        .filter(
          /** Removes blank families. @param family - Candidate. @returns Whether non-empty. */ Boolean,
        ),
    ];
    // Native FontList groups physical names using ASCII-only case folding. Preserve
    // the first actual registered spelling instead of inventing installed fallback faces.
    const families = new Map<string, string>();
    for (const name of available.length === 0 ? FALLBACK_FONT_FAMILIES : available) {
      if (!name) continue;
      const key = lower(name);
      if (!families.has(key)) families.set(key, name);
    }
    const names = [...families.keys()].sort().map(
      /** Uses native UTF16 ordering of the ASCII-folded keys, retaining actual family spelling. @param key - Existing family key. @returns Registered name. */
      (key) => families.get(key) as string,
    );
    return new FontList(names);
  }
}
