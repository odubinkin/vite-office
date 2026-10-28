/** @fileoverview Source-contract checks for htmlnum.hxx numbering state with actual borrowed Writer rules. */
import { expect, it } from "vitest";
import { SwNumRule } from "../../core/doc/number";
import { SwHTMLNumRuleInfo } from "./htmlnum";

it("initializes every pending list start and guards an empty depth decrement", /** Native default and Clear use USHRT_MAX for all MAXLEVEL entries. @returns Nothing. */ () => {
  const info = new SwHTMLNumRuleInfo();
  expect(info.GetNumRule()).toBeNull();
  expect(info.GetDepth()).toBe(0);
  expect(info.GetLevel()).toBe(0);
  expect(info.IsNumbered()).toBe(false);
  for (let level = 0; level < 10; ++level) expect(info.GetNodeStartValue(level)).toBe(65535);
  info.DecDepth();
  expect(info.GetDepth()).toBe(0);
});

it("keeps actual borrowed rule identity while clamping the rendered level independently of depth", /** Native sal_uInt16 depth can exceed MAXLEVEL while the exported level stays at nine. @returns Nothing. */ () => {
  const rule = new SwNumRule("HTML borrowed numbering", "label-alignment"),
    info = new SwHTMLNumRuleInfo();
  try {
    info.SetDepth(4);
    expect(info.GetLevel()).toBe(0);
    info.SetNumRule(rule);
    expect(info.GetNumRule()).toBe(rule);
    expect(info.GetLevel()).toBe(3);
    info.SetDepth(0);
    expect(info.GetLevel()).toBe(0);
    info.SetDepth(10);
    expect(info.GetLevel()).toBe(9);
    info.IncDepth();
    expect(info.GetDepth()).toBe(11);
    expect(info.GetLevel()).toBe(9);
    info.DecDepth();
    expect(info.GetDepth()).toBe(10);
    info.SetDepth(65535);
    info.IncDepth();
    expect(info.GetDepth()).toBe(0);
    info.SetNumRule(null);
    expect(info.GetNumRule()).toBeNull();
  } finally {
    rule.Dispose();
  }
});

it("copies list starts independently and clears the destination without changing its borrowed rule", /** Member-wise Set copies the native array and leaves document-owned rule lifetime with the caller. @returns Nothing. */ () => {
  const rule = new SwNumRule("HTML copied numbering", "label-alignment"),
    source = new SwHTMLNumRuleInfo(),
    copy = new SwHTMLNumRuleInfo();
  try {
    source.SetNumRule(rule);
    source.SetDepth(3);
    source.SetNodeStartValue(0, 7);
    source.SetNodeStartValue(9, 65534);
    copy.Set(source);
    expect(copy.GetNumRule()).toBe(rule);
    expect(copy.GetDepth()).toBe(3);
    expect(copy.GetNodeStartValue(0)).toBe(7);
    expect(copy.GetNodeStartValue(9)).toBe(65534);
    expect(copy.IsNumbered()).toBe(false);
    source.SetNodeStartValue(0);
    expect(source.GetNodeStartValue(0)).toBe(65535);
    expect(copy.GetNodeStartValue(0)).toBe(7);
    copy.Clear();
    expect(copy.GetNumRule()).toBeNull();
    expect(copy.GetDepth()).toBe(0);
    expect(copy.GetLevel()).toBe(0);
    expect(copy.IsNumbered()).toBe(false);
    for (let level = 0; level < 10; ++level) expect(copy.GetNodeStartValue(level)).toBe(65535);
    expect(source.GetNumRule()).toBe(rule);
    expect(source.GetDepth()).toBe(3);
    expect(source.GetNodeStartValue(9)).toBe(65534);
  } finally {
    rule.Dispose();
  }
});
