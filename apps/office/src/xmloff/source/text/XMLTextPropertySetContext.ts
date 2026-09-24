/** @fileoverview Imports element-valued ODF text properties at the upstream XMLTextPropertySetContext boundary. */

import { FastAttributeList, SvXMLIgnoreContext, SvXMLImportContext } from "../core/xml-parser";
import { XMLToken } from "../core/xmltoken";

/** Imports element-valued text properties such as paragraph tab stops. */
export class XMLTextPropertySetContext extends SvXMLImportContext {
  /** Creates a property context. @param setTabStop - Optional tab-stop sink. @returns Nothing. */
  public constructor(private readonly setTabStop?: (position: number) => void) {
    super();
  }

  /** Creates the bounded tab-stop child context. @param element - Child token. @param attributes - Child attributes. @returns Context or null. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element !== XMLToken.STYLE_TAB_STOPS || this.setTabStop === undefined) return null;
    attributes.assertOnly([], "tab stops");
    return new XMLTabStopsContext(this.setTabStop);
  }
}

/** Imports ordered paragraph tab stops. */
class XMLTabStopsContext extends SvXMLImportContext {
  /** Creates a tab-stop container. @param setTabStop - Imported position sink. @returns Nothing. */
  public constructor(private readonly setTabStop: (position: number) => void) {
    super();
  }

  /** Imports one style:tab-stop. @param element - Child token. @param attributes - Tab attributes. @returns Ignored leaf context. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element !== XMLToken.STYLE_TAB_STOP) return null;
    attributes.assertOnly([XMLToken.STYLE_POSITION], "tab stop");
    this.setTabStop(
      importOdfLength(
        attributes.require(XMLToken.STYLE_POSITION, "tab stop position"),
        false,
        "tab stop position",
      ),
    );
    return new SvXMLIgnoreContext();
  }
}

/** Converts one bounded ODF absolute length to Writer twips. @param value - ODF length. @param signed - Whether negative values are allowed. @param label - Error label. @returns Twips. */
export function importOdfLength(value: string, signed: boolean, label: string): number {
  const match = new RegExp(`^(${signed ? "-?" : ""}(?:0|[0-9]+(?:\\.[0-9]+)?))(cm|in|mm|pt)$`).exec(
    value,
  );
  if (match === null) throw new Error(`Unsupported ODF ${label}: ${value}`);
  const amount = Number(match[1]);
  const unit = match[2];
  const twips =
    unit === "cm"
      ? (amount * 1440) / 2.54
      : unit === "in"
        ? amount * 1440
        : unit === "mm"
          ? (amount * 1440) / 25.4
          : amount * 20;
  return Math.round(twips);
}
