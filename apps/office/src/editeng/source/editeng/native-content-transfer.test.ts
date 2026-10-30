/** @fileoverview Actual source factory dispatch and paragraph split/join/field expansion with real item pools and owners. */
import { expect, it } from "vitest";
import { EditEngineItemPool, MakeCharAttrib } from "../../inc/editdoc";
import { ContentNode } from "../../inc/ContentNode";
import { EditCharAttrib, EditCharAttribField, EditCharAttribRuby } from "../../inc/editattr";
import * as EE from "../../inc/eeitem";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { Color } from "../../../tools/inc/color";
import { FontLineStyle } from "../../../tools/inc/fontenum";
import { SvxColorItem } from "../../inc/colritem";

/** Appends raw text without attribute updates, as used before original split/join calls. @param node - Real paragraph. @param value - Raw UTF16 value. @returns Nothing. */
function raw(node: ContentNode, value: string): void {
  const string = unicode(value);
  try {
    node.Insert(string, node.Len());
  } finally {
    string.dispose();
  }
}
/** Creates a real pooled range through the original dispatch. @param pool - Actual pool. @param which - Original item ID. @param start - Raw start. @param end - Raw end. @returns Actual owner. */
function range(
  pool: EditEngineItemPool,
  which: number,
  start: number,
  end: number,
): EditCharAttrib {
  return MakeCharAttrib(pool, pool.GetPoolDefaultItem(which), start, end) as EditCharAttrib;
}

it("dispatches every supported original character/feature ID and retains the source null path", /** Uses the actual complete default package, including the unsupported NOTCONV entry. @returns Nothing. */ () => {
  const pool = new EditEngineItemPool();
  for (let which = EE.EE_CHAR_START; which <= EE.EE_FEATURE_END; which++) {
    const attribute = MakeCharAttrib(pool, pool.GetPoolDefaultItem(which), 3, 8);
    if (which === EE.EE_FEATURE_NOTCONV) {
      expect(attribute).toBeNull();
      continue;
    }
    expect(attribute).not.toBeNull();
    const value = attribute as EditCharAttrib;
    try {
      expect(value.Which()).toBe(which);
      expect(value.GetStart()).toBe(3);
      expect(value.GetEnd()).toBe(which >= EE.EE_FEATURE_START ? 4 : 8);
      expect(value.IsFeature()).toBe(which >= EE.EE_FEATURE_START);
      expect(value.IsExpandable()).toBe(which < EE.EE_FEATURE_START && which !== EE.EE_CHAR_RUBY);
      if (which === EE.EE_CHAR_RUBY) expect(value).toBeInstanceOf(EditCharAttribRuby);
    } finally {
      value.dispose();
    }
  }
  expect(MakeCharAttrib(pool, pool.GetPoolDefaultItem(EE.EE_PARA_BULLETSTATE), 0, 0)).toBeNull();
});

it("splits crossing ranges, ending ranges and features without aliasing copied owners", /** Text is cut before attribute propagation, exactly as in EditDoc::InsertParaBreak. @returns Nothing. */ () => {
  const pool = new EditEngineItemPool(),
    left = new ContentNode(pool),
    right = new ContentNode(pool);
  raw(left, "abc");
  raw(right, "d\u0001ef");
  const crossing = range(pool, EE.EE_CHAR_COLOR, 1, 7),
    ending = range(pool, EE.EE_CHAR_WEIGHT, 0, 3),
    escaped = range(pool, EE.EE_CHAR_ESCAPEMENT, 0, 3),
    tab = range(pool, EE.EE_FEATURE_TAB, 4, 5);
  left.GetCharAttribs().InsertAttrib(crossing);
  left.GetCharAttribs().InsertAttrib(ending);
  left.GetCharAttribs().InsertAttrib(escaped);
  left.GetCharAttribs().InsertAttrib(tab);
  try {
    right.CopyAndCutAttribs(left, pool, true);
    expect(crossing.GetEnd()).toBe(3);
    const copied = right.GetCharAttribs().FindAttrib(EE.EE_CHAR_COLOR, 0) as EditCharAttrib;
    expect(copied).not.toBe(crossing);
    expect(copied.GetEnd()).toBe(4);
    expect(copied.GetItem()?.equals(crossing.GetItem() as SvxColorItem)).toBe(true);
    expect(right.GetCharAttribs().FindEmptyAttrib(EE.EE_CHAR_WEIGHT, 0)).not.toBeNull();
    expect(right.GetCharAttribs().FindAttrib(EE.EE_CHAR_ESCAPEMENT, 0)).toBeNull();
    expect(right.GetCharAttribs().FindFeature(0)).toBe(tab);
    expect([tab.GetStart(), tab.GetEnd()]).toEqual([1, 2]);
    const expanded = right.GetExpandedText(0, -1);
    try {
      expect(text(expanded)).toBe("d\tef");
    } finally {
      expanded.dispose();
    }
    left.AppendAttribs(right);
    expect(right.GetCharAttribs().Count()).toBe(0);
    expect(crossing.GetEnd()).toBe(7);
    expect(left.GetCharAttribs().FindFeature(0)).toBe(tab);
    expect([tab.GetStart(), tab.GetEnd()]).toEqual([4, 5]);
    expect(left.GetCharAttribs().Count()).toBe(4);
  } finally {
    left.dispose();
    right.dispose();
  }
});

