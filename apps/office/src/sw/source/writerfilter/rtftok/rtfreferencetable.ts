/** @fileoverview Native ordered RTFReferenceTable ownership and table callback delivery from rtfreferencetable.cxx. */
import { SvRefBase } from "../../../../tools/inc/ref";
import {
  ReferencePointer,
  type Properties,
  type Reference,
  type Table,
} from "../inc/dmapper/resourcemodel";
/** Original ordered map retains actual property references and delivers them in signed key order. */
export class RTFReferenceTable extends SvRefBase implements Reference<Table> {
  private readonly m_aEntries: Map<number, ReferencePointer<Properties>>;
  /** Original map-by-value constructor retains every actual reference. @param entries - Source entries. @returns Native reference table. */
  constructor(entries: ReadonlyMap<number, ReferencePointer<Properties>>) {
    super();
    this.m_aEntries = new Map(
      [...entries]
        .sort(
          /** Original std::map signed key order. @param left - First entry. @param right - Second entry. @returns Ordering. */ (
            left,
            right,
          ) => left[0] - right[0],
        )
        .map(
          /** Copies original owning shared pointer. @param entry - Source map entry. @returns Retained entry. */ ([
            key,
            value,
          ]) => [key, new ReferencePointer(value)],
        ),
    );
  }
  /** Original callback addresses the retained reference without a projection. @param handler - Actual table receiver. @returns Nothing. */
  resolve(handler: Table): void {
    for (const [index, properties] of this.m_aEntries) handler.entry(index, properties);
  }
  /** Native map destructor releases all actual reference owners. @returns Nothing. */
  dispose(): void {
    for (const properties of this.m_aEntries.values()) properties.clear();
    this.m_aEntries.clear();
  }
  /** Original virtual reference destructor. @returns Nothing. */
  protected override destroy(): void {
    this.dispose();
  }
}
