/** @fileoverview Verifies attached removal and level-change owner traversal using actual Writer records without upstream access. */
import { expect, it, vi } from "vitest";
import type { SwDoc } from "../doc/doc";
import { createWriterDocument } from "../doc/doc";
import { applyWriterParagraphList } from "../doc/list";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwNodeNum } from "./SwNodeNum";
import type { SwNumberTreeNode } from "./SwNumberTree";

/** Reports exact type equality. */
type Same<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const contracts: [
  Same<Parameters<SwNumberTreeNode["RemoveMe"]>, [SwDoc]>,
  Same<ReturnType<SwNumberTreeNode["RemoveMe"]>, void>,
  Same<Parameters<SwNumberTreeNode["SetLevelInListTree"]>, [number, SwDoc]>,
  Same<ReturnType<SwNumberTreeNode["SetLevelInListTree"]>, void>,
] = [true, true, true, true];
/** Observes protected ownership only in tests. */
interface Diagnostic {
  /** Gets the attached root. @returns Root pointer. */
  GetRoot(): SwNumberTreeNode | undefined;
  /** Removes empty phantom ancestors. @returns Nothing. */
  ClearObsoletePhantoms(): void;
  /** Reads phantom-only descendants. @returns Policy. */
  HasOnlyPhantoms(): boolean;
  /** Notifies a real record. @returns Nothing. */
  NotifyNode(): void;
}
/** Reads protected diagnostics. @param node - Owner. @returns View. */
function probe(node: SwNumberTreeNode): Diagnostic {
  return node as unknown as Diagnostic;
}
/** Requires a fixture value. @param value - Candidate. @returns Present value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing reparent policy owner");
  return value;
}
/** Creates actual list records under reading suppression. @param levels - Paragraph levels. @returns Owners. */
function fixture(levels: number[]) {
  const document = createWriterDocument();
  document.SetInReading(true);
  const rule = document.EnsureNumRule("ReparentPolicy", "numbered");
  for (let level = 0; level < 10; level++) {
    const format = rule.Get(level).clone();
    format.SetStart(7);
    rule.Set(level, format);
  }
  const texts = levels.map(
    /** Allocates a canonical paragraph. @param level - List depth. @param index - Ordinal. @returns Text. */
    (level, index) => {
      const text = index === 0 ? required(document.paragraphs[0]) : document.nodes.MakeTextNode();
      applyWriterParagraphList(text, {
        kind: "numbered",
        level,
        styleId: "ReparentPolicy",
        listId: "reparent-policy",
      });
      return text;
    },
  );
  const records = texts.map(
    /** Gets actual ownership. @param text - Paragraph. @returns Record. */ (text) =>
      required(text.GetNum()),
  );
  return { document, texts, records, rule, root: required(probe(required(records[0])).GetRoot()) };
}
/** Captures clients and numbered-item registration. @param owners - Fixture. @returns Ordered membership. */
function membership(owners: ReturnType<typeof fixture>) {
  const clients: SwTextNode[] = [],
    registered: SwNodeNum[] = [];
  owners.rule.GetTextNodeList(clients);
  owners.document.getIDocumentListItems().getNumItems(registered);
  return { clients, registered };
}

