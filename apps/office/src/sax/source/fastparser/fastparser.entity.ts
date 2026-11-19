/** @fileoverview Original fastparser.cxx ParserData/Event/SaxContext and Entity consumer/first-exception ownership. Input and consumer state share one actual Entity; Native locator and partial parser ownership live in separate original owners; four native C producers live in FastSaxParserImpl; full stream/service and non-Emscripten event queues remain unported. */
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import { OString, type OStringConstReference } from "../../../sal/inc/rtl/string";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { withCaughtException } from "../../../cppu/inc/uno/exception-context";
import { getCaughtException } from "../../../cppuhelper/inc/exc_hlp";
import type { XFastDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XFastDocumentHandler";
import type { XFastContextHandler } from "../../../offapi/com/sun/star/xml/sax/XFastContextHandler";
import type { XFastNamespaceHandler } from "../../../offapi/com/sun/star/xml/sax/XFastNamespaceHandler";
import type { XErrorHandler } from "../../../offapi/com/sun/star/xml/sax/XErrorHandler";
import type { XFastAttributeList } from "../../../offapi/com/sun/star/xml/sax/XFastAttributeList";
import { FastTokenHandlerBase, FastAttributeList } from "../tools/fastattribs";
import { DONTKNOW } from "../../../offapi/com/sun/star/xml/sax/FastToken";
import { Attribute } from "../../../offapi/com/sun/star/xml/Attribute";
import type { SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { InputSource } from "../../../offapi/com/sun/star/xml/sax/InputSource";
import { XMLFile2UTFConverter } from "../expatwrap/xml2utf";
import { getLibXml2 } from "../../../external/libxml2/libxml2";
import { RTL_TEXTENCODING_ASCII_US } from "../../../sal/inc/rtl/textenc";
import { StringConcat } from "../../../sal/inc/rtl/stringconcat";
import { UnoType } from "../../../cppu/inc/unotype";
import {
  SAXParseException,
  cppu_detail_getUnoType as parseExceptionType,
} from "../../../offapi/com/sun/star/xml/sax/SAXParseException";
import type { FastLocatorImpl } from "./fastparser.locator";

/** Original lclGetErrorMessage reads actual native last-error bytes or its literal fallback and decodes ASCII_US, not UTF8. @param context - Actual parser context. @param systemId - Borrowed source ID view. @param line - Native signed32 source line. @returns Owned native diagnostic string. */
export function lclGetErrorMessage(
  context: number,
  systemId: OUStringConstReference,
  line: number,
): OUString {
  const m = getLibXml2(),
    error = m._xmlCtxtGetLastError(context),
    pointer = error === 0 ? 0 : m._office_error_message_get(error),
    fallback = new Uint8Array([117, 110, 107, 110, 111, 119, 110, 32, 101, 114, 114, 111, 114]),
    bytes =
      pointer !== 0
        ? new Uint8Array(m.HEAPU8.subarray(pointer, pointer + m._xmlStrlen(pointer)))
        : fallback,
    message = new OUString(bytes, bytes.length, RTL_TEXTENCODING_ASCII_US);
  try {
    let expression = OUString.Concat(new Uint8Array([91, 0]));
    expression = new StringConcat(expression, systemId);
    expression = new StringConcat(expression, new Uint8Array([32, 108, 105, 110, 101, 32, 0]));
    expression = new StringConcat(expression, OUString.number(line));
    expression = new StringConcat(expression, new Uint8Array([93, 58, 32, 0]));
    return new OUString(new StringConcat(expression, message));
  } finally {
    message.dispose();
  }
}

/** Exact source event discriminator declaration. Scalar event fields remain indeterminate until the producer initializes them. */
export enum CallbackType {
  START_ELEMENT,
  END_ELEMENT,
  CHARACTERS,
  PROCESSING_INSTRUCTION,
  DONE,
  EXCEPTION,
}
/** Original event value uses actual intrusive attribute references and Unicode owners. */
export class Event {
  declare maType: CallbackType;
  declare mnElementToken: number;
  readonly msNamespace = new OUString();
  readonly msElementName = new OUString();
  readonly mxAttributes = new RtlReference<FastAttributeList>();
  readonly mxDeclAttributes = new RtlReference<FastAttributeList>();
  readonly msChars = new OUString();
  /** Original implicit reverse member destruction. @returns Nothing. */
  dispose(): void {
    this.msChars.dispose();
    this.mxDeclAttributes.dispose();
    this.mxAttributes.dispose();
    this.msElementName.dispose();
    this.msNamespace.dispose();
  }
}
/** Original cached parser references and real copy construction, independent of future setter changes. */
export class ParserData {
  readonly mxDocumentHandler: Reference<XFastDocumentHandler>;
  readonly mxTokenHandler: RtlReference<FastTokenHandlerBase>;
  readonly mxErrorHandler: Reference<XErrorHandler>;
  readonly mxNamespaceHandler: Reference<XFastNamespaceHandler>;
  /** Original default/copy construction. @param source - Actual source cache or omitted default. @returns Owned parser data. */
  constructor(source?: ParserData) {
    this.mxDocumentHandler = source ? new Reference(source.mxDocumentHandler) : new Reference();
    this.mxTokenHandler = source ? new RtlReference(source.mxTokenHandler) : new RtlReference();
    this.mxErrorHandler = source ? new Reference(source.mxErrorHandler) : new Reference();
    this.mxNamespaceHandler = source ? new Reference(source.mxNamespaceHandler) : new Reference();
  }
  /** Original reverse reference destruction. @returns Nothing. */
  dispose(): void {
    this.mxNamespaceHandler.dispose();
    this.mxErrorHandler.dispose();
    this.mxTokenHandler.dispose();
    this.mxDocumentHandler.dispose();
  }
}
/** Original context value only copies namespace/name when its token is unknown. */
export class SaxContext {
  readonly mxContext = new Reference<XFastContextHandler>();
  readonly moNamespace: OUString | undefined;
  readonly moElementName: OUString | undefined;
  /** Original constructor retains the native token and optional strings. @param mnElementToken - Native token. @param namespace - Borrowed URI. @param name - Borrowed name. @returns Owned context. */
  constructor(
    readonly mnElementToken: number,
    namespace: OUStringConstReference,
    name: OUStringConstReference,
  ) {
    if (mnElementToken === DONTKNOW) {
      this.moNamespace = new OUString(namespace);
      this.moElementName = new OUString(name);
    }
  }
  /** Original optional fields and reference are destroyed in reverse declaration order. @returns Nothing. */
  dispose(): void {
    this.moElementName?.dispose();
    this.moNamespace?.dispose();
    this.mxContext.dispose();
  }
}

/** Original default namespace context value; native by-value parameters finish as owned member copies. */
export class NameWithToken {
  readonly msName: OUString;
  /** Original constructor. @param name - Borrowed input copied through its by-value operand. @param mnToken - Original namespace token. @returns Owned stack value. */
  constructor(
    name: OUStringConstReference,
    readonly mnToken: number,
  ) {
    this.msName = new OUString(name);
  }
  /** Original implicit member destruction. @returns Nothing. */
  dispose(): void {
    this.msName.dispose();
  }
}
/** Original prefix definition; default construction initializes only token=-1 and empty native string members. */
export class NamespaceDefine {
  readonly maPrefix: OString;
  readonly mnToken: number;
  readonly maNamespaceURL: OUString;
  /** Original default/all-field constructors. @param args - Original selected operands. @returns Owned definition. */
  constructor(
    ...args: [] | [prefix: OStringConstReference, token: number, uri: OUStringConstReference]
  ) {
    this.maPrefix = args.length === 0 ? new OString() : new OString(args[0]);
    this.mnToken = args.length === 0 ? -1 : args[1];
    this.maNamespaceURL = args.length === 0 ? new OUString() : new OUString(args[2]);
  }
  /** Original implicit reverse member destruction. @returns Nothing. */
  dispose(): void {
    this.maNamespaceURL.dispose();
    this.maPrefix.dispose();
  }
}

/** Original Entity context consumer shares the same actual copied ParserData; actual source input/converter/event fields are shared with the existing host backend; native locator and partial parser ownership are separate; native C producers live in FastSaxParserImpl; full stream/service execution remains unfinished. */
export class Entity extends ParserData {
  readonly maSharedEvent = new Event();
  mbEnableThreads = false;
  readonly maStructSource = new InputSource();
  mpParser = 0;
  readonly maConverter = new XMLFile2UTFConverter();
  readonly maSavedException = new Any();
  readonly maNamespaceStack: NameWithToken[] = [];
  private readonly maContextStack: SaxContext[] = [];
  readonly maNamespaceCount: number[] = [];
  readonly maNamespaceDefines: NamespaceDefine[] = [];
  /** Original Entity construction copies its parser configuration. @param source - Actual parser data. @returns Consumer state. */
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor -- Original Entity requires the copy operand; inheriting the optional ParserData constructor would change its contract.
  constructor(source: ParserData) {
    super(source);
  }
  /** Lowers the native catch/getCaughtException scope and destruction of its actual exception value. Non-UNO host exceptions remain outside the linked UNO ABI. @param error - Actual caught value. @returns Nothing. */
  private capture(error: unknown): void {
    if (!(error instanceof Exception)) throw error;
    try {
      const caught = withCaughtException(error, getCaughtException);
      try {
        this.saveException(caught);
      } finally {
        caught.dispose();
      }
    } finally {
      error.dispose();
    }
  }
  /** Original start dispatch pushes a frame before callbacks and skips descendants of a null context. @param event - Actual initialized source event. @returns Nothing. */
  startElement(event: Event): void {
    let parent: XFastContextHandler | null = null;
    if (this.maContextStack.length !== 0) {
      parent = (this.maContextStack.at(-1) as SaxContext).mxContext.get();
      if (parent === null) {
        this.maContextStack.push(
          new SaxContext(event.mnElementToken, event.msNamespace, event.msElementName),
        );
        return;
      }
    }
    this.maContextStack.push(
      new SaxContext(event.mnElementToken, event.msNamespace, event.msElementName),
    );
    try {
      const attributes = new Reference<XFastAttributeList>(event.mxAttributes.get()),
        context = new Reference<XFastContextHandler>();
      try {
        if (this.mxNamespaceHandler.is()) {
          const declarations = event.mxDeclAttributes.operatorArrow().getUnknownAttributes();
          try {
            const data = declarations.getConstArray() as SequenceElements;
            for (let i = 0; i < declarations.getLength(); ++i) {
              const declaration = Attribute.unacquired(data.get(i * 24) as SequenceElements);
              this.mxNamespaceHandler
                .operatorStar()
                .registerNamespace(declaration.Name, declaration.Value);
            }
          } finally {
            declarations.dispose();
          }
        }
        if (event.mnElementToken === DONTKNOW) {
          let created: Reference<XFastContextHandler> | undefined;
          if (parent !== null)
            created = parent.createUnknownChildContext(
              event.msNamespace,
              event.msElementName,
              attributes,
            );
          else if (this.mxDocumentHandler.is())
            created = this.mxDocumentHandler
              .operatorStar()
              .createUnknownChildContext(event.msNamespace, event.msElementName, attributes);
          if (created !== undefined) {
            try {
              context.moveAssign(created);
            } finally {
              created.dispose();
            }
          }
          if (context.is())
            context
              .operatorStar()
              .startUnknownElement(event.msNamespace, event.msElementName, attributes);
        } else {
          let created: Reference<XFastContextHandler> | undefined;
          if (parent !== null)
            created = parent.createFastChildContext(event.mnElementToken, attributes);
          else if (this.mxDocumentHandler.is())
            created = this.mxDocumentHandler
              .operatorStar()
              .createFastChildContext(event.mnElementToken, attributes);
          if (created !== undefined) {
            try {
              context.moveAssign(created);
            } finally {
              created.dispose();
            }
          }
          if (context.is())
            context.operatorStar().startFastElement(event.mnElementToken, attributes);
        }
        (this.maContextStack.at(-1) as SaxContext).mxContext.moveAssign(context);
      } finally {
        context.dispose();
        attributes.dispose();
      }
    } catch (error) {
      this.capture(error);
    }
  }
  /** Original text outside a context or below a null context is ignored. @param text - Borrowed Unicode. @returns Nothing. */
  characters(text: OUStringConstReference): void {
    if (this.maContextStack.length === 0) return;
    const context = (this.maContextStack.at(-1) as SaxContext).mxContext.get();
    if (context !== null)
      try {
        context.characters(text);
      } catch (error) {
        this.capture(error);
      }
  }
  /** Original closing dispatch captures an exception before popping/destroying its context. @returns Nothing. */
  endElement(): void {
    if (this.maContextStack.length === 0) return;
    const frame = this.maContextStack.at(-1) as SaxContext,
      context = frame.mxContext.get();
    if (context !== null)
      try {
        if (frame.mnElementToken !== DONTKNOW) context.endFastElement(frame.mnElementToken);
        else
          context.endUnknownElement(frame.moNamespace as OUString, frame.moElementName as OUString);
      } catch (error) {
        this.capture(error);
      }
    (this.maContextStack.pop() as SaxContext).dispose();
  }
  /** Original document-level instruction routing also captures callback failures. @param target - Borrowed target. @param data - Borrowed data. @returns Nothing. */
  processingInstruction(target: OUStringConstReference, data: OUStringConstReference): void {
    if (this.mxDocumentHandler.is())
      try {
        this.mxDocumentHandler.operatorStar().processingInstruction(target, data);
      } catch (error) {
        this.capture(error);
      }
  }
  /** Original first-exception rule; logging and physical native mutex behavior remain unqualified. @param error - Borrowed actual caught Any. @returns Nothing. */
  saveException(error: Any): void {
    if (!this.maSavedException.hasValue()) this.maSavedException.assign(error);
  }
  /** Original saved-exception query. @returns Presence. */
  hasException(): boolean {
    return this.maSavedException.hasValue();
  }
  /** Original source error construction, fatal callback selection and unconditional throw. Actual Any construction flattens an Any operand through the shared CPPU owner, as upstream does. @param locator - Actual native locator. @param duringParse - Original producer phase. @returns Never. */
  throwException(locator: RtlReference<FastLocatorImpl>, duringParse: boolean): never {
    const saved = new Any();
    let exception: SAXParseException;
    try {
      if (this.maSavedException.hasValue())
        saved.setValue(this.maSavedException, UnoType.get("Any"));
      const temporaries: { dispose(): void }[] = [];
      /** Compiler temporary lifetime binding; every result is the actual original native owner. @param value - Actual return temporary. @returns Same owner. */
      function temporary<T extends { dispose(): void }>(value: T): T {
        temporaries.push(value);
        return value;
      }
      try {
        const source = temporary(locator.operatorArrow().getSystemId()),
          message = temporary(
            lclGetErrorMessage(this.mpParser, source, locator.operatorArrow().getLineNumber()),
          ),
          context = temporary(new Reference()),
          publicId = temporary(locator.operatorArrow().getPublicId()),
          systemId = temporary(locator.operatorArrow().getSystemId());
        exception = new SAXParseException(
          message,
          context,
          saved,
          publicId,
          systemId,
          locator.operatorArrow().getLineNumber(),
          locator.operatorArrow().getColumnNumber(),
        );
      } finally {
        while (temporaries.length !== 0) (temporaries.pop() as { dispose(): void }).dispose();
      }
    } finally {
      saved.dispose();
    }
    let transferred = false;
    try {
      if (!duringParse || !this.mbEnableThreads) {
        if (this.mxErrorHandler.is()) {
          const value = new Any(exception, parseExceptionType);
          try {
            this.mxErrorHandler.operatorStar().fatalError(value);
          } finally {
            value.dispose();
          }
        }
      }
      transferred = true;
      throw exception;
    } finally {
      if (!transferred) exception.dispose();
    }
  }
  /** Original represented context/Any members are destroyed before copied ParserData. @returns Nothing. */
  override dispose(): void {
    for (let index = this.maNamespaceDefines.length; index-- !== 0;)
      (this.maNamespaceDefines[index] as NamespaceDefine).dispose();
    while (this.maContextStack.length !== 0) (this.maContextStack.pop() as SaxContext).dispose();
    while (this.maNamespaceStack.length !== 0)
      (this.maNamespaceStack.pop() as NameWithToken).dispose();
    this.maSavedException.dispose();
    this.maConverter.dispose();
    this.maStructSource.dispose();
    this.maSharedEvent.dispose();
    super.dispose();
  }
}
