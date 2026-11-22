/** @fileoverview Original annotation range mark from Writer's annotationmark.cxx. */
import { MarkBase } from "./bookmark";
import type { SwPaM } from "./pam";
import { RES_TXTATR_ANNOTATION } from "../../../inc/hintids";
import type { SwFormatField } from "../../../inc/fmtfld";
import { SwPostItFieldType } from "../fields/docufld";

/** Owns the registered text range of a Writer annotation field. */
export class AnnotationMark extends MarkBase {
  private name: string;

  /** Creates the range with original generated-name behavior. @param range - Ordered annotation selection. @param name - Original requested name. @returns Annotation range. */
  constructor(range: SwPaM, name: string) {
    super(range);
    this.name = name || MarkBase.GenerateNewName("__Annotation__");
  }

  /** Returns the native format at the range's trailing dummy character. @returns Borrowed trailing format or absence. */
  GetTrailingAnnotationFormatField(): SwFormatField | undefined {
    const end = this.GetMarkEnd();
    return end
      .GetNode()
      .GetTextNode()
      ?.GetpSwpHints()
      ?.GetTextAttrForCharAt(end.GetContentIndex() - 1, RES_TXTATR_ANNOTATION)
      ?.GetAttr();
  }

  /** Resolves the field at the original trailing dummy and reconciles its name. @returns Nothing. */
  InitDoc(): void {
    const format = this.GetTrailingAnnotationFormatField();
    if (!format) throw new Error("Writer annotation mark has no trailing annotation field.");
    const field = format.GetField();
    if (field.GetName()) this.name = field.GetName();
    else field.SetName(this.name);
  }

  /** Returns the original mark and thread name. @returns Native name. */
  GetName(): string {
    return this.name;
  }

  /** Finds the format whose field shares the original annotation name. @returns Borrowed format or absence. */
  GetAnnotationFormatField(): SwFormatField | undefined {
    return SwPostItFieldType.Get(this.GetMarkPos().GetNode().GetDoc())
      .GatherFields()
      .find(
        /** Selects the first native field with this name. @param format - Attached field. @returns Whether names match. */
        (format) => format.GetField().GetName() === this.name,
      );
  }
}
