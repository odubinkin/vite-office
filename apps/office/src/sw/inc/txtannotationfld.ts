/** @fileoverview Native annotation text attribute's registered range lookup. */
import { SwTextField } from "./txtfld";
import type { AnnotationMark } from "../source/core/crsr/annotationmark";
import type { SwDoc } from "../source/core/doc/doc";

/** Annotation specialization resolves the mark corresponding to its field name. */
export class SwTextAnnotationField extends SwTextField {
  /** Copies the original annotation subtype and rebinds its owning field format. @param offset - Destination UTF-16 position. @param document - Optional target document. @returns New hint. */
  override Copy(offset: number, document?: SwDoc): SwTextAnnotationField {
    const format = this.GetAttr();
    return new SwTextAnnotationField(document ? format.CopyTo(document) : format.Clone(), offset);
  }

  /** Searches the document's annotation mark registry by the field's native name. @returns Optional range mark. */
  GetAnnotationMark(): AnnotationMark | undefined {
    const field = this.GetAttr().GetField();
    return field.GetTyp().GetDoc().GetIDocumentMarkAccess().FindAnnotationMark(field.GetName());
  }
}
