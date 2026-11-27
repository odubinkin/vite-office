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

/** The cell text contexts discard unsupported descendants without routing them as cell objects. */
class ScXMLCellTextContext extends ScXMLImportContext {
  /** Ignores an unrecognized inline subtree. @returns Inert text child. */
  override createUnknownChildContext(): SvXMLImportContext {
    return new SvXMLIgnoreContext(true);
  }
}

/** Appends character runs and fields from one ODF paragraph to the native cell. */
export class ScXMLCellTextParaContext extends ScXMLCellTextContext {
  private readonly spans: CellTextSpan[] = [];

  /** Binds the cell that receives this paragraph. @param cell - Actual owning cell context. @param tab - Current sheet. @returns Paragraph. */
  constructor(
    private readonly cell: {
      GetScImport(): ScXMLImport;
      setParagraph(value: CellTextParagraph): void;
    },
    private readonly tab: number,
  ) {
    super(cell.GetScImport());
  }

  /** Appends decoded text at the current native paragraph position. @param value - Decoded text. @param style - Active ODF style. @returns Nothing. */
  PushSpan(value: string, style: string): void {
    if (!value) return;
    const previous = this.spans.at(-1);
    if (previous?.[1] === style && previous[2] === undefined)
      this.spans[this.spans.length - 1] = [previous[0] + value, style];
    else this.spans.push([value, style]);
  }

  /** Appends one field in the same order as the ordinary text portions. @param value - Field presentation. @param style - ODF character style. @param field - Native field properties. @returns Nothing. */
  PushField(value: string, style: string, field: CellTextField): void {
    this.spans.push([value, style, field]);
  }

  /** Appends plain paragraph characters. @param value - SAX characters. @returns Nothing. */
  override characters(value: string): void {
    this.PushSpan(value, "");
  }

  /** Resolves spaces and cell field contexts shared by paragraphs and spans. @param element - Inline token. @param attributes - Source attributes. @param style - Active character style. @returns Field context or absence. */
  CreateFieldContext(
    element: XMLToken,
    attributes: FastAttributeList,
    style: string,
  ): SvXMLImportContext | undefined {
    switch (element) {
      case XMLToken.TEXT_S:
        return new ScXMLCellFieldSContext(this, attributes, style);
      case XMLToken.TEXT_A:
      case XMLToken.TEXT_SHEET_NAME:
      case XMLToken.TEXT_DATE:
      case XMLToken.TEXT_TITLE:
        return new ScXMLCellFieldContext(this.GetScImport(), this, style, this.tab);
    }
    return undefined;
  }

  /** Creates the supported native text child or ignores the unsupported inline subtree. @param element - Source token. @param attributes - Source attributes. @returns Child context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    switch (element) {
      case XMLToken.TEXT_SPAN:
        return new ScXMLCellTextSpanContext(this);
      case XMLToken.TEXT_RUBY:
        return new ScXMLCellTextRubyContext(this);
      case XMLToken.TEXT_TAB:
        this.characters("\t");
        break;
      case XMLToken.TEXT_LINE_BREAK:
        this.characters("\n");
        break;
      default:
        return this.CreateFieldContext(element, attributes, "") ?? new SvXMLIgnoreContext(true);
    }
    return new SvXMLIgnoreContext(true);
  }

  /** Publishes paragraph text and its original spans to the cell. @returns Nothing. */
  override endFastElement(): void {
    this.cell.setParagraph(this.spans);
  }
}

/** Forwards the original span style to characters and recognized nested field contexts. */
class ScXMLCellTextSpanContext extends ScXMLCellTextContext {
  private style = "";

  /** Binds the span to the surrounding native cell paragraph. @param paragraph - Owning cell text. @returns Span context. */
  constructor(protected readonly paragraph: ScXMLCellTextParaContext) {
    super(paragraph.GetScImport());
  }

