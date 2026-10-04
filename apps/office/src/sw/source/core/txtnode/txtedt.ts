/** @fileoverview Ports the ordinary StyleApply exact whole-paragraph RstTextAttr branch from pinned sw/source/core/txtnode/txtedt.cxx. */
import type { SwTextNode } from "./ndtxt";
import { SwpHints } from "./ndhints";
import { RES_TXTATR_AUTOFMT } from "../../../inc/hintids";
import { SwFormatAutoFormat, SwTextAttr } from "./txatbase";
import { SfxItemState, type SfxItemSet } from "../../../../svl/source/items/itemset";

/** Ports full-node RstTextAttr for the registered ranged hint types; default non-exact reset includes internet hints. @param node - Reset text node. @param exactRange - Whether only exact whole AUTOFMT is removed. @param resetSet - Optional native selective deletion set. @returns Nothing. */
export function resetParagraphTextAttributes(
  node: SwTextNode,
  exactRange = false,
  resetSet?: SfxItemSet,
): void {
  const hints = node.GetpSwpHints();
  if (hints === undefined) return;
  if (!exactRange && resetSet !== undefined) {
    let changed = false;
    const retained = hints.entries().flatMap(
      /** Deletes selected hints or common direct SET values; fresh replacements use native constructor flags. @param hint - Original hint. @returns Remaining hint payload. */
      (hint) => {
        if (resetSet.GetItemState(hint.Which(), false) === SfxItemState.SET) {
          changed = true;
          return [];
        }
        if (!(hint.format instanceof SwFormatAutoFormat)) return [hint];
        const original = hint.format.GetStyleHandle();
        let style: SfxItemSet | undefined;
        for (const item of resetSet.entries()) {
          if (original.GetItemState(item.Which(), false) !== SfxItemState.SET) continue;
          style ??= original.Clone();
          style.ClearItem(item.Which());
        }
        if (style === undefined) return [hint];
        changed = true;
        if (style.Count() === 0) return [];
        return [new SwTextAttr(new SwFormatAutoFormat(style), hint.start, hint.end)];
      },
    );
    if (changed) node.SetTextHints(new SwpHints(node.GetDoc().GetAttrPool(), retained));
    return;
  }
  const retained = hints.entries().filter(
    /** Applies native bExactRange's WhichId and endpoint checks. @param hint - Direct ranged attribute. @returns Whether retained. */
    (hint) =>
      exactRange &&
      (hint.format.Which() !== RES_TXTATR_AUTOFMT || hint.start !== 0 || hint.end !== node.Len()),
  );
  if (retained.length !== hints.Count())
    node.SetTextHints(new SwpHints(node.GetDoc().GetAttrPool(), retained));
}

/** Performs initial StyleApply's exact full-paragraph hint reset. @param node - Reset text node. @returns Nothing. */
export function resetFullParagraphAutoFormat(node: SwTextNode): void {
  resetParagraphTextAttributes(node, true);
}
