/** @fileoverview Actual native libxml2 SAX2 push callbacks and split UTF8 chunks in main/DOM-free Worker realms; no alternate parser, UNO provider or parser-option policy. */
import { getLibXml2, withXmlBytes } from "../../apps/office/src/external/libxml2/libxml2";
import { createFastParserCallbackBinding } from "../../apps/office/src/external/libxml2/fastparsercallbacks";
import { XML_ERR_OK } from "@vite-office/libxml2-wasm/constants";
/** Parses actual UTF8 C buffers, including a split inside a supplementary codepoint. @returns Only public callback/status observations. */
export function probeNativeFastParser() {
  const m = getLibXml2(),
    starts: (string | null)[][] = [],
    values: string[] = [],
    declarations: number[] = [],
    instructions: string[][] = [],
    characters: string[] = [];
  let ends = 0;
  const binding = createFastParserCallbackBinding({
      /** Reads names/values from the actual original SAX2 arrays. @param local - Local name. @param prefix - Prefix or NULL. @param uri - URI or NULL. @param namespaceCount - Pair count. @param namespaces - Native pairs. @param attributeCount - Record count. @param attributes - Native five-pointer records. @returns Nothing. */
      startElement(local, prefix, uri, namespaceCount, namespaces, attributeCount, attributes) {
        void namespaces;
        starts.push([
          m.UTF8ToString(local),
          prefix ? m.UTF8ToString(prefix) : null,
          uri ? m.UTF8ToString(uri) : null,
        ]);
        declarations.push(namespaceCount);
        for (let i = 0; i < attributeCount; ++i) {
          const address = attributes + i * 20,
            begin = m.getValue(address + 12, "*"),
            end = m.getValue(address + 16, "*");
          values.push(new TextDecoder().decode(m.HEAPU8.subarray(begin, end)));
        }
      },
      /** Counts actual closing callbacks. @returns Nothing. */ endElement() {
        ++ends;
      },
      /** Copies counted native bytes while the callback owns its input. @param pointer - Actual UTF8 bytes. @param count - Byte count. @returns Nothing. */
      characters(pointer, count) {
        characters.push(new TextDecoder().decode(m.HEAPU8.subarray(pointer, pointer + count)));
      },
      /** Retains actual native PI data. @param target - Target. @param data - Native data. @returns Nothing. */
      processingInstruction(target, data) {
        instructions.push([m.UTF8ToString(target), m.UTF8ToString(data)]);
      },
      /** Returns the genuine predefined C entity. @param name - Native name. @returns Actual native entity or NULL. */
      getEntity(name) {
        return m._xmlGetPredefinedEntity(name);
      },
    }),
    context = m._xmlCreatePushParserCtxt(binding.handler, binding.userData, 0, 0, 0);
  try {
    const bytes = new TextEncoder().encode(
        '<?keep native?><p:root xmlns:p="urn:push" p:v="Ω"><p:child>字&amp;😀</p:child></p:root>',
      ),
      middle = bytes.indexOf(0xf0) + 2,
      parts = [bytes.subarray(0, middle), bytes.subarray(middle)],
      statuses: number[] = [];
    for (const part of parts)
      statuses.push(
        withXmlBytes(
          part,
          /** Actual incremental C call, with source default options unchanged. @param pointer - Native bytes. @param count - Byte count. @returns Native status. */ (
            pointer,
            count,
          ) => m._xmlParseChunk(context, pointer, count, 0),
        ),
      );
    statuses.push(m._xmlParseChunk(context, 0, 0, 1));
    return {
      starts,
      values,
      declarations,
      instructions,
      characters: characters.join(""),
      ends,
      allChunksOk: statuses.every(
        /** Compares actual C statuses with the generated pinned header enum. @param value - Actual native result. @returns Success. */ (
          value,
        ) => value === XML_ERR_OK,
      ),
      line: m._xmlSAX2GetLineNumber(context),
    };
  } finally {
    const document = m._office_parser_doc_get(context);
    if (document !== 0) m._xmlFreeDoc(document);
    m._xmlFreeParserCtxt(context);
    binding.dispose();
  }
}
