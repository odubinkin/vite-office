/** @fileoverview Verifies Writer view attachment and command routing contracts. */

import { describe, expect, it, vi } from "vitest";

import { LanguageTag } from "../../../../i18nlangtag/inc/languagetag";
import { ABSOLUTE } from "../../../../offapi/com/sun/star/util/SearchAlgorithms2";
import {
  REG_NOT_BEGINOFLINE,
  REG_NOT_ENDOFLINE,
} from "../../../../offapi/com/sun/star/util/SearchFlags";
import { SvxSearchCmd } from "../../../../svl/inc/srchitem";
import { GetSettings } from "../../../../vcl/source/app/svapp";
import { SwPosition } from "../../core/crsr/pam";
import { SwCursor } from "../../core/crsr/swcrsr";
import { BrowserSfxDispatcher } from "../../../../framework/browser/dispatch/browser-dispatcher";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SfxViewFrame } from "../../../../sfx2/source/view/viewfrm";
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
