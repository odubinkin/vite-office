/** @fileoverview Verifies locale canonicalization, catalog fallback, interpolation, absent keys, and invalid locale rejection. */
import { describe, expect, it } from "vitest";
import { interpolateMessage, normalizeLocale, resolveMessage } from "./messages";
/** Immutable fixture catalogs used without mutation. */
const catalogs = {
  en: { greet: "Hello {name}, {name}!", onlyDefault: "Default" },
  "pt-BR": { greet: "Olá {name}" },
  pt: { regional: "Português" },
};
describe("message catalogs" /** Groups pure locale message tests. @returns Nothing; Vitest registers cases. */, function defineMessageTests(): void {
  it("normalizes locales and resolves exact, language, default, and absent fallback" /** Verifies all catalog lookup paths. @returns Nothing; assertions validate results. */, function resolvesCatalogs(): void {
    expect(normalizeLocale("pt-br")).toBe("pt-BR");
    expect(resolveMessage(catalogs, "pt-BR", "en", "greet")).toBe("Olá {name}");
    expect(resolveMessage(catalogs, "pt-PT", "en", "regional")).toBe("Português");
    expect(resolveMessage(catalogs, "fr", "en", "onlyDefault")).toBe("Default");
    expect(resolveMessage(catalogs, "fr", "en", "missing")).toBe("missing");
  });
  it("interpolates repeated known placeholders and preserves unknown ones" /** Verifies deterministic replacements. @returns Nothing; assertions validate output. */, function interpolatesMessages(): void {
    expect(interpolateMessage("Hello {name}, {name}, {unknown}", { name: "Ada", count: 2 })).toBe(
      "Hello Ada, Ada, {unknown}",
    );
  });
  it("rejects malformed locale tags" /** Verifies invalid locale propagation. @returns Nothing; assertion validates RangeError. */, function rejectsInvalidLocale(): void {
    expect(
      /** Normalizes malformed tag. @returns Invalid locale result. */ function invalidLocale() {
        return normalizeLocale("not_a_locale");
      },
    ).toThrowError(RangeError);
  });
});
