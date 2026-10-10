/** @fileoverview Original public scalar-release caller inputs; no implementation or expected-output model. */
/** Appends typed original scalar-release callers matching the existing declared seed setups. @param cases - Corpus. @param typeCount - Standard families. @param maxRow - Native maximum. @returns Nothing. */
export function append_scalar_release_cases(cases, typeCount, maxRow) {
  const shapes = [
    [0, 5, 4, [2]],
    [36, 11, 4, [4, 5, 6]],
    [48, 13, 4, [11, 12]],
    [60, 13, 4, [8, 9, 10]],
    [
      84,
      41,
      40,
      Array.from(
        { length: 10 },
        /** Selects declared alternating seed rows. @param unused - Unused array slot. @param i - Declared cell pair. @returns Matching-type caller row. */ (
          unused,
          i,
        ) => {
          void unused;
          return 4 * i + 2;
        },
      ),
    ],
    [96, 13, 3, [3, 4, 5]],
    [120, 17, 0, []],
    [132, 17, 2, [10, 11, 12, 13, 14, 15, 16]],
  ];
  for (let type = 0; type < typeCount; ++type) {
    for (const [base, size, lastBlock, otherRows] of shapes) {
      for (let row = 0; row < size; ++row) {
        const family = otherRows.includes(row) ? (type + 1) % typeCount : type;
        for (const op of ["(", ")"])
          cases.push({
            seed: base + type,
            commands: [
              ["Q", 1, 0],
              [op, 0, row, family],
              [")", 0, row, family],
              ["a", 0, family, "3"],
              ["U", 0],
              ["U", 1],
            ],
          });
        for (const foreign of [false, true])
          cases.push({
            seed: base + type,
            commands: [
              ["Q", 1, 0],
              ["=", 0, row, family, foreign ? 1 : 0, lastBlock],
              ["~", 0, row, family, 0],
              ["a", 0, family, "3"],
              ["U", 0],
              ["U", 1],
            ],
          });
      }
    }
    for (const n of [0, 1, 2, 5, 17])
      for (const filled of [false, true])
        for (const row of [0, Math.floor(n / 2), Math.max(n - 1, 0), n, maxRow])
          for (const op of n ? ["(", ")", "="] : ["(", ")"])
            cases.push({
              seed: -1,
              commands: [
                filled ? ["F", 0, n, type, "2"] : ["Z", 0, n],
                ["Q", 1, 0],
                op === "=" ? [op, 0, row, type, 1, 0] : [op, 0, row, type],
                ["U", 0],
                ["U", 1],
              ],
            });
    for (const op of ["(", ")"])
      for (const row of [0, maxRow])
        cases.push({
          seed: -1,
          commands: [
            ["F", 0, 5, type, "2"],
            ["M", 1, 0],
            op === "=" ? [op, 0, row, type, 1, 0] : [op, 0, row, type],
            ["U", 0],
            ["U", 1],
          ],
        });
    for (const foreign of [false, true])
      cases.push({
        seed: 120 + type,
        commands: [
          ["Q", 1, 0],
          ["=", 0, 4, type, foreign ? 1 : 0, 0],
          ["~", 0, 12, type, 0],
          ["~", 0, 0, type, 0],
          ["~", 0, 16, type, 0],
          ["r", 0],
          ["U", 0],
          ["U", 1],
        ],
      });
  }
}
