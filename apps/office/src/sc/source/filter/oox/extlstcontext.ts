/** @fileoverview Original worksheet extension contexts for extended conditional formatting. */
import type { SaxesAttributeNS, SaxesTagNS } from "saxes";
import type { FragmentContext } from "../../../../oox/source/core/fragmenthandler";
import { ScConditionMode } from "../../../inc/conditio";
import type { ScDocument } from "../../../inc/document";
import {
  type CondFormatBuffer,
  type ExtCondFormatRuleModel,
  convertToInternalOperator,
  importCondFormatRanges,
} from "./condformatbuffer";
import { styleIndex, type StylesBuffer } from "./stylesbuffer";
import type { Dxf } from "./stylesbuffer.dxf";
import { attribute, isSpreadsheetTag } from "./workbookfragment";

export const x14Namespace = "http://schemas.microsoft.com/office/spreadsheetml/2009/9/main";
export const xmNamespace = "http://schemas.microsoft.com/office/excel/2006/main";

/** Provides the original inert SAX hooks for extension containers. */
abstract class ExtensionContainer implements FragmentContext {
  /** Selects the original child context. @param tag - XML child. @returns Context or ignored element. */
  abstract createFastChildContext(tag: SaxesTagNS): FragmentContext | null;
  /** Opens a structural container. @returns Nothing. */
  startFastElement(): void {}
  /** Closes a structural container. @returns Nothing. */
  endFastElement(): void {}
  /** Ignores formatting whitespace. @returns Nothing. */
  characters(): void {}
}

/** Dispatches worksheet extLst records to their original extension owner. */
export class ExtLstGlobalContext extends ExtensionContainer {
  private styleIndex = 0;

  /** Binds the worksheet extension owners. @param formats - Worksheet conditional formats. @param styles - Workbook styles. @param document - Workbook. @param tab - Native sheet. @returns Worksheet extension context. */
  constructor(
    private readonly formats: CondFormatBuffer,
    private readonly styles: StylesBuffer,
    private readonly document: ScDocument,
    private readonly tab: number,
  ) {
    super();
  }

  /** Opens an original extension record and its conditional-format groups. @param tag - XML child. @returns Child context or ignored element. */
  override createFastChildContext(tag: SaxesTagNS): FragmentContext | null {
    if (isSpreadsheetTag(tag) && tag.local === "ext") return new ExtGlobalContext(this);
    return null;
  }

  /** Creates a group bound to this worksheet. @returns Conditional formatting context. */
  createConditionalFormatting(): FragmentContext {
    return new ExtConditionalFormattingContext(this.document, this.tab, this.formats, this);
  }

  /** Creates an indexed extension differential style. @returns Import context for the style. */
  createExtDxf(): Dxf {
    return this.styles.createExtDxf();
  }

  /** Materializes the next original extension style. @returns Named cell style. */
  createExtDxfStyle(): string {
    const index = this.styleIndex++;
    return this.styles.createExtDxfStyle(this.document, index);
  }
}

/** Opens the extension handlers represented by the worksheet. */
class ExtGlobalContext extends ExtensionContainer {
  /** Borrows the worksheet extension list. @param list - Worksheet extension. @returns Extension context. */
  constructor(private readonly list: ExtLstGlobalContext) {
    super();
  }
  /** Selects the represented x14 container. @param tag - XML element. @returns Context or ignored subtree. */
  override createFastChildContext(tag: SaxesTagNS): FragmentContext | null {
    if (tag.uri !== x14Namespace) return null;
    if (tag.local === "conditionalFormattings") return this;
    return tag.local === "conditionalFormatting" ? this.list.createConditionalFormatting() : null;
  }
}

/** Collects original x14 condition models and their xm range list. */
class ExtConditionalFormattingContext implements FragmentContext {
  private readonly rules: ExtCondFormatRuleModel[] = [];
  private readonly formulas: string[] = [];
  private readonly priorities: number[] = [];
  private element = "";
  private ranges = "";
  private mode = ScConditionMode.NONE;
  private priority = -1;

  /** Binds the native worksheet and inline styles. @param document - Workbook. @param tab - Worksheet. @param formats - Conditional format owner. @param styles - Extension style owner. @returns Group context. */
  constructor(
    private readonly document: ScDocument,
    private readonly tab: number,
    private readonly formats: CondFormatBuffer,
    private readonly styles: ExtLstGlobalContext,
  ) {}

  /** Routes the original x14 rule and xm text elements. @param tag - XML child. @param attrs - Original attributes. @returns Child context or ignored subtree. */
  createFastChildContext(
    tag: SaxesTagNS,
    attrs: readonly SaxesAttributeNS[],
  ): FragmentContext | null {
    if (tag.uri === x14Namespace) {
      if (tag.local === "cfRule" && this.element === "conditionalFormatting") {
        const mode = convertToInternalOperator(
          attribute(attrs, "type"),
          attribute(attrs, "operator"),
        );
        if (mode === undefined) return null;
        this.mode = mode;
        this.priority = styleIndex(attribute(attrs, "priority"));
        this.priorities.push(this.priority);
        return this;
      }
      if (tag.local === "dxf" && this.element === "cfRule") return this.styles.createExtDxf();
    }
    if (tag.uri !== xmNamespace) return null;
    if (tag.local === "f" && this.element === "cfRule") return this;
    return tag.local === "sqref" && this.element === "conditionalFormatting" ? this : null;
  }

  /** Starts collecting the current XML record. @param tag - XML element. @returns Nothing. */
  startFastElement(tag: SaxesTagNS): void {
    this.element = tag.local;
    if (tag.local === "f") this.formulas.push("");
  }

  /** Collects formulas and range lists across SAX chunks. @param value - XML content. @returns Nothing. */
  characters(value: string): void {
    if (this.element === "f") this.formulas[this.formulas.length - 1] += value;
    if (this.element === "sqref") this.ranges += value;
  }

  /** Finishes a rule or publishes the original range group. @param tag - XML element. @returns Nothing. */
  endFastElement(tag: SaxesTagNS): void {
    if (tag.local === "f") {
      this.element = "cfRule";
    } else if (tag.local === "cfRule") {
      this.closeRule();
      this.element = "conditionalFormatting";
    } else if (tag.local === "sqref") {
      const ranges = importCondFormatRanges(this.ranges, this.document, this.tab);
      if (!ranges.empty() && this.rules.length) {
        this.rules.sort(
          /** Orders extension rules by source priority. @param first - First rule. @param second - Second rule. @returns Sort order. */
          (first, second) => first.priority - second.priority,
        );
        this.formats.importExtCondFormat(ranges, this.rules, this.priorities);
      }
      this.element = "conditionalFormatting";
    }
  }

  /** Collects the second operand for text rules or retains the sole formula as a direct condition. @returns Nothing. */
  private closeRule(): void {
    const style = this.styles.createExtDxfStyle();
    const mode = this.mode;
    const isText = mode >= ScConditionMode.BeginsWith && mode <= ScConditionMode.NotContainsText;
    const direct = isText && this.formulas.length === 1;
    const expression = isText && !direct ? this.formulas[1] : this.formulas.at(-1);
    if (expression)
      this.rules.push({
        mode: direct ? ScConditionMode.Direct : mode,
        expression,
        style,
        priority: this.priority,
      });
    this.formulas.length = 0;
  }
}
