/** @fileoverview Implements represented native SwDoc numbering and outline operations from pinned docnum.cxx. */
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import { SwUndoInsNum } from "../undo/unnum";
import { SwUndoNumruleRename } from "../undo/SwUndoFmt";
import { SetNumRuleMode, type SwDoc } from "./doc";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwTextNode } from "../txtnode/ndtxt";
import type { SwTextFormatColl } from "./fmtcol";
import { WRITER_MAX_LIST_LEVEL } from "./list";
import { SwNodeRange } from "../../../inc/ndindex";
import { SwUndoMove } from "../undo/unmove";
import type { SwUndoCursorState } from "../undo/undobj";

/** Native level count; the shared list constant denotes the maximum zero-based index. */
const MAXLEVEL = WRITER_MAX_LIST_LEVEL + 1;

/** Moves the selected chapter's body range relative to the native outline index. @param document - Owning document. @param first - Selected heading index. @param end - Exclusive outline selection boundary. @param offset - Signed native chapter offset. @param cursor - Persistent heading position for history. @returns Whether the body range moved. */
export function MoveOutlinePara(
  document: SwDoc,
  first: number,
  end: number,
  offset: number,
  cursor: SwUndoCursorState,
): boolean {
  const nodes = document.GetNodes();
  const outlines = nodes.GetOutLineNds().entries();
  const bodyEnd = nodes.GetEndOfContent();
  const body = bodyEnd.StartOfSectionNode();
  const start = outlines[first];
  if (!start || first >= end || offset === 0 || start.StartOfSectionNode() !== body) return false;
  const endNode = outlines[end] ?? bodyEnd;
  const destinationIndex = (offset > 0 ? end : first) + offset;
  const destination =
    destinationIndex < 0 ? nodes.at(body.GetIndex() + 1) : (outlines[destinationIndex] ?? bodyEnd);
  if (endNode.StartOfSectionNode() !== body || destination.StartOfSectionNode() !== body)
    return false;

  const range = new SwNodeRange(start, endNode);
  const count = endNode.GetIndex() - start.GetIndex();
  const undo = new SwUndoMove(range, destination, cursor);
  try {
    if (!document.GetDocumentContentOperationsManager().MoveNodeRange(range, destination)) {
      undo.Dispose();
      return false;
    }
    undo.SetDestRange(start.GetIndex(), start.GetIndex() + count, endNode.GetIndex(), cursor);
    document.GetUndoManager().AddUndoAction(undo);
    return true;
  } finally {
    range.Dispose();
  }
}

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

/** Selects native text owners with rules across inclusive SwNodes coordinates. @param document - Native owner. @param range - Native selection. @returns Selected numbered nodes. */
export function GetNumberedNodes(document: SwDoc, range: SwPaM): readonly SwTextNode[] {
  // SwPaM validates both endpoints belong to the same node array.
  if (range.GetPoint().GetNode().GetNodes() !== document.GetNodes())
    throw new Error("Writer numbering range belongs to another node array.");
  const nodes: SwTextNode[] = [];
  for (let index = range.Start().GetNodeIndex(); index <= range.End().GetNodeIndex(); index++) {
    const node = document.GetNodes().at(index);
    if (node instanceof SwTextNode && node.GetNumRule() !== undefined) nodes.push(node);
  }
  return nodes;
}

/** Searches native ordered text nodes, stopping at the nearest rule even when incompatible. @param document - Native owner. @param position - Search origin. @param forward - Search direction. @param numbered - Enumeration rather than itemization. @param outline - Required rule classification. @param nonEmptyAllowed - Plain nonempty paragraphs allowed, minus one for unlimited. @param listId - Caller-owned output list identity. @param investigateStart - Include the origin, false by default. @returns Matching native rule, if any. */
export function SearchNumRule(
  document: SwDoc,
  position: SwPosition,
  forward: boolean,
  numbered: boolean,
  outline: boolean,
  nonEmptyAllowed: number,
  listId: { value: string },
  investigateStart = false,
): SwNumRule | undefined {
  const origin = position.GetNode();
  if (!(origin instanceof SwTextNode)) return undefined;
  if (origin.GetDoc() !== document)
    throw new Error("Numbering search belongs to another document.");
  const root = document.GetNodes().at(0);
  let section = origin.StartOfSectionNode();
  while (section !== root && section.StartOfSectionNode() !== root)
    section = section.StartOfSectionNode();
  const start = section.GetIndex(),
    end = section.EndOfSectionNode().GetIndex(),
    step = forward ? 1 : -1;
  for (
    let index = origin.GetIndex() + (investigateStart ? 0 : step);
    index > start && index < end;
    index += step
  ) {
    const node = document.GetNodes().at(index);
    if (!(node instanceof SwTextNode)) continue;
    const rule = node.GetNumRule();
    if (rule !== undefined) {
      if (
        rule.IsOutlineRule() === outline &&
        (numbered ? rule.Get(0).IsEnumeration() : rule.Get(0).IsItemize())
      ) {
        listId.value = node.GetListId();
        return rule;
      }
      return undefined;
    }
    if (node.Len() > 0) {
      if (nonEmptyAllowed === 0) return undefined;
      nonEmptyAllowed = Math.max(-1, nonEmptyAllowed - 1);
    }
  }
  return undefined;
}

