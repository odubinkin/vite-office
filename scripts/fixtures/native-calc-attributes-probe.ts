/** @fileoverview Actual Calc import attribute/merge owners and original OOXML sheet-data values in main and DOM-free Worker; not full worksheet filtering. */
import { probeNativeCalcModelServices } from "./native-calc-model-services-probe";
import {
  CellModel,
  CellFormulaModel,
  XfIdRowRange,
  MergedRange,
} from "../../apps/office/src/sc/source/filter/inc/sheetdatabuffer";
import { ValueRange, ValueRangeSet } from "../../apps/office/src/oox/inc/helper/containerhelper";
import { getTokenFromUtf8 as token } from "../../apps/office/src/oox/source/token/tokenmap";
import { ScDocument } from "../../apps/office/src/sc/inc/document";
import { ScDocumentImport } from "../../apps/office/src/sc/inc/documentimport";
import { ScAttrEntry } from "../../apps/office/src/sc/inc/attarray";
import { ScAddress, ScAddressDetails, ScRefFlags } from "../../apps/office/src/sc/inc/address";
import { FormulaGrammar } from "../../apps/office/src/formula/inc/grammar";
import { ScMergeAttr } from "../../apps/office/src/sc/inc/attrib";
import { ATTR_MERGE } from "../../apps/office/src/sc/inc/scitems";
import { SvtScriptType } from "../../apps/office/src/svl/inc/languageoptions";
import { unicode, text } from "../../apps/office/src/i18nlangtag/source/isolang/isolang.tables";
/** Imports genuine canonical attributes and scalar values, then finalizes metadata. @returns Public model observations. */
export function probeNativeCalcAttributes() {
  const document = new ScDocument(),
    name = unicode("Imported");
  try {
    document.InsertTab(0, name);
  } finally {
    name.dispose();
  }
  const importer = new ScDocumentImport(document),
    attrs = new ScDocumentImport.Attrs(),
    entry = new ScAttrEntry();
  entry.setScPatternAttr(document.getCellAttributeHelper().getDefaultCellAttribute());
  entry.nEndRow = document.MaxRow();
  attrs.mvData.push(entry);
  attrs.mbLatinNumFmtOnly = true;
  importer.setAttrEntries(0, 0, document.MaxCol(), attrs);
  const cell = new CellModel(),
    formula = new CellFormulaModel(),
    rows = new XfIdRowRange(),
    ranges = new ValueRangeSet();
  const reference = unicode("R[-1]C[-1]"),
    details = new ScAddressDetails(FormulaGrammar.AddressConvention.CONV_XL_R1C1, 3, 2);
  let r1c1: boolean;
  try {
    const flags = cell.maCellAddr.Parse(reference, document, details),
      rendered = cell.maCellAddr.Format(ScRefFlags.ADDR_ABS, document, details);
    try {
      r1c1 = Boolean(flags & ScRefFlags.VALID) && text(rendered) === "R3C2";
    } finally {
      rendered.dispose();
    }
  } finally {
    reference.dispose();
  }
  importer.setNumericCell(cell.maCellAddr, 42);
  formula.maFormulaRef.aStart.assign(cell.maCellAddr);
  formula.maFormulaRef.aEnd.Set(3, 4, 0);
  rows.set(2, 7);
  const expandedRows = rows.tryExpand(3, 7),
    mergeCandidate = new MergedRange(cell.maCellAddr, token("fill"));
  ranges.insert(new ValueRange(2, 4));
  ranges.insert(new ValueRange(3, 8));
  importer.setMergedCells(0, 1, 2, 3, 4);
  importer.finalize();
  const column = document.FetchTable(0)?.FetchColumn(1),
    merge = column?.GetPattern(2)?.GetItem(ATTR_MERGE) as ScMergeAttr;
  return {
    r1c1,
    models:
      cell.mnXfId === -1 &&
      formula.isValidSharedRef(new ScAddress(2, 3, 0)) &&
      expandedRows &&
      mergeCandidate.tryExpand(new ScAddress(2, 2, 0), token("fill")) &&
      ranges.getRanges()[0]?.mnLast === 8,
    moved: attrs.mvData.length === 0,
    value: document.GetValue(new ScAddress(1, 2, 0)),
    latin: column?.GetCellTextAttr(2)?.mnScriptType === SvtScriptType.LATIN,
    merged: merge.GetColMerge() === 3 && merge.GetRowMerge() === 3,
    services: probeNativeCalcModelServices(document),
  };
}
