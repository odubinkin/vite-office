/** @fileoverview Generates the supported Writer UI resource subset from the pinned LibreOffice checkout. */

import { readFile, readdir, writeFile } from "node:fs/promises";

import { format } from "prettier";
import {
  assertGeneratedResourceFresh,
  buildResourceGraph,
  collectResourceCommands,
  validateGeneratedClosure,
  type ResourceNode,
} from "./writer-ui-resource-model";

/** One supported command and any explicit browser-bound divergence. */
interface CommandSpec {
  readonly browserArguments?: readonly string[];
  readonly browserControlLabel?: string;
  readonly browserLabel?: string;
  readonly browserSlotId?: number;
  readonly commandUrl: string;
  readonly showsDialog?: boolean;
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
  { commandUrl: ".uno:DecrementIndent" },
  { commandUrl: ".uno:EditHyperlink", showsDialog: true },
  { commandUrl: ".uno:ExportTo", showsDialog: true },
  {
    browserArguments: ["fontFamily:string"],
    browserControlLabel: "Font name",
    commandUrl: ".uno:CharFontName",
  },
  {
    browserArguments: ["fontSizePt:number"],
    browserControlLabel: "Font size",
    commandUrl: ".uno:FontHeight",
  },
  { commandUrl: ".uno:HyperlinkDialog", showsDialog: true },
  { commandUrl: ".uno:Italic", semantics: "check" },
  { commandUrl: ".uno:AddDirect" },
  {
    browserLabel: "Open Local Copy",
    browserSlotId: 65_001,
    commandUrl: "vnd.vite-office.browser:OpenLocal",
    showsDialog: true,
  },
  { commandUrl: ".uno:Open", showsDialog: true, sourceUrl: ".uno:OpenFromWriter" },
  { commandUrl: ".uno:PageDialog", showsDialog: true },
  { commandUrl: ".uno:DefaultNumbering", semantics: "radio" },
  { commandUrl: ".uno:Paste" },
  { commandUrl: ".uno:IncrementLevel" },
  { commandUrl: ".uno:IncrementIndent" },
  { commandUrl: ".uno:Redo" },
  { commandUrl: ".uno:RemoveBullets", semantics: "radio" },
  { commandUrl: ".uno:RemoveHyperlink" },
  {
    browserLabel: "Save Local Copy",
    browserSlotId: 65_002,
    commandUrl: "vnd.vite-office.browser:SaveLocal",
  },
  { commandUrl: ".uno:SaveAs", showsDialog: true },
  { commandUrl: ".uno:SelectAll" },
  { commandUrl: ".uno:Ruler", semantics: "check" },
  { commandUrl: ".uno:VRuler", semantics: "check" },
  { commandUrl: ".uno:Sidebar", semantics: "check" },
  { commandUrl: ".uno:StatusBarVisible", semantics: "check" },
  { browserControlLabel: "Paragraph style", commandUrl: ".uno:StyleApply", semantics: "radio" },
  { commandUrl: ".uno:Underline", semantics: "check" },
  { commandUrl: ".uno:Undo" },
  { commandUrl: ".uno:DefaultBullet", semantics: "radio" },
];

const commandAliases = {
  alignCenter: ".uno:CenterPara",
  alignJustify: ".uno:JustifyPara",
  alignLeft: ".uno:StartPara",
  alignRight: ".uno:EndPara",
  bold: ".uno:Bold",
  copy: ".uno:Copy",
  cut: ".uno:Cut",
  defaultParagraphStyle:
    ".uno:StyleApply?Style:string=Default%20Paragraph%20Style&FamilyName:string=ParagraphStyles",
  decreaseIndent: ".uno:DecrementIndent",
  demote: ".uno:DecrementLevel",
  editHyperlink: ".uno:EditHyperlink",
  exportText: ".uno:ExportTo",
  fontName: ".uno:CharFontName",
  fontHeight: ".uno:FontHeight",
  hyperlinkDialog: ".uno:HyperlinkDialog",
  headingOne: ".uno:StyleApply?Style:string=Heading%201&FamilyName:string=ParagraphStyles",
  italic: ".uno:Italic",
  increaseIndent: ".uno:IncrementIndent",
  newDocument: ".uno:AddDirect",
  openLocal: "vnd.vite-office.browser:OpenLocal",
  openOdt: ".uno:Open",
  pageDialog: ".uno:PageDialog",
  orderedList: ".uno:DefaultNumbering",
  paste: ".uno:Paste",
  promote: ".uno:IncrementLevel",
  redo: ".uno:Redo",
  removeBullets: ".uno:RemoveBullets",
  removeHyperlink: ".uno:RemoveHyperlink",
  saveLocal: "vnd.vite-office.browser:SaveLocal",
  saveOdt: ".uno:SaveAs",
  selectAll: ".uno:SelectAll",
  styleApply: ".uno:StyleApply",
  toggleHorizontalRuler: ".uno:Ruler",
  toggleVerticalRuler: ".uno:VRuler",
  toggleSidebar: ".uno:Sidebar",
  toggleStatusBar: ".uno:StatusBarVisible",
  underline: ".uno:Underline",
  undo: ".uno:Undo",
  unorderedList: ".uno:DefaultBullet",
} as const;

