/** @fileoverview Checks literal native base/end/nesting contracts without loading upstream. */
import { describe, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwFormatINetFormat } from "./fmtatr2";
import { SwTextAttr, SwTextAttrEnd, SwTextAttrNesting } from "./txatbase";
import { SwTextINetFormat } from "./txtatr2";

/** Test subclass exposes the protected native base constructor. */
class Point extends SwTextAttr<SwFormatINetFormat> {
  /** Initializes a point. @param start - Start offset. @returns Nothing. */
  public constructor(start: number) {
    super(new SwFormatINetFormat({ url: "point" }), start);
  }
}
/** Test subclass exercises protected native flags on ordinary ranges. */
class Range extends SwTextAttrEnd<SwFormatINetFormat> {
  /** Writes one independent native flag. @param index - Literal flag index. @param value - Flag value. @returns Nothing. */
  public flag(index: number, value: boolean): void {
    switch (index) {
      case 0:
        this.SetDontExpand(value);
        break;
      case 1:
        this.SetLockExpandFlag(value);
        break;
      case 2:
        this.SetDontMoveAttr(value);
        break;
      case 3:
        this.SetCharFormatAttr(value);
        break;
      case 4:
        this.SetOverlapAllowedAttr(value);
        break;
      case 5:
        this.SetPriorityAttr(value);
        break;
      case 6:
        this.SetDontExpandStartAttr(value);
        break;
      case 7:
        this.SetNesting(value);
        break;
      case 8:
        this.SetHasDummyChar(value);
        break;
      case 9:
        this.SetFormatIgnoreStart(value);
        break;
      case 10:
        this.SetFormatIgnoreEnd(value);
        break;
      case 11:
        this.SetHasContent(value);
        break;
    }
  }
}
/** Test subclass exposes the protected native nesting constructor. */
class Nesting extends SwTextAttrNesting<SwFormatINetFormat> {
  /** Initializes a nesting range. @returns Nothing. */
  public constructor() {
    super(new SwFormatINetFormat({ url: "nesting" }), 2, 6);
  }
}
/** Reads flags in the native declaration order, independently of portable projections. @param attr - Actual attribute. @returns Ordered flags. */
function flags(attr: SwTextAttr<SwFormatINetFormat>): boolean[] {
  return [
    attr.DontExpand(),
    attr.IsLockExpandFlag(),
    attr.IsDontMoveAttr(),
    attr.IsCharFormatAttr(),
    attr.IsOverlapAllowedAttr(),
    attr.IsPriorityAttr(),
    attr.IsDontExpandStartAttr(),
    attr.IsNesting(),
    attr.HasDummyChar(),
    attr.IsFormatIgnoreStart(),
    attr.IsFormatIgnoreEnd(),
    attr.HasContent(),
  ];
}
const ordinary = [
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
];
const nesting = [true, true, false, false, false, false, true, true, false, false, false, false];
const internet = [true, true, false, true, false, false, true, true, false, false, false, false];

