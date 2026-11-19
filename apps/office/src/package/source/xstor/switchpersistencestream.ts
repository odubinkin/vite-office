/** @fileoverview Original SwitchablePersistenceStream source persistence/UNO/ByteReader owner. Original guarded IO uses the actual pinned libc++ std::mutex binding; native pthread race behavior remains unqualified. CopyAndSwitchPersistenceTo uses the actual TempFileFastService for the original empty-target path, without a substitute stream. */
import { Mutex, ScopedLock } from "../../../external/libcxx/mutex";
import type { ByteElements } from "../../../sal/inc/rtl/byteseq.h";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import {
  Reference,
  UNO_QUERY,
  UNO_QUERY_THROW,
} from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { NotConnectedException } from "../../../cppu/inc/com/sun/star/io/NotConnectedException";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { XStream } from "../../../udkapi/com/sun/star/io/XStream";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import { XTruncate } from "../../../udkapi/com/sun/star/io/XTruncate";
import { XAsyncOutputMonitor } from "../../../udkapi/com/sun/star/io/XAsyncOutputMonitor";
import { BYTE_READER, ByteReader } from "../../../comphelper/inc/bytereader";
import { OStorageHelper } from "../../../comphelper/source/misc/storagehelper";
import { TempFileFastService } from "../../../unotools/inc/tempfile";
import { OUString, OUStringLiteral } from "../../../sal/inc/rtl/ustring";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Original concrete aggregate owns original capabilities and logical open flags. */
class SPStreamData_Impl {
  readonly m_xOrigTruncate: Reference<XTruncate>;
  readonly m_xOrigSeekable: Reference<XSeekable>;
  readonly m_xOrigInStream: Reference<XInputStream>;
  readonly m_xOrigOutStream: Reference<XOutputStream>;
  readonly m_pByteReader: ByteReader | null;
  /** Original by-value/move member initialization retains independent source references. @param m_bInStreamBased - Input-only persistence. @param truncate - Actual capability. @param seekable - Actual seek capability. @param input - Actual input. @param output - Actual output. @param m_bInOpen - Previous input flag. @param m_bOutOpen - Previous output flag. @returns Aggregate. */
  constructor(
    readonly m_bInStreamBased: boolean,
    truncate: Reference<XTruncate>,
    seekable: Reference<XSeekable>,
    input: Reference<XInputStream>,
    output: Reference<XOutputStream>,
    public m_bInOpen: boolean,
    public m_bOutOpen: boolean,
  ) {
    this.m_xOrigTruncate = new Reference(truncate);
    this.m_xOrigSeekable = new Reference(seekable);
    this.m_xOrigInStream = new Reference(input);
    this.m_xOrigOutStream = new Reference(output);
    const candidate = this.m_xOrigInStream.get();
    this.m_pByteReader = candidate instanceof ByteReader ? candidate : null;
  }
  /** Original reverse member release; underlying close methods are not called. @returns Nothing. */ dispose(): void {
    this.m_xOrigOutStream.dispose();
    this.m_xOrigInStream.dispose();
    this.m_xOrigSeekable.dispose();
    this.m_xOrigTruncate.dispose();
  }
}
/** Actual original six-interface component and explicit non-UNO ByteReader base. */
export class SwitchablePersistenceStream
  extends WeakImplHelper.specialize(
    XStream,
    XInputStream,
    XOutputStream,
    XTruncate,
    XSeekable,
    XAsyncOutputMonitor,
  )
  implements
    XStream,
    XInputStream,
    XOutputStream,
    XTruncate,
    XSeekable,
    XAsyncOutputMonitor,
    ByteReader
{
  readonly [BYTE_READER] = true as const;
  private readonly m_aMutex = new Mutex();
  private m_pStreamData: SPStreamData_Impl | null = null;
  /** Original static stream/input constructor overload selection is explicit at the erased compiler boundary. @param source - Actual persistence stream. @param mode - Original selected constructor. @returns Component. */
  constructor(source: Reference<XStream> | Reference<XInputStream>, mode: "stream" | "input") {
    super();
    try {
      this.SwitchPersistenceTo(source, mode);
    } catch (error) {
      this.destroy();
      throw error;
    }
  }
  /** Original length check and position/open-state transfer occur before old persistence release. @param source - Actual new persistence. @param mode - Original static overload selection. @returns Nothing. */
  SwitchPersistenceTo(
    source: Reference<XStream> | Reference<XInputStream>,
    mode: "stream" | "input",
  ): void {
    const truncate = new Reference<XTruncate>(),
      seekable = new Reference<XSeekable>(),
      input = new Reference<XInputStream>(),
      output = new Reference<XOutputStream>();
    try {
      if (mode === "stream") truncate.set(source, UNO_QUERY_THROW, XTruncate.static_type);
      seekable.set(source, UNO_QUERY_THROW, XSeekable.static_type);
      if (mode === "stream") {
        const stream = source as Reference<XStream>,
          nextInput = stream.operatorStar().getInputStream();
        try {
          input.assign(nextInput);
        } finally {
          nextInput.dispose();
        }
        const nextOutput = stream.operatorStar().getOutputStream();
        try {
          output.assign(nextOutput);
        } finally {
          nextOutput.dispose();
        }
        if (!input.is() || !output.is()) throw new RuntimeException();
      } else {
        input.assign(source as Reference<XInputStream>);
        if (!input.is()) throw new RuntimeException();
      }
      let position = 0n,
        inOpen = false,
        outOpen = false;
      if (this.m_pStreamData !== null && this.m_pStreamData.m_xOrigSeekable.is()) {
        const previous = this.m_pStreamData;
        if (
          previous.m_xOrigSeekable.operatorStar().getLength() !==
          seekable.operatorStar().getLength()
        )
          throw new RuntimeException();
        position = previous.m_xOrigSeekable.operatorStar().getPosition();
        inOpen = previous.m_bInOpen;
        outOpen = previous.m_bOutOpen;
      }
      seekable.operatorStar().seek(position);
      this.CloseAll_Impl();
      this.m_pStreamData = new SPStreamData_Impl(
        mode === "input",
        truncate,
        seekable,
        input,
        output,
        inOpen,
        outOpen,
      );
    } finally {
      output.dispose();
      input.dispose();
      seekable.dispose();
      truncate.dispose();
    }
  }
  /** Original copy-to-empty-target or real TempFileFastService path. It intentionally has no mutex guard and requires connected persistence, as upstream does. @param source - Actual empty target, or empty reference selecting an original temporary stream. @returns Nothing. */
  CopyAndSwitchPersistenceTo(source: Reference<XStream>): void {
    const target = new Reference<XStream>(source),
      seek = new Reference<XSeekable>();
    try {
      if (!target.is()) {
        target.set(new TempFileFastService());
        seek.set(target, UNO_QUERY_THROW, XSeekable.static_type);
      } else {
        seek.set(target, UNO_QUERY_THROW, XSeekable.static_type);
        if (seek.operatorStar().getLength() !== 0n) {
          const message = new OUString(
              new OUStringLiteral(
                Uint16Array.from(
                  "provided stream not empty\0",
                  /** Binds original UTF16 diagnostic. @param unit - Source unit. @returns UTF16 value. */ (
                    unit,
                  ) => unit.charCodeAt(0),
                ),
              ),
            ),
            context = new Reference();
          try {
            throw new IOException(message, context);
          } finally {
            context.dispose();
            message.dispose();
          }
        }
      }
      const truncate = new Reference<XTruncate>(target, UNO_QUERY_THROW, XTruncate.static_type);
      try {
        const input = target.operatorStar().getInputStream();
        try {
          const output = target.operatorStar().getOutputStream();
          try {
            if (!input.is() || !output.is()) throw new RuntimeException();
            const previous = this.m_pStreamData as SPStreamData_Impl;
            if (!previous.m_xOrigInStream.is() || !previous.m_xOrigSeekable.is())
              throw new RuntimeException();
            const position = previous.m_xOrigSeekable.operatorStar().getPosition();
            previous.m_xOrigSeekable.operatorStar().seek(0n);
            OStorageHelper.CopyInputToOutput(previous.m_xOrigInStream, output);
            output.operatorStar().flush();
            seek.operatorStar().seek(position);
            const inOpen = previous.m_bInOpen,
              outOpen = previous.m_bOutOpen;
            this.CloseAll_Impl();
            this.m_pStreamData = new SPStreamData_Impl(
              false,
              truncate,
              seek,
              input,
              output,
              inOpen,
              outOpen,
            );
          } finally {
            output.dispose();
          }
        } finally {
          input.dispose();
        }
      } finally {
        truncate.dispose();
      }
    } finally {
      seek.dispose();
      target.dispose();
    }
  }
  /** Original unique_ptr reset nulls current data before deleting it. @returns Nothing. */ private CloseAll_Impl(): void {
    const previous = this.m_pStreamData;
    this.m_pStreamData = null;
    previous?.dispose();
  }
  /** Original destructor clears persistence before actual interface base destruction. @returns Nothing. */ protected override destroy(): void {
    this.CloseAll_Impl();
    this.m_aMutex.dispose();
    super.destroy();
  }
  /** Original returns this interface even after disconnect; present data only records logical openness. @returns Acquired input facet. */ getInputStream(): Reference<XInputStream> {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      if (this.m_pStreamData !== null) this.m_pStreamData.m_bInOpen = true;
      return new Reference(this);
    } finally {
      guard.dispose();
    }
  }
  /** Original returns output even for input-only persistence; writing then reports IOException. @returns Acquired output facet. */ getOutputStream(): Reference<XOutputStream> {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      if (this.m_pStreamData !== null) this.m_pStreamData.m_bOutOpen = true;
      return new Reference(this);
    } finally {
      guard.dispose();
    }
  }
  /** Original counted read checks connection and input capability then delegates. @param data - Actual out Sequence. @param count - Requested count. @returns Read count. */ readBytes(
    data: Sequence<number>,
    count: number,
  ): number {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      if (this.m_pStreamData === null) throw new NotConnectedException();
      if (!this.m_pStreamData.m_xOrigInStream.is()) throw new RuntimeException();
      return this.m_pStreamData.m_xOrigInStream.operatorStar().readBytes(data, count);
    } finally {
      guard.dispose();
    }
  }
  /** Original pointer crosscast fast path or native Sequence/memcpy fallback, with no alternate input provider. @param data - Native selected destination. @param count - Requested count. @returns Read count. */ readSomeBytes(
    data: Sequence<number> | ByteElements,
    count: number,
  ): number {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      if (this.m_pStreamData === null) throw new NotConnectedException();
      const current = this.m_pStreamData;
      if (!current.m_xOrigInStream.is()) throw new RuntimeException();
      if (data instanceof Sequence)
        return current.m_xOrigInStream.operatorStar().readSomeBytes(data, count);
      if (current.m_pByteReader !== null) return current.m_pByteReader.readSomeBytes(data, count);
      const sequence = new Bytes();
      try {
        const read = current.m_xOrigInStream.operatorStar().readSomeBytes(sequence, count),
          source = sequence.getConstArray() as SequenceElements;
        const target = ArrayBuffer.isView(data)
          ? new Int8Array(data.buffer, data.byteOffset)
          : null;
        for (let i = 0; i < read; ++i) {
          const value = (source.get(i) as [number])[0];
          if (target) target[i] = value;
          else ((data as SequenceElements).get(i) as [number])[0] = value;
        }
        return read;
      } finally {
        sequence.dispose();
      }
    } finally {
      guard.dispose();
    }
  }
  /** Original skip delegates to the same retained input. @param count - Count. @returns Nothing. */ skipBytes(
    count: number,
  ): void {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      if (this.m_pStreamData === null) throw new NotConnectedException();
      if (!this.m_pStreamData.m_xOrigInStream.is()) throw new RuntimeException();
      this.m_pStreamData.m_xOrigInStream.operatorStar().skipBytes(count);
    } finally {
      guard.dispose();
    }
  }
  /** Original availability query. @returns Bytes available. */ available(): number {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      if (this.m_pStreamData === null) throw new NotConnectedException();
      if (!this.m_pStreamData.m_xOrigInStream.is()) throw new RuntimeException();
      return this.m_pStreamData.m_xOrigInStream.operatorStar().available();
    } finally {
      guard.dispose();
    }
  }
  /** Original logical close disconnects only when the opposite side is not open. @returns Nothing. */ closeInput(): void {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      if (this.m_pStreamData === null) throw new NotConnectedException();
      this.m_pStreamData.m_bInOpen = false;
      if (!this.m_pStreamData.m_bOutOpen) this.CloseAll_Impl();
    } finally {
      guard.dispose();
    }
  }
  /** Original input-only persistence rejects writing independently of whether its output facet was requested. @param data - Native bytes. @returns Nothing. */ writeBytes(
    data: Sequence<number>,
  ): void {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      if (this.m_pStreamData === null) throw new NotConnectedException();
      if (this.m_pStreamData.m_bInStreamBased) throw new IOException();
      if (!this.m_pStreamData.m_xOrigOutStream.is()) throw new RuntimeException();
      this.m_pStreamData.m_xOrigOutStream.operatorStar().writeBytes(data);
    } finally {
      guard.dispose();
    }
  }
  /** Original closed/input-only flush is a diagnostic-only no-op; no new exception is introduced. @returns Nothing. */ flush(): void {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      if (this.m_pStreamData === null || this.m_pStreamData.m_bInStreamBased) return;
      if (!this.m_pStreamData.m_xOrigOutStream.is()) throw new RuntimeException();
      this.m_pStreamData.m_xOrigOutStream.operatorStar().flush();
    } finally {
      guard.dispose();
    }
  }
  /** Original logical output close does not close the retained original output. @returns Nothing. */ closeOutput(): void {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      if (this.m_pStreamData === null) throw new NotConnectedException();
      this.m_pStreamData.m_bOutOpen = false;
      if (!this.m_pStreamData.m_bInOpen) this.CloseAll_Impl();
    } finally {
      guard.dispose();
    }
  }
  /** Original input-only truncate rejection and real truncate capability delegation. @returns Nothing. */ truncate(): void {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      if (this.m_pStreamData === null) throw new NotConnectedException();
      if (this.m_pStreamData.m_bInStreamBased) throw new IOException();
      if (!this.m_pStreamData.m_xOrigTruncate.is()) throw new RuntimeException();
      this.m_pStreamData.m_xOrigTruncate.operatorStar().truncate();
    } finally {
      guard.dispose();
    }
  }
  /** Original seek delegation. @param location - Native signed64 offset. @returns Nothing. */ seek(
    location: bigint,
  ): void {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      if (this.m_pStreamData === null) throw new NotConnectedException();
      if (!this.m_pStreamData.m_xOrigSeekable.is()) throw new RuntimeException();
      this.m_pStreamData.m_xOrigSeekable.operatorStar().seek(location);
    } finally {
      guard.dispose();
    }
  }
  /** Original position query. @returns Signed64 position. */ getPosition(): bigint {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      if (this.m_pStreamData === null) throw new NotConnectedException();
      if (!this.m_pStreamData.m_xOrigSeekable.is()) throw new RuntimeException();
      return this.m_pStreamData.m_xOrigSeekable.operatorStar().getPosition();
    } finally {
      guard.dispose();
    }
  }
  /** Original length query. @returns Signed64 size. */ getLength(): bigint {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      if (this.m_pStreamData === null) throw new NotConnectedException();
      if (!this.m_pStreamData.m_xOrigSeekable.is()) throw new RuntimeException();
      return this.m_pStreamData.m_xOrigSeekable.operatorStar().getLength();
    } finally {
      guard.dispose();
    }
  }
  /** Original unlocked monitor query; absent monitor is a no-op, not an invented completion provider. @returns Nothing. */ waitForCompletion(): void {
    if (this.m_pStreamData === null) throw new NotConnectedException();
    const monitor = new Reference<XAsyncOutputMonitor>(
      this.m_pStreamData.m_xOrigOutStream,
      UNO_QUERY,
      XAsyncOutputMonitor.static_type,
    );
    try {
      if (monitor.is()) monitor.operatorStar().waitForCompletion();
    } finally {
      monitor.dispose();
    }
  }
}
