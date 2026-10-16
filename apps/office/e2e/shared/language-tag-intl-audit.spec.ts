/** @fileoverview Compares actual Chromium/Worker Intl with pinned LanguageTag QA independently of any production adapter. */
import { writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import fixture from "../../src/test/fixtures/language-tag-intl-audit.json" with { type: "json" };
import { observeIntlLanguageTags } from "../../src/test/fixtures/language-tag-intl-audit";

test("audits native JS language tags in Chromium and DOM-free Worker", /** Measures native APIs in both realms. @param fixtures - Actual browser. @param testInfo - Retained evidence. @returns Completion. */ async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const inputs = fixture.cases.map(
      /** Selects a fixture input or matching observation. @param row - Case or observed value. @returns Input or match. */ (
        row,
      ) => row.input,
    ),
    node = observeIntlLanguageTags(inputs),
    main = await page.evaluate(observeIntlLanguageTags, inputs),
    result = await page.evaluate(
      /** Loads only the test observation function, never a production substitute. @param input - Inputs and self-contained observer. @returns Native results. */ async (
        input,
      ) => {
        const url = URL.createObjectURL(
            new Blob(
              [
                "self.onmessage=e=>postMessage({observations:(",
                input.observer,
                ")(e.data),dom:typeof document});",
              ],
              { type: "text/javascript" },
            ),
          ),
          worker = new Worker(url);
        try {
          const other = await new Promise<{
            observations: unknown;
            dom: string;
          }>(
            /** Receives native Worker observations. @param resolve - Success. @param reject - Failure. @returns Nothing. */ (
              resolve,
              reject,
            ) => {
              worker.onmessage = /** Receives result. @param e - Message. @returns Nothing. */ (
                e,
              ) => resolve(e.data);
              worker.onerror =
                /** Reports unexpected failure. @param e - Event. @returns Nothing. */ (e) =>
                  reject(Error(e.message));
              worker.postMessage(input.inputs);
            },
          );
          return { other, userAgent: navigator.userAgent };
        } finally {
          worker.terminate();
          URL.revokeObjectURL(url);
        }
      },
      { inputs, observer: observeIntlLanguageTags.toString() },
    );
  expect(main).toEqual(node);
  expect(result.other).toEqual({ observations: node, dom: "undefined" });
  const mismatches = fixture.cases.filter(
    /** Compares successful result with the independent source expectation. @param row - Native case. @param index - Corresponding observation. @returns Difference. */ (
      row,
      index,
    ) => JSON.stringify(node[index]?.locale) !== JSON.stringify({ value: row.upstream }),
  );
  expect(mismatches.length).toBeGreaterThan(0);
  await writeFile(
    testInfo.outputPath("intl-observations.json"),
    JSON.stringify(
      {
        referenceCommit: fixture.referenceCommit,
        nodeVersion: process.version,
        result,
        main,
        node,
        mismatches: mismatches.map(
          /** Selects a fixture input or matching observation. @param row - Case or observed value. @returns Input or match. */ (
            row,
          ) => row.input,
        ),
      },
      null,
      2,
    ),
  );
});
