/** @fileoverview Checks original integer point/size values, copy isolation and native template operations without source-reference execution. */
import { expect, it } from "vitest";
import { Pair, Point, Size } from "./gen";
it("native Pair defaults and integer conversion retain signed values", /** Checks literal native Long values. @returns Nothing. */ () => {
  expect([new Pair().A(), new Pair().B()]).toEqual([0, 0]);
  const pair = new Pair(11.9, -12.9);
  expect([pair.A(), pair.B()]).toEqual([11, -12]);
  expect([new Pair(-0.1, 0.1).A(), new Pair(-0.1, 0.1).B()]).toEqual([0, 0]);
});
it("native Point copies values and moves through original coordinates and size", /** Checks original storage rather than projected geometry. @returns Nothing. */ () => {
  const point = new Point();
  expect([point.getX(), point.getY()]).toEqual([0, 0]);
  point.setX(-7);
  point.setY(11);
  const copy = new Point(point);
  point.Move(3, -2);
  expect([point.X(), point.Y()]).toEqual([-4, 9]);
  expect([copy.X(), copy.Y()]).toEqual([-7, 11]);
  point.Move(new Size(5, 6));
  expect([point.X(), point.Y()]).toEqual([1, 15]);
  expect(point.AdjustX(-3)).toBe(-2);
  expect(point.AdjustY(2)).toBe(17);
  point.Move(4, 0);
  expect([point.X(), point.Y()]).toEqual([2, 17]);
});
it("native Size copies values and retains original nonpositive emptiness", /** Checks signed dimensions and actual original mutations. @returns Nothing. */ () => {
  const size = new Size();
  expect([size.getWidth(), size.getHeight(), size.IsEmpty()]).toEqual([0, 0, true]);
  size.setWidth(9);
  size.setHeight(13);
  const copy = new Size(size);
  expect(size.AdjustWidth(-2)).toBe(7);
  expect(size.AdjustHeight(3)).toBe(16);
  size.extendBy(4, -5);
  expect([size.Width(), size.Height()]).toEqual([11, 11]);
  expect([copy.Width(), copy.Height(), copy.IsEmpty()]).toEqual([9, 13, false]);
  size.setWidth(-1);
  expect(size.IsEmpty()).toBe(true);
  size.setWidth(1);
  size.setHeight(0);
  expect(size.IsEmpty()).toBe(true);
});
