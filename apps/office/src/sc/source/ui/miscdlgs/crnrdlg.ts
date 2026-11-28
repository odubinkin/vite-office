/** @fileoverview Calc source row and column label range draft and reference geometry. */
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScAddress, ScRange, ScRangePair, ScRefFlags } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import type { ScRangePairList } from "../../../inc/rangelst";
import { GetLabelString } from "../../core/tool/compiler.colrowname";
import { GetCollator } from "../../core/tool/queryentry";
import type { ScViewData } from "../inc/viewdata";
import { FormatNameReference } from "../namedlg/namedefdlg";

/** Source label-list entry. */
export interface ScLabelRangeEntry {
  readonly column: boolean;
  readonly pair: ScRangePair;
  readonly title: string;
}

/** Owns cloned label lists until the original reference dialog is accepted. */
export class ScColRowNameRangesDlg {
  readonly document: ScDocument;
  readonly columns: ScRangePairList;
  readonly rows: ScRangePairList;
  label = "";
  data = "";
  column = true;
  area: ScRange | undefined;
  selected: ScLabelRangeEntry | undefined;
  private dataEdited = false;

  /** Takes the native sheet selection and existing label lists. @param view - Active Calc view. @returns Dialog draft. */
  constructor(view: ScViewData) {
    this.document = view.GetDocument();
    this.columns = this.document.GetColNameRanges().Clone();
    this.rows = this.document.GetRowNameRanges().Clone();
    const range = new ScRange();
    view.GetSimpleArea(range);
    this.SetColRowData(range);
    const column = this.GetEntries(true)[0];
    const row = this.GetEntries(false)[0];
    const first = column ?? row;
    if (first) this.Select(first);
  }

  /** Builds the source sorted group with previews of its first four labels. @param column - Column list. @returns Entries. */
  GetEntries(column: boolean): ScLabelRangeEntry[] {
    const list = column ? this.columns : this.rows;
    const pairs = Array.from(
      { length: list.size() },
      /** Reads a range pair from its zero-based position in the native list. @param _ - Unused generated entry. @param index - Native entry index. @returns Range pair at the requested index. */ (
        _,
        index,
      ) => list.at(index),
    );
    const doc = this.document;
    const collator = GetCollator();
    pairs.sort(
      /** Orders label ranges using the source sheet positions and addresses. @param a - First label range pair. @param b - Second label range pair. @returns Relative display order. */ (
        a,
        b,
      ) => {
        const first = a.GetRange(0).aStart,
          second = b.GetRange(0).aStart;
        const firstSheet = doc.FetchTable(first.Tab())?.GetName();
        const secondSheet = doc.FetchTable(second.Tab())?.GetName();
        return (
          (first.Tab() === second.Tab()
            ? 0
            : collator.compare(
                firstSheet ? text(firstSheet) : "",
                secondSheet ? text(secondSheet) : "",
              )) ||
          first.Col() - second.Col() ||
          first.Row() - second.Row()
        );
      },
    );
    return pairs.map(
      /** Builds a dialog row from the native label and corresponding data area. @param pair - Native range pair. @returns Label range row. */ (
        pair,
      ) => {
        const label = pair.GetRange(0),
          start = label.aStart;
        const length = column ? label.aEnd.Col() - start.Col() : label.aEnd.Row() - start.Row();
        const samples: string[] = [];
        for (let offset = 0; offset <= Math.min(length, 3); offset++) {
          const address = new ScAddress(start);
          if (column) address.IncCol(offset);
          else address.IncRow(offset);
          samples.push(GetLabelString(doc, address) ?? "");
        }
        if (length > 3) samples.push("...");
        return {
          column,
          pair,
          title: FormatNameReference(doc, label) + " [" + samples.join(", ") + "]",
        };
      },
    );
  }

  /** Selects a source list entry and its existing data range. @param entry - Selection. @returns Nothing. */
  Select(entry: ScLabelRangeEntry): void {
    this.selected = entry;
    this.dataEdited = false;
    this.column = entry.column;
    this.area = new ScRange(entry.pair.GetRange(0));
    this.label = FormatNameReference(this.document, this.area);
    this.data = FormatNameReference(this.document, entry.pair.GetRange(1));
  }

  /** Computes the original orientation and data extent for a new header. @param range - Label reference. @returns Nothing. */
  SetColRowData(range: ScRange): void {
    const doc = this.document;
    const { aStart, aEnd } = range;
    const width = aEnd.Col() - aStart.Col(),
      height = aEnd.Row() - aStart.Row();
    this.column = width >= height || (aStart.Col() === 0 && aEnd.Col() === doc.MaxCol());
    this.selected = undefined;
    if (this.column && aStart.Row() === 0 && aEnd.Row() === doc.MaxRow()) {
      this.Clear();
      return;
    }
    this.area = new ScRange(range);
    this.label = FormatNameReference(doc, this.area);
    const data = new ScRange(range);
    if (this.column) {
      const bottom = aEnd.Row() === doc.MaxRow();
      data.aStart.SetRow(bottom ? 0 : aEnd.Row() + 1);
      data.aEnd.SetRow(bottom ? aStart.Row() - 1 : doc.MaxRow());
    } else {
      const right = aEnd.Col() === doc.MaxCol();
      data.aStart.SetCol(right ? 0 : aEnd.Col() + 1);
      data.aEnd.SetCol(right ? aEnd.Col() - 1 : doc.MaxCol());
    }
    this.data = FormatNameReference(doc, data);
  }

  /** Updates the reference typed into the label field. @param value - Source field. @returns Nothing. */
  EditLabel(value: string): void {
    const parsed = this.Parse(value);
    if (parsed) this.SetColRowData(parsed);
    else {
      this.area = undefined;
      this.selected = undefined;
      this.label = value;
    }
  }

