/** @fileoverview Original column3.cxx GroupFormulaCells functor and whole-column regrouping over actual typed storage. */
import type { SfxPoolItem } from "../../../../svl/inc/poolitem";
import { SharedString } from "../../../../svl/inc/sharedstring";
import { string_value_type } from "../../../inc/mtvelements";
import {
  formula_block,
  formula_element_callbacks,
  element_type_formula,
  element_type_numeric,
  element_type_string,
  ColumnBlockPosition,
  numeric_block,
  string_block,
  celltextattr_block,
  element_type_celltextattr,
  celltextattr_element_callbacks,
  type CellStoreType,
  type CellTextAttrStoreType,
} from "../../../inc/mtvelements";
import type { base_element_block } from "../../../../external/mdds/include/mdds/multi_type_vector/types";
import { ScFormulaCell, type ScFormulaCellGroup, CompareState } from "../../../inc/formulacell";
import { ProcessFormula } from "../../../inc/mtvcellfunc";
import { ScHint } from "../../../inc/brdcst";
import { SfxHintId } from "../../../../svl/inc/hint";
import { AutoCalcSwitch } from "../../../inc/scopetools";
import type { ColumnSpanSet } from "../../../inc/columnspanset";
import type { StartListeningContext } from "../../../inc/listenercontext";
import { ScAddress } from "../../../inc/address";
import type { ScColumn } from "../../../inc/column";
import {
  ParseBlock,
  ProcessBlock,
  type BlockFunction,
  type CellStoreNode,
} from "../../../inc/mtvfunctions";
import { SingleColumnSpanSet, RowSpan } from "../../../inc/columnspanset";
import { ScItemPoolCache } from "../../../inc/poolcach";
import { MatrixEdge, NoListening, type StartListeningType } from "../../../inc/types";
import type { CopyToDocContext } from "../../../inc/clipcontext";
import type { ScMarkData } from "../../../inc/markdata";
import { ScMultiSelIter } from "../../../inc/markmulti";
import { EndListeningContext } from "../../../inc/listenercontext";
import { DelayStartListeningFormulaCells } from "../../../inc/scopetools";
import { ScPatternAttr, CellAttributeHolder } from "../../../inc/patattr";
import { CellTextAttr } from "../../../inc/celltextattr";
import { double_element_callbacks } from "../../../../external/mdds/include/mdds/multi_type_vector/standard_element_blocks";
import { string_element_callbacks } from "../../../inc/mtvelements";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SingleCellListening } from "../../../inc/types";
import { InsertDeleteFlags, ScCloneFlags } from "../../../inc/global";
import type { ScDocument } from "../../../inc/document";
import type { CopyFromClipContext } from "../../../inc/clipcontext";
import type { SharedStringPool } from "../../../../svl/inc/sharedstringpool";
import { ScMatrixMode } from "../../../inc/formulacell";
import { SharedFormulaUtil } from "../../../inc/sharedformula";
/** Original block functor retains existing groups and joins adjacent compatible owners. */
export class GroupFormulaCells {
  /** Borrows optional actual changed-group positions. @param mpGroupPos - Native output or null. @returns Functor. */
  constructor(private readonly mpGroupPos: ScAddress[] | null) {}
  /** Consumes the actual formula block. @param node - Store node. @returns Nothing. */
  call(node: CellStoreNode): void {
    if (node.type !== element_type_formula) return;
    const data = node.data as base_element_block,
      iterator = formula_block.begin(data),
      end = formula_block.end(data);
    let previous = iterator.get() as ScFormulaCell,
      previousGroup = previous.GetCellGroup(),
      row = node.position;
    const initial = previousGroup?.mnLength ?? 1;
    iterator.advance(initial);
    row += initial;
    while (!iterator.equals(end)) {
      const current = iterator.get() as ScFormulaCell,
        currentGroup = current.GetCellGroup(),
        state = previous.CompareByTokenArray(current);
      if (state === CompareState.NotEqual) {
        const length = currentGroup?.mnLength ?? 1;
        if (currentGroup && length > node.position + node.size - row)
          throw new Error("Shared group exceeds formula block.");
        iterator.advance(length);
        row += length;
        previous = current;
        previousGroup = currentGroup;
        continue;
      }
      if (previousGroup) {
        if (currentGroup) {
          previousGroup.mnLength += currentGroup.mnLength;
          current.SetCellGroup(previousGroup);
          const length = currentGroup.mnLength;
          if (length > node.position + node.size - row)
            throw new Error("Shared group exceeds formula block.");
          for (let offset = 1; offset < length; offset++)
            (iterator.copy().advance(offset).get() as ScFormulaCell).SetCellGroup(previousGroup);
          iterator.advance(length);
          row += length;
        } else {
          current.SetCellGroup(previousGroup);
          ++previousGroup.mnLength;
          ++row;
          iterator.advance(1);
        }
      } else if (currentGroup) {
        if (currentGroup.mnLength > node.position + node.size - row)
          throw new Error("Shared group exceeds formula block.");
        row += currentGroup.mnLength;
        iterator.advance(currentGroup.mnLength);
        previous.SetCellGroup(currentGroup);
        currentGroup.mpTopCell = previous;
        ++currentGroup.mnLength;
        previousGroup = currentGroup;
      } else {
        if (previous.aPos.Row() !== row - 1)
          throw new Error("Previous formula row differs from storage.");
        previousGroup = previous.CreateCellGroup(
          2,
          state === CompareState.EqualInvariant,
        ) as ScFormulaCellGroup;
        current.SetCellGroup(previousGroup);
        ++row;
        iterator.advance(1);
      }
      this.mpGroupPos?.push(new ScAddress(current.aPos));
      // Native pCur=pPrev;xCurGrp=xPrevGrp keeps the surviving group's top.
    }
  }
}
/** Original whole-column regroup does not rebuild formulas or subscriptions. @param this - Actual column. @param positions - Optional changed-group positions. @returns Nothing. */
export function RegroupFormulaCells(this: ScColumn, positions: ScAddress[] | null): void {
  const cells = this.GetCellStore(),
    action = new GroupFormulaCells(positions);
  for (
    const iterator = cells.begin(), end = cells.end();
    !iterator.equals(end);
    iterator.increment()
  )
    action.call(iterator.get());
}

