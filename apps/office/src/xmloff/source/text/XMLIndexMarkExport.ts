/** @fileoverview Original point and range index mark serialization from XMLIndexMarkExport.cxx. */
import type { XMLIndexMarkProperties } from "./XMLIndexMarkImportContext";

/** One native TOX portion in paragraph export order. */
export type XMLIndexMarkExportMarker =
  | Readonly<{ kind: "index-mark"; offset: number; mark: XMLIndexMarkProperties }>
  | Readonly<{ kind: "index-mark-start"; offset: number; id: string; mark: XMLIndexMarkProperties }>
  | Readonly<{
      kind: "index-mark-end";
      offset: number;
      id: string;
      family: XMLIndexMarkProperties["kind"];
    }>;

/** Writes the family-specific attributes on the original point and start portions. @param marker - Native index portion. @param escapeXml - Stream attribute escaper. @returns Serialized ODF element. */
export function exportIndexMark(
  marker: XMLIndexMarkExportMarker,
  escapeXml: (value: string) => string,
): string {
  if (marker.kind === "index-mark-end")
    return `<text:${marker.family}-mark-end text:id="${escapeXml(marker.id)}"/>`;

  const mark = marker.mark;
  const point = marker.kind === "index-mark";
  let attributes = point
    ? ` text:string-value="${escapeXml(mark.alternativeText)}"`
    : ` text:id="${escapeXml(marker.id)}"`;
  if (mark.kind === "alphabetical-index") {
    for (const [name, value] of [
      ["string-value-phonetic", mark.textReading],
      ["key1", mark.key1],
      ["key1-phonetic", mark.key1Reading],
      ["key2", mark.key2],
      ["key2-phonetic", mark.key2Reading],
    ])
      if (value && name) attributes += ` text:${name}="${escapeXml(value)}"`;
    if (mark.mainEntry) attributes += ' text:main-entry="true"';
  } else {
    if (mark.kind === "user-index" && mark.indexName)
      attributes += ` text:index-name="${escapeXml(mark.indexName)}"`;
    attributes += ` text:outline-level="${mark.level}"`;
  }
  return `<text:${mark.kind}-mark${point ? "" : "-start"}${attributes}/>`;
}
