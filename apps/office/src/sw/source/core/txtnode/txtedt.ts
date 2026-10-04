/** @fileoverview Ports the ordinary StyleApply exact whole-paragraph RstTextAttr branch from pinned sw/source/core/txtnode/txtedt.cxx. */
import type { SwTextNode } from "./ndtxt";
import { SwpHints } from "./ndhints";
import { RES_TXTATR_AUTOFMT } from "../../../inc/hintids";
import { SwFormatAutoFormat, SwTextAttr } from "./txatbase";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";

/** Ports full-node RstTextAttr for the registered ranged hint types; default non-exact reset includes internet hints. @param node - Reset text node. @param exactRange - Whether only exact whole AUTOFMT is removed. @param resetSet - Optional native selective deletion set. @returns Nothing. */
export function resetParagraphTextAttributes(
  node: SwTextNode,
  exactRange = false,
  resetSet?: SfxItemSet,
): void {
  const hints = node.GetpSwpHints();
  if (hints === undefined) return;
  if (resetSet !== undefined) {
    const retained = hints.entries().flatMap(
      /** Removes only common automatic-style items as native pDelSet does, retaining internet hints and independent flags. @param hint - Original hint. @returns Remaining hint payload. */
      (hint) => {
        if (!(hint.format instanceof SwFormatAutoFormat)) return [hint];
        const style = hint.format.GetStyleHandle().Clone();
        for (const item of resetSet.entries()) style.ClearItem(item.Which());
        if (style.Count() === hint.format.GetStyleHandle().Count()) return [hint];
        if (style.Count() === 0) return [];
        const replacement = new SwTextAttr(new SwFormatAutoFormat(style), hint.start, hint.end);
        replacement.dontExpand = hint.dontExpand;
        replacement.dontExpandStart = hint.dontExpandStart;
        replacement.dontMoveAttr = hint.dontMoveAttr;
        return [replacement];
      },
    );
    node.SetTextHints(new SwpHints(node.GetDoc().GetAttrPool(), retained));
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
