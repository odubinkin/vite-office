/** @fileoverview Browser counterpart of LibreOffice `svtools/ctrltool.hxx` FontList. */

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
    let local: readonly LocalFontData[] = [];
    if (query !== undefined)
      try {
        local = await query.call(window_);
      } catch {
        local = [];
      }
    const names = [
      ...new Set([
        ...FALLBACK_FONT_FAMILIES,
        ...local
          .map(
            /** Projects a family. @param font - Local font. @returns Family. */ (font) =>
              font.family,
          )
          .filter(
            /** Removes blank families. @param family - Candidate. @returns Whether non-empty. */ Boolean,
          ),
      ]),
    ].sort(
      /** Sorts family names. @param left - First. @param right - Second. @returns Ordering. */ (
        left,
        right,
      ) => left.localeCompare(right, undefined, { sensitivity: "base" }),
    );
    return new FontList(names);
  }
}
