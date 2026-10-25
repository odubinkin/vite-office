/** @fileoverview Markdown span callbacks for Writer text hints, following sw/source/filter/md/mdcallbcks.cxx. */
import { FontStrikeout } from "../../../../tools/inc/fontenum";
import type { WriterTextRun } from "../basflt/writer-transfer";
import type { WriterCharacterAttributes } from "../../core/txtnode/txatbase";

const DEFAULT_ATTRIBUTES: WriterCharacterAttributes = {
  bold: false,
  italic: false,
  underline: false,
};

/** Resolves the md4c hyperlink callback through the supplied document base URL. */
function resolveMarkdownLink(baseURL: string, target: string): string {
  if (target.length === 0 || target.startsWith("#")) return target;
  try {
    return new URL(target, baseURL || undefined).href;
  } catch {
    // INetURLObject::GetAbsURL returns the original relative text on conversion failure.
    return target;
  }
}

/** Converts represented md4c span events into native Writer run inputs. @param source - One Markdown inline body. @param baseURL - Source document URL when available. @returns Styled text portions. */
export function parseMarkdownSpans(source: string, baseURL = ""): readonly WriterTextRun[] {
  const runs: WriterTextRun[] = [];
  /** Appends a text callback with the current span stack. @param text - Visible text. @param attributes - Active direct attributes. @param url - Active hyperlink. */
  function append(text: string, attributes: WriterCharacterAttributes, url?: string): void {
    if (text.length === 0) return;
    const hyperlink = url === undefined ? undefined : { url };
    const previous = runs.at(-1);
    if (
      previous !== undefined &&
      previous.hyperlink?.url === url &&
      equalAttributes(previous.attributes, attributes)
    ) {
      runs[runs.length - 1] = { ...previous, text: previous.text + text };
      return;
    }
    runs.push({
      text,
      attributes: { ...attributes },
      ...(hyperlink === undefined ? {} : { hyperlink }),
    });
  }
  /** Dispatches nested emphasis, link, code and escaped-character spans. @param text - Source range. @param attributes - Inherited attributes. @param url - Inherited link. */
  function visit(text: string, attributes: WriterCharacterAttributes, url?: string): void {
    for (let offset = 0; offset < text.length;) {
      const character = text[offset] as string;
      if (
        character === "\\" &&
        offset + 1 < text.length &&
        /[\\`*_[\]{}()#+.!>|~-]/u.test(text[offset + 1] as string)
      ) {
        append(text[offset + 1] as string, attributes, url);
        offset += 2;
        continue;
      }
      if (character === "\\" && text[offset + 1] === "\n") {
        append("\n", attributes, url);
        offset += 2;
        continue;
      }
      if (character === "[" && url === undefined) {
        const close = findClosing(text, "]", offset + 1);
        if (close >= 0 && text[close + 1] === "(") {
          const end = findClosing(text, ")", close + 2);
          if (end >= 0) {
            const target = text.slice(close + 2, end).trim();
            if (target.length > 0) {
              visit(
                text.slice(offset + 1, close),
                attributes,
                resolveMarkdownLink(baseURL, target),
              );
              offset = end + 1;
              continue;
            }
          }
        }
      }
      if (character === "`" || character === "*" || character === "_" || character === "~") {
        const marker =
          character === "*" || character === "_"
            ? text.startsWith(character + character, offset)
              ? character + character
              : character
            : character === "~"
              ? "~~"
              : "`";
        if (character !== "~" || text.startsWith(marker, offset)) {
          const end = findClosing(text, marker, offset + marker.length);
          if (end > offset + marker.length) {
            const inner = text.slice(offset + marker.length, end);
            if (marker === "`")
              append(
                inner.replaceAll("\n", " "),
                { ...attributes, fontFamily: "Liberation Mono" },
                url,
              );
            else if (marker === "~~")
              visit(inner, { ...attributes, strikeout: FontStrikeout.STRIKEOUT_SINGLE }, url);
            else if (marker.length === 2) visit(inner, { ...attributes, bold: true }, url);
            else visit(inner, { ...attributes, italic: true }, url);
            offset = end + marker.length;
            continue;
          }
        }
      }
      if (character === "\n") {
        if (text.slice(Math.max(0, offset - 2), offset) === "  ") {
          const previous = runs.at(-1);
          if (previous !== undefined) {
            const trimmed = previous.text.replace(/ +$/u, "");
            if (trimmed.length === 0) runs.pop();
            else runs[runs.length - 1] = { ...previous, text: trimmed };
          }
          append("\n", attributes, url);
        } else append("\u00a0", attributes, url);
        offset++;
        continue;
      }
      append(character, attributes, url);
      offset++;
    }
  }
  visit(source, DEFAULT_ATTRIBUTES);
  return runs;
}

/** Finds an unescaped delimiter, including multi-character emphasis markers. @param text - Source. @param marker - Closing marker. @param from - Search start. @returns Offset or -1. */
function findClosing(text: string, marker: string, from: number): number {
  for (let offset = from; offset <= text.length - marker.length; offset++) {
    if (text[offset] === "\\") {
      offset++;
      continue;
    }
    if (text.startsWith(marker, offset))
      return marker.length === 2 && text.startsWith(marker + marker[0], offset)
        ? offset + 1
        : offset;
  }
  return -1;
}

/** Compares the represented direct-format state for adjacent run merging. @param a - First. @param b - Second. @returns Equality. */
function equalAttributes(a: WriterCharacterAttributes, b: WriterCharacterAttributes): boolean {
  return (
    a.bold === b.bold &&
    a.italic === b.italic &&
    a.underline === b.underline &&
    a.strikeout === b.strikeout &&
    a.fontFamily === b.fontFamily
  );
}
