/** @fileoverview Original TryInsertNesting passes for the registered INET nesting family from thints.cxx; structured/Ruby hint owners remain unrepresented. */
import type { SwTextNode } from "./ndtxt";
import type { SwpHints } from "./ndhints";
import { SwTextINetFormat } from "./txtatr2";
import { MakeTextAttr } from "./thints";
/** Source size_t hint limit on the pinned 64-bit reference target. JS arrays cannot reach this count. */
export const MAX_HINTS = (1n << 64n) - 2n;
/** Original asymmetric nesting predicate: an empty first interval is not nested in a nonempty second. @param a - First start. @param b - First end. @param c - Second start. @param d - Second end. @returns Whether nested by the original test. */
function isNestedAny(a: number, b: number, c: number, d: number): boolean {
  return a === c || b === d ? a !== b || c === d : a < c ? b >= d : b <= d;
}
/** Constructs the original fresh nesting fragment and initializes its source normal-style client. @param node - Actual owner. @param hint - Source INET attribute. @param start - New start. @param end - New end. @returns Fresh fragment. */
function MakeTextAttrNesting(
  node: SwTextNode,
  hint: SwTextINetFormat,
  start: number,
  end: number,
): SwTextINetFormat {
  const created = MakeTextAttr(node.GetDoc(), hint.GetAttr(), start, end);
  if (!(created instanceof SwTextINetFormat))
    throw new Error("Expected native internet nesting attribute.");
  created.InitINetFormat(node);
  return created;
}
/** Original raw insertion plus new history capture. @param hints - Actual maps. @param hint - Detached attribute. @returns Nothing. */
function InsertNesting(hints: SwpHints, hint: SwTextINetFormat): void {
  hints.Insert(hint);
  hints.NoteInHistory(hint, true);
}
/** Ports original four-pass nesting insertion for the actual registered family. INET/INET uses SPLIT_OTHER and is not self-nestable; no unsupported structured owner or fieldmark is synthesized. @param hints - Actual maps. @param node - Actual node. @param incoming - New INET attribute. @returns Native insertion result. */
export function TryInsertInternetNesting(
  hints: SwpHints,
  node: SwTextNode,
  incoming: SwTextINetFormat,
): boolean {
  const start = incoming.GetStart(),
    end = incoming.GetEnd(),
    overlapping: SwTextINetFormat[] = [],
    overwritten: SwTextINetFormat[] = [];
  // Pass1: only INET is represented; same-family overlap uses SPLIT_OTHER.
  for (let index = 0; index < hints.Count(); ++index) {
    const other = hints.GetSortedByEnd(index);
    if (!other.IsNesting()) continue;
    if (!(other instanceof SwTextINetFormat))
      throw new Error("Writer structured nesting is not implemented.");
    const a = other.GetStart(),
      b = other.GetEnd();
    if ((start > a && start < b && end > b) || (start < a && a < end && end < b))
      overlapping.push(other);
    else if (isNestedAny(start, end, a, b)) overwritten.push(other);
  }
  // Pass1b has no branches in the represented collapsed-bookmark model: no fieldmarks exist.
  // Pass2: preserve original existing owners when truncating their overlapping portion.
  for (const other of overlapping) {
    const a = other.GetStart(),
      b = other.GetEnd();
    if (start < a && a < end && end < b) {
      hints.DeleteAtPos(hints.entries().indexOf(other));
      other.SetStart(end);
      InsertNesting(hints, other);
    } else if (a < start && start < b && b < end) {
      hints.DeleteAtPos(hints.entries().indexOf(other));
      other.SetEnd(start);
      InsertNesting(hints, other);
    }
  }
  // Original capacity check deliberately reserves strictly more than the one incoming fragment.
  if (MAX_HINTS <= BigInt(hints.Count()) || MAX_HINTS - BigInt(hints.Count()) <= 1n) return false;
  // Pass3: insert first, then repair overwritten hints in original remembered order.
  InsertNesting(hints, incoming);
  for (const other of overwritten) {
    const a = other.GetStart(),
      b = other.GetEnd();
    hints.DeleteAtPos(hints.entries().indexOf(other));
    if (start <= a && b <= end) other.EndListeningAll();
    else {
      if (end < b) TryInsertInternetNesting(hints, node, MakeTextAttrNesting(node, other, end, b));
      if (a < start) {
        other.SetEnd(start);
        TryInsertInternetNesting(hints, node, other);
      } else other.EndListeningAll();
    }
  }
  return true;
}
