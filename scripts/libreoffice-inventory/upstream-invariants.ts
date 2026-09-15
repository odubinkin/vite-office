/**
 * @fileoverview Generates and validates the exact pinned LibreOffice invariants consumed by the bounded Writer slice.
 */

/** Classifies one invariant by the contract surface that consumes it. */
export type UpstreamInvariantKind = "command-url" | "default" | "enum" | "pool-range" | "which-id";

/** Records one exact local/upstream marker pair and its parity disposition. */
export interface UpstreamInvariant {
  readonly divergenceClass: "none" | "P";
  readonly id: string;
  readonly kind: UpstreamInvariantKind;
  readonly local: Readonly<{ marker: string; path: string; value: number | string }>;
  readonly upstream: Readonly<{ marker: string; path: string; value: number | string }>;
}

/** Defines the checked-in deterministic invariant manifest. */
export interface UpstreamInvariantManifest {
  readonly baselineCommit: string;
  readonly baselineTag: string;
  readonly entries: readonly UpstreamInvariant[];
  readonly schemaVersion: 1;
}

/** Reads UTF-8 evidence by repository-relative path. */
export type InvariantEvidenceReader = (path: string) => Promise<string>;

const baselineCommit = "9bc445578031fecf56086729d8e4940c77e14d65";
const baselineTag = "libreoffice-26.8.0.2";
const hintidsLocal = "apps/office/src/sw/inc/hintids.ts";
const hintidsUpstream = "sw/inc/hintids.hxx";

/** Creates one exact invariant catalog entry. @param invariant - Complete invariant definition. @returns Frozen-shape catalog entry. */
function entry(invariant: UpstreamInvariant): UpstreamInvariant {
  return invariant;
}

const whichIdCatalog: readonly (readonly [string, number, string, string])[] = [
  [
    "RES_CHRATR_BEGIN",
    1,
    "export const RES_CHRATR_BEGIN = 1 as const;",
    "inline constexpr sal_uInt16 RES_CHRATR_BEGIN(HINT_BEGIN);",
  ],
  [
    "RES_CHRATR_FONT",
    7,
    "export const RES_CHRATR_FONT = 7 as const;",
    "RES_CHRATR_FONT(RES_CHRATR_BEGIN + 6)",
  ],
  [
    "RES_CHRATR_POSTURE",
    11,
    "export const RES_CHRATR_POSTURE = 11 as const;",
    "RES_CHRATR_POSTURE(RES_CHRATR_BEGIN + 10)",
  ],
  [
    "RES_CHRATR_UNDERLINE",
    14,
    "export const RES_CHRATR_UNDERLINE = 14 as const;",
    "RES_CHRATR_UNDERLINE(RES_CHRATR_BEGIN + 13)",
  ],
  [
    "RES_CHRATR_WEIGHT",
    15,
    "export const RES_CHRATR_WEIGHT = 15 as const;",
    "RES_CHRATR_WEIGHT(RES_CHRATR_BEGIN + 14)",
  ],
  [
    "RES_CHRATR_CJK_FONT",
    22,
    "export const RES_CHRATR_CJK_FONT = 22 as const;",
    "RES_CHRATR_CJK_FONT(RES_CHRATR_BEGIN + 21)",
  ],
  [
    "RES_CHRATR_CJK_POSTURE",
    25,
    "export const RES_CHRATR_CJK_POSTURE = 25 as const;",
    "RES_CHRATR_CJK_POSTURE(RES_CHRATR_BEGIN + 24)",
  ],
  [
    "RES_CHRATR_CJK_WEIGHT",
    26,
    "export const RES_CHRATR_CJK_WEIGHT = 26 as const;",
    "RES_CHRATR_CJK_WEIGHT(RES_CHRATR_BEGIN + 25)",
  ],
  [
    "RES_CHRATR_CTL_FONT",
    27,
    "export const RES_CHRATR_CTL_FONT = 27 as const;",
    "RES_CHRATR_CTL_FONT(RES_CHRATR_BEGIN + 26)",
  ],
  [
    "RES_CHRATR_CTL_POSTURE",
    30,
    "export const RES_CHRATR_CTL_POSTURE = 30 as const;",
    "RES_CHRATR_CTL_POSTURE(RES_CHRATR_BEGIN + 29)",
  ],
  [
    "RES_CHRATR_CTL_WEIGHT",
    31,
    "export const RES_CHRATR_CTL_WEIGHT = 31 as const;",
    "RES_CHRATR_CTL_WEIGHT(RES_CHRATR_BEGIN + 30)",
  ],
  [
    "RES_CHRATR_END",
    49,
    "export const RES_CHRATR_END = 49 as const;",
    "RES_CHRATR_END(RES_CHRATR_BEGIN + 48)",
  ],
  [
    "RES_TXTATR_AUTOFMT",
    53,
    "export const RES_TXTATR_AUTOFMT = 53 as const;",
    "RES_TXTATR_AUTOFMT(RES_TXTATR_WITHEND_BEGIN + 4)",
  ],
  [
    "RES_TXTATR_INETFMT",
    54,
    "export const RES_TXTATR_INETFMT = 54 as const;",
    "RES_TXTATR_INETFMT(RES_TXTATR_WITHEND_BEGIN + 5)",
  ],
  [
    "RES_PARATR_ADJUST",
    65,
    "export const RES_PARATR_ADJUST = 65 as const;",
    "RES_PARATR_ADJUST(RES_PARATR_BEGIN + 1)",
  ],
  [
    "RES_PARATR_NUMRULE",
    73,
    "export const RES_PARATR_NUMRULE = 73 as const;",
    "RES_PARATR_NUMRULE(RES_PARATR_BEGIN + 9)",
  ],
  [
    "RES_PARATR_LIST_ID",
    83,
    "export const RES_PARATR_LIST_ID = 83 as const;",
    "RES_PARATR_LIST_ID(RES_PARATR_LIST_BEGIN + 0)",
  ],
  [
    "RES_PARATR_LIST_LEVEL",
    84,
    "export const RES_PARATR_LIST_LEVEL = 84 as const;",
    "RES_PARATR_LIST_LEVEL(RES_PARATR_LIST_BEGIN + 1)",
  ],
];

