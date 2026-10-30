/** @fileoverview Implements represented native SwDoc numbering and outline operations from pinned docnum.cxx. */
import { SetNumRuleMode, type SwDoc } from "./doc";
import type { SwPaM } from "../crsr/pam";
import { SwTextNode } from "../txtnode/ndtxt";
import type { SwTextFormatColl } from "./fmtcol";
import { WRITER_MAX_LIST_LEVEL } from "./list";

/** Native level count; the shared list constant denotes the maximum zero-based index. */
const MAXLEVEL = WRITER_MAX_LIST_LEVEL + 1;

/** Moves actual outline paragraphs across occupied style levels or direct outline attributes. @param document - Owning aggregate. @param range - Borrowed native selection. @param offset - Native signed short level displacement. @returns Whether the whole represented range is applicable. */
export function OutlineUpDown(document: SwDoc, range: SwPaM, offset: number): boolean {
  const outlines = document.GetNodes().GetOutLineNds();
  if (outlines.entries().length === 0 || offset === 0) return false;
  if (range.GetPoint().GetNode().GetDoc() !== document)
    throw new Error("Writer outline range belongs to another document.");
  const start = outlines.Seek_Entry(range.Start().GetNode() as SwTextNode),
    end = outlines.Seek_Entry(range.End().GetNode() as SwTextNode);
  if (!start.found && start.position === 0) return false;
  const first = start.found ? start.position : start.position - 1,
    last = end.found ? end.position + 1 : end.position,
    collections = new Array<SwTextFormatColl | undefined>(MAXLEVEL).fill(undefined);
  for (const collection of document.GetTextFormatColls())
    if (collection.IsAssignedToListLevelOfOutlineStyle())
      collections[collection.GetAssignedOutlineStyleLevel()] = collection;
  let level = MAXLEVEL - 1;
  while (level > 0 && collections[level] === undefined) level--;
  if (collections[level] !== undefined)
    while (level < MAXLEVEL - 1) {
      level++;
      const collection = document.GetTextFormatColl(`heading-${level + 1}`);
      if (
        collection.IsAssignedToListLevelOfOutlineStyle() &&
        collection.GetAssignedOutlineStyleLevel() === level
      ) {
        collections[level] = collection;
        break;
      }
    }
  level = 0;
  while (level < MAXLEVEL - 1 && collections[level] === undefined) level++;
  if (collections[level] !== undefined)
    while (level > 0) {
      level--;
      const collection = document.GetTextFormatColl(`heading-${level + 1}`);
      if (
        collection.IsAssignedToListLevelOfOutlineStyle() &&
        collection.GetAssignedOutlineStyleLevel() === level
      ) {
        collections[level] = collection;
        break;
      }
    }
  const movement = new Array<number>(MAXLEVEL).fill(-1),
    step = offset < 0 ? -1 : 1;
  for (let current = 0; current < MAXLEVEL; current++) {
    if (collections[current] === undefined) continue;
    let target = current,
      count = Math.abs(offset);
    while (count > 0 && target + step >= 0 && target + step < MAXLEVEL) {
      target += step;
      if (collections[target] !== undefined) count--;
    }
    if (count === 0) movement[current] = target;
  }
  const nodes = outlines.entries().slice(first, last);
  let applicable = true;
  for (const node of nodes) {
    const collection = node.GetTextFormatColl();
    if (collection.IsAssignedToListLevelOfOutlineStyle()) {
      if (movement[collection.GetAssignedOutlineStyleLevel()] === -1) applicable = false;
    } else {
      const next = node.GetAttrOutlineLevel() + offset;
      if (next < 1 || next > MAXLEVEL) applicable = false;
    }
  }
  if (!applicable) return false;
  return document.RunModelTransaction(
    /** Applies only the fully preflighted native range. @returns True after application. */ () => {
      for (const node of nodes) {
        const collection = node.GetTextFormatColl();
        if (collection.IsAssignedToListLevelOfOutlineStyle())
          node.ChgFormatColl(
            collections[
              movement[collection.GetAssignedOutlineStyleLevel()] as number
            ] as SwTextFormatColl,
          );
        else node.SetAttrOutlineLevel(node.GetAttrOutlineLevel() + offset);
      }
      return true;
    },
  );
}

