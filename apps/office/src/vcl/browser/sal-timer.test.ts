/** @fileoverview Actual SalTimer callback ownership and browser host-timer replacement,cancellation,width and reentrant restart contracts. */
import { afterEach, expect, it, vi } from "vitest";
import { BrowserSalTimer } from "./sal-timer";

afterEach(
  /** Restores the real browser timer API after deterministic host-clock assertions. @returns Nothing. */ () => {
    vi.useRealTimers();
  },
);

it("observes null,assigned,replaced and cleared native callbacks at delivery time", /** Tests actual callback ownership without a substitute platform timer. @returns Nothing. */ () => {
  vi.useFakeTimers();
  const timer = new BrowserSalTimer(),
    events: string[] = [];
  timer.CallCallback();
  timer.Start(5n);
  timer.SetCallback(
    /** Original first callback. @returns Nothing. */ () => {
      events.push("first");
    },
  );
  timer.SetCallback(
    /** The current callback owns delivery even after a timer was started. @returns Nothing. */ () => {
      events.push("second");
    },
  );
  vi.advanceTimersByTime(5);
  expect(events).toEqual(["second"]);
  timer.SetCallback(null);
  timer.Start(0n);
  vi.runOnlyPendingTimers();
  expect(events).toEqual(["second"]);
  timer.Dispose();
});

it("restarts pending timeouts,cancels them,and remains single-shot after delivery", /** Native scheduler rearming is separate from the platform event. @returns Nothing. */ () => {
  vi.useFakeTimers();
  const timer = new BrowserSalTimer(),
    events: number[] = [];
  timer.SetCallback(
    /** Records actual delivery. @returns Nothing. */ () => {
      events.push(Date.now());
    },
  );
  const initial = Date.now();
  timer.Stop();
  timer.Start(10n);
  vi.advanceTimersByTime(5);
  timer.Start(20n);
  vi.advanceTimersByTime(19);
  expect(events).toEqual([]);
  vi.advanceTimersByTime(1);
  expect(events).toEqual([initial + 25]);
  vi.advanceTimersByTime(50);
  expect(events).toHaveLength(1);
  timer.Start(1n);
  timer.Stop();
  vi.advanceTimersByTime(2);
  expect(events).toHaveLength(1);
  expect(vi.getTimerCount()).toBe(0);
  timer.Dispose();
});

it("retains reentrant restart and cancels a pending event at explicit destruction", /** Callback delivery must not clear the new handle created by the callback. @returns Nothing. */ () => {
  vi.useFakeTimers();
  const timer = new BrowserSalTimer();
  let count = 0;
  timer.SetCallback(
    /** Restarts through the actual platform API. @returns Nothing. */ () => {
      ++count;
      timer.Start(3n);
    },
  );
  timer.Start(0n);
  expect(count).toBe(0);
  vi.advanceTimersByTime(0);
  expect(count).toBe(1);
  vi.advanceTimersByTime(3);
  expect(count).toBe(2);
  timer.Dispose();
  vi.advanceTimersByTime(10);
  expect(count).toBe(2);
  expect(vi.getTimerCount()).toBe(0);
});

it("caps unrepresentable host delays and converts native unsigned64 arguments before scheduling", /** The scheduler will recheck an early host wakeup against its original full-width deadline. @returns Nothing. */ () => {
  vi.useFakeTimers();
  const timer = new BrowserSalTimer();
  let count = 0;
  timer.SetCallback(
    /** Records one actual wakeup. @returns Nothing. */ () => {
      ++count;
    },
  );
  timer.Start(0xffffffffffffffffn);
  vi.advanceTimersByTime(0x7ffffffe);
  expect(count).toBe(0);
  vi.advanceTimersByTime(1);
  expect(count).toBe(1);
  timer.Start(1n << 64n);
  vi.advanceTimersByTime(0);
  expect(count).toBe(2);
  timer.Dispose();
});
