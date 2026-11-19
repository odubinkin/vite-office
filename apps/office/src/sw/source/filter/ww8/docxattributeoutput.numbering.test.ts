/** @fileoverview Actual DOCX paragraph numbering dispatch, list-instance ownership and export-only format equivalence. Whole source fixture import/save/reload remains pending. */
import { assert, expect, it } from "vitest";
import { DocxExport } from "./docxexport";
import { AreListsDifferentForExport, AreListLevelsDifferentForExport } from "./ww8par";
import { SwDoc } from "../../core/doc/doc";
import { SwNumRule, SwNumFormat } from "../../core/doc/number";
import { SwNumRuleItem } from "../../core/para/paratr";
import { applyWriterParagraphList } from "../../core/doc/list";
import { SwPosition, SwPaM } from "../../core/crsr/pam";
import { XmlFilterBase } from "../../../../oox/source/core/xmlfilterbase";
import { ZipStorage, ZipFragmentStream } from "../../../../oox/source/helper/zipstorage";
import { FastSerializerHelper } from "../../../../sax/inc/fshelper";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { FontWeight } from "../../../../tools/inc/fontenum";
import { RES_CHRATR_WEIGHT } from "../../../inc/hintids";

/** Uses actual core/export/serializer owners, with no numbering-table or sink replacements. @param action - Calls against the actual exporter. @returns Emitted fragment. */
function emit(action: (owner: DocxExport, document: SwDoc) => void): string {
  const document = new SwDoc(),
    position = new SwPosition(document.nodes.GetEndOfContent()),
    range = new SwPaM(position),
    owner = new DocxExport(
      new XmlFilterBase(new ZipStorage()),
      document,
      range,
      range,
      false,
      false,
    ),
    stream = new ZipFragmentStream("word/document.xml", "application/xml"),
    serializer = new FastSerializerHelper(stream, false);
  try {
    owner.DocxAttrOutput().SetSerializer(serializer);
    action(owner, document);
    serializer.endDocument();
    return new TextDecoder().decode(stream.getBytes());
  } finally {
    owner.dispose();
    range.Dispose();
    position.Dispose();
    document.Dispose();
  }
}

it.each([false, true])(
  "keeps native empty and unknown numbering output for uncounted=%s",
  /** Checks clear numbering and uncounted actual paragraph state. @param uncounted - Whether to export an actual uncounted list. @returns Nothing. */ (
    uncounted,
  ) => {
    expect(
      emit(
        /** Invokes common dispatch through the real DOCX owner. @param owner - Exporter. @param document - Actual document. @returns Nothing. */ (
          owner,
          document,
        ) => {
          const output = owner.DocxAttrOutput(),
            node = document.paragraphs[0];
          assert(node);
          expect(output.ParaNumRule(new SwNumRuleItem("absent"))).toBeUndefined();
          if (uncounted) {
            applyWriterParagraphList(node, { kind: "numbered", ruleName: "numbers" });
            node.SetCountedInList(false);
            owner.m_pOutFormatNode = node;
            output.ParaNumRule(new SwNumRuleItem("numbers"));
          } else output.ParaNumRule(new SwNumRuleItem());
        },
      ),
    ).toBe('<w:numPr><w:ilvl w:val="0"/><w:numId w:val="0"/></w:numPr>');
  },
);

it("uses the default list one-to-one mapping and clamps Writer level9 only at Word dispatch", /** Does not allocate an override for the native default list. @returns Nothing. */ () => {
  expect(
    emit(
      /** Exports a real counted paragraph. @param owner - Exporter. @param document - Actual document. @returns Nothing. */ (
        owner,
        document,
      ) => {
        const node = document.paragraphs[0];
        assert(node);
        const rule = document.EnsureNumRule("numbers", "numbered", 9);
        applyWriterParagraphList(node, {
          kind: "numbered",
          ruleName: rule.GetName(),
          listId: rule.GetDefaultListId(),
          level: 9,
        });
        owner.m_pOutFormatNode = node;
        owner.DocxAttrOutput().ParaNumRule(new SwNumRuleItem(rule.GetName()));
        expect(owner.m_OverridingNums.size).toBe(0);
        expect(owner.m_Lists.size).toBe(0);
        expect(node.GetActualListLevel()).toBe(9);
      },
    ),
  ).toBe('<w:numPr><w:ilvl w:val="8"/><w:numId w:val="1"/></w:numPr>');
});

