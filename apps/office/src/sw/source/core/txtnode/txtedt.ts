/** @fileoverview Ports the ordinary StyleApply exact whole-paragraph RstTextAttr branch from pinned sw/source/core/txtnode/txtedt.cxx. */
import type { SwTextNode } from "./ndtxt";
import { SwpHints } from "./ndhints";
import { RES_TXTATR_AUTOFMT } from "../../../inc/hintids";

/** Removes only AUTOFMT hints with exactly the full paragraph range, retaining other ranged hint types and partial formatting. @param node - Reset text node. @returns Nothing. */
export function resetFullParagraphAutoFormat(node: SwTextNode): void {
  const hints = node.GetpSwpHints();
  if (hints === undefined) return;
  const retained = hints.entries().filter(
    /** Applies native bExactRange's WhichId and endpoint checks. @param hint - Direct ranged attribute. @returns Whether retained. */
    (hint) =>
      hint.format.Which() !== RES_TXTATR_AUTOFMT || hint.start !== 0 || hint.end !== node.Len(),
  );
  if (retained.length !== hints.Count())
    node.SetTextHints(new SwpHints(node.GetDoc().GetAttrPool(), retained));
}
