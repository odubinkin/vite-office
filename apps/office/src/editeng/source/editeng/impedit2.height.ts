/** @fileoverview Original ImpEditEngine::CalcHeight over actual formatted paragraph line and spacing owners. */
import type { ContentNode } from "../../inc/ContentNode";
import { EE_PARA_SBL, EE_PARA_ULSPACE } from "../../inc/eeitem";
import type { SvxLineSpacingItem } from "../../inc/lspcitem";
import type { ParaPortion } from "../../inc/ParagraphPortion";
import { SvxInterLineSpaceRule } from "../../inc/svxenum";
import type { SvxULSpaceItem } from "../../inc/ulspitem";
import type { ImpEditEngine } from "./impedit.lifecycle";

/** Original fixed-only extra spacing rule. @param item - Actual line-spacing item. @returns Source extra space. */
function calcExtraSpace(item: SvxLineSpacingItem): number {
  return item.GetInterLineSpaceRule() === SvxInterLineSpaceRule.Fix ? item.GetInterLineSpace() : 0;
}

/** Original scaleYSpacingValue only applies a nonidentity scale while stretching is enabled. @param engine - Actual engine. @param value - Native spacing. @returns Scaled spacing. */
function scaleYSpacingValue(engine: ImpEditEngine, value: number): number {
  const scale = engine.getScalingParameters().fSpacingY;
  return engine.GetStatus().DoStretch() && scale !== 1 ? value * scale : value;
}

/** Original line and paragraph height calculation, including the adjacent paragraph spacing rules. @param engine - Original engine owner. @param portion - Actual paragraph portion. @returns Nothing. */
export function CalcHeight(engine: ImpEditEngine, portion: ParaPortion): void {
  portion.ResetHeight();
  if (!portion.IsVisible()) return;
  const lines = portion.GetLines();
  for (let i = 0; i < lines.Count(); ++i) portion["mnHeight"] += lines.at(i).GetHeight();
  const status = engine.GetStatus();
  if (status.IsOutliner()) return;

  const node = portion.GetNode() as ContentNode;
  const attrs = node.GetContentAttribs();
  const spacing = attrs.GetItem(EE_PARA_ULSPACE) as SvxULSpaceItem;
  const lineSpacing = attrs.GetItem(EE_PARA_SBL) as SvxLineSpacingItem;
  const fixed = scaleYSpacingValue(engine, calcExtraSpace(lineSpacing)) | 0;
  if (fixed) {
    if (lines.Count() > 1) portion["mnHeight"] += (lines.Count() - 1) * fixed;
    if (status.ULSpaceSummation()) portion["mnHeight"] += fixed;
  }

  const portions = engine.GetParaPortions();
  const index = portions.GetPos(portion);
  if (index) {
    const upper = scaleYSpacingValue(engine, spacing.GetUpper()) & 0xffff;
    portion["mnHeight"] += upper;
    portion["mnFirstLineOffset"] = upper;
  }
  if (index !== portions.lastIndex())
    portion["mnHeight"] = Math.trunc(
      portion["mnHeight"] + scaleYSpacingValue(engine, spacing.GetLower()),
    );
  if (!index || status.ULSpaceSummation()) return;

  const previous = portions.SafeGetObject(index - 1);
  if (!previous) return;
  const previousNode = previous.GetNode() as ContentNode;
  const previousAttrs = previousNode.GetContentAttribs();
  const previousSpacing = previousAttrs.GetItem(EE_PARA_ULSPACE) as SvxULSpaceItem;
  const previousLineSpacing = previousAttrs.GetItem(EE_PARA_SBL) as SvxLineSpacingItem;
  const extra = scaleYSpacingValue(engine, calcExtraSpace(lineSpacing)) & 0xffff;
  if (extra > portion["mnFirstLineOffset"]) {
    portion["mnHeight"] += extra - portion["mnFirstLineOffset"];
    portion["mnFirstLineOffset"] = extra;
  }
  const previousLower = scaleYSpacingValue(engine, previousSpacing.GetLower()) & 0xffff;
  if (previousLower > portion["mnFirstLineOffset"]) {
    portion["mnHeight"] -= portion["mnFirstLineOffset"];
    portion["mnFirstLineOffset"] = 0;
  } else if (previousLower) {
    portion["mnHeight"] -= previousLower;
    portion["mnFirstLineOffset"] -= previousLower;
  }
  if (previous.IsInvalid()) return;
  const previousExtra = scaleYSpacingValue(engine, calcExtraSpace(previousLineSpacing)) & 0xffff;
  if (previousExtra > previousLower) {
    const moreLower = previousExtra - previousLower;
    if (moreLower > portion["mnFirstLineOffset"]) {
      portion["mnHeight"] += moreLower - portion["mnFirstLineOffset"];
      portion["mnFirstLineOffset"] = moreLower;
    }
  }
}
