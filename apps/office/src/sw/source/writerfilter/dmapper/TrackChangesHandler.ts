/** @fileoverview Original table row/cell TrackChangesHandler retains author/date strings, ignores markup ID and returns an actual three-property UNO sequence. */
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue,
} from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { PropertyState } from "../../../../udkapi/com/sun/star/beans/PropertyState";
import { cppu_detail_getUnoType_DateTime } from "../../../../offapi/com/sun/star/util/DateTime";
import { getTokenFromUtf8 } from "../../../../oox/source/token/tokenmap";
import { RedlineParams } from "./PropertyMap";
import { PropertyIds as P, getPropertyName } from "./PropertyIds";
import { ConvertDateStringToDateTime } from "./ConversionHelper";
import type { Id, Properties, Sprm, Value } from "../inc/dmapper/resourcemodel";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";

const PropertyValues = Sequence.specialize<PropertyValue>(cppu_detail_getUnoType_PropertyValue, 48);
/** Original generated XML constants bind to the unchanged native token owner. */
const XML_tableRowInsert = getTokenFromUtf8("tableRowInsert"),
  XML_tableRowDelete = getTokenFromUtf8("tableRowDelete"),
  XML_tableCellInsert = getTokenFromUtf8("tableCellInsert"),
  XML_tableCellDelete = getTokenFromUtf8("tableCellDelete");
/** Native attribute receiver; redline model creation remains owned by downstream table UNO import. */
export class TrackChangesHandler implements Properties {
  private readonly m_pRedlineParams = new RedlineParams();
  /** Original constructor assigns the previously uninitialized native token member. @param token - Native signed32 token. @returns Handler. */
  constructor(token: number) {
    this.m_pRedlineParams.m_nToken = token | 0;
  }
  /** Original getString projection precedes every attribute case, including ignored markup IDs. @param id - Resource ID. @param value - Actual resource value. @returns Nothing. */
  attribute(id: Id, value: Value): void {
    const text = value.getString();
    try {
      switch (id) {
        case N.LN_CT_TrackChange_author:
          this.m_pRedlineParams.m_sAuthor.assign(text);
          break;
        case N.LN_CT_TrackChange_date:
          this.m_pRedlineParams.m_sDate.assign(text);
          break;
        case N.LN_CT_Markup_id:
          break;
      }
    } finally {
      text.dispose();
    }
  }
  /** Original modifier callback is empty. @param value - Unused modifier. @returns Nothing. */
  sprm(value: Sprm): void {
    void value;
  }
  /** Original native token mask and property order retain empty type for an unknown token. @returns Owned sequence of actual generated values. */
  getRedlineProperties(): InstanceType<typeof PropertyValues> {
    const type = new OUString();
    switch (this.m_pRedlineParams.m_nToken & 0xffff) {
      case XML_tableRowInsert:
        type.assign(getPropertyName(P.PROP_TABLE_ROW_INSERT));
        break;
      case XML_tableRowDelete:
        type.assign(getPropertyName(P.PROP_TABLE_ROW_DELETE));
        break;
      case XML_tableCellInsert:
        type.assign(getPropertyName(P.PROP_TABLE_CELL_INSERT));
        break;
      case XML_tableCellDelete:
        type.assign(getPropertyName(P.PROP_TABLE_CELL_DELETE));
        break;
    }
    const dateText = this.m_pRedlineParams.m_sDate;
    const date = ConvertDateStringToDateTime(dateText.getStr().subarray(0, dateText.getLength()));
    const values = [
      new Any([type.pData], "OUString"),
      new Any([this.m_pRedlineParams.m_sAuthor.pData], "OUString"),
      new Any(date, cppu_detail_getUnoType_DateTime),
    ];
    const ids = [P.PROP_REDLINE_TYPE, P.PROP_REDLINE_AUTHOR, P.PROP_REDLINE_DATE_TIME];
    const properties = values.map(
      /** Original comphelper::makePropertyValue initializes handle0/DIRECT_VALUE. @param value - Typed Any. @param index - Native list position. @returns Generated value. */ (
        value,
        index,
      ) =>
        new PropertyValue(getPropertyName(ids[index] as P), 0, value, PropertyState.DIRECT_VALUE),
    );
    try {
      return new PropertyValues(
        {
          /** Borrows original initializer-list elements at native compound byte offsets. @param offset - Byte offset. @returns Property. */
          get: (offset) => properties[offset / 48],
        },
        3,
      );
    } finally {
      type.dispose();
      for (const value of values) value.dispose();
      for (const property of properties) {
        property.Name.dispose();
        property.Value.dispose();
      }
    }
  }
  /** Original RedlineParams member destruction. @returns Nothing. */
  dispose(): void {
    this.m_pRedlineParams.dispose();
  }
}
