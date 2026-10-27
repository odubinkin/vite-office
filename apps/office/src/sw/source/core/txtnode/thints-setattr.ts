/** @fileoverview Original SwTextNode::SetAttr item-set/range decisions and DontExpandFormat from thints.cxx/ndtxt.cxx. */
import type { SwTextNode } from "./ndtxt";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxItemIter } from "../../../../svl/inc/itemiter";
import { IsInvalidItem } from "../../../../svl/source/items/poolitem";
import {
  RES_CHRATR_BEGIN,
  RES_CHRATR_END,
  RES_TXTATR_BEGIN,
  RES_TXTATR_END,
  RES_TXTATR_CHARFMT,
  RES_TXTATR_AUTOFMT,
  WRITER_CHARACTER_WHICH_RANGES,
} from "../../../inc/hintids";
import { SwFormatAutoFormat } from "./txatbase";
import { SwFormatCharFormat } from "./fmtatr2";
import type { RangedTextAttribute } from "./ndtxt-attribute-query";
import { MakeTextAttr } from "./thints";
import { SetAttrMode } from "../../../inc/swtypes";
/** Native optional SwTextAttr** output, borrowed even when a later native insertion destroys that identity. */
export type TextAttributeOutput = [RangedTextAttribute | undefined];
/** Original node range setter: direct paragraph items only when no character-format hint overrides them, otherwise actual text attributes. @param node - Actual node. @param set - Native item set. @param start - Inclusive range start. @param end - Exclusive range end. @param mode - Original flags. @param output - Optional first text-attribute pointer. @returns Original insertion/direct-set result. */
export function SetTextNodeAttributes(
  node: SwTextNode,
  set: SfxItemSet,
  start: number,
  end: number,
  mode: SetAttrMode,
  output?: TextAttributeOutput,
): boolean {
  if (!set.Count()) return false;
  let selected = set;
  const text = new SfxItemSet(set.GetPool(), [[RES_TXTATR_BEGIN, RES_TXTATR_END - 1]]);
  if (start === 0 && end === node.Len() && !(mode & SetAttrMode.NOFORMATATTR)) {
    const hasChar =
      node
        .GetpSwpHints()
        ?.entries()
        .some(
          /** Original IsCharFormatAttr test includes INET. @param hint - Actual hint. @returns Native flag. */ (
            hint,
          ) => hint.IsCharFormatAttr(),
        ) ?? false;
    if (!hasChar) {
      text.PutSet(set);
      if (text.Count() !== set.Count()) {
        const changed = node.SetAttr(set);
        if (!text.Count()) return changed;
      }
      const automatic = text.GetItemIfSet(RES_TXTATR_AUTOFMT, false);
      if (automatic instanceof SwFormatAutoFormat) {
        const changed = node.SetAttr(automatic.GetStyleHandle());
        if (text.Count() === 1) return changed;
      }
      selected = text;
    }
  }
  node.GetOrCreateSwpHints();
  const characters = new SfxItemSet(set.GetPool(), WRITER_CHARACTER_WHICH_RANGES);
  let count = 0;
  for (const iter = new SfxItemIter(selected); !iter.IsAtEnd(); iter.Next()) {
    const item = iter.GetCurItem();
    if (IsInvalidItem(item)) continue;
    const which = item.Which(),
      character = which >= RES_CHRATR_BEGIN && which < RES_CHRATR_END;
    if (!character && !(which >= RES_TXTATR_BEGIN && which < RES_TXTATR_END)) continue;
    if (
      which === RES_TXTATR_CHARFMT &&
      item instanceof SwFormatCharFormat &&
      item.GetCharFormat() === node.GetDoc().GetDfltCharFormat()
    ) {
      node.RstTextAttr(start, end - start, RES_TXTATR_CHARFMT);
      node.DontExpandFormat(start);
    } else if (character) characters.Put(item);
    else {
      const hint = MakeTextAttr(node.GetDoc(), item, start, end);
      if (output !== undefined && output[0] === undefined) output[0] = hint;
      if (node.InsertHint(hint, mode)) ++count;
    }
  }
  if (
    characters.Count() &&
    node.InsertHint(MakeTextAttr(node.GetDoc(), characters, start, end), mode)
  )
    ++count;
  node.TryDeleteSwpHints();
  return count !== 0;
}
/** Original end-map traversal records old values only, skips locked/empty hints and optionally converts direct end-of-paragraph formatting first. @param node - Actual owner. @param offset - Native boundary. @param flag - Requested DontExpand flag. @param convert - Original FormatToTextAttr policy. @returns Whether a flag changed. */
export function DontExpandTextNodeFormat(
  node: SwTextNode,
  offset: number,
  flag: boolean,
  convert: boolean,
): boolean {
  if (convert && offset === node.Len()) node.FormatToTextAttr(node);
  const hints = node.GetpSwpHints();
  if (hints === undefined) return false;
  hints.SortIfNeedBe();
  let changed = false;
  for (let index = hints.GetLastPosSortedByEnd(offset); index >= 0; --index) {
    const hint = hints.GetSortedByEnd(index);
    if (hint.GetEnd() !== offset) break;
    if (flag !== hint.DontExpand() && !hint.IsLockExpandFlag() && hint.GetEnd() > hint.GetStart()) {
      changed = true;
      hints.NoteInHistory(hint);
      hint.SetDontExpand(flag);
    }
  }
  return changed;
}
