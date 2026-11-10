/** @fileoverview Source format-create base and actual paragraph subtype over real document/style/history owners; no synthetic style/factory/state providers. */
import { assert, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwUndoFormatCreate, SwUndoTextFormatCollCreate } from "./SwUndoFmt";
import { SwFrameFormat } from "../layout/atrfrm";
import { SwUndoFormatAttr } from "./unattr";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { RES_UL_SPACE } from "../../../inc/hintids";
import { SwPoolFormatId as P, COLL_GET_RANGE_BITS } from "../../../inc/poolfmt";
/** Creates actual session and records native paragraph creation in its real history manager. @param name - Original name. @returns Real owners. */
function fixture(name = "Created") {
  const session = createWriterDocumentSession(),
    document = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    parent = document.GetDfltTextFormatColl(),
    style = document.MakeTextFormatColl(name, parent),
    action = new SwUndoTextFormatCollCreate(style, parent, document);
  document.GetUndoManager().Clear();
  document.GetUndoManager().AddUndoAction(action);
  return {
    session,
    document,
    shell,
    parent,
    style,
    action,
    /** Releases the actual shell session through its existing owner. @returns Nothing. */ close() {
      session.Close();
    },
  };
}
it("uses the source generic base and actual ordered name rewriter", /** No alternative per-family item snapshot remains. @returns Nothing. */ () => {
  const x = fixture();
  try {
    expect(x.action).toBeInstanceOf(SwUndoFormatCreate);
    expect(x.action.GetComment()).toBe("Create paragraph style: Created");
  } finally {
    x.close();
  }
});
it("captures name at undo time after a real rename if no comment was requested", /** Native constructor stores the pointer and parent name, leaving the new name empty. @returns Nothing. */ () => {
  const x = fixture();
  try {
    x.style.SetFormatName("Renamed");
    expect(x.shell.Undo()).toBe(true);
    expect(x.document.FindTextFormatCollByName("Renamed")).toBeUndefined();
    expect(x.shell.Redo()).toBe(true);
    const style = x.document.FindTextFormatCollByName("Renamed");
    assert(style);
    expect(style.DerivedFrom()).toBe(x.parent);
  } finally {
    x.close();
  }
});
it("caches the native comment on first request through the original SwUndo owner", /** Source default SwUndo comment caching freezes its first resource substitution. @returns Nothing. */ () => {
  const x = fixture();
  try {
    expect(x.action.GetComment()).toBe("Create paragraph style: Created");
    x.style.SetFormatName("Later");
    expect(x.action.GetComment()).toBe("Create paragraph style: Created");
  } finally {
    x.close();
  }
});
it.each([false, true])(
  "captures current direct items and native auto %s/range bits through ChgFormat",
  /** Stored state is source-owned, not an eager creation DTO. @param auto - Actual native flag. @returns Nothing. */ (
    auto,
  ) => {
    const x = fixture();
    try {
      x.style.SetFormatAttr(new SvxULSpaceItem(31, 47, RES_UL_SPACE));
      x.style.SetAuto(auto);
      x.style.SetPoolFormatId(P.COLL_BULLET_LEVEL1);
      const change = vi.spyOn(x.document, "ChgFormat");
      expect(x.shell.Undo()).toBe(true);
      expect(x.document.FindTextFormatCollByName("Created")).toBeUndefined();
      expect(x.shell.Redo()).toBe(true);
      const style = x.document.FindTextFormatCollByName("Created");
      assert(style);
      expect((style.GetAttrSet().Get(RES_UL_SPACE) as SvxULSpaceItem).GetUpper()).toBe(31);
      expect((style.GetAttrSet().Get(RES_UL_SPACE) as SvxULSpaceItem).GetLower()).toBe(47);
      expect(style.IsAuto()).toBe(auto);
      expect(style.GetPoolFormatId() & COLL_GET_RANGE_BITS).toBe(
        P.COLL_BULLET_LEVEL1 & COLL_GET_RANGE_BITS,
      );
      expect(style.GetPoolFormatId() & ~COLL_GET_RANGE_BITS).toBe(P.UNKNOWN & ~COLL_GET_RANGE_BITS);
      expect(change).toHaveBeenCalledExactlyOnceWith(style, expect.any(SfxItemSet));
      expect(x.document.GetUndoManager().GetUndoActionCount()).toBe(1);
    } finally {
      x.close();
    }
  },
);
it("repeats real undo/redo cycles and releases replaced saved item sets exactly once", /** Actual cloned set disposal is observed while owned, with no access to destroyed styles. @returns Nothing. */ () => {
  const x = fixture();
  const clones: SfxItemSet[] = [];
  const releases: ReturnType<typeof vi.spyOn>[] = [];
  try {
    for (let cycle = 0; cycle < 3; cycle++) {
      const style = x.document.FindTextFormatCollByName("Created");
      assert(style);
      style.SetFormatAttr(new SvxULSpaceItem(cycle + 1, cycle + 2, RES_UL_SPACE));
      expect(x.shell.Undo()).toBe(true);
      const put = vi.spyOn(x.document, "ChgFormat");
      expect(x.shell.Redo()).toBe(true);
      const call = put.mock.calls[0];
      assert(call);
      clones.push(call[1]);
      releases.push(vi.spyOn(call[1], "Dispose"));
      put.mockRestore();
    }
    expect(clones).toHaveLength(3);
    expect(releases[0]).toHaveBeenCalledTimes(1);
    expect(releases[1]).toHaveBeenCalledTimes(1);
    expect(releases[2]).not.toHaveBeenCalled();
    x.document.GetUndoManager().Clear();
    expect(releases[2]).toHaveBeenCalledTimes(1);
  } finally {
    x.close();
  }
});
it("resolves absent original parent names at redo without retaining a deleted parent pointer", /** Actual parent deletion under a real recording guard exercises the native optional lookup branch. @returns Nothing. */ () => {
  const x = fixture();
  try {
    const parent = x.document.MakeTextFormatColl("Parent", x.parent),
      child = x.document.MakeTextFormatColl("Child", parent),
      action = new SwUndoTextFormatCollCreate(child, parent, x.document),
      undo = x.document.GetUndoManager();
    undo.Clear();
    undo.AddUndoAction(action);
    expect(x.shell.Undo()).toBe(true);
    const enabled = undo.DoesUndo();
    undo.DoUndo(false);
    try {
      x.document.DelTextFormatColl(parent);
    } finally {
      undo.DoUndo(enabled);
    }
    const create = vi.spyOn(x.document, "MakeTextFormatColl");
    expect(x.shell.Redo()).toBe(true);
    expect(create).toHaveBeenCalledExactlyOnceWith("Child", undefined);
    const result = x.document.FindTextFormatCollByName("Child");
    assert(result);
    expect(result.DerivedFrom()).toBeUndefined();
  } finally {
    x.close();
  }
});

