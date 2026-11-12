/** @fileoverview Original CComment component over native character data. */
import type { XDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XDocumentHandler";
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { XExtendedDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XExtendedDocumentHandler";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { ImplInheritanceHelper } from "../../../cppuhelper/inc/implbase";
import { XComment } from "../../../offapi/com/sun/star/xml/dom/XComment";
import { NodeType } from "../../../offapi/com/sun/star/xml/dom/NodeType";
import { CCharacterData } from "./characterdata";
import { domLiteral } from "./node";
import type { CDocument } from "./document";
/** Original comment component. */
export class CComment
  extends ImplInheritanceHelper.specialize(CCharacterData, XComment)
  implements XComment
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
        const data = this.getData();
        try {
          extended.operatorStar().comment(data);
        } finally {
          data.dispose();
        }
      }
    } finally {
      extended.dispose();
    }
  }
  /** Original native constructor. @param document - Actual document. @param node - Native node. @returns Actual native owner. */
  constructor(document: CDocument, node: number) {
    super(document, NodeType.COMMENT_NODE, node);
  }
  /** Original comment name. @returns Owned source literal. */ override getNodeName() {
    return domLiteral("#comment");
  }
}
