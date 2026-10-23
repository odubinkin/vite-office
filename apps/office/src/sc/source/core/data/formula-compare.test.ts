/** @fileoverview Original CompareByTokenArray vectors over real lexical/RPN owners,including actual20-token hash-prefix collisions. */
import { expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { ScFormulaCell, CompareState } from "../../../inc/formulacell";
import { ScTokenArray } from "../../../inc/tokenarray";
import { ScSingleRefData, ScComplexRefData } from "../../../inc/refdata";
import {
  ScSingleRefToken,
  ScDoubleRefToken,
  ScTableRefToken,
  ScExternalSingleRefToken,
  ScExternalDoubleRefToken,
  ScMatrixToken,
} from "../../../inc/token";
import {
  FormulaToken,
  FormulaByteToken,
  FormulaSpaceToken,
  FormulaDoubleToken,
  FormulaStringToken,
  FormulaIndexToken,
  FormulaExternalToken,
  FormulaErrorToken,
  FormulaMissingToken,
} from "../../../../formula/inc/token";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { OpCode } from "../../../../formula/inc/opcode";
import { SharedString } from "../../../../svl/inc/sharedstring";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
/** Creates native precompiled token ownership;leading whitespace gives a real hash collision without altering private hash state. @param doc - Actual document. @param lexical - Lexical suffix. @param rpn - Independently compiled RPN when different. @returns Actual cell. */
function cell(
  doc: ScDocument,
  lexical: FormulaToken[],
  rpn: FormulaToken[] = lexical,
): ScFormulaCell {
  const code = new ScTokenArray(doc);
  for (let index = 0; index < 20; index++) code.AddToken(new FormulaSpaceToken(1, 32));
  for (const token of lexical) code.AddToken(token);
  code.CreateNewRPNArrayFromData(rpn, rpn.length);
  return new ScFormulaCell(doc, new ScAddress(2, 3, 0), code, doc.GetGrammar());
}
it("compares every supported RPN payload family after native structural guards", /** Exact source vectors compare real values rather than cached-hash equality alone. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const same: [FormulaToken, FormulaToken][] = [
    [new FormulaDoubleToken(2), new FormulaDoubleToken(2 + Number.EPSILON)],
    [
      new FormulaStringToken(new SharedString(unicode("text"))),
      new FormulaStringToken(new SharedString(unicode("text"))),
    ],
    [new FormulaIndexToken(OpCode.ocName, 2, 0), new FormulaIndexToken(OpCode.ocName, 2, 0)],
    [new FormulaIndexToken(OpCode.ocDBArea, 2, 0), new FormulaIndexToken(OpCode.ocDBArea, 2, 0)],
    [
      new ScTableRefToken(2, ScTableRefToken.Item.DATA),
      new ScTableRefToken(2, ScTableRefToken.Item.DATA),
    ],
    [new FormulaByteToken(OpCode.ocPush, 2), new FormulaByteToken(OpCode.ocPush, 2)],
    [
      new FormulaExternalToken(OpCode.ocExternal, 0, unicode("fn")),
      new FormulaExternalToken(OpCode.ocExternal, 0, unicode("fn")),
    ],
    [new FormulaErrorToken(FormulaError.NoRef), new FormulaErrorToken(FormulaError.NoRef)],
    [new FormulaMissingToken(), new FormulaMissingToken()],
  ];
  for (const [left, right] of same) {
    const a = cell(doc, [left]),
      b = cell(doc, [right]);
    expect(a.GetHash()).toBe(b.GetHash());
    expect(a.CompareByTokenArray(b)).toBe(CompareState.EqualInvariant);
    a.Dispose();
    b.Dispose();
  }
  const different: [FormulaToken, FormulaToken][] = [
    [new FormulaDoubleToken(2), new FormulaDoubleToken(3)],
    [new FormulaDoubleToken(2), new FormulaByteToken(OpCode.ocPush, 2)],
    [new FormulaByteToken(OpCode.ocAdd), new FormulaByteToken(OpCode.ocSub)],
    [new FormulaByteToken(OpCode.ocSum, 1), new FormulaByteToken(OpCode.ocSum, 2)],
    [
      new FormulaStringToken(new SharedString(unicode("a"))),
      new FormulaStringToken(new SharedString(unicode("b"))),
    ],
    [new FormulaIndexToken(OpCode.ocName, 2, 0), new FormulaIndexToken(OpCode.ocName, 3, 0)],
    [new FormulaIndexToken(OpCode.ocDBArea, 2, 0), new FormulaIndexToken(OpCode.ocDBArea, 2, 1)],
    [
      new ScTableRefToken(2, ScTableRefToken.Item.DATA),
      new ScTableRefToken(3, ScTableRefToken.Item.DATA),
    ],
    [new FormulaByteToken(OpCode.ocPush, 2), new FormulaByteToken(OpCode.ocPush, 3)],
    [
      new FormulaExternalToken(OpCode.ocExternal, 0, unicode("a")),
      new FormulaExternalToken(OpCode.ocExternal, 0, unicode("b")),
    ],
    [
      new FormulaExternalToken(OpCode.ocExternal, 0, unicode("fn")),
      new FormulaExternalToken(OpCode.ocExternal, 1, unicode("fn")),
    ],
    [new FormulaErrorToken(FormulaError.NoRef), new FormulaErrorToken(FormulaError.NoValue)],
  ];
  for (const [left, right] of different) {
    const a = cell(doc, [left]),
      b = cell(doc, [right]);
    expect(a.GetHash()).toBe(b.GetHash());
    expect(a.CompareByTokenArray(b)).toBe(CompareState.NotEqual);
    a.Dispose();
    b.Dispose();
  }
  doc.Dispose();
});
it("retains reference row invariance and checks lexical names/references even when RPN is equal", /** Original lexical guard matters after name/table expansion. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const absolute = new ScSingleRefData();
  absolute.InitAddress(0, 0, 0);
  const relative = new ScSingleRefData(absolute);
  relative.SetRowRel(true);
  const other = new ScSingleRefData(relative);
  other.IncCol(1);
  const range = new ScComplexRefData();
  range.InitRange(0, 0, 0, 0, 1, 0);
  const relativeStart = new ScComplexRefData(range);
  relativeStart.Ref1.SetRowRel(true);
  const relativeEnd = new ScComplexRefData(range);
  relativeEnd.Ref2.SetRowRel(true);
  for (const [reference, state] of [
    [absolute, CompareState.EqualInvariant],
    [relative, CompareState.EqualRelativeRef],
  ] as const) {
    const token = new ScSingleRefToken(doc.GetSheetLimits(), reference),
      a = cell(doc, [token]),
      b = cell(doc, [token]);
    expect(a.CompareByTokenArray(b)).toBe(state);
    a.Dispose();
    b.Dispose();
    const expanded = cell(doc, [token], [new FormulaDoubleToken(1)]),
      expandedCopy = cell(doc, [token], [new FormulaDoubleToken(1)]);
    expect(expanded.CompareByTokenArray(expandedCopy)).toBe(state);
    expanded.Dispose();
    expandedCopy.Dispose();
  }
  for (const [reference, state] of [
    [range, CompareState.EqualInvariant],
    [relativeStart, CompareState.EqualRelativeRef],
    [relativeEnd, CompareState.EqualRelativeRef],
  ] as const) {
    const token = new ScDoubleRefToken(doc.GetSheetLimits(), reference),
      a = cell(doc, [token]),
      b = cell(doc, [token]);
    expect(a.CompareByTokenArray(b)).toBe(state);
    a.Dispose();
    b.Dispose();
    const expanded = cell(doc, [token], [new FormulaDoubleToken(1)]),
      expandedCopy = cell(doc, [token], [new FormulaDoubleToken(1)]);
    expect(expanded.CompareByTokenArray(expandedCopy)).toBe(state);
    expanded.Dispose();
    expandedCopy.Dispose();
  }
  const pairs: [FormulaToken, FormulaToken][] = [
    [
      new ScSingleRefToken(doc.GetSheetLimits(), relative),
      new ScSingleRefToken(doc.GetSheetLimits(), other),
    ],
    [
      new ScDoubleRefToken(doc.GetSheetLimits(), range),
      new ScDoubleRefToken(doc.GetSheetLimits(), relativeStart),
    ],
    [
      new ScDoubleRefToken(doc.GetSheetLimits(), range),
      new ScDoubleRefToken(doc.GetSheetLimits(), relativeEnd),
    ],
    [new FormulaIndexToken(OpCode.ocName, 2, 0), new FormulaIndexToken(OpCode.ocName, 2, 1)],
    [
      new ScTableRefToken(2, ScTableRefToken.Item.DATA),
      new ScTableRefToken(3, ScTableRefToken.Item.DATA),
    ],
  ];
  for (const [left, right] of pairs)
    for (const lexicalOnly of [false, true]) {
      const a = cell(doc, [left], lexicalOnly ? [new FormulaDoubleToken(1)] : [left]),
        b = cell(doc, [right], lexicalOnly ? [new FormulaDoubleToken(1)] : [right]);
      expect(a.CompareByTokenArray(b)).toBe(CompareState.NotEqual);
      a.Dispose();
      b.Dispose();
    }
  const name = new SharedString(unicode("Data"));
  for (const token of [
    new ScMatrixToken(null),
    new ScExternalSingleRefToken(1, name, absolute),
    new ScExternalDoubleRefToken(1, name, range),
  ]) {
    const a = cell(doc, [token]),
      b = cell(doc, [token]);
    expect(a.CompareByTokenArray(b)).toBe(CompareState.NotEqual);
    a.Dispose();
    b.Dispose();
  }
  name.dispose();
  doc.Dispose();
});
it("rejects hash,shareability,RPN length/error and lexical shape differences", /** Native public mutation APIs keep actual token storage intact. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const a = cell(doc, [new FormulaDoubleToken(2)]),
    b = cell(doc, [new FormulaDoubleToken(2)]);
  a.GetCode().SetShareable(false);
  expect(a.CompareByTokenArray(b)).toBe(CompareState.NotEqual);
  a.GetCode().SetShareable(true);
  b.GetCode().SetShareable(false);
  expect(a.CompareByTokenArray(b)).toBe(CompareState.NotEqual);
  b.GetCode().SetShareable(true);
  b.GetCode().SetCodeError(FormulaError.NoName);
  expect(a.CompareByTokenArray(b)).toBe(CompareState.NotEqual);
  b.GetCode().SetCodeError(FormulaError.NONE);
  b.GetCode().CreateNewRPNArrayFromData([new FormulaDoubleToken(2), new FormulaDoubleToken(3)], 2);
  expect(a.CompareByTokenArray(b)).toBe(CompareState.NotEqual);
  b.GetCode().CreateNewRPNArrayFromData([new FormulaDoubleToken(2)], 1);
  const longer = cell(
    doc,
    [new FormulaDoubleToken(2), new FormulaDoubleToken(3)],
    [new FormulaDoubleToken(2)],
  );
  expect(a.CompareByTokenArray(longer)).toBe(CompareState.NotEqual);
  longer.Dispose();
  const c = new ScFormulaCell(doc, new ScAddress(2, 4, 0), unicode("=999"), doc.GetGrammar());
  expect(a.CompareByTokenArray(c)).toBe(CompareState.NotEqual);
  a.Dispose();
  b.Dispose();
  c.Dispose();
  doc.Dispose();
});
it("retains missing compiled/lexical buffers and lexical structural guards", /** Real token-array constructors and compiler-buffer transfer preserve null versus allocated ownership. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const empty = new ScFormulaCell(
    doc,
    new ScAddress(2, 3, 0),
    new ScTokenArray(doc),
    doc.GetGrammar(),
  );
  expect(empty.CompareByTokenArray(empty)).toBe(CompareState.NotEqual);
  const code = new ScTokenArray(doc);
  code.CreateNewRPNArrayFromData([new FormulaDoubleToken(1)], 1);
  const rpnOnly = new ScFormulaCell(doc, new ScAddress(2, 3, 0), code, doc.GetGrammar());
  expect(rpnOnly.CompareByTokenArray(rpnOnly)).toBe(CompareState.NotEqual);
  for (const [left, right] of [
    [new FormulaDoubleToken(1), new FormulaByteToken(OpCode.ocPush, 1)],
    [new FormulaByteToken(OpCode.ocAdd), new FormulaByteToken(OpCode.ocSub)],
    [new FormulaByteToken(OpCode.ocSum, 1), new FormulaByteToken(OpCode.ocSum, 2)],
  ]) {
    const a = cell(doc, [left as FormulaToken], [new FormulaDoubleToken(1)]),
      b = cell(doc, [right as FormulaToken], [new FormulaDoubleToken(1)]);
    expect(a.CompareByTokenArray(b)).toBe(CompareState.NotEqual);
    a.Dispose();
    b.Dispose();
  }
  // Opcode ocPush's native parameter count is zero,so the external payload byte
  // is compared by its own branch rather than rejected by the parameter-count guard.
  const a = cell(doc, [new FormulaExternalToken(OpCode.ocPush, 0, unicode("fn"))]),
    b = cell(doc, [new FormulaExternalToken(OpCode.ocPush, 1, unicode("fn"))]);
  expect(a.CompareByTokenArray(b)).toBe(CompareState.NotEqual);
  a.Dispose();
  b.Dispose();
  empty.Dispose();
  rpnOnly.Dispose();
  doc.Dispose();
});
it("rejects missing source/RPN buffers even for a native finite-value hash collision", /** Real scalar code owners have equal interpreted values and cached hashes;no private hash or owner state is fabricated. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const bytes = new DataView(new ArrayBuffer(8));
  bytes.setBigUint64(0, BigInt("0xeeeeeeeeeeeeeeee"), true);
  const value = bytes.getFloat64(0, true),
    position = new ScAddress(2, 3, 0),
    source = new ScTokenArray(doc),
    sourceToken = source.AddDouble(value);
  if (!sourceToken) throw new Error("Missing actual source token");
  source.CreateNewRPNArrayFromData([sourceToken], 1);
  const lexical = new ScFormulaCell(doc, position, source, doc.GetGrammar()),
    compiledOnly = new ScTokenArray(doc);
  compiledOnly.CreateNewRPNArrayFromData([new FormulaDoubleToken(value)], 1);
  const rpnOnly = new ScFormulaCell(doc, position, compiledOnly, doc.GetGrammar()),
    empty = new ScFormulaCell(doc, position, new ScTokenArray(doc), doc.GetGrammar());
  expect(Number.isFinite(value)).toBe(true);
  expect(lexical.GetHash()).toBe(1n);
  expect(rpnOnly.GetHash()).toBe(1n);
  expect(empty.GetHash()).toBe(1n);
  expect(lexical.GetValue()).toBe(value);
  expect(rpnOnly.GetValue()).toBe(value);
  expect(lexical.CompareByTokenArray(rpnOnly)).toBe(CompareState.NotEqual);
  expect(rpnOnly.CompareByTokenArray(empty)).toBe(CompareState.NotEqual);
  lexical.Dispose();
  rpnOnly.Dispose();
  empty.Dispose();
  doc.Dispose();
});
