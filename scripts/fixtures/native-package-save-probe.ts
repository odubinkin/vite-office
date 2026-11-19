/** @fileoverview Real package factory stream save through original synchronous ZIP compression, reopened by actual raw ZipPackage in main and DOM-free Worker. Full package commit/filter/UI remains unfinished. */
import { ZipPackage } from "../../apps/office/src/package/source/zippackage/ZipPackage";
import { ZipPackageStream } from "../../apps/office/src/package/source/zippackage/ZipPackageStream";
import { ZipOutputStream } from "../../apps/office/src/package/source/zipapi/ZipOutputStream";
import { Reference } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Reference";
import {
  Sequence,
  type SequenceElements,
} from "../../apps/office/src/cppu/inc/com/sun/star/uno/Sequence";
import type { PropertyValue } from "../../apps/office/src/udkapi/com/sun/star/beans/PropertyValue";
import { UNOMemoryStream } from "../../apps/office/src/comphelper/source/streaming/memorystream";
import { getProcessComponentContext } from "../../apps/office/src/comphelper/inc/processfactory";
import { OUString } from "../../apps/office/src/sal/inc/rtl/ustring";
import { probeNativePackageMember } from "./native-package-member-probe";
/** Saves actual DATA-mode stream and reads the emitted member through native package input. @returns Complete byte roundtrip observation. */
export function probeNativePackageSave(): boolean {
  const context = new Reference(getProcessComponentContext().get()),
    root = new Reference(new ZipPackage(context)),
    component = root.operatorStar().createInstance(),
    input = new Reference(new UNOMemoryStream()),
    output = new Reference(new UNOMemoryStream()),
    writer = new ZipOutputStream(output),
    payload = new TextEncoder().encode("<root>字😀</root>"),
    Bytes = Sequence.specialize<number>("sal_Int8", 1),
    bytes = new Bytes(payload.length),
    key = new Bytes(),
    path = OUString.fromUtf8(new TextEncoder().encode("word/document.xml")),
    manifest: Sequence<PropertyValue>[] = [];
  try {
    const fields = bytes.getArray() as SequenceElements;
    for (let i = 0; i < payload.length; ++i)
      (fields.get(i) as [number])[0] = ((payload[i] as number) << 24) >> 24;
    input.operatorStar().writeBytes(bytes);
    const stream = component.get();
    if (!(stream instanceof ZipPackageStream)) throw new Error("Actual native stream expected");
    stream.setDataStream(input);
    if (!stream.saveChild(path, manifest, writer, key, null, null)) return false;
    writer.finish();
    const size = Number(output.operatorStar().getLength()),
      image = new Uint8Array(size);
    output.operatorStar().seek(0n);
    if (output.operatorStar().readBytes(bytes, size) !== size) return false;
    const data = bytes.getConstArray() as SequenceElements;
    for (let i = 0; i < size; ++i) image[i] = (data.get(i) as [number])[0];
    return (
      stream.IsPackageMember() && probeNativePackageMember(image, "word/document.xml", payload)
    );
  } finally {
    for (const row of manifest) row.dispose();
    path.dispose();
    key.dispose();
    bytes.dispose();
    writer.dispose();
    output.dispose();
    input.dispose();
    component.dispose();
    root.dispose();
    context.dispose();
  }
}
