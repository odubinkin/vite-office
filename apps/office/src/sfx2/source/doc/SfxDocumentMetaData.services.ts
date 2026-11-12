/** @fileoverview Complete original SfxDocumentMetaData.cxx createDOM/getURLProperties/createUserDefined responsibilities over actual registered source components. Member inputs are lowered explicitly until the full SfxDocumentMetaData owner is implemented; no replacement document-properties service, context or state owner is supplied. */
import {
  Reference,
  UNO_QUERY,
  UNO_QUERY_THROW,
} from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Type } from "../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType } from "../../../cppu/inc/unotype";
import { Sequence, type SequenceReference } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { PropertyValue } from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { PropertyBag } from "../../../udkapi/com/sun/star/beans/PropertyBag";
import { XPropertyContainer } from "../../../udkapi/com/sun/star/beans/XPropertyContainer";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import { MAYBEVOID } from "../../../udkapi/com/sun/star/beans/PropertyAttribute";
import { XModifyBroadcaster } from "../../../offapi/com/sun/star/util/XModifyBroadcaster";
import type { XModifyListener } from "../../../offapi/com/sun/star/util/XModifyListener";
import type { OInterfaceContainerHelper4 } from "../../../comphelper/inc/interfacecontainer4";
import { DocumentBuilder } from "../../../offapi/com/sun/star/xml/dom/DocumentBuilder";
import type { XDocument } from "../../../offapi/com/sun/star/xml/dom/XDocument";
import { cppu_detail_getUnoType_Date as dateType } from "../../../offapi/com/sun/star/util/Date";
import { cppu_detail_getUnoType_DateTime as datetimeType } from "../../../offapi/com/sun/star/util/DateTime";
import { cppu_detail_getUnoType_DateWithTimezone as dateTZType } from "../../../offapi/com/sun/star/util/DateWithTimezone";
import { cppu_detail_getUnoType_DateTimeWithTimezone as datetimeTZType } from "../../../offapi/com/sun/star/util/DateTimeWithTimezone";
import { cppu_detail_getUnoType_Duration as durationType } from "../../../offapi/com/sun/star/util/Duration";
import { cppu_detail_getUnoType_Time as timeType } from "../../../offapi/com/sun/star/util/Time";
import { OUString } from "../../../sal/inc/rtl/ustring";
/** Compiler-known original ASCII literal. @param text - Source spelling. @returns Owned RTL value. */
function literal(text: string): OUString {
  return OUString.createFromAscii(new TextEncoder().encode(text + "\0"));
}
const documentBaseUrl = literal("DocumentBaseURL"),
  url = literal("URL"),
  hierarchicalName = literal("HierarchicalDocumentName"),
  streamRelPath = literal("StreamRelPath"),
  baseUriName = literal("BaseURI"),
  streamName = literal("StreamName"),
  meta = literal("meta.xml");
/** Original createDOM uses the registered builder and preserves the actual receiver only for its null-result diagnostic. @param context - Actual m_xContext. @param owner - Actual caller root for original exception Context. @returns Owned native document. */
export function createDOM(
  context: Reference<XComponentContext>,
  owner: XInterface,
): Reference<XDocument> {
  const builder = DocumentBuilder.create(context);
  try {
    const doc = builder.operatorStar().newDocument();
    if (!doc.is()) {
      const message = literal("SfxDocumentMetaData::createDOM: cannot create new document"),
        self = new Reference<XInterface>(owner);
      try {
        throw new RuntimeException(message, self);
      } finally {
        self.dispose();
        message.dispose();
        doc.dispose();
      }
    }
    return doc;
  } finally {
    builder.dispose();
  }
}
/** Original URL property bag preserves source precedence, void values and catch-wide partial insertion. @param context - Actual m_xContext. @param medium - Native source PropertyValue sequence. @returns Acquired source property set. */
export function getURLProperties(
  context: Reference<XComponentContext>,
  medium: SequenceReference<PropertyValue>,
): Reference<XPropertySet> {
  const bag = PropertyBag.createDefault(context);
  try {
    try {
      const baseUri = new Any();
      try {
        for (let i = 0; i < medium.getLength(); ++i) {
          const property = PropertyValue.unacquired(
            medium.operatorIndex(i) as unknown as Parameters<typeof PropertyValue.unacquired>[0],
          );
          if (property.Name.equals(documentBaseUrl)) baseUri.assign(property.Value as Any);
          else if (property.Name.equals(url)) {
            if (!baseUri.hasValue()) baseUri.assign(property.Value as Any);
          } else if (property.Name.equals(hierarchicalName)) {
            bag.operatorStar().addProperty(streamRelPath, MAYBEVOID, property.Value as Any);
          }
        }
        if (baseUri.hasValue()) bag.operatorStar().addProperty(baseUriName, MAYBEVOID, baseUri);
        const value = new Any(meta.getDataAddress(), "OUString");
        try {
          bag.operatorStar().addProperty(streamName, MAYBEVOID, value);
        } finally {
          value.dispose();
        }
      } finally {
        baseUri.dispose();
      }
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
    }
    return new Reference<XPropertySet>(bag, UNO_QUERY_THROW, XPropertySet.static_type);
  } finally {
    bag.dispose();
  }
}
/** Original lazy PropertyBag construction and existing listener forwarding. The mutable reference is the source member itself; no state/provider substitute is created. @param context - Actual m_xContext. @param userDefined - Actual m_xUserDefined member. @param listeners - Actual m_NotifyListeners member. @returns Nothing. */
export function createUserDefined(
  context: Reference<XComponentContext>,
  userDefined: Reference<XPropertyContainer>,
  listeners: OInterfaceContainerHelper4<XModifyListener>,
): void {
  if (userDefined.is()) return;
  const types = [
    UnoType.get("bool"),
    UnoType.get("OUString"),
    datetimeType(),
    dateType(),
    datetimeTZType(),
    dateTZType(),
    durationType(),
    UnoType.get("float"),
    UnoType.get("double"),
    UnoType.get("sal_Int16"),
    UnoType.get("sal_Int32"),
    UnoType.get("sal_Int64"),
    timeType(),
  ];
  const allowed = new (Sequence.specialize<Type>("Type", 8))(
    {
      /** Borrows actual CPPUMaker Type member storage. @param offset - Byte offset. @returns Native Type address. */
      get(offset: number) {
        return (types[offset / 8] as Type).getAddress();
      },
    },
    types.length,
  );
  try {
    const bag = PropertyBag.createWithTypes(context, allowed, true, false);
    try {
      userDefined.set(bag, UNO_QUERY_THROW, XPropertyContainer.static_type);
    } finally {
      bag.dispose();
    }
  } finally {
    allowed.dispose();
  }
  const broadcaster = new Reference<XModifyBroadcaster>(
    userDefined,
    UNO_QUERY,
    XModifyBroadcaster.static_type,
  );
  try {
    if (broadcaster.is())
      listeners.forEach(
        /** Original captured broadcaster adds each borrowed source listener. @param listener - Actual acquired listener. @returns Nothing. */
        (listener) => broadcaster.operatorStar().addModifyListener(listener),
      );
  } finally {
    broadcaster.dispose();
  }
}
