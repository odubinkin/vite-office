/** @fileoverview Original TryInsertNesting passes for Writer's hyperlink and ruby attributes. */
import type { SwTextNode } from "./ndtxt";
import type { SwpHints } from "./ndhints";
import { SwTextINetFormat, SwTextRuby } from "./txtatr2";
import { MakeTextAttr } from "./thints";

/** Registered native nesting attributes in the supported Writer text model. */
export type NestingAttribute = SwTextINetFormat | SwTextRuby;

/** Source size_t hint limit on the pinned 64-bit reference target. */
export const MAX_HINTS = (1n << 64n) - 2n;

/** Original asymmetric nesting predicate. @param a - First start. @param b - First end. @param c - Second start. @param d - Second end. @returns Whether native ranges nest. */
function isNestedAny(a: number, b: number, c: number, d: number): boolean {
  return a === c || b === d ? a !== b || c === d : a < c ? b >= d : b <= d;
}

/** Creates an independent nesting fragment with the original default style listener. @param node - Actual paragraph. @param hint - Existing item owner. @param start - Inclusive position. @param end - Exclusive position. @returns New attribute. */
function MakeTextAttrNesting(
  node: SwTextNode,
  hint: NestingAttribute,
  start: number,
  end: number,
): NestingAttribute {
  const created = MakeTextAttr(node.GetDoc(), hint.GetAttr(), start, end);
  if (created instanceof SwTextINetFormat) created.InitINetFormat(node);
  else if (created instanceof SwTextRuby) created.InitRuby(node);
  else throw new Error("Expected a native Writer nesting attribute.");
  return created;
}

/** Inserts an attribute and records its native insertion history. @param hints - Actual ordered maps. @param hint - Detached attribute. @returns Nothing. */
function InsertNesting(hints: SwpHints, hint: NestingAttribute): void {
  hints.Insert(hint);
  hints.NoteInHistory(hint, true);
}

/** Implements the native split and replacement order for hyperlinks and ruby ranges. @param hints - Actual ordered maps. @param node - Source text node. @param incoming - New nesting attribute. @returns Insertion success. */
export function TryInsertNesting(
  hints: SwpHints,
  node: SwTextNode,
  incoming: NestingAttribute,
): boolean {
  const start = incoming.GetStart();
  const end = incoming.GetEnd();
  const overlapping: NestingAttribute[] = [];
  const overwritten: NestingAttribute[] = [];
  const splitPositions = new Set<number>();
  for (let index = 0; index < hints.Count(); ++index) {
    const other = hints.GetSortedByEnd(index);
    if (!other.IsNesting()) continue;
    if (!(other instanceof SwTextINetFormat) && !(other instanceof SwTextRuby))
      throw new Error("Writer structured nesting is not implemented.");
    const a = other.GetStart();
    const b = other.GetEnd();
    const overlapBefore = start < a && a < end && end < b;
    const overlapBehind = a < start && start < b && b < end;
    if (overlapBefore || overlapBehind) {
      if (incoming instanceof SwTextINetFormat && other instanceof SwTextRuby)
        splitPositions.add(overlapBefore ? a : b);
      else overlapping.push(other);
    } else if (incoming.Which() === other.Which() && isNestedAny(start, end, a, b))
      overwritten.push(other);
  }

  const fragments = [incoming];
  for (const position of [...splitPositions].sort(
    /** Orders original split boundaries. @param left - Left offset. @param right - Right offset. @returns Sort order. */
    (left, right) => left - right,
  )) {
    fragments.at(-1)?.SetEnd(position);
    fragments.push(MakeTextAttrNesting(node, incoming, position, end));
  }

  for (const other of overlapping) {
    const a = other.GetStart();
    const b = other.GetEnd();
    const preserveOverlap = incoming.Which() !== other.Which();
    for (const fragment of fragments) {
      const c = fragment.GetStart();
      const d = fragment.GetEnd();
      if (c < a && a < d && d < b) {
        hints.DeleteAtPos(hints.entries().indexOf(other));
        other.SetStart(d);
        InsertNesting(hints, other);
        if (preserveOverlap) InsertNesting(hints, MakeTextAttrNesting(node, other, a, d));
        break;
      }
      if (a < c && c < b && b < d) {
        hints.DeleteAtPos(hints.entries().indexOf(other));
        other.SetEnd(c);
        InsertNesting(hints, other);
        if (preserveOverlap) InsertNesting(hints, MakeTextAttrNesting(node, other, c, b));
        break;
      }
    }
  }

  if (MAX_HINTS - BigInt(hints.Count()) <= BigInt(fragments.length)) return false;
  for (const fragment of fragments) InsertNesting(hints, fragment);
  for (const other of overwritten) {
    const a = other.GetStart();
    const b = other.GetEnd();
    hints.DeleteAtPos(hints.entries().indexOf(other));
    if (end < b) TryInsertNesting(hints, node, MakeTextAttrNesting(node, other, end, b));
    if (a < start) {
      other.SetEnd(start);
      TryInsertNesting(hints, node, other);
    } else {
      other.EndListeningAll();
      other.GetAttr().Dispose();
    }
  }
  return true;
}
