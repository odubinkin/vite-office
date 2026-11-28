/** @fileoverview Native Writer DropDown field choices, selection and presentation. */
import type { SwField } from "../../../inc/fldbas";
import type { SwDoc } from "../doc/doc";

/** Native document system type for a DropDown field. */
export class SwDropDownFieldType {
  /** Binds the document-owned system type. @param document - Writer document. @returns The initialized SwDropDownFieldType instance. */
  public constructor(private readonly document: SwDoc) {}

  /** Returns the native field's document owner. @returns Writer document. */
  public GetDoc(): SwDoc {
    return this.document;
  }

  /** Copies the original system type. @returns Independent type. */
  public Copy(): SwDropDownFieldType {
    return new SwDropDownFieldType(this.document);
  }
}

/** Values owned by the native DropDown field. */
export interface SwDropDownFieldData {
  readonly items: readonly string[];
  readonly selectedItem: string;
  readonly name: string;
  readonly help: string;
  readonly toolTip: string;
}

/** Owns the authored choices and selected item. */
export class SwDropDownField implements SwField<SwDropDownField> {
  private items: readonly string[] = [];
  private selectedItem = "";

  /** Creates native choices and applies the original membership check. @param type - Document field type. @param data - Authored data. @returns The initialized SwDropDownField instance. */
  public constructor(
    private readonly type: SwDropDownFieldType,
    private readonly data: SwDropDownFieldData,
  ) {
    this.SetItems(data.items);
    this.SetSelectedItem(data.selectedItem);
  }

  /** Returns the native system type. @returns DropDown field type. */
  public GetTyp(): SwDropDownFieldType {
    return this.type;
  }

  /** Replaces the choices and clears the selection. @param items - Authored item order. @returns Nothing. */
  public SetItems(items: readonly string[]): void {
    this.items = [...items];
    this.selectedItem = "";
  }

  /** Selects a matching item or clears the selection. @param item - Requested item. @returns Nothing. */
  public SetSelectedItem(item: string): void {
    this.selectedItem = this.items.includes(item) ? item : "";
  }

  /** Returns independent data for UNO, XML and transport. @returns Native choices and properties. */
  public GetData(): SwDropDownFieldData {
    return { ...this.data, items: [...this.items], selectedItem: this.selectedItem };
  }

  /** Expands the selected item, first item or original ten-space fill. @returns Field presentation. */
  public Expand(): string {
    return this.selectedItem || this.items[0] || "          ";
  }

  /** Copies the field without the text attribute. @returns Detached copy. */
  public Copy(): SwDropDownField {
    return new SwDropDownField(this.type, this.GetData());
  }

  /** Connects the copied field to another document. @param doc - Destination document. @returns Detached copy. */
  public CopyToDocument(doc: SwDoc): SwDropDownField {
    return new SwDropDownField(
      doc.getIDocumentFieldsAccess().GetDropDownFieldType(),
      this.GetData(),
    );
  }

  /** Releases the value-only field. @returns Nothing. */
  public Dispose(): void {}
}
