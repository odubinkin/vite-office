/** @fileoverview Keeps Calc's native note and person state across the ODS Worker boundary. */
import { ScAddress } from "../../../inc/address";
import {
  ScPostIt,
  ScThreadedCommentData,
  ScThreadedCommentEntry,
  type NoteEntry,
  type ScPersonData,
} from "../../../inc/postit";
import { createCellEditText } from "../../../source/filter/xml/xmlcelli.edit";
import type { ScXMLImport } from "../../../source/filter/xml/xmlimprt";
import type {
  CellTextParagraph,
  CellTextStylePool,
} from "../../../source/filter/xml/xmlexprt.celltext";

/** Lexical root or reply metadata. */
type ThreadEntry = readonly [guid: string, personId: string, dateTime: string, text: string];
/** Root, resolved flag and ordered replies of the native note extension. */
type Thread = readonly [root: ThreadEntry, resolved: boolean, replies: readonly ThreadEntry[]];

/** Compatible version-one cell note with optional thread metadata. */
export type CalcCellNoteRecord = readonly [
  col: number,
  row: number,
  author: string,
  date: string,
  shown: boolean,
  text: string | readonly CellTextParagraph[],
  thread?: Thread,
];

/** Serialized native document person. */
export type CalcPersonRecord = readonly [
  id: string,
  displayName: string,
  userId: string,
  providerId: string,
];

/** Copies the original lexical fields from a comment entry. @param entry - Original entry. @returns Cloneable value. */
function encodeThreadEntry(entry: ScThreadedCommentEntry): ThreadEntry {
  return [entry.maGuid, entry.maPersonId, entry.maDateTime, entry.maText];
}

/** Encodes an independent Calc note, including a note on an otherwise empty cell. @param entry - Native note with address. @param styles - Shared EditEngine style pool. @returns Cloneable note. */
export function encodeCalcCellNote(
  entry: NoteEntry,
  styles: CellTextStylePool,
): CalcCellNoteRecord {
  const { maPos, mpNote } = entry;
  const edit = mpNote.GetEditTextObject();
  const base = [
    maPos.Col(),
    maPos.Row(),
    mpNote.GetAuthor(),
    mpNote.GetDate(),
    mpNote.IsCaptionShown(),
    edit ? styles.collect(edit) : mpNote.GetText(),
  ] as const;
  const data = mpNote.GetThreadedCommentData();
  return data
    ? [
        ...base,
        [encodeThreadEntry(data.maRoot), data.mbDone, data.maReplies.map(encodeThreadEntry)],
      ]
    : base;
}

/** Restores the original entry fields on an actual native owner. @param record - Wire entry. @param entry - Target entry. */
function decodeThreadEntry(record: ThreadEntry, entry: ScThreadedCommentEntry): void {
  if (
    !Array.isArray(record) ||
    record.length !== 4 ||
    !record.every(
      /** Checks each lexical field. @param value - Field. @returns Whether the field is a string. */
      (value) => typeof value === "string",
    )
  )
    throw new Error("Calc worker comment entry is invalid.");
  [entry.maGuid, entry.maPersonId, entry.maDateTime, entry.maText] = record;
}

/** Restores a version-one note into its owning cell column. @param importer - Transfer import owner. @param tab - Sheet. @param record - Wire note. */
export function decodeCalcCellNote(
  importer: ScXMLImport,
  tab: number,
  record: CalcCellNoteRecord,
): void {
  const [col, row, author, date, shown, value, metadata] = record;
  const document = importer.GetDocument();
  if (
    !document.ValidColRow(col, row) ||
    !Number.isInteger(col) ||
    !Number.isInteger(row) ||
    typeof author !== "string" ||
    typeof date !== "string" ||
    typeof shown !== "boolean" ||
    !(typeof value === "string" || Array.isArray(value))
  )
    throw new Error("Calc worker cell note is invalid.");

  let thread: ScThreadedCommentData | null = null;
  if (metadata !== undefined) {
    if (
      !Array.isArray(metadata) ||
      metadata.length !== 3 ||
      typeof metadata[1] !== "boolean" ||
      !Array.isArray(metadata[2])
    )
      throw new Error("Calc worker comment thread is invalid.");

    const [root, resolved, replies] = metadata;
    thread = new ScThreadedCommentData();
    decodeThreadEntry(root, thread.maRoot);
    thread.mbDone = resolved;
    for (const reply of replies) {
      const entry = new ScThreadedCommentEntry();
      decodeThreadEntry(reply, entry);
      thread.maReplies.push(entry);
    }
  }

  const note = new ScPostIt(
    shown,
    typeof value === "string" ? value : createCellEditText(importer, value),
  );
  note.SetAuthor(author);
  note.SetDate(date);
  note.SetThreadedCommentData(thread);
  document.SetNote(new ScAddress(col, row, tab), note);
}

/** Captures a source person independently of note positions. @param person - Native document person. @returns Cloneable person. */
export function encodeCalcPerson(person: ScPersonData): CalcPersonRecord {
  return [person.maId, person.maDisplayName, person.maUserId, person.maProviderId];
}

/** Validates a version-one person tuple. @param record - Wire person. @returns Native person data. */
export function decodeCalcPerson(record: CalcPersonRecord): ScPersonData {
  if (
    !Array.isArray(record) ||
    record.length !== 4 ||
    !record.every(
      /** Checks the lexical person fields. @param value - Field. @returns Whether the field is a string. */
      (value) => typeof value === "string",
    )
  )
    throw new Error("Calc worker comment person is invalid.");

  const [maId, maDisplayName, maUserId, maProviderId] = record;
  return { maId, maDisplayName, maUserId, maProviderId };
}