const whichIds: readonly UpstreamInvariant[] = whichIdCatalog.map(
  /** Converts a compact WhichId tuple to an invariant. @param tuple - Symbol, value, and exact markers. @returns WhichId invariant. */
  ([id, value, localMarker, upstreamMarker]) =>
    entry({
      divergenceClass: "none",
      id: `writer.which-id.${id}`,
      kind: id.endsWith("BEGIN") || id.endsWith("END") ? "pool-range" : "which-id",
      local: { marker: String(localMarker), path: hintidsLocal, value: Number(value) },
      upstream: { marker: String(upstreamMarker), path: hintidsUpstream, value: Number(value) },
    }),
);

const enumEntries: readonly UpstreamInvariant[] = [
  [
    "FontWeight",
    "DONTKNOW,THIN,ULTRALIGHT,LIGHT,SEMILIGHT,NORMAL,MEDIUM,SEMIBOLD,BOLD,ULTRABOLD,BLACK",
    "export enum FontWeight {",
    "enum FontWeight { WEIGHT_DONTKNOW, WEIGHT_THIN, WEIGHT_ULTRALIGHT,",
  ],
  [
    "FontItalic",
    "NONE,OBLIQUE,NORMAL,DONTKNOW",
    "export enum FontItalic {",
    "enum FontItalic { ITALIC_NONE, ITALIC_OBLIQUE, ITALIC_NORMAL, ITALIC_DONTKNOW",
  ],
  [
    "FontLineStyle",
    "NONE,SINGLE,DOUBLE,DOTTED,DONTKNOW,DASH,LONGDASH,DASHDOT,DASHDOTDOT,SMALLWAVE,WAVE,DOUBLEWAVE,BOLD,BOLDDOTTED,BOLDDASH,BOLDLONGDASH,BOLDDASHDOT,BOLDDASHDOTDOT,BOLDWAVE",
    "export enum FontLineStyle {",
    "enum FontLineStyle { LINESTYLE_NONE, LINESTYLE_SINGLE, LINESTYLE_DOUBLE,",
  ],
].map(
  /** Converts an EditEngine enum tuple to an invariant. @param tuple - Enum name, ordered values, and markers. @returns Enum invariant. */
  ([id, value, localMarker, upstreamMarker]) =>
    entry({
      divergenceClass: "none",
      id: `editeng.enum.${id}`,
      kind: "enum",
      local: {
        marker: String(localMarker),
        path: "apps/office/src/editeng/source/items/textitem.ts",
        value: String(value),
      },
      upstream: {
        marker: String(upstreamMarker),
        path: "include/tools/fontenum.hxx",
        value: String(value),
      },
    }),
);

