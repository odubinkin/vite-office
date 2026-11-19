/** @fileoverview Original ZipPackage::writeTempFile archive body, using the actual package tree and metadata writers. */
import { XAsyncOutputMonitor } from "../../../udkapi/com/sun/star/io/XAsyncOutputMonitor";
import { XTruncate } from "../../../udkapi/com/sun/star/io/XTruncate";
import { OStorageHelper } from "../../../comphelper/source/misc/storagehelper";
import { XStream } from "../../../udkapi/com/sun/star/io/XStream";
import { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { WrappedTargetException } from "../../../cppu/inc/com/sun/star/lang/WrappedTargetException";
import { withCaughtException } from "../../../cppu/inc/uno/exception-context";
import { getCaughtException } from "../../../cppuhelper/inc/exc_hlp";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import {
  Reference,
  UNO_QUERY,
  UNO_QUERY_THROW,
} from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { XNameContainer } from "../../../cppu/inc/com/sun/star/container/XNameContainer";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyType,
} from "../../../udkapi/com/sun/star/beans/PropertyValue";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { rtl_uString_assign } from "../../../sal/inc/rtl/ustring.h";
import { PACKAGE, OFOPXML } from "../../../offapi/com/sun/star/embed/StorageFormats";
import {
  PKG_MNFST_FULLPATH,
  PKG_MNFST_MEDIATYPE,
  PKG_MNFST_VERSION,
  PKG_SIZE_NOENCR_MNFST,
} from "../../inc/PackageConstants";
import { native } from "./ZipPackage.metadata";
import type { ZipPackage } from "./ZipPackage";
import type { ZipPackageFolder } from "./ZipPackageFolder.native";
import type { ZipOutputStream } from "../zipapi/ZipOutputStream";

const Properties = Sequence.specialize<PropertyValue>(propertyType, 48);

/** Writes the original non-GPG package body and metadata entries. @param owner - Actual package. @param root - Its root folder. @param output - ZIP writer. @param kdf - Original key derivation function identifier. @returns Nothing. */
export function writePackageContents(
  owner: ZipPackage,
  root: ZipPackageFolder,
  output: ZipOutputStream,
  kdf: number,
): void {
  const format = owner.getFormat();
  const manifest: Sequence<PropertyValue>[] = [];
  const path = native("");
  try {
    if (format === PACKAGE) {
      const meta = native("META-INF"),
        name = native("manifest.xml"),
        folder = new Reference<XNameContainer>();
      try {
        if (root.hasByName(meta)) {
          const value = root.getByName(meta);
          try {
            value.extract(folder.getAddress(), ["Reference", XNameContainer.static_type]);
          } finally {
            value.dispose();
          }
          if (folder.is() && folder.operatorStar().hasByName(name))
            folder.operatorStar().removeByName(name);
        }
      } finally {
        folder.dispose();
        name.dispose();
        meta.dispose();
      }
      owner.WriteMimetypeMagicFile(output);
      const row = new Properties(PKG_SIZE_NOENCR_MNFST);
      manifest.push(row);
      const slash = native("/");
      try {
        for (const [index, fieldName, fieldValue] of [
          [PKG_MNFST_MEDIATYPE, "MediaType", root.GetMediaType()],
          [PKG_MNFST_VERSION, "Version", root.GetVersion()],
          [PKG_MNFST_FULLPATH, "FullPath", slash],
        ] as const) {
          const cell = (row.getArray() as SequenceElements).get(index * 48) as SequenceElements;
          const name = native(fieldName),
            field = new OUString(fieldValue),
            value = new Any(field.getDataAddress(), "OUString");
          try {
            rtl_uString_assign(cell.get(0) as rtl_uStringSlot, name.pData);
            Any.prototype.assign.call(cell.get(16) as Any, value);
          } finally {
            value.dispose();
            field.dispose();
            name.dispose();
          }
        }
      } finally {
        slash.dispose();
      }
    } else if (format === OFOPXML) {
      const name = native("[Content_Types].xml");
      try {
        if (root.hasByName(name)) root.removeByName(name);
      } finally {
        name.dispose();
      }
    }
    const encryptedPackage = native("encrypted-package");
    let iterations: number | null = null;
    let argon2: readonly [number, number, number] | null = null;
    try {
      if (kdf === 1) iterations = root.hasByName(encryptedPackage) ? 600000 : 100000;
      else if (kdf === 3) argon2 = [3, 1 << 16, 4];
    } finally {
      encryptedPackage.dispose();
    }
    const key = owner.GetEncryptionKey();
    try {
      root.saveContents(path, manifest, output, key, iterations, argon2);
    } finally {
      key.dispose();
    }
    if (format === PACKAGE) owner.WriteManifest(output, manifest);
    else if (format === OFOPXML) owner.WriteContentTypes(output, manifest);
    output.finish();
  } finally {
    path.dispose();
    for (const row of manifest) row.dispose();
  }
}

/** Original XStream seek/truncate/copy order. @param this - Actual package. @param stream - Actual persistence target. @param source - Retained temporary input. @returns Nothing. */
export function transferToStream(
  this: ZipPackage,
  stream: Reference<XStream>,
  source: Reference<XInputStream>,
): void {
  const output = new Reference<XOutputStream>();
  try {
    try {
      const destination = stream.operatorStar().getOutputStream();
      try {
        output.assign(destination);
      } finally {
        destination.dispose();
      }
      const seek = new Reference<XSeekable>(output, UNO_QUERY, XSeekable.static_type);
      try {
        if (seek.is()) seek.operatorStar().seek(0n);
      } finally {
        seek.dispose();
      }
      const truncate = new Reference<XTruncate>(output, UNO_QUERY_THROW, XTruncate.static_type);
      try {
        truncate.operatorStar().truncate();
      } finally {
        truncate.dispose();
      }
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      wrapCommitError(this, "This package is read only!", error);
    }
    try {
      OStorageHelper.CopyInputToOutput(source, output);
      flushPackageOutput(output, true);
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
      this.DisconnectFromTargetAndThrowException_Impl(source);
    }
  } finally {
    output.dispose();
  }
}
/** Flushes and optionally waits for the original output facet. @param output - Actual output. @param sync - Source wait condition. @returns Nothing. */
export function flushPackageOutput(output: Reference<XOutputStream>, sync: boolean): void {
  output.operatorStar().flush();
  const monitor = new Reference<XAsyncOutputMonitor>(
    output,
    UNO_QUERY,
    XAsyncOutputMonitor.static_type,
  );
  try {
    if (monitor.is() && sync) monitor.operatorStar().waitForCompletion();
  } finally {
    monitor.dispose();
  }
}
/** Wraps a caught UNO error with the original package context. @param owner - Actual package. @param text - Source diagnostic. @param error - Owned caught value. @returns Never. */
export function wrapCommitError(owner: ZipPackage, text: string, error: Exception): never {
  try {
    const payload = withCaughtException(error, getCaughtException),
      message = native(text),
      self = new Reference<XInterface>(owner);
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
}
