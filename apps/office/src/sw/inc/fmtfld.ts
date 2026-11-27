/** @fileoverview SwFormatField ownership for represented native Writer field values. */
import { SfxPoolItem } from "../../svl/source/items/poolitem";
import type { SwDoc } from "../source/core/doc/doc";
import type { SwPostItField } from "../source/core/fields/docufld";
import type { SwTextField } from "./txtfld";
import type { SwField } from "./fldbas";
import { RES_TXTATR_ANNOTATION } from "./hintids";

/** Nonshareable pooled field format with a borrowed text-attribute backlink. */
export class SwFormatField<Field extends SwField<Field> = SwPostItField> extends SfxPoolItem {
  private textField: SwTextField<Field> | undefined;
  private readonly field: Field | undefined;

  /** Creates the native empty default or copies a real field into its own item. @param fieldOrWhich - Borrowed field or native default identity. @param which - Identity of the attached field family. @param destination - Optional target document. */
  constructor(
    fieldOrWhich: Field | number,
    which: number = RES_TXTATR_ANNOTATION,
    destination?: SwDoc,
  ) {
    super(typeof fieldOrWhich === "number" ? fieldOrWhich : which);
    if (typeof fieldOrWhich !== "number")
      this.field = destination ? fieldOrWhich.CopyToDocument(destination) : fieldOrWhich.Copy();
    this.setNonShareable();
  }

  /** Returns the actual field owned by the format. @returns Field. */
  GetField(): Field {
    if (!this.field) throw new Error("Writer default field item has no attached field.");
    return this.field;
  }

  /** Reads the native attribute backlink. @returns Owning hint or undefined. */
  GetTextField(): SwTextField<Field> | undefined {
    return this.textField;
  }

  /** Assigns the original owning hint. @param hint - Hint or detached state. @returns Nothing. */
  SetTextField(hint: SwTextField<Field> | undefined): void {
    this.textField = hint;
  }

  /** Copies the native field with an independent hint owner. @returns New field format. */
  override Clone(): SwFormatField<Field> {
    return new SwFormatField(this.field ?? this.Which(), this.Which());
  }

  /** Copies the field into the target document's original field type. @param document - Destination document. @returns Destination field format. */
  CopyTo(document: SwDoc): SwFormatField<Field> {
    return new SwFormatField(this.field ?? this.Which(), this.Which(), document);
  }

  /** Compares the original text-field identities and document field types. @param other - Compared item. @returns Equality. */
  override equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SwFormatField &&
      this.Which() === other.Which() &&
      this.field?.GetTyp() === other.field?.GetTyp()
    );
  }

  /** Releases the owned annotation and clears the borrowed hint link. @returns Nothing. */
  override Dispose(): void {
    if (this.field && this.Which() === RES_TXTATR_ANNOTATION)
      this.field
        .GetTyp()
        .GetDoc()
        .GetIDocumentMarkAccess()
        .DeleteAnnotationMark(this as unknown as SwFormatField);
    this.textField = undefined;
    this.field?.Dispose();
    super.Dispose();
  }
}
