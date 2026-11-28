/** @fileoverview Native document ownership of Writer system field types. */
import { SwDocInfoFieldType, SwDocStatFieldType, SwPostItFieldType } from "../fields/docufld";
import { SwChapterFieldType } from "../fields/chpfld";
import { SwPageNumberFieldType } from "../fields/docufld.pagenumber";
import { SwGetRefFieldType } from "../fields/reffld";
import { SwDateTimeFieldType } from "../fields/flddat";
import type { SwDoc } from "./doc";

/** Document-owned system fields for the represented Writer field families. */
export class DocumentFieldsManager {
  private readonly chapter: SwChapterFieldType;
  private readonly pageNumber: SwPageNumberFieldType;
  private readonly docStat: SwDocStatFieldType;
  private readonly postIt: SwPostItFieldType;
  private readonly getRef: SwGetRefFieldType;
  private readonly docInfo: SwDocInfoFieldType;
  private readonly dateTime: SwDateTimeFieldType;

  /** Creates the system field types for this document. @param document - Actual Writer model. */
  public constructor(document: SwDoc) {
    this.chapter = new SwChapterFieldType(document);
    this.pageNumber = new SwPageNumberFieldType(document);
    this.docStat = new SwDocStatFieldType(document);
    this.postIt = new SwPostItFieldType(document);
    this.getRef = new SwGetRefFieldType(document);
    this.docInfo = new SwDocInfoFieldType(document);
    this.dateTime = new SwDateTimeFieldType(document);
  }

  /** Borrows the original Chapter system type. @returns Field type. */
  public GetChapterFieldType(): SwChapterFieldType {
    return this.chapter;
  }

  /** Borrows the original PageNumber system type. @returns Field type. */
  public GetPageNumberFieldType(): SwPageNumberFieldType {
    return this.pageNumber;
  }

  /** Borrows the original document statistic field type. @returns System field type. */
  public GetDocStatFieldType(): SwDocStatFieldType {
    return this.docStat;
  }

  /** Borrows the original date/time field type. @returns System field type. */
  public GetDateTimeFieldType(): SwDateTimeFieldType {
    return this.dateTime;
  }

  /** Borrows the original document information field type. @returns System field type. */
  public GetDocInfoFieldType(): SwDocInfoFieldType {
    return this.docInfo;
  }

  /** Borrows the original annotation field type. @returns Document type. */
  public GetPostItFieldType(): SwPostItFieldType {
    return this.postIt;
  }

  /** Borrows the original GetReference field type. @returns Document type. */
  public GetReferenceFieldType(): SwGetRefFieldType {
    return this.getRef;
  }

  /** Updates native reference fields through their system type. */
  public UpdateRefFields(): void {
    this.getRef.UpdateGetReferences();
  }
}
