/** @fileoverview Implements the represented unmerged SwDoc::OutlineUpDown method body from pinned docnum.cxx. */
import type { SwDoc } from "./doc";
import type { SwPaM } from "../crsr/pam";
import type { SwTextNode } from "../txtnode/ndtxt";
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
