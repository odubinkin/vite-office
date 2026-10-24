/** @fileoverview Native reference-token helper behavior using genuine local/external token owners and initialized reference data. */
import { assert, expect, it } from "vitest";
import * as helper from "../../../inc/reftokenhelper";
import { ScDocument } from "../../../inc/document";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScRangeList } from "../../../inc/rangelst";
import { ScSingleRefData, ScComplexRefData } from "../../../inc/refdata";
import {
  ScSingleRefToken,
  ScDoubleRefToken,
  ScExternalSingleRefToken,
  ScExternalDoubleRefToken,
} from "../../../inc/token";
import {
  FormulaToken,
  FormulaDoubleToken,
  FormulaIndexToken,
  StackVar,
} from "../../../../formula/inc/token";
import { OpCode } from "../../../../formula/inc/opcode";
import type { ScTokenRef } from "../../../inc/types";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
/** Creates actual documents and native owned token fixtures. @returns Owners and value factories. */
function fixture() {
  const doc = new ScDocument(),
    tokens: FormulaToken[] = [];
  for (let tab = 0; tab < 3; ++tab) {
    const name = unicode(`Sheet${tab}`);
    doc.InsertTab(tab, name);
    name.dispose();
  }
  /** Retains one actual native token until all borrowed observations end. @param token - Owner. @returns Same identity. */
  function own<T extends FormulaToken>(token: T): T {
    tokens.push(token);
    return token;
  }
  /** Creates a native external reference with an actual shared table-name value. @param file - File ID. @param name - Table. @param range - Coordinates. @param single - Single reference form. @returns Token. */
  function external(file: number, name: string, range: ScRange, single = false) {
    const source = unicode(name),
      text = doc.GetSharedStringPool().intern(source);
    source.dispose();
    try {
      if (single) {
        const data = new ScSingleRefData();
        data.InitAddress(range.aStart);
        return own(new ScExternalSingleRefToken(file, text, data));
      }
      const data = new ScComplexRefData();
      data.InitRange(range);
      return own(new ScExternalDoubleRefToken(file, text, data));
    } finally {
      text.dispose();
    }
  }
  /** Ends real token member and document lifetimes after final observations. @returns Nothing. */
  function dispose(): void {
    for (const token of new Set(tokens)) token.dispose();
    doc.Dispose();
  }
  return { doc, own, external, dispose };
}
it("extracts local/external single/double references relative to the real origin and leaves rejected outputs unchanged", /** Both family flags,scalar/index rejection and explicit named-owner admission are checked. @returns Nothing. */ () => {
  const f = fixture(),
    origin = new ScAddress(5, 7, 1),
    address = new ScAddress(2, 3, 1),
    range = new ScRange(2, 3, 1, 4, 5, 2);
  const single = new ScSingleRefData();
  single.InitAddressRel(f.doc, address, origin);
  const double = new ScComplexRefData();
  double.InitRangeRel(f.doc, range, origin);
  const local1 = f.own(new ScSingleRefToken(f.doc.GetSheetLimits(), single)),
    local2 = f.own(new ScDoubleRefToken(f.doc.GetSheetLimits(), double));
  const remote1 = f.external(7, "Left", new ScRange(address), true),
    remote2 = f.external(7, "Left", range);
  try {
    for (const [token, external, expected] of [
      [local1, false, [2, 3, 1, 2, 3, 1]],
      [local2, false, [2, 3, 1, 4, 5, 2]],
      [remote1, true, [2, 3, 1, 2, 3, 1]],
      [remote2, true, [2, 3, 1, 4, 5, 2]],
    ] as const) {
      const out = new ScRange(9, 9, 0, 9, 9, 0),
        start = out.aStart,
        end = out.aEnd;
      expect(helper.getRangeFromToken(f.doc, out, token, origin, !external)).toBe(false);
      expect(out.GetVars()).toEqual([9, 9, 0, 9, 9, 0]);
      expect(helper.getRangeFromToken(f.doc, out, token, origin, external)).toBe(true);
      expect(out.GetVars()).toEqual(expected);
      expect(out.aStart).toBe(start);
      expect(out.aEnd).toBe(end);
      expect(helper.isRef(token)).toBe(true);
      expect(helper.isExternalRef(token)).toBe(external);
    }
    const scalar = f.own(new FormulaDoubleToken(7)),
      index = f.own(new FormulaIndexToken(OpCode.ocPush, 3)),
      named = f.own(new FormulaIndexToken(OpCode.ocName, 3, 0)),
      out = new ScRange(9, 9, 0);
    expect(helper.isRef(scalar)).toBe(false);
    expect(helper.isRef(index)).toBe(false);
    expect(helper.isExternalRef(scalar)).toBe(false);
    expect(helper.getRangeFromToken(f.doc, out, scalar, origin)).toBe(false);
    expect(helper.getRangeFromToken(f.doc, out, index, origin)).toBe(false);
    expect(
      /** Requests the unported native named-range owner. @returns Conversion result. */ () =>
        helper.getRangeFromToken(f.doc, out, named, origin),
    ).toThrow("native range-name ownership");
    expect(out.GetVars()).toEqual([9, 9, 0, 9, 9, 0]);
  } finally {
    f.dispose();
  }
});
it("keeps original default-range append on extraction failure and replaces output token vectors with independent range values", /** No formula source is compiled to construct the actual reference tokens. @returns Nothing. */ () => {
  const f = fixture(),
    point = new ScRange(2, 3, 1, 2, 3, 1),
    span = new ScRange(4, 5, 0, 6, 7, 2),
    ranges = new ScRangeList(point);
  ranges.push_back(span);
  const out: [ScTokenRef] = [null],
    tokens: ScTokenRef[] = [f.own(new FormulaDoubleToken(2))],
    identity = tokens;
  try {
    helper.getTokenFromRange(f.doc, out, point);
    assert(out[0] instanceof ScDoubleRefToken);
    f.own(out[0]);
    expect(out[0].GetType()).toBe(StackVar.svDoubleRef);
    expect(out[0].GetDoubleRef().Ref1.IsFlag3D()).toBe(true);
    expect(out[0].GetDoubleRef().Ref2.IsFlag3D()).toBe(false);
    helper.getTokensFromRangeList(f.doc, tokens, ranges);
    expect(tokens).toBe(identity);
    expect(tokens.length).toBe(2);
    const first = tokens[0],
      second = tokens[1];
    assert(first instanceof ScDoubleRefToken);
    assert(second instanceof ScDoubleRefToken);
    f.own(first);
    f.own(second);
    expect(first.GetDoubleRef().Ref1.IsFlag3D()).toBe(true);
    expect(second.GetDoubleRef().Ref2.IsFlag3D()).toBe(true);
    first.GetDoubleRef().Ref1.SetAbsCol(8);
    expect(ranges.at(0).aStart.Col()).toBe(2);
    const scalar = f.own(new FormulaDoubleToken(5)),
      local = f.own(helper.createRefToken(f.doc, point.aStart)),
      remote = f.external(7, "Left", point, true),
      appended = new ScRangeList(new ScRange(9, 9, 0));
    helper.getRangeListFromTokens(f.doc, appended, [scalar, local, remote], new ScAddress());
    expect(appended.size()).toBe(4);
    expect(appended.at(0).GetVars()).toEqual([9, 9, 0, 9, 9, 0]);
    expect(appended.at(1).GetVars()).toEqual([0, 0, 0, 0, 0, 0]);
    expect(appended.at(2).GetVars()).toEqual([2, 3, 1, 2, 3, 1]);
    expect(appended.at(3).GetVars()).toEqual([0, 0, 0, 0, 0, 0]);
    helper.getRangeListFromTokens(f.doc, appended, [], new ScAddress());
    expect(appended.size()).toBe(4);
    helper.getTokensFromRangeList(f.doc, tokens, new ScRangeList());
    expect(tokens).toBe(identity);
    expect(tokens).toEqual([]);
  } finally {
    f.dispose();
  }
});
it("preserves endpoint normalization flags and borrowed member identities across all four reference families", /** A returned endpoint remains the token's actual mutable member. @returns Nothing. */ () => {
  const f = fixture(),
    address = new ScAddress(2, 3, 1),
    range = new ScRange(2, 3, 1, 4, 5, 2);
  const values = [
    f.own(helper.createRefToken(f.doc, address)),
    f.external(7, "Left", new ScRange(address), true),
    f.own(helper.createRefToken(f.doc, range)),
    f.external(7, "Left", range),
  ];
  const relative = new ScSingleRefData();
  relative.InitAddressRel(f.doc, address, new ScAddress());
  values.push(f.own(new ScSingleRefToken(f.doc.GetSheetLimits(), relative)));
  try {
    for (const token of values) {
      const data = new ScComplexRefData();
      data.InitRange(new ScRange(9, 9, 0));
      data.SetTrimToData(true);
      const first = data.Ref1,
        second = data.Ref2;
      expect(helper.getDoubleRefDataFromToken(data, token)).toBe(true);
      expect(data.Ref1).toBe(first);
      expect(data.Ref2).toBe(second);
      const single =
        token.GetType() === StackVar.svSingleRef ||
        token.GetType() === StackVar.svExternalSingleRef;
      expect(data.toAbs(f.doc, new ScAddress()).GetVars()).toEqual(
        single ? [2, 3, 1, 2, 3, 1] : [2, 3, 1, 4, 5, 2],
      );
      expect(data.IsTrimToData()).toBe(single);
      expect(data.Ref1.IsFlag3D()).toBe(single);
      expect(data.Ref2.IsFlag3D()).toBe(false);
      const borrowed = helper.getSingleRef(token);
      assert(borrowed);
      expect(borrowed).toBe((token as ScSingleRefToken).GetSingleRef());
      data.Ref1.SetAbsCol(99);
      expect(borrowed.Col()).toBe(2);
      borrowed.SetAbsRow(1);
      expect(helper.getSingleRef(token)?.Row()).toBe(1);
    }
    const data = new ScComplexRefData();
    data.InitRange(range);
    const scalar = f.own(new FormulaDoubleToken(7));
    expect(helper.getDoubleRefDataFromToken(data, scalar)).toBe(false);
    expect(data.toAbs(f.doc, new ScAddress()).GetVars()).toEqual([2, 3, 1, 4, 5, 2]);
    expect(helper.getSingleRef(scalar)).toBeNull();
  } finally {
    f.dispose();
  }
});
it("matches native internal/external file filtering while retaining the external table-name intersection asymmetry", /** Genuine external names differ while their numeric sheet spans are equal. @returns Nothing. */ () => {
  const f = fixture(),
    origin = new ScAddress(),
    point = new ScRange(2, 3, 1, 2, 3, 1),
    away = new ScRange(20, 30, 2, 22, 32, 2);
  const scalar = f.own(new FormulaDoubleToken(4)),
    local = f.own(helper.createRefToken(f.doc, point)),
    far = f.own(helper.createRefToken(f.doc, away)),
    otherSheet = f.own(helper.createRefToken(f.doc, new ScRange(2, 3, 2))),
    remote = f.external(7, "Left", point, true),
    differentFile = f.external(8, "Left", point),
    farRemote = f.external(7, "Left", away),
    differentName = f.external(7, "Right", point);
  try {
    expect(helper.intersects(f.doc, [local], scalar, origin)).toBe(false);
    expect(helper.intersects(f.doc, [scalar, remote, far, otherSheet, local], local, origin)).toBe(
      true,
    );
    expect(helper.intersects(f.doc, [scalar, remote, far, otherSheet], local, origin)).toBe(false);
    expect(
      helper.intersects(
        f.doc,
        [scalar, local, differentFile, farRemote, differentName],
        remote,
        origin,
      ),
    ).toBe(true);
    expect(
      helper.intersects(f.doc, [scalar, local, differentFile, farRemote], remote, origin),
    ).toBe(false);
    expect(helper.intersects(f.doc, [], remote, origin)).toBe(false);
  } finally {
    f.dispose();
  }
});
