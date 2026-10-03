/** @fileoverview Verifies complete Writer numbering policy owner branches using actual records without upstream access. */
import { expect, it, vi } from "vitest";
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import { createWriterDocument } from "../doc/doc";
import { applyWriterParagraphList } from "../doc/list";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwNodeNum } from "./SwNodeNum";
import { SwNumberTreeNode } from "./SwNumberTree";

/** Retains the existing local protected override signature only in tests. */
class PolicyContract extends SwNodeNum {
  /** Retains nullary numbering presence. */
  public readonly numbered = this.IsCountedForNumbering.bind(this);
}
/** Reports exact type equality. */
type Same<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const contracts: [
  Same<Parameters<SwNodeNum["IsContinuous"]>, []>,
  Same<ReturnType<SwNodeNum["IsContinuous"]>, boolean>,
  Same<Parameters<SwNodeNum["IsCounted"]>, []>,
  Same<ReturnType<SwNodeNum["IsCounted"]>, boolean>,
  Same<Parameters<SwNodeNum["IsRestart"]>, []>,
  Same<ReturnType<SwNodeNum["IsRestart"]>, boolean>,
  Same<Parameters<PolicyContract["numbered"]>, []>,
  Same<ReturnType<PolicyContract["numbered"]>, boolean>,
  Same<Extract<keyof SwNumberTreeNode, "IsCountedForNumbering">, never>,
  Same<Extract<keyof SwNodeNum, "IsCountedForNumbering">, never>,
] = [true, true, true, true, true, true, true, true, true, true];
/** Observes protected policy only in tests. */
interface Diagnostic {
  /** Gets the attached root. @returns Root pointer. */
  GetRoot(): SwNumberTreeNode | undefined;
  /** Reads numbering presence. @returns Policy. */
  IsCountedForNumbering(): boolean;
}
/** Reads protected diagnostics. @param node - Owner. @returns View. */
function probe(node: SwNumberTreeNode): Diagnostic {
  return node as unknown as Diagnostic;
}
/** Requires an owned value. @param value - Candidate. @returns Present value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing numbering policy owner");
  return value;
}
/** Describes actual rule and text policy. */
interface Profile {
  level?: number;
  kind?: "numbered" | "bullet";
  continuous?: boolean;
  phantoms?: boolean;
  counted?: boolean;
  disabled?: boolean;
  detached?: boolean;
}
/** Creates a real paragraph, rule and source-created phantom ancestry. @param profile - Policies. @returns Owners. */
function fixture({
  level = 0,
  kind = "numbered",
  continuous = false,
  phantoms = true,
  counted = true,
  disabled = false,
  detached = false,
}: Profile = {}) {
  const document = createWriterDocument();
  document.SetInReading(true);
  const rule = document.EnsureNumRule("PolicyBranches", kind),
    text = required(document.paragraphs[0]);
  rule.SetContinusNum(continuous);
  rule.SetCountPhantoms(phantoms);
  applyWriterParagraphList(text, {
    kind,
    level,
    styleId: "PolicyBranches",
    listId: "policy-branches",
  });
  if (!counted) text.SetCountedInList(false);
  if (disabled) {
    const format = rule.Get(level).clone();
    format.SetNumberingType(SvxNumType.SVX_NUM_NUMBER_NONE);
    rule.Set(level, format);
  }
  const record = required(text.GetNum()),
    root = required(probe(record).GetRoot()) as SwNodeNum;
  if (detached) record.RemoveMe(document);
  return { document, rule, text, record, root };
}
/** Captures membership and unvalidated caches without policy calls. @param owners - Fixture. @returns Stable state. */
function stable(owners: ReturnType<typeof fixture>) {
  const clients: SwTextNode[] = [],
    registered: SwNodeNum[] = [];
  owners.rule.GetTextNodeList(clients);
  owners.document.getIDocumentListItems().getNumItems(registered);
  return {
    clients,
    registered,
    textRecord: owners.text.GetNum(),
    parent: owners.record.GetParent(),
    rootCache: owners.root.GetNumber(false),
    itemCache: owners.record.GetNumber(false),
  };
}

it("retains nullary boolean and local protected contracts with unbound root defaults", /** Checks signatures and default policies without claiming native derived private access equivalence. @returns Nothing. */ () => {
  expect(contracts).toEqual(Array(10).fill(true));
  const root = new SwNodeNum(undefined);
  expect(root.IsContinuous()).toBe(false);
  expect(root.IsCounted()).toBe(true);
  expect(root.IsRestart()).toBe(false);
  expect(probe(root).IsCountedForNumbering()).toBe(true);
  expect(root.GetNumber(false)).toBe(0);
});

