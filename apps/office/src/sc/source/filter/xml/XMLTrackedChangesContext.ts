/** @fileoverview Native ODF tracked-change context and the original previous-cell children. */
import { decodeBase64 } from "../../../../comphelper/source/misc/base64";
import { toDouble } from "../../../../o3tl/inc/string_view";
import { Converter } from "../../../../sax/source/tools/converter";
import { convertDurationToDays } from "../../../../sax/source/tools/converter.duration";
import { DateTime as UnoDateTime } from "../../../../offapi/com/sun/star/util/DateTime";
import { DateTime } from "../../../../tools/source/datetime/datetime";
import {
  SvXMLIgnoreContext,
  SvXMLImportContext,
  type FastAttributeList,
} from "../../../../xmloff/source/core/xmlimp";
import { XMLToken as X } from "../../../../xmloff/source/core/xmltoken";
import { SvXMLUnitConverter } from "../../../../xmloff/source/core/xmluconv";
import { ScBigRange } from "../../../inc/bigrange";
import {
  ScChangeActionState as State,
  ScChangeActionType as Type,
  type ScChangeActionDeletionType,
  type ScChangeActionInsertionType,
} from "../../core/tool/chgtrack";
import { ScMatrixMode } from "../../core/data/formulacell";
import { ScXMLCellTextParaContext } from "./celltextparacontext";
import { ScXMLImportContext } from "./importcontext";
import {
  ScXMLChangeTrackingImportHelper,
  ScMyCellInfo,
  type ScMyDeleted,
  type ScMyFormulaInfo,
} from "./XMLChangeTrackingImportHelper";
import type { ScXMLImport } from "./xmlimprt";
import type { CellTextParagraph } from "./xmlexprt.celltext";

/** Dispatches the represented original tracked actions. */
export class ScXMLTrackedChangesContext extends ScXMLImportContext {
  /** Binds the native helper and reads the track key. @param owner - Workbook importer. @param attributes - Collection attributes. @param helper - Deferred track owner. @returns The initialized ScXMLTrackedChangesContext instance. */
  public constructor(
    owner: ScXMLImport,
    attributes: FastAttributeList,
    private readonly helper: ScXMLChangeTrackingImportHelper,
  ) {
    super(owner);
    const key = attributes.get(X.TABLE_PROTECTION_KEY);
    if (key) helper.SetProtection(decodeBase64(key));
  }

  /** Handles original represented action elements. @param element - Action element. @param attributes - Action attributes. @returns Action context. */
  public override createFastChildContext(
    element: X,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    switch (element) {
      case X.TABLE_CELL_CONTENT_CHANGE:
        return new ScXMLContentChangeContext(this.GetScImport(), attributes, this.helper);
      case X.TABLE_INSERTION:
        return new ScXMLInsertionContext(this.GetScImport(), attributes, this.helper);
      case X.TABLE_DELETION:
        return new ScXMLDeletionContext(this.GetScImport(), attributes, this.helper);
      case X.TABLE_MOVEMENT:
        return new ScXMLMovementContext(this.GetScImport(), attributes, this.helper);
      case X.TABLE_REJECTION:
        return new ScXMLRejectionContext(this.GetScImport(), attributes, this.helper);
      default:
        return this.createUnknownChildContext();
    }
  }

  /** Prevents unsupported change actions from being dropped. @returns No child. */
  public override createUnknownChildContext(): never {
    throw new Error("ODS structural tracked change actions are not implemented");
  }
}

/** Reads the original attributes and children shared by tracked actions. */
abstract class ScXMLChangeActionContext extends ScXMLImportContext {
  private readonly actionNumber: number;
  private readonly state: State;
  private readonly rejectingNumber: number;
  protected range = new ScBigRange();
  private user = "";
  private timestamp = new DateTime(DateTime.EMPTY);
  private comment = "";
  private readonly dependencies: number[] = [];
  private readonly deleted: ScMyDeleted[] = [];

  /** Reads the original action ID and acceptance. @param owner - Workbook importer. @param attributes - Action attributes. @param helper - Deferred track owner. @returns The initialized ScXMLChangeActionContext instance. */
  public constructor(
    owner: ScXMLImport,
    attributes: FastAttributeList,
    protected readonly helper: ScXMLChangeTrackingImportHelper,
  ) {
    super(owner);
    this.actionNumber = ScXMLChangeTrackingImportHelper.GetIDFromString(attributes.get(X.TABLE_ID));
    this.rejectingNumber = ScXMLChangeTrackingImportHelper.GetIDFromString(
      attributes.get(X.TABLE_REJECTING_CHANGE_ID),
    );
    const state = attributes.get(X.TABLE_ACCEPTANCE_STATE);
    this.state =
      state === "accepted"
        ? State.SC_CAS_ACCEPTED
        : state === "rejected"
          ? State.SC_CAS_REJECTED
          : State.SC_CAS_VIRGIN;
  }

