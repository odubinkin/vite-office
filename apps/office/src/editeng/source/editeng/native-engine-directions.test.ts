/** @fileoverview Original ImpEditEngine raw writing-direction initialization over actual EditDoc, paragraph portions and independently captured ICU78.3 outputs. */
import { expect, it } from "vitest";
import { PreparedOuter } from "../../../test/editeng-engine-fixture";
import native from "../../../external/icu/source/common/native-bidi-logical-runs.json";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { SvxFrameDirectionItem } from "../../inc/frmdiritem";
import { SvxFrameDirection } from "../../inc/frmdir";
import { EE_PARA_WRITINGDIR } from "../../inc/eeitem";
import { WritingDirectionInfo } from "../../inc/ParagraphPortion";
import type { ContentNode } from "../../inc/ContentNode";

it("copies raw logical intervals and levels from native ICU for LTR and RTL paragraphs", /** Uses actual source text insertion, paragraph attributes and the production initializer; no direction provider is prepared. @returns Nothing. */ () => {
  for (const item of native.engineVectors) {
    const outer = new PreparedOuter(),
      engine = outer.implementation,
      value = unicode(String.fromCharCode(...item.units));
    engine.useActualInsertion = true;
    engine.EnableUndo(false);
    engine.mbUpdateLayout = false;
    try {
      engine.SetText(value);
      const node = engine.GetEditDoc().GetObject(0) as ContentNode;
      node
        .GetContentAttribs()
        .GetItems()
        .Put(
          new SvxFrameDirectionItem(
            item.initial ? SvxFrameDirection.Horizontal_RL_TB : SvxFrameDirection.Horizontal_LR_TB,
            EE_PARA_WRITINGDIR,
          ),
        );
      const infos = engine.GetParaPortions().getRef(0).getWritingDirectionInfos();
      infos.push(new WritingDirectionInfo(99, 99, 99));
      engine.InitWritingDirections(0);
      expect(engine.GetParaPortions().getRef(0).getWritingDirectionInfos()).toBe(infos);
      expect(
        infos.map(
          /** Exposes original fields. @param info - Actual source record. @returns Native tuple. */ (
            info,
          ) => [info.nStartPos, info.nEndPos, info.nType],
        ),
      ).toEqual(item.runs.length ? item.runs : [[0, 0, 0]]);
      expect(node.GetString().subView(0)).toEqual(new Uint16Array(item.units));
    } finally {
      value.dispose();
      engine.dispose();
    }
  }
});

it("keeps source fuzzing and empty-paragraph LTR fallback and ignores missing portions", /** Source fallback is LTR even for an explicitly RTL paragraph. @returns Nothing. */ () => {
  const outer = new PreparedOuter(),
    engine = outer.implementation,
    value = unicode("אבג");
  engine.useActualInsertion = true;
  engine.EnableUndo(false);
  engine.mbUpdateLayout = false;
  try {
    engine.SetText(value);
    const node = engine.GetEditDoc().GetObject(0) as ContentNode;
    node
      .GetContentAttribs()
      .GetItems()
      .Put(new SvxFrameDirectionItem(SvxFrameDirection.Horizontal_RL_TB, EE_PARA_WRITINGDIR));
    engine.setFuzzing(true);
    engine.InitWritingDirections(0);
    const infos = engine.GetParaPortions().getRef(0).getWritingDirectionInfos();
    expect(infos).toEqual([new WritingDirectionInfo(0, 0, 3)]);
    engine.InitWritingDirections(-1);
    engine.InitWritingDirections(1);
    expect(infos).toEqual([new WritingDirectionInfo(0, 0, 3)]);
  } finally {
    value.dispose();
    engine.dispose();
  }
});
