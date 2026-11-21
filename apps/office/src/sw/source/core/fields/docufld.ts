/** @fileoverview Native document annotation field values retained by Writer text hints. */
import type { SwFormatField } from "../../../inc/fmtfld";
import { RES_TXTATR_ANNOTATION } from "../../../inc/hintids";
import { SwTextField } from "../../../inc/txtfld";
import type { SwDoc } from "../doc/doc";
import type { EditTextObject } from "../../../../editeng/source/editeng/editobj";
import { DateTime } from "../../../../tools/source/datetime/datetime";

let nextPostItId = 1;

/** Original annotation field type carries the document that owns the fields. */
export class SwPostItFieldType {
  private static readonly types = new WeakMap<SwDoc, SwPostItFieldType>();

  /** Finds the document's system annotation field type. @param document - Owning document. @returns Canonical field type. */
  static Get(document: SwDoc): SwPostItFieldType {
    let type = this.types.get(document);
    if (!type) {
      type = new SwPostItFieldType(document);
      this.types.set(document, type);
    }
    return type;
  }

  /** Associates the annotation type with one Writer document. @param document - Owning document. @returns Field type. */
  private constructor(private readonly document: SwDoc) {}

  /** Enumerates live format owners in model order. @returns Annotation formats. */
  *GatherFields(): IterableIterator<SwFormatField> {
    for (const node of this.document.GetNodes().entries()) {
      const hints = node.GetTextNode()?.GetpSwpHints();
      if (!hints) continue;
      for (
        let index = hints.GetFirstPosSortedByWhichAndStart(RES_TXTATR_ANNOTATION);
        index < hints.Count();
        index++
      ) {
        const hint = hints.GetSortedByWhichAndStart(index);
        if (!(hint instanceof SwTextField)) break;
        yield hint.GetAttr();
      }
    }
  }

  /** Resolves an annotation restored by document history. @param id - Retained field identifier. @returns Live annotation value. */
  FindField(id: number): SwPostItField | undefined {
    return this.FindFormat(id)?.GetField();
  }

  /** Resolves the attached format after undo has recreated it. @param id - Retained field identifier. @returns Live annotation format. */
  FindFormat(id: number): SwFormatField | undefined {
    for (const format of this.GatherFields())
      if (format.GetField().GetPostItId() === id) return format;
    return undefined;
  }

  /** Returns the document associated with the field type. @returns Owning document. */
  GetDoc(): SwDoc {
    return this.document;
  }
}

/** Stored author, thread, and content data for one annotation. */
export interface SwPostItFieldData {
  readonly author: string;
  readonly text: string;
  readonly initials: string;
  readonly name: string;
  readonly dateTime: DateTime;
  readonly resolved?: boolean;
  readonly id?: number;
  readonly parentId?: number;
  readonly paraId?: number;
  readonly parentPostItId?: number;
  readonly parentName?: string;
  readonly textObject?: EditTextObject;
}

/** Owns the source comment payload and an optional rich-text object snapshot. */
export class SwPostItField {
  private data: SwPostItFieldData;
  private textObject: EditTextObject | undefined;

  /** Creates the source field with the original defaults for independent comments. @param type - Document field type. @param data - Native comment content and thread data. @returns Field. */
  constructor(
    private readonly type: SwPostItFieldType,
    data: SwPostItFieldData,
  ) {
    const { textObject, ...values } = data;
    const id = data.id || nextPostItId;
    nextPostItId = Math.max(nextPostItId, id + 1);
    this.data = {
      ...values,
      dateTime: new DateTime(data.dateTime),
      id,
      resolved: data.resolved ?? false,
      parentId: data.parentId ?? 0,
      paraId: data.paraId ?? 0,
      parentPostItId: data.parentPostItId ?? 0,
      parentName: data.parentName ?? "",
    };
    this.textObject = textObject?.Clone();
  }

  /** Reads the original owner type. @returns Document field type. */
  GetTyp(): SwPostItFieldType {
    return this.type;
  }

  /** Returns the native field identity retained through undo and redo. @returns Annotation ID. */
  GetPostItId(): number {
    return this.data.id ?? 0;
  }

  /** Reads the persisted resolution state of this annotation. @returns Whether resolved. */
  IsResolved(): boolean {
    return this.data.resolved === true;
  }

  /** Sets the original resolution member. @param value - Whether resolved. @returns Nothing. */
  SetResolved(value: boolean): void {
    this.data = { ...this.data, resolved: value };
  }

  /** Reads the annotation name used to join its point and range. @returns Annotation name. */
  GetName(): string {
    return this.data.name;
  }

  /** Assigns the generated name when the incoming annotation has none. @param name - Field name. @returns Nothing. */
  SetName(name: string): void {
    this.data = { ...this.data, name };
  }

  /** Assigns the paragraph ID used by replies. @param paraId - Native paragraph identifier. @returns Nothing. */
  SetParaId(paraId: number): void {
    this.data = { ...this.data, paraId };
  }

  /** Reads the plain text fallback used by the original sidebar. @returns Comment text. */
  GetPar2(): string {
    return this.data.text;
  }

  /** Updates the plain text fallback published by the annotation editor. @param value - Current editor text. @returns Nothing. */
  SetPar2(value: string): void {
    this.data = { ...this.data, text: value };
  }

  /** Stores an independent native editor snapshot. @param value - Current rich text. @returns Nothing. */
  SetTextObject(value: EditTextObject | undefined): void {
    const previous = this.textObject;
    this.textObject = value?.Clone();
    previous?.dispose();
  }

  /** Reads the current native rich text snapshot. @returns Optional borrowed edit text. */
  GetTextObject(): EditTextObject | undefined {
    return this.textObject;
  }

  /** Returns value metadata for the comment. @returns An independent metadata value. */
  GetData(): Omit<SwPostItFieldData, "textObject"> {
    return { ...this.data, dateTime: new DateTime(this.data.dateTime) };
  }

  /** Makes an independent field with the same content and native identifier. @param type - Destination field type. @returns Field copy. */
  Copy(type = this.type): SwPostItField {
    return new SwPostItField(type, {
      ...this.data,
      ...(this.textObject ? { textObject: this.textObject } : {}),
    });
  }

  /** Releases the native editor snapshot. @returns Nothing. */
  Dispose(): void {
    this.textObject?.dispose();
    this.textObject = undefined;
  }
}
