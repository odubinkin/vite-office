/** @fileoverview General Calc clipboard transfer of cells, formats and text metadata. */
import { ScAddress } from "../../../inc/address";
import type { ScColumn } from "../../../inc/column";
import { IsDateCell, type CopyFromClipContext } from "../../../inc/clipcontext";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { InsertDeleteFlags } from "../../../inc/global";
import { ScFormulaCell, ScMatrixMode } from "../../../inc/formulacell";
import { SingleCellListening } from "../../../inc/types";
import { ParseBlock, type BlockFunction, type CellStoreNode } from "../../../inc/mtvfunctions";
import {
  ColumnBlockPosition,
  numeric_block,
  string_block,
  formula_block,
  edittext_block,
  type CellStoreType,
  type CellTextAttrStoreType,
  element_type_numeric,
  element_type_string,
  element_type_formula,
  element_type_edittext,
  element_type_celltextattr,
  celltextattr_block,
  celltextattr_element_callbacks,
} from "../../../inc/mtvelements";
import type { base_element_block } from "../../../../external/mdds/include/mdds/multi_type_vector/types";
import type { SharedStringPool } from "../../../../svl/inc/sharedstringpool";
import type { SharedStringConstReference } from "../../../../svl/inc/sharedstring";
/** Copies native iterator values rather than aliasing mutable JavaScript cursor objects. @param target - Existing value. @param source - Initialized native value. @returns Nothing. */
export function assignBlockPosition(
  target: ColumnBlockPosition,
  source: ColumnBlockPosition,
): void {
  target.miCellPos = (source.miCellPos as ReturnType<CellStoreType["begin"]>).copy();
  target.miCellTextAttrPos = (
    source.miCellTextAttrPos as ReturnType<CellTextAttrStoreType["begin"]>
  ).copy();
  target.miBroadcasterPos = (
    source.miBroadcasterPos as NonNullable<ColumnBlockPosition["miBroadcasterPos"]>
  ).copy();
}

/** Copies native scalar cell blocks and cached formula results according to the insertion flags. */
export class CopyCellsFromClipHandler implements BlockFunction {
  private readonly maDestBlockPos = new ColumnBlockPosition();
  private readonly mpDestBlockPos: ColumnBlockPosition | null;
  /** Borrows actual native context,column and optional foreign shared-string pool. @param context - Native context. @param source - Source column. @param destination - Destination column. @param mnTab - Destination tab. @param mnCol - Destination column. @param mnRowOffset - Row displacement. @param mpSharedStringPool - Foreign-copy destination pool. @returns Handler. */
  constructor(
    private readonly context: CopyFromClipContext,
    private readonly source: ScColumn,
    private readonly destination: ScColumn,
    private readonly mnTab: number,
    private readonly mnCol: number,
    private readonly mnRowOffset: number,
    private readonly mpSharedStringPool: SharedStringPool | null,
  ) {
    this.mpDestBlockPos = context.getBlockPosition(mnTab, mnCol);
    if (this.mpDestBlockPos) {
      const temporary = new ColumnBlockPosition();
      destination.InitBlockPosition(temporary);
      this.mpDestBlockPos.miBroadcasterPos = temporary.miBroadcasterPos as NonNullable<
        ColumnBlockPosition["miBroadcasterPos"]
      >;
      assignBlockPosition(this.maDestBlockPos, this.mpDestBlockPos);
    } else destination.InitBlockPosition(this.maDestBlockPos);
  }
  /** Original handler destruction writes actual cached positions back to the operation. @returns Nothing. */
  Dispose(): void {
    if (this.mpDestBlockPos) assignBlockPosition(this.mpDestBlockPos, this.maDestBlockPos);
  }
  /** Uses the stored source format to choose the native date or numeric flag. @param row - Source row. @returns Whether accepted. */
  private CopyNumber(row: number): boolean {
    const flags = this.context.getInsertFlag();
    const both = InsertDeleteFlags.VALUE | InsertDeleteFlags.DATETIME;
    if (!(flags & both)) return false;
    return (
      (flags & both) === both ||
      !!(
        flags &
        (IsDateCell(this.source, row) ? InsertDeleteFlags.DATETIME : InsertDeleteFlags.VALUE)
      )
    );
  }

