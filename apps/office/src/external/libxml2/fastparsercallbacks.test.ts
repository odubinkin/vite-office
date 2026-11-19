/** @fileoverview Real C push-parser SAX2 arrays, Unicode, custom native entity and concurrent receiver scopes; no UNO/parser substitute or entity-option policy is introduced. */
import { expect, it } from "vitest";
import { initializeLibXml2, withXmlBytes, type LibXml2 } from "./libxml2";
import { createFastParserCallbackBinding, type FastParserCallbacks } from "./fastparsercallbacks";
import { XML_ERR_OK, XML_INTERNAL_GENERAL_ENTITY } from "@vite-office/libxml2-wasm/constants";

/** Captures only public C callback observations while pointers are still valid. @param m - Actual initialized native module. @returns Receiver and scalar observations. */
function observations(m: LibXml2) {
  const starts: {
      local: string;
      prefix: string | null;
      uri: string | null;
      namespaces: (string | null)[][];
      attributes: (string | null)[][];
    }[] = [],
    characters: string[] = [],
    instructions: (string | null)[][] = [],
    entities: string[] = [];
  let ends = 0;
  const custom = withXmlBytes(
    new TextEncoder().encode("custom"),
    /** Actual native entity declaration. @param name - Native name. @returns Native entity. */ (
      name,
    ) =>
      withXmlBytes(
        new TextEncoder().encode("replacement字"),
        /** Original source uses xmlNewEntity with no document or IDs. @param value - Native replacement. @returns Native entity. */ (
          value,
        ) => m._xmlNewEntity(0, name, XML_INTERNAL_GENERAL_ENTITY, 0, 0, value),
      ),
  );
  /** Decodes a native terminated pointer only for the fixture observations. @param pointer - Borrowed native string or NULL. @returns Exact observation. */
  function text(pointer: number): string | null {
    return pointer === 0 ? null : m.UTF8ToString(pointer);
  }
  const callbacks: FastParserCallbacks = {
    /** Reads original two-pointer namespace and five-pointer attribute records without retaining them after the callback. @param local - Native local name. @param prefix - Native prefix. @param uri - Native URI. @param namespaceCount - Pair count. @param namespaces - Actual pointer array. @param attributeCount - Record count. @param attributes - Actual pointer array. @returns Nothing. */
    startElement(local, prefix, uri, namespaceCount, namespaces, attributeCount, attributes) {
      const ns: (string | null)[][] = [],
        attrs: (string | null)[][] = [];
      for (let i = 0; i < namespaceCount; ++i)
        ns.push([
          text(m.getValue(namespaces + i * 8, "*")),
          text(m.getValue(namespaces + i * 8 + 4, "*")),
        ]);
      for (let i = 0; i < attributeCount; ++i) {
        const offset = attributes + i * 20,
          start = m.getValue(offset + 12, "*"),
          end = m.getValue(offset + 16, "*");
        attrs.push([
          text(m.getValue(offset, "*")),
          text(m.getValue(offset + 4, "*")),
          text(m.getValue(offset + 8, "*")),
          new TextDecoder().decode(m.HEAPU8.subarray(start, end)),
        ]);
      }
      starts.push({
        local: text(local) as string,
        prefix: text(prefix),
        uri: text(uri),
        namespaces: ns,
        attributes: attrs,
      });
    },
    /** Receives actual native closing callbacks. @returns Nothing. */ endElement() {
      ++ends;
    },
    /** Copies exact counted UTF8 callback bytes. @param pointer - Borrowed bytes. @param count - Byte count. @returns Nothing. */
    characters(pointer, count) {
      characters.push(new TextDecoder().decode(m.HEAPU8.subarray(pointer, pointer + count)));
    },
    /** Observes actual native processing instructions. @param target - Native target. @param data - Native data or NULL. @returns Nothing. */
    processingInstruction(target, data) {
      instructions.push([text(target), text(data)]);
    },
    /** Returns only actual native entities, matching source custom/predefined fallback shape. @param name - Native entity name. @returns Native xmlEntity pointer. */
    getEntity(name) {
      const value = text(name) as string;
      entities.push(value);
      return value === "custom" ? custom : m._xmlGetPredefinedEntity(name);
    },
  };
  return {
    callbacks,
    starts,
    characters,
    instructions,
    entities,
    /** Public fixture closing count. @returns Count. */ get ends() {
      return ends;
    },
    /** Releases the same actual native temporary entity as FastSaxParserImpl destruction. @returns Nothing. */
    dispose() {
      m._xmlUnlinkNode(custom);
      m._xmlFreeNode(custom);
    },
  };
}

