/** @fileoverview Deterministic Calc resource projection from pinned native XML and command/accelerator catalogs. */
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { format } from "prettier";
import {
  buildResourceGraph,
  parseResourceXml,
  collectResourceCommands,
  type ResourceNode,
} from "./office-ui-resource-model";
import {
  findEnglishLabel,
  findEnglishLabelProperty,
  findShortcuts,
  stripMnemonic,
  findCommandPropertyBits,
} from "./office-ui-command-catalog";
const root = "vendor/libreoffice-reference/",
  output = "apps/office/src/sc/uiconfig/scalc/calc-ui.generated.json";
const surfaces = {
  sheettab: "sc/uiconfig/scalc/popupmenu/sheettab.xml",
  menubar: "sc/uiconfig/scalc/menubar/menubar.xml",
  standardbar: "sc/uiconfig/scalc/toolbar/standardbar.xml",
  formatobjectbar: "sc/uiconfig/scalc/toolbar/formatobjectbar.xml",
  textobjectbar: "sc/uiconfig/scalc/toolbar/textobjectbar.xml",
} as const;
const printRangesPopup = "sc/uiconfig/scalc/popupmenu/printranges.xml";
const conditionalPopup = "sc/uiconfig/scalc/popupmenu/conditional.xml";
const conditionalRulesPopup = "sc/uiconfig/scalc/popupmenu/conditional_easy.xml";
const catalogPaths = [
  "officecfg/registry/data/org/openoffice/Office/UI/CalcCommands.xcu",
  "officecfg/registry/data/org/openoffice/Office/UI/GenericCommands.xcu",
  "officecfg/registry/data/org/openoffice/Office/Accelerators.xcu",
] as const;
const paths = [
  ...Object.values(surfaces),
  printRangesPopup,
  conditionalPopup,
  conditionalRulesPopup,
  ...catalogPaths,
  "officecfg/registry/schema/org/openoffice/Office/UI/Commands.xcs",
];
const texts = Object.fromEntries(
  await Promise.all(
    paths.map(
      /** Reads one pinned source. @param path - Relative source. @returns Source pair. */ async (
        path,
      ) => [path, await readFile(root + path, "utf8")],
    ),
  ),
);
const catalogs = catalogPaths
  .slice(0, 2)
  .map(
    /** Reads source catalogs in native module-first order. @param path - Source. @returns Catalog. */ (
      path,
    ) => texts[path] as string,
  );
/** Shared Writer primary-save deviations;native unsupported feature entries remain present but disabled. */
const excluded = new Map<string, string>([
  [".uno:AddDirect", "browser-primary-document-lifecycle"],
  [".uno:CloseDoc", "browser-primary-document-lifecycle"],
  [".uno:Save", "browser-primary-autosave"],
  [".uno:SaveAll", "browser-primary-autosave"],
  [".uno:RecentFileList", "browser-primary-open-dialog"],
  [".uno:OpenRemote", "browser-primary-open-dialog"],
  [".uno:SaveAsRemote", "browser-primary-copy-dialog"],
  [".uno:SaveACopy", "browser-primary-copy-dialog"],
  [".uno:Reload", "no-recovery-or-reload"],
  [".uno:VersionDialog", "no-recovery-or-reload"],
  [".uno:Quit", "browser-owned-application-lifecycle"],
]);
// Original key-only cell-shell command:catalog metadata is required without adding a visible surface placement.
const urls = new Set<string>([".uno:Deselect"]);
for (const path of [
  ...Object.values(surfaces),
  printRangesPopup,
  conditionalPopup,
  conditionalRulesPopup,
]) {
  /** Collects original leaf identities without guessing labels or slot implementations. @param node - Parsed source. @returns Nothing. */
  function collect(node: ReturnType<typeof parseResourceXml>): void {
    if (node.name.endsWith("menuitem") || node.name.endsWith("toolbaritem")) {
      const url = node.attributes["menu:id"] ?? node.attributes["xlink:href"];
      if (url !== undefined) urls.add(url);
    }
    node.children.forEach(collect);
  }
  collect(parseResourceXml(texts[path] as string));
}
const sourceToCommand = new Map(
  [...urls]
    .filter(
      /** Applies explicit shared browser policy only. @param url - Source. @returns Retained. */ (
        url,
      ) => !excluded.has(url),
    )
    .map(
      /** Preserves original source identity. @param url - Command. @returns Mapping. */ (url) => [
        url,
        url,
      ],
    ),
);
const commands = Object.fromEntries(
  [...urls]
    .filter(
      /** Keeps policy-compatible entries. @param url - Command. @returns Retained. */ (url) =>
        sourceToCommand.has(url),
    )
    .sort()
    .map(
      /** Projects exact source English labels and shared default accelerator notation. @param url - Original command. @returns Resource pair. */ (
        url,
      ) => {
        const label = findEnglishLabel(url, ...catalogs),
          popupLabel = findEnglishLabelProperty(url, "PopupLabel", ...catalogs);
        return [
          url,
          {
            label: stripMnemonic(label),
            showsDialog: label.endsWith("..."),
            ...(popupLabel === undefined
              ? {}
              : {
                  popupLabel: stripMnemonic(popupLabel),
                  popupShowsDialog: popupLabel.endsWith("..."),
                }),
            shortcuts: findShortcuts(
              url,
              texts[catalogPaths[2]] as string,
              "com.sun.star.sheet.SpreadsheetDocument",
            ),
            semantics: (findCommandPropertyBits(url, ...catalogs) & 8) !== 0 ? "check" : "action",
          },
        ];
      },
    ),
);
const resolveMenuLabel =
  /** Resolves original menu labels. @param url - Source menu URL. @returns English label. */ (
    url: string,
  ): string => stripMnemonic(findEnglishLabel(url, ...catalogs));
