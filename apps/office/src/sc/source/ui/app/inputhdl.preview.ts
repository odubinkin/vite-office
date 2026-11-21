/** @fileoverview Source input-handler FormulaPreview calculation, independent of committing the edit. */
import { FormulaDoubleToken, FormulaStringToken } from "../../../../formula/inc/token";
import { OpCode } from "../../../../formula/inc/opcode";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { LANGUAGE_SYSTEM } from "../../../../i18nlangtag/inc/lang";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScAddress, ScRange, ScRefFlags } from "../../../inc/address";
import { ScCompiler } from "../../../inc/compiler";
import type { ScDocument } from "../../../inc/document";
import { ScGlobal } from "../../../inc/global";
import type { ScTokenArray } from "../../../inc/tokenarray";
import { ScInterpreter } from "../../core/tool/interpr4";

/** Evaluates the active selection or full edit text using the current workbook grammar. @param doc - Active workbook. @param position - Editing position. @param source - Selected source text. @returns Native quick-help text. */
export function CalculateFormulaPreview(
  doc: ScDocument,
  position: ScAddress,
  source: string,
): string {
  if (!source) return "";
  const input = unicode(source);
  let code: ScTokenArray | undefined;
  try {
    code = CompilePreview(doc, position, input);
    const labelRange = code.HasOpCode(OpCode.ocColRowName) && code.GetCodeLen() <= 1;
    if (labelRange) {
      const grouped = unicode("(" + source + ")");
      try {
        code.Clear();
        code = CompilePreview(doc, position, grouped);
      } finally {
        grouped.dispose();
      }
    }
    if (code.GetCodeError() !== FormulaError.NONE) return ErrorText(code.GetCodeError());
    const interpreter = new ScInterpreter(null, doc, doc.GetNonThreadedContext(), position, code);
    try {
      interpreter.Interpret();
      const error = interpreter.GetError();
      if (error !== FormulaError.NONE) return ErrorText(error);
      const token = interpreter.GetResultToken();
      const formatter = doc.GetFormatTable();
      const format = interpreter.GetRetFormatType();
      let value = "";
      if (token instanceof FormulaDoubleToken) {
        const number = token.GetDouble();
        const formatKey = formatter.GetStandardFormat(number, 0, format, LANGUAGE_SYSTEM);
        const printed = formatter.GetInputLineString(number, formatKey);
        try {
          value = text(printed);
        } finally {
          printed.dispose();
        }
      } else if (token instanceof FormulaStringToken)
        value = '"' + text(token.GetString().getString()) + '"';
      return value && (labelRange || IsPreviewRange(doc, position, input)) ? value + " ..." : value;
    } finally {
      interpreter.Dispose();
    }
  } catch (failure) {
    if (failure instanceof Error && /not implemented/.test(failure.message))
      return ErrorText(FormulaError.NoName);
    throw failure;
  } finally {
    code?.Clear();
    input.dispose();
  }
}

/** Compiles the transient preview as in ScSimpleFormulaCalculator. @param doc - Actual workbook. @param position - Input origin. @param input - Selected formula text. @returns Compiled preview tokens. */
function CompilePreview(doc: ScDocument, position: ScAddress, input: OUStringConstReference) {
  const grammar = doc.GetGrammar();
  const code = new ScCompiler(doc, position, grammar).CompileString(input);
  try {
    new ScCompiler(doc, position, code, grammar).CompileTokenArray();
    return code;
  } catch (error) {
    code.Clear();
    throw error;
  }
}

/** Looks for the native range marker without replacing an already-computed preview on an unsupported header. @param doc - Workbook. @param position - Input origin. @param input - Original expression. @returns Whether to mark the preview as a range. */
function IsPreviewRange(
  doc: ScDocument,
  position: ScAddress,
  input: OUStringConstReference,
): boolean {
  const details = new ScAddress.Details(doc.GetAddressConvention(), position);
  try {
    return Boolean(new ScRange(position).Parse(input, doc, details) & ScRefFlags.VALID);
  } catch (failure) {
    if (failure instanceof Error && /not implemented/.test(failure.message)) return false;
    throw failure;
  }
}

/** Converts a formula error to the current native displayed symbol. @param error - Calculation error. @returns Display symbol. */
function ErrorText(error: FormulaError): string {
  const value = ScGlobal.GetErrorString(error);
  try {
    return text(value);
  } finally {
    value.dispose();
  }
}
