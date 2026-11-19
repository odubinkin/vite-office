/** @fileoverview Actual file-UCP stream owners feed the registered ZIP service in Chromium main/DOM-free Worker without a substitute provider. */
import { XInputStream_impl } from "../../apps/office/src/ucb/source/ucp/file/filinpstr";
import { XStream_impl } from "../../apps/office/src/ucb/source/ucp/file/filstr";
import { ReconnectingFile } from "../../apps/office/src/ucb/source/ucp/file/filrec";
import { TaskHandlerErr } from "../../apps/office/src/ucb/source/ucp/file/filerror";
import { TempFileNamed } from "../../apps/office/src/unotools/inc/tempfile";
import { StreamMode } from "../../apps/office/src/tools/inc/stream";
import { FileBase } from "../../apps/office/src/sal/inc/osl/file.hxx";
import { osl_File_OpenFlag_Read, osl_Pos_Absolut } from "../../apps/office/src/sal/inc/osl/file";
import { Reference } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Reference";
import {
  Sequence,
  type SequenceElements,
} from "../../apps/office/src/cppu/inc/com/sun/star/uno/Sequence";
import { probeNativeZipAccess } from "./native-zip-access-probe";
/** Uses a real native temporary file for archive and bidirectional stream checks. @param archive - Actual original ZIP bytes. @returns Public scalar observations. */
export function probeNativeUcbFileStreams(archive: Uint8Array): {
  zip: ReturnType<typeof probeNativeZipAccess>;
  reopenedSize: number;
  disconnectedPosition: boolean;
  readByte: number;
  truncatedLength: number;
} {
  const owners: { dispose(): void }[] = [];
  /** Retains actual owners for reverse destruction. @param value - Real owner. @returns Same object. */
  function own<T extends { dispose(): void }>(value: T): T {
    owners.push(value);
    return value;
  }
  try {
    const temporary = own(new TempFileNamed());
    temporary.EnableKillingFile();
    const output = temporary.GetStream(StreamMode.READWRITE);
    if (output.WriteBytes(archive, archive.length) !== archive.length)
      throw new Error("Native ZIP fixture write failed");
    output.Flush();
    const url = temporary.GetURL(),
      input = own(new Reference(new XInputStream_impl(url, false)));
    if (input.operatorStar().CtorSuccess() !== TaskHandlerErr.NO_ERROR)
      throw new Error("Native file input failed");
    const zip = probeNativeZipAccess(archive, input);
    input.operatorStar().closeInput();
    const reconnecting = own(new ReconnectingFile(url)),
      size: [bigint] = [0n];
    if (reconnecting.open(osl_File_OpenFlag_Read) !== FileBase.E_None)
      throw new Error("Native reconnecting open failed");
    reconnecting.disconnect();
    if (reconnecting.getSize(size) !== FileBase.E_None)
      throw new Error("Native size repair failed");
    const reopenedSize = Number(size[0]),
      disconnectedPosition = reconnecting.getPos(size) === FileBase.E_NETWORK;
    if (reconnecting.setPos(osl_Pos_Absolut, 1n) !== FileBase.E_None)
      throw new Error("Native cursor recovery failed");
    reconnecting.close();
    const stream = own(new Reference(new XStream_impl(url, false))),
      file = stream.operatorStar(),
      bytes = own(new (Sequence.specialize<number>("sal_Int8", 1))(1)),
      fields = bytes.getArray() as SequenceElements;
    const read = own(file.getInputStream()),
      write = own(file.getOutputStream());
    file.truncate();
    (fields.get(0) as [number])[0] = 123;
    write.operatorStar().writeBytes(bytes);
    file.waitForCompletion();
    write.operatorStar().closeOutput();
    file.seek(0n);
    if (read.operatorStar().readBytes(bytes, 1) !== 1)
      throw new Error("Native file facet read failed");
    const readByte = ((bytes.getConstArray() as SequenceElements).get(0) as [number])[0],
      truncatedLength = Number(file.getLength());
    read.operatorStar().closeInput();
    if (
      reopenedSize !== archive.length ||
      !disconnectedPosition ||
      readByte !== 123 ||
      truncatedLength !== 1
    )
      throw new Error("Native file-UCP contract failed");
    return { zip, reopenedSize, disconnectedPosition, readByte, truncatedLength };
  } finally {
    for (const owner of owners.reverse()) owner.dispose();
  }
}
