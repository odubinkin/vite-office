/** @fileoverview Verifies native ordered-child removal, stored-node topology and supplied-argument callback ownership using project-owned documents. */
import type { SwNumberTreeNode } from "./SwNumberTree";
import { expect, it, vi } from "vitest";
import { createWriterDocument } from "../doc/doc";
import { applyWriterParagraphList } from "../doc/list";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwNodeNum } from "./SwNodeNum";

/** Requires a canonical fixture record. @param value - Candidate. @returns Present record. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing removal fixture record");
  return value;
}

/** Test-only access to the native protected removal callback. */
interface RemovalDiagnostic {
  /** Releases supplied-record membership. @returns Nothing. */
  PostRemove(): void;
}

/** Creates a retained document tree with three root siblings and numbered descendants. @returns Connected owners and records. */
function fixture() {
  const document = createWriterDocument();
  document.SetInReading(true);
  const rule = document.EnsureNumRule("Removal", "numbered");
  for (let level = 0; level < 10; level++) {
    const format = rule.Get(level).clone();
    format.SetStart(level === 0 ? 7 : 5);
    rule.Set(level, format);
  }
  const texts = [0, 1, 1, 0, 1, 0].map(
    /** Attaches one owned paragraph. @param level - Native level. @param index - Document ordinal. @returns Paragraph. */
    (level, index) => {
      const text = index === 0 ? required(document.paragraphs[0]) : document.nodes.MakeTextNode();
      applyWriterParagraphList(text, {
        kind: "numbered",
        level,
        styleId: "Removal",
        listId: "removal",
      });
      return text;
    },
  );
  const records = texts.map(
    /** Captures text-owned numbering records. @param text - Paragraph. @returns Record. */
    (text) => required(text.GetNum()),
  );
  rule.Validate();
  for (const record of records) record.GetNumberVector();
  return {
    document,
    rule,
    texts,
    records,
    root: required(getNumberTreeRoot(required(records[0]))),
    list: required(document.GetDocumentListsManager().GetListByName("removal")),
  };
}

// Literal control-flow observations: transferred descendants notify before the
// root suffix, and supplied PostRemove runs last (100). No native source is read.
const cases = [
  { target: 0, events: [1, 2, 1, 2, 3, 4, 5, 100] },
  { target: 3, events: [1, 2, 4, 5, 100] },
  { target: 5, events: [100] },
] as const;

for (const equivalent of [true, false]) {
  for (const reading of [true, false]) {
    it.each(cases)(
      `removes stored sibling $target with equivalent=${equivalent} reading=${reading}`,
      /** Checks native lookup, descendant transfer and callback order against connected owner state. @param profile - Literal sibling case. @returns Nothing. */
      (profile) => {
        const { document, rule, texts, records, root, list } = fixture();
        const stored = required(records[profile.target]);
        const argument = equivalent ? new SwNodeNum(stored.GetTextNode(), rule) : stored;
        const argumentRoot = new SwNodeNum(undefined, rule);
        const extraText = document.nodes.MakeTextNode();
        const extra = new SwNodeNum(extraText, rule);
        if (equivalent) {
          argumentRoot.AddChild(argument, 0, document);
          argument.AddChild(extra, 0, document);
        }
        const events: number[] = [];
        const notify = document.NotifyModelChange.bind(document);
        document.NotifyModelChange =
          /** Records only numbering callbacks without reading counters. @param hint - Model event. @returns Nothing. */
          (hint) => {
            if (hint.kind === "numbering-changed")
              events.push(
                texts.findIndex(
                  /** Maps the notified paragraph. @param text - Paragraph. @returns Match. */
                  (text) => text.GetIndex() === hint.nodeIndex,
                ),
              );
            notify(hint);
          };
        const callback = (argument as unknown as RemovalDiagnostic).PostRemove.bind(argument);
        const suppliedCallback = vi
          .spyOn(argument as unknown as RemovalDiagnostic, "PostRemove")
          .mockImplementation(
            /** Observes topology and registry ordering before membership release. @returns Nothing. */
            () => {
              expect(stored.GetParent()).toBeUndefined();
              expect(getNumberTreeChildren(stored)).toEqual([]);
              expect(getNumberTreeChildren(root)).not.toContain(stored);
              const registered: SwNodeNum[] = [];
              document.getIDocumentListItems().getNumItems(registered);
              expect(registered).toContain(stored);
              expect(rule.GetTextNodeListSize()).toBe(equivalent ? 7 : 6);
              events.push(100);
              callback();
            },
          );
        const storedCallback = equivalent
          ? vi.spyOn(stored as unknown as RemovalDiagnostic, "PostRemove")
          : suppliedCallback;
        document.SetInReading(reading);
        root.RemoveChild(argument, document);
        expect(suppliedCallback).toHaveBeenCalledTimes(1);
        if (equivalent) expect(storedCallback).not.toHaveBeenCalled();
        expect(events).toEqual(reading ? [100] : profile.events);
        expect(argument.GetNumRule()).toBeUndefined();
        expect(stored.GetNumRule()).toBe(equivalent ? rule : undefined);
        if (equivalent) {
          expect(argument.GetParent()).toBe(argumentRoot);
          expect(getNumberTreeChildren(argument)).toEqual([extra]);
          expect(extra.GetParent()).toBe(argument);
        }
        const lastValid = (root as unknown as { lastValid?: SwNodeNum }).lastValid;
        expect(lastValid).toBe(
          profile.target === 5
            ? records[3]
            : !reading
              ? records[5]
              : profile.target === 0
                ? undefined
                : records[0],
        );
        expect(stored.GetNumber(false)).toBe(
          profile.target === 0 ? 7 : profile.target === 3 ? 8 : 9,
        );
        expect(stored.GetNumberVector()).toEqual([]);
        expect(list.GetListItem(required(texts[profile.target]))).toBeUndefined();
        const clients: SwTextNode[] = [];
        rule.GetTextNodeList(clients);
        expect(clients).toEqual([
          ...texts.filter(
            /** Selects retained rule clients. @param text - Paragraph. @param index - Ordinal. @returns Retained flag. */
            (_text, index) => index !== profile.target,
          ),
          ...(equivalent ? [extraText] : []),
        ]);
        const registered: SwNodeNum[] = [];
        document.getIDocumentListItems().getNumItems(registered);
        expect(registered).toEqual(
          records.filter(
            /** Selects retained numbered registry members. @param record - Record. @param index - Ordinal. @returns Retained flag. */
            (_record, index) => index !== profile.target,
          ),
        );
        if (profile.target === 0) {
          const phantom = required(getNumberTreeChildren(root)[0]);
          expect(phantom.IsPhantom()).toBe(true);
          expect(getNumberTreeChildren(phantom)).toEqual([records[1], records[2]]);
          expect(required(records[1]).GetParent()).toBe(phantom);
          expect(required(records[2]).GetParent()).toBe(phantom);
          expect(required(records[2]).GetNumberVector()).toEqual([7, 6]);
          expect(required(records[5]).GetNumberVector()).toEqual([9]);
        } else if (profile.target === 3) {
          expect(getNumberTreeChildren(required(records[0]))).toEqual([
            records[1],
            records[2],
            records[4],
          ]);
          expect(required(records[4]).GetParent()).toBe(records[0]);
          expect(required(records[4]).GetNumberVector()).toEqual([7, 7]);
          expect(required(records[5]).GetNumberVector()).toEqual([8]);
        } else {
          expect(getNumberTreeChildren(root)).toEqual([records[0], records[3]]);
          expect(required(records[4]).GetNumberVector()).toEqual([8, 5]);
        }
        vi.restoreAllMocks();
        document.Dispose();
      },
    );
  }
}

