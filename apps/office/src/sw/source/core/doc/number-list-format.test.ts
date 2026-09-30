/** @fileoverview Verifies the pinned Writer decimal ListFormat mechanism and raw copies across the Worker graph. */
import { expect, it } from "vitest";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwNumFormat, SwNumRule } from "./number";
import { createWriterDocument } from "./doc";
import { applyWriterParagraphList } from "./list";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { SwXNumberingRules } from "../unocore/unosett";

it("uses native empty standalone suffix and level-specific base ListFormat", /** Checks constructor defaults separately from rule initialization. @returns Nothing. */ () => {
  expect(new SwNumFormat("numbered").GetSuffix()).toBe("");
  const rule = new SwNumRule("base");
  for (let level = 0; level < 10; level++)
    expect(rule.GetNumFormat(level).GetListFormat()).toBe(`%${level + 1}%.`);
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
  const rule = new SwNumRule("patterns");
  const format = rule.GetNumFormat(2);
  format.SetListFormat("[%2%|%1%|%2%]");
  format.SetIncludeUpperLevels(0);
  expect(rule.MakeNumString([2, 3, 4], 2)).toBe("[3|2|3]");
  format.SetListFormat("%10%/%1%/%11%/%0%/%3");
  expect(rule.MakeNumString([2, 3, 4], 2)).toBe("%10%/2/%11%/%0%/%3");
  rule.GetNumFormat(9).SetListFormat("%10%:%1%");
  expect(rule.MakeNumString([2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 9)).toBe("11:2");
  format.SetListFormat("");
  expect(rule.MakeNumString([2, 3, 4], 2)).toBe("");
  format.SetListFormat("literal");
  expect(rule.MakeNumString([2, 3, 4], 2)).toBe("literal");
  format.SetListFormat("(%1%.%3%)");
  expect(rule.MakeNumString([0, 3, 0], 2)).toBe("(0.0)");
  format.SetPrefix("[");
  format.SetSuffix("]");
  format.SetIncludeUpperLevels(0);
  expect(rule.MakeNumString([2, 3, 4], 2)).toBe("[4]");
  format.SetIncludeUpperLevels(3);
  expect(rule.MakeNumString([2, 3, 4], 2)).toBe("[2.3.4]");
  rule.Set(0, new SwNumFormat("bullet", "•"));
  expect(rule.MakeNumString([2, 3, 4], 2)).toBe("[3.4]");
  expect(rule.MakeNumString([0, 3, 4], 2)).toBe("[0.3.4]");
  format.SetListFormat("%1%/%2%/%3%");
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
  const format = rule.GetNumFormat(0);
  format.SetListFormat("§(%1%/%1%)");
  format.SetIncludeUpperLevels(0);
  expect(node.GetListLabel()).toBe("§(1/1)");
  const snapshot = encodeWriterDocument(document);
  expect(snapshot.swModelVersion).toBe(16);
  const restored = decodeWriterDocument(snapshot);
  const copy = (restored.GetNumRuleTable()[0] as SwNumRule).GetNumFormat(0);
  expect(copy.GetMarkerProperties()).toEqual(format.GetMarkerProperties());
  expect((restored.paragraphs[0] as SwTextNode).GetListLabel()).toBe("§(1/1)");
  const cloned = rule.clone();
  format.SetSuffix("!");
  expect(format.HasListFormat()).toBe(false);
  expect(cloned.GetNumFormat(0).GetListFormat()).toBe("§(%1%/%1%)");
  const service = new SwXNumberingRules(cloned);
  service.replaceByIndex(0, { kind: "numbered", suffix: "." });
  expect(cloned.GetNumFormat(0).HasListFormat()).toBe(false);
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
