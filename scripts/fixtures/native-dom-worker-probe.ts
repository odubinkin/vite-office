/** @fileoverview Real native UNO document, parser callback, IO and live-list operations without a host DOM; the pending DocumentBuilder service is not replaced or advertised. */
import { initializeLibXml2 } from "../../apps/office/src/external/libxml2/libxml2";
import { installParserCallbacks } from "../../apps/office/src/external/libxml2/parsercallbacks";
import { Reference } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Reference";
import {
  Sequence,
  type SequenceElements,
} from "../../apps/office/src/cppu/inc/com/sun/star/uno/Sequence";
import { SequenceInputStream } from "../../apps/office/src/comphelper/source/streaming/seqstream";
import { CDocument } from "../../apps/office/src/unoxml/source/dom/document";
import {
  context_t,
  nativeIoContext,
} from "../../apps/office/src/unoxml/source/dom/documentbuilder.io";
import { parserException } from "../../apps/office/src/unoxml/source/dom/documentbuilder.errors";
import { domLiteral } from "../../apps/office/src/unoxml/source/dom/node";
import { warningTestFile } from "../../apps/office/src/test/native-builder-fixtures";
import type { OUString } from "../../apps/office/src/sal/inc/rtl/ustring";
import { implementations } from "../../apps/office/src/desktop/browser/app/uno-components";
import { InitApplicationServiceManager } from "../../apps/office/src/desktop/source/app/appinit";
import { getProcessComponentContext } from "../../apps/office/src/comphelper/inc/processfactory";
import { Converter } from "../../apps/office/src/udkapi/com/sun/star/script/Converter";
import type { XComponentContext } from "../../apps/office/src/udkapi/com/sun/star/uno/XComponentContext";
import { PropertyValueSet } from "../../apps/office/src/ucbhelper/inc/propertyvalueset";
import { Any } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Any";
import { UnoType } from "../../apps/office/src/cppu/inc/unotype";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);

/** Executes genuine graph operations in whichever browser realm invokes it. @returns Structured-clone-safe observations, with no native pointer crossing a realm boundary. */
export async function runNativeDomWorkerProbe() {
  const m = await initializeLibXml2(),
    owned: { dispose(): void }[] = [];
  /** Retains one actual source result to deterministic scope exit. @param value - Actual owner. @returns Same owner. */
  function own<T extends { dispose(): void }>(value: T): T {
    owned.push(value);
    return value;
  }
  /** Source literal value binding. @param value - Fixture text. @returns Actual owned RTL value. */
  function u(value: string) {
    return own(domLiteral(value));
  }
  /** Consumes an actual owned API string. @param value - Actual result. @returns Fixture text. */
  function take(value: OUString): string {
    try {
      return String.fromCharCode(...value.getStr().subarray(0, value.getLength()));
    } finally {
      value.dispose();
    }
  }
  InitApplicationServiceManager(implementations);
  const processContext = getProcessComponentContext() as Reference<XComponentContext>,
    converter = own(Converter.create(processContext)),
    row = own(new Reference(new PropertyValueSet(processContext))),
    rowApi = row.operatorStar(),
    source = own(new Any(u("42").getDataAddress(), "OUString")),
    converted = own(converter.operatorStar().convertTo(source, UnoType.get("sal_Int32"))),
    scalar: [number] = [0];
  if (!converted.extract(scalar, "sal_Int32"))
    throw new Error("Registered converter returned wrong type");
  rowApi.appendString(u("number"), u("42"));
  rowApi.appendString(u("bad"), u("not-a-number"));
  const rowValue = rowApi.getInt(1),
    rowWasNull = rowApi.wasNull();
  const failedFirst = rowApi.getInt(2),
    failedFirstWasNull = rowApi.wasNull();
  const failedSecond = rowApi.getInt(2),
    failedSecondWasNull = rowApi.wasNull();
  const conversion = {
    serviceValue: scalar[0],
    rowValue,
    rowWasNull,
    failedFirst,
    failedFirstWasNull,
    failedSecond,
    failedSecondWasNull,
  };
  const bytes = new TextEncoder().encode(warningTestFile),
    data = own(new Bytes(bytes.length)),
    cells = data.getArray() as SequenceElements;
  for (let i = 0; i < bytes.length; ++i)
    (cells.get(i) as [number])[0] = ((bytes[i] as number) << 24) >> 24;
  const input = own(new Reference(new SequenceInputStream(data))),
    io = new context_t(),
    context = m._xmlNewParserCtxt();
  io.rInputStream.assign(input);
  io.close = false;
  io.freeOnClose = false;
  let warnings = 0,
    errors = 0,
    warningLine = 0;
  const native = nativeIoContext(io),
    callbacks = installParserCallbacks(context, {
      /** Counts the actual native error callback. @param parser - Native parser. @returns Nothing. */
      error(parser) {
        const error = parserException(parser);
        try {
          ++errors;
        } finally {
          error.dispose();
        }
      },
      /** Reads real generated UNO exception fields from native parser diagnostics. @param parser - Native parser. @returns Nothing. */
      warning(parser) {
        const error = parserException(parser);
        try {
          ++warnings;
          warningLine = error.LineNumber;
        } finally {
          error.dispose();
        }
      },
      /** No resolver is needed by the original warning fixture. @param parser - Actual parser. @param publicId - Native ID. @param systemId - Native ID. @returns Never. */
      resolveEntity(parser, publicId, systemId): never {
        throw new Error(`Unexpected native entity request: ${parser}/${publicId}/${systemId}`);
      },
    });
  let document: Reference<CDocument>;
  try {
    const pointer = m._xmlCtxtReadIO(context, native.read, native.close, native.address, 0, 0, 0);
    if (!pointer) throw new Error("Native probe XML did not parse");
    document = own(CDocument.CreateCDocument(pointer));
  } finally {
    m._xmlFreeParserCtxt(context);
    callbacks.dispose();
    io.dispose();
  }
  try {
    const doc = document.get() as CDocument,
      rootRef = own(doc.getDocumentElement()),
      root = rootRef.get();
    if (!root) throw new Error("Native document has no element");
    const listRef = own(root.getElementsByTagName(u("worker-child"))),
      list = listRef.get();
    if (!list) throw new Error("Native list is missing");
    const before = list.getLength(),
      child = own(doc.createElement(u("worker-child")));
    own(root.appendChild(child));
    const afterAppend = list.getLength(),
      first = own(list.item(0)),
      owner = own(first.get()?.getOwnerDocument() as ReturnType<CDocument["getOwnerDocument"]>);
    const sameOwner = owner.get() === doc;
    own(root.removeChild(child));
    const afterRemove = list.getLength(),
      text = own(doc.createTextNode(u("😀字")));
    const element = child.get();
    if (!element) throw new Error("Native child is missing");
    own(element.appendChild(text));
    return {
      conversion,
      globals: {
        window: typeof window,
        document: typeof globalThis.document,
        DOMParser: typeof DOMParser,
      },
      rootName: take(root.getNodeName()),
      attribute: take(
        root.getAttributeNS(u("urn:oasis:names:tc:opendocument:xmlns:office:1.0"), u("version")),
      ),
      listCounts: [before, afterAppend, afterRemove],
      sameOwner,
      unicode: take(text.get()?.getData() as OUString),
      utf16Length: text.get()?.getLength(),
      borrowedStreamOpen: input.get()?.available() === 0,
      warnings,
      errors,
      warningLine,
    };
  } finally {
    while (owned.length) (owned.pop() as { dispose(): void }).dispose();
  }
}
