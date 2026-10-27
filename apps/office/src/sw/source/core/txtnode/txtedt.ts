/** @fileoverview Ports the ordinary exact/selective whole-paragraph RstTextAttr branches from pinned sw/source/core/txtnode/txtedt.cxx. */
import type { SwTextNode } from "./ndtxt";
import { SwpHints } from "./ndhints";
import { releaseStyleHandle } from "../../../../svl/source/items/stylepool";
import { DestroyTextNodeAttribute } from "./thints-insert";
import { MakeTextAttr } from "./thints";
import { GetTextResetStyle } from "./txtedt-reset";
import { type SfxItemSet } from "../../../../svl/source/items/itemset";

/** Ports full-node RstTextAttr for the registered ranged hint types; default non-exact reset includes internet hints. @param node - Reset text node. @param exactRange - Whether only exact whole AUTOFMT is removed. @param resetSet - Optional native selective deletion set. @returns Nothing. */
export function resetParagraphTextAttributes(
  node: SwTextNode,
  exactRange = false,
  resetSet?: SfxItemSet,
): void {
  node.RstTextAttr(0, node.Len(), 0, resetSet, false, exactRange);
}

/** Performs initial StyleApply's exact full-paragraph hint reset. @param node - Reset text node. @returns Nothing. */
export function resetFullParagraphAutoFormat(node: SwTextNode): void {
  resetParagraphTextAttributes(node, true);
}

/** Applies the original full-node selective hint-item deletion to an independent hint value without changing its node. Uses the same native selection helper as actual mutation for history capture. @param node - Original pool/style owner. @param hints - Original native hint value. @param resetSet - Original selective deletion set. @returns Changed hint value or undefined when no original item participates. */
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
  try {
    return changed ? new SwpHints(node.GetDoc().GetAttrPool(), retained) : undefined;
  } finally {
    for (const hint of retained)
      if (!hints.entries().includes(hint)) DestroyTextNodeAttribute(hint);
  }
}

/** Retains the original owner unless a requested item actually participates in selective native deletion. @param node - Original pool owner. @param hint - Actual native attribute. @param resetSet - Requested items. @returns Original, freshly reconstructed,or removed native attribute. */
function ResetTextHintItem(
  node: SwTextNode,
  hint: ReturnType<SwpHints["Get"]>,
  resetSet: SfxItemSet,
): ReturnType<SwpHints["Get"]> | undefined {
  const [skip, style] = GetTextResetStyle(node, hint, resetSet, 0);
  try {
    return skip
      ? hint
      : style === undefined
        ? undefined
        : MakeTextAttr(node.GetDoc(), style, hint.GetStart(), hint.GetEnd());
  } finally {
    if (style !== undefined) releaseStyleHandle(style);
  }
}
