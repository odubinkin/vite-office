/** @fileoverview Browser projection of Calc Copy, Paste and Paste Unformatted slots. */
import { copyPlainText } from "../../../vcl/browser/browser-clipboard";
import { SfxDialogController } from "../../../sfx2/source/dialog/basedlgs";
import { SfxInterface } from "../../../sfx2/source/control/objface";
import { createSfxShell, type SfxShell } from "../../../sfx2/source/control/shell";
import { ScRange } from "../../inc/address";
import type { ScDocument } from "../../inc/document";
import { scPasteResourcesEnglish } from "../../inc/globstr";
import { ScMarkData } from "../../inc/markdata";
import { InsertDeleteFlags, InsCellCmd, ScInputMode, ScPasteFunc } from "../../inc/global";
import { ScAsciiOptions } from "../../source/ui/dbgui/asciiopt";
import { ScMarkType } from "../../source/ui/inc/viewdata";
import {
  ApplyImportedNumberFormats,
  calcCellClipboardFlags,
  ClipboardTextOptions,
  CopyToClipSingleRange,
  ExportClipboardText,
  ImportClipboardText,
} from "../../source/ui/view/viewfun3.transfer";
import { ScViewUtil } from "../../source/ui/view/viewutil";
import type { CalcViewController } from "../controller/calc-view-controller";

const calcType = "application/x-vite-office-calc-clipboard";
const webCalcType = "web " + calcType;
const plainType = "text/plain";

const pasteOnlySlots = [
  {
    commandUrl: ".uno:PasteOnlyText",
    slotId: 5802,
    label: "Paste Only Text",
    flags: InsertDeleteFlags.STRING,
  },
  {
    commandUrl: ".uno:PasteOnlyFormula",
    slotId: 5803,
    label: "Paste Only Formula",
    flags: InsertDeleteFlags.FORMULA,
  },
  {
    commandUrl: ".uno:PasteOnlyValue",
    slotId: 5804,
    label: "Paste Only Numbers",
    flags: InsertDeleteFlags.VALUE,
  },
] as const;

/** Portable clipboard text with an optional browser-owned native transfer identity. */
interface Transfer {
  readonly plainText: string;
  readonly token: string;
}

/** Owns one clipboard document for the native source workbook during the Calc session. */
interface OwnedTransfer extends Transfer {
  readonly clip: ScDocument;
  readonly source: ScDocument;
}

/** Options for the native clip-only commands in the Paste Special menu. */
interface OwnedPasteOptions {
  readonly flags?: InsertDeleteFlags;
  readonly transpose?: boolean;
}

/** Original Text Import dialog inputs for a text transfer. */
export interface PasteTextRequest {
  readonly text: string;
  readonly options: ScAsciiOptions;
}

/** Native clipboard confirmation before changing the sheet. */
export type PasteConfirmation = "replace" | "larger";

/** A pending text import or source paste confirmation. */
type PasteDialogRequest =
  ({ readonly kind: "text" } & PasteTextRequest) | { readonly kind: PasteConfirmation };

/** The warning checkbox applies independently of the Yes or No response. */
export interface PasteConfirmationResult {
  readonly accepted: boolean;
  readonly warnAgain: boolean;
}

/** Routes native commands through real browser Clipboard actions and source document owners. */
export class CalcClipboardWorkflow {
  readonly dialogs = new SfxDialogController<
    PasteDialogRequest,
    ScAsciiOptions | PasteConfirmationResult
  >();
  private owned: OwnedTransfer | undefined;
  private preferences: ScAsciiOptions | undefined;
  private warnReplace = true;
  private closed = false;
  private reading = false;
  private readonly shell = createSfxShell(
    this,
    new SfxInterface<CalcClipboardWorkflow>([
      {
        commandUrl: ".uno:Copy",
        slotId: 5711,
        label: "Copy",
        getState: (workflow) => ({ enabled: workflow.CanCopy() }),
        execute: (workflow) => workflow.Copy(),
      },
      {
        commandUrl: ".uno:Paste",
        slotId: 5712,
        label: "Paste",
        getState: (workflow) => ({ enabled: workflow.CanRead() }),
        execute: (workflow) => workflow.Paste(false),
      },
      {
        commandUrl: ".uno:PasteUnformatted",
        slotId: 5314,
        label: "Paste Unformatted Text",
        shortcuts: ["Ctrl+Alt+Shift+V", "Meta+Alt+Shift+V"],
        getState: (workflow) => ({ enabled: workflow.CanRead() }),
        execute: (workflow) => workflow.Paste(true),
      },
      ...pasteOnlySlots.map(({ flags, ...slot }) => ({
        ...slot,
        getState: (workflow: CalcClipboardWorkflow) => ({ enabled: workflow.CanPasteOwned() }),
        execute: (workflow: CalcClipboardWorkflow) => workflow.Paste(false, undefined, { flags }),
      })),
      {
        commandUrl: ".uno:PasteTransposed",
        slotId: 5808,
        label: "Paste Transposed",
        getState: (workflow) => ({ enabled: workflow.CanPasteOwned() }),
        execute: (workflow) => workflow.Paste(false, undefined, { transpose: true }),
      },
    ]),
  );

