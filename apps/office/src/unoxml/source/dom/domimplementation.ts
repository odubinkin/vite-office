/** @fileoverview Original process-lifetime CDOMImplementation singleton; its unimplemented methods deliberately retain the upstream empty results. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { XDOMImplementation } from "../../../offapi/com/sun/star/xml/dom/XDOMImplementation";
import type { XDocument } from "../../../offapi/com/sun/star/xml/dom/XDocument";
import type { XDocumentType } from "../../../offapi/com/sun/star/xml/dom/XDocumentType";

/** Original singleton, including native no-op reference counting. Document creation belongs to CDocumentBuilder, not this service. */
export class CDOMImplementation
  extends WeakImplHelper.specialize(XDOMImplementation)
  implements XDOMImplementation
{
  private static instance: CDOMImplementation | undefined;
  /** Original function-static instance. @returns Borrowed immortal implementation. */
  static get(): CDOMImplementation {
    return (CDOMImplementation.instance ??= new CDOMImplementation());
  }
  /** Original static instance must not be acquired. @returns Nothing. */
  override acquire(): void {}
  /** Original static instance must not be deleted. @returns Nothing. */
  override release(): void {}
  /** Original #i113683# unimplemented operation. @param namespaceURI - Ignored namespace. @param qualifiedName - Ignored name. @param doctype - Ignored doctype. @returns Empty document reference. */
  createDocument(
    namespaceURI: OUStringConstReference,
    qualifiedName: OUStringConstReference,
    doctype: Reference<XDocumentType>,
  ): Reference<XDocument> {
    void namespaceURI;
    void qualifiedName;
    void doctype;
    return new Reference<XDocument>();
  }
  /** Original #i113683# unimplemented operation. @param qualifiedName - Ignored name. @param publicId - Ignored public ID. @param systemId - Ignored system ID. @returns Empty doctype reference. */
  createDocumentType(
    qualifiedName: OUStringConstReference,
    publicId: OUStringConstReference,
    systemId: OUStringConstReference,
  ): Reference<XDocumentType> {
    void qualifiedName;
    void publicId;
    void systemId;
    return new Reference<XDocumentType>();
  }
  /** Original #i113683# unimplemented feature query. @param feature - Ignored feature. @param ver - Ignored version. @returns Always false. */
  hasFeature(feature: OUStringConstReference, ver: OUStringConstReference): boolean {
    void feature;
    void ver;
    return false;
  }
}