const commandCapabilities: Readonly<Record<string, `CAP-${string}`>> = {
  ".uno:AddDirect": "CAP-0114",
  ".uno:Bold": "CAP-0109",
  ".uno:CharFontName": "CAP-0109",
  ".uno:FontHeight": "CAP-0109",
  ".uno:CenterPara": "CAP-0112",
  ".uno:Copy": "CAP-0106",
  ".uno:Cut": "CAP-0110",
  ".uno:DecrementLevel": "CAP-0107",
  ".uno:DecrementIndent": "CAP-0107",
  ".uno:DefaultBullet": "CAP-0105",
  ".uno:DefaultNumbering": "CAP-0105",
  ".uno:EditHyperlink": "CAP-0135",
  ".uno:EndPara": "CAP-0112",
  ".uno:ExportTo": "CAP-0101",
  ".uno:HyperlinkDialog": "CAP-0135",
  ".uno:IncrementLevel": "CAP-0107",
  ".uno:IncrementIndent": "CAP-0107",
  ".uno:Italic": "CAP-0109",
  ".uno:JustifyPara": "CAP-0112",
  ".uno:Open": "CAP-0113",
  ".uno:PageDialog": "CAP-0136",
  ".uno:Paste": "CAP-0110",
  ".uno:Redo": "CAP-0102",
  ".uno:RemoveBullets": "CAP-0105",
  ".uno:RemoveHyperlink": "CAP-0135",
  ".uno:Ruler": "CAP-0104",
  ".uno:VRuler": "CAP-0104",
  ".uno:SaveAs": "CAP-0113",
  ".uno:SelectAll": "CAP-0103",
  ".uno:Sidebar": "CAP-0104",
  ".uno:StartPara": "CAP-0112",
  ".uno:StatusBarVisible": "CAP-0104",
  ".uno:Underline": "CAP-0109",
  ".uno:Undo": "CAP-0102",
  "vnd.vite-office.browser:OpenLocal": "CAP-0114",
  "vnd.vite-office.browser:SaveLocal": "CAP-0114",
  ".uno:StyleApply?Style:string=Default%20Paragraph%20Style&FamilyName:string=ParagraphStyles":
    "CAP-0112",
  ".uno:StyleApply?Style:string=Heading%201&FamilyName:string=ParagraphStyles": "CAP-0112",
};

const inventoryAliasNames = [
  "alignCenter",
  "alignJustify",
  "alignLeft",
  "alignRight",
  "bold",
  "copy",
  "cut",
  "defaultParagraphStyle",
  "decreaseIndent",
  "demote",
  "exportText",
  "editHyperlink",
  "headingOne",
  "italic",
  "increaseIndent",
  "hyperlinkDialog",
  "newDocument",
  "openLocal",
  "openOdt",
  "pageDialog",
  "orderedList",
  "paste",
  "promote",
  "redo",
  "removeHyperlink",
  "removeBullets",
  "saveLocal",
  "saveOdt",
  "selectAll",
  "toggleHorizontalRuler",
  "toggleVerticalRuler",
  "toggleSidebar",
  "toggleStatusBar",
  "underline",
  "undo",
  "unorderedList",
] as const;

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
const upstreamIconFiles = new Set(await readdir(`${upstreamRoot}/icon-themes/sifr_dark_svg/cmd`));

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
      const iconName = `lc_${spec.commandUrl.replace(/^\.uno:/, "").toLowerCase()}.svg`;
      return [
        spec.commandUrl,
        {
          browserOwned: spec.browserLabel !== undefined,
          argumentSchema: spec.browserArguments ?? findArgumentSchema(sourceUrl, sdiTexts),
          capabilityId: commandCapabilities[spec.commandUrl],
          controlLabel: spec.browserControlLabel ?? stripMnemonic(label),
          label: stripMnemonic(label),
          ...(upstreamIconFiles.has(iconName) ? { iconName } : {}),
          placements:
            spec.browserLabel === undefined ? placements : ["browser-extension:file-menu"],
          semantics: spec.semantics ?? "action",
          showsDialog: spec.showsDialog ?? false,
          shortcuts,
          slotId:
            spec.browserSlotId ??
            resolveMacro(findSlotSymbol(spec.commandUrl, sdiTexts), macros, new Set()),
        },
      ];
    },
  ),
);

