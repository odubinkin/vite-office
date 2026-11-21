/** @fileoverview Source-contract checks for actual native string replacement, search history/no-ring progression and threshold behavior. */
import { expect, it, vi } from "vitest";
import { createBrowserRegexMatcher } from "../../../../i18npool/browser/regex-matcher";
import { REGEXP } from "../../../../offapi/com/sun/star/util/SearchAlgorithms2";
import { ReplaceBackReferences } from "./findtxt";
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
      expect(f.shell.GetCursor().HasMark()).toBe(true);
      expect(f.shell.GetCursor().GetPoint().compare(f.shell.GetCursor().GetMark())).toBe(0);
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
  for (const [index, cell] of cells.entries()) {
    cell.SetText("x cat y");
    f.doc.GetIDocumentMarkAccess().MakeMark(cell, 2, `cell ${index}`);
  }
  try {
    expect(replaceAll(f.shell, "cat", "dog")).toBe(2);
    expect(f.doc.GetIDocumentMarkAccess().GetBookmarks()).toHaveLength(0);
    expect(
      cells.map(
        /** Reads native cell values. @param cell - Cell paragraph. @returns Text. */ (cell) =>
          cell.GetText(),
      ),
    ).toEqual(["x dog y", "x dog y"]);
    expect(f.node.GetText()).toBe("body");
    expect(f.shell.Undo()).toBe(true);
    expect(cells[0]?.GetText()).toBe("x cat y");
    expect(
      f.doc
        .GetIDocumentMarkAccess()
        .GetBookmarks()
        .map(
          /** Reads restored real cell positions. @param mark - Actual native mark. @returns Source offset. */ (
            mark,
          ) => mark.GetMarkPos().GetContentIndex(),
        ),
    ).toEqual([2, 2]);
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
it("handles unmarked and empty marked ranges", /** Verifies native success and modified state for empty marked replacements. @returns Nothing. */ () => {
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
  } finally {
    selected.Dispose();
    collapsed.Dispose();
    f.shell.Close();
    f.docShell.Close();
  }
});
it.each([false, true])(
  "replaces text with ordinary bookmarks through grouped history backward=%s",
  /** Captures affected collapsed marks through either native traversal direction. @param backward - Native direction. @returns Nothing. */ (
    backward,
  ) => {
    const f = fixture("a a");
    f.doc.GetIDocumentMarkAccess().MakeMark(f.node, 0, "native mark");
    try {
      expect(replaceAll(f.shell, "a", "x", backward)).toBe(2);
      expect(f.node.GetText()).toBe("x x");
      expect(f.doc.GetIDocumentMarkAccess().FindMark("native mark")).toBeUndefined();
      expect(f.shell.Undo()).toBe(true);
      expect(f.node.GetText()).toBe("a a");
      expect(
        f.doc.GetIDocumentMarkAccess().FindMark("native mark")?.GetMarkPos().GetContentIndex(),
      ).toBe(0);
      expect(f.shell.Redo()).toBe(true);
      expect(f.doc.GetIDocumentMarkAccess().FindMark("native mark")).toBeUndefined();
      expect(f.doc.GetUndoManager().GetListActionDepth()).toBe(0);
    } finally {
      f.shell.Close();
      f.docShell.Close();
    }
  },
);
it("retains backward native zero-offset previous-node progress after empty replacement", /** Mirrors GoPreviousPos(GetMark(),false) without replacing it by text-end or character movement. @returns Nothing. */ () => {
  const f = fixture("next"),
    last = f.doc.nodes.MakeTextNode("aa");
  try {
    expect(replaceAll(f.shell, "a", "", true)).toBe(1);
    expect(last.GetText()).toBe("a");
    expect(f.node.GetText()).toBe("next");
    // lcl_FindSelection's no-ring fallback calls point-only Create(), then FindAll sets a mark.
    expect(f.shell.GetCursor().GetPoint().GetNode()).toBe(last);
    expect(f.shell.GetCursor().GetMark().GetNode()).toBe(last);
    expect(f.shell.GetCursor().GetPoint().GetContentIndex()).toBe(1);
    expect(f.shell.GetCursor().HasMark()).toBe(true);
    expect(f.shell.GetCursor().GetMark().GetContentIndex()).toBe(1);
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

it.each(["$", "^$", "$^"])(
  "uses the native paragraph-end match as a newline for %s",
  /** Exercises Writer's anchor-specific replacement branch without mocking captures. @param pattern - Native anchor spelling. @returns Nothing. */
  (pattern) => {
    const f = fixture("end");
    const selected = range(f.node, 3, 3);
    const options = new SearchOptions2();
    options.AlgorithmType2 = REGEXP;
    options.searchString.assign(string(pattern));
    options.replaceString.assign(string(String.raw`&:$${0}`));
    try {
      const replacement = ReplaceBackReferences(options, selected);
      expect(replacement).toBeDefined();
      expect(Array.from(replacement?.getStr().subarray(0, replacement.getLength()) ?? [])).toEqual([
        10, 58, 10,
      ]);
      replacement?.dispose();
    } finally {
      selected.Dispose();
      f.shell.Close();
      f.docShell.Close();
    }
  },
);

it.each([false, true])(
  "replaces ECMAScript capture groups and retains grouped undo and redo backward=%s",
  /** Exercises full regex reference expansion in the native model-text replacement strategy. @param backward - Search direction. @returns Nothing. */
  (backward) => {
    const f = fixture("a1 a2");
    const options = new SearchOptions2();
    options.AlgorithmType2 = REGEXP;
    options.searchString.assign(string("(a)([0-9])(z)?"));
    options.replaceString.assign(string(String.raw`😀$2$1$3`));
    try {
      const count = f.shell
        .GetCursor()
        .Find_Text(
          options,
          false,
          backward ? SwDocPositions.End : SwDocPositions.Start,
          backward ? SwDocPositions.Start : SwDocPositions.End,
          [false],
          FindRanges.InSelAll | FindRanges.InBodyOnly,
          true,
          undefined,
          undefined,
          createBrowserRegexMatcher,
        );
      expect(count).toBe(2);
      expect(f.node.GetText()).toBe("😀1a 😀2a");
      expect(f.shell.Undo()).toBe(true);
      expect(f.node.GetText()).toBe("a1 a2");
      expect(f.shell.Redo()).toBe(true);
      expect(f.node.GetText()).toBe("😀1a 😀2a");
    } finally {
      f.shell.Close();
      f.docShell.Close();
    }
  },
);

it("keeps the native replacement fallback when capture search retains a soft hyphen", /** Replays the two native cleanup policies with the deployed regex matcher. @returns Nothing. */ () => {
  const f = fixture("a\u00adb");
  const options = new SearchOptions2();
  options.AlgorithmType2 = REGEXP;
  options.searchString.assign(string("(ab)"));
  options.replaceString.assign(string("$1"));
  try {
    expect(
      f.shell
        .GetCursor()
        .Find_Text(
          options,
          false,
          SwDocPositions.Start,
          SwDocPositions.End,
          [false],
          FindRanges.InSelAll | FindRanges.InBodyOnly,
          true,
          undefined,
          undefined,
          createBrowserRegexMatcher,
        ),
    ).toBe(1);
    expect(f.node.GetText()).toBe("$1");
    expect(f.shell.Undo()).toBe(true);
    expect(f.node.GetText()).toBe("a\u00adb");
  } finally {
    f.shell.Close();
    f.docShell.Close();
  }
});

it("undoes and redoes a regex replacement that creates several paragraphs", /** Ports the text and undo assertions from the pinned multi-break ReplaceRange scenario. @returns Nothing. */ () => {
  const f = fixture("foo");
  const selection = range(f.node, 0, 3);
  const operations = f.doc.GetDocumentContentOperationsManager();
  const replacement = String.raw`xyz\n\nquux\n`;
  const readParagraphs = /** Reads canonical body text. @returns Paragraph texts. */ () =>
    f.doc.paragraphs.map(
      /** Borrows model text. @param paragraph - Paragraph. @returns Text. */ (paragraph) =>
        paragraph.GetText(),
    );
  try {
    expect(operations.ReplaceRange(selection, replacement, true)).toBe(true);
    expect(readParagraphs()).toEqual(["xyz", "", "quux", ""]);
    expect(selection.Start().GetNode()).toBe(f.node);
    expect(selection.Start().GetContentIndex()).toBe(0);
    expect(selection.End().GetNode()).toBe(f.doc.paragraphs[3]);
    expect(selection.End().GetContentIndex()).toBe(0);
    for (let cycle = 0; cycle < 2; cycle++) {
      expect(f.shell.Undo()).toBe(true);
      expect(readParagraphs()).toEqual(["foo"]);
      expect(f.shell.Redo()).toBe(true);
      expect(readParagraphs()).toEqual(["xyz", "", "quux", ""]);
    }
  } finally {
    selection.Dispose();
    f.shell.Close();
    f.docShell.Close();
  }
});

it("splits at the replacement and preserves the suffix and escaped replacement newline", /** Tests the exact immediate preceding backslash rule and live suffix positions. @returns Nothing. */ () => {
  const f = fixture("afooz");
  const selection = range(f.node, 1, 4);
  const suffix = new SwPosition(f.node, 5);
  const operations = f.doc.GetDocumentContentOperationsManager();
  try {
    expect(operations.ReplaceRange(selection, String.raw`\nxy\\n`, true)).toBe(true);
    expect(f.doc.paragraphs[0]?.GetText()).toBe("a");
    expect(f.doc.paragraphs[1]?.GetText()).toBe(String.raw`xy\\nz`);
    expect(suffix.GetNode()).toBe(f.doc.paragraphs[1]);
    expect(suffix.GetContentIndex()).toBe(String.raw`xy\\nz`.length);
    expect(f.shell.Undo()).toBe(true);
    expect(f.doc.paragraphs).toHaveLength(1);
    expect(f.doc.paragraphs[0]?.GetText()).toBe("afooz");
  } finally {
    selection.Dispose();
    suffix.Dispose();
    f.shell.Close();
    f.docShell.Close();
  }
});

it.each([
  { original: "abc", from: 1, replacement: "x", expected: ["axdef"] },
  { original: "", from: 0, replacement: "x", expected: ["xdef"] },
  {
    original: "abc",
    from: 1,
    replacement: String.raw`x\ny`,
    expected: ["ax", "ydef"],
  },
])(
  "replaces an adjacent paragraph boundary in $original with $replacement",
  /** Verifies reconstruction of both original paragraphs after native ReplaceRange. @param scenario - Original and expected model strings. @returns Nothing. */ (
    scenario,
  ) => {
    const f = fixture(scenario.original);
    const second = f.doc.nodes.MakeTextNode("def");
    f.node.SetParagraphAlignment("center");
    second.SetParagraphAlignment("right");
    const start = new SwPosition(f.node, scenario.from);
    const end = new SwPosition(second, 0);
    const selection = new SwPaM(end, start);
    start.Dispose();
    end.Dispose();
    const operations = f.doc.GetDocumentContentOperationsManager();
    const readParagraphs = /** Reads canonical paragraphs. @returns Body text. */ () =>
      f.doc.paragraphs.map(
        /** Reads one text node. @param node - Paragraph. @returns Text. */ (node) =>
          node.GetText(),
      );
    try {
      expect(operations.ReplaceRange(selection, scenario.replacement, true)).toBe(true);
      expect(readParagraphs()).toEqual(scenario.expected);
      for (let cycle = 0; cycle < 2; cycle++) {
        expect(f.shell.Undo()).toBe(true);
        expect(readParagraphs()).toEqual([scenario.original, "def"]);
        // WRITER-010 preserves the consumed formatting history on repeated undo.
        const inherited = scenario.from === 0 ? "right" : "center";
        expect(f.doc.paragraphs[0]?.GetParagraphAlignment()).toBe(
          cycle === 0 ? "center" : inherited,
        );
        expect(f.doc.paragraphs[1]?.GetParagraphAlignment()).toBe(
          cycle === 0 ? "right" : inherited,
        );
        expect(f.shell.Redo()).toBe(true);
        expect(readParagraphs()).toEqual(scenario.expected);
      }
    } finally {
      selection.Dispose();
      f.shell.Close();
      f.docShell.Close();
    }
  },
);