it.each([
  [false, false, false],
  [true, false, false],
  [false, true, false],
  [true, true, false],
  [false, false, true],
  [true, false, true],
] as const)(
  "resolves source list identities used=%s different=%s restart=%s",
  /** Exercises the tdf95848 dispatch branches with actual lists and rules. @param used - Whether the abstract rule is exported already. @param different - Actual formatting override. @param restart - Actual restart. @returns Nothing. */ (
    used,
    different,
    restart,
  ) => {
    let expected = "";
    const xml = emit(
      /** Creates genuine default-list/format relationships. @param owner - Actual exporter. @param document - Actual document. @returns Nothing. */ (
        owner,
        document,
      ) => {
        const abstract = document.EnsureNumRule("abstract", "numbered", 2),
          rule = document.EnsureNumRule("actual", "numbered", 2),
          node = document.paragraphs[0];
        assert(node);
        if (different) {
          const format = new SwNumFormat(rule.Get(2));
          try {
            format.SetStart(7);
            rule.Set(2, format);
          } finally {
            format.Dispose();
          }
        }
        if (used)
          document
            .MakeTextFormatColl("Abstract user", document.GetDfltTextFormatColl())
            .SetFormatAttr(new SwNumRuleItem(abstract.GetName()));
        document.GetDocumentListsManager().CreateList(abstract.GetName(), "instance");
        applyWriterParagraphList(node, {
          kind: "numbered",
          ruleName: rule.GetName(),
          listId: "instance",
          level: 2,
          restart,
          startValue: 11,
        });
        owner.m_pOutFormatNode = node;
        const originalRules = [...document.GetNumRuleTable()],
          originalIndex = owner.GetNumberingId(rule);
        owner.DocxAttrOutput().ParaNumRule(new SwNumRuleItem(rule.GetName()));
        let index: number;
        if (different || restart) {
          index = (owner.m_pUsedNumTable?.length ?? 0) - 1;
          expect(owner.m_pUsedNumTable?.[index]).toBeNull();
          expect(owner.m_OverridingNums.get(index)).toEqual([
            originalIndex,
            owner.m_Lists.get("instance"),
          ]);
          expect(owner.m_ListLevelOverrides.get(index)?.get(2)).toBe(restart ? 11 : undefined);
        } else {
          index = used ? owner.GetNumberingId(abstract) : (owner.m_Lists.get("instance") as number);
          expect(owner.m_OverridingNums.size).toBe(0);
          const count = owner.m_pUsedNumTable?.length;
          if (!used) expect(owner.DuplicateAbsNum("instance", abstract)).toBe(index);
          expect(owner.m_pUsedNumTable?.length).toBe(count);
        }
        expected = `<w:numPr><w:ilvl w:val="2"/><w:numId w:val="${index + 1}"/></w:numPr>`;
        expect(document.GetNumRuleTable()).toEqual(originalRules);
        expect(rule.Get(2).GetStart()).toBe(different ? 7 : 1);
      },
    );
    expect(xml).toBe(expected);
  },
);

it("keeps native override append semantics and nested unsigned16 replacement", /** Calls public original methods without editing private counters or table entries. @returns Nothing. */ () => {
  emit(
    /** Observes actual ownership and destruction. @param owner - Native owner. @param document - Actual document. @returns Nothing. */ (
      owner,
      document,
    ) => {
      const rule = document.EnsureNumRule("rule", "numbered"),
        node = document.paragraphs[0];
      assert(node);
      applyWriterParagraphList(node, { kind: "numbered", ruleName: rule.GetName() });
      const first = owner.OverrideNumRule(rule, rule.GetDefaultListId(), rule),
        second = owner.OverrideNumRule(rule, rule.GetDefaultListId(), rule);
      expect(second).toBe(first + 1);
      expect(owner.m_nUniqueList).toBe(2);
      expect(owner.m_pUsedNumTable?.slice(-2)).toEqual([null, null]);
      expect(owner.m_OverridingNums.get(first)).toEqual([0, 0]);
      owner.AddListLevelOverride(first + 65536, 65538, 65547);
      owner.AddListLevelOverride(first, 2, 17);
      expect(owner.m_ListLevelOverrides.get(first)?.get(2)).toBe(17);
      owner.Dispose();
      expect(owner.m_pUsedNumTable).toBeUndefined();
      expect(document.FindNumRulePtr("rule")).toBe(rule);
    },
  );
});

