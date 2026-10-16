/** @fileoverview Real normal tag parser/canonicalizer in Chromium and a DOM-free Worker. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";

test("executes actual normal registered grammar and canonicalization in both runtimes", /** No Intl replacement or test-only production parser is used. @param fixtures - Browser page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficeNormalTagFixture", [
    {
      module: "src/external/liblangtag/liblangtag/lt-tag.ts",
      names: ["lt_tag_new", "lt_tag_get_string", "lt_tag_copy", "lt_tag_truncate"],
    },
    {
      module: "src/external/liblangtag/liblangtag/lt-tag.parse.ts",
      names: ["lt_tag_parse", "lt_tag_parse_with_extra_token"],
    },
    {
      module: "src/external/liblangtag/liblangtag/lt-tag.canonicalize.ts",
      names: ["lt_tag_canonicalize", "lt_tag_canonicalize_in_extlang_form"],
    },
  ]);
  const result = await page.evaluate(
    /** Calls genuine source exports and runs the same function in a real Worker. @returns Observations. */ async () => {
      const read =
        /** Uses actual native tag owners,including original mutation/cache behavior. @returns Values. */ () => {
          const n = Reflect.get(globalThis, "OfficeNormalTagFixture"),
            rows = [];
          for (const input of [
            "en-US",
            "zz",
            "den-1901",
            "i-default",
            "de-Latn-DE",
            "cmn-Hans-CN",
            "en-x-FOO",
            "en\0-invalid",
            "en-u-ca-foobar",
            "en-t-de-m0-ungegn",
            "en-t-de-m0-ungegn-x0-private",
            "zh-cmn-x-FOO",
            "x-*",
          ]) {
            const tag = n.lt_tag_new(),
              valid = n.lt_tag_parse(tag, input);
            rows.push([input, valid, valid ? n.lt_tag_canonicalize(tag) : null]);
          }
          const incremental = n.lt_tag_new();
          n.lt_tag_parse(incremental, "de");
          n.lt_tag_parse_with_extra_token(incremental, "DE");
          const variant = n.lt_tag_new();
          n.lt_tag_parse(variant, "sl-rozaj-biske");
          const cached = n.lt_tag_get_string(variant),
            normalized = n.lt_tag_canonicalize(variant);
          const copied = n.lt_tag_copy(incremental);
          n.lt_tag_truncate(copied);
          const extlang = n.lt_tag_new();
          n.lt_tag_parse(extlang, "cmn");
          return {
            rows,
            incremental: n.lt_tag_get_string(incremental),
            copy: n.lt_tag_get_string(copied),
            cached,
            normalized,
            extlang: n.lt_tag_canonicalize_in_extlang_form(extlang),
          };
        };
      const script = Array.from(document.scripts).find(
        /** Finds the actual source bundle. @param s - Script. @returns Match. */ (s) =>
          s.textContent?.includes(';globalThis["OfficeNormalTagFixture"]='),
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
              /** Receives the Worker value. @param e - Message. @returns Nothing. */ (e) =>
                resolve(e.data);
            worker.onerror = /** Reports a runtime failure. @param e - Error. @returns Nothing. */ (
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
    rows: [
      ["en-US", true, "en-US"],
      ["zz", false, null],
      ["den-1901", true, "den-1901"],
      ["i-default", true, "en-x-i-default"],
      ["de-Latn-DE", true, "de-DE"],
      ["cmn-Hans-CN", true, "cmn-Hans-CN"],
      ["en-x-FOO", true, "en-x-FOO"],
      ["en\0-invalid", true, "en"],
      ["en-u-ca-foobar", false, null],
      ["en-t-de-m0-ungegn", true, "en-t-de-m0-ungegn"],
      ["en-t-de-m0-ungegn-x0-private", false, null],
      ["zh-cmn-x-FOO", true, "cmn"],
      ["x-*", true, "x-*"],
    ],
    incremental: "de-DE",
    copy: "de",
    cached: "sl-rozaj-sl-rozaj-biske",
    normalized: "sl-rozaj-biske",
    extlang: "zh-cmn",
  };
  expect(result).toEqual({ main: expected, other: { value: expected, dom: "undefined" } });
});