  /** Binds the clipboard slots to their native workbook and view owners. @param controller - Active view. @param canOpen - Native dialog admission. @returns Workflow. */
  constructor(
    private readonly controller: CalcViewController,
    private readonly canOpen: () => boolean,
  ) {}

  /** Returns the source slot shell. @returns Shell. */
  GetShell(): SfxShell {
    return this.shell;
  }

  /** Releases the transferred document and cancels any asynchronous import on close. @returns Nothing. */
  Close(): void {
    this.closed = true;
    this.owned?.clip.Dispose();
    this.owned = undefined;
    const request = this.dialogs.GetSnapshot();
    if (request) this.dialogs.Cancel(request.id);
  }

  /** Writes a synchronous grid Copy event with both the native identity and plain text. @param clipboard - Browser transfer data. @returns Whether handled. */
  CopyEvent(clipboard: DataTransfer): boolean {
    try {
      const transfer = this.CopySelection();
      if (!transfer) return false;
      clipboard.setData(plainType, transfer.plainText);
      clipboard.setData(calcType, transfer.token);
      return true;
    } catch {
      if (!this.closed) this.controller.shell.ErrorMessage("The selection could not be copied.");
      return false;
    }
  }

  /** Consumes a user-initiated grid Paste event with its original browser payload. @param clipboard - Browser transfer data. @returns Whether handled. */
  PasteEvent(clipboard: DataTransfer): boolean {
    if (
      !this.CanUseCells() ||
      this.reading ||
      !clipboard.types.some((type) => type === plainType || type === calcType)
    )
      return false;
    const transfer = {
      plainText: clipboard.getData(plainType),
      token: clipboard.getData(calcType),
    };
    void this.Paste(false, transfer);
    return true;
  }

  /** Admits sheet clipboard commands only when the sheet owns the edit context. @returns Native availability. */
  private CanUseCells(): boolean {
    return !this.closed && this.canOpen() && this.controller.mode === ScInputMode.SC_INPUT_NONE;
  }

  /** Checks the source copy selection without allocating a clipboard document. @returns Copy availability. */
  private CanCopy(): boolean {
    return (
      this.CanUseCells() &&
      !this.reading &&
      this.controller.viewData.GetSimpleArea(new ScRange()) === ScMarkType.SC_MARK_SIMPLE
    );
  }

  /** Queries browser Clipboard capability without reading its contents. @returns Menu paste availability. */
  private CanRead(): boolean {
    return this.CanUseCells() && !this.reading && !!globalThis.navigator?.clipboard;
  }

  /** Checks the native clipboard and editable cursor for internal Paste Special commands. @returns Whether available. */
  private CanPasteOwned(): boolean {
    if (!this.CanRead()) return false;
    const { shell, viewData } = this.controller;
    const doc = shell.GetDocument();
    return (
      this.owned?.source === doc &&
      doc.IsBlockEditable(
        viewData.CurrentTabForData(),
        viewData.GetCurX(),
        viewData.GetCurY(),
        viewData.GetCurX(),
        viewData.GetCurY(),
      ) &&
      viewData.GetSimpleArea(new ScRange()) === ScMarkType.SC_MARK_SIMPLE &&
      !viewData.SelectionForbidsPaste(this.owned.clip)
    );
  }

