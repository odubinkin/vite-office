/** @fileoverview Original sharedformula.hxx/cxx grouping,split,unshare and group subscriptions on actual mdds storage. Delayed join orchestration remains a separate document/column consumer. */
import { ScFormulaCell, ScFormulaCellGroup, CompareState } from "../../../inc/formulacell";
import { formula_block, element_type_formula, type CellStoreType } from "../../../inc/mtvelements";
import type { base_element_block } from "../../../../external/mdds/include/mdds/multi_type_vector/types";
import type { delayed_delete_vector_iterator } from "../../../../external/mdds/include/mdds/multi_type_vector/delayed_delete_vector";
import { StartListeningContext, type EndListeningContext } from "../../../inc/listenercontext";
import { ScRange, BCA_LISTEN_ALWAYS } from "../../../inc/address";
import { StackVar } from "../../../../formula/inc/token";
import { ScSingleRefToken, ScDoubleRefToken } from "../../../inc/token";
import type { ScTokenArray } from "../../../inc/tokenarray";
/** Original mutable CellStoreType::position_type specialization. */
type CellPosition = ReturnType<CellStoreType["position"]>;
/** Original static consumers borrow actual formula blocks rather than a copied cell index. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Preserve the original static SharedFormulaUtil boundary.
export class SharedFormulaUtil {
  /** Original one-boundary join only accepts a formula with a formula immediately above in the same block. @param position - Actual store position. @returns Joined flag. */
  static joinFormulaCellAbove(position: CellPosition): boolean {
    const node = position.first.get();
    if (node.type !== element_type_formula || position.second === 0) return false;
    const data = node.data as base_element_block,
      previous = formula_block.at(data, position.second - 1) as ScFormulaCell,
      cell = formula_block.at(data, position.second) as ScFormulaCell;
    return this.joinFormulaCells(
      { first: position.first.copy(), second: position.second - 1 },
      previous,
      cell,
    );
  }
  /** Original template groups the nonempty range of initially unshared cells. @param begin - Borrowed begin pointer. @param end - Borrowed end pointer. @returns Nothing. */
  static groupFormulaCells(
    begin: delayed_delete_vector_iterator<ScFormulaCell | null>,
    end: delayed_delete_vector_iterator<ScFormulaCell | null>,
  ): void {
    const iterator = begin.copy();
    let previous = iterator.get() as ScFormulaCell;
    for (iterator.advance(1); !iterator.equals(end); iterator.advance(1)) {
      const current = iterator.get() as ScFormulaCell,
        state = current.CompareByTokenArray(previous);
      if (state !== CompareState.NotEqual) {
        const group = previous.GetCellGroup();
        if (group) {
          ++group.mnLength;
          current.SetCellGroup(group);
        } else
          current.SetCellGroup(previous.CreateCellGroup(2, state === CompareState.EqualInvariant));
      }
      previous = current;
    }
  }
  /** Original top-cell lookup. @param position - Actual block position. @returns Borrowed top or null. */
  static getSharedTopFormulaCell(position: CellPosition): ScFormulaCell | null {
    const node = position.first.get();
    if (node.type !== element_type_formula) return null;
    const cell = formula_block.at(
      node.data as base_element_block,
      position.second,
    ) as ScFormulaCell;
    return cell.GetCellGroup()?.mpTopCell ?? null;
  }
  /** Original split shortens the upper owner and clones actual code for the lower group. @param position - Actual block split position. @param context - Optional shared end context. @returns Split performed. */
  static splitFormulaCellGroup(
    position: CellPosition,
    context: EndListeningContext | null = null,
  ): boolean {
    const node = position.first.get(),
      row = node.position + position.second;
    if (node.type !== element_type_formula || position.second === 0) return false;
    const data = node.data as base_element_block,
      top = formula_block.at(data, position.second) as ScFormulaCell;
    if (!top.IsShared() || row === top.GetSharedTopRow()) return false;
    const group = top.GetCellGroup() as ScFormulaCellGroup,
      priorTop = group.mpTopCell as ScFormulaCell,
      length2 = priorTop.aPos.Row() + group.mnLength - row;
    let lower: ScFormulaCellGroup | null = null;
    if (length2 > 1) {
      lower = new ScFormulaCellGroup();
      lower.mbInvariant = group.mbInvariant;
      lower.mpTopCell = top;
      lower.mnLength = length2;
      lower.mpCode = (group.mpCode as ScTokenArray).CloneValue();
    }
    group.mnLength = row - priorTop.aPos.Row();
    const previous = formula_block.at(data, position.second - group.mnLength) as ScFormulaCell;
    if (length2) {
      previous.EndListeningTo(context ?? previous.GetDocument());
      previous.SetNeedsListening(true);
      top.SetNeedsListening(true);
    }
    if (group.mnLength === 1) previous.SetCellGroup(null);
    if (
      lower &&
      (lower.mpTopCell as ScFormulaCell).aPos.Row() + lower.mnLength > node.position + node.size
    )
      throw new Error("Shared formula region goes beyond the formula block.");
    for (let offset = 0; offset < length2; offset++)
      (formula_block.at(data, position.second + offset) as ScFormulaCell).SetCellGroup(lower);
    return true;
  }
  /** Original neighboring-cell join including the real document delay owner. @param position - First cell's actual store position. @param first - Upper cell. @param second - Lower cell. @returns Joined. */
  static joinFormulaCells(
    position: CellPosition,
    first: ScFormulaCell,
    second: ScFormulaCell,
  ): boolean {
    const doc = first.GetDocument();
    if (doc.IsDelayedFormulaGrouping()) {
      doc.AddDelayedFormulaGroupingCell(first);
      doc.AddDelayedFormulaGroupingCell(second);
      return false;
    }
    const state = first.CompareByTokenArray(second);
    if (state === CompareState.NotEqual) return false;
    let left = first.GetCellGroup();
    const right = second.GetCellGroup();
    if (left) {
      if (right) {
        if (left === right) return false;
        left.mnLength += right.mnLength;
        const data = position.first.get().data as base_element_block;
        for (let offset = 0; offset < right.mnLength; offset++)
          (formula_block.at(data, position.second + 1 + offset) as ScFormulaCell).SetCellGroup(
            left,
          );
      } else {
        second.SetCellGroup(left);
        ++left.mnLength;
      }
    } else if (right) {
      first.SetCellGroup(right);
      right.mpTopCell = first;
      ++right.mnLength;
    } else {
      if (first.aPos.Row() !== position.first.get().position + position.second)
        throw new Error("Formula row differs from block position.");
      left = first.CreateCellGroup(2, state === CompareState.EqualInvariant);
      second.SetCellGroup(left);
    }
    return true;
  }
  /** Original unshare preserves upper/lower group lengths and independent owned code. Caller owns listener teardown/restart. @param position - Actual block position. @param cell - Actual member. @returns Nothing. */
  static unshareFormulaCell(position: CellPosition, cell: ScFormulaCell): void {
    if (!cell.IsShared()) return;
    const group = cell.GetCellGroup() as ScFormulaCellGroup,
      node = position.first.get(),
      data = node.data as base_element_block;
    if (cell.aPos.Row() === cell.GetSharedTopRow()) {
      const next = formula_block.at(data, position.second + 1) as ScFormulaCell;
      if (group.mnLength === 2) next.SetCellGroup(null);
      else group.mpTopCell = next;
      --group.mnLength;
    } else if (cell.aPos.Row() === cell.GetSharedTopRow() + cell.GetSharedLength() - 1) {
      if (group.mnLength === 2)
        (formula_block.at(data, position.second - 1) as ScFormulaCell).SetCellGroup(null);
      else --group.mnLength;
    } else {
      const end = (group.mpTopCell as ScFormulaCell).aPos.Row() + group.mnLength - 1;
      group.mnLength = cell.aPos.Row() - (group.mpTopCell as ScFormulaCell).aPos.Row();
      if (group.mnLength === 1)
        (formula_block.at(data, position.second - 1) as ScFormulaCell).SetCellGroup(null);
      const length2 = end - cell.aPos.Row();
      if (length2 >= 2) {
        const lower = new ScFormulaCellGroup();
        lower.mpTopCell = formula_block.at(data, position.second + 1) as ScFormulaCell;
        lower.mnLength = length2;
        lower.mbInvariant = group.mbInvariant;
        lower.mpCode = (group.mpCode as ScTokenArray).CloneValue();
        if (lower.mpTopCell.aPos.Row() + lower.mnLength > node.position + node.size)
          throw new Error("Shared formula region goes beyond the formula block.");
        for (let offset = 0; offset < length2; offset++)
          (formula_block.at(data, position.second + 1 + offset) as ScFormulaCell).SetCellGroup(
            lower,
          );
      } else (formula_block.at(data, position.second + 1) as ScFormulaCell).SetCellGroup(null);
    }
    cell.SetCellGroup(null);
  }
  /** Original enabled group-listener path scans lexical tokens,keeps single-cell listeners and coalesces double-reference areas. @param context - Actual shared cursor context. @param pointer - Actual top-cell pointer in formula storage. @returns Nothing. */
  static startListeningAsGroup(
    context: StartListeningContext,
    pointer: delayed_delete_vector_iterator<ScFormulaCell | null>,
  ): void {
    const top = pointer.get() as ScFormulaCell;
    if (!top.IsSharedTop()) throw new Error("Expected shared top formula cell.");
    const doc = context.getDoc(),
      group = top.GetCellGroup() as ScFormulaCellGroup,
      code = group.mpCode as ScTokenArray;
    doc.SetDetectiveDirty(true);
    if (code !== top.GetCode()) throw new Error("Shared code differs from top cell code.");
    if (code.IsRecalcModeAlways())
      doc.StartListeningArea(
        BCA_LISTEN_ALWAYS(),
        false,
        group.getAreaListener(pointer, BCA_LISTEN_ALWAYS(), true, true),
      );
    for (const token of code.Tokens()) {
      if (token.GetType() === StackVar.svSingleRef) {
        const reference = (token as ScSingleRefToken).GetSingleRef(),
          address = reference.toAbs(doc, top.aPos),
          current = pointer.copy();
        for (let offset = 0; offset < group.mnLength; offset++, current.advance(1)) {
          if (!address.IsValid()) break;
          doc.StartListeningCell(context, address, current.get() as ScFormulaCell);
          if (reference.IsRowRel()) address.IncRow(1);
        }
      } else if (token.GetType() === StackVar.svDoubleRef) {
        const reference = (token as ScDoubleRefToken).GetDoubleRef(),
          first = reference.Ref1.toAbs(doc, top.aPos),
          last = reference.Ref2.toAbs(doc, top.aPos),
          original = new ScRange(first, last),
          listened = new ScRange(original);
        if (reference.Ref2.IsRowRel()) listened.aEnd.IncRow(group.mnLength - 1);
        if (first.IsValid() && last.IsValid())
          doc.StartListeningArea(
            listened,
            true,
            group.getAreaListener(
              pointer,
              original,
              !reference.Ref1.IsRowRel(),
              !reference.Ref2.IsRowRel(),
            ),
          );
      }
    }
    const current = pointer.copy();
    for (let offset = 0; offset < group.mnLength; offset++, current.advance(1))
      (current.get() as ScFormulaCell).SetNeedsListening(false);
  }
}
