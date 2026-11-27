/** @fileoverview Native Calc ODF validation definition collection and export. */
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { escapeXml, exportText } from "../../../../xmloff/source/text/txtparae";
import { ScAddress, ScRefFlags } from "../../../inc/address";
import type { ScPatternAttr } from "../../../inc/patattr";
import { ScConditionMode } from "../../core/data/conditio.entry";
import type { ScDocument } from "../../core/data/document";
import {
  ScValidErrorStyle,
  type ScValidationData,
  ScValidationMode,
  TableValidationVisibility,
} from "../../core/data/validat";

const operators = new Map<ScConditionMode, string>([
  [ScConditionMode.Equal, "="],
  [ScConditionMode.Greater, ">"],
  [ScConditionMode.EqGreater, ">="],
  [ScConditionMode.Less, "<"],
  [ScConditionMode.EqLess, "<="],
  [ScConditionMode.NotEqual, "!="],
]);

const numericConditions = new Map<ScValidationMode, string>([
  [ScValidationMode.Whole, "cell-content-is-whole-number()"],
  [ScValidationMode.Decimal, "cell-content-is-decimal-number()"],
  [ScValidationMode.Date, "cell-content-is-date()"],
  [ScValidationMode.Time, "cell-content-is-time()"],
]);

/** Calc ODF validation container for rules actually referenced by exported cells. */
export class ScMyValidationsContainer {
  private readonly entries: ScValidationData[] = [];
  private readonly keys = new Map<number, string>();

  /** Binds the source workbook. @param document - Original Calc document. @returns Export container. */
  public constructor(private readonly document: ScDocument) {}

  /** Adds one native rule and returns its stable export identity. @param key - Cell pattern validation key. @returns ODF validation name or absence. */
  public AddValidation(key: number): string | undefined {
    const cached = this.keys.get(key);
    if (cached) return cached;
    const rule = this.document.GetValidationEntry(key);
    if (!rule) return undefined;
    const equal = this.entries.findIndex(
      /** Matches the original complete validation entry. @param candidate - Previously exported rule. @returns Equality. */
      (candidate) => candidate.EqualEntries(rule),
    );
    const index = equal < 0 ? this.entries.push(rule) : equal + 1;
    const name = `val${index}`;
    this.keys.set(key, name);
    return name;
  }

  /** Writes in first-reference order, before sheet tables. @returns ODF validation declarations. */
  public WriteValidations(): string {
    if (!this.entries.length) return "";
    const result = this.entries
      .map(
        /** Exports one original validation definition. @param rule - Native entry. @param index - Export order. @returns Validation XML. */
        (rule, index) => this.WriteValidation(rule, `val${index + 1}`),
      )
      .join("");
    return `<table:content-validations>${result}</table:content-validations>`;
  }

  /** Writes one condition, base cell and its saved messages. @param rule - Native validation entry. @param name - ODF validation name. @returns Validation declaration. */
  private WriteValidation(rule: ScValidationData, name: string): string {
    const condition = getCondition(this.document, rule);
    let attributes = ` table:name="${name}"`;
    if (condition) {
      attributes += ` table:condition="${escapeXml(condition)}" table:allow-empty-cell="${rule.IsIgnoreBlank()}"`;
      if (rule.IsCaseSensitive()) attributes += ' table:case-sensitive="true"';
      if (rule.GetDataMode() === ScValidationMode.List) {
        const list = rule.GetListType();
        const listType =
          list === TableValidationVisibility.Invisible
            ? "no"
            : list === TableValidationVisibility.SortedAscending
              ? "sort-ascending"
              : "unsorted";
        attributes += ` table:display-list="${listType}"`;
      }
    }
    const address = rule
      .GetValidSrcPos()
      .Format(
        ScRefFlags.VALID | ScRefFlags.TAB_3D,
        this.document,
        new ScAddress.Details(FormulaGrammar.AddressConvention.CONV_OOO),
      );
    try {
      attributes += ` table:base-cell-address="${escapeXml(text(address))}"`;
    } finally {
      address.dispose();
    }
    const [showInput, inputTitle, inputMessage] = rule.GetInput();
    const [showError, errorTitle, errorMessage, alert] = rule.GetErrMsg();
    const input = writeMessage("help-message", showInput, inputTitle, inputMessage);
    const style =
      alert === ScValidErrorStyle.Warning
        ? "warning"
        : alert === ScValidErrorStyle.Info
          ? "information"
          : alert === ScValidErrorStyle.None
            ? "reject"
            : "stop";
    const error =
      alert === ScValidErrorStyle.None && (showError || errorTitle || errorMessage)
        ? writeMessage("error-message", showError, "", "", style, true)
        : writeMessage("error-message", showError, errorTitle, errorMessage, style);
    return `<table:content-validation${attributes}>${input}${error}</table:content-validation>`;
  }
}

