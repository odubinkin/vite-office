/** @fileoverview Original SfxDocumentMetaData.cxx anonymous DOM traversal helpers and complete user-defined property ingestion responsibility extracted from init. Every node, Any and property container is an actual source UNO owner. */
import {
  Reference,
  UNO_QUERY,
  UNO_QUERY_THROW,
} from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { XNode } from "../../../offapi/com/sun/star/xml/dom/XNode";
import { XElement } from "../../../offapi/com/sun/star/xml/dom/XElement";
import { NodeType } from "../../../offapi/com/sun/star/xml/dom/NodeType";
import { DOMException } from "../../../offapi/com/sun/star/xml/dom/DOMException";
import { PropertyExistException } from "../../../udkapi/com/sun/star/beans/PropertyExistException";
import { IllegalTypeException } from "../../../udkapi/com/sun/star/beans/IllegalTypeException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import type { XPropertyContainer } from "../../../udkapi/com/sun/star/beans/XPropertyContainer";
import { REMOVABLE } from "../../../udkapi/com/sun/star/beans/PropertyAttribute";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import {
  Date as UnoDate,
  cppu_detail_getUnoType_Date as dateType,
} from "../../../offapi/com/sun/star/util/Date";
import {
  DateTime,
  cppu_detail_getUnoType_DateTime as dateTimeType,
} from "../../../offapi/com/sun/star/util/DateTime";
import {
  DateWithTimezone,
  cppu_detail_getUnoType_DateWithTimezone as dateTZType,
} from "../../../offapi/com/sun/star/util/DateWithTimezone";
import {
  DateTimeWithTimezone,
  cppu_detail_getUnoType_DateTimeWithTimezone as dateTimeTZType,
} from "../../../offapi/com/sun/star/util/DateTimeWithTimezone";
import {
  Duration,
  cppu_detail_getUnoType_Duration as durationType,
} from "../../../offapi/com/sun/star/util/Duration";
import { Converter } from "../../../sax/source/tools/converter";
import { textToDateOrDateTime, textToDuration } from "./SfxDocumentMetaData.values";
import { s_nsODFMeta, extractTagAndNamespaceUri } from "./SfxDocumentMetaData.names";
/** Source-known ASCII constant. @param value - Literal. @returns Owned RTL string. */
function literal(value: string): OUString {
  return OUString.createFromAscii(new TextEncoder().encode(value + "\0"));
}
const typeFloat = literal("float"),
  typeDate = literal("date"),
  typeTime = literal("time"),
  typeBoolean = literal("boolean");
