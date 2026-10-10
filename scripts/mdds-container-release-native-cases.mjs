/** @fileoverview Original public range-release caller inputs; no container algorithm or expected-output model. */
/** Appends original public range-release sequences to the complete common observer. @param cases - Existing corpus. @param typeCount - Standard families. @param maxRow - Native size_t maximum. @returns Nothing. */
export function append_release_cases(cases, typeCount, maxRow) {
  for (let type = 0; type < typeCount; ++type) {
    for (const base of [48, 60, 96, 132]) {
      const size = base === 132 ? 17 : 13;
      for (let first = 0; first < size; ++first)
        for (let last = first; last < size; ++last)
          cases.push({
            seed: base + type,
            commands: [
              ["Q", 1, 0],
              ["!", 0, first, last],
              ["a", 0, type, "3"],
              ["C", 0],
              ["r", 1],
              ["U", 0],
              ["U", 1],
            ],
          });
    }
    for (const base of [36, 48, 60, 84, 120, 132]) {
      const size = base === 36 ? 11 : base === 84 ? 41 : base >= 120 ? 17 : 13;
      const lastBlock = base === 84 ? 40 : base === 120 ? 0 : base === 132 ? 2 : 4;
      const middle = Math.floor(size / 2);
      for (const [first, last] of [
        [0, size - 1],
        [1, middle],
        [middle, size - 1],
        [middle, middle],
        [size - 1, size - 1],
        [size, size],
        [maxRow, maxRow],
        [1, 0],
        [0, size],
        [maxRow, 0],
      ])
        for (const foreign of [false, true]) {
          const commands = [
            ["Q", 1, 0],
            ["@", 0, first, last, foreign ? 1 : 0, lastBlock],
          ];
          if (typeof first === "number" && typeof last === "number" && first <= last && last < size)
            commands.push(["#", 0, first, last, 0]);
          commands.push(["a", 0, type, "3"], ["r", 0], ["U", 0], ["U", 1]);
          cases.push({ seed: base + type, commands });
        }
    }
    for (const n of [0, 1, 2, 5, 17])
      for (const filled of [false, true])
        for (const [first, last] of [
          [0, 0],
          [0, Math.max(n - 1, 0)],
          [Math.floor(n / 2), Math.floor(n / 2)],
          [1, 0],
          [n, 0],
          [0, n],
          [maxRow, 0],
          [0, maxRow],
        ])
          cases.push({
            seed: -1,
            commands: [
              filled ? ["F", 0, n, type, "2"] : ["Z", 0, n],
              ["Q", 1, 0],
              ["!", 0, first, last],
              ["U", 0],
              ["U", 1],
            ],
          });
    for (const row of [0, maxRow])
      cases.push({
        seed: -1,
        commands: [
          ["F", 0, 5, type, "2"],
          ["M", 1, 0],
          ["!", 0, row, row],
          ["U", 0],
          ["U", 1],
        ],
      });
  }
}