/** Native automatic-name overload consumes the optional preferred name, the original random prefix, bounded flags and smallest unused suffix. Browser RNG replaces the platform generator; mail merge and environment-selected stable export have no admitted owner. @param document - Actual document. @param checkName - Native optional preferred name. @returns Source automatic name. */
export function GetUniqueNumRuleName(document: SwDoc, checkName?: string): string {
  const base = String(crypto.getRandomValues(new Uint32Array(1))[0]);
  if (checkName === "") checkName = undefined;
  const rules = document.GetNumRuleTable();
  const flagSize = (Math.trunc(rules.length / 8) + 2) & 0xffff;
  const flags = new Uint8Array(flagSize);
  let number = 0;
  for (const rule of rules) {
    const name = rule.GetName();
    if (name.startsWith(base) && name.length > base.length) {
      number = toInt32(name.slice(base.length)) & 0xffff;
      if (number !== 0 && --number < rules.length)
        flags[number >> 3] = (flags[number >> 3] as number) | (1 << (number & 7));
    }
    if (checkName === name) checkName = undefined;
  }
  if (checkName === undefined) {
    number = rules.length & 0xffff;
    for (let index = 0; index < flagSize; ++index) {
      let value = flags[index] as number;
      if (value !== 0xff) {
        number = (index * 8) & 0xffff;
        while (value & 1) {
          number = (number + 1) & 0xffff;
          value >>= 1;
        }
        break;
      }
    }
  }
  return checkName !== undefined && checkName !== "" ? checkName : base + ((number + 1) & 0xffff);
}
import { toInt32 } from "../../../../o3tl/inc/string_view";

/** Native SwDoc numbering implementation moved from its aggregate without changing ownership or behavior. @param document - Native document. @param range - Actual native selection. @param rule - Native source rule. @param mode - Original flags. @param continuedListId - Original continuation. @returns Explicit list identity. */
export function SetNumRule(
  document: SwDoc,
  range: SwPaM,
  rule: SwNumRule,
  mode = SetNumRuleMode.Default,
  continuedListId = "",
): string {
  if (range.GetPoint().GetNode().GetNodes() !== document.GetNodes())
    throw new Error("Writer numbering range belongs to another node array.");
  return document.RunModelTransaction(
    /** Applies native rule ownership before paragraph attributes. @returns Applied explicit list identity. */ () => {
      let stored = document.FindNumRulePtr(rule.GetName());
      const created = stored === undefined;
      if (stored === undefined) {
        stored = document.AddNumRule(new SwNumRule(rule));
        // AddNumRule materializes the named rule's default list and nonempty ID.
      } else if (!stored.Equals(rule)) {
        stored.Assign(rule);
        document.GetDocumentListsManager().InvalidateAllLists();
      }
      let listId = "";
      if (!(mode & SetNumRuleMode.DontSetItem)) {
        if (mode & SetNumRuleMode.CreateNewList)
          listId = created
            ? stored.GetDefaultListId()
            : document.GetDocumentListsManager().CreateList(stored.GetName()).GetListId();
        else if (continuedListId.length > 0) listId = continuedListId;
      }
      const start = range.Start().GetNodeIndex(),
        end = range.End().GetNodeIndex();
      if (listId.length > 0) {
        for (let index = start; index <= end; index++) {
          const node = document.GetNodes().at(index);
          if (node instanceof SwTextNode)
            node.SetAttr(new SfxStringItem(RES_PARATR_LIST_ID, listId));
        }
      }
      let flags = mode;
      if (!range.HasMark()) {
        const node = range.GetPoint().GetNode();
        if (node instanceof SwTextNode) {
          const current = node.GetNumRule();
          if (current?.GetName() === stored.GetName()) {
            flags |= SetNumRuleMode.DontSetItem;
            if (!node.IsInList()) node.AddToList();
          } else if (
            current === undefined &&
            document.FindNumRulePtr(node.GetTextFormatColl().GetNumRule().GetValue()) === stored
          ) {
            node.ResetAttr(RES_PARATR_NUMRULE);
            flags |= SetNumRuleMode.DontSetItem;
          }
        }
      }
      if (!(flags & SetNumRuleMode.DontSetItem)) {
        for (let index = start; index <= end; index++) {
          const node = document.GetNodes().at(index);
          if (
            node instanceof SwTextNode &&
            (!(flags & SetNumRuleMode.DontSetIfAlreadyApplied) || node.GetNumRule(true) !== stored)
          )
            node.SetAttr(new SwNumRuleItem(stored.GetName()));
        }
      }
      if (
        flags & SetNumRuleMode.ResetIndentAttrs &&
        stored.Get(0).GetPositionAndSpaceMode() === "label-alignment"
      ) {
        for (let index = start; index <= end; index++) {
          const node = document.GetNodes().at(index);
          if (node instanceof SwTextNode)
            node.ResetAttr([RES_MARGIN_FIRSTLINE, RES_MARGIN_TEXTLEFT, RES_MARGIN_RIGHT]);
        }
      }
      document.NotifyModelChange({ kind: "numbering-changed", ruleName: stored.GetName() });
      return listId;
    },
  );
}

