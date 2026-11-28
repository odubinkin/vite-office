/** @fileoverview Original Calc ODF content-validation contexts and import descriptors. */
import { SvXMLImportContext, type FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import { ScConditionMode } from "../../core/data/conditio.entry";
import {
  ScValidErrorStyle,
  ScValidationData,
  ScValidationMode,
  TableValidationVisibility,
} from "../../core/data/validat";
import { ScXMLConditionHelper } from "./XMLConverter";
import type { ScXMLFormula, ScXMLImport } from "./xmlimprt";
import { ScXMLImportContext } from "./importcontext";
import type { ScDocument } from "../../../inc/document";
import { ScAddress, type ScRange } from "../../../inc/address";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { ScCompiler } from "../../../inc/compiler";
import type { ScTokenArray } from "../../../inc/tokenarray";
import { ScRangeStringConverter } from "../../core/tool/rangeutl";
import { SfxUInt32Item } from "../../../../svl/source/items/intitem";
import { ScPatternAttr } from "../../../inc/patattr";
import { ATTR_VALIDDATA } from "../../../inc/scitems";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";

/** Original persisted input or error prompt. */
interface ScXMLValidationMessage {
  readonly title: string;
  readonly message: string;
  readonly display: boolean;
}

/** Parsed Calc validation condition and document binding. */
export interface ScMyImportValidation {
  readonly name: string;
  readonly base: string;
  readonly mode: ScValidationMode;
  readonly comparison: ScConditionMode;
  readonly operands: readonly ScXMLFormula[];
  readonly input: ScXMLValidationMessage;
  readonly error: ScXMLValidationMessage;
  readonly alert: ScValidErrorStyle;
  readonly ignoreBlank: boolean;
  readonly caseSensitive: boolean;
  readonly showList: TableValidationVisibility;
}

const emptyMessage: ScXMLValidationMessage = { title: "", message: "", display: false };
const alertStyles = new Map([
  ["warning", ScValidErrorStyle.Warning],
  ["information", ScValidErrorStyle.Info],
  ["reject", ScValidErrorStyle.None],
  ["macro", ScValidErrorStyle.Macro],
]);
const validationOperations = new Map<string, ScValidationMode>([
  ["cell-content-is-whole-number", ScValidationMode.Whole],
  ["cell-content-is-decimal-number", ScValidationMode.Decimal],
  ["cell-content-is-date", ScValidationMode.Date],
  ["cell-content-is-time", ScValidationMode.Time],
  ["cell-content-text-length", ScValidationMode.TextLength],
  ["cell-content-text-length-is-between", ScValidationMode.TextLength],
  ["cell-content-text-length-is-not-between", ScValidationMode.TextLength],
  ["cell-content-is-in-list", ScValidationMode.List],
  ["is-true-formula", ScValidationMode.Custom],
]);

/** Read an ODF validation condition in its native storage grammar. @param formula - Attribute after namespace resolution. @returns Native mode, comparison and formula operands. */
function getCondition(
  formula: ScXMLFormula,
): Pick<ScMyImportValidation, "mode" | "comparison" | "operands"> {
  const input = formula.source;
  const initial = ScXMLConditionHelper.parseConditionAt(input, 0);
  const type = initial ? validationOperations.get(initial.name) : undefined;
  if (!initial || type === undefined)
    return { mode: ScValidationMode.Any, comparison: ScConditionMode.NONE, operands: [] };
  const numeric = type >= ScValidationMode.Whole && type <= ScValidationMode.Time;
  let condition = initial;
  if (numeric) {
    const conjunction = ScXMLConditionHelper.parseConditionAt(input, initial.endIndex);
    const comparison =
      conjunction?.name === "and"
        ? ScXMLConditionHelper.parseConditionAt(input, conjunction.endIndex)
        : undefined;
    if (
      comparison?.name === "cell-content" ||
      comparison?.name === "cell-content-is-between" ||
      comparison?.name === "cell-content-is-not-between"
    )
      condition = comparison;
  }
  const mode = condition.mode === ScConditionMode.NONE ? ScValidationMode.Any : type;
  return {
    mode,
    comparison: condition.mode,
    operands: condition.operands.map(
      /** Keeps an operand in the condition's original formula grammar. @param source - Operand expression. @returns Native grammar and expression. */
      (source) => ({ source, grammar: formula.grammar }),
    ),
  };
}

/** Original content-validations list context. */
export class ScXMLContentValidationsContext extends ScXMLImportContext {
  /** Selects a declaration before the containing cells reference its name. @param element - Child token. @param attributes - Declaration attributes. @returns Validation context. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element === XMLToken.TABLE_CONTENT_VALIDATION)
      return new ScXMLContentValidationContext(this.GetScImport(), attributes);
    return new SvXMLImportContext();
  }
}

/** Captures the declarations separately from cell attributes, as in xmlcvali.cxx. */
class ScXMLContentValidationContext extends ScXMLImportContext {
  private input = emptyMessage;
  private error = emptyMessage;
  private alert = ScValidErrorStyle.Stop;

  /** Reads the declaration's original attributes. @param owner - Calc importer. @param attributes - Validation attributes in their source namespace. @returns Context. */
  public constructor(
    owner: ScXMLImport,
    private readonly attributes: FastAttributeList,
  ) {
    super(owner);
  }

  /** Sends help and error message children to their respective context. @param element - Child token. @param attributes - Message attributes. @returns Message context. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element === XMLToken.TABLE_HELP_MESSAGE)
      return new ScXMLValidationMessageContext(
        attributes,
        /** Saves the input prompt. @param message - Original input prompt. @returns Nothing. */
        (message) => {
          this.input = message;
        },
      );
    if (element === XMLToken.TABLE_ERROR_MESSAGE) {
      const type = attributes.get(XMLToken.TABLE_MESSAGE_TYPE);
      this.alert = alertStyles.get(type ?? "") ?? ScValidErrorStyle.Stop;
      return new ScXMLValidationMessageContext(
        attributes,
        /** Saves the error prompt. @param message - Original error prompt. @returns Nothing. */
        (message) => {
          this.error = message;
        },
      );
    }
    return new SvXMLImportContext();
  }

  /** Saves a named definition for the cell importer. @returns Nothing. */
  public override endFastElement(): void {
    const owner = this.GetScImport();
    const raw = this.attributes.get(XMLToken.TABLE_CONDITION) ?? "";
    const style = this.attributes.get(XMLToken.TABLE_DISPLAY_LIST);
    owner.AddValidation({
      name: this.attributes.get(XMLToken.TABLE_NAME) ?? "",
      base: this.attributes.get(XMLToken.TABLE_BASE_CELL_ADDRESS) ?? "",
      ...getCondition(owner.ExtractFormulaNamespaceGrammar(raw, this.attributes)),
      input: this.input,
      error: this.error,
      alert: this.alert,
      ignoreBlank: this.attributes.get(XMLToken.TABLE_ALLOW_EMPTY_CELL) !== "false",
      caseSensitive: this.attributes.get(XMLToken.TABLE_CASE_SENSITIVE) === "true",
      showList:
        style === "no"
          ? TableValidationVisibility.Invisible
          : style === "sort-ascending" || style === "sorted-ascending"
            ? TableValidationVisibility.SortedAscending
            : TableValidationVisibility.Unsorted,
    });
  }
}