  /** Collects change information and dependent action IDs. @param element - Child element. @param attributes - Child attributes. @returns Child parser. */
  public override createFastChildContext(
    element: X,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    switch (element) {
      case X.OFFICE_CHANGE_INFO:
        return new ScXMLChangeInfoContext(attributes, (user, timestamp, comment) => {
          this.user = user;
          this.timestamp = timestamp;
          this.comment = comment;
        });
      case X.TABLE_DEPENDENCIES:
        return new ScXMLDependingsContext(this.dependencies);
      case X.TABLE_DELETIONS:
        return new ScXMLDeletionsContext(this.GetScImport(), this.deleted);
      default:
        return this.createUnknownChildContext();
    }
  }

  /** Copies shared action metadata and the parsed links. @returns Common deferred action fields. */
  protected GetActionInfo() {
    return {
      actionNumber: this.actionNumber,
      state: this.state,
      rejectingNumber: this.rejectingNumber,
      range: this.range,
      user: this.user,
      dateTimeUTC: this.timestamp,
      comment: this.comment,
      dependencies: this.dependencies,
      deleted: this.deleted,
    };
  }

  /** Prevents unsupported change children from being dropped. @returns No child. */
  public override createUnknownChildContext(): never {
    throw new Error("ODS tracked action contains an unsupported child");
  }
}

/** Collects one original cell content change. */
class ScXMLContentChangeContext extends ScXMLChangeActionContext {
  private previousAction = 0;
  private oldCell = new ScMyCellInfo();

  /** Collects the content position and the preceding cell. @param element - Child element. @param attributes - Child attributes. @returns Child parser. */
  public override createFastChildContext(
    element: X,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element === X.TABLE_CELL_ADDRESS) {
      this.range = readBigRange(attributes);
      return new SvXMLImportContext();
    }
    if (element === X.TABLE_PREVIOUS) {
      this.previousAction = ScXMLChangeTrackingImportHelper.GetIDFromString(
        attributes.get(X.TABLE_ID),
      );
      return new ScXMLPreviousContext(
        this.GetScImport(),
        Number(this.range.aStart.GetVars()[2]),
        (cell) => {
          this.oldCell = cell;
        },
      );
    }
    return super.createFastChildContext(element, attributes);
  }

  /** Publishes the original completed content action. @returns Nothing. */
  public override endFastElement(): void {
    this.helper.EndChangeAction({
      ...this.GetActionInfo(),
      type: Type.SC_CAT_CONTENT,
      previousAction: this.previousAction,
      oldCell: this.oldCell,
    });
  }
}

/** Original row, column and sheet insertion context. */
class ScXMLInsertionContext extends ScXMLChangeActionContext {
  private readonly type: ScChangeActionInsertionType;

  /** Parses the inserted axis and original default coordinates. @param owner - Workbook importer. @param attributes - Insertion attributes. @param helper - Deferred track owner. @returns The initialized ScXMLInsertionContext instance. */
  public constructor(
    owner: ScXMLImport,
    attributes: FastAttributeList,
    helper: ScXMLChangeTrackingImportHelper,
  ) {
    super(owner, attributes, helper);
    const axis = attributes.get(X.TABLE_TYPE);
    this.type =
      axis === "row"
        ? Type.SC_CAT_INSERT_ROWS
        : axis === "table"
          ? Type.SC_CAT_INSERT_TABS
          : Type.SC_CAT_INSERT_COLS;
    const position = attributes.getAsInteger(X.TABLE_POSITION) ?? 0;
    const count =
      attributes.get(X.TABLE_COUNT) === null ? 1 : (attributes.getAsInteger(X.TABLE_COUNT) ?? 0);
    const table = attributes.getAsInteger(X.TABLE_TABLE) ?? 0;
    this.range = helper.SetPosition(this.type, position, count, table);
  }

  /** Publishes the original completed insertion. @returns Nothing. */
  public override endFastElement(): void {
    this.helper.EndChangeAction({ ...this.GetActionInfo(), type: this.type });
  }
}

