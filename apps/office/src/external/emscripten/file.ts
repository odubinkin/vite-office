/** @fileoverview Actual pinned libc realpath/open/record-lock/errno/abort primitives over the shared Emscripten filesystem. */
import { OFFICE_SIZEOF_OSL_FILE_STATUS } from "@vite-office/libxml2-wasm/constants";
import { getRuntime } from "./runtime";
/** Borrows actual native exports after bootstrap. @returns Real runtime. */
function api(): NonNullable<ReturnType<typeof getRuntime>> {
  const runtime = getRuntime();
  if (!runtime)
    throw new Error("Emscripten runtime must be initialized before libc file operations");
  return runtime;
}
/** Returns native PATH_MAX from the selected SDK headers. @returns Buffer bound. */
export function pathMax(): number {
  return api()._office_file_path_max();
}
/** Calls native realpath with a real bounded output buffer and captures errno immediately. @param path - Original OString terminated bytes. @returns Resolved terminated bytes or native errno. */
export function realpath(path: Uint8Array): { path: Uint8Array | null; errno: number } {
  const runtime = api(),
    maximum = runtime._office_file_path_max(),
    input = runtime._malloc(path.length),
    output = runtime._malloc(maximum);
  try {
    runtime.HEAPU8.set(path, input);
    if (!runtime._realpath(input, output))
      return { path: null, errno: runtime._office_file_errno() };
    let length = 0;
    while (runtime.HEAPU8[output + length] !== 0) length++;
    return { path: runtime.HEAPU8.slice(output, output + length + 1), errno: 0 };
  } finally {
    runtime._free(output);
    runtime._free(input);
  }
}
/** Opens with the source-selected native POSIX flags/mode, retaining native errno. @param path - Terminated path bytes. @param flags - Original OSL flags. @param mode - Explicit mode or -1 for source defaults. @returns Native descriptor/status. */
export function open(path: Uint8Array, flags: number, mode: number): { fd: number; errno: number } {
  const runtime = api(),
    input = runtime._malloc(path.length);
  try {
    runtime.HEAPU8.set(path, input);
    const fd = runtime._office_file_open(input, flags >>> 0, mode | 0);
    return { fd, errno: fd === -1 ? runtime._office_file_errno() : 0 };
  } finally {
    runtime._free(input);
  }
}
/** Calls genuine F_SETLK with the source whole-file write lock. @param fd - Actual descriptor. @returns Zero or native errno. */
export function lockFile(fd: number): number {
  const runtime = api();
  return runtime._office_file_lock(fd) === -1 ? runtime._office_file_errno() : 0;
}
/** Executes actual libc abort; the native runtime supplies its termination behavior. @returns Does not return in the native implementation. */
export function abort(): void {
  api()._abort();
}

/** Closes a descriptor during source failure cleanup, ignoring its status as upstream does. @param fd - Native descriptor. @returns Nothing. */
export function close(fd: number): void {
  api()._close(fd);
}

/** Sets actual native errno to EOVERFLOW for original text conversion wrappers. @returns Nothing. */
export function setOverflowErrno(): void {
  api()._office_file_set_overflow();
}

