/** @fileoverview Original CText, including the source-unimplemented splitText operation returning itself. */
import type { XDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XDocumentHandler";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { ImplInheritanceHelper } from "../../../cppuhelper/inc/implbase";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { XText } from "../../../offapi/com/sun/star/xml/dom/XText";
import { NodeType } from "../../../offapi/com/sun/star/xml/dom/NodeType";
import { CCharacterData } from "./characterdata";
import { domLiteral } from "./node";
import type { CDocument } from "./document";
/** Original native text owner. */
export class CText
  extends ImplInheritanceHelper.specialize(CCharacterData, XText)
  implements XText
{
  /** Original SAX callback selection, including the source extended-handler gate. @param handler - Actual handler. @returns Nothing. */
  override saxify(handler: Reference<XDocumentHandler>): void {
    if (!handler.is()) throw new RuntimeException();
    const value = this.getData();
    try {
      handler.operatorStar().characters(value);
    } finally {
      value.dispose();
    }
  }
  /** Original native text constructor. @param document - Actual owner. @param node - Native text. @returns Text owner. */
  constructor(document: CDocument, node: number);
  /** Original derived-text constructor. @param document - Actual owner. @param type - Explicit native UNO type. @param node - Native node. @returns Text owner. */
  constructor(document: CDocument, type: NodeType, node: number);
  /** Original overload dispatch after mutex transport erasure. @param document - Actual owner. @param typeOrNode - Type or node. @param node - Optional native node. @returns Text owner. */
  constructor(document: CDocument, typeOrNode: number, node?: number) {
    super(
      document,
      node === undefined ? NodeType.TEXT_NODE : (typeOrNode as NodeType),
      node ?? typeOrNode,
    );
  }
  /** Original text name. @returns Owned source literal. */ override getNodeName() {
    return domLiteral("#text");
  }
  /** Original #i113683# ignores offset and acquires this object. @param offset - Ignored offset. @returns Same text owner. */
  splitText(offset: number): Reference<XText> {
    void offset;
    return new Reference<XText>(this);
  }
}
