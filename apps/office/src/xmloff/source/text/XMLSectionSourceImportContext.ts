/** @fileoverview ODF file source for a native text section. */
import { SvXMLImportContext, type FastAttributeList } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";

/** Original FileLink and LinkRegion properties of a section. */
export interface XMLSectionSource {
  readonly url: string;
  readonly filter: string;
  readonly region: string;
}

/** Imports the descriptor from text:section-source. */
export class XMLSectionSourceImportContext extends SvXMLImportContext {
  /** Retains the connected section's source property setter. @param setSource - Setter on the containing text section. @returns Context. */
  public constructor(private readonly setSource: (source: XMLSectionSource) => void) {
    super();
  }

  /** Maps source attributes to the Writer section descriptor. @param _element - Current token. @param attributes - Source attributes. @returns Nothing. */
  public override startFastElement(_element: XMLToken, attributes: FastAttributeList): void {
    const url = attributes.get(XMLToken.XLINK_HREF) ?? "";
    const filter = attributes.get(XMLToken.TEXT_FILTER_NAME) ?? "";
    const region = attributes.get(XMLToken.TEXT_SECTION_NAME) ?? "";
    if (url || filter || region) this.setSource({ url, filter, region });
  }
}
