/** @fileoverview Original strmunx.cxx internal GetSvError overloads and ordered source lookup tables. The int overload uses pinned Emscripten WASI errno values, not the host OS; open/security/locking code is not changed. */
import * as code from "../../../comphelper/inc/errcode";
import { oslFileError as E } from "../../../sal/inc/osl/file";
const errnoErrors: readonly (readonly [number, code.ErrCode])[] = [
  [0, code.ERRCODE_NONE],
  [2, code.SVSTREAM_ACCESS_DENIED],
  [8, code.SVSTREAM_INVALID_HANDLE],
  [16, code.SVSTREAM_LOCKING_VIOLATION],
  [28, code.SVSTREAM_INVALID_PARAMETER],
  [33, code.SVSTREAM_TOO_MANY_OPEN_FILES],
  [41, code.SVSTREAM_TOO_MANY_OPEN_FILES],
  [44, code.SVSTREAM_FILE_NOT_FOUND],
  [63, code.SVSTREAM_ACCESS_DENIED],
  [69, code.SVSTREAM_ACCESS_DENIED],
  [6, code.SVSTREAM_LOCKING_VIOLATION],
  [31, code.SVSTREAM_PATH_NOT_FOUND],
  [32, code.SVSTREAM_PATH_NOT_FOUND],
  [36, code.SVSTREAM_PATH_NOT_FOUND],
  [47, code.SVSTREAM_PATH_NOT_FOUND],
  [54, code.SVSTREAM_PATH_NOT_FOUND],
  [74, code.SVSTREAM_ACCESS_DENIED],
  [20, code.SVSTREAM_CANNOT_MAKE],
  [51, code.SVSTREAM_DISK_FULL],
  [0xffff, code.SVSTREAM_GENERALERROR],
];
const oslErrors: readonly (readonly [E, code.ErrCode])[] = [
  [E.None, code.ERRCODE_NONE],
  [E.ACCES, code.SVSTREAM_ACCESS_DENIED],
  [E.BADF, code.SVSTREAM_INVALID_HANDLE],
  [E.DEADLK, code.SVSTREAM_LOCKING_VIOLATION],
  [E.INVAL, code.SVSTREAM_INVALID_PARAMETER],
  [E.MFILE, code.SVSTREAM_TOO_MANY_OPEN_FILES],
  [E.NFILE, code.SVSTREAM_TOO_MANY_OPEN_FILES],
  [E.NOENT, code.SVSTREAM_FILE_NOT_FOUND],
  [E.PERM, code.SVSTREAM_ACCESS_DENIED],
  [E.ROFS, code.SVSTREAM_ACCESS_DENIED],
  [E.AGAIN, code.SVSTREAM_LOCKING_VIOLATION],
  [E.ISDIR, code.SVSTREAM_PATH_NOT_FOUND],
  [E.LOOP, code.SVSTREAM_PATH_NOT_FOUND],
  [E.MULTIHOP, code.SVSTREAM_PATH_NOT_FOUND],
  [E.NOLINK, code.SVSTREAM_PATH_NOT_FOUND],
  [E.NOTDIR, code.SVSTREAM_PATH_NOT_FOUND],
  [E.EXIST, code.SVSTREAM_CANNOT_MAKE],
  [E.NOSPC, code.SVSTREAM_DISK_FULL],
  [0xffff as E, code.SVSTREAM_GENERALERROR],
];
/** Original int overload; separate name lowers the C++ static overload choice without inferring enum domains from equal numeric values. @param errno - Source int errno. @returns Original packed value. */
export function GetSvErrorErrno(errno: number): code.ErrCode {
  let result = code.SVSTREAM_GENERALERROR,
    i = 0;
  do {
    const item = errnoErrors[i] as readonly [number, code.ErrCode];
    if (item[0] === errno) {
      result = item[1];
      break;
    }
    ++i;
  } while ((errnoErrors[i] as readonly [number, code.ErrCode])[0] !== 0xffff);
  return result;
}
/** Original oslFileError overload, deliberately independent from the errno overload. @param error - OSL enum. @returns Original packed value. */
export function GetSvError(error: E): code.ErrCode {
  let result = code.SVSTREAM_GENERALERROR,
    i = 0;
  do {
    const item = oslErrors[i] as readonly [E, code.ErrCode];
    if (item[0] === error) {
      result = item[1];
      break;
    }
    ++i;
  } while ((oslErrors[i] as readonly [E, code.ErrCode])[0] !== (0xffff as E));
  return result;
}
