/** @fileoverview Original CDocumentFragment admission rules and name. */
import { ImplInheritanceHelper } from "../../../cppuhelper/inc/implbase";
import { XDocumentFragment } from "../../../offapi/com/sun/star/xml/dom/XDocumentFragment";
import { NodeType as N } from "../../../offapi/com/sun/star/xml/dom/NodeType";
import { CNode, domLiteral } from "./node";
import type { CDocument } from "./document";
/** Original native fragment. */
export class CDocumentFragment
  extends ImplInheritanceHelper.specialize(CNode, XDocumentFragment)
  implements XDocumentFragment
{
  /** Original native constructor. @param document - Actual document. @param node - Native node. @returns Actual native owner. */
  constructor(document: CDocument, node: number) {
    super(document, N.DOCUMENT_FRAGMENT_NODE, node);
  }
  /** Original child type set. @param type - Proposed child. @param replaced - Ignored replaced type. @returns Admission. */
  protected override IsChildTypeAllowed(type: N, replaced: N | null): boolean {
    void replaced;
    return [
      N.ELEMENT_NODE,
      N.PROCESSING_INSTRUCTION_NODE,
      N.COMMENT_NODE,
      N.TEXT_NODE,
      N.CDATA_SECTION_NODE,
      N.ENTITY_REFERENCE_NODE,
    ].includes(type);
  }
  /** Original fragment name. @returns Owned source literal. */ override getNodeName() {
    return domLiteral("#document-fragment");
  }
}
