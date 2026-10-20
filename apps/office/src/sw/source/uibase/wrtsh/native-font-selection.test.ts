/** @fileoverview Real Writer shared selection preserves native font metadata and unrelated attribute values. */
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SvxFontItem, SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { FontFamily, FontPitch, FontWeight } from "../../../../tools/inc/fontenum";
import { RTL_TEXTENCODING_SYMBOL } from "../../../../sal/inc/rtl/textenc";
import {
  RES_CHRATR_FONT,
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CTL_FONT,
  RES_CHRATR_WEIGHT,
} from "../../../inc/hintids";
import { SwPosition } from "../../core/crsr/pam";
import { SwUndoResetAttr } from "../../core/undo/unattr";
import { SwWrtShell } from "./wrtsh1";
import { SwDocShell } from "../app/docsh";
import { createWriterDocument } from "../../core/doc/doc";
import { createDocument } from "../../../../sfx2/source/doc/objsh";

it("applies complete toolbox metadata without flattening existing direct weights and restores both histories", /** Applies complete toolbox metadata without flattening existing direct weights and restores both histories. @returns Operation result. */ () => {
  const session = createWriterDocumentSession(),
    shell = session.view.GetWrtShell();
  try {
    shell.Insert("abcd");
    const node = shell.GetActiveParagraph();
    node.SetAttr(new SvxWeightItem(FontWeight.WEIGHT_SEMIBOLD, RES_CHRATR_WEIGHT));
    shell.SetPaM(new SwPosition(node, 3), new SwPosition(node, 1));
    const font = new SvxFontItem(
      FontFamily.FAMILY_DECORATIVE,
      "Native Symbols",
      "Display",
      FontPitch.PITCH_FIXED,
      RTL_TEXTENCODING_SYMBOL,
      10007,
    );
    expect(shell.SetFontFamily(font)).toBe(true);
    for (const which of [RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT])
      expect((node.GetCharacterItemsAt(2).Get(which) as SvxFontItem).QueryValue()).toEqual(
        font.QueryValue(),
      );
    expect((node.GetCharacterItemsAt(2).Get(RES_CHRATR_WEIGHT) as SvxWeightItem).GetWeight()).toBe(
      FontWeight.WEIGHT_SEMIBOLD,
    );
    expect(shell.SetFontFamily(font)).toBe(false);
    expect(shell.Undo()).toBe(true);
    expect(
      (node.GetCharacterItemsAt(2).Get(RES_CHRATR_FONT) as SvxFontItem).GetFamilyName(),
    ).not.toBe("Native Symbols");
    expect(shell.Redo()).toBe(true);
    expect((node.GetCharacterItemsAt(2).Get(RES_CHRATR_FONT) as SvxFontItem).QueryValue()).toEqual(
      font.QueryValue(),
    );
    expect(
      (shell.GetPendingCharacterItems().Get(RES_CHRATR_FONT) as SvxFontItem).QueryValue(),
    ).toEqual(font.QueryValue());
  } finally {
    session.Close();
  }
});

it("retains native font fragments through ordinary paste and paragraph flow changes", /** Checks font ownership when shared paragraph commands accompany character formatting. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    shell = session.view.GetWrtShell();
  try {
    const font = new SvxFontItem(
      FontFamily.FAMILY_ROMAN,
      "Paste Face",
      "Book",
      FontPitch.PITCH_FIXED,
      RTL_TEXTENCODING_SYMBOL,
      10007,
    );
    shell.SetFontFamily(font);
    const node = shell.GetActiveParagraph(),
      fragment = node.CreateTextFragmentFromText("pasted", shell.GetPendingCharacterItems());
    expect(
      shell.PasteAtCursor({
        isBlock: false,
        paragraphs: [{ fragment, listKind: "none", listLevel: 0 }],
      }),
    ).toBe(true);
    expect((node.GetCharacterItemsAt(2).Get(RES_CHRATR_FONT) as SvxFontItem).QueryValue()).toEqual(
      font.QueryValue(),
    );
    const textShell = shell.GetTextShell(),
      base = textShell.GetParagraphFormat();
    expect(shell.ApplyParagraphFormat({ ...base, breakBefore: "page", breakAfter: "page" })).toBe(
      true,
    );
    expect(textShell.GetParagraphFormat()).toMatchObject({
      breakBefore: "page",
      breakAfter: "page",
    });
    expect(textShell.ChangeParagraphIndent(true)).toBe(true);
    expect((node.GetCharacterItemsAt(2).Get(RES_CHRATR_FONT) as SvxFontItem).QueryValue()).toEqual(
      font.QueryValue(),
    );
  } finally {
    session.Close();
  }
});

it("keeps complete pending font values while changing caret formatting before typing", /** Verifies pending item ownership without requiring a selected text range. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    shell = session.view.GetWrtShell();
  try {
    const font = new SvxFontItem(
      FontFamily.FAMILY_ROMAN,
      "Pending Face",
      "Book",
      FontPitch.PITCH_FIXED,
      RTL_TEXTENCODING_SYMBOL,
      10007,
    );
    expect(shell.SetFontFamily(font)).toBe(false);
    expect(shell.ToggleCharacterFormat("bold")).toBe(false);
    expect(shell.GetTextShell().GetCharacterFormatState("bold")).toBe("on");
    expect(shell.SetCharacterColor("color", "#334455")).toBe(false);
    expect(shell.SetCharacterColor("highlight", "#556677")).toBe(false);
    expect(shell.SetFontSize(14)).toBe(false);
    expect(shell.Insert("x")).toBe(true);
    expect(
      (
        shell.GetActiveParagraph().GetCharacterItemsAt(1).Get(RES_CHRATR_FONT) as SvxFontItem
      ).QueryValue(),
    ).toEqual(font.QueryValue());
  } finally {
    session.Close();
  }
  const standalone = new SwWrtShell(
    new SwDocShell(
      createWriterDocument(),
      createDocument({ id: "native-font-no-view", suiteId: "writer", title: "Font" }),
    ),
  );
  try {
    expect(
      /** Rejects a view-dependent operation without a view. @returns View. */ () =>
        standalone.GetView(),
    ).toThrow(/no attached/);
  } finally {
    standalone.Close();
  }
});

