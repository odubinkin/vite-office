/** @fileoverview Owns the existing bounded list label-alignment serialization at the pinned xmlnume.cxx numbering export boundary; wider contracts remain unverified. */

import type { OdfListLevelLayout } from "../text/txtparae";

/** Emits non-default label-alignment geometry under its ODF list level. @param layout - Writer geometry. @param level - Zero-based level. @param exportLength - Existing Writer length converter. @returns XML child or empty string. */
export function exportListLevelLayout(
  layout: OdfListLevelLayout | undefined,
  level: number,
  exportLength: (twips: number) => string,
): string {
  if (layout === undefined) return "";
  const defaultIndent = 720 + level * 360;
  if (
    (layout.firstLineIndent ?? -360) === -360 &&
    (layout.indentAt ?? defaultIndent) === defaultIndent &&
    (layout.labelFollowedBy ?? "listtab") === "listtab" &&
    (layout.listTabPosition ?? defaultIndent) === defaultIndent
  )
    return "";
  const attributes = [
    `text:label-followed-by="${layout.labelFollowedBy ?? "listtab"}"`,
    `text:list-tab-stop-position="${exportLength(layout.listTabPosition ?? defaultIndent)}"`,
    `fo:text-indent="${exportLength(layout.firstLineIndent ?? -360)}"`,
    `fo:margin-left="${exportLength(layout.indentAt ?? defaultIndent)}"`,
  ].join(" ");
  return `<style:list-level-properties><style:list-level-label-alignment ${attributes}/></style:list-level-properties>`;
}