it("prefers the bound rule including false and never queries parent fallback", /** Covers both bound-rule values and unchanged real ownership. @returns Nothing. */ () => {
  for (const continuous of [false, true]) {
    const owners = fixture({ continuous }),
      { document, rule, record, root } = owners;
    try {
      const before = stable(owners),
        lookup = vi.spyOn(record, "GetNumRule"),
        ownPolicy = vi.spyOn(rule, "IsContinusNum"),
        parent = vi.spyOn(record, "GetParent"),
        fallback = vi.spyOn(root, "IsContinuous");
      expect(record.IsContinuous()).toBe(continuous);
      expect(lookup.mock.calls).toEqual([[]]);
      expect(ownPolicy.mock.calls).toEqual([[]]);
      expect(parent).not.toHaveBeenCalled();
      expect(fallback).not.toHaveBeenCalled();
      expect(stable(owners)).toEqual(before);
    } finally {
      vi.restoreAllMocks();
      document.Dispose();
    }
  }
});

it("uses parent guard and delegation lookups for an attached unbound release record", /** Covers native no-rule parent fallback through real AddChild, not private field fabrication. @returns Nothing. */ () => {
  for (const continuous of [false, true]) {
    const owners = fixture({ continuous }),
      { document, root } = owners,
      child = new SwNodeNum(undefined);
    try {
      const before = stable(owners);
      root.AddChild(child, 0, document);
      const rule = vi.spyOn(child, "GetNumRule"),
        parent = vi.spyOn(child, "GetParent"),
        fallback = vi.spyOn(root, "IsContinuous");
      expect(child.IsContinuous()).toBe(continuous);
      expect(rule.mock.calls).toEqual([[]]);
      expect(parent.mock.calls).toEqual([[], []]);
      expect(fallback.mock.calls).toEqual([[]]);
      expect(stable(owners)).toEqual(before);
      vi.restoreAllMocks();
      child.RemoveMe(document);
      expect(root.GetChildCount()).toBe(1);
      const orphan = new SwNodeNum(undefined),
        absent = vi.spyOn(orphan, "GetParent");
      expect(orphan.IsContinuous()).toBe(false);
      expect(absent.mock.calls).toEqual([[]]);
    } finally {
      vi.restoreAllMocks();
      child.RemoveMe(document);
      document.Dispose();
    }
  }
});

it("queries text guard and counted delegation without invoking the base policy", /** Covers both real counted values with stable membership and caches. @returns Nothing. */ () => {
  for (const counted of [false, true]) {
    const owners = fixture({ counted }),
      { document, text, record } = owners;
    try {
      const before = stable(owners),
        lookup = vi.spyOn(record, "GetTextNode"),
        policy = vi.spyOn(text, "IsCountedInList"),
        base = vi.spyOn(SwNumberTreeNode.prototype, "IsCounted");
      expect(record.IsCounted()).toBe(counted);
      expect(lookup.mock.calls).toEqual([[], []]);
      expect(policy.mock.calls).toEqual([[]]);
      expect(base).not.toHaveBeenCalled();
      expect(stable(owners)).toEqual(before);
    } finally {
      vi.restoreAllMocks();
      document.Dispose();
    }
  }
});

it("delegates no-text roots and real phantoms to the complete base counted policy", /** Covers continuous phantom suppression and descendant counting under both rule flags. @returns Nothing. */ () => {
  const root = new SwNodeNum(undefined),
    rootText = vi.spyOn(root, "GetTextNode"),
    rootBase = vi.spyOn(SwNumberTreeNode.prototype, "IsCounted");
  try {
    expect(root.IsCounted()).toBe(true);
    expect(rootText.mock.calls).toEqual([[]]);
    expect(rootBase).toHaveBeenCalledTimes(1);
  } finally {
    vi.restoreAllMocks();
  }
  for (const continuous of [false, true])
    for (const phantoms of [false, true])
      for (const counted of [false, true]) {
        const owners = fixture({ level: 1, continuous, phantoms, counted }),
          { document, record } = owners;
        try {
          const before = stable(owners),
            phantom = required(record.GetParent()) as SwNodeNum,
            lookup = vi.spyOn(phantom, "GetTextNode"),
            base = vi.spyOn(SwNumberTreeNode.prototype, "IsCounted");
          expect(phantom.IsPhantom()).toBe(true);
          expect(phantom.IsCounted()).toBe(!continuous && phantoms && counted);
          expect(lookup.mock.calls).toEqual([[]]);
          expect(base).toHaveBeenCalledTimes(1);
          expect(stable(owners)).toEqual(before);
        } finally {
          vi.restoreAllMocks();
          document.Dispose();
        }
      }
});

