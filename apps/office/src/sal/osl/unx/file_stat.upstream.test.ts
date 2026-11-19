/** @fileoverview Original selected UNIX FileStatus/DirectoryItem assertions over real MEMFS fixtures; source root/time quirks are retained. */
import { beforeAll, beforeEach, afterEach, expect, it } from "vitest";
import { initializeRuntime, getRuntime, getFileSystem } from "../../../external/emscripten/runtime";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
import * as H from "../../inc/osl/file";
import { FileStatus, DirectoryItem } from "../../inc/osl/file.hxx";
import { TimeValue, osl_getSystemTime } from "../../inc/osl/time";
const base = "/tmp/upstream-stat",
  path = base + "/tmpname",
  url = "file://" + path;
beforeAll(
  /** Initializes actual selected native APIs. @returns Completion. */ async () => {
    await initializeRuntime();
  },
);
beforeEach(
  /** Creates genuine upstream temporary fixture relationships. @returns Nothing. */ () => {
    const fs = getFileSystem();
    fs.mkdir(base);
    fs.mkdir(base + "/tmpdir");
    const file = fs.open(path, "w");
    fs.close(file);
  },
);
afterEach(
  /** Destroys original owners and real entries. @returns Nothing. */ () => {
    releaseDomScope();
    const fs = getFileSystem();
    for (const name of fs.readdir(base)) {
      if (name === "." || name === "..") continue;
      if (name === "tmpdir") fs.rmdir(base + "/" + name);
      else fs.unlink(base + "/" + name);
    }
    fs.rmdir(base);
  },
);
/** Creates an actual original wrapper fixture. Directory enumeration setup is not claimed here. @param value - URL. @returns Owner. */
function item(value = url): DirectoryItem {
  const result = own(new DirectoryItem());
  expect(DirectoryItem.get(u(value), result)).toBe(H.oslFileError.None);
  return result;
}
it.each([
  { id: "001", mask: H.osl_FileStatus_Mask_All, expected: "tmpname" },
  { id: "002", mask: 0, expected: "" },
])(
  "ports FileStatus::ctors_$id",
  /** Source exact status/name assertions. @param vector - Original vector. @returns Nothing. */ ({
    mask,
    expected,
  }) => {
    const status = own(new FileStatus(mask));
    expect(item().getFileStatus(status)).toBe(H.oslFileError.None);
    expect(read(status.getFileName())).toBe(expected);
  },
);
it("ports FileStatus::isValid_001 and status assertions from _002/_004", /** Original check_FileStatus only prints validity for the latter source cases; no invented expected masks. @returns Nothing. */ () => {
  const original = item(),
    empty = own(new FileStatus(0));
  expect(original.getFileStatus(empty)).toBe(H.oslFileError.None);
  expect(empty.isValid(0)).toBe(true);
  for (const mask of [
    H.osl_FileStatus_Mask_Type |
      H.osl_FileStatus_Mask_Attributes |
      H.osl_FileStatus_Mask_CreationTime |
      H.osl_FileStatus_Mask_AccessTime |
      H.osl_FileStatus_Mask_ModifyTime |
      H.osl_FileStatus_Mask_FileSize |
      H.osl_FileStatus_Mask_FileName |
      H.osl_FileStatus_Mask_FileURL,
    H.osl_FileStatus_Mask_All,
    H.osl_FileStatus_Mask_Validate,
  ])
    expect(original.getFileStatus(own(new FileStatus(mask)))).toBe(H.oslFileError.None);
});
it.each([
  { id: "001", value: url, type: FileStatus.Regular, name: "tmpname" },
  { id: "002", value: "file://" + base + "/tmpdir", type: FileStatus.Directory, name: "tmpdir" },
])(
  "ports FileStatus::getFileType_$id assertions",
  /** Direct original get supplies actual items; upstream directory-enumeration setup remains unported. @param vector - Source filename/type vector. @returns Nothing. */ ({
    value,
    type,
    name,
  }) => {
    const status = own(new FileStatus(H.osl_FileStatus_Mask_Type | H.osl_FileStatus_Mask_FileName));
    expect(item(value).getFileStatus(status)).toBe(H.oslFileError.None);
    if (
      status.isValid(H.osl_FileStatus_Mask_FileName) &&
      status.isValid(H.osl_FileStatus_Mask_Type)
    ) {
      expect(read(status.getFileName())).toBe(name);
      expect(status.getFileType()).toBe(type);
    }
  },
);
it("checks actual SDK special file alongside Solaris-only source getFileType_007", /** The selected runtime has its own actual character-device entry, without host device access. @returns Nothing. */ () => {
  const status = own(new FileStatus(H.osl_FileStatus_Mask_Type | H.osl_FileStatus_Mask_FileName));
  expect(item("file:///dev/null").getFileStatus(status)).toBe(H.oslFileError.None);
  expect(status.getFileType()).toBe(FileStatus.Special);
});
it.each([
  {
    id: "001",
    mode: 0o444,
    bits:
      H.osl_File_Attribute_GrpRead | H.osl_File_Attribute_OwnRead | H.osl_File_Attribute_OthRead,
  },
  {
    id: "002",
    mode: 0o111,
    bits:
      H.osl_File_Attribute_Executable |
      H.osl_File_Attribute_GrpExe |
      H.osl_File_Attribute_OwnExe |
      H.osl_File_Attribute_OthExe,
  },
  {
    id: "003",
    mode: 0o222,
    bits:
      H.osl_File_Attribute_GrpWrite | H.osl_File_Attribute_OwnWrite | H.osl_File_Attribute_OthWrite,
  },
])(
  "ports UNIX FileStatus::getAttributes_$id with original root branch",
  /** Real mode fixtures substitute upstream chmod setup; exact source geteuid-dependent expectations are retained. @param vector - Original mode/attribute vector. @returns Nothing. */ ({
    id,
    mode,
    bits,
  }) => {
    const fs = getFileSystem();
    fs.unlink(path);
    const file = fs.open(path, "w", mode);
    fs.close(file);
    const status = own(new FileStatus(H.osl_FileStatus_Mask_Attributes));
    expect(item().getFileStatus(status)).toBe(H.oslFileError.None);
    const module = getRuntime() as NonNullable<ReturnType<typeof getRuntime>>,
      readonly = id !== "003" && module._geteuid() !== 0 ? H.osl_File_Attribute_ReadOnly : 0;
    expect(status.getAttributes()).toBe(BigInt(bits | readonly));
  },
);
it("ports FileStatus::getAttributes_004 hidden bit assertion", /** Original hidden-name fixture is a real file. @returns Nothing. */ () => {
  const fs = getFileSystem(),
    hidden = base + "/.tmpname",
    file = fs.open(hidden, "w");
  fs.close(file);
  const status = own(new FileStatus(H.osl_FileStatus_Mask_Attributes));
  expect(item("file://" + hidden).getFileStatus(status)).toBe(H.oslFileError.None);
  expect(status.getAttributes() & BigInt(H.osl_File_Attribute_Hidden)).toBe(
    BigInt(H.osl_File_Attribute_Hidden),
  );
});
/** Original one-sided t_compareTime milliseconds comparison, including signed borrow/truncation. @param end - Original end. @param start - Original start. @returns Source comparison. */
function compareTime(end: TimeValue, start: TimeValue): boolean {
  let seconds = (end.Seconds - start.Seconds) | 0,
    nanos = (end.Nanosec | 0) - (start.Nanosec | 0);
  if (nanos < 0) {
    nanos = 1000000000 + nanos;
    seconds--;
  }
  const milliseconds = (seconds * 1000 + Math.trunc(nanos / 1000000)) | 0;
  return milliseconds < 2000;
}
it.each([
  { id: "getAccessTime_001", mask: H.osl_FileStatus_Mask_AccessTime },
  { id: "getModifyTime_001", mask: H.osl_FileStatus_Mask_ModifyTime },
])(
  "ports FileStatus::$id and original t_compareTime",
  /** VM objects replace malloc'd test TimeValues; source clock tolerance/predicate is unchanged. @param vector - Original field request. @returns Nothing. */ ({
    mask,
    id,
  }) => {
    const current = new TimeValue(),
      status = own(new FileStatus(mask));
    if (id === "getModifyTime_001") expect(osl_getSystemTime(current)).toBe(true);
    expect(item().getFileStatus(status)).toBe(H.oslFileError.None);
    if (id === "getAccessTime_001") expect(osl_getSystemTime(current)).toBe(true);
    expect(
      compareTime(
        id === "getAccessTime_001" ? status.getAccessTime() : status.getModifyTime(),
        current,
      ),
    ).toBe(true);
  },
);
it.each([
  { id: "001", size: 0n },
  { id: "002", size: 1024n },
])(
  "ports FileStatus::getFileSize_$id",
  /** Actual selected OSL ftruncate creates original TEST_FILE_SIZE=1024 without a fabricated stat result. @param vector - Original size vector. @returns Nothing. */ ({
    size,
  }) => {
    const fs = getFileSystem(),
      stream = fs.open(path, "r+");
    fs.ftruncate(stream.fd, Number(size));
    fs.close(stream);
    const status = own(new FileStatus(H.osl_FileStatus_Mask_FileSize));
    expect(item().getFileStatus(status)).toBe(H.oslFileError.None);
    expect(status.getFileSize()).toBe(size);
  },
);
it.each([
  { id: "getFileName_001", mask: H.osl_FileStatus_Mask_FileName, expected: "tmpname" },
  { id: "getFileURL_001", mask: H.osl_FileStatus_Mask_FileURL, expected: url },
])(
  "ports FileStatus::$id",
  /** Original named/url getter assertions. @param vector - Source mask/value vector. @returns Nothing. */ ({
    mask,
    expected,
  }) => {
    const status = own(new FileStatus(mask));
    expect(item().getFileStatus(status)).toBe(H.oslFileError.None);
    expect(
      read(mask === H.osl_FileStatus_Mask_FileName ? status.getFileName() : status.getFileURL()),
    ).toBe(expected);
  },
);
it.each(["001", "002"])(
  "ports DirectoryItem::copy_assin_Ctors_%s",
  /** Source copy and assignment must preserve original name publication. @param id - Source overload case. @returns Nothing. */ (
    id,
  ) => {
    const original = item(),
      copy = own(id === "001" ? new DirectoryItem(original) : new DirectoryItem());
    if (id === "002") copy.assign(original);
    const status = own(new FileStatus(H.osl_FileStatus_Mask_FileName));
    expect(copy.getFileStatus(status)).toBe(H.oslFileError.None);
    expect(read(status.getFileName())).toBe("tmpname");
  },
);
it("ports DirectoryItem::is_001 and is_002", /** Original default and successful get validity assertions. @returns Nothing. */ () => {
  const value = own(new DirectoryItem());
  expect(value.is()).toBe(false);
  expect(DirectoryItem.get(u(url), value)).toBe(H.oslFileError.None);
  expect(value.is()).toBe(true);
});

