/** @fileoverview Pure parsing and validation helpers for generated Writer UI resources. */

/** Generated executable command placement. */
export interface ResourceCommandNode {
  readonly commandUrl: string;
  readonly kind: "command";
  readonly visible: boolean;
}

/** Generated labelled menu with ordered child resources. */
export interface ResourceMenuNode {
  readonly id: string;
  readonly items: readonly ResourceNode[];
  readonly kind: "menu";
  readonly label: string;
}

/** Generated separator retained between supported groups. */
export interface ResourceSeparatorNode {
  readonly kind: "separator";
}

/** Every node supported by the generated Writer resource graph. */
export type ResourceNode = ResourceCommandNode | ResourceMenuNode | ResourceSeparatorNode;

/** Auditable upstream entry filtered from the bounded browser slice. */
export interface FilteredResourceEntry {
  readonly classification: "X";
  readonly context: readonly string[];
  readonly entryKind: "command" | "menu";
  readonly sourceUrl: string;
}

/** Minimal parsed XML element used only during deterministic generation. */
interface XmlNode {
  readonly attributes: Readonly<Record<string, string>>;
  readonly children: XmlNode[];
  readonly name: string;
}

/** Parses the small element/attribute subset used by LibreOffice menu and toolbar resources. @param xml - Pinned resource text. @returns Parsed root element. */
export function parseResourceXml(xml: string): XmlNode {
  const root: XmlNode = { attributes: {}, children: [], name: "root" };
  const stack = [root];
  for (const match of xml.matchAll(/<\s*(\/?)\s*([\w:.-]+)([^>]*?)(\/?)\s*>/g)) {
    const [, closing, name, rawAttributes, selfClosing] = match;
    if (name === undefined || name.startsWith("?") || name.startsWith("!")) continue;
    if (closing === "/") {
      if (stack.length === 1 || stack.at(-1)?.name !== name)
        throw new Error(`Malformed Writer UI resource: unexpected closing ${name}`);
      stack.pop();
      continue;
    }
    const attributes: Record<string, string> = {};
    for (const attribute of (rawAttributes ?? "").matchAll(/([\w:.-]+)="([^"]*)"/g)) {
      const key = attribute[1];
      const value = attribute[2];
      if (key !== undefined && value !== undefined) attributes[key] = value;
    }
    const node: XmlNode = { attributes, children: [], name };
    stack.at(-1)?.children.push(node);
    if (selfClosing !== "/") stack.push(node);
  }
  if (stack.length !== 1)
    throw new Error(`Malformed Writer UI resource: unclosed ${stack.at(-1)?.name}`);
  return root.children[0] ?? root;
}

/** Removes leading, trailing, and repeated separators after unsupported entries are filtered. @param nodes - Filtered nodes. @returns Normalized nodes. */
export function normalizeSeparators(nodes: readonly ResourceNode[]): readonly ResourceNode[] {
  const normalized: ResourceNode[] = [];
  for (const node of nodes) {
    if (node.kind === "separator") {
      if (normalized.length === 0 || normalized.at(-1)?.kind === "separator") continue;
    }
    normalized.push(node);
  }
  if (normalized.at(-1)?.kind === "separator") normalized.pop();
  return normalized;
}

