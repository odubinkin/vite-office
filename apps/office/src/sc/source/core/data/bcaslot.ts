/** @fileoverview Native ordinary/group area-slot ownership,logarithmic sheet geometry and segmented bulk/deferred erasure from bcaslot.cxx;inspection services remain unported and JS owns physical allocation. */
import { ScAddress, ScRange, BCA_BRDCST_ALWAYS, BCA_LISTEN_ALWAYS } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { ScHint, ScAreaChangedHint } from "../../../inc/brdcst";
import { UpdateRefMode } from "../../../inc/global";
import { ScRefUpdate, ScRefUpdateRes } from "../inc/refupdat";
import type { SfxHint } from "../../../../svl/inc/hint";
import { SfxHintId } from "../../../../svl/inc/hint";
import type { SvtListener } from "../../../../svl/source/notify/listener";
import { SvtBroadcaster } from "../../../../svl/source/notify/broadcast";
import { ColumnSpanSet } from "../../../inc/columnspanset";
import { BulkDataHint } from "../../../inc/bulkdatahint";
/** Original area identity and logical slot membership count;GC replaces native physical deletion. */
export class ScBroadcastArea {
  private pUpdateChainNext: ScBroadcastArea | null = null;
  private mbInUpdateChain = false;
  private readonly aBroadcaster = new SvtBroadcaster<SfxHint>();
  private readonly aRange: ScRange;
  private nRefCount = 0;
  private mbGroupListening = false;
  /** Original area group discriminator is part of native area identity. @returns Group mode. */
  IsGroupListening(): boolean {
    return this.mbGroupListening;
  }
  /** Original flag assignment before area insertion. @param group - Group mode. @returns Nothing. */
  SetGroupListening(group: boolean): void {
    this.mbGroupListening = group;
  }
  /** Copies the native area value. @param range - Area. @returns Area owner. */
  constructor(range: ScRange) {
    this.aRange = new ScRange(range);
  }
  /** Borrows the genuine reciprocal observer owner. @returns Broadcaster. */
  GetBroadcaster(): SvtBroadcaster<SfxHint> {
    return this.aBroadcaster;
  }
  /** Borrows the retained range. @returns Range. */
  GetRange(): ScRange {
    return this.aRange;
  }
  /** Adds logical membership in a native slot. @returns Nothing. */
  IncRef(): void {
    this.nRefCount++;
  }
  /** Removes native slot membership with original zero guard. @returns Remaining count. */
  DecRef(): number {
    return this.nRefCount ? --this.nRefCount : 0;
  }
  /** Reads logical membership,not a JS memory counter. @returns Count. */
  GetRef(): number {
    return this.nRefCount;
  }
  /** Original replacement of the area value after all slot removals. @param range - Updated area. @returns Nothing. */
  UpdateRange(range: ScRange): void {
    this.aRange.assign(range);
  }
  /** Reads original update-chain linkage. @returns Next area. */
  GetUpdateChainNext(): ScBroadcastArea | null {
    return this.pUpdateChainNext;
  }
  /** Sets original update-chain linkage. @param next - Next area. @returns Nothing. */
  SetUpdateChainNext(next: ScBroadcastArea | null): void {
    this.pUpdateChainNext = next;
  }
  /** Reads native chain membership. @returns Membership. */
  IsInUpdateChain(): boolean {
    return this.mbInUpdateChain;
  }
  /** Sets native chain membership. @param value - Membership. @returns Nothing. */
  SetInUpdateChain(value: boolean): void {
    this.mbInUpdateChain = value;
  }
}
/** Original unordered-set entry with deferred-erasure tag. */
interface ScBroadcastAreaEntry {
  mpArea: ScBroadcastArea;
  mbErasure: boolean;
}
/** Mutable native area pointer reference shared across traversed slots. */
type AreaReference = [ScBroadcastArea | null];
/** Native range/group area-value key;Map replaces hash storage only. @param range - Range. @param group - Group discriminator. @returns Value key. */
function areaKey(range: ScRange, group: boolean): string {
  return range.GetVars().join(",") + ":" + Number(group);
}
/** Native collection of area identities for one logarithmic sheet slot. */
export class ScBroadcastAreaSlot {
  private readonly aBroadcastAreaTbl = new Map<string, ScBroadcastAreaEntry>();
  private mbInBroadcastIteration = false;
  private mbHasErasedArea = false;
  /** Binds actual document and machine owners. @param rDoc - Document. @param pBASM - Machine. @returns Slot. */
  constructor(
    private readonly rDoc: ScDocument,
    private readonly pBASM: ScBroadcastAreaSlotMachine,
  ) {}
  /** Adds the first reciprocal listener or reuses an existing area;only the first slot creates identity. Native physical max_size exhaustion is outside managed allocation. @param range - Area. @param group - Group mode. @param listener - Actual listener. @param area - Shared pointer reference. @returns Newly created area. */
  StartListeningArea(
    range: ScRange,
    group: boolean,
    listener: SvtListener<SfxHint>,
    area: AreaReference,
  ): boolean {
    if (this.rDoc.GetHardRecalcState() === ScDocument.HardRecalcState.ETERNAL) return false;
    if (area[0]) {
      this.InsertListeningArea(area[0]);
      return false;
    }
    const key = areaKey(range, group),
      found = this.aBroadcastAreaTbl.get(key);
    let created = false;
    if (found) area[0] = found.mpArea;
    else {
      const owner = new ScBroadcastArea(range);
      owner.SetGroupListening(group);
      this.aBroadcastAreaTbl.set(key, { mpArea: owner, mbErasure: false });
      owner.IncRef();
      area[0] = owner;
      created = true;
    }
    listener.StartListening(area[0].GetBroadcaster());
    return created;
  }
  /** Inserts an already shared native area into a subsequent slot. @param area - Actual area. @returns Nothing. */
  InsertListeningArea(area: ScBroadcastArea): void {
    if (this.rDoc.GetHardRecalcState() === ScDocument.HardRecalcState.ETERNAL) return;
    const key = areaKey(area.GetRange(), area.IsGroupListening());
    if (!this.aBroadcastAreaTbl.has(key)) {
      this.aBroadcastAreaTbl.set(key, { mpArea: area, mbErasure: false });
      area.IncRef();
    }
  }
  /** Ends one actual listener,then removes unused shared membership across subsequent slots. @param range - Area. @param group - Group flag. @param listener - Listener. @param area - Native pointer reference. @returns Nothing. */
  EndListeningArea(
    range: ScRange,
    group: boolean,
    listener: SvtListener<SfxHint>,
    area: AreaReference,
  ): void {
    const entry = this.aBroadcastAreaTbl.get(areaKey(range, group));
    if (!area[0]) {
      if (!entry || entry.mbErasure) return;
      area[0] = entry.mpArea;
      listener.EndListening(area[0].GetBroadcaster());
      if (!area[0].GetBroadcaster().HasListeners()) {
        if (area[0].GetRef() === 1) area[0] = null;
        this.EraseArea(entry);
      }
    } else if (!area[0].GetBroadcaster().HasListeners()) {
      if (!entry || entry.mbErasure) return;
      if (area[0].GetRef() === 1) area[0] = null;
      this.EraseArea(entry);
    }
  }
  /** Native mark-during-iteration versus erase-after-iteration branch. @param entry - Actual slot entry. @returns Nothing. */
  EraseArea(entry: ScBroadcastAreaEntry): void {
    if (this.mbInBroadcastIteration) {
      entry.mbErasure = true;
      this.mbHasErasedArea = true;
      this.pBASM.PushAreaToBeErased(this, entry);
    } else {
      this.aBroadcastAreaTbl.delete(
        areaKey(entry.mpArea.GetRange(), entry.mpArea.IsGroupListening()),
      );
      if (!entry.mpArea.DecRef()) {
        if (this.pBASM.IsInBulkBroadcast()) this.pBASM.RemoveBulkGroupArea(entry.mpArea);
        entry.mpArea.GetBroadcaster().Dispose();
      }
    }
  }
  /** Reports the native reentrant iteration flag. @returns Flag. */
  IsInBroadcastIteration(): boolean {
    return this.mbInBroadcastIteration;
  }
  /** Broadcasts actual source range intersections,with native per-cell hints for the range overload. @param input - Hint or range. @param id - Range hint ID. @returns Whether delivered. */
  AreaBroadcast(input: ScHint | ScRange, id?: SfxHintId): boolean {
    if (!this.aBroadcastAreaTbl.size) return false;
    const previous = this.mbInBroadcastIteration;
    this.mbInBroadcastIteration = true;
    this.mbHasErasedArea = false;
    const range = input instanceof ScHint ? input.GetRange() : input;
    let delivered = false;
    for (const entry of this.aBroadcastAreaTbl.values()) {
      if (this.mbHasErasedArea && entry.mbErasure) continue;
      const area = entry.mpArea;
      if (!area.GetRange().Intersects(range)) continue;
      if (area.IsGroupListening()) {
        if (this.pBASM.IsInBulkBroadcast()) {
          this.pBASM.InsertBulkGroupArea(
            area,
            input instanceof ScHint ? range : area.GetRange().Intersection(range),
          );
          continue;
        }
      } else if (this.pBASM.IsInBulkBroadcast() && !this.pBASM.InsertBulkArea(area)) continue;
      if (input instanceof ScHint) area.GetBroadcaster().Broadcast(input);
      else {
        const intersection = area.GetRange().Intersection(range),
          hint = new ScHint(id as SfxHintId, new ScAddress());
        for (let tab = intersection.aStart.Tab(); tab <= intersection.aEnd.Tab(); tab++) {
          hint.SetAddressTab(tab);
          for (let col = intersection.aStart.Col(); col <= intersection.aEnd.Col(); col++) {
            hint.SetAddressCol(col);
            for (let row = intersection.aStart.Row(); row <= intersection.aEnd.Row(); row++) {
              hint.SetAddressRow(row);
              area.GetBroadcaster().Broadcast(hint);
            }
          }
        }
      }
      delivered = true;
    }
    this.mbInBroadcastIteration = previous;
    this.pBASM.FinallyEraseAreas(this);
    return delivered;
  }
  /** Original contained-area deletion,erasing before observable destruction. @param range - Deleted region. @returns Nothing. */
  DelBroadcastAreasInRange(range: ScRange): void {
    for (const [key, entry] of this.aBroadcastAreaTbl) {
      const area = entry.mpArea;
      if (!range.Contains(area.GetRange())) continue;
      this.aBroadcastAreaTbl.delete(key);
      if (!area.DecRef()) {
        if (this.pBASM.IsInBulkBroadcast()) this.pBASM.RemoveBulkArea(area);
        area.GetBroadcaster().Dispose();
      }
    }
  }
  /** Original remove-and-chain phase;range values remain unchanged until all old slots are detached. @param mode - Reference mode. @param range - Update region. @param dx - Column shift. @param dy - Row shift. @param dz - Sheet shift. @returns Nothing. */
  UpdateRemove(mode: UpdateRefMode, range: ScRange, dx: number, dy: number, dz: number): void {
    for (const [key, entry] of this.aBroadcastAreaTbl) {
      const area = entry.mpArea;
      if (area.IsInUpdateChain()) {
        this.aBroadcastAreaTbl.delete(key);
        area.DecRef();
      } else {
        const [result] = ScRefUpdate.Update(
          this.rDoc,
          mode,
          ...range.GetVars(),
          dx,
          dy,
          dz,
          ...area.GetRange().GetVars(),
        );
        if (result !== ScRefUpdateRes.UR_NOTHING) {
          this.aBroadcastAreaTbl.delete(key);
          area.DecRef();
          if (this.pBASM.IsInBulkBroadcast()) this.pBASM.RemoveBulkArea(area);
          area.SetInUpdateChain(true);
          const previous = this.pBASM.GetEOUpdateChain();
          if (previous) previous.SetUpdateChainNext(area);
          else this.pBASM.SetUpdateChain(area);
          this.pBASM.SetEOUpdateChain(area);
        }
      }
    }
  }
  /** Original matching-area removal from remaining slots before a hash-key change. @param area - Actual identity. @returns Nothing. */
  UpdateRemoveArea(area: ScBroadcastArea): void {
    const key = areaKey(area.GetRange(), area.IsGroupListening()),
      entry = this.aBroadcastAreaTbl.get(key);
    if (!entry) return;
    if (entry.mpArea === area) {
      this.aBroadcastAreaTbl.delete(key);
      area.DecRef();
    }
  }
  /** Original reinsertion merges actual reciprocal listeners when another area now has the same key. @param area - Updated area. @returns Nothing. */
  UpdateInsert(area: ScBroadcastArea): void {
    const key = areaKey(area.GetRange(), area.IsGroupListening()),
      entry = this.aBroadcastAreaTbl.get(key);
    if (!entry) {
      this.aBroadcastAreaTbl.set(key, { mpArea: area, mbErasure: false });
      area.IncRef();
    } else if (entry.mpArea !== area)
      for (const listener of area.GetBroadcaster().GetAllListeners())
        listener.StartListening(entry.mpArea.GetBroadcaster());
  }
  /** Releases native slot membership and reciprocal observers at owner destruction. @returns Nothing. */
  Dispose(): void {
    for (const entry of this.aBroadcastAreaTbl.values())
      if (!entry.mpArea.DecRef()) entry.mpArea.GetBroadcaster().Dispose();
    this.aBroadcastAreaTbl.clear();
  }
}
/** Original row/column distribution descriptor. */
interface ScSlotData {
  nStartRow: number;
  nStopRow: number;
  nSliceRow: number;
  nCumulatedRow: number;
  nStartCol: number;
  nStopCol: number;
  nSliceCol: number;
  nCumulatedCol: number;
}
/** Actual sheet slot array;undefined represents original initialized null pointers. */
class TableSlots {
  readonly slots: (ScBroadcastAreaSlot | undefined)[];
  /** Allocates the logical native slot domain. @param count - Slot count. @returns Table slots. */
  constructor(count: number) {
    this.slots = new Array(count);
  }
  /** Destructs slots in native reverse order. @returns Nothing. */
  Dispose(): void {
    for (let i = this.slots.length - 1; i >= 0; i--) this.slots[i]?.Dispose();
    this.slots.length = 0;
  }
}
/** Original per-document slot machine for ordinary and grouped area broadcasts,segmented bulk changes and reference updates. */
export class ScBroadcastAreaSlotMachine {
  private readonly maSlotDistribution: ScSlotData[] = [];
  private mnBcaSlotsCol = 0;
  private mnBcaSlots = 0;
  private readonly aTableSlotsMap = new Map<number, TableSlots>();
  private readonly aBulkBroadcastAreas = new Set<ScBroadcastArea>();
  private readonly m_BulkGroupAreas = new Map<ScBroadcastArea, ColumnSpanSet>();
  private maAreasToBeErased: [ScBroadcastAreaSlot, ScBroadcastAreaEntry][] = [];
  private pUpdateChain: ScBroadcastArea | null = null;
  private pEOUpdateChain: ScBroadcastArea | null = null;
  private pBCAlways: SvtBroadcaster<SfxHint> | null = null;
  private nInBulkBroadcast = 0;
  /** Builds the exact native logarithmic slot distribution. @param rDoc - Actual document. @returns Machine. */
  constructor(private readonly rDoc: ScDocument) {
    for (
      let col1 = 0, col2 = 1024, sliceCol = 16;
      col2 <= rDoc.GetMaxColCount();
      col1 = col2, col2 *= 2, sliceCol *= 2
    ) {
      let slotsCol = 0;
      const startCol = this.mnBcaSlots;
      for (
        let row1 = 0, row2 = 32 * 1024, sliceRow = 128;
        row2 <= rDoc.GetMaxRowCount();
        row1 = row2, row2 *= 2, sliceRow *= 2
      ) {
        this.maSlotDistribution.push({
          nStartRow: row1,
          nStopRow: row2,
          nSliceRow: sliceRow,
          nCumulatedRow: slotsCol,
          nStartCol: col1,
          nStopCol: col2,
          nSliceCol: sliceCol,
          nCumulatedCol: startCol,
        });
        slotsCol += (row2 - row1) / sliceRow;
      }
      if (col1 === 0) this.mnBcaSlotsCol = slotsCol;
      this.mnBcaSlots += ((col2 - col1) / sliceCol) * slotsCol;
    }
  }
  /** Original cell-to-slot mapping with invalid-coordinate fallback. @param address - Address. @returns Slot offset. */
  private ComputeSlotOffset(address: ScAddress): number {
    const row = address.Row(),
      col = address.Col();
    if (!this.rDoc.ValidRow(row) || !this.rDoc.ValidCol(col)) return 0;
    // The consumed immutable document capacities are fully covered by the native constructor distribution.
    const data = this.maSlotDistribution.find(
      /** Selects the original first descriptor containing the valid coordinate. @param item - Native descriptor. @returns Membership. */
      (item) => row < item.nStopRow && col < item.nStopCol,
    ) as ScSlotData;
    return (
      data.nCumulatedRow +
      Math.floor((row - data.nStartRow) / data.nSliceRow) +
      data.nCumulatedCol +
      Math.floor((col - data.nStartCol) / data.nSliceCol) * this.mnBcaSlotsCol
    );
  }
  /** Original ComputeAreaPoints/ComputeNextSlot traversal;the optimized full-sheet ending bound is retained. @param range - Rectangle. @param optimized - Native end-listening full-sheet branch. @returns Slot offsets. */
  private *Offsets(range: ScRange, optimized = false): Generator<number> {
    const start = this.ComputeSlotOffset(range.aStart),
      end = this.ComputeSlotOffset(range.aEnd);
    if (optimized && start === 0 && end === this.mnBcaSlots - 1) {
      for (let off = 0; off < end; off++) yield off;
      return;
    }
    const rowBreak =
      this.ComputeSlotOffset(new ScAddress(range.aStart.Col(), range.aEnd.Row(), 0)) - start;
    for (let column = start; column <= end; column += this.mnBcaSlotsCol)
      for (let off = column; off <= column + rowBreak && off <= end; off++) yield off;
  }
  /** Native sorted sheet-map iteration within a range. @param range - Sheet range. @returns Table slots. */
  private *Tables(range: ScRange): Generator<TableSlots> {
    const tabs = Array.from(this.aTableSlotsMap.keys()).sort(
      /** Preserves native map sheet ordering. @param a - Sheet. @param b - Sheet. @returns Order. */ (
        a,
        b,
      ) => a - b,
    );
    for (const tab of tabs)
      if (tab >= range.aStart.Tab() && tab <= range.aEnd.Tab())
        yield this.aTableSlotsMap.get(tab) as TableSlots;
  }
  /** Starts native shared area identity in the first slot and inserts it into subsequent slots/sheets. @param range - Area. @param group - Group mode. @param listener - Listener. @returns Nothing. */
  StartListeningArea(range: ScRange, group: boolean, listener: SvtListener<SfxHint>): void {
    if (range.equals(BCA_LISTEN_ALWAYS())) {
      this.pBCAlways ??= new SvtBroadcaster<SfxHint>();
      listener.StartListening(this.pBCAlways);
      return;
    }
    const area: AreaReference = [null];
    for (let tab = range.aStart.Tab(); tab <= range.aEnd.Tab(); tab++) {
      let table = this.aTableSlotsMap.get(tab);
      if (!table) {
        table = new TableSlots(this.mnBcaSlots);
        this.aTableSlotsMap.set(tab, table);
      }
      for (const offset of this.Offsets(range)) {
        const slot = (table.slots[offset] ??= new ScBroadcastAreaSlot(this.rDoc, this));
        if (area[0]) slot.InsertListeningArea(area[0]);
        else if (!slot.StartListeningArea(range, group, listener, area)) return;
      }
    }
  }
  /** Ends native shared subscriptions symmetrically across existing sheets. @param range - Area. @param group - Group mode. @param listener - Listener. @returns Nothing. */
  EndListeningArea(range: ScRange, group: boolean, listener: SvtListener<SfxHint>): void {
    if (range.equals(BCA_LISTEN_ALWAYS())) {
      if (this.pBCAlways) {
        listener.EndListening(this.pBCAlways);
        if (!this.pBCAlways.HasListeners()) {
          this.pBCAlways.Dispose();
          this.pBCAlways = null;
        }
      }
      return;
    }
    for (const table of this.Tables(range)) {
      const area: AreaReference = [null];
      for (const offset of this.Offsets(range, true))
        table.slots[offset]?.EndListeningArea(range, group, listener, area);
    }
  }
  /** Dispatches native hint spans or actual rectangular cell hints through matching slots. @param input - Hint or rectangle. @param id - Range hint ID. @returns Whether delivered. */
  AreaBroadcast(input: ScHint | ScRange, id?: SfxHintId): boolean {
    if (input instanceof ScHint && input.GetStartAddress().equals(BCA_BRDCST_ALWAYS())) {
      if (!this.pBCAlways) return false;
      this.pBCAlways.Broadcast(input);
      return true;
    }
    const range = input instanceof ScHint ? input.GetRange() : input;
    let delivered = false;
    for (const table of this.Tables(range))
      for (const offset of this.Offsets(range)) {
        const slot = table.slots[offset];
        if (slot) delivered = slot.AreaBroadcast(input, id) || delivered;
      }
    return delivered;
  }
  /** Original area deletion traversal,retaining the optimized full-sheet ending bound. @param range - Removed region. @returns Nothing. */
  DelBroadcastAreasInRange(range: ScRange): void {
    for (const table of this.Tables(range))
      for (const offset of this.Offsets(range, true))
        table.slots[offset]?.DelBroadcastAreasInRange(range);
  }
  /** Sets the original update-chain head. @param area - Head. @returns Nothing. */
  SetUpdateChain(area: ScBroadcastArea | null): void {
    this.pUpdateChain = area;
  }
  /** Borrows the original update-chain tail. @returns Tail. */
  GetEOUpdateChain(): ScBroadcastArea | null {
    return this.pEOUpdateChain;
  }
  /** Sets the original update-chain tail. @param area - Tail. @returns Nothing. */
  SetEOUpdateChain(area: ScBroadcastArea | null): void {
    this.pEOUpdateChain = area;
  }
  /** Original reference update:remove,chain,detach remaining slots,shift tables,update ranges,reinsert and unchain. @param mode - Update mode. @param range - Update region. @param dx - Column shift. @param dy - Row shift. @param dz - Sheet shift. @returns Nothing. */
  UpdateBroadcastAreas(
    mode: UpdateRefMode,
    range: ScRange,
    dx: number,
    dy: number,
    dz: number,
  ): void {
    for (const table of this.Tables(range))
      for (const offset of this.Offsets(range, true))
        table.slots[offset]?.UpdateRemove(mode, range, dx, dy, dz);
    for (let area = this.pUpdateChain; area; area = area.GetUpdateChainNext()) {
      const old = area.GetRange();
      for (let tab = old.aStart.Tab(); tab <= old.aEnd.Tab() && area.GetRef(); tab++) {
        // Initialized ordinary areas retain their table while this non-callback phase detaches slots.
        // The native OSL_FAIL branch diagnoses an inconsistent owner graph outside this consumed contract.
        const table = this.aTableSlotsMap.get(tab) as TableSlots;
        for (const offset of this.Offsets(old)) table.slots[offset]?.UpdateRemoveArea(area);
      }
    }
    if (dz) {
      const tabs = Array.from(this.aTableSlotsMap.keys()).sort(
        /** Original map sheet ordering. @param a - Sheet. @param b - Sheet. @returns Order. */ (
          a,
          b,
        ) => a - b,
      );
      if (dz < 0) {
        for (const tab of tabs)
          if (tab >= range.aStart.Tab() && tab < range.aStart.Tab() - dz) {
            (this.aTableSlotsMap.get(tab) as TableSlots).Dispose();
            this.aTableSlotsMap.delete(tab);
          }
        for (const tab of tabs)
          if (tab >= range.aStart.Tab() - dz) {
            const table = this.aTableSlotsMap.get(tab) as TableSlots;
            this.aTableSlotsMap.set(tab + dz, table);
            this.aTableSlotsMap.delete(tab);
          }
      } else {
        for (let i = tabs.length - 1; i >= 0; i--) {
          const tab = tabs[i] as number;
          if (tab < range.aStart.Tab()) break;
          const table = this.aTableSlotsMap.get(tab) as TableSlots;
          this.aTableSlotsMap.set(tab + dz, table);
          this.aTableSlotsMap.delete(tab);
        }
      }
    }
    while (this.pUpdateChain) {
      const area: ScBroadcastArea = this.pUpdateChain;
      this.pUpdateChain = area.GetUpdateChainNext();
      const old = area.GetRange(),
        [result, ...coordinates] = ScRefUpdate.Update(
          this.rDoc,
          mode,
          ...range.GetVars(),
          dx,
          dy,
          dz,
          ...old.GetVars(),
        );
      if (result !== ScRefUpdateRes.UR_NOTHING) {
        area.UpdateRange(new ScRange(...coordinates));
        area.GetBroadcaster().Broadcast(new ScAreaChangedHint(area.GetRange()));
      }
      const updated = area.GetRange();
      for (let tab = updated.aStart.Tab(); tab <= updated.aEnd.Tab(); tab++) {
        let table = this.aTableSlotsMap.get(tab);
        if (!table) {
          table = new TableSlots(this.mnBcaSlots);
          this.aTableSlotsMap.set(tab, table);
        }
        for (const offset of this.Offsets(updated)) {
          const slot = (table.slots[offset] ??= new ScBroadcastAreaSlot(this.rDoc, this));
          slot.UpdateInsert(area);
        }
      }
      area.SetUpdateChainNext(null);
      area.SetInUpdateChain(false);
      if (!area.GetRef()) area.GetBroadcaster().Dispose();
    }
    this.pEOUpdateChain = null;
  }
  /** Original nesting counter. @returns Nothing. */
  EnterBulkBroadcast(): void {
    this.nInBulkBroadcast++;
  }
  /** Clears ordinary area deduplication and completes pending native tracking at outermost leave. @param id - Hint ID. @returns Nothing. */
  LeaveBulkBroadcast(id: SfxHintId): void {
    if (this.nInBulkBroadcast <= 0) return;
    if (--this.nInBulkBroadcast === 0) {
      this.aBulkBroadcastAreas.clear();
      const broadcasted = this.BulkBroadcastGroupAreas();
      if (this.rDoc.IsTrackFormulasPending()) this.rDoc.FinalTrackFormulas(id);
      else if (broadcasted) this.rDoc.TrackFormulas(id);
    }
  }
  /** Reads actual bulk nesting. @returns Bulk mode. */
  IsInBulkBroadcast(): boolean {
    return this.nInBulkBroadcast > 0;
  }
  /** Inserts exact native area identity once per bulk operation. @param area - Area. @returns First insertion. */
  InsertBulkArea(area: ScBroadcastArea): boolean {
    if (this.aBulkBroadcastAreas.has(area)) return false;
    this.aBulkBroadcastAreas.add(area);
    return true;
  }
  /** Removes native bulk membership for area removal services. @param area - Area. @returns Removed count. */
  RemoveBulkArea(area: ScBroadcastArea): number {
    return Number(this.aBulkBroadcastAreas.delete(area));
  }
  /** Original per-area bulk spans retain actual inclusive changed ranges instead of flattening notifications. @param area - Actual area identity. @param range - Changed range. @returns Nothing. */
  InsertBulkGroupArea(area: ScBroadcastArea, range: ScRange): void {
    let spans = this.m_BulkGroupAreas.get(area);
    if (!spans) {
      spans = new ColumnSpanSet();
      this.m_BulkGroupAreas.set(area, spans);
    }
    spans.set(this.rDoc, range, true);
  }
  /** Original sorted pointer-key bulk dispatch;existing allocation identity binds native pointer order under GC. @returns Whether a live broadcaster was notified. */
  BulkBroadcastGroupAreas(): boolean {
    if (!this.m_BulkGroupAreas.size) return false;
    const hint = new BulkDataHint(this.rDoc);
    let broadcasted = false;
    const entries = Array.from(this.m_BulkGroupAreas).sort(
      /** Native pointer ordering uses existing identity rather than a memory manager. @param left - First entry. @param right - Second entry. @returns Order. */ (
        left,
        right,
      ) =>
        left[0].GetBroadcaster().allocationIdentity - right[0].GetBroadcaster().allocationIdentity,
    );
    for (const [area, spans] of entries) {
      const broadcaster = area.GetBroadcaster();
      if (broadcaster.HasListeners()) {
        hint.setSpans(spans);
        broadcaster.Broadcast(hint);
        broadcasted = true;
      }
    }
    this.m_BulkGroupAreas.clear();
    return broadcasted;
  }
  /** Original area erasure removes pending grouped spans at the native erase point. @param area - Actual area. @returns Nothing. */
  RemoveBulkGroupArea(area: ScBroadcastArea): void {
    this.m_BulkGroupAreas.delete(area);
  }
  /** Defers original set-entry erasure while a slot is iterating. @param slot - Slot. @param entry - Entry. @returns Nothing. */
  PushAreaToBeErased(slot: ScBroadcastAreaSlot, entry: ScBroadcastAreaEntry): void {
    this.maAreasToBeErased.push([slot, entry]);
  }
  /** Preserves pending erasures for other reentrant slots and erases this slot after iteration. @param slot - Slot. @returns Nothing. */
  FinallyEraseAreas(slot: ScBroadcastAreaSlot): void {
    if (slot.IsInBroadcastIteration()) return;
    const retained: typeof this.maAreasToBeErased = [];
    for (const pending of this.maAreasToBeErased) {
      if (pending[0] === slot) slot.EraseArea(pending[1]);
      else retained.push(pending);
    }
    this.maAreasToBeErased = retained;
  }
  /** Ends actual observable lifetime;physical allocations are reclaimed by GC. @returns Nothing. */
  Dispose(): void {
    for (const table of this.aTableSlotsMap.values()) table.Dispose();
    this.aTableSlotsMap.clear();
    this.pBCAlways?.Dispose();
    this.pBCAlways = null;
  }
}
/** Native scoped bulk notification owner,with explicit destructor for the JS caller's finally block. */
export class ScBulkBroadcast {
  /** Enters the optional document machine. @param pBASM - Native machine. @param mnHintId - Hint ID. @returns Scope. */
  constructor(
    private readonly pBASM: ScBroadcastAreaSlotMachine | null,
    private readonly mnHintId: SfxHintId,
  ) {
    pBASM?.EnterBulkBroadcast();
  }
  /** Original scoped destructor. @returns Nothing. */
  Dispose(): void {
    this.pBASM?.LeaveBulkBroadcast(this.mnHintId);
  }
}
