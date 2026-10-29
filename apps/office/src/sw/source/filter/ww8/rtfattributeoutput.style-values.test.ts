/** @fileoverview Actual Writer style items reach the RTF paragraph-value serializer through the genuine exporter and selection owners, without replacement font/color callbacks. */
import { assert, expect, it } from "vitest";
import { createWriterDocument, type SwDoc } from "../../core/doc/doc";
import { SwNumFormat } from "../../core/doc/number";
import { SwNumRuleItem } from "../../core/para/paratr";
import { applyWriterParagraphList } from "../../core/doc/list";
import { NumberingLevel } from "./wrtw8num";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { RtfExport } from "./rtfexport";
import type { RtfAttributeOutput } from "./rtfattributeoutput";
import { SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import { SvxAdjust, SvxLineSpaceRule, SvxNumType } from "../../../../editeng/inc/svxenum";
import { SvxTabStopItem, SvxTabStop, SvxTabAdjust } from "../../../../editeng/inc/tstpitem";
import {
  SvxTextLeftMarginItem,
  SvxRightMarginItem,
  SvxFirstLineIndentItem,
  SvxIndentValue,
} from "../../../../editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import {
  RES_PARATR_ADJUST,
  RES_PARATR_TABSTOP,
  RES_MARGIN_TEXTLEFT,
  RES_MARGIN_RIGHT,
  RES_MARGIN_FIRSTLINE,
  RES_UL_SPACE,
  RES_KEEP,
  RES_PARATR_SPLIT,
  RES_PARATR_WIDOWS,
  RES_BREAK,
  RES_PARATR_LINESPACING,
} from "../../../inc/hintids";

/** Owns a genuine exporter with its actual document tables and range bindings. @param check - Observes public attribute output. @returns Nothing. */
function withOutput(
  check: (doc: SwDoc, output: RtfAttributeOutput, exporter: RtfExport) => void,
): void {
  const doc = createWriterDocument(),
    node = doc.paragraphs[0];
  assert(node);
  const position = new SwPosition(node),
    range = new SwPaM(position);
  position.Dispose();
  const exporter = new RtfExport(doc, range, range);
  try {
    check(doc, exporter.AttrOutput(), exporter);
  } finally {
    exporter.Dispose();
    range.Dispose();
    doc.Dispose();
  }
}

it.each([
  [SvxAdjust.Left, false, "\\ql"],
  [SvxAdjust.Right, false, "\\qr"],
  [SvxAdjust.Center, false, "\\qc"],
  [SvxAdjust.Block, false, "\\qj"],
  [SvxAdjust.Block, true, "\\qd"],
  [SvxAdjust.ParaStart, false, ""],
  [SvxAdjust.ParaEnd, false, ""],
] as const)(
  "writes original style alignment %i with last-block %s",
  /** Source logical start/end leave default RTF alignment untouched; physical alignment and justification emit distinct controls. @param adjust - Native item value. @param lastBlock - Native justification option. @param expected - Expected leading control. @returns Nothing. */ (
    adjust,
    lastBlock,
    expected,
  ) => {
    withOutput(
      /** Installs an actual named paragraph style. @param doc - Document. @param output - Real sink. @returns Nothing. */ (
        doc,
        output,
      ) => {
        const style = doc.MakeTextFormatColl("Alignment"),
          item = new SvxAdjustItem(adjust, RES_PARATR_ADJUST);
        try {
          item.SetLastBlock(lastBlock ? SvxAdjust.Block : SvxAdjust.Left);
          style.SetFormatAttr(item);
          const controls = output.WriteStyleParagraphProperties(style);
          if (expected) expect(controls.startsWith(expected)).toBe(true);
          else expect(controls).not.toMatch(/^\\q/u);
        } finally {
          item.Dispose();
        }
      },
    );
  },
);

