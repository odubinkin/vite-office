/** @fileoverview Source conditional-format reference input and rule editor session. */
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SfxStyleFamily } from "../../../../svl/inc/style-values";
import { ScAddress, ScRange, ScRefFlags } from "../../../inc/address";
import { ScCondFormatItem } from "../../../inc/attrib";
import { ScConditionalFormat, ScConditionMode } from "../../../inc/conditio";
import type { ScDocument } from "../../../inc/document";
import { ScRangeList } from "../../../inc/rangelst";
import { ATTR_CONDITIONAL } from "../../../inc/scitems";
import type { ScViewData } from "../inc/viewdata";
import {
  NewConditionalRule,
  ReadConditionalRule,
  CreateConditionalRule,
  type ConditionalRuleDraft,
  type ConditionalRuleKind,
} from "./condformatdlgentry";

/** Formats the original reference in the workbook convention. @param range - Actual cells. @param doc - Active workbook. @param flags - Display or absolute reference flags. @returns Reference text. */
export function FormatConditionalRange(
  range: ScRange,
  doc: ScDocument,
  flags = ScRefFlags.RANGE_ABS,
): string {
  const value = range.Format(doc, flags, new ScAddress.Details(doc.GetAddressConvention(), 0, 0));
  try {
    return text(value);
  } finally {
    value.dispose();
  }
}

/** Projects a list in source order and omits repeated active sheet names. @param ranges - Actual marked ranges. @param doc - Workbook. @returns Range list text. */
export function FormatConditionalRanges(ranges: ScRangeList, doc: ScDocument): string {
  return Array.from(ranges, (range) => FormatConditionalRange(range, doc, ScRefFlags.VALID)).join(
    ";",
  );
}

/** Resolves semicolon-delimited original references on the edited sheet. @param value - Entered range list. @param doc - Actual workbook. @param tab - Default and required sheet. @returns Valid ranges or absence. */
export function ParseConditionalRanges(
  value: string,
  doc: ScDocument,
  tab: number,
): ScRangeList | undefined {
  const delimiters = /;(?![^']*'(?:[^']*'[^']*')*[^']*$)/u;
  const result = new ScRangeList();
  const details = new ScAddress.Details(doc.GetAddressConvention(), 0, 0);
  for (const part of value.split(delimiters)) {
    const native = unicode(part.trim());
    const range = new ScRange(0, 0, tab);
    try {
      if (
        !(range.ParseAny(native, doc, details) & ScRefFlags.VALID) ||
        range.aStart.Tab() !== tab ||
        range.aEnd.Tab() !== tab
      )
        return undefined;
      range.PutInOrder();
      result.push_back(range);
    } finally {
      native.dispose();
    }
  }
  return result;
}

/** Reads the source marks with the cursor fallback. @param view - Active sheet view. @returns Selected ranges. */
export function ConditionalSelection(view: ScViewData): ScRangeList {
  const marks = view.GetMarkData().GetMarkedRangesForTab(view.CurrentTabForData());
  if (!marks.empty()) return marks;
  return new ScRangeList(new ScRange(view.GetCurX(), view.GetCurY(), view.CurrentTabForData()));
}

/** Finds the native rule by the cursor's format keys and the relevant source command's range test. @param view - Active sheet view. @param current - Original context-menu current format mode. @returns Matching source rule. */
export function FindConditionalFormat(
  view: ScViewData,
  current: boolean,
): ScConditionalFormat | undefined {
  const doc = view.GetDocument();
  const tab = view.CurrentTabForData();
  const cursor = new ScAddress(view.GetCurX(), view.GetCurY(), tab);
  const keys = (
    doc.GetPattern(cursor)?.GetItem(ATTR_CONDITIONAL) as ScCondFormatItem | undefined
  )?.GetCondFormatData();
  const sheet = doc.FetchTable(tab);
  if (!keys || !sheet) return undefined;
  const ranges = ConditionalSelection(view);
  for (const key of keys) {
    const format = sheet.GetCondFormList().GetFormat(key);
    if (format && (current || format.GetRange().equals(ranges))) return format;
  }
  return undefined;
}

/** A validated editor response owns a replacement or an explicit deletion. */
export interface ConditionalFormatResult {
  readonly format: ScConditionalFormat | null;
  readonly ranges: ScRangeList;
}

/** Models the source ScCondFormatDlg before any live document modification. */
export class ScCondFormatDlg {
  readonly key: number;
  readonly styles: readonly string[];
  readonly rangeText: string;
  readonly rules: readonly ConditionalRuleDraft[];
  private readonly position: ScAddress;
  private readonly original = new Map<
    ConditionalRuleDraft,
    NonNullable<ReturnType<ScConditionalFormat["GetEntry"]>>
  >();

  /** Resolves original marks, active format and actual style family. @param document - Workbook. @param tab - Active sheet. @param selection - Cursor fallback or current marks. @param kind - Starting page. @param existing - Edited group, when opening an existing rule. @param easyMode - Fixed quick-format mode, when requested. @returns Dialog session. */
  constructor(
    readonly document: ScDocument,
    readonly tab: number,
    selection: ScRangeList,
    kind: ConditionalRuleKind,
    existing?: ScConditionalFormat,
    readonly easyMode?: ScConditionMode,
  ) {
    const ranges = existing?.GetRange() ?? selection;
    this.position = ranges.GetTopLeftCorner();
    this.key = existing?.GetKey() ?? 0;
    const pool = document.GetStyleSheetPool();
    const names = new Set(pool?.GetStandardCellStyleNames());
    pool?.GetDefaultStyle(true);
    const iterator = pool?.CreateIterator(SfxStyleFamily.Para);
    for (let style = iterator?.First(); style; style = iterator?.Next())
      names.add(text(style.GetName()));
    this.styles = [...names].sort();
    this.rangeText = FormatConditionalRanges(ranges, document);
    const rules: ConditionalRuleDraft[] = [];
    if (existing) {
      for (let index = 0; index < existing.size(); index++) {
        const entry = existing.GetEntry(index);
        if (entry) {
          const draft = ReadConditionalRule(entry);
          this.original.set(draft, entry);
          rules.push(draft);
        }
      }
    } else {
      const draft = this.NewRule(kind);
      rules.push(easyMode === undefined ? draft : { ...draft, mode: easyMode });
    }
    this.rules = rules;
  }

  /** Uses the first original named style entry. @param kind - New source rule page. @returns Draft. */
  NewRule(kind: ConditionalRuleKind): ConditionalRuleDraft {
    return NewConditionalRule(kind, this.styles[0] ?? "Default");
  }

  /** Resolves references and constructs the owned source item. @param value - Entered ranges. @param rules - Ordered entry drafts. @returns Native result or undefined when the range is invalid. */
  CreateResult(
    value: string,
    rules: readonly ConditionalRuleDraft[],
  ): ConditionalFormatResult | undefined {
    if (!rules.length) return { format: null, ranges: new ScRangeList() };
    const ranges = ParseConditionalRanges(value, this.document, this.tab);
    if (!ranges) return undefined;
    const position = this.key ? this.position : ranges.GetTopLeftCorner();
    const format = new ScConditionalFormat(0, this.document);
    format.SetRange(ranges);
    for (const rule of rules) {
      const original = this.original.get(rule);
      const draft =
        this.easyMode === ScConditionMode.ContainsText
          ? { ...rule, first: '"' + rule.first + '"' }
          : rule;
      format.AddEntry(
        original?.Clone(this.document) ?? CreateConditionalRule(draft, this.document, position),
      );
    }
    return { format, ranges };
  }
}
