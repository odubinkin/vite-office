/** @fileoverview Verifies native line ownership, tristate, modifier selection and keyboard contracts. */
import { expect, it } from "vitest";
import {
  FrameSelector,
  FrameBorderType as Edge,
  FrameBorderState as State,
  FrameSelFlags as Flags,
} from "./frmsel";
import {
  SvxBorderLine,
  SvxBorderLineStyle as Style,
} from "../../../editeng/source/items/borderline";

/** Creates a six-edge selector with native cached line attributes. @param dontCare - Enables source tristate. @returns Native owner. */
function fixture(dontCare = true): FrameSelector {
  const selector = new FrameSelector();
  selector.Initialize(
    Flags.Outer | Flags.InnerHorizontal | Flags.InnerVertical | (dontCare ? Flags.DontCare : 0),
  );
  selector.SetStyleToSelection(20, Style.DASHED);
  selector.SetColorToSelection(0x123456);
  return selector;
}
for (const edge of [Edge.Left, Edge.Right, Edge.Top, Edge.Bottom, Edge.Horizontal, Edge.Vertical])
  for (const dontCare of [false, true])
    it(`native border mouse cycle edge=${edge} dontCare=${dontCare}`, /** Checks literal source state order and owned cached style. @returns Nothing. */ () => {
      const selector = fixture(dontCare);
      expect(selector.GetFrameBorderState(edge)).toBe(State.Hide);
      selector.MouseButtonDown([edge]);
      expect(selector.GetFrameBorderState(edge)).toBe(State.Show);
      expect(selector.GetFrameBorderStyle(edge)?.GetWidth()).toBe(20);
      expect(selector.GetFrameBorderStyle(edge)?.GetColor()).toBe(0x123456);
      expect(selector.IsBorderSelected(edge)).toBe(true);
      selector.MouseButtonDown([edge]);
      expect(selector.GetFrameBorderState(edge)).toBe(dontCare ? State.DontCare : State.Hide);
      expect(selector.GetFrameBorderStyle(edge)).toBeUndefined();
      if (dontCare) {
        selector.MouseButtonDown([edge]);
        expect(selector.GetFrameBorderState(edge)).toBe(State.Hide);
      }
      selector.KeyInput(" ");
      expect(selector.GetFrameBorderState(edge)).toBe(State.Show);
    });
