/** @fileoverview SwFormatField ownership for the represented Writer annotation field. */
import { SfxPoolItem } from "../../svl/source/items/poolitem";
import type { SwPostItField, SwPostItFieldType } from "../source/core/fields/docufld";
import type { SwTextField } from "./txtfld";
import { RES_TXTATR_ANNOTATION } from "./hintids";

/** Nonshareable pooled field format with a borrowed text-attribute backlink. */
export class SwFormatField extends SfxPoolItem {
  private textField: SwTextField | undefined;
  private readonly field: SwPostItField;

  /** Copies the original field into its owning format item. @param field - Borrowed source field. @param type - Destination document field type. @returns Field format. */
  constructor(field: SwPostItField, type = field.GetTyp()) {
    super(RES_TXTATR_ANNOTATION);
    this.field = field.Copy(type);
    this.setNonShareable();
  }

  /** Returns the actual field owned by the format. @returns Field. */
  GetField(): SwPostItField {
    return this.field;
  }

  /** Reads the native attribute backlink. @returns Owning hint or undefined. */
  GetTextField(): SwTextField | undefined {
    return this.textField;
  }

  /** Assigns the original owning hint. @param hint - Hint or detached state. @returns Nothing. */
  SetTextField(hint: SwTextField | undefined): void {
    this.textField = hint;
  }

  /** Copies the native field with an independent hint owner. @returns New field format. */
  override Clone(): SwFormatField {
    return new SwFormatField(this.field);
  }

  /** Copies the field into a destination document type. @param type - Destination type. @returns Destination field format. */
  CopyTo(type: SwPostItFieldType): SwFormatField {
    return new SwFormatField(this.field, type);
  }

  /** Compares the document field types of annotations with the default format. @param other - Compared item. @returns Equality. */
  override equals(other: SfxPoolItem): boolean {
    return other instanceof SwFormatField && this.field.GetTyp() === other.field.GetTyp();
  }

  /** Releases the owned annotation and clears the borrowed hint link. @returns Nothing. */
  override Dispose(): void {
    this.field.GetTyp().GetDoc().GetIDocumentMarkAccess().DeleteAnnotationMark(this);
    this.textField = undefined;
    this.field.Dispose();
    super.Dispose();
  }
}
