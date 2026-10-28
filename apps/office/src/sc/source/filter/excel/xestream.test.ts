/** @fileoverview XLSX cached-result and XML value primitives through real Calc cells, SAL values, fragment serializers and committed ZIP parts. Whole workbook/UI export remains separate. */
import { assert, expect, it } from "vitest";
import { XclXmlUtils as X } from "./xestream";
import { XclTools } from "./xltools";
import { ScDocument } from "../../../inc/document";
import { ScAddress, ScRange, MAXCOL, MAXROW } from "../../../inc/address";
import { ScFormulaCell, ScFormulaCellGroup } from "../../../inc/formulacell";
import { FormulaError as E, GetDoubleErrorValue } from "../../../../formula/inc/errorcodes";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import {
  FormulaErrorToken,
  FormulaMissingToken,
  FormulaStringToken,
} from "../../../../formula/inc/token";
import { SharedString } from "../../../../svl/inc/sharedstring";
import { SvNumFormatType } from "../../../../svl/inc/zforlist";
import { Color, ColorAlpha } from "../../../../tools/inc/color";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ZipStorage } from "../../../../oox/source/helper/zipstorage";
import { XmlFilterBase } from "../../../../oox/source/core/xmlfilterbase";
import { FragmentHandler } from "../../../../oox/source/core/fragmenthandler";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
const grammar = FormulaGrammar.Grammar.GRAM_NATIVE;
/** Terminates an actual ASCII argument for the source char-pointer overload. @param value - ASCII text. @returns Pointer view. */
function ascii(value: string): Uint8Array {
  return Uint8Array.from(
    value + "\0",
    /** Copies ASCII code units. @param unit - Unit. @returns Byte. */ (unit) => unit.charCodeAt(0),
  );
}
/** Actual initialized document. @returns Owner. */
function document(): ScDocument {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  return doc;
}
/** Original output-reference projection from the real cell. @param cell - Actual formula. @returns Native type and Unicode text. */
function result(cell: ScFormulaCell): [string, string] {
  const type: [string] = ["unchanged"],
    value = new OUString();
  try {
    X.GetFormulaTypeAndValue(cell, type, value);
    return [type[0], text(value)];
  } finally {
    value.dispose();
  }
}
it.each([
  [E.IllegalArgument, 15],
  [E.IllegalParameter, 15],
  [E.PairExpected, 15],
  [E.OperatorExpected, 15],
  [E.VariableExpected, 15],
  [E.ParameterExpected, 15],
  [E.NoValue, 15],
  [E.CircularReference, 15],
  [E.IllegalFPOperation, 36],
  [E.DivisionByZero, 7],
  [E.NoCode, 0],
  [E.NoRef, 23],
  [E.NoName, 29],
  [E.NoAddin, 29],
  [E.NoMacro, 29],
  [E.NotAvailable, 42],
  [E.Spill, 43],
  [E.NONE, 42],
] as const)(
  "keeps original Calc error %s to Excel byte %s",
  /** Original many-to-one export mapping. @param error - Core error. @param byte - Excel byte. @returns Nothing. */ (
    error,
    byte,
  ) => {
    expect(XclTools.GetXclErrorCode(error)).toBe(byte);
  },
);
it.each([
  [0, E.NoCode],
  [7, E.DivisionByZero],
  [15, E.NoValue],
  [23, E.NoRef],
  [29, E.NoName],
  [36, E.IllegalFPOperation],
  [42, E.NotAvailable],
  [43, E.Spill],
  [255, E.NotAvailable],
  [263, E.DivisionByZero],
] as const)(
  "retains original Excel byte/error/NaN mapping %s",
  /** Native UInt8 input and the shared error payload encoder are used. @param byte - Input. @param error - Core error. @returns Nothing. */ (
    byte,
    error,
  ) => {
    expect(XclTools.GetScErrorCode(byte)).toBe(error);
    expect(GetDoubleErrorValue(XclTools.ErrorToDouble(byte))).toBe(error);
  },
);
it("gets lazy evaluated core results and prefers compiler errors over cached results", /** No UI-side evaluator or fabricated result provider participates. @returns Nothing. */ () => {
  const doc = document(),
    cell = new ScFormulaCell(doc, new ScAddress(), unicode("=1.25+2"), grammar);
  try {
    expect(cell.GetDirty()).toBe(true);
    expect(result(cell)).toEqual(["n", "3.25"]);
    expect(cell.GetDirty()).toBe(false);
    cell.GetCode().SetCodeError(E.NoRef);
    cell.SetResultDouble(17);
    expect(result(cell)).toEqual(["e", "#REF!"]);
    const snapshot = cell.GetResult();
    try {
      expect(snapshot.mnError).toBe(E.NoRef);
      expect(snapshot.meType).toBe(3);
    } finally {
      snapshot.dispose();
    }
  } finally {
    cell.Dispose();
    doc.Dispose();
  }
});
it.each([
  [E.NoCode, "#NULL!"],
  [E.DivisionByZero, "#DIV/0!"],
  [E.NoValue, "#VALUE!"],
  [E.NoRef, "#REF!"],
  [E.NoName, "#NAME?"],
  [E.IllegalFPOperation, "#NUM!"],
  [E.Spill, "#VALUE!"],
  [E.NotAvailable, "#N/A"],
  [E.UnknownToken, "#N/A"],
] as const)(
  "serializes actual cached formula error %s as %s",
  /** Auto-calc off retains the original cached imported result. @param error - Core error. @param expected - Native XML spelling. @returns Nothing. */ (
    error,
    expected,
  ) => {
    const doc = document();
    doc.SetAutoCalc(false);
    const cell = new ScFormulaCell(doc, new ScAddress(), unicode("=0"), grammar);
    try {
      cell.SetResultToken(new FormulaErrorToken(error));
      expect(result(cell)).toEqual(["e", expected]);
    } finally {
      cell.Dispose();
      doc.Dispose();
    }
  },
);
it("retains exact logical-format classification, strings and invalid inlineStr fallback", /** Uses real group format metadata and actual result tokens, without private field changes. @returns Nothing. */ () => {
  const doc = document();
  doc.SetAutoCalc(false);
  const group = new ScFormulaCellGroup();
  group.mnFormatType = SvNumFormatType.LOGICAL;
  const cell = new ScFormulaCell(doc, new ScAddress(), group, grammar);
  try {
    for (const value of [0, 1]) {
      cell.SetResultDouble(value);
      expect(result(cell)).toEqual(["b", String(value)]);
    }
    cell.SetResultDouble(-0);
    expect(result(cell)).toEqual(["b", "-0"]);
    cell.SetResultDouble(2);
    expect(result(cell)).toEqual(["n", "2"]);
    const string = unicode("Ω\0😀"),
      shared = new SharedString(string),
      token = new FormulaStringToken(shared);
    try {
      cell.SetResultToken(token);
      expect(result(cell)).toEqual(["str", "Ω\0😀"]);
    } finally {
      shared.dispose();
      string.dispose();
    }
    cell.SetResultToken(new FormulaMissingToken());
    expect(result(cell)).toEqual(["inlineStr", ""]);
  } finally {
    cell.Dispose();
    doc.Dispose();
  }
});
it("keeps byte/Unicode count, vector slice and ARGB contracts", /** Real SAL conversions preserve NUL, UTF16 surrogate pairs and alpha bytes. @returns Nothing. */ () => {
  const units = Uint16Array.of(65, 0, 0xd83d, 0xde00, 66);
  expect([...X.ToOString(units)]).toEqual([65, 0, 240, 159, 152, 128, 66]);
  expect([...X.ToOString(new Uint16Array())]).toEqual([]);
  for (const [start, length, expected] of [
    [0, -1, "A\0😀B"],
    [2, 2, "😀"],
    [4, 100, "B"],
    [5, 0, ""],
    [0, -2, ""],
  ] as const) {
    const value = X.ToOUString(units, start, length);
    try {
      expect(text(value)).toBe(expected);
    } finally {
      value.dispose();
    }
  }
  const whole = X.ToOUString(units),
    asciiValue = X.ToOUString(Uint8Array.of(65, 0, 66));
  try {
    expect(text(whole)).toBe("A\0😀B");
    expect(text(asciiValue)).toBe("A");
  } finally {
    whole.dispose();
    asciiValue.dispose();
  }
  expect(new TextDecoder().decode(X.ToOString(new Color(0x1234ab)))).toBe("FF1234AB");
  expect(
    new TextDecoder().decode(
      X.ToOString(new Color(ColorAlpha, 128, 0x12, 0x34, 0xab, "ColorAlphaTag")),
    ),
  ).toBe("801234AB");
});
it("builds source part names and formats actual local ranges", /** Original vml matching is case-sensitive and checks a substring, not an extension. @returns Nothing. */ () => {
  for (const [dir, name, id, expected] of [
    [null, "sheet", 0, "sheet.xml"],
    ["xl/worksheets/", "sheet", 2, "xl/worksheets/sheet2.xml"],
    ["xl/", "hasvmlinside", -7, "xl/hasvmlinside-7.vml"],
    [null, "VML", 0, "VML.xml"],
  ] as const) {
    const value = X.GetStreamName(dir === null ? null : ascii(dir), ascii(name), id);
    try {
      expect(text(value)).toBe(expected);
    } finally {
      value.dispose();
    }
  }
  const doc = document();
  try {
    expect(new TextDecoder().decode(X.ToOString(doc, new ScRange(1, 2, 0, 3, 4, 0)))).toBe("B3:D5");
    expect(new TextDecoder().decode(X.ToOString(doc, new ScRange(0, 2, 0, MAXCOL, 2, 0)))).toBe(
      "3:3",
    );
    expect(
      new TextDecoder().decode(X.ToOString(doc, new ScRange(1, 0, 0, 1, MAXROW, 0), true)),
    ).toBe("B1:B1048576");
  } finally {
    doc.Dispose();
  }
});
it("writes real cached values to a committed worksheet part and reopens XML", /** Package verification proves only these actual serializer primitives, not a complete workbook export. @returns Completion. */ async () => {
  const doc = document(),
    position = new ScAddress();
  doc.SetFormula(position, unicode("=3.5*2"), grammar);
  const cell = doc.GetFormulaCell(position);
  assert(cell);
  const filter = new XmlFilterBase(new ZipStorage()),
    name = X.GetStreamName(ascii("xl/worksheets/"), ascii("sheet"), 1),
    serializer = filter.openFragmentStreamWithSerializer(
      text(name),
      "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml",
    ),
    w = token("worksheet"),
    data = token("sheetData");
  try {
    serializer.startElement(
      w,
      token("xmlns"),
      "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    );
    serializer.startElement(data);
    serializer.startElement(token("row"), token("r"), "1");
    const [type, value] = result(cell);
    serializer.startElement(token("c"), token("r"), "A1", token("t"), type);
    expect(X.WriteElement(serializer, token("f"), "3.5*2")).toBe(serializer);
    X.WriteElement(serializer, token("v"), new TextEncoder().encode(value));
    serializer.endElement(token("c"));
    serializer.endElement(token("row"));
    serializer.endElement(data);
    serializer.endElement(w);
    serializer.endDocument();
    const storage = new ZipStorage(filter.commitStorage()),
      bytes = await storage.openInputStream(text(name));
    assert(bytes);
    expect(new TextDecoder().decode(bytes)).toContain('<c r="A1" t="n"><f>3.5*2</f><v>7</v></c>');
    const reader = new XmlFilterBase(storage);
    expect(await reader.importFragment(new FragmentHandler(reader, text(name)))).toBe(true);
  } finally {
    name.dispose();
    doc.Dispose();
  }
});
