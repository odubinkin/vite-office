/** @fileoverview Native Word field command tokenizer and shared hyperlink command interpretation. */
import type { WriterHyperlink } from "../../core/txtnode/fmtatr2";
import { SwPosition } from "../../core/crsr/pam";
import type { SwXText } from "../../core/unocore/unotext";

/** Native field context for a command and its result range. */
export class FieldContext {
  command = "";
  completed = false;

  /** Owns the original new-document insertion position. @param start - Registered start position. @returns Field owner. */
  constructor(readonly start: SwPosition) {}

  /** Applies the hyperlink field across the native result runs. @param body - Actual destination text. @returns Nothing. */
  ApplyResult(body: SwXText): void {
    const link = ParseHyperlinkInstruction(this.command);
    if (!link) return;
    const nodes = body.GetTextNodes();
    const start = this.start.GetNode().GetTextNode();
    const index = start ? nodes.indexOf(start) : -1;
    if (index < 0) return;
    for (let i = index; i < nodes.length; ++i) {
      const node = nodes[i];
      node?.SetHyperlink(i === index ? this.start.GetContentIndex() : 0, node.Len(), link);
    }
  }

  /** Releases the registered field position. @returns Nothing. */
  dispose(): void {
    this.start.Dispose();
  }
}

/** Creates the current Writer insertion position with stable left affinity. @param body - Destination body. @returns New field or undefined. */
export function CurrentTextPosition(body: SwXText): SwPosition | undefined {
  const node = body.GetTextNodes().at(-1);
  return node && new SwPosition(node, node.Len(), "mark", "before");
}

/** Extracts Word field command parts with the quoted-space and screen-tip rules of FieldContext.  @param command - Command. @returns The string[] result. */
export function GetCommandParts(command: string): string[] {
  const parts: string[] = [];
  let inString = false;
  let screenTip = false;
  let part = "";
  const tokens = command
    .split(" ")
    .filter(
      /** Computes the token result. @param token - Token. @returns The computed result. */ (
        token,
      ) => token.length > 0,
    );
  for (const [index, sourceToken] of tokens.entries()) {
    let token = sourceToken;
    let inStringNext: boolean = inString;
    if (screenTip) {
      let removeQuotation = true;
      inStringNext = index < tokens.length - 1;
      if (token.startsWith('"') && !inString) token = token.slice(1);
      if (token.startsWith("\\")) {
        removeQuotation = false;
        token = token.replaceAll("\\", "");
      }
      if (!inStringNext && removeQuotation) token = token.slice(0, -1);
    } else {
      if (token.startsWith('"')) {
        inStringNext = true;
        token = token.slice(1);
      }
      if (token.endsWith('"')) {
        inStringNext = false;
        token = token.slice(0, -1);
      }
    }
    if (token === "\\o") screenTip = true;
    if (inString) {
      part += ` ${token}`;
      if (!inStringNext) parts.push(part);
    } else if (inStringNext) part = token;
    else parts.push(token);
    inString = inStringNext;
  }
  return parts;
}
/** Applies the pinned DomainMapper HYPERLINK switches to one represented Writer link.  @param instruction - Instruction. @returns The WriterHyperlink | undefined result. */
export function ParseHyperlinkInstruction(instruction: string): WriterHyperlink | undefined {
  const parts = GetCommandParts(instruction);
  if (parts[0]?.toUpperCase() !== "HYPERLINK") return undefined;
  let url = "";
  let targetFrame = "";
  let name = "";
  for (let index = 1; index < parts.length; index++) {
    // Command tokenization returns a dense local array; this loop admits only existing entries.
    const part = parts[index] as string;
    if (part === "\\l") url += `#${parts[++index] ?? ""}`;
    else if (part === "\\t") targetFrame = parts[++index] ?? "";
    else if (part === "\\o") name = parts[++index] ?? "";
    else if (part !== "\\m" && part !== "\\n" && part !== "\\h")
      url = part.replaceAll("\\\\", "\\");
  }
  if (url.length === 0) return undefined;
  if (url.startsWith("file:///")) url = url.replaceAll("\\", "/");
  return {
    url,
    ...(targetFrame.length === 0 ? {} : { targetFrame }),
    ...(name.length === 0 ? {} : { name }),
  };
}
