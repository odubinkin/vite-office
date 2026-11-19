/** @fileoverview Original SfxDocumentMetaData.cxx DOM cache text/list/attribute/statistic methods, operating on the one actual metadata component receiver. */
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { XNode } from "../../../offapi/com/sun/star/xml/dom/XNode";
import { XElement } from "../../../offapi/com/sun/star/xml/dom/XElement";
import { NodeType } from "../../../offapi/com/sun/star/xml/dom/NodeType";
import { DOMException } from "../../../offapi/com/sun/star/xml/dom/DOMException";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import {
  NamedValue,
  cppu_detail_getUnoType_NamedValue as namedType,
} from "../../../udkapi/com/sun/star/beans/NamedValue";
import { Converter } from "../../../sax/source/tools/converter";
import { getNodeText } from "./SfxDocumentMetaData.dom";
import {
  getNameSpace,
  getQualifier,
  s_stdStatAttrs,
  s_stdStats,
} from "./SfxDocumentMetaData.names";
import type { AttrVector } from "./SfxDocumentMetaData.values";
import { SfxDocumentMetaData, literal, key } from "./SfxDocumentMetaData";

/** Original cached scalar read, including first direct text only. @param this - Original document metadata receiver. @param name - Source ASCII QName. @returns Owned text. */
export function getMetaText(this: SfxDocumentMetaData, name: string): OUString {
  this.checkInit();
  const node = this.m_meta.get(name);
  if (node === undefined) throw new Error("assert(m_meta.find(name) != m_meta.end())");
  return node.is() ? getNodeText(node) : new OUString();
}
/** Original scalar delete/update/insert and exact DOMException wrapping. @param this - Original document metadata receiver. @param name - Native QName. @param value - Native text. @returns Whether modified. */
export function setMetaText(
  this: SfxDocumentMetaData,
  name: OUStringConstReference,
  value: OUStringConstReference,
): boolean {
  this.checkInit();
  const spelling = key(name),
    cached = this.m_meta.get(spelling);
  if (cached === undefined) throw new Error("assert(m_meta.find(name) != m_meta.end())");
  const node = new Reference(cached);
  try {
    try {
      if (value.isEmpty()) {
        if (node.is()) {
          this.m_xParent.operatorStar().removeChild(node).dispose();
          node.clear();
          this.cacheNode(spelling, node);
          return true;
        }
        return false;
      }
      if (node.is()) {
        const child = node.operatorStar().getFirstChild();
        try {
          while (child.is()) {
            if (child.operatorStar().getNodeType() === NodeType.TEXT_NODE) {
              const old = child.operatorStar().getNodeValue();
              try {
                if (!old.equals(value)) {
                  child.operatorStar().setNodeValue(value);
                  return true;
                }
                return false;
              } finally {
                old.dispose();
              }
            }
            const next = child.operatorStar().getNextSibling();
            try {
              child.assign(next);
            } finally {
              next.dispose();
            }
          }
        } finally {
          child.dispose();
        }
      } else {
        const namespace = getNameSpace(name);
        try {
          const element = this.m_xDoc.operatorStar().createElementNS(namespace, name);
          try {
            node.set(element, UNO_QUERY_THROW, XNode.static_type);
          } finally {
            element.dispose();
          }
        } finally {
          namespace.dispose();
        }
        this.m_xParent.operatorStar().appendChild(node).dispose();
        this.cacheNode(spelling, node);
      }
      const text = this.m_xDoc.operatorStar().createTextNode(value);
      try {
        const textNode = new Reference<XNode>(text, UNO_QUERY_THROW, XNode.static_type);
        try {
          node.operatorStar().appendChild(textNode).dispose();
        } finally {
          textNode.dispose();
        }
      } finally {
        text.dispose();
      }
      return true;
    } catch (error) {
      if (!(error instanceof DOMException)) throw error;
      this.wrapped("SfxDocumentMetaData::setMetaText: DOM exception", error);
    }
  } finally {
    node.dispose();
  }
}
/** Original attribute read does not check initialized state. @param this - Original document metadata receiver. @param name - Element QName. @param attribute - Attribute QName. @returns Owned text. */
export function getMetaAttr(
  this: SfxDocumentMetaData,
  name: OUStringConstReference,
  attribute: OUStringConstReference,
): OUString {
  const node = this.m_meta.get(key(name));
  if (node === undefined) throw new Error("assert(m_meta.find(name) != m_meta.end())");
  if (!node.is()) return new OUString();
  const element = new Reference<XElement>(node, UNO_QUERY_THROW, XElement.static_type),
    namespace = getNameSpace(attribute),
    [prefix, local] = getQualifier(attribute);
  try {
    return element.operatorStar().getAttributeNS(namespace, local);
  } finally {
    local.dispose();
    prefix.dispose();
    namespace.dispose();
    element.dispose();
  }
}
/** Original native string sequence over every cached occurrence. @param this - Original document metadata receiver. @param name - ASCII QName. @returns Native sequence. */
export function getMetaList(this: SfxDocumentMetaData, name: string): Sequence<OUString> {
  this.checkInit();
  const nodes = this.m_metaList.get(name);
  if (nodes === undefined) throw new Error("assert(m_metaList.find(name) != m_metaList.end())");
  const strings: OUString[] = [];
  try {
    for (const node of nodes) strings.push(getNodeText(node));
    return new (Sequence.specialize<OUString>("OUString", 8))(
      {
        /** Selects a string slot by its native sequence byte offset. @param offset - Byte offset within the source sequence. @returns Borrowed native string address. */ get(
          offset: number,
        ) {
          return (strings[offset / 8] as OUString).getDataAddress();
        },
      },
      strings.length,
    );
  } finally {
    for (const value of strings) value.dispose();
  }
}
/** Original replacement order and reverse erase cleanup after a genuine DOM failure. @param this - Original document metadata receiver. @param name - Native QName. @param values - Native input sequence. @param attrs - Original optional attribute vector. @returns Whether modified. */
export function setMetaList(
  this: SfxDocumentMetaData,
  name: OUStringConstReference,
  values: Readonly<Sequence<OUString>>,
  attrs: AttrVector | null,
): boolean {
  this.checkInit();
  if (attrs !== null && attrs.length !== values.getLength())
    throw new Error("assert(value length == attrs size)");
  const nodes = this.m_metaList.get(key(name));
  if (nodes === undefined) throw new Error("assert(m_metaList.find(name) != m_metaList.end())");
  try {
    if (attrs === null && values.getLength() === nodes.length) {
      let equal = true;
      for (let i = 0; i < values.getLength(); ++i) {
        const node = nodes[i] as Reference<XNode>;
        if (node.is()) {
          const text = getNodeText(node),
            value = OUString.unacquired(values.operatorIndex(i) as unknown as rtl_uStringSlot);
          try {
            if (!text.equals(value)) {
              equal = false;
              break;
            }
          } finally {
            text.dispose();
          }
        }
      }
      if (equal) return false;
    }
    let at = nodes.length - 1;
    try {
      for (; at >= 0; --at)
        this.m_xParent
          .operatorStar()
          .removeChild(nodes[at] as Reference<XNode>)
          .dispose();
    } catch (error) {
      for (const node of nodes.splice(at + 1)) node.dispose();
      throw error;
    }
    for (const node of nodes) node.dispose();
    nodes.length = 0;
    for (let i = 0; i < values.getLength(); ++i) {
      const namespace = getNameSpace(name),
        element = this.m_xDoc.operatorStar().createElementNS(namespace, name);
      namespace.dispose();
      try {
        const node = new Reference<XNode>(element, UNO_QUERY_THROW, XNode.static_type),
          value = OUString.unacquired(values.operatorIndex(i) as unknown as rtl_uStringSlot),
          text = this.m_xDoc.operatorStar().createTextNode(value);
        try {
          if (attrs !== null)
            for (const [attribute, content] of attrs[i] as AttrVector[number]) {
              const ns = getNameSpace(attribute);
              try {
                element.operatorStar().setAttributeNS(ns, attribute, content);
              } finally {
                ns.dispose();
              }
            }
          const textNode = new Reference<XNode>(text, UNO_QUERY_THROW, XNode.static_type);
          try {
            node.operatorStar().appendChild(textNode).dispose();
          } finally {
            textNode.dispose();
          }
          this.m_xParent.operatorStar().appendChild(node).dispose();
          nodes.push(new Reference(node));
        } finally {
          text.dispose();
          node.dispose();
        }
      } finally {
        element.dispose();
      }
    }
    return true;
  } catch (error) {
    if (!(error instanceof DOMException)) throw error;
    this.wrapped("SfxDocumentMetaData::setMetaList: DOM exception", error);
  }
}
/** Original remove/recreate attribute-bearing element. @param this - Original document metadata receiver. @param name - Native QName. @param attrs - Null deletes without replacement. @returns Nothing. */
export function updateElement(
  this: SfxDocumentMetaData,
  name: OUStringConstReference,
  attrs: AttrVector[number] | null,
): void {
  const spelling = key(name),
    cached = this.m_meta.get(spelling);
  if (cached === undefined) throw new Error("assert(m_meta.find(name) != m_meta.end())");
  const node = new Reference(cached);
  try {
    try {
      if (node.is()) {
        this.m_xParent.operatorStar().removeChild(node).dispose();
        node.clear();
      }
      if (attrs !== null) {
        const namespace = getNameSpace(name),
          element = this.m_xDoc.operatorStar().createElementNS(namespace, name);
        namespace.dispose();
        try {
          node.set(element, UNO_QUERY_THROW, XNode.static_type);
          for (const [attribute, value] of attrs) {
            const ns = getNameSpace(attribute);
            try {
              element.operatorStar().setAttributeNS(ns, attribute, value);
            } finally {
              ns.dispose();
            }
          }
          this.m_xParent.operatorStar().appendChild(node).dispose();
        } finally {
          element.dispose();
        }
      }
      this.cacheNode(spelling, node);
    } catch (error) {
      if (!(error instanceof DOMException)) throw error;
      this.wrapped("SfxDocumentMetaData::updateElement: DOM exception", error);
    }
  } finally {
    node.dispose();
  }
}
/** Original supported statistic scan and invalid-number zero coercion. @param this - Original document metadata receiver. @returns Native named values. */
export function getDocumentStatistics(this: SfxDocumentMetaData): Sequence<NamedValue> {
  this.checkInit();
  const stats: NamedValue[] = [];
  try {
    for (let i = 0; i < s_stdStats.length; ++i) {
      const name = literal("meta:document-statistic"),
        text = this.getMetaAttr(name, s_stdStatAttrs[i] as OUString);
      name.dispose();
      try {
        if (text.isEmpty()) continue;
        const value: [number] = [0];
        if (!Converter.convertNumber(value, text.subView(0), 0) || (value[0] as number) < 0)
          value[0] = 0;
        const item = new NamedValue(),
          key = literal(s_stdStats[i] as string);
        try {
          item.Name = key;
          item.Value.insert(value, "sal_Int32");
          stats.push(item);
        } catch (error) {
          item.dispose();
          throw error;
        } finally {
          key.dispose();
        }
      } finally {
        text.dispose();
      }
    }
    return new (Sequence.specialize<NamedValue>(namedType, 32))(
      {
        /** Selects a statistic by its native sequence byte offset. @param offset - Byte offset within the source sequence. @returns Borrowed sequence value. */ get(
          offset: number,
        ) {
          return stats[offset / 32] as NamedValue;
        },
      },
      stats.length,
    );
  } finally {
    for (const item of stats) item.dispose();
  }
}
/** Original duplicate/negative statistic acceptance and unconditional modification. @param this - Original document metadata receiver. @param values - Native named values. @returns Nothing. */
export function setDocumentStatistics(
  this: SfxDocumentMetaData,
  values: Readonly<Sequence<NamedValue>>,
): void {
  this.checkInit();
  const attrs: AttrVector[number] = [];
  try {
    for (let i = 0; i < values.getLength(); ++i) {
      const item = NamedValue.unacquired(
          values.operatorIndex(i) as unknown as Parameters<typeof NamedValue.unacquired>[0],
        ),
        name = new OUString(item.Name);
      try {
        for (let j = 0; j < s_stdStats.length; ++j) {
          const expected = literal(s_stdStats[j] as string);
          let match: boolean;
          try {
            match = name.equals(expected);
          } finally {
            expected.dispose();
          }
          if (match) {
            const value: [number] = [0];
            if (Any.prototype.extract.call(item.Value as Any, value, "sal_Int32")) {
              const text = new OUString(OUString.number(value[0] as number));
              attrs.push([new OUString(s_stdStatAttrs[j] as OUString), text]);
            }
            break;
          }
        }
      } finally {
        name.dispose();
      }
    }
    const name = literal("meta:document-statistic");
    try {
      this.updateElement(name, attrs);
    } finally {
      name.dispose();
    }
  } finally {
    for (const [name, value] of attrs) {
      name.dispose();
      value.dispose();
    }
  }
  this.setModified(true);
}
