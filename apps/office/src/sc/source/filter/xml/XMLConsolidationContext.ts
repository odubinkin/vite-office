/** @fileoverview Native ODS document consolidation settings. */
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import type { FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import { ScAddress } from "../../../inc/address";
import { ScConsolidateParam } from "../../core/data/global2";
import { ScArea, ScRangeStringConverter } from "../../core/tool/rangeutl";
import { GetSubTotalFuncFromString } from "./XMLConverter";
import { ScXMLImportContext } from "./importcontext";
import type { ScXMLImport } from "./xmlimprt";

/** Reads the original document-level consolidation parameters. */
export class ScXMLConsolidationContext extends ScXMLImportContext {
  /** Retains attributes until the source areas can be assigned together. @param owner - Calc ODF import owner. @param attributes - Original attributes. */
  constructor(
    owner: ScXMLImport,
    private readonly attributes: FastAttributeList,
  ) {
    super(owner);
  }

  /** Applies the saved dialog data when the original target address is valid. */
  override endFastElement(): void {
    const document = this.GetScImport().GetDocument();
    const convention = FormulaGrammar.AddressConvention.CONV_OOO;
    const target = new ScAddress();
    const attrs = this.attributes;
    if (
      !ScRangeStringConverter.GetAddressFromString(
        target,
        attrs.get(XMLToken.TABLE_TARGET_CELL_ADDRESS) ?? "",
        document,
        convention,
        [0],
      )
    )
      return;
    const param = new ScConsolidateParam();
    param.nCol = target.Col();
    param.nRow = target.Row();
    param.nTab = target.Tab();
    param.eFunction = GetSubTotalFuncFromString(attrs.get(XMLToken.TABLE_FUNCTION) ?? "");
    const source = attrs.get(XMLToken.TABLE_SOURCE_CELL_RANGE_ADDRESSES) ?? "";
    const areaCount = Math.min(ScRangeStringConverter.GetTokenCount(source), 0xffff);
    const offset: [number] = [0];
    const areas: ScArea[] = [];
    for (let index = 0; index < areaCount; index++) {
      const area = new ScArea();
      ScRangeStringConverter.GetAreaFromString(area, source, document, convention, offset);
      areas.push(area);
    }
    param.SetAreas(areas);
    const label = attrs.get(XMLToken.TABLE_USE_LABEL);
    param.bByCol = label === "column" || label === "both";
    param.bByRow = label === "row" || label === "both";
    param.bReferenceData = attrs.get(XMLToken.TABLE_LINK_TO_SOURCE_DATA) === "true";
    document.SetConsolidateDlgData(param);
  }
}
