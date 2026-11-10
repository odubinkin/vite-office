/** @fileoverview Consumed native HTML list reader state machine from htmlnumreader.cxx, over actual document rules, node attributes and HTML contexts. */
import type { SwHTMLParser } from "./swhtml";
import { HTMLAttrContext, SwHTMLAppendMode as A } from "./htmlctxt";
import { HtmlTokenId as T, HtmlOptionId as O, getOnToken } from "../../../../svtools/inc/htmltokn";
import { SwNumRule } from "../../core/doc/number";
import { SwNumRuleItem } from "../../core/para/paratr";
import { SvxNumType as N } from "../../../../editeng/inc/svxenum";
import { IsDefBulletFontUserDefined, GetDefBulletFont } from "../../core/doc/number-bullet";
import { SwPoolFormatId as P } from "../../../inc/poolfmt";
import { RES_PARATR_NUMRULE, RES_MARGIN_FIRSTLINE, RES_MARGIN_RIGHT } from "../../../inc/hintids";
import { SvxFirstLineIndentItem } from "../../../../editeng/inc/lrspitem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxCSS1PropertyInfo } from "./svxcss1.types";
import {
  HTML_NUMBER_BULLET_MARGINLEFT as MARGIN,
  HTML_NUMBER_BULLET_INDENT as INDENT,
  HTML_BULLETCHAR_DISC,
  HTML_BULLETCHAR_CIRCLE,
  HTML_BULLETCHAR_SQUARE,
} from "./htmlnum";
const listTokens = new Set([T.DIRLIST_ON, T.MENULIST_ON, T.ORDERLIST_ON, T.UNORDERLIST_ON]);
const bullets: readonly (readonly [string, number])[] = [
  ["disc", HTML_BULLETCHAR_DISC],
  ["circle", HTML_BULLETCHAR_CIRCLE],
  ["square", HTML_BULLETCHAR_SQUARE],
];
/** Borrows the real cursor text node. @param parser - Reader. @returns Native node. */
function node(parser: SwHTMLParser) {
  return parser["GetTextNode"]();
}
/** Native MakeNumRule new-rule profile bound to the existing document insertion owner; no parallel rule table. @param parser - Reader. @returns Actual document-owned rule. */
function makeRule(parser: SwHTMLParser): SwNumRule {
  return parser.m_xDoc.AddNumRule(
    new SwNumRule(parser.m_xDoc.GetUniqueNumRuleName(), "label-width-and-position"),
  );
}
/** Original SetNodeNum assigns the rule but leaves continuation paragraphs uncounted. @param parser - Reader. @param level - Native list level. @returns Nothing. */
export function SetNodeNum(parser: SwHTMLParser, level: number): void {
  const rule = parser.GetNumInfo().GetNumRule();
  if (!rule) throw new Error("assert(numbering rule)");
  const current = node(parser);
  current.SetAttr(new SwNumRuleItem(rule.GetName()));
  current.SetAttrListLevel(level);
  current.SetCountedInList(false);
  rule.Invalidate();
}
/** Original style-option application on the same list context; graphics/positioned frames have no current model owner. @param parser - Reader. @param context - Native context. @param callback - Optional numbering-specific phase before InsertAttrs. @returns Nothing. */
function styles(
  parser: SwHTMLParser,
  context: HTMLAttrContext,
  callback?: (items: SfxItemSet, info: SvxCSS1PropertyInfo) => void,
): void {
  const get =
    /** Reads original reverse-precedence option. @param id - Native option. @returns Raw value. */ (
      id: O,
    ): string => parser["GetStyleOption"](id);
  const style = get(O.STYLE),
    id = get(O.ID),
    cls = get(O.CLASS),
    lang = get(O.LANG),
    dir = get(O.DIR);
  if (!style && !id && !cls && !lang && !dir) return;
  const items = new SfxItemSet(parser.m_xDoc.GetAttrPool(), parser.m_pCSS1Parser.GetWhichMap());
  try {
    const info = new SvxCSS1PropertyInfo();
    if (parser.ParseStyleOptions(style, id, cls, items, info, lang, dir)) {
      callback?.(items, info);
      parser.InsertAttrs(items, info, context);
    }
  } finally {
    items.Dispose();
  }
}
/** Native list open, per-level default, sibling type conflict and option/CSS precedence. @param parser - Reader. @param token - Original list opening token. @returns Nothing. */
export function NewNumberBulletList(parser: SwHTMLParser, token: T): void {
  const info = parser.GetNumInfo(),
    space = info.GetDepth() + parser["m_nDefListDeep"] === 0;
  if (parser.m_pPam.GetPoint().GetContentIndex())
    parser.AppendTextNode(space ? A.AM_SPACE : A.AM_NOSPACE, false);
  else if (space) parser.AddParSpace();
  info.IncDepth();
  const level = (Math.min(info.GetDepth(), 10) - 1) & 0xff;
  if (!info.GetNumRule()) info.SetNumRule(makeRule(parser));
  let rule = info.GetNumRule() as SwNumRule;
  let fresh = rule.GetNumFormat(level) === undefined,
    saved: SwNumRule | null = null;
  if (!fresh) {
    const type = rule.Get(level).GetNumberingType(),
      ordered = type !== N.SVX_NUM_CHAR_SPECIAL && type !== N.SVX_NUM_BITMAP;
    if (ordered !== (token === T.ORDERLIST_ON)) {
      saved = rule;
      rule = makeRule(parser);
      for (let i = 0; i < level; ++i) {
        const parent = saved.GetNumFormat(i);
        if (parent) rule.Set(i, parent);
      }
      info.SetNumRule(rule);
      fresh = true;
    }
  }
  const format = rule.Get(level).clone();
  try {
    let changed = false;
    info.SetNodeStartValue(level);
    if (fresh) {
      const ordered = token === T.ORDERLIST_ON;
      format.SetNumberingType(ordered ? N.SVX_NUM_ARABIC : N.SVX_NUM_CHAR_SPECIAL);
      if (!ordered) {
        if (IsDefBulletFontUserDefined()) format.SetBulletFont(GetDefBulletFont());
        format.SetBulletChar(0x2022);
      }
      const previous = level > 0 ? rule.Get(level - 1) : undefined;
      format.SetAbsLSpace(MARGIN + (previous?.GetAbsLSpace() ?? 0));
      format.SetFirstLineOffset(previous?.GetFirstLineOffset() ?? INDENT);
      format.SetCharFormat(
        parser.m_pCSS1Parser.GetCharFormatFromPool(ordered ? P.CHR_NUM_LEVEL : P.CHR_BULLET_LEVEL),
      );
      changed = true;
    } else if (format.GetStart() !== 1) info.SetNodeStartValue(level, 1);
    for (const option of [...parser.GetOptions()].reverse()) {
      if (option.GetToken() === O.TYPE && fresh && option.GetString()) {
        if (token === T.ORDERLIST_ON) {
          const type = new Map<string, N>([
            ["A", N.SVX_NUM_CHARS_UPPER_LETTER],
            ["a", N.SVX_NUM_CHARS_LOWER_LETTER],
            ["I", N.SVX_NUM_ROMAN_UPPER],
            ["i", N.SVX_NUM_ROMAN_LOWER],
          ]).get(option.GetString()[0] as string);
          changed = type !== undefined;
          if (type !== undefined) format.SetNumberingType(type);
        } else if (token === T.UNORDERLIST_ON) {
          format.SetBulletChar(option.GetEnum(bullets, format.GetBulletChar()));
          changed = true;
        }
      } else if (option.GetToken() === O.START) {
        const start = option.GetNumber() & 0xffff;
        if (fresh) {
          format.SetStart(start);
          changed = true;
        } else info.SetNodeStartValue(level, start);
      }
    }
    SetNodeNum(parser, level);
    const context = new HTMLAttrContext(token);
    if (saved) context.SetSavedNumRule(saved);
    styles(
      parser,
      context,
      /** Applies original list-format CSS phase before context attributes. @param items - Native item set. @param css - Parsed flags. @returns Nothing. */ (
        items,
        css,
      ) => {
        if (fresh) {
          if (css.m_bLeftMargin) {
            let left = format.GetAbsLSpace() - MARGIN;
            if (css.m_nLeftMargin < 0 && left < -css.m_nLeftMargin) left = 0;
            else if (css.m_nLeftMargin > 32767 || left + css.m_nLeftMargin > 32767) left = 32767;
            else left += css.m_nLeftMargin;
            format.SetAbsLSpace(left);
            changed = true;
          }
          if (css.m_bTextIndent) {
            format.SetFirstLineOffset(
              ((
                items.Get(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem
              ).ResolveTextFirstLineOffset() <<
                16) >>
                16,
            );
            changed = true;
          }
          if (css.m_bNumbering) {
            format.SetNumberingType(css.m_nNumberingType);
            changed = true;
          }
          if (css.m_bBullet) {
            format.SetBulletChar(css.m_cBulletChar);
            changed = true;
          }
        }
        css.m_bLeftMargin = css.m_bTextIndent = false;
        if (!css.m_bRightMargin) items.ClearItem(RES_MARGIN_RIGHT);
        if (changed) {
          rule.Set(level, format);
          rule.Invalidate();
          changed = false;
        }
      },
    );
    if (changed) {
      rule.Set(level, format);
      rule.Invalidate();
    }
    parser.PushContext(context);
    parser.SetTextCollAttrs(context);
  } finally {
    format.Dispose();
  }
}
/** Native list close, unused-level completion and saved parent-rule restoration. @param parser - Reader. @param token - Closing token or NONE at EOF. @returns Nothing. */
export function EndNumberBulletList(parser: SwHTMLParser, token = T.NONE): void {
  const info = parser.GetNumInfo(),
    current = node(parser),
    space = info.GetDepth() + parser["m_nDefListDeep"] === 1;
  if (
    parser.m_pPam.GetPoint().GetContentIndex() ||
    (!current.IsOutline() && current.IsCountedInList())
  )
    parser.AppendTextNode(space ? A.AM_SPACE : A.AM_NOSPACE, false);
  else if (space) parser.AddParSpace();
  const context = token !== T.NONE ? parser.PopContext(getOnToken(token)) : null;
  if (info.GetDepth() > 0 && (token === T.NONE || context)) {
    info.DecDepth();
    if (!info.GetDepth()) {
      const rule = info.GetNumRule() as SwNumRule;
      let previous: ReturnType<SwNumRule["GetNumFormat"]>;
      for (let i = 0; i < 10; ++i) {
        const defined = rule.GetNumFormat(i);
        if (defined) previous = defined;
        else if (previous) {
          const format = rule.Get(i).clone();
          try {
            format.SetNumberingType(
              previous.GetNumberingType() !== N.SVX_NUM_BITMAP
                ? previous.GetNumberingType()
                : N.SVX_NUM_CHAR_SPECIAL,
            );
            if (format.GetNumberingType() === N.SVX_NUM_CHAR_SPECIAL) {
              if (IsDefBulletFontUserDefined()) format.SetBulletFont(GetDefBulletFont());
              format.SetBulletChar(0x2022);
            }
            format.SetAbsLSpace((i + 1) * MARGIN);
            format.SetFirstLineOffset(INDENT);
            format.SetCharFormat(previous.GetCharFormat());
            rule.Set(i, format);
          } finally {
            format.Dispose();
          }
        }
      }
      rule.Invalidate();
      node(parser).ResetAttr(RES_PARATR_NUMRULE);
      info.Clear();
    } else {
      if (context?.GetSavedNumRule()) info.SetNumRule(context.GetSavedNumRule());
      SetNodeNum(parser, info.GetLevel());
    }
  }
  if (context) parser.EndContext(context);
  if (token !== T.NONE) parser.SetTextCollAttrs();
  if (context) parser.SetAttr();
}
/** Native LI/LH open, orphan-rule creation, restart consumption and actual counted state. @param parser - Reader. @param token - LI or LH. @returns Nothing. */
export function NewNumberBulletListItem(parser: SwHTMLParser, token: T): void {
  const info = parser.GetNumInfo(),
    level = info.GetLevel();
  let start = token !== T.LISTHEADER_ON ? info.GetNodeStartValue(level) : 0xffff;
  if (start !== 0xffff) info.SetNodeStartValue(level);
  for (const option of [...parser.GetOptions()].reverse())
    if (option.GetToken() === O.VALUE) start = option.GetNumber() & 0xffff;
  if (parser.m_pPam.GetPoint().GetContentIndex()) parser.AppendTextNode(A.AM_NOSPACE, false);
  parser["m_bNoParSpace"] = false;
  const context = new HTMLAttrContext(token);
  let rule = info.GetNumRule();
  if (!rule) {
    rule = makeRule(parser);
    const format = rule.Get(0).clone();
    try {
      if (IsDefBulletFontUserDefined()) format.SetBulletFont(GetDefBulletFont());
      format.SetNumberingType(N.SVX_NUM_CHAR_SPECIAL);
      format.SetBulletChar(0x2022);
      format.SetCharFormat(parser.m_pCSS1Parser.GetCharFormatFromPool(P.CHR_BULLET_LEVEL));
      format.SetFirstLineOffset(INDENT);
      rule.Set(0, format);
    } finally {
      format.Dispose();
    }
    parser["m_nOpenParaToken"] = token;
  }
  const current = node(parser);
  current.SetAttr(new SwNumRuleItem(rule.GetName()));
  current.SetAttrListLevel(level);
  current.SetCountedInList(token !== T.LISTHEADER_ON);
  if (start !== 0xffff) {
    current.SetListRestart(true);
    current.SetAttrListRestartValue(start);
  }
  info.GetNumRule()?.Invalidate();
  styles(parser, context);
  parser.PushContext(context);
  parser.SetTextCollAttrs(context);
}
/** Native LI/LH context search stops at the current list boundary. @param parser - Reader. @param token - Matching close or NONE. @param setColl - Reset paragraph collection. @returns Nothing. */
export function EndNumberBulletListItem(
  parser: SwHTMLParser,
  token = T.NONE,
  setColl = false,
): void {
  if (token === T.NONE && parser.m_pPam.GetPoint().GetContentIndex())
    parser.AppendTextNode(A.AM_NOSPACE);
  const opening = getOnToken(token);
  let context: HTMLAttrContext | undefined;
  for (let index = parser.m_aContexts.length; index > parser.m_nContextStMin;) {
    const candidate = parser.m_aContexts[--index] as HTMLAttrContext,
      type = candidate.GetToken();
    if (listTokens.has(type)) break;
    if (
      (type === T.LI_ON || type === T.LISTHEADER_ON) &&
      (opening === T.NONE || opening === type)
    ) {
      context = parser.m_aContexts.splice(index, 1)[0];
      break;
    }
  }
  if (context) {
    parser.EndContext(context);
    parser.SetAttr();
  }
  if (setColl) parser.SetTextCollAttrs();
}
/** Native list token cases share the existing paragraph/context owner. @param parser - Reader. @param token - Native token. @returns Whether dispatched. */
export function DispatchNumberBulletList(parser: SwHTMLParser, token: T): boolean {
  if (token !== T.NONE && token < T.ONOFF_START) return false;
  const opening = getOnToken(token);
  if (listTokens.has(opening)) {
    if (parser["m_nOpenParaToken"] !== T.NONE) parser.EndPara();
    if (token === opening) NewNumberBulletList(parser, token);
    else {
      EndNumberBulletListItem(parser, T.NONE, true);
      EndNumberBulletList(parser, token);
    }
    return true;
  }
  if (opening !== T.LI_ON && opening !== T.LISTHEADER_ON) return false;
  if (token === opening) {
    if (
      parser["m_nOpenParaToken"] !== T.NONE &&
      (parser.m_pPam.GetPoint().GetContentIndex() || parser["m_nOpenParaToken"] === T.PARABREAK_ON)
    )
      parser.EndPara();
    EndNumberBulletListItem(parser);
    NewNumberBulletListItem(parser, token);
  } else EndNumberBulletListItem(parser, token);
  return true;
}
