/** @fileoverview Original SvXMLAttrCollection with ordered attributes and shared namespace-map semantics. JS array/GC replace vector storage, without native layout or allocation machinery. */
import { SvXMLAttr } from "./SvXMLAttr";
import { SvXMLNamespaceMap, XML_NAMESPACE_UNKNOWN } from "./namespacemap";
/** Original namespace-bearing attribute collection. */
export class SvXMLAttrCollection {
  private readonly aNamespaceMap: SvXMLNamespaceMap;
  private aAttrs: SvXMLAttr[];
  /** Original default/implicit-copy construction, with independent namespace and attribute values. @param source - Optional source. @returns Collection. */
  constructor(source?: SvXMLAttrCollection) {
    this.aNamespaceMap = new SvXMLNamespaceMap(source?.aNamespaceMap);
    this.aAttrs =
      source === undefined
        ? []
        : source.aAttrs.map(
            /** Copies one value. @param attr - Source. @returns Attribute. */ (attr) =>
              new SvXMLAttr(attr),
          );
  }
  /** Original implicit member assignment. @param source - Actual source, including self. @returns This collection. */
  public assign(source: SvXMLAttrCollection): this {
    this.aNamespaceMap.assign(source.aNamespaceMap);
    this.aAttrs = source.aAttrs.map(
      /** Copies one value. @param attr - Source. @returns Attribute. */ (attr) =>
        new SvXMLAttr(attr),
    );
    return this;
  }
  /** Original equality includes retained namespace history and attribute order. @param other - Compared collection. @returns Equality. */
  public equals(other: SvXMLAttrCollection): boolean {
    return (
      this.aNamespaceMap.equals(other.aNamespaceMap) &&
      this.aAttrs.length === other.aAttrs.length &&
      this.aAttrs.every(
        /** Compares ordered values. @param attr - Attribute. @param index - Original index. @returns Equality. */ (
          attr,
          index,
        ) => attr.equals(other.aAttrs[index] as SvXMLAttr),
      )
    );
  }
  /** Original three overloads selected by argument count. @param args - Local/value, known-prefix/local/value or prefix/URI/local/value. @returns Whether accepted. */
  public AddAttr(
    ...args:
      | [local: string, value: string]
      | [prefix: string, local: string, value: string]
      | [prefix: string, namespace: string, local: string, value: string]
  ): boolean {
    const local = args[args.length - 2] as string;
    if (local.length === 0) throw new Error("Empty attribute name.");
    if (args.length > 2 && args[0].length === 0) throw new Error("Empty attribute prefix.");
    if (args.length === 4 && args[1].length === 0) throw new Error("Empty attribute namespace.");
    let attr: SvXMLAttr;
    if (args.length === 2) attr = new SvXMLAttr(args[0], args[1]);
    else {
      const position =
        args.length === 4
          ? this.aNamespaceMap.Add(args[0], args[1])
          : this.aNamespaceMap.GetIndexByPrefix(args[0]);
      if (args.length === 3 && position === XML_NAMESPACE_UNKNOWN) return false;
      attr = new SvXMLAttr(position, local, args[args.length - 1] as string);
    }
    this.aAttrs.push(attr);
    return true;
  }
  /** Original three overloads selected by argument count. @param index - Original size_t index. @param args - Local/value, known-prefix/local/value or prefix/URI/local/value. @returns Whether accepted. */
  public SetAt(
    index: number,
    ...args:
      | [local: string, value: string]
      | [prefix: string, local: string, value: string]
      | [prefix: string, namespace: string, local: string, value: string]
  ): boolean {
    const local = args[args.length - 2] as string;
    if (local.length === 0) throw new Error("Empty attribute name.");
    if (args.length > 2 && args[0].length === 0) throw new Error("Empty attribute prefix.");
    if (args.length === 4 && args[1].length === 0) throw new Error("Empty attribute namespace.");
    if (index >= this.GetAttrCount()) return false;
    let attr: SvXMLAttr;
    if (args.length === 2) attr = new SvXMLAttr(args[0], args[1]);
    else {
      const position =
        args.length === 4
          ? this.aNamespaceMap.Add(args[0], args[1])
          : this.aNamespaceMap.GetIndexByPrefix(args[0]);
      if (position === XML_NAMESPACE_UNKNOWN) return false;
      attr = new SvXMLAttr(position, local, args[args.length - 1] as string);
    }
    this.aAttrs[index] = attr;
    return true;
  }
  /** Original erase; an invalid index is a diagnostic-only no-op. Namespace entries are retained. @param index - Original index. @returns Nothing. */
  public Remove(index: number): void {
    if (index < this.GetAttrCount()) this.aAttrs.splice(index, 1);
  }
  /** Original vector size. @returns Attribute count. */
  public GetAttrCount(): number {
    return this.aAttrs.length;
  }
  /** Original unchecked attribute local-name access; invalid source preconditions become host errors. @param index - Valid index. @returns Name. */
  public GetAttrLName(index: number): string {
    return (this.aAttrs[index] as SvXMLAttr).getLName();
  }
  /** Original unchecked attribute value access. @param index - Valid index. @returns Value. */
  public GetAttrValue(index: number): string {
    return (this.aAttrs[index] as SvXMLAttr).getValue();
  }
  /** Original prefix position lookup. @param index - Valid index. @returns Key. */
  private GetPrefixPos(index: number): number {
    return (this.aAttrs[index] as SvXMLAttr).getPrefixPos();
  }
  /** Original optional namespace lookup. @param index - Valid attribute index. @returns URI or empty. */
  public GetAttrNamespace(index: number): string {
    const pos = this.GetPrefixPos(index);
    return pos === XML_NAMESPACE_UNKNOWN ? "" : this.aNamespaceMap.GetNameByIndex(pos);
  }
  /** Original optional prefix lookup. @param index - Valid attribute index. @returns Prefix or empty. */
  public GetAttrPrefix(index: number): string {
    const pos = this.GetPrefixPos(index);
    return pos === XML_NAMESPACE_UNKNOWN ? "" : this.aNamespaceMap.GetPrefixByIndex(pos);
  }
  /** Original namespace lookup by unsigned16 key. @param index - Key. @returns URI or empty. */
  public GetNamespace(index: number): string {
    return this.aNamespaceMap.GetNameByIndex(index);
  }
  /** Original prefix lookup by unsigned16 key. @param index - Key. @returns Prefix or empty. */
  public GetPrefix(index: number): string {
    return this.aNamespaceMap.GetPrefixByIndex(index);
  }
  /** Original first namespace key in unspecified traversal order. @returns Key or UNKNOWN. */
  public GetFirstNamespaceIndex(): number {
    return this.aNamespaceMap.GetFirstIndex();
  }
  /** Original next namespace key. @param index - Existing unsigned16 key. @returns Key or UNKNOWN. */
  public GetNextNamespaceIndex(index: number): number {
    return this.aNamespaceMap.GetNextIndex(index);
  }
}
