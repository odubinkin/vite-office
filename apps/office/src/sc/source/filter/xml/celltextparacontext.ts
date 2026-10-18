/** @fileoverview Native simple Calc paragraph text context;rich fields/styles/edit-engine content remain unsupported. */
import { ScXMLImportContext } from "./importcontext";
import { SvXMLImportContext, type FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import type { ScXMLTableRowCellContext } from "./xmlcelli";
/** Actual simple paragraph accumulation used by scalar cell text. */
export class ScXMLCellTextParaContext extends ScXMLImportContext {
  private value = "";
  /** Binds actual cell context. @param cell - Cell. @returns Paragraph. */
  constructor(private readonly cell: ScXMLTableRowCellContext) {
    super(cell.GetScImport());
  }
  /** Appends parser-decoded text. @param value - Characters. @returns Nothing. */
  override characters(value: string): void {
    this.value += value;
  }
  /** Preserves significant spaces and tabs without an edit-engine substitute. @param element - Token. @param attributes - Attributes. @returns Context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element === XMLToken.TEXT_S) {
      const count = Math.max(1, attributes.getAsInteger(XMLToken.TEXT_C) ?? 1);
      if (count > 1_000_000) throw new Error("ODS text space limit exceeded");
      this.value += " ".repeat(count);
      return new SvXMLImportContext();
    }
    if (element === XMLToken.TEXT_TAB) {
      this.value += "\t";
      return new SvXMLImportContext();
    }
    throw new Error("ODS rich/multiline cell text is not implemented");
  }
  /** Publishes the actual paragraph text to its native owning cell context. @returns Nothing. */
  override endFastElement(): void {
    this.cell.setParagraph(this.value);
  }
}
