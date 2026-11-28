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
import { ScChangeActionState as State } from "../../core/tool/chgtrack";
import { ScMatrixMode } from "../../core/data/formulacell";
import { ScXMLCellTextParaContext } from "./celltextparacontext";
import { ScXMLImportContext } from "./importcontext";
import {
  ScXMLChangeTrackingImportHelper,
  ScMyCellInfo,
  type ScMyFormulaInfo,
} from "./XMLChangeTrackingImportHelper";
import type { ScXMLImport } from "./xmlimprt";
import type { CellTextParagraph } from "./xmlexprt.celltext";

/** Dispatches the represented original tracked cell content actions. */
export class ScXMLTrackedChangesContext extends ScXMLImportContext {
  /** Binds the native helper and reads the track key. @param owner - Workbook importer. @param attributes - Collection attributes. @param helper - Deferred track owner. */
  public constructor(
    owner: ScXMLImport,
    attributes: FastAttributeList,
    private readonly helper: ScXMLChangeTrackingImportHelper,
  ) {
    super(owner);
    const key = attributes.get(X.TABLE_PROTECTION_KEY);
    if (key) helper.SetProtection(decodeBase64(key));
  }

  /** Handles the original cell-content-change element. @param element - Action element. @param attributes - Action attributes. @returns Action context. */
  public override createFastChildContext(
    element: X,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element === X.TABLE_CELL_CONTENT_CHANGE)
      return new ScXMLContentChangeContext(this.GetScImport(), attributes, this.helper);
    throw new Error("ODS structural tracked change actions are not implemented");
  }

  /** Prevents unsupported change actions from being dropped. @returns No child. */
  public override createUnknownChildContext(): never {
    throw new Error("ODS structural tracked change actions are not implemented");
  }
}

/** Collects one original cell content change. */
class ScXMLContentChangeContext extends ScXMLImportContext {
  private readonly actionNumber: number;
  private readonly state: State;
  private readonly rejectingNumber: number;
  private range = new ScBigRange();
  private user = "";
  private timestamp = new DateTime(DateTime.EMPTY);
  private comment = "";
  private previousAction = 0;
  private oldCell = new ScMyCellInfo();
  private readonly dependencies: number[] = [];

  /** Reads the original action ID and acceptance. @param owner - Workbook importer. @param attributes - Action attributes. @param helper - Deferred track owner. */
  public constructor(
    owner: ScXMLImport,
    attributes: FastAttributeList,
    private readonly helper: ScXMLChangeTrackingImportHelper,
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

  /** Collects original metadata, coordinates, dependencies and the preceding cell. @param element - Child element. @param attributes - Child attributes. @returns Child parser. */
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
      case X.TABLE_CELL_ADDRESS:
        this.range = readBigRange(attributes);
        return new SvXMLImportContext();
      case X.TABLE_DEPENDENCIES:
        return new ScXMLDependingsContext(this.dependencies);
      case X.TABLE_PREVIOUS:
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
      default:
        return this.createUnknownChildContext();
    }
  }

  /** Publishes the action only after all of its children have been read. */
  public override endFastElement(): void {
    this.helper.EndChangeAction({
      actionNumber: this.actionNumber,
      state: this.state,
      rejectingNumber: this.rejectingNumber,
      range: this.range,
      user: this.user,
      dateTimeUTC: this.timestamp,
      comment: this.comment,
      previousAction: this.previousAction,
      oldCell: this.oldCell,
      dependencies: this.dependencies,
    });
  }

  /** Prevents unsupported change children from being dropped. @returns No child. */
  public override createUnknownChildContext(): never {
    throw new Error("ODS tracked content action contains an unsupported child");
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
  /** Captures text without another owner. @param append - Character receiver. */
  public constructor(private readonly append: (text: string) => void) {
    super();
  }
  /** Appends source characters. @param value - Source text. */
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

  /** Admits legacy author/date attributes as the initial values. @param attributes - Change info attributes. @param receive - Action callback. */
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

  /** Publishes native change info after parsing its date. */
  public override endFastElement(): void {
    const timestamp = new UnoDateTime();
    Converter.parseDateTime(timestamp, this.date);
    this.receive(this.user, new DateTime(timestamp), this.comment);
  }
}

/** Reads original action dependency IDs. */
class ScXMLDependingsContext extends SvXMLImportContext {
  /** Borrows the action's dependent ID list. @param dependencies - Target list. */
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
  /** Binds the old cell to the current action. @param owner - Workbook importer. @param receive - Cell callback. */
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

  /** Reads the original previous-cell attributes. @param owner - Workbook importer. @param attributes - Previous cell attributes. @param tab - Sheet of the tracked action. @param receive - Cell callback. */
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

  /** Receives the actual cell edit spans from one paragraph. @param paragraph - Parsed paragraph. */
  private SetParagraph(paragraph: CellTextParagraph): void {
    this.paragraphs.push(paragraph);
  }

  /** Publishes the original empty, scalar, formula or edit-text result. */
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

  /** Captures the first paragraph and the callback that creates the edit cell. @param owner - Cell paragraph owner. @param tab - Sheet index. @param attributes - First paragraph attributes. @param enterEdit - Marks the cell as edit text. */
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
