/** @fileoverview Original columnset.cxx sparse sheet/column pair owner. */
/** Original native ColumnSet;managed maps/sets preserve the represented value semantics without simulated allocator failures. */
export class ColumnSet {
  private readonly maTabs = new Map<number, Set<number>>();
  /** Original pair insertion. @param tab - Native sheet. @param col - Native column. @returns Nothing. */
  set(tab: number, col: number): void {
    let columns = this.maTabs.get(tab);
    if (!columns) {
      columns = new Set();
      this.maTabs.set(tab, columns);
    }
    columns.add(col);
  }
  /** Original sorted unique output replaces the caller's vector. @param tab - Sheet. @param output - Output columns. @returns Nothing. */
  getColumns(tab: number, output: number[]): void {
    output.length = 0;
    const columns = this.maTabs.get(tab);
    if (!columns) return;
    for (const col of [...columns].sort(
      /** Original ascending native sort. @param first - Column. @param second - Column. @returns Ordering. */ (
        first,
        second,
      ) => first - second,
    ))
      output.push(col);
  }
  /** Original sheet presence query. @param tab - Sheet. @returns Present flag. */
  hasTab(tab: number): boolean {
    return this.maTabs.has(tab);
  }
  /** Original sparse owner emptiness. @returns Empty flag. */
  empty(): boolean {
    return this.maTabs.size === 0;
  }
}