it("suppresses inherited outline numbering but emits mismatched levels, missing table IDs and zero IDs", /** Uses the actual paragraph style's outline association. @returns Nothing. */ () => {
  expect(
    emit(
      /** Emits through the real virtual sink. @param owner - Exporter. @param document - Actual document. @returns Nothing. */ (
        owner,
        document,
      ) => {
        const rule = document.GetOutlineNumRule(),
          node = document.paragraphs[0];
        assert(node);
        const style = document.MakeTextFormatColl("Heading", document.GetDfltTextFormatColl());
        style.AssignToListLevelOfOutlineStyle(3);
        style.SetFormatAttr(new SwNumRuleItem(rule.GetName()));
        node.ChgFormatColl(style);
        const id = owner.GetNumberingId(rule) + 1,
          output = owner.DocxAttrOutput();
        output.ParaNumRule_Impl(node, 3, id);
        output.ParaNumRule_Impl(node, 3, 65535);
        output.ParaNumRule_Impl(node, 2, id);
        output.ParaNumRule_Impl(undefined, 0, 777);
      },
    ),
  ).toBe(
    '<w:numPr><w:ilvl w:val="2"/><w:numId w:val="1"/></w:numPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="777"/></w:numPr>',
  );
});

it("compares exported levels instead of rule names and ignores Writer's tenth level", /** Source Word limits remain one/nine even though Writer has ten levels. @returns Nothing. */ () => {
  const document = new SwDoc(),
    first = new SwNumRule("first", "label-alignment"),
    second = new SwNumRule("second", "label-alignment"),
    copy = new SwNumRule(first);
  try {
    expect(AreListsDifferentForExport(first, copy)).toBe(false);
    expect(AreListsDifferentForExport(first, second)).toBe(false);
    const format = new SwNumFormat(second.Get(9));
    try {
      format.SetStart(17);
      second.Set(9, format);
    } finally {
      format.Dispose();
    }
    expect(AreListsDifferentForExport(first, second)).toBe(false);
    second.SetContinusNum(true);
    expect(AreListsDifferentForExport(first, second)).toBe(true);
    first.SetContinusNum(true);
    expect(AreListsDifferentForExport(first, second)).toBe(false);
    const changed = new SwNumFormat(second.Get(0));
    try {
      changed.SetStart(3);
      second.Set(0, changed);
    } finally {
      changed.Dispose();
    }
    expect(AreListsDifferentForExport(first, second)).toBe(true);
  } finally {
    copy.Dispose();
    second.Dispose();
    first.Dispose();
    document.Dispose();
  }
});

it("compares actual character style values and removes copied style names and registrations before format comparison", /** Source copies are destroyed after comparison; original registrations remain. @returns Nothing. */ () => {
  const document = new SwDoc(),
    first = new SwNumFormat(),
    second = new SwNumFormat(),
    a = document.MakeCharFormat("A", undefined),
    b = document.MakeCharFormat("B", undefined);
  try {
    expect(AreListLevelsDifferentForExport(first, second)).toBe(false);
    first.SetCharFormat(a);
    expect(AreListLevelsDifferentForExport(first, second)).toBe(true);
    second.SetCharFormat(b);
    expect(AreListLevelsDifferentForExport(first, second)).toBe(false);
    b.SetFormatAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT));
    expect(AreListLevelsDifferentForExport(first, second)).toBe(true);
    a.SetFormatAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT));
    second.SetStart(17);
    expect(AreListLevelsDifferentForExport(first, second)).toBe(true);
    expect(first.GetCharFormat()).toBe(a);
    expect(second.GetCharFormat()).toBe(b);
    expect(first.GetCharFormatName()).toBe("A");
  } finally {
    second.Dispose();
    first.Dispose();
    document.Dispose();
  }
});