/** Collects a validation message's paragraphs using the source line boundary. */
class ScXMLValidationMessageContext extends SvXMLImportContext {
  private readonly paragraphs: ScXMLValidationParagraph[] = [];

  /** Retains message metadata and its owning child callback. @param attributes - Message attributes. @param publish - Original declaration target. @returns Context. */
  public constructor(
    private readonly attributes: FastAttributeList,
    private readonly publish: (message: ScXMLValidationMessage) => void,
  ) {
    super();
  }

  /** Creates the text context for each original paragraph. @param element - Child token. @returns Message paragraph context. */
  public override createFastChildContext(element: XMLToken): SvXMLImportContext | null {
    if (element !== XMLToken.TEXT_P) return null;
    const paragraph = new ScXMLValidationParagraph();
    this.paragraphs.push(paragraph);
    return paragraph;
  }

  /** Publishes the complete paragraph string and source flags. @returns Nothing. */
  public override endFastElement(): void {
    this.publish({
      title: this.attributes.get(XMLToken.TABLE_TITLE) ?? "",
      message: this.paragraphs
        .map(
          /** Reads an original message paragraph. @param paragraph - Paragraph context. @returns Text. */
          (paragraph) => paragraph.value,
        )
        .join("\n"),
      display: this.attributes.get(XMLToken.TABLE_DISPLAY) === "true",
    });
  }
}

