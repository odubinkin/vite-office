/** @fileoverview Native Writer user-field master and dependent field occurrences. */
import type { SwField } from "../../../inc/fldbas";
import type { SwDoc } from "../doc/doc";
import { SwValueFieldType } from "./fldbas";

/** Document-owned value shared by all occurrences of a named user field. */
export class SwUserFieldType extends SwValueFieldType {
  /** Creates the original string field with an empty content. @param document - Writer document. @param name - Field master name. @returns The initialized SwUserFieldType instance. */
  public constructor(
    document: SwDoc,
    public readonly name: string,
  ) {
    super(document);
  }

  public expression = false;
  public content = "";
  public value = 0;

  /** Assigns the numeric value and its formula source together. @param value - Original numeric UNO value. @returns Nothing. */
  public SetValue(value: number): void {
    this.value = value;
    this.content = String(value);
  }

  /** Resolves the equivalent master in the destination document. @param document - Destination model. @returns Destination master. */
  public CopyToDocument(document: SwDoc): SwUserFieldType {
    const owner = document.getIDocumentFieldsAccess();
    const existing = owner.FindUserFieldType(this.name);
    if (existing) return existing;
    const type = owner.GetUserFieldType(this.name);
    type.expression = this.expression;
    type.content = this.content;
    type.value = this.value;
    return type;
  }
}

/** Displays the user field's current value, its authored command or an empty invisible field. */
export class SwUserField implements SwField<SwUserField> {
  /** Creates a dependent user field. @param type - Document field master. @param format - Native number format. @param visible - Occurrence visibility. @param showFormula - Command display. @returns The initialized SwUserField instance. */
  public constructor(
    public readonly type: SwUserFieldType,
    public format: number,
    public visible: boolean,
    public showFormula: boolean,
  ) {}

  /** Borrows the named field type. @returns Original master. */
  public GetTyp(): SwUserFieldType {
    return this.type;
  }

  /** Uses the shared field master for the current presentation. @returns User field text. */
  public Expand(): string {
    if (!this.visible) return "";
    return this.type.expression && !this.showFormula
      ? this.type.ExpandValue(this.type.value, this.format)
      : this.type.content;
  }

  /** Copies this occurrence, retaining the original master. @returns Detached occurrence. */
  public Copy(): SwUserField {
    return new SwUserField(this.type, this.format, this.visible, this.showFormula);
  }

  /** Copies the occurrence along with its field name and number format. @param document - Destination document. @returns Detached occurrence. */
  public CopyToDocument(document: SwDoc): SwUserField {
    return new SwUserField(
      this.type.CopyToDocument(document),
      this.type.CopyFormatToDocument(this.format, document),
      this.visible,
      this.showFormula,
    );
  }

  /** Releases the occurrence while its document retains the field master. @returns Nothing. */
  public Dispose(): void {}
}
