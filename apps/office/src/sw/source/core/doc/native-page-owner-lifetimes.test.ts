/** @fileoverview Native page collection teardown releases all actual frame owners and preserves client registration; default character/graphic owners use the document pool. */
import { expect, it } from "vitest";
import { SwDoc } from "./doc";
import { SwCharFormat } from "../../../inc/charfmt";
import { SwGrfFormatColl } from "../../../inc/fmtcol";
import { SwClient } from "../../../inc/calbck";

it("owns actual default character/graphic formats and original derived ranges", /** No detached pool, graphic service or dummy model is substituted. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    chars = doc.GetDfltCharFormat(),
    graphics = doc.GetDfltGrfFormatColl(),
    child = new SwCharFormat(doc.GetAttrPool(), "Character child", chars),
    grfChild = new SwGrfFormatColl(doc.GetAttrPool(), "Graphic child", graphics);
  expect(chars.GetName()).toBe("Character style");
  expect(graphics.GetName()).toBe("Graphikformatvorlage");
  expect(chars.GetDoc()).toBe(doc);
  expect(graphics.GetDoc()).toBe(doc);
  expect(chars.IsAuto()).toBe(true);
  expect(graphics.IsAuto()).toBe(false);
  expect(chars.GetAttrSet().GetRanges()).toEqual([
    [1, 48],
    [163, 163],
  ]);
  expect(graphics.GetAttrSet().GetRanges()).toEqual([
    [92, 159],
    [163, 163],
  ]);
  expect(child.DerivedFrom()).toBe(chars);
  expect(grfChild.DerivedFrom()).toBe(graphics);
  doc.Dispose();
  expect(chars.IsDisposed()).toBe(true);
  expect(graphics.IsDisposed()).toBe(true);
  expect(child.DerivedFrom()).toBeUndefined();
  expect(grfChild.DerivedFrom()).toBeUndefined();
  child.DisposeModify();
  grfChild.DisposeModify();
});

it("deletes all four page frames, repairs follow links and releases document-owned pages on destruction", /** Native clients follow the surviving real format rather than leaked owners. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    standard = doc.GetPageDesc(),
    page = doc.MakePageDesc("Second"),
    copied = doc.MakePageDesc("Copy", page),
    client = new SwClient();
  expect(
    /** Original unique-name admission. @returns Never. */ () => doc.MakePageDesc("Copy"),
  ).toThrow("exists");
  expect(doc.ChgPageDesc(standard.GetValue(), "absent")).toBe(false);
  expect(doc.ChgPageDesc(standard.GetValue())).toBe(false);
  expect(
    /** Browser geometry cannot rename the existing native identity. @returns Never. */ () =>
      doc.ChgPageDesc({ ...standard.GetValue(), name: "Changed" }),
  ).toThrow("identity");
  expect(doc.ChgPageDesc({ ...standard.GetValue(), width: 12345 })).toBe(true);
  expect(doc.ChgPageDesc({ ...page.GetValue(), width: 12346 }, "Second")).toBe(true);
  const independent = doc.MakePageDesc("Independent");
  standard.SetFollow(page);
  copied.SetFollow(page);
  const frames = [page.GetMaster(), page.GetLeft(), page.GetFirstMaster(), page.GetFirstLeft()];
  client.RegisterToModify(page.GetMaster());
  expect(doc.DelPageDesc(0)).toBe(false);
  expect(doc.DelPageDesc(999)).toBe(false);
  expect(doc.DelPageDesc("absent")).toBe(false);
  expect(doc.DelPageDesc("Second")).toBe(true);
  expect(standard.GetFollow()).toBe(standard);
  expect(copied.GetFollow()).toBe(copied);
  expect(independent.GetFollow()).toBe(independent);
  expect(page.IsDisposed()).toBe(true);
  for (const frame of frames) expect(frame.IsDisposed()).toBe(true);
  expect(client.GetRegisteredIn()).toBe(doc.GetDfltFrameFormat());
  const remaining = [standard, copied, independent];
  doc.Dispose();
  expect(doc.GetPageDescCnt()).toBe(0);
  for (const owner of remaining) {
    expect(owner.IsDisposed()).toBe(true);
    for (const frame of [
      owner.GetMaster(),
      owner.GetLeft(),
      owner.GetFirstMaster(),
      owner.GetFirstLeft(),
    ])
      expect(frame.IsDisposed()).toBe(true);
  }
  client.Dispose();
});
