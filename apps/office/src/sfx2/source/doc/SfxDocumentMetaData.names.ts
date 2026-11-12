/** @fileoverview Original SfxDocumentMetaData.cxx standard property tables and namespace/QName helpers. Owned OUString results and borrowed UTF16 views preserve the source distinction. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
/** Binds a compiler-known ASCII source constant. @param text - Literal. @returns Owned source string. */
function literal(text: string): OUString {
  return OUString.createFromAscii(new TextEncoder().encode(text + "\0"));
}
export const s_nsXLink = literal("http://www.w3.org/1999/xlink");
export const s_nsDC = literal("http://purl.org/dc/elements/1.1/");
export const s_nsODF = literal("urn:oasis:names:tc:opendocument:xmlns:office:1.0");
export const s_nsODFMeta = literal("urn:oasis:names:tc:opendocument:xmlns:meta:1.0");
/** Original parallel arrays, retaining their order and exact external spellings. */
export const s_stdStats = [
  "PageCount",
  "TableCount",
  "DrawCount",
  "ImageCount",
  "ObjectCount",
  "OLEObjectCount",
  "ParagraphCount",
  "WordCount",
  "CharacterCount",
  "RowCount",
  "FrameCount",
  "SentenceCount",
  "SyllableCount",
  "NonWhitespaceCharacterCount",
  "CellCount",
] as const;
export const s_stdStatAttrs = [
  "meta:page-count",
  "meta:table-count",
  "meta:draw-count",
  "meta:image-count",
  "meta:object-count",
  "meta:ole-object-count",
  "meta:paragraph-count",
  "meta:word-count",
  "meta:character-count",
  "meta:row-count",
  "meta:frame-count",
  "meta:sentence-count",
  "meta:syllable-count",
  "meta:non-whitespace-character-count",
  "meta:cell-count",
].map(literal);
export const s_stdMeta = [
  "meta:generator",
  "dc:title",
  "dc:description",
  "dc:subject",
  "meta:initial-creator",
  "dc:creator",
  "meta:printed-by",
  "meta:creation-date",
  "dc:date",
  "meta:print-date",
  "meta:template",
  "meta:auto-reload",
  "meta:hyperlink-behaviour",
  "dc:language",
  "meta:editing-cycles",
  "meta:editing-duration",
  "meta:document-statistic",
  "dc:coverage",
  "dc:identifier",
  "dc:rights",
  "dc:source",
  "dc:type",
] as const;
export const s_stdMetaList = [
  "meta:keyword",
  "meta:user-defined",
  "dc:contributor",
  "dc:publisher",
  "dc:relation",
].map(literal);
/** Original getQualifier splits at the first colon. @param name - Borrowed QName. @returns Owned prefix/local pair. */
export function getQualifier(name: OUStringConstReference): [OUString, OUString] {
  const value = new OUString(name);
  try {
    const index = value.indexOf(58);
    return index === -1
      ? [new OUString(), new OUString(value)]
      : [value.copy(0, index), value.copy(index + 1)];
  } finally {
    value.dispose();
  }
}
/** Original statically-known QName namespace selection. @param name - Known source QName. @returns Owned namespace. */
export function getNameSpace(name: OUStringConstReference): OUString {
  const [prefix, local] = getQualifier(name);
  try {
    const view = prefix.getStr().subarray(0, prefix.getLength());
    if (equalsASCII(view, "xlink")) return new OUString(s_nsXLink);
    if (equalsASCII(view, "dc")) return new OUString(s_nsDC);
    if (equalsASCII(view, "office")) return new OUString(s_nsODF);
    if (equalsASCII(view, "meta")) return new OUString(s_nsODFMeta);
    throw new Error("assert(!ns.isEmpty())");
  } finally {
    local.dispose();
    prefix.dispose();
  }
}
/** Original string-view comparison against a compiler-known ASCII token. @param value - Borrowed view. @param token - Known token. @returns Equality. */
function equalsASCII(value: Uint16Array, token: string): boolean {
  return (
    value.length === token.length &&
    value.every(
      /** Compares the original UTF16 code unit. @param code - Code unit. @param index - Offset. @returns Equality. */ (
        code,
        index,
      ) => code === token.charCodeAt(index),
    )
  );
}
/** Original substring views; only dc/meta/office are valid here (unlike getNameSpace). @param name - Borrowed QName view. @returns Borrowed tag/namespace views. */
export function extractTagAndNamespaceUri(name: Uint16Array): [Uint16Array, Uint16Array] {
  const index = name.indexOf(58);
  if (index === -1) throw new Error("assert(idx != std::u16string_view::npos)");
  const prefix = name.subarray(0, index),
    tag = name.subarray(index + 1);
  let namespace: OUString;
  if (equalsASCII(prefix, "dc")) namespace = s_nsDC;
  else if (equalsASCII(prefix, "meta")) namespace = s_nsODFMeta;
  else if (equalsASCII(prefix, "office")) namespace = s_nsODF;
  else throw new Error("assert(false)");
  return [tag, namespace.getStr().subarray(0, namespace.getLength())];
}
