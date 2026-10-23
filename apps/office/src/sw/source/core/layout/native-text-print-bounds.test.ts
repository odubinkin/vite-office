/** @fileoverview Checks the inclusive SwRect::Right projection used by native Writer XML print bounds. */
import { expect, it } from "vitest";
import { SvxIndentValue } from "../../../../editeng/inc/lrspitem";
import {
  SvxFirstLineIndentItem,
  SvxRightMarginItem,
  SvxTextLeftMarginItem,
} from "../../../../editeng/source/items/frmitems";
import { RES_MARGIN_FIRSTLINE, RES_MARGIN_RIGHT, RES_MARGIN_TEXTLEFT } from "../../../inc/hintids";
import { SwDoc } from "../doc/doc";
import { projectSwTextPrintBounds } from "./newfrm";

it("projects inclusive native print bounds with paragraph margins and first-line indentation", /** Uses real document items and physical page geometry. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const node = doc.paragraphs[0];
    if (node === undefined) throw new Error("Missing initial paragraph");
    node.SetAttr(new SvxTextLeftMarginItem(SvxIndentValue.twips(300), RES_MARGIN_TEXTLEFT));
    node.SetAttr(new SvxFirstLineIndentItem(SvxIndentValue.twips(-100), RES_MARGIN_FIRSTLINE));
    node.SetAttr(new SvxRightMarginItem(SvxIndentValue.twips(400), RES_MARGIN_RIGHT));
    const page = {
      ...doc.GetPageDesc().GetValue(),
      width: 12000,
      leftMargin: 1000,
      rightMargin: 1500,
    };
    expect(projectSwTextPrintBounds(node, page)).toEqual({ left: 200, right: 9099 });
  } finally {
    doc.Dispose();
  }
});

it("retains native empty and negative rectangle-width scalar semantics", /** These scalar inputs exercise SwRect::Right, without claiming ordinary UI layout creates inverted rectangles. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const node = doc.paragraphs[0];
    if (node === undefined) throw new Error("Missing initial paragraph");
    node.SetAttr(new SvxTextLeftMarginItem(SvxIndentValue.twips(300), RES_MARGIN_TEXTLEFT));
    const page = {
      ...doc.GetPageDesc().GetValue(),
      width: 2300,
      leftMargin: 1000,
      rightMargin: 1000,
    };
    expect(projectSwTextPrintBounds(node, page)).toEqual({ left: 300, right: 300 });
    expect(projectSwTextPrintBounds(node, { ...page, width: 2290 })).toEqual({
      left: 300,
      right: 289,
    });
  } finally {
    doc.Dispose();
  }
});
