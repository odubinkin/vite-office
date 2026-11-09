/** @fileoverview Original RTF section and paragraph line-number output callbacks. */
import type { SwLineNumberInfo } from "../../../inc/lineinfo";
import type { SfxBoolItem } from "../../../../svl/source/items/cenumitm";

/** Emits the represented original section line-number properties. @param info - Document-owned line-number settings. @returns RTF controls. */
export function SectionLineNumbering(info: SwLineNumberInfo): string {
  const restart = info.IsRestartEachPage() ? "" : "\\linecont";
  return `\\linemod${info.GetCountBy()}\\linex${info.GetPosFromLeft()}${restart}`;
}

/** Emits the original paragraph line-count exclusion. @param item - Native paragraph or style count item. @returns RTF control when excluded. */
export function FormatLineNumbering(item: SfxBoolItem | undefined): string {
  return item?.GetValue() === false ? "\\noline" : "";
}
