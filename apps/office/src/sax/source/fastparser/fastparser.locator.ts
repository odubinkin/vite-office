/** @fileoverview Original fastparser.cxx FastLocatorImpl over the actual native parser owner and C SAX2 location APIs; no host parser position is substituted. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { XLocator } from "../../../offapi/com/sun/star/xml/sax/XLocator";
import { DisposedException } from "../../../cppu/inc/com/sun/star/lang/DisposedException";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { getLibXml2 } from "../../../external/libxml2/libxml2";
import type { FastSaxParserImpl } from "./fastparser.impl";

/** Original native locator borrows its parser; the parser invalidates surviving locator references on destruction. */
export class FastLocatorImpl extends WeakImplHelper.specialize(XLocator) implements XLocator {
  /** Original raw parser pointer, without acquisition. @param mpParser - Actual source owner. @returns Locator. */
  constructor(private mpParser: FastSaxParserImpl | null) {
    super();
  }
  /** Original pointer invalidation; this is not XComponent::dispose. @returns Nothing. */
  dispose(): void {
    this.mpParser = null;
  }
  /** Original disposed check, before any entity/native access. @returns Live original parser. */
  private checkDispose(): FastSaxParserImpl {
    if (this.mpParser === null) throw new DisposedException();
    return this.mpParser;
  }
  /** Original C SAX2 column query. @returns Native column number. */
  getColumnNumber(): number {
    const parser = this.checkDispose();
    return getLibXml2()._xmlSAX2GetColumnNumber(parser.getEntity().mpParser);
  }
  /** Original C SAX2 line query. @returns Native line number. */
  getLineNumber(): number {
    const parser = this.checkDispose();
    return getLibXml2()._xmlSAX2GetLineNumber(parser.getEntity().mpParser);
  }
  /** Original source public-ID value return. @returns Owned native string copy. */
  getPublicId(): OUString {
    return new OUString(this.checkDispose().getEntity().maStructSource.sPublicId);
  }
  /** Original source system-ID value return. @returns Owned native string copy. */
  getSystemId(): OUString {
    return new OUString(this.checkDispose().getEntity().maStructSource.sSystemId);
  }
}
