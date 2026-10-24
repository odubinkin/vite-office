/** @fileoverview Actual SalTimer platform callback,restart and cancellation in Chromium and a DOM-free Worker. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";

/** Real bundled platform owner. */
type Fixture = typeof import("../../src/vcl/browser/sal-timer") &
  typeof import("../../src/vcl/inc/task") &
  typeof import("../../src/vcl/inc/timer") &
  typeof import("../../src/vcl/inc/idle") &
  typeof import("../../src/vcl/inc/scheduler");

test("delivers current native timer callbacks and retains reentrant restart in both browser realms", /** Exercises real host events without replacing the timer API. @param fixtures - Browser. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "SalTimerFixture", [
    {
      module: "src/vcl/browser/sal-timer.ts",
      names: ["BrowserSalTimer", "browserSchedulerPlatform"],
    },
    { module: "src/vcl/inc/task.ts", names: ["TaskPriority"] },
    { module: "src/vcl/inc/timer.ts", names: ["Timer", "AutoTimer"] },
    { module: "src/vcl/inc/idle.ts", names: ["Idle"] },
    { module: "src/vcl/inc/scheduler.ts", names: ["Scheduler", "bindSchedulerPlatform"] },
  ]);
  const observations = await page.evaluate(
    /** Runs identical actual source owners on the main thread and in a Worker. @returns Observed callbacks. */ async () => {
      /** Resolves after two actual host deliveries and explicit timer destruction. @returns Callback sequence. */
      async function run() {
        const native = (globalThis as unknown as { SalTimerFixture: Fixture }).SalTimerFixture;
        native.bindSchedulerPlatform(native.browserSchedulerPlatform);
        const platform = await new Promise<string[]>(
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
        const events: string[] = [],
          high = new native.Idle("browser high"),
          paint = new native.Idle("browser paint"),
          timer = new native.AutoTimer("browser repeat");
        let copyActive = true;
        const queue = await new Promise<string[]>(
          /** Drives the actual native queue with real host timer delivery. @param resolve - Native event sequence. @returns Nothing. */ (
            resolve,
          ) => {
            high.SetPriority(native.TaskPriority.HIGHEST);
            high.SetInvokeHandler(
              /** Highest-priority native work. @returns Nothing. */ () => {
                events.push("high");
              },
            );
            paint.SetPriority(native.TaskPriority.REPAINT);
            paint.SetInvokeHandler(
              /** Starts the repeating timer through the real native idle callback. @returns Nothing. */ () => {
                events.push("paint");
                timer.Start();
                const copy = new native.Timer(timer);
                copyActive = copy.IsActive();
                copy.Dispose();
              },
            );
            timer.SetTimeout(2n);
            timer.SetInvokeHandler(
              /** Native AutoTimer repeats until explicitly stopped. @returns Nothing. */ () => {
                events.push("timer");
                if (events.length === 4) {
                  timer.Stop();
                  resolve(events);
                }
              },
            );
            paint.Start();
            high.Start();
          },
        );
        high.Dispose();
        paint.Dispose();
        timer.Dispose();
        native.Scheduler.ImplDeInitScheduler();
        return { platform, queue, copyActive };
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
    main: {
      platform: ["current", "current"],
      queue: ["high", "paint", "timer", "timer"],
      copyActive: false,
    },
    other: {
      value: {
        platform: ["current", "current"],
        queue: ["high", "paint", "timer", "timer"],
        copyActive: false,
      },
      dom: "undefined",
    },
  });
});