  /** Captures the current selection with a fresh browser-session clipboard identity. @returns Native transfer on success. */
  private CopySelection(): OwnedTransfer | undefined {
    if (!this.CanCopy()) return undefined;
    const source = this.controller.shell.GetDocument();
    const clip = CopyToClipSingleRange(this.controller.viewData);
    if (!clip) return undefined;
    try {
      const plainText = ExportClipboardText(clip, source);
      const token = globalThis.crypto.getRandomValues(new Uint32Array(4)).join("-");
      this.owned?.clip.Dispose();
      this.owned = { source, clip, plainText, token };
      return this.owned;
    } catch (error) {
      clip.Dispose();
      throw error;
    }
  }

  /** Writes the actual sheet selection to a browser clipboard action. @returns Whether copied. */
  private async Copy(): Promise<boolean> {
    try {
      const transfer = this.CopySelection();
      if (!transfer) return false;
      const clipboard = globalThis.navigator.clipboard;
      if (clipboard?.write && globalThis.ClipboardItem) {
        try {
          await clipboard.write([
            new ClipboardItem({
              [plainType]: new Blob([transfer.plainText], { type: plainType }),
              [webCalcType]: new Blob([transfer.token], { type: calcType }),
            }),
          ]);
          return true;
        } catch {
          // Lossless in-workbook transfer uses the browser custom format where available.
        }
      }
      await copyPlainText(transfer.plainText);
      return true;
    } catch {
      if (!this.closed) this.controller.shell.ErrorMessage("The selection could not be copied.");
      return false;
    }
  }

  /** Applies the authorized clipboard transfer to the same active document and selection. @param unformatted - Force the portable text path. @param supplied - Native DOM clipboard data, when available. @param native - Native clip-only request. @returns Whether pasted. */
  private async Paste(
    unformatted: boolean,
    supplied?: Transfer,
    native?: OwnedPasteOptions,
  ): Promise<boolean> {
    if (!this.CanUseCells() || this.reading || (native && !this.CanPasteOwned())) return false;
    this.reading = true;
    const { controller } = this;
    const doc = controller.shell.GetDocument();
    const revision = controller.GetSnapshot();
    try {
      const transfer = supplied ?? (await ReadSystemTransfer());
      /** Checks that the browser response still targets the initiating selection. @returns Whether current. */
      const current = (): boolean =>
        !this.closed &&
        doc === controller.shell.GetDocument() &&
        revision === controller.GetSnapshot();
      if (!current()) return false;
      const owned = this.owned;
      if (!unformatted && owned?.source === doc && owned.token === transfer.token)
        return await this.PasteOwned(owned.clip, doc, current, native);
      if (native || !transfer.plainText) return false;

      const range = new ScRange();
      if (controller.viewData.GetSimpleArea(range) !== ScMarkType.SC_MARK_SIMPLE) return false;
      const origin = range.aStart;
      origin.SetTab(controller.viewData.CurrentTabForData());
      let options = ClipboardTextOptions();
      const newline = transfer.plainText.indexOf("\n");
      if (newline >= 0 && newline < transfer.plainText.length - 1) {
        options = this.preferences
          ? new ScAsciiOptions(this.preferences)
          : ClipboardTextOptions(transfer.plainText);
        const response = await this.dialogs.Request({
          kind: "text",
          text: transfer.plainText,
          options,
        });
        if (
          response.kind !== "accepted" ||
          !(response.result instanceof ScAsciiOptions) ||
          !current()
        )
          return false;
        options = response.result;
        this.preferences = new ScAsciiOptions(options);
      }
      const imported = ImportClipboardText(doc, origin, transfer.plainText, options);
      if (!imported) return false;
      const { clip, overflow } = imported;
      const marks = controller.viewData.GetMarkData(),
        previous = new ScMarkData(marks);
      let pasted = false;
      try {
        marks.SetMarkArea(new ScRange(origin));
        pasted = this.controller
          .GetViewShell()
          .PasteFromClip(
            InsertDeleteFlags.CONTENTS,
            clip,
            ScPasteFunc.NONE,
            options.bSkipEmptyCells,
            false,
            false,
            InsCellCmd.INS_NONE,
            InsertDeleteFlags.ATTRIB,
          );
        if (pasted) {
          ApplyImportedNumberFormats(doc, clip);
          this.controller.SyncSheetView();
          if (overflow) controller.shell.ErrorMessage(scPasteResourcesEnglish.STR_PASTE_ERROR);
        }
        return pasted;
      } finally {
        if (!pasted) marks.assign(previous);
        clip.Dispose();
      }
    } catch {
      if (!this.closed) controller.shell.ErrorMessage(scPasteResourcesEnglish.STR_PASTE_ERROR);
      return false;
    } finally {
      this.reading = false;
    }
  }

