/** @fileoverview Original reader namespace scopes, start/end tags and skipped-text event transitions. */
import { Span } from "../inc/span";
import { State, Result, peek, read, span, assign, fail, literal } from "./xmlreader.state";
import type { ReaderState } from "./xmlreader.state";
import {
  scanName,
  skipSpace,
  skipComment,
  scanCdataSection,
  skipProcessingInstruction,
  skipDocumentTypeDeclaration,
} from "./xmlreader.lexical";
import { handleAttributeValue } from "./xmlreader.references";
/** Original reverse namespace lookup. @param r - Reader. @param prefix - Prefix. @returns Registered id or unknown. */
export function getNamespaceId(r: ReaderState, prefix: Span): number {
  for (let i = r.namespaces_.length - 1; i >= 0; --i) {
    const binding = r.namespaces_[i] as { prefix: Span; nsId: number };
    if (prefix.operatorEquals(binding.prefix)) return binding.nsId;
  }
  return -1;
}
/** Original normalized IRI lookup takes the first matching registration. @param r - Reader. @param begin - Attribute start. @param end - Attribute end. @returns Id or unknown. */
function scanNamespaceIri(r: ReaderState, begin: number, end: number): number {
  const iri = handleAttributeValue(r, begin, end, false);
  for (let i = 0; i < r.namespaceIris_.length; i++)
    if ((r.namespaceIris_[i] as Span).operatorEquals(iri)) return i | 0;
  return -1;
}
/** Original element-pop namespace restoration and root termination. @param r - Reader. @returns Nothing. */
export function handleElementEnd(r: ReaderState): void {
  r.namespaces_.length = (
    r.elements_[r.elements_.length - 1] as import("./xmlreader.state").ElementData
  ).inheritedNamespaces;
  r.elements_.pop();
  r.state_ = r.elements_.length === 0 ? State.Done : State.Content;
}
/** Original start-tag and namespace declaration parser. @param r - Reader. @param nsId - Namespace output. @param localName - Name output. @returns Begin. */
export function handleStartTag(r: ReaderState, nsId: [number], localName: Span): Result {
  const nameBegin = r.pos_,
    nameColon: [number | null] = [null];
  if (!scanName(r, nameColon)) fail(r, "bad tag name in ");
  const nameEnd = r.pos_,
    inheritedNamespaces = r.namespaces_.length;
  let hasDefaultNs = false,
    defaultNsId = -2;
  r.attributes_.length = 0;
  for (;;) {
    const p = r.pos_;
    skipSpace(r);
    if (peek(r) === 47 || peek(r) === 62) break;
    if (r.pos_ === p) fail(r, "missing whitespace before attribute in ");
    const attrNameBegin = r.pos_,
      attrNameColon: [number | null] = [null];
    if (!scanName(r, attrNameColon)) fail(r, "bad attribute name in ");
    const attrNameEnd = r.pos_;
    skipSpace(r);
    if (read(r) !== 61) fail(r, "missing '=' in ");
    skipSpace(r);
    const del = read(r);
    if (del !== 39 && del !== 34) fail(r, "bad attribute value in ");
    const valueBegin = r.pos_,
      valueEnd = r.bytes_.indexOf(del, r.pos_);
    if (valueEnd < 0) fail(r, "unterminated attribute value in ");
    r.pos_ = valueEnd + 1;
    if (
      attrNameColon[0] === null &&
      span(r, attrNameBegin, attrNameEnd).equals(literal("xmlns"), 5)
    ) {
      hasDefaultNs = true;
      defaultNsId = scanNamespaceIri(r, valueBegin, valueEnd);
    } else if (
      attrNameColon[0] !== null &&
      span(r, attrNameBegin, attrNameColon[0]).equals(literal("xmlns"), 5)
    ) {
      const prefix = span(r, attrNameColon[0] + 1, attrNameEnd),
        id = scanNamespaceIri(r, valueBegin, valueEnd);
      r.namespaces_.push({ prefix, nsId: id });
    } else
      r.attributes_.push({
        nameBegin: attrNameBegin,
        nameEnd: attrNameEnd,
        nameColon: attrNameColon[0],
        valueBegin,
        valueEnd,
      });
  }
  if (!hasDefaultNs && r.elements_.length !== 0)
    defaultNsId = (r.elements_[r.elements_.length - 1] as import("./xmlreader.state").ElementData)
      .defaultNamespaceId;
  r.firstAttribute_ = true;
  if (peek(r) === 47) {
    r.state_ = State.EmptyElementTag;
    ++r.pos_;
  } else r.state_ = State.Content;
  if (peek(r) !== 62) fail(r, "missing '>' in ");
  ++r.pos_;
  r.elements_.push({
    name: span(r, nameBegin, nameEnd),
    inheritedNamespaces,
    defaultNamespaceId: defaultNsId,
  });
  if (nameColon[0] === null) {
    nsId[0] = defaultNsId;
    assign(localName, span(r, nameBegin, nameEnd));
  } else {
    nsId[0] = getNamespaceId(r, span(r, nameBegin, nameColon[0]));
    assign(localName, span(r, nameColon[0] + 1, nameEnd));
  }
  return Result.Begin;
}
/** Original end-tag validation, including pop before final delimiter validation. @param r - Reader. @returns End. */
export function handleEndTag(r: ReaderState): Result {
  if (r.elements_.length === 0) fail(r, "spurious end tag in ");
  const begin = r.pos_,
    colon: [number | null] = [null];
  if (
    !scanName(r, colon) ||
    !(
      r.elements_[r.elements_.length - 1] as import("./xmlreader.state").ElementData
    ).name.operatorEquals(span(r, begin, r.pos_))
  )
    fail(r, "tag mismatch in ");
  handleElementEnd(r);
  skipSpace(r);
  if (peek(r) !== 62) fail(r, "missing '>' in ");
  ++r.pos_;
  return Result.End;
}
/** Original NONE text mode scans markup without expanding text references. @param r - Reader. @param data - Name output. @param nsId - Namespace output. @returns Next tag event. */
export function handleSkippedText(r: ReaderState, data: Span, nsId: [number]): Result {
  for (;;) {
    const i = r.bytes_.indexOf(60, r.pos_);
    if (i < 0) fail(r, "premature end of ");
    r.pos_ = i + 1;
    switch (peek(r)) {
      case 33:
        ++r.pos_;
        if (!skipComment(r) && !scanCdataSection(r).is()) skipDocumentTypeDeclaration(r);
        break;
      case 47:
        ++r.pos_;
        return handleEndTag(r);
      case 63:
        ++r.pos_;
        skipProcessingInstruction(r);
        break;
      default:
        return handleStartTag(r, nsId, data);
    }
  }
}