it("restores non-anchor ordinary frame item deltas through actual generic family lookup", /** Real ordinary frame and ChgFormat state/helper path; volatile/anchor/fly-layout responsibilities remain outside this test. @returns Nothing. */ () => {
  const x = fixture(),
    frame = new SwFrameFormat(
      x.document.GetAttrPool(),
      "Ordinary",
      undefined,
      x.document.GetDfltFrameFormat(),
    );
  x.document.GetFrameFormats().push_back(frame);
  try {
    frame.SetFormatAttr(new SvxULSpaceItem(10, 20, RES_UL_SPACE));
    x.document.GetUndoManager().Clear();
    const set = new SfxItemSet(frame.GetAttrSet());
    set.Put(new SvxULSpaceItem(30, 40, RES_UL_SPACE));
    x.document.ChgFormat(frame, set);
    set.Dispose();
    expect(x.document.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(x.document.GetUndoManager().GetUndoAction()).toBeInstanceOf(SwUndoFormatAttr);
    expect(x.shell.Undo()).toBe(true);
    expect((frame.GetAttrSet().Get(RES_UL_SPACE) as SvxULSpaceItem).GetUpper()).toBe(10);
    expect(x.shell.Redo()).toBe(true);
    expect((frame.GetAttrSet().Get(RES_UL_SPACE) as SvxULSpaceItem).GetUpper()).toBe(30);
  } finally {
    x.close();
  }
});

it("preserves the source omission of the independent auto-update-on-direct-format flag", /** WRITER352: source generic create history restores IsAuto but leaves the new owner's independent auto-update flag at its native false default. @returns Nothing. */ () => {
  const x = fixture();
  try {
    x.style.SetAuto(true);
    x.style.SetAutoUpdateOnDirectFormat(true);
    expect(x.shell.Undo()).toBe(true);
    expect(x.shell.Redo()).toBe(true);
    const result = x.document.FindTextFormatCollByName("Created");
    assert(result);
    expect(result.IsAuto()).toBe(true);
    expect(result.IsAutoUpdateOnDirectFormat()).toBe(false);
  } finally {
    x.close();
  }
});