/** Original first direct TEXT_NODE only; it does not concatenate text, traverse nested elements or include CDATA. @param node - Actual node. @returns Owned text. */
export function getNodeText(node: Reference<XNode>): OUString {
  if (!node.is()) {
    const message = literal("SfxDocumentMetaData::getNodeText: argument is null");
    try {
      throw new RuntimeException(message, node);
    } finally {
      message.dispose();
    }
  }
  const child = node.operatorStar().getFirstChild();
  try {
    while (child.is()) {
      if (child.operatorStar().getNodeType() === NodeType.TEXT_NODE) {
        try {
          return child.operatorStar().getNodeValue();
        } catch (error) {
          if (!(error instanceof DOMException)) throw error;
          error.dispose();
          return new OUString();
        }
      }
      const next = child.operatorStar().getNextSibling();
      try {
        child.assign(next);
      } finally {
        next.dispose();
      }
    }
    return new OUString();
  } finally {
    child.dispose();
  }
}
/** Original immediate-child first match using XElement::getNodeName and exact namespace. @param node - Actual parent. @param name - Borrowed known QName view. @returns Acquired first element or null. */
export function getChildNodeByName(node: Reference<XNode>, name: Uint16Array): Reference<XElement> {
  const list = node.operatorStar().getChildNodes();
  try {
    if (!list.is()) return new Reference<XElement>();
    const [tag, namespace] = extractTagAndNamespaceUri(name),
      count = list.operatorStar().getLength();
    for (let index = 0; index < count; ++index) {
      const item = list.operatorStar().item(index);
      try {
        const child = new Reference<XElement>(item, UNO_QUERY, XElement.static_type);
        let retained = false;
        try {
          if (child.is() && matches(child, tag, namespace)) {
            retained = true;
            return child;
          }
        } finally {
          if (!retained) child.dispose();
        }
      } finally {
        item.dispose();
      }
    }
    return new Reference<XElement>();
  } finally {
    list.dispose();
  }
}
/** Original all immediate-child matches, preserving order and acquired references. @param node - Actual parent. @param name - Borrowed known QName view. @returns Owned vector of actual node references. */
export function getChildNodeListByName(
  node: Reference<XNode>,
  name: Uint16Array,
): Reference<XNode>[] {
  const list = node.operatorStar().getChildNodes(),
    result: Reference<XNode>[] = [];
  try {
    if (!list.is()) return result;
    const [tag, namespace] = extractTagAndNamespaceUri(name),
      count = list.operatorStar().getLength();
    for (let index = 0; index < count; ++index) {
      const item = list.operatorStar().item(index);
      try {
        const child = new Reference<XElement>(item, UNO_QUERY, XElement.static_type);
        try {
          if (child.is() && matches(child, tag, namespace))
            result.push(new Reference<XNode>(child));
        } finally {
          child.dispose();
        }
      } finally {
        item.dispose();
      }
    }
    return result;
  } catch (error) {
    for (const child of result) child.dispose();
    throw error;
  } finally {
    list.dispose();
  }
}
/** Original pair of virtual comparisons, without browser QName assumptions. @param child - Actual element. @param tag - Borrowed local name. @param namespace - Borrowed namespace. @returns Whether both compare equal. */
function matches(child: Reference<XElement>, tag: Uint16Array, namespace: Uint16Array): boolean {
  const name = child.operatorStar().getNodeName();
  try {
    if (!equalsView(name, tag)) return false;
    const uri = child.operatorStar().getNamespaceURI();
    try {
      return equalsView(uri, namespace);
    } finally {
      uri.dispose();
    }
  } finally {
    name.dispose();
  }
}
/** Original std::u16string_view equality without allocating another string owner. @param value - Actual source string. @param view - Borrowed view. @returns Equality. */
function equalsView(value: OUStringConstReference, view: Uint16Array): boolean {
  const units = value.getStr();
  return (
    value.getLength() === view.length &&
    view.every(
      /** Compares a borrowed code unit. @param code - Unit. @param index - Offset. @returns Equality. */ (
        code,
        index,
      ) => units[index] === code,
    )
  );
}
/** Original init user-property loop. The caller owns the original lazy PropertyBag creation and final modified/initialized flags. @param properties - Actual original container. @param nodes - Actual selected meta:user-defined nodes. @returns Nothing. */
export function readUserDefinedProperties(
  properties: Reference<XPropertyContainer>,
  nodes: readonly Reference<XNode>[],
): void {
  const nameKey = literal("name"),
    typeKey = literal("value-type");
  try {
    for (const node of nodes) {
      const element = new Reference<XElement>(node, UNO_QUERY_THROW, XElement.static_type),
        any = new Any();
      let name: OUString | undefined, kind: OUString | undefined, text: OUString | undefined;
      try {
        name = element.operatorStar().getAttributeNS(s_nsODFMeta, nameKey);
        kind = element.operatorStar().getAttributeNS(s_nsODFMeta, typeKey);
        text = getNodeText(node);
        if (kind.equals(typeFloat)) {
          const value: [number] = [0];
          if (!Converter.convertDouble(value, text)) continue;
          any.insert(value, "double");
        } else if (kind.equals(typeDate)) {
          const date = new UnoDate(),
            datetime = new DateTime(),
            isDateTime: [boolean] = [false],
            timezone: [number | undefined] = [undefined];
          if (!textToDateOrDateTime(date, datetime, isDateTime, timezone, text)) continue;
          if (isDateTime[0]) {
            if (timezone[0] !== undefined)
              any.insert(new DateTimeWithTimezone(datetime, timezone[0]), dateTimeTZType);
            else any.insert(datetime, dateTimeType);
          } else {
            if (timezone[0] !== undefined)
              any.insert(new DateWithTimezone(date, timezone[0]), dateTZType);
            else any.insert(date, dateType);
          }
        } else if (kind.equals(typeTime)) {
          const duration = new Duration();
          if (!textToDuration(duration, text)) continue;
          any.insert(duration, durationType);
        } else if (kind.equals(typeBoolean)) {
          const value: [boolean] = [false];
          if (!Converter.convertBool(value, text)) continue;
          any.insert(value, "bool");
        } else any.insert(text.getDataAddress(), "OUString");
        try {
          properties.operatorStar().addProperty(name, REMOVABLE, any);
        } catch (error) {
          if (!(
            error instanceof PropertyExistException ||
            error instanceof IllegalTypeException ||
            error instanceof IllegalArgumentException
          ))
            throw error;
          error.dispose();
        }
      } finally {
        text?.dispose();
        kind?.dispose();
        name?.dispose();
        any.dispose();
        element.dispose();
      }
    }
  } finally {
    typeKey.dispose();
    nameKey.dispose();
  }
}
