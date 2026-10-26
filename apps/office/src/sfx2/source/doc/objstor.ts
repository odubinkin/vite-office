/** @fileoverview Source SfxObjectShell CSV separator detection from objstor.cxx. */
import type { rtl_TextEncoding } from "../../../sal/inc/rtl/textenc";
import type { SvStream } from "../../../tools/source/stream/stream";

const commonSeparators = [",", "\t", ";", ":", "|", " ", "\\", "/"] as const;

/** Source occurrence statistics for one candidate UTF-16 separator. */
interface SeparatorStats {
  lines: number;
  distinctCounts: number;
}

/** Source OUString::startsWithIgnoreAsciiCase for the fixed sep= prefix. */
function startsWithSepHeader(line: string, quoted: boolean): boolean {
  const prefix = quoted ? '"sep=' : "sep=";
  for (let index = 0; index < prefix.length; index++) {
    let unit = line.charCodeAt(index);
    if (unit >= 65 && unit <= 90) unit += 32;
    if (unit !== prefix.charCodeAt(index)) return false;
  }
  return true;
}

/** The source's line-count and count-variance selection, including sep= and quoted text. */
export function DetectCsvSeparators(
  stream: SvStream,
  encoding: rtl_TextEncoding,
  delimiter: string,
): string {
  const initialPosition = stream.Tell(),
    startTime = Date.now(),
    previousLines: Array<Map<string, number>> = [],
    stats = new Map<string, SeparatorStats>(),
    common = new Set<string>(commonSeparators);
  let counts = new Map<string, number>();
  let result = "";
  let lineCount = 0;
  let maxLinesWithChar = 0;
  let minDistinctCounts = 0xffffffff;
  let insideDelimiter = false;
  if (!delimiter || delimiter === "\0") delimiter = '"';
  stream.StartReadingUnicodeText(encoding);
  stream.SetStreamEncoding(encoding);
  while (Date.now() - startTime < 500) {
    const line = stream.ReadUniOrByteStringLine();
    if (stream.eof()) break;
    if (!line) continue;
    if (!lineCount) {
      if (line.length === 5 && startsWithSepHeader(line, false)) {
        result += line[4];
        break;
      }
      if (line.length === 7 && line[6] === '"' && startsWithSepHeader(line, true)) {
        result += line[5];
        break;
      }
    }
    for (let position = 0; position < line.length; position++) {
      const character = line[position] as string;
      if (character === delimiter) {
        insideDelimiter = !insideDelimiter;
        continue;
      }
      if (!insideDelimiter && common.has(character))
        counts.set(character, (counts.get(character) ?? 0) + 1);
    }
    if (insideDelimiter) continue;
    lineCount++;
    for (const [character, count] of counts) {
      const current = stats.get(character);
      if (!current) stats.set(character, { lines: 1, distinctCounts: 1 });
      else {
        current.lines++;
        if (!previousLines.some((lineCounts) => lineCounts.get(character) === count))
          current.distinctCounts++;
      }
      maxLinesWithChar = Math.max(maxLinesWithChar, stats.get(character)?.lines ?? 0);
    }
    previousLines.push(counts);
    counts = new Map<string, number>();
  }
  for (const value of stats.values())
    if (value.lines === maxLinesWithChar && value.distinctCounts < minDistinctCounts)
      minDistinctCounts = value.distinctCounts;
  const initialSeparators = new Set<string>();
  for (const [character, value] of stats)
    if (value.lines === maxLinesWithChar && value.distinctCounts === minDistinctCounts)
      initialSeparators.add(character);
  for (const character of commonSeparators)
    if (initialSeparators.has(character)) result += character;
  stream.Seek(initialPosition);
  return result;
}