/** Original selected-header sizeof(oslFileStatus), without allocating a native status object. @returns Native layout size. */
export function fileStatusSize(): number {
  return OFFICE_SIZEOF_OSL_FILE_STATUS;
}
/** Executes actual libc access and captures native errno immediately. @param path - Terminated original bytes. @param mode - Native F_OK/W_OK/X_OK. @returns Actual result and errno. */
export function access(path: Uint8Array, mode: number): { result: number; errno: number } {
  const module = api(),
    pointer = module._malloc(path.length);
  try {
    module.HEAPU8.set(path, pointer);
    const result = module._office_file_access(pointer, mode);
    return { result, errno: result === -1 ? module._office_file_errno() : 0 };
  } finally {
    module._free(pointer);
  }
}
/** Original stat fields consumed by metadata/identity; 64-bit fields remain exact. */
export interface NativeFileStat {
  readonly mode: number;
  readonly size: bigint;
  readonly inode: bigint;
  readonly access: number;
  readonly modify: number;
  readonly type: number;
}
/** Executes actual libc stat/lstat over MEMFS; no alternate stat provider. @param path - Terminated bytes. @param follow - Whether to follow final symlink. @returns Copied actual fields or native errno. */
function queryStat(
  path: Uint8Array,
  follow: boolean,
): { value: NativeFileStat | null; errno: number } {
  const module = api(),
    input = module._malloc(path.length),
    output = module._malloc(32);
  try {
    module.HEAPU8.set(path, input);
    if (
      (follow
        ? module._office_file_stat(input, output)
        : module._office_file_lstat(input, output)) !== 0
    )
      return { value: null, errno: module._office_file_errno() };
    const fields = module.HEAP32.slice(output / 4, output / 4 + 8);
    return {
      value: {
        mode: (fields[0] as number) >>> 0,
        size: (BigInt((fields[2] as number) >>> 0) << 32n) | BigInt((fields[1] as number) >>> 0),
        inode: (BigInt((fields[6] as number) >>> 0) << 32n) | BigInt((fields[5] as number) >>> 0),
        access: (fields[3] as number) >>> 0,
        modify: (fields[4] as number) >>> 0,
        type: fields[7] as number,
      },
      errno: 0,
    };
  } finally {
    module._free(output);
    module._free(input);
  }
}
/** Queries actual libc lstat without following a final symlink. @param path - Terminated bytes. @returns Real fields/status. */
export function lstat(path: Uint8Array): { value: NativeFileStat | null; errno: number } {
  return queryStat(path, false);
}
/** Queries actual libc stat following symlinks. @param path - Terminated bytes. @returns Real fields/status. */
export function stat(path: Uint8Array): { value: NativeFileStat | null; errno: number } {
  return queryStat(path, true);
}
/** Original DirectoryItem_Impl dirent type switch compiled with actual selected SDK constants. @param dtype - Original unsigned byte. @returns Original oslFileType value. */
export function directoryItemType(dtype: number): number {
  return api()._office_file_dtype_type(dtype & 255);
}

