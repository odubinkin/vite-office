/** @fileoverview Pins original Internet query-control decisions and namespace-session preference without importing browser URL parsing. */
import { afterEach, expect, it } from "vitest";
import { HyperlinkInternetTP } from "./hyperlinkinternettabpage";
afterEach(
  /** Restores preference through the real source handler. @returns Nothing. */ () =>
    new HyperlinkInternetTP("").ClickRemoveQueryStringHdl_Impl(false),
);
it("retains literal query/hash slicing including non-URL and fragment-question inputs", /** Native strings are not URL.search. @returns Nothing. */ () => {
  for (const [raw, expected] of [
    ["https://example.test/a", "https://example.test/a"],
    ["https://example.test/a?x=1", "https://example.test/a"],
    ["https://example.test/a?x=1#part?kept", "https://example.test/a#part?kept"],
    ["https://example.test/a#part?x=1", "https://example.test/a#part"],
    ["?query#fragment", "#fragment"],
    ["?query", ""],
    [" a?x#b ", " a#b "],
  ] as const) {
    const page = new HyperlinkInternetTP(raw);
    page.RemoveQueryString();
    expect(page.GetTarget()).toBe(expected);
  }
});
it("keeps checkbox preference across requests and cancellation while unchecked values stay raw", /** Source preference outlives dialogs and removal is destructive. @returns Nothing. */ () => {
  const first = new HyperlinkInternetTP("one?x#part");
  expect(first.IsRemoveQueryString()).toBe(false);
  first.ModifiedTargetHdl_Impl("two?x#part");
  expect(first.GetTarget()).toBe("two?x#part");
  first.ClickRemoveQueryStringHdl_Impl(true);
  expect(first.GetTarget()).toBe("two#part");
  const second = new HyperlinkInternetTP("three?x#tail");
  expect(second.IsRemoveQueryString()).toBe(true);
  expect(second.GetTarget()).toBe("three#tail");
  second.ModifiedTargetHdl_Impl("noquery");
  expect(second.GetTarget()).toBe("noquery");
  second.ModifiedTargetHdl_Impl("four?x#tail");
  expect(second.GetTarget()).toBe("four#tail");
  second.ClickRemoveQueryStringHdl_Impl(false);
  expect(second.GetTarget()).toBe("four#tail");
  second.ModifiedTargetHdl_Impl("five?x");
  expect(second.GetTarget()).toBe("five?x");
  expect(new HyperlinkInternetTP("six?x").GetTarget()).toBe("six?x");
});