it("preserves actual style margins, contextual spacing, keep flags, tab geometry and page break", /** All geometry is specified independently in native twips; actual style owners drive emission. @returns Nothing. */ () => {
  withOutput(
    /** Reads output before document/style destruction. @param doc - Document. @param output - Real sink. @returns Nothing. */ (
      doc,
      output,
    ) => {
      doc.GetDocumentSettingManager().set("TABS_RELATIVE_TO_INDENT", true);
      const style = doc.MakeTextFormatColl("Geometry"),
        tabs = new SvxTabStopItem(0, 0, SvxTabAdjust.Default, RES_PARATR_TABSTOP),
        spacing = new SvxLineSpacingItem(240, RES_PARATR_LINESPACING);
      spacing.SetLineSpaceRule(SvxLineSpaceRule.Auto);
      spacing.SetPropLineSpace(150);
      tabs.Insert(new SvxTabStop(240, SvxTabAdjust.Default, ".", " "));
      tabs.Insert(new SvxTabStop(360, SvxTabAdjust.Right, ".", "."));
      tabs.Insert(new SvxTabStop(720, SvxTabAdjust.Center, ".", "_"));
      tabs.Insert(new SvxTabStop(1080, SvxTabAdjust.Decimal, ".", "="));
      tabs.Insert(new SvxTabStop(1440, SvxTabAdjust.Left, ".", "-"));
      tabs.Insert(new SvxTabStop(1800, SvxTabAdjust.Left, ".", "?"));
      const items: SfxPoolItem[] = [
        new SvxAdjustItem(SvxAdjust.Right, RES_PARATR_ADJUST),
        new SvxTextLeftMarginItem(SvxIndentValue.twips(120), RES_MARGIN_TEXTLEFT),
        new SvxRightMarginItem(SvxIndentValue.twips(240), RES_MARGIN_RIGHT),
        new SvxFirstLineIndentItem(SvxIndentValue.twips(-60), RES_MARGIN_FIRSTLINE),
        new SvxULSpaceItem(120, 240, RES_UL_SPACE, true),
        new SfxBoolItem(RES_KEEP, true),
        new SfxBoolItem(RES_PARATR_SPLIT, false),
        new SfxInt16Item(RES_PARATR_WIDOWS, 2),
        new SfxInt16Item(RES_BREAK, 6),
        tabs,
        spacing,
      ];
      try {
        for (const item of items) style.SetFormatAttr(item);
        const controls = output.WriteStyleParagraphProperties(style);
        expect(controls).toContain(
          "\\qr\\li120\\lin120\\ri240\\rin240\\fi-60\\sb120\\sa240\\contextualspace\\keepn\\keep\\widctlpar",
        );
        expect(controls).toContain(
          "\\tldot\\tqr\\tx480\\tlul\\tqc\\tx840\\tleq\\tqdec\\tx1200\\tlth\\tx1560\\tx1920",
        );
        expect(controls).not.toContain("\\tx360");
        expect(controls).toContain("\\pagebb\\sl360\\slmult1");
      } finally {
        for (const item of items) item.Dispose();
      }
    },
  );
});

it("retains original tenth-level fallback controls from an actual Writer numbering format", /** Writer admits level9 while ordinary RTF list definitions emit0..8; the public common level callback preserves the original legacy fallback, including its group mismatch (WRITER244). @returns Nothing. */ () => {
  withOutput(
    /** Produces placeholder bytes through the actual common Word writer. @param doc - Document. @param output - Real attribute sink. @param exporter - Actual exporter. @returns Nothing. */ (
      doc,
      output,
      exporter,
    ) => {
      expect(output.GetExport()).toBe(exporter);
      const rule = doc.EnsureNumRule("ExtendedLevel", "numbered"),
        format = new SwNumFormat(rule.Get(9));
      format.SetNumberingType(SvxNumType.SVX_NUM_ARABIC);
      format.SetListFormat("%1%.");
      format.SetStart(3);
      format.SetIsLegal(true);
      format.SetNumAdjust(SvxAdjust.Center);
      format.SetPositionAndSpaceMode("label-alignment");
      format.SetLabelFollowedBy("nothing");
      format.SetIndentAt(0);
      format.SetFirstLineIndent(0);
      rule.Set(9, format);
      NumberingLevel(exporter, rule, 9);
      const fragment = new TextDecoder().decode(exporter.Strm().GetData());
      expect(fragment).toContain(
        "\\*\\soutlvl{\\listlevel\\levelnfc0\\leveljc1\\levelstartat3\\levellegal\\levelfollow2",
      );
      expect(fragment.endsWith("\\fi0\\li0}}")).toBe(true);
      expect(
        [...fragment].filter(
          /** Counts literal open groups in a generated label with no brace text. @param unit - RTF unit. @returns Opening group. */ (
            unit,
          ) => unit === "{",
        ).length -
          [...fragment].filter(
            /** Counts literal closing groups. @param unit - RTF unit. @returns Closing group. */ (
              unit,
            ) => unit === "}",
          ).length,
      ).toBe(-1);
    },
  );
});

it("checks the local stylesheet lifecycle before overwriting an active style buffer", /** A repeated StartStyles call exercises the existing host guard; no native invalid-lifecycle execution or stream recovery parity is claimed. @returns Nothing. */ () => {
  withOutput(
    /** Uses only genuine public lifecycle calls. @param _doc - Actual document. @param output - Real sink. @returns Nothing. */ (
      _doc,
      output,
    ) => {
      output.StartStyles();
      expect(
        /** Repeats an unclosed local stylesheet boundary. @returns Never. */ () =>
          output.StartStyles(),
      ).toThrow("assert(stylesheet empty)");
    },
  );
});

