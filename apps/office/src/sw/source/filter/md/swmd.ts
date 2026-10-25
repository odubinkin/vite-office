/** @fileoverview Writer Markdown reader and block parser following sw/source/filter/md/swmd.cxx. */
import { SwDoc, type SwDocOptions } from "../../core/doc/doc";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { SwpHints } from "../../core/txtnode/ndhints";
import type { WriterTextRun } from "../basflt/writer-transfer";
import { createWriterTextRuns } from "../basflt/writer-transfer";
import { parseMarkdownSpans } from "./mdcallbcks";
import { SwMdNumRuleInfo, type MarkdownListItem } from "./mdnum";
import {
  readMarkdownTableAlignment,
  readMarkdownTableRow,
  splitMarkdownTableRow,
  type MarkdownCell,
} from "./mdtab";

/** A represented paragraph before native Writer nodes are allocated. */
interface MarkdownParagraph {
  readonly runs: readonly WriterTextRun[];
  readonly style?: string;
  readonly list?: MarkdownListItem;
}

/** Ordered Markdown body blocks. */
type MarkdownBlock =
  | Readonly<{ kind: "paragraph"; value: MarkdownParagraph }>
  | Readonly<{ kind: "table"; rows: readonly (readonly MarkdownCell[])[] }>;

/** Reads Markdown bytes and installs represented source blocks into canonical Writer nodes. */
export class MarkdownReader {
  /** Imports one Markdown document with the source default text encoding. @param bytes - Source stream. @param options - Writer document environment. @param baseURL - Source document URL when known. @returns Imported model. */
  public Read(bytes: Uint8Array, options: SwDocOptions = {}, baseURL = ""): SwDoc {
    if (bytes.length === 0) throw new Error("Invalid Markdown byte stream.");
    const text = new TextDecoder("utf-8", { fatal: true })
      .decode(bytes)
      .replaceAll("\r\n", "\n")
      .replaceAll("\r", "\n");
    const blocks = new SwMarkdownParser(baseURL).CallParser(text);
    const document = new SwDoc(options);
    const listRules = new SwMdNumRuleInfo();
    let useFirstParagraph = true;
    for (const block of blocks) {
      if (block.kind === "paragraph") {
        const node = useFirstParagraph ? document.paragraphs[0] : document.nodes.MakeTextNode();
        if (node === undefined) throw new Error("Writer body has no text node.");
        applyMarkdownParagraph(node, block.value, listRules);
        useFirstParagraph = false;
      } else {
        const table = useFirstParagraph
          ? document.nodes.InsertTable(document.paragraphs[0] as SwTextNode, "Markdown Table", {})
          : document.nodes.MakeTableNode("Markdown Table");
        for (const row of block.rows) {
          const line = document.nodes.AppendTableRow(table, row.length);
          for (const [index, cell] of row.entries()) {
            const node = line.GetTabBoxes()[index]?.GetParagraphs()[0];
            if (node === undefined) throw new Error("Markdown table cell is missing.");
            applyMarkdownParagraph(
              node,
              { runs: parseMarkdownSpans(cell.text, baseURL) },
              listRules,
            );
            node.SetParagraphAlignment(cell.alignment);
          }
        }
      }
    }
    listRules.Finish();
    return document;
  }
}

/** Applies callback-produced paragraph content through native format and hint owners. @param node - Target paragraph. @param value - Parsed block. */
function applyMarkdownParagraph(
  node: SwTextNode,
  value: MarkdownParagraph,
  listRules: SwMdNumRuleInfo,
): void {
  if (value.style !== undefined) node.ChgFormatColl(node.GetDoc().GetTextFormatColl(value.style));
  const runs = value.runs;
  node.SetText(runs.map((run) => run.text).join(""));
  const hints = new SwpHints(node.GetDoc().GetAttrPool());
  hints.setTextRuns(runs, node.GetSwAttrSet());
  node.SetTextHints(hints);
  if (value.list !== undefined) listRules.Apply(node, value.list);
}

