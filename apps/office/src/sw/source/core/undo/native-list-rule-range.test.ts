/** @fileoverview Verifies bounded native SetNumRule flags and selected body/cell list operations without upstream access. */
import { afterEach, expect, it } from "vitest";
import { SwDoc, SetNumRuleMode } from "../doc/doc";
import { SwTextNode } from "../txtnode/ndtxt";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwNumRule } from "../doc/number";
import { applyWriterParagraphList } from "../doc/list";
import { SwNumRuleItem } from "../para/paratr";
import { SwUndoInsNum, SwUndoDelNum } from "./unnum";
import { SfxListUndoAction } from "../../../../svl/source/undo/undo";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { SwListShell } from "../../uibase/shells/listsh";
import { SwEditShell } from "../edit/ednumber";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import {
  RES_PARATR_NUMRULE,
  RES_PARATR_LIST_ISCOUNTED,
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_TEXTLEFT,
  RES_MARGIN_RIGHT,
} from "../../../inc/hintids";
const documents: SwDoc[] = [];
afterEach(
  /** Disposes native owners. @returns Nothing. */ () => {
    for (const doc of documents.splice(0)) doc.Dispose();
  },
);
/** Requires native owners. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing rule range owner");
  return value;
}
/** Builds actual native body/table slots. @param section - Selected section. @returns Owners. */
function fixture(section: "body" | "cells" | "mixed") {
  const doc = new SwDoc();
  documents.push(doc);
  const previous = required(doc.paragraphs[0]),
    body = doc.nodes.MakeTextNode("First"),
    otherBody = doc.nodes.MakeTextNode("Second");
  previous.SetText("Before");
  const table = doc.nodes.MakeTableNode("RuleRange", {}, otherBody);
  table.AddColumnWidth(2000);
  table.AddColumnWidth(2000);
  const row = doc.nodes.AppendTableRow(table, 2),
    cell = required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]),
    otherCell = required(required(row.GetTabBoxes()[1]).GetParagraphs()[0]),
    outside = doc.nodes.MakeTextNode("Outside");
  cell.SetText("First");
  otherCell.SetText("Second");
  const docShell = new SwDocShell(
      doc,
      createDocument({ id: "rule-range", suiteId: "writer", title: "Lists" }),
    ),
    shell = new SwWrtShell(docShell),
    first = section === "cells" ? cell : body,
    second = section === "body" ? otherBody : otherCell,
    selected = section === "mixed" ? [body, otherBody, cell, otherCell] : [first, second];
  return { doc, previous, first, second, outside, table, selected, docShell, shell };
}
/** Creates actual current selection. @param first - First slot. @param second - Last slot. @param direction - Selection direction. @returns Owned range. */
function range(
  first: SwTextNode,
  second: SwTextNode,
  direction: "collapsed" | "forward" | "reversed",
): SwPaM {
  const point = new SwPosition(direction === "forward" ? second : first, 1),
    mark =
      direction === "collapsed"
        ? undefined
        : new SwPosition(direction === "forward" ? first : second, 0);
  try {
    return new SwPaM(point, mark);
  } finally {
    point.Dispose();
    mark?.Dispose();
  }
}
/** Assigns native shell endpoints. @param shell - Shell. @param pam - Native range. @returns Nothing. */
function select(shell: SwWrtShell, pam: SwPaM): void {
  shell.SetPaM(pam.GetPoint(), pam.HasMark() ? pam.GetMark() : undefined);
}
/** Replaces one actual numeric native slot. @param old - Previous node. @returns Current node. */
function replace(old: SwTextNode): SwTextNode {
  const node = new SwTextNode(
      old.GetNodes(),
      old.StartOfSectionNode(),
      old.GetTextFormatColl(),
      old.GetText(),
    ),
    attrs = old.GetpSwAttrSet(),
    hints = old.GetpSwpHints();
  if (attrs !== undefined) node.SetAttr(attrs);
  if (hints !== undefined) node.SetTextHints(hints.clone());
  old.GetNodes().replaceTextNode(old, node);
  expect(old.GetNodes().indexOfOrUndefined(old)).toBeUndefined();
  expect(node.StartOfSectionNode()).toBe(old.StartOfSectionNode());
  return node;
}
/** Reports exact direct indentation. @param node - Native node. @returns Independent direct items. */
function indent(node: SwTextNode) {
  return [RES_MARGIN_FIRSTLINE, RES_MARGIN_TEXTLEFT, RES_MARGIN_RIGHT].map(
    /** Reads optional native direct values. @param which - Item ID. @returns Optional item. */ (
      which,
    ) => node.GetpSwAttrSet()?.GetItemIfSet(which, false),
  );
}
const commandCases = (["body", "cells", "mixed"] as const).flatMap(
  /** Combines sections. @param section - Native section. @returns Cases. */ (section) =>
    (["collapsed", "forward", "reversed"] as const).flatMap(
      /** Combines directions. @param direction - Direction. @returns Cases. */ (direction) =>
        (["numbered", "bullet"] as const).map(
          /** Combines command marker families. @param kind - Requested family. @returns Case. */ (
            kind,
          ) => [section, direction, kind] as const,
        ),
    ),
);
it.each(commandCases)(
  "native selected list toggle and numeric history cover actual range %s/%s/%s",
  /** Checks one grouped command, current replacement, counts and direct indent rollback. @param section - Section. @param direction - Direction. @param kind - Requested family. @returns Nothing. */ (
    section,
    direction,
    kind,
  ) => {
    const owner = fixture(section),
      selected = direction === "collapsed" ? [owner.first] : owner.selected;
    for (const node of selected) {
      node.SetParagraphTextLeftMargin(400);
      node.SetParagraphFirstLineIndent(-120);
      node.SetParagraphRightMargin(80);
      node.SetAttrListLevel(2);
      node.SetCountedInList(false);
      node.SetListRestart(true);
      node.SetAttrListRestartValue(7);
    }
    const before = selected.map(
      /** Captures independent native values. @param node - Native node. @returns Values. */ (
        node,
      ) => ({ list: node.CaptureListItems(), indent: indent(node) }),
    );
    const pam = range(owner.first, owner.second, direction);
    try {
      select(owner.shell, pam);
    } finally {
      pam.Dispose();
    }
    expect(owner.shell.SetParagraphListKind(kind)).toBe(true);
    const action = required(owner.docShell.GetUndoManager().GetUndoAction());
    expect(action).toBeInstanceOf(SfxListUndoAction);
    expect((action as SfxListUndoAction<unknown>).GetActionCount()).toBe(selected.length);
    expect(action.GetPayloadSize()).toBe(selected.length * 12);
    const rule = selected[0]?.GetNumRule(),
      id = selected[0]?.GetListId();
    expect(rule).toBeDefined();
    expect(id?.length).toBeGreaterThan(0);
    let current = selected.map(replace);
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(owner.shell.Undo()).toBe(true);
      for (let index = 0; index < current.length; index++) {
        const node = required(current[index]),
          old = required(before[index]);
        expect(node.CaptureListItems().Equals(old.list, true)).toBe(true);
        expect(indent(node)).toEqual(old.indent);
      }
      current = current.map(replace);
      expect(owner.shell.Redo()).toBe(true);
      for (const node of current) {
        expect(node.GetNumRule()).toBe(rule);
        expect(node.GetListId()).toBe(id);
        expect(node.GetListKind()).toBe(kind);
        expect(node.IsCountedInList()).toBe(true);
        expect(node.IsListRestart()).toBe(true);
        expect(node.GetAttrListRestartValue()).toBe(7);
        expect(node.GetAttrListLevel()).toBe(2);
        expect(indent(node)).toEqual([undefined, undefined, undefined]);
      }
      const first = required(current[0]),
        last = required(current.at(-1));
      expect(owner.shell.GetCursor().GetPoint().GetNode()).toBe(
        direction === "forward" ? last : first,
      );
      expect(owner.shell.GetCursor().GetPoint().GetContentIndex()).toBe(1);
      expect(owner.shell.GetCursor().HasMark()).toBe(direction !== "collapsed");
      if (direction !== "collapsed") {
        expect(owner.shell.GetCursor().GetMark().GetNode()).toBe(
          direction === "forward" ? first : last,
        );
        expect(owner.shell.GetCursor().GetMark().GetContentIndex()).toBe(0);
      }
      expect(owner.shell.GetListShell().GetKind()).toBe(kind);
      expect(owner.previous.GetListKind()).toBe("none");
      expect(owner.outside.GetListKind()).toBe("none");
      current = current.map(replace);
    }
    expect(owner.shell.SetParagraphListKind("none")).toBe(true);
    expect(owner.docShell.GetUndoManager().GetUndoAction()).toBeInstanceOf(SwUndoDelNum);
    for (const node of current) expect(node.GetListKind()).toBe("none");
    expect(owner.shell.Undo()).toBe(true);
    for (const node of current) expect(node.GetNumRule()).toBe(rule);
    expect(owner.shell.Redo()).toBe(true);
    for (const node of current) expect(node.GetListKind()).toBe("none");
  },
);
it.each(["body", "cells"] as const)(
  "native list toggle continues an adjacent prior rule and clears only supported indentation %s",
  /** Checks point-owned search, shared rule and independent count policy. @param section - Section. @returns Nothing. */ (
    section,
  ) => {
    const owner = fixture(section);
    const nativePrevious = owner.doc.nodes.at(owner.first.GetIndex() - 1);
    // Cell section sentinels are skipped by native search; plain nonempty body nodes stop continuation.
    if (section === "body")
      applyWriterParagraphList(owner.previous, {
        kind: "numbered",
        styleId: "Earlier",
        listId: "prior",
      });
    else {
      for (const node of owner.doc.paragraphs) if (node !== owner.previous) node.SetText("");
      applyWriterParagraphList(owner.previous, {
        kind: "numbered",
        styleId: "Earlier",
        listId: "prior",
      });
      expect(nativePrevious.IsStartNode()).toBe(true);
    }
    owner.shell.FocusNode(owner.first);
    expect(owner.shell.SetParagraphListKind("numbered")).toBe(true);
    expect(owner.first.GetNumRule()).toBe(owner.previous.GetNumRule());
    expect(owner.first.GetListId()).toBe("prior");
    expect(owner.shell.SetParagraphListKind("numbered")).toBe(false);
    expect(owner.shell.SetParagraphListKind("none")).toBe(true);
    expect(owner.shell.SetParagraphListKind("none")).toBe(false);
  },
);
it("native shell history preserves direct indentation when continuing a label-width rule", /** Checks actual post-command items through numeric Undo and Redo. @returns Nothing. */ () => {
  const owner = fixture("body"),
    rule = owner.doc
      .GetDocumentListsManager()
      .AddNumRule(new SwNumRule("WidthPrevious", "label-width-and-position"));
  owner.previous.SetAttr(new SwNumRuleItem(rule.GetName()));
  owner.previous.SetListId("width-list");
  owner.first.SetParagraphTextLeftMargin(400);
  owner.first.SetParagraphFirstLineIndent(-120);
  owner.first.SetParagraphRightMargin(80);
  const before = indent(owner.first);
  owner.shell.FocusNode(owner.first);
  expect(owner.shell.SetParagraphListKind("numbered")).toBe(true);
  expect(owner.first.GetNumRule()).toBe(rule);
  expect(indent(owner.first)).toEqual(before);
  const current = replace(owner.first);
  expect(owner.shell.Undo()).toBe(true);
  expect(current.GetListKind()).toBe("none");
  expect(indent(current)).toEqual(before);
  expect(owner.shell.Redo()).toBe(true);
  expect(current.GetNumRule()).toBe(rule);
  expect(current.GetListId()).toBe("width-list");
  expect(indent(current)).toEqual(before);
});
it.each([
  SetNumRuleMode.Default,
  SetNumRuleMode.CreateNewList,
  SetNumRuleMode.DontSetItem,
  SetNumRuleMode.ResetIndentAttrs,
  SetNumRuleMode.DontSetIfAlreadyApplied,
] as const)(
  "native document rule operation honors exact flag %s",
  /** Checks independent flag, explicit list identity, attribute reset and count separation. @param mode - Native mode. @returns Nothing. */ (
    mode,
  ) => {
    const owner = fixture("mixed"),
      rule = owner.doc.EnsureNumRule("Flags", "numbered"),
      pam = range(owner.first, owner.second, "reversed");
    for (const node of owner.selected) {
      node.SetParagraphTextLeftMargin(800);
      node.SetCountedInList(false);
    }
    try {
      const id = owner.doc.SetNumRule(pam, rule, mode, "continued");
      expect(id).toBe(
        mode === SetNumRuleMode.DontSetItem
          ? ""
          : mode === SetNumRuleMode.CreateNewList
            ? owner.first.GetListId()
            : "continued",
      );
      if (mode === SetNumRuleMode.CreateNewList) expect(id).not.toBe(rule.GetDefaultListId());
      for (const node of owner.selected) {
        expect(node.GetNumRule()).toBe(mode === SetNumRuleMode.DontSetItem ? undefined : rule);
        expect(node.IsCountedInList()).toBe(false);
        expect(node.GetParagraphTextLeftMargin()).toBe(
          mode === SetNumRuleMode.ResetIndentAttrs ? 0 : 800,
        );
      }
      owner.doc.SetCounted(pam, true);
      for (const node of owner.selected)
        expect(
          node.GetpSwAttrSet()?.GetItemIfSet(RES_PARATR_LIST_ISCOUNTED, false),
        ).toBeUndefined();
      owner.doc.SetCounted(pam, false);
      for (const node of owner.selected) expect(node.IsCountedInList()).toBe(false);
      expect(owner.outside.GetListKind()).toBe("none");
    } finally {
      pam.Dispose();
    }
  },
);
it.each([false, true])(
  "native rule creation keeps source ownership and default list policy seeded=%s",
  /** Checks rule clone, absent/default identities and new list mode. @param seeded - Existing source default identity. @returns Nothing. */ (
    seeded,
  ) => {
    const owner = fixture("body"),
      rule = new SwNumRule("Created", "label-alignment"),
      pam = range(owner.first, owner.second, "forward");
    if (seeded) rule.SetDefaultListId("seeded");
    try {
      const id = owner.doc.SetNumRule(pam, rule, SetNumRuleMode.CreateNewList),
        stored = required(owner.doc.FindNumRulePtr("Created"));
      expect(stored).not.toBe(rule);
      expect(id).toBe(stored.GetDefaultListId());
      expect(id.length).toBeGreaterThan(0);
      expect(owner.first.GetNumRule()).toBe(stored);
      expect(owner.second.GetNumRule()).toBe(stored);
      expect(rule.GetDefaultListId()).toBe(seeded ? "seeded" : "");
      const copy = stored.clone(),
        format = copy.Get(0).clone();
      format.SetSuffix(")");
      copy.Set(0, format);
      owner.doc.SetNumRule(pam, copy);
      expect(owner.doc.FindNumRulePtr("Created")).toBe(stored);
      expect(stored.Get(0).GetSuffix()).toBe(")");
      expect(owner.first.GetNumRule()).toBe(stored);
    } finally {
      pam.Dispose();
    }
  },
);
it.each(["inherited", "suppressed", "detached"] as const)(
  "native collapsed rule application retains collection inheritance %s",
  /** Checks no forced direct item for the same style, clearing suppression and live list membership. @param state - Original state. @returns Nothing. */ (
    state,
  ) => {
    const owner = fixture("cells"),
      rule = owner.doc.EnsureNumRule("Inherited", "numbered"),
      coll = owner.doc.MakeTextFormatColl(
        "List Collection",
        owner.doc.GetDfltTextFormatColl(),
        "ListCollection",
      );
    coll.SetFormatAttr(new SwNumRuleItem(rule.GetName()));
    owner.first.ChgFormatColl(coll);
    if (state === "suppressed") owner.first.SetNumRule("");
    if (state === "detached") owner.first.RemoveFromList();
    const pam = range(owner.first, owner.second, "collapsed");
    try {
      expect(owner.doc.SetNumRule(pam, rule)).toBe("");
      expect(owner.first.GetpSwAttrSet()?.GetItemIfSet(RES_PARATR_NUMRULE, false)).toBeUndefined();
      expect(owner.first.GetNumRule()).toBe(rule);
      expect(owner.first.IsInList()).toBe(true);
    } finally {
      pam.Dispose();
    }
  },
);
it("native collapsed rule clears an explicit empty direct override to restore style inheritance", /** Checks actual direct suppression rather than the SetNumRule empty-name reset convenience. @returns Nothing. */ () => {
  const owner = fixture("body"),
    rule = owner.doc.EnsureNumRule("SuppressedRule", "numbered"),
    coll = owner.doc.MakeTextFormatColl(
      "Suppressed collection",
      owner.doc.GetDfltTextFormatColl(),
      "SuppressedCollection",
    );
  coll.SetFormatAttr(new SwNumRuleItem(rule.GetName()));
  owner.first.ChgFormatColl(coll);
  owner.first.SetAttr(new SwNumRuleItem(""));
  expect(owner.first.GetNumRule()).toBeUndefined();
  expect(owner.first.GetpSwAttrSet()?.GetItemIfSet(RES_PARATR_NUMRULE, false)).toBeDefined();
  const pam = range(owner.first, owner.second, "collapsed");
  try {
    expect(owner.doc.SetNumRule(pam, rule)).toBe("");
    expect(owner.first.GetNumRule()).toBe(rule);
    expect(owner.first.GetpSwAttrSet()?.GetItemIfSet(RES_PARATR_NUMRULE, false)).toBeUndefined();
    expect(owner.first.IsInList()).toBe(true);
  } finally {
    pam.Dispose();
  }
});
it("native already-applied and DontSetItem flags preserve direct item ownership and width-mode indents", /** Checks independent composite flags with native inheritance and unsupported alignment reset. @returns Nothing. */ () => {
  const owner = fixture("cells"),
    rule = owner.doc.EnsureNumRule("Applied", "numbered"),
    coll = owner.doc.MakeTextFormatColl(
      "Applied Collection",
      owner.doc.GetDfltTextFormatColl(),
      "AppliedCollection",
    );
  coll.SetFormatAttr(new SwNumRuleItem(rule.GetName()));
  owner.first.ChgFormatColl(coll);
  const pam = range(owner.first, owner.second, "forward");
  try {
    owner.doc.SetNumRule(pam, rule, SetNumRuleMode.DontSetIfAlreadyApplied);
    expect(owner.first.GetpSwAttrSet()?.GetItemIfSet(RES_PARATR_NUMRULE, false)).toBeUndefined();
    expect(owner.second.GetpSwAttrSet()?.GetItemIfSet(RES_PARATR_NUMRULE, false)).toBeDefined();
    for (const node of [owner.first, owner.second]) node.SetParagraphTextLeftMargin(400);
    const width = new SwNumRule("Width", "label-width-and-position");
    owner.doc.SetNumRule(pam, width, SetNumRuleMode.ResetIndentAttrs);
    expect(owner.first.GetParagraphTextLeftMargin()).toBe(400);
    expect(owner.second.GetParagraphTextLeftMargin()).toBe(400);
    const id = owner.first.GetListId();
    owner.doc.SetNumRule(
      pam,
      width,
      SetNumRuleMode.CreateNewList | SetNumRuleMode.DontSetItem,
      "ignored",
    );
    expect(owner.first.GetListId()).toBe(id);
  } finally {
    pam.Dispose();
  }
});
it("native structural ranges ignore text-only rule and count payloads", /** Checks supported nontext guards without shell cursor adjuncts. @returns Nothing. */ () => {
  const owner = fixture("body"),
    point = new SwPosition(owner.first),
    pam = new SwPaM(point),
    rule = owner.doc.EnsureNumRule("Structural", "numbered");
  try {
    pam.GetPoint().nNode.Assign(owner.table.GetTableNode());
    owner.doc.SetNumRule(pam, rule, SetNumRuleMode.ResetIndentAttrs, "structural");
    owner.doc.SetCounted(pam, true);
    const nativeOwner =
      new /** Actual native state owner for this structural fixture. */ (class extends SwEditShell {
        /** Supplies a real structural native range. @returns Range. */
        public GetCursor(): SwPaM {
          return pam;
        }
        /** Supplies the actual document. @returns Document. */
        public GetDoc(): SwDoc {
          return owner.doc;
        }
        /** Supplies existing native cursor adjuncts. @returns State. */
        public CaptureCursorState() {
          return owner.shell.CaptureCursorState();
        }
        /** State queries execute no mutation. @returns False. */
        public ApplyAction(): boolean {
          return false;
        }
      })();
    const target = new SwListShell(nativeOwner);
    expect(target.GetKind()).toBe("none");
  } finally {
    pam.Dispose();
    point.Dispose();
  }
});
it("native rule ranges and numeric InsNum reject foreign owners while retaining independent payloads", /** Checks original-document ownership and caller mutation safety. @returns Nothing. */ () => {
  const owner = fixture("cells"),
    other = new SwDoc();
  documents.push(other);
  const pam = range(owner.first, owner.second, "forward"),
    rule = owner.doc.EnsureNumRule("Owned", "numbered");
  try {
    expect(
      /** Calls foreign rule mutation. @returns Identity. */ () => other.SetNumRule(pam, rule),
    ).toThrow("another node array");
    expect(
      /** Calls foreign counted mutation. @returns Nothing. */ () => other.SetCounted(pam, false),
    ).toThrow("another node array");
    owner.shell.FocusNode(owner.first);
    const before = owner.first.CaptureListItems();
    owner.doc.SetNumRule(pam, rule);
    const after = owner.first.CaptureListItems(),
      action = new SwUndoInsNum(
        owner.first,
        before,
        after,
        owner.shell.CaptureCursorState(),
        owner.shell.CaptureCursorState(),
      );
    after.ClearItem(RES_PARATR_NUMRULE);
    let current = replace(owner.first);
    action.UndoWithContext({
      GetDoc: /** Supplies actual graph. @returns Doc. */ () => owner.doc,
      RestoreCursor: /** No shell state needed. @returns Nothing. */ () => {},
    });
    expect(current.GetListKind()).toBe("none");
    current = replace(current);
    action.RedoWithContext({
      GetDoc: /** Supplies actual graph. @returns Doc. */ () => owner.doc,
      RestoreCursor: /** No shell state needed. @returns Nothing. */ () => {},
    });
    expect(current.GetNumRule()).toBe(rule);
    const context = {
      GetDoc: /** Supplies foreign graph. @returns Doc. */ () => other,
      RestoreCursor: /** No restoration on failure. @returns Nothing. */ () => {},
    };
    expect(
      /** Replays under foreign undo context. @returns Nothing. */ () =>
        action.UndoWithContext(context),
    ).toThrow("another document");
    expect(
      /** Replays under foreign redo context. @returns Nothing. */ () =>
        action.RedoWithContext(context),
    ).toThrow("another document");
  } finally {
    pam.Dispose();
  }
});
it("native list state reports mixed marker families before applying a range rule", /** Checks selection consensus and unaffected plain neighbors. @returns Nothing. */ () => {
  const owner = fixture("cells");
  applyWriterParagraphList(owner.first, {
    kind: "numbered",
    styleId: "Numbers",
    listId: "numbers",
  });
  applyWriterParagraphList(owner.second, { kind: "bullet", styleId: "Bullets", listId: "bullets" });
  const pam = range(owner.first, owner.second, "reversed");
  try {
    select(owner.shell, pam);
  } finally {
    pam.Dispose();
  }
  expect(owner.shell.GetListShell().GetKind()).toBe("none");
  expect(owner.shell.SetParagraphListKind("numbered")).toBe(true);
  expect(owner.shell.GetListShell().GetKind()).toBe("numbered");
  expect(owner.first.GetNumRule()).toBe(owner.second.GetNumRule());
});
