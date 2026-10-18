/** @fileoverview Verifies paragraph dialog leading and minimum line spacing through real Writer shell items and history. */
import { expect, it } from "vitest";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import { SvxLineSpaceRule } from "../../../../editeng/inc/svxenum";
import { RES_PARATR_LINESPACING } from "../../../inc/hintids";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { createWriterDocument } from "../../core/doc/doc";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "../wrtsh/wrtsh1";
import type { WriterParagraphFormatValue } from "./textsh1";

it("keeps leading separate from minimum paragraph line height", /** Exercises accepted dialog values rather than directly setting pooled items. @returns Nothing. */ () => {
  const shell = new SwWrtShell(
    new SwDocShell(
      createWriterDocument(),
      createDocument({ id: "line-modes", suiteId: "writer", title: "Line modes" }),
    ),
  );
  try {
    const commands = shell.GetCommandShell();
    const slot = commands.GetInterface().GetSlot(WRITER_COMMAND_IDS.paragraphDialog);
    if (slot === undefined) throw new Error("Missing paragraph slot");
    const base = commands.ResolveSlot(slot.slotId)?.getState().value as WriterParagraphFormatValue;
    expect(shell.ApplyParagraphFormat({ ...base, lineMode: "leading", lineValue: 120 })).toBe(true);
    expect(
      (
        shell.GetActiveParagraph().GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem
      ).GetInterLineSpace(),
    ).toBe(120);
    expect(shell.ApplyParagraphFormat({ ...base, lineMode: "minimum", lineValue: 320 })).toBe(true);
    const item = shell.GetActiveParagraph().GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem;
    expect(item.GetLineHeight()).toBe(320);
    expect(item.GetLineSpaceRule()).toBe(SvxLineSpaceRule.Min);
  } finally {
    shell.GetDocShell().Close();
  }
});
