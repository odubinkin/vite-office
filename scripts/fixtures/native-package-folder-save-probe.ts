/** @fileoverview Genuine folder serialization and native ZIP reopening in the browser and DOM-free Worker. */
import { Reference } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Reference";
import { Reference as RtlReference } from "../../apps/office/src/sal/inc/rtl/ref";
import { Any } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Sequence";
import { OUString } from "../../apps/office/src/sal/inc/rtl/ustring";
import { UNOMemoryStream } from "../../apps/office/src/comphelper/source/streaming/memorystream";
import { RefCountedMutex } from "../../apps/office/src/comphelper/inc/refcountedmutex";
import { ZipPackageFolder } from "../../apps/office/src/package/source/zippackage/ZipPackageFolder.native";
import { ZipOutputStream } from "../../apps/office/src/package/source/zipapi/ZipOutputStream";
import { ZipFile, Checks } from "../../apps/office/src/package/source/zipapi/ZipFile";
import { ZIP } from "../../apps/office/src/offapi/com/sun/star/embed/StorageFormats";
/** Serializes an actual container child and reopens its directory record. @returns Public scalar observations. */
export function probeNativePackageFolderSave(): {
  entries: number;
  stored: boolean;
  empty: boolean;
} {
  const owners: { dispose(): void }[] = [];
  /** Retains an actual owner for reverse destruction. @param value - Native value. @returns Same value. */
  function own<T extends { dispose(): void }>(value: T): T {
    owners.push(value);
    return value;
  }
  /** Constructs a counted original string. @param text - Text. @returns Original string. */
  function unicode(text: string): OUString {
    const units = Uint16Array.from(
      text
        .split("")
        .map(
          /** Reads a UTF16 unit. @param unit - Unit. @returns Code. */ (unit) =>
            unit.charCodeAt(0),
        ),
    );
    return own(new OUString(units, units.length));
  }
  try {
    const context = own(new Reference()),
      root = own(new Reference(new ZipPackageFolder(context, ZIP, false))),
      child = own(new Reference(new ZipPackageFolder(context, ZIP, false))),
      name = unicode("empty"),
      element = own(new Any(child.getAddress(), "XInterface")),
      memory = own(new Reference(new UNOMemoryStream())),
      writer = own(new ZipOutputStream(memory)),
      Bytes = Sequence.specialize<number>("sal_Int8", 1),
      key = own(new Bytes());
    child.operatorStar().setName(name);
    root.operatorStar().insertByName(name, element);
    root.operatorStar().saveContents(unicode(""), [], writer, key, null, null);
    writer.finish();
    memory.operatorStar().seek(0n);
    const mutex = own(new RtlReference(new RefCountedMutex())),
      zip = own(new ZipFile(mutex, memory, context, true, false, Checks.CheckInsensitive)),
      record = zip.GetEntryHash().find(unicode("empty/"));
    return {
      entries: zip.GetEntryHash().size(),
      stored: record?.nMethod === 0,
      empty: record?.nSize === 0n && record?.nCompressedSize === 0n && record?.nCrc === 0,
    };
  } finally {
    for (let i = owners.length - 1; i >= 0; i--) owners[i]?.dispose();
  }
}
