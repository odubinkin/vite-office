/** @fileoverview Original span conversions on actual shared mdds; independent clipping, index-validity, iterator-value and nonzero-value contracts. */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import { flat_segment_tree } from "../../external/mdds/include/mdds/flat_segment_tree";
import { ColRowSpan, RowSpan } from "./columnspanset";
import { buildSpan, buildSpanWithValue, toSpanArray, toSpanArrayWithValue } from "./fstalgorithm";
/** Independent original three-field span template value. */
class ValueSpan {
  /** Constructs original coordinates/value. @param start - First. @param end - Last. @param value - Value. @returns Span. */
  public constructor(
    public start: number,
    public end: number,
    public value: number | boolean,
  ) {}
}
/** Complete original template observation wire format. */
interface Fixture {
  baselineCommit: string;
  output: [unknown[][], unknown[][]];
}
const fixture = JSON.parse(
  readFileSync(new NodeURL("./native-span-cases.json", import.meta.url), "utf8"),
) as Fixture;
/** Serializes original coordinate values. @param spans - Values. @returns Fields. */
function spanFields(spans: ColRowSpan[]): number[][] {
  return spans.map(
    /** Reads a span. @param span - Value. @returns Fields. */ (span) => [span.mnStart, span.mnEnd],
  );
}
describe("original flat segment span algorithms", /** Registers original template contract evidence. @returns Nothing. */ () => {
  it("matches unchanged native templates on every boolean pattern and numerical owner", /** Reproduces all original overloads on genuine shared storage. @returns Nothing. */ () => {
    expect(fixture.baselineCommit).toBe("9bc445578031fecf56086729d8e4940c77e14d65");
    expect(fixture.output[0]).toHaveLength(256);
    expect(fixture.output[1]).toHaveLength(64);
    for (let mask = 0; mask < 256; ++mask) {
      const tree = new flat_segment_tree<boolean>(0, 8, false);
      let pos = tree.begin();
      for (let row = 0; row < 8; ++row)
        pos = tree.insert(pos, row, row + 1, !!(mask & (1 << row)))[0];
      const before = spanFields(toSpanArray(tree, ColRowSpan)),
        unbuilt = spanFields(toSpanArray(tree, ColRowSpan, 2));
      tree.build_tree();
      const starts = [];
      for (let row = -2; row <= 9; ++row)
        starts.push(spanFields(toSpanArray(tree, ColRowSpan, row)));
      const spans = [new ColRowSpan(-7, -6)],
        begin = tree.begin();
      buildSpan(spans, begin, tree.end(), null, ColRowSpan);
      const unchanged = begin.equals(tree.begin()) ? 1 : 0;
      tree.insert_front(0, 8, false);
      expect([
        before,
        unbuilt,
        starts,
        spanFields(spans),
        unchanged,
        spanFields(toSpanArray(tree, ColRowSpan, 0)),
      ]).toEqual(fixture.output[0][mask]);
    }
    for (let seed = 0; seed < 64; ++seed) {
      const tree = new flat_segment_tree<number>(-2, 7, (seed % 3) - 1);
      let pos = tree.begin();
      for (let row = -2; row < 7; ++row)
        pos = tree.insert(pos, row, row + 1, ((seed + row + 66) % 5) - 2)[0];
      expect(
        toSpanArrayWithValue(tree, ValueSpan).map(
          /** Reads the independent template output. @param span - Value. @returns Fields. */ (
            span,
          ) => [span.start, span.end, span.value],
        ),
      ).toEqual(fixture.output[1][seed]);
    }
  });
  it("clips true spans and preserves passed iterator position and output prefix", /** Exercises every original clipping predicate. @returns Nothing. */ () => {
    const tree = new flat_segment_tree<boolean>(0, 10, false);
    tree.insert_front(1, 3, true);
    tree.insert_back(5, 9, true);
    expect(toSpanArray(tree, ColRowSpan)).toEqual([new ColRowSpan(1, 2), new ColRowSpan(5, 8)]);
    const position = tree.begin(),
      saved = position.copy();
    const output = [new ColRowSpan(-7, -6)];
    buildSpan(output, position, tree.end(), 2, ColRowSpan);
    expect(output).toEqual([new ColRowSpan(-7, -6), new ColRowSpan(2, 2), new ColRowSpan(5, 8)]);
    expect(position.equals(saved)).toBe(true);
    buildSpan(output, position, tree.end(), 9, ColRowSpan);
    expect(output).toHaveLength(3);
    expect(toSpanArray(tree, ColRowSpan, 2)).toEqual([]);
    tree.build_tree();
    expect(toSpanArray(tree, ColRowSpan, 2)).toEqual([new ColRowSpan(2, 2), new ColRowSpan(5, 8)]);
    expect(toSpanArray(tree, ColRowSpan, 3)).toEqual([new ColRowSpan(5, 8)]);
    expect(toSpanArray(tree, ColRowSpan, 9)).toEqual([]);
    expect(toSpanArray(tree, ColRowSpan, -1)).toEqual([]);
    expect(toSpanArray(tree, ColRowSpan, 10)).toEqual([]);
    tree.insert_front(3, 5, true);
    expect(tree.valid_tree()).toBe(false);
    expect(toSpanArray(tree, ColRowSpan, 1)).toEqual([]);
    expect(toSpanArray(tree, ColRowSpan)).toEqual([new ColRowSpan(1, 8)]);
  });
  it("keeps separate nonzero numerical values and caller iterator state", /** Verifies original value truth and independent template output. @returns Nothing. */ () => {
    const tree = new flat_segment_tree<number>(-2, 7, 0);
    tree.insert_front(-2, 0, -3);
    tree.insert_front(0, 2, 4);
    tree.insert_back(5, 7, 6);
    const position = tree.begin(),
      saved = position.copy(),
      values: ValueSpan[] = [];
    buildSpanWithValue(values, position, tree.end(), ValueSpan);
    expect(position.equals(saved)).toBe(true);
    expect(values).toEqual([
      new ValueSpan(-2, -1, -3),
      new ValueSpan(0, 1, 4),
      new ValueSpan(5, 6, 6),
    ]);
    expect(toSpanArrayWithValue(tree, ValueSpan)).toEqual(values);
    expect(toSpanArrayWithValue(new flat_segment_tree<boolean>(0, 4, true), ValueSpan)).toEqual([
      new ValueSpan(0, 3, true),
    ]);
    expect(new RowSpan(2, 4)).toEqual({ mnRow1: 2, mnRow2: 4 });
    expect(new ColRowSpan(2147483648, 4294967295)).toEqual({ mnStart: -2147483648, mnEnd: -1 });
  });
});
