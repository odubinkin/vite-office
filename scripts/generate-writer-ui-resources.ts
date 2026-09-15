/** @fileoverview Generates the supported Writer UI resource subset from the pinned LibreOffice checkout. */

import { readFile, writeFile } from "node:fs/promises";

import { format } from "prettier";

/** One supported command and any explicit browser-bound divergence. */
interface CommandSpec {
  readonly browserLabel?: string;
  readonly browserSlotId?: number;
  readonly commandUrl: string;
  readonly semantics?: "action" | "check" | "radio";
  readonly sourceUrl?: string;
}

const upstreamRoot = "vendor/libreoffice-reference";
const outputPath = "apps/office/src/sw/uiconfig/swriter/writer-ui.generated.json";
const specs: readonly CommandSpec[] = [
  { commandUrl: ".uno:CenterPara", semantics: "radio" },
  { commandUrl: ".uno:JustifyPara", semantics: "radio" },
  { commandUrl: ".uno:StartPara", semantics: "radio" },
  { commandUrl: ".uno:EndPara", semantics: "radio" },
  { commandUrl: ".uno:Bold", semantics: "check" },
  { commandUrl: ".uno:Copy" },
  { commandUrl: ".uno:Cut" },
  { commandUrl: ".uno:DecrementLevel" },
  { commandUrl: ".uno:EditHyperlink" },
  { commandUrl: ".uno:ExportTo" },
  { commandUrl: ".uno:CharFontName" },
  { commandUrl: ".uno:HyperlinkDialog" },
  { commandUrl: ".uno:Italic", semantics: "check" },
  { commandUrl: ".uno:AddDirect" },
  {
    browserLabel: "Open Local Copy",
    browserSlotId: 65_001,
    commandUrl: "vnd.vite-office.browser:OpenLocal",
  },
  { commandUrl: ".uno:Open", sourceUrl: ".uno:OpenFromWriter" },
  { commandUrl: ".uno:DefaultNumbering", semantics: "radio" },
  { commandUrl: ".uno:Paste" },
  { commandUrl: ".uno:IncrementLevel" },
  { commandUrl: ".uno:Redo" },
  { commandUrl: ".uno:RemoveBullets", semantics: "radio" },
  { commandUrl: ".uno:RemoveHyperlink" },
  {
    browserLabel: "Save Local Copy",
    browserSlotId: 65_002,
    commandUrl: "vnd.vite-office.browser:SaveLocal",
  },
  { commandUrl: ".uno:SaveAs" },
  { commandUrl: ".uno:SelectAll" },
  { commandUrl: ".uno:Ruler", semantics: "check" },
  { commandUrl: ".uno:Sidebar", semantics: "check" },
  { commandUrl: ".uno:StatusBarVisible", semantics: "check" },
  { commandUrl: ".uno:StyleApply", semantics: "radio" },
  { commandUrl: ".uno:Underline", semantics: "check" },
  { commandUrl: ".uno:Undo" },
  { commandUrl: ".uno:DefaultBullet", semantics: "radio" },
];

const resourcePaths = [
  "sw/uiconfig/swriter/menubar/menubar.xml",
  "sw/uiconfig/swriter/toolbar/standardbar.xml",
  "sw/uiconfig/swriter/toolbar/textobjectbar.xml",
  "sw/uiconfig/swriter/toolbar/numobjectbar.xml",
  "sw/uiconfig/swriter/popupmenu/text.xml",
] as const;

const sdiPaths = ["sw/sdi/swriter.sdi", "sfx2/sdi/sfx.sdi", "svx/sdi/svx.sdi"] as const;
const macroPaths = [
  "include/svl/solar.hrc",
  "include/sfx2/sfxsids.hrc",
  "include/svx/svxids.hrc",
  "include/editeng/editids.hrc",
  "sw/inc/cmdid.h",
] as const;
const [genericCommands, writerCommands, accelerators, ...remainingTexts] = await Promise.all([
  readFile(
    `${upstreamRoot}/officecfg/registry/data/org/openoffice/Office/UI/GenericCommands.xcu`,
    "utf8",
  ),
  readFile(
    `${upstreamRoot}/officecfg/registry/data/org/openoffice/Office/UI/WriterCommands.xcu`,
    "utf8",
  ),
  readFile(
    `${upstreamRoot}/officecfg/registry/data/org/openoffice/Office/Accelerators.xcu`,
    "utf8",
  ),
  ...resourcePaths.map(
    /** Reads one upstream UI resource. @param path - Relative source path. @returns Resource text promise. */ (
      path,
    ) => readFile(`${upstreamRoot}/${path}`, "utf8"),
  ),
  ...sdiPaths.map(
    /** Reads one upstream SDI declaration. @param path - Relative source path. @returns SDI text promise. */ (
      path,
    ) => readFile(`${upstreamRoot}/${path}`, "utf8"),
  ),
  ...macroPaths.map(
    /** Reads one upstream macro catalog. @param path - Relative source path. @returns Macro text promise. */ (
      path,
    ) => readFile(`${upstreamRoot}/${path}`, "utf8"),
  ),
]);
const resourceTexts = remainingTexts.slice(0, resourcePaths.length);
const sdiTexts = remainingTexts.slice(resourcePaths.length, resourcePaths.length + sdiPaths.length);
const macroTexts = remainingTexts.slice(resourcePaths.length + sdiPaths.length);
const macros = parseMacros(macroTexts);

