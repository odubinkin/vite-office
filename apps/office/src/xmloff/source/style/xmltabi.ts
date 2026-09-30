/** @fileoverview Owns the bounded tab-stop import context and source-order selection from pinned xmloff/source/style/xmltabi.cxx. */

import { FastAttributeList, SvXMLIgnoreContext, SvXMLImportContext } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import { importOdfLength } from "../core/xmluconv";
import type { OdfTabStop } from "../text/txtparae";

/** Imports ordered paragraph tab stops. */
export class SvxXMLTabStopImportContext extends SvXMLImportContext {
  private readonly stops: OdfTabStop[] = [];

  /** Creates a tab-stop container. @param setTabStops - Imported sequence sink. @returns Nothing. */
  public constructor(private readonly setTabStops: (stops: readonly OdfTabStop[]) => void) {
    super();
  }

  /** Imports one style:tab-stop. @param element - Child token. @param attributes - Tab attributes. @returns Ignored leaf context. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element !== XMLToken.STYLE_TAB_STOP) return null;
    attributes.assertOnly(
      [
        XMLToken.STYLE_POSITION,
        XMLToken.STYLE_TYPE,
        XMLToken.STYLE_CHAR,
        XMLToken.STYLE_LEADER_STYLE,
        XMLToken.STYLE_LEADER_TEXT,
      ],
      "tab stop",
    );
    const alignment = attributes.get(XMLToken.STYLE_TYPE) ?? "left";
    if (!["left", "right", "center", "char", "default"].includes(alignment))
      throw new Error("Unsupported ODF tab-stop type.");
    const leaderStyle = attributes.get(XMLToken.STYLE_LEADER_STYLE);
    const leaderText = attributes.get(XMLToken.STYLE_LEADER_TEXT);
    const fill =
      leaderStyle === null || leaderStyle === "none"
        ? " "
        : (leaderText?.[0] ?? (leaderStyle === "dotted" ? "." : "_"));
    this.stops.push({
      position: importOdfLength(
        attributes.require(XMLToken.STYLE_POSITION, "tab stop position"),
        true,
        "tab stop position",
      ),
      alignment: alignment as OdfTabStop["alignment"],
      decimal: attributes.get(XMLToken.STYLE_CHAR)?.[0] ?? ",",
      fill,
    });
    return new SvXMLIgnoreContext();
  }

  /** Publishes the source-order sequence selected by the pinned tab importer, including an explicit empty sequence. @returns Nothing. */
  public override endFastElement(): void {
    const selected: OdfTabStop[] = [];
    for (const [index, stop] of this.stops.entries()) {
      const isDefault = stop.alignment === "default";
      if (!isDefault || index === 0) selected.push(stop);
      if (isDefault && index === 0) break;
    }
    this.setTabStops(selected);
  }
}