const commandUrls: readonly UpstreamInvariant[] = [
  ["bold", "writer.format.bold", ".uno:Bold"],
  ["copy", "writer.edit.copy", ".uno:Copy"],
  ["cut", "writer.edit.cut", ".uno:Cut"],
  ["italic", "writer.format.italic", ".uno:Italic"],
  ["orderedList", "writer.list.default-numbering", ".uno:DefaultNumbering"],
  ["paste", "writer.edit.paste", ".uno:Paste"],
  ["redo", "writer.redo", ".uno:Redo"],
  ["selectAll", "writer.edit.select-all", ".uno:SelectAll"],
  [
    "underline",
    "writer.format.underline",
    ".uno:Underline",
    "sw/uiconfig/swriter/toolbar/textobjectbar.xml",
  ],
  ["undo", "writer.undo", ".uno:Undo"],
  ["unorderedList", "writer.list.default-bullet", ".uno:DefaultBullet"],
].map(
  /** Converts one known divergent command identity to an invariant. @param tuple - Local key/value and upstream URL. @returns Command invariant. */
  ([id, localValue, upstreamValue, upstreamPath]) =>
    entry({
      divergenceClass: "P",
      id: `writer.command-url.${id}`,
      kind: "command-url",
      local: {
        marker: `${id}: "${localValue}"`,
        path: "apps/office/src/sw/uiconfig/swriter/menubar/menubar-commands.ts",
        value: String(localValue),
      },
      upstream: {
        marker:
          upstreamPath === undefined
            ? `menu:id="${upstreamValue}"`
            : `xlink:href="${upstreamValue}"`,
        path: upstreamPath ?? "sw/uiconfig/swriter/menubar/menubar.xml",
        value: String(upstreamValue),
      },
    }),
);

const defaults: readonly UpstreamInvariant[] = [
  entry({
    divergenceClass: "none",
    id: "svl.default.max-undo-action-count",
    kind: "default",
    local: {
      marker: "DEFAULT_MAX_UNDO_ACTION_COUNT = 20",
      path: "apps/office/src/svl/source/undo/undo.ts",
      value: 20,
    },
    upstream: {
      marker: "SfxUndoManager( size_t nMaxUndoActionCount = 20 )",
      path: "include/svl/undo.hxx",
      value: 20,
    },
  }),
  entry({
    divergenceClass: "none",
    id: "writer.default.max-list-level",
    kind: "default",
    local: {
      marker: "WRITER_MAX_LIST_LEVEL = 9",
      path: "apps/office/src/sw/source/core/doc/list.ts",
      value: 9,
    },
    upstream: {
      marker: "constexpr sal_uInt8 MAXLEVEL = 10;",
      path: "sw/inc/swtypes.hxx",
      value: 9,
    },
  }),
];

/** Creates the canonical manifest in stable identifier order. @returns Complete invariant manifest. */
export function createUpstreamInvariantManifest(): UpstreamInvariantManifest {
  return {
    baselineCommit,
    baselineTag,
    entries: [...whichIds, ...enumEntries, ...defaults, ...commandUrls].sort(
      /** Orders manifest entries by stable identifier. @param left - First entry. @param right - Second entry. @returns Lexical comparison. */ (
        left,
        right,
      ) => left.id.localeCompare(right.id),
    ),
    schemaVersion: 1,
  };
}

/** Serializes one manifest canonically. @param manifest - Manifest to serialize. @returns Pretty JSON with one trailing newline. */
export function serializeUpstreamInvariantManifest(manifest: UpstreamInvariantManifest): string {
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

/** Validates exact evidence markers against both checkouts. @param manifest - Manifest to validate. @param readLocal - Local evidence reader. @param readUpstream - Pinned upstream evidence reader. @returns Completion after all markers resolve. */
export async function validateUpstreamInvariantEvidence(
  manifest: UpstreamInvariantManifest,
  readLocal: InvariantEvidenceReader,
  readUpstream: InvariantEvidenceReader,
): Promise<void> {
  if (manifest.schemaVersion !== 1)
    throw new Error("Upstream invariant schemaVersion must equal 1.");
  if (manifest.baselineCommit !== baselineCommit || manifest.baselineTag !== baselineTag)
    throw new Error("Upstream invariant baseline does not match the pinned release.");
  const identifiers = new Set<string>();
  for (const invariant of manifest.entries) {
    if (identifiers.has(invariant.id))
      throw new Error(`Duplicate upstream invariant: ${invariant.id}`);
    identifiers.add(invariant.id);
    const local = await readLocal(invariant.local.path);
    if (!local.includes(invariant.local.marker))
      throw new Error(`Local invariant drift: ${invariant.id}`);
    const upstream = await readUpstream(invariant.upstream.path);
    if (!upstream.includes(invariant.upstream.marker))
      throw new Error(`Pinned upstream invariant drift: ${invariant.id}`);
    if (invariant.divergenceClass === "none" && invariant.local.value !== invariant.upstream.value)
      throw new Error(`Undeclared invariant divergence: ${invariant.id}`);
  }
}