it("preserves start-of-paragraph copies and differing empty-range melting", /** A zero cut retains an empty original, and a differing nonempty incoming range replaces a local empty range. @returns Nothing. */ () => {
  const pool = new EditEngineItemPool(),
    left = new ContentNode(pool),
    right = new ContentNode(pool);
  const original = range(pool, EE.EE_CHAR_COLOR, 0, 3);
  left.GetCharAttribs().InsertAttrib(original);
  raw(right, "abc");
  try {
    right.CopyAndCutAttribs(left, pool, false);
    expect(original.IsEmpty()).toBe(true);
    expect(right.GetCharAttribs().Count()).toBe(1);
    const item = new SvxColorItem(new Color(0x123456), EE.EE_CHAR_COLOR);
    try {
      const replacement = MakeCharAttrib(pool, item, 0, 3) as EditCharAttrib;
      right.GetCharAttribs().Remove(0);
      right.GetCharAttribs().InsertAttrib(replacement);
      left.AppendAttribs(right);
      expect(left.GetCharAttribs().Count()).toBe(1);
      expect(left.GetCharAttribs().GetAttribs()[0]).toBe(replacement);
    } finally {
      item.Dispose();
    }
  } finally {
    left.dispose();
    right.dispose();
  }
});

it("expands field values and maps biased positions while preserving the original copy flag", /** Includes an empty field, literal marker, tab, soft break and raw clipping boundaries. @returns Nothing. */ () => {
  const pool = new EditEngineItemPool(),
    node = new ContentNode(pool),
    field = range(pool, EE.EE_FEATURE_FIELD, 1, 2) as EditCharAttribField,
    empty = range(pool, EE.EE_FEATURE_FIELD, 4, 5) as EditCharAttribField,
    value = unicode("DATE");
  raw(node, "a\u0001\u0001\u0001\u0001z\u0001");
  field.SetFieldValue(value);
  value.dispose();
  const assignedColor = new Color(1);
  field.GetTextColor()[0] = assignedColor;
  expect(field.GetTextColor()[0]).not.toBe(assignedColor);
  field.GetFieldColor()[0] = new Color(2);
  field.GetFldLineStyle()[0] = FontLineStyle.LINESTYLE_SINGLE;
  const copy = new EditCharAttribField(field);
  node.GetCharAttribs().InsertAttrib(field);
  node.GetCharAttribs().InsertAttrib(range(pool, EE.EE_FEATURE_TAB, 2, 3));
  node.GetCharAttribs().InsertAttrib(range(pool, EE.EE_FEATURE_LINEBR, 3, 4));
  node.GetCharAttribs().InsertAttrib(empty);
  try {
    expect(copy.IsFeature()).toBe(false);
    expect(copy.IsExpandable()).toBe(true);
    expect(copy.equals(field)).toBe(true);
    expect(copy.GetTextColor()[0]).not.toBe(field.GetTextColor()[0]);
    copy.GetStart(true)[0] = 42;
    expect(copy.equals(field)).toBe(true);
    const expanded = node.GetExpandedText(0, 999),
      clipped = node.GetExpandedText(2, 4);
    try {
      expect(text(expanded)).toBe("aDATE\t\nz\u0001");
      expect(text(clipped)).toBe("\t\n");
      expect(node.GetExpandedLen()).toBe(expanded.getLength());
    } finally {
      expanded.dispose();
      clipped.dispose();
    }
    const start: [number] = [3],
      end: [number] = [3];
    node.UnExpandPositions(start, end);
    expect([start[0], end[0]]).toEqual([1, 2]);
    const after: [number] = [7];
    node.UnExpandPosition(after, true);
    expect(after[0]).toBe(4);
    after[0] = 8;
    node.UnExpandPosition(after, true);
    expect(after[0]).toBe(6);
    field.Reset();
    expect(text(field.GetFieldValue())).toBe("");
    expect(field.GetTextColor()[0]).toBeNull();
    expect(field.GetFieldColor()[0]).toBeNull();
    expect(field.GetFldLineStyle()[0]).toBeNull();
    expect(copy.notEquals(field)).toBe(true);
  } finally {
    copy.dispose();
    node.dispose();
  }
});
