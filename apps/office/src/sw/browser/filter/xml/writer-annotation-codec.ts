/** @fileoverview Connects Writer annotation fields and registered ranges across the existing graph transport. */
import { DateTime as UnoDateTime } from "../../../../offapi/com/sun/star/util/DateTime";
import { DateTime } from "../../../../tools/source/datetime/datetime";
import { SwFormatField } from "../../../inc/fmtfld";
import { CH_TXTATR_INWORD, RES_TXTATR_ANNOTATION } from "../../../inc/hintids";
import { SetAttrMode } from "../../../inc/swtypes";
import { SwTextField } from "../../../inc/txtfld";
import { SwPaM, SwPosition } from "../../../source/core/crsr/pam";
import type { SwDoc } from "../../../source/core/doc/doc";
import { SwPostItField, SwPostItFieldType } from "../../../source/core/fields/docufld";
import {
  decodeAnnotationText,
  encodeAnnotationText,
  type WriterAnnotationTextRecord,
} from "./writer-annotation-text-codec";
import type { SwTextNode } from "../../../source/core/txtnode/ndtxt";

import type { SwPostItFieldData } from "../../../source/core/fields/docufld";
import {
  createPostItText,
  insertPostItField,
  type AnnotationParagraphs,
} from "../../../source/filter/xml/xmlannotation";

/** Structured-cloneable annotation field at the original dummy character. */
export interface WriterAnnotationRecord {
  readonly nodeIndex: number;
  readonly offset: number;
  readonly start?: Readonly<{ nodeIndex: number; offset: number }>;
  readonly author: string;
  readonly initials: string;
  readonly text: string;
  readonly editText?: WriterAnnotationTextRecord;
  readonly name: string;
  readonly id: number;
  readonly resolved: boolean;
  readonly parentId: number;
  readonly paraId: number;
  readonly parentPostItId: number;
  readonly parentName: string;
  readonly date: readonly [number, number, number, number, number, number, number];
}

/** Encodes native note fields in canonical graph node order. @param document - Model whose nodes were serialized. @param owners - Transfer order. @returns Primitive annotation records. */
export function encodeAnnotations(
  document: SwDoc,
  owners: readonly SwTextNode[],
): WriterAnnotationRecord[] {
  const records: WriterAnnotationRecord[] = [];
  const marks = document.GetIDocumentMarkAccess();
  for (const [nodeIndex, node] of owners.entries()) {
    const hints = node.GetpSwpHints();
    if (!hints) continue;
    for (
      let index = hints.GetFirstPosSortedByWhichAndStart(RES_TXTATR_ANNOTATION);
      index < hints.Count();
      index++
    ) {
      const hint = hints.GetSortedByWhichAndStart(index);
      if (!(hint instanceof SwTextField)) break;
      const format = hint.GetAttr();
      const field = format.GetField();
      const { dateTime, ...data } = field.GetData();
      const start = marks.GetAnnotationMark(format)?.GetMarkStart();
      const editText = encodeAnnotationText(field.GetTextObject());
      records.push({
        author: data.author,
        initials: data.initials,
        text: data.text,
        ...(editText === undefined ? {} : { editText }),
        name: data.name,
        id: data.id ?? 0,
        resolved: data.resolved ?? false,
        parentId: data.parentId ?? 0,
        paraId: data.paraId ?? 0,
        parentPostItId: data.parentPostItId ?? 0,
        parentName: data.parentName ?? "",
        nodeIndex,
        offset: hint.GetStart(),
        ...(start
          ? {
              start: {
                nodeIndex: owners.indexOf(start.GetNode() as SwTextNode),
                offset: start.GetContentIndex(),
              },
            }
          : {}),
        date: [
          dateTime.GetNanoSec(),
          dateTime.GetSec(),
          dateTime.GetMin(),
          dateTime.GetHour(),
          dateTime.GetDay(),
          dateTime.GetMonth(),
          dateTime.GetYear(),
        ],
      });
    }
  }
  return records;
}

