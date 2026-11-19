/** @fileoverview Native libc integration for original OSL locale/environment precedence, process cache and thread encoding contracts. */
import { beforeAll, afterAll, expect, it } from "vitest";
import { initializeRuntime, getRuntime } from "../../../external/emscripten/runtime";
import { getenv, getLocaleCodeset } from "../../../external/emscripten/locale";
import { rtl_locale_register, type rtl_Locale } from "../../inc/rtl/locale";
import { imp_getProcessLocale, osl_getTextEncodingFromLocale } from "./nlsupport";
import { osl_getProcessLocale, osl_setProcessLocale, oslProcessError } from "../../inc/osl/process";
import { osl_getThreadTextEncoding, osl_setThreadTextEncoding } from "../../inc/osl/thread";
import { getThreadTextEncodingForInitialization } from "./thread";
import {
  RTL_TEXTENCODING_ASCII_US,
  RTL_TEXTENCODING_UTF8,
  RTL_TEXTENCODING_DONTKNOW,
  RTL_TEXTENCODING_MS_1251,
} from "../../inc/rtl/textenc";
import { nl_language_list } from "./nlsupport.table";
import type { rtl_uString } from "../../inc/rtl/ustring.h";

const names = ["LC_ALL", "LC_CTYPE", "LANG"];
let saved: Array<Uint8Array | null>;
let originalProcess: rtl_Locale;
/** Borrows the actual initialized runtime. @returns Actual native exports. */
function api(): NonNullable<ReturnType<typeof getRuntime>> {
  return getRuntime() as NonNullable<ReturnType<typeof getRuntime>>;
}
/** Creates source UTF16 input. @param value - Text. @returns Terminated units. */
function units(value: string): Uint16Array {
  return Uint16Array.from([
    ...value
      .split("")
      .map(
        /** Converts one unit. @param unit - Unit. @returns Code. */ (unit) => unit.charCodeAt(0),
      ),
    0,
  ]);
}
/** Changes only the actual WASM libc environment through setenv/unsetenv. @param name - ASCII variable name. @param value - Bytes or null to unset. @returns Nothing. */
function environment(name: string, value: Uint8Array | null): void {
  const runtime = api(),
    key = runtime._malloc(name.length + 1),
    input = runtime._malloc((value?.length ?? 0) + 1);
  try {
    runtime.stringToUTF8(name, key, name.length + 1);
    if (value === null) expect(runtime._unsetenv(key)).toBe(0);
    else {
      runtime.HEAPU8.set(value, input);
      runtime.HEAPU8[input + value.length] = 0;
      expect(runtime._setenv(key, input, 1)).toBe(0);
    }
  } finally {
    runtime._free(input);
    runtime._free(key);
  }
}
/** Sets locale variables for a genuine native lookup. @param all - LC_ALL. @param ctype - LC_CTYPE. @param lang - LANG. @returns Nothing. */
function variables(all: string | null, ctype: string | null, lang: string | null): void {
  [all, ctype, lang].forEach(
    /** Sets an actual libc environment entry. @param value - Text or null. @param index - Variable index. @returns Nothing. */ (
      value,
      index,
    ) =>
      environment(
        names[index] as string,
        value === null
          ? null
          : Uint8Array.from(
              value
                .split("")
                .map(
                  /** Converts one native byte. @param unit - ASCII unit. @returns Byte. */ (
                    unit,
                  ) => unit.charCodeAt(0),
                ),
            ),
      ),
  );
}
/** Returns original logical field text. @param value - Live RTL data. @returns Text. */
function text(value: rtl_uString): string {
  return String.fromCharCode(...value.buffer.subarray(0, value.length));
}
/** Reads the original uncached environment parser. @returns Registered locale. */
function parsed(): rtl_Locale {
  const slot: [rtl_Locale | null] = [null];
  imp_getProcessLocale(slot);
  return slot[0] as rtl_Locale;
}
/** Reads original registered fields. @param value - Locale. @returns Field tuple. */
function fields(value: rtl_Locale): string[] {
  return [text(value.Language), text(value.Country), text(value.Variant)];
}

beforeAll(
  /** Initializes the real native module and captures its original environment/cache. @returns Completion. */ async () => {
    expect(getRuntime()).toBeUndefined();
    expect(
      /** Calls libc before bootstrap to verify the initialization contract. @returns Native environment result. */ () =>
        getenv("LANG"),
    ).toThrow("must be initialized");
    await initializeRuntime();
    saved = names.map(getenv);
    const slot: [rtl_Locale | null] = [null];
    expect(osl_getProcessLocale(slot)).toBe(oslProcessError.None);
    originalProcess = slot[0] as rtl_Locale;
  },
);
afterAll(
  /** Restores the actual runtime state. @returns Nothing. */ () => {
    names.forEach(
      /** Restores one entry. @param name - Variable. @param index - Saved index. @returns Nothing. */ (
        name,
        index,
      ) => environment(name, saved[index] as Uint8Array | null),
    );
    osl_setProcessLocale(originalProcess);
  },
);

