/** @fileoverview Implements the bounded direct paragraph numbering attributes from pinned xmloff/source/style/styleexp.cxx. */
import { escapeXml } from "../text/txtparae";

/** Emits native direct style attributes for the existing ODF 1.3 slice. @param outlineLevel - Direct one-based outline level, including zero. @param numberingStyleName - Direct numbering style, including empty suppression. @returns Attribute XML with leading spaces. */
export function exportParagraphStyleNumberingAttributes(
  outlineLevel: number | undefined,
  numberingStyleName: string | undefined,
): string {
  let attributes = "";
  if (outlineLevel !== undefined)
    attributes += ` style:default-outline-level="${outlineLevel > 0 ? outlineLevel : ""}"`;
  if (numberingStyleName !== undefined && numberingStyleName !== "Outline")
    attributes += ` style:list-style-name="${escapeXml(numberingStyleName)}"`;
  return attributes;
}

/** Original XMLStyleExport::exportStyle name attributes after EncodeStyleName. @param programmaticName - Actual XStyle::getName result. @param encodedName - Actual encoded XML name. @returns Name plus conditional display-name attributes. */
export function exportStyleNameAttributes(programmaticName: string, encodedName: string): string {
  return ` style:name="${escapeXml(encodedName)}"${encodedName === programmaticName ? "" : ` style:display-name="${escapeXml(programmaticName)}"`}`;
}
