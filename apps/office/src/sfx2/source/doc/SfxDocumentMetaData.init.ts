/** @fileoverview Original SfxDocumentMetaData.cxx DOM initialization and delayed metadata synchronization on the actual component receiver. */
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { XDocument } from "../../../offapi/com/sun/star/xml/dom/XDocument";
import { XNode } from "../../../offapi/com/sun/star/xml/dom/XNode";
import { XElement } from "../../../offapi/com/sun/star/xml/dom/XElement";
import { NodeType } from "../../../offapi/com/sun/star/xml/dom/NodeType";
import { DOMException } from "../../../offapi/com/sun/star/xml/dom/DOMException";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import { OUString } from "../../../sal/inc/rtl/ustring";
import {
  getChildNodeByName,
  getChildNodeListByName,
  readUserDefinedProperties,
} from "./SfxDocumentMetaData.dom";
import { s_nsODF, s_stdMeta, s_stdMetaList } from "./SfxDocumentMetaData.names";
import {
  textToDateTimeDefault,
  textToDuration,
  propsToStrings,
  disposeAttrVector,
  isValidDateTime,
  dateTimeToText,
  durationToText,
  type AttrVector,
} from "./SfxDocumentMetaData.values";
import { SfxDocumentMetaData, literal, key } from "./SfxDocumentMetaData";
/** Original known-name string_view lifetime. @param name - ASCII QName. @param call - Actual DOM operation. @returns Source result. */
function named<T>(name: string, call: (view: Uint16Array) => T): T {
  const text = literal(name);
  try {
    return call(text.subView(0));
  } finally {
    text.dispose();
  }
}
/** Original initialization, including destructive root normalization and delayed fields. @param this - Original document metadata receiver. @param doc - Actual source document. @returns Nothing. */
export function init(this: SfxDocumentMetaData, doc: Reference<XDocument>): void {
  if (!doc.is()) this.runtime("SfxDocumentMetaData::init: no DOM tree given");
  this.m_isInitialized = false;
  this.m_xDoc.assign(doc);
  const documentNode = new Reference<XNode>(this.m_xDoc, UNO_QUERY_THROW, XNode.static_type);
  try {
    this.m_xParent.clear();
    try {
      const child = named(
        "office:document-meta",
        /** Finds a direct child by its qualified XML name. @param name - Qualified child name. @returns Matching child node reference. */ (
          name,
        ) => getChildNodeByName(documentNode, name),
      );
      try {
        if (child.is()) {
          const parent = named(
            "office:meta",
            /** Finds a direct child by its qualified XML name. @param name - Qualified child name. @returns Matching child node reference. */ (
              name,
            ) => getChildNodeByName(child, name),
          );
          try {
            this.m_xParent.assign(parent);
          } finally {
            parent.dispose();
          }
        }
      } finally {
        child.dispose();
      }
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
    }
    if (!this.m_xParent.is()) {
      try {
        const root = new Reference<XElement>(),
          node = doc.operatorStar().getFirstChild();
        try {
          while (node.is()) {
            if (node.operatorStar().getNodeType() === NodeType.ELEMENT_NODE) {
              const ns = node.operatorStar().getNamespaceURI(),
                local = node.operatorStar().getLocalName(),
                expected = literal("document-meta");
              let right: boolean;
              try {
                right = ns.equals(s_nsODF) && local.equals(expected);
              } finally {
                expected.dispose();
                local.dispose();
                ns.dispose();
              }
              if (right) {
                root.set(node, UNO_QUERY_THROW, XElement.static_type);
                break;
              }
              doc.operatorStar().removeChild(node).dispose();
              const first = doc.operatorStar().getFirstChild();
              try {
                node.assign(first);
              } finally {
                first.dispose();
              }
            } else {
              const next = node.operatorStar().getNextSibling();
              try {
                node.assign(next);
              } finally {
                next.dispose();
              }
            }
          }
          if (!root.is()) {
            const name = literal("office:document-meta"),
              element = doc.operatorStar().createElementNS(s_nsODF, name);
            name.dispose();
            try {
              root.assign(element);
            } finally {
              element.dispose();
            }
            const rootNode = new Reference<XNode>(root, UNO_QUERY_THROW, XNode.static_type);
            try {
              doc.operatorStar().appendChild(rootNode).dispose();
            } finally {
              rootNode.dispose();
            }
          }
          const version = literal("office:version"),
            one = literal("1.0");
          try {
            root.operatorStar().setAttributeNS(s_nsODF, version, one);
          } finally {
            one.dispose();
            version.dispose();
          }
          const name = literal("office:meta"),
            element = doc.operatorStar().createElementNS(s_nsODF, name);
          name.dispose();
          try {
            const parent = new Reference<XNode>(element, UNO_QUERY_THROW, XNode.static_type);
            try {
              root.operatorStar().appendChild(parent).dispose();
              this.m_xParent.assign(parent);
            } finally {
              parent.dispose();
            }
          } finally {
            element.dispose();
          }
        } finally {
          node.dispose();
          root.dispose();
        }
      } catch (error) {
        if (!(error instanceof DOMException)) throw error;
        this.wrapped("SfxDocumentMetaData::init: DOM exception", error);
      }
    }
    for (const name of s_stdMeta) {
      const node = named(
        name,
        /** Finds a direct child by its qualified XML name. @param view - Qualified child name. @returns Matching child node reference. */ (
          view,
        ) => getChildNodeByName(this.m_xParent, view),
      );
      try {
        this.cacheNode(name, node);
      } finally {
        node.dispose();
      }
    }
    for (const name of s_stdMetaList)
      this.cacheList(key(name), getChildNodeListByName(this.m_xParent, name.subView(0)));
    const template = literal("meta:template"),
      autoload = literal("meta:auto-reload"),
      hyperlink = literal("meta:hyperlink-behaviour");
    try {
      const fields: [
        [OUString, OUString, string],
        [OUString, OUString, string],
        [OUString, OUString, string],
        [OUString, OUString, string],
      ] = [
        [this.m_TemplateName, template, "xlink:title"],
        [this.m_TemplateURL, template, "xlink:href"],
        [this.m_AutoloadURL, autoload, "xlink:href"],
        [this.m_DefaultTarget, hyperlink, "office:target-frame-name"],
      ];
      for (const [target, name, attribute] of fields) {
        const attr = literal(attribute),
          value = this.getMetaAttr(name, attr);
        try {
          target.assign(value);
        } finally {
          value.dispose();
          attr.dispose();
        }
      }
      const date = literal("meta:date"),
        dateText = this.getMetaAttr(template, date);
      try {
        this.m_TemplateDate.assign(textToDateTimeDefault(dateText));
      } finally {
        dateText.dispose();
        date.dispose();
      }
      const delay = literal("meta:delay"),
        delayText = this.getMetaAttr(autoload, delay);
      try {
        this.m_AutoloadSecs = textToDuration(delayText);
      } finally {
        delayText.dispose();
        delay.dispose();
      }
    } finally {
      hyperlink.dispose();
      autoload.dispose();
      template.dispose();
    }
    const user = this.m_metaList.get("meta:user-defined") as Reference<XNode>[];
    this.m_xUserDefined.clear();
    if (user.length !== 0) this.createUserDefined();
    readUserDefinedProperties(this.m_xUserDefined, user);
    this.m_isModified = false;
    this.m_isInitialized = true;
  } finally {
    documentNode.dispose();
  }
}
/** Original delayed user-defined/attribute synchronization, without changing the modified flags. @param this - Original document metadata receiver. @returns Nothing. */
export function updateUserDefinedAndAttributes(this: SfxDocumentMetaData): void {
  this.createUserDefined();
  const properties = new Reference<XPropertySet>(
    this.m_xUserDefined,
    UNO_QUERY_THROW,
    XPropertySet.static_type,
  );
  try {
    const [values, attrs] = propsToStrings(properties),
      name = literal("meta:user-defined");
    try {
      this.setMetaList(name, values, attrs);
    } finally {
      name.dispose();
      disposeAttrVector(attrs);
      values.dispose();
    }
  } finally {
    properties.dispose();
  }
  let attrs: AttrVector[number] = [];
  try {
    const name = literal("meta:template");
    try {
      if (
        !this.m_TemplateName.isEmpty() ||
        !this.m_TemplateURL.isEmpty() ||
        isValidDateTime(this.m_TemplateDate)
      ) {
        attrs = [
          [literal("xlink:type"), literal("simple")],
          [literal("xlink:actuate"), literal("onRequest")],
          [literal("xlink:title"), new OUString(this.m_TemplateName)],
          [literal("xlink:href"), new OUString(this.m_TemplateURL)],
        ];
        if (isValidDateTime(this.m_TemplateDate))
          attrs.push([literal("meta:date"), dateTimeToText(this.m_TemplateDate)]);
        this.updateElement(name, attrs);
      } else this.updateElement(name);
    } finally {
      name.dispose();
    }
  } finally {
    disposeAttrVector([attrs]);
  }
  attrs = [];
  try {
    const name = literal("meta:auto-reload");
    try {
      if (!this.m_AutoloadURL.isEmpty() || this.m_AutoloadSecs !== 0) {
        attrs = [
          [literal("xlink:href"), new OUString(this.m_AutoloadURL)],
          [literal("meta:delay"), durationToText(this.m_AutoloadSecs)],
        ];
        this.updateElement(name, attrs);
      } else this.updateElement(name);
    } finally {
      name.dispose();
    }
  } finally {
    disposeAttrVector([attrs]);
  }
  attrs = [];
  try {
    const name = literal("meta:hyperlink-behaviour");
    try {
      if (!this.m_DefaultTarget.isEmpty()) {
        const blank = literal("_blank");
        try {
          attrs = [
            [literal("office:target-frame-name"), new OUString(this.m_DefaultTarget)],
            [
              literal("xlink:show"),
              literal(this.m_DefaultTarget.equals(blank) ? "new" : "replace"),
            ],
          ];
        } finally {
          blank.dispose();
        }
        this.updateElement(name, attrs);
      } else this.updateElement(name);
    } finally {
      name.dispose();
    }
  } finally {
    disposeAttrVector([attrs]);
  }
}
