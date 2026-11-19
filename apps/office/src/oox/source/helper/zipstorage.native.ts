/** @fileoverview Original synchronous oox::ZipStorage over actual XStorage/StorageFactory and StorageBase, distinct from the asynchronous browser ZIP transport. No replacement factory/backend is manufactured. */
import { StorageBase, type StorageRef } from "./storagebase";
import { SharedReference } from "../core/shared-reference";
import {
  Reference,
  UNO_QUERY,
  UNO_QUERY_THROW,
} from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { NoSuchElementException } from "../../../cppu/inc/com/sun/star/container/NoSuchElementException";
import { XStorage } from "../../../offapi/com/sun/star/embed/XStorage";
import { XTransactedObject } from "../../../offapi/com/sun/star/embed/XTransactedObject";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import type { XStream } from "../../../udkapi/com/sun/star/io/XStream";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { READ, READWRITE, TRUNCATE } from "../../../offapi/com/sun/star/embed/ElementModes";
import { OStorageHelper } from "../../../comphelper/inc/storagehelper";
import { type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
/** Source ASCII format literal binding. @param value - Source literal. @returns Native string. */
function literal(value: string): OUString {
  return new OUString(
    Uint8Array.from(
      value + "\0",
      /** Source ASCII unit. @param c - Character. @returns Byte. */ (c) => c.charCodeAt(0),
    ),
  );
}
/** Actual original derived storage owner. */
export class ZipStorage extends StorageBase {
  private readonly mxStorage = new Reference<XStorage>();
  /** Original root input overload with required source repair flag. @param context - Actual context. @param input - Actual input. @param repair - Repair storage. @returns Storage. */
  constructor(
    context: Reference<XComponentContext>,
    input: Reference<XInputStream>,
    repair: boolean,
  );
  /** Original root output overload lowering. @param context - Actual context. @param stream - Actual stream. @param mode - Erased static source output overload. @returns Storage. */
  constructor(context: Reference<XComponentContext>, stream: Reference<XStream>, mode: "output");
  /** Original protected child overload lowering. @param parent - Actual parent. @param storage - Actual child. @param name - Native element name. @returns Child. */
  constructor(parent: ZipStorage, storage: Reference<XStorage>, name: OUStringConstReference);
  /** Source overload dispatch retains original format/mode/repair and UNO-only catch behavior. @param source - Context or actual parent. @param stream - Source stream/storage. @param mode - Source overload argument. @returns Actual storage owner. */
  constructor(
    source: ZipStorage | Reference<XComponentContext>,
    stream: Reference<XInputStream> | Reference<XStream> | Reference<XStorage>,
    mode: boolean | "output" | OUStringConstReference,
  ) {
    if (source instanceof ZipStorage) {
      super(source, mode as OUStringConstReference, source.isReadOnly());
      this.mxStorage.assign(stream as Reference<XStorage>);
      return;
    }
    if (mode === "output") super(stream as Reference<XStream>, false, "output");
    else super(stream as Reference<XInputStream>, false, "input");
    if (!source.is()) return;
    const format = literal(mode === "output" ? "OFOPXMLFormat" : "ZipFormat");
    try {
      try {
        const storage =
          mode === "output"
            ? OStorageHelper.GetStorageOfFormatFromStream(
                format,
                stream as Reference<XStream>,
                READWRITE | TRUNCATE,
                source,
                false,
              )
            : OStorageHelper.GetStorageOfFormatFromInputStream(
                format,
                stream as Reference<XInputStream>,
                source,
                mode as boolean,
              );
        try {
          this.mxStorage.assign(storage);
        } finally {
          storage.dispose();
        }
      } catch (error) {
        if (!(error instanceof Exception)) throw error;
        error.dispose();
      }
    } catch (error) {
      this.mxStorage.dispose();
      super.dispose();
      throw error;
    } finally {
      format.dispose();
    }
  }
  /** Original derived member then base destruction. @returns Nothing. */ override dispose(): void {
    this.mxStorage.dispose();
    super.dispose();
  }
  /** Source validity is interface presence. @returns Storage valid. */ protected implIsStorage(): boolean {
    return this.mxStorage.is();
  }
  /** Source actual interface copy. @returns Acquired native interface. */ protected implGetXStorage(): Reference<XStorage> {
    return new Reference(this.mxStorage);
  }
  /** Source XNameAccess enumeration inserts owned native names; catches only UNO exceptions. @param names - Caller-owned vector. @returns Nothing. */ protected implGetElementNames(
    names: OUString[],
  ): void {
    if (this.mxStorage.is())
      try {
        const values = this.mxStorage.operatorStar().getElementNames();
        try {
          const data = values.getConstArray() as SequenceElements;
          for (let i = 0; i < values.getLength(); ++i)
            names.push(
              new OUString(
                OUString.unacquired(data.get(i * 8) as Parameters<typeof OUString.unacquired>[0]),
              ),
            );
        } finally {
          values.dispose();
        }
      } catch (error) {
        if (!(error instanceof Exception)) throw error;
        error.dispose();
      }
  }
  /** Original only NoSuchElementException enables create retry; an existing storage is always opened READ. @param name - Direct element. @param create - Create missing. @returns Shared actual child. */ protected implOpenSubStorage(
    name: OUStringConstReference,
    create: boolean,
  ): StorageRef {
    const storage = new Reference<XStorage>();
    let missing = false;
    try {
      if (this.mxStorage.is())
        try {
          if (this.mxStorage.operatorStar().isStorageElement(name)) {
            const opened = this.mxStorage.operatorStar().openStorageElement(name, READ);
            try {
              storage.assign(opened);
            } finally {
              opened.dispose();
            }
          }
        } catch (error) {
          if (error instanceof NoSuchElementException) {
            missing = true;
            error.dispose();
          } else {
            if (!(error instanceof Exception)) throw error;
            error.dispose();
          }
        }
      if (missing && create)
        try {
          const opened = this.mxStorage.operatorStar().openStorageElement(name, READWRITE);
          try {
            storage.assign(opened);
          } finally {
            opened.dispose();
          }
        } catch (error) {
          if (!(error instanceof Exception)) throw error;
          error.dispose();
        }
      return storage.is()
        ? new SharedReference(new ZipStorage(this, storage, name))
        : new SharedReference<StorageBase>();
    } finally {
      storage.dispose();
    }
  }
  /** Source stream interface query deliberately does not call getInputStream. @param name - Direct element. @returns Owned input or empty. */ protected implOpenInputStream(
    name: OUStringConstReference,
  ): Reference<XInputStream> {
    const result = new Reference<XInputStream>();
    if (this.mxStorage.is())
      try {
        const stream = this.mxStorage.operatorStar().openStreamElement(name, READ);
        try {
          result.set(stream, UNO_QUERY, XInputStream.static_type);
        } finally {
          stream.dispose();
        }
      } catch (error) {
        if (!(error instanceof Exception)) throw error;
        error.dispose();
      }
    return result;
  }
  /** Source output query uses READWRITE only, not truncate. @param name - Direct element. @returns Owned output or empty. */ protected implOpenOutputStream(
    name: OUStringConstReference,
  ): Reference<XOutputStream> {
    const result = new Reference<XOutputStream>();
    if (this.mxStorage.is())
      try {
        const stream = this.mxStorage.operatorStar().openStreamElement(name, READWRITE);
        try {
          result.set(stream, UNO_QUERY, XOutputStream.static_type);
        } finally {
          stream.dispose();
        }
      } catch (error) {
        if (!(error instanceof Exception)) throw error;
        error.dispose();
      }
    return result;
  }
  /** Original transaction call with optional error propagation for the browser output boundary. @param reportFailure - Whether the caller needs UNO transaction failures. @returns Nothing. */ protected implCommit(
    reportFailure: boolean,
  ): void {
    try {
      const transaction = new Reference<XTransactedObject>(
        this.mxStorage,
        UNO_QUERY_THROW,
        XTransactedObject.static_type,
      );
      try {
        transaction.operatorStar().commit();
      } finally {
        transaction.dispose();
      }
    } catch (error) {
      if (reportFailure || !(error instanceof Exception)) throw error;
      error.dispose();
    }
  }
}
