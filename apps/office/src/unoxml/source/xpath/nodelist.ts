/** @fileoverview Original XPath CNodeList retains its document and shares node-set results after the XPath object is released. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { XNodeList } from "../../../offapi/com/sun/star/xml/dom/XNodeList";
import type { XNode } from "../../../offapi/com/sun/star/xml/dom/XNode";
import { CDocument } from "../dom/document";
import { getLibXml2 } from "../../../external/libxml2/libxml2";
import { XPATH_NODESET } from "@vite-office/libxml2-wasm/constants";
import { XPathObjectReference } from "./xpathobject.native";
/** Original concrete list; non-node-set objects deliberately produce an empty list. */
export class CNodeList extends WeakImplHelper.specialize(XNodeList) implements XNodeList {
  private readonly m_pDocument: Reference<CDocument>;
  private readonly m_pXPathObj: XPathObjectReference | null;
  private readonly m_pNodeSet: number;
  /** Original document acquisition and conditional result sharing. @param document - Borrowed actual document. @param object - Borrowed shared result. @returns List. */
  constructor(document: Reference<CDocument>, object: XPathObjectReference | null) {
    super();
    this.m_pDocument = new Reference(document);
    const m = getLibXml2();
    if (object !== null && m._office_xpath_object_type_get(object.get()) === XPATH_NODESET) {
      this.m_pNodeSet = m._office_xpath_object_nodeset_get(object.get());
      this.m_pXPathObj = new XPathObjectReference(object);
    } else {
      this.m_pNodeSet = 0;
      this.m_pXPathObj = null;
    }
  }
  /** Original reverse member destruction. @returns Nothing. */ protected override destroy(): void {
    this.m_pXPathObj?.dispose();
    this.m_pDocument.dispose();
    super.destroy();
  }
  /** Original native macro result or zero. @returns Count. */ getLength(): number {
    return this.m_pNodeSet ? getLibXml2()._office_xmlXPathNodeSetGetLength(this.m_pNodeSet) : 0;
  }
  /** Original native index handling and document identity cache. @param index - Signed32 source index. @returns Acquired node or empty. */ item(
    index: number,
  ): Reference<XNode> {
    if (!this.m_pNodeSet) return new Reference<XNode>();
    return this.m_pDocument
      .operatorStar()
      .GetCNode(getLibXml2()._office_xmlXPathNodeSetItem(this.m_pNodeSet, index));
  }
}
