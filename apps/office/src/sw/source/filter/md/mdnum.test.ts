/** @fileoverview Verifies the native Markdown rule/depth/start state owner. */
import { expect, it } from "vitest";
import { SwNumRule } from "../../core/doc/number";
import { SwMdNumRuleInfo } from "./mdnum";
it("retains source depth independently from the maximum list level and resets pending starts", /** Exercises the unsigned depth, sentinel and current-rule contracts. @returns Nothing. */ () => {
  const info = new SwMdNumRuleInfo(),
    rule = new SwNumRule("Markdown", "label-width-and-position");
  expect(info.GetNumRule()).toBeUndefined();
  expect(info.GetLevel()).toBe(0);
  info.IncDepth();
  expect(info.GetLevel()).toBe(0);
  info.SetNumRule(rule);
  for (let i = 1; i < 12; i++) info.IncDepth();
  expect(info.GetDepth()).toBe(12);
  expect(info.GetLevel()).toBe(9);
  info.SetNodeStartValue(9, 3);
  expect(info.GetNodeStartValue(9)).toBe(3);
  info.SetNodeStartValue(9);
  expect(info.GetNodeStartValue(9)).toBe(65535);
  info.Clear();
  info.DecDepth();
  expect(info.GetDepth()).toBe(0);
  expect(info.GetNumRule()).toBeUndefined();
  for (let level = 0; level < 10; level++) expect(info.GetNodeStartValue(level)).toBe(65535);
});
