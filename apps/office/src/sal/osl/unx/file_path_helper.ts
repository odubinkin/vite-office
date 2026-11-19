/** @fileoverview Consumed original file_path_helper.cxx in-place separator removal; byte absolute-path concatenation; other path helpers remain unbound. */
import { OString } from "../../inc/rtl/string";
import { rtl_string_assign, type rtl_StringSlot } from "../../inc/rtl/string.h";
import type { rtl_String } from "../../inc/rtl/string.h";
/** Original mutating byte path helper, preserving one root slash and terminating each shortened result. @param path - Original mutable RTL byte allocation or null. @returns Nothing. */
export function osl_systemPathRemoveSeparator(path: rtl_String | null): void {
  if (path === null) return;
  while (path.length > 1 && path.buffer[path.length - 1] === 47) {
    path.length--;
    path.buffer[path.length] = 0;
  }
}

/** Original last path component helper, including in-place trailing separator mutation of the shared input allocation. @param pathData - Borrowed source allocation. @param output - Original output pointer slot. @returns Nothing. */
export function osl_systemPathGetFileNameOrLastDirectoryPart(
  pathData: rtl_String,
  output: rtl_StringSlot,
): void {
  const path = new OString(pathData),
    last = new OString();
  try {
    osl_systemPathRemoveSeparator(path.pData);
    if (path.getLength() > 1 || (path.getLength() === 1 && path.getStr()[0] !== 47)) {
      const index = path.getStr().subarray(0, path.getLength()).lastIndexOf(47) + 1,
        value = path.copy(index);
      try {
        last.assign(value);
      } finally {
        value.dispose();
      }
    }
    rtl_string_assign(output, last.pData);
  } finally {
    last.dispose();
    path.dispose();
  }
}
/** Original dot and dot-dot basename predicate. @param path - Original path. @returns Whether local/parent entry. */
export function osl_systemPathIsLocalOrParentDirectoryEntry(path: rtl_String): boolean {
  const name = new OString();
  try {
    osl_systemPathGetFileNameOrLastDirectoryPart(path, name.getDataAddress());
    return (
      (name.getLength() === 1 && name.getStr()[0] === 46) ||
      (name.getLength() === 2 && name.getStr()[0] === 46 && name.getStr()[1] === 46)
    );
  } finally {
    name.dispose();
  }
}
/** Original hidden basename predicate; dot and dot-dot are excluded. @param path - Borrowed path or null. @returns Original hidden flag. */
export function osl_systemPathIsHiddenFileOrDirectoryEntry(path: rtl_String | null): boolean {
  if (path === null || path.length === 0) return false;
  const name = new OString();
  try {
    osl_systemPathGetFileNameOrLastDirectoryPart(path, name.getDataAddress());
    return (
      name.getLength() > 0 &&
      name.getStr()[0] === 46 &&
      !osl_systemPathIsLocalOrParentDirectoryEntry(name.pData)
    );
  } finally {
    name.dispose();
  }
}

/** Original byte-path specialization: append one separator when needed, then the relative bytes without normalization. @param basePath - Borrowed base pathname. @param relativePath - Borrowed relative pathname. @returns Owned concatenated pathname. */
export function systemPathMakeAbsolutePath(basePath: OString, relativePath: OString): OString {
  const separator =
    !basePath.isEmpty() && basePath.getStr()[basePath.getLength() - 1] !== 47 ? 1 : 0;
  const bytes = new Uint8Array(basePath.getLength() + separator + relativePath.getLength());
  bytes.set(basePath.getStr().subarray(0, basePath.getLength()));
  if (separator) bytes[basePath.getLength()] = 47;
  bytes.set(
    relativePath.getStr().subarray(0, relativePath.getLength()),
    basePath.getLength() + separator,
  );
  return new OString(bytes, bytes.length);
}
