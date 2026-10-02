/** @fileoverview Differentially verifies complete native pointer/reference Set and implemented-field assignment ownership against pinned native output. */
import { expect, it } from "vitest";
import type { SwNumberTreeNode } from "../SwNumberTree/SwNumberTree";
import native from "./number-pointer-native.json";
import { SwNumFormat, SwNumRule, SwNumRuleType, SvxNumType, type ConstSwNumFormat } from "./number";
import {
  SvxNumberFormat,
  type ConstSvxNumberFormat,
  type SvxNumPositionAndSpaceMode,
} from "../../../../editeng/source/items/numitem";
import { Font } from "../../../../vcl/source/font/font";
import type { SwNodeNum } from "../SwNumberTree/SwNodeNum";
import { SwClient, SwModify } from "../../../inc/calbck";
import { createWriterDocument } from "./doc";
import { readOdtDocument } from "../../filter/xml/swxml";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { applyWriterParagraphList } from "./list";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
/** Reads every implemented native primitive, including raw pattern and inactive geometry. @param format - Const format. @returns State. */
function state(format: ConstSvxNumberFormat) {
  const p = format.GetPositionProperties();
  return [
    format.GetNumberingType(),
    format.IsShowSymbol(),
    format.GetBulletChar(),
    format.GetBulletFont() !== undefined,
    format.GetBulletFont()?.GetFamilyName() ?? "",
    format.GetStart(),
    format.GetIncludeUpperLevels(),
    p.absLSpace,
    p.firstLineOffset,
    p.charTextDistance,
    p.firstLineIndent,
    p.indentAt,
    p.listTabPosition,
    ["listtab", "nothing", "space"].indexOf(p.labelFollowedBy),
    ["label-width-and-position", "label-alignment"].indexOf(p.positionAndSpaceMode),
    format.GetPrefix(),
    format.GetSuffix(),
    format.HasListFormat(),
    format.HasListFormat() ? format.GetListFormat() : "",
  ];
}
/** Supplies exact native mutation inputs; the existing raw bridge fills geometry without individual local setters. @param original - Input. @param change - Variant. @returns Input. */
function changed(original: SwNumFormat, change: number): SwNumFormat {
  const p = original.GetPositionProperties(),
    m = original.GetMarkerProperties();
  switch (change) {
    case 1:
      original.SetStart(7);
      break;
    case 2:
      original.SetIncludeUpperLevels(3);
      break;
    case 3:
      original.SetPrefix("[");
      break;
    case 4:
      original.SetSuffix("]");
      break;
    case 5:
      original.SetListFormat("");
      break;
    case 6:
      original.SetListFormat();
      break;
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
    case 12:
    case 13: {
      const properties = { ...p, ...m };
      if (change === 7) properties.absLSpace = 11;
      if (change === 8) properties.firstLineOffset = -11;
      if (change === 9) properties.charTextDistance = 11;
      if (change === 10) properties.firstLineIndent = -11;
      if (change === 11) properties.indentAt = 11;
      if (change === 12) properties.listTabPosition = 11;
      if (change === 13) properties.labelFollowedBy = "nothing";
      const input = new SwNumFormat(
        SvxNumberFormat.FromProperties(properties, original.GetNumberingType()),
      );
      input.SetBulletChar(original.GetBulletChar());
      input.SetBulletFont(original.GetBulletFont());
      input.SetShowSymbol(original.IsShowSymbol());
      return input;
    }
    case 14:
      original.SetPositionAndSpaceMode(
        p.positionAndSpaceMode === "label-alignment"
          ? "label-width-and-position"
          : "label-alignment",
      );
      break;
    case 15:
      original.SetBulletFont(undefined);
      break;
    case 16:
      original.SetNumberingType(SvxNumType.SVX_NUM_NUMBER_NONE);
      break;
    case 17:
      original.SetBulletChar(4294967295);
      break;
    case 18: {
      const font = new Font();
      font.SetFamilyName("Alternate");
      original.SetBulletFont(font);
      break;
    }
    case 19:
      original.SetShowSymbol(false);
      break;
    case 20:
      original.SetBulletFont(new Font());
      break;
    case 21:
      original.SetListFormat("<%1%.%2%>");
      original.SetIncludeUpperLevels(7);
      break;
    case 22:
      original.SetNumberingType(SvxNumType.SVX_NUM_CHAR_SPECIAL);
      break;
  }
  return original;
}
/** Reads a native mode profile. @param mode - Native enum. @returns Local type. */
function modeName(mode: number): SvxNumPositionAndSpaceMode {
  return ["label-width-and-position", "label-alignment"][mode] as SvxNumPositionAndSpaceMode;
}
it("matches native pointer and reference Set identity validity and every implemented field", /** Compares 600 literal traces without weakening original reference ownership tests. @returns Nothing. */ () => {
  for (const row of native.native.traces) {
    const rule = new SwNumRule("profile", modeName(row.mode), row.ruleType),
      initial = rule.Get(2).clone();
    initial.SetListFormat("<%1%>");
    if (row.font) {
      const font = new Font();
      if (row.font === 2) font.SetFamilyName("OpenSymbol");
      initial.SetBulletFont(font);
    }
    rule.Set(2, initial);
    const held = rule.Get(2),
      before = state(held),
      input = changed(held.clone(), row.change);
    input.clone =
      /** A JS adapter method is not part of the native nonvirtual copy boundary. @returns Nothing. */ (): never => {
        throw new Error("Native Set must copy by construction");
      };
    rule.Validate();
    if (row.change === 23) rule.SetByPointer(2, undefined);
    else if (row.change === 24) {
      if (row.pointer) rule.SetByPointer(2, held);
      else rule.Set(2, held);
    } else if (row.pointer) rule.SetByPointer(2, input);
    else rule.Set(2, input);
    expect(rule.GetNumFormat(2) !== undefined).toBe(row.owned);
    expect(rule.GetNumFormat(2) === held).toBe(row.same);
    expect(rule.IsInvalidRule()).toBe(row.invalid);
    expect(state(rule.Get(2))).toEqual(row.value);
    expect(state(input)).toEqual(row.input);
    if (row.same) expect(state(held)).toEqual(row.value);
    else expect(state(held)).toEqual(before);
    const copy = rule.clone();
    expect(state(copy.Get(2))).toEqual(row.value);
    expect(copy.GetNumFormat(2) !== undefined).toBe(row.owned);
    if (row.owned) expect(copy.Get(2)).not.toBe(rule.Get(2));
    else expect(copy.Get(2)).toBe(rule.Get(2));
    input.SetStart(99);
    expect(state(rule.Get(2))).toEqual(row.value);
  }
});
it("matches native absent pointer defaults and protects stable const references", /** Checks 8 literal sparse cases,const mutation guards and copied/default ownership. @returns Nothing. */ () => {
  for (const [mode, type, present, owned, same, invalid, value] of native.native.absent) {
    const rule = new SwNumRule("sparse", modeName(mode as number), type as SwNumRuleType),
      before = rule.Get(2),
      input = before.clone();
    rule.Validate();
    rule.SetByPointer(2, present ? input : undefined);
    expect(rule.GetNumFormat(2) !== undefined).toBe(owned);
    expect(rule.Get(2) === before).toBe(same);
    expect(rule.IsInvalidRule()).toBe(invalid);
    expect(state(rule.Get(2))).toEqual(value);
    expect(Object.isFrozen(rule.Get(2))).toBe(true);
  }
  const rule = new SwNumRule("const", "label-alignment");
  rule.SetByPointer(2, new SwNumFormat());
  const reference = rule.Get(2);
  expect(reference).toBeInstanceOf(SwNumFormat);
  expect(reference).toBeInstanceOf(SvxNumberFormat);
  expect(String(reference)).toBe("[object Object]");
  expect(
    /** Forced JS mutation cannot alter a const owner. @returns Nothing. */ () =>
      (reference as SwNumFormat).SetStart(99),
  ).toThrow(TypeError);
  expect(
    /** Forced JS assignment cannot bypass the const view. @returns Format. */ () =>
      (reference as SwNumFormat).Assign(new SwNumFormat()),
  ).toThrow(TypeError);
  const settersAbsent: Extract<keyof ConstSwNumFormat, `Set${string}` | "Assign"> extends never
    ? true
    : false = true;
  expect(settersAbsent).toBe(true);
  for (const level of [-1, 0.5, 10])
    expect(
      /** Retains the existing browser invalid-level guard. @returns Nothing. */ () =>
        rule.SetByPointer(level, undefined),
    ).toThrow("outside");
});
it("matches native base Writer assignment self alias and optional font copies", /** Compares 23 complete field profiles through both source-owned operators and copy construction. @returns Nothing. */ () => {
  for (const [variant, value] of native.native.assignment.entries()) {
    const input = new SwNumFormat();
    input.SetListFormat("<%1%>");
    const font = new Font();
    font.SetFamilyName("OpenSymbol");
    input.SetBulletFont(font);
    const source = changed(input, variant),
      base = new SvxNumberFormat(),
      writer = new SwNumFormat();
    expect(base.Assign(source)).toBe(base);
    expect(base.Assign(base)).toBe(base);
    expect(writer.Assign(source)).toBe(writer);
    expect(writer.Assign(writer)).toBe(writer);
    expect(state(base)).toEqual(value);
    expect(state(writer)).toEqual(value);
    expect(state(writer.clone())).toEqual(value);
    source.SetStart(99);
    font.SetFamilyName("changed");
    expect(state(base)).toEqual(value);
    expect(state(writer)).toEqual(value);
  }
});
it("matches native same modify assignment copy and detach responsibilities", /** Uses actual local notifications to count registration recipients and a named registered-source getter input for Writer composition. @returns Nothing. */ () => {
  const a = new SwModify(),
    b = new SwModify();
  let recipients = 0;
  const callback = /** Counts actual attached notification recipients. @returns Nothing. */ () => {
    recipients++;
  };
  const first = new SwClient(callback),
    second = new SwClient(callback),
    empty = new SwClient(),
    client = new SwClient(callback);
  first.RegisterToModify(a);
  second.RegisterToModify(b);
  for (const [index, source] of [empty, first, first, second, empty, client].entries()) {
    client.StartListeningToSameModifyAs(source);
    recipients = 0;
    a.Broadcast({ kind: "document-state-changed" });
    const inA = recipients;
    recipients = 0;
    b.Broadcast({ kind: "document-state-changed" });
    expect([
      client.GetRegisteredIn() === a ? 1 : client.GetRegisteredIn() === b ? 2 : 0,
      inA,
      recipients,
    ]).toEqual(native.native.registration[index]);
  }
  const source = new SwNumFormat();
  source.GetRegisteredIn =
    /** Supplies native source registration; target/copy use actual production clients. @returns Source. */ () =>
      a;
  const copied = source.clone(),
    assigned = new SwNumFormat();
  assigned.Assign(source);
  expect([copied.GetRegisteredIn() === a, assigned.GetRegisteredIn() === a]).toEqual(
    native.native.formatRegistration[0],
  );
  assigned.Assign(new SwNumFormat());
  expect([assigned.GetRegisteredIn() === undefined]).toEqual(native.native.formatRegistration[1]);
  copied.Assign(new SwNumFormat());
  first.Dispose();
  second.Dispose();
  client.Dispose();
  expect(a.HasListeners()).toBe(false);
  expect(b.HasListeners()).toBe(false);
});
it("keeps pointer assigned live rule reads and sparse ownership through actual document and Worker paths", /** Exercises real attached classification,count,registry and labels across assignment and reset and genuine supported ODT transport. @returns Completion. */ async () => {
  const doc = createWriterDocument(),
    node = doc.paragraphs[0] as NonNullable<(typeof doc.paragraphs)[0]>,
    sourceRule = new SwNumRule("attached", "label-alignment");
  sourceRule.SetAutoRule(false);
  sourceRule.SetDefaultListId("list");
  const rule = doc.AddNumRule(sourceRule);
  applyWriterParagraphList(node, {
    kind: "numbered",
    styleId: "attached",
    listId: "list",
    level: 0,
  });
  const input = rule.Get(0).clone();
  input.SetSuffix(")");
  rule.SetByPointer(0, input);
  const held = rule.Get(0);
  input.SetNumberingType(SvxNumType.SVX_NUM_NUMBER_NONE);
  rule.SetByPointer(0, input);
  expect(rule.Get(0)).toBe(held);
  expect(node.HasNumber()).toBe(true);
  expect(node.HasBullet()).toBe(false);
  expect(observeNumberingCount(node.GetNum())).toBe(true);
  const items: SwNodeNum[] = [];
  doc.getIDocumentListItems().getNumItems(items);
  expect(items).toHaveLength(1);
  expect(rule.MakeNumString([1], 0)).toBe(")");
  const copied = decodeWriterDocument(encodeWriterDocument(doc));
  expect(state(copied.FindNumRulePtr("attached")?.Get(0) as ConstSwNumFormat)).toEqual(state(held));
  copied.Dispose();
  rule.SetByPointer(0, undefined);
  expect(rule.GetNumFormat(0)).toBeUndefined();
  expect(rule.Get(0)).not.toBe(held);
  expect(held.GetNumberingType()).toBe(SvxNumType.SVX_NUM_NUMBER_NONE);
  expect(rule.MakeNumString([1], 0)).toBe("1.");
  const sparse = decodeWriterDocument(encodeWriterDocument(doc));
  expect(sparse.FindNumRulePtr("attached")?.GetNumFormat(0)).toBeUndefined();
  sparse.Dispose();
  input.SetNumberingType(SvxNumType.SVX_NUM_ARABIC);
  rule.SetByPointer(0, input);
  const reopened = await readOdtDocument(writeOdtDocument(doc, { title: "Pointer assignment" }), {
    title: "Pointer assignment",
  });
  const imported = reopened.document.paragraphs[0]?.GetNum()?.GetNumRule();
  expect(imported?.Get(0).GetNumberingType()).toBe(SvxNumType.SVX_NUM_ARABIC);
  expect(imported?.Get(0).GetSuffix()).toBe(")");
  expect(imported?.MakeNumString([1], 0)).toBe("1)");
  reopened.document.Dispose();
  doc.Dispose();
});

/** Observes the protected IsCountedForNumbering policy solely in tests. @param node - Optional owned record. @returns Native policy flag. */
function observeNumberingCount(node: SwNumberTreeNode | undefined): boolean | undefined {
  return (
    node as unknown as
      | {
          /** Reads the native protected policy. @returns Flag. */ IsCountedForNumbering(): boolean;
        }
      | undefined
  )?.IsCountedForNumbering();
}
