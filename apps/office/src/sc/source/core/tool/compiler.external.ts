/** @fileoverview Calc compiler external A1 cell and range references. */
import { FormulaGrammar, type Grammar } from "../../../../formula/inc/grammar";
import { FormulaErrorToken } from "../../../../formula/inc/token";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScAddress, ScRange, ScRefFlags } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import { ScComplexRefData, ScSingleRefData } from "../../../inc/refdata";
import { ScExternalDoubleRefToken, ScExternalSingleRefToken } from "../../../inc/token";

const quotedXlsx = /^'\[([0-9]+)\]((?:[^']|'')+)'!/u;
const unquotedXlsx = /^\[([0-9]+)\]([\p{L}\p{N}_]+)!/u;
const quotedNative = /^'((?:[^']|'')*)'#\$?(?:'((?:[^']|'')+)'|([\p{L}\p{N}_]+))\./u;
const singleAddress = /^\$?[A-Za-z]+\$?[1-9][0-9]*/u;
const rangeAddress = /^\$?[A-Za-z]+\$?[1-9][0-9]*:\.?\$?[A-Za-z]+\$?[1-9][0-9]*/u;

/** Parses a single-sheet external A1 reference with the original compiler token types. @param source - Formula suffix. @param grammar - Source grammar. @param document - Actual Calc document. @param origin - Current formula position. @returns Consumed characters and owned token. */
export function parseExternalReference(
  source: string,
  grammar: Grammar,
  document: ScDocument,
  origin: ScAddress,
): [number, ScExternalSingleRefToken | ScExternalDoubleRefToken | FormulaErrorToken] | undefined {
  const excel = grammar === FormulaGrammar.Grammar.GRAM_OOXML;
  const bracket = !excel && source.startsWith("[");
  const prefix = excel
    ? (quotedXlsx.exec(source) ?? unquotedXlsx.exec(source))
    : quotedNative.exec(bracket ? source.slice(1) : source);
  if (!prefix) return undefined;
  const offset = prefix[0].length + Number(bracket);
  const address = source.slice(offset);
  const range = rangeAddress.exec(address);
  const lexical = range?.[0] ?? singleAddress.exec(address)?.[0];
  if (!lexical || (bracket && address[lexical.length] !== "]")) return undefined;
  const length = offset + lexical.length + Number(bracket);
  const manager = document.GetExternalRefManager();
  const identity = (prefix[1] ?? "").replaceAll("''", "'");
  const file = excel
    ? manager.getWorkbookLink(Number(identity))
    : manager.getExternalFileId(identity);
  if (file === undefined) return [length, new FormulaErrorToken(FormulaError.NoRef)];
  const sheet = unicode((prefix[2] ?? prefix[3] ?? "").replaceAll("''", "'"));
  const name = document.GetSharedStringPool().intern(sheet);
  const input = unicode(lexical.replace(":.", ":"));
  try {
    if (range) {
      const addresses = new ScRange(origin, origin);
      const flags = addresses.Parse(input, document, ScAddress.detailsOOOa1);
      if (!(flags & ScRefFlags.VALID)) return [length, new FormulaErrorToken(FormulaError.NoRef)];
      const reference = new ScComplexRefData();
      reference.InitRange(addresses);
      reference.Ref1.SetColRel(!(flags & ScRefFlags.COL_ABS));
      reference.Ref1.SetRowRel(!(flags & ScRefFlags.ROW_ABS));
      reference.Ref1.SetFlag3D(true);
      reference.Ref2.SetColRel(!(flags & ScRefFlags.COL2_ABS));
      reference.Ref2.SetRowRel(!(flags & ScRefFlags.ROW2_ABS));
      reference.SetRange(document.GetSheetLimits(), addresses, origin);
      return [length, new ScExternalDoubleRefToken(file, name, reference)];
    }
    const cell = new ScAddress(origin);
    const flags = cell.Parse(input, document, ScAddress.detailsOOOa1);
    if (!(flags & ScRefFlags.VALID)) return [length, new FormulaErrorToken(FormulaError.NoRef)];
    const reference = new ScSingleRefData();
    reference.InitAddress(cell);
    reference.SetColRel(!(flags & ScRefFlags.COL_ABS));
    reference.SetRowRel(!(flags & ScRefFlags.ROW_ABS));
    reference.SetFlag3D(true);
    reference.SetAddress(document.GetSheetLimits(), cell, origin);
    return [length, new ScExternalSingleRefToken(file, name, reference)];
  } finally {
    input.dispose();
    name.dispose();
    sheet.dispose();
  }
}
