/** @fileoverview Verifies Writer view attachment and command routing contracts. */

import { describe, expect, it, vi } from "vitest";

import { SvxProtectItem } from "../../../../editeng/source/items/frmitems";
import { LanguageTag } from "../../../../i18nlangtag/inc/languagetag";
import { ABSOLUTE } from "../../../../offapi/com/sun/star/util/SearchAlgorithms2";
import {
  REG_NOT_BEGINOFLINE,
  REG_NOT_ENDOFLINE,
} from "../../../../offapi/com/sun/star/util/SearchFlags";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SearchOptionFlags } from "../../../../svl/inc/srchdefs";
import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { SvxSearchCmd } from "../../../../svl/inc/srchitem";
import { GetSettings } from "../../../../vcl/source/app/svapp";
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import { RES_FRMATR_BEGIN, RES_FRMATR_END, RES_PROTECT } from "../../../inc/hintids";
import { SwPosition } from "../../core/crsr/pam";
import { SwCursor } from "../../core/crsr/swcrsr";
import { BrowserSfxDispatcher } from "../../../../framework/browser/dispatch/browser-dispatcher";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SfxViewFrame } from "../../../../sfx2/source/view/viewfrm";
import { MakeFlySection } from "../../core/doc/doclay";
import { createWriterDocument } from "../../core/doc/doc";
import { createDefaultWriterPageDescriptor } from "../../../../test/writer-page-descriptor";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { SwDocShell } from "../app/docsh";
import { SwView } from "./view";

it("uses the application language and native scope options for Writer search commands", /** Checks the options reaching the actual Writer cursor strategy. @returns Nothing. */ () => {
  const view = new SwView(
    new SwDocShell(
      createWriterDocument(),
      createDocument({ id: "search", suiteId: "writer", title: "Search" }),
    ),
  );
  const locale = new LanguageTag("tr-TR");
  const settings = vi.spyOn(GetSettings(), "GetLanguageTag").mockReturnValue(locale);
  const find = vi.spyOn(SwCursor.prototype, "Find_Text");
  const shell = view.GetWrtShell();
  const search = view.GetSearch();
  shell.Insert("cat cat");
  shell.ExtendedSelectAll();
  const item = { ...search.GetSearchItem(), search: "cat", replacement: "dog", selection: true };
  try {
    expect(search.ExecSearch(item, SvxSearchCmd.FIND_ALL).matches).toBe(2);
    const options = find.mock.calls[0]?.[0];
    expect(options?.Locale.equals(locale.getLocale())).toBe(true);
    expect(options?.AlgorithmType2).toBe(ABSOLUTE);
    expect(options?.searchFlag).toBe(REG_NOT_BEGINOFLINE | REG_NOT_ENDOFLINE);
    expect(options?.replaceString.getLength()).toBe(0);

    expect(search.ExecSearch(item, SvxSearchCmd.REPLACE_ALL).matches).toBe(2);
    expect(shell.GetActiveParagraph().GetText()).toBe("dog dog");
    expect(find.mock.lastCall?.[0].replaceString.getLength()).toBe(3);
  } finally {
    find.mockRestore();
    settings.mockRestore();
    view.Close();
  }
});

it("continues backwards from the replaced match inside a larger selection", /** Checks the keep-current Pop and SwapPam sequence from SwView::ExecSearch. @returns Nothing. */ () => {
  const view = new SwView(
    new SwDocShell(
      createWriterDocument(),
      createDocument({ id: "replace", suiteId: "writer", title: "Replace" }),
    ),
  );
  const shell = view.GetWrtShell();
  const search = view.GetSearch();
  shell.Insert("cat cat cat");
  const start = new SwPosition(shell.GetActiveParagraph(), 4);
  const end = new SwPosition(start.GetNode(), 11);
  shell.SetPaM(end, start);
  start.Dispose();
  end.Dispose();
  try {
    const item = { ...search.GetSearchItem(), search: "cat", replacement: "catapult" };
    expect(search.ExecSearch(item, SvxSearchCmd.REPLACE, true)).toEqual({
      matches: 1,
      wrapped: false,
    });
    expect(shell.GetActiveParagraph().GetText()).toBe("cat cat catapult");
    expect(shell.GetCursor().Start().GetContentIndex()).toBe(4);
  } finally {
    view.Close();
  }
});

