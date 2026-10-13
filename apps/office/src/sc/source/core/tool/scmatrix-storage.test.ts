/** @fileoverview Complete unchanged original internal matrix initialization/geometry/coordinate observations; native memory pool counts are deliberately excluded. */
import { expect, it } from "vitest";
import { ScMatrixImpl } from "./scmatrix";
import fixture from "./native-matrix-storage-cases.json";
import {
  uint16_element_callbacks,
  uint8_element_callbacks,
} from "../../../../external/mdds/include/mdds/multi_type_vector/standard_element_blocks";
it("matches original internal matrix storage and coordinate replication stream", /** Replays complete source-excerpt observations, including initialized storage and native trait widths. @returns Nothing. */ () => {
  const lines: string[] = [];
  /** Observes actual internal containers through caller-only test access, matching native declaration scaffolding. @param label - Stage. @param matrix - Original storage owner. @returns Nothing. */
  function observe(label: string, matrix: ScMatrixImpl): void {
    const shape = { column: 99, row: 99 };
    matrix.GetDimensions(shape);
    lines.push(
      `${label} ${shape.column} ${shape.row} ${matrix.GetElementCount()} ${Number(matrix.IsNumeric())}`,
    );
    const data = matrix["maMat"],
      flags = matrix["maMatFlag"];
    for (let c = 0; c < shape.column; ++c)
      for (let r = 0; r < shape.row; ++r)
        lines.push(
          `cell ${c} ${r} ${data.get_type(r, c)} ${data.get_numeric(r, c)} ${flags.get_type(r, c)}`,
        );
    for (let c = 0; c <= 4; ++c)
      for (let r = 0; r <= 4; ++r) {
        const replicated = { column: c, row: r },
          either = { column: c, row: r };
        const rep = matrix.ValidColRowReplicated(replicated),
          valid = matrix.ValidColRowOrReplicated(either);
        lines.push(
          `coord ${c} ${r} ${Number(matrix.ValidColRow(c, r))} ${Number(rep)} ${replicated.column} ${replicated.row} ${Number(valid)} ${either.column} ${either.row}`,
        );
      }
  }
  for (let c = 0; c <= 3; ++c)
    for (let r = 0; r <= 3; ++r) {
      lines.push(`shape ${c} ${r}`);
      const empty = new ScMatrixImpl(c, r),
        filled = new ScMatrixImpl(c, r, 2.5),
        values = Array.from(
          { length: c * r },
          /** Native double vector initializer. @param _unused - Element. @param index - Offset. @returns Value. */ (
            _unused,
            index,
          ) => index + 0.5,
        );
      const ranged = new ScMatrixImpl(c, r, values);
      if (values.length) values[0] = 99;
      observe("empty", empty);
      observe("filled", filled);
      observe("vector", ranged);
      ranged.Clear();
      observe("cleared", ranged);
    }
  const typed = new ScMatrixImpl(1, 1);
  typed["maMat"].set(0, 0, 65535, uint16_element_callbacks);
  typed["maMatFlag"].set(0, 0, 255, uint8_element_callbacks);
  lines.push(`traits ${typed["maMat"].get_integer(0, 0)} ${typed["maMatFlag"].get_integer(0, 0)}`);
  typed.Clear();
  expect(lines.join("\n") + "\n").toBe(fixture.captures.storage);
});
