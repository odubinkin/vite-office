/** @fileoverview Original fastparser.cxx NormalizeURI/NormalizeW3URI/NormalizeOasisURN copy, retaining actual native OUString operations and source permissive namespace alias rules independently of xmloff. */
import { OUString, OUStringLiteral } from "../../../sal/inc/rtl/ustring";
import { StringConcat } from "../../../sal/inc/rtl/stringconcat";
/** Compiles only the following original static ASCII Unicode literals into their actual static RTL storage; no runtime namespace/type provider. @param value - Source literal. @returns Static native string. */
function literal(value: string): OUString {
  return new OUString(
    new OUStringLiteral(
      Uint16Array.from(
        value + "\0",
        /** Copies one known ASCII literal unit. @param unit - Literal unit. @returns Same code unit. */ (
          unit,
        ) => unit.charCodeAt(0),
      ),
    ),
  );
}
const XML_URI_W3_PREFIX = literal("http://www.w3.org/"),
  XML_URI_XFORMS_SUFFIX = literal("/xforms"),
  XML_N_XFORMS_1_0 = literal("http://www.w3.org/2002/xforms"),
  XML_N_SVG = literal("http://www.w3.org/2000/svg"),
  XML_N_SVG_COMPAT = literal("urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0"),
  XML_N_FO = literal("http://www.w3.org/1999/XSL/Format"),
  XML_N_FO_COMPAT = literal("urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"),
  XML_N_SMIL = literal("http://www.w3.org/2001/SMIL20/"),
  XML_N_SMIL_OLD = literal("http://www.w3.org/2001/SMIL20"),
  XML_N_SMIL_COMPAT = literal("urn:oasis:names:tc:opendocument:xmlns:smil-compatible:1.0"),
  XML_URN_OASIS_NAMES_TC = literal("urn:oasis:names:tc"),
  XML_XMLNS = literal("xmlns"),
  XML_OPENDOCUMENT = literal("opendocument"),
  XML_1_0 = literal("1.0");
/** Original OASIS-first dispatch; no extra URI validation or normalization. @param name - Actual mutable native namespace value. @returns Nothing. */
export function NormalizeURI(name: OUString): void {
  if (!NormalizeOasisURN(name)) NormalizeW3URI(name);
}
/** Original prefix/suffix-only XForms rewrite; the commented year grammar is not an extra runtime check. @param name - Actual namespace value. @returns Whether rewritten. */
export function NormalizeW3URI(name: OUString): boolean {
  let success = false;
  if (name.startsWith(XML_URI_W3_PREFIX)) {
    const from = name.getLength() - XML_URI_XFORMS_SUFFIX.getLength();
    if (name.match(XML_URI_XFORMS_SUFFIX, from)) {
      name.assign(XML_N_XFORMS_1_0);
      success = true;
    }
  }
  return success;
}
/** Original legacy SVG/FO/SMIL aliases and TC/version rewrite, retaining exact index checks and source acceptance of nonnumeric version suffixes. @param name - Actual namespace value. @returns Whether rewritten. */
export function NormalizeOasisURN(name: OUString): boolean {
  if (name.equals(XML_N_SVG)) {
    name.assign(XML_N_SVG_COMPAT);
    return true;
  } else if (name.equals(XML_N_FO)) {
    name.assign(XML_N_FO_COMPAT);
    return true;
  } else if (name.equals(XML_N_SMIL) || name.equals(XML_N_SMIL_OLD)) {
    name.assign(XML_N_SMIL_COMPAT);
    return true;
  }
  const length = name.getLength();
  if (!name.startsWith(XML_URN_OASIS_NAMES_TC)) return false;
  let position = XML_URN_OASIS_NAMES_TC.getLength();
  if (position >= length || name.charAt(position) !== 58) return false;
  const tcStart = position + 1,
    tcEnd = name.indexOf(58, tcStart);
  if (tcEnd === -1) return false;
  position = tcEnd + 1;
  if (!name.match(XML_XMLNS, position)) return false;
  position += XML_XMLNS.getLength();
  if (position >= length || name.charAt(position) !== 58) return false;
  position = name.indexOf(58, position + 1);
  if (position === -1) return false;
  const versionStart = position + 1;
  if (versionStart + 2 >= length || name.indexOf(58, versionStart) !== -1) return false;
  if (name.charAt(versionStart) !== 49 || name.charAt(versionStart + 1) !== 46) return false;
  let expression = OUString.Concat(name.subView(0, tcStart));
  expression = new StringConcat(expression, XML_OPENDOCUMENT);
  expression = new StringConcat(expression, name.subView(tcEnd, versionStart - tcEnd));
  const replacement = new OUString(new StringConcat(expression, XML_1_0));
  try {
    name.moveAssign(replacement);
  } finally {
    replacement.dispose();
  }
  return true;
}
