/** @fileoverview Native comphelper AttributeList ordered values,copy and mutation; existing OUString owns value semantics and JS GC replaces WeakImplHelper allocation. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { XAttributeList } from "../../../udkapi/com/sun/star/xml/sax/XAttributeList";
/** Native tag value pair. */ interface TagAttribute {
  readonly sName: OUString;
  readonly sValue: OUString;
}
/** Native actual SAX attribute list; duplicate names are intentionally allowed by upstream. */
export class AttributeList implements XAttributeList {
  private readonly mAttributes: TagAttribute[] = [];
  /** Original empty/copy/interface constructors. @param source - Optional actual attribute list. @returns List. */
  constructor(source?: XAttributeList) {
    if (source instanceof AttributeList)
      for (const attr of source.mAttributes)
        this.mAttributes.push({
          sName: new OUString(attr.sName),
          sValue: new OUString(attr.sValue),
        });
    else if (source !== undefined) this.AppendAttributeList(source);
  }
  /** Original value-copy factory. @returns Clone. */ public createClone(): AttributeList {
    return new AttributeList(this);
  }
  /** Original ordered append with native debug name preconditions. @param name - Name. @param value - Value. @returns Nothing. */
  public AddAttribute(name: OUStringConstReference, value: OUStringConstReference): void {
    if (name.isEmpty()) throw new Error("empty attribute name is invalid");
    let colons = 0,
      carets = 0;
    for (let i = 0; i < name.getLength(); ++i) {
      const c = name.getStr()[i];
      if (c === 58) ++colons;
      if (c === 94) ++carets;
    }
    if (colons > 1 && carets !== 1) throw new Error("too many colons");
    this.mAttributes.push({ sName: new OUString(name), sValue: new OUString(value) });
  }
  /** Original vector clear; existing string values leave their scopes. @returns Nothing. */ public Clear(): void {
    for (const attr of this.mAttributes) {
      attr.sName.dispose();
      attr.sValue.dispose();
    }
    this.mAttributes.length = 0;
  }
  /** Original removes only the first matching name. @param name - Name. @returns Nothing. */ public RemoveAttribute(
    name: OUStringConstReference,
  ): void {
    const index = this.mAttributes.findIndex(
      /** Original first value match without signed index narrowing. @param attr - Candidate. @returns Match. */
      (attr) => attr.sName.equals(name),
    );
    if (index !== -1) this.RemoveAttributeByIndex(index);
  }
  /** Original interface append captures source length before iteration. @param source - Actual source list. @returns Nothing. */ public AppendAttributeList(
    source: XAttributeList,
  ): void {
    const count = source.getLength();
    for (let i = 0; i < count; ++i) {
      const name = source.getNameByIndex(i),
        value = source.getValueByIndex(i);
      try {
        this.AddAttribute(name, value);
      } finally {
        name.dispose();
        value.dispose();
      }
    }
  }
  /** Original value assignment. @param index - Valid position. @param value - Replacement. @returns Nothing. */ public SetValueByIndex(
    index: number,
    value: OUStringConstReference,
  ): void {
    (this.mAttributes[index] as TagAttribute).sValue.assign(value);
  }
  /** Original positional erase. @param index - Valid position. @returns Nothing. */ public RemoveAttributeByIndex(
    index: number,
  ): void {
    const attr = this.mAttributes[index] as TagAttribute;
    attr.sName.dispose();
    attr.sValue.dispose();
    this.mAttributes.splice(index, 1);
  }
  /** Original rename performs no AddAttribute name revalidation. @param index - Valid position. @param name - Replacement. @returns Nothing. */ public RenameAttributeByIndex(
    index: number,
    name: OUStringConstReference,
  ): void {
    (this.mAttributes[index] as TagAttribute).sName.assign(name);
  }
  /** Original first-match signed16 position. @param name - Queried name. @returns Position or minus one. */ public GetIndexByName(
    name: OUStringConstReference,
  ): number {
    const index = this.mAttributes.findIndex(
      /** Original value comparison. @param attr - Candidate. @returns Match. */ (attr) =>
        attr.sName.equals(name),
    );
    return index === -1 ? -1 : (index << 16) >> 16;
  }
  /** Original signed16 count conversion. @returns Count. */ public getLength(): number {
    return (this.mAttributes.length << 16) >> 16;
  }
  /** Original by-value name. @param index - Valid position. @returns Copy. */ public getNameByIndex(
    index: number,
  ): OUString {
    return new OUString((this.mAttributes[index] as TagAttribute).sName);
  }
  /** Original unconditional CDATA type. @param index - Unused native index. @returns Type. */ public getTypeByIndex(
    index: number,
  ): OUString {
    void index;
    return new OUString(new Uint16Array([67, 68, 65, 84, 65]), 5);
  }
  /** Original unconditional named CDATA type. @param name - Unused native name. @returns Type. */ public getTypeByName(
    name: OUStringConstReference,
  ): OUString {
    void name;
    return new OUString(new Uint16Array([67, 68, 65, 84, 65]), 5);
  }
  /** Original by-value data. @param index - Valid position. @returns Copy. */ public getValueByIndex(
    index: number,
  ): OUString {
    return new OUString((this.mAttributes[index] as TagAttribute).sValue);
  }
  /** Original first named value or empty. @param name - Queried name. @returns Copy. */ public getValueByName(
    name: OUStringConstReference,
  ): OUString {
    for (const attr of this.mAttributes)
      if (attr.sName.equals(name)) return new OUString(attr.sValue);
    return new OUString();
  }
}
