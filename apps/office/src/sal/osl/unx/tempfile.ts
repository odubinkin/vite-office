/** @fileoverview Original osl_getTempDirURL environment precedence, byte conversion, trailing-slash trimming and URL result. Remaining OSL random/createTempFile APIs are unbound. */
import { getenv } from "../../../external/emscripten/locale";
import {
  OSTRING_TO_OUSTRING_CVTFLAGS,
  rtl_string2UString,
  rtl_uString_release,
  type rtl_uStringSlot,
} from "../../inc/rtl/ustring.h";
import { osl_getThreadTextEncoding } from "../../inc/osl/thread";
import { osl_getFileURLFromSystemPath } from "./file_url";
import type { oslFileError } from "../../inc/osl/file";
/** Original getenv tests absence rather than empty string and preserves the last root slash. @param output - Actual original output slot. @returns Source conversion status. */
export function osl_getTempDirURL(output: rtl_uStringSlot): oslFileError {
  const value =
      getenv("TMPDIR") ?? getenv("TEMP") ?? getenv("TMP") ?? Uint8Array.of(47, 116, 109, 112),
    path: rtl_uStringSlot = [null];
  let length = value.length;
  while (length > 1 && value[length - 1] === 47) length--;
  rtl_string2UString(
    path,
    value,
    length,
    osl_getThreadTextEncoding(),
    OSTRING_TO_OUSTRING_CVTFLAGS,
  );
  if (!path[0]) throw new Error("assert(ustrTempPath)");
  try {
    return osl_getFileURLFromSystemPath(path[0], output);
  } finally {
    rtl_uString_release(path[0]);
  }
}
