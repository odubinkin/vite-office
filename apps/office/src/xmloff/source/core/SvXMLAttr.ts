/** @fileoverview Original SvXMLAttr immutable UTF16 value and unsigned16 prefix identity; JS strings need no native lifetime wrapper. */
import { XML_NAMESPACE_UNKNOWN } from "./namespacemap";
/** Original individual attribute value. */
export class SvXMLAttr {
  private aPrefixPos: number;
  private aLName: string;
  private aValue: string;
  /** Original plain, qualified and implicit-copy constructors. @param args - Selected original arguments. @returns Attribute. */
  constructor(
    ...args:
      | [local: string, value: string]
      | [position: number, local: string, value: string]
      | [source: SvXMLAttr]
  ) {
    if (args.length === 1) {
      this.aPrefixPos = args[0].aPrefixPos;
      this.aLName = args[0].aLName;
      this.aValue = args[0].aValue;
    } else if (args.length === 2) {
      this.aPrefixPos = XML_NAMESPACE_UNKNOWN;
      [this.aLName, this.aValue] = args;
    } else {
      this.aPrefixPos = args[0] & 0xffff;
      this.aLName = args[1];
      this.aValue = args[2];
    }
  }
  /** Original implicit value assignment. @param source - Source, possibly self. @returns This attribute. */
  public assign(source: SvXMLAttr): this {
    this.aPrefixPos = source.aPrefixPos;
    this.aLName = source.aLName;
    this.aValue = source.aValue;
    return this;
  }
  /** Original three-field comparison. @param other - Attribute. @returns Value equality. */
  public equals(other: SvXMLAttr): boolean {
    return (
      this.aPrefixPos === other.aPrefixPos &&
      this.aLName === other.aLName &&
      this.aValue === other.aValue
    );
  }
  /** Original prefix position. @returns Unsigned16 key. */
  public getPrefixPos(): number {
    return this.aPrefixPos;
  }
  /** Original local name. @returns UTF16 string. */
  public getLName(): string {
    return this.aLName;
  }
  /** Original value. @returns UTF16 string. */
  public getValue(): string {
    return this.aValue;
  }
}
