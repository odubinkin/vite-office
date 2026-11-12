/** @fileoverview Original CCDATASection derives from the actual CText owner, retaining source splitText behavior. */
import type { XDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XDocumentHandler";
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { XExtendedDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XExtendedDocumentHandler";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { ImplInheritanceHelper } from "../../../cppuhelper/inc/implbase";
import { XCDATASection } from "../../../offapi/com/sun/star/xml/dom/XCDATASection";
import { NodeType } from "../../../offapi/com/sun/star/xml/dom/NodeType";
import { CText } from "./text";
import { domLiteral } from "./node";
import type { CDocument } from "./document";
/** Original CDATA component. */
export class CCDATASection
  extends ImplInheritanceHelper.specialize(CText, XCDATASection)
  implements XCDATASection
{
  /** Original SAX callback selection, including the source extended-handler gate. @param handler - Actual handler. @returns Nothing. */
  override saxify(handler: Reference<XDocumentHandler>): void {
    if (!handler.is()) throw new RuntimeException();
    const extended = new Reference<XExtendedDocumentHandler>(
      handler,
      UNO_QUERY,
      XExtendedDocumentHandler.static_type,
    );
    try {
      if (extended.is()) {
        extended.operatorStar().startCDATA();
        const data = this.getData();
        try {
          handler.operatorStar().characters(data);
        } finally {
          data.dispose();
        }
        extended.operatorStar().endCDATA();
      }
    } finally {
      extended.dispose();
    }
  }
  /** Original native constructor. @param document - Actual document. @param node - Native node. @returns Actual native owner. */
  constructor(document: CDocument, node: number) {
    super(document, NodeType.CDATA_SECTION_NODE, node);
  }
  /** Original CDATA name. @returns Owned source literal. */ override getNodeName() {
    return domLiteral("#cdata-section");
  }
}
