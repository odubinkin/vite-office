/** @fileoverview Actual original synchronous entry compression/CRC into native ZIP output and native reopening in main and DOM-free Worker realms. */
import { inflateRaw } from "pako";
import { Reference } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Reference";
import { Reference as RtlReference } from "../../apps/office/src/sal/inc/rtl/ref";
import { RefCountedMutex } from "../../apps/office/src/comphelper/inc/refcountedmutex";
import { ByteReader } from "../../apps/office/src/comphelper/inc/bytereader";
import { UNOMemoryStream } from "../../apps/office/src/comphelper/source/streaming/memorystream";
import { MemoryInputStream } from "../../apps/office/src/comphelper/source/streaming/seqstream";
import type { XComponentContext } from "../../apps/office/src/udkapi/com/sun/star/uno/XComponentContext";
import { OUString } from "../../apps/office/src/sal/inc/rtl/ustring";
import { ZipOutputEntry } from "../../apps/office/src/package/source/zipapi/ZipOutputEntry";
import { ZipOutputStream } from "../../apps/office/src/package/source/zipapi/ZipOutputStream";
import { ZipFile, Checks } from "../../apps/office/src/package/source/zipapi/ZipFile";
import { ZipEntry } from "../../apps/office/src/package/inc/ZipEntry";
/** Uses real native stream constructors, headers, CRC and actual compression/decompression. @returns Original public observations. */
export function probeNativeZipOutputEntry() {
  const owners: { dispose(): void }[] = [];
  /** Retains actual source owners for reverse destruction. @param value - Native owner. @returns Same owner. */
  function own<T extends { dispose(): void }>(value: T): T {
    owners.push(value);
    return value;
  }
  try {
    const data = new Uint8Array(65537);
    for (let i = 0; i < data.length; ++i) data[i] = (i * 73) ^ (i >> 4);
    const memory = own(new Reference(new UNOMemoryStream())),
      input = own(new Reference(new MemoryInputStream(data, data.length))),
      context = own(new Reference<XComponentContext>()),
      archive = own(new ZipOutputStream(memory)),
      entry = new ZipEntry(),
      text = "word/document.xml",
      name = own(
        new OUString(
          Uint16Array.from(
            text,
            /** Native UTF16 source name. @param c - ASCII unit. @returns Code unit. */ (c) =>
              c.charCodeAt(0),
          ),
          text.length,
        ),
      );
    entry.sPath.assign(name);
    entry.nMethod = 8;
    entry.nTime = 0;
    entry.nSize = entry.nCompressedSize = -1n;
    entry.nCrc = -1;
    ZipOutputStream.setEntry(entry);
    archive.writeLOC(entry);
    const start = Number(memory.operatorStar().getPosition()),
      writer = own(new ZipOutputEntry(archive.getStream(), context, entry, null, false));
    writer.writeStream(input);
    const observations = {
      length: Number(entry.nSize),
      compressedSize: entry.nCompressedSize > 0n,
      crc: entry.nCrc !== -1 && entry.nCrc !== 0,
      content: true,
      inputOpen: input.operatorStar().available() === 0,
      sameEntry: writer.getZipEntry() === entry,
      nullParent: writer.getZipPackageStream() === null,
      encrypted: writer.isEncrypt(),
      nativeReopened: false,
    };
    const compressedLength = Number(entry.nCompressedSize);
    archive.rawCloseEntry();
    archive.finish();
    const image = new Uint8Array(Number(memory.operatorStar().getLength()));
    memory.operatorStar().seek(0n);
    memory.operatorStar().readSomeBytes(image, image.length);
    const actual = inflateRaw(image.subarray(start, start + compressedLength));
    if (
      actual.length !== data.length ||
      actual.some(
        /** Compare every original source byte. @param value - Decoded unit. @param index - Source position. @returns Mismatch. */ (
          value,
          index,
        ) => value !== data[index],
      )
    )
      throw new Error("original entry output mismatch");
    memory.operatorStar().seek(0n);
    const mutex = own(new RtlReference(new RefCountedMutex())),
      empty = own(new RtlReference<never>()),
      zip = own(new ZipFile(mutex, memory, context, true, false, Checks.CheckInsensitive)),
      stored = zip.GetEntryHash().find(name);
    if (!stored) throw new Error("original ZIP output entry absent");
    const stream = own(zip.getDataStream(stored, empty, null, mutex)),
      reader = stream.get(),
      decoded = new Uint8Array(data.length);
    if (
      !(reader instanceof ByteReader) ||
      reader.readSomeBytes(decoded, decoded.length) !== data.length ||
      decoded.some(
        /** Native extraction preserves every source byte. @param value - Read byte. @param index - Input offset. @returns Mismatch. */ (
          value,
          index,
        ) => value !== data[index],
      )
    )
      throw new Error("native ZIP output reopen mismatch");
    observations.nativeReopened = true;
    input.operatorStar().seek(0n);
    observations.inputOpen = input.operatorStar().available() === data.length;
    return observations;
  } finally {
    for (const owner of owners.reverse()) owner.dispose();
  }
}
