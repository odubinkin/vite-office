/** @fileoverview Actual SAX/RTL numeric reader runs in Chromium and a DOM-free dedicated Worker. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";
test("reads numeric attributes in Chromium and an isolated Worker", /** Exercises actual shared owners in two browser realms. @param fixtures - Playwright fixtures. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficeDecimalFixture", [
    { module: "src/sax/source/tools/converter.ts", names: ["Converter"] },
  ]);
  const result = await page.evaluate(
    /** Starts and compares actual worker parsing. @returns Realm observations. */ async () => {
      const read =
        /** Parses the same real attribute corpus. @returns Native scalar observations. */ () => {
          const n = Reflect.get(globalThis, "OfficeDecimalFixture");
          const rows = [
            "1,234.5e-2suffix",
            "garbage",
            "-0",
            "1.79769313486232E308",
            "1e-400",
            "NaN!",
            "-INF!",
          ];
          return rows.map(
            /** Reads one attribute in both character families. @param text - Attribute. @returns Outputs. */ (
              text,
            ) => {
              const value: [number] = [42],
                rest: [string | Uint8Array] = ["stale"];
              const ok = n.Converter.convertDouble(value, text, rest);
              const bytes: [number] = [42],
                byteRest: [string | Uint8Array] = ["stale"];
              const byteOk = n.Converter.convertDouble(
                bytes,
                new TextEncoder().encode(text),
                byteRest,
              );
              return {
                ok,
                value: value[0],
                rest: rest[0],
                negativeZero: Object.is(value[0], -0),
                byteOk,
                byteValue: bytes[0],
                byteRest: new TextDecoder().decode(byteRest[0] as Uint8Array),
              };
            },
          );
        };
      const script = Array.from(document.scripts).find(
        /** Selects the actual bundled owners. @param s - Script element. @returns Match. */ (s) =>
          s.textContent?.includes(';globalThis["OfficeDecimalFixture"]='),
      )?.textContent;
      if (!script) throw Error("Missing real source bundle");
      const url = URL.createObjectURL(
        new Blob(
          [
            script,
            "\nself.onmessage=()=>postMessage({value:(",
            read.toString(),
            ")(),dom:typeof document});",
          ],
          { type: "text/javascript" },
        ),
      );
      const worker = new Worker(url);
      try {
        const other = await new Promise<{ value: unknown; dom: string }>(
          /** Waits for the dedicated worker. @param resolve - Success. @param reject - Failure. @returns Nothing. */ (
            resolve,
            reject,
          ) => {
            worker.onmessage =
              /** Receives worker observations. @param e - Message. @returns Nothing. */ (e) =>
                resolve(e.data);
            worker.onerror = /** Reports a worker failure. @param e - Error. @returns Nothing. */ (
              e,
            ) => reject(Error(e.message));
            worker.postMessage(null);
          },
        );
        return { main: read(), other };
      } finally {
        worker.terminate();
        URL.revokeObjectURL(url);
      }
    },
  );
  expect(result.other.dom).toBe("undefined");
  expect(result.other.value).toEqual(result.main);
  const rows: [number, boolean, string, boolean][] = [
    [12.345, true, "suffix", false],
    [0, true, "garbage", false],
    [-0, true, "", true],
    [Number.MAX_VALUE, true, "", false],
    [0, false, "", false],
    [NaN, true, "!", false],
    [-Infinity, false, "!", false],
  ];
  expect(result.main).toEqual(
    rows.map(
      /** Builds independent expected observations. @param row - Expected value/status/suffix/sign. @returns Expected record. */ ([
        value,
        ok,
        rest,
        negativeZero,
      ]) => ({
        value,
        ok,
        rest,
        negativeZero,
        byteOk: ok,
        byteValue: value,
        byteRest: rest,
      }),
    ),
  );
});