  /** Copies a plain string, re-interning it only when document pools differ. @param row - Destination row. @param source - Shared source string. @returns Nothing. */
  private CopyString(row: number, source: SharedStringConstReference): void {
    const interned = this.mpSharedStringPool?.intern(source.getString());
    try {
      this.destination.SetRawString(this.maDestBlockPos, row, interned ?? source);
    } finally {
      interned?.dispose();
    }
  }

  /** Copies a formula or its cached scalar value through the original typed insertion route. @param source - Source formula. @param first - Source row. @returns Nothing. */
  private CopyFormula(source: ScFormulaCell, first: number): void {
    const flags = this.context.getInsertFlag();
    const row = first + this.mnRowOffset;
    const doc = this.destination.GetDoc();
    const position = new ScAddress(this.mnCol, row, this.mnTab);
    if (flags & InsertDeleteFlags.FORMULA) {
      if (source.GetMatrixFlag() !== ScMatrixMode.NONE)
        throw new Error("Matrix clipboard copying is not implemented");
      this.destination.SetFormulaCell(
        this.maDestBlockPos,
        row,
        new ScFormulaCell(source, doc, position),
        SingleCellListening,
        source.NeedsNumberFormat(),
      );
      return;
    }
    const error = source.GetErrCode();
    if (error !== FormulaError.NONE) {
      if (flags & InsertDeleteFlags.VALUE) {
        const cell = new ScFormulaCell(doc, position);
        cell.SetErrCode(error);
        this.destination.SetFormulaCell(this.maDestBlockPos, row, cell);
      }
      return;
    }
    if (source.IsEmptyDisplayedAsString()) return;
    if (source.IsValue()) {
      if (this.CopyNumber(first))
        this.destination.SetValue(this.maDestBlockPos, row, source.GetValue());
    } else if (flags & InsertDeleteFlags.STRING) {
      const string = source.GetString();
      if (string.isEmpty()) return;
      if (source.IsMultilineResult()) {
        const engine = doc.GetEditEngine();
        engine.SetTextCurrentDefaults(string.getString());
        this.destination.SetEditText(row, engine.CreateTextObject());
        this.destination.InitBlockPosition(this.maDestBlockPos);
      } else this.CopyString(row, string);
    }
  }