it("preserves actual getenv precedence, empty values and original parse rules", /** Exercises real libc environment entries without a provider. @returns Nothing. */ () => {
  variables("de_DE.UTF-8", "en_US", "ja_JP");
  expect(fields(parsed())).toEqual(["de", "DE", ".UTF-8"]);
  variables("", "sr_RS@latin", "ja_JP");
  expect(fields(parsed())).toEqual(["sr", "RS", "@latin"]);
  variables(null, "", "fil_PH.UTF-8");
  expect(fields(parsed())).toEqual(["fil", "PH", ".UTF-8"]);
  variables(null, null, "eng");
  expect(fields(parsed())).toEqual(["eng", "", ""]);
  variables(null, null, "e");
  expect(fields(parsed())).toEqual(["e", "", ""]);
  variables(null, null, "C");
  expect(fields(parsed())).toEqual(["C", "", ""]);
  variables(null, null, "POSIX");
  expect(fields(parsed())).toEqual(["C", "", ""]);
  variables(null, null, null);
  expect(fields(parsed())).toEqual(["C", "", ""]);
});
it("preserves process cache identity, null-output status and explicit setter", /** Uses actual native process mutex calls and real registered locales. @returns Nothing. */ () => {
  expect(osl_getProcessLocale(null)).toBe(oslProcessError.Unknown);
  const selected = rtl_locale_register(units("fr"), units("FR"), null);
  expect(osl_setProcessLocale(selected)).toBe(oslProcessError.None);
  variables("de_DE", null, null);
  const result: [rtl_Locale | null] = [null];
  expect(osl_getProcessLocale(result)).toBe(oslProcessError.None);
  expect(result[0]).toBe(selected);
});
it("uses actual libc codesets, source composition limits and unknown ASCII mapping", /** Real pinned libc selects UTF8 for arbitrary non-C locales; no encoding provider is invented. @returns Nothing. */ () => {
  variables("C", null, null);
  const c = rtl_locale_register(units("C"), null, null);
  expect(osl_getTextEncodingFromLocale(c)).toBe(RTL_TEXTENCODING_DONTKNOW);
  const nativeC = getLocaleCodeset(Uint8Array.of(67, 0));
  expect(String.fromCharCode(...(nativeC as Uint8Array))).toBe("ASCII");
  for (const [language, country, variant] of [
    ["en", "US", ".UTF-8"],
    ["fil", "PH", ""],
    ["zz", "", ""],
    ["en", "USA", "x".repeat(58)],
    ["en", "US", "x".repeat(57)],
  ]) {
    const locale = rtl_locale_register(
      units(language as string),
      units(country as string),
      units(variant as string),
    );
    expect(osl_getTextEncodingFromLocale(locale)).toBe(RTL_TEXTENCODING_UTF8);
  }
  variables(null, null, null);
  expect(osl_getTextEncodingFromLocale(c)).toBe(RTL_TEXTENCODING_UTF8);
});
it("retains lazy thread initialization, ASCII fallback and exchange semantics", /** Original thread slot survives subsequent process-locale changes. @returns Nothing. */ () => {
  variables("C", null, null);
  const c = rtl_locale_register(units("C"), null, null);
  osl_setProcessLocale(c);
  expect(getThreadTextEncodingForInitialization()).toBe(RTL_TEXTENCODING_ASCII_US);
  expect(osl_getThreadTextEncoding()).toBe(RTL_TEXTENCODING_ASCII_US);
  variables("en_US.UTF-8", null, null);
  expect(getThreadTextEncodingForInitialization()).toBe(RTL_TEXTENCODING_UTF8);
  expect(osl_getThreadTextEncoding()).toBe(RTL_TEXTENCODING_ASCII_US);
  expect(osl_setThreadTextEncoding(RTL_TEXTENCODING_MS_1251)).toBe(RTL_TEXTENCODING_ASCII_US);
  expect(osl_getThreadTextEncoding()).toBe(RTL_TEXTENCODING_MS_1251);
  expect(osl_setThreadTextEncoding(RTL_TEXTENCODING_UTF8)).toBe(RTL_TEXTENCODING_MS_1251);
});
it("retains the complete original Emscripten table including unsupported mappings", /** Tests table shape without replacing libc to synthesize unavailable codesets. @returns Nothing. */ () => {
  expect(nl_language_list).toHaveLength(177);
  expect(
    nl_language_list.find(
      /** Finds the explicit UTF8 pair. @param pair - Original pair. @returns Match. */ (pair) =>
        pair[0] === "UTF-8",
    )?.[1],
  ).toBe(RTL_TEXTENCODING_UTF8);
  expect(
    nl_language_list.find(
      /** Finds the fake ASCII mapping. @param pair - Original pair. @returns Match. */ (pair) =>
        pair[0] === "ANSI_X3.4-1968",
    )?.[1],
  ).not.toBe(RTL_TEXTENCODING_ASCII_US);
  expect(
    nl_language_list.some(
      /** Checks the native unavailable alias. @param pair - Original pair. @returns Match. */ (
        pair,
      ) => pair[0] === "ASCII",
    ),
  ).toBe(false);
});
