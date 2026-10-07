/** @fileoverview Resolves the represented Number branch of SwTextPaintInfo::DrawViewOpt for a browser paint device. */
import type { SwViewOption } from "../../../inc/viewopt";
import type { SwTextNode } from "../txtnode/ndtxt";

/** Resolves native Number background admission and DrawBackground color selection; device rectangle painting remains external. @param node - Original paragraph-property owner. @param options - Actual view options. @param onWin - Whether painting to a window device. @param isMulti - Native multi-portion context. @param color - Optional explicit paint color. @returns Background color when admitted. */
export function resolveSwNumberPortionBackground(
  node: SwTextNode,
  options: SwViewOption,
  onWin = true,
  isMulti = false,
  color?: string,
): string | undefined {
  if (!onWin || isMulti) return undefined;
  if (options.IsPagePreview() || options.IsReadonly()) return undefined;
  if (!options.IsFieldShadings() || !node.HasMarkedLabel()) return undefined;
  return color ?? options.GetFieldShadingsColor();
}