it("retains reset history payload and rejects foreign or invalid font cursor contexts", /** Exercises actual history ownership and cursor admission around font commands. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    other = createWriterDocumentSession(),
    shell = session.view.GetWrtShell();
  try {
    shell.Insert("font");
    const node = shell.GetActiveParagraph();
    shell.SetPaM(new SwPosition(node, 4), new SwPosition(node, 0));
    shell.SetFontFamily(
      new SvxFontItem(
        FontFamily.FAMILY_ROMAN,
        "Retained Face",
        "Book",
        FontPitch.PITCH_FIXED,
        RTL_TEXTENCODING_SYMBOL,
        10007,
      ),
    );
    shell.ToggleCharacterFormat("underline");
    shell.ToggleCharacterFormat("underline");
    const textShell = shell.GetTextShell();
    expect(textShell.Undo()).toBe(true);
    expect(textShell.Redo()).toBe(true);
    const reset = new SwUndoResetAttr(shell.GetCursor(), shell.CaptureCursorState());
    expect(reset.GetPayloadSize()).toBeGreaterThan(0);
    reset.ApplyExact();
    expect(reset.GetPayloadSize()).toBeGreaterThan(0);
    expect(
      /** Rejects a cursor before native text. @returns Item snapshot. */ () =>
        node.GetCharacterItemsAt(-1),
    ).toThrow(/outside/);
    expect(
      shell.UpdateCursor(new SwPosition(other.view.GetWrtShell().GetActiveParagraph(), 0)),
    ).toBe(false);
    expect(
      shell.UpdateCursor(
        new SwPosition(node, 0),
        new SwPosition(other.view.GetWrtShell().GetActiveParagraph(), 0),
      ),
    ).toBe(false);
  } finally {
    session.Close();
    other.Close();
  }
});

it("reads inherited native font values into the shared family binding and pending snapshot", /** Verifies paragraph attributes remain visible without a browser font reconstruction. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    shell = session.view.GetWrtShell();
  try {
    shell.Insert("text");
    const node = shell.GetActiveParagraph();
    const font = new SvxFontItem(
      FontFamily.FAMILY_ROMAN,
      "Inherited Face",
      "Book",
      FontPitch.PITCH_FIXED,
      RTL_TEXTENCODING_SYMBOL,
      RES_CHRATR_FONT,
    );
    node.SetAttr(font);
    shell.SetPaM(new SwPosition(node, 2));
    expect(
      (shell.GetPendingCharacterItems().Get(RES_CHRATR_FONT) as SvxFontItem).QueryValue(),
    ).toEqual(font.QueryValue());
    expect(session.view.GetViewFrame().GetBindings().QueryState(".uno:CharFontName").value).toBe(
      "Inherited Face",
    );
  } finally {
    session.Close();
  }
});

it("retains complete font items when other character commands update the same selection", /** Checks that shared formatting operations apply native deltas rather than rebuilding fonts. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    shell = session.view.GetWrtShell();
  try {
    shell.Insert("abcd");
    const node = shell.GetActiveParagraph();
    shell.SetPaM(new SwPosition(node, 3), new SwPosition(node, 1));
    const font = new SvxFontItem(
      FontFamily.FAMILY_DECORATIVE,
      "Native Symbols",
      "Display",
      FontPitch.PITCH_FIXED,
      RTL_TEXTENCODING_SYMBOL,
      10007,
    );
    shell.SetFontFamily(font);
    const operations = [
      /** Applies the actual font-height command. @returns Changed. */ () => shell.SetFontSize(14),
      /** Applies the actual weight command. @returns Changed. */ () =>
        shell.ToggleCharacterFormat("bold"),
      /** Applies the actual posture command. @returns Changed. */ () =>
        shell.ToggleCharacterFormat("italic"),
      /** Applies the actual underline command. @returns Changed. */ () =>
        shell.ToggleCharacterFormat("underline"),
      /** Applies the existing foreground boundary. @returns Changed. */ () =>
        shell.SetCharacterColor("color", "#334455"),
      /** Applies the existing highlight boundary. @returns Changed. */ () =>
        shell.SetCharacterColor("highlight", "#556677"),
    ];
    for (const operation of operations) {
      expect(operation()).toBe(true);
      for (const which of [RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT]) {
        expect((node.GetCharacterItemsAt(2).Get(which) as SvxFontItem).QueryValue()).toEqual(
          font.QueryValue(),
        );
        expect((shell.GetPendingCharacterItems().Get(which) as SvxFontItem).QueryValue()).toEqual(
          font.QueryValue(),
        );
      }
      expect(shell.Undo()).toBe(true);
      expect(shell.Redo()).toBe(true);
      expect(
        (node.GetCharacterItemsAt(2).Get(RES_CHRATR_FONT) as SvxFontItem).QueryValue(),
      ).toEqual(font.QueryValue());
    }
  } finally {
    session.Close();
  }
});