it("ports DirectoryItem::ctors_001 and get_001", /** Original successful get and filename assertions use a real original wrapper. @returns Nothing. */ () => {
  const value = own(new DirectoryItem());
  const result = DirectoryItem.get(u(url), value);
  expect(result).toBe(H.oslFileError.None);
  const status = own(new FileStatus(H.osl_FileStatus_Mask_FileName));
  expect(value.getFileStatus(status)).toBe(H.oslFileError.None);
  expect(result).toBe(H.oslFileError.None);
  expect(read(status.getFileName())).toBe("tmpname");
});
it("ports DirectoryItem::get_002 and get_003", /** The original C++ API rejects raw system paths and absent URLs. @returns Nothing. */ () => {
  const value = own(new DirectoryItem());
  expect(DirectoryItem.get(u(path), value)).toBe(H.oslFileError.INVAL);
  expect(DirectoryItem.get(u("file://" + base + "/missing"), value)).toBe(H.oslFileError.NOENT);
});
it.each([
  { id: "001", value: url, name: "tmpname" },
  { id: "003", value: "file://" + base + "/tmpdir", name: "tmpdir" },
])(
  "ports DirectoryItem::getFileStatus_$id",
  /** Original regular/directory filename/status vectors. @param vector - Source vector. @returns Nothing. */ ({
    value,
    name,
  }) => {
    const directoryItem = own(new DirectoryItem());
    expect(DirectoryItem.get(u(value), directoryItem)).toBe(H.oslFileError.None);
    const status = own(new FileStatus(H.osl_FileStatus_Mask_FileName));
    expect(directoryItem.getFileStatus(status)).toBe(H.oslFileError.None);
    expect(read(status.getFileName())).toBe(name);
  },
);
it("ports DirectoryItem::getFileStatus_002", /** Original failed get leaves an empty item whose status call returns INVAL. @returns Nothing. */ () => {
  const directoryItem = own(new DirectoryItem());
  expect(DirectoryItem.get(u("file://" + base + "/missing"), directoryItem)).toBe(
    H.oslFileError.NOENT,
  );
  expect(directoryItem.getFileStatus(own(new FileStatus(H.osl_FileStatus_Mask_FileName)))).toBe(
    H.oslFileError.INVAL,
  );
});
