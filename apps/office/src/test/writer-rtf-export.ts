/** @fileoverview Attribute-output tests retain genuine RTF document/range owners and release their borrowed contexts after each test. */
import { afterEach } from "vitest";
import { SwDoc } from "../sw/source/core/doc/doc";
import { SwPaM, SwPosition } from "../sw/source/core/crsr/pam";
import { RtfExport } from "../sw/source/filter/ww8/rtfexport";
const contexts: { document: SwDoc | undefined; range: SwPaM }[] = [];
afterEach(
  /** Releases range registrations before their document owners. @returns Nothing. */ () => {
    for (const context of contexts.splice(0)) {
      context.range.Dispose();
      context.document?.Dispose();
    }
  },
);
/** Creates a native exporter over an actual collapsed range for direct attribute-writer tests. @param document - Optional borrowed document. @returns Actual source exporter. */
export function createRtfExport(document?: SwDoc): RtfExport {
  const owner = document ?? new SwDoc();
  const position = new SwPosition(owner.GetNodes().GetEndOfContent());
  const range = new SwPaM(position);
  position.Dispose();
  contexts.push({ document: document === undefined ? owner : undefined, range });
  return new RtfExport(owner, range, range);
}
