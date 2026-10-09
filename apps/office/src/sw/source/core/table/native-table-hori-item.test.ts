/** @fileoverview Verifies original table horizontal item ownership, alias construction boundaries and direct inherited physical layout. */
import { expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwFrameFormat } from "../layout/atrfrm";
import { SwTabFrame } from "../layout/tabfrm";
import { SwFormatHoriOrient } from "../../../inc/fmtornt";
import { RES_HORI_ORIENT } from "../../../inc/hintids";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import type { SwTableFormat } from "./swtable";
it.each([
  [{ align: "left" }, 6],
  [{ align: "left", marginLeft: 100 }, 0],
  [{ align: "left", width: 3000 }, 3],
  [{ align: "left", width: 3000, marginLeft: 100 }, 7],
  [{ align: "center" }, 6],
  [{ align: "center", width: 3000 }, 2],
  [{ align: "right" }, 6],
  [{ align: "right", width: 3000 }, 1],
  [{ align: "margins" }, 6],
  [{ align: "margins", marginRight: 100 }, 0],
] as const)(
  "legacy construction %j immediately owns native orientation",
  /** Checks explicit transport alias conversion only at construction. @param input - Legacy input. @param expected - Original native orientation. @returns Nothing. */ (
    input,
    expected,
  ) => {
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode("NativeHori", input as SwTableFormat);
    try {
      expect(table.GetFrameFormat().GetHoriOrient().GetHoriOrient()).toBe(expected);
      expect(table.GetHoriOrient()).toBe(expected);
      expect(table.GetFormat().horiOrient).toBe(expected);
      table.SetFormat({});
      expect(table.GetFrameFormat().GetHoriOrient().GetHoriOrient()).toBe(0);
      expect(table.GetFormat().horiOrient).toBeUndefined();
    } finally {
      table.Dispose();
    }
  },
);
it("original inherited horizontal owner bypasses stale transport and wrapper in physical layout", /** Checks inherited original item/clone/reset and real frame widths. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("NativeInherited", { width: 3000 }),
    format = table.GetFrameFormat(),
    parent = new SwFrameFormat(doc.GetAttrPool(), "Parent"),
    item = new SwFormatHoriOrient(41, HoriOrientation.RIGHT, 7, true);
  table.AddColumnWidth(3000);
  doc.nodes.AppendTableRow(table, 1);
  parent.SetFormatAttr(item);
  format.SetDerivedFrom(parent);
  format.ResetFormatAttr(RES_HORI_ORIENT);
  const frame = new SwTabFrame(table),
    native = table.GetFormat.bind(table),
    projection = vi.spyOn(table, "GetFormat"),
    wrapper = vi.spyOn(table, "GetHoriOrient");
  projection.mockImplementation(
    /** Keeps stale detached orientation. @returns Projection. */ () => ({
      ...native(),
      horiOrient: HoriOrientation.FULL,
      align: "margins",
    }),
  );
  wrapper.mockReturnValue(HoriOrientation.FULL);
  try {
    expect(format.GetHoriOrient()).toBe(parent.GetHoriOrient());
    expect(format.GetHoriOrient()).not.toBe(item);
    expect(format.GetHoriOrient(false).GetHoriOrient()).toBe(HoriOrientation.NONE);
    expect(frame.Format(6000)).toEqual({ left: 3000, right: 0, width: 3000 });
    expect([
      format.GetHoriOrient().GetPos(),
      format.GetHoriOrient().GetRelationOrient(),
      format.GetHoriOrient().IsPosToggle(),
    ]).toEqual([41, 7, true]);
  } finally {
    projection.mockRestore();
    wrapper.mockRestore();
    frame.DestroyImpl();
    table.Dispose();
    parent.DisposeModify();
  }
});
