/** @fileoverview Native closed-edge rectangle construction, signed extents, empty sentinels and union behavior used by style preview. */
import { expect, it } from "vitest";
import { Rectangle, Point, Size } from "./gen";
/** Projects actual public geometry values. @param rectangle - Actual rectangle. @returns Raw observable edge/extent values. */
function values(rectangle: Rectangle): number[] {
  return [
    rectangle.Left(),
    rectangle.Top(),
    rectangle.Right(),
    rectangle.Bottom(),
    rectangle.GetWidth(),
    rectangle.GetHeight(),
  ];
}
it("retains native empty axes,position and independent copies", /** Zero width/height use the sentinel rather than a one-pixel rectangle. @returns Nothing. */ () => {
  expect(values(new Rectangle())).toEqual([0, 0, 0, 0, 0, 0]);
  const empty = new Rectangle(3, 5),
    copy = new Rectangle(empty);
  expect(values(copy)).toEqual([3, 5, 3, 5, 0, 0]);
  expect(copy.IsEmpty()).toBe(true);
  expect(copy.TopLeft()).toEqual(new Point(3, 5));
  copy.TopLeft().Move(10, 20);
  expect(copy.TopLeft()).toEqual(new Point(3, 5));
  copy.Union(new Rectangle(1, 2, 4, 6));
  expect(values(copy)).toEqual([1, 2, 4, 6, 4, 5]);
  expect(empty.IsEmpty()).toBe(true);
  expect(new Rectangle(new Point(1, 2), new Size(0, 5)).IsEmpty()).toBe(true);
  expect(new Rectangle(new Point(1, 2), new Size(5, 0)).IsEmpty()).toBe(true);
});
it("retains inclusive point-size construction and negative extents", /** Negative extents are not empty and do not normalize until union. @returns Nothing. */ () => {
  expect(values(new Rectangle(new Point(3, 5), new Size(4, 6)))).toEqual([3, 5, 6, 10, 4, 6]);
  const inverted = new Rectangle(new Point(3, 5), new Size(-4, -6));
  expect(values(inverted)).toEqual([3, 5, 0, 0, -4, -6]);
  expect(inverted.IsEmpty()).toBe(false);
  expect(values(new Rectangle(inverted))).toEqual([3, 5, 0, 0, -4, -6]);
  expect(values(new Rectangle(3, 5, 3, 5))).toEqual([3, 5, 3, 5, 1, 1]);
  expect(values(new Rectangle(3, 5, Rectangle.RECT_EMPTY, 10))).toEqual([3, 5, 3, 10, 0, 6]);
});
it("unions all four raw coordinates and preserves native empty operand rules", /** Assignment into empty receivers preserves an inverted operand until the next nonempty union. @returns Nothing. */ () => {
  const r = new Rectangle();
  expect(r.Union(new Rectangle(8, 9, 3, 2))).toBe(r);
  expect(values(r)).toEqual([8, 9, 3, 2, -6, -8]);
  r.Union(new Rectangle(20, 30));
  expect(values(r)).toEqual([8, 9, 3, 2, -6, -8]);
  r.Union(new Rectangle(0, 4, 6, 7));
  expect(values(r)).toEqual([0, 2, 8, 9, 9, 8]);
  r.Union(r);
  expect(values(r)).toEqual([0, 2, 8, 9, 9, 8]);
});
