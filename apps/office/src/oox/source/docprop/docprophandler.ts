/** @fileoverview OOXML extended application property used to classify the source document. */
import type { SaxesTagNS } from "saxes";
import { FragmentHandler } from "../core/fragmenthandler";

const namespaces = new Set([
  "http://schemas.openxmlformats.org/officeDocument/2006/extended-properties",
  "http://purl.oclc.org/ooxml/officeDocument/extendedProperties",
]);

/** Captures the generator used by the native XmlFilterBase product classification. */
export class OOXMLDocPropHandler extends FragmentHandler {
  private properties = false;
  private application = false;
  generator = "";

  /** Admits Application only as a child of extended Properties. @param tag - Input name. @returns Matching handler. */
  override createFastChildContext(tag: SaxesTagNS): OOXMLDocPropHandler | null {
    return namespaces.has(tag.uri) &&
      tag.local === (this.properties ? "Application" : "Properties") &&
      !this.application
      ? this
      : null;
  }

  /** Tracks the represented property. @param tag - Input element. @returns Nothing. */
  override startFastElement(tag: SaxesTagNS): void {
    if (tag.local === "Properties") this.properties = true;
    else {
      this.generator = "";
      this.application = true;
    }
  }

  /** Collects generator fragments in order. @param value - Source text. @returns Nothing. */
  override characters(value: string): void {
    if (this.application) this.generator += value;
  }

  /** Closes the current property or container. @param tag - Input element. @returns Nothing. */
  override endFastElement(tag: SaxesTagNS): void {
    if (tag.local === "Properties") this.properties = false;
    else this.application = false;
  }
}
