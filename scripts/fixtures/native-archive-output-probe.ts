/** @fileoverview Existing OOXML storage commit now emits through original ZIP output in main and DOM-free Worker. */
import { probeNativePackageCommitState } from "./native-package-commit-state-probe";
import { probeNativePackageMetadata } from "./native-package-metadata-probe";
import { probeNativeStorageImpl } from "./native-storage-impl-probe";
import { probeNativeMediaDescriptor } from "./native-media-descriptor-probe";
import { probeNativeZipTask } from "./native-zip-task-probe";
import { probeNativeNoWorkerThreadPool } from "./native-threadpool-probe";
import { probeNativePackageSave } from "./native-package-save-probe";
import { probeNativePackageMember } from "./native-package-member-probe";
import { probeNativePackageStream } from "./native-package-stream-probe";
import { ZipStorage } from "../../apps/office/src/oox/source/helper/zipstorage";
import { DocumentArchive } from "../../apps/office/src/package/source/zippackage/document-archive";
import {
  Sequence,
  type SequenceElements,
} from "../../apps/office/src/cppu/inc/com/sun/star/uno/Sequence";
/** Commits a real current storage fragment and reopens its actual output. @returns Boundary observations. */
export async function probeNativeArchiveOutput() {
  const storage = new ZipStorage(),
    path = "word/document.xml",
    text = "<root>字😀</root>",
    source = new TextEncoder().encode(text),
    data = new (Sequence.specialize<number>("sal_Int8", 1))(source.length),
    fields = data.getArray() as SequenceElements;
  try {
    for (let i = 0; i < source.length; ++i)
      (fields.get(i) as [number])[0] = ((source[i] as number) << 24) >> 24;
    const fragment = storage.openOutputStream(
      path,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml",
    );
    fragment.writeBytes(data);
    fragment.closeOutput();
    const image = await storage.commit(),
      archive = await DocumentArchive.open(image),
      reopened = await ZipStorage.open(image),
      input = await reopened.openInputStream(path),
      result = new (Sequence.specialize<number>("sal_Int8", 1))();
    try {
      const count = input.operatorStar().readBytes(result, source.length),
        cells = result.getConstArray() as SequenceElements;
      if (count !== source.length) throw new Error("OOXML storage reopen length mismatch");
      for (let i = 0; i < count; ++i)
        if (((cells.get(i) as [number])[0] & 255) !== source[i])
          throw new Error("OOXML storage reopen content mismatch");
      const header = new DataView(image.buffer, image.byteOffset, image.byteLength);
      return {
        packageStream: probeNativePackageStream(),
        packageSave: probeNativePackageSave(),
        noWorkerPool: probeNativeNoWorkerThreadPool(),
        zipTask: probeNativeZipTask(),
        mediaDescriptor: probeNativeMediaDescriptor(),
        storageImpl: probeNativeStorageImpl(),
        packageMetadata: await probeNativePackageMetadata(),
        packageCommitState: probeNativePackageCommitState(),
        packageMember: probeNativePackageMember(image, path, source),
        coreVersion: header.getUint16(4, true),
        coreFlags: header.getUint16(6, true),
        stored: archive.getEntryMethod(path) === 0,
        content: (await archive.readTextEntry(path)) === text,
        contentTypes: archive.hasEntry("[Content_Types].xml"),
        reopened: true,
      };
    } finally {
      result.dispose();
      input.dispose();
    }
  } finally {
    data.dispose();
  }
}
