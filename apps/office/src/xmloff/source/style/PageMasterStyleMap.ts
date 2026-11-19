/** @fileoverview Consumed native header/footer geometry in the ODF page master style map. */
import { SvXMLIgnoreContext, SvXMLImportContext, type FastAttributeList } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import { SvXMLUnitConverter } from "../core/xmluconv";

/** Original page-style height, body distance and two independent dynamic flags. */
export interface OdfPageStoryGeometry {
  readonly height?: number;
  readonly bodyDistance?: number;
  readonly isDynamicHeight?: boolean;
  readonly dynamicSpacing?: boolean;
}

/** Receives geometry in the header or footer's original page-layout properties child. */
export class XMLPageHeaderFooterStyleContext extends SvXMLImportContext {
  /** Selects the body-facing margin for this story. @param header - Whether header. @param collect - Parsed properties receiver. @returns Context. */
  constructor(
    private readonly header: boolean,
    private readonly collect: (geometry: OdfPageStoryGeometry) => void,
  ) {
    super();
  }

  /** Reads the original measure and boolean properties from their namespaces. @param token - Child token. @param attributes - Original XML attributes. @returns Completed leaf context. */
  override createFastChildContext(
    token: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (token !== XMLToken.STYLE_HEADER_FOOTER_PROPERTIES) return new SvXMLIgnoreContext();
    const converter = new SvXMLUnitConverter("twip");
    const min = attributes.get(XMLToken.FO_MIN_HEIGHT);
    const fixed = attributes.get(XMLToken.SVG_HEIGHT);
    const distance =
      attributes.get(this.header ? XMLToken.FO_MARGIN_BOTTOM : XMLToken.FO_MARGIN_TOP) ??
      attributes.get(XMLToken.FO_MARGIN);
    const dynamic = attributes.get(XMLToken.STYLE_DYNAMIC_SPACING);
    const height = min === null ? null : converter.convertMeasureToCore(min);
    const fixedHeight = fixed === null ? null : converter.convertMeasureToCore(fixed);
    const bodyDistance = distance === null ? null : converter.convertMeasureToCore(distance);
    this.collect({
      ...(height !== null
        ? { height, isDynamicHeight: true }
        : fixedHeight !== null
          ? { height: fixedHeight, isDynamicHeight: false }
          : {}),
      ...(bodyDistance === null ? {} : { bodyDistance }),
      ...(dynamic === "true" || dynamic === "false" ? { dynamicSpacing: dynamic === "true" } : {}),
    });
    return new SvXMLIgnoreContext();
  }
}
