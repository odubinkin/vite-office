/** @fileoverview Original FastParser SAX2 function-pointer ABI over genuine C contexts; scoped opaque void* handles bind actual JavaScript receivers before xmlCreatePushParserCtxt can invoke its first callback. No parser policy or alternate event/document owner. */
import { getLibXml2 } from "./libxml2";

/** Actual FastSaxParserImpl callback bodies; names, arrays and counts remain borrowed native addresses. */
export interface FastParserCallbacks {
  /** Original callbackStartElement receives original libxml2 SAX2 arrays. @param localName - Terminated local name. @param prefix - Terminated prefix or NULL. @param uri - Terminated namespace URI or NULL. @param namespaceCount - Pair count. @param namespaces - Prefix/URI pointer pairs. @param attributeCount - Attribute count. @param attributes - Original five-pointer attribute records. @returns Nothing. */
  startElement(
    localName: number,
    prefix: number,
    uri: number,
    namespaceCount: number,
    namespaces: number,
    attributeCount: number,
    attributes: number,
  ): void;
  /** Original callbackEndElement ignores libxml2's three name operands. @returns Nothing. */
  endElement(): void;
  /** Original counted character callback. @param text - Borrowed UTF8 bytes. @param length - Byte count. @returns Nothing. */
  characters(text: number, length: number): void;
  /** Original processing-instruction callback. @param target - Terminated target. @param data - Terminated data or NULL. @returns Nothing. */
  processingInstruction(target: number, data: number): void;
  /** Original entity callback returns an actual native xmlEntity pointer. @param name - Terminated native name. @returns Native entity or NULL. */
  getEntity(name: number): number;
}

const bindings = new Map<number, FastParserCallbacks>();
let handler: number | undefined;
/** Installs the five source C callbacks in the actual static SAX2 aggregate once per native module lifetime. @returns Native handler address. */
function staticHandler(): number {
  if (handler === undefined) {
    const m = getLibXml2(),
      start = m.addFunction(
        /** Original C entry forwards the opaque this handle and erases only the unused defaulted-attribute count. @param context - Actual opaque receiver address. @param local - Local name. @param prefix - Prefix or NULL. @param uri - URI or NULL. @param namespaceCount - Namespace pair count. @param namespaces - Original pointer array. @param attributeCount - Attribute count. @param defaulted - Unused source operand. @param attributes - Original attribute pointer array. @returns Nothing. */
        (
          context: number,
          local: number,
          prefix: number,
          uri: number,
          namespaceCount: number,
          namespaces: number,
          attributeCount: number,
          defaulted: number,
          attributes: number,
        ) => {
          void defaulted;
          (bindings.get(context) as FastParserCallbacks).startElement(
            local,
            prefix,
            uri,
            namespaceCount,
            namespaces,
            attributeCount,
            attributes,
          );
        },
        "viiiiiiiii",
      ),
      end = m.addFunction(
        /** Original C end entry ignores all name operands. @param context - Receiver address. @param local - Unused local name. @param prefix - Unused prefix. @param uri - Unused URI. @returns Nothing. */
        (context: number, local: number, prefix: number, uri: number) => {
          void local;
          void prefix;
          void uri;
          (bindings.get(context) as FastParserCallbacks).endElement();
        },
        "viiii",
      ),
      characters = m.addFunction(
        /** Original counted byte callback. @param context - Receiver address. @param text - Borrowed bytes. @param length - Native count. @returns Nothing. */
        (context: number, text: number, length: number) =>
          (bindings.get(context) as FastParserCallbacks).characters(text, length),
        "viii",
      ),
      instruction = m.addFunction(
        /** Original PI callback. @param context - Receiver address. @param target - Native target. @param data - Native data or NULL. @returns Nothing. */
        (context: number, target: number, data: number) =>
          (bindings.get(context) as FastParserCallbacks).processingInstruction(target, data),
        "viii",
      ),
      entity = m.addFunction(
        /** Original native entity result is returned without substituting host expansion data. @param context - Receiver address. @param name - Native entity name. @returns Native entity pointer. */
        (context: number, name: number) =>
          (bindings.get(context) as FastParserCallbacks).getEntity(name),
        "iii",
      );
    handler = m._office_xmlFastParserCallbacks(start, end, characters, instruction, entity);
  }
  return handler;
}

/** Original compiler-owned void* binding remains live through parser destruction, including first-chunk callbacks before the parser result is assigned. The actual callback body must follow the source saved-exception policy; this ABI layer does not catch or rewrite exceptions. @param callbacks - Actual receiver methods. @returns Native handler/opaque address scope. */
export function createFastParserCallbackBinding(callbacks: FastParserCallbacks): {
  handler: number;
  userData: number;
  dispose(): void;
} {
  const m = getLibXml2(),
    sax = staticHandler(),
    userData = m._malloc(1);
  bindings.set(userData, callbacks);
  return {
    handler: sax,
    userData,
    /** Releases the opaque address after all native contexts using it have been destroyed. @returns Nothing. */
    dispose(): void {
      bindings.delete(userData);
      m._free(userData);
    },
  };
}
