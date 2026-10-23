/** @fileoverview Ports the ordinary exact/selective whole-paragraph RstTextAttr branches from pinned sw/source/core/txtnode/txtedt.cxx. */
import type { SwTextNode } from "./ndtxt";
import { SwpHints } from "./ndhints";
import { RES_TXTATR_AUTOFMT } from "../../../inc/hintids";
import { SwFormatAutoFormat } from "./txatbase";
import { MakeTextAttr } from "./thints";
import { SwAutoStyleFamily } from "../../../inc/istyleaccess";
import { SfxItemState, type SfxItemSet } from "../../../../svl/source/items/itemset";

/** Ports full-node RstTextAttr for the registered ranged hint types; default non-exact reset includes internet hints. @param node - Reset text node. @param exactRange - Whether only exact whole AUTOFMT is removed. @param resetSet - Optional native selective deletion set. @returns Nothing. */
export function resetParagraphTextAttributes(
  node: SwTextNode,
  exactRange = false,
  resetSet?: SfxItemSet,
): void {
  const hints = node.GetpSwpHints();
  if (hints === undefined) return;
  let changed = false;
  for (const hint of hints.entries()) {
    const retained =
      !exactRange && resetSet !== undefined
        ? ResetTextHintItem(node, hint, resetSet)
        : exactRange &&
            (hint.Which() !== RES_TXTATR_AUTOFMT ||
              hint.GetStart() !== 0 ||
              hint.GetEnd() !== node.Len())
          ? hint
          : undefined;
    if (retained === hint) continue;
    hints.DeleteAtPos(hints.entries().indexOf(hint));
    if (retained !== undefined) hints.Insert(retained);
    changed = true;
  }
  if (changed) {
    if (hints.CanBeDeleted()) node.SetTextHints(hints);
    else {
      hints.MergePortions(node);
      node
        .GetDoc()
        .NotifyModelChange({ kind: "attribute-set-changed", nodeIndex: node.GetIndex() });
    }
  }
}

/** Performs initial StyleApply's exact full-paragraph hint reset. @param node - Reset text node. @returns Nothing. */
export function resetFullParagraphAutoFormat(node: SwTextNode): void {
  resetParagraphTextAttributes(node, true);
}

/** Applies the original full-node selective hint-item deletion to an independent hint value without changing its node. Shared by actual mutation and native attribute history capture. @param node - Original pool/style owner. @param hints - Original native hint value. @param resetSet - Original selective deletion set. @returns Changed hint value or undefined when no original item participates. */
export function ResetTextNodeHintItems(
  node: SwTextNode,
  hints: SwpHints,
  resetSet: SfxItemSet,
): SwpHints | undefined {
  let changed = false;
  const retained = hints.entries().flatMap(
    /** Computes the identical native selective deletion for an independent history value. @param hint - Original value. @returns Retained value. */
    (hint) => {
      const value = ResetTextHintItem(node, hint, resetSet);
      changed ||= value !== hint;
      return value === undefined ? [] : [value];
    },
  );
  return changed ? new SwpHints(node.GetDoc().GetAttrPool(), retained) : undefined;
}

/** Retains the original owner unless a requested item actually participates in selective native deletion. @param node - Original pool owner. @param hint - Actual native attribute. @param resetSet - Requested items. @returns Original, freshly reconstructed,or removed native attribute. */
function ResetTextHintItem(
  node: SwTextNode,
  hint: ReturnType<SwpHints["Get"]>,
  resetSet: SfxItemSet,
): ReturnType<SwpHints["Get"]> | undefined {
  if (resetSet.GetItemState(hint.Which(), false) === SfxItemState.SET) return undefined;
  if (!(hint.format instanceof SwFormatAutoFormat)) return hint;
  const original = hint.format.GetStyleHandle();
  let style: SfxItemSet | undefined;
  for (const item of resetSet.entries()) {
    if (original.GetItemState(item.Which(), false) !== SfxItemState.SET) continue;
    style ??= original.Clone();
    style.ClearItem(item.Which());
  }
  if (style === undefined) return hint;
  if (style.Count() === 0) return undefined;
  const handle = node
    .GetDoc()
    .GetIStyleAccess()
    .getAutomaticStyle(style, SwAutoStyleFamily.AUTO_STYLE_CHAR);
  return MakeTextAttr(node.GetDoc(), handle, hint.GetStart(), hint.GetEnd());
}
