/** @fileoverview Verifies original LR pool/direct/inherited table ownership and effective layout/representation/ODT without scalar replay. */
import { expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SvxLRSpaceItem } from "../../../../editeng/source/items/frmitems";
import { SwFormatHoriOrient } from "../../../inc/fmtornt";
import { RES_LR_SPACE } from "../../../inc/hintids";
import { SwFrameFormat } from "../layout/atrfrm";
import { SwTabFrame } from "../layout/tabfrm";
import { SwTableRep } from "../../uibase/table/swtablerep";
import { SwTabCols } from "../bastyp/tabcol";
import { exportContentXml } from "../../filter/xml/xmlexp";
it.each([false, true])(
  "original effective table LR bypasses stale projection inherited=%s",
  /** Checks effective native ownership and context. @param inherited - Native parent. @returns Nothing. */ (
    inherited,
  ) => {
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode("NativeLR", {
        width: 3000,
        horiOrient: 0,
        marginLeft: 120,
        marginRight: 60,
      }),
      format = table.GetFrameFormat(),
      parent = new SwFrameFormat(doc.GetAttrPool(), "Parent"),
      item = new SvxLRSpaceItem(98);
    table.AddColumnWidth(3000);
    doc.nodes.AppendTableRow(table, 1);
    item.SetLeft(-120);
    item.SetRight(240);
    item.SetGutterMargin(41);
    item.SetAutoFirst(true);
    const frame = new SwTabFrame(table);
    try {
      expect(format.GetLRSpace(false).ResolveLeft()).toBe(120);
      expect(format.GetLRSpace(false).ResolveRight()).toBe(60);
      expect(format.GetLRSpace(false)).toBeInstanceOf(SvxLRSpaceItem);
      if (inherited) {
        parent.SetFormatAttr(item);
        format.SetDerivedFrom(parent);
        format.ResetFormatAttr(RES_LR_SPACE);
      } else format.SetFormatAttr(item);
      expect(format.GetLRSpace()).not.toBe(item);
      if (inherited) expect(format.GetLRSpace()).toBe(parent.GetLRSpace());
      expect(format.GetLRSpace().GetGutterMargin()).toBe(41);
      const original = table.GetFormat.bind(table),
        spy = vi.spyOn(table, "GetFormat").mockImplementation(
          /** Returns obsolete detached margins. @returns Stale transport. */ () => ({
            ...original(),
            marginLeft: 999,
            marginRight: 888,
          }),
        );
      try {
        expect(frame.Format(6000)).toEqual({ left: -120, right: 240, width: 5880 });
        const rep = new SwTableRep(table, 6000);
        expect([rep.left, rep.right, rep.width]).toEqual([-120, 240, 5880]);
        const xml = exportContentXml(doc);
        if (inherited) {
          expect(xml).not.toContain('fo:margin-left="-0.2117cm"');
          expect(xml).not.toContain('fo:margin-right="0.4233cm"');
        } else {
          expect(xml).toContain('fo:margin-left="-0.2117cm"');
          expect(xml).toContain('fo:margin-right="0.4233cm"');
        }
      } finally {
        spy.mockRestore();
      }
      table.SetFormat({ width: 3000, horiOrient: 0, marginLeft: 400 });
      expect([
        format.GetLRSpace().ResolveLeft(),
        format.GetLRSpace().ResolveRight(),
        format.GetLRSpace().GetGutterMargin(),
        format.GetLRSpace().IsAutoFirst(),
      ]).toEqual([400, 0, 41, true]);
      expect(table.GetFormat()).toMatchObject({ marginLeft: 400, marginRight: 0 });
      table.SetFormat({ width: 3000, horiOrient: 0 });
      expect(table.GetFormat().marginLeft).toBeUndefined();
      expect(format.GetLRSpace(false).ResolveLeft()).toBe(0);
    } finally {
      frame.DestroyImpl();
      table.Dispose();
      parent.DisposeModify();
    }
  },
);
it("native SetTabCols clones complete LR context onto original frame", /** Checks original separator path without scalar storage. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("NativeLRCols", {
      width: 3000,
      horiOrient: 0,
      marginLeft: 0,
      marginRight: 3000,
    }),
    format = table.GetFrameFormat();
  table.AddColumnWidth(1500);
  table.AddColumnWidth(1500);
  doc.nodes.AppendTableRow(table, 2);
  const before = format.GetLRSpace().Clone();
  before.SetGutterMargin(41);
  before.SetRightGutterMargin(73);
  before.SetAutoFirst(true);
  before.SetTextFirstLineOffset(20);
  before.SetPropTextFirstLineOffset(80);
  format.SetFormatAttr(before);
  const old = new SwTabCols();
  old.SetLeft(0);
  old.SetRight(3000);
  old.SetRightMax(6000);
  old.Insert(1500, false, 0);
  const next = new SwTabCols(old);
  next.SetLeft(120);
  next.SetRight(3240);
  try {
    const start = table.GetTabLines()[0]?.GetTabBoxes()[0];
    if (start === undefined) throw Error("Missing original native box");
    table.SetTabCols(next, old, start, false);
    expect([
      format.GetLRSpace().ResolveLeft(),
      format.GetLRSpace().ResolveRight(),
      format.GetLRSpace().GetGutterMargin(),
      format.GetLRSpace().GetRightGutterMargin(),
      format.GetLRSpace().GetTextFirstLineOffset(),
      format.GetLRSpace().GetPropTextFirstLineOffset(),
      format.GetLRSpace().IsAutoFirst(),
    ]).toEqual([120, 2760, 41, 73, 20, 80, true]);
    expect(before.ResolveLeft()).toBe(0);
    expect(format.GetHoriOrient()).toBeInstanceOf(SwFormatHoriOrient);
  } finally {
    table.Dispose();
  }
});
