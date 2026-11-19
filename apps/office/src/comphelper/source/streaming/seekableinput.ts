/** @fileoverview Original OSeekableInputWrapper.cxx on actual UNO streams, native std::mutex and generated TempFile service construction. Full copy requires the actual OTempFileService; no memory-stream or fake factory fallback is installed. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import { TempFile } from "../../../udkapi/com/sun/star/io/TempFile";
import {
  Reference,
  UNO_QUERY,
  UNO_QUERY_THROW,
} from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { BYTE_READER, ByteReader } from "../../inc/bytereader";
import type { ByteElements } from "../../../sal/inc/rtl/byteseq.h";
import { Mutex, ScopedLock } from "../../../external/libcxx/mutex";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { NotConnectedException } from "../../../cppu/inc/com/sun/star/io/NotConnectedException";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
const nConstBufferSize = 32000;
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Known source ASCII literal. @param value - Text. @returns Native string. */
function literal(value: string): OUString {
  return new OUString(
    Uint8Array.from(
      value + "\0",
      /** Source ASCII unit. @param c - Unit. @returns Byte. */ (c) => c.charCodeAt(0),
    ),
  );
}
/** Original exact-size temporary for the final short read, including zero-byte terminal writes. @param input - Source. @param output - Real TempFile output. @returns Nothing. */
function copyInputToOutput_Impl(
  input: Reference<XInputStream>,
  output: Reference<XOutputStream>,
): void {
  const data = new Bytes(nConstBufferSize);
  try {
    let read: number;
    do {
      read = input.operatorStar().readBytes(data, nConstBufferSize);
      if (read < nConstBufferSize) {
        const tail = new Bytes(data.getConstArray() as SequenceElements, read);
        try {
          output.operatorStar().writeBytes(tail);
        } finally {
          tail.dispose();
        }
      } else output.operatorStar().writeBytes(data);
    } while (read === nConstBufferSize);
  } finally {
    data.dispose();
  }
}
/** Original exported template base; interfaces are implemented by the actual final class. */
export abstract class OSeekableInputWrapper_BASE extends WeakImplHelper.specialize(
  XInputStream,
  XSeekable,
) {}
/** Actual original final wrapper, with deferred real TempFile creation and no substitute provider. */
export class OSeekableInputWrapper
  extends OSeekableInputWrapper_BASE
  implements XInputStream, XSeekable, ByteReader
{
  readonly [BYTE_READER] = true as const;
  private readonly m_aMutex = new Mutex();
  private readonly m_xContext: Reference<XComponentContext>;
  private readonly m_xOriginalStream: Reference<XInputStream>;
  private readonly m_xCopyInput = new Reference<XInputStream>();
  private readonly m_xCopySeek = new Reference<XSeekable>();
  private m_pCopyByteReader: ByteReader | null = null;
  /** Original context check after native member construction. @param input - Input. @param context - Context. @returns Component. */
  constructor(input: Reference<XInputStream>, context: Reference<XComponentContext>) {
    super();
    this.m_xContext = new Reference(context);
    this.m_xOriginalStream = new Reference(input);
    try {
      if (!this.m_xContext.is()) {
        const message = literal("no component context"),
          self = new Reference(this);
        try {
          throw new IllegalArgumentException(message, self, 1);
        } finally {
          self.dispose();
          message.dispose();
        }
      }
    } catch (error) {
      this.destroy();
      throw error;
    }
  }
  /** Original reverse native member/base destruction. @returns Nothing. */
  protected override destroy(): void {
    this.m_xCopySeek.dispose();
    this.m_xCopyInput.dispose();
    this.m_xOriginalStream.dispose();
    this.m_xContext.dispose();
    this.m_aMutex.dispose();
    super.destroy();
  }
  /** Original seekable identity fast path; otherwise construct the actual lazy wrapper. @param input - Input. @param context - Context. @returns Acquired input. */
  static CheckSeekableCanWrap(
    input: Reference<XInputStream>,
    context: Reference<XComponentContext>,
  ): Reference<XInputStream> {
    const seek = new Reference<XSeekable>(input, UNO_QUERY, XSeekable.static_type);
    try {
      return seek.is()
        ? new Reference(input)
        : new Reference(new OSeekableInputWrapper(input, context));
    } finally {
      seek.dispose();
    }
  }
  /** Original deferred TempFile/copy/query sequence. No factory failure is swallowed or turned into a successful empty stream. @returns Nothing. */
  private PrepareCopy_Impl(): void {
    if (!this.m_xCopyInput.is()) {
      if (!this.m_xContext.is()) {
        const message = literal("no component context"),
          context = new Reference();
        try {
          throw new RuntimeException(message, context);
        } finally {
          context.dispose();
          message.dispose();
        }
      }
      const temporary = TempFile.create(this.m_xContext);
      let output: Reference<XOutputStream>;
      try {
        output = new Reference<XOutputStream>(
          temporary,
          UNO_QUERY_THROW,
          XOutputStream.static_type,
        );
      } finally {
        temporary.dispose();
      }
      try {
        copyInputToOutput_Impl(this.m_xOriginalStream, output);
        output.operatorStar().closeOutput();
        const seek = new Reference<XSeekable>(output, UNO_QUERY, XSeekable.static_type);
        try {
          if (seek.is()) {
            seek.operatorStar().seek(0n);
            this.m_xCopyInput.set(output, UNO_QUERY, XInputStream.static_type);
            if (this.m_xCopyInput.is()) {
              this.m_xCopySeek.moveAssign(seek);
              const reader = output.get();
              this.m_pCopyByteReader = reader instanceof ByteReader ? reader : null;
              // Original assert(m_pCopyByteReader) remains an unqualified debug domain.
            }
          }
        } finally {
          seek.dispose();
        }
      } finally {
        output.dispose();
      }
    }
    if (!this.m_xCopyInput.is()) {
      const message = literal("no m_xCopyInput"),
        context = new Reference();
      try {
        throw new IOException(message, context);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
  }
  /** Original guarded read; closed original fails before any copy/service lookup. @param data - Output. @param count - Count. @returns Bytes. */
  readBytes(data: Sequence<number>, count: number): number {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      if (!this.m_xOriginalStream.is()) throw new NotConnectedException();
      this.PrepareCopy_Impl();
      return this.m_xCopyInput.operatorStar().readBytes(data, count);
    } finally {
      guard.dispose();
    }
  }
  /** Original Sequence and ByteReader overloads. @param data - Output. @param count - Count. @returns Bytes. */
  readSomeBytes(data: Sequence<number> | ByteElements, count: number): number {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      if (!this.m_xOriginalStream.is()) throw new NotConnectedException();
      this.PrepareCopy_Impl();
      return data instanceof Sequence
        ? this.m_xCopyInput.operatorStar().readSomeBytes(data, count)
        : (this.m_pCopyByteReader as ByteReader).readSomeBytes(data, count);
    } finally {
      guard.dispose();
    }
  }
  /** Original guarded skip. @param count - Count. @returns Nothing. */
  skipBytes(count: number): void {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      if (!this.m_xOriginalStream.is()) throw new NotConnectedException();
      this.PrepareCopy_Impl();
      this.m_xCopyInput.operatorStar().skipBytes(count);
    } finally {
      guard.dispose();
    }
  }
  /** Original guarded availability after preparing the copy. @returns Count. */
  available(): number {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      if (!this.m_xOriginalStream.is()) throw new NotConnectedException();
      this.PrepareCopy_Impl();
      return this.m_xCopyInput.operatorStar().available();
    } finally {
      guard.dispose();
    }
  }
  /** Original close propagates before clearing each original reference. @returns Nothing. */
  closeInput(): void {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      if (!this.m_xOriginalStream.is()) throw new NotConnectedException();
      this.m_xOriginalStream.operatorStar().closeInput();
      this.m_xOriginalStream.clear();
      if (this.m_xCopyInput.is()) {
        this.m_xCopyInput.operatorStar().closeInput();
        this.m_xCopyInput.clear();
      }
      this.m_xCopySeek.clear();
      this.m_pCopyByteReader = null;
    } finally {
      guard.dispose();
    }
  }
  /** Original guarded delegated seek. @param location - Position. @returns Nothing. */
  seek(location: bigint): void {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      if (!this.m_xOriginalStream.is()) throw new NotConnectedException();
      this.PrepareCopy_Impl();
      this.m_xCopySeek.operatorStar().seek(location);
    } finally {
      guard.dispose();
    }
  }
  /** Original guarded delegated position. @returns Position. */
  getPosition(): bigint {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      if (!this.m_xOriginalStream.is()) throw new NotConnectedException();
      this.PrepareCopy_Impl();
      return this.m_xCopySeek.operatorStar().getPosition();
    } finally {
      guard.dispose();
    }
  }
  /** Original guarded delegated length. @returns Length. */
  getLength(): bigint {
    const guard = new ScopedLock(this.m_aMutex);
    try {
      if (!this.m_xOriginalStream.is()) throw new NotConnectedException();
      this.PrepareCopy_Impl();
      return this.m_xCopySeek.operatorStar().getLength();
    } finally {
      guard.dispose();
    }
  }
}