/** Identifies affected upper levels with the original sal_uInt8 return width. @param level - Zero-based list level. @param included - Levels included in the label. @param mask - Bit for the current level. @returns Mask of represented upper levels. */
function GetUpperLvlChg(level: number, included: number, mask: number): number {
  const first = Math.max(0, level + 1 - included);
  return (mask - 1) & ~((1 << first) - 1) & 0xff;
}

/** Updates the live rule's affected formats without replacing the rule or its lists. @param document - Native owner. @param current - Existing rule in the document. @param source - Rule with incoming formats. @returns Nothing. */
function changeNumRule(document: SwDoc, current: SwNumRule, source: SwNumRule): void {
  let changed = 0;
  for (let level = 0; level < MAXLEVEL; level++) {
    const format = source.Get(level);
    const mask = 1 << level;
    const included = format.GetIncludeUpperLevels();
    if (
      !current.Get(level).Equals(format) ||
      (format.GetNumberingType() < SvxNumType.SVX_NUM_NUMBER_NONE &&
        included > 1 &&
        (changed & GetUpperLvlChg(level, included, mask)) !== 0)
    )
      changed |= mask;
  }
  const continuous = source.IsContinusNum();
  if (changed === 0) {
    const invalidate = current.IsContinusNum() !== continuous;
    current.CheckCharFormats(document);
    current.SetContinusNum(continuous);
    if (invalidate) current.Invalidate();
    return;
  }

  const nodes: SwTextNode[] = [];
  current.GetTextNodeList(nodes);
  for (const node of nodes) {
    const level = node.GetActualListLevel() & 0xff;
    if (level < MAXLEVEL && (changed & (1 << level)) !== 0) node.NumRuleChgd();
  }
  for (let level = 0; level < MAXLEVEL; level++)
    if ((changed & (1 << level)) !== 0) current.SetByPointer(level, source.GetNumFormat(level));
  current.CheckCharFormats(document);
  current.Invalidate();
  current.SetContinusNum(continuous);
  document.UpdateNumRule();
}

/** Applies the named rule edit with native format history and no paragraph selection requirement. @param document - Native owner. @param source - Accepted numbering rule. @returns Nothing. */
export function ChgNumRuleFormats(document: SwDoc, source: SwNumRule): void {
  const current = document.FindNumRulePtr(source.GetName());
  if (!current) return;
  document.RunModelTransaction(
    /** Commits formats and publishes this document-level change together. @returns Nothing. */ () => {
      const undo = document.GetUndoManager();
      if (undo.DoesUndo()) undo.AddUndoAction(new SwUndoInsNum(current, source, document));
      changeNumRule(document, current, source);
      document.GetDocumentStateManager().SetModified();
      document.NotifyModelChange({ kind: "numbering-changed", ruleName: current.GetName() });
    },
  );
}

/** Renames one stored numbering rule and updates its list and format clients. @param document - Native document. @param previous - Existing name. @param next - Unused new name. @returns Whether the rule was renamed. */
export function RenameNumRule(document: SwDoc, previous: string, next: string): boolean {
  const rule = document.FindNumRulePtr(previous);
  if (!rule || next === "" || document.FindNumRulePtr(next)) return false;
  return document.RunModelTransaction(
    /** Renames the actual rule and retained references as one document change. @returns True after application. */ () => {
      const undo = document.GetUndoManager();
      if (undo.DoesUndo()) undo.AddUndoAction(new SwUndoNumruleRename(previous, next, document));
      const nodes: SwTextNode[] = [];
      rule.GetTextNodeList(nodes);
      rule.SetName(next, document.GetDocumentListsManager());
      const item = new SwNumRuleItem(next);
      for (const style of document.GetTextFormatColls()) {
        const reference = style.GetAttrSet().GetItemIfSet(RES_PARATR_NUMRULE, false);
        if (reference instanceof SwNumRuleItem && reference.GetValue() === previous)
          style.SetFormatAttr(item);
      }
      for (const node of nodes)
        if (node.GetSwAttrSet().GetItemIfSet(RES_PARATR_NUMRULE, false) instanceof SwNumRuleItem)
          node.SetAttr(item);
      document.NotifyModelChange({ kind: "numbering-changed", ruleName: next });
      return true;
    },
  );
}

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
        changeNumRule(document, stored, rule);
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
import {
  RES_PARATR_LIST_LEVEL,
  RES_PARATR_LIST_ISRESTART,
  RES_PARATR_LIST_RESTARTVALUE,
  RES_PARATR_LIST_ISCOUNTED,
} from "../../../inc/hintids";
import { type SwNode } from "../docnode/node";

