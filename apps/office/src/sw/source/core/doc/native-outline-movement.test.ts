/** @fileoverview Checks literal native outline move-table, range, signed history and ring contracts without upstream execution. */
import { afterEach, describe, expect, it } from "vitest";
import { SwDoc } from "./doc";
import { createWriterNumFormat, NumDownChangesIndent } from "./number";
import { SwEditWin } from "../../uibase/docvw/edtwin";
import { SwTextNode } from "../txtnode/ndtxt";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwUndoOutlineLeftRight } from "../undo/unoutl";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { RES_CHRATR_WEIGHT } from "../../../inc/hintids";

const shells: SwWrtShell[] = [];
afterEach(
  /** Releases actual document and shell owners. @returns Nothing. */ () => {
    for (const shell of shells.splice(0)) shell.Close();
  },
);
/** Requires a connected fixture member. @param value - Optional member. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing outline owner");
  return value;
}
/** Builds real ordered paragraphs and a native shell. @returns Owners. */
function fixture() {
  const doc = new SwDoc(),
    first = required(doc.paragraphs[0]),
    second = doc.nodes.MakeTextNode("Second"),
    third = doc.nodes.MakeTextNode("Third"),
    docShell = new SwDocShell(
      doc,
      createDocument({ id: "native-outline", suiteId: "writer", title: "Outline" }),
    ),
    shell = new SwWrtShell(docShell);
  first.SetText("First");
  shells.push(shell);
  return { doc, first, second, third, shell, docShell };
}
/** Applies a real assigned pool heading directly. @param node - Text owner. @param level - One-based heading. @returns Nothing. */
function heading(node: SwTextNode, level: number): void {
  node.ChgFormatColl(node.GetDoc().GetTextFormatColl(`heading-${level}`));
}
/** Creates an actual temporary native range. @param first - Start node. @param last - End node. @param ring - Optional actual selection ring. @returns Owned range. */
function range(first: SwTextNode, last = first, ring?: SwPaM): SwPaM {
  const point = new SwPosition(last, last.Len()),
    mark = new SwPosition(first, 0);
  try {
    return new SwPaM(point, mark, ring);
  } finally {
    point.Dispose();
    mark.Dispose();
  }
}
/** Sets the persistent actual shell selection. @param f - Owners. @param first - Fixed endpoint. @param last - Moving endpoint. @returns Nothing. */
function select(f: ReturnType<typeof fixture>, first: SwTextNode, last = first): void {
  const point = new SwPosition(last, 0),
    mark = first === last ? undefined : new SwPosition(first, 0);
  try {
    f.shell.SetPaM(point, mark);
  } finally {
    point.Dispose();
    mark?.Dispose();
  }
}
describe("native outline movement", /** Registers source-shaped outline behavior. @returns Nothing. */ () => {
  it("rejects an empty outline index and zero movement without materializing styles", /** Checks actual native early exits. @returns Nothing. */ () => {
    const f = fixture(),
      pam = range(f.first);
    const count = f.doc.GetTextFormatColls().length;
    expect(f.doc.OutlineUpDown(pam, 1)).toBe(false);
    expect(f.doc.GetTextFormatColls()).toHaveLength(count);
    heading(f.first, 2);
    const assigned = f.doc.GetTextFormatColls().length;
    expect(f.doc.OutlineUpDown(pam, 0)).toBe(false);
    expect(f.doc.GetTextFormatColls()).toHaveLength(assigned);
    pam.Dispose();
  });
  it("rejects a foreign actual document range", /** Checks portable native graph ownership. @returns Nothing. */ () => {
    const f = fixture(),
      other = fixture();
    heading(f.first, 2);
    const pam = range(other.first);
    expect(
      /** Executes the actual invalid graph crossing. @returns Native result. */ () =>
        f.doc.OutlineUpDown(pam, 1),
    ).toThrow("another document");
    pam.Dispose();
  });
  it("rejects a paragraph before the first outline and selects the preceding outline after it", /** Checks native Seek_Entry predecessor semantics. @returns Nothing. */ () => {
    const f = fixture();
    heading(f.second, 2);
    let pam = range(f.first);
    expect(f.doc.OutlineUpDown(pam, 1)).toBe(false);
    expect(f.second.GetParagraphStyle()).toBe("heading-2");
    pam.Dispose();
    pam = range(f.third);
    expect(f.doc.OutlineUpDown(pam, 1)).toBe(true);
    expect(f.second.GetParagraphStyle()).toBe("heading-3");
    expect(f.third.GetParagraphStyle()).toBe("default");
    pam.Dispose();
  });
  it.each([-1, 1])(
    "materializes native adjacent pool styles for direction %s",
    /** Checks actual lazy collection admission and movement. @param offset - Signed direction. @returns Nothing. */ (
      offset,
    ) => {
      const f = fixture();
      heading(f.first, 4);
      const pam = range(f.first);
      expect(f.doc.FindTextFormatColl("heading-3")).toBeUndefined();
      expect(f.doc.FindTextFormatColl("heading-5")).toBeUndefined();
      expect(f.doc.OutlineUpDown(pam, offset)).toBe(true);
      expect(f.first.GetParagraphStyle()).toBe(offset < 0 ? "heading-3" : "heading-5");
      expect(f.doc.FindTextFormatColl("heading-3")).toBeDefined();
      expect(f.doc.FindTextFormatColl("heading-5")).toBeDefined();
      pam.Dispose();
    },
  );
  it.each([
    [-2, "heading-1"],
    [2, "heading-10"],
  ] as const)(
    "steps across occupied style gaps by %s",
    /** Checks displacement counts occupied entries instead of arithmetic heading identities. @param offset - Signed step count. @param target - Literal target. @returns Nothing. */ (
      offset,
      target,
    ) => {
      const f = fixture();
      for (const level of [1, 4, 7, 10]) f.doc.GetTextFormatColl(`heading-${level}`);
      heading(f.first, offset < 0 ? 7 : 4);
      const pam = range(f.first);
      expect(f.doc.OutlineUpDown(pam, offset)).toBe(true);
      expect(f.first.GetParagraphStyle()).toBe(target);
      pam.Dispose();
    },
  );
  it("uses the last created style assigned to the same outline level", /** Checks native collection-table assignment ordering. @returns Nothing. */ () => {
    const f = fixture();
    heading(f.first, 1);
    f.doc.GetTextFormatColl("heading-2");
    const custom = f.doc.MakeTextFormatColl("Custom level two");
    custom.AssignToListLevelOfOutlineStyle(1);
    const pam = range(f.first);
    expect(f.doc.OutlineUpDown(pam, 1)).toBe(true);
    expect(f.first.GetTextFormatColl()).toBe(custom);
    pam.Dispose();
  });
  it("skips pool headings whose assignment was removed or changed in the upper search", /** Checks real pool registration remains mutable native state. @returns Nothing. */ () => {
    const f = fixture();
    heading(f.first, 1);
    f.doc.GetTextFormatColl("heading-2").DeleteAssignmentToListLevelOfOutlineStyle();
    f.doc.GetTextFormatColl("heading-3").AssignToListLevelOfOutlineStyle(0);
    const pam = range(f.first);
    expect(f.doc.OutlineUpDown(pam, 1)).toBe(true);
    expect(f.first.GetParagraphStyle()).toBe("heading-4");
    pam.Dispose();
  });
  it("skips unassigned pool headings in the lower search", /** Checks source lower-edge admission. @returns Nothing. */ () => {
    const f = fixture();
    heading(f.first, 5);
    f.doc.GetTextFormatColl("heading-4").AssignToListLevelOfOutlineStyle(6);
    f.doc.GetTextFormatColl("heading-3").DeleteAssignmentToListLevelOfOutlineStyle();
    const pam = range(f.first);
    expect(f.doc.OutlineUpDown(pam, -1)).toBe(true);
    expect(f.first.GetParagraphStyle()).toBe("heading-2");
    pam.Dispose();
  });
  it.each([-1, 1])(
    "moves direct outline attributes without assigned styles direction=%s",
    /** Checks native no-collection map and direct level arithmetic. @param offset - Direction. @returns Nothing. */ (
      offset,
    ) => {
      const f = fixture();
      f.first.SetAttrOutlineLevel(4);
      const pam = range(f.first);
      expect(f.doc.OutlineUpDown(pam, offset)).toBe(true);
      expect(f.first.GetAttrOutlineLevel()).toBe(4 + offset);
      expect(f.first.GetParagraphStyle()).toBe("default");
      pam.Dispose();
    },
  );
  it.each([
    [1, -1],
    [10, 1],
  ] as const)(
    "rejects direct outline boundary %s without touching neighboring heading",
    /** Checks all-or-nothing mixed range preflight. @param level - Direct boundary. @param offset - Out-of-range direction. @returns Nothing. */ (
      level,
      offset,
    ) => {
      const f = fixture();
      heading(f.first, 4);
      f.second.SetAttrOutlineLevel(level);
      const pam = range(f.first, f.second);
      expect(f.doc.OutlineUpDown(pam, offset)).toBe(false);
      expect(f.first.GetParagraphStyle()).toBe("heading-4");
      expect(f.second.GetAttrOutlineLevel()).toBe(level);
      pam.Dispose();
    },
  );
  it.each([
    [1, -1],
    [10, 1],
    [4, 20],
  ] as const)(
    "rejects unavailable assigned style movement from %s by %s",
    /** Checks no partial node mutation despite source lazy pool side effects. @param level - Assigned level. @param offset - Displacement. @returns Nothing. */ (
      level,
      offset,
    ) => {
      const f = fixture();
      heading(f.first, level);
      const pam = range(f.first);
      expect(f.doc.OutlineUpDown(pam, offset)).toBe(false);
      expect(f.first.GetParagraphStyle()).toBe(`heading-${level}`);
      pam.Dispose();
    },
  );
  it("changes every outline in a mixed selected range and preserves ordinary paragraphs", /** Checks real outline index rather than all text nodes. @returns Nothing. */ () => {
    const f = fixture();
    heading(f.first, 2);
    f.third.SetAttrOutlineLevel(5);
    const pam = range(f.first, f.third);
    expect(f.doc.OutlineUpDown(pam, 1)).toBe(true);
    expect(f.first.GetParagraphStyle()).toBe("heading-3");
    expect(f.third.GetAttrOutlineLevel()).toBe(6);
    expect(f.second.GetParagraphStyle()).toBe("default");
    expect(f.second.GetText()).toBe("Second");
    pam.Dispose();
  });
  it("uses native default shell offset and inverse history without replacing text or character items", /** Checks actual history, payload, style identity and independent direct formatting. @returns Nothing. */ () => {
    const f = fixture();
    heading(f.first, 2);
    f.first.SetAttr(new SvxWeightItem(8, RES_CHRATR_WEIGHT));
    select(f, f.first);
    const original = f.first.GetTextFormatColl(),
      item = f.first.GetpSwAttrSet()?.GetItemIfSet(RES_CHRATR_WEIGHT, false),
      pam = range(f.first),
      action = new SwUndoOutlineLeftRight(pam, 1, f.shell.CaptureCursorState());
    expect(action.GetPayloadSize()).toBe(5);
    action.Dispose();
    pam.Dispose();
    expect(f.shell.OutlineUpDown()).toBe(true);
    expect(f.first.GetParagraphStyle()).toBe("heading-3");
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(f.shell.Undo()).toBe(true);
    expect(f.first.GetTextFormatColl()).toBe(original);
    expect(f.shell.Redo()).toBe(true);
    expect(f.first.GetParagraphStyle()).toBe("heading-3");
    expect(f.first.GetText()).toBe("First");
    expect(item).toBeDefined();
    const preserved = required(f.first.GetpSwAttrSet()).GetWeight(false);
    expect(preserved.GetWeight()).toBe(8);
    expect(preserved.equals(required(item))).toBe(true);
    expect(f.second.GetParagraphStyle()).toBe("default");
  });
  it("does not record rejected outline operations", /** Checks actual native empty group disposal. @returns Nothing. */ () => {
    const f = fixture();
    heading(f.first, 1);
    select(f, f.first);
    expect(f.shell.OutlineUpDown(-1)).toBe(false);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    expect(f.doc.GetUndoManager().IsInListAction()).toBe(false);
  });
  it.each([false, true])(
    "short-circuits normalized ring ranges after first failure earlierSuccess=%s",
    /** Checks native bRet short-circuit preserves earlier changes with grouped history. @param earlierSuccess - Whether first interval is valid. @returns Nothing. */ (
      earlierSuccess,
    ) => {
      const f = fixture();
      f.doc.nodes.MakeTextNode("Gap");
      const tail = f.doc.nodes.MakeTextNode("Tail");
      f.doc.GetTextFormatColl("heading-3");
      heading(f.first, earlierSuccess ? 2 : 10);
      heading(f.third, 10);
      heading(tail, 2);
      select(f, f.first);
      const last = range(tail, tail, f.shell.GetCursor()),
        middle = range(f.third, f.third, f.shell.GetCursor());
      try {
        expect(f.shell.OutlineUpDown()).toBe(false);
        expect(f.first.GetParagraphStyle()).toBe(earlierSuccess ? "heading-3" : "heading-10");
        expect(f.third.GetParagraphStyle()).toBe("heading-10");
        expect(tail.GetParagraphStyle()).toBe("heading-2");
        expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(earlierSuccess ? 1 : 0);
      } finally {
        last.Dispose();
        middle.Dispose();
      }
    },
  );
  it("groups successful normalized ring ranges with atomic inverse history", /** Checks ordered native intervals and one grouped undo action. @returns Nothing. */ () => {
    const f = fixture();
    heading(f.first, 2);
    heading(f.third, 4);
    select(f, f.first);
    const other = range(f.third, f.third, f.shell.GetCursor());
    try {
      expect(f.shell.OutlineUpDown()).toBe(true);
      expect([f.first.GetParagraphStyle(), f.third.GetParagraphStyle()]).toEqual([
        "heading-4",
        "heading-5",
      ]);
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
      expect(f.shell.Undo()).toBe(true);
      expect([f.first.GetParagraphStyle(), f.third.GetParagraphStyle()]).toEqual([
        "heading-2",
        "heading-4",
      ]);
      expect(f.shell.Redo()).toBe(true);
      expect([f.first.GetParagraphStyle(), f.third.GetParagraphStyle()]).toEqual([
        "heading-4",
        "heading-5",
      ]);
    } finally {
      other.Dispose();
    }
  });
  it("undo resolves current numeric outline slots after paragraph owner replacement", /** Checks no retained old paragraph mutation. @returns Nothing. */ () => {
    const f = fixture();
    heading(f.first, 2);
    select(f, f.first);
    expect(f.shell.OutlineUpDown()).toBe(true);
    const replacement = new SwTextNode(
      f.doc.nodes,
      f.first.StartOfSectionNode(),
      f.first.GetTextFormatColl(),
      f.first.GetText(),
    );
    f.doc.nodes.replaceTextNode(f.first, replacement);
    expect(f.shell.Undo()).toBe(true);
    expect(replacement.GetParagraphStyle()).toBe("heading-2");
    expect(f.first.GetParagraphStyle()).toBe("heading-3");
    expect(f.shell.Redo()).toBe(true);
    expect(replacement.GetParagraphStyle()).toBe("heading-3");
  });
  it("preserves tenth-level NONE equal-indent literal Tab without demoting", /** Checks native MAXLEVEL count at zero-based level eight. @returns Nothing. */ () => {
    const f = fixture();
    select(f, f.first);
    f.shell.SetParagraphListKind("numbered");
    const rule = required(f.first.GetNumRule());
    for (const level of [8, 9])
      rule.Set(
        level,
        createWriterNumFormat("numbered", "", { numberingType: "none", indentAt: 120 }),
      );
    f.first.SetAttrListLevel(8);
    f.doc.GetUndoManager().Clear();
    expect(NumDownChangesIndent(f.shell)).toBe(false);
    const edit = new SwEditWin(f.shell);
    expect(edit.HandleTab()).toBe(true);
    expect(f.first.GetText()).toBe("\tFirst");
    expect(f.first.GetActualListLevel()).toBe(8);
    expect(f.shell.Undo()).toBe(true);
    expect(f.first.GetText()).toBe("First");
    expect(f.first.GetActualListLevel()).toBe(8);
  });
  it.each([false, true])(
    "moves native ninth and tenth outline boundaries direct=%s",
    /** Checks actual native level-count limits for assigned and direct outlines. @param direct - Direct attribute rather than assigned style. @returns Nothing. */ (
      direct,
    ) => {
      const f = fixture();
      if (direct) f.first.SetAttrOutlineLevel(9);
      else heading(f.first, 9);
      const pam = range(f.first);
      try {
        expect(f.doc.OutlineUpDown(pam, 1)).toBe(true);
        expect(f.first.GetAttrOutlineLevel()).toBe(10);
        expect(f.doc.OutlineUpDown(pam, 1)).toBe(false);
        expect(f.doc.OutlineUpDown(pam, -1)).toBe(true);
        expect(f.first.GetAttrOutlineLevel()).toBe(9);
        expect(f.first.GetParagraphStyle()).toBe(direct ? "default" : "heading-9");
        expect(f.first.GetText()).toBe("First");
      } finally {
        pam.Dispose();
      }
    },
  );
  it("consumes actual tenth list level Tab without reading an unavailable format", /** Checks corrected native maximum guard and rejected level change. @returns Nothing. */ () => {
    const f = fixture();
    select(f, f.first);
    f.shell.SetParagraphListKind("numbered");
    const rule = required(f.first.GetNumRule());
    rule.Set(9, createWriterNumFormat("numbered", "", { numberingType: "none", indentAt: 120 }));
    f.first.SetAttrListLevel(9);
    f.doc.GetUndoManager().Clear();
    expect(NumDownChangesIndent(f.shell)).toBe(true);
    const edit = new SwEditWin(f.shell);
    expect(edit.HandleTab()).toBe(true);
    expect(f.first.GetText()).toBe("First");
    expect(f.first.GetActualListLevel()).toBe(9);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  });
});
