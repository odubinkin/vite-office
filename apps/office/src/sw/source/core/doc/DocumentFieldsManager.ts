/** @fileoverview Native document ownership of Writer system field types. */
import { SwPostItFieldType } from "../fields/docufld";
import { SwGetRefFieldType } from "../fields/reffld";
import type { SwDoc } from "./doc";

/** Document-owned system fields for the represented Writer field families. */
export class DocumentFieldsManager {
  private readonly postIt: SwPostItFieldType;
  private readonly getRef: SwGetRefFieldType;

  /** Creates the system field types for this document. @param document - Actual Writer model. */
  public constructor(document: SwDoc) {
    this.postIt = new SwPostItFieldType(document);
    this.getRef = new SwGetRefFieldType(document);
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
