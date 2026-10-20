/** @fileoverview Source-contract checks for actual native string replacement, search history/no-ring progression and threshold behavior. */
import { expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { FIND_NO_RING, type SwFindParas } from "./swcrsr";
import { SwPaM, SwPosition } from "./pam";
import { SearchOptions2 } from "../../../../i18nutil/inc/searchopt";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { FindRanges, SwDocPositions } from "../../../inc/cshtyp";
import { SwUndoReplace } from "../undo/unins";
import { SfxListUndoAction } from "../../../../svl/source/undo/undo";
import type { SwTextNode } from "../txtnode/ndtxt";

/** Converts Writer UTF-16 strings to real shared search values. @param text - Source value. @returns Native value. */
function string(text: string): OUString {
  const units = Uint16Array.from(
    text.split(""),
    /** Encodes one unit. @param c - Unit. @returns Number. */ (c) => c.charCodeAt(0),
  );
  return new OUString(units, units.length);
}
/** Builds actual native model, shell, cursor and history owners. @param text - Initial paragraph. @returns Existing owners. */
function fixture(text: string) {
  const doc = new SwDoc(),
    node = doc.paragraphs[0] as SwTextNode;
  node.SetText(text);
  const docShell = new SwDocShell(
      doc,
      createDocument({ id: "replace", suiteId: "writer", title: "Replace" }),
    ),
    shell = new SwWrtShell(docShell);
  return { doc, node, docShell, shell };
}
/** Creates a marked native range, disposing temporary indices. @param node - Real text node. @param low - Start. @param high - End. @returns Native backward range. */
function range(node: SwTextNode, low: number, high: number): SwPaM {
  const start = new SwPosition(node, low),
    end = new SwPosition(node, high);
  try {
    return new SwPaM(start, end);
  } finally {
    start.Dispose();
    end.Dispose();
  }
}
/** Executes the actual native search entry point. @param shell - Actual cursor shell. @param search - Pattern. @param replacement - Native literal replacement. @param backward - Direction. @param selected - Restrict to selected ranges. @param algorithm - Native shared search algorithm. @returns Match count. */
function replaceAll(
  shell: SwWrtShell,
  search: string,
  replacement: string,
  backward = false,
  selected = false,
  algorithm = 1,
): number {
  const options = new SearchOptions2();
  options.AlgorithmType2 = algorithm;
  options.searchString.assign(string(search));
  options.replaceString.assign(string(replacement));
  return shell
    .GetCursor()
    .Find_Text(
      options,
      false,
      backward ? SwDocPositions.End : SwDocPositions.Start,
      backward ? SwDocPositions.Start : SwDocPositions.End,
      [false],
      FindRanges.InSelAll | (selected ? FindRanges.InSel : FindRanges.InBodyOnly),
      true,
    );
}
it.each([false, true])(
  "replaces matching text once and keeps original native SetEnd/undo coordinates backward=%s",
  /** Repeats real undo/redo without synthetic document snapshots. @param backward - Direction. @returns Nothing. */ (
    backward,
  ) => {
    const f = fixture("cat x cat");
    try {
      expect(replaceAll(f.shell, "cat", "catcat", backward)).toBe(2);
      expect(f.node.GetText()).toBe("catcat x catcat");
      const history = f.doc.GetUndoManager().GetUndoAction();
      expect(history).toBeInstanceOf(SfxListUndoAction);
      expect((history as SfxListUndoAction<unknown>).GetActionCount()).toBe(2);
      expect([...f.shell.GetCursor().GetRingContainer()]).toHaveLength(1);
      expect(f.docShell.IsModified()).toBe(true);
      for (let cycle = 0; cycle < 3; cycle++) {
        expect(f.shell.Undo()).toBe(true);
        expect(f.node.GetText()).toBe("cat x cat");
        expect(f.docShell.IsModified()).toBe(false);
        expect(f.shell.Redo()).toBe(true);
        expect(f.node.GetText()).toBe("catcat x catcat");
        expect(f.docShell.IsModified()).toBe(true);
      }
    } finally {
      f.shell.Close();
      f.docShell.Close();
    }
  },
);
it("uses native replacement success/count semantics even for identical strings", /** Does not import fragment no-op behavior into normal ReplaceRange. @returns Nothing. */ () => {
  const f = fixture("a a");
  try {
    expect(replaceAll(f.shell, "a", "a")).toBe(2);
    expect(f.node.GetText()).toBe("a a");
    expect(f.docShell.IsModified()).toBe(true);
    expect(
      (f.doc.GetUndoManager().GetUndoAction() as SfxListUndoAction<unknown>).GetActionCount(),
    ).toBe(2);
    expect(f.shell.Undo()).toBe(true);
    expect(f.docShell.IsModified()).toBe(false);
    const oldCount = f.doc.GetUndoManager().GetUndoActionCount();
    expect(replaceAll(f.shell, "missing", "new")).toBe(0);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(oldCount);
  } finally {
    f.shell.Close();
    f.docShell.Close();
  }
});
it("honors registered selected limits while replacement length grows", /** Limits search to the original selected characters, using live native indices. @returns Nothing. */ () => {
  const f = fixture("aa aa"),
    selected = range(f.node, 0, 2);
  try {
    f.shell.SetPaM(selected.GetPoint(), selected.GetMark());
    expect(replaceAll(f.shell, "a", "A!", false, true)).toBe(2);
    expect(f.node.GetText()).toBe("A!A! aa");
    expect(f.shell.Undo()).toBe(true);
    expect(f.node.GetText()).toBe("aa aa");
    expect(f.shell.Redo()).toBe(true);
    expect(f.node.GetText()).toBe("A!A! aa");
  } finally {
    selected.Dispose();
    f.shell.Close();
    f.docShell.Close();
  }
});
it("searches/replaces actual table-cell content and keeps one history command", /** Retains source cell/paragraph owners and outside content. @returns Nothing. */ () => {
  const f = fixture("body"),
    table = f.doc.nodes.MakeTableNode("Replace cells", {}, f.node);
  table.AddColumnWidth(3000);
  const cells = [0, 1].map(
    /** Creates a native cell. @returns Native paragraph. */ () =>
      f.doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0] as SwTextNode,
  );
  for (const cell of cells) cell.SetText("x cat y");
  try {
    expect(replaceAll(f.shell, "cat", "dog")).toBe(2);
    expect(
      cells.map(
        /** Reads native cell values. @param cell - Cell paragraph. @returns Text. */ (cell) =>
          cell.GetText(),
      ),
    ).toEqual(["x dog y", "x dog y"]);
    expect(f.node.GetText()).toBe("body");
    expect(f.shell.Undo()).toBe(true);
    expect(cells[0]?.GetText()).toBe("x cat y");
    expect(cells[1]?.GetText()).toBe("x cat y");
    expect(f.shell.Redo()).toBe(true);
    expect(cells[1]?.GetText()).toBe("x dog y");
  } finally {
    f.shell.Close();
    f.docShell.Close();
  }
});
it("records source strings/actual end and restores whole-node hints on the first undo", /** Preserves the native consumed-history behavior on later cycles rather than resetting TmpEnd. @returns Nothing. */ () => {
  const f = fixture("abc");
  f.node.ToggleTextRangeFormat(0, 3, "bold");
  const selected = range(f.node, 1, 2),
    capacity = vi.spyOn(f.node, "GetSpaceLeft").mockReturnValue(0);
  try {
    expect(f.doc.GetDocumentContentOperationsManager().ReplaceRange(selected, "LONG", false)).toBe(
      true,
    );
    expect(f.node.GetText()).toBe("aLc");
    expect(f.doc.GetUndoManager().GetUndoAction()).toBeInstanceOf(SwUndoReplace);
    expect([selected.GetPoint().GetContentIndex(), selected.GetMark().GetContentIndex()]).toEqual([
      1, 2,
    ]);
    expect(f.shell.Undo()).toBe(true);
    expect(f.node.GetText()).toBe("abc");
    expect(f.node.GetpSwpHints()?.Count()).toBeGreaterThan(0);
    expect(f.shell.Redo()).toBe(true);
    expect(f.node.GetText()).toBe("aLc");
    expect(f.shell.Undo()).toBe(true);
    expect(f.node.GetText()).toBe("abc");
    expect(f.node.GetpSwpHints()?.Count() ?? 0).toBe(0);
  } finally {
    capacity.mockRestore();
    selected.Dispose();
    f.shell.Close();
    f.docShell.Close();
  }
});
it("preserves native content-node progress when an empty replacement leaves the region boundary unchanged", /** Exercises the source GoNextPos/GoPreviousPos branches, including their zero offset. @returns Nothing. */ () => {
  const f = fixture("aa"),
    next = f.doc.nodes.MakeTextNode("next");
  try {
    expect(replaceAll(f.shell, "a", "")).toBe(1);
    expect(f.node.GetText()).toBe("a");
    expect(next.GetText()).toBe("next");
    expect(f.shell.Undo()).toBe(true);
    expect(f.node.GetText()).toBe("aa");
    expect(f.shell.Redo()).toBe(true);
    expect(f.node.GetText()).toBe("a");
  } finally {
    f.shell.Close();
    f.docShell.Close();
  }
  const last = fixture("aaa");
  try {
    expect(replaceAll(last.shell, "a", "")).toBe(3);
    expect(last.node.GetText()).toBe("");
    expect(last.shell.Undo()).toBe(true);
    expect(last.node.GetText()).toBe("aaa");
  } finally {
    last.shell.Close();
    last.docShell.Close();
  }
});
it("handles no-mark, empty marked and unsupported regex ranges before partial mutation", /** Verifies native success/modified behavior for empty marked replacements and explicit unsupported boundaries. @returns Nothing. */ () => {
  const f = fixture("abc"),
    selected = range(f.node, 1, 1),
    collapsed = new SwPaM(selected.GetPoint());
  try {
    const manager = f.doc.GetDocumentContentOperationsManager();
    expect(manager.ReplaceRange(collapsed, "x", false)).toBe(false);
    expect(manager.ReplaceRange(selected, "", false)).toBe(true);
    expect(f.node.GetText()).toBe("abc");
    expect(f.docShell.IsModified()).toBe(true);
    expect(f.shell.Undo()).toBe(true);
    expect(f.node.GetText()).toBe("abc");
    expect(
      /** Rejects unported regex replacement before modifying history. @returns Native success. */ () =>
        manager.ReplaceRange(selected, "x", true),
    ).toThrow("regex replacement");
  } finally {
    selected.Dispose();
    collapsed.Dispose();
    f.shell.Close();
    f.docShell.Close();
  }
});
it("rejects unported bookmark replacement history before changing content or undo", /** Keeps a valid existing bookmark graph intact until native DelContentIndex/SwHistoryBookmark is ported. @returns Nothing. */ () => {
  const f = fixture("a a");
  f.doc.GetIDocumentMarkAccess().MakeMark(f.node, 1, "native mark");
  const selected = range(f.node, 0, 1);
  try {
    expect(
      /** Attempts a source responsibility not yet implemented. @returns Match count. */ () =>
        replaceAll(f.shell, "a", "x"),
    ).toThrow("bookmark replacement history");
    expect(
      /** Attempts the same unsupported direct document operation. @returns Native success. */ () =>
        f.doc.GetDocumentContentOperationsManager().ReplaceRange(selected, "x", false),
    ).toThrow("bookmark replacement history");
    expect(f.node.GetText()).toBe("a a");
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    expect(f.doc.GetUndoManager().GetListActionDepth()).toBe(0);
  } finally {
    selected.Dispose();
    f.shell.Close();
    f.docShell.Close();
  }
});
it("retains backward native zero-offset previous-node progress after empty replacement", /** Mirrors GoPreviousPos(GetMark(),false) without replacing it by text-end or character movement. @returns Nothing. */ () => {
  const f = fixture("next"),
    last = f.doc.nodes.MakeTextNode("aa");
  try {
    expect(replaceAll(f.shell, "a", "", true)).toBe(1);
    expect(last.GetText()).toBe("a");
    expect(f.node.GetText()).toBe("next");
    expect(f.shell.GetCursor().GetMark().GetNode()).toBe(f.node);
    expect(f.shell.GetCursor().GetMark().GetContentIndex()).toBe(0);
    expect(f.shell.Undo()).toBe(true);
    expect(last.GetText()).toBe("aa");
    expect(f.shell.Redo()).toBe(true);
    expect(last.GetText()).toBe("a");
  } finally {
    f.shell.Close();
    f.docShell.Close();
  }
});
it.each([2, 0, 3])(
  "preserves native replacement threshold response %s",
  /** Uses the actual strategy virtual boundary to visit 60001 ranges without quadratic text searching; this is not a fake production backend. @param response - Native VCL reply. @returns Nothing. */ (
    response,
  ) => {
    const f = fixture("x".repeat(60001)),
      cursor = f.shell.GetCursor(),
      cancelled: [boolean] = [false];
    const reply = vi.spyOn(cursor, "MaxReplaceArived").mockReturnValue(response);
    let current = 0;
    const strategy: SwFindParas = {
      /** Marks the next existing native character. @param pam - Real working cursor. @returns Native no-ring result or exhaustion. */ DoFind(
        pam,
      ) {
        if (current >= 60001) return 0;
        pam.GetPoint().Assign(f.node, current);
        pam.SetMark();
        pam.GetPoint().SetContent(++current);
        return FIND_NO_RING;
      },
      /** Selects native replacement-threshold policy. @returns True. */ IsReplaceMode() {
        return true;
      },
    };
    try {
      expect(
        cursor.FindAll(
          strategy,
          SwDocPositions.Start,
          SwDocPositions.End,
          FindRanges.InSelAll,
          cancelled,
        ),
      ).toBe(response === 2 ? 60001 : 60000);
      expect(reply).toHaveBeenCalledTimes(1);
      expect(cancelled[0]).toBe(response === 0);
      expect(f.doc.GetUndoManager().DoesUndo()).toBe(true);
    } finally {
      reply.mockRestore();
      f.shell.Close();
      f.docShell.Close();
    }
  },
);

it.each([false, true])(
  "consumes the real wildcard backend through Writer replacement/history backward=%s",
  /** Backend wildcards still use literal native replacement and actual cursor/undo owners. @param backward - Direction. @returns Nothing. */ (
    backward,
  ) => {
    const f = fixture("cat cot cut");
    try {
      expect(replaceAll(f.shell, "c?t", "dog🌴", backward, false, 4)).toBe(3);
      expect(f.node.GetText()).toBe("dog🌴 dog🌴 dog🌴");
      expect([...f.shell.GetCursor().GetRingContainer()]).toHaveLength(1);
      expect(f.shell.Undo()).toBe(true);
      expect(f.node.GetText()).toBe("cat cot cut");
      expect(f.shell.Redo()).toBe(true);
      expect(f.node.GetText()).toBe("dog🌴 dog🌴 dog🌴");
    } finally {
      f.shell.Close();
      f.docShell.Close();
    }
  },
);
