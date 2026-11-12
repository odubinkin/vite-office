/** @fileoverview Original CComment component over native character data. */
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
  /** Original native constructor. @param document - Actual document. @param node - Native node. @returns Actual native owner. */
  constructor(document: CDocument, node: number) {
    super(document, NodeType.COMMENT_NODE, node);
  }
  /** Original comment name. @returns Owned source literal. */ override getNodeName() {
    return domLiteral("#comment");
  }
}
