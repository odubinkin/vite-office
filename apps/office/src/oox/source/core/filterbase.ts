/** @fileoverview Original filterbase.cxx recursion guard and represented FilterBaseImpl constructor/model validation state. This is not a FilterBase service or an alternative model/factory provider; document/media/storage orchestration remains unported. */
import { Mutex, ScopedLock } from "../../../external/libcxx/mutex";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import {
  Reference,
  UNO_SET_THROW,
  UNO_QUERY_THROW,
  type ReferenceConstParameter,
} from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import type { XComponent } from "../../../udkapi/com/sun/star/lang/XComponent";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { XModel } from "../../../offapi/com/sun/star/frame/XModel";
import { XMultiServiceFactory } from "../../../udkapi/com/sun/star/lang/XMultiServiceFactory";
import type { XFrame } from "../../../offapi/com/sun/star/frame/XFrame";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import type { XStream } from "../../../udkapi/com/sun/star/io/XStream";
import type { XStatusIndicator } from "../../../offapi/com/sun/star/task/XStatusIndicator";
import { SequenceAsHashMap } from "../../../comphelper/source/misc/sequenceashashmap";
import { OoxmlVersion } from "../../inc/core/filterbase";
/** Original source-local direction ordinals. */
export enum FilterDirection {
  Unknown,
  Import,
  Export,
}
/** Original consumed PImpl values and actual UNO reference members. Drawing/model-object/OLE/VBA helper implementations, storage and parent shape members remain unported rather than replaced by objects. */
export class FilterBaseImpl {
  meDirection = FilterDirection.Unknown;
  readonly maArguments = new SequenceAsHashMap();
  readonly maFilterData = new SequenceAsHashMap();
  readonly maMediaDesc = new SequenceAsHashMap();
  readonly maFileUrl = new OUString();
  meVersion = OoxmlVersion.ECMA_376_1ST_EDITION;
  readonly mxComponentContext: Reference<XComponentContext>;
  readonly mxModel = new Reference<XModel>();
  readonly mxModelFactory = new Reference<XMultiServiceFactory>();
  readonly mxTargetFrame = new Reference<XFrame>();
  readonly mxInStream = new Reference<XInputStream>();
  readonly mxOutStream = new Reference<XStream>();
  readonly mxStatusIndicator = new Reference<XStatusIndicator>();
  mbExportVBA = false;
  mbExportTemplate = false;
  mbExportSlideShow = false;
  /** Original required nonnull context, using actual UNO_SET_THROW. @param context - Actual native context reference. @returns State owner. */
  constructor(context: ReferenceConstParameter<XComponentContext>) {
    this.mxComponentContext = new Reference(context, UNO_SET_THROW);
  }
  /** Original sequential throwing queries and catch translation; no transaction or replacement factory is added. Positive XModel/factory model admission remains unqualified until a genuine complete model exists. @param component - Actual candidate component. @returns Nothing. */
  setDocumentModel(component: Reference<XComponent>): void {
    try {
      this.mxModel.set(component, UNO_QUERY_THROW, XModel.static_type);
      this.mxModelFactory.set(component, UNO_QUERY_THROW, XMultiServiceFactory.static_type);
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
      throw new IllegalArgumentException();
    }
  }
  /** Explicit binding of represented native member destruction, in reverse declaration order. Unported helper/storage/native ABI shutdown is not claimed. @returns Nothing. */
  dispose(): void {
    this.mxStatusIndicator.dispose();
    this.mxOutStream.dispose();
    this.mxInStream.dispose();
    this.mxTargetFrame.dispose();
    this.mxModelFactory.dispose();
    this.mxModel.dispose();
    this.mxComponentContext.dispose();
    this.maFileUrl.dispose();
    this.maMediaDesc.dispose();
    this.maFilterData.dispose();
    this.maArguments.dispose();
  }
}
/** Original process-lifetime pool has a genuine native std::mutex and owned RTL URL values. Host Map only spells exact counted Unicode set membership; native tree/allocator/iteration order and cross-realm synchronization remain unqualified. */
class UrlPool {
  readonly maMutex = new Mutex();
  readonly maUrls = new Map<string, OUString>();
}
let urlPool: UrlPool | undefined;
/** Original function-local static initialization. Native process shutdown remains unqualified, without an invented public reset. @returns Existing pool. */
function StaticUrlPool(): UrlPool {
  return (urlPool ??= new UrlPool());
}
/** Counted UTF16 lookup spelling, without URI parsing, normalization or a C-string terminator. @param url - Actual URL value. @returns Exact host key. */
function key(url: OUStringConstReference): string {
  let result = "";
  for (let i = 0; i < url.getLength(); ++i)
    result += String.fromCharCode(url.getStr()[i] as number);
  return result;
}
/** Original document-level recursion guard. It neither opens URLs nor substitutes a document/filter/lock provider. */
export class DocumentOpenedGuard {
  private readonly maUrl = new OUString();
  private readonly mbValid: boolean;
  /** Original permits empty URLs and otherwise claims a currently absent exact value under the actual native scoped lock. @param url - Actual borrowed URL. @returns Guard. */
  constructor(url: OUStringConstReference) {
    const pool = StaticUrlPool(),
      lock = new ScopedLock(pool.maMutex);
    try {
      this.mbValid = url.isEmpty() || !pool.maUrls.has(key(url));
      if (this.mbValid && !url.isEmpty()) {
        pool.maUrls.set(key(url), new OUString(url));
        this.maUrl.assign(url);
      }
    } finally {
      lock.dispose();
    }
  }
  /** Original construction-time result does not change if another guard is later destroyed. @returns Source result. */
  isValid(): boolean {
    return this.mbValid;
  }
  /** Original erases only a URL actually claimed by this guard, then destroys its Unicode member. Duplicate/empty guards do not remove another owner's claim. @returns Nothing. */
  dispose(): void {
    const pool = StaticUrlPool(),
      lock = new ScopedLock(pool.maMutex);
    try {
      if (!this.maUrl.isEmpty()) {
        const spelling = key(this.maUrl),
          owned = pool.maUrls.get(spelling);
        pool.maUrls.delete(spelling);
        owned?.dispose();
      }
    } finally {
      lock.dispose();
    }
    this.maUrl.dispose();
  }
}