it("uses text guard and restart delegation while keeping no-text restart false", /** Covers actual restart flags and native root default. @returns Nothing. */ () => {
  for (const restart of [false, true]) {
    const owners = fixture(),
      { document, text, record } = owners;
    try {
      text.SetListRestart(restart);
      const before = stable(owners),
        lookup = vi.spyOn(record, "GetTextNode"),
        policy = vi.spyOn(text, "IsListRestart");
      expect(record.IsRestart()).toBe(restart);
      expect(lookup.mock.calls).toEqual([[], []]);
      expect(policy.mock.calls).toEqual([[]]);
      expect(stable(owners)).toEqual(before);
    } finally {
      vi.restoreAllMocks();
      document.Dispose();
    }
  }
  const root = new SwNodeNum(undefined),
    lookup = vi.spyOn(root, "GetTextNode");
  try {
    expect(root.IsRestart()).toBe(false);
    expect(lookup.mock.calls).toEqual([[]]);
  } finally {
    vi.restoreAllMocks();
  }
});

it("retains counted number bullet and disabled-format short circuits through text helpers", /** Checks actual format policy traces without changing returned numbering values. @returns Nothing. */ () => {
  const profiles: Profile[] = [
    { kind: "numbered" },
    { kind: "bullet" },
    { disabled: true },
    { kind: "numbered", counted: false },
    { kind: "bullet", counted: false },
    { disabled: true, counted: false },
    { detached: true },
    { detached: true, counted: false },
  ];
  for (const profile of profiles) {
    const owners = fixture(profile),
      { document, text, record } = owners;
    try {
      const before = stable(owners),
        counted = record.IsCounted.bind(record),
        phantom = record.IsPhantom.bind(record),
        lookup = record.GetTextNode.bind(record),
        number = text.HasNumber.bind(text),
        bullet = text.HasBullet.bind(text),
        trace: string[] = [];
      vi.spyOn(record, "IsCounted").mockImplementation(
        /** Observes counted short circuit. @returns Policy. */ () => {
          trace.push("counted");
          return counted();
        },
      );
      vi.spyOn(record, "IsPhantom").mockImplementation(
        /** Observes phantom short circuit. @returns Policy. */ () => {
          trace.push("phantom");
          return phantom();
        },
      );
      vi.spyOn(record, "GetTextNode").mockImplementation(
        /** Observes nonvirtual text helper path. @returns Owner. */ () => {
          trace.push("text");
          return lookup();
        },
      );
      vi.spyOn(text, "HasNumber").mockImplementation(
        /** Reads real format enumeration. @returns Presence. */ () => {
          trace.push("number");
          return number();
        },
      );
      vi.spyOn(text, "HasBullet").mockImplementation(
        /** Reads real format itemization. @returns Presence. */ () => {
          trace.push("bullet");
          return bullet();
        },
      );
      expect(probe(record).IsCountedForNumbering()).toBe(
        profile.counted !== false && !profile.detached,
      );
      const expected = ["counted", "text", "text"];
      if (profile.counted !== false) {
        expected.push("phantom", "text", "text", "number");
        if ((profile.kind === "bullet" && !profile.disabled) || profile.detached)
          expected.push("text", "bullet");
      }
      expect(trace).toEqual(expected);
      expect(stable(owners)).toEqual(before);
    } finally {
      vi.restoreAllMocks();
      document.Dispose();
    }
  }
});

it("retains null-text root and counted phantom presence short circuits", /** Covers native no-text branches with actual phantom construction and no visibility bridge. @returns Nothing. */ () => {
  const root = new SwNodeNum(undefined),
    rootText = vi.spyOn(root, "GetTextNode");
  try {
    expect(probe(root).IsCountedForNumbering()).toBe(true);
    expect(rootText.mock.calls).toEqual([[], []]);
  } finally {
    vi.restoreAllMocks();
  }
  for (const phantoms of [false, true]) {
    const owners = fixture({ level: 1, phantoms }),
      { document, record } = owners;
    try {
      const before = stable(owners),
        phantom = required(record.GetParent()) as SwNodeNum,
        lookup = vi.spyOn(phantom, "GetTextNode");
      expect(probe(phantom).IsCountedForNumbering()).toBe(phantoms);
      expect(lookup.mock.calls).toEqual([[]]);
      expect(stable(owners)).toEqual(before);
    } finally {
      vi.restoreAllMocks();
      document.Dispose();
    }
  }
});
