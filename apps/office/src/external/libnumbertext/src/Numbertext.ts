/** @fileoverview Original Numbertext module loading/cache, bound to the packaged official JavaScript interpreter. */
import Soros from "@vite-office/libnumbertext";
import programs from "@vite-office/libnumbertext/data.json" with { type: "json" };

/** Packaged replacement for source readfile; filenames and source fallback order remain unchanged. @param filename - Source-selected filename. @returns Original program, or absent file. */
function readfile(filename: string): string | undefined {
  return Object.hasOwn(programs, filename)
    ? (programs as Readonly<Record<string, string>>)[filename]
    : undefined;
}

/** Source Numbertext owner, retaining lazy per-language modules independently of file names. */
export class Numbertext {
  private prefix = "";
  private readonly modules = new Map<string, Soros>();

  /** Sets the original directory prefix. @param prefix - Prefix including any directory separator. @returns Nothing. */
  set_prefix(prefix: string): void {
    this.prefix = prefix;
  }

  /** Original load: exact file, two-character country removal, then Norwegian aliases. @param lang - Exact module/cache key. @param filename - Optional explicit filename. @returns Whether a program was loaded. */
  load(lang: string, filename = ""): boolean {
    if (filename.length === 0) filename = this.prefix + lang.replaceAll("-", "_") + ".sor";
    let module = readfile(filename);
    if (module === undefined) {
      // The source concatenates the unescaped SOROS_EXT into this regular expression.
      filename = filename.replace(/[-_]...sor$/, ".sor");
      module = readfile(filename);
      if (module === undefined) {
        // C++ \? is a string-literal escape for ?, not a regex literal question mark.
        if (/^n[bn]([-_]NO)?$/.exec(lang)?.[0] !== lang) return false;
        module = readfile(filename.replace(/n[bn]([-_]NO)?.sor$/, "no.sor"));
        if (module === undefined) return false;
      }
    }
    const compiled = new Soros(module, lang);
    // std::unordered_map::insert does not replace a previously loaded exact key.
    if (!this.modules.has(lang)) this.modules.set(lang, compiled);
    return true;
  }

  /** Original in/out string overload: missing language leaves input unchanged; interpreter no-match remains empty. @param number - Mutable logical string. @param lang - Exact requested language. @returns Whether its program exists. */
  numbertext(number: [string], lang: string): boolean {
    if (!this.modules.has(lang) && !this.load(lang)) return false;
    number[0] = (this.modules.get(lang) as Soros).run(number[0]);
    return true;
  }
}
