/** @fileoverview Native point text attribute that attaches a field to Writer model text. */
import { SwTextAttr } from "../source/core/txtnode/txatbase";
import type { SwDocInfoField, SwDocStatField, SwPostItField } from "../source/core/fields/docufld";
import type { SwGetRefField } from "../source/core/fields/reffld";
import type { SwChapterField } from "../source/core/fields/chpfld";
import type { SwPageNumberField } from "../source/core/fields/docufld.pagenumber";
import type { SwDateTimeField } from "../source/core/fields/flddat";
import type { SwTextNode } from "../source/core/txtnode/ndtxt";
import type { SwDoc } from "../source/core/doc/doc";
import type { SwFormatField } from "./fmtfld";
import type { SwField } from "./fldbas";
import { RES_TXTATR_ANNOTATION } from "./hintids";

/** Owns a field format over the original single dummy character. */
export class SwTextField<Field extends SwField<Field> = SwPostItField> extends SwTextAttr<
  SwFormatField<Field>
> {
  private node: SwTextNode | undefined;

  /** Sets the native backlink and dummy-character flag. @param format - Owned field format. @param start - UTF-16 offset. @returns Text field. */
  constructor(format: SwFormatField<Field>, start: number) {
    super(format, start);
    format.SetTextField(this);
    this.SetHasDummyChar(true);
  }

  /** Copies the original field and binds the new offset. @param offset - New offset. @param document - Optional destination. @returns Independent hint. */
  Copy(offset: number, document?: SwDoc): SwTextField<Field> {
    return new SwTextField(
      document ? this.GetAttr().CopyTo(document) : this.GetAttr().Clone(),
      offset,
    );
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

/** Text attribute carrying the original GetReference field. */
export type SwTextReferenceField = SwTextField<SwGetRefField>;

/** Text attribute carrying the original document information field. */
export type SwTextDocInfoField = SwTextField<SwDocInfoField>;

/** Text attribute carrying the original date or time field. */
export type SwTextDateTimeField = SwTextField<SwDateTimeField>;

/** Text attribute carrying a native statistic field. */
export type SwTextDocStatField = SwTextField<SwDocStatField>;

/** Text attribute carrying the original page number or continuation field. */
export type SwTextPageNumberField = SwTextField<SwPageNumberField>;

/** Text attribute carrying the original Chapter field. */
export type SwTextChapterField = SwTextField<SwChapterField>;

/** Represented native ordinary text fields. */
export type SwTextOrdinaryField =
  | SwTextReferenceField
  | SwTextDocInfoField
  | SwTextDateTimeField
  | SwTextDocStatField
  | SwTextPageNumberField
  | SwTextChapterField;

/** Identifies the original annotation subclass contract without treating other fields as comments. @param hint - Indexed hint. @returns Whether this is an attached annotation attribute. */
export function isAnnotationTextField(hint: unknown): hint is SwTextField {
  return hint instanceof SwTextField && hint.Which() === RES_TXTATR_ANNOTATION;
}
