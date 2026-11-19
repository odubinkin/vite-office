/** @fileoverview XLSX workbook definitions and their native Calc name objects. */
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { ScAddress } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import {
  InsertRangeNames,
  RangeDataType,
  type RangeNameDefinition,
} from "../../core/tool/rangenam";
import { readStyleBool, styleIndex } from "./stylesbuffer";
import { extractCellRangeList } from "./formulabase";
import type { ExternalLinkBuffer } from "./externallinkbuffer";

/** Original model flags used by the represented name importer. */
interface DefinedNameModel {
  name: string;
  sheet: number;
  hidden: boolean;
  unsupported: boolean;
  formula: string;
}

/** Workbook-wide model, collected before native cells are created. */
export class DefinedNamesBuffer {
  private readonly names: DefinedNameModel[] = [];
  private current: DefinedNameModel | undefined;

  /** Reads the original name, flag and optional sheet attributes. @param attribute - Workbook attribute accessor. @returns Nothing. */
  importDefinedName(attribute: (name: string) => string): void {
    this.current = {
      name: attribute("name"),
      sheet: styleIndex(attribute("localSheetId")),
      hidden: readStyleBool(attribute("hidden"), false),
      unsupported:
        readStyleBool(attribute("function"), false) ||
        readStyleBool(attribute("vbProcedure"), false),
      formula: "",
    };
    this.names.push(this.current);
  }

  /** Collects the formula as delivered by the stream. @param text - Character data. @returns Nothing. */
  appendFormula(text: string): void {
    if (this.current) this.current.formula += text;
  }

  /** Releases the active definition. @returns Nothing. */
  finishDefinedName(): void {
    this.current = undefined;
  }

  /** Installs each represented native name before any worksheet formula compiles. @param document - Destination workbook. @param links - Source external workbook relationship list. @returns Nothing. */
  finalizeImport(document: ScDocument, links: ExternalLinkBuffer): void {
    const definitions: RangeNameDefinition[] = [];
    for (const model of this.names) {
      if (!model.name || model.unsupported || model.sheet >= document.GetTableCount()) continue;
      const symbol = model.formula.trim();
      if (!links.isValidDefinedName(symbol)) continue;
      let type = model.hidden ? RangeDataType.Hidden : RangeDataType.Name;
      const builtin = builtinNames.get(model.name.toUpperCase());
      if (builtin && model.sheet >= 0) type |= builtin[1];
      definitions.push({
        name: builtin ? "Excel_BuiltIn_" + builtin[0] : model.name,
        scope: model.sheet,
        pos: new ScAddress(0, 0, Math.max(model.sheet, 0)),
        type,
        symbol,
      });
    }
    InsertRangeNames(document, definitions, FormulaGrammar.Grammar.GRAM_OOXML);
    for (const { name, scope, type } of definitions) {
      if (!(type & (RangeDataType.PrintArea | RangeDataType.RowHeader | RangeDataType.ColHeader)))
        continue;
      const table = document.FetchTable(scope);
      const definition = table?.GetRangeName().findByUpperName(name.toUpperCase());
      if (!table || !definition) continue;
      const ranges = extractCellRangeList(document, definition, scope);
      if (type & RangeDataType.PrintArea) {
        if (ranges.length === 0) continue;
        table.ClearPrintRanges();
        for (const range of ranges) table.AddPrintRange(range);
      } else {
        let rowTitles = false;
        let columnTitles = false;
        for (const range of ranges) {
          const fullRow = range.aStart.Col() === 0 && range.aEnd.Col() >= document.MaxCol();
          const fullColumn = range.aStart.Row() === 0 && range.aEnd.Row() >= document.MaxRow();
          if (fullRow && !fullColumn && !rowTitles) {
            table.SetRepeatRowRange(range);
            rowTitles = true;
          } else if (fullColumn && !fullRow && !columnTitles) {
            table.SetRepeatColRange(range);
            columnTitles = true;
          }
        }
      }
    }
  }
}

const builtinNames = new Map<string, readonly [string, RangeDataType]>([
  ["_XLNM.PRINT_AREA", ["Print_Area", RangeDataType.PrintArea]],
  ["_XLNM.PRINT_TITLES", ["Print_Titles", RangeDataType.RowHeader | RangeDataType.ColHeader]],
  ["_XLNM._FILTERDATABASE", ["_FilterDatabase", RangeDataType.Criteria]],
  ["_XLNM.CRITERIA", ["Criteria", RangeDataType.Criteria]],
  ["_XLNM.CONSOLIDATE_AREA", ["Consolidate_Area", RangeDataType.Name]],
  ["_XLNM.AUTO_OPEN", ["Auto_Open", RangeDataType.Name]],
  ["_XLNM.AUTO_CLOSE", ["Auto_Close", RangeDataType.Name]],
  ["_XLNM.EXTRACT", ["Extract", RangeDataType.Name]],
  ["_XLNM.DATABASE", ["Database", RangeDataType.Name]],
  ["_XLNM.RECORDER", ["Recorder", RangeDataType.Name]],
  ["_XLNM.DATA_FORM", ["Data_Form", RangeDataType.Name]],
  ["_XLNM.AUTO_ACTIVATE", ["Auto_Activate", RangeDataType.Name]],
  ["_XLNM.AUTO_DEACTIVATE", ["Auto_Deactivate", RangeDataType.Name]],
  ["_XLNM.SHEET_TITLE", ["Sheet_Title", RangeDataType.Name]],
]);
