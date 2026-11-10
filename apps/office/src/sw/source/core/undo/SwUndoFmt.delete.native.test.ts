/** @fileoverview Real generic paragraph-delete history, eager native value ownership, source restoration order and follow/default contracts. */
import { assert, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwDoc } from "../doc/doc";
import {
  SwUndoFormatDelete,
  SwUndoTextFormatCollDelete,
  SwUndoTextFormatCollCreate,
} from "./SwUndoFmt";
import { SwPoolFormatId as P, COLL_GET_RANGE_BITS } from "../../../inc/poolfmt";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { RES_UL_SPACE } from "../../../inc/hintids";
/** Creates only actual core/session/style owners. @param name - Original native name. @returns Real model and history owners. */
function fixture(name = "Deleted") {
  const session = createWriterDocumentSession(),
    document = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    root = document.GetDfltTextFormatColl(),
    parent = document.MakeTextFormatColl("Parent", root),
    style = document.MakeTextFormatColl(name, parent),
    manager = document.GetUndoManager();
  manager.Clear();
  return {
    session,
    document,
    shell,
    root,
    parent,
    style,
    manager,
    /** Releases the real existing session boundary. @returns Nothing. */ close() {
      session.Close();
    },
  };
}
it("records the real delete owner before actual collection removal and format destruction", /** Actual document entry owns history; no alternate deletion DTO or result provider is supplied. @returns Nothing. */ () => {
  const x = fixture("Deleted $& 字"),
    add = vi.spyOn(x.manager, "AddUndoAction"),
    death = vi.spyOn(x.style, "DisposeModify"),
    readName = vi.spyOn(x.style, "GetName");
  try {
    x.document.DelTextFormatColl(x.style);
    const action = x.manager.GetUndoAction();
    assert(action);
    expect(action).toBeInstanceOf(SwUndoTextFormatCollDelete);
    expect(action).toBeInstanceOf(SwUndoFormatDelete);
    expect(add).toHaveBeenCalledTimes(1);
    expect(death).toHaveBeenCalledTimes(1);
    expect(add.mock.invocationCallOrder[0]).toBeLessThan(
      death.mock.invocationCallOrder[0] as number,
    );
    const reads = readName.mock.calls.length;
    expect(action.GetComment()).toBe("Delete paragraph style: Deleted $& 字");
    expect(readName).toHaveBeenCalledTimes(reads);
    expect(x.document.FindTextFormatCollByName("Deleted $& 字")).toBeUndefined();
  } finally {
    x.close();
  }
});
it.each([false, true])(
  "restores actual direct items, parent and native auto %s/range bits across real cycles",
  /** Generic delete history re-creates through the actual family owner under manager recording suppression. @param auto - Native stored auto flag. @returns Nothing. */ (
    auto,
  ) => {
    const x = fixture();
    try {
      x.style.SetFormatAttr(new SvxULSpaceItem(17, 29, RES_UL_SPACE));
      x.style.SetAuto(auto);
      x.style.SetPoolFormatId(P.COLL_BULLET_LEVEL1);
      x.document.DelTextFormatColl(x.style);
      for (let cycle = 0; cycle < 3; cycle++) {
        expect(x.shell.Undo()).toBe(true);
        const result = x.document.FindTextFormatCollByName("Deleted");
        assert(result);
        expect(result.DerivedFrom()).toBe(x.parent);
        const item = result.GetAttrSet().Get(RES_UL_SPACE) as SvxULSpaceItem;
        expect([item.GetUpper(), item.GetLower()]).toEqual([17, 29]);
        expect(result.IsAuto()).toBe(auto);
        expect(result.GetPoolFormatId() & COLL_GET_RANGE_BITS).toBe(
          P.COLL_BULLET_LEVEL1 & COLL_GET_RANGE_BITS,
        );
        expect(result.GetPoolFormatId() & ~COLL_GET_RANGE_BITS).toBe(
          P.UNKNOWN & ~COLL_GET_RANGE_BITS,
        );
        expect(x.manager.GetRedoActionCount()).toBe(1);
        expect(x.manager.DoesUndo()).toBe(true);
        expect(x.shell.Redo()).toBe(true);
        expect(x.document.FindTextFormatCollByName("Deleted")).toBeUndefined();
        expect(x.manager.GetUndoActionCount()).toBe(1);
      }
    } finally {
      x.close();
    }
  },
);
it("copies items and flags in the source delete constructor, not at later undo time", /** Actual constructor snapshot is independent of subsequent still-live owner edits. @returns Nothing. */ () => {
  const x = fixture();
  try {
    x.style.SetFormatAttr(new SvxULSpaceItem(5, 9, RES_UL_SPACE));
    x.style.SetAuto(false);
    const action = new SwUndoTextFormatCollDelete(x.style, x.document);
    x.style.SetFormatAttr(new SvxULSpaceItem(100, 200, RES_UL_SPACE));
    x.style.SetAuto(true);
    const enabled = x.manager.DoesUndo();
    x.manager.DoUndo(false);
    try {
      x.document.DelTextFormatColl(x.style);
    } finally {
      x.manager.DoUndo(enabled);
    }
    x.manager.AddUndoAction(action);
    expect(x.shell.Undo()).toBe(true);
    const result = x.document.FindTextFormatCollByName("Deleted");
    assert(result);
    expect((result.GetAttrSet().Get(RES_UL_SPACE) as SvxULSpaceItem).GetUpper()).toBe(5);
    expect(result.IsAuto()).toBe(false);
  } finally {
    x.close();
  }
});
it("preserves a disabled native recording guard and creates no recursive delete actions", /** Source DoesUndo branch is tested on the actual manager. @returns Nothing. */ () => {
  const x = fixture();
  try {
    x.manager.DoUndo(false);
    x.document.DelTextFormatColl(x.style);
    expect(x.manager.DoesUndo()).toBe(false);
    expect(x.manager.GetUndoActionCount()).toBe(0);
    expect(x.document.FindTextFormatCollByName("Deleted")).toBeUndefined();
  } finally {
    x.close();
  }
});
it("never deletes the actual default or records its parentless state", /** Source default admission returns before history construction. @returns Nothing. */ () => {
  const x = fixture(),
    death = vi.spyOn(x.root, "DisposeModify");
  try {
    x.document.DelTextFormatColl(x.root);
    expect(death).not.toHaveBeenCalled();
    expect(x.manager.GetUndoActionCount()).toBe(0);
    expect(x.document.GetTextFormatColls()[0]).toBe(x.root);
  } finally {
    x.close();
  }
});
it("corrects actual nondefault next-style links while the source loop skips default slot zero", /** Original source iterator begins at one; actual default getter is not queried by this loop. @returns Nothing. */ () => {
  const document = new SwDoc(),
    root = document.GetDfltTextFormatColl(),
    target = document.MakeTextFormatColl("Target", root),
    owner = document.MakeTextFormatColl("Owner", root);
  owner.SetNextTextFormatColl(target);
  document.GetUndoManager().Clear();
  const query = vi.spyOn(root, "GetNextTextFormatColl");
  try {
    document.DelTextFormatColl(target);
    expect(owner.GetNextTextFormatColl()).toBe(owner);
    expect(query).not.toHaveBeenCalled();
  } finally {
    document.Dispose();
  }
});
it("looks up the saved parent name at undo instead of retaining its format pointer", /** Source allows the actual name lookup to be absent when the original parent was renamed. @returns Nothing. */ () => {
  const x = fixture();
  try {
    x.document.DelTextFormatColl(x.style);
    x.parent.SetFormatName("Renamed parent");
    const create = vi.spyOn(x.document, "MakeTextFormatColl");
    expect(x.shell.Undo()).toBe(true);
    expect(create).toHaveBeenCalledExactlyOnceWith("Deleted", undefined);
    const result = x.document.FindTextFormatCollByName("Deleted");
    assert(result);
    expect(result.DerivedFrom()).toBeUndefined();
    expect(x.shell.Redo()).toBe(true);
  } finally {
    x.close();
  }
});
it("applies the owned item snapshot before restoring the source auto flag", /** Actual call-through instrumentation observes native ordering without replacing creation results. @returns Nothing. */ () => {
  const x = fixture();
  try {
    x.style.SetAuto(true);
    x.style.SetFormatAttr(new SvxULSpaceItem(4, 8, RES_UL_SPACE));
    x.document.DelTextFormatColl(x.style);
    const actual = x.document.ChgFormat.bind(x.document);
    let restore: ReturnType<typeof vi.spyOn> | undefined;
    const change = vi.spyOn(x.document, "ChgFormat").mockImplementation(
      /** Preserves actual mutation while observing the real created owner. @param format - Native owner. @param set - Actual saved set. @returns Nothing. */ (
        format,
        set,
      ) => {
        expect(format.IsAuto()).toBe(false);
        restore = vi.spyOn(format, "SetAuto");
        actual(format, set);
      },
    );
    expect(x.shell.Undo()).toBe(true);
    assert(restore);
    expect(restore).toHaveBeenCalledExactlyOnceWith(true);
    expect(change.mock.invocationCallOrder[0]).toBeLessThan(
      restore.mock.invocationCallOrder[0] as number,
    );
  } finally {
    x.close();
  }
});
it("releases the actual owned saved set when real history is discarded", /** The snapshot is observed while alive through ChgFormat and only its disposal spy is queried afterwards. @returns Nothing. */ () => {
  const x = fixture();
  try {
    x.style.SetFormatAttr(new SvxULSpaceItem(1, 2, RES_UL_SPACE));
    x.document.DelTextFormatColl(x.style);
    const change = vi.spyOn(x.document, "ChgFormat");
    expect(x.shell.Undo()).toBe(true);
    const args = change.mock.calls[0];
    assert(args);
    const saved = args[1];
    expect(saved).toBeInstanceOf(SfxItemSet);
    const release = vi.spyOn(saved, "Dispose");
    x.manager.Clear();
    expect(release).toHaveBeenCalledTimes(1);
  } finally {
    x.close();
  }
});
it("preserves WRITER352 independent auto-update flag omission for delete history too", /** Source generic delete stores IsAuto but not the independent field. @returns Nothing. */ () => {
  const x = fixture();
  try {
    x.style.SetAuto(true);
    x.style.SetAutoUpdateOnDirectFormat(true);
    x.document.DelTextFormatColl(x.style);
    expect(x.shell.Undo()).toBe(true);
    const result = x.document.FindTextFormatCollByName("Deleted");
    assert(result);
    expect(result.IsAuto()).toBe(true);
    expect(result.IsAutoUpdateOnDirectFormat()).toBe(false);
  } finally {
    x.close();
  }
});
it.each(["create", "delete"] as const)(
  "retains the source paragraph follow-style omission in generic %s history",
  /** Original value item sets contain no paragraph follow-owner pointer. @param mode - Actual history family. @returns Nothing. */ (
    mode,
  ) => {
    const x = fixture();
    try {
      x.style.SetNextTextFormatColl(x.parent);
      if (mode === "create") {
        x.manager.AddUndoAction(new SwUndoTextFormatCollCreate(x.style, x.parent, x.document));
        expect(x.shell.Undo()).toBe(true);
        expect(x.shell.Redo()).toBe(true);
      } else {
        x.document.DelTextFormatColl(x.style);
        expect(x.shell.Undo()).toBe(true);
      }
      const result = x.document.FindTextFormatCollByName("Deleted");
      assert(result);
      expect(result.GetNextTextFormatColl()).toBe(result);
    } finally {
      x.close();
    }
  },
);
