/** @fileoverview Consumed original SettingsTable resource callbacks and mirror-margin field; unrelated document settings retain their own consumers. */
import type { DomainMapper } from "./DomainMapper";
import type { Id, Properties, Reference, Sprm, Table, Value } from "../inc/dmapper/resourcemodel";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
/** Original document-scoped settings table retains the source false mirror-margin default. */
export class SettingsTable implements Properties, Table {
  private m_bMirrorMargin = false;
  /** Original mapper constructor parameter; the consumed mirror flag has no mapper-dependent initialization. @param mapper - Actual mapper. @returns Owner. */
  constructor(mapper: DomainMapper) {
    void mapper;
  }
  /** Original table entry callback resolves the retained native properties. @param _position - Original table index. @param reference - Actual reference. @returns Nothing. */
  entry(_position: number, reference: Reference<Properties>): void {
    void _position;
    reference.resolve(this);
  }
  /** No original attributes are consumed by the mirror-margin family. @param id - Native attribute. @param value - Native value. @returns Nothing. */
  attribute(id: Id, value: Value): void {
    void id;
    void value;
  }
  /** Original boolean-from-integer settings modifier. @param modifier - Native sprm. @returns Nothing. */
  sprm(modifier: Sprm): void {
    if (modifier.getId() === N.LN_CT_Settings_mirrorMargins)
      this.m_bMirrorMargin = (modifier.getValue()?.getInt() ?? 0) !== 0;
  }
  /** Original settings query. @returns Mirror-margin flag. */
  GetMirrorMarginSettings(): boolean {
    return this.m_bMirrorMargin;
  }
}