/** Writes the native validation expression in the selected ODF grammar. @param document - Source document. @param rule - Validation entry. @returns Namespaced condition or empty. */
function getCondition(document: ScDocument, rule: ScValidationData): string {
  const mode = rule.GetDataMode();
  if (mode === ScValidationMode.Any) return "";
  const grammar = document.GetStorageGrammar();
  const base = rule.GetValidSrcPos();
  const first = rule.GetExpression(base, 0, grammar);
  const second = rule.GetExpression(base, 1, grammar);
  const operation = rule.GetOperation();
  const prefix = FormulaGrammar.isPODF(grammar) ? "oooc:" : "of:";
  if (mode === ScValidationMode.List) return `${prefix}cell-content-is-in-list(${first})`;
  if (mode === ScValidationMode.Custom) return `${prefix}is-true-formula(${first})`;
  const textLength = mode === ScValidationMode.TextLength;
  const between = operation === ScConditionMode.Between || operation === ScConditionMode.NotBetween;
  let condition = numericConditions.get(mode) ?? "";
  if (first || (between && second)) {
    if (!textLength) condition += " and ";
    const subject = textLength ? "cell-content-text-length" : "cell-content";
    condition += between
      ? `${subject}-is-${operation === ScConditionMode.NotBetween ? "not-" : ""}between(${first},${second})`
      : `${subject}()${operators.get(operation) ?? ""}${first}`;
  }
  return condition ? prefix + condition : "";
}

/** Writes original help or alert text and visibility. @param tag - Message element. @param display - Whether enabled. @param title - Saved title. @param message - Saved message. @param alert - Optional error style token. @returns Message element. */
function writeMessage(
  tag: "help-message" | "error-message",
  display: boolean,
  title: string,
  message: string,
  alert?: string,
  force = false,
): string {
  if (!force && !display && !title && !message) return "";
  const attributes =
    (alert ? ` table:message-type="${alert}"` : "") +
    (title ? ` table:title="${escapeXml(title)}"` : "") +
    ` table:display="${display}"`;
  const lines = message.replace(/\r\n?/gu, "\n").split("\n");
  if (lines.at(-1) === "") lines.pop();
  const body = lines
    .map(
      /** Encodes one original prompt paragraph. @param line - Text line. @returns ODF paragraph. */
      (line) => `<text:p>${exportText(line)}</text:p>`,
    )
    .join("");
  return `<table:${tag}${attributes}>${body}</table:${tag}>`;
}

/** ScMyDefaultStyles uses the core column winner over the actual exported rows. */
export class ScMyDefaultStyles {
  private readonly names: string[] = [];
  private readonly tail: string;

  /** Selects each allocated column and the shared trailing column pattern. @param document - Format owner. @param tab - Sheet. @param lastRow - Inclusive export row. @param allocated - Number of real columns. @param styleName - ODF style lookup. @returns The column defaults. */
  constructor(
    document: ScDocument,
    tab: number,
    lastRow: number,
    allocated: number,
    styleName: (pattern: ScPatternAttr) => string,
  ) {
    /** Finds the ODF name at the core's winning row. @param col - Column. @returns Selected style. */
    const nameAt =
      /** Resolves the winning row style. @param col - Column. @returns ODF style name. */ (
        col: number,
      ): string => {
        const row = document.GetColDefault(tab, col, lastRow);
        const pattern = document.GetPattern(new ScAddress(col, row, tab));
        return pattern ? styleName(pattern) : "";
      };
    for (let col = 0; col < allocated; col++) this.names.push(nameAt(col));
    this.tail = nameAt(allocated);
  }

  /** Reads the assigned default for a real or shared column. @param col - Column. @returns Style name or empty standard. */
  Get(col: number): string {
    return this.names[col] ?? this.tail;
  }

  /** Stops a column group when its selected cell style changes. @param first - Start column. @param last - Maximum end column. @returns End of the same style run. */
  ClipRange(first: number, last: number): number {
    const name = this.Get(first);
    for (let col = first + 1; col <= last && col <= this.names.length; col++)
      if (this.Get(col) !== name) return col - 1;
    return last;
  }
}