/** Frees the actual parser-owned document before its C context, matching ParserCleanup. @param m - Native module. @param context - Actual push context. @returns Nothing. */
function freeParser(m: LibXml2, context: number): void {
  const document = m._office_parser_doc_get(context);
  if (document !== 0) m._xmlFreeDoc(document);
  m._xmlFreeParserCtxt(context);
}

it("transports actual SAX2 namespaces, five-pointer attributes, characters and native entity results", /** Uses the real C parser with its unchanged default options. @returns Completion. */ async () => {
  const m = await initializeLibXml2(),
    receiver = observations(m),
    binding = createFastParserCallbackBinding(receiver.callbacks);
  const first =
      '<?keep source?><p:root xmlns:p="urn:root" xmlns="urn:default" p:key="Ω" plain="A">\n',
    second = "<leaf>字&amp;é&custom;</leaf></p:root>";
  let context = 0;
  try {
    context = withXmlBytes(
      new TextEncoder().encode(first),
      /** Original first-chunk create API. @param pointer - Actual native bytes. @param length - Count. @returns Native parser. */ (
        pointer,
        length,
      ) => m._xmlCreatePushParserCtxt(binding.handler, binding.userData, pointer, length, 0),
    );
    expect(context).not.toBe(0);
    const status = withXmlBytes(
      new TextEncoder().encode(second),
      /** Actual remaining push chunk. @param pointer - Bytes. @param length - Count. @returns Native status. */ (
        pointer,
        length,
      ) => m._xmlParseChunk(context, pointer, length, 0),
    );
    expect(status).toBe(XML_ERR_OK);
    expect(m._xmlParseChunk(context, 0, 0, 1)).toBe(XML_ERR_OK);
    expect(receiver.starts).toEqual([
      {
        local: "root",
        prefix: "p",
        uri: "urn:root",
        namespaces: [
          ["p", "urn:root"],
          [null, "urn:default"],
        ],
        attributes: [
          ["key", "p", "urn:root", "Ω"],
          ["plain", null, null, "A"],
        ],
      },
      { local: "leaf", prefix: null, uri: "urn:default", namespaces: [], attributes: [] },
    ]);
    expect(receiver.characters.join("")).toBe("\n字&éreplacement字");
    expect(receiver.instructions).toEqual([["keep", "source"]]);
    expect(receiver.entities).toContain("custom");
    expect(receiver.ends).toBe(2);
    expect(m._xmlSAX2GetLineNumber(context)).toBe(2);
    expect(m._xmlSAX2GetColumnNumber(context)).toBeGreaterThan(1);
  } finally {
    if (context !== 0) freeParser(m, context);
    binding.dispose();
    receiver.dispose();
  }
});

it("keeps interleaved genuine C contexts distinct even for a reused receiver and released older scope", /** Static function table addresses never act as per-document ownership keys. @returns Completion. */ async () => {
  const m = await initializeLibXml2(),
    receiver = observations(m),
    first = createFastParserCallbackBinding(receiver.callbacks),
    second = createFastParserCallbackBinding(receiver.callbacks);
  let a = 0,
    b = 0;
  try {
    a = m._xmlCreatePushParserCtxt(first.handler, first.userData, 0, 0, 0);
    b = m._xmlCreatePushParserCtxt(second.handler, second.userData, 0, 0, 0);
    for (const [context, xml, done] of [
      [a, "<a/>", 1],
      [b, "<b>", 0],
    ] as const)
      expect(
        withXmlBytes(
          new TextEncoder().encode(xml),
          /** Real complete push document. @param pointer - Native bytes. @param count - Count. @returns Native status. */ (
            pointer,
            count,
          ) => m._xmlParseChunk(context, pointer, count, done),
        ),
      ).toBe(XML_ERR_OK);
    freeParser(m, a);
    a = 0;
    first.dispose();
    expect(
      withXmlBytes(
        new TextEncoder().encode("</b>"),
        /** The live younger binding must still receive real C callbacks after the older one is destroyed. @param pointer - Native closing bytes. @param count - Byte count. @returns Native status. */ (
          pointer,
          count,
        ) => m._xmlParseChunk(b, pointer, count, 1),
      ),
    ).toBe(XML_ERR_OK);
    expect(receiver.ends).toBe(2);
    expect(m._xmlSAX2GetLineNumber(b)).toBe(1);
    expect(
      receiver.starts.map(
        /** Observes only emitted local names. @param value - Actual callback result. @returns Local name. */ (
          value,
        ) => value.local,
      ),
    ).toEqual(["a", "b"]);
  } finally {
    if (a !== 0) {
      freeParser(m, a);
      first.dispose();
    }
    if (b !== 0) freeParser(m, b);
    second.dispose();
    receiver.dispose();
  }
});
