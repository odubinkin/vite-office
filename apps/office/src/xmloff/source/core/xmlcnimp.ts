/** @fileoverview Original SvXMLAttrContainerData value facade. Copies create fresh collections; native unique_ptr/destruction/move lifetime machinery is erased under JS GC. */
import { SvXMLAttrCollection } from "./SvXMLAttrCollection";
/** Original mutable XML attribute container data. */
export class SvXMLAttrContainerData {
  private m_pImpl: SvXMLAttrCollection;
  /** Original empty/copy construction. @param source - Optional source. @returns Data. */
  constructor(source?: SvXMLAttrContainerData) {
    this.m_pImpl = new SvXMLAttrCollection(source?.m_pImpl);
  }
  /** Original copy assignment replaces the collection with a fresh value, including self-copy. @param source - Source. @returns This data. */
  public assign(source: SvXMLAttrContainerData): this {
    this.m_pImpl = new SvXMLAttrCollection(source.m_pImpl);
    return this;
  }
  /** Original collection equality. @param other - Data. @returns Equality. */
  public equals(other: SvXMLAttrContainerData): boolean {
    return this.m_pImpl.equals(other.m_pImpl);
  }
  /** Original overload forwarding with debug name assertions preserved as host errors. @param args - Original selected name/value arguments. @returns Whether accepted. */
  public AddAttr(
    ...args:
      | [local: string, value: string]
      | [prefix: string, local: string, value: string]
      | [prefix: string, namespace: string, local: string, value: string]
  ): boolean {
    const local = args[args.length - 2] as string;
    if (local.length === 0 || local.includes(":")) throw new Error("Invalid local attribute name.");
    if (args.length > 2 && args[0].includes(":")) throw new Error("Colon in attribute prefix.");
    return this.m_pImpl.AddAttr(...args);
  }
  /** Original overload forwarding with debug name assertions preserved as host errors. @param index - Original size_t index. @param args - Original selected name/value arguments. @returns Whether accepted. */
  public SetAt(
    index: number,
    ...args:
      | [local: string, value: string]
      | [prefix: string, local: string, value: string]
      | [prefix: string, namespace: string, local: string, value: string]
  ): boolean {
    const local = args[args.length - 2] as string;
    if (local.length === 0 || local.includes(":")) throw new Error("Invalid local attribute name.");
    if (args.length > 2 && args[0].includes(":")) throw new Error("Colon in attribute prefix.");
    return this.m_pImpl.SetAt(index, ...args);
  }
  /** Original erase. @param index - Original index. @returns Nothing. */
  public Remove(index: number): void {
    this.m_pImpl.Remove(index);
  }
  /** Original size_t count. @returns Original value. */
  public GetAttrCount(): number {
    return this.m_pImpl.GetAttrCount();
  }
  /** Original attribute URI. @param index - Original index. @returns Original value. */
  public GetAttrNamespace(index: number): string {
    return this.m_pImpl.GetAttrNamespace(index);
  }
  /** Original attribute prefix. @param index - Original index. @returns Original value. */
  public GetAttrPrefix(index: number): string {
    return this.m_pImpl.GetAttrPrefix(index);
  }
  /** Original local name. @param index - Original index. @returns Original value. */
  public GetAttrLName(index: number): string {
    return this.m_pImpl.GetAttrLName(index);
  }
  /** Original value. @param index - Original index. @returns Original value. */
  public GetAttrValue(index: number): string {
    return this.m_pImpl.GetAttrValue(index);
  }
  /** Original first namespace key. @returns Original value. */
  public GetFirstNamespaceIndex(): number {
    return this.m_pImpl.GetFirstNamespaceIndex();
  }
  /** Original next namespace key. @param index - Original index. @returns Original value. */
  public GetNextNamespaceIndex(index: number): number {
    return this.m_pImpl.GetNextNamespaceIndex(index);
  }
  /** Original namespace by key. @param index - Original index. @returns Original value. */
  public GetNamespace(index: number): string {
    return this.m_pImpl.GetNamespace(index);
  }
  /** Original prefix by key. @param index - Original index. @returns Original value. */
  public GetPrefix(index: number): string {
    return this.m_pImpl.GetPrefix(index);
  }
}
