/** @fileoverview Original formula-group position accumulation and joined-range query ownership. */
import { SvtQueryBase } from "../../../../svl/source/notify/listener";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScRangeList } from "../../../inc/rangelst";
import {
  SC_LISTENER_QUERY_FORMULA_GROUP_POS,
  SC_LISTENER_QUERY_FORMULA_GROUP_RANGE,
} from "../../../inc/listenerqueryids";
/** Native query retains duplicates and filters only valid positions in its optional skip range. */
export class RefQueryFormulaGroup extends SvtQueryBase {
  private readonly maSkipRange = new ScRange(new ScAddress(ScAddress.INITIALIZE_INVALID));
  private readonly maTabs = new Map<number, Map<number, number[]>>();
  /** Original query ID and invalid default skip range. @returns Query. */
  constructor() {
    super(SC_LISTENER_QUERY_FORMULA_GROUP_POS);
  }
  /** Original copied skip range. @param range - Source range. @returns Nothing. */
  setSkipRange(range: ScRange): void {
    this.maSkipRange.assign(range);
  }
  /** Original valid position insertion. Native allocation/insertion failure is outside managed allocation. @param position - Actual position. @returns Nothing. */
  add(position: ScAddress): void {
    if (!position.IsValid()) return;
    if (this.maSkipRange.IsValid() && this.maSkipRange.Contains(position)) return;
    let columns = this.maTabs.get(position.Tab());
    if (!columns) {
      columns = new Map();
      this.maTabs.set(position.Tab(), columns);
    }
    let rows = columns.get(position.Col());
    if (!rows) {
      rows = [];
      columns.set(position.Col(), rows);
    }
    rows.push(position.Row());
  }
  /** Original borrowed accumulated positions. @returns Actual nested result containers. */
  getAllPositions(): ReadonlyMap<number, ReadonlyMap<number, readonly number[]>> {
    return this.maTabs;
  }
}
/** Native range query joins received ranges and swaps its actual result container. */
export class QueryRange extends SvtQueryBase {
  private readonly maRanges = new ScRangeList();
  /** Original range query ID. @returns Query. */
  constructor() {
    super(SC_LISTENER_QUERY_FORMULA_GROUP_RANGE);
  }
  /** Original Join delegates to real range-list ownership. @param range - Source range. @returns Nothing. */
  add(range: ScRange): void {
    this.maRanges.Join(range);
  }
  /** Original range-list swap. @param ranges - Receiving/replacing container. @returns Nothing. */
  swapRanges(ranges: ScRangeList): void {
    this.maRanges.swap(ranges);
  }
}
