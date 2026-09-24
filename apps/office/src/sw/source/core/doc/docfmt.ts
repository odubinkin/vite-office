/** @fileoverview Ports the supported SwDoc::MoveLeftMargin calculation from pinned `sw/source/core/doc/docfmt.cxx`. */

import { SvxTabStopItem } from "../../../../editeng/source/items/paraitem";
import { RES_PARATR_TABSTOP } from "../../../inc/hintids";
import type { SwDoc } from "./doc";
import type { SwTextNode } from "../txtnode/ndtxt";

/** Upstream's 2 cm fallback when the document default tab item has no stops. */
export const SW_DEFAULT_INDENT_DISTANCE = 1134;

/** Reads the first document-default tab stop, as SwDoc::MoveLeftMargin does. @param document - Owning document. @returns Distance in twips. */
export function getMoveLeftMarginDistance(document: SwDoc): number {
  const tabs = document
    .GetAttrPool()
    .GetUserOrPoolDefaultItem(RES_PARATR_TABSTOP) as SvxTabStopItem;
  return tabs.Count() > 0 ? tabs.At(0).GetTabPos() : SW_DEFAULT_INDENT_DISTANCE;
}

/** Computes one text node's next direct left margin. @param paragraph - Selected node. @param distance - Document default tab distance. @param right - Increase direction. @param modulus - Snap to tab multiple. @returns Next margin. */
export function getMovedLeftMargin(
  paragraph: SwTextNode,
  distance: number,
  right: boolean,
  modulus: boolean,
): number {
  let next = paragraph.GetParagraphTextLeftMargin();
  if (modulus) next = Math.trunc(next / distance) * distance;
  if (right) next += distance;
  else if (next > 0) next -= distance;
  return next;
}
