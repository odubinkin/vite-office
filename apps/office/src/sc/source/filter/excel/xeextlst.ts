/** @fileoverview Serializes original XLSX worksheet extension lists and inline conditional styles. */
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { rtl_createUuid } from "../../../../sal/rtl/uuid";
import { FSNS, type FastSerializerHelper } from "../../../../sax/inc/fshelper";
import { ScRange } from "../../../inc/address";
import { type ScCondFormatEntry, ScConditionMode } from "../../../inc/conditio";
import type { ScDocument } from "../../../inc/document";
import type { ScRangeList } from "../../../inc/rangelst";
import { x14Namespace, xmNamespace } from "../oox/extlstcontext";
import type { XclExpDxfs } from "./xestyle.dxf";
import { XclXmlUtils } from "./xestream";

/** An extended condition and its assigned worksheet priority. */
interface XclExpExtCondFormatData {
  readonly entry: ScCondFormatEntry;
  readonly type: string;
  readonly operator: string | null;
  readonly priority: number;
}

/** Constructs the Excel compatibility formula using a serialized criterion. @param mode - Condition operator. @param origin - Source cell. @param criterion - OOXML formula operand. @returns Compatibility formula. */
export function GetFixedFormula(mode: ScConditionMode, origin: string, criterion: string): string {
  switch (mode) {
    case ScConditionMode.BeginsWith:
      return `LEFT(${origin},LEN(${criterion}))=${criterion}`;
    case ScConditionMode.EndsWith:
      return `RIGHT(${origin},LEN(${criterion}))=${criterion}`;
    case ScConditionMode.ContainsText:
      return `NOT(ISERROR(SEARCH(${criterion},${origin})))`;
    default:
      return `ISERROR(SEARCH(${criterion},${origin}))`;
  }
}

/** Generates the original uppercase and braced worksheet UUID. @returns OOXML identifier. */
function generateGUIDString(): string {
  const bytes = new Uint8Array(16);
  rtl_createUuid(bytes, null, true);
  const hex = Array.from(
    bytes,
    /** Emits two hexadecimal digits. @param value - One UUID byte. @returns Hexadecimal digits. */ (
      value,
    ) => value.toString(16).padStart(2, "0"),
  ).join("");
  return `{${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}}`.toUpperCase();
}

const x14 = token("x14");
const xm = token("xm");

/** Owns the worksheet-level conditional formatting extension record. */
export class XclExpExtCondFormat {
  private readonly groups: { ranges: ScRangeList; rules: readonly XclExpExtCondFormatData[] }[] =
    [];

  /** Collects a conditional format's extension records. @param ranges - Its native range list. @param rules - Rules in workbook order. @returns Nothing. */
  AddRecord(ranges: ScRangeList, rules: readonly XclExpExtCondFormatData[]): void {
    if (rules.length) this.groups.push({ ranges, rules });
  }

  /** Writes the extension list at the end of the worksheet. @param output - Worksheet stream. @param document - Workbook. @param dxfs - Source differential styles. @returns Nothing. */
  SaveXml(output: FastSerializerHelper, document: ScDocument, dxfs: XclExpDxfs): void {
    if (this.groups.length === 0) return;
    output.startElement(token("extLst"));
    output.startElement(
      token("ext"),
      FSNS(token("xmlns"), x14),
      x14Namespace,
      token("uri"),
      "{78C0D931-6437-407d-A8EE-F0AAD7539E65}",
    );
    output.startElementNS(x14, token("conditionalFormattings"));
    for (const { ranges, rules } of this.groups) {
      output.startElementNS(
        x14,
        token("conditionalFormatting"),
        FSNS(token("xmlns"), xm),
        xmNamespace,
      );
      for (const rule of rules) this.SaveRule(output, document, dxfs, rule);
      output.startElementNS(xm, token("sqref"));
      output.write(XclXmlUtils.ToOString(document, ranges));
      output.endElementNS(xm, token("sqref"));
      output.endElementNS(x14, token("conditionalFormatting"));
    }
    output.endElementNS(x14, token("conditionalFormattings"));
    output.endElement(token("ext"));
    output.endElement(token("extLst"));
  }

  /** Writes a conditional rule and its inline style. @param output - Worksheet stream. @param document - Workbook. @param dxfs - Source differential styles. @param rule - Extended rule. @returns Nothing. */
  private SaveRule(
    output: FastSerializerHelper,
    document: ScDocument,
    dxfs: XclExpDxfs,
    rule: XclExpExtCondFormatData,
  ): void {
    const { entry, type, operator, priority } = rule;
    const source = entry.GetValidSrcPos();
    const mode = entry.GetOperation();
    const expression = entry.GetExpression(source, 0, FormulaGrammar.Grammar.GRAM_OOXML);
    output.startElementNS(
      x14,
      token("cfRule"),
      token("type"),
      type,
      token("priority"),
      String(priority),
      token("operator"),
      operator,
      token("id"),
      generateGUIDString(),
    );
    if (mode >= ScConditionMode.BeginsWith && mode <= ScConditionMode.NotContainsText) {
      const origin = new TextDecoder().decode(
        XclXmlUtils.ToOString(document, new ScRange(source, source)),
      );
      output.startElementNS(xm, token("f"));
      output.writeEscaped(GetFixedFormula(mode, origin, expression));
      output.endElementNS(xm, token("f"));
    }
    output.startElementNS(xm, token("f"));
    output.writeEscaped(expression);
    output.endElementNS(xm, token("f"));
    dxfs.SaveXmlExt(output, entry.GetStyleName(), x14);
    output.endElementNS(x14, token("cfRule"));
  }
}
