/** @fileoverview Original CDocumentBuilder and default entity resolver; synchronous realm execution lowers the recursive mutex, and actual native parser callbacks retain current builder state. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { supportsService } from "../../../cppuhelper/inc/supportsservice";
import { acquire } from "../../../cppuhelper/inc/weak";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import type { XInteractionHandler } from "../../../udkapi/com/sun/star/task/XInteractionHandler";
import type { XProgressHandler } from "../../../offapi/com/sun/star/ucb/XProgressHandler";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XDocumentBuilder } from "../../../offapi/com/sun/star/xml/dom/XDocumentBuilder";
import type { XDocument } from "../../../offapi/com/sun/star/xml/dom/XDocument";
import type { XDOMImplementation } from "../../../offapi/com/sun/star/xml/dom/XDOMImplementation";
import { XEntityResolver } from "../../../offapi/com/sun/star/xml/sax/XEntityResolver";
import type { XErrorHandler } from "../../../offapi/com/sun/star/xml/sax/XErrorHandler";
import { InputSource } from "../../../offapi/com/sun/star/xml/sax/InputSource";
import { SimpleFileAccess } from "../../../offapi/com/sun/star/ucb/SimpleFileAccess";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { Content } from "../../../ucbhelper/inc/content";
import { CommandEnvironment } from "../../../ucbhelper/inc/commandenvironment";
import {
  OUString,
  OUStringToOString,
  type OUStringConstReference,
} from "../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { RTL_TEXTENCODING_UTF8 } from "../../../sal/inc/rtl/textenc";
import { getLibXml2, withXmlBytes } from "../../../external/libxml2/libxml2";
import { installParserCallbacks } from "../../../external/libxml2/parsercallbacks";
import { CDocument } from "./document";
import { context_t, nativeIoContext } from "./documentbuilder.io";
import { reportParserError, throwEx } from "./documentbuilder.errors";
import { resolve_func } from "./documentbuilder.resolve";
import { domLiteral } from "./node";
const Names = Sequence.specialize<rtl_uStringSlot>("OUString", 8);
/** Original private default resolver opens the actual UCB Content and catches only UNO failures. */
class CDefaultEntityResolver
  extends WeakImplHelper.specialize(XEntityResolver)
  implements XEntityResolver
{
  /** Original identifiers, empty encoding and UCB stream lookup. @param publicId - Borrowed public identifier. @param systemId - Borrowed system identifier. @returns Owned input source. */
  resolveEntity(publicId: OUStringConstReference, systemId: OUStringConstReference): InputSource {
    const source = new InputSource();
    source.sPublicId = publicId;
    source.sSystemId = systemId;
    source.sEncoding.clear();
    try {
      const interaction = new Reference<XInteractionHandler>(),
        progress = new Reference<XProgressHandler>();
      try {
        const environment = new Reference(new CommandEnvironment(interaction, progress));
        try {
          const content = new Content(
            systemId,
            environment,
            getProcessComponentContext() as Reference<XComponentContext>,
          );
          try {
            const input = content.openStream();
            try {
              source.aInputStream = input;
            } finally {
              input.dispose();
            }
          } finally {
            content.dispose();
          }
        } finally {
          environment.dispose();
        }
      } finally {
        progress.dispose();
        interaction.dispose();
      }
    } catch (error) {
      if (!(error instanceof Exception)) {
        source.dispose();
        throw error;
      }
      error.dispose();
      source.aInputStream.clear();
    }
    return source;
  }
}
/** Original component, with actual Reference members and full public interface. */
export class CDocumentBuilder
  extends WeakImplHelper.specialize(XDocumentBuilder, XServiceInfo)
  implements XDocumentBuilder, XServiceInfo
{
  private readonly m_xEntityResolver = new Reference<XEntityResolver>(new CDefaultEntityResolver());
  private readonly m_xErrorHandler = new Reference<XErrorHandler>();
  /** Original constructor initialization. Platform bootstrap initializes the realm-local WASM module first. @returns Builder. */
  constructor() {
    super();
    getLibXml2()._xmlInitParser();
  }
  /** Original implicit reverse member destruction. @returns Nothing. */
  protected override destroy(): void {
    this.m_xErrorHandler.dispose();
    this.m_xEntityResolver.dispose();
    super.destroy();
  }
  /** Original single supported service. @returns Owned names. */
  getSupportedServiceNames(): Sequence<rtl_uStringSlot> {
    const value = domLiteral("com.sun.star.xml.dom.DocumentBuilder");
    try {
      return new Names(
        {
          /** Original initializer-list element. @param offset - Zero offset. @returns String address. */ get(
            offset: number,
          ): unknown {
            void offset;
            return value.getDataAddress();
          },
        },
        1,
      );
    } finally {
      value.dispose();
    }
  }
  /** Original implementation name. @returns Owned string. */
  getImplementationName(): OUString {
    return domLiteral("com.sun.star.comp.xml.dom.DocumentBuilder");
  }
  /** Original standard helper. @param name - Borrowed name. @returns Membership. */
  supportsService(name: OUStringConstReference): boolean {
    return supportsService(this, name as OUString);
  }
  /** Original deliberately empty result. @returns Empty implementation reference. */
  getDOMImplementation(): Reference<XDOMImplementation> {
    return new Reference<XDOMImplementation>();
  }
  /** Original constant. @returns True. */ isNamespaceAware(): boolean {
    return true;
  }
  /** Original constant. @returns False. */ isValidating(): boolean {
    return false;
  }
  /** Original XML 1.0 native document allocation and sole node factory. @returns Actual document. */
  newDocument(): Reference<XDocument> {
    return withXmlBytes(
      new Uint8Array([49, 46, 48]),
      /** Original xmlNewDoc call. @param version - Native string. @returns Document wrapper. */ (
        version,
      ) => CDocument.CreateCDocument(getLibXml2()._xmlNewDoc(version)),
    );
  }
  /** Actual source callback binding resolves the current handler/resolver on every callback. @param context - Native parser. @returns Scope retained through native destruction. */
  private callbacks(context: number): { dispose(): void } {
    return installParserCallbacks(context, {
      /** Original error callback. @param parser - Actual parser. @returns Nothing. */ error: (
        parser,
      ) => {
        const handler = this.getErrorHandler();
        try {
          reportParserError(parser, handler, false);
        } finally {
          handler.dispose();
        }
      },
      /** Original warning callback. @param parser - Actual parser. @returns Nothing. */ warning: (
        parser,
      ) => {
        const handler = this.getErrorHandler();
        try {
          reportParserError(parser, handler, true);
        } finally {
          handler.dispose();
        }
      },
      /** Original entity callback. @param parser - Actual parser. @param publicId - Native ID. @param systemId - Native ID. @returns Native input. */ resolveEntity:
        (parser, publicId, systemId) => {
          const resolver = this.getEntityResolver();
          try {
            return resolve_func(parser, publicId, systemId, resolver);
          } finally {
            resolver.dispose();
          }
        },
    });
  }
  /** Original stream parse: flags zero, no URL or encoding override, caller retains stream closure. @param input - Borrowed stream. @returns Actual document or typed parse failure. */
  parse(input: Reference<XInputStream>): Reference<XDocument> {
    if (!input.is()) throw new RuntimeException();
    const m = getLibXml2(),
      io = new context_t();
    io.rInputStream.assign(input);
    io.close = false;
    io.freeOnClose = false;
    const context = m._xmlNewParserCtxt(),
      callbacks = this.callbacks(context);
    try {
      const native = nativeIoContext(io),
        document = m._xmlCtxtReadIO(context, native.read, native.close, native.address, 0, 0, 0);
      if (!document) throwEx(context);
      return CDocument.CreateCDocument(document);
    } finally {
      m._xmlFreeParserCtxt(context);
      callbacks.dispose();
      io.dispose();
    }
  }
  /** Original native file attempt, followed by actual SimpleFileAccess service fallback and success-only stream closure. @param uri - Borrowed URI. @returns Actual document. */
  parseURI(uri: OUStringConstReference): Reference<XDocument> {
    const m = getLibXml2(),
      context = m._xmlNewParserCtxt(),
      callbacks = this.callbacks(context);
    try {
      const encoded = OUStringToOString(
        uri.getStr().subarray(0, uri.getLength()),
        RTL_TEXTENCODING_UTF8,
      );
      let document: number;
      try {
        document = withXmlBytes(
          encoded.getStr(),
          /** Original native file parse. @param path - Native URI. @returns Document pointer. */ (
            path,
          ) => m._xmlCtxtReadFile(context, path, 0, 0),
        );
      } finally {
        encoded.dispose();
      }
      if (document) return CDocument.CreateCDocument(document);
      const access = SimpleFileAccess.create(
        getProcessComponentContext() as Reference<XComponentContext>,
      );
      try {
        const input = access.operatorStar().openFileRead(uri);
        try {
          if (!input.is()) throwEx(context);
          const result = this.parse(input);
          try {
            input.operatorStar().closeInput();
            input.clear();
            return result;
          } catch (error) {
            result.dispose();
            throw error;
          }
        } finally {
          input.dispose();
        }
      } finally {
        access.dispose();
      }
    } finally {
      m._xmlFreeParserCtxt(context);
      callbacks.dispose();
    }
  }
  /** Original resolver assignment. @param resolver - Borrowed reference. @returns Nothing. */
  setEntityResolver(resolver: Reference<XEntityResolver>): void {
    this.m_xEntityResolver.assign(resolver);
  }
  /** Original acquired resolver return. @returns Independent reference. */
  getEntityResolver(): Reference<XEntityResolver> {
    return new Reference(this.m_xEntityResolver);
  }
  /** Original handler assignment. @param handler - Borrowed reference. @returns Nothing. */
  setErrorHandler(handler: Reference<XErrorHandler>): void {
    this.m_xErrorHandler.assign(handler);
  }
  /** Original acquired handler return. @returns Independent reference. */
  getErrorHandler(): Reference<XErrorHandler> {
    return new Reference(this.m_xErrorHandler);
  }
}
/** Original acquired component entry point. @param context - Ignored original context. @param args - Ignored original arguments. @returns Acquired actual component. */
export function unoxml_CDocumentBuilder_get_implementation(
  context: XComponentContext | null,
  args: Sequence<Any>,
): XInterface {
  void context;
  void args;
  return acquire(new CDocumentBuilder());
}
