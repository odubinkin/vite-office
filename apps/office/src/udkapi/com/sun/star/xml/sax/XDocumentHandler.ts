/** @fileoverview Original XDocumentHandler SAX IDL method surface; UNO ABI/service identity remains unrepresented. */
import type { OUStringConstReference } from "../../../../../../sal/inc/rtl/ustring";
import type { XAttributeList } from "./XAttributeList";
import type { XLocator } from "./XLocator";
/** Original document event callbacks. */
export interface XDocumentHandler {
  /** Begins document. @returns Nothing. */ startDocument(): void;
  /** Ends document. @returns Nothing. */ endDocument(): void;
  /** Begins element. @param name - Qualified name. @param attributes - Actual list. @returns Nothing. */ startElement(
    name: OUStringConstReference,
    attributes: XAttributeList | null,
  ): void;
  /** Ends element. @param name - Qualified name. @returns Nothing. */ endElement(
    name: OUStringConstReference,
  ): void;
  /** Receives text. @param text - Text. @returns Nothing. */ characters(
    text: OUStringConstReference,
  ): void;
  /** Receives ignorable spacing. @param text - Spacing. @returns Nothing. */ ignorableWhitespace(
    text: OUStringConstReference,
  ): void;
  /** Receives PI. @param target - Target. @param data - Data. @returns Nothing. */ processingInstruction(
    target: OUStringConstReference,
    data: OUStringConstReference,
  ): void;
  /** Receives origin locator. @param locator - Locator. @returns Nothing. */ setDocumentLocator(
    locator: XLocator | null,
  ): void;
}
/** Borrowed callbacks actually consumed by plain manifest export; no fake implementation of unconsumed document-handler methods. */
export type ManifestDocumentHandler = Pick<
  XDocumentHandler,
  "startDocument" | "endDocument" | "startElement" | "endElement" | "ignorableWhitespace"
>;
