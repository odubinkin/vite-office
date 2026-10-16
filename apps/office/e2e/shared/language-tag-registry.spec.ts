/** @fileoverview Actual liblangtag scanner/registry values in Chromium and a DOM-free Worker. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";

test("scans source token boundaries and uses pinned registered data in both runtimes", /** Executes the actual shared source bundle, without native source or browser Intl normalization. @param fixtures - Browser page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficeLanguageRegistryFixture", [
    { module: "src/external/liblangtag/liblangtag/lt-tag.scanner.ts", names: ["TagScanner"] },
    { module: "src/external/liblangtag/liblangtag/lt-registry.ts", names: ["lookupRegistry"] },
  ]);
  const result = await page.evaluate(
    /** Runs identical source operations in the main context and real Worker. @returns Observations. */ async () => {
      const read =
        /** Calls the genuine runtime owners with independent source-derived inputs. @returns Observations. */ () => {
          const n = Reflect.get(globalThis, "OfficeLanguageRegistryFixture"),
            scanner = new n.TagScanner(new TextEncoder().encode("en-US\0-invalid")),
            output = { token: null as string | null, length: 0 },
            tokens = [];
          while (!scanner.isEof()) {
            if (!scanner.getToken(output)) throw Error("Unexpected scanner failure");
            tokens.push([output.token, output.length]);
          }
          const invalid = new n.TagScanner(new TextEncoder().encode("en*")),
            error = { error: null };
          return {
            tokens,
            invalid: [invalid.getToken(output, error), output.token, output.length, error.error],
            registered: n.lookupRegistry("language", "QAA\0ignored")?.tag,
            unknown: n.lookupRegistry("language", "zz"),
            variant: n.lookupRegistry("variant", "1901")?.prefixes,
            preferred: n.lookupRegistry("grandfathered", "I-KLINGON")?.preferredTag,
            privateScript: n.lookupRegistry("script", "qabx")?.tag,
            suppress: n.lookupRegistry("language", "de")?.suppressScript,
          };
        };
      const script = Array.from(document.scripts).find(
        /** Finds the test-only bundle containing real core exports. @param s - Script. @returns Match. */ (
          s,
        ) => s.textContent?.includes(';globalThis["OfficeLanguageRegistryFixture"]='),
      )?.textContent;
      if (!script) throw Error("Missing actual source bundle");
      const url = URL.createObjectURL(
          new Blob(
            [script, "\npostMessage({value:(", read.toString(), ")(),dom:typeof document});"],
            {
              type: "text/javascript",
            },
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
              /** Receives the worker value. @param e - Message. @returns Nothing. */ (e) =>
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
  const expected = {
    tokens: [
      ["en", 2],
      ["-", 1],
      ["US", 2],
    ],
    invalid: [false, null, 0, { code: 4, message: "Invalid wildcard: position = 2" }],
    registered: "qaa",
    unknown: null,
    variant: ["de"],
    preferred: "tlh",
    privateScript: "Qabx",
    suppress: "Latn",
  };
  expect(result).toEqual({ main: expected, other: { value: expected, dom: "undefined" } });
});