  /** Original block dispatch retains native numeric, string and formula insertion order. @param node - Actual source node. @param offset - First element. @param size - Element count. @returns Nothing. */
  call(node: CellStoreNode, offset: number, size: number): void {
    const first = node.position + offset;
    const flags = this.context.getInsertFlag();
    switch (node.type) {
      case element_type_numeric:
        for (let index = 0; index < size; ++index)
          if (this.CopyNumber(first + index))
            this.destination.SetValue(
              this.maDestBlockPos,
              first + index + this.mnRowOffset,
              numeric_block.at(node.data as base_element_block, offset + index),
            );
        break;
      case element_type_string:
        if (flags & InsertDeleteFlags.STRING)
          for (let index = 0; index < size; ++index)
            this.CopyString(
              first + index + this.mnRowOffset,
              string_block.at(node.data as base_element_block, offset + index),
            );
        break;
      case element_type_edittext:
        if (!(flags & InsertDeleteFlags.STRING)) return;
        for (let index = 0; index < size; ++index) {
          const edit = edittext_block.at(node.data as base_element_block, offset + index);
          this.destination.SetEditText(first + index + this.mnRowOffset, edit?.Clone() ?? null);
        }
        // The public editor setter does not use the caller's cached block positions.
        this.destination.InitBlockPosition(this.maDestBlockPos);
        break;
      case element_type_formula:
        for (let index = 0; index < size; ++index)
          this.CopyFormula(
            formula_block.at(node.data as base_element_block, offset + index) as ScFormulaCell,
            first + index,
          );
        break;
      // Empty source runs copy no content;pre-deletion owns removal of the old destination.
      default:
        return;
    }
  }
}
/** Original separate text-metadata functor copies original source widths/script types after content insertion. */
export class CopyTextAttrsFromClipHandler implements BlockFunction {
  private readonly maDestBlockPos = new ColumnBlockPosition();
  private readonly mpDestBlockPos: ColumnBlockPosition | null;
  /** Borrows actual attribute storage and cached positions. @param context - Context. @param mrAttrs - Destination metadata store. @param destination - Destination column. @param tab - Destination tab. @param col - Destination column. @param mnDelta - Row displacement. @returns Handler. */
  constructor(
    context: CopyFromClipContext,
    private readonly mrAttrs: CellTextAttrStoreType,
    destination: ScColumn,
    tab: number,
    col: number,
    private readonly mnDelta: number,
  ) {
    this.mpDestBlockPos = context.getBlockPosition(tab, col);
    if (this.mpDestBlockPos)
      this.maDestBlockPos.miCellTextAttrPos = (
        this.mpDestBlockPos.miCellTextAttrPos as ReturnType<CellTextAttrStoreType["begin"]>
      ).copy();
    else destination.InitBlockPosition(this.maDestBlockPos);
  }
  /** Original destructor saves only its text-attribute hint. @returns Nothing. */
  Dispose(): void {
    if (this.mpDestBlockPos)
      this.mpDestBlockPos.miCellTextAttrPos = this.maDestBlockPos.miCellTextAttrPos as ReturnType<
        CellTextAttrStoreType["begin"]
      >;
  }
  /** Copies one original metadata block span by value through actual mdds storage. @param node - Source block. @param offset - First element. @param size - Count. @returns Nothing. */
  call(node: CellStoreNode, offset: number, size: number): void {
    if (node.type !== element_type_celltextattr) return;
    const iterator = celltextattr_block.begin(node.data as base_element_block).advance(offset),
      end = iterator.copy().advance(size);
    this.maDestBlockPos.miCellTextAttrPos = this.mrAttrs.set(
      this.maDestBlockPos.miCellTextAttrPos as ReturnType<CellTextAttrStoreType["begin"]>,
      node.position + offset + this.mnDelta,
      iterator,
      end,
      celltextattr_element_callbacks,
    );
  }
}
/** Original column3 general clipboard path with separate content and text metadata passes. @param this - Actual destination column. @param context - Native context. @param first - Destination first row. @param last - Destination last row. @param delta - Original source-to-destination row displacement. @param source - Actual source column. @returns Nothing. */
export function CopyFromClip(
  this: ScColumn,
  context: CopyFromClipContext,
  first: number,
  last: number,
  delta: number,
  source: ScColumn,
): void {
  if (!context.getBlockPosition(this.GetTab(), this.GetCol())) return;
  const pool =
    source.GetDoc().GetPool() !== this.GetDoc().GetPool()
      ? this.GetDoc().GetSharedStringPool()
      : null;
  if (context.getInsertFlag() & InsertDeleteFlags.ATTRIB)
    source["pAttrArray"].CopyArea(first, last, delta, this["pAttrArray"]);
  const cells = new CopyCellsFromClipHandler(
      context,
      source,
      this,
      this.GetTab(),
      this.GetCol(),
      delta,
      pool,
    ),
    sourceCells = source.GetCellStore();
  try {
    ParseBlock(sourceCells.cbegin(), sourceCells, cells, first - delta, last - delta);
  } finally {
    cells.Dispose();
  }
  const attributes = new CopyTextAttrsFromClipHandler(
      context,
      this["maCellTextAttrs"],
      this,
      this.GetTab(),
      this.GetCol(),
      delta,
    ),
    sourceAttrs = source["maCellTextAttrs"];
  try {
    ParseBlock(sourceAttrs.cbegin(), sourceAttrs, attributes, first - delta, last - delta);
  } finally {
    attributes.Dispose();
  }
}