  /** Aligns a data reference to the label and excludes overlap. @param data - Picked data area. @returns Nothing. */
  SetData(data: ScRange): void {
    if (!this.area) return;
    this.dataEdited = true;
    this.data = FormatNameReference(this.document, this.AdjustColRowData(data, this.area));
  }

  /** Updates the reference typed into the data field. @param value - Source field. @returns Nothing. */
  EditData(value: string): void {
    const data = this.Parse(value);
    if (data && this.area) this.SetData(data);
    else this.data = value;
  }

  /** Adjusts the active axis and its default extent after an orientation change. @param column - Column labels. @returns Nothing. */
  SetOrientation(column: boolean): void {
    if (!this.area || column === this.column) return;
    this.column = column;
    const label = this.area,
      doc = this.document;
    const data = this.Parse(this.data) ?? new ScRange(label);
    if (column) {
      if (label.aStart.Row() === 0 && label.aEnd.Row() === doc.MaxRow())
        label.aEnd.SetRow(doc.MaxRow() - 1);
      data.aStart.SetRow(Math.min(label.aEnd.Row() + 1, doc.MaxRow()));
      data.aEnd.SetRow(doc.MaxRow());
    } else {
      if (label.aStart.Col() === 0 && label.aEnd.Col() === doc.MaxCol())
        label.aEnd.SetCol(doc.MaxCol() - 1);
      data.aStart.SetCol(Math.min(label.aEnd.Col() + 1, doc.MaxCol()));
      data.aEnd.SetCol(doc.MaxCol());
    }
    this.label = FormatNameReference(doc, label);
    this.SetData(data);
  }

  /** Supplies native Add button sensitivity. @returns Whether a new valid pair may be added. */
  CanAdd(): boolean {
    return Boolean(this.area && this.Parse(this.data) && (!this.selected || this.dataEdited));
  }

  /** Replaces an equal header in either orientation and joins source-adjacent pairs. @returns Invalid field if one cannot be parsed. */
  Add(): "label" | "data" | undefined {
    if (!this.label || !this.data) return undefined;
    const label = this.Parse(this.label);
    if (!label) return "label";
    const data = this.Parse(this.data);
    if (!data) return "data";
    for (const list of [this.columns, this.rows]) {
      const old = list.Find(label);
      if (old) list.Remove(old);
    }
    (this.column ? this.columns : this.rows).Join(
      new ScRangePair(label, this.AdjustColRowData(data, label)),
    );
    this.Clear();
    return undefined;
  }

  /** Deletes the selected entry, moving to the nearest remaining source row. @returns Nothing. */
  Remove(): void {
    const entry = this.selected;
    if (!entry) return;
    const entries = [...this.GetEntries(true), ...this.GetEntries(false)];
    const index = entries.findIndex(
      /** Checks whether `pair` equals `entry.pair`. @param entry - Candidate entry. @returns Whether the condition holds. */ ({
        pair,
      }) => pair === entry.pair,
    );
    (entry.column ? this.columns : this.rows).Remove(entry.pair);
    this.Clear();
    const columns = this.GetEntries(true);
    const rest = [...columns, ...this.GetEntries(false)];
    const preferred =
      entry.column && index === columns.length && columns.length > 0 ? index - 1 : index;
    const next = rest[Math.min(preferred, rest.length - 1)];
    if (next) this.Select(next);
  }

  /** Resets the source fields after committing an entry. @returns Nothing. */
  private Clear(): void {
    this.label = this.data = "";
    this.column = true;
    this.area = this.selected = undefined;
    this.dataEdited = false;
  }

  /** Aligns the shared axis and clips intersection with the label. @param range - Data. @param label - Header. @returns Adjusted data. */
  private AdjustColRowData(range: ScRange, label: ScRange): ScRange {
    const data = new ScRange(range);
    const { aStart, aEnd } = label;
    if (this.column) {
      data.aStart.SetCol(aStart.Col());
      data.aEnd.SetCol(aEnd.Col());
      if (data.Intersects(label)) {
        if (
          aStart.Row() > 0 &&
          (data.aEnd.Row() < aEnd.Row() || aEnd.Row() === this.document.MaxRow())
        ) {
          data.aEnd.SetRow(aStart.Row() - 1);
          data.aStart.SetRow(Math.min(data.aStart.Row(), data.aEnd.Row()));
        } else {
          data.aStart.SetRow(aEnd.Row() + 1);
          data.aEnd.SetRow(Math.max(data.aStart.Row(), data.aEnd.Row()));
        }
      }
    } else {
      data.aStart.SetRow(aStart.Row());
      data.aEnd.SetRow(aEnd.Row());
      if (data.Intersects(label)) {
        if (
          aStart.Col() > 0 &&
          (data.aEnd.Col() < aEnd.Col() || aEnd.Col() === this.document.MaxCol())
        ) {
          data.aEnd.SetCol(aStart.Col() - 1);
          data.aStart.SetCol(Math.min(data.aStart.Col(), data.aEnd.Col()));
        } else {
          data.aStart.SetCol(aEnd.Col() + 1);
          data.aEnd.SetCol(Math.max(data.aStart.Col(), data.aEnd.Col()));
        }
      }
    }
    return data;
  }

  /** Parses a source reference edit. @param source - Field contents. @returns Native bounds if valid. */
  private Parse(source: string): ScRange | undefined {
    if (!source.trim()) return undefined;
    const value = unicode(source),
      range = new ScRange();
    try {
      return range.ParseAny(
        value,
        this.document,
        new ScAddress.Details(this.document.GetAddressConvention()),
      ) & ScRefFlags.VALID
        ? range
        : undefined;
    } finally {
      value.dispose();
    }
  }
}
