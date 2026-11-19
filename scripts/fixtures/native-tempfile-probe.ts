/** @fileoverview Actual registered TempFile and deferred nonseekable input copy in Chromium main/DOM-free Worker, with only public scalar observations. */
import { TempFileNamed } from "../../apps/office/src/unotools/inc/tempfile";
import { OUString } from "../../apps/office/src/sal/inc/rtl/ustring";
import { TempFile } from "../../apps/office/src/udkapi/com/sun/star/io/TempFile";
import { Reference, UNO_QUERY } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Reference";
import type { XComponentContext } from "../../apps/office/src/udkapi/com/sun/star/uno/XComponentContext";
import { getProcessComponentContext } from "../../apps/office/src/comphelper/inc/processfactory";
import {
  Sequence,
  type SequenceElements,
} from "../../apps/office/src/cppu/inc/com/sun/star/uno/Sequence";
import { SvMemoryStream, StreamMode } from "../../apps/office/src/tools/inc/stream";
import { OInputStreamWrapper } from "../../apps/office/src/unotools/source/streaming/streamwrap";
import { OSeekableInputWrapper } from "../../apps/office/src/comphelper/source/streaming/seekableinput";
import { XSeekable } from "../../apps/office/src/udkapi/com/sun/star/io/XSeekable";
import {
  Directory,
  DirectoryItem,
  FileStatus,
  FileBase,
} from "../../apps/office/src/sal/inc/osl/file.hxx";
/** Uses actual original owners and frees them in reverse lifetime order. @returns Public scalar observations. */
export function probeNativeTempFile(): {
  bytes: number[];
  deleted: boolean;
  directoryFound: boolean;
  directoryDeleted: boolean;
  copyLength: number;
  copyBytes: number[];
} {
  const owners: { dispose(): void }[] = [];
  /** Retains an actual owner. @param value - Original object. @returns Same owner. */
  function own<T extends { dispose(): void }>(value: T): T {
    owners.push(value);
    return value;
  }
  try {
    const context = own(new Reference<XComponentContext>(getProcessComponentContext())),
      temporary = own(TempFile.create(context)),
      file = temporary.operatorStar(),
      uri = own(file.getUri()),
      bytes = own(new (Sequence.specialize<number>("sal_Int8", 1))(3)),
      fields = bytes.getArray() as SequenceElements;
    for (let i = 0; i < 3; i++) (fields.get(i) as [number])[0] = i + 7;
    const output = own(file.getOutputStream()),
      input = own(file.getInputStream());
    output.operatorStar().writeBytes(bytes);
    output.operatorStar().closeOutput();
    const actual = own(new (Sequence.specialize<number>("sal_Int8", 1))());
    if (input.operatorStar().readBytes(actual, 3) !== 3)
      throw new Error("Native temporary file read failed");
    const data = actual.getConstArray() as SequenceElements,
      observed = [0, 1, 2].map(
        /** Original source literal or initialized-value address binding. @param index - Actual declared argument. @returns Original result or test completion. */ (
          index,
        ) => (data.get(index) as [number])[0],
      );
    const directory = own(new Directory(own(uri.copy(0, uri.lastIndexOf(47))))),
      name = own(uri.copy(uri.lastIndexOf(47) + 1)),
      directoryItem = own(new DirectoryItem()),
      status = own(new FileStatus(256));
    if (directory.open() !== FileBase.E_None) throw new Error("Native directory open failed");
    let directoryFound = false;
    while (directory.getNextItem(directoryItem) === FileBase.E_None) {
      if (directoryItem.getFileStatus(status) !== FileBase.E_None)
        throw new Error("Native enumerated status failed");
      const actualName = status.getFileName();
      try {
        if (actualName.compareTo(name) === 0) directoryFound = true;
      } finally {
        actualName.dispose();
      }
    }
    if (
      !directoryFound ||
      directoryItem.is() ||
      directory.reset() !== FileBase.E_None ||
      directory.close() !== FileBase.E_None
    )
      throw new Error("Native directory enumeration contract failed");
    const namedDirectory = new TempFileNamed(null, true),
      directoryURL = own(new OUString(namedDirectory.GetURL()));
    namedDirectory.EnableKillingFile();
    try {
      if (!namedDirectory.IsValid()) throw new Error("Native temporary directory creation failed");
      const child = new TempFileNamed(directoryURL);
      try {
        if (!child.IsValid()) throw new Error("Native temporary child creation failed");
        child.GetStream(StreamMode.READWRITE).WriteBytes(Uint8Array.of(1, 2, 3), 3);
      } finally {
        child.dispose();
      }
    } finally {
      namedDirectory.dispose();
    }
    const directoryDeleted = DirectoryItem.get(directoryURL, directoryItem) === FileBase.E_NOENT;
    if (!directoryDeleted) throw new Error("Native temporary directory cleanup failed");
    input.operatorStar().closeInput();
    const item = own(new DirectoryItem()),
      deleted = DirectoryItem.get(uri, item) === FileBase.E_NOENT;
    const source = Uint8Array.from(
        { length: 96017 },
        /** Original source literal or initialized-value address binding. @param _ - Actual declared argument. @param index - Actual declared argument. @returns Original result or test completion. */ (
          _,
          index,
        ) => index % 251,
      ),
      memory = own(new SvMemoryStream(source, source.length, StreamMode.READ)),
      original = own(new Reference(new OInputStreamWrapper(memory))),
      wrapper = own(OSeekableInputWrapper.CheckSeekableCanWrap(original, context)),
      seek = own(new Reference<XSeekable>(wrapper, UNO_QUERY, XSeekable.static_type));
    if (memory.Tell() !== 0n) throw new Error("Native deferred copy ran eagerly");
    const copyLength = Number(seek.operatorStar().getLength());
    seek.operatorStar().seek(31999n);
    if (wrapper.operatorStar().readBytes(actual, 5) !== 5)
      throw new Error("Native copied file read failed");
    const copied = actual.getConstArray() as SequenceElements,
      copyBytes = [0, 1, 2, 3, 4].map(
        /** Original source literal or initialized-value address binding. @param index - Actual declared argument. @returns Original result or test completion. */ (
          index,
        ) => (copied.get(index) as [number])[0] & 255,
      );
    wrapper.operatorStar().closeInput();
    if (
      !deleted ||
      copyLength !== source.length ||
      observed.join() !== "7,8,9" ||
      copyBytes.some(
        /** Original source literal or initialized-value address binding. @param value - Actual declared argument. @param index - Actual declared argument. @returns Original result or test completion. */ (
          value,
          index,
        ) => value !== source[31999 + index],
      )
    )
      throw new Error("Native temporary file lifetime/content contract failed");
    return { bytes: observed, deleted, directoryFound, directoryDeleted, copyLength, copyBytes };
  } finally {
    for (let i = owners.length - 1; i >= 0; i--) owners[i]?.dispose();
  }
}
