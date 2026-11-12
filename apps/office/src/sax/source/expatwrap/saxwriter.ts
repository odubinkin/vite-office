/** @fileoverview Original saxwriter.cxx SAXWriter component and state machine over genuine UNO stream/helper owners. All consumed manifest/OFOP output uses this source service; no duplicate string XML encoder remains. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { acquire } from "../../../cppuhelper/inc/weak";
import { supportsService } from "../../../cppuhelper/inc/supportsservice";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import type { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import type { XLocator } from "../../../offapi/com/sun/star/xml/sax/XLocator";
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { XWriter } from "../../../offapi/com/sun/star/xml/sax/XWriter";
import { SAXInvalidCharacterException } from "../../../offapi/com/sun/star/xml/sax/SAXInvalidCharacterException";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { SAXException } from "../../../cppu/inc/com/sun/star/xml/sax/SAXException";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { WrappedTargetRuntimeException } from "../../../cppu/inc/com/sun/star/lang/WrappedTargetRuntimeException";
import { getCaughtException } from "../../../cppuhelper/inc/exc_hlp";
import { withCaughtException } from "../../../cppu/inc/uno/exception-context";
import type { PairStringString } from "../../../udkapi/com/sun/star/beans/Pair";
import { SaxWriterHelper, SaxInvalidCharacterError } from "./saxwriter.helper";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { XAttributeList } from "../../../offapi/com/sun/star/xml/sax/XAttributeList";
/** Original actual SAXWriter component and state machine; normal NDEBUG/non-DBG_UTIL profile. */
export class SAXWriter
  extends WeakImplHelper.specialize(XWriter, XServiceInfo)
  implements XWriter, XServiceInfo
{
  private readonly m_out = new Reference<XOutputStream>();
  private m_pSaxWriterHelper: SaxWriterHelper | undefined;
  private m_bDocStarted = false;
  private m_bIsCDATA = false;
  private m_bForceLineBreak = false;
  private m_bAllowLineBreak = false;
  private m_nLevel = 0;
  /** Original stream replacement; same-stream assignment during a document flushes the helper only. @param stream - Actual stream. @returns Nothing. */
  setOutputStream(stream: Reference<XOutputStream>): void {
    try {
      if (this.m_out.get() === stream.get() && this.m_pSaxWriterHelper && this.m_bDocStarted)
        this.m_pSaxWriterHelper.clearBuffer();
      else {
        this.m_out.assign(stream);
        const helper = new SaxWriterHelper(this.m_out),
          old = this.m_pSaxWriterHelper;
        this.m_pSaxWriterHelper = helper;
        old?.dispose();
        this.m_bDocStarted = false;
        this.m_nLevel = 0;
        this.m_bIsCDATA = false;
      }
    } catch (error) {
      if (!(error instanceof SAXException)) throw error;
      const self = new Reference(this);
      try {
        throw new WrappedTargetRuntimeException(error.Message, self, error.WrappedException);
      } finally {
        self.dispose();
        error.dispose();
      }
    }
  }
  /** Original acquired plugged output. @returns Actual stream or null reference. */
  getOutputStream(): Reference<XOutputStream> {
    return new Reference(this.m_out);
  }
  /** Binds original operator-> under source caller invariants, without introducing a missing-helper service. @returns Actual allocated helper. */
  private helper(): SaxWriterHelper {
    return this.m_pSaxWriterHelper as SaxWriterHelper;
  }
  /** Original indentation flags reset together, including when no indentation is selected. @param firstLineBreak - Source byte/character estimate. @returns Indentation or -1. */
  private getIndentPrefixLength(firstLineBreak: number): number {
    let length = -1;
    if (
      this.m_pSaxWriterHelper &&
      (this.m_bForceLineBreak ||
        (this.m_bAllowLineBreak &&
          firstLineBreak + this.m_pSaxWriterHelper.GetLastColumnCount() > 72))
    )
      length = this.m_nLevel;
    this.m_bForceLineBreak = false;
    this.m_bAllowLineBreak = false;
    return length;
  }
  /** Original source name. @returns Owned name. */ getImplementationName(): OUString {
    return writerLiteral("com.sun.star.extensions.xml.sax.Writer");
  }
  /** Original helper membership. @param name - Demanded name. @returns Exact membership. */ supportsService(
    name: OUString,
  ): boolean {
    return supportsService(this, name);
  }
  /** Original one supported service. @returns Owned native names. */ getSupportedServiceNames(): Sequence<rtl_uStringSlot> {
    const value = writerLiteral("com.sun.star.xml.sax.Writer");
    try {
      return new (Sequence.specialize<rtl_uStringSlot>("OUString", 8))(
        {
          /** Borrows the actual source string pointer. @returns Native field address. */ get() {
            return value.getDataAddress();
          },
        },
        1,
      );
    } finally {
      value.dispose();
    }
  }
  /** Original starts only once and requires an actual output. @returns Nothing. */ startDocument(): void {
    if (this.m_bDocStarted || !this.m_out.is() || !this.m_pSaxWriterHelper)
      throw new SAXException();
    this.m_bDocStarted = true;
    this.helper().startDocument();
  }
  /** Original final write and output closure; source does not reset m_bDocStarted. @returns Nothing. */ endDocument(): void {
    if (!this.m_bDocStarted) throw writerException("endDocument called before startDocument");
    if (this.m_nLevel) throw writerException("unexpected end of document");
    this.helper().endDocument();
    try {
      this.m_out.operatorStar().closeOutput();
    } catch (error) {
      if (!(error instanceof IOException)) throw error;
      try {
        const wrapped = withCaughtException(error, getCaughtException);
        try {
          throw writerException("IO exception during closing the IO Stream", false, wrapped);
        } finally {
          wrapped.dispose();
        }
      } finally {
        error.dispose();
      }
    }
  }
  /** Original source indentation, event state and warning/error ordering. @param name - Element name. @param attributes - Actual list. @returns Nothing. */ startElement(
    name: OUStringConstReference,
    attributes: Reference<XAttributeList>,
  ): void {
    if (!this.m_bDocStarted) throw writerException("startElement called before startDocument");
    if (this.m_bIsCDATA) throw writerException("startElement call not allowed with CDATA sections");
    let length = 0;
    if (this.m_bAllowLineBreak) {
      length = 1 + this.helper().calcXMLByteLength(name, false, false);
      const count = attributes.is() ? attributes.operatorStar().getLength() : 0;
      for (let i = 0; i < count; ++i) {
        ++length;
        const key = attributes.operatorStar().getNameByIndex(i);
        try {
          length += this.helper().calcXMLByteLength(key, false, false);
        } finally {
          key.dispose();
        }
        length += 2;
        const value = attributes.operatorStar().getValueByIndex(i);
        try {
          length += this.helper().calcXMLByteLength(value, true, true);
        } finally {
          value.dispose();
        }
        ++length;
      }
      ++length;
    }
    const prefix = this.getIndentPrefixLength(length);
    if (prefix >= 0) this.helper().insertIndentation(prefix);
    const result = this.helper().startElement(name, attributes);
    this.m_nLevel = (this.m_nLevel + 1) | 0;
    if (result === SaxInvalidCharacterError.SAX_WARNING)
      throw writerException("Invalid character during XML-Export in an attribute value", true);
    if (result === SaxInvalidCharacterError.SAX_ERROR)
      throw writerException("Invalid character during XML-Export");
  }
  /** Original decrements depth before validating; release omits debug-only name-stack equality. @param name - End name. @returns Nothing. */ endElement(
    name: OUStringConstReference,
  ): void {
    if (!this.m_bDocStarted) throw new SAXException();
    this.m_nLevel = (this.m_nLevel - 1) | 0;
    if (this.m_nLevel < 0) throw new SAXException();
    let success = true;
    if (this.helper().FinishEmptyElement()) this.m_bForceLineBreak = false;
    else {
      const length = this.m_bAllowLineBreak
          ? 3 + this.helper().calcXMLByteLength(name, false, false)
          : 0,
        prefix = this.getIndentPrefixLength(length);
      if (prefix >= 0) this.helper().insertIndentation(prefix);
      success = this.helper().endElement(name);
    }
    if (!success) throw writerException("Invalid character during XML-Export");
  }
  /** Original empty text leaves state/flags unchanged; CDATA bypasses markup normalization. @param value - Native text. @returns Nothing. */ characters(
    value: OUStringConstReference,
  ): void {
    if (!this.m_bDocStarted) throw writerException("characters method called before startDocument");
    let invalid = false;
    if (!value.isEmpty()) {
      if (this.m_bIsCDATA) invalid = !this.helper().writeString(value, false, false);
      else {
        let length = 0,
          // eslint-disable-next-line no-useless-assignment -- Preserve original nIndentPrefix initialization before source branches.
          prefix = -1;
        if (this.m_bAllowLineBreak) {
          const first = value.indexOf(10);
          length = this.helper().calcXMLByteLength(value, !this.m_bIsCDATA, false);
          prefix = this.getIndentPrefixLength(first >= 0 ? first : length);
        } else prefix = this.getIndentPrefixLength(length);
        if (prefix >= 0)
          this.helper().insertIndentation(value.getStr()[0] === 32 ? prefix - 1 : prefix);
        invalid = !this.helper().writeString(value, true, false);
      }
    }
    if (invalid) throw writerException("Invalid character during XML-Export", true);
  }
  /** Original ignores whitespace content and schedules a forced line break. @param value - Ignored source text. @returns Nothing. */ ignorableWhitespace(
    value: OUStringConstReference,
  ): void {
    void value;
    if (!this.m_bDocStarted) throw new SAXException();
    this.m_bForceLineBreak = true;
  }
  /** Original PI handling and optional indentation. @param target - Target. @param data - Data. @returns Nothing. */ processingInstruction(
    target: OUStringConstReference,
    data: OUStringConstReference,
  ): void {
    if (!this.m_bDocStarted || this.m_bIsCDATA) throw new SAXException();
    const length = this.m_bAllowLineBreak
        ? 5 +
          this.helper().calcXMLByteLength(target, false, false) +
          this.helper().calcXMLByteLength(data, false, false)
        : 0,
      prefix = this.getIndentPrefixLength(length);
    if (prefix >= 0) this.helper().insertIndentation(prefix);
    if (!this.helper().processingInstruction(target, data))
      throw writerException("Invalid character during XML-Export");
  }
  /** Original empty callback. @param locator - Ignored locator. @returns Nothing. */ setDocumentLocator(
    locator: Reference<XLocator>,
  ): void {
    void locator;
  }
  /** Original unguarded helper table assignment; no fabricated not-started check. @param replacements - Native pairs. @returns Nothing. */ setCustomEntityNames(
    replacements: Sequence<PairStringString>,
  ): void {
    this.helper().setCustomEntityNames(replacements);
  }
  /** Original begin CDATA state/indentation ordering. @returns Nothing. */ startCDATA(): void {
    if (!this.m_bDocStarted || this.m_bIsCDATA) throw new SAXException();
    const prefix = this.getIndentPrefixLength(9);
    if (prefix >= 0) this.helper().insertIndentation(prefix);
    this.helper().startCDATA();
    this.m_bIsCDATA = true;
  }
  /** Original end CDATA state/indentation ordering. @returns Nothing. */ endCDATA(): void {
    if (!this.m_bDocStarted || !this.m_bIsCDATA)
      throw writerException("endCDATA was called without startCDATA");
    const prefix = this.getIndentPrefixLength(3);
    if (prefix >= 0) this.helper().insertIndentation(prefix);
    this.helper().endCDATA();
    this.m_bIsCDATA = false;
  }
  /** Original comment state/indentation and status. @param value - Comment. @returns Nothing. */ comment(
    value: OUStringConstReference,
  ): void {
    if (!this.m_bDocStarted || this.m_bIsCDATA) throw new SAXException();
    const length = this.m_bAllowLineBreak
        ? 7 + this.helper().calcXMLByteLength(value, false, false)
        : 0,
      prefix = this.getIndentPrefixLength(length);
    if (prefix >= 0) this.helper().insertIndentation(prefix);
    if (!this.helper().comment(value)) throw writerException("Invalid character during XML-Export");
  }
  /** Original only one pending optional break is admitted. @returns Nothing. */ allowLineBreak(): void {
    if (!this.m_bDocStarted || this.m_bAllowLineBreak) throw new SAXException();
    this.m_bAllowLineBreak = true;
  }
  /** Original XML declaration prefix skip leaves pending indentation flags untouched. @param value - Raw content. @returns Nothing. */ unknown(
    value: OUStringConstReference,
  ): void {
    if (!this.m_bDocStarted || this.m_bIsCDATA) throw new SAXException();
    const prefixLiteral = writerLiteral("<?xml");
    let skip: boolean;
    try {
      skip = value.startsWith(prefixLiteral);
    } finally {
      prefixLiteral.dispose();
    }
    if (skip) return;
    const length = this.m_bAllowLineBreak
        ? this.helper().calcXMLByteLength(value, false, false)
        : 0,
      prefix = this.getIndentPrefixLength(length);
    if (prefix >= 0) this.helper().insertIndentation(prefix);
    if (!this.helper().writeString(value, false, false))
      throw writerException("Invalid character during XML-Export");
  }
  /** Original implicit reverse member/base destruction without an invented close or document event. @returns Nothing. */ protected override destroy(): void {
    this.m_pSaxWriterHelper?.dispose();
    this.m_out.dispose();
    super.destroy();
  }
}
/** Original known source literal. @param value - ASCII constant. @returns Actual owned string. */
function writerLiteral(value: string): OUString {
  return OUString.createFromAscii(new TextEncoder().encode(value + "\0"));
}
/** Binds original exception construction and local temporary destruction. @param message - Source diagnostic. @param invalid - Exact SAXInvalidCharacterException overload. @param wrapped - Optional original wrapped payload. @returns Actual source exception. */
function writerException(message: string, invalid = false, wrapped?: Any): SAXException {
  const text = writerLiteral(message),
    context = new Reference(),
    payload = wrapped ?? new Any();
  try {
    return invalid
      ? new SAXInvalidCharacterException(text, context, payload)
      : new SAXException(text, context, payload);
  } finally {
    if (wrapped === undefined) payload.dispose();
    context.dispose();
    text.dispose();
  }
}
/** Original acquired component factory ignores context and arguments. @param context - Ignored context. @param args - Ignored arguments. @returns Actual acquired Writer root. */
export function com_sun_star_extensions_xml_sax_Writer_get_implementation(
  context: XComponentContext | null,
  args: Sequence<Any>,
): XInterface {
  void context;
  void args;
  return acquire(new SAXWriter());
}
