/** @fileoverview Native RTFValue scalar/string/nested-property constructors, queries, cloning and equality from rtfvalue.cxx; drawing, binary object, picture and crop alternatives are outside the current Writer model. */
import { SvRef, SvRefBase } from "../../../../tools/inc/ref";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import type { Value } from "../inc/dmapper/resourcemodel";
import { RTFSprms } from "./rtfsprm";
import { RTFReferenceProperties } from "./rtfreferenceproperties";
/** Original value owner with actual intrusive nested-list references and an owned OUString. */
export class RTFValue extends SvRefBase implements Value {
  private m_nValue = 0;
  private m_sValue = new OUString();
  private readonly m_pAttributes = new SvRef<RTFSprms>();
  private readonly m_pSprms = new SvRef<RTFSprms>();
  private m_bForceString = false;
  /** Native admitted overloads: default/int/string/attributes/attributes+modifiers. Strings are copied as native by-value arguments; the caller retains its source owner. @param value - Original constructor input. @param sprmsOrForce - Native second list or force-string flag. @returns Native value. */
  constructor(
    value?: number | OUStringConstReference | RTFSprms,
    sprmsOrForce?: RTFSprms | boolean,
  ) {
    super();
    if (typeof value === "number") this.m_nValue = value | 0;
    else if (value instanceof RTFSprms) {
      this.m_pAttributes.assign(new RTFSprms(value));
      if (sprmsOrForce instanceof RTFSprms) this.m_pSprms.assign(new RTFSprms(sprmsOrForce));
    } else if (value !== undefined) {
      this.m_sValue.dispose();
      this.m_sValue = new OUString(value);
      this.m_bForceString = sprmsOrForce === true;
    }
  }
  /** Original RTFValue copy assignment is deleted. The never parameter binds the compile-time exclusion; untyped host calls fail explicitly. @param source - No admitted assignment input. @returns Never. */
  override assign(source: never): never {
    void source;
    throw new Error("RTFValue::operator= is deleted");
  }
  /** Original signed integer query. @returns Stored integer. */
  getInt(): number {
    return this.m_nValue;
  }
  /** Original nonempty/forced string query, otherwise native decimal integer formatting. @returns Owned return string. */
  getString(): OUString {
    return !this.m_sValue.isEmpty() || this.m_bForceString
      ? new OUString(this.m_sValue)
      : new OUString(OUString.number(this.m_nValue));
  }
  /** Original string assignment preserves force-string and scalar state. @param value - Actual source string. @returns Nothing. */
  setString(value: OUStringConstReference): void {
    const copy = new OUString(value);
    this.m_sValue.dispose();
    this.m_sValue = copy;
  }
  /** Original string/int UNO alternatives for the represented model. @returns Owned Any. */
  getAny(): Any {
    return !this.m_sValue.isEmpty() || this.m_bForceString
      ? new Any([this.m_sValue.pData], "OUString")
      : new Any([this.m_nValue], "sal_Int32");
  }
  /** Native properties query lazily creates both lists and returns a separate reference container. @returns Property reference. */
  getProperties(): ReferencePointer<Properties> {
    return new ReferencePointer(new RTFReferenceProperties(this.getAttributes(), this.getSprms()));
  }
  /** Original binary query is always null, including populated scalar/nested alternatives. @returns Native null. */
  getBinary(): null {
    return null;
  }
  /** Original lazy attributes owner. @returns Actual list. */
  getAttributes(): RTFSprms {
    if (!this.m_pAttributes.is()) this.m_pAttributes.assign(new RTFSprms());
    return this.m_pAttributes.operatorDereference();
  }
  /** Original lazy modifiers owner. @returns Actual list. */
  getSprms(): RTFSprms {
    if (!this.m_pSprms.is()) this.m_pSprms.assign(new RTFSprms());
    return this.m_pSprms.operatorDereference();
  }
  /** Original clone preserves scalar/string/force state and copies the list values with shared copy-on-write payloads. @returns Unacquired native pointer. */
  Clone(): RTFValue {
    const copy = new RTFValue(this.m_sValue, this.m_bForceString);
    copy.m_nValue = this.m_nValue;
    if (this.m_pAttributes.is())
      copy.m_pAttributes.assign(new RTFSprms(this.m_pAttributes.operatorDereference()));
    if (this.m_pSprms.is()) copy.m_pSprms.assign(new RTFSprms(this.m_pSprms.operatorDereference()));
    return copy;
  }
  /** Original clone replaces only list values; force-string is retained. @param attributes - Replacement attributes. @param sprms - Replacement modifiers. @returns Unacquired native pointer. */
  CloneWithSprms(attributes: RTFSprms, sprms: RTFSprms): RTFValue {
    const copy = new RTFValue(this.m_sValue, this.m_bForceString);
    copy.m_nValue = this.m_nValue;
    copy.m_pAttributes.assign(new RTFSprms(attributes));
    copy.m_pSprms.assign(new RTFSprms(sprms));
    return copy;
  }
  /** Original equality ignores force-string and treats lazy empty lists as absent. @param other - Native value. @returns Equality. */
  equals(other: RTFValue): boolean {
    if (this.m_nValue !== other.m_nValue || !this.m_sValue.equals(other.m_sValue)) return false;
    for (const [left, right] of [
      [this.m_pAttributes.get(), other.m_pAttributes.get()],
      [this.m_pSprms.get(), other.m_pSprms.get()],
    ]) {
      if (left && right) {
        if (left.size() !== right.size() || !left.equals(right)) return false;
      } else if (left && left.size()) return false;
      else if (right && right.size()) return false;
    }
    return true;
  }
  /** Logical destructor binding for stack/unacquired values; intrusive deletion calls the same source destructor. @returns Nothing. */
  dispose(): void {
    this.m_sValue.dispose();
    this.m_pAttributes.clear();
    this.m_pSprms.clear();
  }
  /** Original virtual destructor releases actual string/list members. @returns Nothing. */
  protected override destroy(): void {
    this.dispose();
  }
}

import { ReferencePointer, type Properties } from "../inc/dmapper/resourcemodel";