import { createRtfExport } from "../../../../test/writer-rtf-export";
import { AbstractNumberingDefinitions, NumberingDefinitions } from "./wrtw8num";
it("skips native null abstract slots and retains the actual unsupported RTF override diagnostic", /** No substitute numbering sink is installed. @returns Nothing. */ () => {
  const owner = createRtfExport(),
    rule = owner.m_rDoc.GetOutlineNumRule();
  NumberingDefinitions(owner);
  const index = owner.OverrideNumRule(rule, rule.GetDefaultListId(), rule);
  AbstractNumberingDefinitions(owner);
  expect(
    /** Calls the genuine unsupported source sink. @returns Nothing. */ () =>
      NumberingDefinitions(owner),
  ).toThrow("assert(false): numbering override output is not implemented");
  expect(owner.m_ListLevelOverrides.get(index)?.size).toBe(0);
});

import { GetWordFirstLineOffset } from "./wrtw8num";
import { SvxAdjust, SvxNumType } from "../../../../editeng/inc/svxenum";
it("keeps malformed abstract-list references as source errors without changing document numbering", /** Does not manufacture a fallback abstract definition. @returns Nothing. */ () => {
  emit(
    /** Uses a genuinely dangling public list-style reference. @param owner - Exporter. @param document - Document. @returns Nothing. */ (
      owner,
      document,
    ) => {
      const node = document.paragraphs[0];
      assert(node);
      applyWriterParagraphList(node, { kind: "numbered", ruleName: "numbers", listId: "dangling" });
      const list = document.GetDocumentListsManager().GetListByName("dangling");
      assert(list);
      list.SetDefaultListStyleName("missing rule");
      owner.m_pOutFormatNode = node;
      const rules = [...document.GetNumRuleTable()];
      expect(
        /** Calls the actual invalid source contract. @returns Nothing. */ () =>
          owner.DocxAttrOutput().ParaNumRule(new SwNumRuleItem("numbers")),
      ).toThrow("assert(abstract numbering rule)");
      expect(document.GetNumRuleTable()).toEqual(rules);
      expect(owner.m_OverridingNums.size).toBe(0);
    },
  );
});
it("exports style/default contexts without assigning a list level or inventing a paragraph", /** Actual style/default contexts retain level0. @returns Nothing. */ () => {
  expect(
    emit(
      /** Writes both real contexts. @param owner - Exporter. @param document - Document. @returns Nothing. */ (
        owner,
        document,
      ) => {
        const rule = document.GetOutlineNumRule(),
          output = owner.DocxAttrOutput();
        output.ParaNumRule(new SwNumRuleItem(rule.GetName()));
        owner.m_pOutFormatNode = document.MakeTextFormatColl(
          "Unassigned",
          document.GetDfltTextFormatColl(),
        );
        output.ParaNumRule(new SwNumRuleItem(rule.GetName()));
      },
    ),
  ).toBe(
    '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>',
  );
});
it("preserves source zero-bullet and legacy right-aligned indent contracts", /** Uses actual formats and source precondition diagnostics. @returns Nothing. */ () => {
  emit(
    /** Calls real common helpers. @param owner - Exporter. @returns Nothing. */ (owner) => {
      const format = new SwNumFormat();
      try {
        expect(
          /** Rejects a non-bullet source format. @returns Prepared value. */ () =>
            owner.GetNumberingLevelBulletStringAndFont(format),
        ).toThrow("assert(bullet or bitmap numbering level)");
        format.SetPositionAndSpaceMode("label-alignment");
        expect(
          /** Rejects the original legacy-only precondition. @returns Native indent. */ () =>
            GetWordFirstLineOffset(format),
        ).toThrow("assert(LABEL_WIDTH_AND_POSITION)");
        format.SetPositionAndSpaceMode("label-width-and-position");
        format.SetNumAdjust(SvxAdjust.Right);
        format.SetCharTextDistance(77);
        expect(GetWordFirstLineOffset(format)).toBe(-77);
        format.SetNumberingType(SvxNumType.SVX_NUM_CHAR_SPECIAL);
        format.SetBulletChar(0);
        expect(owner.GetNumberingLevelBulletStringAndFont(format)[0]).toBe("\u0000");
      } finally {
        format.Dispose();
      }
    },
  );
});
