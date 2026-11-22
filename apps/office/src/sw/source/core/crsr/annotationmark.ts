/** @fileoverview Writer annotation range mark over registered document positions. */
import type { SwFormatField } from "../../../inc/fmtfld";
import { MarkBase } from "./bookmark";
import type { SwPaM } from "./pam";

/** An expanded annotation owns its range independently from the point text attribute. */
export class AnnotationMark extends MarkBase {
  private readonly name: string;
  /** Binds a registered range to the annotation at its end. @param range - Native text range. @param field - Owning annotation format. @returns Annotation mark. */
  constructor(
    range: SwPaM,
    private readonly field: SwFormatField,
    name?: string,
  ) {
    super(range);
    const annotation = field.GetField();
    this.name = annotation.GetName() || name || MarkBase.GenerateNewName("__Annotation__");
    if (!annotation.GetName()) annotation.SetName(this.name);
  }

  /** Returns the annotation name shared by the field and range. @returns Annotation name. */
  GetName(): string {
    return this.name;
  }

  /** Borrows the associated point field. @returns Annotation format. */
  GetAnnotationFormatField(): SwFormatField {
    return this.field;
  }
}
