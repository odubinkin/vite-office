/** @fileoverview Actual shared native paper geometry and Writer physical-size consumption in Chromium and a DOM-free Worker. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";
const nativeExports = [
  { module: "src/i18nutil/inc/paper.ts", names: ["Paper", "PaperInfo", "NUM_PAPER_ENTRIES"] },
  { module: "src/sw/source/core/layout/pagedesc.ts", names: ["WRITER_PAPER_SIZES"] },
  { module: "src/udkapi/com/sun/star/lang/Locale.ts", names: ["Locale"] },
  { module: "src/i18nlangtag/source/isolang/isolang.tables.ts", names: ["unicode"] },
] as const;
/** Actual exported native owners in both realms. */
type Runtime = typeof import("../../src/i18nutil/inc/paper") &
  typeof import("../../src/sw/source/core/layout/pagedesc") &
  typeof import("../../src/udkapi/com/sun/star/lang/Locale") &
  typeof import("../../src/i18nlangtag/source/isolang/isolang.tables");
test("retains native paper matching and shared Writer geometry in Chromium and a DOM-free Worker", /** Executes actual source classes without a replacement model. @param fixtures - Browser page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficePaperFixture", nativeExports);
  const results = await page.evaluate(
    /** Executes identical real native operations in both environments. @returns Source observations. */ async () => {
      /** Reads actual source names and static defaults. @returns Initialized source results. */ function run() {
        const n = (globalThis as unknown as { OfficePaperFixture: Runtime }).OfficePaperFixture,
          a4 = new n.PaperInfo(n.Paper.PAPER_A4),
          rotated = new n.PaperInfo(29743, 21043),
          country = n.unicode("US"),
          empty = n.unicode(""),
          locale = new n.Locale(empty, country, empty);
        try {
          rotated.doSloppyFit(true);
          const letter = n.PaperInfo.getDefaultPaperForLocale(locale);
          return {
            count: n.NUM_PAPER_ENTRIES,
            a4: [a4.getWidth(), a4.getHeight()],
            rotated: [rotated.getPaper(), rotated.getWidth(), rotated.getHeight()],
            letter: [letter.getPaper(), letter.getWidth(), letter.getHeight()],
            alias: n.PaperInfo.fromPSName(new TextEncoder().encode("nOtE")),
            writer: n.WRITER_PAPER_SIZES,
          };
        } finally {
          locale.dispose();
          country.dispose();
          empty.dispose();
        }
      }

      const script = Array.from(document.scripts).find(
        /** Finds the actual installed source bundle. @param node - Script. @returns Kernel match. */ (
          node,
        ) => node.textContent?.includes(';globalThis["OfficePaperFixture"]='),
      )?.textContent;
      if (!script) throw Error("Missing source bundle");
      const url = URL.createObjectURL(
          new Blob(
            [
              script,
              "\nonmessage=()=>postMessage({result:(",
              run.toString(),
              ")(),dom:typeof document});",
            ],
            { type: "text/javascript" },
          ),
        ),
        worker = new Worker(url);
      try {
        const other = new Promise(
          /** Observes genuine Worker output and failures. @param resolve - Completion. @param reject - Failure. @returns Nothing. */ (
            resolve,
            reject,
          ) => {
            worker.onmessage =
              /** Publishes source observations. @param event - Worker message. @returns Nothing. */ (
                event,
              ) => {
                resolve(event.data);
              };
            worker.onerror =
              /** Propagates actual failures. @param event - Error event. @returns Nothing. */ (
                event,
              ) => {
                reject(Error(event.message));
              };
          },
        );
        worker.postMessage(null);
        return { main: run(), other: await other };
      } finally {
        worker.terminate();
        URL.revokeObjectURL(url);
      }
    },
  );
  const expected = {
    count: 86,
    a4: [21000, 29700],
    rotated: [4, 29700, 21000],
    letter: [8, 21590, 27940],
    alias: 8,
    writer: { A4: { width: 11906, height: 16838 }, Letter: { width: 12240, height: 15840 } },
  };
  expect(results).toEqual({ main: expected, other: { result: expected, dom: "undefined" } });
});
