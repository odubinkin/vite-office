/** @fileoverview Native RTF physical alignment, tab leaders and character control boundaries. */
import { assert, expect, it } from "vitest";
import { SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import {
  DFLT_ESC_AUTO_SUB,
  DFLT_ESC_AUTO_SUPER,
  DFLT_ESC_PROP,
  DFLT_ESC_SUB,
} from "../../../../editeng/inc/escapementitem";
import { SvxAdjust } from "../../../../editeng/inc/svxenum";
import { SvxTabAdjust, SvxTabStop, SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import { FontStrikeout } from "../../../../tools/inc/fontenum";
import { RES_PARATR_ADJUST, RES_PARATR_TABSTOP } from "../../../inc/hintids";
import { createWriterDocument } from "../../core/doc/doc";
import { RtfExport } from "./rtfexport";
import { RtfAttributeOutput } from "./rtfattributeoutput";

/** Supplies stable document-table indices for controls that do not allocate fonts or colors. @returns Attribute writer. */
function output(): RtfAttributeOutput {
  return new RtfAttributeOutput(
    /** Returns the represented font slot. @returns Slot zero. */ () => 0,
    /** Returns the represented color slot. @returns Slot zero. */ () => 0,
    new RtfExport(),
  );
}

it("keeps physical left and right alignment distinct from logical paragraph defaults", /** Checks original items through the public paragraph serializer. @returns Nothing. */ () => {
  const doc = createWriterDocument();
  try {
    const paragraph = doc.paragraphs[0];
    assert(paragraph);
    for (const [alignment, control] of [
      [SvxAdjust.Left, "\\ql"],
      [SvxAdjust.Right, "\\qr"],
      [SvxAdjust.Block, "\\qj"],
    ] as const) {
      paragraph.SetAttr(new SvxAdjustItem(alignment, RES_PARATR_ADJUST));
      expect(output().WriteParagraphProperties(paragraph)).toMatch(
        new RegExp("^" + control.replaceAll("\\", "\\\\")),
      );
    }
    const tabs = new SvxTabStopItem(0, 0, SvxTabAdjust.Default, RES_PARATR_TABSTOP);
    tabs.Insert(new SvxTabStop(360, SvxTabAdjust.Left, "\0", "-"));
    tabs.Insert(new SvxTabStop(720, SvxTabAdjust.Left, "\0", "="));
    tabs.Insert(new SvxTabStop(1080, SvxTabAdjust.Left, "\0", "x"));
    paragraph.SetAttr(tabs);
    const controls = output().WriteParagraphProperties(paragraph);
    expect(controls).toContain("\\tlth\\tx360");
    expect(controls).toContain("\\tleq\\tx720");
    expect(controls).toContain("\\tleq\\tx720\\tx1080");
  } finally {
    doc.Dispose();
  }
});

it("emits explicit strikethrough reset and ordinary single strike controls", /** Checks direct character deltas without paragraph inheritance. @returns Nothing. */ () => {
  const plain = { bold: false, italic: false, underline: false };
  expect(output().WriteCharacter({ ...plain, strikeout: FontStrikeout.STRIKEOUT_NONE })).toBe(
    "\\strike0",
  );
  expect(output().WriteCharacter({ ...plain, strikeout: FontStrikeout.STRIKEOUT_SINGLE })).toBe(
    "\\strike",
  );
  expect(output().WriteCharacter(plain)).toBe("");
});

it("preserves native subscript and manual proportional baseline controls", /** Checks native marker values, default font size and zero-offset admission. @returns Nothing. */ () => {
  const plain = { bold: false, italic: false, underline: false };
  for (const [offset, height, expected] of [
    [DFLT_ESC_SUB, DFLT_ESC_PROP, "\\sub"],
    [DFLT_ESC_AUTO_SUB, DFLT_ESC_PROP, "\\sub"],
    [10, 0, ""],
    [10, 101, ""],
    [0, 70, ""],
    [DFLT_ESC_AUTO_SUPER, 100, ""],
    [DFLT_ESC_AUTO_SUB, 70, "{\\*\\updnprop7001}\\dn1"],
    [-25, 70, "{\\*\\updnprop7000}\\dn6"],
  ] as const) {
    expect(output().WriteCharacter({ ...plain, escapement: { offset, height } })).toBe(expected);
  }
});
