/** @fileoverview Canonical namespacemap.hxx boundary reusing one namespace value/cache implementation. Native unordered-map hash/allocator types are replaced by JS Map storage. */
export {
  SvXMLNamespaceMap,
  NameSpaceEntry,
  KeyToNameSpaceMapEntry,
  QNameMode,
  XML_NAMESPACE_XMLNS,
  XML_NAMESPACE_NONE,
  XML_NAMESPACE_UNKNOWN,
  XML_NAMESPACE_UNKNOWN_FLAG,
} from "../source/core/namespacemap";
export type { NamespaceStringCell } from "../source/core/namespacemap";