/** Rebinds native note fields after the canonical body and text sections are restored. @param document - Destination model. @param owners - Already restored text owners. @param records - Optional annotation records from a current or legacy graph. @returns Nothing. */
export function restoreAnnotations(
  document: SwDoc,
  owners: readonly SwTextNode[],
  records: readonly WriterAnnotationRecord[] | undefined,
): void {
  if (records === undefined) return;
  if (!Array.isArray(records)) throw new Error("Stored Writer annotations are invalid.");
  for (const record of records as readonly WriterAnnotationRecord[]) {
    const node = owners[record?.nodeIndex];
    if (
      !node ||
      !Number.isInteger(record.offset) ||
      node.GetText().charAt(record.offset) !== CH_TXTATR_INWORD ||
      !Array.isArray(record.date) ||
      record.date.length !== 7 ||
      !record.date.every(Number.isInteger) ||
      ![record.author, record.initials, record.text, record.name, record.parentName].every(
        /** Validates the native string payload. @param value - Candidate value. @returns Whether string. */ (
          value,
        ) => typeof value === "string",
      ) ||
      typeof record.resolved !== "boolean" ||
      ![record.id, record.parentId, record.paraId, record.parentPostItId].every(Number.isInteger)
    )
      throw new Error("Stored Writer annotation is invalid.");
    const start = record.start;
    const first = start === undefined ? undefined : owners[start?.nodeIndex];
    if (
      start !== undefined &&
      (!first ||
        !Number.isInteger(start.offset) ||
        start.offset < 0 ||
        start.offset > first.Len() ||
        start.nodeIndex > record.nodeIndex ||
        (start.nodeIndex === record.nodeIndex && start.offset > record.offset))
    )
      throw new Error("Stored Writer annotation range is invalid.");

    const {
      date,
      author,
      initials,
      text,
      name,
      id,
      resolved,
      parentId,
      paraId,
      parentPostItId,
      parentName,
    } = record;
    const value = new SwPostItField(SwPostItFieldType.Get(document), {
      author,
      initials,
      text,
      name,
      id,
      resolved,
      parentId,
      paraId,
      parentPostItId,
      parentName,
      dateTime: new DateTime(
        new UnoDateTime(date[0], date[1], date[2], date[3], date[4], date[5], date[6], false),
      ),
    });
    let format: SwFormatField;
    try {
      if (record.editText !== undefined) {
        const editText = decodeAnnotationText(document.GetAttrPool(), record.editText);
        try {
          value.SetTextObject(editText);
        } finally {
          editText.dispose();
        }
      }
      format = new SwFormatField(value);
    } finally {
      value.Dispose();
    }
    if (!node.InsertHint(new SwTextField(format, record.offset), SetAttrMode.NOTXTATRCHR))
      throw new Error("Stored Writer annotation could not be attached.");
    if (first && start) {
      const begin = new SwPosition(first, start.offset);
      const end = new SwPosition(node, record.offset + 1);
      const range = new SwPaM(begin, end);
      try {
        document.GetIDocumentMarkAccess().MakeAnnotationMark(range, format);
      } finally {
        range.Dispose();
        begin.Dispose();
        end.Dispose();
      }
    }
  }
}

/** Scalar members in the original UNO date-time declaration order. */
type DateTimeRecord = readonly [number, number, number, number, number, number, number, boolean];

/** Detached field metadata and optional edit text, using the native text node's UTF-16 offset. */
export interface LegacyWriterAnnotationRecord {
  readonly offset: number;
  readonly data: Omit<SwPostItFieldData, "dateTime" | "textObject">;
  readonly dateTime: DateTimeRecord;
  readonly paragraphs?: AnnotationParagraphs;
}

/** Binds annotation fields to the existing markers restored with this paragraph's text. @param node - Owning paragraph. @param records - Detached field records. @returns Nothing. */
export function decodeLegacyAnnotations(
  node: SwTextNode,
  records: readonly LegacyWriterAnnotationRecord[],
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