const sourceToCommand = new Map(
  specs.map(
    /** Maps one upstream source URL to the public command URL. @param spec - Command specification. @returns Source and public URL pair. */ (
      spec,
    ) => [spec.sourceUrl ?? spec.commandUrl, spec.commandUrl] as const,
  ),
);
const resourceGraphs = Object.fromEntries(
  resourcePaths.map(
    /** Builds one source graph. @param path - Upstream resource path. @param index - Resource-text index. @returns Path and graph pair. */ (
      path,
      index,
    ) => [
      path,
      buildResourceGraph(
        resourceTexts[index] ?? "",
        sourceToCommand,
        /** Resolves a menu label. @param sourceUrl - Menu URL. @returns Pinned label. */ (
          sourceUrl,
        ) => stripMnemonic(findEnglishLabel(sourceUrl, genericCommands, writerCommands)),
      ),
    ],
  ),
);

const menuPath = resourcePaths[0];
const menuGraph = resourceGraphs[menuPath];
if (menuGraph === undefined) throw new Error("Generated Writer menubar graph is missing.");
const augmentedMenu = addBrowserMenuExtensions(menuGraph.nodes);
const surfaces = {
  menubar: augmentedMenu,
  numobjectbar: resourceGraphs[resourcePaths[3]]?.nodes ?? [],
  popupText: resourceGraphs[resourcePaths[4]]?.nodes ?? [],
  standardbar: resourceGraphs[resourcePaths[1]]?.nodes ?? [],
  textobjectbar: resourceGraphs[resourcePaths[2]]?.nodes ?? [],
};
const visibleCommandUrls = [
  ...new Set(
    Object.values(surfaces).flatMap(
      /** Collects commands for one surface. @param nodes - Surface graph. @returns Command URLs. */ (
        nodes,
      ) => collectResourceCommands(nodes),
    ),
  ),
];
validateGeneratedClosure(commands, visibleCommandUrls);
const unsupported = Object.fromEntries(
  resourcePaths.map(
    /** Projects exclusions for one source. @param path - Resource path. @returns Path and exclusions. */ (
      path,
    ) => [path, resourceGraphs[path]?.exclusions ?? []],
  ),
);
const dispositions = [
  ...Object.entries(commands).map(
    /** Records one supported or browser-owned command disposition. @param entry - Command URL and metadata. @returns Reviewable disposition. */ ([
      commandUrl,
      command,
    ]) => ({
      classification: command.browserOwned ? "browser-extension" : "supported-upstream",
      commandUrl,
      sources: command.placements,
    }),
  ),
  ...Object.entries(unsupported).flatMap(
    /** Flattens one resource's explicit X records. @param entry - Resource path and exclusions. @returns Reviewable dispositions. */ ([
      sourcePath,
      exclusions,
    ]) =>
      exclusions.map(
        /** Adds the owning resource path to one exclusion. @param exclusion - Generated X record. @returns Reviewable disposition. */ (
          exclusion,
        ) => ({
          ...exclusion,
          reason: "outside-p1-supported-command-slice",
          sourcePath,
        }),
      ),
  ),
];
const generated = await format(
  JSON.stringify({
    baselineCommit: "9bc445578031fecf56086729d8e4940c77e14d65",
    commandAliases,
    commandInventory: inventoryAliasNames.map(
      /** Projects one public inventory alias. @param alias - Stable alias. @returns Capability mapping. */ (
        alias,
      ) => ({
        capabilityId: commandCapabilities[commandAliases[alias]],
        commandUrl: commandAliases[alias],
      }),
    ),
    commands,
    dispositions,
    locale: "en-US",
    schemaVersion: 3,
    surfaces,
    unsupported,
  }),
  { parser: "json", printWidth: 100 },
);

