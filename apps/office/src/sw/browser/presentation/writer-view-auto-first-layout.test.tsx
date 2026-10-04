/** @fileoverview Checks authored first-line items and resolved automatic layout across the real Writer boundary. */
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  SvxFirstLineIndentItem,
  SvxRightMarginItem,
  SvxTextLeftMarginItem,
} from "../../../editeng/source/items/frmitems";
import {
  SvxLineSpacingItem,
  type SvxLineSpacingMode,
} from "../../../editeng/source/items/paraitem";
import { SvxFontHeightItem } from "../../../editeng/source/items/textitem";
import {
  RES_CHRATR_FONTSIZE,
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_RIGHT,
  RES_MARGIN_TEXTLEFT,
  RES_PARATR_LINESPACING,
} from "../../inc/hintids";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterEditableParagraph } from "../editor/WriterEditableParagraph";
import { WriterWorkbench } from "./writer-view";
import { WriterViewStore } from "./writer-view-projection";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
const stores: WriterViewStore[] = [];
afterEach(
  /** Releases mounted browser descendants before canonical owners. @returns Nothing. */ () => {
    cleanup();
    for (const store of stores.splice(0)) store.Close();
    for (const session of sessions.splice(0)) session.Close();
  },
);

/** Creates actual direct or inherited automatic paragraph items. @param disregard - Existing line-space compatibility flag. @param mode - Supported spacing mode. @param value - Raw spacing rule. @param inherited - Put all items in the style. @returns Model and frozen presentation owners. */
function fixture(
  disregard = true,
  mode: SvxLineSpacingMode = "proportional",
  value = 100,
  inherited = false,
) {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const shell = session.view.GetWrtShell();
  shell.Insert("AutomaticLayoutProof");
  session.docShell
    .GetDoc()
    .GetDocumentSettingManager()
    .set("AUTO_FIRST_LINE_INDENT_DISREGARD_LINE_SPACE", disregard);
  const items = [
    new SvxFirstLineIndentItem(367, RES_MARGIN_FIRSTLINE, true),
    new SvxTextLeftMarginItem(487, RES_MARGIN_TEXTLEFT),
    new SvxRightMarginItem(240, RES_MARGIN_RIGHT),
    new SvxFontHeightItem(240, RES_CHRATR_FONTSIZE),
    new SvxLineSpacingItem(value, RES_PARATR_LINESPACING, mode),
  ];
  if (inherited)
    for (const item of items) session.docShell.GetDoc().GetDfltTextFormatColl().SetFormatAttr(item);
  else shell.SetParagraphItems(items);
  const store = new WriterViewStore(session.view);
  stores.push(store);
  return { session, shell, store };
}

/** Reads effective and direct complete typed state without resolving away authored values. @param owner - Actual Writer owners. @returns Complete state. */
function state(owner: ReturnType<typeof fixture>) {
  const node = owner.shell.GetActiveParagraph();
  const which = [
    RES_MARGIN_FIRSTLINE,
    RES_MARGIN_TEXTLEFT,
    RES_MARGIN_RIGHT,
    RES_CHRATR_FONTSIZE,
    RES_PARATR_LINESPACING,
  ];
  return {
    effective: which.map(
      /** Queries the complete effective item. @param id - Which identity. @returns Value. */ (
        id,
      ) => node.GetAttr(id).QueryValue(),
    ),
    direct: which.map(
      /** Distinguishes direct items from inheritance. @param id - Which identity. @returns Direct value or absence. */ (
        id,
      ) => node.GetpSwAttrSet()?.GetItemIfSet(id, false)?.QueryValue() ?? null,
    ),
    text: node.GetText(),
  };
}

