/** @fileoverview Explicit native CM configuration for historical physical-geometry scenarios;fresh-default tests use production constructors. */
import { createWriterDocumentSession } from "../sw/browser/composition/writer-module";
import { SwModule } from "../sw/source/uibase/app/swmodule";
import { FieldUnit } from "../tools/inc/fldunit";
/** Creates the real production ownership chain with an explicitly configured native module. @param services - Existing platform adapters. @param filter - Existing ODT filter. @returns Actual Writer session. */
export function createCentimetreWriterDocumentSession(
  services?: Parameters<typeof createWriterDocumentSession>[0],
  filter?: Parameters<typeof createWriterDocumentSession>[1],
): ReturnType<typeof createWriterDocumentSession> {
  return createWriterDocumentSession(
    services,
    filter,
    new SwModule({ "Other/MeasureUnit": FieldUnit.CM }),
  );
}
