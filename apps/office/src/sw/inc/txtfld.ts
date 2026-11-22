/** @fileoverview Native point text attribute that attaches a field to Writer model text. */
import { SwTextAttr } from "../source/core/txtnode/txatbase";
import type { SwTextNode } from "../source/core/txtnode/ndtxt";
import type { SwPostItFieldType } from "../source/core/fields/docufld";
import type { SwFormatField } from "./fmtfld";

/** Owns a field format over the original single dummy character. */
export class SwTextField extends SwTextAttr<SwFormatField> {
  private node: SwTextNode | undefined;

  /** Sets the native backlink and dummy-character flag. @param format - Owned field format. @param start - UTF-16 offset. @returns Text field. */
  constructor(format: SwFormatField, start: number) {
    super(format, start);
    format.SetTextField(this);
    this.SetHasDummyChar(true);
  }

  /** Copies the field at a rebound position. @param offset - New offset. @param type - Destination field type. @returns Independent hint. */
  Copy(offset: number, type?: SwPostItFieldType): SwTextField {
    return new SwTextField(type ? this.GetAttr().CopyTo(type) : this.GetAttr().Clone(), offset);
  }

  /** Reads the live document anchor owner. @returns Text node or detached state. */
  GetTextNode(): SwTextNode | undefined {
    return this.node;
  }

  /** Rebinds a point moved by the native hint maps. @param node - New node or detached state. @returns Nothing. */
  ChgTextNode(node: SwTextNode | undefined): void {
    this.node = node;
  }
}
