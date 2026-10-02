/** @fileoverview Verifies public Writer notification policy access and owned reading-context dispatch without upstream access. */
import { expect, it } from "vitest";
import { createWriterDocument, SwDoc } from "../doc/doc";
import { applyWriterParagraphList } from "../doc/list";
import { SwNodeNum } from "./SwNodeNum";
import type { SwNumberTreeNode } from "./SwNumberTree";

/** Reports exact type equality. */
type Same<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
/** Public Writer notification function, with base access retained as protected. */
type Notification = SwNodeNum["IsNotificationEnabled"];
const contract: [
  Same<Extract<keyof SwNumberTreeNode, "IsNotificationEnabled">, never>,
  Same<Extract<keyof SwNodeNum, "IsNotificationEnabled">, "IsNotificationEnabled">,
  Same<Exclude<Parameters<Notification>[0], undefined>, SwDoc>,
  Same<ReturnType<Notification>, boolean>,
] = [true, true, true, true];

/** Requires an actual tree owner. @param value - Candidate. @returns Present owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing notification fixture owner");
  return value;
}

it("exposes the Writer notification policy publicly while retaining the protected base contract", /** Checks supplied-document calls without promoting the optional-context adapter to native signature parity. @returns Nothing. */ () => {
  expect(contract).toEqual([true, true, true, true]);
  const document = new SwDoc(false);
  const root = new SwNodeNum(undefined);
  expect(root.IsNotificationEnabled(document)).toBe(true);
  document.SetInReading(true);
  expect(root.IsNotificationEnabled(document)).toBe(false);
  document.SetInReading(false);
  expect(root.IsNotificationEnabled(document)).toBe(true);
  expect([root.GetNumber(false), root.GetChildCount()]).toEqual([0, 0]);
  document.Dispose();
});

it("uses the text owner before supplied context and leaves connected root and phantom caches untouched", /** Checks native normal/reading predicates for owned items and context-only ancestors through detachment. @returns Nothing. */ () => {
  const document = createWriterDocument();
  const foreign = new SwDoc(false);
  document.SetInReading(true);
  const text = required(document.paragraphs[0]);
  applyWriterParagraphList(text, {
    kind: "numbered",
    styleId: "NotificationAccess",
    listId: "notification-access",
    level: 2,
  });
  const item = required(text.GetNum());
  const phantom = required(item.GetParent()) as SwNodeNum;
  const ancestor = required(phantom.GetParent()) as SwNodeNum;
  const root = required(ancestor.GetParent()) as SwNodeNum;
  expect([root.IsPhantom(), ancestor.IsPhantom(), phantom.IsPhantom(), item.IsPhantom()]).toEqual([
    false,
    true,
    true,
    false,
  ]);
  expect(
    [item, phantom, ancestor, root].map(
      /** Reads raw cached values. @param node - Record. @returns Counter. */ (node) =>
        node.GetNumber(false),
    ),
  ).toEqual([0, 0, 0, 0]);
  expect(item.IsNotificationEnabled(foreign)).toBe(false);
  expect(phantom.IsNotificationEnabled(foreign)).toBe(true);
  expect(root.IsNotificationEnabled(document)).toBe(false);
  foreign.SetInReading(true);
  document.SetInReading(false);
  expect(item.IsNotificationEnabled(foreign)).toBe(true);
  expect(phantom.IsNotificationEnabled(foreign)).toBe(false);
  expect(root.IsNotificationEnabled(document)).toBe(true);
  expect(
    [item, phantom, ancestor, root].map(
      /** Reads nonvalidating cached values. @param node - Record. @returns Counter. */ (node) =>
        node.GetNumber(false),
    ),
  ).toEqual([0, 0, 0, 0]);
  expect([
    root.GetChildCount(),
    ancestor.GetChildCount(),
    phantom.GetChildCount(),
    item.GetChildCount(),
  ]).toEqual([1, 1, 1, 0]);
  text.RemoveFromList();
  expect(item.GetParent()).toBeUndefined();
  expect(item.GetTextNode()).toBe(text);
  expect(item.GetNumRule()).toBeUndefined();
  expect(item.IsNotificationEnabled(foreign)).toBe(true);
  document.SetInReading(true);
  foreign.SetInReading(false);
  expect(item.IsNotificationEnabled(foreign)).toBe(false);
  expect(root.IsNotificationEnabled(foreign)).toBe(true);
  document.SetInReading(false);
  document.Dispose();
  foreign.Dispose();
});
