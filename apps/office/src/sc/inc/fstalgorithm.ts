/** @fileoverview Original fstalgorithm.hxx span-building templates over the shared mdds leaf/index owner. Template span types use explicit constructor arguments in TypeScript. */
import { flat_segment_tree } from "../../external/mdds/include/mdds/flat_segment_tree";
import type { const_iterator } from "../../external/mdds/include/mdds/flat_segment_tree_itr";
import type { SegmentValue } from "../../external/mdds/include/mdds/node";

/** Original two-coordinate span constructor template argument. */
export type SpanConstructor<Span> = new (start: number, end: number) => Span;
/** Original coordinate/value span constructor template argument. */
export type ValueSpanConstructor<Value, Span> = new (
  start: number,
  end: number,
  value: Value,
) => Span;

/** Appends original true inclusive leaf spans, optionally clipping at a starting key. @param spans - Mutable output vector. @param position - Copied starting iterator. @param end - Terminal iterator. @param start - Optional clipping key pointer. @param Span - Native span template argument. @returns Nothing. */
export function buildSpan<Span>(
  spans: Span[],
  position: const_iterator<boolean>,
  end: const_iterator<boolean>,
  start: number | null,
  Span: SpanConstructor<Span>,
): void {
  const iterator = position.copy();
  let lastPos = iterator.value().first,
    lastValue = iterator.value().second;
  for (iterator.increment(); !iterator.equals(end); iterator.increment()) {
    const thisPos = iterator.value().first,
      thisValue = iterator.value().second;
    if (lastValue) {
      const first = lastPos,
        last = thisPos - 1;
      if (start === null || start < first) spans.push(new Span(first, last));
      else if (start <= last) spans.push(new Span(start, last));
    }
    lastPos = thisPos;
    lastValue = thisValue;
  }
}
/** Appends original nonzero-valued leaf spans without merging distinct values. @param spans - Mutable output. @param position - Starting iterator copied by value. @param end - Terminal iterator. @param Span - Native span template argument. @returns Nothing. */
export function buildSpanWithValue<Value extends SegmentValue, Span>(
  spans: Span[],
  position: const_iterator<Value>,
  end: const_iterator<Value>,
  Span: ValueSpanConstructor<Value, Span>,
): void {
  const iterator = position.copy();
  let lastPos = iterator.value().first,
    lastValue = iterator.value().second;
  for (iterator.increment(); !iterator.equals(end); iterator.increment()) {
    const thisPos = iterator.value().first,
      thisValue = iterator.value().second;
    if (lastValue) spans.push(new Span(lastPos, thisPos - 1, lastValue));
    lastPos = thisPos;
    lastValue = thisValue;
  }
}
/** Converts original true leaves, or uses the already-valid native search index for the start-key overload. @param tree - Original tree. @param Span - Span template type. @param start - Optional original starting key. @returns Independent span vector. */
export function toSpanArray<Span>(
  tree: flat_segment_tree<boolean>,
  Span: SpanConstructor<Span>,
  start?: number,
): Span[] {
  const spans: Span[] = [];
  if (start === undefined) buildSpan(spans, tree.begin(), tree.end(), null, Span);
  else {
    if (!tree.valid_tree()) return spans;
    const result = tree.search_tree(start, false);
    if (!result[1]) return spans;
    buildSpan(spans, result[0], tree.end(), start, Span);
  }
  return spans;
}
/** Converts original nonzero leaf values into inclusive value-bearing spans. @param tree - Original primitive-value tree. @param Span - Span template type. @returns Independent span vector. */
export function toSpanArrayWithValue<Value extends SegmentValue, Span>(
  tree: flat_segment_tree<Value>,
  Span: ValueSpanConstructor<Value, Span>,
): Span[] {
  const spans: Span[] = [];
  buildSpanWithValue(spans, tree.begin(), tree.end(), Span);
  return spans;
}
