/** @fileoverview Original CEntityReference node contract over the actual native allocation. */
import { ImplInheritanceHelper } from "../../../cppuhelper/inc/implbase";
import { XEntityReference } from "../../../offapi/com/sun/star/xml/dom/XEntityReference";
import { NodeType as N } from "../../../offapi/com/sun/star/xml/dom/NodeType";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { getLibXml2 } from "../../../external/libxml2/libxml2";
import { CNode, xmlString } from "./node";
import type { CDocument } from "./document";
/** Original concrete node. */
export class CEntityReference
  extends ImplInheritanceHelper.specialize(CNode, XEntityReference)
  implements XEntityReference
{
  /** Original native constructor. @param document - Actual document. @param node - Native pointer. @returns Actual native owner. */ constructor(
    document: CDocument,
    node: number,
  ) {
    super(document, N.ENTITY_REFERENCE_NODE, node);
  }
  /** Original native node-name read. @returns Owned name. */ override getNodeName(): OUString {
    return this.m_aNodePtr
      ? xmlString(getLibXml2()._office_node_name_get(this.m_aNodePtr))
      : new OUString();
  }
  /** Original allowed child types. @param type - Proposed child. @param replaced - Ignored replaced type. @returns Admission. */ protected override IsChildTypeAllowed(
    type: N,
    replaced: N | null,
  ): boolean {
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
}
