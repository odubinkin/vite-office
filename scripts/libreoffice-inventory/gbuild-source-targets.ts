/**
 * @fileoverview Parses gbuild source-list macros into deterministic literal and unevaluated Make-expression tokens without retaining makefile text.
 */

/** Identifies whether a gbuild source-target token is a physical literal or an unevaluated Make expression. */
export type GbuildSourceTargetKind = "expression" | "literal";

/** Describes one extensionless source target declared by a gbuild source-list macro. */
export interface GbuildSourceTarget {
  /** Raw extensionless gbuild source target, preserving a Make expression when it cannot be resolved statically. */
  readonly declaredTarget: string;
  /** Test target name supplied as the macro's first argument. */
  readonly testName: string;
  /** Whether the declared target is a physical literal or an unevaluated Make expression. */
  readonly targetKind: GbuildSourceTargetKind;
}

/**
 * Extracts deterministic source-target tokens from one pinned gbuild makefile's selected macro form.
 *
 * @param sourceText - Complete UTF-8 makefile text read from the pinned core checkout.
 * @param macroName - Exact gbuild macro name after `$(call` and before its first comma.
 * @returns Unique source targets ordered by test name, target kind, then code-unit target value.
 * @throws {Error} When a selected macro is unclosed or lacks a test name or source-list argument.
 */
export function extractGbuildSourceTargets(
  sourceText: string,
  macroName: string,
): readonly GbuildSourceTarget[] {
  const records = extractMacroPayloads(sourceText, macroName).flatMap(createMacroRecords);
  return [...new Map(records.map(createRecordEntry)).values()].sort(compareTargets);
}

/**
 * Extracts the comma-separated argument payload of each complete selected gbuild macro.
 *
 * @param sourceText - Complete makefile text to scan without evaluating Make expressions.
 * @param macroName - Exact gbuild macro name whose calls are in scope.
 * @returns Macro payload strings excluding the outer eval and call delimiters.
 * @throws {Error} When a matched macro prefix is not closed by balanced Make parentheses.
 */
function extractMacroPayloads(sourceText: string, macroName: string): readonly string[] {
  const macroPrefix = `$(eval $(call ${macroName},`;
  const payloads: string[] = [];
  let startIndex = sourceText.indexOf(macroPrefix);

  while (startIndex >= 0) {
    const payloadStart = startIndex + macroPrefix.length;
    const payloadEnd = findMacroPayloadEnd(sourceText, payloadStart, macroName);
    payloads.push(sourceText.slice(payloadStart, payloadEnd));
    startIndex = sourceText.indexOf(macroPrefix, payloadEnd + 2);
  }

  return payloads;
}

/**
 * Finds the first outer closing parenthesis of one macro payload by tracking nested Make expressions.
 *
 * @param sourceText - Complete makefile text containing the selected macro prefix.
 * @param payloadStart - Offset immediately after the macro prefix's trailing comma.
 * @param macroName - Exact gbuild macro name used in a diagnostic when the declaration is unclosed.
 * @returns Offset of the call-closing parenthesis, immediately before eval's final parenthesis.
 * @throws {Error} When the macro does not end with balanced Make parentheses.
 */
function findMacroPayloadEnd(sourceText: string, payloadStart: number, macroName: string): number {
  let depth = 2;

  for (let index = payloadStart; index < sourceText.length; index += 1) {
    if (sourceText.startsWith("$(", index)) {
      depth += 1;
      index += 1;
    } else if (sourceText[index] === ")") {
      depth -= 1;
      if (depth === 0) return index - 1;
    }
  }

  throw new Error(`Unclosed ${macroName} declaration.`);
}

/**
 * Converts one macro payload into source-target records using its test name and source-list argument.
 *
 * @param payload - Raw text between the macro prefix and its two outer closing parentheses.
 * @returns Records for the source-list argument; later macro arguments such as compiler flags are omitted.
 * @throws {Error} When the test name or source-list argument is absent or blank.
 */
