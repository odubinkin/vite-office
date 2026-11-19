/** @fileoverview Original static rtl::Uri wrappers from rtl/uri.hxx. */
import { OUString, type OUStringConstReference } from "./ustring";
import {
  rtl_UriCharClass,
  rtl_UriEncodeMechanism,
  rtl_UriDecodeMechanism,
  rtl_getUriCharClass,
  rtl_uriEncode,
  rtl_uriDecode,
  rtl_uriConvertRelToAbs,
} from "./uri.h";
import type { rtl_uString } from "./ustring.h";
import type { rtl_TextEncoding } from "./textenc";
import { MalformedUriException } from "./malformeduriexception";
export { UriCharClassSize, createUriCharClass } from "../../rtl/uri";
/** Original noninstantiable static helper. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- original rtl::Uri has only static methods.
export class Uri {
  /** Prevents construction of the static URI utility class. @returns Nothing. */ private constructor() {}
  /** Encodes through the original C entry point. @param text - Borrowed input. @param charClass - Original enum or table overload. @param mechanism - Escape policy. @param charset - Character set. @returns Owned native string. */
  static encode(
    text: OUStringConstReference,
    charClass: rtl_UriCharClass | readonly boolean[],
    mechanism: rtl_UriEncodeMechanism,
    charset: rtl_TextEncoding,
  ): OUString {
    const result = new OUString();
    try {
      rtl_uriEncode(
        text.pData as rtl_uString,
        typeof charClass === "number" ? rtl_getUriCharClass(charClass) : charClass,
        mechanism,
        charset,
        result.getDataAddress(),
      );
      return result;
    } catch (error) {
      result.dispose();
      throw error;
    }
  }
  /** Decodes through the original C entry point. @param text - Borrowed input. @param mechanism - Decode policy. @param charset - Character set. @returns Owned native string. */
  static decode(
    text: OUStringConstReference,
    mechanism: rtl_UriDecodeMechanism,
    charset: rtl_TextEncoding,
  ): OUString {
    const result = new OUString();
    try {
      rtl_uriDecode(text.pData as rtl_uString, mechanism, charset, result.getDataAddress());
      return result;
    } catch (error) {
      result.dispose();
      throw error;
    }
  }
  /** Resolves via the independent SAL algorithm. @param base - Borrowed base reference. @param relative - Borrowed relative reference. @returns Owned absolute reference or original exception. */
  static convertRelToAbs(base: OUStringConstReference, relative: OUStringConstReference): OUString {
    const result = new OUString(),
      exception = new OUString();
    try {
      if (
        !rtl_uriConvertRelToAbs(
          base.pData as rtl_uString,
          relative.pData as rtl_uString,
          result.getDataAddress(),
          exception.getDataAddress(),
        )
      )
        throw new MalformedUriException(exception);
      return result;
    } catch (error) {
      result.dispose();
      throw error;
    } finally {
      exception.dispose();
    }
  }
}