/** Actual signed POSIX operation result with captured native errno. */
export interface PosixResult {
  readonly result: number;
  readonly errno: number;
}
/** Reads actual native errno without resetting it, as the source copy loop requires. @returns Native errno. */
export function getErrno(): number {
  return api()._office_file_errno();
}
/** Publishes only a genuine captured SDK FS syscall error across the JS/C boundary. @param value - Actual ErrnoError errno. @returns Nothing. */
export function setErrno(value: number): void {
  api()._office_file_set_errno(value);
}
/** Calls exact public-copy destination open flags. @param path - Terminated path. @param mode - Original stat mode. @returns Actual FD/result. */
export function openCopyDestination(path: Uint8Array, mode: number): PosixResult {
  const module = api(),
    input = module._malloc(path.length);
  try {
    module.HEAPU8.set(path, input);
    const result = module._office_file_copy_open(input, mode);
    return { result, errno: result < 0 ? module._office_file_errno() : 0 };
  } finally {
    module._free(input);
  }
}
/** Marshals an actual two-path libc operation, with no browser path parser. @param operation - Native operation. @param first - Terminated first path/content. @param second - Terminated second path. @returns Native result. */
function twoPaths(
  operation: "_rename" | "_symlink",
  first: Uint8Array,
  second: Uint8Array,
): PosixResult {
  const module = api(),
    a = module._malloc(first.length),
    b = module._malloc(second.length);
  try {
    module.HEAPU8.set(first, a);
    module.HEAPU8.set(second, b);
    const result = module[operation](a, b);
    return { result, errno: result < 0 ? module._office_file_errno() : 0 };
  } finally {
    module._free(b);
    module._free(a);
  }
}
/** Calls actual libc rename. @param first - Source path. @param second - Destination path. @returns Native result. */
export function rename(first: Uint8Array, second: Uint8Array): PosixResult {
  return twoPaths("_rename", first, second);
}
/** Calls actual libc symlink with original uninterpreted link contents. @param first - Link contents. @param second - Link path. @returns Native result. */
export function symlink(first: Uint8Array, second: Uint8Array): PosixResult {
  return twoPaths("_symlink", first, second);
}
/** Calls actual libc unlink. @param path - Terminated path. @returns Native result. */
export function unlink(path: Uint8Array): PosixResult {
  const module = api(),
    input = module._malloc(path.length);
  try {
    module.HEAPU8.set(path, input);
    const result = module._unlink(input);
    return { result, errno: result < 0 ? module._office_file_errno() : 0 };
  } finally {
    module._free(input);
  }
}
/** Reads exact native symlink bytes without an appended terminator. @param path - Terminated path. @param output - Actual destination span. @param capacity - Original capacity. @returns Native count/status. */
export function readlink(path: Uint8Array, output: Uint8Array, capacity: number): PosixResult {
  const module = api(),
    input = module._malloc(path.length),
    buffer = module._malloc(output.length);
  try {
    module.HEAPU8.set(path, input);
    const result = module._readlink(input, buffer, capacity);
    const errno = result < 0 ? module._office_file_errno() : 0;
    if (result >= 0) output.set(module.HEAPU8.subarray(buffer, buffer + result));
    return { result, errno };
  } finally {
    module._free(buffer);
    module._free(input);
  }
}
/** Writes actual raw descriptor bytes; errno remains native even after status projection. @param fd - Native descriptor. @param data - Source span. @param count - Requested count. @returns Native signed count/status. */
export function writeDescriptor(fd: number, data: Uint8Array, count: number): PosixResult {
  const module = api(),
    input = module._malloc(data.length);
  try {
    module.HEAPU8.set(data, input);
    const result = module._write(fd, input, count);
    return { result, errno: result < 0 ? module._office_file_errno() : 0 };
  } finally {
    module._free(input);
  }
}
/** Closes the actual descriptor and captures its return value. @param fd - Native descriptor. @returns Native result. */
export function closeDescriptor(fd: number): PosixResult {
  const module = api(),
    result = module._close(fd);
  return { result, errno: result < 0 ? module._office_file_errno() : 0 };
}
/** Executes actual libc mkdir with original mode and captured errno. @param path - Terminated path. @param mode - Original permission bits. @returns Native status. */
export function mkdir(path: Uint8Array, mode: number): PosixResult {
  const module = api(),
    input = module._malloc(path.length);
  try {
    module.HEAPU8.set(path, input);
    const result = module._mkdir(input, mode);
    return { result, errno: result < 0 ? module._office_file_errno() : 0 };
  } finally {
    module._free(input);
  }
}
/** Executes actual libc rmdir. @param path - Terminated path. @returns Native status. */
export function rmdir(path: Uint8Array): PosixResult {
  const module = api(),
    input = module._malloc(path.length);
  try {
    module.HEAPU8.set(path, input);
    const result = module._rmdir(input);
    return { result, errno: result < 0 ? module._office_file_errno() : 0 };
  } finally {
    module._free(input);
  }
}
/** Original selected SDK process ID, without reading the computer's process identity. @returns Actual libc getpid value. */
export function getpid(): number {
  return api()._getpid();
}

/** Opens an actual libc DIR cursor and captures errno immediately. @param path - Terminated native pathname. @returns Native pointer and open error. */
export function openDirectory(path: Uint8Array): { handle: number; errno: number } {
  const runtime = api(),
    pointer = runtime._malloc(path.length);
  try {
    runtime.HEAPU8.set(path, pointer);
    const handle = runtime._opendir(pointer);
    return { handle, errno: handle === 0 ? runtime._office_file_errno() : 0 };
  } finally {
    runtime._free(pointer);
  }
}
/** Closes a libc-owned directory cursor. @param handle - Live native DIR pointer. @returns Native result and error. */
export function closeDirectory(handle: number): { result: number; errno: number } {
  const runtime = api(),
    result = runtime._closedir(handle);
  return { result, errno: result !== 0 ? runtime._office_file_errno() : 0 };
}
/** Copies the current dirent before the next libc call can overwrite it. Original OSL deliberately treats every null result as end-of-directory. @param handle - Live native DIR pointer. @returns Raw terminated filename/type, or null. */
export function readDirectory(handle: number): { name: Uint8Array; type: number } | null {
  const runtime = api(),
    entry = runtime._readdir(handle);
  if (!entry) return null;
  const pointer = runtime._office_directory_name(entry);
  let end = pointer;
  while (runtime.HEAPU8[end] !== 0) ++end;
  return {
    name: runtime.HEAPU8.slice(pointer, end + 1),
    type: runtime._office_directory_type(entry),
  };
}
