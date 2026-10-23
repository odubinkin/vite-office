/** @fileoverview Browser counterpart of LibreOffice `svtools/ctrltool.hxx` FontList. */
import { lower, text } from "../../i18nlangtag/source/isolang/isolang.tables";
import { decodeBrowserFontFamily } from "./font-family";
import { getCssFontFaceSources } from "./css-font-source";
import { readBrowserFontFaceSource } from "./font-face-source";
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
export interface BrowserLocalFontData {
  readonly family: string;
  readonly fullName?: string;
  readonly postscriptName?: string;
  readonly style?: string;
  readonly blob?: () => Promise<Blob>;
}
/** Actual registered face or approved local-font record; browser metadata is retained without inventing native physical metrics. */
export type BrowserPhysicalFont =
  | Readonly<{ kind: "registered"; family: string; face: FontFace; sourceUrl?: string }>
  | Readonly<{ kind: "local"; family: string; data: BrowserLocalFontData }>;

/** Reads bytes only from an actual source: an owned FontFace constructor buffer or approved Local Font Access blob. @param font - Real physical record. @returns Source bytes or undefined when the platform exposes names only. */
export async function readBrowserPhysicalFont(
  font: BrowserPhysicalFont,
): Promise<ArrayBuffer | undefined> {
  if (font.kind === "registered") {
    const owned = readBrowserFontFaceSource(font.face);
    if (owned !== undefined || font.sourceUrl === undefined) return owned;
    await font.face.load();
    const response = await fetch(font.sourceUrl, { credentials: "same-origin" });
    if (!response.ok) throw new Error(`Font source read failed: ${response.status}`);
    return response.arrayBuffer();
  }
  const blob = await font.data.blob?.();
  return blob?.arrayBuffer();
}
/** Local Font Access API signature kept optional for unsupported browsers. */
type LocalFontQuery = () => Promise<readonly BrowserLocalFontData[]>;

/** Ordered, deduplicated font-family list populated from the active output device. */
export class FontList {
  /** Creates a font list from normalized names. @param names - Ordered unique families. @param faces - Actual registered or approved local records. @returns Nothing. */
  public constructor(
    private readonly names: readonly string[],
    private readonly faces: readonly BrowserPhysicalFont[] = [],
  ) {}
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
  /** Browser-only physical inventory; native face selection remains the caller's responsibility. Missing fallback names do not acquire fictitious physical records. @param family - Actual family name. @returns Registered/local faces in their original enumeration order. */
  public GetBrowserFaces(family: string): readonly BrowserPhysicalFont[] {
    const key = lower(family);
    return this.faces.filter(
      /** Groups actual records by native ASCII-only folded family identity. @param face - Actual face. @returns Match. */
      (face) => lower(face.family) === key,
    );
  }
  /** Queries Local Font Access and falls back offline. @param window_ - Browser boundary. @returns Populated list. */
  public static async FromBrowser(window_: Window = window): Promise<FontList> {
    const query = (window_ as Window & { queryLocalFonts?: LocalFontQuery }).queryLocalFonts;
    const registered: string[] = [];
    const cssFaces: FontFace[] = [];
    const faces: BrowserPhysicalFont[] = [];
    window_.document?.fonts?.forEach(
      /** Includes actual bundled and document FontFaces even when system enumeration is unavailable. @param face - Registered browser face. @returns Nothing. */
      (face) => {
        cssFaces.push(face);
        const family = decodeBrowserFontFamily(face.family);
        if (face.status !== "error" && family !== "") {
          registered.push(family);
          faces.push({ kind: "registered", family, face });
        }
      },
    );
    let local: readonly BrowserLocalFontData[] = [];
    if (query !== undefined)
      try {
        local = await query.call(window_);
      } catch {
        local = [];
      }
    for (const data of local)
      if (data.family !== "") faces.push({ kind: "local", family: data.family, data });
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
      const key = lower(name);
      if (!families.has(key)) families.set(key, name);
    }
    const names = [...families.keys()].sort().map(
      /** Uses native UTF16 ordering of the ASCII-folded keys, retaining actual family spelling. @param key - Existing family key. @returns Registered name. */
      (key) => families.get(key) as string,
    );
    const sources =
      window_.document?.styleSheets === undefined
        ? new Map<FontFace, string>()
        : getCssFontFaceSources(window_.document, cssFaces);
    return new FontList(
      names,
      faces.map(
        /** Associates only source URLs established by actual unambiguous CSSOM descriptors. @param font - Physical record. @returns Source-bearing record or original opaque record. */
        (font) => {
          const sourceUrl = font.kind === "registered" ? sources.get(font.face) : undefined;
          return sourceUrl === undefined ? font : { ...font, sourceUrl };
        },
      ),
    );
  }
}
