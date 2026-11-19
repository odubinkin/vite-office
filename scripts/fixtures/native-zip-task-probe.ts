/** @fileoverview Actual background ZIP entry work/temp file/error retention/consumption over original explicit ThreadPool(0) in main and DOM-free Worker. Shared optimal worker scheduling and whole document package commit remain unqualified. */
import { ZipOutputEntryInThread } from "../../apps/office/src/package/source/zipapi/ZipOutputEntry";
import { ZipOutputStream } from "../../apps/office/src/package/source/zipapi/ZipOutputStream";
import { ZipEntry } from "../../apps/office/src/package/inc/ZipEntry";
import { ZipPackage } from "../../apps/office/src/package/source/zippackage/ZipPackage";
import { ZipPackageStream } from "../../apps/office/src/package/source/zippackage/ZipPackageStream";
import { ThreadPool } from "../../apps/office/src/comphelper/inc/threadpool";
import { getProcessComponentContext } from "../../apps/office/src/comphelper/inc/processfactory";
import { Reference } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Reference";
import {
  Sequence,
  type SequenceElements,
} from "../../apps/office/src/cppu/inc/com/sun/star/uno/Sequence";
import { UNOMemoryStream } from "../../apps/office/src/comphelper/source/streaming/memorystream";
import { OInputStreamWrapper } from "../../apps/office/src/unotools/source/streaming/streamwrap";
import {
  SvMemoryStream,
  StreamMode,
} from "../../apps/office/src/tools/source/stream/stream.native";
import { NotConnectedException } from "../../apps/office/src/cppu/inc/com/sun/star/io/NotConnectedException";
import { Exception } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Exception";
import { OUString } from "../../apps/office/src/sal/inc/rtl/ustring";
import { probeNativePackageMember } from "./native-package-member-probe";
/** Runs real ZIP entry task work and original consumer operations without a substituted scheduler/default pool. @returns Complete success/error observations. */
export function probeNativeZipTask(): boolean {
  const context = new Reference(getProcessComponentContext().get()),
    root = new Reference(new ZipPackage(context)),
    component = root.operatorStar().createInstance(),
    source = new Reference(new UNOMemoryStream()),
    output = new Reference(new UNOMemoryStream()),
    writer = new ZipOutputStream(output),
    pool = new ThreadPool(0),
    tag = ThreadPool.createThreadTaskTag(),
    path = OUString.fromUtf8(new TextEncoder().encode("payload.xml")),
    payload = new TextEncoder().encode("<root>" + "A字😀".repeat(12500) + "</root>"),
    Bytes = Sequence.specialize<number>("sal_Int8", 1),
    bytes = new Bytes(payload.length),
    backing = new SvMemoryStream(new Uint8Array([1, 2, 3]), 3, StreamMode.READ),
    closed = new Reference(new OInputStreamWrapper(backing));
  let entry: ZipOutputEntryInThread | undefined, failed: ZipOutputEntryInThread | undefined;
  try {
    const fields = bytes.getArray() as SequenceElements;
    for (let i = 0; i < payload.length; ++i)
      (fields.get(i) as [number])[0] = ((payload[i] as number) << 24) >> 24;
    source.operatorStar().writeBytes(bytes);
    const stream = component.get();
    if (!(stream instanceof ZipPackageStream))
      throw new Error("Actual native package stream expected");
    stream.setDataStream(source);
    const record = new ZipEntry(stream.aEntry);
    record.sPath.assign(path);
    record.nMethod = 8;
    record.nCrc = -1;
    record.nCompressedSize = -1n;
    record.nSize = BigInt(payload.length);
    ZipOutputStream.setEntry(record);
    entry = new ZipOutputEntryInThread(context, record, stream, false);
    const input = stream.getRawData();
    try {
      pool.pushTask(entry.createTask(tag, input));
    } finally {
      input.dispose();
    }
    closed.operatorStar().closeInput();
    failed = new ZipOutputEntryInThread(context, new ZipEntry(record), stream, false);
    pool.pushTask(failed.createTask(tag, closed));
    pool.waitUntilDone(tag);
    if (
      !entry.isFinished() ||
      entry.getParallelDeflateException().is() ||
      !failed.isFinished() ||
      !failed.getParallelDeflateException().is()
    )
      return false;
    let correctFailure = false;
    try {
      failed.getParallelDeflateException().rethrow();
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      try {
        correctFailure = error instanceof NotConnectedException;
      } finally {
        error.dispose();
      }
    }
    if (!correctFailure) return false;
    const moved = entry.moveZipEntry();
    if (!moved) throw new Error("Actual task entry expected");
    writer.writeLOC(moved);
    const compressed = entry.getData();
    try {
      let count: number;
      do {
        count = compressed.operatorStar().readBytes(bytes, 32768);
        if (count !== 32768) bytes.realloc(count);
        writer.rawWrite(bytes);
      } while (count === 32768);
    } finally {
      compressed.dispose();
    }
    writer.rawCloseEntry();
    stream.successfullyWritten(entry.getZipEntry());
    entry.deleteBufferFile();
    writer.finish();
    const size = Number(output.operatorStar().getLength()),
      image = new Uint8Array(size);
    output.operatorStar().seek(0n);
    if (output.operatorStar().readBytes(bytes, size) !== size) return false;
    const result = bytes.getConstArray() as SequenceElements;
    for (let i = 0; i < size; ++i) image[i] = (result.get(i) as [number])[0];
    return stream.IsPackageMember() && probeNativePackageMember(image, "payload.xml", payload);
  } finally {
    failed?.dispose();
    entry?.dispose();
    closed.dispose();
    backing.dispose();
    bytes.dispose();
    path.dispose();
    pool.dispose();
    tag.dispose();
    writer.dispose();
    output.dispose();
    source.dispose();
    component.dispose();
    root.dispose();
    context.dispose();
  }
}
