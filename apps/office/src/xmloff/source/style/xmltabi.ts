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

/** Owns one native tab value. The ignore-context base preserves native null-subtree skipping under the current bounded dispatcher. */
class SvxXMLTabStopContext_Impl extends SvXMLIgnoreContext {
  private readonly tabStop: XMLTabStop;

  /** Imports one tab's attributes at leaf construction. @param attributes - Tab attributes. @param unitConverter - Import-owned MM100 converter. @returns Nothing. */
  public constructor(
    attributes: FastAttributeList,
    private readonly unitConverter: SvXMLUnitConverter,
  ) {
    super();
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
    this.tabStop = {
      position: position === null ? 0 : (this.unitConverter.convertMeasureToCore(position) ?? 0),
      alignment,
      decimal: attributes.get(XMLToken.STYLE_CHAR)?.[0] ?? ",",
      fill,
    };
  }

  /** Exposes the leaf-owned native tab property. @returns Read-only tab value in MM100. */
  public getTabStop(): XMLTabStop {
    return this.tabStop;
  }
}

/** Imports ordered paragraph tab stops. */
export class SvxXMLTabStopImportContext extends SvXMLImportContext {
  private readonly unitConverter = new SvXMLUnitConverter("mm100");
  private readonly maTabStops: SvxXMLTabStopContext_Impl[] = [];

  /** Creates a tab-stop container. @param setTabStops - Imported sequence sink. @returns Nothing. */
  public constructor(private readonly setTabStops: (stops: readonly XMLTabStop[]) => void) {
    super();
  }

  /** Imports one style:tab-stop. @param element - Child token. @param attributes - Tab attributes. @returns Leaf-owned import context. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element !== XMLToken.STYLE_TAB_STOP) return null;
    const tabStopContext = new SvxXMLTabStopContext_Impl(attributes, this.unitConverter);
    this.maTabStops.push(tabStopContext);
    return tabStopContext;
  }

  /** Publishes the source-order sequence selected by the pinned tab importer, including an explicit empty sequence. @returns Nothing. */
  public override endFastElement(): void {
    const selected: XMLTabStop[] = [];
    for (const [index, context] of this.maTabStops.entries()) {
      const stop = context.getTabStop();
      const isDefault = stop.alignment === "default";
      if (!isDefault || index === 0) selected.push(stop);
      if (isDefault && index === 0) break;
    }
    this.setTabStops(selected);
  }
}
