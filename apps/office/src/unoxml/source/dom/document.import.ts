/** @fileoverview Original document.cxx lcl_ImportNode and lcl_ImportSiblings responsibilities, split to keep the native document factory owner within the authored module budget. */
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { XAttr } from "../../../offapi/com/sun/star/xml/dom/XAttr";
import { XElement } from "../../../offapi/com/sun/star/xml/dom/XElement";
import { XText } from "../../../offapi/com/sun/star/xml/dom/XText";
import { XComment } from "../../../offapi/com/sun/star/xml/dom/XComment";
import { XCDATASection } from "../../../offapi/com/sun/star/xml/dom/XCDATASection";
import { XDocumentFragment } from "../../../offapi/com/sun/star/xml/dom/XDocumentFragment";
import { XEntityReference } from "../../../offapi/com/sun/star/xml/dom/XEntityReference";
import { XProcessingInstruction } from "../../../offapi/com/sun/star/xml/dom/XProcessingInstruction";
import type { XNode } from "../../../offapi/com/sun/star/xml/dom/XNode";
import { NodeType as N } from "../../../offapi/com/sun/star/xml/dom/NodeType";
import type { CDocument } from "./document";
/** Original qualified-name concatenation over actual RTL values. @param prefix - Borrowed prefix. @param local - Borrowed local name. @returns Owned qualified name. */
function qualifiedName(prefix: OUStringConstReference, local: OUStringConstReference): OUString {
  const buffer = new OUStringBuffer(prefix);
  try {
    if (!prefix.isEmpty()) buffer.append(new Uint16Array([58]));
    buffer.append(local);
    return buffer.makeStringAndClear();
  } finally {
    buffer.dispose();
  }
}

/** Original lcl_ImportNode uses real queried source facets, including nonnamespace attribute import and document-target insertion events. @param document - Actual target document. @param imported - Borrowed source node. @param deep - Recursion selector. @returns Imported node. */
export function importNode(
  document: CDocument,
  imported: Reference<XNode>,
  deep: boolean,
): Reference<XNode> {
  const source = imported.get() as XNode;
  let result = new Reference<XNode>();
  try {
    switch (source.getNodeType()) {
      case N.ATTRIBUTE_NODE: {
        const facet = new Reference<XAttr>(imported, UNO_QUERY_THROW, XAttr.static_type);
        try {
          const attr = facet.get() as XAttr,
            name = attr.getName(),
            value = attr.getValue();
          try {
            const created = document.createAttribute(name);
            result.set(created);
            created.dispose();
            (result.get() as XAttr).setValue(value);
          } finally {
            value.dispose();
            name.dispose();
          }
        } finally {
          facet.dispose();
        }
        break;
      }
      case N.CDATA_SECTION_NODE:
      case N.COMMENT_NODE:
      case N.TEXT_NODE: {
        const type = source.getNodeType(),
          declaration =
            type === N.CDATA_SECTION_NODE
              ? XCDATASection
              : type === N.COMMENT_NODE
                ? XComment
                : XText;
        const facet = new Reference<XCDATASection | XComment | XText>(
          imported,
          UNO_QUERY_THROW,
          declaration.static_type,
        );
        try {
          const value = (facet.get() as XCDATASection | XComment | XText).getData();
          try {
            const created =
              type === N.CDATA_SECTION_NODE
                ? document.createCDATASection(value)
                : type === N.COMMENT_NODE
                  ? document.createComment(value)
                  : document.createTextNode(value);
            result.set(created);
            created.dispose();
          } finally {
            value.dispose();
          }
        } finally {
          facet.dispose();
        }
        break;
      }
      case N.DOCUMENT_FRAGMENT_NODE: {
        const facet = new Reference<XDocumentFragment>(
          imported,
          UNO_QUERY_THROW,
          XDocumentFragment.static_type,
        );
        try {
          const created = document.createDocumentFragment();
          result.set(created);
          created.dispose();
        } finally {
          facet.dispose();
        }
        break;
      }
      case N.ELEMENT_NODE: {
        const facet = new Reference<XElement>(imported, UNO_QUERY_THROW, XElement.static_type);
        try {
          const element = facet.get() as XElement,
            uri = source.getNamespaceURI(),
            prefix = source.getPrefix(),
            name = element.getTagName(),
            qualified = qualifiedName(prefix, name);
          try {
            const created = uri.isEmpty()
              ? document.createElement(name)
              : document.createElementNS(uri, qualified);
            result.set(created);
            created.dispose();
          } finally {
            qualified.dispose();
            name.dispose();
            prefix.dispose();
            uri.dispose();
          }
          if (element.hasAttributes()) {
            const attributes = element.getAttributes();
            try {
              for (let i = 0; i < (attributes.get()?.getLength() ?? 0); ++i) {
                const item = attributes.get()?.item(i) as Reference<XNode>,
                  attr = new Reference<XAttr>(item, UNO_QUERY_THROW, XAttr.static_type);
                try {
                  const input = attr.get() as XAttr,
                    ns = input.getNamespaceURI(),
                    pfx = input.getPrefix(),
                    local = input.getName(),
                    value = input.getValue(),
                    qname = qualifiedName(pfx, local);
                  try {
                    const output = result.get() as XElement;
                    if (ns.isEmpty()) output.setAttribute(local, value);
                    else output.setAttributeNS(ns, qname, value);
                  } finally {
                    qname.dispose();
                    value.dispose();
                    local.dispose();
                    pfx.dispose();
                    ns.dispose();
                  }
                } finally {
                  attr.dispose();
                  item.dispose();
                }
              }
            } finally {
              attributes.dispose();
            }
          }
        } finally {
          facet.dispose();
        }
        break;
      }
      case N.ENTITY_REFERENCE_NODE: {
        const facet = new Reference<XEntityReference>(
          imported,
          UNO_QUERY_THROW,
          XEntityReference.static_type,
        );
        try {
          const name = (facet.get() as XEntityReference).getNodeName();
          try {
            const created = document.createEntityReference(name);
            result.set(created);
            created.dispose();
          } finally {
            name.dispose();
          }
        } finally {
          facet.dispose();
        }
        break;
      }
      case N.PROCESSING_INSTRUCTION_NODE: {
        const facet = new Reference<XProcessingInstruction>(
          imported,
          UNO_QUERY_THROW,
          XProcessingInstruction.static_type,
        );
        try {
          const pi = facet.get() as XProcessingInstruction,
            target = pi.getTarget(),
            data = pi.getData();
          try {
            const created = document.createProcessingInstruction(target, data);
            result.set(created);
            created.dispose();
          } finally {
            data.dispose();
            target.dispose();
          }
        } finally {
          facet.dispose();
        }
        break;
      }
      default:
        throw new RuntimeException();
    }
    if (deep) {
      let child = source.getFirstChild();
      try {
        while (child.is()) {
          const copy = document.importNode(child, true);
          try {
            const appended = (result.get() as XNode).appendChild(copy);
            appended.dispose();
          } finally {
            copy.dispose();
          }
          const next = (child.get() as XNode).getNextSibling();
          child.dispose();
          child = next;
        }
      } finally {
        child.dispose();
      }
    }
    if (result.is()) {
      const empty = new Reference<XNode>();
      try {
        document["emitMutation"](
          "DOMNodeInsertedIntoDocument",
          empty,
          undefined,
          undefined,
          undefined,
          undefined,
          false,
        );
      } finally {
        empty.dispose();
      }
    }
    const returned = result;
    result = new Reference<XNode>();
    return returned;
  } finally {
    result.dispose();
  }
}
