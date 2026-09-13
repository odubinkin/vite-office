/**
 * @fileoverview Registers the Writer workspace factory at the suite-owned application boundary without exposing Writer implementation to framework core.
 */

import type { OfficeModuleFactory } from "../../../../framework/source/services/modulemanager";
import { WriterWorkbench } from "../uiview/view";

/** Creates the Writer module factory consumed by the application composition root. @returns Writer-owned workspace factory. */
export function createWriterModuleFactory(): OfficeModuleFactory {
  return {
    createWorkspace:
      /** Creates the active Writer view when framework activates the registered route. @returns Writer workbench element. */
      function createWriterWorkspace(): React.JSX.Element {
        return <WriterWorkbench isActive />;
      },
    suiteId: "writer",
  };
}
