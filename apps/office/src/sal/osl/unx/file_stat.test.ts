/** @fileoverview Original DirectoryItem/FileStatus metadata over genuine MEMFS/libc, with source wrapper QA and critical publication/lifetime rules. */
import { beforeAll, beforeEach, afterEach, expect, it } from "vitest";
import { initializeRuntime, getFileSystem, getRuntime } from "../../../external/emscripten/runtime";
import { fileStatusSize, lstat } from "../../../external/emscripten/file";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
import { OString } from "../../inc/rtl/string";
import { OUString } from "../../inc/rtl/ustring";
import * as H from "../../inc/osl/file";
import { FileStatus, DirectoryItem, FileBase } from "../../inc/osl/file.hxx";
import { setAllowedPaths } from "./file.access";
import {
  osl_systemPathGetFileNameOrLastDirectoryPart,
  osl_systemPathIsHiddenFileOrDirectoryEntry,
  osl_systemPathIsLocalOrParentDirectoryEntry,
} from "./file_path_helper";
const base = "/tmp/native-stat",
  file = base + "/file",
  url = "file://" + file;
beforeAll(
  /** Initializes actual pinned native metadata APIs. @returns Completion. */ async () => {
    await initializeRuntime();
  },
);
beforeEach(
  /** Creates real file/directory/symlink fixture. @returns Nothing. */ () => {
    const fs = getFileSystem();
    fs.mkdir(base);
    fs.mkdir(base + "/dir");
    const stream = fs.open(file, "w", 0o640);
    fs.write(stream, Uint8Array.of(1, 2, 3), 0, 3);
    fs.close(stream);
    fs.symlink("file", base + "/link");
  },
);
afterEach(
  /** Releases source values before removing actual fixture entries. @returns Nothing. */ () => {
    setAllowedPaths(new Uint16Array());
    releaseDomScope();
    const fs = getFileSystem();
    for (const name of fs.readdir(base)) {
      if (name === "." || name === "..") continue;
      if (name === "dir") fs.rmdir(base + "/" + name);
      else fs.unlink(base + "/" + name);
    }
    fs.rmdir(base);
  },
);
/** Gets an actual source item through its original public wrapper. @param value - Absolute URL. @returns Owned wrapper. */
function item(value = url): DirectoryItem {
  const result = own(new DirectoryItem());
  expect(DirectoryItem.get(u(value), result)).toBe(H.oslFileError.None);
  return result;
}
it("matches compiled status size and retains source zero-initialized defaults", /** No guessed ABI value or native allocation is used for the status aggregate. @returns Nothing. */ () => {
  const status = own(new FileStatus(0));
  expect(status._aStatus.uStructSize).toBe(fileStatusSize());
  expect(fileStatusSize()).toBe(getRuntime()?._office_file_status_size());
  expect(status.isValid(0)).toBe(true);
  expect(status.isValid(H.osl_FileStatus_Mask_Type)).toBe(false);
  expect(status.getFileType()).toBe(FileStatus.Unknown);
  expect(status.isRegular()).toBe(false);
  expect(status.isLink()).toBe(false);
  expect(status.getFileSize()).toBe(0n);
  expect(status.getAttributes()).toBe(0n);
  expect(status.getCreationTime().Seconds).toBe(0);
  expect(status.getAccessTime().Nanosec).toBe(0);
  expect(status.getModifyTime().Nanosec).toBe(0);
  expect(read(status.getFileURL())).toBe("");
  expect(read(status.getLinkTargetURL())).toBe("");
});
it("publishes cheap native stat fields and only requested names/URLs", /** Source Type request also supplies times/size/mode attributes, without creation time. @returns Nothing. */ () => {
  const regular = item(),
    status = own(new FileStatus(H.osl_FileStatus_Mask_Type));
  expect(regular.getFileStatus(status)).toBe(H.oslFileError.None);
  expect(status.getFileType()).toBe(FileStatus.Regular);
  expect(status.isRegular()).toBe(true);
  expect(status.getFileSize()).toBe(3n);
  expect(status.isValid(H.osl_FileStatus_Mask_FileSize)).toBe(true);
  expect(status.isValid(H.osl_FileStatus_Mask_CreationTime)).toBe(false);
  expect(status.getAttributes()).toBe(
    BigInt(
      H.osl_File_Attribute_OwnRead | H.osl_File_Attribute_OwnWrite | H.osl_File_Attribute_GrpRead,
    ),
  );
  expect(read(status.getFileName())).toBe("");
  expect(read(status.getFileURL())).toBe("");
  const copied = status.getAccessTime(),
    original = copied.Seconds;
  copied.Seconds = 123;
  expect(status.getAccessTime().Seconds).toBe(original);
  const named = own(new FileStatus(H.osl_FileStatus_Mask_FileName | H.osl_FileStatus_Mask_FileURL));
  expect(regular.getFileStatus(named)).toBe(H.oslFileError.None);
  expect(named.getFileType()).toBe(FileStatus.Unknown);
  expect(read(named.getFileName())).toBe("file");
  expect(read(named.getFileURL())).toBe(url);
});
it("retains source scalar values when a reused status no longer marks them valid", /** The original directory stat leaves a previous regular-file size stored. @returns Nothing. */ () => {
  const status = own(
    new FileStatus(
      H.osl_FileStatus_Mask_Type | H.osl_FileStatus_Mask_FileSize | H.osl_FileStatus_Mask_FileName,
    ),
  );
  expect(item().getFileStatus(status)).toBe(H.oslFileError.None);
  const name = own(status.getFileName());
  expect(item("file://" + base + "/dir").getFileStatus(status)).toBe(H.oslFileError.None);
  expect(status.getFileType()).toBe(FileStatus.Directory);
  expect(status.isValid(H.osl_FileStatus_Mask_FileSize)).toBe(false);
  expect(status.getFileSize()).toBe(3n);
  expect(read(new OUString(name))).toBe("file");
  expect(read(status.getFileName())).toBe("dir");
});
it("returns real symlink metadata/target and keeps partial publication on target failure", /** A real link is lstatted while target resolution uses original realpath. @returns Nothing. */ () => {
  const link = item("file://" + base + "/link"),
    status = own(new FileStatus(H.osl_FileStatus_Mask_All));
  expect(link.getFileStatus(status)).toBe(H.oslFileError.None);
  expect(status.isLink()).toBe(true);
  expect(status.isRegular()).toBe(false);
  expect(read(status.getLinkTargetURL())).toBe(url);
  getFileSystem().unlink(file);
  expect(link.getFileStatus(status)).toBe(H.oslFileError.NOENT);
  expect(status.isValid(H.osl_FileStatus_Mask_Type)).toBe(true);
  expect(status.isLink()).toBe(true);
  expect(status.isValid(H.osl_FileStatus_Mask_LinkTargetURL)).toBe(false);
  expect(read(status.getLinkTargetURL())).toBe("");
});
it("keeps requested validation distinct from name-only/no-field access after deletion", /** Source mask controls stat; clearing validity does not clear old pointer fields. @returns Nothing. */ () => {
  const existing = item(),
    names = own(new FileStatus(H.osl_FileStatus_Mask_FileName)),
    empty = own(new FileStatus(0)),
    validate = own(new FileStatus(H.osl_FileStatus_Mask_Validate));
  getFileSystem().unlink(file);
  expect(existing.getFileStatus(names)).toBe(H.oslFileError.None);
  expect(read(names.getFileName())).toBe("file");
  expect(existing.getFileStatus(empty)).toBe(H.oslFileError.None);
  expect(existing.getFileStatus(validate)).toBe(H.oslFileError.NOENT);
  expect(validate._aStatus.uValidFields).toBe(0);
});
it("retains selected SDK mode/hidden attributes independently of legacy root assumptions", /** Real fixture modes have exact observable metadata in the selected MEMFS/libc profile. @returns Nothing. */ () => {
  const fs = getFileSystem();
  const fixtures = [
    {
      name: "readonly",
      mode: 0o444,
      expected:
        H.osl_File_Attribute_ReadOnly |
        H.osl_File_Attribute_OwnRead |
        H.osl_File_Attribute_GrpRead |
        H.osl_File_Attribute_OthRead,
    },
    {
      name: "execute",
      mode: 0o111,
      expected:
        H.osl_File_Attribute_ReadOnly |
        H.osl_File_Attribute_Executable |
        H.osl_File_Attribute_OwnExe |
        H.osl_File_Attribute_GrpExe |
        H.osl_File_Attribute_OthExe,
    },
    {
      name: ".hidden",
      mode: 0o640,
      expected:
        H.osl_File_Attribute_Hidden |
        H.osl_File_Attribute_OwnRead |
        H.osl_File_Attribute_OwnWrite |
        H.osl_File_Attribute_GrpRead,
    },
  ];
  for (const { name, mode, expected } of fixtures) {
    const stream = fs.open(base + "/" + name, "w", mode);
    fs.close(stream);
    const status = own(new FileStatus(H.osl_FileStatus_Mask_Attributes));
    expect(item("file://" + base + "/" + name).getFileStatus(status)).toBe(H.oslFileError.None);
    expect(status.getAttributes()).toBe(BigInt(expected));
  }
});
it("compares source inode/path identity without following symlinks", /** All handles come from real filesystem entries and aliases. @returns Nothing. */ () => {
  const regular = item(),
    same = item(),
    alias = item("file://" + base + "/./file"),
    link = item("file://" + base + "/link"),
    directory = item("file://" + base + "/dir");
  expect(regular.isIdenticalTo(regular)).toBe(true);
  expect(regular.isIdenticalTo(same)).toBe(true);
  expect(regular.isIdenticalTo(alias)).toBe(true);
  expect(regular.isIdenticalTo(link)).toBe(false);
  expect(regular.isIdenticalTo(directory)).toBe(false);
  expect(own(new DirectoryItem()).isIdenticalTo(own(new DirectoryItem()))).toBe(true);
  getFileSystem().unlink(file);
  expect(regular.isIdenticalTo(same)).toBe(true);
  expect(regular.isIdenticalTo(alias)).toBe(false);
  expect(directory.isIdenticalTo(regular)).toBe(false);
});
it("retains original wrapper copy/assignment/get release ordering", /** A failed wrapper get clears its old item; a real copied peer retains the original item. @returns Nothing. */ () => {
  const original = item(),
    copy = own(new DirectoryItem(original)),
    assigned = own(new DirectoryItem());
  assigned.assign(copy);
  assigned.assign(assigned);
  original.dispose();
  const status = own(new FileStatus(H.osl_FileStatus_Mask_Type));
  expect(copy.getFileStatus(status)).toBe(H.oslFileError.None);
  expect(DirectoryItem.get(u(""), assigned)).toBe(H.oslFileError.INVAL);
  expect(assigned.is()).toBe(false);
  expect(assigned.getFileStatus(status)).toBe(H.oslFileError.INVAL);
  expect(copy.getFileStatus(status)).toBe(H.oslFileError.None);
  const empty = own(new DirectoryItem());
  copy.assign(empty);
  expect(copy.is()).toBe(false);
});
it("preserves raw C output on errors and does not release an overwritten raw output", /** The C caller retains responsibility for its old handle; wrappers separately implement release-before-get. @returns Nothing. */ () => {
  const slot: [H.oslDirectoryItem] = [null];
  expect(H.osl_getDirectoryItem(null, slot)).toBe(H.oslFileError.INVAL);
  expect(H.osl_getDirectoryItem(u(url).pData, null)).toBe(H.oslFileError.INVAL);
  expect(H.osl_acquireDirectoryItem(null)).toBe(H.oslFileError.INVAL);
  expect(H.osl_releaseDirectoryItem(null)).toBe(H.oslFileError.INVAL);
  expect(H.osl_getDirectoryItem(u(url).pData, slot)).toBe(H.oslFileError.None);
  const first = slot[0];
  try {
    expect(H.osl_getDirectoryItem(u("file://" + base + "/missing").pData, slot)).toBe(
      H.oslFileError.NOENT,
    );
    expect(slot[0]).toBe(first);
    expect(H.osl_acquireDirectoryItem(first)).toBe(H.oslFileError.None);
    expect(H.osl_releaseDirectoryItem(first)).toBe(H.oslFileError.None);
    expect(H.osl_getDirectoryItem(u("file://" + base + "/dir").pData, slot)).toBe(
      H.oslFileError.None,
    );
    expect(first?.m_strFilePath.getLength()).toBe(file.length);
    const allowed = u("r:" + base + "/dir");
    setAllowedPaths(allowed.getStr().subarray(0, allowed.getLength()));
    const before = slot[0];
    expect(H.osl_getDirectoryItem(u(url).pData, slot)).toBe(H.oslFileError.ACCES);
    expect(slot[0]).toBe(before);
  } finally {
    if (slot[0] !== first) H.osl_releaseDirectoryItem(slot[0]);
    H.osl_releaseDirectoryItem(first);
  }
});
it("preserves path helper basename/hidden and shared in-place slash semantics", /** Original const-reference helper still changes shared byte length while trimming. @returns Nothing. */ () => {
  expect(osl_systemPathIsHiddenFileOrDirectoryEntry(null)).toBe(false);
  for (const [text, basename, hidden, dot] of [
    ["/", "", false, false],
    ["", "", false, false],
    ["a///", "a", false, false],
    ["/.name/", ".name", true, false],
    ["/.", ".", false, true],
    ["/..", "..", false, true],
  ] as const) {
    const data = new TextEncoder().encode(text),
      path = own(new OString(data, data.length)),
      peer = own(new OString(path)),
      name = own(new OString());
    osl_systemPathGetFileNameOrLastDirectoryPart(path.pData, name.getDataAddress());
    expect(Array.from(name.getStr().subarray(0, name.getLength()))).toEqual(
      Array.from(new TextEncoder().encode(basename)),
    );
    expect(peer.getLength()).toBe(path.getLength());
    expect(osl_systemPathIsHiddenFileOrDirectoryEntry(path.pData)).toBe(hidden);
    expect(osl_systemPathIsLocalOrParentDirectoryEntry(path.pData)).toBe(dot);
  }
});
it("copies actual native stat fields including exact size/inode and errno", /** DTO is populated by pinned libc, not a replacement stat provider. @returns Nothing. */ () => {
  const data = new TextEncoder().encode(file),
    bytes = own(new OString(data, data.length)),
    result = lstat(bytes.getStr());
  expect(result.errno).toBe(0);
  expect(result.value?.size).toBe(3n);
  expect(result.value?.type).toBe(FileStatus.Regular);
  expect(result.value?.inode).toBeGreaterThan(0n);
  const bad = own(new OString(new TextEncoder().encode(base + "/missing"), base.length + 8));
  expect(lstat(bad.getStr()).value).toBeNull();
});

