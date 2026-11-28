/** @fileoverview Owns the represented Office.Writer/Navigator properties. */
import { WRITER_MAX_LIST_LEVEL } from "../../core/doc/list";

/** Native MAXLEVEL count, above the highest zero-based list level. */
export const MAX_NAVIGATOR_OUTLINE_LEVEL = WRITER_MAX_LIST_LEVEL + 1;

/** OutlineTracking values in the Writer configuration schema. */
export enum OutlineTrackingMode {
  Default = 1,
  Focus = 2,
  Off = 3,
}

/** Native content types with implemented tracking. */
export type TrackedContentType = "table" | "bookmark" | "hyperlink" | "comment";

/** Represented content categories and their native ContentTypeId values. */
export type NavigatorContentType = "outline" | TrackedContentType;
const contentTypeIds: Readonly<Record<NavigatorContentType, number>> = {
  outline: 0,
  table: 1,
  bookmark: 5,
  hyperlink: 7,
  comment: 10,
};

const trackingProperties = {
  table: "TableTracking",
  bookmark: "BookmarkTracking",
  hyperlink: "HyperlinkTracking",
  comment: "CommentTracking",
} as const;

/** Represented configuration fields used by the native Navigator content tree. */
export interface NavigatorProperties {
  readonly RootType: number;
  readonly SortAlphabeticallyBlock: number;
  readonly OutlineLevel: number;
  readonly OutlineTracking: OutlineTrackingMode;
  readonly TableTracking: boolean;
  readonly BookmarkTracking: boolean;
  readonly HyperlinkTracking: boolean;
  readonly CommentTracking: boolean;
}

/** Configuration provider passed to the native owner by the platform. */
export interface NavigatorConfiguration {
  readonly Load: () => Readonly<Record<string, unknown>>;
  readonly Save: (values: NavigatorProperties) => void;
}

/** Stores Navigator settings independently of the active document. */
export class SwNavigationConfig {
  private properties: NavigatorProperties;

  /** Loads supported preferences and applies native defaults to absent or invalid values. @param configuration - Platform configuration provider. @returns Navigator configuration. */
  constructor(private readonly configuration?: NavigatorConfiguration) {
    const values = configuration?.Load() ?? {};
    const outline = values.OutlineTracking;
    const level = values.OutlineLevel;
    const root = values.RootType;
    const sort = values.SortAlphabeticallyBlock;
    this.properties = {
      RootType:
        typeof root === "number" && Number.isInteger(root) && root >= -1 && root <= 14 ? root : -1,
      SortAlphabeticallyBlock: typeof sort === "number" && (sort | 0) === sort ? sort : 0,
      OutlineLevel:
        typeof level === "number" &&
        Number.isInteger(level) &&
        level >= 0 &&
        level <= MAX_NAVIGATOR_OUTLINE_LEVEL
          ? level
          : MAX_NAVIGATOR_OUTLINE_LEVEL,
      OutlineTracking:
        outline === OutlineTrackingMode.Focus || outline === OutlineTrackingMode.Off
          ? outline
          : OutlineTrackingMode.Default,
      TableTracking: values.TableTracking !== false,
      BookmarkTracking: values.BookmarkTracking !== false,
      HyperlinkTracking: values.HyperlinkTracking !== false,
      CommentTracking: values.CommentTracking !== false,
    };
  }

  /** Resolves the persisted native root when that category is represented. @returns Content root or undefined for all categories. */
  public GetRootType(): NavigatorContentType | undefined {
    return (Object.keys(contentTypeIds) as NavigatorContentType[]).find(
      /** Matches the stored native enum value. @param type - Represented category. @returns Whether it is the current root. */
      (type) => contentTypeIds[type] === this.properties.RootType,
    );
  }

  /** Stores the native category ID or UNKNOWN when showing all categories. @param type - Active category. @returns Nothing. */
  public SetRootType(type?: NavigatorContentType): void {
    const root = type === undefined ? -1 : contentTypeIds[type];
    if (root === this.properties.RootType) return;
    this.properties = { ...this.properties, RootType: root };
    this.configuration?.Save(this.properties);
  }

  /** Reads the original sort bit for a single category. @param type - Content category. @returns Whether the category is displayed alphabetically. */
  public IsAlphabeticSort(type: NavigatorContentType): boolean {
    return (this.properties.SortAlphabeticallyBlock & (1 << contentTypeIds[type])) !== 0;
  }

  /** Changes one native sort bit, retaining the other categories. @param type - Content category. @param enabled - Whether to display that category alphabetically. @returns Nothing. */
  public SetAlphabeticSort(type: NavigatorContentType, enabled: boolean): void {
    if (this.IsAlphabeticSort(type) === enabled) return;
    this.properties = {
      ...this.properties,
      SortAlphabeticallyBlock:
        this.properties.SortAlphabeticallyBlock ^ (1 << contentTypeIds[type]),
    };
    this.configuration?.Save(this.properties);
  }

  /** Reads the maximum displayed outline depth. @returns Number of represented levels. */
  public GetOutlineLevel(): number {
    return this.properties.OutlineLevel;
  }

  /** Sets the maximum displayed outline depth. @param level - Native Navigator depth. @returns Nothing. */
  public SetOutlineLevel(level: number): void {
    if (level === this.GetOutlineLevel()) return;
    this.properties = { ...this.properties, OutlineLevel: level };
    this.configuration?.Save(this.properties);
  }

  /** Reads the source outline mode. @returns Current mode. */
  public GetOutlineTracking(): OutlineTrackingMode {
    return this.properties.OutlineTracking;
  }

  /** Applies a changed outline mode. @param mode - Native mode. @returns Nothing. */
  public SetOutlineTracking(mode: OutlineTrackingMode): void {
    if (mode === this.GetOutlineTracking()) return;
    this.properties = { ...this.properties, OutlineTracking: mode };
    this.configuration?.Save(this.properties);
  }

  /** Reads the corresponding content tracking preference. @param type - Native content type. @returns Whether it is tracked. */
  public GetContentTypeTrack(type: TrackedContentType): boolean {
    return this.properties[trackingProperties[type]];
  }

  /** Applies a changed content tracking preference. @param type - Native content type. @param track - Whether to track this type. @returns Nothing. */
  public SetContentTypeTrack(type: TrackedContentType, track: boolean): void {
    if (track === this.GetContentTypeTrack(type)) return;
    this.properties = { ...this.properties, [trackingProperties[type]]: track };
    this.configuration?.Save(this.properties);
  }
}