it("releases only the supplied missing record and leaves phantom arguments untouched", /** Checks miss callback ownership, rule clients, registry and phantom no-op without upstream access. @returns Nothing. */ () => {
  const { document, rule, root, records, texts } = fixture();
  const foreignText = document.nodes.MakeTextNode();
  const foreign = new SwNodeNum(foreignText, rule);
  const foreignRoot = new SwNodeNum(undefined, rule);
  foreignRoot.AddChild(foreign, 0, document);
  const before = [...getNumberTreeChildren(root)];
  const callback = vi.spyOn(foreign as unknown as RemovalDiagnostic, "PostRemove");
  root.RemoveChild(foreign, document);
  expect(callback).toHaveBeenCalledTimes(1);
  expect(foreign.GetParent()).toBe(foreignRoot);
  expect(foreign.GetNumRule()).toBeUndefined();
  expect(getNumberTreeChildren(root)).toEqual(before);
  const clients: SwTextNode[] = [];
  rule.GetTextNodeList(clients);
  expect(clients).toEqual(texts);
  const registered: SwNodeNum[] = [];
  document.getIDocumentListItems().getNumItems(registered);
  expect(registered).toEqual(records);
  root.RemoveChild(new SwNodeNum(required(texts[0]), rule), document);
  const phantom = required(getNumberTreeChildren(root)[0]);
  const phantomCallback = vi.spyOn(phantom as unknown as RemovalDiagnostic, "PostRemove");
  const phantomChildren = [...getNumberTreeChildren(phantom)];
  root.RemoveChild(phantom, document);
  expect(phantomCallback).not.toHaveBeenCalled();
  expect(phantom.GetParent()).toBe(root);
  expect(getNumberTreeChildren(phantom)).toEqual(phantomChildren);
  vi.restoreAllMocks();
  document.Dispose();
});

/** Observes native protected root identity only in tests. @param node - Diagnostic record, absent for an empty fixture. @returns Root pointer or null equivalent. */
function getNumberTreeRoot(node: SwNumberTreeNode | undefined): SwNumberTreeNode | undefined {
  return (
    node as unknown as
      | {
          /** Reads the protected root. @returns Root pointer or null equivalent. */
          GetRoot(): SwNumberTreeNode | undefined;
        }
      | undefined
  )?.GetRoot();
}

/** Observes protected child storage solely for diagnostics. @param node - Owned tree record. @returns Direct children in native order. */
function getNumberTreeChildren(node: SwNumberTreeNode): readonly SwNumberTreeNode[] {
  return (node as unknown as { mChildren: SwNumberTreeNode[] }).mChildren;
}