const commands = Object.fromEntries(
  specs.map(
    /** Generates one supported command resource. @param spec - Supported command specification. @returns URL and resource pair. */ (
      spec,
    ) => {
      const sourceUrl = spec.sourceUrl ?? spec.commandUrl;
      const label =
        spec.browserLabel ?? findEnglishLabel(spec.commandUrl, genericCommands, writerCommands);
      const shortcuts =
        spec.browserLabel === undefined ? findShortcuts(spec.commandUrl, accelerators) : [];
      const placements = resourcePaths.filter(
        /** Detects a command placement in an upstream resource. @param _path - Resource path. @param index - Resource index. @returns Whether placed. */ (
          _,
          index,
        ) => resourceTexts[index]?.includes(sourceUrl),
      );
      if (spec.browserLabel === undefined && placements.length === 0)
        throw new Error(
          `Supported upstream command has no Writer resource placement: ${sourceUrl}`,
        );
      return [
        spec.commandUrl,
        {
          label: stripMnemonic(label),
          placements,
          semantics: spec.semantics ?? "action",
          shortcuts,
          slotId:
            spec.browserSlotId ??
            resolveMacro(findSlotSymbol(spec.commandUrl, sdiTexts), macros, new Set()),
        },
      ];
    },
  ),
);

const supportedSourceUrls = new Set(
  specs.map(
    /** Resolves the upstream URL used for placement matching. @param spec - Command specification. @returns Source URL. */ (
      spec,
    ) => spec.sourceUrl ?? spec.commandUrl,
  ),
);
const sourceToCommand = new Map(
  specs.map(
    /** Maps one upstream source URL to the public command URL. @param spec - Command specification. @returns Source and public URL pair. */ (
      spec,
    ) => [spec.sourceUrl ?? spec.commandUrl, spec.commandUrl] as const,
  ),
);
const resourceOrder = Object.fromEntries(
  resourcePaths.map(
    /** Extracts supported commands in exact upstream order. @param path - Resource path. @param index - Resource index. @returns Path and command sequence. */ (
      path,
      index,
    ) => [
      path,
      [...(resourceTexts[index] ?? "").matchAll(/(?:menu:id|xlink:href)="([^"]+)"/g)]
        .map(
          /** Maps a resource URL to its public supported URL. @param match - XML URL match. @returns Public URL when supported. */ (
            match,
          ) => sourceToCommand.get(match[1] as string),
        )
        .filter(
          /** Removes unsupported resource URLs. @param commandUrl - Possible supported URL. @returns Whether supported. */ (
            commandUrl,
          ): commandUrl is string => commandUrl !== undefined,
        ),
    ],
  ),
);
const unsupported = Object.fromEntries(
  resourcePaths.map(
    /** Extracts explicit X-class resource commands. @param path - Resource path. @param index - Resource index. @returns Path and unsupported sequence. */ (
      path,
      index,
    ) => [
      path,
      [...(resourceTexts[index] ?? "").matchAll(/(?:menu:id|xlink:href)="([^"]+)"/g)]
        .map(
          /** Extracts the matched command URL. @param match - XML URL match. @returns Command URL. */ (
            match,
          ) => match[1] as string,
        )
        .filter(
          /** Keeps URLs outside the supported slice. @param commandUrl - Resource URL. @returns Whether unsupported. */ (
            commandUrl,
          ) => !supportedSourceUrls.has(commandUrl),
        ),
    ],
  ),
);
const generated = await format(
  JSON.stringify({
    baselineCommit: "9bc445578031fecf56086729d8e4940c77e14d65",
    commands,
    resourceOrder,
    schemaVersion: 1,
    unsupported,
  }),
  { parser: "json" },
);

if (process.argv.includes("--check")) {
  if ((await readFile(outputPath, "utf8")) !== generated)
    throw new Error(
      "Generated Writer UI resources are stale; run npm run generate:writer-resources.",
    );
} else await writeFile(outputPath, generated);

/** Finds the pinned English command label. @param commandUrl - UNO command URL. @param catalogs - XCU command catalogs. @returns Localized label. */
function findEnglishLabel(commandUrl: string, ...catalogs: readonly string[]): string {
  for (const catalog of catalogs) {
    const marker = `<node oor:name="${commandUrl}"`;
    const start = catalog.indexOf(marker);
    if (start < 0) continue;
    const next = catalog.indexOf("\n      <node oor:name=", start + marker.length);
    const block = catalog.slice(start, next < 0 ? undefined : next);
    const label = block.match(
      /<prop oor:name="Label"[\s\S]*?<value xml:lang="en-US">([\s\S]*?)<\/value>/,
    )?.[1];
    if (label !== undefined) return decodeXml(label.trim());
  }
  throw new Error(`Missing upstream English label: ${commandUrl}`);
}

