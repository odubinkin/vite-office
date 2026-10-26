/** @fileoverview Original LatentStyleHandler attribute receiver preserves source order, duplicates and getString projection of all six latent-style fields. */
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { PropertyValue } from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import type { Id, Properties, Sprm, Value } from "../inc/dmapper/resourcemodel";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";

/** Native receiver for one w:lsdException, using actual generated PropertyValue owners. */
export class LatentStyleHandler implements Properties {
  private readonly m_aAttributes: PropertyValue[] = [];
  /** Original attribute switch always inserts a string Any, including numeric and boolean inputs. @param id - Native ID. @param value - Typed XML value. @returns Nothing. */
  attribute(id: Id, value: Value): void {
    let name: string;
    switch (id) {
      case N.LN_CT_LsdException_name:
        name = "name";
        break;
      case N.LN_CT_LsdException_locked:
        name = "locked";
        break;
      case N.LN_CT_LsdException_uiPriority:
        name = "uiPriority";
        break;
      case N.LN_CT_LsdException_semiHidden:
        name = "semiHidden";
        break;
      case N.LN_CT_LsdException_unhideWhenUsed:
        name = "unhideWhenUsed";
        break;
      case N.LN_CT_LsdException_qFormat:
        name = "qFormat";
        break;
      default:
        return;
    }
    const property = new PropertyValue(),
      key = OUString.createFromAscii(new TextEncoder().encode(name + "\0")),
      text = value.getString();
    try {
      property.Name = key;
      property.Value.insert([text.pData], "OUString");
      this.m_aAttributes.push(property);
    } finally {
      key.dispose();
      text.dispose();
    }
  }
  /** Original modifier callback is empty. @param value - Unused modifier. @returns Nothing. */
  sprm(value: Sprm): void {
    void value;
  }
  /** Borrows the original vector; native callers copy it into a sequence. @returns Stored generated values. */
  getAttributes(): readonly PropertyValue[] {
    return this.m_aAttributes;
  }
  /** Native vector member destruction. @returns Nothing. */
  dispose(): void {
    for (const property of this.m_aAttributes) {
      property.Name.dispose();
      property.Value.dispose();
    }
    this.m_aAttributes.length = 0;
  }
}