describe("native text attribute hierarchy", /** Registers literal constructor/flag/coordinate cases. @returns Nothing. */ () => {
  it("separates point, ranged, nesting and internet attribute contracts", /** Checks actual inheritance and optional-end dispatch. @returns Nothing. */ () => {
    const point = new Point(0),
      range = new Range(new SwFormatINetFormat({ url: "range" }), 2, 6),
      nested = new Nesting(),
      link = new SwTextINetFormat(new SwFormatINetFormat({ url: "link" }), 2, 6);
    expect(flags(point)).toEqual(ordinary);
    expect(point.GetEnd()).toBeUndefined();
    expect(point.End()).toBeUndefined();
    expect(point.GetAnyEnd()).toBe(0);
    expect(point.GetAttr()).toBe(point.format);
    expect(point.Which()).toBe(54);
    point.start = 4;
    expect(point.GetAnyEnd()).toBe(4);
    expect(/** Writes an unsupported point end. @returns Nothing. */ () => point.SetEnd(4)).toThrow(
      "has no end",
    );
    expect(range).toBeInstanceOf(SwTextAttr);
    expect(flags(range)).toEqual(ordinary);
    expect(range.End()).toBe(6);
    expect(range.GetAnyEnd()).toBe(6);
    expect(nested).toBeInstanceOf(SwTextAttrEnd);
    expect(flags(nested)).toEqual(nesting);
    expect(flags(nested.clone())).toEqual(nesting);
    expect(nested.clone()).toBeInstanceOf(SwTextAttrNesting);
    expect(link).toBeInstanceOf(SwTextAttrNesting);
    expect(flags(link)).toEqual(internet);
    expect(link.format.GetTextINetFormat()).toBe(link);
    expect(link.format.Clone().GetTextINetFormat()).toBeUndefined();
    expect(new SwFormatINetFormat({ url: "detached" }).GetTextINetFormat()).toBeUndefined();
  });
  it.each([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])(
    "retains independent snapshot flag %s",
    /** Checks native storage independence and snapshot state. @param index - Literal flag index. @returns Nothing. */ (
      index,
    ) => {
      const range = new Range(new SwFormatINetFormat({ url: "flag" }), 2, 6);
      range.flag(index, true);
      const expected = [...ordinary];
      expected[index] = true;
      expect(flags(range)).toEqual(expected);
      const copy = range.clone(3);
      expect(flags(copy)).toEqual(expected);
      expect([copy.GetStart(), copy.GetEnd()]).toEqual([5, 9]);
      expect(copy.format).not.toBe(range.format);
      range.flag(index, false);
      expect(flags(range)).toEqual(ordinary);
      expect(flags(copy)).toEqual(expected);
    },
  );
  it.each([false, true])(
    "honors the native lock independently of flag value=%s",
    /** Checks lock prevents both transitions until unlocked. @param initial - Initial expansion flag. @returns Nothing. */ (
      initial,
    ) => {
      const range = new Range(new SwFormatINetFormat({ url: "lock" }), 2, 6);
      range.SetDontExpand(initial);
      range.SetLockExpandFlag(true);
      range.SetDontExpand(!initial);
      range.dontExpand = !initial;
      expect(range.DontExpand()).toBe(initial);
      expect(range.clone().DontExpand()).toBe(initial);
      range.SetLockExpandFlag(false);
      range.dontExpand = !initial;
      expect(range.DontExpand()).toBe(!initial);
      range.dontExpandStart = true;
      range.dontMoveAttr = true;
      expect(range.IsDontExpandStartAttr()).toBe(true);
      expect(range.IsDontMoveAttr()).toBe(true);
    },
  );
  it("allows temporary crossed and signed native integer coordinates", /** Checks end writes do not enforce range ordering. @returns Nothing. */ () => {
    const point = new Point(-2),
      range = new Range(new SwFormatINetFormat({ url: "coordinates" }), 4, 2);
    expect(point.GetStart()).toBe(-2);
    expect([range.start, range.end]).toEqual([4, 2]);
    range.SetEnd(-3);
    range.SetStart(-4);
    expect([range.start, range.end]).toEqual([-4, -3]);
    range.end = -3;
    expect(range.GetEnd()).toBe(-3);
    for (const invalid of [0.5, NaN, Infinity]) {
      expect(
        /** Constructs an invalid point. @returns No valid point. */ () => new Point(invalid),
      ).toThrow("start is invalid");
      expect(
        /** Writes an invalid start. @returns Nothing. */ () => range.SetStart(invalid),
      ).toThrow("start is invalid");
      expect(
        /** Constructs an invalid range end. @returns No valid range. */ () =>
          new Range(range.format, 0, invalid),
      ).toThrow("end is invalid");
      expect(/** Writes an invalid end. @returns Nothing. */ () => range.SetEnd(invalid)).toThrow(
        "end is invalid",
      );
    }
  });
  it("keeps native protected constructors and flag setters hidden from callers", /** Checks compile-time native visibility without invoking invalid access. @returns Nothing. */ () => {
    /** Contains deliberately rejected public accesses checked by TypeScript. @returns Nothing. */
    function rejected(): void {
      const item = new SwFormatINetFormat({ url: "visibility" });
      // @ts-expect-error Native base constructor is protected.
      new SwTextAttr(item, 0);
      // @ts-expect-error Native nesting constructor is protected.
      new SwTextAttrNesting(item, 0, 1);
      const attr = new SwTextAttrEnd(item, 0, 1);
      // @ts-expect-error Native SetDontMoveAttr setter is protected.
      attr.SetDontMoveAttr(true);
      // @ts-expect-error Native SetCharFormatAttr setter is protected.
      attr.SetCharFormatAttr(true);
      // @ts-expect-error Native SetOverlapAllowedAttr setter is protected.
      attr.SetOverlapAllowedAttr(true);
      // @ts-expect-error Native SetNesting setter is protected.
      attr.SetNesting(true);
      // @ts-expect-error Native SetHasDummyChar setter is protected.
      attr.SetHasDummyChar(true);
      // @ts-expect-error Native SetHasContent setter is protected.
      attr.SetHasContent(true);
    }
    expect(rejected).toBeTypeOf("function");
    expect(new SwDoc().GetAttrPool()).toBeDefined();
  });
});
