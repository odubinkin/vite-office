/** @fileoverview Checks native numbering indent values, owned copies and first-item tree policy. */
import { expect, it } from "vitest";
import { SwDoc } from "./doc";
import { SwNumRule, SwNumFormat } from "./number";
import { applyWriterParagraphList } from "./list";
import { SwNodeNum } from "../SwNumberTree/SwNodeNum";
import { SwModify } from "../../../inc/calbck";
import { Font } from "../../../../vcl/source/font/font";
import type { SvxNumPositionAndSpaceMode } from "../../../../editeng/source/items/numitem";

it("shifts all alignment levels and only active LISTTAB while preserving native copy state", /** Checks numeric geometry and native font/client ownership. @returns Nothing. */ () => {
  const rule = new SwNumRule("Indent", "label-alignment"),
    client = new SwModify();
  for (let level = 0; level < 10; level++) {
    const format = new SwNumFormat(rule.Get(level));
    format.SetIndentAt(500 + 100 * level);
    format.SetListtabPos(400 + 100 * level);
    format.SetLabelFollowedBy(level % 3 === 0 ? "listtab" : level % 3 === 1 ? "space" : "nothing");
    format.SetAbsLSpace(111);
    format.SetFirstLineOffset(-22);
    format.SetCharTextDistance(33);
    const font = new Font();
    font.SetFamilyName("IndentFont");
    format.SetBulletFont(font);
    format.SetBulletChar(0x25a0);
    format.SetShowSymbol(false);
    format.SetListFormat("%1%.%2%");
    format.GetRegisteredIn =
      /** Supplies the source client registration for native copy construction. @returns Existing modify owner. */ () =>
        client;
    rule.Set(level, format);
  }
  const before = new SwNumRule(rule),
    old = rule.Get(0);
  rule.ChangeIndent(-600);
  expect(rule.IsInvalidRule()).toBe(true);
  expect(
    Array.from(
      { length: 10 },
      /** Reads the actual active indent. @param _unused - Array placeholder. @param level - Native level. @returns Twips. */ (
        _,
        level,
      ) => rule.Get(level).GetIndentAt(),
    ),
  ).toEqual([-100, 0, 100, 200, 300, 400, 500, 600, 700, 800]);
  expect(
    Array.from(
      { length: 10 },
      /** Reads the independent native tab. @param _unused - Array placeholder. @param level - Native level. @returns Twips. */ (
        _,
        level,
      ) => rule.Get(level).GetListtabPos(),
    ),
  ).toEqual([-200, 500, 600, 100, 800, 900, 400, 1100, 1200, 700]);
  expect(old.GetIndentAt()).toBe(500);
  expect(rule.Get(0)).not.toBe(old);
  for (let level = 0; level < 10; level++) {
    const format = rule.Get(level);
    expect([
      format.GetPositionProperties().absLSpace,
      format.GetPositionProperties().firstLineOffset,
      format.GetPositionProperties().charTextDistance,
    ]).toEqual([111, -22, 33]);
    expect(format.GetBulletFont()?.GetFamilyName()).toBe("IndentFont");
    expect(format.GetRegisteredIn()).toBe(client);
    expect(format.GetBulletChar()).toBe(0x25a0);
    expect(format.IsShowSymbol()).toBe(false);
    expect(format.GetListFormat()).toBe(before.Get(level).GetListFormat());
    expect(before.Get(level).GetIndentAt()).toBe(500 + 100 * level);
  }
});

it("clamps legacy negative shifts while retaining inactive alignment geometry", /** Checks source legacy clipping and signed32 argument narrowing. @returns Nothing. */ () => {
  const rule = new SwNumRule("Legacy", "label-width-and-position");
  const format = new SwNumFormat(rule.Get(0));
  format.SetAbsLSpace(300);
  format.SetFirstLineOffset(-100);
  format.SetIndentAt(912);
  format.SetListtabPos(834);
  rule.Set(0, format);
  rule.ChangeIndent(-500);
  expect(rule.Get(0).GetAbsLSpace()).toBe(0);
  expect([
    rule.Get(0).GetFirstLineOffset(),
    rule.Get(0).GetIndentAt(),
    rule.Get(0).GetListtabPos(),
  ]).toEqual([-100, 912, 834]);
  rule.ChangeIndent(0x100000000 + 200);
  expect(rule.Get(0).GetAbsLSpace()).toBe(200);
  const doc = new SwDoc();
  rule.Validate(doc);
  rule.ChangeIndent(0);
  expect(rule.IsInvalidRule()).toBe(true);
  doc.Dispose();
});

