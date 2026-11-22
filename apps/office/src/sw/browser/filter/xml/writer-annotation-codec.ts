/** @fileoverview Structured-clone transfer of Writer annotation point anchors. */
import { DateTime } from "../../../../tools/source/datetime/datetime";
import { DateTime as UnoDateTime } from "../../../../offapi/com/sun/star/util/DateTime";
import type { XMLAnnotation } from "../../../../xmloff/source/text/txtfldi";
import type { SwTextNode } from "../../../source/core/txtnode/ndtxt";
import type { SwPostItFieldData } from "../../../source/core/fields/docufld";
import {
  createPostItText,
  getPostItFields,
  insertPostItField,
  projectPostItText,
} from "../../../source/filter/xml/xmlannotation";

/** Scalar members in the original UNO date-time declaration order. */
type DateTimeRecord = readonly [number, number, number, number, number, number, number, boolean];

/** Detached field metadata and optional edit text, using the native text node's UTF-16 offset. */
export interface WriterAnnotationRecord {
  readonly offset: number;
  readonly data: Omit<SwPostItFieldData, "dateTime" | "textObject">;
  readonly dateTime: DateTimeRecord;
  readonly paragraphs?: XMLAnnotation["paragraphs"];
}

/** Collects real point hints independently of the ranged formatting graph. @param node - Owning paragraph. @returns Cloneable annotation records. */
export function encodeAnnotations(node: SwTextNode): WriterAnnotationRecord[] {
  return Array.from(
    getPostItFields(node),
    /** Snapshots the detached field and its optional edit text. @param hint - Native text hint. @returns Field record. */
    (hint) => {
      const field = hint.GetAttr().GetField();
      const { dateTime, ...data } = field.GetData();
      const rich = field.GetTextObject();
      const date = dateTime.GetUNODateTime();
      return {
        offset: hint.GetStart(),
        data,
        dateTime: [
          date.NanoSeconds,
          date.Seconds,
          date.Minutes,
          date.Hours,
          date.Day,
          date.Month,
          date.Year,
          date.IsUTC,
        ],
        ...(rich ? { paragraphs: projectPostItText(node.GetDoc(), rich) } : {}),
      };
    },
  );
}

/** Binds annotation fields to the existing markers restored with this paragraph's text. @param node - Owning paragraph. @param records - Detached field records. @returns Nothing. */
export function decodeAnnotations(
  node: SwTextNode,
  records: readonly WriterAnnotationRecord[],
): void {
  for (const record of records) {
    const rich = record.paragraphs ? createPostItText(record.paragraphs) : undefined;
    try {
      insertPostItField(
        node,
        record.offset,
        {
          ...record.data,
          dateTime: new DateTime(new UnoDateTime(...record.dateTime)),
          ...(rich ? { textObject: rich } : {}),
        },
        true,
      );
    } finally {
      rich?.dispose();
    }
  }
}
