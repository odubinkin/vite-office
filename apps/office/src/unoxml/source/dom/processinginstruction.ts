/** @fileoverview Original CProcessingInstruction direct data assignment emits no character-data mutation event. */
import { ImplInheritanceHelper } from "../../../cppuhelper/inc/implbase";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { XProcessingInstruction } from "../../../offapi/com/sun/star/xml/dom/XProcessingInstruction";
import { NodeType } from "../../../offapi/com/sun/star/xml/dom/NodeType";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { getLibXml2 } from "../../../external/libxml2/libxml2";
import { CNode, withXmlStrings, xmlString } from "./node";
import type { CDocument } from "./document";
/** Original processing instruction. */
export class CProcessingInstruction
  extends ImplInheritanceHelper.specialize(CNode, XProcessingInstruction)
  implements XProcessingInstruction
{
  /** Original native constructor. @param document - Actual document. @param node - Native node. @returns Actual native owner. */
  constructor(document: CDocument, node: number) {
    super(document, NodeType.PROCESSING_INSTRUCTION_NODE, node);
  }
  /** Original nullable data. @returns Owned data. */
  getData(): OUString {
    const ptr = this.m_aNodePtr ? getLibXml2()._office_node_content_get(this.m_aNodePtr) : 0;
    return ptr ? xmlString(ptr) : new OUString();
  }
  /** Original nullable target. @returns Owned target. */
  getTarget(): OUString {
    return this.m_aNodePtr
      ? xmlString(getLibXml2()._office_node_name_get(this.m_aNodePtr))
      : new OUString();
  }
  /** Original raw xmlFree/xmlStrdup assignment. @param data - Borrowed data. @returns Nothing. */
  setData(data: OUStringConstReference): void {
    if (!this.m_aNodePtr) throw new RuntimeException();
    withXmlStrings(
      [data],
      /** Replaces native PI content without events. @param value - UTF8 bytes. @returns Nothing. */ (
        value,
      ) => {
        const m = getLibXml2();
        m._office_xmlFree(m._office_node_content_get(this.m_aNodePtr));
        m._office_node_content_set(this.m_aNodePtr, m._xmlStrdup(value));
      },
    );
  }
  /** Original name forwarding. @returns Target. */ override getNodeName(): OUString {
    return this.getTarget();
  }
  /** Original value forwarding. @returns Data. */ override getNodeValue(): OUString {
    return this.getData();
  }
  /** Original write forwarding. @param data - Borrowed data. @returns Nothing. */ override setNodeValue(
    data: OUStringConstReference,
  ): void {
    this.setData(data);
  }
}