  /** Reads the source character style before consuming text. @param _element - Span token. @param attributes - Source attributes. @returns Nothing. */
  override startFastElement(_element: XMLToken, attributes: FastAttributeList): void {
    this.style = attributes.get(XMLToken.TEXT_STYLE_NAME) ?? "";
  }

  /** Appends characters with the span style. @param value - SAX characters. @returns Nothing. */
  override characters(value: string): void {
    this.paragraph.PushSpan(value, this.style);
  }

  /** Routes styled field children, with the narrower native span grammar. @param element - Source token. @param attributes - Source attributes. @returns Child context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    return (
      this.paragraph.CreateFieldContext(element, attributes, this.style) ??
      new SvXMLIgnoreContext(true)
    );
  }
}

/** Copies the displayed base portions and consumes the unrepresented phonetic guide. */
class ScXMLCellTextRubyContext extends ScXMLCellTextContext {
  /** Binds the ruby base to the live native cell paragraph. @param paragraph - Owning cell paragraph. @returns Ruby context. */
  constructor(private readonly paragraph: ScXMLCellTextParaContext) {
    super(paragraph.GetScImport());
  }

  /** Routes the native ruby-base context; the spreadsheet never uses the guide text or its style. @param element - Source token. @returns Child context. */
  override createFastChildContext(element: XMLToken): SvXMLImportContext {
    return element === XMLToken.TEXT_RUBY_BASE
      ? new ScXMLCellRubyBaseContext(this.paragraph)
      : new SvXMLIgnoreContext(true);
  }
}

/** Ruby base retains direct text and independent child span styles. */
class ScXMLCellRubyBaseContext extends ScXMLCellTextSpanContext {
  /** Creates the only recognized base child, a new span with its own style. @param element - Source token. @returns Child context. */
  override createFastChildContext(element: XMLToken): SvXMLImportContext {
    return element === XMLToken.TEXT_SPAN
      ? new ScXMLCellTextSpanContext(this.paragraph)
      : new SvXMLIgnoreContext(true);
  }
}

/** Owns one source text:s count and writes it at most once. */
class ScXMLCellFieldSContext extends ScXMLCellTextContext {
  private count: number;

  /** Imports the original positive count under the shared parser resource ceiling. @param paragraph - Owning cell text. @param attributes - Source attributes. @param style - Active character style. @returns Spaces context. */
  constructor(
    private readonly paragraph: ScXMLCellTextParaContext,
    attributes: FastAttributeList,
    private readonly style: string,
  ) {
    super(paragraph.GetScImport());
    this.count = Math.max(1, attributes.getAsInteger(XMLToken.TEXT_C) ?? 1);
    if (this.count > 1_000_000) throw new Error("ODS text space limit exceeded");
  }

  /** Flushes spaces before a misplaced child without consuming that child's text. @returns Child context. */
  override createFastChildContext(): SvXMLImportContext {
    this.PushSpaces();
    return new SvXMLIgnoreContext(true);
  }

  /** Flushes spaces before an unknown child in the same order. @returns Child context. */
  override createUnknownChildContext(): SvXMLImportContext {
    return this.createFastChildContext();
  }

  /** Publishes the spaces if no misplaced child already flushed them. @returns Nothing. */
  override endFastElement(): void {
    this.PushSpaces();
  }

  /** Appends the stored count and consumes it. @returns Nothing. */
  private PushSpaces(): void {
    if (this.count === 0) return;
    this.paragraph.PushSpan(" ".repeat(this.count), this.style);
    this.count = 0;
  }
}

/** Collects the original field payload before handing it to the cell editor. */
class ScXMLCellFieldContext extends SvXMLImportContext {
  private value = "";
  private href = "";
  private target = "";

  /** Binds the field to the paragraph run and its live sheet. @param owner - Importer. @param paragraph - Owning cell paragraph. @param style - Enclosing style. @param tab - Current sheet. @returns Context. */
  constructor(
    private readonly owner: ScXMLImport,
    private readonly paragraph: ScXMLCellTextParaContext,
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
    this.paragraph.PushField(this.value, this.style, field);
  }
}