it("emits reset numbering margins from real style inheritance and keeps explicit margins", /** An empty rule name restores inherited indentation; an explicit left margin wins independently. @returns Nothing. */ () => {
  withOutput(
    /** Uses real paragraph and parent item sets. @param doc - Document. @param output - Serializer. @returns Nothing. */ (
      doc,
      output,
    ) => {
      const node = doc.paragraphs[0];
      assert(node);
      const style = doc.MakeTextFormatColl("Inherited margins");
      const left = new SvxTextLeftMarginItem(SvxIndentValue.twips(480), RES_MARGIN_TEXTLEFT),
        first = new SvxFirstLineIndentItem(SvxIndentValue.twips(-120), RES_MARGIN_FIRSTLINE),
        reset = new SwNumRuleItem("");
      try {
        style.SetFormatAttr(left);
        style.SetFormatAttr(first);
        node.ChgFormatColl(style);
        node.SetAttr(reset);
        expect(output.WriteParagraphProperties(node)).toBe("\\fi-120\\li480\\lin480");
        const explicit = new SvxTextLeftMarginItem(SvxIndentValue.twips(720), RES_MARGIN_TEXTLEFT);
        try {
          node.SetAttr(explicit);
          expect(output.WriteParagraphProperties(node)).toBe("\\fi-120\\li720\\lin720");
        } finally {
          explicit.Dispose();
        }
      } finally {
        left.Dispose();
        first.Dispose();
        reset.Dispose();
      }
    },
  );
});

it("writes paragraph-only default, flag, absolute-tab and underline reset paths", /** Genuine node attributes and direct public character deltas exercise distinct original callbacks. @returns Nothing. */ () => {
  withOutput(
    /** Actual paragraph values have different dispatch from effective style values. @param doc - Document. @param output - Serializer. @returns Nothing. */ (
      doc,
      output,
    ) => {
      const node = doc.paragraphs[0];
      assert(node);
      doc.GetDocumentSettingManager().set("TABS_RELATIVE_TO_INDENT", false);
      const tabs = new SvxTabStopItem(0, 0, SvxTabAdjust.Default, RES_PARATR_TABSTOP);
      tabs.Insert(new SvxTabStop(120, SvxTabAdjust.Default, ".", " "));
      tabs.Insert(new SvxTabStop(240, SvxTabAdjust.Center, ".", "."));
      const items: SfxPoolItem[] = [
        new SvxAdjustItem(SvxAdjust.ParaEnd, RES_PARATR_ADJUST),
        new SvxULSpaceItem(0, 0, RES_UL_SPACE, false),
        new SfxBoolItem(RES_KEEP, false),
        new SfxBoolItem(RES_PARATR_SPLIT, true),
        new SfxInt16Item(RES_PARATR_WIDOWS, 2),
        tabs,
      ];
      try {
        for (const item of items) node.SetAttr(item);
        const controls = output.WriteParagraphProperties(node);
        expect(controls).toContain("\\sb0\\sa0");
        expect(controls).toContain("\\widctlpar");
        expect(controls).toContain("\\tldot\\tqc\\tx240");
        expect(controls).not.toContain("\\tx120");
        expect(controls).not.toContain("\\keep");
        expect(controls).not.toContain("\\contextualspace");
        const style = doc.MakeTextFormatColl("Zero widows"),
          zero = new SfxInt16Item(RES_PARATR_WIDOWS, 0);
        try {
          style.SetFormatAttr(zero);
          expect(output.WriteStyleParagraphProperties(style)).toContain("\\nowidctlpar");
        } finally {
          zero.Dispose();
        }
        expect(
          output.WriteCharacter({
            bold: false,
            italic: false,
            underline: false,
            underlineWordMode: true,
          }),
        ).toBe("");
      } finally {
        for (const item of items) item.Dispose();
      }
    },
  );
});

it("uses the actual unowned numbering format and legacy level9 paragraph reference", /** Native nullable SetByPointer exposes the original default-format fallback without replacing getters. @returns Nothing. */ () => {
  withOutput(
    /** Keeps actual document list state and numbering IDs. @param doc - Document. @param output - Attribute serializer. @param exporter - Actual exporter. @returns Nothing. */ (
      doc,
      output,
      exporter,
    ) => {
      const node = doc.paragraphs[0];
      assert(node);
      applyWriterParagraphList(node, { kind: "numbered", level: 9, listId: "Fallback" });
      const rule = node.GetNumRule();
      assert(rule);
      rule.SetByPointer(9, undefined);
      expect(rule.GetNumFormat(9)).toBeUndefined();
      exporter.ExportDocument();
      const controls = output.ParaNumRule_Impl(node, 9, exporter.GetNumberingId(rule) + 1);
      expect(controls).toContain("\\ilvl8{\\*\\soutlvl9}");
      expect(controls).toContain(`\\ls${exporter.GetNumberingId(rule) + 1} `);
      expect(rule.GetNumFormat(9)).toBeUndefined();
    },
  );
});
