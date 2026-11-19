/** @fileoverview Original OZipFileAccess service over actual ZipFile, UNO input streams, intrusive shared mutex and UCB client. No archive/stream/provider replacement; URI-provider availability remains a separate component prerequisite. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { acquire } from "../../../cppuhelper/inc/weak";
import { supportsService } from "../../../cppuhelper/inc/supportsservice";
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Type } from "../../../cppu/inc/com/sun/star/uno/Type";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { DisposedException } from "../../../cppu/inc/com/sun/star/lang/DisposedException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { WrappedTargetException } from "../../../cppu/inc/com/sun/star/lang/WrappedTargetException";
import { NoSuchElementException } from "../../../cppu/inc/com/sun/star/container/NoSuchElementException";
import { withCaughtException } from "../../../cppu/inc/uno/exception-context";
import { getCaughtException } from "../../../cppuhelper/inc/exc_hlp";
import { XZipFileAccess2 } from "../../../offapi/com/sun/star/packages/zip/XZipFileAccess2";
import { XInitialization } from "../../../udkapi/com/sun/star/lang/XInitialization";
import { XComponent } from "../../../udkapi/com/sun/star/lang/XComponent";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { XEventListener } from "../../../udkapi/com/sun/star/lang/XEventListener";
import { EventObject } from "../../../udkapi/com/sun/star/lang/EventObject";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XStream } from "../../../udkapi/com/sun/star/io/XStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import { XActiveDataSink } from "../../../udkapi/com/sun/star/io/XActiveDataSink";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { NotConnectedException } from "../../../cppu/inc/com/sun/star/io/NotConnectedException";
import type { XCommandEnvironment } from "../../../offapi/com/sun/star/ucb/XCommandEnvironment";
import {
  NamedValue,
  cppu_detail_getUnoType_NamedValue,
} from "../../../udkapi/com/sun/star/beans/NamedValue";
import {
  OUString,
  OUStringLiteral,
  type OUStringConstReference,
} from "../../../sal/inc/rtl/ustring";
import { rtl_uString_assign, type rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { osl_atomic_increment } from "../../../sal/inc/osl/interlck";
import { MutexGuard } from "../../../sal/inc/osl/mutex";
import { RefCountedMutex } from "../../../comphelper/inc/refcountedmutex";
import { OInterfaceContainerHelper3 } from "../../../comphelper/inc/interfacecontainer3";
import { Content } from "../../../ucbhelper/inc/content";
import { ZipFile, Checks } from "../zipapi/ZipFile";
import { ZipPackageSink } from "./ZipPackageSink";
import { GetPatternsFromString_Impl, StringGoodForPattern_Impl } from "./zipfileaccess.patterns";
const Strings = Sequence.specialize<rtl_uStringSlot>("OUString", 8),
  NamedValues = Sequence.specialize<NamedValue>(cppu_detail_getUnoType_NamedValue, 32);
/** Compiler binding of the original UTF16 literals, retaining static RTL flags. @param value - Source literal. @returns Owned string wrapper over literal data. */
function literal(value: string): OUString {
  return new OUString(
    new OUStringLiteral(
      Uint16Array.from(
        value.split("").concat("\0"),
        /** Original literal code unit. @param character - UTF16 unit. @returns Numeric unit. */ (
          character,
        ) => character.charCodeAt(0),
      ),
    ),
  );
}
/** Original ZIP-access component, retaining initialization/disposal and borrowed-input ownership order. */
export class OZipFileAccess
  extends WeakImplHelper.specialize(XZipFileAccess2, XInitialization, XComponent, XServiceInfo)
  implements XZipFileAccess2, XInitialization, XComponent, XServiceInfo
{
  private readonly m_aMutexHolder = new RtlReference(new RefCountedMutex());
  private readonly m_xContext: Reference<XComponentContext>;
  private readonly m_xContentStream = new Reference<XInputStream>();
  private m_pZipFile: ZipFile | null = null;
  private m_pListenersContainer: OInterfaceContainerHelper3<XEventListener> | null = null;
  private m_bDisposed = false;
  private m_bOwnContent = false;
  /** Original context guard and acquired member initialization. @param context - Actual component context. @returns Component. */
  constructor(context: Reference<XComponentContext>) {
    super();
    this.m_xContext = new Reference(context);
    if (!context.is()) {
      this.m_xContentStream.dispose();
      this.m_xContext.dispose();
      this.m_aMutexHolder.dispose();
      throw new RuntimeException();
    }
  }
  /** Original destructor protects its real refcount while dispose creates event references, then destroys members in reverse declaration order. @returns Nothing. */
  protected override destroy(): void {
    const guard = new MutexGuard(this.m_aMutexHolder.operatorStar().GetMutex());
    try {
      if (!this.m_bDisposed) {
        osl_atomic_increment(this.m_refCount);
        try {
          this.dispose();
        } catch (error) {
          if (!(error instanceof Exception)) throw error;
          error.dispose();
        }
      }
    } finally {
      guard.dispose();
      this.m_pListenersContainer?.dispose();
      this.m_pZipFile?.dispose();
      this.m_xContentStream.dispose();
      this.m_xContext.dispose();
      this.m_aMutexHolder.dispose();
      super.destroy();
    }
  }
  /** Original one-time initialization supports URL, XStream, XInputStream and NamedValue sequence, in that order. Failed ZIP construction does not mark initialization complete. @param arguments_ - Actual native Any sequence. @returns Nothing. */
  initialize(arguments_: Sequence<Any>): void {
    const guard = new MutexGuard(this.m_aMutexHolder.operatorStar().GetMutex());
    try {
      if (this.m_bDisposed) throw new DisposedException();
      if (this.m_pZipFile !== null) throw new RuntimeException();
      if (!arguments_.hasElements()) this.invalidArgument();
      const url = new OUString(),
        stream = new Reference<XStream>(),
        seek = new Reference<XSeekable>(),
        args = new NamedValues();
      try {
        const first = arguments_.operatorIndex(0);
        if (Any.prototype.extract.call(first, url, "OUString")) this.openInputStream(url, seek);
        else if (
          Any.prototype.extract.call(first, stream.getAddress(), ["Reference", XStream.static_type])
        ) {
          const input = stream.operatorStar().getInputStream();
          try {
            this.m_xContentStream.assign(input);
          } finally {
            input.dispose();
          }
          seek.set(stream, UNO_QUERY, XSeekable.static_type);
        } else if (
          Any.prototype.extract.call(first, this.m_xContentStream.getAddress(), [
            "Reference",
            XInputStream.static_type,
          ])
        )
          seek.set(this.m_xContentStream, UNO_QUERY, XSeekable.static_type);
        else if (
          Any.prototype.extract.call(first, args.getAddress(), [
            "Sequence",
            cppu_detail_getUnoType_NamedValue,
          ])
        ) {
          const data = args.getConstArray() as SequenceElements,
            name = literal("URL");
          try {
            for (let i = 0; i < args.getLength(); ++i) {
              const arg = NamedValue.unacquired(data.get(i * 32) as SequenceElements);
              if (arg.Name.equals(name))
                Any.prototype.extract.call(arg.Value as Any, url, "OUString");
            }
          } finally {
            name.dispose();
          }
          if (url.isEmpty())
            this.invalidArgument("required argument 'URL' is not given or invalid.");
          this.openInputStream(url, seek);
        } else this.invalidArgument();
        if (!this.m_xContentStream.is() || !seek.is()) throw new IOException();
        this.m_pZipFile = new ZipFile(
          this.m_aMutexHolder,
          this.m_xContentStream,
          this.m_xContext,
          true,
          false,
          Checks.Default,
        );
      } finally {
        args.dispose();
        seek.dispose();
        stream.dispose();
        url.dispose();
      }
    } finally {
      guard.dispose();
    }
  }
  /** Original argument-one diagnostic with an empty context. @param message - Original optional message. @returns Never. */
  private invalidArgument(message = ""): never {
    const value = literal(message),
      context = new Reference<XInterface>();
    try {
      throw new IllegalArgumentException(value, context, 1);
    } finally {
      context.dispose();
      value.dispose();
    }
  }
  /** Original URL-opening lambda uses the actual UCB client and package sink. @param url - Actual URL. @param seek - Output seekable reference. @returns Nothing. */
  private openInputStream(url: OUStringConstReference, seek: Reference<XSeekable>): void {
    const environment = new Reference<XCommandEnvironment>();
    try {
      const content = new Content(url, environment, this.m_xContext),
        sink = new Reference<XActiveDataSink>(new ZipPackageSink());
      try {
        if (content.openStream(sink)) {
          const input = sink.operatorStar().getInputStream();
          try {
            this.m_xContentStream.assign(input);
          } finally {
            input.dispose();
          }
          this.m_bOwnContent = true;
          seek.set(this.m_xContentStream, UNO_QUERY, XSeekable.static_type);
        }
      } finally {
        sink.dispose();
        content.dispose();
      }
    } finally {
      environment.dispose();
    }
  }
  /** Original disposed/initialization guard with the pattern method's distinct exception. @param pattern - Selects NotConnected for the source pattern operation. @returns Borrowed initialized archive. */
  private checkedZip(pattern = false): ZipFile {
    if (this.m_bDisposed) throw new DisposedException();
    if (this.m_pZipFile === null) {
      if (pattern) throw new NotConnectedException();
      throw new RuntimeException();
    }
    return this.m_pZipFile;
  }
  /** Original exact-name entry lookup and selective exception wrapping. @param name - Borrowed native entry name. @returns Owned stream Any. */
  getByName(name: OUStringConstReference): Any {
    const guard = new MutexGuard(this.m_aMutexHolder.operatorStar().GetMutex());
    try {
      const zip = this.checkedZip(),
        entry = zip.GetEntryHash().find(name);
      if (entry === undefined) throw new NoSuchElementException();
      let input: Reference<XInputStream>;
      const encryption = new RtlReference<never>();
      try {
        input = zip.getDataStream(entry, encryption, null, this.m_aMutexHolder);
      } catch (error) {
        if (
          error instanceof NoSuchElementException ||
          error instanceof WrappedTargetException ||
          error instanceof RuntimeException
        )
          throw error;
        if (!(error instanceof Exception)) throw error;
        try {
          const payload = withCaughtException(error, getCaughtException),
            message = literal("This package is unusable!"),
            self = new Reference<XInterface>(this);
          try {
            throw new WrappedTargetException(message, self, payload);
          } finally {
            self.dispose();
            message.dispose();
            payload.dispose();
          }
        } finally {
          error.dispose();
        }
      } finally {
        encryption.dispose();
      }
      try {
        if (!input.is()) throw new RuntimeException();
        return new Any(input.getAddress(), ["Reference", XInputStream.static_type]);
      } finally {
        input.dispose();
      }
    } finally {
      guard.dispose();
    }
  }
  /** Original EntryHash traversal and defensive source size resynchronization. @returns Owned native name sequence. */
  getElementNames(): Sequence<rtl_uStringSlot> {
    const guard = new MutexGuard(this.m_aMutexHolder.operatorStar().GetMutex());
    try {
      const entries = this.checkedZip().GetEntryHash(),
        names = new Strings(entries.size());
      let length = 0;
      for (const entry of entries.values()) {
        if (names.getLength() < ++length) names.realloc(length);
        rtl_uString_assign(names.operatorIndex(length - 1), entry.sPath.pData);
      }
      if (names.getLength() !== length) names.realloc(length);
      return names;
    } finally {
      guard.dispose();
    }
  }
  /** Original exact-name membership. @param name - Borrowed name. @returns Membership. */
  hasByName(name: OUStringConstReference): boolean {
    const guard = new MutexGuard(this.m_aMutexHolder.operatorStar().GetMutex());
    try {
      return this.checkedZip().GetEntryHash().find(name) !== undefined;
    } finally {
      guard.dispose();
    }
  }
  /** Original by-value XInputStream type result. @returns Owned type. */
  getElementType(): Type {
    const guard = new MutexGuard(this.m_aMutexHolder.operatorStar().GetMutex());
    try {
      this.checkedZip();
      return new Type(XInputStream.static_type());
    } finally {
      guard.dispose();
    }
  }
  /** Original entry-count state. @returns Whether the ZIP contains entries. */
  hasElements(): boolean {
    const guard = new MutexGuard(this.m_aMutexHolder.operatorStar().GetMutex());
    try {
      return !this.checkedZip().GetEntryHash().empty();
    } finally {
      guard.dispose();
    }
  }
  /** Original first matching EntryHash stream; exceptions pass through without getByName translation. @param pattern - Borrowed native pattern. @returns Acquired actual entry stream. */
  getStreamByPattern(pattern: OUStringConstReference): Reference<XInputStream> {
    const guard = new MutexGuard(this.m_aMutexHolder.operatorStar().GetMutex());
    try {
      const zip = this.checkedZip(true),
        patterns = GetPatternsFromString_Impl(pattern),
        encryption = new RtlReference<never>();
      try {
        for (const entry of zip.GetEntryHash().values())
          if (
            StringGoodForPattern_Impl(
              entry.sPath.getStr().subarray(0, entry.sPath.getLength()),
              patterns,
            )
          ) {
            const input = zip.getDataStream(entry, encryption, null, this.m_aMutexHolder);
            if (!input.is()) {
              input.dispose();
              throw new RuntimeException();
            }
            return input;
          }
        throw new NoSuchElementException();
      } finally {
        encryption.dispose();
        patterns.dispose();
      }
    } finally {
      guard.dispose();
    }
  }
  /** Original dispose notifies before setting the disposed flag, drops the ZIP and closes only URI-owned content. @returns Nothing. */
  dispose(): void {
    const guard = new MutexGuard(this.m_aMutexHolder.operatorStar().GetMutex());
    try {
      if (this.m_bDisposed) throw new DisposedException();
      if (this.m_pListenersContainer !== null) {
        const self = new Reference<XInterface>(this),
          event = new EventObject(self);
        try {
          this.m_pListenersContainer.disposeAndClear(event);
          this.m_pListenersContainer.dispose();
          this.m_pListenersContainer = null;
        } finally {
          event.dispose();
          self.dispose();
        }
      }
      this.m_pZipFile?.dispose();
      this.m_pZipFile = null;
      if (this.m_xContentStream.is() && this.m_bOwnContent)
        try {
          this.m_xContentStream.operatorStar().closeInput();
        } catch (error) {
          if (!(error instanceof Exception)) throw error;
          error.dispose();
        }
      this.m_bDisposed = true;
    } finally {
      guard.dispose();
    }
  }
  /** Original listener addition with lazy actual container construction. @param listener - Actual event listener reference. @returns Nothing. */
  addEventListener(listener: Reference<XEventListener>): void {
    const guard = new MutexGuard(this.m_aMutexHolder.operatorStar().GetMutex());
    try {
      if (this.m_bDisposed) throw new DisposedException();
      if (this.m_pListenersContainer === null)
        this.m_pListenersContainer = new (OInterfaceContainerHelper3.specialize<XEventListener>(
          XEventListener,
        ))();
      this.m_pListenersContainer.addInterface(listener);
    } finally {
      guard.dispose();
    }
  }
  /** Original listener removal is a no-op before container construction. @param listener - Actual event listener reference. @returns Nothing. */
  removeEventListener(listener: Reference<XEventListener>): void {
    const guard = new MutexGuard(this.m_aMutexHolder.operatorStar().GetMutex());
    try {
      if (this.m_bDisposed) throw new DisposedException();
      this.m_pListenersContainer?.removeInterface(listener);
    } finally {
      guard.dispose();
    }
  }
  /** Original implementation identity. @returns Owned name. */
  getImplementationName(): OUString {
    return literal("com.sun.star.comp.package.zip.ZipFileAccess");
  }
  /** Original service predicate through actual getSupportedServiceNames. @param service - Native requested name. @returns Membership. */
  supportsService(service: OUString): boolean {
    return supportsService(this, service);
  }
  /** Original two aliases, including the plural comp.packages alias. @returns Owned service names. */
  getSupportedServiceNames(): Sequence<rtl_uStringSlot> {
    const result = new Strings(2),
      first = literal("com.sun.star.packages.zip.ZipFileAccess"),
      second = literal("com.sun.star.comp.packages.zip.ZipFileAccess");
    try {
      rtl_uString_assign(result.operatorIndex(0), first.pData);
      rtl_uString_assign(result.operatorIndex(1), second.pData);
      return result;
    } finally {
      second.dispose();
      first.dispose();
    }
  }
}
/** Original acquired component constructor. @param context - Actual raw context. @param args - Ignored constructor arguments; XInitialization owns initialization. @returns Acquired component. */
export function package_OZipFileAccess_get_implementation(
  context: XComponentContext | null,
  args: Sequence<Any>,
): XInterface {
  void args;
  const reference = new Reference(context);
  try {
    return acquire(new OZipFileAccess(reference));
  } finally {
    reference.dispose();
  }
}
