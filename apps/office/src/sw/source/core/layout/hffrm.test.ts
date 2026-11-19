/** @fileoverview Native Writer header and footer selection and placement on physical pages. */
import { assert, expect, it } from "vitest";
import { SwFormatFooter, SwFormatHeader } from "../../../inc/fmthdft";
import { SwDoc } from "../doc/doc";
import { PreparePageStories } from "./hffrm";
import type { SwPageFrame } from "./newfrm";

it("uses each physical page's first, left or master format and its native story geometry", /** Checks original page variant selection and footer positioning on the real Writer formats. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const descriptor = doc.GetPageDesc();
    descriptor.ChgFirstShare(false);
    descriptor.ChgHeaderShare(false);
    descriptor.ChgFooterShare(false);
    descriptor.GetFirstMaster().SetFormatAttr(new SwFormatHeader(true));
    descriptor.GetFirstLeft().SetFormatAttr(new SwFormatHeader(true));
    descriptor.GetMaster().SetFormatAttr(new SwFormatFooter(true));
    descriptor.GetLeft().SetFormatAttr(new SwFormatHeader(true));
    const master = descriptor.GetMaster();
    const footer = master.GetFooter().GetFooterFormat();
    assert(footer);
    const size = footer.GetFrameSize().Clone();
    try {
      size.SetHeight(720);
      footer.SetFormatAttr(size);
    } finally {
      size.Dispose();
    }
    const geometry = descriptor.GetValue();
    /** Makes a physical page backed by the native descriptor. @param number - Native folio. @returns Physical page. */
    function page(number: number): SwPageFrame {
      return { descriptor: geometry, number, textFrames: [], tableFrames: [] };
    }
    const first = PreparePageStories(doc, page(1), undefined);
    const firstLeft = PreparePageStories(doc, page(2), undefined);
    const even = PreparePageStories(doc, page(2), page(1));
    const odd = PreparePageStories(doc, page(3), page(2));
    expect(first).toHaveLength(1);
    expect(firstLeft).toHaveLength(1);
    expect(even).toHaveLength(1);
    expect(odd).toHaveLength(1);
    expect(first[0]?.start).not.toBe(even[0]?.start);
    expect(firstLeft[0]?.start).not.toBe(first[0]?.start);
    expect(firstLeft[0]?.start).not.toBe(even[0]?.start);
    expect(first[0]?.header).toBe(true);
    expect(odd[0]?.header).toBe(false);
    expect(odd[0]?.height).toBe(720);
    expect(odd[0]?.top).toBe(geometry.height - geometry.bottomMargin - 720);
    expect(
      PreparePageStories(
        doc,
        { ...page(1), descriptor: { ...geometry, name: "Unknown" } },
        undefined,
      ),
    ).toEqual([]);
  } finally {
    doc.Dispose();
  }
});

it("uses the shared master story and applies the page gutter to the configured edge", /** Checks the same borrowed story with the two original gutter directions. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const descriptor = doc.GetPageDesc();
    const master = descriptor.GetMaster();
    master.SetFormatAttr(new SwFormatHeader(true));
    const margins = master.GetLRSpace().Clone();
    try {
      margins.SetGutterMargin(120);
      master.SetFormatAttr(margins);
    } finally {
      margins.Dispose();
    }
    const geometry = descriptor.GetValue();
    const page: SwPageFrame = { descriptor: geometry, number: 1, textFrames: [], tableFrames: [] };
    const [left] = PreparePageStories(doc, page, undefined);
    doc.GetDocumentSettingManager().set("GUTTER_AT_TOP", true);
    const [top] = PreparePageStories(doc, page, undefined);
    expect(left?.left).toBe(geometry.leftMargin + 120);
    expect(top?.top).toBe(geometry.topMargin + 120);
    expect(top?.left).toBe(geometry.leftMargin);
    expect(top?.start).toBe(left?.start);
    const [even] = PreparePageStories(doc, { ...page, number: 2 }, page);
    expect(even?.start).toBe(top?.start);
  } finally {
    doc.Dispose();
  }
});
