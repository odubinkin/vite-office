/** @fileoverview Calc note metadata and lazy caption text from sc/source/core/data/postit.cxx. */
import type { EditTextObject } from "../../../../editeng/inc/editobj";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { OUStringBuffer } from "../../../../sal/inc/rtl/ustrbuf";
import { Converter } from "../../../../sax/source/tools/converter";
import { DateTime } from "../../../../tools/source/datetime/datetime";
import type { ScAddress } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";

/** Native root or reply entry in a threaded cell comment. */
export class ScThreadedCommentEntry {
  maGuid = "";
  maPersonId = "";
  maDateTime = "";
  maText = "";
}

/** Thread metadata attached to a note independently of its classic caption. */
export class ScThreadedCommentData {
  readonly maRoot = new ScThreadedCommentEntry();
  readonly maReplies: ScThreadedCommentEntry[] = [];
  mbDone = false;
}

/** Document person referenced by the thread's root or reply. */
export interface ScPersonData {
  readonly maId: string;
  readonly maDisplayName: string;
  readonly maUserId: string;
  readonly maProviderId: string;
}

/** Initial caption content kept by the note before a drawing object is needed. */
class ScCaptionInitData {
  mxEditTextObject: EditTextObject | null;
  maSimpleText: string;

  /** Initializes the native simple or rich caption content. @param text - Owned caption contents. @returns The initialized ScCaptionInitData instance. */
  constructor(text: string | EditTextObject) {
    this.mxEditTextObject = typeof text === "string" ? null : text;
    this.maSimpleText = typeof text === "string" ? text : "";
  }
}

/** Native note metadata and separately owned lazy caption contents. */
class ScNoteData {
  maDate = "";
  maAuthor = "";
  readonly mxInitData: ScCaptionInitData;

  /** Initializes source note data. @param mbShown - Caption visibility. @param caption - Owned caption contents. @returns The initialized ScNoteData instance. */
  constructor(
    readonly mbShown: boolean,
    caption: string | EditTextObject,
  ) {
    this.mxInitData = new ScCaptionInitData(caption);
  }
}

/** Cell note, an independent owner from cell values and cell formatting. */
export class ScPostIt {
  private static mnLastPostItId = 1;
  private readonly maNoteData: ScNoteData;
  private readonly mnPostItId: number;
  private mpThreadedCommentData: ScThreadedCommentData | null = null;

  /** Initializes a new Calc note and its stamp. @param shown - Initial caption visibility. @param caption - Owned caption contents. @param id - Explicit note identity, or zero to allocate. @returns The initialized ScPostIt instance. */
  constructor(shown = false, caption: string | EditTextObject = "", id = 0) {
    this.mnPostItId = id || ScPostIt.mnLastPostItId++;
    this.maNoteData = new ScNoteData(shown, caption);
    this.AutoStamp();
  }

  /** Stamps the native creation date and default author. @param create - Set the creation date. @returns Nothing. */
  AutoStamp(create = true): void {
    if (create) this.StampDate();
    if (!this.maNoteData.maAuthor) this.maNoteData.maAuthor = "Unknown Author";
  }

  /** Formats the represented creation stamp with the shared ODF converter. @returns Nothing. */
  private StampDate(): void {
    const buffer = new OUStringBuffer();
    try {
      Converter.convertDateTime(buffer, new DateTime(DateTime.SYSTEM).GetUNODateTime(), null);
      const stamp = buffer.makeStringAndClear();
      try {
        this.maNoteData.maDate = text(stamp);
      } finally {
        stamp.dispose();
      }
    } finally {
      buffer.dispose();
    }
  }

  /** Returns the native session note identity. @returns Note identity. */
  GetId(): number {
    return this.mnPostItId;
  }

  /** Returns the note's creation stamp. @returns Date text. */
  GetDate(): string {
    return this.maNoteData.maDate;
  }

  /** Updates the creation stamp. @param date - Date text. @returns Nothing. */
  SetDate(date: string): void {
    this.maNoteData.maDate = date;
  }

