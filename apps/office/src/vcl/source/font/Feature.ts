/** @fileoverview Original Feature.cxx four-byte tag-to-string conversion. Its fixed ASCII_US read site binds directly to the actual SAL single-byte converter,not a generic text-conversion facade. */
import { OUString } from "../../../sal/inc/rtl/ustring";
import { convertCharToUnicode } from "../../../sal/textenc/convertsimple.hxx";
import { aImplUSASCIIByteCvtData } from "../../../sal/textenc/textenc";
import {
  RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_MAPTOPRIVATE,
  RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_DEFAULT,
  RTL_TEXTTOUNICODE_FLAGS_INVALID_DEFAULT,
  RTL_TEXTTOUNICODE_FLAGS_FLUSH,
} from "../../../sal/inc/rtl/textcvt.h";

/** Original terminated four-byte tag projection and ASCII_US decoding with OSTRING_TO_OUSTRING_CVTFLAGS. Native intermediate OString/converter dispatch is erased only at this fixed descriptor read site. @param feature - Original uint32 tag. @returns Independent original Unicode value. */
export function featureCodeAsString(feature: number): OUString {
  const bytes = new Uint8Array(5);
  bytes[0] = (feature >>> 24) & 0xff;
  bytes[1] = (feature >>> 16) & 0xff;
  bytes[2] = (feature >>> 8) & 0xff;
  bytes[3] = feature & 0xff;
  const length = bytes.indexOf(0);
  const output = new Uint16Array(4);
  const written = convertCharToUnicode(
    aImplUSASCIIByteCvtData,
    null,
    bytes,
    length,
    output,
    output.length,
    RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_MAPTOPRIVATE |
      RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_DEFAULT |
      RTL_TEXTTOUNICODE_FLAGS_INVALID_DEFAULT |
      RTL_TEXTTOUNICODE_FLAGS_FLUSH,
    [0],
    [0],
  );
  return new OUString(output, written);
}
