/** @fileoverview Exercises the actual shared Sfx notification graph in Chromium without app test globals or a substitute Calc model. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";

test("preserves native duplicate delivery and dying subscription order in Chromium", /** Runs real notification owners. @param fixtures - Browser fixtures. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficeSfxFixture", [
    { module: "src/svl/inc/hint.ts", names: ["SfxHint", "SfxHintId"] },
    { module: "src/svl/source/notify/SfxBroadcaster.ts", names: ["SfxBroadcaster"] },
    { module: "src/svl/source/notify/lstner.ts", names: ["SfxListener", "DuplicateHandling"] },
  ]);
  const result = await page.evaluate(
    /** Observes real graph mutations and native hint identity. @returns Observations. */ () => {
      const native = Reflect.get(window, "OfficeSfxFixture"),
        source = new native.SfxBroadcaster(),
        hints: number[] = [],
        membership: boolean[] = [];
      /** Native virtual listener override at the test caller boundary. */
      class Listener extends native.SfxListener {
        /** Records native delivery before destructor detachment. @param current - Source. @param hint - Native hint. @returns Nothing. */
        public Notify(current: unknown, hint: { GetId(): number }): void {
          hints.push(hint.GetId());
          membership.push(this.IsListening(current));
        }
      }
      const listener = new Listener();
      listener.StartListening(source);
      listener.StartListening(source, native.DuplicateHandling.Prevent);
      listener.StartListening(source, native.DuplicateHandling.Allow);
      const before = [source.GetListenerCount(), listener.GetBroadcasterCount()];
      source.Broadcast(new native.SfxHint(native.SfxHintId.DataChanged));
      listener.EndListening(source);
      const afterRemove = source.GetListenerCount();
      source.Dispose();
      return { before, afterRemove, hints, membership, remaining: listener.GetBroadcasterCount() };
    },
  );
  expect(result).toEqual({
    before: [2, 2],
    afterRemove: 1,
    hints: [4, 4, 1],
    membership: [true, true, true],
    remaining: 0,
  });
});