/** Native deletion action attributes and its optional cutoff records. */
class ScXMLDeletionContext extends ScXMLChangeActionContext {
  private readonly type: ScChangeActionDeletionType;
  private readonly multiSpanned: number;
  private insertCutOff: { id: number; count: number } | undefined;
  private readonly moveCutOffs: { id: number; from: number; to: number }[] = [];

  /** Reads the original deleted axis and one-row, column or sheet range. @param owner - Workbook importer. @param attributes - Action attributes. @param helper - Deferred track owner. @returns The initialized ScXMLDeletionContext instance. */
  public constructor(
    owner: ScXMLImport,
    attributes: FastAttributeList,
    helper: ScXMLChangeTrackingImportHelper,
  ) {
    super(owner, attributes, helper);
    const axis = attributes.get(X.TABLE_TYPE);
    this.type =
      axis === "row"
        ? Type.SC_CAT_DELETE_ROWS
        : axis === "table"
          ? Type.SC_CAT_DELETE_TABS
          : Type.SC_CAT_DELETE_COLS;
    this.range = helper.SetPosition(
      this.type,
      attributes.getAsInteger(X.TABLE_POSITION) ?? 0,
      1,
      attributes.getAsInteger(X.TABLE_TABLE) ?? 0,
    );
    this.multiSpanned = attributes.getAsInteger(X.TABLE_MULTI_DELETION_SPANNED) ?? 0;
  }

  /** Reads cutoff references before their target actions have been loaded. @param element - Child element. @param attributes - Child attributes. @returns Child context. */
  public override createFastChildContext(
    element: X,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element !== X.TABLE_CUT_OFFS) return super.createFastChildContext(element, attributes);
    return new ScXMLCutOffsContext(
      (id, count) => {
        this.insertCutOff = { id, count };
      },
      (id, from, to) => {
        this.moveCutOffs.push({ id, from, to });
      },
    );
  }

  /** Publishes the original completed deletion. @returns Nothing. */
  public override endFastElement(): void {
    this.helper.EndChangeAction({
      ...this.GetActionInfo(),
      type: this.type,
      offset: this.helper.GetMultiSpannedRange(this.type, this.multiSpanned),
      ...(this.insertCutOff ? { insertCutOff: this.insertCutOff } : {}),
      moveCutOffs: this.moveCutOffs,
    });
  }
}

/** Native movement action with independent authored source and target ranges. */
class ScXMLMovementContext extends ScXMLChangeActionContext {
  private source = new ScBigRange();

  /** Reads the original source and target ranges. @param element - Child element. @param attributes - Child attributes. @returns Child context. */
  public override createFastChildContext(
    element: X,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element === X.TABLE_SOURCE_RANGE_ADDRESS) {
      this.source = readBigRange(attributes);
      return new SvXMLIgnoreContext(true);
    }
    if (element === X.TABLE_TARGET_RANGE_ADDRESS) {
      this.range = readBigRange(attributes);
      return new SvXMLIgnoreContext(true);
    }
    return super.createFastChildContext(element, attributes);
  }

  /** Publishes the native movement ranges. @returns Nothing. */
  public override endFastElement(): void {
    this.helper.EndChangeAction({
      ...this.GetActionInfo(),
      type: Type.SC_CAT_MOVE,
      from: this.source,
    });
  }
}

/** Original cutoff list under a tracked deletion. */
class ScXMLCutOffsContext extends SvXMLImportContext {
  /** Binds insertion and movement cutoff receivers. @param insert - Insertion cutoff receiver. @param move - Movement cutoff receiver. @returns The initialized ScXMLCutOffsContext instance. */
  public constructor(
    private readonly insert: (id: number, count: number) => void,
    private readonly move: (id: number, from: number, to: number) => void,
  ) {
    super();
  }

  /** Collects original cutoff IDs and their explicit or compact positions. @param element - Cutoff token. @param attributes - Cutoff attributes. @returns Leaf context. */
  public override createFastChildContext(
    element: X,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    const id = ScXMLChangeTrackingImportHelper.GetIDFromString(attributes.get(X.TABLE_ID));
    const position =
      attributes.get(X.TABLE_POSITION) === null
        ? undefined
        : (attributes.getAsInteger(X.TABLE_POSITION) ?? 0);
    if (element === X.TABLE_INSERTION_CUT_OFF) this.insert(id, position ?? 0);
    else if (element === X.TABLE_MOVEMENT_CUT_OFF)
      this.move(
        id,
        position ?? attributes.getAsInteger(X.TABLE_START_POSITION) ?? 0,
        position ?? attributes.getAsInteger(X.TABLE_END_POSITION) ?? 0,
      );
    return new SvXMLIgnoreContext(true);
  }
}