it("lists hidden paragraph collections when used or offered by the favourite pool path", /** Checks the native visible stylesheet pool and the two style lists. @returns Nothing. */ () => {
  const document = createWriterDocument();
  const view = new SwView(
    new SwDocShell(document, createDocument({ id: "styles", suiteId: "writer", title: "Styles" })),
  );
  const search = view.GetSearch();
  const used = document.GetTextFormatColl("heading-1");
  const unused = document.GetTextFormatColl("heading-2");
  const favourite = document.GetTextFormatColl("heading-3");
  favourite.SetHidden(true);
  favourite.SetFavourite(true);
  used.SetHidden(true);
  unused.SetHidden(true);
  view.GetWrtShell().SetParagraphStyle(used.id);
  const lists = search.GetParagraphStyles();
  expect(lists.search).toContainEqual({ id: used.id, name: used.GetName() });
  expect(lists.replace).toContainEqual({ id: used.id, name: used.GetName() });
  expect(lists.replace).not.toContainEqual({ id: unused.id, name: unused.GetName() });
  expect(lists.replace).toContainEqual({ id: favourite.id, name: favourite.GetName() });
  expect(lists.search).not.toContainEqual({ id: favourite.id, name: favourite.GetName() });
  view.Close();
});

it("resolves styles by display name and handles stale style requests", /** Exercises the source fallback collection and missing replacement paths. @returns Nothing. */ () => {
  const view = new SwView(
    new SwDocShell(
      createWriterDocument(),
      createDocument({ id: "styles", suiteId: "writer", title: "Styles" }),
    ),
  );
  const shell = view.GetWrtShell();
  const search = view.GetSearch();
  shell.Insert("Default style");
  const item = {
    ...search.GetSearchItem(),
    styleSearch: true,
    searchStyle: "Missing style",
    replaceStyle: "Heading 2",
  };
  expect(search.ExecSearch(item, SvxSearchCmd.REPLACE_ALL).matches).toBe(1);
  expect(shell.GetActiveParagraph().GetParagraphStyle()).toBe("heading-2");
  expect(
    search.ExecSearch(
      { ...item, searchStyle: "Heading 2", replaceStyle: "Missing style" },
      SvxSearchCmd.REPLACE_ALL,
    ).matches,
  ).toBe(1);
  expect(shell.GetActiveParagraph().GetParagraphStyle()).toBe("heading-2");
  search.ExecSearch({ ...item, replaceStyle: "Missing style" }, SvxSearchCmd.REPLACE);
  expect(shell.GetActiveParagraph().GetParagraphStyle()).toBe("default");
  view.Close();
});

