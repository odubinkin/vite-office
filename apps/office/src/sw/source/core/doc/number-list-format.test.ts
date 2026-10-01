/** @fileoverview Verifies the pinned Writer decimal ListFormat mechanism and raw copies across the Worker graph. */
import { expect, it } from "vitest";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwNumFormat, SwNumRule } from "./number";
import { createWriterNumRule } from "./DocumentListsManager";
import { createWriterDocument } from "./doc";
import { applyWriterParagraphList } from "./list";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { SwXNumberingRules } from "../unocore/unosett";

it("uses native empty standalone suffix and level-specific base ListFormat", /** Checks constructor defaults separately from rule initialization. @returns Nothing. */ () => {
  expect(new SwNumFormat("numbered").GetSuffix()).toBe("");
  const rule = createWriterNumRule("base");
  for (let level = 0; level < 10; level++)
    expect(rule.Get(level).GetListFormat()).toBe(`%${level + 1}%.`);
  for (const options of [
    { start: 65536 },
    { start: 1.5 },
    { includeUpperLevels: -1 },
    { includeUpperLevels: 1.5 },
    { listFormat: null as never },
  ])
    expect(
      /** Rejects a value outside the structural copy contract. @returns Never. */ () =>
        new SwNumFormat("numbered", "", options),
    ).toThrow("invalid");
  expect(
    new SwNumFormat("numbered", "", { start: 65535, includeUpperLevels: 255 }).GetStart(),
  ).toBe(65535);
});

it("substitutes requested Arabic levels literally and retains unavailable placeholders", /** Asserts noncontiguous/repeated/tenth references and legacy fallback. @returns Nothing. */ () => {
  const rule = createWriterNumRule("patterns");
  const format = rule.Get(2).clone();
  format.SetListFormat("[%2%|%1%|%2%]");
  rule.Set(2, format);
  format.SetIncludeUpperLevels(0);
  rule.Set(2, format);
  expect(rule.MakeNumString([2, 3, 4], 2)).toBe("[3|2|3]");
  format.SetListFormat("%10%/%1%/%11%/%0%/%3");
  rule.Set(2, format);
  expect(rule.MakeNumString([2, 3, 4], 2)).toBe("%10%/2/%11%/%0%/%3");
  const tenth = rule.Get(9).clone();
  tenth.SetListFormat("%10%:%1%");
  rule.Set(9, tenth);
  expect(rule.MakeNumString([2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 9)).toBe("11:2");
  format.SetListFormat("");
  rule.Set(2, format);
  expect(rule.MakeNumString([2, 3, 4], 2)).toBe("");
  format.SetListFormat("literal");
  rule.Set(2, format);
  expect(rule.MakeNumString([2, 3, 4], 2)).toBe("literal");
  format.SetListFormat("(%1%.%3%)");
  rule.Set(2, format);
  expect(rule.MakeNumString([0, 3, 0], 2)).toBe("(0.0)");
  format.SetPrefix("[");
  rule.Set(2, format);
  format.SetSuffix("]");
  rule.Set(2, format);
  format.SetIncludeUpperLevels(0);
  rule.Set(2, format);
  expect(rule.MakeNumString([2, 3, 4], 2)).toBe("[4]");
  format.SetIncludeUpperLevels(3);
  rule.Set(2, format);
  expect(rule.MakeNumString([2, 3, 4], 2)).toBe("[2.3.4]");
  rule.Set(0, new SwNumFormat("bullet", "•"));
  expect(rule.MakeNumString([2, 3, 4], 2)).toBe("[3.4]");
  expect(rule.MakeNumString([0, 3, 4], 2)).toBe("[0.3.4]");
  format.SetListFormat("%1%/%2%/%3%");
  rule.Set(2, format);
  expect(rule.MakeNumString([2, 3, 4], 2)).toBe("/3/4");
  expect(rule.MakeNumString([0, 3, 4], 2)).toBe("0/3/4");
  const bullet = new SwNumFormat("bullet", "•", {
    includeUpperLevels: 3,
    prefix: "[",
    suffix: "]",
  });
  rule.Set(2, bullet);
  expect(rule.MakeNumString([2, 3, 4], 2)).toBe("3.");
  bullet.SetListFormat("[%2%/%3%]");
  rule.Set(2, bullet);
  expect(rule.MakeNumString([2, 3, 4], 2)).toBe("[3/]");
});

it("preserves independent ListFormat state in owned clones and Worker transfer", /** Checks raw state, node labels, current schema and native suffix invalidation. @returns Nothing. */ () => {
  const document = createWriterDocument();
  const node = document.paragraphs[0] as SwTextNode;
  applyWriterParagraphList(node, { kind: "numbered", level: 0 });
  const rule = node.GetNumRule() as SwNumRule;
  const format = rule.Get(0).clone();
  format.SetListFormat("§(%1%/%1%)");
  rule.Set(0, format);
  format.SetIncludeUpperLevels(0);
  rule.Set(0, format);
  expect(node.GetListLabel()).toBe("§(1/1)");
  const snapshot = encodeWriterDocument(document);
  expect(snapshot.swModelVersion).toBe(16);
  const restored = decodeWriterDocument(snapshot);
  const copy = (restored.GetNumRuleTable()[0] as SwNumRule).Get(0);
  expect(copy.GetMarkerProperties()).toEqual(format.GetMarkerProperties());
  expect((restored.paragraphs[0] as SwTextNode).GetListLabel()).toBe("§(1/1)");
  const cloned = rule.clone();
  format.SetSuffix("!");
  rule.Set(0, format);
  expect(format.HasListFormat()).toBe(false);
  expect(cloned.Get(0).GetListFormat()).toBe("§(%1%/%1%)");
  const service = new SwXNumberingRules(cloned);
  service.replaceByIndex(0, { kind: "numbered", suffix: "." });
  expect(cloned.Get(0).HasListFormat()).toBe(false);
  expect(copy.GetListFormat()).toBe("§(%1%/%1%)");
  const malformed = structuredClone(snapshot);
  Object.assign(
    (malformed.numRules[0] as (typeof malformed.numRules)[number]).formats[0] as object,
    { listFormat: 1 },
  );
  expect(
    /** Rejects a malformed pattern at the Worker boundary. @returns Never. */ () =>
      decodeWriterDocument(malformed),
  ).toThrow("ListFormat");
  expect(
    /** Rejects the previous graph schema. @returns Never. */ () =>
      decodeWriterDocument({ ...snapshot, swModelVersion: 15 }),
  ).toThrow("unsupported");
});
