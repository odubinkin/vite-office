/** @fileoverview Original CCDATASection derives from the actual CText owner, retaining source splitText behavior. */
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
  /** Original native constructor. @param document - Actual document. @param node - Native node. @returns Actual native owner. */
  constructor(document: CDocument, node: number) {
    super(document, NodeType.CDATA_SECTION_NODE, node);
  }
  /** Original CDATA name. @returns Owned source literal. */ override getNodeName() {
    return domLiteral("#cdata-section");
  }
}
