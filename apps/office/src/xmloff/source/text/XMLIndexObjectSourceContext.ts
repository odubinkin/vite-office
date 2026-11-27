/** @fileoverview Native ODF object-index source flags and single entry template. */
import type { FastAttributeList } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import {
  XMLIndexSourceBaseContext,
  readIndexSourceFlag,
  type XMLIndexSourceProperties,
} from "./XMLIndexSourceBaseContext";

/** Source options selecting the represented original object classes. */
export interface XMLIndexObjectSource extends XMLIndexSourceProperties {
  readonly family: "object-index";
  readonly useOtherObjects: boolean;
  readonly useSpreadsheetObjects: boolean;
  readonly useChartObjects: boolean;
  readonly useDrawObjects: boolean;
  readonly useMathObjects: boolean;
}

/** Imports native object-index source switches and style selection. */
export class XMLIndexObjectSourceContext extends XMLIndexSourceBaseContext {
  /** Binds the original object descriptor. @param attributes - ODF source options. @param publish - Connected descriptor sink. @returns Context. */
  public constructor(
    private readonly attributes: FastAttributeList,
    private readonly publish: (source: XMLIndexObjectSource) => void,
  ) {
    super(attributes, "object-index", 1);
  }

  /** Sends the original object inclusion switches to Writer. @returns Nothing. */
  public override endFastElement(): void {
    const a = this.attributes;
    this.publish({
      ...this.GetSource(),
      family: "object-index",
      useOtherObjects: readIndexSourceFlag(a, XMLToken.TEXT_USE_OTHER_OBJECTS),
      useSpreadsheetObjects: readIndexSourceFlag(a, XMLToken.TEXT_USE_SPREADSHEET_OBJECTS),
      useChartObjects: readIndexSourceFlag(a, XMLToken.TEXT_USE_CHART_OBJECTS),
      useDrawObjects: readIndexSourceFlag(a, XMLToken.TEXT_USE_DRAW_OBJECTS),
      useMathObjects: readIndexSourceFlag(a, XMLToken.TEXT_USE_MATH_OBJECTS),
    });
  }
}