/** Original DeleteCellsResult retains compact deleted spans and pre-teardown group extents. */
export class DeleteCellsResult {
  readonly aDeletedRows: SingleColumnSpanSet;
  aFormulaRanges: [number, number][] = [];
  /** Uses the actual source document's limits. @param doc - Document. @returns Result. */
  constructor(doc: ScDocument) {
    this.aDeletedRows = new SingleColumnSpanSet(doc.GetSheetLimits());
  }
}
/** Original block deletion classifier for represented default CONTENTS;selective date/number formatting remains unavailable. */
class DeleteAreaHandler implements BlockFunction {
  private readonly maFormulaCells: ScFormulaCell[] = [];
  private readonly maDeleteRanges: SingleColumnSpanSet;
  /** Borrows source document and original deletion mask. @param doc - Actual document. @param flags - Original flags. @returns Handler. */
  constructor(
    private readonly doc: ScDocument,
    private readonly flags: InsertDeleteFlags,
  ) {
    const numeric = !!(flags & InsertDeleteFlags.VALUE),
      dateTime = !!(flags & InsertDeleteFlags.DATETIME);
    if (numeric !== dateTime)
      throw new Error("Selective date/number deletion requires the native formatter");
    this.maDeleteRanges = new SingleColumnSpanSet(doc.GetSheetLimits());
  }
  /** Tags genuine nonempty blocks without walking empty rows. @param node - Store node. @param offset - Span offset. @param size - Span length. @returns Nothing. */
  call(node: CellStoreNode, offset: number, size: number): void {
    switch (node.type) {
      case element_type_numeric:
        if (!(this.flags & InsertDeleteFlags.VALUE)) return;
        break;
      case element_type_string:
        if (!(this.flags & InsertDeleteFlags.STRING)) return;
        break;
      case element_type_formula:
        if (!(this.flags & InsertDeleteFlags.FORMULA)) return;
        for (let index = offset; index < offset + size; ++index)
          this.maFormulaCells.push(
            formula_block.at(node.data as base_element_block, index) as ScFormulaCell,
          );
        break;
      default:
        return;
    }
    const first = node.position + offset;
    this.maDeleteRanges.set(first, first + size - 1, true);
  }
  /** Captures original full group bounds before any listener or grouping mutation. @returns Inclusive pairs. */
  getFormulaRanges(): [number, number][] {
    return this.maFormulaCells.map(
      /** Reads the actual shared top and length. @param cell - Actual member. @returns Original extent. */ (
        cell,
      ) => {
        const group = cell.GetCellGroup(),
          first = group ? (group.mpTopCell as ScFormulaCell).aPos.Row() : cell.aPos.Row();
        return [first, group ? first + group.mnLength - 1 : first];
      },
    );
  }
  /** Original bulk end and explicit purge. @returns Nothing. */
  endFormulas(): void {
    this.doc.EndListeningFormulaCells(this.maFormulaCells);
  }
  /** Borrows original deletion owner. @returns Span owner. */
  getSpans(): SingleColumnSpanSet {
    return this.maDeleteRanges;
  }
}
/** Original typed-store deletion splits only top/bottom grouping boundaries and empties spans in reverse order. @param this - Actual column. @param position - Original cached cursors. @param first - First row. @param last - Last row. @param flags - Original flags. @returns Original result. */
export function DeleteCells(
  this: ScColumn,
  position: ColumnBlockPosition,
  first: number,
  last: number,
  flags: InsertDeleteFlags,
): DeleteCellsResult {
  const result = new DeleteCellsResult(this.GetDoc()),
    action = new DeleteAreaHandler(this.GetDoc(), flags),
    cells = this.GetCellStore();
  ProcessBlock(
    cells.position(position.miCellPos as ReturnType<CellStoreType["begin"]>, first).first,
    cells,
    action,
    first,
    last,
  );
  result.aFormulaRanges = action.getFormulaRanges();
  action.endFormulas();
  const spans: RowSpan[] = [];
  action.getSpans().getSpans(spans);
  for (let index = spans.length - 1; index >= 0; --index) {
    const span = spans[index] as RowSpan;
    let at = cells.position(position.miCellPos as ReturnType<CellStoreType["begin"]>, span.mnRow1);
    splitFormulaGrouping(at);
    at = cells.position(at.first, span.mnRow2);
    splitFormulaGrouping(at);
    position.miCellPos = cells.set_empty(
      position.miCellPos as ReturnType<CellStoreType["begin"]>,
      span.mnRow1,
      span.mnRow2,
    );
    position.miCellTextAttrPos = this["maCellTextAttrs"].set_empty(
      position.miCellTextAttrPos as ReturnType<CellTextAttrStoreType["begin"]>,
      span.mnRow1,
      span.mnRow2,
    );
  }
  action.getSpans().swap(result.aDeletedRows);
  return result;
}
/** Original EmptyCells boundary split consumes the actual store node. @param position - Actual block position. @returns Nothing. */
function splitFormulaGrouping(position: ReturnType<CellStoreType["position"]>): void {
  const node = position.first.get();
  if (node.type === element_type_formula)
    SharedFormulaUtil.unshareFormulaCell(
      position,
      formula_block.at(node.data as base_element_block, position.second) as ScFormulaCell,
    );
}

