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
