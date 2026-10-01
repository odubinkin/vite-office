/** @fileoverview Compares native rule lifecycle and scalar ownership with unchanged pinned native output; checks actual document and Worker owners. */
import { expect, it } from "vitest";
import native from "./number-rule-lifecycle-native.json";
import { SwNumRule, SwNumRuleType, type ConstSwNumFormat } from "./number";
import type { SvxNumPositionAndSpaceMode } from "../../../../editeng/source/items/numitem";
import { SwPoolFormatId } from "../../../inc/poolfmt";
import { createWriterDocument } from "./doc";
import { applyWriterParagraphList } from "./list";
import type { SwNodeNum } from "../SwNumberTree/SwNodeNum";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { readOdtDocument } from "../../filter/xml/swxml";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
/** Reads the 19 implemented native format fields. @param f - Const format. @returns Scalar values. */
function formatState(f: ConstSwNumFormat) {
  const p = f.GetPositionProperties();
  return [
    f.GetNumberingType(),
    f.IsShowSymbol(),
    f.GetBulletChar(),
    f.GetBulletFont() !== undefined,
    f.GetBulletFont()?.GetFamilyName() ?? "",
    f.GetStart(),
    f.GetIncludeUpperLevels(),
    p.absLSpace,
    p.firstLineOffset,
    p.charTextDistance,
    p.firstLineIndent,
    p.indentAt,
    p.listTabPosition,
    ["listtab", "nothing", "space"].indexOf(p.labelFollowedBy),
    ["label-width-and-position", "label-alignment"].indexOf(p.positionAndSpaceMode),
    f.GetPrefix(),
    f.GetSuffix(),
    f.HasListFormat(),
    f.HasListFormat() ? f.GetListFormat() : "",
  ];
}
/** Reads every selected native scalar independently of client-container input adapters. @param r - Rule. @returns Values. */
function meta(r: SwNumRule) {
  return [
    r.GetName(),
    r.GetRuleType(),
    r.IsAutoRule(),
    r.IsInvalidRule(),
    r.IsContinusNum(),
    r.IsAbsSpaces(),
    r.IsHidden(),
    r.IsCountPhantoms(),
    r.IsUsedByRedline(),
    r.GetPoolFormatId(),
    r.GetPoolHelpId(),
    r.GetPoolHlpFileId(),
    ["label-width-and-position", "label-alignment"].indexOf(
      r.GetDefaultNumberFormatPositionAndSpaceMode(),
    ),
    r.GetDefaultListId(),
  ];
}
/** Applies native matrix scalar inputs, including overflow at actual narrowed setters. @param r - Recipient. @param n - Variant. @returns Nothing. */
function scalar(r: SwNumRule, n: number): void {
  r.SetAutoRule(n % 2 === 0);
  r.SetContinusNum(Boolean(n % 2));
  r.SetAbsSpaces(Boolean(n % 3));
  r.SetHidden(Boolean(n % 2));
  r.SetCountPhantoms(n % 2 === 0);
  r.SetUsedByRedline(Boolean(n % 2));
  r.SetPoolFormatId(60000 + n);
  r.SetPoolHelpId(65530 + n);
  r.SetPoolHlpFileId(250 + n);
}
/** Seeds only raw-owned levels. @param r - Rule. @param mask - Ownership mask. @param offset - Start values. @returns Nothing. */
function seed(r: SwNumRule, mask: number, offset: number): void {
  for (let n = 0; n < 10; n++)
    if (mask & (1 << n)) {
      const f = r.Get(n).clone();
      f.SetStart(offset + n);
      f.SetPrefix("[");
      r.Set(n, f);
    }
}
/** Maps the native mode enum. @param mode - Enum. @returns Browser representation. */
function modeName(mode: number): SvxNumPositionAndSpaceMode {
  return mode === 0 ? "label-width-and-position" : "label-alignment";
}
/** Compares all selected scalars and all10 raw/effective slots with literal native output. @param r - Actual rule. @param expected - Native state. @returns Nothing. */
function check(r: SwNumRule, expected: typeof native.native.default): void {
  expect(meta(r)).toEqual(expected.meta.slice(0, 14));
  expect(
    Array.from(
      { length: 10 },
      /** Reads raw presence. @param _ - Placeholder. @param n - Level. @returns Presence. */ (
        _,
        n,
      ) => r.GetNumFormat(n) !== undefined,
    ),
  ).toEqual(expected.owned);
  expect(
    Array.from(
      { length: 10 },
      /** Reads effective values. @param _ - Placeholder. @param n - Level. @returns Values. */ (
        _,
        n,
      ) => formatState(r.Get(n)),
    ),
  ).toEqual(expected.values);
}
it("matches native constructors assignment self reset copy and all ten owned slots", /** Exercises 432 complete literal states with live references and independent copies. @returns Nothing. */ () => {
  for (const row of native.native.traces) {
    const target = new SwNumRule("target", modeName(row.mode), row.type),
      source = new SwNumRule("source", modeName(1 - row.mode), 1 - row.type);
    target.SetDefaultListId("target-list");
    source.SetDefaultListId("source-list");
    seed(target, 511, 2);
    seed(source, row.mask, 7);
    scalar(target, row.scalar + 2);
    scalar(source, row.scalar);
    target.Validate();
    source.Validate();
    check(source, row.source);
    check(target, row.before);
    const held = Array.from(
        { length: 10 },
        /** Holds const pointers before native assignment. @param _ - Placeholder. @param n - Level. @returns Const pointer. */ (
          _,
          n,
        ) => target.GetNumFormat(n),
      ),
      copy = new SwNumRule(source);
    check(copy, row.copy);
    check(source.clone(), row.copy);
    for (let n = 0; n < 10; n++)
      if (source.GetNumFormat(n)) expect(copy.GetNumFormat(n)).not.toBe(source.GetNumFormat(n));
    expect(target.Assign(source)).toBe(target);
    check(target, row.assigned);
    expect(
      held.map(
        /** Reads live owned identity; native dangling pointers are never dereferenced. @param before - Former pointer. @param n - Level. @returns Retention. */ (
          before,
          n,
        ) => before !== undefined && before === target.GetNumFormat(n),
      ),
    ).toEqual(row.same);
    expect(target.Equals(source)).toBe(row.equal);
    target.Validate();
    expect(target.Assign(target)).toBe(target);
    check(target, row.self);
    target.Assign(source);
    check(target, row.equalAssigned);
    target.Reset("");
    check(target, row.reset);
    check(new SwNumRule(target), row.emptyCopy);
    check(target.clone(), row.emptyCopy);
    target.Reset("");
    check(target, row.repeated);
    for (let n = 0; n < 10; n++)
      if (copy.GetNumFormat(n)) {
        const f = source.Get(n).clone();
        f.SetStart(99);
        source.SetByPointer(n, f);
        expect(formatState(copy.Get(n))).toEqual(row.copy.values[n]);
      }
  }
});
it("matches complete native rule equality selected and ignored fields", /** Checks 18 source-shaped equality branches and effective defaults despite raw ownership or different modes. @returns Nothing. */ () => {
  for (const [variant, result] of native.native.equality.entries()) {
    const a = new SwNumRule("equal", "label-alignment"),
      b = new SwNumRule(a);
    switch (variant) {
      case 1:
        b.SetRuleType(SwNumRuleType.OUTLINE_RULE);
        break;
      case 2:
        b.Reset("other");
        break;
      case 3:
        b.SetAutoRule(false);
        break;
      case 4:
        b.SetContinusNum(true);
        break;
      case 5:
        b.SetAbsSpaces(true);
        break;
      case 6:
        b.SetPoolFormatId(2 as SwPoolFormatId);
        break;
      case 7:
        b.SetPoolHelpId(2);
        break;
      case 8:
        b.SetPoolHlpFileId(2);
        break;
      case 9:
        b.SetHidden(true);
        break;
      case 10:
        b.Validate();
        break;
      case 11:
        b.SetCountPhantoms(false);
        break;
      case 12:
        b.SetUsedByRedline(true);
        break;
      case 13:
        b.SetDefaultListId("other");
        break;
      case 14:
        b.Set(4, b.Get(4));
        break;
      case 15: {
        const f = b.Get(4).clone();
        f.SetStart(7);
        b.Set(4, f);
        break;
      }
      case 16:
        expect(a.Equals(new SwNumRule("equal", "label-width-and-position"))).toBe(result);
        continue;
      case 17: {
        const alternate = new SwNumRule(
          "equal",
          "label-width-and-position",
          SwNumRuleType.OUTLINE_RULE,
        );
        b.SetRuleType(SwNumRuleType.OUTLINE_RULE);
        for (let n = 0; n < 10; n++) alternate.Set(n, b.Get(n));
        expect(alternate.Equals(b)).toBe(result);
        continue;
      }
    }
    expect(a.Equals(b)).toBe(result);
    expect(b.Equals(a)).toBe(result);
  }
});
it("matches native unknown default and exact ushort byte narrowing without invalidation", /** Checks all selected defaults and seven native overflow boundaries. @returns Nothing. */ () => {
  expect(SwPoolFormatId.UNKNOWN).toBe(65535);
  check(new SwNumRule("default", "label-alignment"), native.native.default);
  for (const [input, pool, help, file, invalid] of native.native.narrowing) {
    const r = new SwNumRule("narrow", "label-alignment");
    r.Validate();
    r.SetPoolFormatId(input as SwPoolFormatId);
    r.SetPoolHelpId(input as number);
    r.SetPoolHlpFileId(input as number);
    expect([
      r.GetPoolFormatId(),
      r.GetPoolHelpId(),
      r.GetPoolHlpFileId(),
      r.IsInvalidRule(),
    ]).toEqual([pool, help, file, invalid]);
  }
  const r = new SwNumRule("flags", "label-alignment");
  r.Validate();
  scalar(r, 1);
  expect(r.IsInvalidRule()).toBe(false);
});
it("retains actual document clients list and registry across same name assignment and reset", /** Uses real attached nodes and the stored owner; ODT retains its already supported format fields. @returns Completion. */ async () => {
  const doc = createWriterDocument(),
    node = doc.paragraphs[0] as NonNullable<(typeof doc.paragraphs)[0]>,
    input = new SwNumRule("attached", "label-alignment");
  input.SetDefaultListId("list");
  input.SetAutoRule(false);
  const rule = doc.AddNumRule(input);
  applyWriterParagraphList(node, {
    kind: "numbered",
    styleId: "attached",
    listId: "list",
    level: 0,
  });
  const clients: (typeof doc.paragraphs)[number][] = [];
  rule.GetTextNodeList(clients);
  expect(clients).toEqual([node]);
  const list = doc.GetDocumentListsManager().GetListByName("list"),
    counter = node.GetNum(),
    source = new SwNumRule("attached", "label-width-and-position");
  source.SetDefaultListId("other");
  source.SetAutoRule(false);
  const f = source.Get(0).clone();
  f.SetSuffix(")");
  source.Set(0, f);
  rule.Assign(source);
  expect(doc.FindNumRulePtr("attached")).toBe(rule);
  expect(rule.GetDefaultListId()).toBe("list");
  expect(rule.GetDefaultNumberFormatPositionAndSpaceMode()).toBe("label-alignment");
  expect(rule.GetTextNodeListSize()).toBe(1);
  expect(node.GetNum()).toBe(counter);
  expect(node.GetNum()?.GetNumRule()).toBe(rule);
  expect(doc.GetDocumentListsManager().GetListByName("list")).toBe(list);
  rule.Validate();
  expect(rule.MakeNumString([1], 0)).toBe("1)");
  const items: SwNodeNum[] = [];
  doc.getIDocumentListItems().getNumItems(items);
  expect(items).toEqual([counter]);
  expect(new SwNumRule(rule).GetTextNodeListSize()).toBe(0);
  rule.SetCountPhantoms(false);
  rule.SetUsedByRedline(true);
  const transferred = decodeWriterDocument(encodeWriterDocument(doc)),
    workerRule = transferred.FindNumRulePtr("attached") as SwNumRule;
  expect(workerRule.GetTextNodeListSize()).toBe(1);
  expect(transferred.paragraphs[0]?.GetNum()?.GetNumRule()).toBe(workerRule);
  expect(workerRule.GetDefaultListId()).toBe("list");
  expect(workerRule.GetDefaultNumberFormatPositionAndSpaceMode()).toBe("label-alignment");
  expect(workerRule.Get(0).GetSuffix()).toBe(")");
  expect(workerRule.IsCountPhantoms()).toBe(false);
  expect(workerRule.IsUsedByRedline()).toBe(true);
  transferred.Dispose();
  const reopened = await readOdtDocument(writeOdtDocument(doc, { title: "Rule lifecycle" }), {
    title: "Rule lifecycle",
  });
  expect(reopened.document.paragraphs[0]?.GetNum()?.GetNumRule()?.Get(0).GetSuffix()).toBe(")");
  reopened.document.Dispose();
  rule.Reset("attached");
  expect(rule.GetTextNodeListSize()).toBe(1);
  expect(node.GetNum()).toBe(counter);
  expect(rule.GetDefaultListId()).toBe("list");
  expect(rule.MakeNumString([1], 0)).toBe("1.");
  expect(doc.FindNumRulePtr("attached")).toBe(rule);
  rule.Validate();
  doc.getIDocumentListItems().getNumItems(items);
  expect(items).toEqual([counter]);
  doc.Dispose();
});
it("preserves native scalar state on the actual Worker document owner with strict legacy domains", /** Verifies post-copy restoration, legacy defaults and each malformed scalar; full continuous/phantom consumers remain a separate obligation. @returns Nothing. */ () => {
  const doc = createWriterDocument(),
    rule = doc.AddNumRule(new SwNumRule("worker", "label-alignment"));
  scalar(rule, 7);
  const encoded = encodeWriterDocument(doc),
    copied = decodeWriterDocument(encoded),
    stored = copied.FindNumRulePtr("worker") as SwNumRule;
  expect(meta(stored).slice(4, 12)).toEqual(meta(rule).slice(4, 12));
  expect(new SwNumRule(rule).IsCountPhantoms()).toBe(true);
  expect(new SwNumRule(rule).IsUsedByRedline()).toBe(false);
  copied.Dispose();
  const legacy = structuredClone(encoded);
  for (const record of legacy.numRules) delete (record as { scalarState?: unknown }).scalarState;
  const old = decodeWriterDocument(legacy);
  expect(meta(old.FindNumRulePtr("worker") as SwNumRule).slice(4, 12)).toEqual(
    native.native.default.meta.slice(4, 12),
  );
  old.Dispose();
  for (const key of ["continusNum", "absSpaces", "hidden", "countPhantoms", "usedByRedline"]) {
    for (const value of [0, "true", null, undefined]) {
      const malformed = structuredClone(encoded);
      const record = malformed.numRules.find(
        /** Selects the actual owner record. @param r - Record. @returns Match. */ (r) =>
          r.name === "worker",
      ) as unknown as { scalarState: Record<string, unknown> };
      record.scalarState[key] = value;
      expect(
        /** Rejects a malformed boundary scalar. @returns Document. */ () =>
          decodeWriterDocument(malformed),
      ).toThrow("scalar");
    }
  }
  for (const key of ["poolFormatId", "poolHelpId", "poolHlpFileId"]) {
    for (const value of [-1, 0.5, key === "poolHlpFileId" ? 256 : 65536, "1", null, undefined]) {
      const malformed = structuredClone(encoded);
      const record = malformed.numRules.find(
        /** Selects the owner record. @param r - Record. @returns Match. */ (r) =>
          r.name === "worker",
      ) as unknown as { scalarState: Record<string, unknown> };
      record.scalarState[key] = value;
      expect(
        /** Rejects a malformed narrowed value. @returns Document. */ () =>
          decodeWriterDocument(malformed),
      ).toThrow("scalar");
    }
  }
  for (const value of [null, 1, "state"]) {
    const malformed = structuredClone(encoded),
      record = malformed.numRules.find(
        /** Selects the owner. @param r - Record. @returns Match. */ (r) => r.name === "worker",
      ) as unknown as { scalarState: unknown };
    record.scalarState = value;
    expect(
      /** Rejects a malformed metadata container. @returns Document. */ () =>
        decodeWriterDocument(malformed),
    ).toThrow("scalar");
  }
  doc.Dispose();
});