it("finds protected cell text but skips it in text and style replacement", /** Uses the actual protected cell format for single and bulk view commands. @returns Nothing. */ () => {
  const view = new SwView(
    new SwDocShell(
      createWriterDocument(),
      createDocument({ id: "protection", suiteId: "writer", title: "Search" }),
    ),
  );
  const shell = view.GetWrtShell();
  const body = shell.GetActiveParagraph();
  body.SetText("needle body");
  const table = shell.InsertTable({ mnInsMode: 0, mnRowsToRepeat: 0 }, 1, 2);
  const [box, otherBox] = table?.GetTabLines()[0]?.GetTabBoxes() ?? [];
  const protectedText = box?.GetParagraphs()[0];
  const editableText = otherBox?.GetParagraphs()[0];
  if (!box || !protectedText || !editableText) throw new Error("Missing Writer cell content.");
  protectedText.SetText("needle protected");
  editableText.SetText("needle editable");
  const protect = new SvxProtectItem(RES_PROTECT);
  protect.SetContentProtect(true);
  box.ClaimFrameFormat().SetFormatAttr(protect);
  const search = view.GetSearch();
  const item = { ...search.GetSearchItem(), search: "needle", replacement: "match" };
  const start = new SwPosition(protectedText, 0);
  const end = new SwPosition(protectedText, 6);
  try {
    expect(search.ExecSearch(item, SvxSearchCmd.FIND_ALL).matches).toBe(3);
    shell.SetPaM(end, start);
    search.ExecSearch(item, SvxSearchCmd.REPLACE);
    expect(protectedText.GetText()).toBe("needle protected");
    expect(search.ExecSearch(item, SvxSearchCmd.REPLACE_ALL).matches).toBe(2);
    expect([protectedText.GetText(), editableText.GetText(), body.GetText()]).toEqual([
      "needle protected",
      "match editable",
      "match body",
    ]);
    const styleItem = {
      ...item,
      styleSearch: true,
      searchStyle: protectedText.GetParagraphStyle(),
      replaceStyle: "heading-1",
    };
    shell.SetPaM(end, start);
    search.ExecSearch(styleItem, SvxSearchCmd.REPLACE);
    expect(protectedText.GetParagraphStyle()).toBe(styleItem.searchStyle);
    expect(search.ExecSearch(styleItem, SvxSearchCmd.REPLACE_ALL).matches).toBe(1);
    expect(protectedText.GetParagraphStyle()).toBe(styleItem.searchStyle);
    expect(editableText.GetParagraphStyle()).toBe("heading-1");
  } finally {
    end.Dispose();
    start.Dispose();
    view.Close();
  }
});

it("finds anchored text in a protected fly and leaves it intact during Replace All", /** Uses the original fly format's protection bit with native search traversal. @returns Nothing. */ () => {
  const document = createWriterDocument();
  const view = new SwView(
    new SwDocShell(
      document,
      createDocument({ id: "protected-fly", suiteId: "writer", title: "Search" }),
    ),
  );
  const body = view.GetWrtShell().GetActiveParagraph();
  body.SetText("needle body");
  const anchor = new SwPosition(body, 0);
  const items = new SfxItemSet(document.GetAttrPool(), [[RES_FRMATR_BEGIN, RES_FRMATR_END - 1]]);
  const protect = new SvxProtectItem(RES_PROTECT);
  protect.SetContentProtect(true);
  items.Put(protect);
  const fly = MakeFlySection(document, RndStdIds.FLY_AT_PARA, anchor, items);
  items.Dispose();
  anchor.Dispose();
  const start = fly?.GetContent().GetContentIdx()?.GetNode();
  const text = start && document.nodes.at(start.GetIndex() + 1).GetTextNode();
  if (!text) throw new Error("Missing Writer text frame content.");
  text.SetText("needle frame");
  const search = view.GetSearch();
  const item = { ...search.GetSearchItem(), search: "needle", replacement: "edited" };
  expect(search.ExecSearch(item, SvxSearchCmd.FIND_ALL).matches).toBe(2);
  expect(search.ExecSearch(item, SvxSearchCmd.REPLACE_ALL).matches).toBe(1);
  expect(text.GetText()).toBe("needle frame");
  expect(body.GetText()).toBe("edited body");
  view.Close();
});

it("dispatches ExecuteSearch through the native view slot and honors Quiet", /** Exercises the actual generated command, nested SearchItem and repeat request. @returns Nothing. */ () => {
  const view = new SwView(
    new SwDocShell(
      createWriterDocument(),
      createDocument({ id: "execute-search", suiteId: "writer", title: "Search" }),
    ),
  );
  const frame = new SfxViewFrame<SwView>(new BrowserSfxDispatcher());
  view.AttachFrame(frame);
  frame.SetActiveView(view, [view.GetCommandShell(), view.GetWrtShell().GetCommandShell()]);
  const shell = view.GetWrtShell();
  shell.Insert("cat cat");
  const item = { ...view.GetSearch().GetSearchItem(), search: "cat" };
  expect(view.Execute(WRITER_COMMAND_IDS.executeSearch)).toMatchObject({ value: false });
  expect(
    view.Execute(WRITER_COMMAND_IDS.executeSearch, {
      SearchItem: { ...item, command: SvxSearchCmd.FIND_ALL, backward: false },
    }),
  ).toMatchObject({ value: true });
  expect(view.GetSearch().GetFeedback()).toMatchObject({ result: { matches: 2 } });
  expect(
    view.Execute(WRITER_COMMAND_IDS.executeSearch, {
      SearchItem: { ...item, command: SvxSearchCmd.FIND_ALL, backward: true },
      Quiet: true,
    }),
  ).toMatchObject({ value: true });
  expect(view.GetSearch().GetFeedback()).toBeUndefined();
  expect(view.Execute(WRITER_COMMAND_IDS.repeatSearch)).toMatchObject({ value: true });
  expect(view.GetSearch().GetFeedback()).toMatchObject({ backward: true });
  view.Close();
});

