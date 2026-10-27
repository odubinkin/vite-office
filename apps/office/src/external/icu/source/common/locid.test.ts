/** @fileoverview Source Locale value/default/fixed-cache ownership, root-keyword construction and strict-versus-ordinary tag semantics. */
import { expect, it, vi } from "vitest";
import { Locale } from "./locid";
it("initializes the actual default while constructing the fixed root cache", /** Native locale_init default-constructs all19 entries before replacing them. @returns Nothing. */ () => {
  const host = vi.spyOn(Intl, "DateTimeFormat").mockImplementation(
    /** Supplies one deterministic semantic host ID. @returns Host formatter view. */ () =>
      ({
        resolvedOptions: /** Returns original host options boundary. @returns Locale ID. */ () => ({
          locale: "sr-Latn-RS",
        }),
      }) as Intl.DateTimeFormat,
  );
  expect(Locale.getRoot().getName()).toBe("");
  expect(host).toHaveBeenCalledTimes(1);
  expect(Locale.getDefault().getName()).toBe("sr_Latn_RS");
  expect(Locale.getRoot()).toBe(Locale.getRoot());
  expect(Locale.getPRC()).toBe(Locale.getChina());
  expect(Locale.getSimplifiedChinese()).toBe(Locale.getChina());
  expect(Locale.getTraditionalChinese()).toBe(Locale.getTaiwan());
  expect(Locale.getCanadaFrench().getName()).toBe("fr_CA");
  host.mockRestore();
});
it("preserves the all-null default shortcut and explicit root calendar keywords", /** This is the constructor distinction used by LibreOffice Calendar_gregorian::init. @returns Nothing. */ () => {
  Locale.setDefault(new Locale("en_US"), [0]);
  expect(new Locale(null, null, null, "calendar=gregorian").getName()).toBe("en_US");
  const root = new Locale("", null, null, "calendar=gregorian");
  expect(root.getName()).toBe("@calendar=gregorian");
  expect(root.getBaseName()).toBe("");
  expect(root.getVariant()).toBe("");
  expect(root.isBogus()).toBe(false);
});
it("retains source component assembly, ISO normalization and C-string inputs", /** No host locale normalizer is substituted. @returns Nothing. */ () => {
  const value = new Locale("ENG", "USA", "__posix__", "calendar=gregorian");
  expect([value.getName(), value.getLanguage(), value.getCountry(), value.getVariant()]).toEqual([
    "en_US_POSIX@calendar=gregorian",
    "en",
    "US",
    "POSIX",
  ]);
  expect(new Locale("en\0de", "us", "a\0b", "ca=gregory\0x").getName()).toBe("en_US_A@ca=gregory");
  expect(new Locale("sr", "RS", "___", "Latn").getName()).toBe("sr_RS__LATN");
});
it("owns copied payloads while preserving source bogus-name equality", /** Compares actual clone/assignment owners and native operator== behavior. @returns Nothing. */ () => {
  const source = new Locale("en_US@calendar=gregorian"),
    clone = source.clone(),
    assigned = new Locale("fr_FR");
  assigned.assign(source);
  source.setToBogus();
  expect(clone.getName()).toBe("en_US@calendar=gregorian");
  expect(assigned.getName()).toBe(clone.getName());
  expect(source.isBogus()).toBe(true);
  expect(source.equals(Locale.getRoot())).toBe(true);
  expect(Locale.getRoot().isBogus()).toBe(false);
});
it("retains cached default identity, copies and incoming failure guards", /** Native fixed cache and default hash own separate Locale instances. @returns Nothing. */ () => {
  Locale.setDefault(new Locale("en-US"), [0]);
  const first = Locale.getDefault(),
    copied = new Locale();
  expect(copied.getName()).toBe("en_US");
  expect(copied).not.toBe(first);
  expect(first).not.toBe(Locale.getUS());
  Locale.setDefault(new Locale("fr_FR"), [0]);
  Locale.setDefault(new Locale("en_US"), [0]);
  expect(Locale.getDefault()).toBe(first);
  const status: [number] = [1];
  Locale.setDefault(new Locale("de_DE"), status);
  expect(Locale.getDefault()).toBe(first);
  expect(status[0]).toBe(1);
});
it("rejects unconsumed tag input only in the source strict factory", /** Ordinary legacy construction remains permissive according to its own parser. @returns Nothing. */ () => {
  const ordinary = new Locale("en-US-junk!");
  expect(ordinary.isBogus()).toBe(false);
  expect(ordinary.getName()).toBe("en_US_JUNK!");
  const status: [number] = [0],
    strict = Locale.forLanguageTag("en-US-junk!", status);
  expect(strict.isBogus()).toBe(true);
  expect(status[0]).toBe(1);
  status[0] = 0;
  expect(Locale.forLanguageTag("en-u-ca-gregory", status).getName()).toBe("en@calendar=gregorian");
  expect(status[0]).toBe(0);
});