it("retains original OString equality pointer/length/reverse-byte semantics", /** Actual byte owners exercise shared pointers, independent buffers and embedded zeros without a fabricated metadata item. @returns Nothing. */ () => {
  const first = own(new OString(Uint8Array.of(97, 0, 255), 3)),
    shared = own(new OString(first)),
    equal = own(new OString(Uint8Array.of(97, 0, 255), 3)),
    shorter = own(new OString(Uint8Array.of(97, 0), 2)),
    different = own(new OString(Uint8Array.of(97, 0, 254), 3));
  expect(first.equals(shared)).toBe(true);
  expect(first.equals(equal)).toBe(true);
  expect(first.equals(shorter)).toBe(false);
  expect(first.equals(different)).toBe(false);
});

it("retains original FileBase URL wrappers and DirectoryItem inheritance", /** Source wrappers use the actual C entry points and same output ownership. @returns Nothing. */ () => {
  const owner = item(),
    path = u(file),
    converted = u(""),
    restored = u("");
  expect(owner).toBeInstanceOf(FileBase);
  expect(FileBase.E_None).toBe(H.oslFileError.None);
  expect(FileBase.E_INVAL).toBe(H.oslFileError.INVAL);
  expect(FileBase.getFileURLFromSystemPath(path, converted)).toBe(FileBase.E_None);
  expect(read(new OUString(converted))).toBe(url);
  expect(FileBase.getSystemPathFromFileURL(converted, restored)).toBe(FileBase.E_None);
  expect(read(new OUString(restored))).toBe(file);
});

it("preserves cheap attribute validity before expensive access rights are requested", /** Both status values are real; source marks the cheap attributes valid before populating readonly/executable rights. @returns Nothing. */ () => {
  const fs = getFileSystem(),
    file = fs.open(base + "/readonly", "w", 0o444);
  fs.close(file);
  const value = item("file://" + base + "/readonly"),
    cheap = own(new FileStatus(H.osl_FileStatus_Mask_Type)),
    full = own(new FileStatus(H.osl_FileStatus_Mask_Attributes));
  expect(value.getFileStatus(cheap)).toBe(H.oslFileError.None);
  expect(cheap.isValid(H.osl_FileStatus_Mask_Attributes)).toBe(true);
  expect(cheap.getAttributes() & BigInt(H.osl_File_Attribute_ReadOnly)).toBe(0n);
  expect(value.getFileStatus(full)).toBe(H.oslFileError.None);
  expect(full.getAttributes() & BigInt(H.osl_File_Attribute_ReadOnly)).toBe(1n);
});
