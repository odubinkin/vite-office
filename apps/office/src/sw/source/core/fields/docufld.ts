/** @fileoverview Native document annotation field values retained by Writer text hints. */
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
  private readonly data: SwPostItFieldData;
  private textObject: EditTextObject | undefined;

  /** Creates the source field with the original defaults for independent comments. @param type - Document field type. @param data - Native comment content and thread data. @returns Field. */
  constructor(
    private readonly type: SwPostItFieldType,
    data: SwPostItFieldData,
  ) {
    const { textObject, ...values } = data;
    this.data = {
      ...values,
      dateTime: new DateTime(data.dateTime),
      id: data.id || nextPostItId++,
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

  /** Reads the plain text fallback used by the original sidebar. @returns Comment text. */
  GetPar2(): string {
    return this.data.text;
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