const printRanges = buildResourceGraph(
  texts[printRangesPopup] as string,
  sourceToCommand,
  resolveMenuLabel,
);
/** Carries a popup's ContextLabel independently of the standard toolbar label. @param node - Menu resource item. @returns Menu placement. */
function withContextLabel(node: ResourceNode): ResourceNode {
  if (node.kind !== "command") return node;
  const title = findEnglishLabelProperty(node.commandUrl, "ContextLabel", ...catalogs);
  if (title === undefined) return node;
  const placement = { ...node, label: stripMnemonic(title), showsDialog: title.endsWith("...") };
  return placement;
}
const popupItems = new Map([
  [".uno:PrintRangesMenu", printRanges.nodes.map(withContextLabel)],
  [
    ".uno:ConditionalFormatMenu",
    buildResourceGraph(texts[conditionalPopup] as string, sourceToCommand, resolveMenuLabel).nodes,
  ],
  [
    ".uno:ConditionalFormatConditionMenu",
    buildResourceGraph(texts[conditionalRulesPopup] as string, sourceToCommand, resolveMenuLabel)
      .nodes,
  ],
]);
/** Resolves the source dynamic popup registrations within the Calc menus. @param node - Original graph node. @returns Projected node. */
function attachCalcPopups(node: ResourceNode): ResourceNode {
  if (node.kind === "menu") return { ...node, items: node.items.map(attachCalcPopups) };
  if (node.kind !== "command") return node;
  const items = popupItems.get(node.commandUrl);
  if (items)
    return {
      id: node.commandUrl,
      kind: "menu",
      label: resolveMenuLabel(node.commandUrl),
      items: items.map(attachCalcPopups),
    };
  return node.commandUrl === ".uno:PageFormatDialog" ? withContextLabel(node) : node;
}
const dispositions: unknown[] = [];
const projected = Object.fromEntries(
  Object.entries(surfaces).map(
    /** Projects each complete ordered surface,retaining native toolbar visibility flags. @param entry - Surface/source. @returns Surface graph. */ ([
      name,
      path,
    ]) => {
      const graph = buildResourceGraph(
        texts[path] as string,
        sourceToCommand,
        /** Resolves native menu labels. @param url - Original menu identity. @returns Label. */ (
          url,
        ) => stripMnemonic(findEnglishLabel(url, ...catalogs)),
      );
      dispositions.push(
        ...graph.exclusions.map(
          /** Records every removed native entry with its actual reason. @param item - Removed node. @returns Disposition. */ (
            item,
          ) => ({
            ...item,
            sourcePath: path,
            reason: excluded.get(item.sourceUrl) ?? "empty-policy-filtered-menu",
          }),
        ),
      );
      const nodes = name === "menubar" ? graph.nodes.map(attachCalcPopups) : graph.nodes;
      for (const url of collectResourceCommands(nodes))
        if (commands[url] === undefined) throw new Error(`Missing Calc command resource: ${url}`);
      return [name, nodes];
    },
  ),
);
const generated = await format(
  JSON.stringify({
    baselineCommit: "9bc445578031fecf56086729d8e4940c77e14d65",
    schemaVersion: 1,
    locale: "en-US",
    sources: paths.map(
      /** Retains source hashes for drift review. @param path - Source. @returns Hash. */ (
        path,
      ) => ({
        path,
        sha256: createHash("sha256")
          .update(texts[path] as string)
          .digest("hex"),
      }),
    ),
    commands,
    surfaces: projected,
    dispositions,
  }),
  { parser: "json", printWidth: 100 },
);
if (process.argv.includes("--check")) {
  if ((await readFile(output, "utf8")) !== generated)
    throw new Error("Generated Calc UI resources are stale;run npm run generate:calc-resources.");
} else await writeFile(output, generated);
console.log(
  `Calc resources: ${Object.keys(commands).length} commands;${(projected.menubar as readonly ResourceNode[]).length} top menus;${dispositions.length} policy dispositions.`,
);
