/** @fileoverview Original CNotation node contract over the actual native allocation. */
import { ImplInheritanceHelper } from "../../../cppuhelper/inc/implbase";
import { XNotation } from "../../../offapi/com/sun/star/xml/dom/XNotation";
import { NodeType as N } from "../../../offapi/com/sun/star/xml/dom/NodeType";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { getLibXml2 } from "../../../external/libxml2/libxml2";
import { CNode, xmlString } from "./node";
import type { CDocument } from "./document";
/** Original concrete node. */
export class CNotation
  extends ImplInheritanceHelper.specialize(CNode, XNotation)
  implements XNotation
{
  /** Original native constructor. @param document - Actual document. @param node - Native pointer. @returns Actual native owner. */ constructor(
    document: CDocument,
    node: number,
  ) {
    super(document, N.NOTATION_NODE, node);
  }
  /** Original native node-name read. @returns Owned name. */ override getNodeName(): OUString {
    return this.m_aNodePtr
      ? xmlString(getLibXml2()._office_node_name_get(this.m_aNodePtr))
      : new OUString();
  }
  /** Original #i113683# source default. @returns Empty identifier. */ getPublicId(): OUString {
    return new OUString();
  }
  /** Original #i113683# source default. @returns Empty identifier. */ getSystemId(): OUString {
    return new OUString();
  }
}