function createMacroRecords(payload: string): readonly GbuildSourceTarget[] {
  const argumentsList = splitTopLevelArguments(payload);
  const testName = argumentsList[0]?.trim();
  const sourceList = argumentsList[1]?.trim();
  if (
    testName === undefined ||
    testName.length === 0 ||
    sourceList === undefined ||
    sourceList.length === 0
  ) {
    throw new Error("Malformed gbuild source-list declaration.");
  }

  return splitTopLevelWords(sourceList).map(
    /**
     * Converts one source-list token into a canonical provenance record.
     *
     * @param declaredTarget - One literal or unevaluated Make source target token.
     * @returns Canonical target record linked to its gbuild test name.
     */
    function createTargetRecord(declaredTarget: string): GbuildSourceTarget {
      return {
        declaredTarget,
        targetKind: declaredTarget.includes("$(") ? "expression" : "literal",
        testName,
      };
    },
  );
}

/**
 * Splits Make-function arguments at commas outside nested Make expressions.
 *
 * @param value - Make-function payload excluding its surrounding parentheses.
 * @returns Argument fragments in original order, preserving nested expressions intact.
 */
function splitTopLevelArguments(value: string): readonly string[] {
  return splitAtTopLevel(value, ",");
}

/**
 * Splits a Make source-list argument at whitespace outside nested Make expressions.
 *
 * @param value - Source-list argument whose values may include nested Make expressions.
 * @returns Non-empty source target tokens in original order.
 */
function splitTopLevelWords(value: string): readonly string[] {
  return splitAtTopLevel(value.replace(/\\\r?\n/gu, " "), "whitespace")
    .map(removeContinuationMarker)
    .filter(isNonEmptyValue);
}

/**
 * Removes a standalone Make line-continuation marker left after source-list splitting.
 *
 * @param value - Trimmed source-list token.
 * @returns An empty string for a continuation marker, otherwise the original target token.
 */
function removeContinuationMarker(value: string): string {
  return value === "\\" ? "" : value;
}

/**
 * Splits text at a requested separator only while outside Make expression parentheses.
 *
 * @param value - Text to split without normalizing the retained token values.
 * @param separator - Comma or whitespace splitting mode.
 * @returns Raw fragments in original order.
 */
function splitAtTopLevel(value: string, separator: "," | "whitespace"): readonly string[] {
  const values: string[] = [];
  let depth = 0;
  let fragmentStart = 0;

  for (let index = 0; index < value.length; index += 1) {
    if (value.startsWith("$(", index)) {
      depth += 1;
      index += 1;
      continue;
    }
    if (value[index] === ")" && depth > 0) {
      depth -= 1;
      continue;
    }
    const isSeparator =
      (separator === "," && value[index] === ",") ||
      (separator === "whitespace" && /\s/u.test(value[index] ?? ""));
    if (depth === 0 && isSeparator) {
      values.push(value.slice(fragmentStart, index).trim());
      fragmentStart = index + 1;
    }
  }

  values.push(value.slice(fragmentStart).trim());
  return values;
}

/**
 * Determines whether a split source-list token has any retained content.
 *
 * @param value - Candidate token after source-list splitting.
 * @returns True only when the token is non-empty.
 */
function isNonEmptyValue(value: string): boolean {
  return value.length > 0;
}

/**
 * Creates a stable deduplication entry for one source-target record.
 *
 * @param record - Source-target record to key.
 * @returns A stable key and its original record.
 */
function createRecordEntry(record: GbuildSourceTarget): readonly [string, GbuildSourceTarget] {
  return [`${record.testName}\0${record.targetKind}\0${record.declaredTarget}`, record];
}

/**
 * Orders records by test name, target kind, then target value in portable code-unit lexical order.
 *
 * @param left - First source-target record.
 * @param right - Second source-target record.
 * @returns Negative or positive lexical comparison result for unique records.
 */
function compareTargets(left: GbuildSourceTarget, right: GbuildSourceTarget): number {
  const leftKey = `${left.testName}\0${left.targetKind}\0${left.declaredTarget}`;
  const rightKey = `${right.testName}\0${right.targetKind}\0${right.declaredTarget}`;
  return leftKey < rightKey ? -1 : 1;
}
