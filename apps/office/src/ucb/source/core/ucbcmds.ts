/** @fileoverview Original ucbcmds.hxx command names and handles; constants use the source UTF16 literal owners. */
import {
  OUString,
  OUStringLiteral,
  type OUStringConstReference,
} from "../../../sal/inc/rtl/ustring";
/** Compiler binding for original static UTF16 literals. @param text - Source literal. @returns Static-data RTL owner. */
function literal(text: string): OUStringConstReference {
  return new OUString(
    new OUStringLiteral(
      Uint16Array.from(
        text.split("").concat("\0"),
        /** Literal code unit. @param value - Character. @returns Numeric unit. */ (value) =>
          value.charCodeAt(0),
      ),
    ),
  );
}
/** Original command name. */ export const GETCOMMANDINFO_NAME = literal("getCommandInfo");
/** Original command handle. */ export const GETCOMMANDINFO_HANDLE = 1024;
/** Original transfer command name. */ export const GLOBALTRANSFER_NAME = literal("globalTransfer");
/** Original transfer command handle. */ export const GLOBALTRANSFER_HANDLE = 1025;
/** Original check-in command name. */ export const CHECKIN_NAME = literal("checkin");
/** Original check-in command handle. */ export const CHECKIN_HANDLE = 1026;