  /** Implements the native confirmation sequence for internal paste. @param clip - In-workbook clipboard. @param doc - Active document. @param current - Revalidates the initiating view after a modal. @param native - Native clip-only options. @returns Whether pasted. */
  private async PasteOwned(
    clip: ScDocument,
    doc: ScDocument,
    current: () => boolean,
    { flags = calcCellClipboardFlags, transpose = false }: OwnedPasteOptions = {},
  ): Promise<boolean> {
    const data = this.controller.viewData;
    const range = new ScRange();
    if (data.GetSimpleArea(range) !== ScMarkType.SC_MARK_SIMPLE || data.SelectionForbidsPaste(clip))
      return false;

    const marks = data.GetMarkData();
    const [startCol, startRow] = [range.aStart.Col(), range.aStart.Row()];
    const extraCols = range.aEnd.Col() - startCol;
    const extraRows = range.aEnd.Row() - startRow;
    const cols: [number] = [0],
      rows: [number] = [0];
    clip.GetClipArea(transpose ? rows : cols, transpose ? cols : rows, false);
    const enlarge =
      marks.IsMarked() &&
      ((extraCols > 0 && extraCols < cols[0]) || (extraRows > 0 && extraRows < rows[0]));
    if (enlarge && (!(await this.Confirm("larger")) || !current())) return false;

    const endCol = startCol + Math.max(extraCols, cols[0]);
    const endRow = startRow + Math.max(extraRows, rows[0]);
    range.aEnd.SetCol(endCol);
    range.aEnd.SetRow(endRow);
    if (!doc.ValidCol(endCol) || !doc.ValidRow(endRow)) {
      this.controller.shell.ErrorMessage(scPasteResourcesEnglish.STR_PASTE_FULL);
      return false;
    }
    if (ScViewUtil.HasFiltered(range, doc)) return false;
    if (
      this.warnReplace &&
      [...marks].some((tab) => !doc.IsBlockEmpty(startCol, startRow, endCol, endRow, tab)) &&
      (!(await this.Confirm("replace")) || !current())
    )
      return false;

    if (!enlarge) return this.PasteDocument(clip, flags, transpose);
    const previous = new ScMarkData(marks);
    let pasted = false;
    try {
      marks.SetMarkArea(range);
      pasted = this.PasteDocument(clip, flags, transpose);
      return pasted;
    } finally {
      if (!pasted) marks.assign(previous);
    }
  }

  /** Collects a native confirmation and the application input preference. @param kind - Active warning. @returns Whether to proceed. */
  private async Confirm(kind: PasteConfirmation): Promise<boolean> {
    const response = await this.dialogs.Request({ kind });
    if (response.kind !== "accepted" || response.result instanceof ScAsciiOptions) return false;
    if (kind === "replace") this.warnReplace = response.result.warnAgain;
    return response.result.accepted;
  }

  /** Pastes a native clip and publishes the resulting selection. @param clip - Actual clipboard document. @param flags - Original insertion mask. @param transpose - Original transpose flag. @returns Whether pasted. */
  private PasteDocument(clip: ScDocument, flags: InsertDeleteFlags, transpose: boolean): boolean {
    const ok = this.controller
      .GetViewShell()
      .PasteFromClip(flags, clip, ScPasteFunc.NONE, false, transpose);
    if (ok) this.controller.SyncSheetView();
    return ok;
  }
}

/** Reads clipboard text and, if present, the corresponding custom transfer identity. @returns Browser transfer. */
async function ReadSystemTransfer(): Promise<Transfer> {
  const clipboard = globalThis.navigator.clipboard;
  if (clipboard?.read) {
    try {
      for (const entry of await clipboard.read()) {
        if (!entry.types.includes(plainType)) continue;
        const plainText = await (await entry.getType(plainType)).text();
        const token = entry.types.includes(webCalcType)
          ? await (await entry.getType(webCalcType)).text()
          : "";
        return { plainText, token };
      }
    } catch {
      // The browser can permit readText even when item access is unavailable.
    }
  }
  return { plainText: await clipboard.readText(), token: "" };
}
