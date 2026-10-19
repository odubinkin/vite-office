import fs from 'node:fs';
const path='apps/office/src/sc/source/core/data/docpool.ts';
let s=fs.readFileSync(path,'utf8');
s=s.replace('ATTR_FONT..ATTR_FONT_RELIEF','ATTR_FONT..ATTR_MARGIN');
const imports=`import { ScHyphenateCell, ScIndentItem, ScVerticalStackCell, ScRotateValueItem, ScLineBreakCell, ScShrinkToFitCell } from "../../../inc/attrib";
import { SvxScriptSpaceItem } from "../../../../editeng/inc/scriptspaceitem";
import { SvxHangingPunctuationItem } from "../../../../editeng/inc/hngpnctitem";
import { SvxForbiddenRuleItem } from "../../../../editeng/inc/forbiddenruleitem";
import { SvxHorJustifyItem, SvxVerJustifyItem, SvxJustifyMethodItem } from "../../../../editeng/inc/justifyitem";
import { SvxCellHorJustify, SvxCellVerJustify, SvxCellJustifyMethod } from "../../../../editeng/inc/svxenum";
import { SvxRotateModeItem, SvxRotateMode } from "../../../../svx/inc/rotmodit";
import { SfxBoolItem } from "../../../../svl/inc/boolitem";
import { SvxFrameDirectionItem } from "../../../../editeng/inc/frmdiritem";
import { SvxFrameDirection } from "../../../../editeng/inc/frmdir";
import { SvxLineItem } from "../../../../editeng/inc/lineitem";
import { SvxMarginItem } from "../../../../svx/inc/algitem";
`;
s=s.replace('/** Builds the native logical',imports+'/** Builds the native logical');
s=s.replace('      [new SvxCharReliefItem(FontRelief.NONE, 124), 10920, 0],',`      [new SvxCharReliefItem(FontRelief.NONE, 124), 10920, 0],
      [new ScHyphenateCell(), 10931, 0],
      [new SvxScriptSpaceItem(false, 126), 0, 0],
      [new SvxHangingPunctuationItem(false, 127), 0, 0],
      [new SvxForbiddenRuleItem(false, 128), 10903, 0],
      [new SvxHorJustifyItem(SvxCellHorJustify.Standard, 129), 11571, 0],
      [new SvxJustifyMethodItem(SvxCellJustifyMethod.Auto, 130), 11569, 0],
      [new ScIndentItem(0), 10460, 0],
      [new SvxVerJustifyItem(SvxCellVerJustify.Standard, 132), 11572, 0],
      [new SvxJustifyMethodItem(SvxCellJustifyMethod.Auto, 133), 11570, 0],
      [new ScVerticalStackCell(false), 10229, 0],
      [new ScRotateValueItem(0), 10577, 0],
      [new SvxRotateModeItem(SvxRotateMode.SVX_ROTATE_MODE_BOTTOM, 136), 10578, 0],
      [new SfxBoolItem(137), 10949, 0],
      [new SvxFrameDirectionItem(SvxFrameDirection.Environment, 138), 10944, 0],
      [new ScLineBreakCell(), 10230, 0],
      [new ScShrinkToFitCell(), 11015, 0],
      [new SvxLineItem(141), 11013, 0],
      [new SvxLineItem(142), 11014, 0],
      [new SvxMarginItem(143), 10228, 0],`);
fs.writeFileSync(path,s);
