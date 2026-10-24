/** @fileoverview Pins original definite-state paragraph split handler order and changed-attribute output. */
import { expect, it } from "vitest";
import { SvxExtParagraphTabPage } from "./paragrph";
it("retains source reset order and asymmetric disabled-state handlers", /** False widow and false orphan handlers intentionally disagree. @returns Nothing. */ () => {
  const page = new SvxExtParagraphTabPage({ orphans: 0, widows: 0 });
  expect(page.GetState()).toMatchObject({
    allow: true,
    allowSensitive: true,
    widow: false,
    orphan: false,
    widowLines: 1,
    orphanLines: 1,
  });
  expect(page.FillItemSet()).toEqual({});
  page.WidowHdl(false);
  expect(page.GetState().allowSensitive).toBe(false);
  page.OrphanHdl(false);
  expect(page.GetState().allowSensitive).toBe(true);
  page.WidowHdl(true);
  page.OrphanHdl(true);
  expect(page.FillItemSet()).toEqual({ widows: 1, orphans: 1 });
  page.AllowSplitHdl(false);
  expect(page.GetState()).toMatchObject({
    boxesSensitive: false,
    widowRows: true,
    orphanRows: true,
  });
  expect(page.FillItemSet()).toEqual({ keepTogether: true, widows: 1, orphans: 1 });
  page.WidowHdl(false);
  page.OrphanHdl(false);
  page.AllowSplitHdl(true);
  expect(page.FillItemSet()).toEqual({});
  page.SetLines("widow", 3);
  page.SetLines("orphan", 4);
  expect(page.FillItemSet()).toEqual({});
});
it("emits only original changed values,retains inactive counts and clamps source1..9 widgets", /** Checkboxes encode zero and existing unsupported large counts are not silently rewritten. @returns Nothing. */ () => {
  const page = new SvxExtParagraphTabPage({ keepTogether: true, orphans: 2, widows: 2 });
  expect(page.GetState()).toMatchObject({
    boxesSensitive: false,
    widowRows: true,
    orphanRows: true,
  });
  expect(page.FillItemSet()).toEqual({});
  page.AllowSplitHdl(true);
  page.SetLines("widow", 10);
  page.SetLines("orphan", 0);
  expect(page.FillItemSet()).toEqual({ keepTogether: false, widows: 9, orphans: 1 });
  page.WidowHdl(false);
  expect(page.FillItemSet()).toMatchObject({ widows: 0 });
  expect(page.GetState().widowLines).toBe(9);
  page.WidowHdl(true);
  expect(page.FillItemSet()).toMatchObject({ widows: 9 });
  page.OrphanHdl(false);
  expect(page.FillItemSet()).toMatchObject({ orphans: 0 });
  page.OrphanHdl(true);
  const imported = new SvxExtParagraphTabPage({ widows: 99, orphans: 99 });
  expect(imported.FillItemSet()).toEqual({});
  imported.SetLines("widow", 4);
  imported.SetLines("orphan", 5);
  expect(imported.FillItemSet()).toEqual({ widows: 4, orphans: 5 });
  expect(new SvxExtParagraphTabPage({}).FillItemSet()).toEqual({});
});