/** Original outline rule update for the represented document model: undo, native rule identity, foreign character formats, registered nodes, paragraph propagation and list validation. Unrepresented footnote/field services have no producer here. @param document - Actual owner. @param source - Borrowed source rule. @returns Nothing. */
export function SetOutlineNumRule(document: SwDoc, source: SwNumRule): void {
  const undo = document.GetUndoManager(),
    recording = undo.DoesUndo(),
    outline = document.GetOutlineNumRule();
  if (recording) {
    undo.StartUndo("Modify outline");
    undo.AddUndoAction(new SwUndoOutlineEdit(outline, source));
  }
  outline.Assign(source);
  outline.SetRuleType(SwNumRuleType.OUTLINE_RULE);
  outline.SetName(SwNumRule.GetOutlineRuleName(), document.GetDocumentListsManager());
  outline.SetAutoRule(true);
  outline.CheckCharFormats(document);
  const nodes: SwTextNode[] = [];
  outline.GetTextNodeList(nodes);
  for (const node of nodes) {
    node.NumRuleChgd();
    const style = node.GetTextFormatColl();
    if (
      style.IsAssignedToListLevelOfOutlineStyle() &&
      node.GetAttrListLevel() !== style.GetAssignedOutlineStyleLevel()
    )
      node.SetAttrListLevel(style.GetAssignedOutlineStyleLevel());
  }
  document.PropagateOutlineRule();
  outline.Invalidate();
  document.UpdateNumRule();
  if (recording) undo.EndUndo();
  document.GetDocumentStateManager().SetModified();
}
/** Original propagation does not replace an explicitly nonempty style numbering item. @param document - Actual document. @returns Nothing. */
export function PropagateOutlineRule(document: SwDoc): void {
  const outline = document.GetOutlineNumRule();
  for (const style of document.GetTextFormatColls())
    if (style.IsAssignedToListLevelOfOutlineStyle() && style.GetNumRule(false).GetValue() === "")
      style.SetFormatAttr(new SwNumRuleItem(outline.GetName()));
}
/** Original validation visits every invalid document rule. @param document - Actual document. @returns Nothing. */
export function UpdateNumRule(document: SwDoc): void {
  for (const rule of document.GetNumRuleTable()) if (rule.IsInvalidRule()) rule.Validate(document);
}
import { SwNumRule, SwNumRuleType } from "./number";
import { SwNumRuleItem } from "../para/paratr";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import {
  RES_PARATR_LIST_ID,
  RES_PARATR_NUMRULE,
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_TEXTLEFT,
  RES_MARGIN_RIGHT,
} from "../../../inc/hintids";
import { SwUndoOutlineEdit } from "../undo/unoutl";
