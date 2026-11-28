/** @fileoverview Calc's pinned SetNormalStringOperation over plain input and direct-formats undo. */
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import type { SfxUInt32Item } from "../../../../svl/source/items/intitem";
import { ScRange, type ScAddress } from "../../../inc/address";
import { ScCellValue } from "../../../inc/cellvalue";
import { CellType, HasAttrFlags } from "../../../inc/global";
import { ATTR_VALUE_FORMAT } from "../../../inc/scitems";
import type { ScDocFunc } from "../docshell/docfunc";
import type { ScDocShell } from "../docshell/docsh";
import { ScEditableTester } from "../docshell/editable";
import { ScUndoEnterData } from "../inc/undocell";
import { Operation, OperationType } from "./Operation";

/** Writes and records recognized normal cell input through the existing native document. */
export class SetNormalStringOperation extends Operation {
  private mbIsNumberFormatSet = false;

  /** Borrows the live document and current input for the duration of the command.
   * @param docFunc - Document operation owner.
   * @param shell - Document shell.
   * @param position - Target address.
   * @param source - Normal text input.
   * @param api - API invocation.
   * @returns The operation for the cell input.
   */
  constructor(
    private readonly docFunc: ScDocFunc,
    private readonly shell: ScDocShell,
    private readonly position: ScAddress,
    private readonly source: OUStringConstReference,
    api: boolean,
  ) {
    super(OperationType.SetNormalString, true, api);
  }

  /** Returns the native recognizer result saved by the operation. @returns Format overwrite flag. */
  isNumberFormatSet(): boolean {
    return this.mbIsNumberFormatSet;
  }

  /** Checks editability, records the prior format and commits through ScDocument.SetString. @returns Success. */
  protected override runImplementation(): boolean {
    const doc = this.shell.GetDocument();
    const pos = this.position;
    const editable = ScEditableTester.CreateAndTestBlock(
      doc,
      pos.Tab(),
      pos.Col(),
      pos.Row(),
      pos.Col(),
      pos.Row(),
    );
    if (!editable.IsEditable()) {
      if (!this.mbApi) this.shell.ErrorMessage(editable.GetMessageId());
      return false;
    }
    const oldEdit = doc.GetCellType(pos) === CellType.CELLTYPE_EDIT;
    const oldValue = new ScCellValue();
    oldValue.assign(doc, pos);
    const direct = doc.GetPattern(pos)?.GetItemSet().GetItemIfSet(ATTR_VALUE_FORMAT, false) as
      SfxUInt32Item | undefined;
    const oldFormat = direct?.GetValue();
    try {
      this.mbIsNumberFormatSet = doc.SetString(pos, this.source);
      this.shell
        .GetUndoManager()
        .AddUndoAction(new ScUndoEnterData(this.shell, pos, oldValue, oldFormat, this.source));
    } finally {
      oldValue.clear();
    }
    const range = new ScRange(pos);
    if (oldEdit || doc.HasAttrib(range, HasAttrFlags.NeedHeight))
      this.docFunc.AdjustRowHeight(range, true, this.mbApi);
    this.shell.SetDocumentModified();
    return true;
  }
}
