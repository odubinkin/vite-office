/** @fileoverview Actual shared ODS manifest exporter through real PropertyValue/Any in Chromium and a dedicated Worker with no DOM. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";
test("exports the same native ODS manifest in Chromium and a DOM-free Worker", /** Runs actual source owners in both hosts. @param fixtures - Browser fixtures. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficeManifestFixture", [
    { module: "src/package/source/manifest/ManifestWriter.ts", names: ["createManifestXml"] },
    { module: "src/udkapi/com/sun/star/beans/PropertyValue.ts", names: ["PropertyValue"] },
    { module: "src/sal/inc/rtl/ustring.ts", names: ["OUString"] },
    {
      module: "src/comphelper/inc/documentconstants.ts",
      names: ["MIMETYPE_OASIS_OPENDOCUMENT_SPREADSHEET"],
    },
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
        /** Builds actual native properties using exported runtime classes. @returns XML. */ () => {
          const n = Reflect.get(globalThis, "OfficeManifestFixture");
          /** Native string property producer. @param name - Name. @param value - Data. @returns Property. */ function p(
            name: string,
            value: string,
          ) {
            const result = new n.PropertyValue(),
              key = new n.OUString(
                new Uint16Array(
                  name
                    .split("")
                    .map(
                      /** UTF16 unit. @param c - Character. @returns Code. */ (c) =>
                        c.charCodeAt(0),
                    ),
                ),
                name.length,
              ),
              data = new n.OUString(
                new Uint16Array(
                  value
                    .split("")
                    .map(
                      /** UTF16 unit. @param c - Character. @returns Code. */ (c) =>
                        c.charCodeAt(0),
                    ),
                ),
                value.length,
              );
            result.Name = key;
            result.Value.insert([data.pData], "OUString");
            key.dispose();
            data.dispose();
            return result;
          }
          return n.createManifestXml([
            [
              p("FullPath", "/"),
              p("MediaType", n.MIMETYPE_OASIS_OPENDOCUMENT_SPREADSHEET),
              p("Version", "1.3"),
            ],
            [p("FullPath", "content.xml"), p("MediaType", "text/xml")],
            [p("FullPath", "Pictures/a&b.bin"), p("MediaType", "application/octet-stream")],
          ]);
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
        const other = await new Promise<{ xml: string; dom: string }>(
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
        const xml = work(),
          parsed = new DOMParser().parseFromString(xml, "application/xml");
        return {
          equal: other.xml === xml,
          dom: other.dom,
          error: parsed.querySelector("parsererror")?.textContent ?? null,
          rootType: parsed
            .getElementsByTagNameNS(
              "urn:oasis:names:tc:opendocument:xmlns:manifest:1.0",
              "file-entry",
            )[0]
            ?.getAttributeNS("urn:oasis:names:tc:opendocument:xmlns:manifest:1.0", "media-type"),
          paths: Array.from(
            parsed.getElementsByTagNameNS(
              "urn:oasis:names:tc:opendocument:xmlns:manifest:1.0",
              "file-entry",
            ),
          ).map(
            /** Reads parsed path. @param entry - Entry. @returns Path. */ (entry) =>
              entry.getAttributeNS(
                "urn:oasis:names:tc:opendocument:xmlns:manifest:1.0",
                "full-path",
              ),
          ),
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
    error: null,
    rootType: "application/vnd.oasis.opendocument.spreadsheet",
    paths: ["/", "content.xml", "Pictures/a&b.bin"],
  });
});
