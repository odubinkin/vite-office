/** @fileoverview Original range-empty and middle-split native caller inputs; contains no container algorithm or expected-output reconstruction. */
/** Appends complete original empty-operation caller sequences to the shared native observer corpus. @param cases - Existing full caller corpus. @param typeCount - Existing standard scalar families. @param maxRow - Original size_t maximum witness. @returns Nothing. */
export function append_empty_cases(cases, typeCount, maxRow) {
  for (let type = 0; type < typeCount; ++type) {
    for (const base of [48, 60, 96, 132]) {
      const size = base === 132 ? 17 : 13;
      for (let first = 0; first < size; ++first)
        for (let last = first; last < size; ++last)
          for (const overwrite of [false, true])
            cases.push({
              seed: base + type,
              commands: [
                ["Q", 1, 0],
                overwrite ? ["q", 0, first, last] : ["u", 0, first, last, 0],
                ["a", 0, type, "3"],
                ["r", 0],
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
            ["z", 0, first, last, foreign ? 1 : 0, lastBlock],
          ];
          if (typeof first === "number" && typeof last === "number" && first <= last && last < size)
            commands.push(["s", 0, first, last, 0]);
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
              ["q", 0, first, last],
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
          ["q", 0, row, row],
          ["U", 0],
          ["U", 1],
        ],
      });
    for (const n of [5, 17])
      for (const filled of [false, true])
        for (const offset of [...new Set([1, Math.floor(n / 2), n - 2])])
          for (const length of [1, 2])
            if (offset + length < n)
              for (const overwrite of [0, 1])
                cases.push({
                  seed: -1,
                  commands: [
                    filled ? ["F", 0, n, type, "2"] : ["Z", 0, n],
                    ["Q", 1, 0],
                    ["m", 0, 0, offset, length, overwrite],
                    ["U", 0],
                    ["U", 1],
                  ],
                });
  }
}
