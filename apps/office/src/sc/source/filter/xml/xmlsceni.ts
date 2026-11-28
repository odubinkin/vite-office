/** @fileoverview Original Calc scenario sheet import through native scenario flags and marks. */
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { Converter } from "../../../../sax/source/tools/converter";
import { COL_BLACK, Color } from "../../../../tools/inc/color";
import type { FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import { ScScenarioFlags } from "../../../inc/global";
import { ScRangeList } from "../../../inc/rangelst";
import { ScMF } from "../../core/data/attrib";
import { ScRangeStringConverter } from "../../core/tool/rangeutl";
import { ScXMLImportContext } from "./importcontext";
import type { ScXMLImport } from "./xmlimprt";

/** Imports one native sheet scenario. */
export class ScXMLTableScenarioContext extends ScXMLImportContext {
  private readonly flags: ScScenarioFlags;
  private readonly color: Color;
  private readonly active: boolean;
  private readonly comment: string;
  private readonly ranges = new ScRangeList();

  /** Reads original scenario defaults and ranges in the active sheet. @param owner - ODF import owner. @param tab - Current table number. @param attributes - Original scenario attributes. @returns The initialized ScXMLTableScenarioContext instance. */
  constructor(
    owner: ScXMLImport,
    private readonly tab: number,
    attributes: FastAttributeList,
  ) {
    super(owner);
    const rgb: [number] = [COL_BLACK.toUInt32()];
    const inputColor = attributes.get(XMLToken.TABLE_BORDER_COLOR);
    if (inputColor !== null) Converter.convertColor(rgb, inputColor);
    this.color = new Color(rgb[0]);
    this.active = attributes.get(XMLToken.TABLE_IS_ACTIVE) === "true";
    this.comment = attributes.get(XMLToken.TABLE_COMMENT) ?? "";
    this.flags =
      ((attributes.get(XMLToken.TABLE_DISPLAY_BORDER) ?? "true") === "true"
        ? ScScenarioFlags.ShowFrame
        : 0) |
      ((attributes.get(XMLToken.TABLE_COPY_BACK) ?? "true") === "true"
        ? ScScenarioFlags.TwoWay
        : 0) |
      ((attributes.get(XMLToken.TABLE_COPY_STYLES) ?? "true") === "true"
        ? ScScenarioFlags.Attrib
        : 0) |
      ((attributes.get(XMLToken.TABLE_COPY_FORMULAS) ?? "true") !== "true"
        ? ScScenarioFlags.Value
        : 0) |
      (attributes.get(XMLToken.TABLE_PROTECTED) === "true" ? ScScenarioFlags.Protected : 0);
    ScRangeStringConverter.GetRangeListFromString(
      this.ranges,
      attributes.get(XMLToken.TABLE_SCENARIO_RANGES) ?? "",
      owner.GetDocument(),
      FormulaGrammar.AddressConvention.CONV_OOO,
    );
  }

  /** Assigns native scenario ranges to the current sheet's pattern flags. @returns Nothing. */
  override endFastElement(): void {
    const document = this.GetScImport().GetDocument();
    document.SetScenario(this.tab, true);
    document.SetScenarioData(this.tab, this.comment, this.color, this.flags);
    for (const { aStart, aEnd } of this.ranges)
      document.ApplyFlagsTab(
        aStart.Col(),
        aStart.Row(),
        aEnd.Col(),
        aEnd.Row(),
        this.tab,
        ScMF.Scenario,
      );
    document.SetActiveScenario(this.tab, this.active);
  }
}
