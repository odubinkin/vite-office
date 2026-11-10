/** @fileoverview Original getKnowns whole raw-ID iteration, one-time publication and failed-initializer retry over real defined mapping values. */
import { afterEach, expect, it, vi } from "vitest";
import { MsLangId } from "../../inc/mslangid";
import { unicode } from "../isolang/isolang.tables";
afterEach(
  /** Restores constructor/dependency fixture spies. @returns Nothing. */ () =>
    vi.restoreAllMocks(),
);

it("constructs only numeric tags in complete original order and caches the set", /** The constructor fixture supplies explicit vectors; it does not claim full LanguageTag implementation. @returns Completion. */ async () => {
  vi.resetModules();
  const { getKnowns } = await import("./languagetag.knowns");
  const definitions = MsLangId.getDefinedLanguagetags(),
    expected = definitions.map(
      /** Records original raw IDs including aliases/duplicates. @param entry - Original mapping. @returns Raw ID. */ (
        entry,
      ) => entry.mnLang,
    );
  for (const entry of definitions) entry.maBcp47.dispose();
  const calls: number[] = [],
    destroyed: number[] = [];
  const known = getKnowns(
    /** Observes source numeric construction without reparsing maBcp47 strings. @param language - Raw source ID. @returns Explicit original-vector fixture. */ (
      language,
    ) => {
      calls.push(language);
      return {
        /** Observes the original full-vector request. @param full - Source include flag. @returns Prepared original membership input. */
        getFallbackStrings(full) {
          expect(full).toBe(true);
          return ["duplicate", String(language), "Case", "case"];
        },
        /** Observes each source temporary destructor. @returns Nothing. */
        dispose() {
          destroyed.push(language);
        },
      };
    },
  );
  expect(calls).toEqual(expected);
  expect(destroyed).toEqual(expected);
  expect(known.size).toBe(new Set(expected).size + 3);
  expect(known.has("duplicate")).toBe(true);
  expect(known.has("Case")).toBe(true);
  expect(known.has("case")).toBe(true);
  expect(known.has(String(expected[0]))).toBe(true);
  expect(
    getKnowns(
      /** Must not call another constructor after successful static initialization. @returns Never. */ () => {
        throw new Error("Unexpected constructor");
      },
    ),
  ).toBe(known);
});

it("does not publish a partial set when construction fails", /** Preserves original function-local static initialization retry and temporary cleanup. @returns Completion. */ async () => {
  vi.resetModules();
  const { getKnowns } = await import("./languagetag.knowns");
  let calls = 0,
    destroyed = 0;
  expect(
    /** Executes the original helper under an explicit constructor-failure fixture. @returns Source helper result or the fixture exception. */ () =>
      getKnowns(
        /** Simulates an enclosing constructor exception after the first completed temporary. @returns Explicit fixture. */ () => {
          if (++calls === 2) throw new Error("constructor fixture");
          return {
            /** Supplies first partial membership. @returns Values. */
            getFallbackStrings() {
              return ["partial"];
            },
            /** Observes completed temporary cleanup. @returns Nothing. */
            dispose() {
              destroyed++;
            },
          };
        },
      ),
  ).toThrow("constructor fixture");
  expect(destroyed).toBe(1);
  const result = getKnowns(
    /** Successful retry fixture. @returns Explicit vector owner. */ () => ({
      /** Supplies complete retry membership. @returns Values. */
      getFallbackStrings() {
        return ["complete"];
      },
      /** Original temporary end. @returns Nothing. */
      dispose() {},
    }),
  );
  expect([...result]).toEqual(["complete"]);
});

it("releases every defined Unicode value when a later tag constructor throws", /** The original vector is fully constructed before traversal, including values not yet visited. @returns Completion. */ async () => {
  vi.resetModules();
  const module = await import("../../inc/mslangid");
  const { getKnowns } = await import("./languagetag.knowns");
  const entries = [1, 2, 3].map(
    /** Creates actual independently owned definition values. @param id - Fixture raw ID. @returns Owned source record. */ (
      id,
    ) => ({ mnLang: id, maBcp47: unicode("definition-" + id) }),
  );
  const disposed = entries.map(
    /** Observes actual Unicode destruction without replacing it. @param entry - Actual value. @returns Original destructor spy. */ (
      entry,
    ) => vi.spyOn(entry.maBcp47, "dispose"),
  );
  vi.spyOn(module.MsLangId, "getDefinedLanguagetags").mockReturnValue(entries);
  let calls = 0;
  expect(
    /** Executes the original helper under an explicit constructor-failure fixture. @returns Source helper result or the fixture exception. */ () =>
      getKnowns(
        /** Throws during original second constructor. @returns First completed temporary. */ () => {
          if (++calls === 2) throw new Error("later constructor");
          return {
            /** First fixture vector. @returns Prepared values. */
            getFallbackStrings() {
              return ["first"];
            },
            /** Source temporary end. @returns Nothing. */
            dispose() {},
          };
        },
      ),
  ).toThrow("later constructor");
  for (const dispose of disposed) expect(dispose).toHaveBeenCalledTimes(1);
});

it("ends the numeric tag temporary before iterating the returned vector", /** Observes the source temporary lifetime independently from membership and constructor order. @returns Completion. */ async () => {
  vi.resetModules();
  const module = await import("../../inc/mslangid");
  const { getKnowns } = await import("./languagetag.knowns");
  vi.spyOn(module.MsLangId, "getDefinedLanguagetags").mockReturnValue([
    { mnLang: 1, maBcp47: unicode("definition") },
  ]);
  let disposed = false;
  const values = ["candidate"];
  Object.defineProperty(values, "0", {
    /** Observes source vector access after destruction of the LanguageTag temporary. @returns Candidate value. */
    get() {
      expect(disposed).toBe(true);
      return "candidate";
    },
  });
  const result = getKnowns(
    /** Supplies explicit original temporary/vector protocol. @returns Fixture value. */ () => ({
      /** Original vector return. @returns Observed vector. */
      getFallbackStrings() {
        return values;
      },
      /** Original temporary end. @returns Nothing. */
      dispose() {
        disposed = true;
      },
    }),
  );
  expect(result.has("candidate")).toBe(true);
});
