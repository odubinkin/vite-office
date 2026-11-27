/** @fileoverview Native Calc paragraph and text-span contexts over ODF text styles. */
import { ScXMLImportContext } from "./importcontext";
import {
  SvXMLIgnoreContext,
  SvXMLImportContext,
  type FastAttributeList,
} from "../../../../xmloff/source/core/xmlimp";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import type { ScXMLImport } from "./xmlimprt";
import type { CellTextField, CellTextParagraph, CellTextSpan } from "./xmlexprt.celltext";
import { SvxURLFormat } from "../../../../editeng/inc/flditem";

/** Appends text with the active automatic character style in parser order. */
class ScXMLCellTextSpanContext extends ScXMLImportContext {
  /** Binds the actual shared paragraph span list. @param owner - Importer. @param spans - Paragraph destinations. @param style - Active style name. @param paragraphRoot - Whether this context owns the paragraph. @returns Span. */
  constructor(
    owner: ScXMLImport,
    protected readonly spans: CellTextSpan[],
    private readonly tab: number,
    private readonly style = "",
    private readonly paragraphRoot = false,
  ) {
    super(owner);
  }
  /** Appends parser-decoded text. @param value - Characters. @returns Nothing. */
  override characters(value: string): void {
    if (!value) return;
    const previous = this.spans.at(-1);
    if (previous?.[1] === this.style && previous[2] === undefined)
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
    if (
      element === XMLToken.TEXT_A ||
      element === XMLToken.TEXT_SHEET_NAME ||
      element === XMLToken.TEXT_DATE ||
      element === XMLToken.TEXT_TITLE
    )
      return new ScXMLCellFieldContext(this.GetScImport(), this.spans, this.style, this.tab);
    if (!this.paragraphRoot) return new SvXMLIgnoreContext(true);
    if (element === XMLToken.TEXT_SPAN)
      return new ScXMLCellTextSpanContext(
        this.GetScImport(),
        this.spans,
        this.tab,
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
    if (
      element === XMLToken.TEXT_BOOKMARK ||
      element === XMLToken.TEXT_BOOKMARK_START ||
      element === XMLToken.TEXT_BOOKMARK_END
    )
      return new SvXMLIgnoreContext(true);
    throw new Error("ODS rich/multiline cell text is not implemented");
  }
}

/** Collects the original field payload before handing it to the cell editor. */
class ScXMLCellFieldContext extends SvXMLImportContext {
  private value = "";
  private href = "";
  private target = "";

  /** Binds the field to the paragraph run and its live sheet. @param owner - Importer. @param spans - Paragraph spans. @param style - Enclosing style. @param tab - Current sheet. @returns Context. */
  constructor(
    private readonly owner: ScXMLImport,
    private readonly spans: CellTextSpan[],
    private readonly style: string,
    private readonly tab: number,
  ) {
    super();
  }

  /** Reads hyperlink properties using Calc's actual field names. @param element - Field token. @param attributes - Native attributes. @returns Nothing. */
  override startFastElement(element: XMLToken, attributes: FastAttributeList): void {
    if (element !== XMLToken.TEXT_A) return;
    this.href = this.owner.GetAbsoluteReference(attributes.get(XMLToken.XLINK_HREF) ?? "");
    this.target = attributes.get(XMLToken.OFFICE_TARGET_FRAME_NAME) ?? "";
  }

  /** Accumulates the display text of the field. @param value - Decoded text. @returns Nothing. */
  override characters(value: string): void {
    this.value += value;
  }

  /** Publishes the represented field record into its owning cell paragraph. @param element - Closing field token. @returns Nothing. */
  override endFastElement(element: XMLToken): void {
    let field: CellTextField;
    switch (element) {
      case XMLToken.TEXT_A:
        field = {
          kind: "url",
          url: this.href,
          representation: this.value,
          target: this.target,
          format: SvxURLFormat.Repr,
        };
        break;
      case XMLToken.TEXT_SHEET_NAME:
        field = { kind: "sheet", tab: this.tab };
        break;
      case XMLToken.TEXT_DATE:
        field = { kind: "date" };
        break;
      case XMLToken.TEXT_TITLE:
        field = { kind: "title" };
        break;
      default:
        return;
    }
    this.spans.push([this.value, this.style, field]);
  }
}

/** One paragraph of actual cell text, including its styled spans. */
export class ScXMLCellTextParaContext extends ScXMLCellTextSpanContext {
  /** Binds the cell that receives this paragraph. @param cell - Actual owning cell context. @returns Paragraph. */
  constructor(
    private readonly cell: {
      GetScImport(): ScXMLImport;
      setParagraph(value: CellTextParagraph): void;
    },
    tab: number,
  ) {
    super(cell.GetScImport(), [], tab, "", true);
  }
  /** Publishes the actual paragraph text to its native owning cell context. @returns Nothing. */
  override endFastElement(): void {
    this.cell.setParagraph(this.spans);
  }
}
