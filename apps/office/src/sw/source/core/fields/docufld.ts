/** @fileoverview Native document annotation field values retained by Writer text hints. */
import type { SwFormatField } from "../../../inc/fmtfld";
import { RES_TXTATR_ANNOTATION } from "../../../inc/hintids";
import { isAnnotationTextField } from "../../../inc/txtfld";
import type { SwDoc } from "../doc/doc";
import type { EditTextObject } from "../../../../editeng/source/editeng/editobj";
import { DateTime } from "../../../../tools/source/datetime/datetime";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../../sal/inc/rtl/ustring.h";
import type { SwField } from "../../../inc/fldbas";

/** Original document information subtype and flag values. */
export enum SwDocInfoSubType {
  Title = 0,
  Subject = 1,
  Keys = 2,
  Comment = 3,
  Create = 4,
  Change = 5,
  Print = 6,
  DocNo = 7,
  LowerMask = 0x00ff,
  SubAuthor = 0x0100,
  SubFixed = 0x1000,
}

/** Native textual DocInfo values admitted from the represented UNO services. */
export const docInfoServiceSubTypes = {
  "DocInfo.Title": SwDocInfoSubType.Title,
  "DocInfo.Subject": SwDocInfoSubType.Subject,
  "DocInfo.KeyWords": SwDocInfoSubType.Keys,
  "DocInfo.Description": SwDocInfoSubType.Comment,
  "DocInfo.CreateAuthor": SwDocInfoSubType.Create | SwDocInfoSubType.SubAuthor,
  "DocInfo.ChangeAuthor": SwDocInfoSubType.Change | SwDocInfoSubType.SubAuthor,
  "DocInfo.PrintAuthor": SwDocInfoSubType.Print | SwDocInfoSubType.SubAuthor,
  "DocInfo.Revision": SwDocInfoSubType.DocNo,
} as const;

/** Converts an owned string from the native document properties service. @param value - Owned result. @returns Text. */
function readDocInfoString(value: OUString): string {
  try {
    return text(value);
  } finally {
    value.dispose();
  }
}

/** System field type that expands metadata through its actual document owner. */
export class SwDocInfoFieldType {
  /** Binds the system field type to its document. @param document - Owning document. */
  public constructor(private readonly document: SwDoc) {}

  /** Returns the canonical document for this field type. @returns Owning document. */
  public GetDoc(): SwDoc {
    return this.document;
  }

  /** Expands the original textual property identified by the subtype. @param subtype - Native subtype and flags. @returns Property presentation. */
  public Expand(subtype: number): string {
    const properties = this.document.documentProperties.GetDocumentProperties();
    switch (subtype & SwDocInfoSubType.LowerMask) {
      case SwDocInfoSubType.Title:
        return readDocInfoString(properties.getTitle());
      case SwDocInfoSubType.Subject:
        return readDocInfoString(properties.getSubject());
      case SwDocInfoSubType.Comment:
        return readDocInfoString(properties.getDescription());
      case SwDocInfoSubType.DocNo:
        return String(properties.getEditingCycles());
      case SwDocInfoSubType.Keys: {
        const keywords = properties.getKeywords();
        try {
          const values: string[] = [];
          for (let index = 0; index < keywords.getLength(); index++) {
            const value = OUString.unacquired(
              keywords.operatorIndex(index) as unknown as rtl_uStringSlot,
            );
            values.push(text(value));
          }
          return values.join(", ");
        } finally {
          keywords.dispose();
        }
      }
      case SwDocInfoSubType.Create:
        return new DateTime(properties.getCreationDate()).IsValidAndGregorian()
          ? readDocInfoString(properties.getAuthor())
          : "";
      case SwDocInfoSubType.Change:
        return new DateTime(properties.getModificationDate()).IsValidAndGregorian()
          ? readDocInfoString(properties.getModifiedBy())
          : "";
      case SwDocInfoSubType.Print:
        return new DateTime(properties.getPrintDate()).IsValidAndGregorian()
          ? readDocInfoString(properties.getPrintedBy())
          : "";
      default:
        return "";
    }
  }
}

/** Native text document-information field and its expansion state. */
export class SwDocInfoField implements SwField<SwDocInfoField> {
  private content: string;

  /** Initializes the original expansion from document properties. @param type - System field type. @param subtype - Native subtype and flags. */
  public constructor(
    private readonly type: SwDocInfoFieldType,
    private readonly subtype: number,
    content?: string,
  ) {
    this.content = content ?? type.Expand(subtype);
  }

  /** Borrows the original system field type. @returns Field type. */
  public GetTyp(): SwDocInfoFieldType {
    return this.type;
  }

  /** Reads the original subtype including its fixed flag. @returns Native subtype and flags. */
  public GetSubType(): number {
    return this.subtype;
  }

  /** Reads whether the native field retains its authored presentation. @returns Fixed flag. */
  public IsFixed(): boolean {
    return Boolean(this.subtype & SwDocInfoSubType.SubFixed);
  }

  /** Updates the native stored presentation. @param content - Current presentation. */
  public SetExpansion(content: string): void {
    this.content = content;
  }

  /** Expands live metadata and retains the presentation of fixed fields. @returns Current text. */
  public Expand(): string {
    if (!this.IsFixed() && this.type.GetDoc().documentProperties.GetPendingXml() === undefined)
      this.content = this.type.Expand(this.subtype);
    return this.content;
  }

  /** Copies field and stored expansion. @returns Copy for the same owner. */
  public Copy(): SwDocInfoField {
    return new SwDocInfoField(this.type, this.subtype, this.content);
  }

  /** Copies the field into its destination's original system field type. @param document - Destination model. @returns Detached copy. */
  public CopyToDocument(document: SwDoc): SwDocInfoField {
    return new SwDocInfoField(
      document.getIDocumentFieldsAccess().GetDocInfoFieldType(),
      this.subtype,
      this.content,
    );
  }

  /** Releases field-specific state. Textual document information owns no disposable values. */
  public Dispose(): void {}
}

let nextPostItId = 1;

/** Original annotation field type carries the document that owns the fields. */
export class SwPostItFieldType {
  /** Finds the document's system annotation field type. @param document - Owning document. @returns Canonical field type. */
  static Get(document: SwDoc): SwPostItFieldType {
    return document.getIDocumentFieldsAccess().GetPostItFieldType();
  }

  /** Associates the annotation type with one Writer document. @param document - Owning document. @returns Field type. */
  public constructor(private readonly document: SwDoc) {}

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
        if (!isAnnotationTextField(hint)) break;
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

  /** Clears the original parent link when a reply becomes a root. @returns Nothing. */
  ClearParent(): void {
    this.data = { ...this.data, parentId: 0, parentPostItId: 0, parentName: "" };
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

  /** Copies the annotation to the original field type of another document. @param document - Destination. @returns Owned field. */
  CopyToDocument(document: SwDoc): SwPostItField {
    return this.Copy(SwPostItFieldType.Get(document));
  }

  /** Releases the native editor snapshot. @returns Nothing. */
  Dispose(): void {
    this.textObject?.dispose();
    this.textObject = undefined;
  }
}
