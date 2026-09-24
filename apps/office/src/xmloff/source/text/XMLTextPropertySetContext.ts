/** @fileoverview Imports element-valued ODF text properties at the upstream XMLTextPropertySetContext boundary. */

import { FastAttributeList, SvXMLIgnoreContext, SvXMLImportContext } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
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
    return new XMLTabStopsContext(this.setTabStops);
  }
}

/** Imports ordered paragraph tab stops. */
class XMLTabStopsContext extends SvXMLImportContext {
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
        false,
        "tab stop position",
      ),
      alignment: alignment as OdfTabStop["alignment"],
      decimal: attributes.get(XMLToken.STYLE_CHAR)?.[0] ?? ",",
      fill,
    });
    return new SvXMLIgnoreContext();
  }

  /** Publishes the complete tab sequence, including an explicit empty sequence. @returns Nothing. */
  public override endFastElement(): void {
    this.setTabStops(this.stops);
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