/** Changes native restart only on a numbered text node with a different flag. @param document - Owning Writer document. @param position - Actual node position. @param flag - Requested restart state. @returns Whether a flag changed. */
export function SetNumRuleStart(document: SwDoc, position: SwPosition, flag: boolean): boolean {
  const node = position.GetNode();
  if (node.GetNodes() !== document.nodes)
    throw new Error("Writer numbering start belongs to another node array.");
  if (
    !(node instanceof SwTextNode) ||
    node.GetNumRule() === undefined ||
    node.IsListRestart() === flag
  )
    return false;
  return document.RunModelTransaction(
    /** Applies the represented document flag primitive. @returns True. */ () => {
      node.SetListRestart(flag);
      return true;
    },
  );
}

/** Sets native counted state independently of applying a list rule. @param document - Owning Writer document. @param range - Inclusive native range. @param counted - Requested count state. @returns Nothing. */
export function SetCounted(document: SwDoc, range: SwPaM, counted: boolean): void {
  if (range.GetPoint().GetNode().GetNodes() !== document.nodes)
    throw new Error("Writer numbering range belongs to another node array.");
  document.RunModelTransaction(
    /** Mutates only counted attributes on current text nodes. @returns Nothing. */ () => {
      for (let index = range.Start().GetNodeIndex(); index <= range.End().GetNodeIndex(); index++) {
        const node = document.nodes.at(index);
        if (node instanceof SwTextNode) node.SetCountedInList(counted);
      }
    },
  );
}

/** Checks the represented numbering range before changing any level. @param document - Owning Writer document. @param range - Native selection. @param down - Demote direction. @returns Whether every numbered node can move. */
export function CanNumUpDown(document: SwDoc, range: SwPaM, down: boolean): boolean {
  const nodes = GetNumberedNodes(document, range);
  return (
    nodes.length > 0 &&
    nodes.every(
      /** Checks the actual list-tree level. @param node - Selected numbered node. @returns Whether within native limits. */
      (node) =>
        down ? node.GetActualListLevel() < WRITER_MAX_LIST_LEVEL : node.GetActualListLevel() > 0,
    )
  );
}

/** Changes only list levels in the actual selected node range, including cells. @param document - Owning Writer document. @param range - Native selection. @param down - Demote direction. @returns Whether the supported numbering range changed. */
export function NumUpDown(document: SwDoc, range: SwPaM, down: boolean): boolean {
  if (!document.CanNumUpDown(range, down)) return false;
  const nodes = GetNumberedNodes(document, range);
  return document["stateManager"].RunModelTransaction(
    /** Applies one fully validated native range. @returns True after mutation. */
    () => {
      for (const node of nodes) node.SetAttrListLevel(node.GetActualListLevel() + (down ? 1 : -1));
      return true;
    },
  );
}

/** Applies native numbering visibility or removes an already uncounted direct list. @param document - Owning Writer document. @param node - Actual document node. @param del - Hide numbering when true. @returns Whether numbering changed. */
export function NumOrNoNum(document: SwDoc, node: SwNode, del = false): boolean {
  if (node.GetNodes() !== document.nodes)
    throw new Error("Writer numbering node belongs to another node array.");
  if (
    !(node instanceof SwTextNode) ||
    node.GetNumRule() === undefined ||
    (!node.HasNumber() && !node.HasBullet())
  )
    return false;
  if (node.IsCountedInList() === del) {
    node.SetCountedInList(!del);
    return true;
  }
  if (
    del &&
    node.GetNumRule(false) !== undefined &&
    node.GetActualListLevel() >= 0 &&
    node.GetActualListLevel() <= WRITER_MAX_LIST_LEVEL
  ) {
    const point = new SwPosition(node, 0),
      range = new SwPaM(point);
    try {
      return document.DelNumRules(range);
    } finally {
      range.Dispose();
      point.Dispose();
    }
  }
  return false;
}

/** Removes numbering over native inclusive node coordinates. @param document - Owning Writer document. @param range - Actual Writer selection. @returns Whether numbered nodes were changed. */
export function DelNumRules(document: SwDoc, range: SwPaM): boolean {
  const nodes = GetNumberedNodes(document, range);
  if (nodes.length === 0) return false;
  return document.RunModelTransaction(
    /** Resets native numbering attributes without recreating a list DTO. @returns True after mutation. */
    () => {
      for (const node of nodes) {
        if (node.GetpSwAttrSet()?.GetItemIfSet(RES_PARATR_NUMRULE, false) !== undefined)
          node.ResetAttr(RES_PARATR_NUMRULE);
        else node.SetAttr(new SwNumRuleItem(""));
        node.ResetAttr([
          RES_PARATR_LIST_ID,
          RES_PARATR_LIST_LEVEL,
          RES_PARATR_LIST_ISRESTART,
          RES_PARATR_LIST_RESTARTVALUE,
          RES_PARATR_LIST_ISCOUNTED,
        ]);
        if (node.GetTextFormatColl().IsAssignedToListLevelOfOutlineStyle())
          node.SetCountedInList(false);
      }
      return true;
    },
  );
}
