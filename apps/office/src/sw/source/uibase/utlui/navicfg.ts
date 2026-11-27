/** @fileoverview Owns the represented Office.Writer/Navigator tracking properties. */

/** OutlineTracking values in the Writer configuration schema. */
export enum OutlineTrackingMode {
  Default = 1,
  Focus = 2,
  Off = 3,
}

/** Native content types with implemented tracking. */
export type TrackedContentType = "table" | "bookmark";

const trackingProperties = { table: "TableTracking", bookmark: "BookmarkTracking" } as const;

/** Configuration fields used by the native Navigator content tree. */
export interface NavigatorTrackingProperties {
  readonly OutlineTracking: OutlineTrackingMode;
  readonly TableTracking: boolean;
  readonly BookmarkTracking: boolean;
}

/** Configuration provider passed to the native owner by the platform. */
export interface NavigatorConfiguration {
  readonly Load: () => Readonly<Record<string, unknown>>;
  readonly Save: (values: NavigatorTrackingProperties) => void;
}

/** Stores Navigator tracking settings independently of the active document. */
export class SwNavigationConfig {
  private properties: NavigatorTrackingProperties;

  /** Loads supported preferences and applies native defaults to absent or invalid values. @param configuration - Platform configuration provider. @returns Navigator configuration. */
  constructor(private readonly configuration?: NavigatorConfiguration) {
    const values = configuration?.Load() ?? {};
    const outline = values.OutlineTracking;
    this.properties = {
      OutlineTracking:
        outline === OutlineTrackingMode.Focus || outline === OutlineTrackingMode.Off
          ? outline
          : OutlineTrackingMode.Default,
      TableTracking: values.TableTracking !== false,
      BookmarkTracking: values.BookmarkTracking !== false,
    };
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
