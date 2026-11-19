/** @fileoverview Native Calc paragraph and text-span contexts over ODF text styles. */
import { ScXMLImportContext } from "./importcontext";
import {
  SvXMLIgnoreContext,
  SvXMLImportContext,
  type FastAttributeList,
} from "../../../../xmloff/source/core/xmlimp";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import type { ScXMLTableRowCellContext } from "./xmlcelli";
import type { ScXMLImport } from "./xmlimprt";
import type { CellTextSpan } from "./xmlexprt.celltext";

/** Appends text with the active automatic character style in parser order. */
class ScXMLCellTextSpanContext extends ScXMLImportContext {
  /** Binds the actual shared paragraph span list. @param owner - Importer. @param spans - Paragraph destinations. @param style - Active style name. @param paragraphRoot - Whether this context owns the paragraph. @returns Span. */
  constructor(
    owner: ScXMLImport,
    protected readonly spans: CellTextSpan[],
    private readonly style = "",
    private readonly paragraphRoot = false,
  ) {
    super(owner);
  }
  /** Appends parser-decoded text. @param value - Characters. @returns Nothing. */
  override characters(value: string): void {
    if (!value) return;
    const previous = this.spans.at(-1);
    if (previous?.[1] === this.style)
      this.spans[this.spans.length - 1] = [previous[0] + value, this.style];
    else this.spans.push([value, this.style]);
  }
  /** Preserves significant spaces and tabs without an edit-engine substitute. @param element - Token. @param attributes - Attributes. @returns Context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element === XMLToken.TEXT_S) {
      const count = Math.max(1, attributes.getAsInteger(XMLToken.TEXT_C) ?? 1);
      if (count > 1_000_000) throw new Error("ODS text space limit exceeded");
      this.characters(" ".repeat(count));
      return new SvXMLImportContext();
    }
    if (!this.paragraphRoot) return new SvXMLIgnoreContext(true);
    if (element === XMLToken.TEXT_SPAN)
      return new ScXMLCellTextSpanContext(
        this.GetScImport(),
        this.spans,
        attributes.get(XMLToken.TEXT_STYLE_NAME) ?? "",
      );
    if (element === XMLToken.TEXT_TAB) {
      this.characters("\t");
      return new SvXMLImportContext();
    }
    if (element === XMLToken.TEXT_LINE_BREAK) {
      this.characters("\n");
      return new SvXMLImportContext();
    }
    throw new Error("ODS rich/multiline cell text is not implemented");
  }
}

/** One paragraph of actual cell text, including its styled spans. */
export class ScXMLCellTextParaContext extends ScXMLCellTextSpanContext {
  /** Binds the cell that receives this paragraph. @param cell - Actual owning cell context. @returns Paragraph. */
  constructor(private readonly cell: ScXMLTableRowCellContext) {
    super(cell.GetScImport(), [], "", true);
  }
  /** Publishes the actual paragraph text to its native owning cell context. @returns Nothing. */
  override endFastElement(): void {
    this.cell.setParagraph(this.spans);
  }
}
