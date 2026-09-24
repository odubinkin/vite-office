/** @fileoverview Implements LibreOffice's document font-face auto-style pool. */

import { escapeXml } from "../text/txtparae";
import type { OdfEmbeddedFont } from "./XMLFontStylesContext";

/** Quotes one semicolon-separated model family list as an ODF SVG family list. @param familyName - Model family list. @returns ODF value. */
function exportFamilyName(familyName: string): string {
  return familyName
    .split(";")
    .map(
      /** Normalizes one family. @param family - Family segment. @returns ODF family. */ (family) =>
        family.trim(),
    )
    .filter(
      /** Removes empty families. @param family - Family. @returns Whether non-empty. */ (family) =>
        family.length > 0,
    )
    .map(
      /** Quotes families containing ODF separators. @param family - Family. @returns Quoted family. */ (
        family,
      ) => (/[ ,]/.test(family) ? `'${family}'` : family),
    )
    .join(", ");
}

/** Deduplicates fonts and assigns the same stable face names as XMLFontAutoStylePool. */
export class XMLFontAutoStylePool {
  private readonly families = new Map<string, string>();
  private readonly names = new Set<string>();
  private readonly embedded = new Map<string, OdfEmbeddedFont[]>();

  /** Registers or finds a font family. @param familyName - Semicolon-separated model family. @returns Font-face name. */
  public Add(familyName: string): string {
    const existing = this.families.get(familyName);
    if (existing !== undefined) return existing;
    const first = familyName.split(";", 1)[0]?.trim() || "F";
    let name = first;
    for (let suffix = 1; this.names.has(name); suffix += 1) name = `${first}${suffix}`;
    this.families.set(familyName, name);
    this.names.add(name);
    return name;
  }

  /** Finds a previously registered family. @param familyName - Model family. @returns Face name or undefined. */
  public Find(familyName: string): string | undefined {
    return this.families.get(familyName);
  }

  /** Associates a package font URI with its family face. @param font - Validated document resource. @returns Nothing. */
  public AddEmbedded(font: OdfEmbeddedFont): void {
    this.Add(font.familyName);
    const entries = this.embedded.get(font.familyName) ?? [];
    if (
      !entries.some(
        /** Avoids duplicate styles/content declarations. @param entry - Existing resource. @returns Match. */
        (entry) => entry.path === font.path,
      )
    )
      entries.push(font);
    this.embedded.set(font.familyName, entries);
  }

  /** Emits office:font-face-decls in registration order. @returns XML fragment. */
  public exportXML(): string {
    const faces = [...this.families].map(
      /** Emits one font-face. @param entry - Family and face name. @returns XML. */ ([
        family,
        name,
      ]) => {
        const resources = this.embedded.get(family) ?? [];
        const sources = resources
          .map(
            /** Emits an upstream-shaped font-face-uri and format. @param font - Package resource. @returns XML URI. */
            (font) =>
              `<svg:font-face-uri xlink:href="${escapeXml(font.path)}" xlink:type="simple" fo:font-weight="${font.weight}" fo:font-style="${font.style}"><svg:font-face-format svg:string="${escapeXml(font.format)}"/></svg:font-face-uri>`,
          )
          .join("");
        const opening = `<style:font-face style:name="${escapeXml(name)}" svg:font-family="${escapeXml(exportFamilyName(family))}"`;
        return sources.length === 0
          ? `${opening}/>`
          : `${opening}><svg:font-face-src>${sources}</svg:font-face-src></style:font-face>`;
      },
    );
    return `<office:font-face-decls>${faces.join("")}</office:font-face-decls>`;
  }
}
