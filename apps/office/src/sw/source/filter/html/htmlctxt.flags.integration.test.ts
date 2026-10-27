/** @fileoverview Verifies context flags survive independent native scope restoration. */
import { expect, it } from "vitest";
import { HTMLAttrContext, SwHTMLAppendMode } from "./htmlctxt";
import { HtmlTokenId } from "../../../../svtools/inc/htmltokn";
import { SwNumRule } from "../../core/doc/number";
it("roundtrips every context flag without changing unrelated state", /** Verifies independent state setters. @returns Nothing. */ () => {
  const context = new HTMLAttrContext(HtmlTokenId.PARABREAK_ON);
  const pairs = [
    [context.SetSpansSection.bind(context), context.GetSpansSection.bind(context)],
    [context.SetPopStack.bind(context), context.GetPopStack.bind(context)],
    [context.SetFinishPREListingXMP.bind(context), context.IsFinishPREListingXMP.bind(context)],
    [context.SetRestartPRE.bind(context), context.IsRestartPRE.bind(context)],
    [context.SetRestartXMP.bind(context), context.IsRestartXMP.bind(context)],
    [context.SetRestartListing.bind(context), context.IsRestartListing.bind(context)],
    [context.SetHeaderOrFooter.bind(context), context.IsHeaderOrFooter.bind(context)],
    [context.SetVisible.bind(context), context.IsVisible.bind(context)],
  ] as const;
  for (const [set, get] of pairs)
    for (const value of [true, false]) {
      set(value);
      expect(get()).toBe(value);
    }
  expect(context.IsLRSpaceChanged()).toBe(false);
  expect(context.IsULSpaceChanged()).toBe(false);
  context.SetMargins(1, 2, -3);
  context.SetULSpace(4, 5);
  expect(context.IsLRSpaceChanged()).toBe(true);
  expect(context.IsULSpaceChanged()).toBe(true);
  for (const mode of [
    SwHTMLAppendMode.AM_NORMAL,
    SwHTMLAppendMode.AM_NOSPACE,
    SwHTMLAppendMode.AM_SPACE,
    SwHTMLAppendMode.AM_SOFTNOSPACE,
    SwHTMLAppendMode.AM_NONE,
  ]) {
    context.SetAppendMode(mode);
    expect(context.GetAppendMode()).toBe(mode);
  }
  const rule = new SwNumRule("saved", "label-width-and-position");
  context.SetSavedNumRule(rule);
  expect(context.GetSavedNumRule()).toBe(rule);
  context.SetSavedNumRule(null);
  expect(context.GetSavedNumRule()).toBeNull();
  expect(context.GetAttrs()).toEqual([]);
});
