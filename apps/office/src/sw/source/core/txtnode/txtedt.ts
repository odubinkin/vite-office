/** @fileoverview Ports the ordinary StyleApply exact whole-paragraph RstTextAttr branch from pinned sw/source/core/txtnode/txtedt.cxx. */
import type { SwTextNode } from "./ndtxt";
import { SwpHints } from "./ndhints";
import { RES_TXTATR_AUTOFMT } from "../../../inc/hintids";

/** Ports full-node RstTextAttr for the registered ranged hint types; default non-exact reset includes internet hints. @param node - Reset text node. @param exactRange - Whether only exact whole AUTOFMT is removed. @returns Nothing. */
export function resetParagraphTextAttributes(node: SwTextNode, exactRange = false): void {
  const hints = node.GetpSwpHints();
  if (hints === undefined) return;
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
