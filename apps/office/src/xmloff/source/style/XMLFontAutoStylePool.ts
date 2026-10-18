/** @fileoverview Native XMLFontAutoStylePool full font-value key, name allocation and declaration order; existing browser package font resources remain at their shared boundary. */
import { escapeXml } from "../text/txtparae";
import { exportFamilyName, type OdfEmbeddedFont } from "./XMLFontStylesContext";
import { FontFamily, FontPitch } from "../../../tools/inc/fontenum";
import {
  RTL_TEXTENCODING_DONTKNOW,
  RTL_TEXTENCODING_SYMBOL,
  type rtl_TextEncoding,
} from "../../../sal/inc/rtl/textenc";
import { getFontFamilyGeneric, getFontPitchGeneric } from "./fonthdl";
import { SortedVector } from "../../../o3tl/inc/sorted_vector";
/** Original XMLFontAutoStylePoolEntry_Impl value fields, with GC owning the entry rather than native unique_ptr. */
interface FontEntry {
  readonly name: string;
  readonly familyName: string;
  readonly styleName: string;
  readonly family: FontFamily;
  readonly pitch: FontPitch;
  readonly charSet: rtl_TextEncoding;
}
/** Original ordered-set equivalence: all non-symbol encodings compare equal, then pitch/family/UTF16 family/style. Native JS string comparison preserves code-unit order. @param a - Left entry. @param b - Right entry. @returns Native logical ordering. */
function compareEntries(a: FontEntry, b: FontEntry): number {
  const encoding =
    Number(a.charSet !== RTL_TEXTENCODING_SYMBOL) - Number(b.charSet !== RTL_TEXTENCODING_SYMBOL);
  if (encoding !== 0) return encoding;
  if (a.pitch !== b.pitch) return a.pitch - b.pitch;
  if (a.family !== b.family) return a.family - b.family;
  if (a.familyName !== b.familyName) return a.familyName < b.familyName ? -1 : 1;
  return a.styleName < b.styleName ? -1 : a.styleName > b.styleName ? 1 : 0;
}
/** Native OUString trim removes only leading/trailing UTF16 units at most ASCII space. @param value - Name prefix. @returns Trimmed prefix. */
function trimFontName(value: string): string {
  let start = 0;
  let end = value.length;
  while (start < end && value.charCodeAt(start) <= 32) ++start;
  while (end > start && value.charCodeAt(end - 1) <= 32) --end;
  return value.slice(start, end);
}
/** Actual native font-value pool; ordinary JS collection ownership replaces only C++ storage/lifetime mechanics. */
export class XMLFontAutoStylePool {
  private readonly entries = new SortedVector<FontEntry>(
    /** Original strict weak order over native font entry values. @param left - Left entry. @param right - Right entry. @returns Native less-than result. */
    (left, right) => compareEntries(left, right) < 0,
  );
  private readonly names = new Set<string>();
  private readonly embedded = new Map<string, OdfEmbeddedFont[]>();
  /** Original lookup uses comparator equality, not just family text or exact encoding identity. @param familyName - Family value. @param styleName - Style value. @param family - Family enum. @param pitch - Pitch enum. @param charSet - Encoding value. @returns Existing actual entry. */
  private findEntry(
    familyName: string,
    styleName: string,
    family: FontFamily,
    pitch: FontPitch,
    charSet: rtl_TextEncoding,
  ): FontEntry | undefined {
    const key = { name: "", familyName, styleName, family, pitch, charSet: charSet & 0xffff };
    return this.entries.at(this.entries.find(key));
  }
  /** Original full-value Add. New-entry return remains empty as in pinned source; actual name is available through Find. @param familyName - Family value. @param styleName - Style value. @param family - Family enum. @param pitch - Pitch enum. @param charSet - Encoding value. @returns Existing name or original empty result on first insertion. */
  public Add(
    familyName: string,
    styleName: string,
    family: FontFamily,
    pitch: FontPitch,
    charSet: rtl_TextEncoding,
  ): string {
    const existing = this.findEntry(familyName, styleName, family, pitch, charSet);
    if (existing !== undefined) return existing.name;
    const semicolon = familyName.indexOf(";");
    let name =
      semicolon === -1
        ? familyName
        : semicolon > 0
          ? trimFontName(familyName.slice(0, semicolon))
          : "";
    if (name.length === 0) name = "F";
    if (this.names.has(name)) {
      const prefix = name;
      let count = 1;
      name = prefix + count;
      while (this.names.has(name)) name = prefix + ++count;
    }
    this.entries.insert({ name, familyName, styleName, family, pitch, charSet: charSet & 0xffff });
    this.names.add(name);
    return "";
  }
  /** Original Find returns empty on absence. @param familyName - Family value. @param styleName - Style value. @param family - Family enum. @param pitch - Pitch enum. @param charSet - Encoding value. @returns Existing name or empty. */
  public Find(
    familyName: string,
    styleName: string,
    family: FontFamily,
    pitch: FontPitch,
    charSet: rtl_TextEncoding,
  ): string {
    return this.findEntry(familyName, styleName, family, pitch, charSet)?.name ?? "";
  }
  /** Existing package-resource boundary associates a validated URI with its actual model family. @param font - Validated document resource. @returns Nothing. */
  public AddEmbedded(font: OdfEmbeddedFont): void {
    this.Add(
      font.familyName,
      "",
      FontFamily.FAMILY_DONTKNOW,
      FontPitch.PITCH_DONTKNOW,
      RTL_TEXTENCODING_DONTKNOW,
    );
    const entries = this.embedded.get(font.familyName) ?? [];
    if (
      !entries.some(
        /** Detects an already registered resource URI. @param entry - Existing resource. @returns URI equality. */ (
          entry,
        ) => entry.path === font.path,
      )
    )
      entries.push(font);
    this.embedded.set(font.familyName, entries);
  }
  /** Emits native comparator-ordered font-face declarations and supported browser package resources. @returns XML fragment. */
  public exportXML(): string {
    const faces = [...this.entries].map(
      /** Exports a native ordered declaration. @param entry - Font value. @returns Font-face XML. */ (
        entry,
      ) => {
        const { name, familyName, styleName, family, pitch, charSet } = entry,
          generic = getFontFamilyGeneric(family),
          pitchName = getFontPitchGeneric(pitch),
          resources = this.embedded.get(familyName) ?? [];
        const sources = resources
          .map(
            /** Exports the existing validated package resource. @param font - Resource. @returns URI XML. */
            (font) =>
              `<svg:font-face-uri xlink:href="${escapeXml(font.path)}" xlink:type="simple" loext:font-style="${font.style}" loext:font-weight="${font.weight}"><svg:font-face-format svg:string="${escapeXml(font.format)}"/></svg:font-face-uri>`,
          )
          .join("");
        const opening = `<style:font-face style:name="${escapeXml(name)}" svg:font-family="${escapeXml(exportFamilyName(familyName))}"${styleName.length === 0 ? "" : ` style:font-adornments="${escapeXml(styleName)}"`}${generic === undefined ? "" : ` style:font-family-generic="${escapeXml(generic)}"`}${pitchName === undefined ? "" : ` style:font-pitch="${pitchName}"`}${charSet === RTL_TEXTENCODING_SYMBOL ? ' style:font-charset="x-symbol"' : ""}`;
        return sources.length === 0
          ? `${opening}/>`
          : `${opening}><svg:font-face-src>${sources}</svg:font-face-src></style:font-face>`;
      },
    );
    return `<office:font-face-decls>${faces.join("")}</office:font-face-decls>`;
  }
}
