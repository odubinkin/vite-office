/** @fileoverview Original SvXMLNamespaceMap logical lookups, cache behavior and URI normalization. JS Maps/immutable strings replace unordered-map storage and UTF16 value ownership, without native hash/bucket/lifetime machinery. */
import { XML_NAMESPACE_XML } from "../../inc/xmlnamespace";
import { ODF_NAMESPACES } from "./xmltoken";
/** Original xmlns marker. */
export const XML_NAMESPACE_XMLNS = 65533;
/** Original no-namespace marker. */
export const XML_NAMESPACE_NONE = 65534;
/** Original unknown marker. */
export const XML_NAMESPACE_UNKNOWN = 65535;
/** Original automatic-key flag. */
export const XML_NAMESPACE_UNKNOWN_FLAG = 0x8000;
/** Original initialized namespace value entry; aggregate construction is explicit in JS. */
export class NameSpaceEntry {
  /** Initializes the original aggregate fields. @param m_sName - Namespace URI. @param m_sPrefix - Prefix. @param m_nKey - Native unsigned16 key. @returns Entry. */
  constructor(
    public m_sName: string,
    public m_sPrefix: string,
    public m_nKey: number,
  ) {
    this.m_nKey &= 0xffff;
  }
  /** Original three-field equality. @param rhs - Actual compared entry. @returns Value equality. */
  public equals(rhs: Readonly<NameSpaceEntry>): boolean {
    return (
      this.m_sName === rhs.m_sName && this.m_sPrefix === rhs.m_sPrefix && this.m_nKey === rhs.m_nKey
    );
  }
}
/** Original initialized reverse-map aggregate. */
export class KeyToNameSpaceMapEntry {
  /** Initializes original fields. @param sName - Namespace URI. @param sPrefix - Canonical prefix for the key. @returns Entry. */
  constructor(
    public sName: string,
    public sPrefix: string,
  ) {}
}
/** Original nested QName parsing modes. */
export enum QNameMode {
  AttrNameCached,
  AttrValue,
}
/** Erased mutable OUString pointer argument over the existing JS string binding. */
export type NamespaceStringCell = [string];
/** Original namespace map. Native unordered iteration has no promised order; JS iteration retains complete membership. */
export class SvXMLNamespaceMap {
  /** Original nested enum binding, sharing the same declaration. */
  public static readonly QNameMode = QNameMode;
  private readonly m_sXMLNS = "xmlns";
  private readonly m_aNameHash = new Map<string, NameSpaceEntry>();
  private readonly m_aNameCache = new Map<string, NameSpaceEntry>();
  private readonly maKeyToNamespaceMap = new Map<number, KeyToNameSpaceMapEntry>();
  // Nested native Maps preserve pair-key value semantics; no custom hash table or string-key encoding.
  private readonly m_aQNameCache = new Map<number, Map<string, string>>();
  /** Original empty/copy construction; both caches start empty on a new copy. @param source - Optional actual const source. @returns Map. */
  constructor(source?: SvXMLNamespaceMap) {
    if (source !== undefined) this.assign(source);
  }
  /** Original assignment copies namespace tables but neither clears nor copies destination caches. Borrowed table identity remains stable. @param source - Actual const source, possibly this. @returns This map. */
  public assign(source: SvXMLNamespaceMap): this {
    const names = Array.from(
      source.m_aNameHash,
      /** Copies native map values. @param pair - Prefix/entry. @returns Independent entry. */ ([
        prefix,
        entry,
      ]) => [prefix, new NameSpaceEntry(entry.m_sName, entry.m_sPrefix, entry.m_nKey)] as const,
    );
    const keys = Array.from(
      source.maKeyToNamespaceMap,
      /** Copies native reverse-map values. @param pair - Key/entry. @returns Independent entry. */ ([
        key,
        entry,
      ]) => [key, new KeyToNameSpaceMapEntry(entry.sName, entry.sPrefix)] as const,
    );
    this.m_aNameHash.clear();
    this.maKeyToNamespaceMap.clear();
    for (const [key, entry] of names) this.m_aNameHash.set(key, entry);
    for (const [key, entry] of keys) this.maKeyToNamespaceMap.set(key, entry);
    return this;
  }
  /** Original equality compares the prefix table only, without cache or reverse-map ordering. @param source - Actual compared map. @returns Value equality. */
  public equals(source: SvXMLNamespaceMap): boolean {
    if (this.m_aNameHash.size !== source.m_aNameHash.size) return false;
    for (const [prefix, entry] of this.m_aNameHash) {
      const other = source.m_aNameHash.get(prefix);
      if (other === undefined || !entry.equals(other)) return false;
    }
    return true;
  }
  /** Original complete table/cache clear. @returns Nothing. */
  public Clear(): void {
    this.m_aNameHash.clear();
    this.m_aNameCache.clear();
    this.maKeyToNamespaceMap.clear();
    this.m_aQNameCache.clear();
  }
  /** Original first-free flagged key allocation and table updates. @param prefix - Prefix. @param name - Namespace URI. @param key - Resolved or unknown key. @returns Stored unsigned16 key. */
  private Add_(prefix: string, name: string, key: number): number {
    if (key === XML_NAMESPACE_UNKNOWN) {
      key = XML_NAMESPACE_UNKNOWN_FLAG;
      while (this.maKeyToNamespaceMap.has(key)) key = (key + 1) & 0xffff;
    }
    this.m_aNameHash.set(prefix, new NameSpaceEntry(name, prefix, key));
    this.maKeyToNamespaceMap.set(key, new KeyToNameSpaceMapEntry(name, prefix));
    return key;
  }
  /** Original add resolves a name first and does not replace an existing prefix. NONE follows the defined release fallback; source debug diagnostics are not recreated. @param prefix - Prefix. @param name - Namespace URI. @param key - Optional native key. @returns Resolved key, even when an existing prefix prevents insertion. */
  public Add(prefix: string, name: string, key = XML_NAMESPACE_UNKNOWN): number {
    key &= 0xffff;
    if (key === XML_NAMESPACE_UNKNOWN) key = this.GetKeyByName(name);
    if (key === XML_NAMESPACE_NONE) return XML_NAMESPACE_UNKNOWN;
    if (!this.m_aNameHash.has(prefix)) key = this.Add_(prefix, name, key);
    return key;
  }
  /** Original add only for a known URI, replacing a conflicting prefix while retaining old reverse entries and caches. @param prefix - Prefix. @param name - Namespace URI. @returns Known key or UNKNOWN. */
  public AddIfKnown(prefix: string, name: string): number {
    let key = this.GetKeyByName(name);
    if (key === XML_NAMESPACE_NONE) return XML_NAMESPACE_UNKNOWN;
    if (key !== XML_NAMESPACE_UNKNOWN) {
      const entry = this.m_aNameHash.get(prefix);
      if (entry === undefined || entry.m_sName !== name) key = this.Add_(prefix, name, key);
    }
    return key;
  }
  /** Original first matching URI in the logical unordered prefix table. @param name - URI. @returns Key or UNKNOWN. */
  public GetKeyByName(name: string): number {
    for (const entry of this.m_aNameHash.values()) if (entry.m_sName === name) return entry.m_nKey;
    return XML_NAMESPACE_UNKNOWN;
  }
  /** Original prefix lookup. @param prefix - Prefix. @returns Key or UNKNOWN. */
  public GetKeyByPrefix(prefix: string): number {
    return this.m_aNameHash.get(prefix)?.m_nKey ?? XML_NAMESPACE_UNKNOWN;
  }
  /** Original namespace lookup. @param key - Native unsigned16 key. @returns URI or empty. */
  public GetNameByKey(key: number): string {
    return this.maKeyToNamespaceMap.get(key & 0xffff)?.sName ?? "";
  }
  /** Original canonical-prefix lookup. @param key - Native unsigned16 key. @returns Prefix or empty. */
  public GetPrefixByKey(key: number): string {
    return this.maKeyToNamespaceMap.get(key & 0xffff)?.sPrefix ?? "";
  }
  /** Original namespace declaration spelling. @param key - Native key. @returns xmlns declaration name or empty for a missing key. */
  public GetAttrNameByKey(key: number): string {
    const entry = this.maKeyToNamespaceMap.get(key & 0xffff);
    if (entry === undefined) return "";
    return entry.sPrefix === "" ? this.m_sXMLNS : this.m_sXMLNS + ":" + entry.sPrefix;
  }
  /** Original QName generation and optional pair-key cache. Missing nonreserved keys retain the defined release local-name fallback. @param key - Namespace key. @param local - Local name. @param cache - Whether cache participates. @returns QName. */
  public GetQNameByKey(key: number, local: string, cache = true): string {
    key &= 0xffff;
    switch (key) {
      case XML_NAMESPACE_UNKNOWN:
      case XML_NAMESPACE_NONE:
        return local;
      case XML_NAMESPACE_XMLNS:
        return local === "" ? this.m_sXMLNS : this.m_sXMLNS + ":" + local;
      case XML_NAMESPACE_XML:
        return "xml:" + local;
      default: {
        const previous = cache ? this.m_aQNameCache.get(key)?.get(local) : undefined;
        if (previous !== undefined) return previous;
        const entry = this.maKeyToNamespaceMap.get(key);
        if (entry === undefined) return local;
        const value = entry.sPrefix === "" ? local : entry.sPrefix + ":" + local;
        if (cache) {
          let byName = this.m_aQNameCache.get(key);
          if (byName === undefined) {
            byName = new Map();
            this.m_aQNameCache.set(key, byName);
          }
          byName.set(local, value);
        }
        return value;
      }
    }
  }
  /** Original QName parser with exact cold/hot output writes and cache modes. @param qname - Original name/value. @param prefix - Optional output pointer. @param local - Optional output pointer. @param namespace - Optional output pointer. @param mode - Original parsing mode. @returns Namespace key. */
  public GetKeyByQName(
    qname: string,
    prefix: NamespaceStringCell | undefined,
    local: NamespaceStringCell | undefined,
    namespace: NamespaceStringCell | undefined,
    mode: QNameMode,
  ): number {
    const previous = mode === QNameMode.AttrNameCached ? this.m_aNameCache.get(qname) : undefined;
    if (previous !== undefined) {
      if (prefix !== undefined) prefix[0] = previous.m_sPrefix;
      if (local !== undefined) local[0] = previous.m_sName;
      if (namespace !== undefined) namespace[0] = this.GetNameByKey(previous.m_nKey);
      return previous.m_nKey;
    }
    const colon = qname.indexOf(":"),
      p = colon === -1 ? "" : qname.slice(0, colon),
      name = colon === -1 ? qname : qname.slice(colon + 1);
    if (mode === QNameMode.AttrNameCached && name.includes(":")) return XML_NAMESPACE_UNKNOWN;
    if (prefix !== undefined) prefix[0] = p;
    if (local !== undefined) local[0] = name;
    const entry = this.m_aNameHash.get(p);
    let key: number;
    if (entry !== undefined) {
      key = entry.m_nKey;
      if (namespace !== undefined) namespace[0] = entry.m_sName;
    } else if (p === this.m_sXMLNS) key = XML_NAMESPACE_XMLNS;
    else if (colon === -1) key = XML_NAMESPACE_NONE;
    else key = XML_NAMESPACE_UNKNOWN;
    if (mode === QNameMode.AttrNameCached)
      this.m_aNameCache.set(qname, new NameSpaceEntry(name, p, key));
    return key;
  }
  /** Original value-QName wrapper permits extra colons and does not cache. @param qname - Attribute value. @param local - Nullable output pointer. @returns Key. */
  public GetKeyByAttrValueQName(qname: string, local: NamespaceStringCell | undefined): number {
    return this.GetKeyByQName(qname, undefined, local, undefined, QNameMode.AttrValue);
  }
  /** Original first key in an unspecified unordered traversal. @returns Key or UNKNOWN. */
  public GetFirstKey(): number {
    return this.maKeyToNamespaceMap.keys().next().value ?? XML_NAMESPACE_UNKNOWN;
  }
  /** Original next key in the same logical traversal. The native invalid-end precondition becomes a host error. @param old - Existing key. @returns Next key or UNKNOWN. */
  public GetNextKey(old: number): number {
    const keys = Array.from(this.maKeyToNamespaceMap.keys()),
      index = keys.indexOf(old & 0xffff);
    if (index === -1) throw new Error("Namespace traversal requires an existing key.");
    return keys[index + 1] ?? XML_NAMESPACE_UNKNOWN;
  }
  /** Original borrowed all-alias table, including multiple prefixes for one key. @returns Stable constant table view. */
  public GetAllEntries(): ReadonlyMap<string, Readonly<NameSpaceEntry>> {
    return this.m_aNameHash;
  }
  /** Original deprecated identity conversion. @param key - Native unsigned16 key. @returns Identical index. */
  public static GetIndexByKey(key: number): number {
    return key & 0xffff;
  }
  /** Original deprecated first-index traversal. @returns First key or UNKNOWN. */
  public GetFirstIndex(): number {
    return this.GetFirstKey();
  }
  /** Original deprecated next-index traversal. @param old - Existing index. @returns Next key or UNKNOWN. */
  public GetNextIndex(old: number): number {
    return this.GetNextKey(old);
  }
  /** Original deprecated add with its NONE/no-replacement rules. @param prefix - Prefix. @param name - Namespace URI. @param key - Explicit native key. @returns Nothing. */
  public AddAtIndex(prefix: string, name: string, key: number): void {
    key &= 0xffff;
    if (key === XML_NAMESPACE_UNKNOWN) key = this.GetKeyByName(name);
    if (key !== XML_NAMESPACE_NONE && !this.m_aNameHash.has(prefix)) this.Add_(prefix, name, key);
  }
  /** Original deprecated declaration-name query. @param index - Native index. @returns Declaration name or empty. */
  public GetAttrNameByIndex(index: number): string {
    return this.GetAttrNameByKey(index);
  }
  /** Original deprecated prefix query. @param index - Native index. @returns Prefix or empty. */
  public GetPrefixByIndex(index: number): string {
    return this.GetPrefixByKey(index);
  }
  /** Original deprecated URI query. @param index - Native index. @returns URI or empty. */
  public GetNameByIndex(index: number): string {
    return this.GetNameByKey(index);
  }
  /** Original deprecated prefix-to-index query. @param prefix - Prefix. @returns Index or UNKNOWN. */
  public GetIndexByPrefix(prefix: string): number {
    return this.GetKeyByPrefix(prefix);
  }
  /** Original one-output attribute-name overload. @param qname - Name. @param local - Optional local-name output. @returns Key. */
  public GetKeyByAttrName(qname: string, local?: NamespaceStringCell): number;
  /** Original three-output attribute-name overload. @param qname - Name. @param prefix - Optional prefix output. @param local - Optional local output. @param namespace - Optional URI output. @returns Key. */
  public GetKeyByAttrName(
    qname: string,
    prefix: NamespaceStringCell | undefined,
    local: NamespaceStringCell | undefined,
    namespace: NamespaceStringCell | undefined,
  ): number;
  /** Original overload selection by pointer count, using mutable string output cells. @param qname - Name. @param outputs - Original selected pointer arguments. @returns Key. */
  public GetKeyByAttrName(qname: string, ...outputs: (NamespaceStringCell | undefined)[]): number {
    return outputs.length <= 1
      ? this.GetKeyByQName(qname, undefined, outputs[0], undefined, QNameMode.AttrNameCached)
      : this.GetKeyByQName(qname, outputs[0], outputs[1], outputs[2], QNameMode.AttrNameCached);
  }
  /** Original OASIS-then-W3 normalization dispatch. @param name - Original mutable string argument. @returns Whether recognized, including an unchanged already-normalized URI. */
  public static NormalizeURI(name: NamespaceStringCell): boolean {
    return SvXMLNamespaceMap.NormalizeOasisURN(name) || SvXMLNamespaceMap.NormalizeW3URI(name);
  }
  /** Original W3 prefix/suffix-only normalization; the intervening text is deliberately not validated as a year. @param name - Mutable URI. @returns Whether normalized. */
  public static NormalizeW3URI(name: NamespaceStringCell): boolean {
    if (name[0].startsWith("http://www.w3.org/") && name[0].endsWith("/xforms")) {
      name[0] = "http://www.w3.org/2002/xforms";
      return true;
    }
    return false;
  }
  /** Original legacy aliases and OASIS TC/version normalization using native string operations. @param name - Mutable URI. @returns Whether normalized. */
  public static NormalizeOasisURN(name: NamespaceStringCell): boolean {
    const text = name[0];
    if (text === "http://www.w3.org/2000/svg") {
      name[0] = ODF_NAMESPACES.svg;
      return true;
    }
    if (text === "http://www.w3.org/1999/XSL/Format") {
      name[0] = ODF_NAMESPACES.fo;
      return true;
    }
    if (text === "http://www.w3.org/2001/SMIL20/" || text === "http://www.w3.org/2001/SMIL20") {
      name[0] = "urn:oasis:names:tc:opendocument:xmlns:smil-compatible:1.0";
      return true;
    }
    const oasis = "urn:oasis:names:tc";
    if (!text.startsWith(oasis)) return false;
    let pos = oasis.length;
    if (pos >= text.length || text[pos] !== ":") return false;
    const tcStart = pos + 1,
      tcEnd = text.indexOf(":", tcStart);
    if (tcEnd === -1) return false;
    pos = tcEnd + 1;
    if (!text.slice(pos).startsWith("xmlns")) return false;
    pos += "xmlns".length;
    if (pos >= text.length || text[pos] !== ":") return false;
    pos = text.indexOf(":", pos + 1);
    if (pos === -1) return false;
    const version = pos + 1;
    if (version + 2 >= text.length || text.indexOf(":", version) !== -1) return false;
    if (text[version] !== "1" || text[version + 1] !== ".") return false;
    name[0] = text.slice(0, tcStart) + "opendocument" + text.slice(tcEnd, version) + "1.0";
    return true;
  }
}
