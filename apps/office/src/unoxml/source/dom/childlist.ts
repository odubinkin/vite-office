/** @fileoverview Original CChildList owns its base node and traverses actual native sibling pointers on every call. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { XNodeList } from "../../../offapi/com/sun/star/xml/dom/XNodeList";
import type { XNode } from "../../../offapi/com/sun/star/xml/dom/XNode";
import { getLibXml2 } from "../../../external/libxml2/libxml2";
import type { CNode } from "./node";
/** Original child list owner. */
export class CChildList extends WeakImplHelper.specialize(XNodeList) implements XNodeList {
  private readonly m_pNode: Reference<CNode>;
  /** Original strong containing-node reference. @param node - Actual base node. @returns Actual native owner. */
  constructor(node: CNode) {
    super();
    this.m_pNode = new Reference(node);
  }
  /** Original member destruction. @returns Nothing. */
  protected override destroy(): void {
    this.m_pNode.dispose();
    super.destroy();
  }
  /** Original live sibling count. @returns Signed32 count. */
  getLength(): number {
    const m = getLibXml2(),
      raw = this.m_pNode.get()?.GetNodePtr() ?? 0;
    let count = 0;
    for (
      let cur = raw ? m._office_node_children_get(raw) : 0;
      cur;
      cur = m._office_node_next_get(cur)
    )
      ++count;
    return count | 0;
  }
  /** Original item traversal returns empty for negative and out-of-range indexes. @param index - Signed32 index. @returns Acquired node or empty. */
  item(index: number): Reference<XNode> {
    const m = getLibXml2(),
      node = this.m_pNode.get(),
      raw = node?.GetNodePtr() ?? 0;
    index |= 0;
    for (
      let cur = raw ? m._office_node_children_get(raw) : 0;
      cur;
      cur = m._office_node_next_get(cur)
    )
      if (index-- === 0) return (node as CNode).GetOwnerDocument().GetCNode(cur);
    return new Reference<XNode>();
  }
}
