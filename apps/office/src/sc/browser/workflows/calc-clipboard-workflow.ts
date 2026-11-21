/** @fileoverview Browser projection of Calc Copy, Paste and Paste Unformatted slots. */
import { copyPlainText } from "../../../vcl/browser/browser-clipboard";
import { SfxDialogController } from "../../../sfx2/source/dialog/basedlgs";
import { SfxInterface } from "../../../sfx2/source/control/objface";
import { createSfxShell, type SfxShell } from "../../../sfx2/source/control/shell";
import type { SfxDispatcher } from "../../../sfx2/source/control/dispatch";
import { ScAddress, ScRange } from "../../inc/address";
import type { ScDocument } from "../../inc/document";
import { scPasteResourcesEnglish } from "../../inc/globstr";
import { ScMarkData } from "../../inc/markdata";
import { InsertDeleteFlags, InsCellCmd, ScInputMode, ScPasteFunc } from "../../inc/global";
import type { ScAsciiOptions } from "../../source/ui/dbgui/asciiopt";
import { ScMarkType } from "../../source/ui/inc/viewdata";
import {
  defaultPasteSpecial,
  GetInsContentsCmdBits,
  type ScInsertContentsResponse,
  type ScInsertContentsState,
} from "../../source/ui/miscdlgs/inscodlg";
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
export const pasteTextImportCommand = ".uno:PasteTextImportDialog";

/** The portable text format and the separate native command offered by Paste Special. */
export type ClipboardFormatChoice = typeof plainType | typeof pasteTextImportCommand;

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
  readonly skipEmpty?: boolean;
}

/** The source paste slots share the clipboard read and selection validation. */
type PasteRequest =
  | { readonly kind: "normal"; readonly transfer?: Transfer }
  | { readonly kind: "unformatted" | "special" | "textImport" }
  | ({ readonly kind: "owned" } & OwnedPasteOptions);

/** Native source separator selection, separate from the final filter option flags. */
export type TextImportSeparatorMode = "detected" | "separated" | "fixed";
/** Original Text Import dialog invocation profiles exposed in the Calc workspace. */
export type TextImportCall = "clipboard" | "textToColumns";

/** ClipboardTextImport dialog settings saved on acceptance. */
export interface PasteTextPreferences {
  readonly mode: TextImportSeparatorMode;
  readonly options: ScAsciiOptions;
}

/** Original Text Import dialog inputs for a text transfer. */
export interface PasteTextRequest {
  readonly call: TextImportCall;
  readonly text: string;
  readonly preferences: PasteTextPreferences;
  readonly fixedSplits: readonly number[];
}

/** The ruler keeps its positions when the dialog closes, independently of the import decision. */
export type PasteTextResult = { readonly fixedSplits: readonly number[] } & (
  | { readonly accepted: false }
  | {
      readonly accepted: true;
      readonly options: ScAsciiOptions;
      readonly preferences: PasteTextPreferences;
    }
);

/** Native clipboard confirmation before changing the sheet. */
export type PasteConfirmation = "replace" | "larger";

/** A pending text import or source paste confirmation. */
type PasteDialogRequest =
  | ({ readonly kind: "text" } & PasteTextRequest)
  | { readonly kind: PasteConfirmation }
  | { readonly kind: "special"; readonly initial: ScInsertContentsState }
  | { readonly kind: "format" };

/** The warning checkbox applies independently of the Yes or No response. */
export interface PasteConfirmationResult {
  readonly accepted: boolean;
  readonly warnAgain: boolean;
}

