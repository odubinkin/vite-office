/** @fileoverview Checks original grid defaults, Any member admission, five-point limits, paper-mode transforms and concrete pool/format ownership. */
import { expect, it } from "vitest";
import { SwTextGridItem, SwTextGrid } from "./tgrditem";
import * as M from "./unomid";
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { Color } from "../../tools/inc/color";
import { SwFormatRowSplit } from "./fmtrowsplt";
import { SwDoc } from "../source/core/doc/doc";
import { RES_TEXTGRID } from "./hintids";
import { SwPageDesc, UseOnPage } from "../source/core/layout/pagedesc";

/** Executes a native typed input lifetime. @param item - Grid. @param member - Member. @param value - Value. @param type - Native scalar type. @returns Success. */
function put(
  item: SwTextGridItem,
  member: number,
  value: number | boolean,
  type: "sal_Int16" | "sal_Int32" | "bool" = "sal_Int32",
): boolean {
  const input = new Any([value], type);
  try {
    return item.PutValue(input, member);
  } finally {
    input.dispose();
  }
}
/** Queries original typed scalar and preserves output on failure. @param item - Item. @param member - Member. @param type - Output type. @returns Scalar. */
function query(
  item: SwTextGridItem,
  member: number,
  type: "sal_Int16" | "sal_Int32" | "bool" = "sal_Int32",
): number | boolean {
  const output = new Any();
  try {
    expect(item.QueryValue(output, member)).toBe(true);
    if (type === "bool") {
      const value: [boolean] = [false];
      expect(output.extract(value, type)).toBe(true);
      return value[0];
    }
    const value: [number] = [0];
    expect(output.extract(value, type)).toBe(true);
    return value[0];
  } finally {
    output.dispose();
  }
}

it("retains complete native default fields, typed queries, mutable copies and all equality fields", /** Each field is native item state, not a browser-only approximation. @returns Nothing. */ () => {
  const item = new SwTextGridItem();
  expect(item.Which()).toBe(122);
  expect(item.QueryValue()).toEqual([
    0xc0c0c0,
    20,
    400,
    200,
    0,
    false,
    true,
    true,
    400,
    true,
    true,
  ]);
  expect(item.GetColor().toInt32()).toBe(0xc0c0c0);
  expect(item.GetLines()).toBe(20);
  expect(item.GetBaseHeight()).toBe(400);
  expect(item.GetRubyHeight()).toBe(200);
  expect(item.GetBaseWidth()).toBe(400);
  expect(item.GetGridType()).toBe(SwTextGrid.NONE);
  expect([
    item.IsRubyTextBelow(),
    item.GetRubyTextBelow(),
    item.IsPrintGrid(),
    item.GetPrintGrid(),
    item.IsDisplayGrid(),
    item.GetDisplayGrid(),
    item.IsSnapToChars(),
    item.GetSnapToChars(),
    item.IsSquaredMode(),
    item.GetSquaredMode(),
  ]).toEqual([false, false, true, true, true, true, true, true, true, true]);
  for (const [member, value, type] of [
    [M.MID_GRID_COLOR, 0xc0c0c0, "sal_Int32"],
    [M.MID_GRID_LINES, 20, "sal_Int16"],
    [M.MID_GRID_BASEHEIGHT, 706, "sal_Int32"],
    [M.MID_GRID_BASEWIDTH, 706, "sal_Int32"],
    [M.MID_GRID_RUBYHEIGHT, 353, "sal_Int32"],
    [M.MID_GRID_TYPE, 0, "sal_Int16"],
    [M.MID_GRID_RUBY_BELOW, false, "bool"],
    [M.MID_GRID_PRINT, true, "bool"],
    [M.MID_GRID_DISPLAY, true, "bool"],
    [M.MID_GRID_SNAPTOCHARS, true, "bool"],
    [M.MID_GRID_STANDARD_MODE, false, "bool"],
  ] as const)
    expect(query(item, member | 0x80, type)).toBe(value);
  const changes = [
    /** Changes color. @param grid - Item. @returns Nothing. */ (grid: SwTextGridItem) =>
      grid.SetColor(new Color(0x123456)),
    /** Changes lines. @param grid - Item. @returns Nothing. */ (grid: SwTextGridItem) =>
      grid.SetLines(30),
    /** Changes base height. @param grid - Item. @returns Nothing. */ (grid: SwTextGridItem) =>
      grid.SetBaseHeight(500),
    /** Changes ruby height. @param grid - Item. @returns Nothing. */ (grid: SwTextGridItem) =>
      grid.SetRubyHeight(100),
    /** Changes type. @param grid - Item. @returns Nothing. */ (grid: SwTextGridItem) =>
      grid.SetGridType(SwTextGrid.LinesOnly),
    /** Changes ruby position. @param grid - Item. @returns Nothing. */ (grid: SwTextGridItem) =>
      grid.SetRubyTextBelow(true),
    /** Changes print flag. @param grid - Item. @returns Nothing. */ (grid: SwTextGridItem) =>
      grid.SetPrintGrid(false),
    /** Changes display flag. @param grid - Item. @returns Nothing. */ (grid: SwTextGridItem) =>
      grid.SetDisplayGrid(false),
    /** Changes width. @param grid - Item. @returns Nothing. */ (grid: SwTextGridItem) =>
      grid.SetBaseWidth(500),
    /** Changes snapping. @param grid - Item. @returns Nothing. */ (grid: SwTextGridItem) =>
      grid.SetSnapToChars(false),
    /** Changes paper mode. @param grid - Item. @returns Nothing. */ (grid: SwTextGridItem) =>
      grid.SetSquaredMode(false),
  ];
  expect(item.equals(new SwFormatRowSplit())).toBe(false);
  expect(item.Clone().equals(item)).toBe(true);
  for (const change of changes) {
    const copy = item.Clone();
    change(copy);
    expect(copy.equals(item)).toBe(false);
    expect(item.equals(copy)).toBe(false);
  }
  expect(item.GetColor().toInt32()).toBe(0xc0c0c0);
});

