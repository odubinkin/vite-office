/** @fileoverview Actual paragraph/line/text owners and source invalidation, partial-copy and position contracts. */
import { expect, it } from "vitest";
import { EditDoc } from "../../inc/editdoc";
import { ParaPortion, ScriptTypePosInfo, WritingDirectionInfo } from "../../inc/ParagraphPortion";
import { ParaPortionList } from "../../inc/ParagraphPortionList";
import { EditLine } from "../../inc/EditLine";
import { TextPortion, PortionKind, ExtraPortionInfo, RubyPortionInfo } from "../../inc/TextPortion";
import { TextPortionList } from "../../inc/TextPortionList";
import { Size } from "../../../tools/inc/gen";
import { EE_PARA_MAX } from "../../inc/EPaM";

/** Creates an actual measured portion value, without a layout/device provider. @param length - Raw length. @param kind - Original kind. @param width - Explicit fixture measurement. @param height - Explicit fixture measurement. @returns Actual source value. */
function portion(length: number, kind = PortionKind.TEXT, width = 10, height = 20): TextPortion {
  const value = new TextPortion(length);
  value.SetKind(kind);
  value.SetSize(new Size(width, height));
  return value;
}
/** Initializes real line endpoints through their original setters. @param start - Raw start. @param end - Raw end. @param first - Starting portion. @param last - Ending portion. @returns Real line value. */
function line(start: number, end: number, first: number, last: number): EditLine {
  const value = new EditLine();
  value.SetStart(start);
  value.SetEnd(end);
  value.SetStartPortion(first);
  value.SetEndPortion(last);
  return value;
}

it("retains original unformatted defaults and clears the actual script/bidi vector identities", /** Invalidation acts on real cached values, not a test-double cache service. @returns Nothing. */ () => {
  const doc = new EditDoc(),
    node = doc.Clear().GetNode(),
    para = new ParaPortion(node),
    scripts = para.getScriptTypePosInfos(),
    directions = para.getWritingDirectionInfos();
  try {
    expect(para.GetNode()).toBe(node);
    expect([
      para.IsInvalid(),
      para.IsSimpleInvalid(),
      para.IsVisible(),
      para.MustRepaint(),
    ]).toEqual([true, false, true, false]);
    expect(para.GetLines().Count()).toBe(0);
    expect(para.GetTextPortions().Count()).toBe(0);
    expect(para.IsEmpty()).toBe(false);
    para.GetTextPortions().Append(new TextPortion(0));
    expect(para.IsEmpty()).toBe(true);
    scripts.push(new ScriptTypePosInfo(1, 0, 10));
    directions.push(new WritingDirectionInfo(257, 0, 10));
    expect(directions[0]?.nType).toBe(1);
    para.SetValid();
    para.MarkInvalid(5, 2);
    expect(para.getScriptTypePosInfos()).toBe(scripts);
    expect(para.getWritingDirectionInfos()).toBe(directions);
    expect(scripts).toEqual([]);
    expect(directions).toEqual([]);
    expect([para.GetInvalidPosStart(), para.GetInvalidDiff(), para.IsSimpleInvalid()]).toEqual([
      5,
      2,
      true,
    ]);
    para.SetMustRepaint(true);
    para.SetBulletX(-20);
    para.SetVisible(false);
    expect([
      para.MustRepaint(),
      para.GetBulletX(),
      para.GetHeight(),
      para.GetFirstLineOffset(),
    ]).toEqual([true, -20, 0, 0]);
    para.ResetHeight();
    expect(para.IsInvalid()).toBe(true);
  } finally {
    doc.dispose();
  }
});

it("preserves adjacent insert/delete accumulation and the source nonadjacent positive fallback", /** The fallback intentionally compares previous start with difference, not with the new start. @returns Nothing. */ () => {
  const para = new ParaPortion(null);
  para.SetValid();
  para.MarkInvalid(100, 2);
  para.MarkInvalid(102, 3);
  expect([para.GetInvalidPosStart(), para.GetInvalidDiff(), para.IsSimpleInvalid()]).toEqual([
    100,
    5,
    true,
  ]);
  para.MarkInvalid(200, 1);
  expect([para.GetInvalidPosStart(), para.GetInvalidDiff(), para.IsSimpleInvalid()]).toEqual([
    1,
    0,
    false,
  ]);
  para.SetValid();
  para.MarkInvalid(100, -2);
  para.MarkInvalid(98, -3);
  expect([para.GetInvalidPosStart(), para.GetInvalidDiff(), para.IsSimpleInvalid()]).toEqual([
    95,
    -5,
    true,
  ]);
  para.SetValid();
  para.MarkInvalid(8, 40000);
  expect(para.GetInvalidDiff()).toBe(-25536);
  para.MarkInvalid(40008, 1);
  expect(para.GetInvalidDiff()).toBe(-25535);
  para.SetValid();
  para.MarkSelectionInvalid(9);
  para.MarkSelectionInvalid(12);
  para.MarkSelectionInvalid(3);
  expect([para.GetInvalidPosStart(), para.GetInvalidDiff(), para.IsSimpleInvalid()]).toEqual([
    3,
    0,
    false,
  ]);
});

