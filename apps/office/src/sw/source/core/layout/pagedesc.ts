/** @fileoverview Implements the bounded standard SwPageDesc geometry from pinned Writer docdesc.cxx. */

/** Supported physical paper identities exposed by the bounded Page tab. */
export type WriterPaperFormat = "A4" | "Letter" | "custom";

/** Immutable physical page geometry. All distances use Writer twips. */
export interface WriterPageDescriptorValue {
  readonly bottomMargin: number;
  readonly height: number;
  readonly landscape: boolean;
  readonly leftMargin: number;
  readonly name: "Standard";
  readonly paperFormat: WriterPaperFormat;
  readonly rightMargin: number;
  readonly topMargin: number;
  readonly width: number;
}

/** Common paper sizes used by LibreOffice's SvxPaperInfo boundary, in twips. */
export const WRITER_PAPER_SIZES = Object.freeze({
  A4: Object.freeze({ height: 16_838, width: 11_906 }),
  Letter: Object.freeze({ height: 15_840, width: 12_240 }),
});

const MIN_PAGE_CONTENT_TWIPS = 567;
const MAX_PAGE_TWIPS = 90_720;

/** Upstream-shaped standard page descriptor with value-copy semantics. */
export class SwPageDesc {
  private value: WriterPageDescriptorValue;

  /** Creates and validates one standard page descriptor. @param value - Physical page value. @returns Nothing. */
  public constructor(value: WriterPageDescriptorValue) {
    this.value = validateWriterPageDescriptor(value);
  }

  /** Returns an independent immutable page value. @returns Page value. */
  public GetValue(): WriterPageDescriptorValue {
    return Object.freeze({ ...this.value });
  }

  /** Replaces all supported page attributes atomically. @param value - New page value. @returns Nothing. */
  public SetValue(value: WriterPageDescriptorValue): void {
    this.value = validateWriterPageDescriptor(value);
  }

  /** Creates an independent descriptor. @returns Clone. */
  public Clone(): SwPageDesc {
    return new SwPageDesc(this.GetValue());
  }
}

/** Creates Writer's locale-derived standard page, mirroring docdesc.cxx metric/imperial defaults. @param locale - Writer document locale. @returns Standard page descriptor. */
export function createDefaultWriterPageDescriptor(locale: string): SwPageDesc {
  const imperial = usesImperialPageDefaults(locale);
  const paperFormat: Exclude<WriterPaperFormat, "custom"> = imperial ? "Letter" : "A4";
  const size = WRITER_PAPER_SIZES[paperFormat];
  return new SwPageDesc({
    bottomMargin: imperial ? 1_440 : 1_134,
    height: size.height,
    landscape: false,
    leftMargin: imperial ? 1_800 : 1_134,
    name: "Standard",
    paperFormat,
    rightMargin: imperial ? 1_800 : 1_134,
    topMargin: imperial ? 1_440 : 1_134,
    width: size.width,
  });
}

/** Returns whether two page descriptor values are identical. @param left - First value. @param right - Second value. @returns Whether every field matches. */
export function equalWriterPageDescriptors(
  left: WriterPageDescriptorValue,
  right: WriterPageDescriptorValue,
): boolean {
  return Object.keys(left).every(
    /** Compares one stable field. @param key - Page value key. @returns Whether equal. */ (key) =>
      left[key as keyof WriterPageDescriptorValue] ===
      right[key as keyof WriterPageDescriptorValue],
  );
}

/** Applies a known paper format while retaining margins and requested orientation. @param current - Current page value. @param paperFormat - Known paper identity. @param landscape - Requested orientation. @returns Validated replacement value. */
export function applyWriterPaperFormat(
  current: WriterPageDescriptorValue,
  paperFormat: Exclude<WriterPaperFormat, "custom">,
  landscape: boolean,
): WriterPageDescriptorValue {
  const size = WRITER_PAPER_SIZES[paperFormat];
  return validateWriterPageDescriptor({
    ...current,
    height: landscape ? size.width : size.height,
    landscape,
    paperFormat,
    width: landscape ? size.height : size.width,
  });
}

/** Validates the supported Writer page geometry and returns a frozen copy. @param value - Candidate geometry. @returns Validated immutable copy. */
export function validateWriterPageDescriptor(
  value: WriterPageDescriptorValue,
): WriterPageDescriptorValue {
  const dimensions = [value.width, value.height];
  const margins = [value.leftMargin, value.rightMargin, value.topMargin, value.bottomMargin];
  if (
    !dimensions.every(
      /** Validates one physical dimension. @param candidate - Twip length. @returns Whether valid. */ (
        candidate,
      ) => Number.isInteger(candidate) && candidate > 0,
    )
  )
    throw new Error("Writer page dimensions must be positive integer twips.");
  if (
    !margins.every(
      /** Validates one page margin. @param candidate - Twip length. @returns Whether valid. */ (
        candidate,
      ) => Number.isInteger(candidate) && candidate >= 0,
    )
  )
    throw new Error("Writer page margins must be non-negative integer twips.");
  if (
    dimensions.some(
      /** Checks the supported maximum page dimension. @param candidate - Twip length. @returns Whether excessive. */ (
        candidate,
      ) => candidate > MAX_PAGE_TWIPS,
    )
  )
    throw new Error("Writer page dimensions exceed the supported range.");
  if (value.leftMargin + value.rightMargin + MIN_PAGE_CONTENT_TWIPS > value.width)
    throw new Error("Writer horizontal page margins leave no text area.");
  if (value.topMargin + value.bottomMargin + MIN_PAGE_CONTENT_TWIPS > value.height)
    throw new Error("Writer vertical page margins leave no text area.");
  if (value.name !== "Standard")
    throw new Error("Only the Standard Writer page style is supported.");
  if (!(["A4", "Letter", "custom"] as const).includes(value.paperFormat))
    throw new Error("Writer paper format is unsupported.");
  return Object.freeze({ ...value });
}

/** Matches LibreOffice's non-metric page-default branch for the supported browser locales. @param locale - Document locale. @returns Whether imperial defaults apply. */
function usesImperialPageDefaults(locale: string): boolean {
  const region = locale.replace("_", "-").split("-")[1]?.toUpperCase();
  return region === "US" || region === "CA" || region === "PH";
}
