/** @fileoverview Native Calc change tracking ownership for loaded cell content actions. */
import { ScBigRange } from "../../../inc/bigrange";
import { ScCellValue } from "../../../inc/cellvalue";
import type { ScDocument } from "../../../inc/document";
import { CellType } from "../../../inc/global";
import { DateTime } from "../../../../tools/source/datetime/datetime";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";

/** Original change action type order. */
export enum ScChangeActionType {
  SC_CAT_NONE,
  SC_CAT_INSERT_COLS,
  SC_CAT_INSERT_ROWS,
  SC_CAT_INSERT_TABS,
  SC_CAT_DELETE_COLS,
  SC_CAT_DELETE_ROWS,
  SC_CAT_DELETE_TABS,
  SC_CAT_MOVE,
  SC_CAT_CONTENT,
  SC_CAT_REJECT,
}

/** Native insertion action types. */
export type ScChangeActionInsertionType =
  | ScChangeActionType.SC_CAT_INSERT_COLS
  | ScChangeActionType.SC_CAT_INSERT_ROWS
  | ScChangeActionType.SC_CAT_INSERT_TABS;

/** The original change acceptance state order. */
export enum ScChangeActionState {
  SC_CAS_VIRGIN,
  SC_CAS_ACCEPTED,
  SC_CAS_REJECTED,
}

/** Native action identity and common XML change information. */
export interface ScChangeActionInfo {
  readonly actionNumber: number;
  readonly rejectingNumber: number;
  readonly state: ScChangeActionState;
  readonly range: ScBigRange;
  readonly user: string;
  readonly dateTimeUTC: DateTime;
  readonly comment: string;
}

/** Native loaded action shared by the represented tracked change families. */
export abstract class ScChangeAction<Type extends ScChangeActionType = ScChangeActionType> {
  private readonly info: ScChangeActionInfo;
  private readonly dependents: ScChangeAction[] = [];

  /** Copies the action position and UTC time. @param type - Original action type. @param info - Original action metadata. */
  public constructor(
    private readonly type: Type,
    info: ScChangeActionInfo,
  ) {
    this.info = {
      actionNumber: info.actionNumber,
      rejectingNumber: info.rejectingNumber,
      state: info.state,
      range: new ScBigRange(info.range),
      user: info.user,
      dateTimeUTC: new DateTime(info.dateTimeUTC),
      comment: info.comment,
    };
  }

  /** Reads the original action type. @returns Native action type. */
  public GetType(): Type {
    return this.type;
  }

  /** Reads the action number. @returns Native action identity. */
  public GetActionNumber(): number {
    return this.info.actionNumber;
  }

  /** Reads the original rejecting action number. @returns Action number or zero. */
  public GetRejectingNumber(): number {
    return this.info.rejectingNumber;
  }

  /** Reads the original acceptance state. @returns Current acceptance. */
  public GetState(): ScChangeActionState {
    return this.info.state;
  }

  /** Borrows the original signed-coordinate range. @returns Native range. */
  public GetBigRange(): ScBigRange {
    return this.info.range;
  }

  /** Reads the original author name. @returns User. */
  public GetUser(): string {
    return this.info.user;
  }

  /** Reads the original exact UTC change time. @returns Native timestamp. */
  public GetDateTimeUTC(): DateTime {
    return new DateTime(this.info.dateTimeUTC);
  }

  /** Reads the change comment. @returns Comment text. */
  public GetComment(): string {
    return this.info.comment;
  }

  /** Adds a dependent in the original link-list order. @param action - Resolved dependent action. */
  public AddDependent(action: ScChangeAction): void {
    this.dependents.unshift(action);
  }

  /** Borrows the ordered dependent actions. @returns Dependents. */
  public GetDependents(): readonly ScChangeAction[] {
    return this.dependents;
  }

  /** Releases the owned snapshot if the action has one. */
  public Dispose(): void {}
}

/** Original loaded row, column or sheet insertion with its whole-axis range. */
export class ScChangeActionIns extends ScChangeAction<ScChangeActionInsertionType> {
  /** Creates a loaded insertion action. @param type - Inserted axis. @param info - Action metadata and range. @param endOfList - Whether the insertion extends the list. */
  public constructor(
    type: ScChangeActionInsertionType,
    info: ScChangeActionInfo,
    private readonly endOfList = false,
  ) {
    super(type, info);
  }

  /** Reads the native end-of-list flag. @returns Insertion state. */
  public IsEndOfList(): boolean {
    return this.endOfList;
  }
}

/** One native content action holds the preceding cell and the reconstructed new cell. */
export class ScChangeActionContent extends ScChangeAction<ScChangeActionType.SC_CAT_CONTENT> {
  private readonly oldCell: ScCellValue;
  private readonly oldValue: string;
  private newCell = new ScCellValue();
  private previous: ScChangeActionContent | undefined;
  private next: ScChangeActionContent | undefined;

