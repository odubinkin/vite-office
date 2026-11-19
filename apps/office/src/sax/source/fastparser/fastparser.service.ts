/** @fileoverview Original FastSaxParser public UNO wrapper and acquired component factory; native Emscripten parse execution belongs to FastSaxParserImpl. */
import { FastSaxParserImpl } from "./fastparser.impl";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { supportsService } from "../../../cppuhelper/inc/supportsservice";
import { acquire } from "../../../cppuhelper/inc/weak";
import { XInitialization } from "../../../udkapi/com/sun/star/lang/XInitialization";
import { XFastParser } from "../../../offapi/com/sun/star/xml/sax/XFastParser";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { XMap } from "../../../udkapi/com/sun/star/container/XMap";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import type { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import type { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import type { PairStringString } from "../../../udkapi/com/sun/star/beans/Pair";
import type { InputSource } from "../../../offapi/com/sun/star/xml/sax/InputSource";
import type { XFastDocumentHandler } from "../../../offapi/com/sun/star/xml/sax/XFastDocumentHandler";
import type { XFastTokenHandler } from "../../../offapi/com/sun/star/xml/sax/XFastTokenHandler";
import type { XFastNamespaceHandler } from "../../../offapi/com/sun/star/xml/sax/XFastNamespaceHandler";
import type { XErrorHandler } from "../../../offapi/com/sun/star/xml/sax/XErrorHandler";
import type { XEntityResolver } from "../../../offapi/com/sun/star/xml/sax/XEntityResolver";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { split } from "../../../comphelper/source/misc/string";
/** Compiler-known source ASCII literal. @param value - Original literal. @returns Owned string. */
function literal(value: string): OUString {
  return new OUString(
    Uint8Array.from(
      value + "\0",
      /** ASCII literal unit. @param c - Character. @returns Byte. */ (c) => c.charCodeAt(0),
    ),
  );
}
/** Original exact ordered WeakImplHelper interfaces and unique implementation ownership. */
export class FastSaxParser
  extends WeakImplHelper.specialize(XInitialization, XFastParser, XServiceInfo)
  implements XInitialization, XFastParser, XServiceInfo
{
  private readonly mpImpl = new FastSaxParserImpl();
  /** Original unique_ptr member destruction. @returns Nothing. */
  protected override destroy(): void {
    this.mpImpl.dispose();
    super.destroy();
  }
  /** Original comma options, sticky flags and optional map extraction. @param args - Native arguments. @returns Nothing. */
  initialize(args: Sequence<Any>): void {
    if (args.getLength() === 0) return;
    const value = new OUString();
    try {
      if (!Any.prototype.extract.call(args.operatorIndex(0), value, "OUString"))
        throw new IllegalArgumentException();
      const options = split(value.getStr().subarray(0, value.getLength()), 44);
      try {
        for (const option of options) {
          if (option.compareToAscii(new TextEncoder().encode("IgnoreMissingNSDecl\0")) === 0)
            this.mpImpl.m_bIgnoreMissingNSDecl = true;
          else if (option.compareToAscii(new TextEncoder().encode("DoSmeplease\0")) === 0) {
            /* Original accepted no-op. */
          } else if (
            option.compareToAscii(new TextEncoder().encode("DisableThreadedParser\0")) === 0
          )
            this.mpImpl.m_bDisableThreadedParser = true;
          else throw new IllegalArgumentException();
        }
      } finally {
        for (const option of options) option.dispose();
      }
      if (args.getLength() > 1)
        Any.prototype.extract.call(args.operatorIndex(1), this.mpImpl.mxMap.getAddress(), [
          "Reference",
          XMap.static_type,
        ]);
    } finally {
      value.dispose();
    }
  }
  /** Original delegated stream parse. @param input - Actual input. @returns Nothing. */
  parseStream(input: InputSource): void {
    this.mpImpl.parseStream(input);
  }
  /** Original cached handler assignment. @param handler - Actual reference. @returns Nothing. */
  setFastDocumentHandler(handler: Reference<XFastDocumentHandler>): void {
    this.mpImpl.setFastDocumentHandler(handler);
  }
  /** Original native token-handler assignment. @param handler - Actual reference. @returns Nothing. */
  setTokenHandler(handler: Reference<XFastTokenHandler>): void {
    this.mpImpl.setTokenHandler(handler);
  }
  /** Original namespace registration. @param uri - Borrowed URI. @param token - Namespace token. @returns Nothing. */
  registerNamespace(uri: OUStringConstReference, token: number): void {
    this.mpImpl.registerNamespace(uri, token);
  }
  /** Original by-value namespace result. @param prefix - Borrowed prefix. @returns Owned URI. */
  getNamespaceURL(prefix: OUStringConstReference): OUString {
    return new OUString(
      this.mpImpl.getNamespaceURL(prefix.getStr().subarray(0, prefix.getLength())),
    );
  }
  /** Original cached error handler assignment. @param handler - Actual reference. @returns Nothing. */
  setErrorHandler(handler: Reference<XErrorHandler>): void {
    this.mpImpl.setErrorHandler(handler);
  }
  /** Original explicitly unimplemented resolver setter. @param resolver - Ignored original operand. @returns Nothing. */
  setEntityResolver(resolver: Reference<XEntityResolver>): void {
    void resolver;
  }
  /** Original explicitly unimplemented locale setter. @param locale - Ignored original operand. @returns Nothing. */
  setLocale(locale: Locale): void {
    void locale;
  }
  /** Original namespace handler assignment. @param handler - Actual reference. @returns Nothing. */
  setNamespaceHandler(handler: Reference<XFastNamespaceHandler>): void {
    this.mpImpl.setNamespaceHandler(handler);
  }
  /** Original copied replacement vector. @param replacements - Native pairs. @returns Nothing. */
  setCustomEntityNames(replacements: Sequence<PairStringString>): void {
    this.mpImpl.setCustomEntityNames(replacements);
  }
  /** Original implementation identity. @returns Owned string. */
  getImplementationName(): OUString {
    return literal("com.sun.star.comp.extensions.xml.sax.FastParser");
  }
  /** Original shared service predicate. @param name - Borrowed name. @returns Membership. */
  supportsService(name: OUStringConstReference): boolean {
    return supportsService(this, name);
  }
  /** Original single supported service. @returns Owned sequence. */
  getSupportedServiceNames(): Sequence<rtl_uStringSlot> {
    const name = literal("com.sun.star.xml.sax.FastParser");
    try {
      return new (Sequence.specialize<rtl_uStringSlot>("OUString", 8))(
        { /** Initializer-list cell. @returns Borrowed cell. */ get: () => name.getDataAddress() },
        1,
      );
    } finally {
      name.dispose();
    }
  }
}
/** Original component constructor ignores context and arguments. @param context - Ignored context. @param args - Ignored arguments. @returns Acquired native component. */
export function com_sun_star_comp_extensions_xml_sax_FastParser_get_implementation(
  context: XComponentContext | null,
  args: Sequence<Any>,
): XInterface {
  void context;
  void args;
  return acquire(new FastSaxParser());
}