it("preserves native Any type/default behavior, invalid admission and base/ruby measure boundaries", /** Executes actual Any conversion and item mutation rather than helper scalar parsing. @returns Nothing. */ () => {
  const grid = new SwTextGridItem(),
    empty = new Any();
  try {
    expect(grid.PutValue(0, 0)).toBe(false);
    expect(grid.PutValue(empty, 0)).toBe(false);
    expect(grid.PutValue(empty, 1)).toBe(false);
    expect(grid.PutValue(empty, 2)).toBe(false);
    expect(grid.PutValue(empty, 4)).toBe(false);
    expect(grid.PutValue(empty, 99)).toBe(false);
    expect(
      /** Native unchecked bool access has no defined result for void Any. @returns Never. */ () =>
        grid.PutValue(empty, 5),
    ).toThrow("bool-access precondition");
    expect(grid.QueryValue(empty, 99)).toBe(false);
    grid.SetGridType(99 as SwTextGrid);
    expect(grid.QueryValue(empty, 4)).toBe(false);
  } finally {
    empty.dispose();
  }
  expect(put(grid, 0, 0x123456)).toBe(true);
  expect(grid.GetColor().toInt32()).toBe(0x123456);
  expect(put(grid, 1, -1, "sal_Int16")).toBe(false);
  expect(put(grid, 1, 44, "sal_Int16")).toBe(true);
  expect(grid.GetLines()).toBe(44);
  for (const mode of [0, 1, 2]) {
    expect(put(grid, 4, mode, "sal_Int16")).toBe(true);
    expect(query(grid, 4, "sal_Int16")).toBe(mode);
  }
  expect(put(grid, 4, 3, "sal_Int16")).toBe(false);
  for (const member of [2, 8, 3]) {
    expect(put(grid, member | 0x80, -1)).toBe(false);
    expect(put(grid, member | 0x80, 2_000_000_000)).toBe(false);
    expect(put(grid, member | 0x80, 0)).toBe(true);
    expect(query(grid, member | 0x80)).toBe(member === 3 ? 0 : 176);
    expect(put(grid, member | 0x80, 1000)).toBe(true);
    expect(query(grid, member | 0x80)).toBe(1000);
  }
  for (const member of [5, 6, 7, 9, 10]) {
    expect(put(grid, member, false, "bool")).toBe(true);
    expect(query(grid, member, "bool")).toBe(false);
    expect(put(grid, member, true, "bool")).toBe(true);
    expect(query(grid, member, "bool")).toBe(true);
  }
});

it("retains native mode defaults, color retention, uint16 overflow and enabled-grid transforms", /** Standard/squared conversions use native truncation and unsigned storage. @returns Nothing. */ () => {
  const grid = new SwTextGridItem();
  grid.SetColor(new Color(0x123456));
  grid.SwitchPaperMode(true);
  grid.SwitchPaperMode(false);
  expect(grid.QueryValue()).toEqual([0x123456, 44, 312, 0, 0, false, true, true, 210, true, false]);
  grid.SwitchPaperMode(true);
  expect(grid.QueryValue()).toEqual([
    0x123456,
    20,
    400,
    200,
    0,
    false,
    true,
    true,
    400,
    true,
    true,
  ]);
  grid.SetGridType(SwTextGrid.LinesAndChars);
  grid.SwitchPaperMode(false);
  expect([
    grid.GetBaseWidth(),
    grid.GetBaseHeight(),
    grid.GetRubyHeight(),
    grid.IsSquaredMode(),
  ]).toEqual([400, 600, 0, false]);
  grid.SetBaseHeight(601);
  grid.SwitchPaperMode(true);
  expect([grid.GetBaseWidth(), grid.GetBaseHeight(), grid.GetRubyHeight()]).toEqual([
    401, 401, 200,
  ]);
  grid.SetBaseHeight(65535);
  grid.SetRubyHeight(1);
  grid.SwitchPaperMode(false);
  expect(grid.GetBaseHeight()).toBe(0);
  grid.SetLines(65535);
  grid.SetBaseWidth(65537);
  grid.SetRubyHeight(65538);
  expect([grid.GetLines(), grid.GetBaseWidth(), grid.GetRubyHeight()]).toEqual([-1, 1, 2]);
});

