/** @fileoverview Actual SalTimer platform callback,restart and cancellation in Chromium and a DOM-free Worker. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";

/** Real bundled platform owner. */
type Fixture = typeof import("../../src/vcl/browser/sal-timer");

test("delivers current native timer callbacks and retains reentrant restart in both browser realms", /** Exercises real host events without replacing the timer API. @param fixtures - Browser. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "SalTimerFixture", [
    { module: "src/vcl/browser/sal-timer.ts", names: ["BrowserSalTimer"] },
  ]);
  const observations = await page.evaluate(
    /** Runs identical actual source owners on the main thread and in a Worker. @returns Observed callbacks. */ async () => {
      /** Resolves after two actual host deliveries and explicit timer destruction. @returns Callback sequence. */
      function run(): Promise<string[]> {
        const native = (globalThis as unknown as { SalTimerFixture: Fixture }).SalTimerFixture;
        return new Promise(
          /** Schedules real native-platform events. @param resolve - Completed callbacks. @returns Nothing. */ (
            resolve,
          ) => {
            const events: string[] = [],
              timer = new native.BrowserSalTimer(),
              cancelled = new native.BrowserSalTimer();
            cancelled.SetCallback(
              /** A destroyed timer must never deliver this event. @returns Nothing. */ () => {
                events.push("cancelled");
              },
            );
            cancelled.Start(0n);
            cancelled.Dispose();
            timer.CallCallback();
            timer.SetCallback(
              /** Must be replaced before delivery. @returns Nothing. */ () => {
                events.push("old");
              },
            );
            timer.Start(0n);
            timer.SetCallback(
              /** Observes the current native callback,then restarts itself. @returns Nothing. */ () => {
                events.push("current");
                if (events.length === 1) timer.Start(0n);
                else {
                  timer.Dispose();
                  resolve(events);
                }
              },
            );
            timer.Start(0n);
          },
        );
      }
      const main = await run(),
        script = Array.from(document.scripts).find(
          /** Selects the real kernel fixture bundle. @param item - Script. @returns Match. */ (
            item,
          ) => item.textContent?.includes(';globalThis["SalTimerFixture"]='),
        )?.textContent;
      if (!script) throw Error("Missing real SalTimer bundle");
      const url = URL.createObjectURL(
          new Blob(
            [
              script,
              "\n(",
              run.toString(),
              ")().then(value=>postMessage({value,dom:typeof document}));",
            ],
            { type: "text/javascript" },
          ),
        ),
        worker = new Worker(url);
      try {
        const other = await new Promise(
          /** Receives the actual Worker result. @param resolve - Success. @param reject - Failure. @returns Nothing. */ (
            resolve,
            reject,
          ) => {
            worker.onmessage =
              /** Receives callbacks. @param event - Actual message. @returns Nothing. */ (event) =>
                resolve(event.data);
            worker.onerror =
              /** Preserves actual worker failures. @param event - Runtime error. @returns Nothing. */ (
                event,
              ) => reject(Error(event.message));
          },
        );
        return { main, other };
      } finally {
        worker.terminate();
        URL.revokeObjectURL(url);
      }
    },
  );
  expect(observations).toEqual({
    main: ["current", "current"],
    other: { value: ["current", "current"], dom: "undefined" },
  });
});
