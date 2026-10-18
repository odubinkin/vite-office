/** @fileoverview Original SvXMLAttrContainerItem value/copy/accessor contracts. UNO QueryValue/PutValue require the unported actual SvUnoAttributeContainer/XNameContainer; inherited unsupported operations are not claimed native transport. */
import { SfxPoolItem, type SfxItemPresentation } from "../../../svl/inc/poolitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import type { MapUnit } from "../../../tools/inc/mapunit";
import type { OUString } from "../../../sal/inc/rtl/ustring";
import { SvXMLAttrContainerData } from "../../../xmloff/inc/xmlcnimp";
/** Original XML attribute pooled item, with ordinary GC-owned value data. */
export class SvXMLAttrContainerItem extends SfxPoolItem {
  private readonly maContainerData: SvXMLAttrContainerData;
  /** Original Which0 default or actual copy. @param source - Which or source. @returns Item. */
  constructor(source: number | SvXMLAttrContainerItem = 0) {
    super(typeof source === "number" ? source : source.Which());
    this.maContainerData =
      typeof source === "number"
        ? new SvXMLAttrContainerData()
        : new SvXMLAttrContainerData(source.maContainerData);
  }
  /** Original copy clone, retaining Which. @param pool - Unused source pool argument. @returns Independent item. */
  public override Clone(pool?: SfxItemPool): SvXMLAttrContainerItem {
    void pool;
    return new SvXMLAttrContainerItem(this);
  }
  /** Original base concrete-type and payload comparison; Which is not payload. @param other - Compared item. @returns Equality. */
  public override equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvXMLAttrContainerItem && this.maContainerData.equals(other.maContainerData)
    );
  }
  /** Original false presentation leaves actual output text untouched. IntlWrapper is erased because unused. @param presentation - Unused degree. @param coreMetric - Unused unit. @param presentationMetric - Unused unit. @param text - Unchanged output. @param intl - Unused original service. @returns False. */
  public GetPresentation(
    presentation: SfxItemPresentation,
    coreMetric: MapUnit,
    presentationMetric: MapUnit,
    text: OUString,
    intl: unknown,
  ): boolean {
    void presentation;
    void coreMetric;
    void presentationMetric;
    void text;
    void intl;
    return false;
  }
  /** Original two AddAttr forms; the item has no known-prefix-only overload. @param args - Local/value or prefix/URI/local/value. @returns Whether accepted. */
  public AddAttr(
    ...args:
      | [local: string, value: string]
      | [prefix: string, namespace: string, local: string, value: string]
  ): boolean {
    return this.maContainerData.AddAttr(...args);
  }
  /** Original explicit unsigned16 narrowing of the size_t count. @returns Wrapped count. */
  public GetAttrCount(): number {
    return this.maContainerData.GetAttrCount() & 0xffff;
  }
  /** Original contained value query. @param index - Unsigned16 source index. @returns Original value. */
  public GetAttrNamespace(index: number): string {
    return this.maContainerData.GetAttrNamespace(index & 0xffff);
  }
  /** Original contained value query. @param index - Unsigned16 source index. @returns Original value. */
  public GetAttrPrefix(index: number): string {
    return this.maContainerData.GetAttrPrefix(index & 0xffff);
  }
  /** Original contained value query. @param index - Unsigned16 source index. @returns Original value. */
  public GetAttrLName(index: number): string {
    return this.maContainerData.GetAttrLName(index & 0xffff);
  }
  /** Original contained value query. @param index - Unsigned16 source index. @returns Original value. */
  public GetAttrValue(index: number): string {
    return this.maContainerData.GetAttrValue(index & 0xffff);
  }
  /** Original contained value query. @returns Original value. */
  public GetFirstNamespaceIndex(): number {
    return this.maContainerData.GetFirstNamespaceIndex();
  }
  /** Original contained value query. @param index - Unsigned16 source index. @returns Original value. */
  public GetNextNamespaceIndex(index: number): number {
    return this.maContainerData.GetNextNamespaceIndex(index & 0xffff);
  }
  /** Original contained value query. @param index - Unsigned16 source index. @returns Original value. */
  public GetNamespace(index: number): string {
    return this.maContainerData.GetNamespace(index & 0xffff);
  }
  /** Original contained value query. @param index - Unsigned16 source index. @returns Original value. */
  public GetPrefix(index: number): string {
    return this.maContainerData.GetPrefix(index & 0xffff);
  }
}
