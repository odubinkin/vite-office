/** @fileoverview Verifies that the ODT filter rejects unsupported canonical Writer state. */

import { describe, expect, it } from "vitest";

import { FontWeight, SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SfxInt16Item } from "../../../../svl/source/items/poolitem";
import { RES_CHRATR_WEIGHT, RES_PARATR_NUMRULE } from "../../../inc/hintids";
import { applyWriterParagraphList } from "../../core/doc/list";
import { createWriterDocument } from "../../core/doc/doc";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { SwNumRuleItem } from "../../core/para/paratr";
import { writeOdtDocument } from "./wrtxml";
import { exportContentXml, exportStylesXml } from "./xmlexp";

describe("ODT canonical state validation", /** Registers current-schema rejection tests. @returns Nothing. */ () => {
  it("rejects unsupported canonical Writer state instead of silently dropping it", /** Verifies unsupported item states fail at the filter boundary. @returns Nothing. */ () => {
    for (const list of [
      { kind: "none", level: 1 } as const,
      { kind: "none", level: 0, styleId: "List" } as const,
    ]) {
      const writer = createWriterDocument();
      applyWriterParagraphList(writer.paragraphs[0] as SwTextNode, list);
      expect(
        /** Exports one invalid list state. @returns ODT bytes when validation unexpectedly succeeds. */ () =>
          writeOdtDocument(
            writer,
            createDocument({ id: "invalid-odt", suiteId: "writer", title: "Invalid" }),
          ),
      ).toThrow("without SwNumRule");
    }
    const unknownRule = createWriterDocument();
    unknownRule.paragraphs[0]?.SetAttr(new SwNumRuleItem("Missing"));
    expect(
      /** Exports an unresolved numbering rule. @returns Content XML when validation unexpectedly succeeds. */ () =>
        exportContentXml(unknownRule),
    ).toThrow("cannot resolve SwNumRule Missing");
    const invalidCharacter = createWriterDocument();
    const invalidCharacterSet = invalidCharacter
      .GetDfltTextFormatColl()
      .GetAttrSet() as unknown as { items: Map<number, unknown> };
    invalidCharacterSet.items.set(RES_CHRATR_WEIGHT, new SfxInt16Item(RES_CHRATR_WEIGHT, 1));
    expect(
      /** Exports an item with the wrong pool-item type. @returns Styles XML when validation unexpectedly succeeds. */ () =>
        exportStylesXml(invalidCharacter),
    ).toThrow("ODT character item is invalid");
    const scriptSpecificCharacter = createWriterDocument();
    scriptSpecificCharacter
      .GetDfltTextFormatColl()
      .SetFormatAttr(new SvxWeightItem(FontWeight.BOLD, RES_CHRATR_WEIGHT));
    expect(
      /** Exports an unsupported script-specific default. @returns Styles XML when validation unexpectedly succeeds. */ () =>
        exportStylesXml(scriptSpecificCharacter),
    ).toThrow("script-specific character formatting");
    const styleItem = createWriterDocument();
    styleItem.GetTextFormatColl("heading-1").SetFormatAttr(new SwNumRuleItem("Rule"));
    expect(
      /** Exports an unsupported style item. @returns Styles XML when validation unexpectedly succeeds. */ () =>
        exportStylesXml(styleItem),
    ).toThrow(`WhichId ${RES_PARATR_NUMRULE}`);
  });
});
