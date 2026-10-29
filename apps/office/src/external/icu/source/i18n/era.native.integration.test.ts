/** @fileoverview Replays compiled original ICU78.3 EraRules sparse indices, sentinel starts and actual resource-backed era lookup. */
import { afterAll, assert, beforeAll, expect, it, vi } from "vitest";
import observations from "./era.native-observations.json";
import { EraRules } from "./erarules";

beforeAll(
  /** Fixes only the platform clock to the native capture's era-selection date. @returns Nothing. */ () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(observations.capturedAt));
  },
);
afterAll(/** Restores the ordinary host clock. @returns Nothing. */ () => vi.useRealTimers());
/** Replays actual factory/query callers with their original sticky status and output sentinels. @param query - Native protocol row. @returns Complete observed scalar row. */
function replay(query: string): number[] {
  const [name, tentative, incomingText, codeText, year, month, day] = query.split(" ");
  const incoming = Number(incomingText),
    code = Number(codeText),
    status: [number] = [incoming];
  const rules = EraRules.createInstance(name as string, Boolean(Number(tentative)), status),
    result = [status[0], Number(rules !== null)];
  if (rules) {
    result.push(rules.getMaxEraCode(), rules.getNumberOfEras(), rules.getCurrentEraCode());
    const fields: [number, number, number] = [91, 92, 93];
    status[0] = incoming;
    rules.getStartDate(code, fields, status);
    result.push(...fields, status[0]);
    status[0] = incoming;
    result.push(rules.getStartYear(code, status), status[0]);
    status[0] = incoming;
    result.push(rules.getEraCode(Number(year), Number(month), Number(day), status), status[0]);
  }
  return result;
}
const names = [
  ...new Set(
    observations.cases.map(
      /** Selects the native resource name without consulting the port. @param row - Input/output pair. @returns Calendar name. */ (
        row,
      ) => (row[0] as string).split(" ")[0] as string,
    ),
  ),
];
it.each(names)(
  "matches original era resources and queries for %s",
  /** Covers valid/sparse/invalid codes, signed-year extremes, tentative eras and sticky warnings/errors. @param name - Native resource selector. @returns Nothing. */ (
    name,
  ) => {
    const rows = observations.cases.filter(
      /** Keeps this independent calendar resource group. @param row - Native pair. @returns Whether selected. */ (
        row,
      ) => (row[0] as string).split(" ")[0] === name,
    );
    expect(rows.length).toBeGreaterThan(0);
    for (const [query, output] of rows)
      expect(replay(query as string), query).toEqual((output as string).split(" ").map(Number));
  },
);

it("retains an already-loaded era table and caller outputs under sticky query failure", /** Source-backed follow-up: the original factory succeeds before query statuses fail; normal native fixture rows usually use one shared initial status for both stages. @returns Nothing. */ () => {
  const status: [number] = [0],
    rules = EraRules.createInstance("japanese", false, status);
  assert(rules);
  const code = rules.getCurrentEraCode(),
    count = rules.getNumberOfEras(),
    fields: [number, number, number] = [91, 92, 93];
  status[0] = 3;
  rules.getStartDate(code, fields, status);
  expect(fields).toEqual([91, 92, 93]);
  expect(rules.getStartYear(code, status)).toBe(2147483647);
  expect(rules.getEraCode(2024, 1, 1, status)).toBe(-1);
  expect(status[0]).toBe(3);
  expect(rules.getNumberOfEras()).toBe(count);
  status[0] = 0;
  rules.getStartDate(code, fields, status);
  expect(fields).toEqual([2019, 5, 1]);
  expect(rules.getStartYear(code, status)).toBe(2019);
  expect(rules.getEraCode(2024, 1, 1, status)).toBe(code);
  expect(status[0]).toBe(0);
});

it("keeps the first era when the host clock cannot be converted to Gregorian fields", /** Controls only platform UTC milliseconds; original resource loading, Grego validation and era initialization execute normally. @returns Nothing. */ () => {
  const clock = vi.spyOn(globalThis.Date, "now").mockReturnValue(Number.MAX_VALUE);
  try {
    const status: [number] = [0],
      rules = EraRules.createInstance("gregorian", false, status);
    assert(rules);
    expect(status[0]).toBeLessThanOrEqual(0);
    expect(rules.getCurrentEraCode()).toBe(rules.getEraCode(-2147483648, 1, 1, [0]));
  } finally {
    clock.mockRestore();
  }
});