/** Original references and historical snapshots inside the deletion list. */
class ScXMLDeletionsContext extends ScXMLImportContext {
  /** Shares the action's ordered deleted-data list. @param owner - Workbook importer. @param deleted - Parsed deletion target. @returns The initialized ScXMLDeletionsContext instance. */
  public constructor(
    owner: ScXMLImport,
    private readonly deleted: ScMyDeleted[],
  ) {
    super(owner);
  }

  /** Admits plain action references or full cell snapshots. @param element - Deleted child. @param attributes - XML attributes. @returns Child context. */
  public override createFastChildContext(
    element: X,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    const id = ScXMLChangeTrackingImportHelper.GetIDFromString(attributes.get(X.TABLE_ID));
    if (element === X.TABLE_CHANGE_DELETION) this.deleted.push({ id });
    else if (element === X.TABLE_CELL_CONTENT_DELETION)
      return new ScXMLCellContentDeletionContext(this.GetScImport(), id, this.deleted);
    return new SvXMLIgnoreContext(true);
  }
}

/** Original deleted cell stores either a generated position or an action ID. */
class ScXMLCellContentDeletionContext extends ScXMLImportContext {
  private range = new ScBigRange();
  private cell = new ScMyCellInfo();

  /** Binds a deleted cell to its original optional action ID. @param owner - Workbook importer. @param id - Referenced action. @param deleted - Parsed deletion target. @returns The initialized ScXMLCellContentDeletionContext instance. */
  public constructor(
    owner: ScXMLImport,
    private readonly id: number,
    private readonly deleted: ScMyDeleted[],
  ) {
    super(owner);
  }

  /** Reads the normal change cell subtree and its original address. @param element - Child token. @param attributes - Child attributes. @returns Child context. */
  public override createFastChildContext(
    element: X,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element === X.TABLE_CELL_ADDRESS) this.range = readBigRange(attributes);
    else if (element === X.TABLE_CHANGE_TRACK_TABLE_CELL)
      return new ScXMLChangeCellContext(
        this.GetScImport(),
        attributes,
        Number(this.range.aStart.GetVars()[2]),
        (cell) => {
          this.cell = cell;
        },
      );
    return new SvXMLIgnoreContext(true);
  }

  /** Adds the completed parsed snapshot to the containing action. @returns Nothing. */
  public override endFastElement(): void {
    this.deleted.push({ id: this.id, range: this.range, cell: this.cell });
  }
}

/** Original rejection context queues an action in the move branch without movement ranges. */
class ScXMLRejectionContext extends ScXMLChangeActionContext {
  /** Publishes the malformed move action for the native loader to discard. @returns Nothing. */
  public override endFastElement(): void {
    this.helper.EndChangeAction({ ...this.GetActionInfo(), type: Type.SC_CAT_MOVE });
  }
}

/** Reads native tracked-change coordinates in their 32-bit import range. @param attributes - Cell address attributes. @returns Original BigRange. */
function readBigRange(attributes: FastAttributeList): ScBigRange {
  const column = attributes.getAsInteger(X.TABLE_COLUMN);
  const row = attributes.getAsInteger(X.TABLE_ROW);
  const tab = attributes.getAsInteger(X.TABLE_TABLE);
  return new ScBigRange(
    BigInt(column ?? attributes.getAsInteger(X.TABLE_START_COLUMN) ?? 0),
    BigInt(row ?? attributes.getAsInteger(X.TABLE_START_ROW) ?? 0),
    BigInt(tab ?? attributes.getAsInteger(X.TABLE_START_TABLE) ?? 0),
    BigInt(column ?? attributes.getAsInteger(X.TABLE_END_COLUMN) ?? 0),
    BigInt(row ?? attributes.getAsInteger(X.TABLE_END_ROW) ?? 0),
    BigInt(tab ?? attributes.getAsInteger(X.TABLE_END_TABLE) ?? 0),
  );
}

