/** @fileoverview Imports element-valued ODF text properties at the upstream XMLTextPropertySetContext boundary. */

import { FastAttributeList, SvXMLImportContext } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import { SvxXMLTabStopImportContext, type XMLTabStop } from "../style/xmltabi";
import {
  XMLComplexColorContext,
  getOdfThemeColor,
  type OdfThemeColor,
} from "./XMLComplexColorContext";

/** Imports element-valued text properties such as paragraph tab stops. */
export class XMLTextPropertySetContext extends SvXMLImportContext {
  /** Creates a property context. @param setTabStops - Optional tab-stop sink. @param setThemeColor - Optional character color sink. @returns Context. */
  public constructor(
    private readonly setTabStops?: (stops: readonly XMLTabStop[]) => void,
    private readonly setThemeColor?: (color: OdfThemeColor) => void,
  ) {
    super();
  }

  /** Creates the bounded tab-stop child context. @param element - Child token. @param attributes - Child attributes. @returns Context or null. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element === XMLToken.LOEXT_CHAR_COMPLEX_COLOR && this.setThemeColor)
      return new XMLComplexColorContext(
        attributes,
        /** Passes the valid native theme property to the current style. @param color - Parsed color. @returns Nothing. */
        (color) => {
          const value = getOdfThemeColor(color);
          if (value) this.setThemeColor?.(value);
        },
      );
    if (element !== XMLToken.STYLE_TAB_STOPS || this.setTabStops === undefined) return null;
    attributes.assertOnly([], "tab stops");
    return new SvxXMLTabStopImportContext(this.setTabStops);
  }
}
