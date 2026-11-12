/** @fileoverview Original CXPathObject result classification and all scalar/list casts use the actual native XPath result. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { XXPathObject } from "../../../offapi/com/sun/star/xml/xpath/XXPathObject";
import { XPathObjectType as T } from "../../../offapi/com/sun/star/xml/xpath/XPathObjectType";
import type { XNodeList } from "../../../offapi/com/sun/star/xml/dom/XNodeList";
import { CDocument } from "../dom/document";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { getLibXml2 } from "../../../external/libxml2/libxml2";
import * as C from "@vite-office/libxml2-wasm/constants";
import { CNodeList } from "./nodelist";
import { XPathObjectReference } from "./xpathobject.native";
import { xmlString } from "../dom/node";
/** Original source switch includes only this pinned libxml2 build's enabled object kinds. @param object - Actual native result. @returns UNO object type. */
function lcl_GetType(object: number): T {
  switch (getLibXml2()._office_xpath_object_type_get(object)) {
    case C.XPATH_UNDEFINED:
      return T.XPATH_UNDEFINED;
    case C.XPATH_NODESET:
      return T.XPATH_NODESET;
    case C.XPATH_BOOLEAN:
      return T.XPATH_BOOLEAN;
    case C.XPATH_NUMBER:
      return T.XPATH_NUMBER;
    case C.XPATH_STRING:
      return T.XPATH_STRING;
    case C.XPATH_USERS:
      return T.XPATH_USERS;
    case C.XPATH_XSLT_TREE:
      return T.XPATH_XSLT_TREE;
    default:
      return T.XPATH_UNDEFINED;
  }
}
/** Original complete result component with shared native ownership. */
export class CXPathObject extends WeakImplHelper.specialize(XXPathObject) implements XXPathObject {
  private readonly m_pDocument: Reference<CDocument>;
  private readonly m_pXPathObj: XPathObjectReference;
  private readonly m_XPathObjectType: T;
  /** Original document/result copies, then type classification. @param document - Borrowed document. @param object - Borrowed shared native result. @returns Component. */ constructor(
    document: Reference<CDocument>,
    object: XPathObjectReference,
  ) {
    super();
    this.m_pDocument = new Reference(document);
    this.m_pXPathObj = new XPathObjectReference(object);
    this.m_XPathObjectType = lcl_GetType(object.get());
  }
  /** Original reverse member destruction. @returns Nothing. */ protected override destroy(): void {
    this.m_pXPathObj.dispose();
    this.m_pDocument.dispose();
    super.destroy();
  }
  /** Original cached type. @returns Kind. */ getObjectType(): T {
    return this.m_XPathObjectType;
  }
  /** Original independent list owner sharing native node-set storage. @returns Acquired list. */ getNodeList(): Reference<XNodeList> {
    return new Reference(new CNodeList(this.m_pDocument, this.m_pXPathObj));
  }
  /** Original native boolean cast. @returns Boolean. */ getBoolean(): boolean {
    return getLibXml2()._xmlXPathCastToBoolean(this.m_pXPathObj.get()) !== 0;
  }
  /** Original numeric cast to signed8; out-of-range C++ float-to-integer behavior remains unqualified. @returns Signed8. */ getByte(): number {
    return (Math.trunc(getLibXml2()._xmlXPathCastToNumber(this.m_pXPathObj.get())) << 24) >> 24;
  }
  /** Original numeric cast to signed16; out-of-range C++ float-to-integer behavior remains unqualified. @returns Signed16. */ getShort(): number {
    return (Math.trunc(getLibXml2()._xmlXPathCastToNumber(this.m_pXPathObj.get())) << 16) >> 16;
  }
  /** Original numeric cast to signed32; out-of-range C++ float-to-integer behavior remains unqualified. @returns Signed32. */ getLong(): number {
    return Math.trunc(getLibXml2()._xmlXPathCastToNumber(this.m_pXPathObj.get())) | 0;
  }
  /** Original numeric cast to signed64; out-of-range and nonfinite C++ behavior remains unqualified. @returns Signed64. */ getHyper(): bigint {
    return BigInt.asIntN(
      64,
      BigInt(Math.trunc(getLibXml2()._xmlXPathCastToNumber(this.m_pXPathObj.get()))),
    );
  }
  /** Original float narrowing. @returns Float32. */ getFloat(): number {
    return Math.fround(getLibXml2()._xmlXPathCastToNumber(this.m_pXPathObj.get()));
  }
  /** Original native double. @returns Float64. */ getDouble(): number {
    return getLibXml2()._xmlXPathCastToNumber(this.m_pXPathObj.get());
  }
  /** Original allocated UTF8 string and xmlFree deleter. @returns Owned RTL string. */ getString(): OUString {
    const m = getLibXml2(),
      string = m._xmlXPathCastToString(this.m_pXPathObj.get());
    try {
      return xmlString(string);
    } finally {
      m._office_xmlFree(string);
    }
  }
}