/** Finds default shortcuts for one command. @param commandUrl - UNO command URL. @param catalog - Accelerator XCU. @returns Browser-normalized shortcuts. */
function findShortcuts(commandUrl: string, catalog: string): readonly string[] {
  const shortcuts = new Set<string>();
  for (const match of catalog.matchAll(
    /<node oor:name="([^"]+)"[^>]*>\s*<prop oor:name="Command">([\s\S]*?)<\/prop>\s*<\/node>/g,
  )) {
    if (!match[2]?.includes(`<value xml:lang="en-US">${commandUrl}</value>`)) continue;
    const shortcut = convertShortcut(match[1] as string);
    shortcuts.add(shortcut);
    if (shortcut.startsWith("Ctrl+")) shortcuts.add(`Meta+${shortcut.slice(5)}`);
  }
  return [...shortcuts];
}

/** Finds the SDI macro backing one command. @param commandUrl - UNO command URL. @param catalogs - SDI texts. @returns HRC macro name. */
function findSlotSymbol(commandUrl: string, catalogs: readonly string[]): string {
  const commandName = commandUrl.slice(".uno:".length).split("?", 1)[0] as string;
  for (const catalog of catalogs) {
    const match = catalog.match(
      new RegExp(`^\\S+\\s+${escapeRegExp(commandName)}\\s+([A-Z][A-Z0-9_]+)`, "m"),
    );
    if (match?.[1] !== undefined) return match[1];
  }
  throw new Error(`Missing upstream SDI slot declaration: ${commandUrl}`);
}

/** Collects object-like HRC definitions. @param catalogs - HRC source texts. @returns Macro expressions by name. */
function parseMacros(catalogs: readonly string[]): ReadonlyMap<string, string> {
  const macros = new Map<string, string>();
  for (const catalog of catalogs) {
    for (const line of catalog.split("\n")) {
      const definition = line.split("//", 1)[0]?.split("/*", 1)[0];
      const match = definition?.match(/^#define\s+([A-Z][A-Z0-9_]+)\s+(.+)$/);
      if (match?.[1] !== undefined && match[2] !== undefined) macros.set(match[1], match[2].trim());
    }
  }
  return macros;
}

/** Resolves the arithmetic subset used by slot macros. @param name - Macro name. @param macros - Parsed definitions. @param resolving - Recursion guard. @returns Numeric slot identity. */
function resolveMacro(
  name: string,
  macros: ReadonlyMap<string, string>,
  resolving: ReadonlySet<string>,
): number {
  if (resolving.has(name)) throw new Error(`Cyclic upstream slot macro: ${name}`);
  const expression = macros.get(name);
  if (expression === undefined)
    throw new Error(`Missing upstream slot macro: ${name} from ${[...resolving].join(" -> ")}`);
  const nextResolving = new Set(resolving).add(name);
  const unwrapped = expression
    .replace(/^TypedWhichId<[^>]+>\((.*)\)$/, "$1")
    .replace(/[()]/g, "")
    .trim();
  const terms = unwrapped.match(/[+-]?\s*(?:0x[\da-fA-F]+|\d+|[A-Z][A-Z0-9_]*)/g);
  if (terms === null) throw new Error(`Unsupported upstream slot expression: ${expression}`);
  return terms.reduce(
    /** Accumulates one numeric or referenced macro term. @param total - Current value. @param rawTerm - Signed expression term. @returns Updated value. */ (
      total,
      rawTerm,
    ) => {
      const term = rawTerm.replaceAll(" ", "");
      const sign = term.startsWith("-") ? -1 : 1;
      const value = term.replace(/^[+-]/, "");
      const resolved = /^[A-Z]/.test(value)
        ? resolveMacro(value, macros, nextResolving)
        : Number.parseInt(value, 0);
      return total + sign * resolved;
    },
    0,
  );
}

/** Escapes literal text for a regular expression. @param value - Literal value. @returns Escaped pattern text. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Converts a LibreOffice accelerator key name. @param value - XCU accelerator identity. @returns Browser shortcut. */
function convertShortcut(value: string): string {
  const [key, ...modifiers] = value.split("_");
  return [
    ...(modifiers.includes("MOD1") ? ["Ctrl"] : []),
    ...(modifiers.includes("MOD2") ? ["Alt"] : []),
    ...(modifiers.includes("SHIFT") ? ["Shift"] : []),
    key === "RETURN" ? "Enter" : key,
  ].join("+");
}

/** Removes desktop mnemonic and dialog suffix syntax. @param value - Upstream label. @returns Browser label base. */
function stripMnemonic(value: string): string {
  return value.replaceAll("~", "").replace(/\.\.\.$/, "");
}

/** Decodes XML entities used by labels. @param value - XML text. @returns Plain text. */
function decodeXml(value: string): string {
  return value.replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">");
}