  /** Returns the note author. @returns Author. */
  GetAuthor(): string {
    return this.maNoteData.maAuthor;
  }

  /** Updates the note author. @param author - Author. @returns Nothing. */
  SetAuthor(author: string): void {
    this.maNoteData.maAuthor = author;
  }

  /** Returns the native requested caption visibility. @returns Whether the caption is visible. */
  IsCaptionShown(): boolean {
    return this.maNoteData.mbShown;
  }

  /** Borrows the lazy rich text object. @returns Edit text, if present. */
  GetEditTextObject(): EditTextObject | null {
    return this.maNoteData.mxInitData.mxEditTextObject;
  }

  /** Reads the simple or rich note text. @returns Plain text. */
  GetText(): string {
    const edit = this.GetEditTextObject();
    if (!edit) return this.maNoteData.mxInitData.maSimpleText;
    const value = edit.GetText();
    try {
      return text(value);
    } finally {
      value.dispose();
    }
  }

  /** Replaces the entire caption with plain text. @param position - Cell address. @param value - Note text. @returns Nothing. */
  SetText(position: ScAddress, value: string): void {
    void position;
    const init = this.maNoteData.mxInitData;
    init.mxEditTextObject?.dispose();
    init.mxEditTextObject = null;
    init.maSimpleText = value;
  }

  /** Indicates whether this note has been resolved. @returns Resolved state. */
  IsResolved(): boolean {
    return this.mpThreadedCommentData?.mbDone ?? false;
  }

  /** Applies the native resolved flag and initializes thread state if absent. @param resolved - Resolved state. @returns Nothing. */
  SetResolved(resolved: boolean): void {
    (this.mpThreadedCommentData ??= new ScThreadedCommentData()).mbDone = resolved;
  }

  /** Borrows the native thread metadata. @returns Thread metadata or null. */
  GetThreadedCommentData(): ScThreadedCommentData | null {
    return this.mpThreadedCommentData;
  }

  /** Replaces the note's owned thread metadata. @param data - Thread metadata or null. @returns Nothing. */
  SetThreadedCommentData(data: ScThreadedCommentData | null): void {
    this.mpThreadedCommentData = data;
  }

  /** Releases the native edit payload when the note leaves storage. @returns Nothing. */
  Dispose(): void {
    const init = this.maNoteData.mxInitData;
    init.mxEditTextObject?.dispose();
    init.mxEditTextObject = null;
    this.mpThreadedCommentData = null;
  }
}

/** Native ScNoteUtil insertion entry points for represented caption contents. */
export const ScNoteUtil = {
  /** Creates a note only when plain source text exists. @param document - Owner. @param position - Cell address. @param value - Note text. @param shown - Caption visibility. @returns Stored note or null. */
  CreateNoteFromString(
    document: ScDocument,
    position: ScAddress,
    value: string,
    shown: boolean,
  ): ScPostIt | null {
    if (
      !value ||
      !document.ValidColRow(position.Col(), position.Row()) ||
      !document.FetchTable(position.Tab())
    )
      return null;
    const note = new ScPostIt(shown, value);
    document.SetNote(position, note);
    return note;
  },
  /** Creates a note from represented drawing text data. @param document - Owner. @param position - Cell address. @param value - Owned EditEngine text. @param shown - Caption visibility. @returns Stored note. */
  CreateNoteFromObjectData(
    document: ScDocument,
    position: ScAddress,
    value: EditTextObject,
    shown: boolean,
  ): ScPostIt {
    const note = new ScPostIt(shown, value);
    document.SetNote(position, note);
    return note;
  },
};

/** Borrowed note and its position from the native note store. */
export class NoteEntry {
  /** Associates a note with its column-owned address. @param maPos - Cell address. @param mpNote - Borrowed note. @returns The initialized NoteEntry instance. */
  constructor(
    readonly maPos: ScAddress,
    readonly mpNote: ScPostIt,
  ) {}
}
