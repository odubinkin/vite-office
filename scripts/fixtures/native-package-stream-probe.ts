/** @fileoverview Actual package/stream owners and shared input cursors in main/Worker; native metadata/storage/commit orchestration remains unfinished. */
import { ZipPackage } from "../../apps/office/src/package/source/zippackage/ZipPackage";
import { ZipPackageStream } from "../../apps/office/src/package/source/zippackage/ZipPackageStream";
import { Reference } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Reference";
import {
  Sequence,
  type SequenceElements,
} from "../../apps/office/src/cppu/inc/com/sun/star/uno/Sequence";
import { UNOMemoryStream } from "../../apps/office/src/comphelper/source/streaming/memorystream";
import { getProcessComponentContext } from "../../apps/office/src/comphelper/inc/processfactory";
/** Actual factory creates the stream; independent wrappers read one actual source without substituted state. @returns Boolean observation. */
export function probeNativePackageStream(): boolean {
  const context = new Reference(getProcessComponentContext().get()),
    root = new Reference(new ZipPackage(context)),
    component = root.operatorStar().createInstance(),
    source = new Reference(new UNOMemoryStream()),
    bytes = new (Sequence.specialize<number>("sal_Int8", 1))(2);
  try {
    const cells = bytes.getArray() as SequenceElements;
    (cells.get(0) as [number])[0] = 17;
    (cells.get(1) as [number])[0] = 23;
    source.operatorStar().writeBytes(bytes);
    const stream = component.get();
    if (!(stream instanceof ZipPackageStream))
      throw new Error("Native package did not create its original stream owner");
    stream.setDataStream(source);
    const a = stream.getInputStream(),
      b = stream.getInputStream();
    try {
      return (
        root.operatorStar().getFormat() === 1 &&
        a.operatorStar().readBytes(bytes, 1) === 1 &&
        ((bytes.getConstArray() as SequenceElements).get(0) as [number])[0] === 17 &&
        b.operatorStar().readBytes(bytes, 2) === 2 &&
        ((bytes.getConstArray() as SequenceElements).get(1) as [number])[0] === 23
      );
    } finally {
      b.dispose();
      a.dispose();
    }
  } finally {
    bytes.dispose();
    source.dispose();
    component.dispose();
    root.dispose();
    context.dispose();
  }
}
