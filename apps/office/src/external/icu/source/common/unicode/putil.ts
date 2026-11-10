/** @fileoverview Consumed original ICU POSIX file/path separator constants. This pinned platform profile is checked by native witnesses; no file-access mode or data-directory default is changed. */
export const U_FILE_SEP_CHAR = 0x2f;
export const U_FILE_ALT_SEP_CHAR = 0x2f;
export const U_PATH_SEP_CHAR = 0x3a;
export {
  u_getDataDirectory,
  u_setDataDirectory,
  u_getTimeZoneFilesDirectory,
  u_setTimeZoneFilesDirectory,
} from "../putil";
