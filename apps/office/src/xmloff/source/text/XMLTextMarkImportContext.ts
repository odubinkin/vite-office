/** @fileoverview Imports ODF bookmarks and point reference marks through the native text helper. */
import { Converter } from "../../../sax/source/tools/converter";
import { SvXMLImportContext, type FastAttributeList } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import type { XMLTextImportHelper } from "./txtimp";

/** Collects the bookmark declaration and publishes it when the marker closes. */
export class XMLTextMarkImportContext extends SvXMLImportContext {
  private name = "";
  private readonly hidden: [boolean] = [false];
  private condition = "";

  /** Binds the helper to the current text stream. @param helper - Native text importer. @returns Context. */
  constructor(private readonly helper: XMLTextImportHelper) {
    super();
  }

  /** Reads the supported bookmark attributes. @param element - Marker token. @param attributes - ODF attributes. @returns Nothing. */
  override startFastElement(element: XMLToken, attributes: FastAttributeList): void {
    this.name = attributes.get(XMLToken.TEXT_NAME) ?? "";
    if (element === XMLToken.TEXT_REFERENCE_MARK) return;
    attributes.assertOnly(
      [XMLToken.TEXT_NAME, XMLToken.LOEXT_HIDDEN, XMLToken.LOEXT_CONDITION],
      "bookmark",
    );
    if (element !== XMLToken.TEXT_BOOKMARK_START) return;
    const hidden = attributes.get(XMLToken.LOEXT_HIDDEN);
    if (hidden !== null) Converter.convertBool(this.hidden, hidden);
    this.condition = attributes.get(XMLToken.LOEXT_CONDITION) ?? "";
  }

  /** Handles the marker's original point, opening, or closing behavior. @param element - Marker token. @returns Nothing. */
  override endFastElement(element: XMLToken): void {
    if (!this.name.length) return;
    if (element === XMLToken.TEXT_REFERENCE_MARK) this.helper.InsertReferenceMark(this.name);
    else if (element === XMLToken.TEXT_BOOKMARK_START)
      this.helper.StartBookmark(this.name, this.hidden[0], this.condition);
    else if (element === XMLToken.TEXT_BOOKMARK_END) this.helper.EndBookmark(this.name);
    else this.helper.InsertBookmark(this.name);
  }
}