/** Accumulates the original direct character callbacks. */
class ScXMLContentContext extends SvXMLImportContext {
  /** Captures text without another owner. @param append - Character receiver. @returns The initialized ScXMLContentContext instance. */
  public constructor(private readonly append: (text: string) => void) {
    super();
  }
  /** Appends source characters. @param value - Source text. @returns Nothing. */
  public override characters(value: string): void {
    this.append(value);
  }
}

/** Reads the original change author, UTC date and ordered comment paragraphs. */
class ScXMLChangeInfoContext extends SvXMLImportContext {
  private user: string;
  private date: string;
  private comment = "";
  private paragraphs = 0;

  /** Admits legacy author/date attributes as the initial values. @param attributes - Change info attributes. @param receive - Action callback. @returns The initialized ScXMLChangeInfoContext instance. */
  public constructor(
    attributes: FastAttributeList,
    private readonly receive: (user: string, timestamp: DateTime, comment: string) => void,
  ) {
    super();
    this.user = attributes.get(X.OFFICE_CHG_AUTHOR) ?? "";
    this.date = attributes.get(X.OFFICE_CHG_DATE_TIME) ?? "";
  }

  /** Opens one of the original text-bearing children. @param element - Child token. @returns Text receiver or absence. */
  public override createFastChildContext(element: X): SvXMLImportContext | null {
    switch (element) {
      case X.DC_CREATOR:
        return new ScXMLContentContext((value) => {
          this.user += value;
        });
      case X.DC_DATE:
        return new ScXMLContentContext((value) => {
          this.date += value;
        });
      case X.TEXT_P:
        if (this.paragraphs++) this.comment += "\n";
        return new ScXMLContentContext((value) => {
          this.comment += value;
        });
      default:
        return null;
    }
  }

  /** Publishes native change info after parsing its date. @returns Nothing. */
  public override endFastElement(): void {
    const timestamp = new UnoDateTime();
    Converter.parseDateTime(timestamp, this.date);
    this.receive(this.user, new DateTime(timestamp), this.comment);
  }
}

/** Reads original action dependency IDs. */
class ScXMLDependingsContext extends SvXMLImportContext {
  /** Borrows the action's dependent ID list. @param dependencies - Target list. @returns The initialized ScXMLDependingsContext instance. */
  public constructor(private readonly dependencies: number[]) {
    super();
  }
  /** Saves the original reference before parsing the next action. @param element - Child token. @param attributes - Dependency attributes. @returns Inert child or absence. */
  public override createFastChildContext(
    element: X,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element !== X.TABLE_DEPENDENCY) return null;
    const id = ScXMLChangeTrackingImportHelper.GetIDFromString(attributes.get(X.TABLE_ID));
    if (id) this.dependencies.push(id);
    return new SvXMLImportContext();
  }
}

/** Reads the native previous cell wrapper. */
class ScXMLPreviousContext extends ScXMLImportContext {
  /** Binds the old cell to the current action. @param owner - Workbook importer. @param receive - Cell callback. @returns The initialized ScXMLPreviousContext instance. */
  public constructor(
    owner: ScXMLImport,
    private readonly tab: number,
    private readonly receive: (cell: ScMyCellInfo) => void,
  ) {
    super(owner);
  }
  /** Selects the original tracked cell child. @param element - Child token. @param attributes - Cell attributes. @returns Previous cell context. */
  public override createFastChildContext(
    element: X,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    return element === X.TABLE_CHANGE_TRACK_TABLE_CELL
      ? new ScXMLChangeCellContext(this.GetScImport(), attributes, this.tab, this.receive)
      : new SvXMLIgnoreContext(true);
  }
}

/** Maps the original tracked scalar, formula and edit cells. */
class ScXMLChangeCellContext extends ScXMLImportContext {
  private readonly input: number;
  private readonly kind: string;
  private empty = true;
  private richText = false;
  private readonly paragraphs: CellTextParagraph[] = [];
  private readonly formula: ScMyFormulaInfo | undefined;

