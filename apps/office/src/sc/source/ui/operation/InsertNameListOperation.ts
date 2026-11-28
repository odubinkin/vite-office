/** @fileoverview Source Paste List writes names and formula text in two columns. */
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import { GetCollator } from "../../core/tool/queryentry";
import { RangeDataType } from "../../core/tool/rangenam";
import { ScSetStringParam } from "../../core/tool/stringutil";
import type { ScDocShell } from "../docshell/docsh";
import { ScEditableTester } from "../docshell/editable";
import { ScUndoListNames, nameListSnapshotFlags } from "../undo/undoblk";

/** Writes the source visible name listing with local scope shadowing. */
export class InsertNameListOperation {
  /** Borrows the actual cell destination. @param shell - Workbook. @param start - Upper-left cell. @returns Operation. */
  constructor(
    private readonly shell: ScDocShell,
    private readonly start: ScAddress,
  ) {}

  /** Writes and records one editable block. @returns Whether inserted. */
  run(): boolean {
    const doc = this.shell.GetDocument();
    const tab = this.start.Tab();
    const local = doc.GetRangeName(tab);
    if (!local) return false;
    const names = [
      ...local,
      ...Array.from(doc.GetRangeName() ?? []).filter(
        /** Keeps global range names that are not shadowed by a local name. @param entry - Global range name. @returns Whether the global name is visible. */ (
          entry,
        ) => !local.findByUpperName(entry.GetUpperName()),
      ),
    ].filter(
      /** Removes database-only entries from Insert Name List. @param entry - Native range name. @returns Whether the range name can be listed. */ (
        entry,
      ) => !(entry.type & RangeDataType.Database),
    );
    const collator = GetCollator();
    names.sort(
      /** Orders names by the collator used for Insert Name List. @param a - First name entry. @param b - Second name entry. @returns Relative name order. */ (
        a,
        b,
      ) => collator.compare(a.name, b.name),
    );
    const col = this.start.Col(),
      row = this.start.Row();
    const last = row + names.length - 1;
    if (
      !names.length ||
      col >= doc.MaxCol() ||
      last > doc.MaxRow() ||
      !ScEditableTester.CreateAndTestBlock(doc, tab, col, row, col + 1, last).IsEditable()
    )
      return false;
    const target = new ScRange(col, row, tab, col + 1, last, tab);
    const definitions = names.map(
      /** Builds the name and address-relative formula used for each inserted row. @param entry - Native range name. @param index - Output row offset. @returns Name and resolved formula text. */ (
        entry,
        index,
      ) => ({
        name: entry.name,
        symbol: "=" + entry.GetSymbol(doc.GetGrammar(), new ScAddress(col, row + index, tab)),
      }),
    );
    const history = this.shell.GetUndoManager();
    const snapshot =
      /** Copies the original document cells for Insert Name List undo. @returns Document snapshot recorded by the undo operation. */ (): ScDocument => {
        const copy = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO);
        copy.InitUndo(doc, tab, tab);
        doc.CopyToDocument(target, nameListSnapshotFlags, false, copy);
        return copy;
      };
    const before = history.GetMaxUndoActionCount() > 0 ? snapshot() : null;
    const parameter = new ScSetStringParam();
    parameter.setTextInput();
    for (const [index, entry] of definitions.entries()) {
      const name = unicode(entry.name);
      const definition = unicode(entry.symbol);
      try {
        doc.SetString(new ScAddress(col, row + index, tab), name, parameter);
        doc.SetString(new ScAddress(col + 1, row + index, tab), definition, parameter);
      } finally {
        name.dispose();
        definition.dispose();
      }
    }
    if (before) history.AddUndoAction(new ScUndoListNames(target, before, snapshot()));
    this.shell
      .GetDocFunc()
      .AdjustRowHeight(new ScRange(0, row, tab, doc.MaxCol(), last, tab), true, true);
    this.shell.SetDocumentModified();
    return true;
  }
}
