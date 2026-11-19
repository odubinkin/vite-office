/** @fileoverview Original SaxLegacyFastParser UNO wrapper, initialization dispatch and acquired factory over the actual registered FastParser. */
import { NamespaceHandler, CallbackDocumentHandler } from "./legacyfastparser.handlers";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { acquire } from "../../../cppuhelper/inc/weak";
import { supportsService } from "../../../cppuhelper/inc/supportsservice";
import { FastParser } from "../../../offapi/com/sun/star/xml/sax/FastParser";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { XInitialization } from "../../../udkapi/com/sun/star/lang/XInitialization";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { XParser } from "../../../offapi/com/sun/star/xml/sax/XParser";
import { XFastTokenHandler } from "../../../offapi/com/sun/star/xml/sax/XFastTokenHandler";
import type { XFastParser } from "../../../offapi/com/sun/star/xml/sax/XFastParser";
import type { XDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XDocumentHandler";
import type { XDTDHandler } from "../../../offapi/com/sun/star/xml/sax/XDTDHandler";
import type { XEntityResolver } from "../../../offapi/com/sun/star/xml/sax/XEntityResolver";
import type { XErrorHandler } from "../../../offapi/com/sun/star/xml/sax/XErrorHandler";
import type { InputSource } from "../../../offapi/com/sun/star/xml/sax/InputSource";
import type { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import {
  PairStringLong,
  cppu_detail_getUnoType_PairStringLong,
} from "../../../udkapi/com/sun/star/beans/Pair";
/** Compiler-known original source literal. @param value - ASCII literal. @returns Owned RTL string. */
function literal(value: string): OUString {
  return new OUString(
    Uint8Array.from(
      value + "\0",
      /** Literal byte. @param c - Character. @returns Byte. */ (c) => c.charCodeAt(0),
    ),
  );
}
/** Original ordered XInitialization/XServiceInfo/XParser helper and member lifetimes. */
export class SaxLegacyFastParser
  extends WeakImplHelper.specialize(XInitialization, XServiceInfo, XParser)
  implements XInitialization, XServiceInfo, XParser
{
  private readonly m_aNamespaceHandler = new RtlReference(new NamespaceHandler());
  private readonly m_xParser: Reference<XFastParser>;
  private readonly m_xDocumentHandler = new Reference<XDocumentHandler>();
  private readonly m_xTokenHandler = new Reference<XFastTokenHandler>();
  /** Original process-context FastParser service construction and namespace handler assignment. @returns Native component. */
  constructor() {
    super();
    let parser: Reference<XFastParser> | undefined;
    try {
      parser = FastParser.create(getProcessComponentContext());
      this.m_xParser = parser;
      const namespaces = new Reference(this.m_aNamespaceHandler.get());
      try {
        parser.operatorStar().setNamespaceHandler(namespaces);
      } finally {
        namespaces.dispose();
      }
    } catch (error) {
      // Original C++ constructed-member unwind when service acquisition fails.
      this.m_xTokenHandler.dispose();
      this.m_xDocumentHandler.dispose();
      parser?.dispose();
      this.m_aNamespaceHandler.dispose();
      throw error;
    }
  }
  /** Original implicit reverse member destruction. @returns Nothing. */
  protected override destroy(): void {
    this.m_xTokenHandler.dispose();
    this.m_xDocumentHandler.dispose();
    this.m_xParser.dispose();
    this.m_aNamespaceHandler.dispose();
    super.destroy();
  }
  /** Original token-handler/registerNamespaces/delegated initialization, retaining unchecked Pair extraction and earlier mutations. @param args - Native arguments. @returns Nothing. */
  initialize(args: Sequence<Any>): void {
    if (args.getLength() === 0) return;
    const tokens = new Reference<XFastTokenHandler>(),
      value = new OUString();
    try {
      if (
        Any.prototype.extract.call(args.operatorIndex(0), tokens.getAddress(), [
          "Reference",
          XFastTokenHandler.static_type,
        ]) &&
        tokens.is()
      )
        this.m_xTokenHandler.assign(tokens);
      else if (
        Any.prototype.extract.call(args.operatorIndex(0), value, "OUString") &&
        value.compareToAscii(new TextEncoder().encode("registerNamespaces\0")) === 0
      ) {
        const pair = new PairStringLong();
        try {
          for (let i = 1; i < args.getLength(); ++i) {
            Any.prototype.extract.call(
              args.operatorIndex(i),
              pair,
              cppu_detail_getUnoType_PairStringLong,
            );
            this.m_xParser.operatorStar().registerNamespace(pair.First, pair.Second);
          }
        } finally {
          pair.dispose();
        }
      } else {
        const init = new Reference<XInitialization>(
          this.m_xParser,
          UNO_QUERY_THROW,
          XInitialization.static_type,
        );
        try {
          init.operatorStar().initialize(args);
        } finally {
          init.dispose();
        }
      }
    } finally {
      value.dispose();
      tokens.dispose();
    }
  }
  /** Original per-parse adapter replacement and cached token handler handoff. @param input - Native input. @returns Nothing. */
  parseStream(input: InputSource): void {
    const handler = new Reference(
      new CallbackDocumentHandler(
        this.m_xDocumentHandler,
        this.m_aNamespaceHandler,
        this.m_xTokenHandler,
      ),
    );
    try {
      this.m_xParser.operatorStar().setFastDocumentHandler(handler);
    } finally {
      handler.dispose();
    }
    this.m_xParser.operatorStar().setTokenHandler(this.m_xTokenHandler);
    this.m_xParser.operatorStar().parseStream(input);
  }
  /** Original cached legacy handler. @param handler - Native reference. @returns Nothing. */
  setDocumentHandler(handler: Reference<XDocumentHandler>): void {
    this.m_xDocumentHandler.assign(handler);
  }
  /** Original error-handler delegation. @param handler - Native reference. @returns Nothing. */
  setErrorHandler(handler: Reference<XErrorHandler>): void {
    this.m_xParser.operatorStar().setErrorHandler(handler);
  }
  /** Original empty DTD setter. @param handler - Ignored reference. @returns Nothing. */
  setDTDHandler(handler: Reference<XDTDHandler>): void {
    void handler;
  }
  /** Original resolver delegation. @param resolver - Native reference. @returns Nothing. */
  setEntityResolver(resolver: Reference<XEntityResolver>): void {
    this.m_xParser.operatorStar().setEntityResolver(resolver);
  }
  /** Original locale delegation. @param locale - Native value. @returns Nothing. */
  setLocale(locale: Locale): void {
    this.m_xParser.operatorStar().setLocale(locale);
  }
  /** Original implementation identity. @returns Owned string. */
  getImplementationName(): OUString {
    return literal("com.sun.star.comp.extensions.xml.sax.LegacyFastParser");
  }
  /** Original shared service predicate. @param name - Borrowed name. @returns Membership. */
  supportsService(name: OUStringConstReference): boolean {
    return supportsService(this, name);
  }
  /** Original single service identity. @returns Owned sequence. */
  getSupportedServiceNames(): Sequence<rtl_uStringSlot> {
    const name = literal("com.sun.star.xml.sax.LegacyFastParser");
    try {
      return new (Sequence.specialize<rtl_uStringSlot>("OUString", 8))(
        { /** Initializer-list native cell. @returns Cell. */ get: () => name.getDataAddress() },
        1,
      );
    } finally {
      name.dispose();
    }
  }
}
/** Original acquired constructor ignores both operands. @param context - Ignored context. @param args - Ignored arguments. @returns Acquired component. */
export function com_sun_star_comp_extensions_xml_sax_LegacyFastParser_get_implementation(
  context: XComponentContext | null,
  args: Sequence<Any>,
): XInterface {
  void context;
  void args;
  return acquire(new SaxLegacyFastParser());
}
