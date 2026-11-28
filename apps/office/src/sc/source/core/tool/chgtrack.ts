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

/** Native deletion action types. */
export type ScChangeActionDeletionType =
  | ScChangeActionType.SC_CAT_DELETE_COLS
  | ScChangeActionType.SC_CAT_DELETE_ROWS
  | ScChangeActionType.SC_CAT_DELETE_TABS;

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
  private nextAction: ScChangeAction | undefined;
  private readonly deleted: ScChangeAction[] = [];
  private readonly deletedIn: ScChangeAction[] = [];

  /** Copies the action position and UTC time. @param type - Original action type. @param info - Original action metadata. @returns The initialized ScChangeAction instance. */
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

  /** Adds a dependent in the original link-list order. @param action - Resolved dependent action. @returns Nothing. */
  public AddDependent(action: ScChangeAction): void {
    this.dependents.unshift(action);
  }

  /** Borrows the ordered dependent actions. @returns Dependents. */
  public GetDependents(): readonly ScChangeAction[] {
    return this.dependents;
  }

  /** Reads the original following action in load order. @returns Following action. */
  public GetNext(): ScChangeAction | undefined {
    return this.nextAction;
  }

  /** Updates the following action on append. @param action - Following action. @returns Nothing. */
  public SetNext(action: ScChangeAction): void {
    this.nextAction = action;
  }

  /** Links one deleted action in both directions. @param action - Deleted action from the track. @returns Nothing. */
  public SetDeletedInThis(action: ScChangeAction): void {
    const deleted = action instanceof ScChangeActionContent ? action.GetTopContent() : action;
    deleted.deletedIn.unshift(this);
    this.deleted.unshift(deleted);
  }

  /** Borrows the original ordered actions owned by this deletion relationship. @returns Deleted actions. */
  public GetDeleted(): readonly ScChangeAction[] {
    return this.deleted;
  }

  /** Borrows the original deletion records that own this action. @returns Deleting actions. */
  public GetDeletedIn(): readonly ScChangeAction[] {
    return this.deletedIn;
  }

  /** Checks whether any original deletion record owns this action. @returns Deletion flag. */
  public IsDeletedIn(): boolean {
    return this.GetDeletedIn().length !== 0;
  }

  /** Releases relationships when the originating track is disposed. @returns Nothing. */
  public Dispose(): void {
    this.nextAction = undefined;
    this.dependents.length = 0;
    this.deleted.length = 0;
    this.deletedIn.length = 0;
  }
}

/** Original loaded row, column or sheet insertion with its whole-axis range. */
export class ScChangeActionIns extends ScChangeAction<ScChangeActionInsertionType> {
  /** Creates a loaded insertion action. @param type - Inserted axis. @param info - Action metadata and range. @param endOfList - Whether the insertion extends the list. @returns The initialized ScChangeActionIns instance. */
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

/** One original loaded movement action holds the source in addition to the target range. */
export class ScChangeActionMove extends ScChangeAction<ScChangeActionType.SC_CAT_MOVE> {
  private readonly from: ScBigRange;

  /** Stores the two independent ranges of a movement. @param info - Target range and metadata. @param from - Source range. @returns The initialized ScChangeActionMove instance. */
  public constructor(info: ScChangeActionInfo, from: ScBigRange) {
    super(ScChangeActionType.SC_CAT_MOVE, info);
    this.from = new ScBigRange(from);
  }

  /** Borrows the original moved source range. @returns Source range. */
  public GetFromRange(): ScBigRange {
    return this.from;
  }
}

/** Original loaded deletion of a row, column or sheet and its typed cutoff links. */
export class ScChangeActionDel extends ScChangeAction<ScChangeActionDeletionType> {
  private insertCutOff: { action: ScChangeActionIns; count: number } | undefined;
  private readonly moveCutOffs: { action: ScChangeActionMove; from: number; to: number }[] = [];

  /** Retains the axis-specific member of an original multi-deletion. @param type - Deleted axis. @param info - Original action data. @param offset - Multi-deletion slave offset. @returns The initialized ScChangeActionDel instance. */
  public constructor(
    type: ScChangeActionDeletionType,
    info: ScChangeActionInfo,
    private readonly offset: number,
  ) {
    super(type, info);
  }

