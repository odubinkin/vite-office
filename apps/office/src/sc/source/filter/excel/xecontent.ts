/** @fileoverview Original XLSX shared-string and merged-cell records. */
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { ZipFragmentStream } from "../../../../oox/source/helper/zipstorage";
import { getRelationship, Relationship } from "../../../../oox/source/token/relationship";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { ScRange } from "../../../inc/address";
import type { ScMergeAttr } from "../../../inc/attrib";
import type { ScDocument } from "../../../inc/document";
import { ATTR_MERGE } from "../../../inc/scitems";
import { XclXmlUtils, type XclExpXmlStream } from "./xestream";
import type { XclExpString } from "./xestring";
import type { XclExpFontBuffer } from "./xestyle.xml";
import { spreadsheetNamespace } from "../oox/workbookfragment";

const bucketCount = 2048;
const sstContentType = new TextEncoder().encode(
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml\0",
);

/** Workbook-wide original SST indices, counts and XML part. */
export class XclExpSst {
  private readonly maStringVector: XclExpString[] = [];
  private readonly maHashTab = new Map<number, number[]>();
  private mnTotal = 0;

  /** Inserts a new unique string in encounter order. @param value - Consumed source string. @returns SST index. */
  Insert(value: XclExpString): number {
    ++this.mnTotal;
    const hash = value.GetHash();
    const bucket = (hash ^ Math.trunc(hash / bucketCount)) % bucketCount;
    const references = this.maHashTab.get(bucket) ?? [];
    let first = 0;
    let last = references.length;
    while (first < last) {
      const position = Math.floor((first + last) / 2);
      const candidate = this.maStringVector[references[position] as number] as XclExpString;
      if (candidate.IsLessThan(value)) first = position + 1;
      else last = position;
    }
    const index = references[first];
    if (index !== undefined && (this.maStringVector[index] as XclExpString).IsEqual(value))
      return index;
    const inserted = this.maStringVector.length;
    this.maStringVector.push(value);
    references.splice(first, 0, inserted);
    this.maHashTab.set(bucket, references);
    return inserted;
  }

  /** Writes the source SST part and the relationship from the active workbook. @param stream - Actual XLSX exporter. @param fonts - Actual workbook fonts. @returns Nothing. */
  SaveXml(stream: XclExpXmlStream, fonts: XclExpFontBuffer): void {
    if (!this.maStringVector.length) return;
    const full = unicode("xl/sharedStrings.xml");
    const relative = unicode("sharedStrings.xml");
    const relationship = unicode(getRelationship(Relationship.SHAREDSTRINGS));
    try {
      const parent = stream.GetCurrentStream().getOutputStream() as ZipFragmentStream;
      const serializer = stream.CreateOutputStream(
        full,
        relative,
        parent,
        sstContentType,
        relationship,
      );
      stream.PushStream(serializer);
      try {
        const sst = token("sst"),
          item = token("si");
        serializer.startElement(
          sst,
          token("xmlns"),
          spreadsheetNamespace,
          token("count"),
          String(this.mnTotal),
          token("uniqueCount"),
          String(this.maStringVector.length),
        );
        for (const value of this.maStringVector) {
          serializer.startElement(item);
          value.WriteXml(stream, fonts);
          serializer.endElement(item);
        }
        serializer.endElement(sst);
        serializer.endDocument();
      } finally {
        stream.PopStream();
      }
    } finally {
      relationship.dispose();
      relative.dispose();
      full.dispose();
    }
  }
}

/** Owns the native merge records for the worksheet. */
export class XclExpMergedcells {
  private readonly ranges: ScRange[] = [];
  /** Collects ranges from real attribute runs, including otherwise empty merge anchors. @param document - Actual workbook. @param tab - Worksheet index. @returns Merged cells record. */
  constructor(
    private readonly document: ScDocument,
    tab: number,
  ) {
    const table = document.FetchTable(tab);
    if (!table) return;
    const first: [number] = [0],
      last: [number] = [0];
    for (let column = 0; column < table.GetAllocatedColumnsCount(); ++column) {
      const data = table.GetColumnData(column);
      for (let row = 0; row <= document.MaxRow(); row = last[0] + 1) {
        const pattern = data.GetPatternRange(first, last, row);
        if (!pattern) break;
        const merge = pattern.GetItem(ATTR_MERGE) as ScMergeAttr;
        if (!merge.IsMerged()) continue;
        for (let anchor = row; anchor <= last[0]; ++anchor)
          this.ranges.push(
            new ScRange(
              column,
              anchor,
              tab,
              column + merge.GetColMerge() - 1,
              anchor + merge.GetRowMerge() - 1,
              tab,
            ),
          );
      }
    }
    this.ranges.sort(
      /** Orders XML records in the worksheet's native row-major order. @param left - Range. @param right - Range. @returns Difference. */ (
        left,
        right,
      ) => left.aStart.Row() - right.aStart.Row() || left.aStart.Col() - right.aStart.Col(),
    );
  }
  /** Writes the original mergeCells record after sheet data. @param stream - Active XLSX export stream. @returns Nothing. */
  SaveXml(stream: XclExpXmlStream): void {
    if (!this.ranges.length) return;
    const serializer = stream.GetCurrentStream();
    const container = token("mergeCells");
    serializer.startElement(container, token("count"), String(this.ranges.length));
    for (const range of this.ranges)
      serializer.singleElement(
        token("mergeCell"),
        token("ref"),
        XclXmlUtils.ToOString(this.document, range, true),
      );
    serializer.endElement(container);
  }
}