/** Builds a supported, ordered resource graph and structured X records from one upstream XML file. @param xml - Resource XML. @param sourceToCommand - Supported source URL mapping. @param labelFor - Localized label resolver. @returns Generated graph and exclusions. */
export function buildResourceGraph(
  xml: string,
  sourceToCommand: ReadonlyMap<string, string>,
  labelFor: (sourceUrl: string) => string,
): Readonly<{ exclusions: readonly FilteredResourceEntry[]; nodes: readonly ResourceNode[] }> {
  const exclusions: FilteredResourceEntry[] = [];
  const root = parseResourceXml(xml);

  /** Projects one parsed node or records its explicit exclusion. @param node - Parsed node. @param context - Ancestor resource URLs. @returns Projected node when supported. */
  function visit(node: XmlNode, context: readonly string[]): ResourceNode | undefined {
    if (node.name.endsWith("separator")) return { kind: "separator" };
    const sourceUrl = node.attributes["menu:id"] ?? node.attributes["xlink:href"];
    if (node.name.endsWith("menuitem") || node.name.endsWith("toolbaritem")) {
      if (sourceUrl === undefined) return undefined;
      const commandUrl = sourceToCommand.get(sourceUrl);
      if (commandUrl !== undefined)
        return {
          commandUrl,
          kind: "command",
          visible: node.attributes["toolbar:visible"] !== "false",
        };
      exclusions.push({ classification: "X", context, entryKind: "command", sourceUrl });
      return undefined;
    }
    if (node.name.endsWith("menu") && sourceUrl !== undefined) {
      const items = normalizeSeparators(
        node.children.flatMap(
          /** Projects one menu child. @param child - Parsed child. @returns Supported projections. */ (
            child,
          ) => {
            if (child.name.endsWith("menupopup"))
              return child.children.flatMap(
                /** Projects one popup child. @param grandchild - Parsed popup entry. @returns Supported projections. */ (
                  grandchild,
                ) => {
                  const result = visit(grandchild, [...context, sourceUrl]);
                  return result === undefined ? [] : [result];
                },
              );
            const result = visit(child, [...context, sourceUrl]);
            return result === undefined ? [] : [result];
          },
        ),
      );
      if (items.length > 0)
        return { id: sourceUrl, items, kind: "menu", label: labelFor(sourceUrl) };
      exclusions.push({ classification: "X", context, entryKind: "menu", sourceUrl });
      return undefined;
    }
    const children = normalizeSeparators(
      node.children.flatMap(
        /** Projects a transparent container child. @param child - Parsed child. @returns Supported projections. */ (
          child,
        ) => {
          const result = visit(child, context);
          return result === undefined ? [] : [result];
        },
      ),
    );
    return children.length === 1
      ? children[0]
      : { id: "root", items: children, kind: "menu", label: "" };
  }

  const projected = visit(root, []);
  const nodes =
    projected?.kind === "menu" && projected.id === "root"
      ? projected.items
      : projected === undefined
        ? []
        : [projected];
  return { exclusions, nodes };
}

/** Rejects incomplete command catalogs before generated output is accepted. @param commands - Generated metadata. @param visibleCommandUrls - Commands referenced by visible surfaces. @returns Nothing. */
export function validateGeneratedClosure(
  commands: Readonly<
    Record<
      string,
      Readonly<{
        label?: string;
        placements?: readonly string[];
        shortcuts?: readonly string[];
        slotId?: number;
      }>
    >
  >,
  visibleCommandUrls: readonly string[],
): void {
  for (const commandUrl of visibleCommandUrls) {
    const command = commands[commandUrl];
    if (command === undefined)
      throw new Error(`Displayed command is missing from generated resources: ${commandUrl}`);
    if (command.label === undefined || command.label.trim() === "")
      throw new Error(`Generated command label is missing: ${commandUrl}`);
    if (command.slotId === undefined)
      throw new Error(`Generated command slot is missing: ${commandUrl}`);
    if (command.placements === undefined || command.placements.length === 0)
      throw new Error(`Generated command placement is missing: ${commandUrl}`);
    if (command.shortcuts === undefined)
      throw new Error(`Generated command shortcuts are missing: ${commandUrl}`);
  }
}

/** Rejects a stale committed generated artifact. @param actual - Committed text. @param expected - Regenerated text. @returns Nothing. */
export function assertGeneratedResourceFresh(actual: string, expected: string): void {
  if (actual !== expected)
    throw new Error(
      "Generated Writer UI resources are stale; run npm run generate:writer-resources.",
    );
}

/** Ensures every registered public command resolves to generated metadata. @param generatedCommandUrls - Manifest URLs. @param registeredCommandUrls - Runtime URLs. @returns Nothing. */
export function validateRegisteredCommandClosure(
  generatedCommandUrls: readonly string[],
  registeredCommandUrls: readonly string[],
): void {
  const generated = new Set(generatedCommandUrls);
  for (const commandUrl of registeredCommandUrls) {
    const baseUrl = commandUrl.startsWith(".uno:StyleApply?") ? ".uno:StyleApply" : commandUrl;
    if (!generated.has(baseUrl))
      throw new Error(`Registered command is missing from the generated manifest: ${commandUrl}`);
  }
}

/** Collects command URLs recursively from a generated resource graph. @param nodes - Generated nodes. @returns Ordered command URLs. */
export function collectResourceCommands(nodes: readonly ResourceNode[]): readonly string[] {
  return nodes.flatMap(
    /** Collects one node. @param node - Generated node. @returns Nested command URLs. */ (
      node,
    ): readonly string[] =>
      node.kind === "command"
        ? [node.commandUrl]
        : node.kind === "menu"
          ? collectResourceCommands(node.items)
          : [],
  );
}