  /** Reads the original column displacement. @returns Column offset. */
  public GetDx(): number {
    return this.GetType() === ScChangeActionType.SC_CAT_DELETE_COLS ? this.offset : 0;
  }

  /** Reads the original row displacement. @returns Row offset. */
  public GetDy(): number {
    return this.GetType() === ScChangeActionType.SC_CAT_DELETE_ROWS ? this.offset : 0;
  }

  /** Sets the original insertion cutoff after resolving its action. @param action - Referenced insertion. @param count - Signed-short displacement. @returns Nothing. */
  public SetCutOffInsert(action: ScChangeActionIns, count: number): void {
    this.insertCutOff = { action, count };
  }

  /** Borrows the original insertion cutoff. @returns Insertion cutoff if present. */
  public GetCutOffInsert(): Readonly<{ action: ScChangeActionIns; count: number }> | undefined {
    return this.insertCutOff;
  }

  /** Inserts the original movement cutoff at the head of its list. @param action - Referenced movement. @param from - First displacement. @param to - Last displacement. @returns Nothing. */
  public AddCutOffMove(action: ScChangeActionMove, from: number, to: number): void {
    this.moveCutOffs.unshift({ action, from, to });
  }

  /** Borrows the original movement cutoffs in order. @returns Movement cutoffs. */
  public GetMoveCutOffs(): readonly Readonly<{
    action: ScChangeActionMove;
    from: number;
    to: number;
  }>[] {
    return this.moveCutOffs;
  }

  /** Releases inherited relationships and typed cutoff links. @returns Nothing. */
  public override Dispose(): void {
    super.Dispose();
    this.insertCutOff = undefined;
    this.moveCutOffs.length = 0;
  }
}

/** One native content action holds the preceding cell and the reconstructed new cell. */
export class ScChangeActionContent extends ScChangeAction<ScChangeActionType.SC_CAT_CONTENT> {
  private readonly oldCell: ScCellValue;
  private readonly oldValue: string;
  private newCell = new ScCellValue();
  private newValue = "";
  private previous: ScChangeActionContent | undefined;
  private next: ScChangeActionContent | undefined;

  /** Takes ownership of the loaded previous cell. @param info - Action metadata. @param oldCell - Detachable cell snapshot. @param document - Formatting owner. @param oldValue - Original numeric input text. @returns The initialized ScChangeActionContent instance. */
  public constructor(
    info: ScChangeActionInfo,
    oldCell: ScCellValue,
    private readonly document: ScDocument,
    oldValue = "",
  ) {
    super(ScChangeActionType.SC_CAT_CONTENT, info);
    this.oldValue = oldValue || this.GetInputString(oldCell, 0);
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

  /** Reads the original input spelling for the newer value. @returns Cell input text. */
  public GetNewValue(): string {
    return this.newValue;
  }

  /** Copies the cell value supplied by another action or current sheet. @param cell - Source snapshot. @param input - Optional original spelling. @param format - Original document number format. @returns Nothing. */
  public SetNewCell(cell: ScCellValue, input = "", format = 0): void {
    const value = input || this.GetInputString(cell, format);
    const copy = new ScCellValue(cell);
    if (copy.getType() === CellType.CELLTYPE_FORMULA) copy.getFormula()?.SetInChangeTrack(true);
    this.newCell.clear();
    this.newCell = copy;
    this.newValue = value;
  }

  /** Borrows the preceding content action. @returns Previous link if present. */
  public GetPrevContent(): ScChangeActionContent | undefined {
    return this.previous;
  }

  /** Connects the preceding action in both directions. @param action - Resolved previous content. @returns Nothing. */
  public SetPrevContent(action: ScChangeActionContent): void {
    this.previous = action;
    action.next = this;
  }

  /** Tests whether the action currently owns the final cell state of its chain. @returns Whether top content. */
  public IsTopContent(): boolean {
    return this.next === undefined;
  }

  /** Finds the final action in the original cell content chain. @returns Top content action. */
  public GetTopContent(): ScChangeActionContent {
    if (!this.next) return this;
    let result = this.next;
    while (result.next) result = result.next;
    return result;
  }

  /** Reads deletion references from the original top content action. @returns Deleting actions. */
  public override GetDeletedIn(): readonly ScChangeAction[] {
    return this.next ? this.GetTopContent().GetDeletedIn() : super.GetDeletedIn();
  }

  /** Releases native owned cell snapshots. @returns Nothing. */
  public override Dispose(): void {
    super.Dispose();
    this.oldCell.clear();
    this.newCell.clear();
    this.previous = undefined;
    this.next = undefined;
  }

  /** Uses the original input line format for numeric date/time and ordinary values. @param cell - Owned or borrowed snapshot. @param format - Document number format. @returns Native input spelling. */
  private GetInputString(cell: ScCellValue, format: number): string {
    if (cell.getType() !== CellType.CELLTYPE_VALUE) return "";
    const value = this.document.GetFormatTable().GetInputLineString(cell.getDouble(), format);
    try {
      return text(value);
    } finally {
      value.dispose();
    }
  }
}

/** Document-owned loaded Calc change track. */
export class ScChangeTrack {
  private readonly actions = new Map<number, ScChangeAction>();
  private readonly generated = new Map<number, ScChangeActionContent>();
  private generatedMin = 0xfffffff0;
  private last: ScChangeAction | undefined;
  private protection = new Uint8Array();
  private actionMax = 0;
  private lastSavedAction = 0;

