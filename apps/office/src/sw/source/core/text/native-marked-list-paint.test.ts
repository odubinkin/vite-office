/** @fileoverview Verifies native color ownership and Number background policy with original list members. */
import { afterEach, expect, it, vi } from "vitest";
import { SwViewColors, SwViewOption, ViewOptFlags } from "../../../inc/viewopt";
import { SwDoc } from "../doc/doc";
import { applyWriterParagraphList } from "../doc/list";
import { resolveSwNumberPortionBackground } from "./inftxt";
const initial = new SwViewColors(
  new SwViewOption(
    /** Keeps options detached. @returns Nothing. */ () => undefined,
  ).GetColorConfig(),
);
afterEach(
  /** Restores the configured initial value for other views. @returns Nothing. */ () =>
    SwViewOption.SetInitialColorConfig(initial),
);

it("native colors distinguish raw defaults from configured views and copy stable borrowed members", /** Checks implicit value copies, subsequent-view initialization and source setter invalidation semantics. @returns Nothing. */ () => {
  const raw = new SwViewColors(),
    changed = vi.fn(),
    existing = new SwViewOption(changed);
  expect(raw.m_nAppearanceFlags).toBe(0);
  expect(raw.m_aFieldShadingsColor).toBe("#c0c0c0");
  expect(existing.GetColorConfig().m_nAppearanceFlags).toBe(25);
  expect(existing.IsReadonly()).toBe(false);
  expect(existing.IsPagePreview()).toBe(false);
  const borrowed = existing.GetColorConfig(),
    copied = new SwViewColors(borrowed);
  raw.m_aFieldShadingsColor = "#123456";
  raw.m_nAppearanceFlags = ViewOptFlags.FieldShadings;
  existing.SetColorConfig(raw);
  expect(existing.GetColorConfig()).toBe(borrowed);
  expect(borrowed.m_aFieldShadingsColor).toBe("#123456");
  expect(copied.m_aFieldShadingsColor).toBe("#c0c0c0");
  expect(copied.m_nAppearanceFlags).toBe(25);
  raw.m_aFieldShadingsColor = "#654321";
  SwViewOption.SetInitialColorConfig(raw);
  raw.m_aFieldShadingsColor = "#ffffff";
  const later = new SwViewOption(changed);
  expect(later.GetFieldShadingsColor()).toBe("#654321");
  expect(existing.GetFieldShadingsColor()).toBe("#123456");
  later.SetAppearanceFlag(ViewOptFlags.FieldShadings, false);
  expect(later.IsFieldShadings()).toBe(false);
  expect(existing.IsFieldShadings()).toBe(true);
  existing.SetReadonly(true);
  existing.SetPagePreview(true);
  expect(existing.IsReadonly()).toBe(true);
  expect(existing.IsPagePreview()).toBe(true);
  expect(changed).not.toHaveBeenCalled();
});

it("native Number shading uses marked-level ownership and exact window multi preview readonly field guards", /** Checks original nodes, explicit white color and absence of edit/history side effects. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    first = doc.paragraphs[0];
  if (first === undefined) throw Error("Missing paragraph");
  const sibling = doc.GetNodes().MakeTextNode("Sibling"),
    child = doc.GetNodes().MakeTextNode("Child"),
    other = doc.GetNodes().MakeTextNode("Other"),
    plain = doc.GetNodes().MakeTextNode("Plain");
  const options = new SwViewOption(
    /** Keeps source setters free of repaint. @returns Nothing. */ () => undefined,
  );
  for (const [node, level, listId] of [
    [first, 0, "A"],
    [sibling, 0, "A"],
    [child, 1, "A"],
    [other, 0, "B"],
  ] as const)
    applyWriterParagraphList(node, { kind: "bullet", level, listId, ruleName: "Bullets" });
  doc.GetUndoManager().Clear();
  try {
    expect(resolveSwNumberPortionBackground(first, options)).toBeUndefined();
    doc.MarkListLevel("A", 0, true);
    expect(resolveSwNumberPortionBackground(first, options)).toBe("#c0c0c0");
    expect(resolveSwNumberPortionBackground(sibling, options)).toBe("#c0c0c0");
    for (const node of [child, other, plain])
      expect(resolveSwNumberPortionBackground(node, options)).toBeUndefined();
    expect(resolveSwNumberPortionBackground(first, options, false)).toBeUndefined();
    expect(resolveSwNumberPortionBackground(first, options, true, true)).toBeUndefined();
    expect(resolveSwNumberPortionBackground(first, options, true, false, "#ffffff")).toBe(
      "#ffffff",
    );
    const colors = new SwViewColors(options.GetColorConfig());
    colors.m_aFieldShadingsColor = "#123456";
    options.SetColorConfig(colors);
    expect(resolveSwNumberPortionBackground(first, options)).toBe("#123456");
    options.SetReadonly(true);
    expect(resolveSwNumberPortionBackground(first, options)).toBeUndefined();
    options.SetReadonly(false);
    options.SetPagePreview(true);
    expect(resolveSwNumberPortionBackground(first, options)).toBeUndefined();
    options.SetPagePreview(false);
    options.SetAppearanceFlag(ViewOptFlags.FieldShadings, false);
    expect(resolveSwNumberPortionBackground(first, options)).toBeUndefined();
    expect(first.HasMarkedLabel()).toBe(true);
    options.SetAppearanceFlag(ViewOptFlags.FieldShadings, true);
    doc.MarkListLevel("A", 0, false);
    expect(resolveSwNumberPortionBackground(first, options)).toBeUndefined();
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  } finally {
    doc.Dispose();
  }
});
