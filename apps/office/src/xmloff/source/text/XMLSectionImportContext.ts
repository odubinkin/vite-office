/** @fileoverview ODF regular text section import and native section property mapping. */
import { decodeBase64 } from "../../../comphelper/source/misc/base64";
import { Converter } from "../../../sax/source/tools/converter";
import { SvXMLImportContext, type FastAttributeList } from "../core/xmlimp";
import { ODF_NAMESPACES, XMLToken } from "../core/xmltoken";
import type { XMLTextImportHelper } from "./txtimp";
import {
  XMLSectionSourceImportContext,
  type XMLSectionSource,
} from "./XMLSectionSourceImportContext";

/** Original section descriptor properties set before attaching it to the document. */
export interface XMLSectionImportProperties {
  readonly name: string;
  readonly styleName: string;
  readonly condition: string;
  readonly visible: boolean;
  readonly currentlyVisible: boolean;
  readonly protected: boolean;
  readonly protectionKey: Uint8Array;
}

/** Connected section operations used by the shared text importer. */
export interface XMLSectionImport {
  setSource(source: XMLSectionSource): void;
  end(hasContent: boolean): void;
}

/** Imports an ODF section using the shared scoped text cursor. */
export class XMLSectionImportContext extends SvXMLImportContext {
  private section: XMLSectionImport | undefined;
  private hasContent = false;

  /** Attaches a section descriptor in the current text context. @param helper - Shared text dispatcher. @param createSection - Writer descriptor and cursor attachment. @returns Context. */
  public constructor(
    private readonly helper: XMLTextImportHelper,
    private readonly createSection: (properties: XMLSectionImportProperties) => XMLSectionImport,
  ) {
    super();
  }

  /** Parses native name, visibility and protection properties before attaching the section. @param _element - Current token. @param attributes - Section attributes. @returns Nothing. */
  public override startFastElement(_element: XMLToken, attributes: FastAttributeList): void {
    const name = attributes.get(XMLToken.TEXT_NAME);
    if (name === null) return;

    const condition = attributes.get(XMLToken.TEXT_CONDITION) ?? "";
    const separator = condition.indexOf(":");
    const validCondition =
      separator > 0 &&
      attributes.getNamespaceUri(condition.slice(0, separator)) === ODF_NAMESPACES.ooow;
    const display = attributes.get(XMLToken.TEXT_DISPLAY);
    const hidden: [boolean] = [false];
    const isHidden = attributes.get(XMLToken.TEXT_IS_HIDDEN);
    if (isHidden !== null) Converter.convertBool(hidden, isHidden);

    const protect: [boolean] = [false];
    for (const [token, value] of attributes) {
      if (token === XMLToken.TEXT_PROTECTED || token === XMLToken.TEXT_PROTECT)
        Converter.convertBool(protect, value);
    }
    this.section = this.createSection({
      name,
      styleName: attributes.get(XMLToken.TEXT_STYLE_NAME) ?? "",
      condition: validCondition ? condition.slice(separator + 1) : "",
      visible: display !== "none" && display !== "condition",
      currentlyVisible: !hidden[0],
      protected: protect[0],
      protectionKey: decodeBase64(attributes.get(XMLToken.TEXT_PROTECTION_KEY) ?? ""),
    });
  }

  /** Delegates text to the shared Section dispatcher and file links to their original child context. @param element - Child token. @param attributes - Child attributes. @returns Child context, if represented. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element === XMLToken.TEXT_SECTION_SOURCE)
      return this.section ? new XMLSectionSourceImportContext(this.section.setSource) : null;
    const context = this.helper.CreateTextChildContext(element, attributes, "Section");
    if (context) this.hasContent = true;
    return context;
  }

  /** Completes the section's text insertion and restores the parent cursor. @returns Nothing. */
  public override endFastElement(): void {
    this.section?.end(this.hasContent);
  }
}