/** Parses represented md4c block callbacks into ordered Writer body blocks. */
export class SwMarkdownParser {
  /** Retains the source medium URL for hyperlink span callbacks. */
  public constructor(private readonly baseURL = "") {}

  /** Calls the block parser once for one normalized source. @param source - Markdown text. @returns Ordered blocks. */
  public CallParser(source: string): readonly MarkdownBlock[] {
    const lines = source.split("\n"),
      blocks: MarkdownBlock[] = [];
    let offset = 0,
      nextListId = 0,
      activeListId: string | undefined,
      activeRootListKind: "bullet" | "numbered" | undefined;
    let listIndents: { indent: number; continuation: number }[] = [];
    while (offset < lines.length) {
      const line = lines[offset] as string;
      if (line.trim().length === 0) {
        const next = lines[offset + 1];
        const continuesList =
          activeRootListKind !== undefined &&
          next !== undefined &&
          /^(\s*)([-+*]|\d+[.)])\s+(.+)$/u.test(next);
        offset++;
        if (!continuesList) {
          activeListId = undefined;
          activeRootListKind = undefined;
        }
        continue;
      }
      const fence = /^ {0,3}(`{3,}|~{3,})(.*)$/u.exec(line);
      if (fence !== null) {
        const marker = fence[1] as string,
          code: string[] = [];
        offset++;
        while (
          offset < lines.length &&
          !new RegExp(`^ {0,3}${marker[0]}{${marker.length},}\\s*$`, "u").test(
            lines[offset] as string,
          )
        )
          code.push(lines[offset++] as string);
        if (offset < lines.length) offset++;
        blocks.push({
          kind: "paragraph",
          value: { runs: createWriterTextRuns(code.join("\n")), style: "preformatted-text" },
        });
        activeListId = undefined;
        activeRootListKind = undefined;
        continue;
      }
      const heading = /^ {0,3}(#{1,6})(?:\s+|$)(.*)$/u.exec(line);
      if (heading !== null) {
        const content = (heading[2] as string).replace(/\s+#+\s*$/u, "");
        blocks.push({
          kind: "paragraph",
          value: {
            runs: parseMarkdownSpans(content, this.baseURL),
            style: `heading-${(heading[1] as string).length}`,
          },
        });
        offset++;
        activeListId = undefined;
        activeRootListKind = undefined;
        continue;
      }
      const nextLine = lines[offset + 1];
      const setext = nextLine === undefined ? null : /^ {0,3}(=+|-+)\s*$/u.exec(nextLine);
      if (setext !== null && line.trim().length > 0) {
        blocks.push({
          kind: "paragraph",
          value: {
            runs: parseMarkdownSpans(line.trim(), this.baseURL),
            style: setext[1]?.startsWith("=") ? "heading-1" : "heading-2",
          },
        });
        offset += 2;
        activeListId = undefined;
        activeRootListKind = undefined;
        continue;
      }
      if (isThematicBreak(line)) {
        blocks.push({
          kind: "paragraph",
          value: { runs: [], style: "horizontal-line" },
        });
        offset++;
        activeListId = undefined;
        activeRootListKind = undefined;
        continue;
      }
      if (activeRootListKind === undefined && /^(?: {4}|\t)/u.test(line)) {
        const code: string[] = [];
        while (offset < lines.length) {
          const current = lines[offset] as string;
          if (/^(?: {4}|\t)/u.test(current)) {
            code.push(current.startsWith("\t") ? current.slice(1) : current.slice(4));
            offset++;
          } else if (current.trim().length === 0 && /^(?: {4}|\t)/u.test(lines[offset + 1] ?? "")) {
            code.push("");
            offset++;
          } else break;
        }
        blocks.push({
          kind: "paragraph",
          value: { runs: createWriterTextRuns(code.join("\n")), style: "preformatted-text" },
        });
        activeListId = undefined;
        activeRootListKind = undefined;
        continue;
      }
      const alignment = nextLine === undefined ? undefined : readMarkdownTableAlignment(nextLine);
      if (
        line.includes("|") &&
        alignment !== undefined &&
        alignment.length === splitMarkdownTableRow(line).length
      ) {
        const rows: (readonly MarkdownCell[])[] = [readMarkdownTableRow(line, alignment)];
        offset += 2;
        while (
          offset < lines.length &&
          (lines[offset] as string).includes("|") &&
          (lines[offset] as string).trim().length > 0
        )
          rows.push(readMarkdownTableRow(lines[offset++] as string, alignment));
        blocks.push({ kind: "table", rows });
        activeListId = undefined;
        activeRootListKind = undefined;
        continue;
      }
      const list = /^(\s*)([-+*]|\d+[.)])\s+(.+)$/u.exec(line);
      if (list !== null && !/^(?:\s*[-*]\s*){3,}$/u.test(line)) {
        const kind = /^\d/u.test(list[2] as string) ? "numbered" : "bullet";
        if (activeRootListKind === undefined) listIndents = [];
        const indent = (list[1] as string).replaceAll("\t", "    ").length;
        let level = 0;
        for (const [index, previous] of listIndents.entries()) {
          if (indent >= previous.continuation) level = index + 1;
          else if (indent >= previous.indent) {
            level = index;
            break;
          }
        }
        level = Math.min(9, level);
        listIndents.length = level;
        listIndents[level] = {
          indent,
          continuation: indent + (list[2] as string).length + 1,
        };
        if (level === 0 && activeRootListKind !== kind) activeListId = undefined;
        activeListId ??= `Markdown-list-${++nextListId}`;
        if (level === 0) activeRootListKind = kind;
        blocks.push({
          kind: "paragraph",
          value: {
            runs: parseMarkdownSpans(list[3] as string, this.baseURL),
            list: {
              kind,
              level,
              id: activeListId,
            },
          },
        });
        offset++;
        continue;
      }
      activeListId = undefined;
      activeRootListKind = undefined;
      const quote = /^ {0,3}> ?(.*)$/u.exec(line);
      if (quote !== null) {
        const contents: string[] = [];
        while (offset < lines.length) {
          const current = /^ {0,3}> ?(.*)$/u.exec(lines[offset] as string);
          if (current === null) break;
          contents.push(current[1] as string);
          offset++;
        }
        blocks.push({
          kind: "paragraph",
          value: {
            runs: parseMarkdownSpans(contents.join("\n"), this.baseURL),
            style: "quotations",
          },
        });
        continue;
      }
      const paragraph = [line.trimStart()];
      offset++;
      while (
        offset < lines.length &&
        (lines[offset] as string).trim().length > 0 &&
        !isBlockStart(lines[offset] as string, lines[offset + 1])
      )
        paragraph.push((lines[offset++] as string).trimStart());
      blocks.push({
        kind: "paragraph",
        value: { runs: parseMarkdownSpans(paragraph.join("\n").trimEnd(), this.baseURL) },
      });
    }
    if (blocks.length === 0) blocks.push({ kind: "paragraph", value: { runs: [] } });
    return blocks;
  }
}

/** Tests whether one line begins another block rather than continuing a paragraph. @param line - Current line. @param following - Next line. @returns Whether a boundary begins. */
function isBlockStart(line: string, following: string | undefined): boolean {
  return (
    isThematicBreak(line) ||
    /^ {0,3}(?:#{1,6}(?:\s|$)|(?:`{3,}|~{3,})|>\s?|(?:[-+*]|\d+[.)])\s+)/u.test(line) ||
    (line.includes("|") &&
      following !== undefined &&
      readMarkdownTableAlignment(following) !== undefined)
  );
}

/** Mirrors md4c's three-marker thematic block recognition after optional indentation. */
function isThematicBreak(line: string): boolean {
  const content = /^ {0,3}(.*)$/u.exec(line)?.[1];
  if (content === undefined) return false;
  const markers = content.replaceAll(/[ \t]/gu, "");
  return markers.length >= 3 && /^([-*_])\1*$/u.test(markers);
}