it("keeps copy construction, assignment and Clone as three different original operations", /** Metrics, kashida and punctuation omissions are source-specific rather than generic object copying. @returns Nothing. */ () => {
  const original = line(2, 9, 1, 3);
  original.SetHeight(40, 30);
  original.SetTextWidth(80);
  original.SetStartPosX(-11);
  original.SetNextLinePosXDiff(7);
  original.SetMaxAscent(22);
  original.SetHangingPunctuation(true);
  original.SetValid();
  original.GetCharPosArray().push(1.5, 4);
  original.GetKashidaArray().push(true, false);
  const copied = new EditLine(original),
    cloned = original.Clone(),
    assigned = new EditLine();
  assigned.SetHeight(77);
  assigned.SetHangingPunctuation(false);
  assigned.GetCharPosArray().push(8);
  assigned.assign(original);
  expect(copied.equals(original)).toBe(true);
  expect(cloned.equals(original)).toBe(true);
  expect(assigned.equals(original)).toBe(true);
  expect([
    copied.GetHeight(),
    copied.GetTextWidth(),
    copied.GetStartPosX(),
    copied.IsHangingPunctuation(),
    copied.IsInvalid(),
  ]).toEqual([0, 0, 0, true, true]);
  expect(copied.GetCharPosArray()).toEqual([]);
  expect(copied.GetKashidaArray()).toEqual([]);
  expect([
    cloned.GetHeight(),
    cloned.GetTxtHeight(),
    cloned.GetTextWidth(),
    cloned.GetStartPosX(),
    cloned.GetNextLinePosXDiff(),
    cloned.GetMaxAscent(),
    cloned.IsHangingPunctuation(),
    cloned.IsInvalid(),
  ]).toEqual([40, 30, 80, -11, 7, 22, false, true]);
  expect(cloned.GetCharPosArray()).toEqual([1.5, 4]);
  expect(cloned.GetKashidaArray()).toEqual([]);
  expect(cloned.GetCharPosArray()).not.toBe(original.GetCharPosArray());
  expect([assigned.GetHeight(), assigned.IsHangingPunctuation()]).toEqual([77, false]);
  expect(assigned.GetCharPosArray()).toEqual([8]);
  const start = original.GetStart(true);
  original.SetStart(3);
  expect(start[0]).toBe(3);
  expect(original.GetStart(true)).toBe(start);
  original.SetHeight(65537, 65536);
  expect([original.GetHeight(), original.GetTxtHeight()]).toEqual([1, 1]);
});

it("copies text portion scalars and size while discarding owned optional info as upstream does", /** Copying compression arrays occurs only through SaveOrgDXArray, not through TextPortion copy. @returns Nothing. */ () => {
  const source = portion(5, PortionKind.FIELD, 15, 23),
    extra = new ExtraPortionInfo(),
    ruby = new RubyPortionInfo(),
    values = [1, 2, 3];
  extra.SaveOrgDXArray(values, 2);
  values[0] = 99;
  expect(extra.pOrgDXArray).toEqual([1, 2]);
  source.SetExtraInfos(extra);
  source.SetRubyInfos(ruby);
  source.SetRightToLeftLevel(259);
  source.SetExtraValue(65537);
  const copied = new TextPortion(source);
  expect([
    copied.GetLen(),
    copied.GetKind(),
    copied.GetRightToLeftLevel(),
    copied.IsRightToLeft(),
    copied.GetExtraValue(),
  ]).toEqual([5, PortionKind.FIELD, 3, true, 1]);
  expect(copied.GetSize()).not.toBe(source.GetSize());
  expect(copied.GetSize().Width()).toBe(15);
  expect(copied.GetExtraInfos()).toBeNull();
  expect(copied.GetRubyInfos()).toBeNull();
  const size = copied.GetSize();
  copied.adjustSize(-2, 4);
  expect(copied.GetSize()).toBe(size);
  expect([size.Width(), size.Height()]).toEqual([13, 27]);
  extra.SaveOrgDXArray(null, 2);
  expect(extra.pOrgDXArray).toBeNull();
  source.SetExtraInfos(null);
  source.SetRubyInfos(null);
  expect(source.GetExtraInfos()).toBeNull();
  expect(source.GetRubyInfos()).toBeNull();
});

