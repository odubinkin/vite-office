/** @fileoverview Verifies native paragraph StyleApply ownership, arguments and unsigned completion against independent literals. */

import { afterEach, describe, expect, it } from "vitest";
import { SfxRequest, createRequestArguments } from "../../../../sfx2/source/control/request";
import { SfxViewFrame } from "../../../../sfx2/source/view/viewfrm";
import { SfxUInt16Item, SfxInt16Item } from "../../../../svl/source/items/intitem";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { SfxUnoAnyItem } from "../../../../sfx2/source/view/frame";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { createWriterDocument } from "../../core/doc/doc";
import { SwPosition } from "../../core/crsr/pam";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwView } from "../uiview/view";
import { SwDocShell } from "./docsh";

const metadata = createDocument({ id: "style-owner", suiteId: "writer", title: "Styles" });
const fixtures: SwView[] = [];

/** Creates the real persistent document, view, frame and shell stack. @returns Native-shaped local owners. */
function fixture() {
  const owner = new SwDocShell(createWriterDocument(), metadata);
  const view = new SwView(owner);
  const frame = new SfxViewFrame<SwView>();
  view.AttachFrame(frame);
  frame.SetActiveView(view, [
    owner.GetCommandShell(),
    view.GetCommandShell(),
    view.GetWrtShell().GetCommandShell(),
    view.GetWrtShell().GetListShell().GetCommandShell(),
  ]);
  fixtures.push(view);
  const dispatch = frame.GetDispatcher();
  return { owner, view, frame, dispatch, shell: view.GetWrtShell() };
}

afterEach(
  /** Closes actual owner chains. @returns Nothing. */ () => {
    for (const view of fixtures.splice(0)) view.Close();
  },
);

/** Checks the exact native slot and unsigned result item. @param request - Executed request. @param result - Native expected family. @returns Nothing. */
function returned(request: SfxRequest, result: number): void {
  expect(request.IsDone()).toBe(true);
  expect(request.GetReturnValue()).toBeInstanceOf(SfxUInt16Item);
  expect(request.GetReturnValue()?.Which()).toBe(5552);
  expect((request.GetReturnValue() as SfxUInt16Item).GetValue()).toBe(result);
}

