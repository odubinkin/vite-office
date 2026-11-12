/** @fileoverview Original CXPathAPI namespace/extension snapshots and complete query methods over native libxml2 XPath. Mutex scopes lower to synchronous realm execution; native shared-memory threading is unqualified. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { acquire } from "../../../cppuhelper/inc/weak";
import { supportsService } from "../../../cppuhelper/inc/supportsservice";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import type { XNode } from "../../../offapi/com/sun/star/xml/dom/XNode";
import type { XNodeList } from "../../../offapi/com/sun/star/xml/dom/XNodeList";
import { XXPathAPI } from "../../../offapi/com/sun/star/xml/xpath/XXPathAPI";
import { XXPathExtension } from "../../../offapi/com/sun/star/xml/xpath/XXPathExtension";
import type { XXPathObject } from "../../../offapi/com/sun/star/xml/xpath/XXPathObject";
import { XPathException } from "../../../offapi/com/sun/star/xml/xpath/XPathException";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { getLibXml2 } from "../../../external/libxml2/libxml2";
import { CNode, domLiteral, xmlString, withXmlStrings } from "../dom/node";
import { CDocument } from "../dom/document";
import { XPathObjectReference } from "./xpathobject.native";
import { CXPathObject } from "./xpathobject";
const Names = Sequence.specialize<rtl_uStringSlot>("OUString", 8);
/** Source std::map entry owns both original UTF16 values. */
interface Namespace {
  prefix: OUString;
  uri: OUString;
}
/** Exact counted UTF16 key lowers only the source map comparison representation. @param value - Borrowed original key. @returns Complete key. */
function key(value: OUStringConstReference): string {
  let result = "";
  for (let i = 0; i < value.getLength(); ++i) result += String.fromCharCode(value.charAt(i));
  return result;
}
/** Releases one original namespace map copy in reverse owned-field order. @param entries - Owned entries. @returns Nothing. */
function freeNamespaces(entries: Iterable<Namespace>): void {
  for (const value of entries) {
    value.uri.dispose();
    value.prefix.dispose();
  }
}
/** Original emplace keeps the first value for an existing prefix. @param namespaces - Actual map. @param prefix - Borrowed prefix. @param uri - Borrowed URI. @returns Nothing. */
function emplace(
  namespaces: Map<string, Namespace>,
  prefix: OUStringConstReference,
  uri: OUStringConstReference,
): void {
  const name = key(prefix);
  if (!namespaces.has(name)) namespaces.set(name, { prefix: prefix.copy(0), uri: uri.copy(0) });
}
/** Original XPath structured diagnostic builder, distinct from the parser's unconditional location suffix. @param error - Native error or NULL. @returns Owned text. */
function make_error_message(error: number): OUString {
  const m = getLibXml2(),
    buffer = new OUStringBuffer();
  try {
    if (error) {
      const message = m._office_error_message_get(error);
      if (message)
        buffer.appendAscii(
          new Uint8Array(m.HEAPU8.subarray(message, message + m._xmlStrlen(message))),
          m._xmlStrlen(message),
        );
      const line = m._office_error_line_get(error),
        column = m._office_error_column_get(error);
      if (line) {
        buffer.appendAscii(new Uint8Array([76, 105, 110, 101, 58, 32]), 6);
        buffer.append(line);
        buffer.appendAscii(new Uint8Array([10]), 1);
      }
      if (column) {
        buffer.appendAscii(new Uint8Array([67, 111, 108, 117, 109, 110, 58, 32]), 8);
        buffer.append(column);
        buffer.appendAscii(new Uint8Array([10]), 1);
      }
    } else {
      const text = domLiteral("no error argument!");
      try {
        buffer.append(text);
      } finally {
        text.dispose();
      }
    }
    return buffer.makeStringAndClear();
  } finally {
    buffer.dispose();
  }
}
let diagnostics: readonly [structured: number, generic: number] | undefined;
/** Original static callback lifetime. The native trampoline retains bounded vsnprintf; console is the host SAL diagnostic sink, not parser/error policy. @returns Native function pointers. */
function errorFunctions(): readonly [number, number] {
  if (!diagnostics) {
    const m = getLibXml2();
    diagnostics = [
      m.addFunction(
        /** Original structured_error_func ignores userdata and logs its exact message. @param data - Unused original data. @param error - Native error. @returns Nothing. */ (
          data: number,
          error: number,
        ) => {
          void data;
          const message = make_error_message(error);
          try {
            console.warn("unoxml: libxml2 error: " + key(message));
          } finally {
            message.dispose();
          }
        },
        "vii",
      ),
      m.addFunction(
        /** Original generic_error_func's native formatted 1000-byte buffer. @param message - Native terminated buffer. @returns Nothing. */ (
          message: number,
        ) => {
          console.warn("unoxml: libxml2 error: " + m.UTF8ToString(message));
        },
        "vi",
      ),
    ];
  }
  return diagnostics;
}
/** Original collectNamespaces requires an actual CNode, then walks its native parent declarations. @param namespaces - Source map. @param namespaceNode - Borrowed namespace node. @returns Nothing. */
function lcl_collectNamespaces(
  namespaces: Map<string, Namespace>,
  namespaceNode: Reference<XNode>,
): void {
  const node = namespaceNode.get();
  if (!(node instanceof CNode)) {
    const message = domLiteral(
      "Could not use the namespace node in order to collect namespace declarations.",
    );
    const context = new Reference();
    try {
      throw new RuntimeException(message, context);
    } finally {
      context.dispose();
      message.dispose();
    }
  }
  const m = getLibXml2();
  let pointer = node.GetNodePtr();
  while (pointer) {
    let declaration = m._office_node_nsDef_get(pointer);
    while (declaration) {
      const href = m._office_ns_href_get(declaration),
        prefix = m._office_ns_prefix_get(declaration);
      // The original uses strlen on both pointers. NULL is outside its defined C++ preconditions; do not silently assign an empty prefix/URI.
      if (!href || !prefix)
        throw new Error("XPath namespace collection requires original nonnull strlen operands");
      const uri = xmlString(href),
        name = xmlString(prefix);
      try {
        emplace(namespaces, name, uri);
      } finally {
        name.dispose();
        uri.dispose();
      }
      declaration = m._office_ns_next_get(declaration);
    }
    pointer = m._office_node_parent_get(pointer);
  }
}
/** Original complete service implementation. */
export class CXPathAPI
  extends WeakImplHelper.specialize(XXPathAPI, XServiceInfo)
  implements XXPathAPI, XServiceInfo
{
  private readonly m_nsmap = new Map<string, Namespace>();
  private readonly m_xContext: Reference<XComponentContext>;
  private readonly m_extensions: Reference<XXPathExtension>[] = [];
  /** Original context copy. @param context - Borrowed component context. @returns Component. */ constructor(
    context: Reference<XComponentContext>,
  ) {
    super();
    this.m_xContext = new Reference(context);
  }
  /** Original reverse member destruction. @returns Nothing. */ protected override destroy(): void {
    for (const extension of [...this.m_extensions].reverse()) extension.dispose();
    this.m_xContext.dispose();
    freeNamespaces(this.m_nsmap.values());
    super.destroy();
  }
  /** Original implementation name. @returns Owned name. */ getImplementationName(): OUString {
    return domLiteral("com.sun.star.comp.xml.xpath.XPathAPI");
  }
  /** Original standard helper. @param name - Borrowed name. @returns Membership. */ supportsService(
    name: OUStringConstReference,
  ): boolean {
    return supportsService(this, name as OUString);
  }
  /** Original singleton initializer list. @returns Owned names. */ getSupportedServiceNames(): Sequence<rtl_uStringSlot> {
    const name = domLiteral("com.sun.star.xml.xpath.XPathAPI");
    try {
      return new Names(
        {
          /** Original initializer-list field. @param offset - Zero offset. @returns String cell. */ get(
            offset: number,
          ): unknown {
            void offset;
            return name.getDataAddress();
          },
        },
        1,
      );
    } finally {
      name.dispose();
    }
  }
  /** Original first-insertion namespace semantics. @param prefix - Borrowed prefix. @param uri - Borrowed URI. @returns Nothing. */ registerNS(
    prefix: OUStringConstReference,
    uri: OUStringConstReference,
  ): void {
    emplace(this.m_nsmap, prefix, uri);
  }
  /** Original lookup/dereference precedes URI comparison; an absent prefix violates the native source precondition. @param prefix - Existing registered prefix. @param uri - Matching URI removes it. @returns Nothing. */ unregisterNS(
    prefix: OUStringConstReference,
    uri: OUStringConstReference,
  ): void {
    const name = key(prefix),
      entry = this.m_nsmap.get(name) as Namespace;
    if (entry.uri.equals(uri)) {
      this.m_nsmap.delete(name);
      entry.uri.dispose();
      entry.prefix.dispose();
    }
  }
  /** Original collected child declarations take precedence and do not overwrite registered prefixes. @param node - Actual namespace node. @returns Nothing. */ private collect(
    node: Reference<XNode>,
  ): void {
    const namespaces = new Map<string, Namespace>();
    try {
      lcl_collectNamespaces(namespaces, node);
      for (const [name, value] of [...namespaces].sort(
        /** Native std::map UTF16 order. @param a - First entry. @param b - Second entry. @returns Order. */ (
          a,
          b,
        ) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0),
      )) {
        void name;
        this.registerNS(value.prefix, value.uri);
      }
    } finally {
      freeNamespaces(namespaces.values());
    }
  }
  /** Original eval then node-list acquisition. @param node - Borrowed context. @param expression - Borrowed expression. @returns Acquired list. */ selectNodeList(
    node: Reference<XNode>,
    expression: OUStringConstReference,
  ): Reference<XNodeList> {
    const object = this.eval(node, expression);
    try {
      return object.operatorStar().getNodeList();
    } finally {
      object.dispose();
    }
  }
  /** Original namespace collection before select. @param node - Borrowed context. @param expression - Borrowed expression. @param namespaceNode - Borrowed namespace owner. @returns Acquired list. */ selectNodeListNS(
    node: Reference<XNode>,
    expression: OUStringConstReference,
    namespaceNode: Reference<XNode>,
  ): Reference<XNodeList> {
    this.collect(namespaceNode);
    return this.selectNodeList(node, expression);
  }
  /** Original first result, including empty result. @param node - Borrowed context. @param expression - Borrowed expression. @returns Acquired node. */ selectSingleNode(
    node: Reference<XNode>,
    expression: OUStringConstReference,
  ): Reference<XNode> {
    const list = this.selectNodeList(node, expression);
    try {
      return list.operatorStar().item(0);
    } finally {
      list.dispose();
    }
  }
  /** Original namespace collection before select. @param node - Borrowed context. @param expression - Borrowed expression. @param namespaceNode - Borrowed namespace owner. @returns Acquired node. */ selectSingleNodeNS(
    node: Reference<XNode>,
    expression: OUStringConstReference,
    namespaceNode: Reference<XNode>,
  ): Reference<XNode> {
    this.collect(namespaceNode);
    return this.selectSingleNode(node, expression);
  }
  /** Original native evaluation with independent namespace/extension snapshots and original global-error reset. @param node - Borrowed actual context. @param expression - Borrowed XPath. @returns Actual result. */
  eval(node: Reference<XNode>, expression: OUStringConstReference): Reference<XXPathObject> {
    if (!node.is()) {
      const message = domLiteral("xContextNode does not exist!"),
        context = new Reference();
      try {
        throw new RuntimeException(message, context);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
    const namespaces = new Map<string, Namespace>(),
      extensions: Reference<XXPathExtension>[] = [];
    try {
      for (const value of this.m_nsmap.values()) emplace(namespaces, value.prefix, value.uri);
      for (const extension of this.m_extensions) extensions.push(new Reference(extension));
      const owner = node.operatorStar().getOwnerDocument();
      try {
        if (!(owner.get() instanceof CDocument)) {
          const message = domLiteral(
              "Interface pointer for the owner document of the xContextNode does not exist.",
            ),
            context = new Reference();
          try {
            throw new RuntimeException(message, context);
          } finally {
            context.dispose();
            message.dispose();
          }
        }
        const component = node.get();
        if (!(component instanceof CNode)) {
          const message = domLiteral("xContextNode interface pointer does not exist."),
            context = new Reference();
          try {
            throw new RuntimeException(message, context);
          } finally {
            context.dispose();
            message.dispose();
          }
        }
        const pointer = component.GetNodePtr();
        if (!pointer) {
          const message = domLiteral("Node pointer for xContextNode does not exist."),
            context = new Reference();
          try {
            throw new RuntimeException(message, context);
          } finally {
            context.dispose();
            message.dispose();
          }
        }
        const m = getLibXml2(),
          doc = m._office_node_doc_get(pointer);
        if (!m._office_node_children_get(doc)) throw new XPathException();
        const context = m._xmlXPathNewContext(doc);
        try {
          if (!context) throw new XPathException();
          m._office_xpath_context_node_set(context, pointer);
          const diagnostics = errorFunctions();
          m._office_xpath_context_error_set(context, diagnostics[0]);
          m._office_xmlXPathSetGenericError(diagnostics[1]);
          for (const [name, value] of [...namespaces].sort(
            /** Native std::map key order. @param a - First entry. @param b - Second entry. @returns Order. */ (
              a,
              b,
            ) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0),
          )) {
            void name;
            withXmlStrings(
              [value.prefix, value.uri],
              /** Original native namespace registration ignores its status. @param prefix - Native prefix. @param uri - Native URI. @returns Native status. */ (
                prefix,
                uri,
              ) => m._xmlXPathRegisterNs(context, prefix, uri),
            );
          }
          for (const extension of extensions) {
            const handle = extension.operatorStar().getLibxml2ExtensionHandle();
            if (handle.functionLookupFunction !== 0n)
              m._xmlXPathRegisterFuncLookup(
                context,
                Number(BigInt.asIntN(32, handle.functionLookupFunction)),
                Number(BigInt.asIntN(32, handle.functionData)),
              );
            if (handle.variableLookupFunction !== 0n)
              m._xmlXPathRegisterVariableLookup(
                context,
                Number(BigInt.asIntN(32, handle.variableLookupFunction)),
                Number(BigInt.asIntN(32, handle.variableData)),
              );
          }
          const resultPointer = withXmlStrings(
              [expression],
              /** Original xmlXPathEval. @param value - Native expression. @returns Native result. */ (
                value,
              ) => m._xmlXPathEval(value, context),
            ),
            object = new XPathObjectReference(resultPointer);
          try {
            m._office_xmlXPathSetGenericError(0);
            if (!resultPointer) throw new XPathException();
            const document = new Reference(owner.get() as CDocument);
            try {
              return new Reference(new CXPathObject(document, object));
            } finally {
              document.dispose();
            }
          } finally {
            object.dispose();
          }
        } finally {
          if (context) m._xmlXPathFreeContext(context);
        }
      } finally {
        owner.dispose();
      }
    } finally {
      for (const extension of [...extensions].reverse()) extension.dispose();
      freeNamespaces(namespaces.values());
    }
  }
  /** Original namespace collection before evaluation. @param node - Borrowed context. @param expression - Borrowed expression. @param namespaceNode - Borrowed namespace owner. @returns Actual result. */ evalNS(
    node: Reference<XNode>,
    expression: OUStringConstReference,
    namespaceNode: Reference<XNode>,
  ): Reference<XXPathObject> {
    this.collect(namespaceNode);
    return this.eval(node, expression);
  }
  /** Original actual service-manager construction and throwing interface query. @param name - Borrowed service name. @returns Nothing. */ registerExtension(
    name: OUStringConstReference,
  ): void {
    const manager = this.m_xContext.operatorStar().getServiceManager();
    try {
      const root = manager.operatorStar().createInstanceWithContext(name, this.m_xContext);
      try {
        const extension = new Reference<XXPathExtension>(
          root,
          UNO_QUERY_THROW,
          XXPathExtension.static_type,
        );
        this.m_extensions.push(extension);
      } finally {
        root.dispose();
      }
    } finally {
      manager.dispose();
    }
  }
  /** Original nonempty extension check and acquired append. @param extension - Borrowed real extension. @returns Nothing. */ registerExtensionInstance(
    extension: Reference<XXPathExtension>,
  ): void {
    if (!extension.is()) {
      const message = domLiteral(
          "Extension instance xExtension to be used by XPath does not exist.",
        ),
        context = new Reference();
      try {
        throw new RuntimeException(message, context);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
    this.m_extensions.push(new Reference(extension));
  }
}
/** Original acquired component entrypoint. @param context - Borrowed context. @param args - Ignored original arguments. @returns Acquired component. */
export function unoxml_CXPathAPI_get_implementation(
  context: XComponentContext | null,
  args: Sequence<Any>,
): XInterface {
  void args;
  const owner = new Reference(context);
  try {
    return acquire(new CXPathAPI(owner));
  } finally {
    owner.dispose();
  }
}
