/** @fileoverview Original oslTranslateFileError switch with errno constants lowered for pinned Emscripten4.0.19 WASI libc. ENXIO deliberately maps to IO; no host errno assumptions. */
import { oslFileError as E } from "../../inc/osl/file";
/** Translates actual libc errno. @param errno - Pinned wasm32 errno. @returns Source error enum. */
export function oslTranslateFileError(errno: number): E {
  switch (errno) {
    case 63:
      return E.PERM;
    case 44:
      return E.NOENT;
    case 71:
      return E.SRCH;
    case 27:
      return E.INTR;
    case 29:
      return E.IO;
    case 60:
      return E.IO;
    case 1:
      return E["2BIG"];
    case 45:
      return E.NOEXEC;
    case 8:
      return E.BADF;
    case 12:
      return E.CHILD;
    case 6:
      return E.AGAIN;
    case 48:
      return E.NOMEM;
    case 2:
      return E.ACCES;
    case 21:
      return E.FAULT;
    case 10:
      return E.BUSY;
    case 20:
      return E.EXIST;
    case 75:
      return E.XDEV;
    case 43:
      return E.NODEV;
    case 54:
      return E.NOTDIR;
    case 31:
      return E.ISDIR;
    case 28:
      return E.INVAL;
    case 41:
      return E.NFILE;
    case 33:
      return E.MFILE;
    case 59:
      return E.NOTTY;
    case 22:
      return E.FBIG;
    case 51:
      return E.NOSPC;
    case 70:
      return E.SPIPE;
    case 69:
      return E.ROFS;
    case 34:
      return E.MLINK;
    case 64:
      return E.PIPE;
    case 18:
      return E.DOM;
    case 68:
      return E.RANGE;
    case 16:
      return E.DEADLK;
    case 37:
      return E.NAMETOOLONG;
    case 46:
      return E.NOLCK;
    case 52:
      return E.NOSYS;
    case 138:
      return E.NOSYS;
    case 136:
      return E.USERS;
    case 55:
      return E.NOTEMPTY;
    case 32:
      return E.LOOP;
    case 25:
      return E.ILSEQ;
    case 47:
      return E.NOLINK;
    case 36:
      return E.MULTIHOP;
    case 61:
      return E.OVERFLOW;
    case 73:
      return E.TIMEDOUT;
    default:
      if (errno === 0) throw new Error("assert(Errno != 0)");
      return E.invalidError;
  }
}
/** Runtime FS errors are the actual syscall boundary; unrelated JS failures propagate. @param error - Actual caught error. @returns Source error. */
export function translateFileException(error: unknown): E {
  if (
    typeof error !== "object" ||
    error === null ||
    !("name" in error) ||
    error.name !== "ErrnoError" ||
    !("errno" in error) ||
    typeof error.errno !== "number"
  )
    throw error;
  return oslTranslateFileError(error.errno);
}
