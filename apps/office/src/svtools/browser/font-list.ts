/** @fileoverview Browser FontList under its native svtools owner; VCL supplies physical source records and core ctrltool supplies native family lookup. */
import { lower } from "../../i18nlangtag/source/isolang/isolang.tables";
import { decodeBrowserFontFamily } from "../../vcl/browser/font-family";
import { getCssFontFaceSources } from "../../vcl/browser/css-font-source";
import type { BrowserPhysicalFont, BrowserLocalFontData } from "../../vcl/browser/font-list";
import type { ConstFont } from "../../vcl/source/font/font";
import type { rtl_TextEncoding } from "../../sal/inc/rtl/textenc";
import {
  insertFontListMetric,
  type FontListMetricEntry,
  findFontListFamily,
  makeFontListAliases,
  makeFontListSearchString,
} from "../source/control/ctrltool";
export {
  getBrowserFont,
  readBrowserPhysicalFont,
  readBrowserFontCapabilities,
  type BrowserPhysicalFont,
  type BrowserLocalFontData,
} from "../../vcl/browser/font-list";

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

/** Local Font Access API signature kept optional for unsupported browsers. */
type LocalFontQuery = () => Promise<readonly BrowserLocalFontData[]>;

/** Ordered, deduplicated font-family list populated from the active output device. */
export class FontList {
  private readonly physicalFamilies: ReadonlyMap<string, readonly BrowserPhysicalFont[]>;
  private readonly physicalKeys: readonly string[];
  private readonly aliases: ReadonlyMap<string, string>;
  /** Creates a font list from normalized names. @param names - Ordered unique families. @param faces - Actual registered or approved local records. @param aliases - Actual device-supplied family aliases; browser inventory supplies none unless explicitly exposed. @returns Nothing. */
  public constructor(
    private readonly names: readonly string[],
    faces: readonly BrowserPhysicalFont[] = [],
    aliases: Iterable<readonly [string, string]> = [],
  ) {
    const families = new Map<string, BrowserPhysicalFont[]>();
    for (const face of faces) {
      const key = makeFontListSearchString(face.family),
        existing = families.get(key);
      if (existing === undefined) families.set(key, [face]);
      else existing.push(face);
    }
    this.physicalFamilies = new Map(
      [...families].map(
        /** Retains immutable inventory rows in their actual device order. @param entry - Grouped physical family. @returns Immutable group. */ ([
          key,
          rows,
        ]) => [key, Object.freeze(rows)],
      ),
    );
    this.physicalKeys = [...families.keys()].sort();
    this.aliases = makeFontListAliases(aliases);
  }
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
  /** Browser-only physical inventory using source family/feature/one-hop device-alias lookup; native face selection remains caller-owned. Missing display fallback names acquire no physical records. @param family - Exact requested family expression. @returns Registered/local faces in their original enumeration order. */
  public GetBrowserFaces(family: string): readonly BrowserPhysicalFont[] {
    const key = findFontListFamily(this.physicalKeys, this.aliases, family);
    return key === undefined
      ? []
      : (this.physicalFamilies.get(key) as readonly BrowserPhysicalFont[]);
  }
  /** Resolves the original first family metric using actual caller-supplied physical metadata and encoding. Missing metadata leaves selection unknown rather than choosing an arbitrary inventory row. @param family - Requested family expression. @param metrics - Actual physical-face metrics. @param systemEncoding - Actual device encoding. @returns Source first metric/physical record,or unknown. */
  public GetBrowserPreviewMetric(
    family: string,
    metrics: ReadonlyMap<BrowserPhysicalFont, ConstFont>,
    systemEncoding: rtl_TextEncoding,
  ): FontListMetricEntry<BrowserPhysicalFont> | undefined {
    const rows: FontListMetricEntry<BrowserPhysicalFont>[] = [];
    for (const face of this.GetBrowserFaces(family)) {
      const metric = metrics.get(face);
      if (metric === undefined) return undefined;
      insertFontListMetric(rows, { metric, value: face }, systemEncoding);
    }
    return rows[0];
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