it("moves the first-level anchor by native legacy and alignment differences and narrows signed16", /** Checks literal first-level target and zero-difference invalidation. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    modern = new SwNumRule("Modern", "label-alignment");
  const format = new SwNumFormat(modern.Get(0));
  format.SetIndentAt(100);
  format.SetListtabPos(50);
  modern.Set(0, format);
  modern.Validate(doc);
  modern.SetIndentOfFirstListLevelAndChangeOthers(100);
  expect(modern.IsInvalidRule()).toBe(false);
  modern.SetIndentOfFirstListLevelAndChangeOthers(400);
  expect([modern.Get(0).GetIndentAt(), modern.Get(0).GetListtabPos()]).toEqual([400, 350]);
  modern.SetIndentOfFirstListLevelAndChangeOthers(65536 + 300);
  expect([modern.Get(0).GetIndentAt(), modern.Get(0).GetListtabPos()]).toEqual([300, 250]);
  const legacy = new SwNumRule("Legacy", "label-width-and-position"),
    l = new SwNumFormat(legacy.Get(0));
  l.SetAbsLSpace(500);
  l.SetFirstLineOffset(-200);
  legacy.Set(0, l);
  legacy.SetIndentOfFirstListLevelAndChangeOthers(600);
  expect(legacy.Get(0).GetAbsLSpace()).toBe(800);
  expect(legacy.Get(0).GetFirstLineOffset()).toBe(-200);
  legacy.Validate(doc);
  legacy.SetIndentOfFirstListLevelAndChangeOthers(600);
  expect(legacy.IsInvalidRule()).toBe(false);
  doc.Dispose();
});

it("retains native SetIndent non-writing local-copy behavior for every supported mode and separator", /** Checks pinned implementation without inventing a missing Set call. @returns Nothing. */ () => {
  const doc = new SwDoc();
  for (const mode of ["label-width-and-position", "label-alignment"] as const)
    for (const separator of ["listtab", "space", "nothing"] as const) {
      const rule = new SwNumRule("LocalCopy", mode),
        format = new SwNumFormat(rule.Get(2));
      format.SetLabelFollowedBy(separator);
      rule.Set(2, format);
      rule.Validate(doc);
      const owned = rule.GetNumFormat(2),
        before = new SwNumRule(rule);
      rule.SetIndent(40000, 2);
      expect(rule.IsInvalidRule()).toBe(true);
      expect(rule.Equals(before)).toBe(true);
      expect(rule.GetNumFormat(2)).toBe(owned);
    }
  const unknown = new SwNumRule("Unknown", "label-alignment"),
    format = new SwNumFormat(unknown.Get(0));
  format.SetPositionAndSpaceMode("unrecognized" as SvxNumPositionAndSpaceMode);
  unknown.Set(0, format);
  unknown.Validate(doc);
  unknown.SetIndentOfFirstListLevelAndChangeOthers(500);
  expect(unknown.IsInvalidRule()).toBe(false);
  unknown.SetIndent(500, 0);
  expect(unknown.IsInvalidRule()).toBe(true);
  unknown.ChangeIndent(500);
  expect(unknown.Get(0).GetPositionAndSpaceMode()).toBe("unrecognized");
  doc.Dispose();
});

it("resolves first real list items through actual phantom ancestry without validating counters", /** Checks native child and self overloads on real list trees. @returns Nothing. */ () => {
  const doc = new SwDoc();
  doc.SetInReading(true);
  const first = doc.paragraphs[0],
    second = doc.nodes.MakeTextNode(),
    third = doc.nodes.MakeTextNode();
  if (first === undefined) throw new Error("Missing initial paragraph");
  for (const [node, level] of [
    [first, 2],
    [second, 0],
    [third, 1],
  ] as const)
    applyWriterParagraphList(node, { kind: "numbered", styleId: "First", listId: "first", level });
  const a = first.GetNum(),
    b = second.GetNum(),
    c = third.GetNum();
  if (a === undefined || b === undefined || c === undefined)
    throw new Error("Missing owned list item");
  expect(a.IsFirst()).toBe(true);
  expect(b.IsFirst()).toBe(false);
  expect(c.IsFirst()).toBe(false);
  expect(b.GetParent()?.IsFirst(b)).toBe(true);
  const root = b.GetParent();
  if (root === undefined) throw new Error("Missing list root");
  expect(root.IsFirst(c)).toBe(false);
  a.RemoveMe(doc);
  expect(a.IsFirst()).toBe(true);
  expect(b.IsFirst()).toBe(true);
  const orphan = new SwNodeNum(undefined);
  expect(orphan.IsFirst()).toBe(true);
  doc.Dispose();
});

/** Exposes the existing native phantom factory in tests. */
class FirstItemRoot extends SwNodeNum {
  /** Retains native empty-phantom construction. */
  public readonly EmptyPhantom = this.CreatePhantom.bind(this);
}
it("accepts the second real child after an empty leading phantom", /** Checks native phantom-only special case with actual tree owners. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  if (node === undefined) throw new Error("Missing native text");
  doc.SetInReading(true);
  applyWriterParagraphList(node, {
    kind: "numbered",
    styleId: "Phantom",
    listId: "phantom",
    level: 0,
  });
  const item = node.GetNum();
  if (item === undefined) throw new Error("Missing item");
  item.RemoveMe(doc);
  const root = new FirstItemRoot(node.GetNumRule());
  root.AddChild(item, 0, doc);
  expect(root.EmptyPhantom()).toBeDefined();
  expect(root.GetChildCount()).toBe(2);
  expect(item.IsFirst()).toBe(true);
  const later = doc.nodes.MakeTextNode();
  applyWriterParagraphList(later, {
    kind: "numbered",
    styleId: "Phantom",
    listId: "phantom",
    level: 0,
  });
  const next = later.GetNum();
  if (next === undefined) throw new Error("Missing second real item");
  next.RemoveMe(doc);
  root.AddChild(next, 0, doc);
  expect(next.IsFirst()).toBe(false);
  next.RemoveMe(doc);
  item.RemoveMe(doc);
  doc.Dispose();
});
