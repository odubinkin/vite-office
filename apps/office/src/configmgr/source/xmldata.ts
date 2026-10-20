/** @fileoverview Original configmgr xmldata type/boolean/template lexical contracts over actual XMLReader namespaces and Data names. */
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import { assert } from "../../sal/inc/cassert";
import { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";
import { OUString, type OUStringConstReference } from "../../sal/inc/rtl/ustring";
import type { XmlReader } from "../../xmlreader/inc/xmlreader";
import { Span, type ByteView } from "../../xmlreader/inc/span";
import { Data } from "./data";
import { NAMESPACE_OOR, NAMESPACE_XS } from "./parsemanager";
import { Type } from "./type";
/** Original exact diagnostic conversion. @param message - Native UTF16 diagnostic text. @returns Real exception. */
function error(message: string): RuntimeException {
  const units = new Uint16Array(message.length);
  for (let i = 0; i < message.length; i++) units[i] = message.charCodeAt(i);
  return new RuntimeException(new OUString(units, units.length), new Reference());
}
/** Local concatenation/view syntax erasure, without language normalization. @param value - Native value. @returns Exact text. */
function text(value: OUStringConstReference): string {
  let out = "";
  for (let i = 0; i < value.getLength(); i++)
    out += String.fromCharCode(value.getStr()[i] as number);
  return out;
}
/** Exact ASCII token equality. @param span - Native span. @param literal - Original literal. @returns Equality. */
function equals(span: Span, literal: string): boolean {
  const bytes = new TextEncoder().encode(literal);
  return span.equals(bytes, bytes.length);
}
/** Original QName classifier requires a colon and a registered OOR/XS prefix; aliases are resolved through actual reader state. @param reader - Actual namespace scope. @param value - Present lexical bytes. @returns Schema type. */
export function parseType(reader: XmlReader, value: Span): Type {
  assert(value.is(), "text.is()");
  let colon = -1;
  for (let i = 0; i < value.length; i++)
    if ((value.begin as ByteView)[i] === 58) {
      colon = i;
      break;
    }
  if (colon >= 0) {
    const bytes = new Uint8Array(value.length);
    for (let i = 0; i < value.length; i++) bytes[i] = (value.begin as ByteView)[i] as number;
    const token = new Span(bytes.subarray(colon + 1), value.length - colon - 1),
      ns = reader.getNamespaceId(new Span(bytes, colon));
    if (ns === NAMESPACE_OOR) {
      for (const [name, type] of [
        ["any", Type.TYPE_ANY],
        ["boolean-list", Type.TYPE_BOOLEAN_LIST],
        ["short-list", Type.TYPE_SHORT_LIST],
        ["int-list", Type.TYPE_INT_LIST],
        ["long-list", Type.TYPE_LONG_LIST],
        ["double-list", Type.TYPE_DOUBLE_LIST],
        ["string-list", Type.TYPE_STRING_LIST],
        ["hexBinary-list", Type.TYPE_HEXBINARY_LIST],
      ] as const)
        if (equals(token, name)) return type;
    } else if (ns === NAMESPACE_XS) {
      for (const [name, type] of [
        ["boolean", Type.TYPE_BOOLEAN],
        ["short", Type.TYPE_SHORT],
        ["int", Type.TYPE_INT],
        ["long", Type.TYPE_LONG],
        ["double", Type.TYPE_DOUBLE],
        ["string", Type.TYPE_STRING],
        ["hexBinary", Type.TYPE_HEXBINARY],
      ] as const)
        if (equals(token, name)) return type;
    }
  }
  const converted = value.convertFromUtf8();
  try {
    throw error("invalid type " + text(converted));
  } finally {
    converted.dispose();
  }
}
/** Original schema boolean only accepts true/false, unlike valueparser's true/false/0/1 grammar. @param value - Present lexical span. @returns Boolean. */
export function parseBoolean(value: Span): boolean {
  assert(value.is(), "text.is()");
  if (equals(value, "true")) return true;
  if (equals(value, "false")) return false;
  const converted = value.convertFromUtf8();
  try {
    throw error("invalid boolean " + text(converted));
  } finally {
    converted.dispose();
  }
}
/** Original missing-node-type fallback returns a value copy; explicit empty node-type still goes through Data's full-name construction. @param component - Native component. @param hasNodeType - Presence flag. @param nodeType - Native type name. @param defaultTemplateName - Optional default pointer. @returns Actual full template name. */
export function parseTemplateReference(
  component: OUStringConstReference,
  hasNodeType: boolean,
  nodeType: OUStringConstReference,
  defaultTemplateName: OUStringConstReference | null,
): OUString {
  if (!hasNodeType) {
    if (defaultTemplateName !== null) return new OUString(defaultTemplateName);
    throw error("missing node-type attribute");
  }
  return Data.fullTemplateName(component, nodeType);
}
