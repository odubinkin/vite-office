/** @fileoverview Original source-unimplemented CNotationsMap defaults (#i113683#), not a substitute for an unported native map. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { XNamedNodeMap } from "../../../offapi/com/sun/star/xml/dom/XNamedNodeMap";
import type { XNode } from "../../../offapi/com/sun/star/xml/dom/XNode";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
/** Original complete map surface preserves the empty source bodies. */
export class CNotationsMap
  extends WeakImplHelper.specialize(XNamedNodeMap)
  implements XNamedNodeMap
{
  /** Original source default. @returns Zero. */ getLength(): number {
    return 0;
  }
  /** Original source default. @param name - Ignored name. @returns Empty node. */ getNamedItem(
    name: OUStringConstReference,
  ): Reference<XNode> {
    void name;
    return new Reference<XNode>();
  }
  /** Original source default. @param uri - Ignored URI. @param name - Ignored name. @returns Empty node. */ getNamedItemNS(
    uri: OUStringConstReference,
    name: OUStringConstReference,
  ): Reference<XNode> {
    void uri;
    void name;
    return new Reference<XNode>();
  }
  /** Original source default. @param index - Ignored index. @returns Empty node. */ item(
    index: number,
  ): Reference<XNode> {
    void index;
    return new Reference<XNode>();
  }
  /** Original source default. @param name - Ignored name. @returns Empty node. */ removeNamedItem(
    name: OUStringConstReference,
  ): Reference<XNode> {
    void name;
    return new Reference<XNode>();
  }
  /** Original source default. @param uri - Ignored URI. @param name - Ignored name. @returns Empty node. */ removeNamedItemNS(
    uri: OUStringConstReference,
    name: OUStringConstReference,
  ): Reference<XNode> {
    void uri;
    void name;
    return new Reference<XNode>();
  }
  /** Original source default. @param node - Ignored node. @returns Empty node. */ setNamedItem(
    node: Reference<XNode>,
  ): Reference<XNode> {
    void node;
    return new Reference<XNode>();
  }
  /** Original source default. @param node - Ignored node. @returns Empty node. */ setNamedItemNS(
    node: Reference<XNode>,
  ): Reference<XNode> {
    void node;
    return new Reference<XNode>();
  }
}
