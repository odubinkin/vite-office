/** @fileoverview Original native FragmentHandler explicit-relations constructor, shared context and XML interface; normal constructor/filter stream overload await native filter orchestration, not fabricated async proxies. */
import { ContextHandler } from "./contexthandler";
import { FragmentBaseData } from "./fragmenthandler.data";
import type { RelationsRef } from "./relations.native";
import type { XmlFilterBase } from "./xmlfilterbase";
import { SharedReference } from "./shared-reference";
import { ImplInheritanceHelper } from "../../../cppuhelper/inc/implbase";
import { XFastDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XFastDocumentHandler";
import { XFastContextHandler } from "../../../offapi/com/sun/star/xml/sax/XFastContextHandler";
import type { XLocator } from "../../../offapi/com/sun/star/xml/sax/XLocator";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
/** Original record descriptor, independent of the unfinished binary parser. */
export interface RecordInfo {
  readonly mnStartRecId: number;
  readonly mnEndRecId: number;
}
/** Original native XML fragment interface over the actual context base. */
export class FragmentHandler
  extends ImplInheritanceHelper.specialize(ContextHandler, XFastDocumentHandler)
  implements XFastDocumentHandler
{
  /** Original protected explicit-relations constructor overload binding; the public implicit importRelations overload is still missing. @param filter - Actual filter. @param path - Native fragment path. @param relations - Actual shared native collection. @returns Fragment. */
  constructor(filter: XmlFilterBase, path: OUStringConstReference, relations: RelationsRef) {
    const data = new SharedReference(new FragmentBaseData(filter, path, relations));
    try {
      super(data);
    } finally {
      data.dispose();
    }
  }
  /** Original static ContextHandler cast and acquired interface return. @returns Native context reference. */
  getFastContextHandler(): Reference<XFastContextHandler> {
    return new Reference(this);
  }
  /** Original inert document start. @returns Nothing. */ startDocument(): void {}
  /** Original inert document end. @returns Nothing. */ endDocument(): void {}
  /** Original inert processing instruction. @param target - Ignored target. @param data - Ignored data. @returns Nothing. */ processingInstruction(
    target: OUStringConstReference,
    data: OUStringConstReference,
  ): void {
    void target;
    void data;
  }
  /** Original locator forwarding into shared data. @param locator - Actual native reference. @returns Nothing. */ setDocumentLocator(
    locator: Reference<XLocator>,
  ): void {
    this.implSetLocator(locator);
  }
  /** Original default has no binary records. @returns Null record descriptor pointer. */ getRecordInfos():
    readonly RecordInfo[] | null {
    return null;
  }
}