  /** Takes ownership of the loaded previous cell. @param info - Action metadata. @param oldCell - Detachable cell snapshot. @param document - Formatting owner. @param oldValue - Original numeric input text. */
  public constructor(
    info: ScChangeActionInfo,
    oldCell: ScCellValue,
    document: ScDocument,
    oldValue = "",
  ) {
    super(ScChangeActionType.SC_CAT_CONTENT, info);
    if (!oldValue && oldCell.getType() === CellType.CELLTYPE_VALUE) {
      const input = document.GetFormatTable().GetInputLineString(oldCell.getDouble(), 0);
      try {
        oldValue = text(input);
      } finally {
        input.dispose();
      }
    }
    this.oldValue = oldValue;
    this.oldCell = ScCellValue.move(oldCell);
    if (this.oldCell.getType() === CellType.CELLTYPE_FORMULA)
      this.oldCell.getFormula()?.SetInChangeTrack(true);
  }

  /** Borrows the original preceding cell. @returns Old cell. */
  public GetOldCell(): ScCellValue {
    return this.oldCell;
  }

  /** Borrows the reconstructed successor cell. @returns New cell. */
  public GetNewCell(): ScCellValue {
    return this.newCell;
  }

  /** Reads the original retained input string. @returns Cell input text. */
  public GetOldValue(): string {
    return this.oldValue;
  }

  /** Copies the cell value supplied by the next content action or current sheet. @param cell - Source snapshot. */
  public SetNewCell(cell: ScCellValue): void {
    const copy = new ScCellValue(cell);
    if (copy.getType() === CellType.CELLTYPE_FORMULA) copy.getFormula()?.SetInChangeTrack(true);
    this.newCell.clear();
    this.newCell = copy;
  }

  /** Borrows the preceding content action. @returns Previous link if present. */
  public GetPrevContent(): ScChangeActionContent | undefined {
    return this.previous;
  }

  /** Connects the preceding action in both directions. @param action - Resolved previous content. */
  public SetPrevContent(action: ScChangeActionContent): void {
    this.previous = action;
    action.next = this;
  }

  /** Tests whether the action currently owns the final cell state of its chain. @returns Whether top content. */
  public IsTopContent(): boolean {
    return this.next === undefined;
  }

  /** Releases native owned cell snapshots. */
  public override Dispose(): void {
    this.oldCell.clear();
    this.newCell.clear();
  }
}

/** Document-owned loaded Calc change track. */
export class ScChangeTrack {
  private readonly actions = new Map<number, ScChangeAction>();
  private last: ScChangeAction | undefined;
  private protection = new Uint8Array();
  private actionMax = 0;
  private lastSavedAction = 0;

  /** Binds the track to its actual workbook. @param document - Canonical owner. */
  public constructor(private readonly document: ScDocument) {}

  /** Reads the track's owner. @returns Workbook. */
  public GetDocument(): ScDocument {
    return this.document;
  }

  /** Appends a loaded action once, preserving stream order and ownership. @param action - Owned candidate. @returns Whether appended. */
  public AppendLoaded(action: ScChangeAction): boolean {
    const id = action.GetActionNumber();
    if (this.actions.has(id)) {
      action.Dispose();
      return false;
    }
    this.actions.set(id, action);
    this.last = action;
    return true;
  }

  /** Reads one indexed action. @param id - Original action number. @returns Action if loaded. */
  public GetAction(id: number): ScChangeAction | undefined {
    return this.actions.get(id);
  }

  /** Reads the last action in original document order. @returns Latest loaded action. */
  public GetLast(): ScChangeAction | undefined {
    return this.last;
  }

  /** Iterates original loaded action order. @returns Native actions. */
  public entries(): IterableIterator<ScChangeAction> {
    return this.actions.values();
  }

  /** Reads the highest saved action ID tracked by the workbook. @returns Action number. */
  public GetActionMax(): number {
    return this.actionMax;
  }

  /** Updates the native action-number ceiling. @param value - Original action number. */
  public SetActionMax(value: number): void {
    this.actionMax = value;
  }

  /** Reads the last action saved to the package. @returns Original action number. */
  public GetLastSavedActionNumber(): number {
    return this.lastSavedAction;
  }

  /** Records the last action adopted from the package. @param value - Original action number. */
  public SetLastSavedActionNumber(value: number): void {
    this.lastSavedAction = value;
  }

  /** Replaces the original track protection key. @param protection - Source bytes. */
  public SetProtection(protection: Uint8Array): void {
    this.protection = new Uint8Array(protection);
  }

  /** Copies the original track protection key bytes. @returns Stored key. */
  public GetProtection(): Uint8Array {
    return this.protection.slice();
  }

  /** Releases all tracked cell snapshots with the owner. */
  public Dispose(): void {
    for (const action of this.actions.values()) action.Dispose();
    this.actions.clear();
    this.last = undefined;
  }
}