const runtimeResourcePaths = [
  "apps/office/src/sw/uiconfig/swriter/menubar/menubar-commands.ts",
  "apps/office/src/sw/uiconfig/swriter/toolbar/standardbar.ts",
  "apps/office/src/sw/uiconfig/swriter/toolbar/textobjectbar.ts",
  "apps/office/src/sw/uiconfig/swriter/toolbar/numobjectbar.ts",
  "apps/office/src/sw/uiconfig/swriter/writer-command-resources.ts",
] as const;
for (const [index, text] of (
  await Promise.all(
    runtimeResourcePaths.map(
      /** Reads one runtime adapter. @param path - Adapter path. @returns Source text. */ (path) =>
        readFile(path, "utf8"),
    ),
  )
).entries()) {
  if (/['"]\.uno:/.test(text))
    throw new Error(
      `Handwritten Writer command URL is forbidden in generated resource adapter: ${runtimeResourcePaths[index]}`,
    );
}

if (process.argv.includes("--check")) {
  assertGeneratedResourceFresh(await readFile(outputPath, "utf8"), generated);
} else await writeFile(outputPath, generated);

/** Adds explicitly browser-owned commands and the bounded style collection without changing upstream command identity. @param nodes - Generated upstream menu nodes. @returns Extended menu nodes. */
function addBrowserMenuExtensions(nodes: readonly ResourceNode[]): readonly ResourceNode[] {
  /** Applies browser extensions recursively while retaining generated order. @param node - Generated node. @returns Extended node. */
  function extend(node: ResourceNode): ResourceNode {
    if (node.kind !== "menu") return node;
    let items: readonly ResourceNode[] = node.items.map(extend);
    if (node.id === ".uno:PickList") {
      items = insertAfter(items, ".uno:Open", {
        commandUrl: commandAliases.openLocal,
        kind: "command",
        visible: true,
      });
      items = insertAfter(items, ".uno:SaveAs", {
        commandUrl: commandAliases.saveLocal,
        kind: "command",
        visible: true,
      });
    }
    if (node.id === ".uno:FormatStylesMenu")
      items = [
        { commandUrl: ".uno:StyleApply", kind: "command", visible: true },
        { kind: "separator" },
        ...items,
      ];
    return { ...node, items };
  }
  return nodes.map(extend);
}

/** Inserts a browser resource after a supported upstream anchor. @param nodes - Sibling nodes. @param anchor - Upstream command URL. @param inserted - Browser resource. @returns Extended siblings. */
function insertAfter(
  nodes: readonly ResourceNode[],
  anchor: string,
  inserted: ResourceNode,
): readonly ResourceNode[] {
  const index = nodes.findIndex(
    /** Finds the upstream anchor. @param node - Candidate node. @returns Whether it matches. */ (
      node,
    ) => node.kind === "command" && node.commandUrl === anchor,
  );
  if (index < 0) throw new Error(`Browser resource anchor is missing: ${anchor}`);
  return [...nodes.slice(0, index + 1), inserted, ...nodes.slice(index + 1)];
}

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

/** Reads the typed SDI argument declaration immediately following one command. @param commandUrl - Source UNO command. @param catalogs - Pinned SDI texts. @returns Ordered argument schema. */
function findArgumentSchema(commandUrl: string, catalogs: readonly string[]): readonly string[] {
  const commandName = commandUrl.slice(".uno:".length).split("?", 1)[0] as string;
  for (const catalog of catalogs) {
    const match = catalog.match(
      new RegExp(
        `^\\S+\\s+${escapeRegExp(commandName)}\\s+[A-Z][A-Z0-9_]+\\s*\\n(?:\\(([^\\n]*)\\))?`,
        "m",
      ),
    );
    if (match === null) continue;
    const declaration = match[1];
    if (declaration === undefined || declaration.trim().length === 0) return [];
    return declaration.split(",").map(
      /** Projects one typed SDI parameter. @param parameter - Type/name/slot declaration. @returns Type/name schema. */ (
        parameter,
      ) => {
        const fields = parameter.trim().split(/\s+/u);
        return `${fields[1] as string}:${fields[0] as string}`;
      },
    );
  }
  return [];
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
