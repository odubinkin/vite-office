/** @fileoverview Native external single and double references in Calc's formula conventions. */
import { expect, it } from "vitest";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { FormulaErrorToken } from "../../../../formula/inc/token";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { ScAddress } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { ScExternalDoubleRefToken, ScExternalSingleRefToken } from "../../../inc/token";
import { ScCompiler } from "./compiler";

it("retains the source workbook slot, the cache file ID and relative A1 coordinates", /** Checks real external formula tokens and their native ODF spelling. @returns Nothing. */ () => {
  const document = new ScDocument();
  const origin = new ScAddress(4, 9, 0);
  const xlsx = FormulaGrammar.Grammar.GRAM_OOXML;
  const odf = FormulaGrammar.Grammar.GRAM_ODFF;
  const source = unicode("'[7]Owner''s Data'!C$3:$E7");
  const output = new OUString();
  try {
    document.GetExternalRefManager().setWorkbookLink(7, "Source's workbook.xlsx");
    const code = new ScCompiler(document, origin, xlsx).CompileString(source);
    try {
      const range = code.FirstToken();
      expect(range).toBeInstanceOf(ScExternalDoubleRefToken);
      const external = range as ScExternalDoubleRefToken;
      expect(external.GetFileId()).toBe(0);
      expect(text(external.GetTableName().getString())).toBe("Owner's Data");
      expect(external.GetDoubleRef().Ref1.IsColRel()).toBe(true);
      expect(external.GetDoubleRef().Ref1.IsRowRel()).toBe(false);
      expect(external.GetDoubleRef().Ref2.IsRowRel()).toBe(true);
      new ScCompiler(document, origin, code, odf).CreateStringFromTokenArray(output);
      expect(text(output)).toBe("['file:///Source''s%20workbook.xlsx'#$'Owner''s Data'.C$3:.$E7]");
      const restored = new ScCompiler(document, origin, odf).CompileString(output);
      try {
        expect(restored.FirstToken()?.equals(external)).toBe(true);
      } finally {
        restored.Clear();
      }
    } finally {
      code.Clear();
    }
  } finally {
    source.dispose();
    output.dispose();
    document.Dispose();
  }
});

it("rejects missing indexed sources and out-of-range cells with native error tokens", /** Checks external admission without consulting any remote workbook. @returns Nothing. */ () => {
  const document = new ScDocument();
  try {
    document.GetExternalRefManager().setWorkbookLink(1, "external.xlsx");
    const compiler = new ScCompiler(document, new ScAddress(), FormulaGrammar.Grammar.GRAM_OOXML);
    for (const [label, tokenClass] of [
      ["[1]Sheet1!$A1", ScExternalSingleRefToken],
      ["[2]Sheet1!$A1", FormulaErrorToken],
      ["[1]Sheet1!XFE1", FormulaErrorToken],
      ["[1]Sheet1!A1:XFE1", FormulaErrorToken],
    ] as const) {
      const source = unicode(label);
      try {
        const code = compiler.CompileString(source);
        try {
          const token = code.FirstToken();
          expect(token).toBeInstanceOf(tokenClass);
          if (token instanceof FormulaErrorToken) expect(token.GetError()).toBe(FormulaError.NoRef);
        } finally {
          code.Clear();
        }
      } finally {
        source.dispose();
      }
    }
  } finally {
    document.Dispose();
  }
});
