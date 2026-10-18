/** @fileoverview Actual shared ODS manifest reader through real PropertyValue/Any in Chromium and a dedicated Worker with no DOM. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";
test("reads the same typed ODS manifest in Chromium and a DOM-free Worker", /** Runs actual source owners in both hosts. @param fixtures - Browser fixtures. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficeManifestFixture", [
    { module: "src/package/source/manifest/ManifestReader.ts", names: ["readManifestSequence"] },
    { module: "src/sal/inc/rtl/ustring.ts", names: ["OUString"] },
  ]);
  const result = await page.evaluate(
    /** Reuses the installed repository source bundle inside a true Worker. @returns Compared XML. */ async () => {
      const script = Array.from(document.scripts).find(
        /** Identifies the fixture bundle installed above. @param element - Script. @returns Match. */ (
          element,
        ) => element.textContent?.includes(';globalThis["OfficeManifestFixture"]='),
      )?.textContent;
      if (!script) throw Error("Missing installed manifest bundle");
      const work =
        /** Reads actual typed properties in either host. @returns Parsed records. */ () => {
          const n = Reflect.get(globalThis, "OfficeManifestFixture"),
            xml =
              '<m:manifest xmlns:m="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" m:version="1.3"><m:file-entry m:full-path="/" m:media-type="application/vnd.oasis.opendocument.spreadsheet"/><m:file-entry m:full-path="content.xml" m:media-type="text/xml" m:size="9223372036854775807"/></m:manifest>';
          /** Reads original UTF16 data. @param value - Text. @returns String. */ function text(value: {
            getStr(): Uint16Array;
            getLength(): number;
          }) {
            return String.fromCharCode(...value.getStr().subarray(0, value.getLength()));
          }
          return n.readManifestSequence(xml).map(
            /** Extracts actual Any values. @param row - Properties. @returns Named values. */ (
              row: {
                Name: { getStr(): Uint16Array; getLength(): number };
                Value: { extract(target: unknown, type: string): boolean };
              }[],
            ) =>
              Object.fromEntries(
                row.map(
                  /** Reads each native property. @param property - Value. @returns Pair. */ (
                    property,
                  ) => {
                    const name = text(property.Name);
                    if (name === "Size") {
                      const value: [bigint] = [0n];
                      if (!property.Value.extract(value, "sal_Int64"))
                        throw Error("Invalid int64 Any");
                      return [name, value[0].toString()];
                    }
                    const value = new n.OUString();
                    try {
                      if (!property.Value.extract(value, "OUString"))
                        throw Error("Invalid string Any");
                      return [name, text(value)];
                    } finally {
                      value.dispose();
                    }
                  },
                ),
              ),
          );
        };
      const url = URL.createObjectURL(
          new Blob(
            [
              script,
              "\nself.onmessage=()=>postMessage({xml:(",
              work.toString(),
              ")(),dom:typeof document});",
            ],
            { type: "text/javascript" },
          ),
        ),
        worker = new Worker(url);
      try {
        const other = await new Promise<{ xml: unknown; dom: string }>(
          /** Receives actual Worker output. @param resolve - Completion. @param reject - Failure. @returns Nothing. */ (
            resolve,
            reject,
          ) => {
            worker.onmessage = /** Accepts output. @param event - Data. @returns Nothing. */ (
              event,
            ) => resolve(event.data);
            worker.onerror = /** Reports failure. @param event - Error. @returns Nothing. */ (
              event,
            ) => reject(Error(event.message));
            worker.postMessage(null);
          },
        );
        return {
          equal: JSON.stringify(other.xml) === JSON.stringify(work()),
          dom: other.dom,
          records: work(),
        };
      } finally {
        worker.terminate();
        URL.revokeObjectURL(url);
      }
    },
  );
  expect(result).toEqual({
    equal: true,
    dom: "undefined",
    records: [
      {
        FullPath: "/",
        Version: "1.3",
        MediaType: "application/vnd.oasis.opendocument.spreadsheet",
      },
      { FullPath: "content.xml", MediaType: "text/xml", Size: "9223372036854775807" },
    ],
  });
});
