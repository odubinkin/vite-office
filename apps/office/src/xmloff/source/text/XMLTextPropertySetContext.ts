/** @fileoverview Imports element-valued ODF text properties at the upstream XMLTextPropertySetContext boundary. */

import { FastAttributeList, SvXMLImportContext } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import { SvxXMLTabStopImportContext } from "../style/xmltabi";
import type { OdfTabStop } from "./txtparae";

/** Imports element-valued text properties such as paragraph tab stops. */
export class XMLTextPropertySetContext extends SvXMLImportContext {
  /** Creates a property context. @param setTabStops - Optional tab-stop sink. @returns Nothing. */
  public constructor(private readonly setTabStops?: (stops: readonly OdfTabStop[]) => void) {
    super();
  }

  /** Creates the bounded tab-stop child context. @param element - Child token. @param attributes - Child attributes. @returns Context or null. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element !== XMLToken.STYLE_TAB_STOPS || this.setTabStops === undefined) return null;
    attributes.assertOnly([], "tab stops");
    return new SvxXMLTabStopImportContext(this.setTabStops);
  }
}