describe("Writer automatic first-line layout", /** Groups native literal contracts and actual browser transitions. @returns Nothing. */ () => {
  for (const inherited of [false, true])
    for (const profile of [
      { disregard: true, mode: "proportional", value: 200, twips: 480 },
      { disregard: true, mode: "fixed", value: 700, twips: 480 },
      { disregard: true, mode: "minimum", value: 800, twips: 480 },
      { disregard: true, mode: "leading", value: 60, twips: 480 },
      { disregard: false, mode: "proportional", value: 0, twips: 480 },
      { disregard: false, mode: "proportional", value: 25, twips: 240 },
      { disregard: false, mode: "proportional", value: 50, twips: 240 },
      { disregard: false, mode: "proportional", value: 151, twips: 724 },
      { disregard: false, mode: "fixed", value: 321, twips: 321 },
      { disregard: false, mode: "minimum", value: 300, twips: 480 },
      { disregard: false, mode: "minimum", value: 701, twips: 701 },
      { disregard: false, mode: "leading", value: 61, twips: 541 },
    ] as const)
      it(`resolves ${profile.mode}/${profile.value} disregard=${profile.disregard} inherited=${inherited}`, /** Checks independently expected layout while retaining raw flags, history and ownership. @returns Nothing. */ function resolvesAutomaticLayout() {
        const owner = fixture(profile.disregard, profile.mode, profile.value, inherited);
        const before = state(owner);
        const history = owner.session.docShell.GetUndoManager().GetUndoActionCount();
        const generation = owner.session.docShell.GetContentGeneration();
        const projected = owner.store.GetSnapshot().activeParagraph;
        expect(owner.shell.GetActiveParagraph().GetParagraphFirstLineIndent()).toBe(profile.twips);
        expect(projected.computedStyle.resolvedFirstLineIndentPt).toBe(profile.twips / 20);
        expect(projected.computedStyle.firstLineIndentPt).toBe(18.35);
        expect(projected.computedStyle.autoFirstLineIndent).toBe(true);
        expect(Object.isFrozen(projected.computedStyle)).toBe(true);
        render(
          <WriterEditableParagraph
            index={0}
            isActive
            paragraph={projected}
            listMarker={undefined}
            retainElement={/** Keeps test rendering read-only. @returns Nothing. */ () => undefined}
          />,
        );
        expect(screen.getByRole("textbox")).toHaveStyle({
          textIndent: `${profile.twips / 20}pt`,
          marginInlineStart: "24.35pt",
        });
        expect(state(owner)).toEqual(before);
        expect(before.effective[0]).toEqual([367, 1]);
        expect(owner.session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history);
        expect(owner.session.docShell.GetContentGeneration()).toBe(generation);
        if (inherited) expect(owner.shell.GetActiveParagraph().GetpSwAttrSet()).toBeUndefined();
      });

  for (const raw of [-367, 367])
    it(`retains manual signed ${raw} independently of line-space compatibility`, /** Checks manual values are authored rather than font-computed. @returns Nothing. */ function resolvesManualLayout() {
      const owner = fixture(false, "fixed", 701);
      owner.shell.SetParagraphItems([new SvxFirstLineIndentItem(raw, RES_MARGIN_FIRSTLINE)]);
      const projected = owner.store.GetSnapshot().activeParagraph;
      expect(owner.shell.GetActiveParagraph().GetParagraphFirstLineIndent()).toBe(raw);
      expect(projected.computedStyle.resolvedFirstLineIndentPt).toBe(raw / 20);
      expect(projected.computedStyle.firstLineIndentPt).toBe(raw / 20);
      expect(projected.computedStyle.autoFirstLineIndent).toBe(false);
    });

  for (const kind of ["numbered", "bullet"] as const)
    it(`keeps ${kind} geometry outside automatic paragraph layout`, /** Checks native rule presence bypasses automatic computation and browser list precedence stays intact. @returns Nothing. */ function bypassesNumberedAutoLayout() {
      const owner = fixture(false, "leading", 900);
      expect(owner.shell.SetParagraphListKind(kind)).toBe(true);
      const projected = owner.store.GetSnapshot().activeParagraph;
      expect(owner.shell.GetActiveParagraph().GetParagraphFirstLineIndent()).toBe(367);
      expect(projected.computedStyle.resolvedFirstLineIndentPt).toBe(18.35);
      render(
        <WriterEditableParagraph
          index={0}
          isActive
          paragraph={projected}
          listMarker={projected.listMarker}
          retainElement={/** Keeps test rendering read-only. @returns Nothing. */ () => undefined}
        />,
      );
      expect(screen.getByRole("textbox").style.textIndent).toBe("");
      expect(projected.listLayout).toBeDefined();
      expect(projected.computedStyle.autoFirstLineIndent).toBe(true);
    });

  it("reprojects font-dependent layout through grouped item Undo and Redo without changing the raw tuple", /** Checks actual font-size item history, no-op and frozen retained values. @returns Nothing. */ function tracksAutomaticFontLayout() {
    const owner = fixture(true, "fixed", 701, true);
    const before = state(owner);
    const retained = owner.store.GetSnapshot().activeParagraph;
    const history = owner.session.docShell.GetUndoManager().GetUndoActionCount();
    expect(owner.shell.SetParagraphItems([new SvxFontHeightItem(360, RES_CHRATR_FONTSIZE)])).toBe(
      true,
    );
    const after = state(owner);
    expect(owner.store.GetSnapshot().activeParagraph.computedStyle.resolvedFirstLineIndentPt).toBe(
      36,
    );
    expect(owner.store.GetSnapshot().activeParagraph.computedStyle.firstLineIndentPt).toBe(18.35);
    expect(after.effective[0]).toEqual([367, 1]);
    expect(after.effective.slice(0, 3)).toEqual(before.effective.slice(0, 3));
    expect(retained.computedStyle.resolvedFirstLineIndentPt).toBe(24);
    expect(retained.computedStyle.firstLineIndentPt).toBe(18.35);
    expect(owner.session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history + 1);
    expect(owner.shell.SetParagraphItems([new SvxFontHeightItem(360, RES_CHRATR_FONTSIZE)])).toBe(
      false,
    );
    expect(owner.shell.Undo()).toBe(true);
    expect(state(owner)).toEqual(before);
    expect(owner.store.GetSnapshot().activeParagraph.computedStyle.resolvedFirstLineIndentPt).toBe(
      24,
    );
    expect(owner.shell.GetActiveParagraph().GetpSwAttrSet()).toBeUndefined();
    expect(owner.shell.Redo()).toBe(true);
    expect(state(owner)).toEqual(after);
    expect(owner.store.GetSnapshot().activeParagraph.computedStyle.resolvedFirstLineIndentPt).toBe(
      36,
    );
  });

  it("uses zero first-line layout for follows and raw fallback for detached older DTOs", /** Checks first-line-only drawing without changing existing detached contracts. @returns Nothing. */ function drawsFirstLineAndFollow() {
    const owner = fixture();
    const projected = owner.store.GetSnapshot().activeParagraph;
    const props = {
      index: 0,
      isActive: true,
      paragraph: projected,
      listMarker: undefined,
      retainElement: /** Keeps test rendering read-only. @returns Nothing. */ () => undefined,
    };
    const { rerender } = render(<WriterEditableParagraph {...props} />);
    expect(screen.getByRole("textbox").style.textIndent).toBe("24pt");
    rerender(<WriterEditableParagraph {...props} isFollow fragmentStart={5} />);
    expect(screen.getByRole("textbox").style.textIndent).toBe("0pt");
    const computedStyle = { ...projected.computedStyle };
    delete computedStyle.resolvedFirstLineIndentPt;
    rerender(<WriterEditableParagraph {...props} paragraph={{ ...projected, computedStyle }} />);
    expect(screen.getByRole("textbox").style.textIndent).toBe("18.35pt");
    expect(projected.computedStyle.resolvedFirstLineIndentPt).toBe(24);
  });

  it("keeps authored dialog and ruler state separate from automatic body layout through Undo and Redo", /** Checks the actual workbench toggles mode and retains both primitive values. @returns Completion. */ async function togglesAuthoredAndResolvedLayout() {
    const owner = fixture();
    const before = state(owner);
    const retained = owner.store.GetSnapshot().activeParagraph;
    render(<WriterWorkbench isActive view={owner.session.view} />);
    expect(screen.getByRole("textbox", { name: "Writer document text" }).style.textIndent).toBe(
      "24pt",
    );
    expect(screen.queryByRole("button", { name: "First line indent" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Format" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Paragraph…" }));
    expect(screen.getByLabelText("First line indent (pt)")).toHaveValue(18.35);
    fireEvent.click(screen.getByLabelText("Automatic first-line indent"));
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    await waitFor(
      /** Waits for dialog acceptance and its immutable projection. @returns Nothing. */ () =>
        expect(screen.queryByRole("dialog", { name: "Paragraph" })).toBeNull(),
    );
    expect(screen.getByRole("textbox", { name: "Writer document text" }).style.textIndent).toBe(
      "18.35pt",
    );
    expect(screen.getByRole("button", { name: "First line indent" })).toBeInTheDocument();
    act(
      /** Restores automatic body layout with precise authored item. @returns Nothing. */ () => {
        expect(owner.shell.Undo()).toBe(true);
      },
    );
    expect(state(owner)).toEqual(before);
    expect(screen.getByRole("textbox", { name: "Writer document text" }).style.textIndent).toBe(
      "24pt",
    );
    act(
      /** Reapplies manual authoring without mutating retained DTOs. @returns Nothing. */ () => {
        expect(owner.shell.Redo()).toBe(true);
      },
    );
    expect(screen.getByRole("textbox", { name: "Writer document text" }).style.textIndent).toBe(
      "18.35pt",
    );
    expect(retained.computedStyle.resolvedFirstLineIndentPt).toBe(24);
    expect(retained.computedStyle.firstLineIndentPt).toBe(18.35);
  });
});
