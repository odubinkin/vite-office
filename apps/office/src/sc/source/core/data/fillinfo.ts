/** @fileoverview Native conditional-format data applied to the cell's represented paint fields. */
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { Color } from "../../../../tools/inc/color";
import type { ScAddress } from "../../../inc/address";
import type { ScDataBarInfo, ScIconSetInfo } from "../../../inc/colorscale";
import type { ScDocument } from "../../../inc/document";
import { FindConditionalStyle, GetConditionalFormats } from "./documen4";

/** Conditional painting fields of ScCellInfo. */
interface ScCellInfo {
  pConditionSet: SfxItemSet | undefined;
  mxColorScale: Color | undefined;
  pDataBar: ScDataBarInfo | undefined;
  pIconSet: ScIconSetInfo | undefined;
}

/** Selects the first available result in each represented field. @param document - Workbook. @param position - Painted cell. @returns Conditional paint fields when a format applies. */
export function handleConditionalFormat(
  document: ScDocument,
  position: ScAddress,
): ScCellInfo | undefined {
  let info: ScCellInfo | undefined;
  for (const format of GetConditionalFormats(document, position)) {
    info ??= {
      pConditionSet: undefined,
      mxColorScale: undefined,
      pDataBar: undefined,
      pIconSet: undefined,
    };
    const data = format.GetData(document.GetRefCellValue(position), position);
    info.pConditionSet ??= FindConditionalStyle(document.GetStyleSheetPool(), data.aStyleName);
    info.mxColorScale ??= data.mxColorScale;
    info.pDataBar ??= data.pDataBar;
    info.pIconSet ??= data.pIconSet;
    if (info.pConditionSet && info.mxColorScale && info.pDataBar && info.pIconSet) break;
  }
  return info;
}
