/** @fileoverview Original CCharacterData UTF16 edit rules and native content/event operations. */
import { ImplInheritanceHelper } from "../../../cppuhelper/inc/implbase";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { XCharacterData } from "../../../offapi/com/sun/star/xml/dom/XCharacterData";
import type { XNode } from "../../../offapi/com/sun/star/xml/dom/XNode";
import { DOMExceptionType as E } from "../../../offapi/com/sun/star/xml/dom/DOMExceptionType";
import { getLibXml2 } from "../../../external/libxml2/libxml2";
import { CNode, domError, withXmlStrings, xmlString } from "./node";

/** Original character-data implementation adds only its actual complete interface. */
export class CCharacterData
  extends ImplInheritanceHelper.specialize(CNode, XCharacterData)
  implements XCharacterData
{
  /** Original nullable content getter. @returns Owned character data. */
  getData(): OUString {
    const pointer = this.m_aNodePtr ? getLibXml2()._office_node_content_get(this.m_aNodePtr) : 0;
    return pointer ? xmlString(pointer) : new OUString();
  }
  /** Original xmlNodeGetContent temporary, released with xmlFree. @returns Owned RTL data. */
  private content(): OUString {
    const m = getLibXml2(),
      pointer = m._xmlNodeGetContent(this.m_aNodePtr);
    try {
      return xmlString(pointer);
    } finally {
      m._office_xmlFree(pointer);
    }
  }
  /** Original UTF16 length. @returns Character count. */
  getLength(): number {
    if (!this.m_aNodePtr) return 0;
    const value = this.getData();
    try {
      return value.getLength();
    } finally {
      value.dispose();
    }
  }
  /** Original mutation emission checks document listener maps after the content change. @param previous - Prior native value. @param next - New native value. @returns Nothing. */
  private dispatchEvent_Impl(previous: OUStringConstReference, next: OUStringConstReference): void {
    if (!this.GetOwnerDocument().GetEventDispatcher().hasListeners()) return;
    const empty = new Reference<XNode>();
    try {
      this.emitMutation("DOMCharacterDataModified", empty, previous, next);
    } finally {
      empty.dispose();
    }
  }
  /** Original old/change/new sequence. @param action - Native mutation. @returns Nothing. */
  private mutate(action: () => void): void {
    if (!this.m_aNodePtr) return;
    const previous = this.getData();
    try {
      action();
      const next = this.getData();
      try {
        this.dispatchEvent_Impl(previous, next);
      } finally {
        next.dispose();
      }
    } finally {
      previous.dispose();
    }
  }
  /** Original xmlNodeAddContent call. @param arg - Borrowed Unicode data. @returns Nothing. */
  appendData(arg: OUStringConstReference): void {
    this.mutate(
      /** Appends bytes through the actual native API. @returns Nothing. */ () => {
        withXmlStrings(
          [arg],
          /** Native argument scope. @param value - UTF8 bytes. @returns Nothing. */ (value) =>
            getLibXml2()._xmlNodeAddContent(this.m_aNodePtr, value),
        );
      },
    );
  }
  /** Original xmlNodeSetContent call. @param data - Borrowed Unicode data. @returns Nothing. */
  setData(data: OUStringConstReference): void {
    this.mutate(
      /** Assigns bytes through the actual native API. @returns Nothing. */ () => {
        withXmlStrings(
          [data],
          /** Native argument scope. @param value - UTF8 bytes. @returns Nothing. */ (value) =>
            getLibXml2()._xmlNodeSetContent(this.m_aNodePtr, value),
        );
      },
    );
  }
  /** Original counted UTF16 splice and range checks. @param offset - Signed32 offset. @param count - Signed32 removed count. @param arg - Borrowed insertion. @returns Nothing. */
  private edit(offset: number, count: number, arg: OUStringConstReference): void {
    if (!this.m_aNodePtr) return;
    offset |= 0;
    count |= 0;
    const current = this.content(),
      buffer = new OUStringBuffer();
    try {
      if (offset < 0 || offset > current.getLength() || count < 0) domError(E.INDEX_SIZE_ERR);
      if (offset + count > current.getLength()) count = current.getLength() - offset;
      buffer.append(current.subView(0, offset));
      buffer.append(arg);
      buffer.append(current.subView(offset + count));
      const result = buffer.makeStringAndClear();
      try {
        this.setData(result);
      } finally {
        result.dispose();
      }
    } finally {
      buffer.dispose();
      current.dispose();
    }
  }
  /** Original insert checks offset and inserts counted Unicode units. @param offset - Signed32 offset. @param arg - Borrowed insertion. @returns Nothing. */
  insertData(offset: number, arg: OUStringConstReference): void {
    this.edit(offset, 0, arg);
  }
  /** Original deletion clamps count after offset validation. @param offset - Signed32 offset. @param count - Signed32 count. @returns Nothing. */
  deleteData(offset: number, count: number): void {
    const empty = new OUString();
    try {
      this.edit(offset, count, empty);
    } finally {
      empty.dispose();
    }
  }
  /** Original replacement clamps count after offset validation. @param offset - Signed32 offset. @param count - Signed32 count. @param arg - Borrowed insertion. @returns Nothing. */
  replaceData(offset: number, count: number, arg: OUStringConstReference): void {
    this.edit(offset, count, arg);
  }
  /** Original substring deliberately forwards the un-clamped count to OUString.copy. @param offset - Signed32 offset. @param count - Signed32 count. @returns Owned substring. */
  subStringData(offset: number, count: number): OUString {
    if (!this.m_aNodePtr) return new OUString();
    offset |= 0;
    count |= 0;
    const current = this.content();
    try {
      if (offset < 0 || offset > current.getLength() || count < 0) domError(E.INDEX_SIZE_ERR);
      return current.copy(offset, count);
    } finally {
      current.dispose();
    }
  }
  /** Original inline XNode delegation. @returns Owned data. */
  override getNodeValue(): OUString {
    return this.getData();
  }
  /** Original inline XNode delegation. @param value - Borrowed data. @returns Nothing. */
  override setNodeValue(value: OUStringConstReference): void {
    this.setData(value);
  }
}