it("requires explicit void contracts and retains negative and unattached no-op branches", /** Checks release guards without inventing debug assertion calls. @returns Nothing. */ () => {
  expect(contracts).toEqual([true, true, true, true]);
  const document = createWriterDocument(),
    orphan = new SwNodeNum(document.nodes.MakeTextNode(), false);
  try {
    const parent = vi.spyOn(orphan, "GetParent"),
      level = vi.spyOn(orphan, "GetLevelInListTree"),
      root = vi.spyOn(probe(orphan), "GetRoot"),
      remove = vi.spyOn(orphan, "RemoveMe");
    orphan.SetLevelInListTree(-1, document);
    expect(parent).not.toHaveBeenCalled();
    orphan.SetLevelInListTree(0, document);
    expect(parent.mock.calls).toEqual([[]]);
    expect(level).not.toHaveBeenCalled();
    expect(root).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    orphan.RemoveMe(document);
    expect(parent.mock.calls).toEqual([[]]);
    expect(orphan.GetNumber(false)).toBe(0);
    expect(orphan.GetChildCount()).toBe(0);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("checks attached parent before same-level comparison without removal or root lookup", /** Covers attached negative and same-level no-op policy order. @returns Nothing. */ () => {
  const owners = fixture([1]),
    { document, records } = owners;
  try {
    const child = required(records[0]),
      before = membership(owners),
      parent = child.GetParent.bind(child),
      level = child.GetLevelInListTree.bind(child),
      trace: string[] = [];
    vi.spyOn(child, "GetParent").mockImplementation(
      /** Observes native guard. @returns Parent. */ () => {
        trace.push("parent");
        return parent();
      },
    );
    vi.spyOn(child, "GetLevelInListTree").mockImplementation(
      /** Observes level policy. @returns Level. */ () => {
        trace.push("level");
        return level();
      },
    );
    const root = vi.spyOn(probe(child), "GetRoot"),
      remove = vi.spyOn(child, "RemoveMe");
    child.SetLevelInListTree(-1, document);
    expect(trace).toEqual([]);
    child.SetLevelInListTree(1, document);
    expect(trace).toEqual(["parent", "level"]);
    expect(root).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    expect(membership(owners)).toEqual(before);
    expect(child.GetNumberVector()).toEqual([7, 7]);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("climbs every phantom owner through GetParent after removal and before cleanup", /** Observes genuine three-level phantom traversal while separating cleanup helper calls. @returns Nothing. */ () => {
  const owners = fixture([3]),
    { document, records, root, texts } = owners;
  try {
    const child = required(records[0]),
      near = required(child.GetParent()),
      middle = required(near.GetParent()),
      outer = required(middle.GetParent()),
      ancestors = [near, middle, outer],
      trace: string[] = [];
    let climbing = false;
    const remove = near.RemoveChild.bind(near),
      cleanup = probe(root).ClearObsoletePhantoms.bind(probe(root));
    vi.spyOn(near, "RemoveChild").mockImplementation(
      /** Runs real removal before observing ascent. @param node - Removed record. @param context - Operation document. @returns Nothing. */ (
        node,
        context,
      ) => {
        expect(node).toBe(child);
        expect(context).toBe(document);
        remove(node, context);
        trace.push("removed");
        climbing = true;
      },
    );
    ancestors.forEach(
      /** Observes each retained phantom parent. @param node - Ancestor. @param index - Climb ordinal. @returns Nothing. */ (
        node,
        index,
      ) => {
        const parent = node.GetParent.bind(node);
        vi.spyOn(node, "GetParent").mockImplementation(
          /** Records only the post-removal climb. @returns Parent. */ () => {
            if (climbing) trace.push(`parent:${index}`);
            return parent();
          },
        );
      },
    );
    vi.spyOn(probe(root), "ClearObsoletePhantoms").mockImplementation(
      /** Delegates actual cleanup after ascent. @returns Nothing. */ () => {
        trace.push("cleanup");
        climbing = false;
        cleanup();
      },
    );
    child.RemoveMe(document);
    expect(trace).toEqual(["removed", "parent:0", "parent:1", "parent:2", "cleanup"]);
    expect(child.GetParent()).toBeUndefined();
    expect(root.GetChildCount()).toBe(0);
    expect(membership(owners)).toEqual({ clients: [], registered: [] });
    expect(required(texts[0]).GetNum()).toBe(child);
    expect(child.GetNumRule()).toBeUndefined();
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("terminates the nullable parent release boundary without invoking cleanup", /** Isolates the release null-pointer guard using an owned phantom helper spy, not a native extension ABI. @returns Nothing. */ () => {
  const owners = fixture([1]),
    { document, records, root } = owners;
  try {
    const child = required(records[0]),
      phantom = required(child.GetParent()),
      remove = phantom.RemoveChild.bind(phantom),
      parent = phantom.GetParent.bind(phantom);
    let removed = false;
    vi.spyOn(phantom, "RemoveChild").mockImplementation(
      /** Removes the actual child before introducing the nullable boundary. @param node - Child. @param context - Document. @returns Nothing. */ (
        node,
        context,
      ) => {
        remove(node, context);
        removed = true;
      },
    );
    const lookup = vi
      .spyOn(phantom, "GetParent")
      .mockImplementation(
        /** Supplies only the post-removal null boundary. @returns Parent or absent pointer. */ () =>
          removed ? undefined : parent(),
      );
    const phantomCleanup = vi.spyOn(probe(phantom), "ClearObsoletePhantoms"),
      rootCleanup = vi.spyOn(probe(root), "ClearObsoletePhantoms");
    child.RemoveMe(document);
    expect(lookup).toHaveReturnedWith(undefined);
    expect(phantomCleanup).not.toHaveBeenCalled();
    expect(rootCleanup).not.toHaveBeenCalled();
    expect(child.GetParent()).toBeUndefined();
    expect(phantom.GetChildCount()).toBe(0);
    expect(membership(owners)).toEqual({ clients: [], registered: [] });
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("stops at a real owner and preserves its remaining child and list membership", /** Covers real-parent cleanup with an owned sibling still attached. @returns Nothing. */ () => {
  const owners = fixture([0, 1, 1]),
    { document, records, texts, root } = owners;
  try {
    const parent = required(records[0]),
      removed = required(records[1]),
      remaining = required(records[2]),
      cleanup = vi.spyOn(probe(parent), "ClearObsoletePhantoms"),
      phantomOnly = vi.spyOn(probe(parent), "HasOnlyPhantoms");
    removed.RemoveMe(document);
    expect(phantomOnly).not.toHaveBeenCalled();
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(removed.GetParent()).toBeUndefined();
    expect(remaining.GetParent()).toBe(parent);
    expect(parent.GetParent()).toBe(root);
    expect(parent.GetChildCount()).toBe(1);
    expect(remaining.GetNumberVector()).toEqual([7, 7]);
    expect(membership(owners)).toEqual({
      clients: [texts[0], texts[2]],
      registered: [parent, remaining],
    });
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("captures root before removal and reinserts the same record after phantom cleanup", /** Covers complete attached reparent call order and same-rule registration. @returns Nothing. */ () => {
  const owners = fixture([3]),
    { document, records, root, texts } = owners;
  try {
    const child = required(records[0]),
      before = membership(owners),
      parent = child.GetParent.bind(child),
      level = child.GetLevelInListTree.bind(child),
      lookup = probe(child).GetRoot.bind(probe(child)),
      remove = child.RemoveMe.bind(child),
      add = root.AddChild.bind(root),
      trace: string[] = [];
    let entering = true;
    vi.spyOn(child, "GetParent").mockImplementation(
      /** Observes the initial attached guard only. @returns Parent. */ () => {
        if (entering) trace.push("parent");
        return parent();
      },
    );
    vi.spyOn(child, "GetLevelInListTree").mockImplementation(
      /** Observes the initial comparison. @returns Level. */ () => {
        if (entering) trace.push("level");
        return level();
      },
    );
    vi.spyOn(probe(child), "GetRoot").mockImplementation(
      /** Captures the retained source root. @returns Root. */ () => {
        trace.push("root");
        return lookup();
      },
    );
    vi.spyOn(child, "RemoveMe").mockImplementation(
      /** Runs actual detach and cleanup. @param context - Operation document. @returns Nothing. */ (
        context,
      ) => {
        expect(context).toBe(document);
        entering = false;
        trace.push("remove");
        remove(context);
        expect(root.GetChildCount()).toBe(0);
      },
    );
    vi.spyOn(root, "AddChild").mockImplementation(
      /** Reattaches after cleanup. @param node - Same record. @param depth - New depth. @param context - Operation document. @returns Nothing. */ (
        node,
        depth,
        context,
      ) => {
        trace.push("add");
        expect(node).toBe(child);
        expect(depth).toBe(0);
        expect(context).toBe(document);
        add(node, depth, context);
      },
    );
    child.SetLevelInListTree(0, document);
    expect(trace).toEqual(["parent", "level", "root", "remove", "add"]);
    expect(child.GetParent()).toBe(root);
    expect(child.GetLevelInListTree()).toBe(0);
    expect(required(texts[0]).GetNum()).toBe(child);
    expect(required(texts[0]).GetAttrListLevel()).toBe(3);
    expect(child.GetNumberVector()).toEqual([7]);
    expect(membership(owners)).toEqual(before);
  } finally {
    vi.restoreAllMocks();
    document.Dispose();
  }
});

it("retains reading suppression and normal notifications through text-owned level changes", /** Covers public paragraph mutation with preserved record root and membership. @returns Nothing. */ () => {
  for (const reading of [true, false]) {
    const owners = fixture([0, 1, 0]),
      { document, texts, records, root } = owners;
    try {
      const text = required(texts[1]),
        child = required(records[1]),
        before = membership(owners);
      document.SetInReading(reading);
      const notification = vi.spyOn(probe(child), "NotifyNode"),
        change = vi.spyOn(child, "SetLevelInListTree");
      text.SetAttrListLevel(2);
      expect(change.mock.calls).toEqual([[2, document]]);
      expect(text.GetNum()).toBe(child);
      expect(probe(child).GetRoot()).toBe(root);
      expect(child.GetLevelInListTree()).toBe(2);
      expect(text.GetAttrListLevel()).toBe(2);
      expect(child.GetNumberVector()).toEqual([7, 7, 7]);
      expect(membership(owners)).toEqual({
        clients: [texts[0], texts[2], texts[1]],
        registered: before.registered,
      });
      if (reading) expect(notification).not.toHaveBeenCalled();
      else expect(notification).toHaveBeenCalled();
    } finally {
      vi.restoreAllMocks();
      document.Dispose();
    }
  }
});
