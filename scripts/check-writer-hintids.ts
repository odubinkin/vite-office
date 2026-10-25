/** @fileoverview Verifies consumed Writer numeric identities against expressions in the actual pinned hintids.hxx. */
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

/** Resolves original integer constant declarations; no compiled or duplicated numeric table is used. @param header - Pinned C++ header. @param local - Consumed TS declarations. @returns Checked declaration count. */
export function checkWriterHintIds(header: string, local: string): number {
  const clean = header.replace(/\/\*[\s\S]*?\*\//gu, "").replace(/\/\/[^\n]*/gu, "");
  const expressions = new Map<string, string>();
  for (const match of clean.matchAll(
    /inline constexpr\s+(?:sal_uInt16|TypedWhichId<[^>]+>)\s+(\w+)\s*(?:=\s*([^;]+)|\(([^;]+)\));/gu,
  ))
    expressions.set(match[1] as string, (match[2] ?? match[3]) as string);
  const pending = new Set<string>(),
    values = new Map<string, number>();
  const resolve =
    /** Evaluates admitted native +/- identity expressions only. @param name - Native identifier. @returns Original integer. */ (
      name: string,
    ): number => {
      if (values.has(name)) return values.get(name) as number;
      const expression = expressions.get(name);
      if (expression === undefined || pending.has(name))
        throw new Error(`Unresolved native Writer identity: ${name}`);
      pending.add(name);
      const tokens = expression.replace(/\s/gu, "").match(/[+-]?[^+-]+/gu) ?? [];
      if (tokens.length === 0)
        throw new Error(`Unsupported native Writer expression: ${expression}`);
      let result = 0;
      for (const token of tokens) {
        const sign = token.startsWith("-") ? -1 : 1,
          term = token.replace(/^[+-]/u, "");
        if (!/^(?:\d+|[A-Z_][A-Z_0-9]*)$/u.test(term))
          throw new Error(`Unsupported native Writer expression: ${expression}`);
        result += sign * (/^\d+$/u.test(term) ? Number(term) : resolve(term));
      }
      pending.delete(name);
      values.set(name, result);
      return result;
    };
  let count = 0;
  for (const match of local.matchAll(/export const (RES_\w+) = (\d+) as const;/gu)) {
    const name = match[1] as string,
      expected = resolve(name),
      actual = Number(match[2]);
    if (expected !== actual) throw new Error(`${name}: local ${actual}, pinned native ${expected}`);
    count++;
  }
  if (count === 0) throw new Error("No consumed Writer identities were checked.");
  return count;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [header, local] = await Promise.all([
    readFile("vendor/libreoffice-reference/sw/inc/hintids.hxx", "utf8"),
    readFile("apps/office/src/sw/inc/hintids.ts", "utf8"),
  ]);
  process.stdout.write(
    `Writer WhichId check passed: ${checkWriterHintIds(header, local)} native identities.\n`,
  );
}
