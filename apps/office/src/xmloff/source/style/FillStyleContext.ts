/** @fileoverview Native named bitmap fill context and inline graphic fallback. */
import { XMLBase64ImportContext } from "../core/XMLBase64ImportContext";
import { SvXMLImportContext, type FastAttributeList } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import { importImageStyle, type XMLImageStyleDefinition } from "./ImageStyle";

/** Collects the original named-fill attributes and first inline stream. */
export class XMLBitmapStyleContext extends SvXMLImportContext {
  private readonly definition: XMLImageStyleDefinition | undefined;
  private hasStream = false;
  private inline: Uint8Array | undefined;

  /** Captures the original XML declaration. @param attributes - Image attributes. @param publish - Named bitmap receiver. @returns Context. */
  constructor(
    attributes: FastAttributeList,
    private readonly publish: (style: XMLImageStyleDefinition) => void,
  ) {
    super();
    this.definition = importImageStyle(attributes);
  }

  /** Admits the first binary stream even when the named fill has an href. @param element - Child token. @returns Binary context or absence. */
  override createFastChildContext(element: XMLToken): SvXMLImportContext | null {
    if (element !== XMLToken.OFFICE_BINARY_DATA || this.hasStream) return null;
    this.hasStream = true;
    return new XMLBase64ImportContext(
      /** Retains the decoded graphic fallback. @param bytes - Decoded data. @returns Nothing. */
      (bytes) => {
        this.inline = bytes;
      },
    );
  }

  /** Publishes the complete declaration for the document bitmap table. @returns Nothing. */
  override endFastElement(): void {
    if (this.definition)
      this.publish(
        this.inline === undefined ? this.definition : { ...this.definition, inline: this.inline },
      );
  }
}
