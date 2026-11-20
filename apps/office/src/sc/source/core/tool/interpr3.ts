/** @fileoverview Numeric operands and sort order for Calc statistical functions. */
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { StackVar } from "../../../../formula/inc/token";
import { ScRefCellValue } from "../../../inc/cellvalue";
import { ScValueIterator } from "../../../inc/dociter";
import type { ScInterpreter } from "./interpr4";

/** A numeric value paired with its position before sorting. */
interface SortValue {
  value: number;
  index: number;
}

/** Partitions the numeric sequence while retaining the original indexes of equal values. @param array - Indexed numeric values. @param low - First element. @param high - Last element. @returns Nothing. */
function quickSort(array: SortValue[], low: number, high: number): void {
  if (high - low === 1) {
    if ((array[low] as SortValue).value > (array[high] as SortValue).value)
      [array[low], array[high]] = [array[high] as SortValue, array[low] as SortValue];
    return;
  }
  let left = low;
  let right = high;
  do {
    const pivot = (array[low] as SortValue).value;
    while (left <= high && (array[left] as SortValue).value < pivot) left++;
    while (right >= low && pivot < (array[right] as SortValue).value) right--;
    if (left <= right) {
      if (left !== right)
        [array[left], array[right]] = [array[right] as SortValue, array[left] as SortValue];
      left++;
      right--;
    }
  } while (left < right);
  if (right - low < high - left) {
    if (low < right) quickSort(array, low, right);
    if (left < high) quickSort(array, left, high);
  } else {
    if (left < high) quickSort(array, left, high);
    if (low < right) quickSort(array, low, right);
  }
}

/** Reads numeric operands with the original distinction between direct values and referenced data. @param this - Active interpreter. @returns Numeric values in source order. */
function GetNumberSequenceArray(this: ScInterpreter): number[] {
  const type = this["pStack"].at(-1)?.GetType();
  switch (type) {
    case StackVar.svDouble:
      return [this["GetDouble"]()];
    case StackVar.svSingleRef: {
      const address = this["PopSingleRef"]();
      const cell = new ScRefCellValue(this.mrDoc, address);
      return cell.hasNumeric() ? [this["GetCellValue"](address, cell)] : [];
    }
    case StackVar.svDoubleRef: {
      const range = this["PopDoubleRef"]();
      if (this.GetError() !== FormulaError.NONE) return [];
      range.PutInOrder();
      const values: number[] = [];
      const iterator = new ScValueIterator(this.mrContext, range);
      const output = { error: FormulaError.NONE, value: 0 };
      if (iterator.GetFirst(output)) {
        do {
          values.push(output.value);
        } while (output.error === FormulaError.NONE && iterator.GetNext(output));
        this.SetError(output.error);
      }
      return values;
    }
    case StackVar.svMatrix:
    case StackVar.svExternalSingleRef:
    case StackVar.svExternalDoubleRef: {
      const matrix = this["GetLookupMatrix"]();
      if (!matrix) return [];
      const values: number[] = [];
      const size = { row: 0, column: 0 };
      matrix.GetDimensions(size);
      for (let col = 0; col < size.column; col++)
        for (let row = 0; row < size.row; row++) {
          if (!matrix.IsValue(col, row)) continue;
          const item = matrix.Get(col, row);
          try {
            this.SetError(item.GetError());
            values.push(item.fVal);
          } finally {
            item.dispose();
          }
        }
      return values;
    }
    default:
      this["PopError"]();
      this.SetError(FormulaError.IllegalParameter);
      return [];
  }
}

/** Collects a required numeric sequence and keeps its original indexes through the native sort. @param this - Active interpreter. @returns Sorted values with their source indexes. */
export function GetSortArray(this: ScInterpreter): SortValue[] {
  const values = GetNumberSequenceArray.call(this);
  if (values.length > this.mrDoc.GetSheetLimits().GetMaxRowCount() * 2)
    this.SetError(FormulaError.MatrixSize);
  else if (!values.length) this.SetError(FormulaError.NoValue);
  if (this.GetError() !== FormulaError.NONE) return [];
  const sorted = values.map(
    /** Records the source order before sorting. @param value - Numeric value. @param index - Source position. @returns Indexed value. */
    (value, index) => ({ value, index }),
  );
  const last = sorted.length - 1;
  for (let index = 0; index + 4 <= last; index += 4) {
    const swap = Math.floor(Math.random() * last);
    [sorted[index], sorted[swap]] = [sorted[swap] as SortValue, sorted[index] as SortValue];
  }
  if (last > 0) quickSort(sorted, 0, last);
  return sorted;
}