/** Native plain-text paragraph context used by Calc messages. */
class ScXMLValidationParagraph extends SvXMLImportContext {
  public value = "";

  /** Expands native text:s and gives other children the default XML context. @param element - Child token. @param attributes - Element attributes. @returns Default context. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element === XMLToken.TEXT_S) {
      const count = Number.parseInt(attributes.get(XMLToken.TEXT_C) ?? "", 10) || 1;
      if (count > 0) this.value += " ".repeat(count);
    }
    return new SvXMLImportContext();
  }

  /** Appends parser-decoded message text. @param value - Character data. @returns Nothing. */
  public override characters(value: string): void {
    this.value += value;
  }
}

/** Resolves referenced rules and applies their original pattern delta. @param document - Calc workbook. @param validations - Parsed rules by XML name. @param ranges - Deferred validation ranges. @returns Nothing. */
export function FinalizeValidations(
  document: ScDocument,
  validations: Map<string, ScMyImportValidation>,
  ranges: { name: string; range: ScRange }[],
): void {
  const keys = new Map<string, number>();
  for (const { name, range } of ranges) {
    let key = keys.get(name);
    if (key === undefined) {
      const descriptor = validations.get(name);
      if (!descriptor) continue;
      const base = new ScAddress();
      ScRangeStringConverter.GetAddressFromString(
        base,
        descriptor.base,
        document,
        FormulaGrammar.AddressConvention.CONV_OOO,
        [0],
      );
      const tokens: ScTokenArray[] = [];
      try {
        for (const operand of descriptor.operands) {
          const expression = unicode(operand.source);
          try {
            tokens.push(new ScCompiler(document, base, operand.grammar).CompileString(expression));
          } finally {
            expression.dispose();
          }
        }
        const rule = new ScValidationData(
          descriptor.mode,
          descriptor.comparison,
          tokens,
          document,
          base,
          document.GetStorageGrammar(),
        );
        try {
          rule.SetIgnoreBlank(descriptor.ignoreBlank);
          rule.SetCaseSensitive(descriptor.caseSensitive);
          rule.SetListType(descriptor.showList);
          rule.SetInput(descriptor.input.title, descriptor.input.message);
          if (!descriptor.input.display) rule.ResetInput();
          rule.SetError(descriptor.error.title, descriptor.error.message, descriptor.alert);
          if (!descriptor.error.display) rule.ResetError();
          key = document.AddValidationEntry(rule);
          keys.set(name, key);
        } finally {
          rule.Dispose();
        }
      } finally {
        for (const code of tokens) code.Clear();
      }
    }
    if (!key) continue;
    const pattern = new ScPatternAttr(document.getCellAttributeHelper());
    const item = new SfxUInt32Item(ATTR_VALIDDATA, key);
    try {
      pattern.ItemSetPut(item);
      document.ApplyPatternAreaTab(
        range.aStart.Col(),
        range.aStart.Row(),
        range.aEnd.Col(),
        range.aEnd.Row(),
        range.aStart.Tab(),
        pattern,
      );
    } finally {
      item.Dispose();
      pattern.Dispose();
    }
  }
  ranges.length = 0;
  validations.clear();
}