describe("SwDocShell native paragraph StyleApply", /** Groups source-owned request contracts. @returns Nothing. */ () => {
  it("registers slot5552 solely in the document owner and preserves its completed unsigned return", /** Checks real shell-stack ownership and completion. @returns Nothing. */ () => {
    const { owner, dispatch, shell } = fixture();
    const command = owner.GetCommandShell().ResolveSlot(5552);
    expect(dispatch.QuerySlot(5552)?.slot).toBe(command?.slot);
    expect(command?.slot.commandUrl).toBe(".uno:StyleApply");
    expect(command?.slot.capabilityId).toBe("CAP-0112");
    expect(shell.GetCommandShell().ResolveSlot(5552)).toBeUndefined();
    expect(owner.GetCommandShell()).toBe(owner.GetCommandShell());
    const request = new SfxRequest(5552, [
      new SfxStringItem(5552, "Heading 2"),
      new SfxUInt16Item(5553, 2),
    ]);
    expect(dispatch.ExecuteRequest(request)).toEqual({
      commandId: ".uno:StyleApply",
      status: "executed",
      value: 2,
    });
    returned(request, 2);
    expect(shell.GetActiveParagraph().GetParagraphStyle()).toBe("heading-2");
    expect(dispatch.QueryState(".uno:StyleApply")).toEqual({ enabled: true, value: "heading-2" });
  });

  it.each([
    { Template: "Heading 1" },
    { Template: "Heading 1", Family: 2 },
    { Template: "Heading 1", Family: "2" },
    { Template: "Heading 1", Family: 32, FamilyName: "ParagraphStyles" },
    { Template: "Heading 1", Family: "bad", FamilyName: "ParagraphStyles" },
    { Template: "Heading 1", FamilyName: "UnknownFamily" },
    { Template: "Heading 1", FamilyName: 9 },
    { Style: "Heading 1", FamilyName: "ParagraphStyles" },
    { Template: "Heading 2", Style: "Heading 1", FamilyName: "ParagraphStyles" },
    { Template: "Heading 1", Style: "missing", FamilyName: "ParagraphStyles" },
    { Template: "Heading 1", Style: 9, FamilyName: "ParagraphStyles" },
    { Template: "Heading 1", Style: "Heading 2" },
  ])(
    "honors ordinary default and precedence arguments %j",
    /** Checks independent paragraph ID and native family result. @param payload - Request arguments. @returns Nothing. */ (
      payload,
    ) => {
      const { dispatch, shell } = fixture();
      const request = new SfxRequest(5552, createRequestArguments(5552, payload));
      expect(dispatch.ExecuteRequest(request).status).toBe("executed");
      returned(request, 2);
      expect(shell.GetActiveParagraph().GetParagraphStyle()).toBe("heading-1");
    },
  );

  it("accepts typed native IDs, valid paired conversion and URL fields without presentation Any loss", /** Checks all four exact argument identities. @returns Nothing. */ () => {
    const { dispatch, shell } = fixture();
    const request = new SfxRequest(5552, [
      new SfxStringItem(5552, "Heading 2"),
      new SfxUInt16Item(5553, 8),
      new SfxStringItem(5566, "ParagraphStyles"),
      new SfxStringItem(6703, "Heading 1"),
    ]);
    dispatch.ExecuteRequest(request);
    returned(request, 2);
    expect(shell.GetActiveParagraph().GetParagraphStyle()).toBe("heading-1");
    expect(
      dispatch.Execute(".uno:StyleApply?Template:string=Heading%202&Family:short=2"),
    ).toMatchObject({ status: "executed", value: 2 });
    expect(shell.GetActiveParagraph().GetParagraphStyle()).toBe("heading-2");
    dispatch.Execute(".uno:StyleApply?Style:string=Standard&FamilyName:string=ParagraphStyles");
    expect(shell.GetActiveParagraph().GetParagraphStyle()).toBe("default");
  });

  it.each([
    0,
    1,
    4,
    8,
    16,
    32,
    64,
    65535,
    -1,
    65536,
    1.5,
    NaN,
    null,
    true,
    "bad",
    "2.0",
    "-2",
    "65536",
  ])(
    "does not apply an unsupported numeric family %s",
    /** Keeps the current graph and history when the family is unsupported. @param family - Unsupported family. @returns Nothing. */ (
      family,
    ) => {
      const { dispatch, shell, owner } = fixture();
      const count = owner.GetDoc().GetTextFormatColls().length;
      const request = new SfxRequest(
        5552,
        createRequestArguments(5552, { Template: "Heading 1", Family: family }),
      );
      dispatch.ExecuteRequest(request);
      returned(request, 0);
      expect(shell.GetActiveParagraph().GetParagraphStyle()).toBe("default");
      expect(owner.GetDoc().GetTextFormatColls()).toHaveLength(count);
      expect(shell.Undo()).toBe(false);
    },
  );

  it.each(["CharacterStyles", "FrameStyles", "PageStyles", "NumberingStyles", "TableStyles"])(
    "does not reinterpret %s as a paragraph family",
    /** Keeps native named-family precedence without implementing unsupported families. @param family - Named family. @returns Nothing. */ (
      family,
    ) => {
      const { dispatch, shell } = fixture();
      const request = new SfxRequest(
        5552,
        createRequestArguments(5552, {
          Template: "Heading 1",
          Family: 2,
          FamilyName: family,
          Style: "Heading 2",
        }),
      );
      dispatch.ExecuteRequest(request);
      returned(request, 0);
      expect(shell.GetActiveParagraph().GetParagraphStyle()).toBe("default");
      expect(shell.Undo()).toBe(false);
    },
  );

  it.each([
    undefined,
    null,
    false,
    9,
    {},
    { Style: "Heading 1" },
    { Style: "missing", FamilyName: "ParagraphStyles" },
    { Template: "" },
    { Template: 9 },
  ])(
    "ignores missing template payload %j without creating a style",
    /** Checks direct owner missing-argument completion remains absent. @param payload - Missing arguments. @returns Nothing. */ (
      payload,
    ) => {
      const { owner, shell } = fixture();
      const request = new SfxRequest(5552, createRequestArguments(5552, payload));
      expect(owner.ExecStyleSheet(request)).toBeUndefined();
      expect(request.IsDone()).toBe(false);
      expect(shell.GetActiveParagraph().GetParagraphStyle()).toBe("default");
      expect(shell.Undo()).toBe(false);
    },
  );

  it.each(["missing", "heading 1", " Heading 1", "Heading 1 "])(
    "rejects the exact unknown display name %s without creating owners",
    /** Checks missing or altered names never normalize to another owner. @param name - Unknown name. @returns Nothing. */ (
      name,
    ) => {
      const { dispatch, owner, shell } = fixture();
      const count = owner.GetDoc().GetTextFormatColls().length;
      const request = new SfxRequest(5552, [new SfxStringItem(5552, name)]);
      dispatch.ExecuteRequest(request);
      returned(request, 0);
      expect(owner.GetDoc().GetTextFormatColls()).toHaveLength(count);
      expect(shell.Undo()).toBe(false);
    },
  );

  it("retains exact custom owners, renamed builtin display names and programmatic conversion precedence", /** Checks identity survives display names with native pool collisions. @returns Nothing. */ () => {
    const { owner, dispatch, shell } = fixture();
    const doc = owner.GetDoc();
    const custom = doc.MakeTextFormatColl(
      "Heading 3",
      doc.GetDfltTextFormatColl(),
      "owned-heading",
    );
    dispatch.Execute(".uno:StyleApply", { Template: "Heading 3", Family: 2 });
    expect(shell.GetActiveParagraph().GetTextFormatColl()).toBe(custom);
    custom.SetFormatName("  Raw style / Ω  ");
    dispatch.Execute(".uno:StyleApply", {
      Template: "Heading 1",
      Style: "owned-heading",
      FamilyName: "ParagraphStyles",
    });
    expect(shell.GetActiveParagraph().GetTextFormatColl()).toBe(custom);
    expect(shell.GetActiveParagraph().GetTextFormatColl().GetName()).toBe("  Raw style / Ω  ");
    const builtin = doc.GetTextFormatColl("heading-2");
    builtin.SetFormatName("Renamed native");
    dispatch.Execute(".uno:StyleApply", { Style: "Heading 2", FamilyName: "ParagraphStyles" });
    expect(shell.GetActiveParagraph().GetTextFormatColl()).toBe(builtin);
    expect(dispatch.Execute(".uno:StyleApply", { Template: "Heading 2" })).toMatchObject({
      value: 0,
    });
    expect(shell.GetActiveParagraph().GetTextFormatColl()).toBe(builtin);
    doc.MakeTextFormatColl("", undefined, "empty-owned");
    expect(
      dispatch.Execute(".uno:StyleApply", { Style: "empty-owned", FamilyName: "ParagraphStyles" }),
    ).toMatchObject({ value: undefined });
  });

  it("records native repeated success and preserves point/mark and paragraph history", /** Checks the retained paragraph primitive and exact history. @returns Nothing. */ () => {
    const { owner, dispatch, shell } = fixture();
    shell.Insert("Alpha");
    shell.SplitNode();
    shell.Insert("Bravo");
    const first = owner.GetDoc().paragraphs[0];
    if (first === undefined) throw new Error("Missing first paragraph");
    shell.SetPaM(new SwPosition(first, 4), new SwPosition(first, 1));
    const cursor = shell.GetCursor();
    const request = new SfxRequest(5552, [new SfxStringItem(5552, "Heading 1")]);
    dispatch.ExecuteRequest(request);
    returned(request, 2);
    expect(cursor.GetPoint().GetContentIndex()).toBe(4);
    expect(cursor.GetMark().GetContentIndex()).toBe(1);
    expect(
      owner
        .GetDoc()
        .paragraphs.map(
          /** Reads actual paragraph identities. @param node - Paragraph. @returns Style ID. */ (
            node,
          ) => node.GetParagraphStyle(),
        ),
    ).toEqual(["heading-1", "default"]);
    const noOp = new SfxRequest(5552, [new SfxStringItem(5552, "Heading 1")]);
    dispatch.ExecuteRequest(noOp);
    returned(noOp, 2);
    expect(shell.Undo()).toBe(true);
    expect(first.GetParagraphStyle()).toBe("heading-1");
    expect(shell.Undo()).toBe(true);
    expect(first.GetParagraphStyle()).toBe("default");
    expect(shell.Redo()).toBe(true);
    expect(first.GetParagraphStyle()).toBe("heading-1");
    expect(shell.GetCursor()).toBe(cursor);
    expect(cursor.GetPoint().GetContentIndex()).toBe(5);
    expect(cursor.GetMark().GetContentIndex()).toBe(0);
  });

  it("follows the replacement graph, isolates documents and drops active view eligibility on detach or close", /** Checks owner lifetime and canonical graph replacement. @returns Nothing. */ () => {
    const a = fixture(),
      b = fixture();
    a.dispatch.Execute(".uno:StyleApply", { Template: "Heading 1" });
    expect(b.shell.GetActiveParagraph().GetParagraphStyle()).toBe("default");
    const stable = a.owner.GetCommandShell();
    a.owner.InitNew(metadata);
    expect(a.owner.GetCommandShell()).toBe(stable);
    expect(a.dispatch.QueryState(".uno:StyleApply").value).toBe("default");
    a.dispatch.Execute(".uno:StyleApply", { Template: "Heading 2" });
    expect(a.shell.GetActiveParagraph().GetParagraphStyle()).toBe("heading-2");
    a.owner.SetView(undefined);
    expect(a.owner.GetWrtShell()).toBeUndefined();
    expect(a.owner.ApplyStyles("Heading 1", 2)).toBe(0);
    expect(a.dispatch.QueryState(".uno:StyleApply")).toEqual({ enabled: false, value: undefined });
    expect(a.dispatch.Execute(".uno:StyleApply", { Template: "Heading 1" }).status).toBe(
      "disabled",
    );
    a.owner.SetView(a.view);
    expect(a.owner.GetWrtShell()).toBe(a.shell);
    a.owner.Close();
    expect(a.owner.GetWrtShell()).toBeUndefined();
    expect(a.dispatch.QueryState(".uno:StyleApply").enabled).toBe(false);
    expect(a.owner.ExecStyleSheet(new SfxRequest(5553))).toBeUndefined();
    expect(b.dispatch.Execute(".uno:StyleApply", { Template: "Heading 1" })).toMatchObject({
      value: 2,
    });
  });

  it("handles non-string native items safely and retains the default display owner", /** Checks pooled request types and default exact name. @returns Nothing. */ () => {
    const { dispatch, shell, owner } = fixture();
    const args: SfxPoolItem[] = [
      new SfxInt16Item(5553, 2),
      new SfxUnoAnyItem(5552, { Template: "Heading 1" }),
    ];
    dispatch.ExecuteRequest(new SfxRequest(5552, args));
    expect(shell.GetActiveParagraph().GetParagraphStyle()).toBe("heading-1");
    const wrong = new SfxRequest(5552, [new SfxUInt16Item(5552, 2)]);
    expect(owner.ExecStyleSheet(wrong)).toBeUndefined();
    dispatch.Execute(".uno:StyleApply", { Template: "Default Paragraph Style", Family: 2 });
    expect(shell.GetActiveParagraph().GetParagraphStyle()).toBe("default");
  });

  it("registers the actual production browser document-shell owner and family-return contract", /** Checks the shipped session composition rather than a synthetic widget. @returns Nothing. */ () => {
    const session = createWriterDocumentSession();
    try {
      const dispatcher = session.frame.GetDispatcher();
      expect(dispatcher.QuerySlot(5552)?.slot).toBe(
        session.docShell.GetCommandShell().ResolveSlot(5552)?.slot,
      );
      expect(session.view.GetWrtShell().GetCommandShell().ResolveSlot(5552)).toBeUndefined();
      const request = new SfxRequest(5552, [
        new SfxStringItem(5552, "Heading 1"),
        new SfxUInt16Item(5553, 2),
      ]);
      dispatcher.ExecuteRequest(request);
      returned(request, 2);
      expect(session.view.GetWrtShell().GetActiveParagraph().GetParagraphStyle()).toBe("heading-1");
    } finally {
      session.Close();
    }
  });
});
