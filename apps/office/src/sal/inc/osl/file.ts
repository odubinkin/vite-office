/** @fileoverview Original oslFileError declaration order and consumed file position constants from include/osl/file.h. */
/** Source ABI ordinal values. */
export enum oslFileError {
  None,
  PERM,
  NOENT,
  SRCH,
  INTR,
  IO,
  NXIO,
  "2BIG",
  NOEXEC,
  BADF,
  CHILD,
  AGAIN,
  NOMEM,
  ACCES,
  FAULT,
  BUSY,
  EXIST,
  XDEV,
  NODEV,
  NOTDIR,
  ISDIR,
  INVAL,
  NFILE,
  MFILE,
  NOTTY,
  FBIG,
  NOSPC,
  SPIPE,
  ROFS,
  MLINK,
  PIPE,
  DOM,
  RANGE,
  DEADLK,
  NAMETOOLONG,
  NOLCK,
  NOSYS,
  NOTEMPTY,
  LOOP,
  ILSEQ,
  NOLINK,
  MULTIHOP,
  USERS,
  OVERFLOW,
  NOTREADY,
  invalidError,
  TIMEDOUT,
  NETWORK,
  FORCE_EQUAL_SIZE = 0x7fffffff,
}
export const osl_Pos_Absolut = 1,
  osl_Pos_Current = 2,
  osl_Pos_End = 3;

/** Original public file-open read flag. */
export const osl_File_OpenFlag_Read = 0x01;
/** Original public file-open write flag. */
export const osl_File_OpenFlag_Write = 0x02;
/** Original exclusive-create flag. */
export const osl_File_OpenFlag_Create = 0x04;
/** Original opt-out of native file locking. */
export const osl_File_OpenFlag_NoLock = 0x08;

export { osl_getFileURLFromSystemPath, osl_getSystemPathFromFileURL } from "../../osl/unx/file_url";

export {
  osl_openFile,
  osl_closeFile,
  osl_readFile,
  osl_writeFile,
  osl_syncFile,
  osl_getFilePos,
  osl_setFilePos,
  osl_getFileSize,
  osl_setFileSize,
  osl_isEndOfFile,
  type oslFileHandle,
} from "../../osl/unx/file";

/** Original public directory item handle points to the actual source-owned record. */
export type oslDirectoryItem = import("../../osl/unx/file_impl").DirectoryItem_Impl | null;
/** Original UNIX file types, including source enum order. */
export enum oslFileType {
  Directory,
  Volume,
  Regular,
  Fifo,
  Socket,
  Link,
  Special,
  Unknown,
}
/** Original public file status aggregate; primitive members are caller-initialized. */
export interface oslFileStatus {
  uStructSize: number;
  uValidFields: number;
  eType: oslFileType;
  uAttributes: bigint;
  aCreationTime: import("./time").TimeValue;
  aAccessTime: import("./time").TimeValue;
  aModifyTime: import("./time").TimeValue;
  uFileSize: bigint;
  ustrFileName: import("../rtl/ustring.h").rtl_uString | null;
  ustrFileURL: import("../rtl/ustring.h").rtl_uString | null;
  ustrLinkTargetURL: import("../rtl/ustring.h").rtl_uString | null;
}
/** Original ReadOnly attribute bit. */
export const osl_File_Attribute_ReadOnly = 1;
/** Original Hidden attribute bit. */
export const osl_File_Attribute_Hidden = 2;
/** Original Executable attribute bit. */
export const osl_File_Attribute_Executable = 16;
/** Original GrpWrite attribute bit. */
export const osl_File_Attribute_GrpWrite = 32;
/** Original GrpRead attribute bit. */
export const osl_File_Attribute_GrpRead = 64;
/** Original GrpExe attribute bit. */
export const osl_File_Attribute_GrpExe = 128;
/** Original OwnWrite attribute bit. */
export const osl_File_Attribute_OwnWrite = 256;
/** Original OwnRead attribute bit. */
export const osl_File_Attribute_OwnRead = 512;
/** Original OwnExe attribute bit. */
export const osl_File_Attribute_OwnExe = 1024;
/** Original OthWrite attribute bit. */
export const osl_File_Attribute_OthWrite = 2048;
/** Original OthRead attribute bit. */
export const osl_File_Attribute_OthRead = 4096;
/** Original OthExe attribute bit. */
export const osl_File_Attribute_OthExe = 8192;
/** Original Type file status mask. */
export const osl_FileStatus_Mask_Type = 1;
/** Original Attributes file status mask. */
export const osl_FileStatus_Mask_Attributes = 2;
/** Original CreationTime file status mask. */
export const osl_FileStatus_Mask_CreationTime = 16;
/** Original AccessTime file status mask. */
export const osl_FileStatus_Mask_AccessTime = 32;
/** Original ModifyTime file status mask. */
export const osl_FileStatus_Mask_ModifyTime = 64;
/** Original FileSize file status mask. */
export const osl_FileStatus_Mask_FileSize = 128;
/** Original FileName file status mask. */
export const osl_FileStatus_Mask_FileName = 256;
/** Original FileURL file status mask. */
export const osl_FileStatus_Mask_FileURL = 512;
/** Original LinkTargetURL file status mask. */
export const osl_FileStatus_Mask_LinkTargetURL = 1024;
/** Original All file status mask. */
export const osl_FileStatus_Mask_All = 2147483647;
/** Original Validate file status mask. */
export const osl_FileStatus_Mask_Validate = 2147483648;

export {
  osl_getDirectoryItem,
  osl_acquireDirectoryItem,
  osl_releaseDirectoryItem,
} from "../../osl/unx/file_misc";

export { osl_getFileStatus, osl_identicalDirectoryItem } from "../../osl/unx/file_stat";

export { osl_copyFile, osl_removeFile } from "../../osl/unx/file_misc";

export { osl_getTempDirURL } from "../../osl/unx/tempfile";
export {
  osl_createDirectory,
  osl_createDirectoryWithFlags,
  osl_removeDirectory,
  osl_createDirectoryPath,
  type oslDirectoryCreationCallbackFunc,
} from "../../osl/unx/file_misc";

/** Original opaque directory handle backed by its source record and actual libc cursor. */
export type oslDirectory = import("../../osl/unx/file_misc").DirectoryImpl | null;
export {
  osl_openDirectory,
  osl_closeDirectory,
  osl_getNextDirectoryItem,
} from "../../osl/unx/file_misc";
