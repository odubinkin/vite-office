/** @fileoverview Original SfxItemPropertyMapEntry value and comparator from include/svl/itemprop.hxx; remaining property-set contracts stay with their implementation owners. */
import { OUString, type OUStringConstReference } from "../../sal/inc/rtl/ustring";
import { Type } from "../../cppu/inc/com/sun/star/uno/Type";
import { TypeClass } from "../../udkapi/com/sun/star/uno/TypeClass";
import { PropertyMoreFlags } from "../../comphelper/inc/propertysetinfo";
export { PropertyMoreFlags } from "../../comphelper/inc/propertysetinfo";
/** Original macro value. */
export const PROPERTY_NONE = 0;
/** Original counted UTF16 lexical comparison, with no locale/case transformation. @param left - First native view. @param right - Second native view. @returns Three-way order. */
export function comparePropertyNames(left: Uint16Array, right: Uint16Array): number {
  const length = Math.min(left.length, right.length);
  for (let i = 0; i < length; ++i) {
    if (left[i] !== right[i]) return (left[i] as number) < (right[i] as number) ? -1 : 1;
  }
  return left.length < right.length ? -1 : left.length > right.length ? 1 : 0;
}
/** Binds the original implicit OUString-to-view conversion. @param name - Borrowed name. @returns Exact native view. */
export function propertyNameView(name: OUStringConstReference): Uint16Array {
  return name.getStr().subarray(0, name.getLength());
}
/** Native property schema value; names/types own their real RTL/UNO copies while maps borrow entry pointers. */
export class SfxItemPropertyMapEntry {
  aName: OUString;
  aType: Type;
  nWID: number;
  nFlags: number;
  nMemberId: number;
  nMoreFlags: PropertyMoreFlags;
  /** Original constructor and implicit value copy constructor. Checked preconditions are preserved without manufacturing failed native constructor owners. @param args - Source values or copied entry. @returns Entry owner. */
  constructor(
    ...args:
      | [source: SfxItemPropertyMapEntry]
      | [
          name: OUStringConstReference,
          which: number,
          type: Type,
          flags: number,
          member: number,
          more?: PropertyMoreFlags,
        ]
  ) {
    if (args.length === 1) {
      const source = args[0];
      this.aName = new OUString(source.aName);
      this.aType = new Type(source.aType);
      this.nWID = source.nWID;
      this.nFlags = source.nFlags;
      this.nMemberId = source.nMemberId;
      this.nMoreFlags = source.nMoreFlags;
      return;
    }
    const [name, which, type, flags, member, more = PropertyMoreFlags.NONE] = args;
    const nativeFlags = (flags << 16) >> 16,
      nativeMember = member & 255;
    if (!(nativeFlags <= 0x1ff)) throw new Error("assert(_nFlags <= 0x1ff)");
    if (nativeMember & 0x40) throw new Error("assert((_nMemberId & 0x40) == 0)");
    if (more & PropertyMoreFlags.METRIC_ITEM) {
      const kind = type.getTypeClass();
      if (
        ![
          TypeClass.BYTE,
          TypeClass.SHORT,
          TypeClass.UNSIGNED_SHORT,
          TypeClass.LONG,
          TypeClass.UNSIGNED_LONG,
        ].includes(kind)
      )
        throw new Error("assert(METRIC_ITEM has a supported integer type)");
    }
    this.aName = new OUString(name);
    this.aType = new Type(type);
    this.nWID = which & 0xffff;
    this.nFlags = nativeFlags;
    this.nMemberId = nativeMember;
    this.nMoreFlags = more & 255;
  }
  /** Original implicit memberwise copy assignment, including self assignment. @param source - Borrowed value. @returns This entry. */
  assign(source: SfxItemPropertyMapEntry): this {
    this.aName.assign(source.aName);
    this.aType.assign(source.aType);
    this.nWID = source.nWID;
    this.nFlags = source.nFlags;
    this.nMemberId = source.nMemberId;
    this.nMoreFlags = source.nMoreFlags;
    return this;
  }
  /** Original reverse member destruction. Maps do not call this for borrowed entries. @returns Nothing. */
  dispose(): void {
    this.aType.dispose();
    this.aName.dispose();
  }
}
/** Original stateless sorted-vector comparator. */
export class SfxItemPropertyMapCompare {
  /** Native operator() compares counted names only. @param left - Borrowed first entry. @param right - Borrowed second entry. @returns Strict order. */
  operatorCall(left: SfxItemPropertyMapEntry, right: SfxItemPropertyMapEntry): boolean {
    return left.aName.lessThan(right.aName);
  }
}