it("owns grid and geometry through independent document-pooled page formats and native copy/follow flags", /** Actual frames expose canonical items, and browser values project the same state. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    page = doc.GetPageDesc();
  expect(
    /** Native page construction requires a document reference. @returns Never. */ () =>
      new SwPageDesc("missing", undefined, undefined as unknown as SwDoc),
  ).toThrow("document reference is missing");
  const frames = [page.GetMaster(), page.GetLeft(), page.GetFirstMaster(), page.GetFirstLeft()];
  expect(new Set(frames).size).toBe(4);
  for (const frame of frames) {
    expect(frame.GetDoc()).toBe(doc);
    expect(frame.DerivedFrom()).toBe(doc.GetDfltFrameFormat());
    expect(frame.GetTextGrid()).toBe(doc.GetAttrPool().GetUserOrPoolDefaultItem(RES_TEXTGRID));
  }
  const grid = page.GetMaster().GetTextGrid().Clone();
  grid.SetLines(44);
  grid.SetBaseWidth(210);
  grid.SetSquaredMode(false);
  page.GetMaster().SetFormatAttr(grid);
  expect(page.GetLeft().GetTextGrid().GetLines()).toBe(20);
  expect(page.GetMaster().GetTextGrid().GetLines()).toBe(44);
  page.SetLandscape(true);
  expect(page.GetLandscape()).toBe(true);
  expect(page.GetValue().landscape).toBe(true);
  const usage = page.ReadUseOn();
  expect(page.GetUseOn()).toBe(UseOnPage.All);
  page.SetUseOn(UseOnPage.Mirror);
  expect(page.GetUseOn()).toBe(UseOnPage.Mirror);
  expect(page.ReadUseOn() & 0x1c0).toBe(usage & 0x1c0);
  page.WriteUseOn(UseOnPage.Right);
  expect(page.ReadUseOn()).toBe(UseOnPage.Right);
  const nativeCopy = new SwPageDesc(page);
  expect(nativeCopy.GetFollow()).toBe(page);
  expect(nativeCopy.GetUseOn()).toBe(UseOnPage.Right);
  expect(nativeCopy.GetLandscape()).toBe(true);
  expect(nativeCopy.GetMaster().GetTextGrid().QueryValue()).toEqual(grid.QueryValue());
  nativeCopy.GetMaster().SetFormatAttr(new SwTextGridItem());
  expect(page.GetMaster().GetTextGrid().GetLines()).toBe(44);
  const restored = doc.GetAttrPool().CreateItem({ which: RES_TEXTGRID, value: grid.QueryValue() });
  expect(restored).toBeInstanceOf(SwTextGridItem);
  expect(restored.equals(grid)).toBe(true);
  const before = page.GetValue();
  page.GetMaster().GetAttrSet().Put(page.GetMaster().GetFrameSize().Clone());
  expect(page.GetValue()).toEqual(before);
  nativeCopy.DisposeModify();
  const firstSize = page.GetFirstMaster().GetFrameSize().Clone();
  firstSize.SetWidth(firstSize.GetWidth() + 100);
  page.GetFirstMaster().SetFormatAttr(firstSize);
  const copied = doc.MakePageDesc("copy", page);
  expect(copied.GetFirstMaster().GetFrameSize().GetWidth()).toBe(firstSize.GetWidth());
  expect(copied.GetFirstMaster().GetName()).toBe(page.GetFirstMaster().GetName());
  expect(copied.SetName("Standard")).toBe(false);
  expect(copied.SetName("renamed")).toBe(true);
  expect(doc.FindPageDesc("renamed")).toBe(copied);
  expect(copied.GetMaster().GetName()).toBe("Standard");
  expect(
    /** Browser ingress keeps registered names unique before changing any geometry. @returns Never. */ () =>
      copied.SetValue({ ...copied.GetValue(), name: "Standard" }),
  ).toThrow("name already exists");
});
