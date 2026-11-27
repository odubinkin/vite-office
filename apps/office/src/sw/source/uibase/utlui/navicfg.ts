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
export type TrackedContentType = "table" | "bookmark";

const trackingProperties = { table: "TableTracking", bookmark: "BookmarkTracking" } as const;

/** Represented configuration fields used by the native Navigator content tree. */
export interface NavigatorProperties {
  readonly OutlineLevel: number;
  readonly OutlineTracking: OutlineTrackingMode;
  readonly TableTracking: boolean;
  readonly BookmarkTracking: boolean;
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
    this.properties = {
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
    };
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
