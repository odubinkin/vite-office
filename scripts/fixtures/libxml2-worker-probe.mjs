/** @fileoverview Exercises actual pinned native C DOM semantics in Node and a real module Worker; no UNO node substitute or parallel XML model is supplied. */
import { initializeLibXml2 } from "../../apps/office/src/external/libxml2/libxml2.ts";

/** Runs source-relevant native tree, namespace and IO operations on actual C allocations. @returns Native observations. */
export async function runNativeXmlProbe() {
  const m = await initializeLibXml2();
  m._xmlInitParser();
  const docs = [],
    detached = [],
    callbacks = [],
    strings = [];
  /** Owns fixture UTF8 buffers until native consumers and documents have been released. @param value - Fixture text. @returns Native C string address. */
  function str(value) {
    const length = m.lengthBytesUTF8(value),
      pointer = m._malloc(length + 1);
    strings.push(pointer);
    m.stringToUTF8(value, pointer, length + 1);
    return pointer;
  }
  /** Copies and releases the native xmlNodeGetContent result. @param node - Native node pointer. @returns Decoded content. */
  function content(node) {
    const pointer = m._xmlNodeGetContent(node);
    try {
      return m.UTF8ToString(pointer);
    } finally {
      m._office_xmlFree(pointer);
    }
  }
  /** Serializes through the actual libxml2 output-buffer callbacks. @param doc - Native document. @returns XML and callback observations. */
  function save(doc) {
    const chunks = [];
    let closes = 0;
    const write = m.addFunction(
      /** Copies bytes before libxml2 reuses its buffer. @param context - Native IO context. @param pointer - Borrowed byte address. @param length - Byte count. @returns Consumed bytes. */
      (context, pointer, length) => {
        void context;
        chunks.push(m.HEAPU8.slice(pointer, pointer + length));
        return length;
      },
      "iiii",
    );
    const close = m.addFunction(
      /** Observes native buffer finalization. @param context - Native IO context. @returns Success. */
      (context) => {
        void context;
        ++closes;
        return 0;
      },
      "ii",
    );
    callbacks.push(write, close);
    const output = m._xmlOutputBufferCreateIO(write, close, 0, 0);
    const written = m._xmlSaveFileTo(output, doc, 0);
    const bytes = new Uint8Array(
      chunks.reduce(
        /** Totals native byte chunks. @param count - Prior total. @param chunk - Copied bytes. @returns New total. */
        (count, chunk) => count + chunk.length,
        0,
      ),
    );
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    return { xml: new TextDecoder().decode(bytes), written, closes };
  }
  try {
    const doc = m._xmlNewDoc(str("1.0"));
    docs.push(doc);
    const root = m._xmlNewDocNode(doc, 0, str("root"), 0);
    m._xmlDocSetRootElement(doc, root);
    const ns = m._xmlNewNs(root, str("urn:meta:fixture"), str("p"));
    m._xmlSetNs(root, ns);
    const child = m._xmlNewDocNode(doc, ns, str("item"), 0);
    m._xmlAddChild(root, child);
    const attr = m._xmlNewNsProp(child, ns, str("value"), str("字 & < >"));
    const attrText = m._office_node_children_get(attr);
    const attributeTree =
      m._office_node_type_get(attrText) === 3 &&
      m._office_node_parent_get(attrText) === attr &&
      m._office_node_doc_get(attrText) === doc;
    m._xmlNodeSetContent(attrText, str("changed & 字"));
    const attributeContent = content(attr);
    const textA = m._xmlNewDocText(doc, str("a"));
    m._xmlAddChild(child, textA);
    const textB = m._xmlNewDocText(doc, str("b"));
    const merged = m._xmlAddChild(child, textB);
    const textCoalescing = merged === textA && merged !== textB && content(merged) === "ab";
    const prefix = m._office_ns_prefix_get(ns);
    m._office_ns_prefix_set(ns, m._xmlStrdup(str("q")));
    m._office_xmlFree(prefix);
    const sharedNamespace =
      m._office_node_ns_get(root) === ns &&
      m._office_node_ns_get(child) === ns &&
      m._office_node_ns_get(attr) === ns &&
      m.UTF8ToString(m._office_ns_prefix_get(m._office_node_ns_get(child))) === "q";
    const clone = m._xmlCopyNode(child, 1);
    detached.push(clone);
    const copiedContent = content(clone);
    const cloneDocNull = m._office_node_doc_get(clone) === 0;
    const pi = m._xmlNewDocPI(doc, str("keep"), str("x"));
    m._xmlAddChild(root, pi);
    m._xmlAddChild(root, m._xmlNewDocComment(doc, str("comment 字")));
    m._xmlAddChild(
      root,
      m._xmlNewCDataBlock(doc, str("one<two&三"), m.lengthBytesUTF8("one<two&三")),
    );
    const serialized = save(doc);
    const reopened = m._xmlReadMemory(
      str(serialized.xml),
      m.lengthBytesUTF8(serialized.xml),
      0,
      0,
      0,
    );
    docs.push(reopened);
    const reopenedRoot = m._xmlDocGetRootElement(reopened);
    const reopenedChild = m._office_node_children_get(reopenedRoot);
    const reopenedAttr = m._xmlHasNsProp(reopenedChild, str("value"), str("urn:meta:fixture"));
    const roundtrip =
      reopened !== 0 &&
      content(reopenedAttr) === "changed & 字" &&
      serialized.xml.includes("<q:root") &&
      serialized.xml.includes("<?keep x?>") &&
      serialized.xml.includes("<!--comment 字-->") &&
      serialized.xml.includes("<![CDATA[one<two&三]]>");
    const utf16Text = '<?xml version="1.0" encoding="UTF-16"?><root>字</root>';
    const utf16 = new Uint8Array(2 + utf16Text.length * 2);
    utf16.set([0xff, 0xfe]);
    for (let i = 0; i < utf16Text.length; ++i) {
      const unit = utf16Text.charCodeAt(i);
      utf16[2 + i * 2] = unit & 0xff;
      utf16[3 + i * 2] = unit >>> 8;
    }
    const utf16Pointer = m._malloc(utf16.length);
    strings.push(utf16Pointer);
    m.HEAPU8.set(utf16, utf16Pointer);
    const utf16Document = m._xmlReadMemory(utf16Pointer, utf16.length, 0, 0, 0);
    docs.push(utf16Document);
    const countedUtf16 =
      utf16Document !== 0 && content(m._xmlDocGetRootElement(utf16Document)) === "字";
    const initialHeapSize = m.HEAPU8.length;
    const largeBuffer = m._malloc(initialHeapSize + 4096);
    let heapGrowth;
    try {
      m.HEAPU8[largeBuffer] = 42;
      heapGrowth =
        m.HEAPU8.length > initialHeapSize &&
        m.HEAPU8[largeBuffer] === 42 &&
        content(attr) === "changed & 字";
    } finally {
      m._free(largeBuffer);
    }
    const bad = m._xmlReadMemory(
      str("<root><bad></root>"),
      m.lengthBytesUTF8("<root><bad></root>"),
      0,
      0,
      0,
    );
    if (bad) docs.push(bad);
    return {
      version: m.UTF8ToString(m._office_xmlVersion()),
      globals: { window: typeof window, document: typeof document, DOMParser: typeof DOMParser },
      attributeTree,
      attributeContent,
      textCoalescing,
      sharedNamespace,
      copiedContent,
      cloneDocNull,
      countedUtf16,
      heapGrowth,
      roundtrip,
      rejected: bad === 0,
      ioClosedOnce: serialized.closes === 1,
      byteCountMatches: serialized.written === new TextEncoder().encode(serialized.xml).length,
    };
  } finally {
    for (const node of detached) m._xmlFreeNode(node);
    for (let i = docs.length - 1; i >= 0; --i) m._xmlFreeDoc(docs[i]);
    for (const callback of callbacks) m.removeFunction(callback);
    for (const pointer of strings) m._free(pointer);
  }
}

if (
  typeof globalThis.WorkerGlobalScope !== "undefined" &&
  self instanceof globalThis.WorkerGlobalScope
) {
  runNativeXmlProbe().then(
    /** Publishes actual native results from the worker. @param result - Observations. @returns Nothing. */
    (result) => self.postMessage(result),
    /** Turns a native probe failure into an observable worker error. @param error - Actual error. @returns Nothing. */
    (error) => {
      throw error;
    },
  );
}
