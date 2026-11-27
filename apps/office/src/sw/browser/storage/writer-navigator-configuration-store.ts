/** @fileoverview Persists represented Office.Writer/Navigator properties outside the document. */
import type {
  NavigatorConfiguration,
  NavigatorProperties,
} from "../../source/uibase/utlui/navicfg";

/** Original Writer Navigator configuration subtree. */
export const WRITER_NAVIGATOR_CONFIGURATION_KEY = "org.openoffice.Office.Writer/Navigator";

/** Reads and writes configuration through the platform Storage API. */
export class WriterNavigatorConfigurationStore implements NavigatorConfiguration {
  /** Borrows browser-local storage. @param storage - Browser configuration backend. @returns Navigator configuration provider. */
  constructor(private readonly storage: Pick<Storage, "getItem" | "setItem">) {}

  /** Reads the native property names stored by this adapter. @returns Properties from a valid record. */
  public Load(): Readonly<Record<string, unknown>> {
    try {
      const raw = this.storage.getItem(WRITER_NAVIGATOR_CONFIGURATION_KEY);
      const values: unknown = raw === null ? undefined : JSON.parse(raw);
      if (values && typeof values === "object" && !Array.isArray(values))
        return values as Record<string, unknown>;
    } catch {
      // The native defaults remain available when persistent storage cannot be read.
    }
    return {};
  }

  /** Persists represented properties alongside future or unrelated settings. @param values - Current configuration projection. @returns Nothing. */
  public Save(values: NavigatorProperties): void {
    try {
      this.storage.setItem(
        WRITER_NAVIGATOR_CONFIGURATION_KEY,
        JSON.stringify({ ...this.Load(), ...values }),
      );
    } catch {
      // The live Navigator configuration remains usable when storage cannot be written.
    }
  }
}
