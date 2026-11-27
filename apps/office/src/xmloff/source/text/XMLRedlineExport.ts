/** @fileoverview Native Writer ODF tracked-change and inline marker serialization. */
import type { DateTime } from "../../../offapi/com/sun/star/util/DateTime";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { Converter } from "../../../sax/source/tools/converter";
import type { XMLRedlineKind } from "./XMLChangedRegionImportContext";

/** Original zero-width start, end or collapsed change marker. */
export interface XMLRedlineExportMarker {
  readonly kind: "change" | "change-start" | "change-end";
  readonly offset: number;
  readonly id: string;
}

/** Native change metadata exposed by the application. */
export interface XMLRedlineChange {
  readonly type: XMLRedlineKind;
  readonly author: string;
  readonly date: DateTime;
  readonly comment: string;
  readonly movedId: number;
  readonly styleName: string;
  readonly deletion?: string;
}

/** One original changed-region with its exposed change layers. */
export interface XMLRedlineRegion {
  readonly id: string;
  readonly mergeLastParagraph: boolean;
  readonly changes: readonly XMLRedlineChange[];
}

/** Writes the original change marker in text-portion order. @param marker - Actual range endpoint. @param escape - XML attribute escaping. @returns ODF markup. */
export function exportRedlineMarker(
  marker: XMLRedlineExportMarker,
  escape: (value: string) => string,
): string {
  return `<text:${marker.kind} text:change-id="${escape(marker.id)}"/>`;
}

/** Writes the original body-level change list, including full midnight timestamps. @param regions - Native changed ranges. @param recording - Current document tracking flag. @param escape - XML escaping. @returns Tracked changes markup. */
export function exportTrackedChanges(
  regions: readonly XMLRedlineRegion[],
  recording: boolean,
  escape: (value: string) => string,
): string {
  if (!regions.length && !recording) return "";
  const track = recording === Boolean(regions.length) ? "" : ` text:track-changes="${recording}"`;
  let result = `<text:tracked-changes${track}>`;
  for (const region of regions) {
    const id = escape(region.id);
    const merge = region.mergeLastParagraph ? "" : ' text:merge-last-paragraph="false"';
    result += `<text:changed-region xml:id="${id}" text:id="${id}"${merge}>`;
    for (const change of region.changes) {
      const style = change.styleName ? ` loext:style-name="${escape(change.styleName)}"` : "";
      const author = change.author ? `<dc:creator>${escape(change.author)}</dc:creator>` : "";
      const moved = change.movedId > 1 ? `<loext:move-id>${change.movedId}</loext:move-id>` : "";
      const buffer = new OUStringBuffer();
      let timestamp: string;
      try {
        Converter.convertDateTime(buffer, change.date, null, true);
        const value = buffer.makeStringAndClear();
        try {
          timestamp = text(value);
        } finally {
          value.dispose();
        }
      } finally {
        buffer.dispose();
      }
      let comment = "";
      if (change.comment)
        for (const paragraph of change.comment.split("\n"))
          comment += `<text:p>${escape(paragraph)}</text:p>`;
      result += `<text:${change.type}${style}><office:change-info>${author}${moved}<dc:date>${escape(timestamp)}</dc:date>${comment}</office:change-info>${change.deletion ?? ""}</text:${change.type}>`;
    }
    result += "</text:changed-region>";
  }
  return result + "</text:tracked-changes>";
}
