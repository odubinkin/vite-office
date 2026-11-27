/** @fileoverview Native worksheet database and criteria range view. */
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScAddress, type ScRange } from "../../../inc/address";
import { ScRefCellValue } from "../../../inc/cellvalue";
import type { ScDocument } from "../../../inc/document";
import { ScQueryConnect } from "../../../inc/global";
import { ScQueryEvaluator } from "../data/queryevaluator";
import { ScCellFormat } from "./cellform";
import { GetCollator } from "./queryentry";
import { FillInExcelSyntax, type ExcelQueryEntry } from "./queryparam";

/** One prepared criterion in the native flat AND/OR list. */
interface DatabaseCriterion {
  readonly field: number;
  readonly connect: ScQueryConnect;
  readonly query: ExcelQueryEntry;
  readonly evaluator: ScQueryEvaluator;
}

/** Spreadsheet implementation of the database double-reference range. */
export class ScDBInternalRange {
  /** Binds the source document and range. @param document - Workbook. @param range - Native area. */
  constructor(
    private readonly document: ScDocument,
    readonly range: ScRange,
  ) {}

  /** Looks up a database field using the original one-based index. @param index - Field index. @returns Absolute column. */
  findFieldIndex(index: number): number {
    return this.range.aStart.Col() + index - 1;
  }

  /** Reads the name of an existing database field. @param name - Input spelling. @returns Field column or invalid sentinel. */
  findFieldColumn(name: string): number {
    const { aStart, aEnd } = this.range;
    const compare = GetCollator().compare;
    for (let col = aStart.Col(); col <= aEnd.Col(); ++col)
      if (compare(name, this.getString(col - aStart.Col(), 0)) === 0) return col;
    return -1;
  }

  /** Reads the formatted input-line string used by database criteria. @param col - Offset column. @param row - Offset row. @returns Cell input. */
  private getString(col: number, row: number): string {
    const origin = this.range.aStart;
    const position = new ScAddress(origin.Col() + col, origin.Row() + row, origin.Tab());
    const cell = new ScRefCellValue(this.document, position);
    const context = this.document.GetNonThreadedContext();
    const format = this.document.GetPattern(position)?.GetNumberFormat(context) ?? 0;
    const value = ScCellFormat.GetInputString(cell, format, context, this.document);
    try {
      return text(value);
    } finally {
      value.dispose();
    }
  }

  /** Builds the native query with StarOffice criteria taking precedence over an Excel header grid. @param criteria - Query range. @returns Prepared ordered criteria or null. */
  createQueryParam(criteria: ScDBInternalRange): DatabaseCriterion[] | null {
    return this.createStarQuery(criteria) ?? this.createExcelQuery(criteria);
  }

  /** Reads the four-column field/operator/value form. @param criteria - Query range. @returns Ordered criteria or null. */
  private createStarQuery(criteria: ScDBInternalRange): DatabaseCriterion[] | null {
    if (criteria.range.aEnd.Col() - criteria.range.aStart.Col() < 3) return null;
    const entries: DatabaseCriterion[] = [];
    const rows = this.range.aEnd.Row() - this.range.aStart.Row() + 1;
    for (let row = 0; row < rows; ++row) {
      const connector = row ? criteria.getString(0, row).toUpperCase() : "AND";
      const field = this.findFieldColumn(criteria.getString(1, row));
      if (field < 0 || (connector !== "AND" && connector !== "OR")) return null;
      const operator = /^(?:<>|<=|>=|[<>=])/u.exec(criteria.getString(2, row))?.[0] ?? "=";
      entries.push(
        this.makeCriterion(
          field,
          connector === "OR" ? ScQueryConnect.SC_OR : ScQueryConnect.SC_AND,
          operator + criteria.getString(3, row),
        ),
      );
    }
    return entries;
  }

  /** Reads Excel criteria as AND across a row and OR between rows. @param criteria - Grid. @returns Ordered query or null. */
  private createExcelQuery(criteria: ScDBInternalRange): DatabaseCriterion[] | null {
    const { aStart, aEnd } = criteria.range;
    const fields: number[] = [];
    for (let col = 0; col <= aEnd.Col() - aStart.Col(); ++col) {
      const field = this.findFieldColumn(criteria.getString(col, 0));
      if (field < 0) return null;
      fields.push(field);
    }
    const query: DatabaseCriterion[] = [];
    for (let row = 1; row <= aEnd.Row() - aStart.Row(); ++row) {
      let connect = ScQueryConnect.SC_OR;
      for (const [col, field] of fields.entries()) {
        const value = criteria.getString(col, row).toUpperCase();
        if (!value) continue;
        query.push(this.makeCriterion(field, connect, value));
        connect = ScQueryConnect.SC_AND;
      }
    }
    return query;
  }

  /** Prepares an original criterion using the native formatter and query evaluator. @param field - Column. @param connect - Connection. @param value - Authored criterion. @returns Prepared criterion. */
  private makeCriterion(field: number, connect: ScQueryConnect, value: string): DatabaseCriterion {
    const query = FillInExcelSyntax(this.document.GetNonThreadedContext(), {
      text: value,
      ignoreCase: value.toUpperCase(),
    });
    return { field, connect, query, evaluator: new ScQueryEvaluator(this.document, query.entry) };
  }

  /** Evaluates the grouped native criteria for one database row. @param query - Ordered criteria. @param row - Sheet row. @returns Whether matched. */
  matches(query: readonly DatabaseCriterion[], row: number): boolean {
    let group = true;
    const position = new ScAddress(0, row, this.range.aStart.Tab());
    for (const [index, condition] of query.entries()) {
      if (index && condition.connect === ScQueryConnect.SC_OR) {
        if (group) return true;
        group = true;
      }
      if (group) {
        position.SetCol(condition.field);
        group = condition.evaluator.matchesCriterion(
          new ScRefCellValue(this.document, position),
          position,
          condition.query,
        );
      }
    }
    return group;
  }
}
