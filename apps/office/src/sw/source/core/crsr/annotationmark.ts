/** @fileoverview Writer annotation range mark over registered document positions. */
import type { SwFormatField } from "../../../inc/fmtfld";
import { MarkBase } from "./bookmark";
import type { SwPaM } from "./pam";

/** An expanded annotation owns its range independently from the point text attribute. */
export class AnnotationMark extends MarkBase {
  /** Binds a registered range to the annotation at its end. @param range - Native text range. @param field - Owning annotation format. @returns Annotation mark. */
  constructor(
    range: SwPaM,
    private readonly field: SwFormatField,
  ) {
    super(range);
  }

  /** Returns the annotation name shared by the field and range. @returns Annotation name. */
  GetName(): string {
    return this.field.GetField().GetName();
  }

  /** Borrows the associated point field. @returns Annotation format. */
  GetAnnotationFormatField(): SwFormatField {
    return this.field;
  }
}