it("seeds SearchProperties once after SearchOn and saves the dialog state through SearchOff", /** Covers the modeless dialog slot lifecycle and the retained native search request. @returns Nothing. */ () => {
  const view = new SwView(
    new SwDocShell(
      createWriterDocument(),
      createDocument({ id: "search-properties", suiteId: "writer", title: "Search" }),
    ),
  );
  const frame = new SfxViewFrame<SwView>(new BrowserSfxDispatcher());
  view.AttachFrame(frame);
  frame.SetActiveView(view, [view.GetCommandShell(), view.GetWrtShell().GetCommandShell()]);
  const shell = view.GetWrtShell();
  shell.Insert("cat dog");
  view.Execute(WRITER_COMMAND_IDS.selectAll);
  const item = {
    ...view.GetSearch().GetSearchItem(),
    search: "cat",
    command: SvxSearchCmd.FIND,
    backward: true,
  };
  expect(view.Execute(WRITER_COMMAND_IDS.searchProperties, item).status).toBe("executed");
  expect(view.QueryState(WRITER_COMMAND_IDS.searchProperties).value).toMatchObject({
    search: "cat",
    backward: true,
  });
  expect(view.Execute(WRITER_COMMAND_IDS.searchOn).status).toBe("executed");
  expect(view.QueryState(WRITER_COMMAND_IDS.searchProperties).value).toMatchObject({
    search: "cat dog",
    selection: false,
  });
  const endOfText = new SwPosition(shell.GetActiveParagraph(), 7);
  shell.SetPaM(endOfText);
  endOfText.Dispose();
  expect(view.QueryState(WRITER_COMMAND_IDS.searchProperties).value).toMatchObject({
    search: "cat dog",
  });
  expect(
    view.Execute(WRITER_COMMAND_IDS.searchOff, { SearchItem: { ...item, search: "dog" } }).status,
  ).toBe("executed");
  expect(view.QueryState(WRITER_COMMAND_IDS.searchProperties).value).toMatchObject({
    search: "dog",
    backward: true,
  });
  expect(view.Execute(WRITER_COMMAND_IDS.repeatSearch)).toMatchObject({ value: true });
  expect(view.GetSearch().GetFeedback()).toMatchObject({ backward: true });
  view.Close();
});

it("publishes the native SearchOptions item through the view bindings", /** Covers the editable and read-only masks on a state-only slot. @returns Nothing. */ () => {
  const view = new SwView(
    new SwDocShell(
      createWriterDocument(),
      createDocument({ id: "search-options", suiteId: "writer", title: "Search" }),
    ),
  );
  const frame = new SfxViewFrame<SwView>(new BrowserSfxDispatcher());
  view.AttachFrame(frame);
  frame.SetActiveView(view, [view.GetCommandShell(), view.GetWrtShell().GetCommandShell()]);
  const command = WRITER_COMMAND_IDS.searchOptions;
  const state = view.QueryState(command);
  expect(state.value).toBeInstanceOf(SfxUInt16Item);
  const options = state.value as SfxUInt16Item;
  expect(options.Which()).toBe(10_281);
  expect(options.GetValue()).toBe(SearchOptionFlags.ALL);
  expect(view.Execute(command)).toMatchObject({ status: "disabled" });
  view.GetWrtShell().GetViewOptions().SetReadonly(true);
  expect((view.QueryState(command).value as SfxUInt16Item).GetValue()).toBe(
    SearchOptionFlags.ALL & ~(SearchOptionFlags.REPLACE | SearchOptionFlags.REPLACE_ALL),
  );
  view.Close();
});