it("native reset style copying never shares input line and distinguishes uniform width/color", /** Checks independent native values and visible-line consensus. @returns Nothing. */ () => {
  const selector = fixture(),
    line = new SvxBorderLine(0xabcdef, 30, Style.DOUBLE);
  expect(selector.GetVisibleWidth()).toBeUndefined();
  expect(selector.GetVisibleColor()).toBeUndefined();
  selector.ShowBorder(Edge.Left, line);
  selector.ShowBorder(Edge.Right, line);
  line.SetWidth(99);
  line.SetColor(0);
  expect(selector.GetVisibleWidth()).toEqual([30, Style.DOUBLE]);
  expect(selector.GetVisibleColor()).toBe(0xabcdef);
  selector.ShowBorder(Edge.Top, new SvxBorderLine(0xabcdef, 20, Style.DASHED));
  expect(selector.GetVisibleWidth()).toBeUndefined();
  selector.ShowBorder(Edge.Bottom, new SvxBorderLine(1, 30, Style.DOUBLE));
  expect(selector.GetVisibleColor()).toBeUndefined();
  selector.ShowBorder(Edge.Bottom, undefined);
  selector.ShowBorder(Edge.Bottom, new SvxBorderLine());
  expect(selector.GetFrameBorderState(Edge.Bottom)).toBe(State.Hide);
  selector.SelectAllVisibleBorders();
  selector.SetStyleToSelection(45, Style.SOLID);
  selector.SetColorToSelection(0x234567);
  expect(selector.GetVisibleWidth()).toEqual([45, Style.SOLID]);
  expect(selector.GetVisibleColor()).toBe(0x234567);
  selector.HideAllBorders();
  expect(selector.IsAnyBorderVisible()).toBe(false);
});
it("modifier click extends then cycles equal selections but replaces unequal native line values", /** Checks source selection equality and cache application. @returns Nothing. */ () => {
  const selector = fixture();
  selector.MouseButtonDown([Edge.Left]);
  selector.MouseButtonDown([Edge.Right], true);
  expect(selector.IsBorderSelected(Edge.Left)).toBe(true);
  expect(selector.IsBorderSelected(Edge.Right)).toBe(true);
  selector.ShowBorder(Edge.Right, new SvxBorderLine(0, 45));
  selector.MouseButtonDown([Edge.Right], true);
  expect(selector.GetVisibleWidth()).toEqual([20, Style.DASHED]);
  expect(selector.GetVisibleColor()).toBe(0x123456);
  selector.MouseButtonDown([Edge.Left], true);
  expect(selector.GetFrameBorderState(Edge.Left)).toBe(State.DontCare);
  expect(selector.GetFrameBorderState(Edge.Right)).toBe(State.DontCare);
  selector.MouseButtonDown([]);
  expect(selector.IsBorderSelected(Edge.Right)).toBe(true);
  selector.MouseButtonDown([Edge.Top]);
  expect(selector.IsBorderSelected(Edge.Right)).toBe(false);
  expect(selector.IsBorderSelected(Edge.Top)).toBe(true);
});
it("disabled dontcare states are hidden even for unused-area mouse hits", /** Checks source reset state admission when cycling is disabled. @returns Nothing. */ () => {
  const selector = fixture(false);
  selector.SetBorderDontCare(Edge.Left);
  selector.MouseButtonDown([]);
  expect(selector.GetFrameBorderState(Edge.Left)).toBe(State.Hide);
  selector.SetBorderDontCare(Edge.Right);
  selector.MouseButtonDown([Edge.Right]);
  expect(selector.GetFrameBorderState(Edge.Right)).toBe(State.Show);
});
it("keyboard selection follows native disabled-diagonal neighbors without applying style", /** Checks literal source adjacency and space toggling. @returns Nothing. */ () => {
  const selector = fixture();
  selector.GetFocus();
  selector.GetFocus();
  expect(selector.IsBorderSelected(Edge.Left)).toBe(true);
  expect(selector.KeyInput("ArrowRight")).toBe(true);
  expect(selector.IsBorderSelected(Edge.Vertical)).toBe(true);
  selector.KeyInput("ArrowDown");
  expect(selector.IsBorderSelected(Edge.Bottom)).toBe(true);
  selector.KeyInput("ArrowUp");
  expect(selector.IsBorderSelected(Edge.Horizontal)).toBe(true);
  selector.KeyInput("ArrowLeft");
  expect(selector.IsBorderSelected(Edge.Left)).toBe(true);
  selector.KeyInput("ArrowLeft");
  expect(selector.IsBorderSelected(Edge.Left)).toBe(true);
  expect(selector.IsAnyBorderVisible()).toBe(false);
  selector.KeyInput(" ");
  expect(selector.GetFrameBorderState(Edge.Left)).toBe(State.Show);
  expect(selector.KeyInput("Escape")).toBe(false);
  selector.DeselectAllBorders();
  selector.KeyInput("ArrowDown");
  expect(selector.IsBorderSelected(Edge.Bottom)).toBe(true);
  selector.Initialize(Flags.NONE);
  selector.GetFocus();
  expect(selector.KeyInput("ArrowUp")).toBe(false);
  expect(selector.KeyInput(" ")).toBe(true);
  expect(selector.GetEnabledBorders()).toEqual([]);
});
it("native empty selector leaves arrows unhandled while enabled arrows use source adjacency", /** Checks source empty-control guard, first-edge fallback, disabled neighbors and space independently. @returns Nothing. */ () => {
  const empty = new FrameSelector();
  empty.Initialize(Flags.NONE);
  empty.GetFocus();
  for (const key of ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Escape"])
    expect(empty.KeyInput(key)).toBe(false);
  expect(empty.KeyInput(" ")).toBe(true);
  const selector = fixture();
  for (const [key, edge] of [
    ["ArrowUp", Edge.Top],
    ["ArrowDown", Edge.Horizontal],
    ["ArrowLeft", Edge.Left],
    ["ArrowRight", Edge.Vertical],
  ] as const) {
    expect(selector.KeyInput(key)).toBe(true);
    expect(selector.IsBorderSelected(edge)).toBe(true);
  }
  expect(selector.KeyInput("ArrowRight")).toBe(true);
  expect(selector.IsBorderSelected(Edge.Right)).toBe(true);
  selector.KeyInput("ArrowRight");
  expect(selector.IsBorderSelected(Edge.Right)).toBe(true);
  expect(selector.KeyInput("Escape")).toBe(false);
});