/** Copies native iterator values rather than aliasing mutable JavaScript cursor objects. @param target - Existing value. @param source - Initialized native value. @returns Nothing. */
function assignBlockPosition(target: ColumnBlockPosition, source: ColumnBlockPosition): void {
  target.miCellPos = (source.miCellPos as ReturnType<CellStoreType["begin"]>).copy();
  target.miCellTextAttrPos = (
    source.miCellTextAttrPos as ReturnType<CellTextAttrStoreType["begin"]>
  ).copy();
  target.miBroadcasterPos = (
    source.miBroadcasterPos as NonNullable<ColumnBlockPosition["miBroadcasterPos"]>
  ).copy();
}
/** Original default CONTENTS block functor;unrepresented note/edit/sparkline services and number-format inheritance remain explicit boundaries. */
export class CopyCellsFromClipHandler implements BlockFunction {
  private readonly maDestBlockPos = new ColumnBlockPosition();
  private readonly mpDestBlockPos: ColumnBlockPosition | null;
  /** Borrows actual native context,column and optional foreign shared-string pool. @param context - Native context. @param source - Source column. @param destination - Destination column. @param mnTab - Destination tab. @param mnCol - Destination column. @param mnRowOffset - Row displacement. @param mpSharedStringPool - Foreign-copy destination pool. @returns Handler. */
  constructor(
    context: CopyFromClipContext,
    source: ScColumn,
    private readonly destination: ScColumn,
    private readonly mnTab: number,
    private readonly mnCol: number,
    private readonly mnRowOffset: number,
    private readonly mpSharedStringPool: SharedStringPool | null,
  ) {
    // Default CONTENTS copies every represented cell alternative;the source column supplies genuine blocks.
    void source;
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
  /** Original default-content block dispatch retains native numeric/string/formula insertion order. @param node - Actual source node. @param offset - First element. @param size - Element count. @returns Nothing. */
  call(node: CellStoreNode, offset: number, size: number): void {
    const first = node.position + offset;
    switch (node.type) {
      case element_type_numeric:
        for (let index = 0; index < size; ++index)
          this.destination.SetValue(
            this.maDestBlockPos,
            first + index + this.mnRowOffset,
            numeric_block.at(node.data as base_element_block, offset + index),
          );
        break;
      case element_type_string:
        for (let index = 0; index < size; ++index) {
          const source = string_block.at(node.data as base_element_block, offset + index),
            interned = this.mpSharedStringPool?.intern(source.getString());
          try {
            this.destination.SetRawString(
              this.maDestBlockPos,
              first + index + this.mnRowOffset,
              interned ?? source,
            );
          } finally {
            interned?.dispose();
          }
        }
        break;
      case element_type_formula:
        for (let index = 0; index < size; ++index) {
          const source = formula_block.at(
              node.data as base_element_block,
              offset + index,
            ) as ScFormulaCell,
            row = first + index + this.mnRowOffset;
          if (source.GetMatrixFlag() !== ScMatrixMode.NONE)
            throw new Error("Matrix clipboard copying is not implemented");
          this.destination.SetFormulaCell(
            this.maDestBlockPos,
            row,
            new ScFormulaCell(
              source,
              this.destination.GetDoc(),
              new ScAddress(this.mnCol, row, this.mnTab),
            ),
            SingleCellListening,
            source.NeedsNumberFormat(),
          );
        }
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
/** Original column3 general clipboard path for admitted CONTENTS. It preserves the separate content/metadata passes and cached operation cursors. @param this - Actual destination column. @param context - Native context. @param first - Destination first row. @param last - Destination last row. @param delta - Original source-to-destination row displacement. @param source - Actual source column. @returns Nothing. */
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

/** Original CopyByCloneHandler for represented default contents/formula/string alternatives;no second workbook or formula-source reparse. */
export class CopyByCloneHandler implements BlockFunction {
  private readonly maDestPos = new ColumnBlockPosition();
  private meListenType: StartListeningType = SingleCellListening;
  /** Captures copied native cursor values and real source/destination/string owners. @param mrDestCol - Destination column. @param mpDestPos - Operation cursor or native null. @param mnCopyFlags - Native copy mask. @param mpSharedStringPool - Foreign destination pool or null. @returns Handler. */
  constructor(
    private readonly mrDestCol: ScColumn,
    private readonly mpDestPos: ColumnBlockPosition | null,
    private readonly mnCopyFlags: InsertDeleteFlags,
    private readonly mpSharedStringPool: SharedStringPool | null,
  ) {
    if (mpDestPos) assignBlockPosition(this.maDestPos, mpDestPos);
  }
  /** Original listening-policy conversion. @param value - Start listening while copying. @returns Nothing. */
  setStartListening(value: boolean): void {
    this.meListenType = value ? SingleCellListening : NoListening;
  }
  /** Original destination text metadata reset. @param row - Target row. @returns Nothing. */
  private setDefaultAttrToDest(row: number): void {
    this.maDestPos.miCellTextAttrPos = this.mrDestCol
      .GetCellAttrStore()
      .set(
        this.maDestPos.miCellTextAttrPos as ReturnType<CellTextAttrStoreType["begin"]>,
        row,
        new CellTextAttr(),
        celltextattr_element_callbacks,
      );
  }
  /** Original represented formula clone branch;STRING-only copying consumes actual string results and keeps rich multiline output an explicit boundary. @param row - Row. @param source - Actual formula. @returns Nothing. */
  private cloneFormulaCell(row: number, source: ScFormulaCell): void {
    if (this.mnCopyFlags & InsertDeleteFlags.FORMULA) {
      if (source.GetMatrixFlag() !== ScMatrixMode.NONE)
        throw new Error("Matrix document copying is not implemented");
      const cell = new ScFormulaCell(
        source,
        this.mrDestCol.GetDoc(),
        new ScAddress(this.mrDestCol.GetCol(), row, this.mrDestCol.GetTab()),
      );
      cell.SetDirtyVar();
      this.mrDestCol.SetFormulaCell(
        this.maDestPos,
        row,
        cell,
        this.meListenType,
        source.NeedsNumberFormat(),
      );
      this.setDefaultAttrToDest(row);
      return;
    }
    if (this.mrDestCol.GetDoc().IsUndo()) return;
    const string = source.GetString();
    if (string.isEmpty()) return;
    if (text(string.getString()).includes("\n"))
      throw new Error("Multiline formula-result copy requires native edit-text storage");
    this.maDestPos.miCellPos = this.mrDestCol
      .GetCellStore()
      .set(
        this.maDestPos.miCellPos as ReturnType<CellStoreType["begin"]>,
        row,
        string,
        string_element_callbacks,
      );
    this.setDefaultAttrToDest(row);
  }
  /** Original block alternatives retain empty-source no-op semantics and empty-string removal sentinels. CONTENTS admits both numeric/date classes,so unrepresented format classification cannot affect that result. @param node - Actual block. @param offset - First source element. @param size - Count. @returns Nothing. */
  call(node: CellStoreNode, offset: number, size: number): void {
    let row = node.position + offset;
    switch (node.type) {
      case element_type_numeric:
        if (!(this.mnCopyFlags & (InsertDeleteFlags.VALUE | InsertDeleteFlags.DATETIME))) return;
        for (let index = 0; index < size; ++index, ++row) {
          this.maDestPos.miCellPos = this.mrDestCol
            .GetCellStore()
            .set(
              this.maDestPos.miCellPos as ReturnType<CellStoreType["begin"]>,
              row,
              numeric_block.at(node.data as base_element_block, offset + index),
              double_element_callbacks,
            );
          this.setDefaultAttrToDest(row);
        }
        break;
      case element_type_string:
        if (!(this.mnCopyFlags & InsertDeleteFlags.STRING)) return;
        for (let index = 0; index < size; ++index, ++row) {
          const string = string_block.at(node.data as base_element_block, offset + index);
          if (string.isEmpty()) {
            this.maDestPos.miCellPos = this.mrDestCol
              .GetCellStore()
              .set_empty(this.maDestPos.miCellPos as ReturnType<CellStoreType["begin"]>, row, row);
            this.maDestPos.miCellTextAttrPos = this.mrDestCol
              .GetCellAttrStore()
              .set_empty(
                this.maDestPos.miCellTextAttrPos as ReturnType<CellTextAttrStoreType["begin"]>,
                row,
                row,
              );
          } else {
            const interned = this.mpSharedStringPool?.intern(string.getString());
            try {
              this.maDestPos.miCellPos = this.mrDestCol
                .GetCellStore()
                .set(
                  this.maDestPos.miCellPos as ReturnType<CellStoreType["begin"]>,
                  row,
                  interned ?? string,
                  string_element_callbacks,
                );
            } finally {
              interned?.dispose();
            }
            this.setDefaultAttrToDest(row);
          }
        }
        break;
      case element_type_formula: {
        const delay = new DelayStartListeningFormulaCells(this.mrDestCol);
        try {
          if (size > 1024 && this.mnCopyFlags & InsertDeleteFlags.FORMULA) {
            this.mrDestCol.EndListeningFormulaCells(
              new EndListeningContext(this.mrDestCol.GetDoc()),
              row,
              row + size - 1,
              null,
              null,
            );
            delay.set();
          }
          for (let index = 0; index < size; ++index, ++row)
            this.cloneFormulaCell(
              row,
              formula_block.at(node.data as base_element_block, offset + index) as ScFormulaCell,
            );
        } finally {
          delay.Dispose();
        }
        break;
      }
      default:
        return;
    }
  }
  /** Original destructor repairs the broadcaster cursor before writing every actual cursor value back. @returns Nothing. */
  Dispose(): void {
    if (!this.mpDestPos) return;
    const temporary = new ColumnBlockPosition();
    this.mrDestCol.InitBlockPosition(temporary);
    this.maDestPos.miBroadcasterPos = temporary.miBroadcasterPos as NonNullable<
      ColumnBlockPosition["miBroadcasterPos"]
    >;
    assignBlockPosition(this.mpDestPos, this.maDestPos);
  }
}
/** Original column.cxx marked recursion and default clone dispatch. Canonical attribute runs and same-helper target-style retention accompany admitted CONTENTS/FORMULA/STRING copying;link/selective numeric-result services remain unported. @param this - Actual source column. @param context - Actual destination context. @param first - First row. @param last - Last row. @param flags - Admitted native flags. @param marked - Restrict to original multi marks. @param target - Actual target column. @param marks - Original selection or null. @param asLink - Original default false. @param cloneFlags - Native default clone policy. @returns Nothing. */
export function CopyToColumn(
  this: ScColumn,
  context: CopyToDocContext,
  first: number,
  last: number,
  flags: InsertDeleteFlags,
  marked: boolean,
  target: ScColumn,
  marks: ScMarkData | null = null,
  asLink = false,
  cloneFlags = ScCloneFlags.Default,
): void {
  if (marked) {
    if (marks?.IsMultiMarked()) {
      const iter = new ScMultiSelIter(marks.GetMultiSelData(), this.GetCol());
      for (let span = iter.Next(0, 0); span[0] && span[1] <= last; span = iter.Next(0, 0))
        if (span[2] >= first)
          this.CopyToColumn(
            context,
            Math.max(first, span[1]),
            Math.min(last, span[2]),
            flags,
            false,
            target,
            marks,
            asLink,
          );
    }
    return;
  }
  const content =
    flags &
    (InsertDeleteFlags.VALUE |
      InsertDeleteFlags.DATETIME |
      InsertDeleteFlags.STRING |
      InsertDeleteFlags.FORMULA);
  if (
    asLink ||
    cloneFlags !== ScCloneFlags.Default ||
    flags &
      ~(
        InsertDeleteFlags.CONTENTS |
        InsertDeleteFlags.ATTRIB |
        InsertDeleteFlags.EDITATTR |
        InsertDeleteFlags.NOCAPTIONS
      ) ||
    (content !== InsertDeleteFlags.NONE &&
      content !== InsertDeleteFlags.STRING &&
      content !== InsertDeleteFlags.FORMULA &&
      content !==
        (InsertDeleteFlags.VALUE |
          InsertDeleteFlags.DATETIME |
          InsertDeleteFlags.STRING |
          InsertDeleteFlags.FORMULA))
  )
    throw new Error("Nondefault document copy services are not implemented");
  if (flags & InsertDeleteFlags.ATTRIB) {
    if ((flags & InsertDeleteFlags.STYLES) !== InsertDeleteFlags.STYLES) {
      if (this.GetDoc().getCellAttributeHelper() !== target.GetDoc().getCellAttributeHelper())
        throw new Error("Foreign hard-attribute document copy requires native style migration");
      for (let row = first; row <= last; ++row) {
        const style = (target.GetPattern(row) as ScPatternAttr).GetStyleSheet(),
          pattern = new ScPatternAttr(this.GetPattern(row) as ScPatternAttr);
        pattern.SetStyleSheet(style);
        const holder = new CellAttributeHolder(pattern, true);
        try {
          target.SetPattern(row, holder);
        } finally {
          holder.Dispose();
        }
      }
    } else this["pAttrArray"].CopyArea(first, last, 0, target["pAttrArray"]);
  }
  if (!content) return;
  const pool =
      this.GetDoc().GetPool() === target.GetDoc().GetPool()
        ? null
        : target.GetDoc().GetSharedStringPool(),
    action = new CopyByCloneHandler(
      target,
      context.getBlockPosition(target.GetTab(), target.GetCol()),
      flags,
      pool,
    ),
    cells = this.GetCellStore();
  action.setStartListening(context.isStartListening());
  try {
    ParseBlock(cells.cbegin(), cells, action, first, last);
  } finally {
    action.Dispose();
  }
}

/** Original scalar/hinted SetValue body on the actual column;out-of-class binding preserves native stores and listeners. @param this - Actual column. @param first - Row or cursor. @param second - Value or row. @param third - Hinted value. @param broadcast - Native broadcast default. @returns Nothing. */
export function SetValue(
  this: ScColumn,
  first: number | ColumnBlockPosition,
  second: number,
  third: number | undefined,
  broadcast: boolean,
): void {
  const block = first instanceof ColumnBlockPosition ? first : null,
    row = block ? second : (first as number),
    value = block ? (third as number) : second;
  if (!this["rDocument"].ValidRow(row)) return;
  const rows = this["DetachFormulaCell"](row);
  if (block) {
    block.miCellPos = this["maCells"].set(
      block.miCellPos as ReturnType<CellStoreType["begin"]>,
      row,
      value,
      double_element_callbacks,
    );
    block.miCellTextAttrPos = this["maCellTextAttrs"].set(
      block.miCellTextAttrPos as ReturnType<CellTextAttrStoreType["begin"]>,
      row,
      new CellTextAttr(),
      celltextattr_element_callbacks,
    );
  } else {
    this["maCells"].set(row, value, double_element_callbacks);
    this["maCellTextAttrs"].set(row, new CellTextAttr(), celltextattr_element_callbacks);
  }
  this["StartListeningUnshared"](rows);
  if (broadcast) this["BroadcastNewCell"](row);
}

/** Original column3.cxx string lookup on the same native store. @param this - Actual column. @param row - Row. @returns Independent shared string or native empty default. */
export function GetSharedString(this: ScColumn, row: number): SharedString {
  return this["maCells"].get_type(row) === element_type_string
    ? this["maCells"].get(row, string_element_callbacks, string_value_type)
    : new SharedString();
}

/** Original column3 ImplDestroy body for the represented cell/text stores. Note/sparkline stores and CellStorageModified compute/stream services are not represented. @param this - Actual column. @returns Nothing. */
export function ImplDestroy(this: ScColumn): void {
  this.GetCellStore().event_handler().stop();
  const rows = this.GetDoc().GetMaxRowCount();
  this.GetCellStore().clear();
  this.GetCellStore().resize(rows);
  this.GetCellAttrStore().clear();
  this.GetCellAttrStore().resize(rows);
}
/** Original ScColumn destructor consumes ImplDestroy before reverse member/base destruction. Managed physical storage is reclaimed by GC;actual value callbacks and broadcaster destruction run here. @param this - Actual column. @returns Nothing. */
export function Dispose(this: ScColumn): void {
  ImplDestroy.call(this);
  this.GetCellStore().dispose();
  this["maBroadcasters"].dispose();
  this.GetCellAttrStore().dispose();
  this.DisposeAttributes();
}

/** Original column3 row-vector broadcast reuses one native hint and visits only collected rows. @param this - Actual column. @param rows - Actual changed rows. @param id - Native hint. @returns Nothing. */
export function BroadcastCells(this: ScColumn, rows: number[], id: SfxHintId): void {
  if (!rows.length) return;
  const hint = new ScHint(id, new ScAddress(this.GetCol(), 0, this.GetTab()));
  for (const row of rows) {
    hint.SetAddressRow(row);
    this.GetDoc().Broadcast(hint);
  }
}
/** Original column3 DeleteArea content/attribute order over actual DeleteCellsResult. Full attribute deletion uses actual canonical runs;absent notes/sparkline/edit services remain unrepresented. @param this - Actual column. @param first - First row. @param last - Last row. @param flags - Native flags. @param broadcast - Original defaulttrue. @param spans - Original optional collector. @returns Nothing. */
export function DeleteArea(
  this: ScColumn,
  first: number,
  last: number,
  flags: InsertDeleteFlags,
  broadcast = true,
  spans: ColumnSpanSet | null = null,
): void {
  if (
    flags &
    ~(
      InsertDeleteFlags.CONTENTS |
      InsertDeleteFlags.ATTRIB |
      InsertDeleteFlags.EDITATTR |
      InsertDeleteFlags.NOCAPTIONS
    )
  )
    throw Error("Only native content and hard-attribute deletion are implemented");
  if (flags & InsertDeleteFlags.STYLES && !(flags & InsertDeleteFlags.HARDATTR))
    throw Error("Only native content and hard-attribute deletion are implemented");
  let mask = InsertDeleteFlags.CONTENTS;
  if (flags & InsertDeleteFlags.NOTE) mask |= InsertDeleteFlags.NOCAPTIONS;
  const content = flags & mask,
    position = new ColumnBlockPosition();
  this.InitBlockPosition(position);
  let result: DeleteCellsResult | null = null;
  if (!this.IsEmptyData() && content !== InsertDeleteFlags.NONE) {
    result = this.DeleteCells(position, first, last, flags);
    if (spans) {
      const rows: RowSpan[] = [];
      result.aDeletedRows.getSpans(rows);
      for (const row of rows)
        spans.set(this.GetDoc(), this.GetTab(), this.GetCol(), row.mnRow1, row.mnRow2, true);
    }
  }
  if ((flags & InsertDeleteFlags.ATTRIB) === InsertDeleteFlags.ATTRIB)
    this["pAttrArray"].DeleteArea(first, last);
  else if (flags & InsertDeleteFlags.HARDATTR) this["pAttrArray"].DeleteHardAttr(first, last);
  if (result && broadcast) {
    const rows: number[] = [];
    result.aDeletedRows.getRows(rows);
    BroadcastCells.call(this, rows, SfxHintId.ScDataChanged);
  }
}
/** Original column3 StartListeners handler with actual needed flags and native group-span skipping. @param this - Actual column. @param context - Real shared start context. @param all - Original listener policy. @returns Nothing. */
export function StartListeners(this: ScColumn, context: StartListeningContext, all: boolean): void {
  const cells = this.GetCellStore();
  for (const iterator = cells.begin(); !iterator.equals(cells.end()); iterator.increment()) {
    const node = iterator.get();
    if (node.type !== element_type_formula) continue;
    const data = node.data as base_element_block;
    for (let i = 0; i < node.size; ++i) {
      const cell = formula_block.at(data, i) as ScFormulaCell;
      if (!all && !cell.NeedsListening()) continue;
      if (cell.IsSharedTop()) {
        SharedFormulaUtil.startListeningAsGroup(context, formula_block.data(data).advance(i));
        i += cell.GetSharedLength() - 1;
      } else cell.StartListeningTo(context);
    }
  }
}

/** Original column.cxx SetDirty BROADCAST_BROADCASTERS branch,consumed by document include-empty restoration. Other broadcast modes retain their separate existing owners. @param this - Actual column. @param first - First row. @param last - Last row. @returns Nothing. */
export function SetDirtyIncludingEmptyCells(this: ScColumn, first: number, last: number): void {
  const scope = new AutoCalcSwitch(this.GetDoc(), false);
  try {
    ProcessFormula(
      this.GetCellStore().begin(),
      this.GetCellStore(),
      first,
      last,
      /** Original formula-only dirty handler. @param row - Native row. @param cell - Actual formula. @returns Nothing. */ (
        row,
        cell,
      ) => {
        void row;
        cell.SetDirty();
      },
    );
    if (this.BroadcastBroadcasters(first, last, SfxHintId.ScDataChanged))
      this.GetDoc().TrackFormulas();
  } finally {
    scope.Dispose();
  }
}

/** Original column.cxx single-item ApplyAttr creates a genuine complete pattern and canonicalizes equality. @param this - Actual column. @param row - Row. @param attr - Borrowed item. @returns Nothing. */
export function ApplyAttr(this: ScColumn, row: number, attr: SfxPoolItem): void {
  const old = this["pAttrArray"].GetPattern(row) as ScPatternAttr,
    next = new ScPatternAttr(old);
  next.ItemSetPut(attr);
  if (!ScPatternAttr.areSame(next, old)) {
    const holder = new CellAttributeHolder(next, true);
    try {
      this["pAttrArray"].SetPattern(row, holder);
    } finally {
      holder.Dispose();
    }
  } else next.Dispose();
}

/** Existing original column.cxx single-cell pattern body partitioned without changing owners. @param this - Actual column. @param row - Row. @param pattern - Actual delta. @returns Nothing. */
export function ApplyPattern(this: ScColumn, row: number, pattern: ScPatternAttr): void {
  const cache = new ScItemPoolCache(
      this["rDocument"].getCellAttributeHelper(),
      pattern.GetItemSet(),
    ),
    old = new CellAttributeHolder(this["pAttrArray"].GetPattern(row));
  try {
    const next = cache.ApplyTo(old);
    if (!CellAttributeHolder.areSame(next, old)) this["pAttrArray"].SetPattern(row, next);
  } finally {
    old.Dispose();
    cache.Dispose();
  }
}
/** Original GetBlockMatrixEdges ordinary-cell path reads actual typed blocks and rejects the unported positive matrix-edge family. Source edge-mask/open-edge phases are unreachable for admitted NONE cells. @param this - Actual column. @param first - First row. @param last - Last row. @param mask - Original edge mask. @param noMatrix - Original policy. @returns Native Nothing for genuine nonmatrix content. */
export function GetBlockMatrixEdges(
  this: ScColumn,
  first: number,
  last: number,
  mask: MatrixEdge,
  noMatrix: boolean,
): MatrixEdge {
  void mask;
  void noMatrix;
  if (!this.GetDoc().ValidRow(first) || !this.GetDoc().ValidRow(last) || first > last)
    return MatrixEdge.Nothing;
  const cells = this.GetCellStore(),
    position = cells.position(first),
    iterator = position.first;
  if (first === last) {
    const node = iterator.get();
    if (node.type !== element_type_formula) return MatrixEdge.Nothing;
    const cell = formula_block.at(
      node.data as base_element_block,
      position.second,
    ) as ScFormulaCell;
    if (cell.GetMatrixFlag() === ScMatrixMode.NONE) return MatrixEdge.Nothing;
    throw Error("Native matrix edge services are not implemented");
  }
  let offset = position.second,
    row = first;
  for (; !iterator.equals(cells.end()) && row <= last; iterator.increment(), offset = 0) {
    const node = iterator.get();
    if (node.type !== element_type_formula) {
      row += node.size - offset;
      continue;
    }
    const end = Math.min(node.size, offset + last - row + 1);
    for (let i = offset; i < end; ++i) {
      const cell = formula_block.at(node.data as base_element_block, i) as ScFormulaCell;
      if (cell.GetMatrixFlag() !== ScMatrixMode.NONE)
        throw Error("Native matrix edge services are not implemented");
    }
    row += end - offset;
  }
  return MatrixEdge.Nothing;
}

/** Original actual formula-cell borrow,partitioned unchanged from the facade. @param this - Actual column. @param row - Valid row. @returns Actual formula or null. */
export function GetFormulaCell(this: ScColumn, row: number): ScFormulaCell | null {
  if (this["maCells"].get_type(row) !== element_type_formula) return null;
  const output: [ScFormulaCell | null] = [null];
  this["maCells"].get(row, formula_element_callbacks, output);
  return output[0];
}
