/** @fileoverview Original OTempFileService over actual default TempFileNamed, native mutex, source stream and UNO property/type owners. Debug assert-only diagnostics/physical ABI and native threading remain unqualified. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { acquire } from "../../../cppuhelper/inc/weak";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Type } from "../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType } from "../../../cppu/inc/unotype";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { Mutex, UniqueLock } from "../../../external/libcxx/mutex";
import { TempFileNamed } from "../../inc/tempfile";
import { SvStream, StreamMode } from "../../../tools/inc/stream";
import { BYTE_READER, type ByteReader } from "../../../comphelper/inc/bytereader";
import type { ByteElements } from "../../../sal/inc/rtl/byteseq.h";
import { XTempFile } from "../../../udkapi/com/sun/star/io/XTempFile";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import { XTruncate } from "../../../udkapi/com/sun/star/io/XTruncate";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import { XFastPropertySet } from "../../../udkapi/com/sun/star/beans/XFastPropertySet";
import { XPropertyAccess } from "../../../udkapi/com/sun/star/beans/XPropertyAccess";
import type { XPropertySetInfo } from "../../../udkapi/com/sun/star/beans/XPropertySetInfo";
import type { XPropertyChangeListener } from "../../../udkapi/com/sun/star/beans/XPropertyChangeListener";
import type { XVetoableChangeListener } from "../../../udkapi/com/sun/star/beans/XVetoableChangeListener";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { NotConnectedException } from "../../../cppu/inc/com/sun/star/io/NotConnectedException";
import { BufferSizeExceededException } from "../../../cppu/inc/com/sun/star/io/BufferSizeExceededException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { UnknownPropertyException } from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { OTypeCollection } from "../../../cppuhelper/inc/typeprovider";
import { OPropertyArrayHelper, OPropertySetHelper } from "../../../cppuhelper/inc/propshlp";
import {
  Property,
  cppu_detail_getUnoType_Property as propertyType,
} from "../../../udkapi/com/sun/star/beans/Property";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyValueType,
} from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { PropertyState } from "../../../udkapi/com/sun/star/beans/PropertyState";
import { READONLY } from "../../../udkapi/com/sun/star/beans/PropertyAttribute";
import { supportsService } from "../../../cppuhelper/inc/supportsservice";
const OTempFileBase = WeakImplHelper.specialize(
  XTempFile,
  XInputStream,
  XOutputStream,
  XTruncate,
  XPropertySet,
  XFastPropertySet,
  XPropertyAccess,
  XServiceInfo,
);
const Properties = Sequence.specialize<Property>(propertyType, 32),
  Values = Sequence.specialize<PropertyValue>(propertyValueType, 48),
  Strings = Sequence.specialize<rtl_uStringSlot>("OUString", 8);
let ourTypes: OTypeCollection | undefined,
  ourPropertyInfo: OPropertyArrayHelper | undefined,
  xInfo: Reference<XPropertySetInfo> | undefined;
/** Source literal binding. @param text - Original ASCII literal. @returns Owned value. */
function literal(text: string): OUString {
  return new OUString(
    Uint8Array.from(
      text + "\0",
      /** Original source literal or initialized-value address binding. @param c - Actual declared argument. @returns Original result or test completion. */ (
        c,
      ) => c.charCodeAt(0),
    ),
  );
}
/** Original initialized-array pointer lowering, without alternate UNO values. @param values - Actual initialized values. @param stride - Compiler sizeof. @returns Original logical array address. */
function address<T>(values: readonly T[], stride: number): SequenceElements {
  return {
    /** Original source literal or initialized-value address binding. @param offset - Actual declared argument. @returns Original result or test completion. */ get(
      offset: number,
    ): unknown {
      return values[offset / stride];
    },
  };
}
/** Original full temporary-file component and native ByteReader crosscast. */
export class OTempFileService
  extends OTempFileBase
  implements
    XTempFile,
    XInputStream,
    XOutputStream,
    XTruncate,
    XPropertySet,
    XFastPropertySet,
    XPropertyAccess,
    XServiceInfo,
    ByteReader
{
  readonly [BYTE_READER] = true as const;
  private mpTempFile: TempFileNamed | null = null;
  private readonly maMutex = new Mutex();
  private mpStream: SvStream | null = null;
  private mbRemoveFile = true;
  private mbInClosed = false;
  private mbOutClosed = false;
  /** Original context parameter is intentionally unused. @param context - Original context. @returns Actual service. */
  constructor(context: Reference<XComponentContext>) {
    super();
    void context;
    this.mpTempFile = new TempFileNamed();
    this.mpTempFile.EnableKillingFile();
  }
  /** Original empty destructor then reverse member/base destruction. @returns Nothing. */
  protected override destroy(): void {
    this.maMutex.dispose();
    this.mpTempFile?.dispose();
    this.mpTempFile = null;
    this.mpStream = null;
    super.destroy();
  }
  /** Original static collection prepends XPropertySet without deduplicating base declarations. @returns Owned types. */
  override getTypes(): Sequence<Type> {
    if (!ourTypes) {
      const types = OTempFileBase.prototype.getTypes.call(this);
      try {
        ourTypes = new OTypeCollection(UnoType.get(XPropertySet.static_type), types);
      } finally {
        types.dispose();
      }
    }
    return ourTypes.getTypes();
  }
  /** Original contextual disconnected exception. @returns Never. */
  private notConnected(): never {
    const message = new OUString(),
      context = new Reference(this.getXWeak());
    try {
      throw new NotConnectedException(message, context);
    } finally {
      context.dispose();
      message.dispose();
    }
  }
  /** Original contextual signed-count exception. @returns Never. */
  private badSize(): never {
    const message = new OUString(),
      context = new Reference(this.getXWeak());
    try {
      throw new BufferSizeExceededException(message, context);
    } finally {
      context.dispose();
      message.dispose();
    }
  }
  /** Original attribute disconnected RuntimeException carries only its message. @returns Never. */
  private noFile(): never {
    const message = literal("Not connected to a file."),
      context = new Reference();
    try {
      throw new RuntimeException(message, context);
    } finally {
      context.dispose();
      message.dispose();
    }
  }
  /** Original lazy READ|WRITE|DENYWRITE stream acquisition. @returns Nothing. */
  protected checkConnected(): void {
    if (!this.mpStream && this.mpTempFile)
      this.mpStream = this.mpTempFile.GetStream(
        StreamMode.READ | StreamMode.WRITE | StreamMode.SHARE_DENYWRITE,
      );
    if (!this.mpStream) this.notConnected();
  }
  /** Original masked stream error check. @returns Nothing. */
  protected checkError(): void {
    if (!this.mpStream || this.mpStream.GetError().valueOf() !== 0) this.notConnected();
  }
  /** Original locked removal flag. @returns Current flag. */
  getRemoveFile(): boolean {
    const guard = new UniqueLock(this.maMutex);
    try {
      if (!this.mpTempFile) this.noFile();
      return this.mbRemoveFile;
    } finally {
      guard.dispose();
    }
  }
  /** Original locked flag and actual owner policy. @param value - New flag. @returns Nothing. */
  setRemoveFile(value: boolean): void {
    const guard = new UniqueLock(this.maMutex);
    try {
      if (!this.mpTempFile) this.noFile();
      this.mbRemoveFile = value;
      this.mpTempFile.EnableKillingFile(value);
    } finally {
      guard.dispose();
    }
  }
  /** Original URL access flushes named file and returns by value. @returns Owned URL. */
  getUri(): OUString {
    const guard = new UniqueLock(this.maMutex);
    try {
      if (!this.mpTempFile) this.noFile();
      return new OUString(this.mpTempFile.GetURL());
    } finally {
      guard.dispose();
    }
  }
  /** Original system filename. @returns Owned path. */
  getResourceName(): OUString {
    const guard = new UniqueLock(this.maMutex);
    try {
      if (!this.mpTempFile) this.noFile();
      return this.mpTempFile.GetFileName();
    } finally {
      guard.dispose();
    }
  }
  /** Original counted sequence read with shrink only after stream error check. @param data - Actual output. @param count - Signed32 request. @returns Actual count. */
  readBytes(data: Sequence<number>, count: number): number {
    const guard = new UniqueLock(this.maMutex);
    try {
      if (this.mbInClosed) this.notConnected();
      this.checkConnected();
      if (count < 0) this.badSize();
      if (data.getLength() < count) data.realloc(count);
      const read = (this.mpStream as SvStream).ReadBytes(data.getArray(), count) >>> 0;
      this.checkError();
      if (read < data.getLength() >>> 0) data.realloc(read);
      return read | 0;
    } finally {
      guard.dispose();
    }
  }
  /** Original UNO sequence overload. @param data - Actual output. @param count - Signed32 maximum. @returns Actual count. */
  readSomeBytes(data: Sequence<number>, count: number): number;
  /** Original ByteReader pointer overload. @param data - Actual byte span. @param count - Signed32 maximum. @returns Actual count. */
  // eslint-disable-next-line @typescript-eslint/unified-signatures -- Original UNO Sequence and non-UNO ByteReader pointer overloads have different source prechecks.
  readSomeBytes(data: ByteElements, count: number): number;
  /** Compiler selects overload from the declared Sequence owner, preserving their different prechecks. @param data - Actual output. @param count - Signed32 count. @returns Read count. */
  readSomeBytes(data: Sequence<number> | ByteElements, count: number): number {
    if (data instanceof Sequence) {
      const guard = new UniqueLock(this.maMutex);
      try {
        if (this.mbInClosed) this.notConnected();
        this.checkConnected();
        this.checkError();
        if (count < 0) this.badSize();
        if ((this.mpStream as SvStream).eof()) {
          data.realloc(0);
          return 0;
        }
      } finally {
        guard.dispose();
      }
      return this.readBytes(data, count);
    }
    const guard = new UniqueLock(this.maMutex);
    try {
      if (this.mbInClosed) this.notConnected();
      this.checkConnected();
      if (count < 0) this.badSize();
      const read = (this.mpStream as SvStream).ReadBytes(data, count) >>> 0;
      this.checkError();
      return read | 0;
    } finally {
      guard.dispose();
    }
  }
  /** Original signed relative skip accepts negative counts. @param count - Signed32 count. @returns Nothing. */
  skipBytes(count: number): void {
    const guard = new UniqueLock(this.maMutex);
    try {
      if (this.mbInClosed) this.notConnected();
      this.checkConnected();
      this.checkError();
      (this.mpStream as SvStream).SeekRel(BigInt(count));
      this.checkError();
    } finally {
      guard.dispose();
    }
  }
  /** Original available saturates to signed32 maximum. @returns Available bytes. */
  available(): number {
    const guard = new UniqueLock(this.maMutex);
    try {
      if (this.mbInClosed) this.notConnected();
      this.checkConnected();
      const size = BigInt.asIntN(64, (this.mpStream as SvStream).remainingSize());
      this.checkError();
      return Number(size < 0x7fffffffn ? size : 0x7fffffffn);
    } finally {
      guard.dispose();
    }
  }
  /** Original input closure removes the file only after both ends close. @returns Nothing. */
  closeInput(): void {
    const guard = new UniqueLock(this.maMutex);
    try {
      if (this.mbInClosed) this.notConnected();
      this.mbInClosed = true;
      if (this.mbOutClosed) {
        this.mpStream = null;
        this.mpTempFile?.dispose();
        this.mpTempFile = null;
      }
    } finally {
      guard.dispose();
    }
  }
  /** Original output write/count check. @param data - Actual signed byte sequence. @returns Nothing. */
  writeBytes(data: Sequence<number>): void {
    const guard = new UniqueLock(this.maMutex);
    try {
      if (this.mbOutClosed) this.notConnected();
      this.checkConnected();
      const written =
        (this.mpStream as SvStream).WriteBytes(data.getConstArray(), data.getLength()) >>> 0;
      this.checkError();
      if (written !== data.getLength() >>> 0) this.badSize();
    } finally {
      guard.dispose();
    }
  }
  /** Original full stream flush. @returns Nothing. */
  flush(): void {
    const guard = new UniqueLock(this.maMutex);
    try {
      if (this.mbOutClosed) this.notConnected();
      this.checkConnected();
      (this.mpStream as SvStream).Flush();
      this.checkError();
    } finally {
      guard.dispose();
    }
  }
  /** Original output close flushes only byte buffer and rewinds without checking errors. @returns Nothing. */
  closeOutput(): void {
    const guard = new UniqueLock(this.maMutex);
    try {
      if (this.mbOutClosed) this.notConnected();
      this.mbOutClosed = true;
      if (this.mpStream) {
        this.mpStream.FlushBuffer();
        this.mpStream.Seek(0n);
      }
      if (this.mbInClosed) {
        this.mpStream = null;
        this.mpTempFile?.dispose();
        this.mpTempFile = null;
      }
    } finally {
      guard.dispose();
    }
  }
  /** Original bounds check and intentional UInt32 location cast. @param location - Signed64 offset. @returns Nothing. */
  seek(location: bigint): void {
    const guard = new UniqueLock(this.maMutex);
    try {
      this.checkConnected();
      this.checkError();
      const end = BigInt.asIntN(64, (this.mpStream as SvStream).TellEnd());
      if (location < 0n || location > end) throw new IllegalArgumentException();
      (this.mpStream as SvStream).Seek(BigInt.asUintN(32, location));
      this.checkError();
    } finally {
      guard.dispose();
    }
  }
  /** Original signed position projection. @returns Current position. */
  getPosition(): bigint {
    const guard = new UniqueLock(this.maMutex);
    try {
      this.checkConnected();
      const position = (this.mpStream as SvStream).Tell();
      this.checkError();
      return BigInt.asIntN(64, position);
    } finally {
      guard.dispose();
    }
  }
  /** Original length query does not check the stream again after TellEnd. @returns Length. */
  getLength(): bigint {
    const guard = new UniqueLock(this.maMutex);
    try {
      this.checkConnected();
      this.checkError();
      return BigInt.asIntN(64, (this.mpStream as SvStream).TellEnd());
    } finally {
      guard.dispose();
    }
  }
  /** Original same-object stream interface acquisition. @returns Acquired input. */
  getInputStream(): Reference<XInputStream> {
    return new Reference(this);
  }
  /** Original same-object stream interface acquisition. @returns Acquired output. */
  getOutputStream(): Reference<XOutputStream> {
    return new Reference(this);
  }
  /** Original truncate seeks zero, changes size, then checks error. @returns Nothing. */
  truncate(): void {
    const guard = new UniqueLock(this.maMutex);
    try {
      this.checkConnected();
      (this.mpStream as SvStream).Seek(0n);
      (this.mpStream as SvStream).SetStreamSize(0n);
      this.checkError();
    } finally {
      guard.dispose();
    }
  }
  /** Original static unsorted initializer plus true hint, passed to the actual helper. @returns Acquired info snapshot. */
  getPropertySetInfo(): Reference<XPropertySetInfo> {
    if (!ourPropertyInfo) {
      const rows: Property[] = [],
        names: OUString[] = [];
      try {
        for (const [name, handle, type, attributes] of [
          ["Uri", 1, "OUString", READONLY],
          ["RemoveFile", 2, "bool", 0],
          ["ResourceName", 3, "OUString", READONLY],
        ] as const) {
          const key = literal(name);
          names.push(key);
          rows.push(new Property(key, handle, UnoType.get(type), attributes));
        }
        const values = new Properties(address(rows, 32), rows.length);
        try {
          ourPropertyInfo = new OPropertyArrayHelper(values, true);
        } finally {
          values.dispose();
        }
      } finally {
        for (const row of rows) row.dispose();
        for (const key of names) key.dispose();
      }
    }
    xInfo ??= OPropertySetHelper.createPropertySetInfo(ourPropertyInfo);
    return new Reference(xInfo);
  }
  /** Original UnknownPropertyException with default empty context; release-profile post-assert behavior. @param name - Unknown name. @returns Never. */
  private unknown(name: OUStringConstReference): never {
    const context = new Reference();
    try {
      throw new UnknownPropertyException(name, context);
    } finally {
      context.dispose();
    }
  }
  /** Original writable-name-only assignment uses Any::get<bool>. @param name - Original name. @param value - Actual Any. @returns Nothing. */
  setPropertyValue(name: OUStringConstReference, value: Any): void {
    if (name.equalsAsciiL(Uint8Array.of(82, 101, 109, 111, 118, 101, 70, 105, 108, 101), 10))
      this.setRemoveFile(Any.prototype.getBoolean.call(value));
    else this.unknown(name);
  }
  /** Original exact property lookup. @param name - Original name. @returns Owned Any. */
  getPropertyValue(name: OUStringConstReference): Any {
    if (name.equalsAsciiL(Uint8Array.of(82, 101, 109, 111, 118, 101, 70, 105, 108, 101), 10))
      return new Any(this.getRemoveFile());
    let value: OUString;
    if (
      name.equalsAsciiL(Uint8Array.of(82, 101, 115, 111, 117, 114, 99, 101, 78, 97, 109, 101), 12)
    )
      value = this.getResourceName();
    else if (name.equalsAsciiL(Uint8Array.of(85, 114, 105), 3)) value = this.getUri();
    else return this.unknown(name);
    try {
      return new Any(value.getDataAddress(), "OUString");
    } finally {
      value.dispose();
    }
  }
  /** Original assert-only listener API has no release-profile registration body. @param name - Ignored source argument. @param listener - Ignored source argument. @returns Nothing. */
  addPropertyChangeListener(
    name: OUStringConstReference,
    listener: Reference<XPropertyChangeListener>,
  ): void {
    void name;
    void listener;
  }
  /** Original assert-only listener API. @param name - Ignored source argument. @param listener - Ignored source argument. @returns Nothing. */
  removePropertyChangeListener(
    name: OUStringConstReference,
    listener: Reference<XPropertyChangeListener>,
  ): void {
    void name;
    void listener;
  }
  /** Original assert-only listener API. @param name - Ignored source argument. @param listener - Ignored source argument. @returns Nothing. */
  addVetoableChangeListener(
    name: OUStringConstReference,
    listener: Reference<XVetoableChangeListener>,
  ): void {
    void name;
    void listener;
  }
  /** Original assert-only listener API. @param name - Ignored source argument. @param listener - Ignored source argument. @returns Nothing. */
  removeVetoableChangeListener(
    name: OUStringConstReference,
    listener: Reference<XVetoableChangeListener>,
  ): void {
    void name;
    void listener;
  }
  /** Original handle2-only writable assignment. @param handle - Original signed32 handle. @param value - Actual Any. @returns Nothing. */
  setFastPropertyValue(handle: number, value: Any): void {
    if (handle === 2) {
      this.setRemoveFile(Any.prototype.getBoolean.call(value));
      return;
    }
    const name = new OUString(OUString.number(handle));
    try {
      this.unknown(name);
    } finally {
      name.dispose();
    }
  }
  /** Original three-handle query. @param handle - Original signed32 handle. @returns Owned Any. */
  getFastPropertyValue(handle: number): Any {
    if (handle === 2) return new Any(this.getRemoveFile());
    let value: OUString;
    if (handle === 3) value = this.getResourceName();
    else if (handle === 1) value = this.getUri();
    else {
      const name = new OUString(OUString.number(handle));
      try {
        return this.unknown(name);
      } finally {
        name.dispose();
      }
    }
    try {
      return new Any(value.getDataAddress(), "OUString");
    } finally {
      value.dispose();
    }
  }
  /** Original Uri/RemoveFile/ResourceName order and DEFAULT_VALUE states. @returns Owned value sequence. */
  getPropertyValues(): Sequence<PropertyValue> {
    const rows: PropertyValue[] = [],
      keys: OUString[] = [],
      values: Any[] = [];
    try {
      for (const [name, handle] of [
        ["Uri", 1],
        ["RemoveFile", 2],
        ["ResourceName", 3],
      ] as const) {
        const key = literal(name);
        keys.push(key);
        const value = this.getFastPropertyValue(handle);
        values.push(value);
        rows.push(new PropertyValue(key, handle, value, PropertyState.DEFAULT_VALUE));
      }
      return new Values(address(rows, 48), rows.length);
    } finally {
      for (const row of rows) row.dispose();
      for (const value of values) value.dispose();
      for (const key of keys) key.dispose();
    }
  }
  /** Original ordered loop stops at first failure without rollback. @param values - Actual value sequence. @returns Nothing. */
  setPropertyValues(values: Sequence<PropertyValue>): void {
    const data = values.getConstArray() as SequenceElements;
    for (let i = 0; i < values.getLength(); i++) {
      const row = PropertyValue.unacquired(
        data.get(i * 48) as Parameters<typeof PropertyValue.unacquired>[0],
      );
      this.setPropertyValue(row.Name, row.Value as Any);
    }
  }
  /** Original service support helper. @param name - Original service name. @returns Support. */
  supportsService(name: OUStringConstReference): boolean {
    return supportsService(this, name);
  }
  /** Original implementation identity. @returns Owned identity. */
  getImplementationName(): OUString {
    return literal("com.sun.star.io.comp.TempFile");
  }
  /** Original one-service list. @returns Owned names. */
  getSupportedServiceNames(): Sequence<rtl_uStringSlot> {
    const name = literal("com.sun.star.io.TempFile");
    try {
      return new Strings(address([name.getDataAddress()], 8), 1);
    } finally {
      name.dispose();
    }
  }
}
/** Original acquired constructor entry point. @param context - Actual raw context. @param args - Ignored source arguments. @returns Acquired actual component. */
export function unotools_OTempFileService_get_implementation(
  context: XComponentContext | null,
  args: Sequence<Any>,
): XInterface {
  void args;
  const owner = new Reference(context);
  try {
    return acquire(new OTempFileService(owner));
  } finally {
    owner.dispose();
  }
}
