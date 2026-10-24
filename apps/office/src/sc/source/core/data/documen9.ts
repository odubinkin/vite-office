/** @fileoverview Original documen9.cxx Clear releases actual sheets and selection attributes;drawing services are unported. */
import type { ScDocument } from "../../../inc/document";
/** Clears actual sheet content and its observable native formula/attribute ownership before releasing sheets. @param this - Document. @returns Nothing. */
export function Clear(this: ScDocument): void {
  for (const table of this["maTabs"]) table?.["mpCondFormatList"]?.Dispose();
  for (const table of this["maTabs"]) table?.Dispose();
  this["maTabs"].length = 0;
  this["pSelectionAttr"]?.Dispose();
  this["pSelectionAttr"] = undefined;
}
