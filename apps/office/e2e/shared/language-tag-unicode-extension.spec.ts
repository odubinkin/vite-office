/** @fileoverview Actual Unicode extension callbacks and functional CLDR in Chromium and a DOM-free Worker. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";

test("preserves native Unicode extension values in both actual runtimes", /** Builds genuine source owners without a substitute general parser. @param fixtures - Browser page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficeUnicodeExtensionFixture", [
    {
      module: "src/external/liblangtag/extensions/lt-ext-ldml-u.ts",
      names: ["UnicodeExtensionData", "precheckUnicodeExtension"],
    },
    { module: "src/external/liblangtag/liblangtag/lt-registry.ts", names: ["lookupRegistry"] },
    {
      module: "src/external/liblangtag/liblangtag/lt-utils.ts",
      names: ["lt_strlower", "lt_strcasecmp"],
    },
    {
      module: "src/external/liblangtag/liblangtag/lt-xml.cldr.ts",
      names: ["getCldrKeywords", "cldrLanguageAliases"],
    },
  ]);
  const result = await page.evaluate(
    /** Executes the same real modules in both contexts. @returns Runtime observations. */ async () => {
      const read =
        /** Calls actual callback data and native-value helpers. @returns Observations. */ () => {
          const n = Reflect.get(globalThis, "OfficeUnicodeExtensionFixture"),
            parse =
              /** Feeds explicit native extension token sequences, without claiming full grammar. @param tokens - Source tokens. @returns Values and first diagnostic. */ (
                tokens: string[],
              ) => {
                const data = new n.UnicodeExtensionData();
                let diagnostic = null;
                for (const token of tokens) {
                  diagnostic = data.parseTag(token);
                  if (diagnostic) break;
                }
                return {
                  tag: data.getTag(),
                  singleton: data.getSingleton(),
                  validState: data.validateTag(),
                  diagnostic,
                };
              };
          let ascii = true;
          for (let i = 1; i < 128; i++) {
            const expected = i >= 65 && i <= 90 ? i + 32 : i;
            ascii &&= n.lt_strlower(String.fromCharCode(i)).charCodeAt(0) === expected;
          }
          return {
            success: parse(["Zebra", "APPLE", "ca", "islamicc", "nu", "latn"]),
            codepoints: parse(["vt", "D800", "10ffff"]),
            caseFailure: parse(["CA", "gregory"]),
            transformKey: parse(["m0", "ungegn"]),
            duplicate: parse(["ca", "gregory", "ca", "buddhist"]),
            invalidParent: n.precheckUnicodeExtension(null, n.lookupRegistry("extlang", "cmn")),
            aliases: n.cldrLanguageAliases.length,
            transformOrder: n
              .getCldrKeywords(6)
              .map(
                /** Reads actual merged source key names. @param key - Native key. @returns Name. */ (key: {
                  attributes: { name: string };
                }) => key.attributes.name,
              ),
            ascii,
            prefixCompare: n.lt_strcasecmp("ab", "abC"),
            nul: n.lt_strlower("EN\0ignored"),
          };
        };
      const script = Array.from(document.scripts).find(
        /** Selects the actual source bundle. @param s - Script. @returns Match. */ (s) =>
          s.textContent?.includes(';globalThis["OfficeUnicodeExtensionFixture"]='),
      )?.textContent;
      if (!script) throw Error("Missing actual source bundle");
      const url = URL.createObjectURL(
          new Blob(
            [script, "\npostMessage({value:(", read.toString(), ")(),dom:typeof document});"],
            { type: "text/javascript" },
          ),
        ),
        worker = new Worker(url);
      try {
        const other = await new Promise<{ value: unknown; dom: string }>(
          /** Awaits actual Worker output. @param resolve - Success. @param reject - Failure. @returns Nothing. */ (
            resolve,
            reject,
          ) => {
            worker.onmessage =
              /** Receives runtime values. @param e - Message. @returns Nothing. */ (e) =>
                resolve(e.data);
            worker.onerror = /** Reports runtime failure. @param e - Error. @returns Nothing. */ (
              e,
            ) => reject(Error(e.message));
          },
        );
        return { main: read(), other };
      } finally {
        worker.terminate();
        URL.revokeObjectURL(url);
      }
    },
  );
  const good = { singleton: "u", validState: true, diagnostic: null },
    expected = {
      success: { ...good, tag: "APPLE-Zebra-ca-islamicc-nu-latn" },
      codepoints: { ...good, tag: "vt-d800-10ffff" },
      caseFailure: {
        ...good,
        tag: "ca",
        diagnostic: { code: 4, message: "Unknown -u- extension type: gregory" },
      },
      transformKey: { ...good, tag: "m0-ungegn" },
      duplicate: { ...good, tag: "ca-buddhist-ca-gregory" },
      invalidParent: { code: 4, message: "Extlang tags aren't allowed to have LDML." },
      aliases: 484,
      transformOrder: ["m0", "i0", "k0", "t0", "x0"],
      ascii: true,
      prefixCompare: -67,
      nul: "en",
    };
  expect(result).toEqual({ main: expected, other: { value: expected, dom: "undefined" } });
});
