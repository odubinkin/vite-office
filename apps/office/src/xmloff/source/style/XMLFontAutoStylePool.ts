/** @fileoverview Implements LibreOffice's document font-face auto-style pool. */

import { escapeXml } from "../text/txtparae";

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

  /** Emits office:font-face-decls in registration order. @returns XML fragment. */
  public exportXML(): string {
    const faces = [...this.families].map(
      /** Emits one font-face. @param entry - Family and face name. @returns XML. */ ([
        family,
        name,
      ]) =>
        `<style:font-face style:name="${escapeXml(name)}" svg:font-family="${escapeXml(exportFamilyName(family))}"/>`,
    );
    return `<office:font-face-decls>${faces.join("")}</office:font-face-decls>`;
  }
}
