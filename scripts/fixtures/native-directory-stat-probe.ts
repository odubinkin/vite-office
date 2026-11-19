/** @fileoverview Real original DirectoryItem/FileStatus metadata, identity and retained-value behavior in main and DOM-free Worker realms. */
import { SvFileStream } from "../../apps/office/src/tools/source/stream/strmunx";
import { StreamMode } from "../../apps/office/src/tools/source/stream/stream.native";
import { getFileSystem } from "../../apps/office/src/external/emscripten/runtime";
import { File, DirectoryItem, FileStatus } from "../../apps/office/src/sal/inc/osl/file.hxx";
import * as H from "../../apps/office/src/sal/inc/osl/file";
import { OUString } from "../../apps/office/src/sal/inc/rtl/ustring";
/** Queries actual native metadata through source wrappers and releases real owners. @returns Public scalar observations only. */
export function probeNativeDirectoryMetadata(): {
  name: string;
  size: number;
  type: number;
  link: boolean;
  target: string;
  same: boolean;
  staleSize: number;
  staleValid: boolean;
  copiedBytes: number[];
  copiedLink: string;
  copyRemoved: boolean;
  fileStreamBytes: number[];
} {
  const owners: { dispose(): void }[] = [],
    fs = getFileSystem(),
    path = "/tmp/native-stat-probe é",
    linkPath = "/tmp/native-stat-probe-link";
  /** Retains an original owner. @param value - Actual source value. @returns Same value. */
  function own<T extends { dispose(): void }>(value: T): T {
    owners.push(value);
    return value;
  }
  /** Constructs original counted UTF16 input. @param text - Fixture text. @returns Owned original string. */
  function unicode(text: string): OUString {
    const units = Uint16Array.from(
      text
        .split("")
        .map(
          /** Reads a code unit. @param unit - Unit. @returns Code. */ (unit) => unit.charCodeAt(0),
        ),
    );
    return own(new OUString(units, units.length));
  }
  /** Reads and releases an original value-returning string. @param value - Owned source value. @returns Public text. */
  function text(value: OUString): string {
    try {
      return String.fromCharCode(...value.getStr().subarray(0, value.getLength()));
    } finally {
      value.dispose();
    }
  }
  const stream = fs.open(path, "w", 0o640);
  fs.write(stream, Uint8Array.of(1, 2, 3), 0, 3);
  fs.close(stream);
  fs.symlink(path, linkPath);
  try {
    const item = own(new DirectoryItem()),
      alias = own(new DirectoryItem()),
      link = own(new DirectoryItem()),
      directory = own(new DirectoryItem()),
      status = own(
        new FileStatus(
          H.osl_FileStatus_Mask_Type |
            H.osl_FileStatus_Mask_FileSize |
            H.osl_FileStatus_Mask_FileName,
        ),
      ),
      linkStatus = own(
        new FileStatus(H.osl_FileStatus_Mask_Type | H.osl_FileStatus_Mask_LinkTargetURL),
      );
    if (
      DirectoryItem.get(unicode("file:///tmp/native-stat-probe%20%C3%A9"), item) !==
        H.oslFileError.None ||
      DirectoryItem.get(unicode("file:///tmp/./native-stat-probe%20%C3%A9"), alias) !==
        H.oslFileError.None ||
      DirectoryItem.get(unicode("file://" + linkPath), link) !== H.oslFileError.None ||
      DirectoryItem.get(unicode("file:///tmp"), directory) !== H.oslFileError.None
    )
      throw new Error("Native directory item get failed");
    if (
      item.getFileStatus(status) !== H.oslFileError.None ||
      link.getFileStatus(linkStatus) !== H.oslFileError.None
    )
      throw new Error("Native file metadata failed");
    const name = text(status.getFileName()),
      size = Number(status.getFileSize()),
      type = status.getFileType(),
      same = item.isIdenticalTo(alias),
      target = text(linkStatus.getLinkTargetURL()),
      isLink = linkStatus.isLink();
    if (directory.getFileStatus(status) !== H.oslFileError.None)
      throw new Error("Native directory metadata reuse failed");
    const copyPath = path + ".copy",
      copyLink = linkPath + ".copy";
    if (
      File.copy(unicode("file://" + path), unicode("file://" + copyPath)) !== H.oslFileError.None ||
      File.copy(unicode("file://" + linkPath), unicode("file://" + copyLink)) !==
        H.oslFileError.None
    )
      throw new Error("Native public File copy failed");
    const copied = own(new File(unicode("file://" + copyPath))),
      output = new Uint8Array(3),
      count: [bigint] = [0n];
    if (
      copied.open(H.osl_File_OpenFlag_Read) !== H.oslFileError.None ||
      copied.read(output, 3n, count) !== H.oslFileError.None ||
      count[0] !== 3n
    )
      throw new Error("Native copied file read failed");
    copied.close();
    const copiedLink = fs.readlink(copyLink);
    const copyRemoved =
      File.remove(unicode("file://" + copyPath)) === H.oslFileError.None &&
      File.remove(unicode("file://" + copyLink)) === H.oslFileError.None;
    if (
      !copyRemoved ||
      output[0] !== 1 ||
      output[1] !== 2 ||
      output[2] !== 3 ||
      copiedLink !== path
    )
      throw new Error("Native copy/remove content contract failed");
    const fileStream = own(new SvFileStream(unicode("file://" + path), StreamMode.READWRITE));
    const fileStreamBytes = new Uint8Array(3);
    if (
      !fileStream.IsOpen() ||
      fileStream.ReadBytes(fileStreamBytes, 3) !== 3 ||
      fileStream.remainingSize() !== 0n
    )
      throw new Error("Native SvFileStream read failed");
    fileStream.Seek(0n);
    fileStream.WriteChar(7);
    fileStream.Flush();
    fileStream.Seek(0n);
    if (fileStream.ReadBytes(fileStreamBytes, 3) !== 3 || fileStreamBytes[0] !== 7)
      throw new Error("Native SvFileStream write/reopen bytes failed");
    fileStream.Close();
    return {
      fileStreamBytes: [...fileStreamBytes],
      copiedBytes: [...output],
      copiedLink,
      copyRemoved,
      name,
      size,
      type,
      link: isLink,
      target,
      same,
      staleSize: Number(status.getFileSize()),
      staleValid: status.isValid(H.osl_FileStatus_Mask_FileSize),
    };
  } finally {
    for (let i = owners.length - 1; i >= 0; i--) owners[i]?.dispose();
    fs.unlink(linkPath);
    fs.unlink(path);
  }
}
