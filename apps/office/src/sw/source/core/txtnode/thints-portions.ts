/** @fileoverview Ports native BuildPortions for automatic and named character formats from thints.cxx. */
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { SwAutoStyleFamily } from "../../../inc/istyleaccess";
import { SetAttrMode } from "../../../inc/swtypes";
import { SwFormatAutoFormat, type SwTextAttrEnd } from "./txatbase";
import { SwFormatCharFormat, type SwFormatINetFormat } from "./fmtatr2";
import { SwTextCharFormat } from "./txtatr2";
import type { SwTextNode } from "./ndtxt";
import type { SwpHints } from "./ndhints";
import { MakeTextAttr } from "./thints";
import { CharFormat } from "../text/atrstck";
import { WRITER_CHARACTER_WHICH_RANGES } from "../../../inc/hintids";
/** Actual registered native ranged item families. */
type Hint = SwTextAttrEnd<SwFormatAutoFormat | SwFormatCharFormat | SwFormatINetFormat>;
/** Checks the two native portion-building families. @param hint - Actual owner. @returns Whether portioned. */
function portioned(hint: Hint): boolean {
  return hint.format instanceof SwFormatAutoFormat || hint.format instanceof SwFormatCharFormat;
}
/** Removes the actual hint identity through all native maps. The actual registered history receives the native old-item entry. @param hints - Actual maps. @param hint - Actual owned attribute. @returns Nothing. */
function remove(hints: SwpHints, hint: Hint): void {
  hints.DeleteAtPos(hints.entries().indexOf(hint));
}
/** Reuses source sort numbers for fresh split attributes, without copying other constructor flags. @param node - Actual document owner. @param other - Split source. @param start - Start. @param end - End. @returns Fresh range. */
function split(node: SwTextNode, other: Hint, start: number, end: number): Hint {
  const copy = MakeTextAttr(node.GetDoc(), other.GetAttr(), start, end);
  if (copy instanceof SwTextCharFormat && other instanceof SwTextCharFormat)
    copy.SetSortNumber(other.GetSortNumber());
  return copy;
}
/** Splits existing and incoming attributes at their common native boundaries and resolves direct/style ownership without flattening character styles. @param hints - Actual maps. @param node - Canonical paragraph. @param incoming - New detached automatic/character hint. @param mode - Native replacement flags. @returns Nothing. */
export function BuildTextHintPortions(
  hints: SwpHints,
  node: SwTextNode,
  incoming: Hint,
  mode: SetAttrMode,
): void {
  if (!portioned(incoming))
    throw new Error("BuildPortions requires a character or automatic format.");
  const start = incoming.GetStart(),
    end = incoming.GetEnd(),
    empty = start === end;
  if (!empty) {
    const pending: Hint[] = [];
    for (const other of [...hints.entries()]) {
      if (!portioned(other)) continue;
      let first = other.GetStart();
      if (end < first) break;
      const last = other.GetEnd();
      if (first < start && start < last) {
        pending.push(split(node, other, first, start));
        hints.NoteInHistory(other);
        other.SetStart(start);
        hints.NoteInHistory(other, true);
        first = start;
      }
      if (first < end && end < last) {
        pending.push(split(node, other, first, end));
        hints.NoteInHistory(other);
        other.SetStart(end);
        hints.NoteInHistory(other, true);
      }
    }
    for (const hint of pending) {
      hints.Insert(hint);
      hints.NoteInHistory(hint, true);
    }
  }
  const bounds = new Set([start, end]);
  if (!empty)
    for (const other of hints.entries()) {
      if (!portioned(other)) continue;
      if (end < other.GetStart()) break;
      if (start <= other.GetStart() && other.GetStart() <= end) bounds.add(other.GetStart());
      if (start <= other.GetEnd() && other.GetEnd() <= end) bounds.add(other.GetEnd());
    }
  const ordered = [...bounds].sort(
    /** Represents the native sorted coordinate vector. @param left - First. @param right - Second. @returns Order. */
    (left, right) => left - right,
  );
  for (let index = 0; index + 1 < ordered.length || empty; index++) {
    const first = ordered[index] as number,
      last = empty ? first : (ordered[index + 1] as number);
    const current: Hint[] = [];
    for (const other of hints.entries()) {
      if (!portioned(other)) continue;
      if (other.GetStart() > first) break;
      if (other.GetStart() === first && other.GetEnd() === last) current.push(other);
    }
    let result: Hint | undefined;
    if (incoming.format instanceof SwFormatCharFormat) {
      let count = 0;
      for (const other of current) {
        if (other.format instanceof SwFormatCharFormat) {
          const same = other.format.GetCharFormat() === incoming.format.GetCharFormat();
          if (
            !node.GetDoc().IsInXMLImport() &&
            (!(mode & SetAttrMode.DONTREPLACE) || empty || same)
          )
            remove(hints, other);
          else count++;
        } else if (other.format instanceof SwFormatAutoFormat) {
          const set = new SfxItemSet(
            other.format.GetStyleHandle().GetPool(),
            WRITER_CHARACTER_WHICH_RANGES,
          );
          for (const item of other.format.GetStyleHandle().entries())
            if (!CharFormat.IsItemIncluded(item.Which(), incoming)) set.Put(item);
          remove(hints, other);
          if (set.Count()) {
            const created = MakeTextAttr(node.GetDoc(), set, first, last);
            hints.Insert(created);
            hints.NoteInHistory(created, true);
          }
        }
      }
      if (first === start && last === end && count === 0) result = incoming;
      else {
        const copy = MakeTextAttr(node.GetDoc(), incoming.GetAttr(), first, last);
        if (!(copy instanceof SwTextCharFormat))
          throw new Error("Character portion has no native owner.");
        copy.SetSortNumber(count);
        result = copy;
      }
    } else if (incoming.format instanceof SwFormatAutoFormat) {
      let automatic: Hint | undefined, character: Hint | undefined;
      for (const other of current) {
        if (other.format instanceof SwFormatAutoFormat) automatic = other;
        else if (other.format instanceof SwFormatCharFormat) character = other;
      }
      let style: SfxItemSet | undefined = incoming.format.GetStyleHandle();
      if (automatic?.format instanceof SwFormatAutoFormat) {
        const merged = automatic.format.GetStyleHandle().Clone();
        merged.PutSet(style);
        if (!empty && node.GetpSwAttrSet() !== undefined && merged.Count()) {
          for (const item of merged.entries()) {
            const whole = node.GetSwAttrSet().GetItemIfSet(item.Which(), false);
            if (
              whole !== undefined &&
              SfxPoolItem.areSame(whole, item) &&
              (character === undefined || CharFormat.GetItem(character, item.Which()) === undefined)
            )
              merged.ClearItem(item.Which());
          }
        }
        remove(hints, automatic);
        if (merged.Count()) result = MakeTextAttr(node.GetDoc(), merged, first, last);
      } else {
        let optimize = true;
        if (!empty && node.GetpSwAttrSet() !== undefined && style.Count()) {
          let reduced: SfxItemSet | undefined;
          for (const item of style.entries()) {
            const whole = node.GetSwAttrSet().GetItemIfSet(item.Which(), false);
            if (
              whole !== undefined &&
              SfxPoolItem.areSame(whole, item) &&
              (character === undefined || CharFormat.GetItem(character, item.Which()) === undefined)
            ) {
              reduced ??= style.Clone();
              reduced.ClearItem(item.Which());
            }
          }
          if (reduced !== undefined) {
            optimize = false;
            style = reduced.Count()
              ? node
                  .GetDoc()
                  .GetIStyleAccess()
                  .getAutomaticStyle(reduced, SwAutoStyleFamily.AUTO_STYLE_CHAR)
              : undefined;
          }
        }
        if (optimize && first === start && last === end) result = incoming;
        else if (style !== undefined) result = MakeTextAttr(node.GetDoc(), style, first, last);
      }
    }
    if (result !== undefined) {
      hints.Insert(result);
      hints.NoteInHistory(result, true);
    }
    if (empty) break;
  }
}
/** Native NOHINTADJUST sort-number correction for equal-boundary character formats. @param hints - Existing maps. @param hint - New actual character owner. @returns Nothing. */
export function CheckCharacterHintSortNumber(hints: SwpHints, hint: SwTextCharFormat): void {
  let order = 0;
  for (const other of hints.entries()) {
    if (other.GetStart() > hint.GetStart()) break;
    if (
      other instanceof SwTextCharFormat &&
      other.GetStart() === hint.GetStart() &&
      other.GetEnd() === hint.GetEnd()
    )
      order = (other.GetSortNumber() + 1) & 0xffff;
  }
  if (order > 0) hint.SetSortNumber(order);
}