  /** Binds the track to its actual workbook. @param document - Canonical owner. @returns The initialized ScChangeTrack instance. */
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
    this.last?.SetNext(action);
    this.last = action;
    return true;
  }

  /** Reads one indexed action. @param id - Original action number. @returns Action if loaded. */
  public GetAction(id: number): ScChangeAction | undefined {
    return this.actions.get(id);
  }

  /** Reads a normal or generated action by its original identifier. @param id - Action identifier. @returns Original action. */
  public GetActionOrGenerated(id: number): ScChangeAction | undefined {
    return this.IsGenerated(id) ? this.generated.get(id) : this.actions.get(id);
  }

  /** Tests the original generated interval. @param id - Action identifier. @returns Whether the ID is in that interval. */
  public IsGenerated(id: number): boolean {
    return id >= this.generatedMin;
  }

  /** Creates a detached historical cell from the loaded deletion list. @param value - Deleted cell snapshot. @param range - Original coordinates. @param input - Original value spelling. @returns Owned generated action. */
  public AddLoadedGenerated(
    value: ScCellValue,
    range: ScBigRange,
    input: string,
  ): ScChangeActionContent {
    const id = this.generatedMin - 1;
    const generated = new ScChangeActionContent(
      {
        actionNumber: id,
        rejectingNumber: 0,
        state: ScChangeActionState.SC_CAS_VIRGIN,
        range,
        user: "",
        dateTimeUTC: new DateTime(DateTime.EMPTY),
        comment: "",
      },
      new ScCellValue(),
      this.document,
    );
    generated.SetNewCell(value, input);
    this.generatedMin = id;
    this.generated.set(id, generated);
    return generated;
  }

  /** Iterates generated snapshots in load order for Worker transfer. @returns Generated cells. */
  public generatedEntries(): IterableIterator<ScChangeActionContent> {
    return this.generated.values();
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

  /** Updates the native action-number ceiling. @param value - Original action number. @returns Nothing. */
  public SetActionMax(value: number): void {
    this.actionMax = value;
  }

  /** Reads the last action saved to the package. @returns Original action number. */
  public GetLastSavedActionNumber(): number {
    return this.lastSavedAction;
  }

  /** Records the last action adopted from the package. @param value - Original action number. @returns Nothing. */
  public SetLastSavedActionNumber(value: number): void {
    this.lastSavedAction = value;
  }

  /** Replaces the original track protection key. @param protection - Source bytes. @returns Nothing. */
  public SetProtection(protection: Uint8Array): void {
    this.protection = new Uint8Array(protection);
  }

  /** Copies the original track protection key bytes. @returns Stored key. */
  public GetProtection(): Uint8Array {
    return this.protection.slice();
  }

  /** Releases all tracked cell snapshots with the owner. @returns Nothing. */
  public Dispose(): void {
    for (const action of this.actions.values()) action.Dispose();
    for (const action of this.generated.values()) action.Dispose();
    this.actions.clear();
    this.generated.clear();
    this.last = undefined;
  }
}