  /** Reads the original previous-cell attributes. @param owner - Workbook importer. @param attributes - Previous cell attributes. @param tab - Sheet of the tracked action. @param receive - Cell callback. @returns The initialized ScXMLChangeCellContext instance. */
  public constructor(
    owner: ScXMLImport,
    attributes: FastAttributeList,
    private readonly tab: number,
    private readonly receive: (cell: ScMyCellInfo) => void,
  ) {
    super(owner);
    const formula = attributes.get(X.TABLE_FORMULA);
    if (formula !== null) {
      const columns = attributes.getAsInteger(X.TABLE_MATRIX_COLS_SPANNED) ?? 0;
      const rows = attributes.getAsInteger(X.TABLE_MATRIX_ROWS_SPANNED) ?? 0;
      this.formula = {
        ...owner.ExtractFormulaNamespaceGrammar(formula, attributes),
        address: attributes.get(X.TABLE_CELL_ADDRESS) ?? "",
        matrix:
          attributes.get(X.TABLE_MATRIX_COVERED) === "true"
            ? ScMatrixMode.Reference
            : columns && rows
              ? ScMatrixMode.Formula
              : ScMatrixMode.NONE,
        columns,
        rows,
      };
      this.empty = false;
    }
    this.kind = attributes.get(X.TABLE_VALUE_TYPE) ?? "";
    const input: [number] = [0];
    const zero = owner.GetDocument().GetFormatTable().GetNullDate();
    for (const [token, value] of attributes) {
      switch (token) {
        case X.OFFICE_VALUE:
          input[0] = toDouble(new TextEncoder().encode(value));
          this.empty = false;
          break;
        case X.OFFICE_DATE_VALUE:
          SvXMLUnitConverter.convertDateTimeToDays(input, value, zero);
          this.empty = false;
          break;
        case X.OFFICE_TIME_VALUE:
          convertDurationToDays(input, value);
          this.empty = false;
          break;
      }
    }
    this.input = input[0];
  }

  /** Uses the original first paragraph fast path before switching to edit text. @param element - Content token. @param attributes - Paragraph attributes. @returns Cell text parser or absence. */
  public override createFastChildContext(
    element: X,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element !== X.TEXT_P) return new SvXMLIgnoreContext(true);
    this.empty = false;
    const owner = {
      GetScImport: this.GetScImport.bind(this),
      setParagraph: this.SetParagraph.bind(this),
    };
    if (this.paragraphs.length) {
      this.richText = true;
      return new ScXMLCellTextParaContext(owner, this.tab);
    }
    return new ScXMLChangeTextPContext(owner, this.tab, attributes, () => {
      this.richText = true;
    });
  }

  /** Receives the actual cell edit spans from one paragraph. @param paragraph - Parsed paragraph. @returns Nothing. */
  private SetParagraph(paragraph: CellTextParagraph): void {
    this.paragraphs.push(paragraph);
  }

  /** Publishes the original empty, scalar, formula or edit-text result. @returns Nothing. */
  public override endFastElement(): void {
    if (this.richText) {
      this.receive(new ScMyCellInfo({ paragraphs: this.paragraphs }));
      return;
    }
    if (this.formula) {
      this.receive(new ScMyCellInfo(this.formula));
      return;
    }
    const numeric = this.kind === "float" || this.kind === "date" || this.kind === "time";
    const paragraph = this.paragraphs[0]?.map(([value]) => value).join("") ?? "";
    const value = this.empty ? undefined : !numeric && paragraph ? paragraph : this.input;
    this.receive(
      new ScMyCellInfo(value, this.kind === "date" || this.kind === "time" ? paragraph : ""),
    );
  }
}

/** Original first tracked-cell paragraph, which uses its own attributes for the simple space path. */
class ScXMLChangeTextPContext extends ScXMLCellTextParaContext {
  private edit = false;

  /** Captures the first paragraph and the callback that creates the edit cell. @param owner - Cell paragraph owner. @param tab - Sheet index. @param attributes - First paragraph attributes. @param enterEdit - Marks the cell as edit text. @returns The initialized ScXMLChangeTextPContext instance. */
  public constructor(
    owner: ConstructorParameters<typeof ScXMLCellTextParaContext>[0],
    tab: number,
    private readonly attributes: FastAttributeList,
    private readonly enterEdit: () => void,
  ) {
    super(owner, tab);
  }

  /** Promotes complex inline content to the shared Calc edit text context. @param element - Inline token. @param attributes - Child attributes. @returns Child handler. */
  public override createFastChildContext(
    element: X,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (!this.edit && element === X.TEXT_S) {
      const count = this.attributes.getAsInteger(X.TEXT_C) || 1;
      if (count > 1_000_000) throw new Error("ODS text space limit exceeded");
      this.PushSpan(" ".repeat(Math.max(0, count)), "");
      return new SvXMLIgnoreContext(true);
    }
    if (!this.edit) {
      this.edit = true;
      this.enterEdit();
    }
    return super.createFastChildContext(element, attributes);
  }
}
