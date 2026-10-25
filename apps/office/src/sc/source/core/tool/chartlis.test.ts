/** @fileoverview Native chart-listener ownership and pointer-vector equality through actual documents,tokens,ranges and string owners. */
import { assert, expect, it } from "vitest";
import { ScChartListener } from "../../../inc/chartlis";
import { ScDocument } from "../../../inc/document";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScRangeList } from "../../../inc/rangelst";
import { createRefToken, getSingleRef } from "../../../inc/reftokenhelper";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { FormulaDoubleToken } from "../../../../formula/inc/token";
import type { ScTokenRef } from "../../../inc/types";

it("owns an independent name and range vector while used/dirty flags remain independent", /** Uses original value owners after caller mutation and destruction. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    name = unicode("Chart α"),
    ranges = new ScRangeList(new ScRange(2, 3, 0, 5, 7, 0)),
    listener = new ScChartListener(name, doc, ranges);
  name.dispose();
  ranges.at(0).aStart.SetCol(9);
  const expectedName = unicode("Chart α");
  expect(listener.GetName().equals(expectedName)).toBe(true);
  expectedName.dispose();
  expect(listener.GetRangeList().at(0).aStart.Col()).toBe(2);
  expect([listener.IsUsed(), listener.IsDirty()]).toEqual([false, false]);
  listener.SetUsed(true);
  expect([listener.IsUsed(), listener.IsDirty()]).toEqual([true, false]);
  listener.SetDirty(true);
  listener.SetUsed(false);
  expect([listener.IsUsed(), listener.IsDirty()]).toEqual([false, true]);
  listener.SetDirty(false);
  const output = listener.GetRangeList();
  output.at(0).aStart.SetRow(99);
  expect(listener.GetRangeList().at(0).aStart.Row()).toBe(3);
  listener.SetRangeList(new ScRangeList(new ScRange(1, 2, 0, 1, 2, 0)));
  expect(listener.GetRangeList().at(0).aStart.Col()).toBe(1);
  expect([listener.IsUsed(), listener.IsDirty()]).toEqual([false, false]);
  listener.SetRangeList(new ScRangeList());
  expect(listener.GetRangeList().empty()).toBe(true);
  listener.Dispose();
  doc.Dispose();
});

it("copies the native token vector but shares real token identity and default-origin extraction", /** Shared mutation is observable without giving the listener caller vector ownership. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    name = unicode("Chart"),
    token = createRefToken(doc, new ScAddress(3, 4, 0)),
    scalar = new FormulaDoubleToken(8),
    tokens: ScTokenRef[] = [token, scalar],
    listener = new ScChartListener(name, doc, tokens);
  tokens.length = 0;
  expect(listener.GetRangeList().size()).toBe(2);
  expect(listener.GetRangeList().at(1).aStart.equals(new ScAddress())).toBe(true);
  const reference = getSingleRef(token);
  assert(reference);
  reference.SetAbsCol(7);
  expect(listener.GetRangeList().at(0).aStart.Col()).toBe(7);
  listener.Dispose();
  token.dispose();
  scalar.dispose();
  name.dispose();
  doc.Dispose();
});

it("retains native document,name,flag,emptiness and pointer-vector equality", /** Equal coordinates in separately generated tokens do not imply pointer equality. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    otherDoc = new ScDocument(),
    name = unicode("Chart"),
    differentName = unicode("Other"),
    token = createRefToken(doc, new ScAddress(2, 3, 0)),
    secondToken = createRefToken(doc, new ScAddress(2, 3, 0));
  const a = new ScChartListener(name, doc, []),
    b = new ScChartListener(name, doc, []),
    c = new ScChartListener(name, otherDoc, []),
    d = new ScChartListener(differentName, doc, []),
    first = new ScChartListener(name, doc, [token]),
    same = new ScChartListener(name, doc, [token]),
    separate = new ScChartListener(name, doc, [secondToken]),
    longer = new ScChartListener(name, doc, [token, secondToken]);
  expect(a.equals(b)).toBe(true);
  expect(a.equals(c)).toBe(false);
  expect(a.equals(d)).toBe(false);
  b.SetUsed(true);
  expect(a.equals(b)).toBe(false);
  b.SetUsed(false);
  b.SetDirty(true);
  expect(a.equals(b)).toBe(false);
  expect(a.equals(first)).toBe(false);
  expect(first.equals(a)).toBe(false);
  expect(first.equals(same)).toBe(true);
  expect(first.equals(separate)).toBe(false);
  expect(first.equals(longer)).toBe(false);
  expect(first.notEquals(same)).toBe(false);
  expect(first.notEquals(separate)).toBe(true);
  for (const listener of [a, b, c, d, first, same, separate, longer]) listener.Dispose();
  token.dispose();
  secondToken.dispose();
  name.dispose();
  differentName.dispose();
  doc.Dispose();
  otherDoc.Dispose();
});
