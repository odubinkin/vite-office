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
it("resets represented breaks and preserves imported attributes outside widget choices", /** No-op acceptance cannot replace imported offsets or combined breaks. @returns Nothing. */ () => {
  expect(new SvxExtParagraphTabPage({}).GetBreakState()).toMatchObject({
    insert: false,
    apply: false,
    style: "",
    number: 1,
    numbered: false,
    applySensitive: false,
  });
  for (const value of [
    { breakBefore: "page", breakAfter: "page" } as const,
    { breakAfter: "page" } as const,
    { pageNumber: 65535 },
    { pageNumber: 0 },
  ])
    expect(new SvxExtParagraphTabPage(value).FillItemSet()).toEqual({});
  const unknown = new SvxExtParagraphTabPage({ pageStyleName: "Missing" });
  expect(unknown.FillItemSet()).toEqual({ pageStyleName: "" });
  const known = new SvxExtParagraphTabPage({ pageStyleName: "Standard", pageNumber: 65535 });
  expect(known.GetBreakState()).toMatchObject({
    insert: true,
    apply: true,
    position: "before",
    number: 55535,
    numbered: true,
    numberSensitive: true,
  });
  expect(known.FillItemSet()).toEqual({ breakBefore: "auto", breakAfter: "auto" });
  known.SetPageNumber(0);
  expect(known.FillItemSet()).toMatchObject({ pageNumber: 0 });
});
it("uses original style and number handlers with sensitivity gated output and retained drafts", /** Disabled numeric drafts cannot write page offsets. @returns Nothing. */ () => {
  const page = new SvxExtParagraphTabPage({});
  page.PageBreakHdl(true);
  expect(page.FillItemSet()).toEqual({ breakBefore: "page", breakAfter: "auto" });
  page.ApplyCollClickHdl(true);
  expect(page.GetBreakState()).toMatchObject({
    style: "Standard",
    styleSensitive: true,
    numberSensitive: false,
  });
  page.PageNumBoxClickHdl(true);
  page.SetPageNumber(70000);
  expect(page.FillItemSet()).toEqual({
    pageStyleName: "Standard",
    pageNumber: 55535,
    breakBefore: "auto",
    breakAfter: "auto",
  });
  page.PageBreakPosHdl_Impl("after");
  expect(page.GetBreakState()).toMatchObject({
    apply: false,
    style: "Standard",
    number: 55535,
    numbered: true,
    numberSensitive: false,
  });
  expect(page.FillItemSet()).toEqual({ breakBefore: "auto", breakAfter: "page" });
  page.PageBreakPosHdl_Impl("before");
  page.ApplyCollClickHdl(true);
  page.SetPageStyle("Custom");
  page.PageNumBoxClickHdl(false);
  page.SetPageNumber(-3);
  expect(page.GetBreakState().number).toBe(0);
  expect(page.FillItemSet()).toEqual({
    pageStyleName: "Custom",
    breakBefore: "auto",
    breakAfter: "auto",
  });
  page.ApplyCollClickHdl(false);
  expect(page.GetBreakState().style).toBe("");
  page.PageBreakHdl(false);
  expect(page.FillItemSet()).toEqual({});
  const empty = new SvxExtParagraphTabPage({}, []);
  empty.PageBreakHdl(true);
  empty.ApplyCollClickHdl(true);
  expect(empty.GetBreakState()).toMatchObject({ apply: true, style: "", styleSensitive: false });
  expect(empty.FillItemSet()).toEqual({ breakBefore: "page", breakAfter: "auto" });
  const nonstandard = new SvxExtParagraphTabPage({}, ["Custom"]);
  nonstandard.ApplyCollClickHdl(true);
  expect(nonstandard.GetBreakState().style).toBe("");
});
it("removes only changed page offsets and styles with source saved-item decisions", /** Restore and inactive edits retain the previous model. @returns Nothing. */ () => {
  const page = new SvxExtParagraphTabPage({ pageStyleName: "Standard", pageNumber: 2 }, [
    "Standard",
    "Other",
  ]);
  page.PageNumBoxClickHdl(false);
  expect(page.FillItemSet()).toEqual({
    pageNumber: "auto",
    breakBefore: "auto",
    breakAfter: "auto",
  });
  page.PageNumBoxClickHdl(true);
  page.SetPageNumber(3);
  page.SetPageNumber(2);
  expect(page.FillItemSet()).toEqual({ breakBefore: "auto", breakAfter: "auto" });
  page.SetPageStyle("Other");
  expect(page.FillItemSet()).toEqual({
    pageStyleName: "Other",
    breakBefore: "auto",
    breakAfter: "auto",
  });
  page.ApplyCollClickHdl(false);
  expect(page.FillItemSet()).toEqual({
    pageStyleName: "",
    breakBefore: "page",
    breakAfter: "auto",
  });
  page.PageBreakHdl(false);
  expect(page.FillItemSet()).toEqual({
    pageStyleName: "",
    breakBefore: "auto",
    breakAfter: "auto",
  });
  const absent = new SvxExtParagraphTabPage({});
  absent.PageBreakHdl(true);
  absent.ApplyCollClickHdl(true);
  absent.PageNumBoxClickHdl(true);
  absent.PageNumBoxClickHdl(false);
  absent.SetPageNumber(3);
  expect(absent.FillItemSet()).not.toHaveProperty("pageNumber");
  const restored = new SvxExtParagraphTabPage({ pageStyleName: "Standard", breakBefore: "page" });
  restored.ApplyCollClickHdl(false);
  restored.ApplyCollClickHdl(true);
  restored.PageBreakPosHdl_Impl("after");
  restored.PageBreakPosHdl_Impl("before");
  expect(restored.FillItemSet()).toEqual({ pageStyleName: "" });
});

it("retains native old-item equality when the source item set changes after Reset", /** Synthetic old-item change: a real Writer dialog snapshots its definite input and cannot reach this branch. Kept to pin the upstream saved-widget versus current-old-item guard. @returns Nothing. */ () => {
  const value = { pageStyleName: "Standard", pageNumber: 2 };
  const page = new SvxExtParagraphTabPage(value);
  value.pageNumber = 3;
  page.SetPageNumber(3);
  expect(page.FillItemSet()).not.toHaveProperty("pageNumber");
});
