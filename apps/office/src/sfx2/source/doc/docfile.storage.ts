/** @fileoverview Native SfxMedium stream and storage state from docfile.cxx. */
import { OStorageHelper } from "../../../comphelper/inc/storagehelper";
import { SequenceAsHashMap } from "../../../comphelper/source/misc/sequenceashashmap";
import {
  ErrCodeMsg,
  ERRCODE_IO_GENERAL,
  ERRCODE_IO_NOTEXISTS,
} from "../../../comphelper/inc/errcode";
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Sequence, type SequenceReference } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { READ, READWRITE } from "../../../offapi/com/sun/star/embed/ElementModes";
import type { XStorage } from "../../../offapi/com/sun/star/embed/XStorage";
import { XTransactedObject } from "../../../offapi/com/sun/star/embed/XTransactedObject";
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { PropertyValue } from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import { XStream } from "../../../udkapi/com/sun/star/io/XStream";
import { TempFileFastService } from "../../../unotools/inc/tempfile";

const Bytes = Sequence.specialize<number>("sal_Int8", 1);

/** Native descriptor properties used by the storage and transfer paths. */
export class SfxMediumStorage {
  readonly url = new OUString();
  readonly readOnly: boolean;
  private readonly xInputStream = new Reference<XInputStream>();
  private readonly xStream = new Reference<XStream>();
  private readonly xOutputStream = new Reference<XOutputStream>();
  private readonly xStorage = new Reference<XStorage>();
  private readonly temp = new Reference<TempFileFastService>();
  private triedStorage = false;
  private readonly privateStream: boolean;

  /** Retains the converted descriptor fields and keeps their UNO lifetimes independent of GetArgs. @param args - Original media descriptor. @returns Storage state. */
  constructor(args: SequenceReference<PropertyValue>) {
    const fields = new SequenceAsHashMap(args, "PropertyValue");
    const url = unicode("URL"),
      readOnly = unicode("ReadOnly"),
      stream = unicode("Stream"),
      input = unicode("InputStream"),
      output = unicode("OutputStream"),
      privateStream = unicode("private:stream");
    try {
      if (!fields.find(url)?.[1].extract(this.url, "OUString")) throw new RuntimeException();
      this.readOnly = fields.getUnpackedValueOrDefault(readOnly, false, "bool");
      fields
        .find(stream)?.[1]
        .extract(this.xStream.getAddress(), ["Reference", XStream.static_type]);
      fields
        .find(input)?.[1]
        .extract(this.xInputStream.getAddress(), ["Reference", XInputStream.static_type]);
      this.privateStream = this.url.startsWith(privateStream);
      if (this.privateStream)
        fields
          .find(output)?.[1]
          .extract(this.xOutputStream.getAddress(), ["Reference", XOutputStream.static_type]);
    } catch (error) {
      this.dispose();
      throw error;
    } finally {
      privateStream.dispose();
      output.dispose();
      input.dispose();
      stream.dispose();
      readOnly.dispose();
      url.dispose();
      fields.dispose();
    }
  }

  /** Opens the cached storage through the original stream/input/URL factory order. @returns Owned storage, or empty after a UNO failure. */
  GetStorage(): Reference<XStorage> {
    if (!this.triedStorage && !this.xStorage.is()) {
      try {
        const storage = this.temp.is()
          ? OStorageHelper.GetStorageFromStream(this.temp, READWRITE)
          : this.xStream.is()
            ? OStorageHelper.GetStorageFromStream(this.xStream, READWRITE)
            : this.xInputStream.is()
              ? OStorageHelper.GetStorageFromInputStream(this.xInputStream)
              : OStorageHelper.GetStorageFromURL(this.url, READ);
        try {
          this.xStorage.moveAssign(storage);
        } finally {
          storage.dispose();
        }
      } catch (error) {
        if (!(error instanceof Exception)) throw error;
        error.dispose();
      }
      this.triedStorage = true;
    }
    return new Reference(this.xStorage);
  }

  /** Creates a temporary package destination without copying the existing document. @returns Owned output storage. */
  GetOutputStorage(): Reference<XStorage> {
    if (!this.temp.is()) {
      if (this.xStorage.is() && this.url.isEmpty()) return new Reference(this.xStorage);
      this.CloseStorage();
      this.temp.set(new TempFileFastService());
    }
    return this.GetStorage();
  }

  /** Commits the native transaction before transferring temporary contents. @returns Source diagnostic. */
  Commit(): ErrCodeMsg {
    const transaction = new Reference<XTransactedObject>(
      this.xStorage,
      UNO_QUERY,
      XTransactedObject.static_type,
    );
    try {
      if (transaction.is()) transaction.operatorStar().commit();
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
      return new ErrCodeMsg(ERRCODE_IO_GENERAL);
    } finally {
      transaction.dispose();
    }
    return this.Transfer_Impl();
  }

  /** Transfers committed data to the descriptor destination. @returns Source diagnostic. */
  private Transfer_Impl(): ErrCodeMsg {
    const temp = this.temp.get();
    if (!temp) return new ErrCodeMsg();
    // The browser exposes a caller-owned stream. URL transfer needs the
    // source UCB content provider and the transacted filesystem path.
    if (!this.privateStream) return new ErrCodeMsg(ERRCODE_IO_NOTEXISTS);
    const input = temp.getInputStream();
    try {
      temp.seek(0n);
      return this.TransferToOutput(input);
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
      return new ErrCodeMsg(ERRCODE_IO_NOTEXISTS);
    } finally {
      input.dispose();
    }
  }

  /** Copies the source private:stream chunks without taking ownership of the caller's output stream. @param input - Temporary file input. @returns Source diagnostic. */
  private TransferToOutput(input: Reference<XInputStream>): ErrCodeMsg {
    if (!this.xOutputStream.is()) return new ErrCodeMsg(ERRCODE_IO_GENERAL);
    this.CloseStorage();
    const size = 32767,
      sequence = new Bytes(size);
    try {
      let read: number;
      do {
        read = input.operatorStar().readBytes(sequence, size);
        if (read === size) this.xOutputStream.operatorStar().writeBytes(sequence);
        else {
          const tail = new Bytes(sequence);
          try {
            this.xOutputStream.operatorStar().writeBytes(tail);
          } finally {
            tail.dispose();
          }
        }
      } while (read === size);
      this.temp.clear();
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
    } finally {
      this.xOutputStream.clear();
      sequence.dispose();
    }
    return new ErrCodeMsg();
  }

  /** Releases the medium's storage reference and retries after a later reopen. @returns Nothing. */
  private CloseStorage(): void {
    this.xStorage.clear();
    this.triedStorage = false;
  }

  /** Releases descriptor references and temporary persistence. @returns Nothing. */
  dispose(): void {
    this.CloseStorage();
    this.xStorage.dispose();
    this.temp.dispose();
    this.xOutputStream.dispose();
    this.xStream.dispose();
    this.xInputStream.dispose();
    this.url.dispose();
  }
}
