/** @fileoverview Original file_stat.cxx getFileStatus and inode-only DirectoryItem identity over actual selected native stat/access/realpath. */
import { OFFICE_DIRENT_HAVE_D_TYPE } from "@vite-office/libxml2-wasm/constants";
import * as header from "../../inc/osl/file";
import {
  oslFileError as E,
  oslFileType as Type,
  type oslFileStatus,
  type oslDirectoryItem,
} from "../../inc/osl/file";
import { OString } from "../../inc/rtl/string";
import { OUString } from "../../inc/rtl/ustring";
import {
  rtl_uString_assign,
  rtl_convertStringToUString,
  type rtl_uString,
  type rtl_uStringSlot,
} from "../../inc/rtl/ustring.h";
import {
  RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_DEFAULT,
  RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_DEFAULT,
  RTL_TEXTTOUNICODE_FLAGS_INVALID_DEFAULT,
} from "../../inc/rtl/textcvt.h";
import { osl_getThreadTextEncoding } from "../../inc/osl/thread";
import { lstat, access, realpath, type NativeFileStat } from "../../../external/emscripten/file";
import { oslTranslateFileError } from "./file_error_transl";
import { convertPathnameToUrl } from "./file_url.encoding";
import {
  osl_systemPathIsHiddenFileOrDirectoryEntry,
  osl_systemPathGetFileNameOrLastDirectoryPart,
} from "./file_path_helper";
/** Original source stat necessity predicate, preserving cached dirent type and mask-only validation rules. @param mask - Requested mask. @param type - Cached type. @returns Whether to lstat. */
function is_stat_call_necessary(mask: number, type: Type): boolean {
  return !!(
    (mask & header.osl_FileStatus_Mask_Type && type === Type.Unknown) ||
    mask &
      (header.osl_FileStatus_Mask_Attributes |
        header.osl_FileStatus_Mask_CreationTime |
        header.osl_FileStatus_Mask_AccessTime |
        header.osl_FileStatus_Mask_ModifyTime |
        header.osl_FileStatus_Mask_FileSize |
        header.osl_FileStatus_Mask_LinkTargetURL |
        header.osl_FileStatus_Mask_Validate)
  );
}
/** Original pointer-field assignment owns one RTL reference and releases the prior field. @param status - Actual status record. @param field - Source pointer field. @param value - Original borrowed string. @returns Nothing. */
function assign(
  status: oslFileStatus,
  field: "ustrFileName" | "ustrFileURL" | "ustrLinkTargetURL",
  value: rtl_uString,
): void {
  const slot: rtl_uStringSlot = [status[field]];
  rtl_uString_assign(slot, value);
  status[field] = slot[0];
}
/** Original hidden/mode/access attribute publication; access rights are queried only for the explicit attribute mask. @param path - Original native path. @param native - Real stat result. @param mask - Requested fields. @param status - Actual output. @returns Nothing. */
function set_file_attributes(
  path: OString,
  native: NativeFileStat,
  mask: number,
  status: oslFileStatus,
): void {
  status.uAttributes = osl_systemPathIsHiddenFileOrDirectoryEntry(path.pData)
    ? BigInt(header.osl_File_Attribute_Hidden)
    : 0n;
  const bits = [
    [0o400, header.osl_File_Attribute_OwnRead],
    [0o200, header.osl_File_Attribute_OwnWrite],
    [0o100, header.osl_File_Attribute_OwnExe],
    [0o040, header.osl_File_Attribute_GrpRead],
    [0o020, header.osl_File_Attribute_GrpWrite],
    [0o010, header.osl_File_Attribute_GrpExe],
    [0o004, header.osl_File_Attribute_OthRead],
    [0o002, header.osl_File_Attribute_OthWrite],
    [0o001, header.osl_File_Attribute_OthExe],
  ] as const;
  for (const [bit, attribute] of bits)
    if (native.mode & bit) status.uAttributes |= BigInt(attribute);
  status.uValidFields |= header.osl_FileStatus_Mask_Attributes;
  if (mask & header.osl_FileStatus_Mask_Attributes) {
    if (access(path.getStr(), 2).result < 0)
      status.uAttributes |= BigInt(header.osl_File_Attribute_ReadOnly);
    if (access(path.getStr(), 1).result === 0)
      status.uAttributes |= BigInt(header.osl_File_Attribute_Executable);
  }
}
/** Original realpath-to-URL symlink target helper; stale field values remain owned when publication fails. @param path - Native link path. @param status - Original output. @returns Original status. */
function set_link_target_url(path: OString, status: oslFileStatus): E {
  const resolved = realpath(path.getStr());
  if (resolved.path === null) return oslTranslateFileError(resolved.errno);
  const bytes = new OString(resolved.path, resolved.path.indexOf(0)),
    url = new OUString();
  try {
    const result = convertPathnameToUrl(bytes, url);
    if (result !== E.None) return result;
    assign(status, "ustrLinkTargetURL", url.pData);
    status.uValidFields |= header.osl_FileStatus_Mask_LinkTargetURL;
    return E.None;
  } finally {
    url.dispose();
    bytes.dispose();
  }
}
/** Original metadata owner clears validity, not old values, publishes cheap stat fields together, and computes names/URLs only on request. @param item - Source item or null. @param status - Actual output record or null. @param mask - Original requested mask. @returns Original status; partial publications persist on error. */
export function osl_getFileStatus(
  item: oslDirectoryItem,
  status: oslFileStatus | null,
  mask: number,
): E {
  if (item === null || status === null) return E.INVAL;
  const path = new OString(item.m_strFilePath);
  try {
    if (path.isEmpty()) return E.INVAL;
    status.uValidFields = 0;
    const needed = is_stat_call_necessary(mask, item.getFileType());
    if (needed) {
      const result = lstat(path.getStr());
      if (result.value === null) return oslTranslateFileError(result.errno);
      const native = result.value;
      status.eType = native.type as Type;
      status.uValidFields |= header.osl_FileStatus_Mask_Type;
      status.aAccessTime.Seconds = native.access;
      status.aAccessTime.Nanosec = 0;
      status.uValidFields |= header.osl_FileStatus_Mask_AccessTime;
      status.aModifyTime.Seconds = native.modify;
      status.aModifyTime.Nanosec = 0;
      status.uValidFields |= header.osl_FileStatus_Mask_ModifyTime;
      if (native.type === Type.Regular) {
        status.uFileSize = native.size;
        status.uValidFields |= header.osl_FileStatus_Mask_FileSize;
      }
      set_file_attributes(path, native, mask, status);
      if (mask & header.osl_FileStatus_Mask_LinkTargetURL && native.type === Type.Link) {
        const result = set_link_target_url(path, status);
        if (result !== E.None) return result;
      }
    } else if (OFFICE_DIRENT_HAVE_D_TYPE !== 0 && mask & header.osl_FileStatus_Mask_Type) {
      status.eType = item.getFileType();
      status.uValidFields |= header.osl_FileStatus_Mask_Type;
    }
    if (mask & header.osl_FileStatus_Mask_FileURL) {
      const url = new OUString();
      try {
        const result = convertPathnameToUrl(path, url);
        if (result !== E.None) return result;
        assign(status, "ustrFileURL", url.pData);
        status.uValidFields |= header.osl_FileStatus_Mask_FileURL;
      } finally {
        url.dispose();
      }
    }
    if (mask & header.osl_FileStatus_Mask_FileName) {
      const name = new OString();
      try {
        osl_systemPathGetFileNameOrLastDirectoryPart(path.pData, name.getDataAddress());
        const slot: rtl_uStringSlot = [status.ustrFileName];
        try {
          const ok = rtl_convertStringToUString(
            slot,
            name.getStr(),
            name.getLength(),
            osl_getThreadTextEncoding(),
            RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_DEFAULT |
              RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_DEFAULT |
              RTL_TEXTTOUNICODE_FLAGS_INVALID_DEFAULT,
          );
          if (!ok) throw new Error("assert(ok)");
        } finally {
          status.ustrFileName = slot[0];
        }
        status.uValidFields |= header.osl_FileStatus_Mask_FileName;
      } finally {
        name.dispose();
      }
    }
    return E.None;
  } finally {
    path.dispose();
  }
}
/** Original identity fast paths and two actual lstat calls; compares inode alone, without following links or comparing devices. A single-null mismatched input is outside the native valid-lifetime domain. @param first - Original item. @param second - Original item. @returns Original identity result. */
export function osl_identicalDirectoryItem(
  first: oslDirectoryItem,
  second: oslDirectoryItem,
): boolean {
  if (first === second) return true;
  const a = first as NonNullable<oslDirectoryItem>,
    b = second as NonNullable<oslDirectoryItem>;
  if (a.m_strFilePath.equals(b.m_strFilePath)) return true;
  const statA = lstat(a.m_strFilePath.getStr());
  if (statA.value === null) return false;
  const statB = lstat(b.m_strFilePath.getStr());
  if (statB.value === null) return false;
  return statA.value.inode === statB.value.inode;
}