it("finds text boundaries with left/right preference and retains failed-search output", /** A zero-element list and one zero-length portion are distinct original states. @returns Nothing. */ () => {
  const list = new TextPortionList(),
    start: [number] = [99];
  expect(list.isEmpty()).toBe(false);
  expect(list.FindPortion(0, start)).toBe(-1);
  expect(start[0]).toBe(99);
  const first = new TextPortion(3),
    second = new TextPortion(2);
  list.Append(first);
  list.Append(second);
  expect(list.FindPortion(3, start)).toBe(0);
  expect(start[0]).toBe(0);
  expect(list.FindPortion(3, start, true)).toBe(1);
  expect(start[0]).toBe(3);
  expect(list.FindPortion(5, start, true)).toBe(1);
  start[0] = 77;
  expect(list.FindPortion(100, start)).toBe(1);
  expect(start[0]).toBe(77);
  expect(list.GetStartPos(1)).toBe(3);
  expect(list.GetPos(second)).toBe(1);
  expect(list.GetPos(new TextPortion(2))).toBe(0x7fffffff);
  list.Insert(1, new TextPortion(0));
  expect([...list]).toHaveLength(3);
  list.Remove(1);
  list.DeleteFromPortion(1);
  expect(list.Count()).toBe(1);
  list.Reset();
  list.DeleteFromPortion(0);
  expect(list.Count()).toBe(0);
});

it("uses original line boundary rules and corrects only the unformatted suffix", /** The correction computes endpoint deltas from actual retained line/portion values. @returns Nothing. */ () => {
  const para = new ParaPortion(null),
    lines = para.GetLines(),
    first = line(0, 5, 0, 1),
    second = line(7, 10, 4, 5),
    third = line(10, 13, 6, 7);
  lines.Append(first);
  lines.Append(second);
  lines.Append(third);
  expect(lines.FindLine(5, true)).toBe(0);
  expect(lines.FindLine(5, false)).toBe(1);
  expect(para.GetLineNumber(13)).toBe(2);
  para.CorrectValuesBehindLastFormattedLine(0);
  expect([
    second.GetStart(),
    second.GetEnd(),
    second.GetStartPortion(),
    second.GetEndPortion(),
    second.IsValid(),
  ]).toEqual([5, 8, 2, 3, true]);
  expect([
    third.GetStart(),
    third.GetEnd(),
    third.GetStartPortion(),
    third.GetEndPortion(),
  ]).toEqual([8, 11, 4, 5]);
  expect(first.IsInvalid()).toBe(true);
  second.SetInvalid();
  para.CorrectValuesBehindLastFormattedLine(0);
  expect(second.IsInvalid()).toBe(true);
  lines.DeleteFromLine(2);
  expect(lines.Count()).toBe(2);
  lines.Insert(1, new EditLine());
  expect(lines.Count()).toBe(3);
  lines.Reset();
  expect(lines.FindLine(0, false)).toBe(-1);
});

it("accumulates measured text/field widths and excludes tab height and soft-break geometry", /** Values are explicitly prepared source geometry; no renderer is fabricated. @returns Nothing. */ () => {
  const para = new ParaPortion(null),
    list = para.GetTextPortions();
  list.Append(portion(1, PortionKind.TEXT, 10, 20));
  list.Append(portion(1, PortionKind.TAB, 5, 200));
  list.Append(portion(1, PortionKind.LINEBREAK, 100, 300));
  list.Append(portion(1, PortionKind.FIELD, 7, 30));
  list.Append(portion(1, PortionKind.HYPHENATOR, 3, 25));
  const value = line(0, 5, 0, 4),
    size = value.CalcTextSize(para);
  expect([size.Width(), size.Height(), value.GetHeight(), value.GetTxtHeight()]).toEqual([
    25, 30, 30, 30,
  ]);
});

it("owns paragraph sequence separately from document nodes and retains cached reverse lookup after release", /** Actual document and actual portion owners remain distinct, as required by InitDoc. @returns Nothing. */ () => {
  const doc = new EditDoc(),
    node = doc.Clear().GetNode(),
    list = new ParaPortionList();
  try {
    for (let i = 0; i < 25; i++) list.Append(new ParaPortion(node));
    const last = list.getRef(24);
    expect(list.GetPos(last)).toBe(24);
    const released = list.Release(0) as ParaPortion;
    expect(list.GetPos(last)).toBe(23);
    expect(list.GetPos(released)).toBe(EE_PARA_MAX);
    expect(released.GetNode()).toBe(node);
    expect(list.SafeGetObject(-1)).toBeNull();
    expect(list.exists(24)).toBe(false);
    expect(list.lastIndex()).toBe(23);
    expect([...list]).toHaveLength(24);
    list.Insert(-1, released);
    expect(list.Count()).toBe(24);
    list.Insert(24, released);
    expect(list.GetPos(released)).toBe(24);
    expect(list.GetYOffset(last)).toBe(0);
    expect(list.FindParagraph(0)).toBe(EE_PARA_MAX);
    expect(list.FindParagraph(-1)).toBe(0);
    last.SetValid();
    list.MarkAllSelectionsInvalid(5);
    expect(last.GetInvalidPosStart()).toBe(5);
    expect(last.IsSimpleInvalid()).toBe(false);
    list.Remove(24);
    list.Remove(999);
    expect(list.Release(-1)).toBeNull();
    list.Reset();
    expect(list.lastIndex()).toBe(-1);
    expect(doc.Count()).toBe(1);
  } finally {
    doc.dispose();
  }
});