describe("SwView frame ownership", /** Groups SwView frame ownership. @returns Test callback result. */ () => {
  it("requires one attached frame for dispatch and exposes its command state", /** Checks requires one attached frame for dispatch and exposes its command state. @returns Test callback result. */ () => {
    const shell = new SwDocShell(
      createWriterDocument(),
      createDocument({ id: "view", suiteId: "writer", title: "View" }),
    );
    const view = new SwView(shell);
    expect(
      /** Runs the test callback. @returns Test callback result. */ () => view.GetViewFrame(),
    ).toThrow(/not attached/);
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        view.Execute(WRITER_COMMAND_IDS.bold),
    ).toThrow(/not attached/);
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        view.QueryState(WRITER_COMMAND_IDS.bold),
    ).toThrow(/not attached/);
    expect(
      /** Runs the test callback. @returns Test callback result. */ () =>
        view.ToggleHorizontalRuler(),
    ).not.toThrow();
    const frame = new SfxViewFrame<SwView>(new BrowserSfxDispatcher());
    view.AttachFrame(frame);
    expect(
      /** Runs the test callback. @returns Test callback result. */ () => view.AttachFrame(frame),
    ).toThrow(/already attached/);
    frame.SetActiveView(view, [view.GetCommandShell(), view.GetWrtShell().GetCommandShell()]);
    expect(view.QueryCommand(WRITER_COMMAND_IDS.bold)?.id).toBe(WRITER_COMMAND_IDS.bold);
    expect(view.QueryState(WRITER_COMMAND_IDS.bold).enabled).toBe(true);
    expect(view.Execute(WRITER_COMMAND_IDS.bold).status).toBe("executed");
    view.Close();
    expect(
      /** Runs the test callback. @returns Test callback result. */ () => view.GetViewFrame(),
    ).toThrow(/not attached/);
  });

  it("keeps one layout root and invalidates it for Writer document changes", /** Checks shell-to-core layout invalidation. @returns Nothing. */ () => {
    const document = createWriterDocument();
    const shell = new SwDocShell(
      document,
      createDocument({ id: "layout-view", suiteId: "writer", title: "Layout" }),
    );
    const view = new SwView(shell);
    const layout = view.GetLayout();
    expect(view.GetEditWin().GetDoc()).toBe(document);
    const input = [
      {
        id: "node",
        lines: [{ start: 0, end: 1, height: 300 }],
        lowerSpacing: 0,
        upperSpacing: 0,
        contextualSpacing: false,
        style: "body-text",
      },
    ];
    const page = createDefaultWriterPageDescriptor("en-GB").GetValue();
    const info = document.GetLineNumberInfo().QueryValue();
    const initial = layout.Format(input, page, undefined, info);
    expect(layout.Format(input, page, undefined, info)).toBe(initial);
    view.GetWrtShell().Insert("x");
    const changed = layout.Format(input, page, undefined, info);
    expect(changed.revision).toBe(initial.revision + 1);
    expect(view.GetLayout()).toBe(layout);
    view.GetWrtShell().SetParagraphStyle("heading-1");
    expect(layout.Format(input, page, undefined, info).revision).toBe(changed.revision + 1);
    const node = document.paragraphs[0];
    if (node === undefined) throw new Error("Missing layout paragraph");
    document.NotifyModelChange({ kind: "attribute-set-changed", nodeIndex: node.GetIndex() });
    const attributed = layout.Format(input, page, undefined, info);
    document.NotifyModelChange({ kind: "node-inserted", index: node.GetIndex() });
    expect(layout.Format(input, page, undefined, info).revision).toBe(attributed.revision + 1);
    view
      .GetWrtShell()
      .CallSwClientNotify({ kind: "attribute-set-changed", nodeIndex: node.GetIndex() });
    expect(layout.Format(input, page, undefined, info).revision).toBe(attributed.revision + 2);
    view.Close();
  });
});
