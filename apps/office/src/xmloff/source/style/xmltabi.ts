/** @fileoverview Owns the bounded tab-stop import context and source-order selection from pinned xmloff/source/style/xmltabi.cxx. */

import { FastAttributeList, SvXMLIgnoreContext, SvXMLImportContext } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import { SvXMLUnitConverter } from "../core/xmluconv";
import type { OdfTabStop } from "../text/txtparae";

/** Imported native tab property; position is an integer in hundredths of a millimetre. */
export interface XMLTabStop extends OdfTabStop {
  /** Position in the native tab property's MM100 unit. */
  readonly position: number;
}

/** Imports ordered paragraph tab stops. */
export class SvxXMLTabStopImportContext extends SvXMLImportContext {
  private readonly unitConverter = new SvXMLUnitConverter("mm100");
  private readonly stops: XMLTabStop[] = [];

  /** Creates a tab-stop container. @param setTabStops - Imported sequence sink. @returns Nothing. */
  public constructor(private readonly setTabStops: (stops: readonly XMLTabStop[]) => void) {
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
    const type = attributes.get(XMLToken.STYLE_TYPE);
    const alignment =
      type !== null && ["left", "right", "center", "char", "default"].includes(type)
        ? (type as OdfTabStop["alignment"])
        : "left";
    const position = attributes.get(XMLToken.STYLE_POSITION);
    const leaderStyle = attributes.get(XMLToken.STYLE_LEADER_STYLE);
    const leaderText = attributes.get(XMLToken.STYLE_LEADER_TEXT);
    const fill =
      leaderStyle === null || leaderStyle === "none"
        ? " "
        : (leaderText?.[0] ?? (leaderStyle === "dotted" ? "." : "_"));
    this.stops.push({
      position: position === null ? 0 : (this.unitConverter.convertMeasureToCore(position) ?? 0),
      alignment,
      decimal: attributes.get(XMLToken.STYLE_CHAR)?.[0] ?? ",",
      fill,
    });
    return new SvXMLIgnoreContext();
  }

  /** Publishes the source-order sequence selected by the pinned tab importer, including an explicit empty sequence. @returns Nothing. */
  public override endFastElement(): void {
    const selected: XMLTabStop[] = [];
    for (const [index, stop] of this.stops.entries()) {
      const isDefault = stop.alignment === "default";
      if (!isDefault || index === 0) selected.push(stop);
      if (isDefault && index === 0) break;
    }
    this.setTabStops(selected);
  }
}
