/** @fileoverview Original ranged RstTextAttr geometry and selective automatic-style reset from txtedt.cxx for registered hint families. */
import type { SwTextNode } from "./ndtxt";
import { releaseStyleHandle } from "../../../../svl/source/items/stylepool";
import { SfxItemSet, SfxItemState } from "../../../../svl/source/items/itemset";
import { SfxItemIter } from "../../../../svl/inc/itemiter";
import { SwFormatAutoFormat, type SwTextAttrEnd } from "./txatbase";
import type { SwFormatCharFormat, SwFormatINetFormat } from "./fmtatr2";
import { SwTextCharFormat } from "./txtatr2";
import { MakeTextAttr } from "./thints";
import { DestroyTextNodeAttribute } from "./thints-insert";
import { SwAutoStyleFamily } from "../../../inc/istyleaccess";
import { SetAttrMode } from "../../../inc/swtypes";
import { RES_TXTATR_AUTOFMT } from "../../../inc/hintids";
import { SwUpdateAttr, UpdateAttrHint, SwFormatChangeHint } from "../../../inc/hints";
/** Actual registered native range families. */
type Hint = SwTextAttrEnd<SwFormatAutoFormat | SwFormatCharFormat | SwFormatINetFormat>;
/** Original lcl_HaveCommonAttributes: actual reduced automatic style or absent when every requested value is removed. @param node - Actual style access. @param requested - Optional deletion set. @param which - Single-item alternative. @param original - Source style. @returns Whether common fields exist and their original reduced native style handle. */
function common(
  node: SwTextNode,
  requested: SfxItemSet | undefined,
  which: number,
  original: SfxItemSet,
): [boolean, SfxItemSet | undefined] {
  let reduced: SfxItemSet | undefined;
  if (requested === undefined) {
    if (original.GetItemState(which, false) === SfxItemState.SET) {
      reduced = original.Clone();
      reduced.ClearItem(which);
    }
  } else if (requested.Count()) {
    for (const iter = new SfxItemIter(requested); !iter.IsAtEnd(); iter.Next()) {
      const id = iter.GetCurItem().Which();
      if (original.GetItemState(id, false) === SfxItemState.SET) {
        reduced ??= original.Clone();
        reduced.ClearItem(id);
      }
    }
  }
  try {
    return reduced === undefined
      ? [false, undefined]
      : [
          true,
          reduced.Count()
            ? node
                .GetDoc()
                .GetIStyleAccess()
                .getAutomaticStyle(reduced, SwAutoStyleFamily.AUTO_STYLE_CHAR)
            : undefined,
        ];
  } finally {
    reduced?.Dispose();
  }
}
/** Original selection policy over the actual supported families. @param node - Actual node. @param hint - Original hint. @param requested - Optional set. @param which - Single-item selector. @returns Skip policy and native remainder handle. */
export function GetTextResetStyle(
  node: SwTextNode,
  hint: Hint,
  requested: SfxItemSet | undefined,
  which: number,
): [boolean, SfxItemSet | undefined] {
  const skip =
    requested !== undefined
      ? requested.GetItemState(hint.Which(), false) !== SfxItemState.SET
      : which !== 0 && which !== hint.Which();
  if (skip && hint.format instanceof SwFormatAutoFormat) {
    const [has, style] = common(node, requested, which, hint.format.GetStyleHandle());
    return [!has, style];
  }
  return [skip, undefined];
}
/** Ports original deferred mutation/splitting, exact-range branch and notifications. Input-field expansion and reference/content/fieldmark owners do not exist in the registered model. @param node - Actual owner. @param start - Native reset start. @param length - Native length. @param which - Original single Which or zero. @param requested - Optional selective set. @param includeMarks - Original Undo mark policy; represented families have no dummy/content hints. @param exact - Original exact-range branch. @returns Nothing. */
export function ResetTextNodeAttributes(
  node: SwTextNode,
  start: number,
  length: number,
  which = 0,
  requested?: SfxItemSet,
  includeMarks = false,
  exact = false,
): void {
  void includeMarks;
  const hints = node.GetpSwpHints();
  if (hints === undefined) return;
  const end = start + length,
    empty = node.Len() === 0,
    added: Hint[] = [],
    removed: Hint[] = [];
  let changed = false,
    min = node.Len(),
    max = start;
  hints.SortIfNeedBe();
  for (let index = 0; index < hints.Count() && !exact; ++index) {
    const hint = hints.GetWithoutResorting(index),
      a = hint.GetStart(),
      b = hint.GetEnd();
    if (!(a < end || length === 0 || (end === a && a === node.Len()))) break;
    if (hint.HasContent()) continue;
    const [skip, style] = GetTextResetStyle(node, hint, requested, which);
    try {
      if (skip) continue;
      if (start <= a) {
        if (end > a || (end === b && end === a)) {
          min = Math.min(min, a);
          max = Math.max(max, b);
          changed ||= end > a || empty;
          if (b <= end) {
            removed.push(hint);
            if (style !== undefined) added.push(MakeTextAttr(node.GetDoc(), style, a, b));
          } else {
            changed = true;
            hints.NoteInHistory(hint);
            hint.SetStart(end);
            hints.NoteInHistory(hint, true);
            if (style !== undefined && a < end)
              added.push(MakeTextAttr(node.GetDoc(), style, a, end));
          }
        }
      } else if (b > start) {
        if (b < end) {
          min = Math.min(min, a);
          max = Math.max(max, b);
          changed = true;
          hints.NoteInHistory(hint);
          hint.SetEnd(start);
          hints.NoteInHistory(hint, true);
          if (style !== undefined) added.push(MakeTextAttr(node.GetDoc(), style, start, b));
        } else if (length !== 0) {
          min = Math.min(min, a);
          max = Math.max(max, b);
          changed = true;
          hints.NoteInHistory(hint);
          hint.SetEnd(start);
          hints.NoteInHistory(hint, true);
          if (style !== undefined && start < end)
            added.push(MakeTextAttr(node.GetDoc(), style, start, end));
          if (end < b) {
            const trailing = MakeTextAttr(node.GetDoc(), hint.GetAttr(), end, b);
            if (hint instanceof SwTextCharFormat && trailing instanceof SwTextCharFormat)
              trailing.SetSortNumber(hint.GetSortNumber());
            added.push(trailing);
          }
        }
      }
    } finally {
      if (style !== undefined) releaseStyleHandle(style);
    }
  }
  if (exact) {
    for (let index = 0; index < hints.Count(); ++index) {
      const hint = hints.Get(index);
      if (hint.Which() === RES_TXTATR_AUTOFMT && hint.GetStart() === start && hint.GetEnd() === end)
        removed.push(hint);
    }
  }
  if (changed && removed.length) hints.SortIfNeedBe();
  for (const hint of removed) {
    hints.DeleteAtPos(hints.entries().indexOf(hint));
    DestroyTextNodeAttribute(hint);
  }
  for (const hint of added) node.InsertHint(hint, SetAttrMode.NOHINTADJUST);
  node.TryDeleteSwpHints();
  if (!changed) return;
  node.GetpSwpHints()?.MergePortions(node);
  const update = new SwUpdateAttr(min, max, 0);
  node.CallSwClientNotify(new UpdateAttrHint(undefined, update));
  node.CallSwClientNotify(new SwFormatChangeHint(undefined, node.GetTextFormatColl()));
  // Existing browser observer binding, after the original native notifications.
  node.GetDoc().NotifyModelChange({
    kind: "attribute-set-changed",
    nodeIndex: node.GetNodes().indexOfOrUndefined(node),
  });
}