/** Routes native commands through real browser Clipboard actions and source document owners. */
export class CalcClipboardWorkflow {
  readonly dialogs = new SfxDialogController<
    PasteDialogRequest,
    PasteTextResult | PasteConfirmationResult | ScInsertContentsResponse | ClipboardFormatChoice
  >();
  private owned: OwnedTransfer | undefined;
  private readonly textPreferences: Record<TextImportCall, PasteTextPreferences> = {
    clipboard: { mode: "detected", options: ClipboardTextOptions(true) },
    textToColumns: {
      mode: "detected",
      options: Object.assign(ClipboardTextOptions(true), { bSkipEmptyCells: false }),
    },
  };
  private fixedSplits: readonly number[] = [];
  private special = defaultPasteSpecial;
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
        execute: (workflow) => workflow.Paste({ kind: "normal" }),
      },
      {
        commandUrl: ".uno:PasteUnformatted",
        slotId: 5314,
        label: "Paste Unformatted Text",
        shortcuts: ["Ctrl+Alt+Shift+V", "Meta+Alt+Shift+V"],
        getState: (workflow) => ({ enabled: workflow.CanRead() }),
        execute: (workflow) => workflow.Paste({ kind: "unformatted" }),
      },
      {
        commandUrl: pasteTextImportCommand,
        slotId: 5805,
        label: "Use Text Import Dialog",
        getState: (workflow) => ({ enabled: workflow.CanRead() }),
        execute: (workflow) => workflow.Paste({ kind: "textImport" }),
      },
      ...pasteOnlySlots.map(({ flags, ...slot }) => ({
        ...slot,
        getState: (workflow: CalcClipboardWorkflow) => ({ enabled: workflow.CanPasteOwned() }),
        execute: (workflow: CalcClipboardWorkflow) => workflow.Paste({ kind: "owned", flags }),
      })),
      {
        commandUrl: ".uno:PasteTransposed",
        slotId: 5808,
        label: "Paste Transposed",
        getState: (workflow) => ({ enabled: workflow.CanPasteOwned() }),
        execute: (workflow) => workflow.Paste({ kind: "owned", transpose: true }),
      },
      {
        commandUrl: ".uno:PasteSpecial",
        slotId: 5311,
        label: "Paste Special",
        shortcuts: ["Ctrl+Shift+V", "Meta+Shift+V"],
        getState: (workflow) => ({ enabled: workflow.CanRead() }),
        execute: (workflow) => workflow.PasteSpecial(),
      },
    ]),
  );

  /** Binds the clipboard slots to their native workbook and view owners. @param controller - Active view. @param canOpen - Native dialog admission. @param dispatcher - Active view dispatcher. @returns Workflow. */
  constructor(
    private readonly controller: CalcViewController,
    private readonly canOpen: () => boolean,
    private readonly dispatcher: SfxDispatcher,
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
    void this.Paste({ kind: "normal", transfer });
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

  /** Runs the chosen format or dispatches the source command after the format dialog closes. @returns Whether pasted. */
  private async PasteSpecial(): Promise<boolean> {
    const result = await this.Paste({ kind: "special" });
    if (result !== pasteTextImportCommand) return result;
    const dispatched = this.dispatcher.Execute(pasteTextImportCommand);
    return dispatched.status === "executed" && (await dispatched.value) === true;
  }

  /** Applies the clipboard transfer to the active selection or returns the selected native command. @param request - Source paste slot and optional native transfer data. @returns Paste outcome. */
  private async Paste(request: PasteRequest): Promise<boolean | typeof pasteTextImportCommand> {
    const { kind } = request;
    if (!this.CanUseCells() || this.reading || (kind === "owned" && !this.CanPasteOwned()))
      return false;
    this.reading = true;
    const { controller } = this;
    const doc = controller.shell.GetDocument();
    const revision = controller.GetCommandStateRevision();
    try {
      const transfer =
        (request.kind === "normal" ? request.transfer : undefined) ?? (await ReadSystemTransfer());
      /** Checks that the browser response still targets the initiating selection. @returns Whether current. */
      const current = (): boolean =>
        !this.closed &&
        doc === controller.shell.GetDocument() &&
        revision === controller.GetCommandStateRevision();
      if (!current()) return false;
      const owned = this.owned;
      if (
        kind !== "unformatted" &&
        kind !== "textImport" &&
        owned?.source === doc &&
        owned.token === transfer.token
      ) {
        const chosen =
          kind === "special"
            ? await this.PasteSpecialOptions()
            : kind === "owned"
              ? request
              : undefined;
        if ((kind === "special" && !chosen) || !current()) return false;
        return await this.PasteOwned(owned.clip, doc, current, chosen);
      }
      if (kind === "owned" || !transfer.plainText) return false;
      if (kind === "special") {
        const response = await this.dialogs.Request({ kind: "format" });
        if (response.kind !== "accepted" || !current()) return false;
        if (response.result === pasteTextImportCommand) return pasteTextImportCommand;
        if (response.result !== plainType) return false;
      }

      const range = new ScRange();
      const view = controller.viewData;
      const simple = view.GetSimpleArea(range) === ScMarkType.SC_MARK_SIMPLE;
      if (!simple && kind !== "textImport") return false;
      const origin = simple ? range.aStart : new ScAddress(view.GetCurX(), view.GetCurY(), 0);
      origin.SetTab(view.CurrentTabForData());
      let options = ClipboardTextOptions();
      const newline = transfer.plainText.indexOf("\n");
      if (kind === "textImport" || (newline >= 0 && newline < transfer.plainText.length - 1)) {
        const chosen = await this.RequestTextOptions("clipboard", transfer.plainText, current);
        if (!chosen) return false;
        options = chosen;
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

  /** Opens the shared ASCII dialog with the source call mode's settings. @param call - Original invocation profile. @param text - Source text. @param current - Command target validation. @returns Options if accepted. */
  async RequestTextOptions(
    call: TextImportCall,
    text: string,
    current: () => boolean,
  ): Promise<ScAsciiOptions | undefined> {
    const response = await this.dialogs.Request({
      kind: "text",
      call,
      text,
      preferences: this.textPreferences[call],
      fixedSplits: this.fixedSplits,
    });
    if (
      response.kind !== "accepted" ||
      typeof response.result !== "object" ||
      !("fixedSplits" in response.result) ||
      !current()
    )
      return undefined;
    this.fixedSplits = response.result.fixedSplits;
    if (!response.result.accepted) return undefined;
    this.textPreferences[call] = response.result.preferences;
    return response.result.options;
  }

  /** Uses the same source ScReplaceWarnBox input preference for paste and text overwrite. @returns Whether to proceed. */
  async ConfirmReplacement(): Promise<boolean> {
    return !this.warnReplace || (await this.Confirm("replace"));
  }

  /** Collects source choices and retains the original dialog options between requests. @returns Confirmed native options. */
  private async PasteSpecialOptions(): Promise<OwnedPasteOptions | undefined> {
    const response = await this.dialogs.Request({ kind: "special", initial: this.special });
    if (
      response.kind !== "accepted" ||
      typeof response.result !== "object" ||
      !("selection" in response.result)
    )
      return undefined;
    const { accepted, selection } = response.result;
    // The source destructor retains the options even on Cancel. The checks are committed on OK.
    this.special = {
      all: false,
      flags: accepted ? selection.flags : this.special.flags,
      skipEmpty: selection.skipEmpty,
      transpose: selection.transpose,
    };
    return accepted
      ? {
          flags: GetInsContentsCmdBits(selection),
          transpose: selection.transpose,
          skipEmpty: selection.skipEmpty,
        }
      : undefined;
  }

  /** Implements the native confirmation sequence for internal paste. @param clip - In-workbook clipboard. @param doc - Active document. @param current - Revalidates the initiating view after a modal. @param native - Native clip-only options. @returns Whether pasted. */
  private async PasteOwned(
    clip: ScDocument,
    doc: ScDocument,
    current: () => boolean,
    {
      flags = calcCellClipboardFlags,
      transpose = false,
      skipEmpty = false,
    }: OwnedPasteOptions = {},
  ): Promise<boolean> {
    if (flags === InsertDeleteFlags.NONE) return false;
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
      flags & InsertDeleteFlags.CONTENTS &&
      this.warnReplace &&
      [...marks].some((tab) => !doc.IsBlockEmpty(startCol, startRow, endCol, endRow, tab)) &&
      (!(await this.Confirm("replace")) || !current())
    )
      return false;

    if (!enlarge) return this.PasteDocument(clip, flags, transpose, skipEmpty);
    const previous = new ScMarkData(marks);
    let pasted = false;
    try {
      marks.SetMarkArea(range);
      pasted = this.PasteDocument(clip, flags, transpose, skipEmpty);
      return pasted;
    } finally {
      if (!pasted) marks.assign(previous);
    }
  }

  /** Collects a native confirmation and the application input preference. @param kind - Active warning. @returns Whether to proceed. */
  private async Confirm(kind: PasteConfirmation): Promise<boolean> {
    const response = await this.dialogs.Request({ kind });
    if (
      response.kind !== "accepted" ||
      typeof response.result !== "object" ||
      !("warnAgain" in response.result)
    )
      return false;
    if (kind === "replace") this.warnReplace = response.result.warnAgain;
    return response.result.accepted;
  }

  /** Pastes a native clip and publishes the resulting selection. @param clip - Actual clipboard document. @param flags - Original insertion mask. @param transpose - Original transpose flag. @param skipEmpty - Original skip-empty option. @returns Whether pasted. */
  private PasteDocument(
    clip: ScDocument,
    flags: InsertDeleteFlags,
    transpose: boolean,
    skipEmpty: boolean,
  ): boolean {
    const ok = this.controller
      .GetViewShell()
      .PasteFromClip(flags, clip, ScPasteFunc.NONE, skipEmpty, transpose);
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
