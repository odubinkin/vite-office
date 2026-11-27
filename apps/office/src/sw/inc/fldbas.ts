/** @fileoverview Consumed native Writer field ownership from fldbas.hxx. */
import type { SwDoc } from "../source/core/doc/doc";

/** Common document and copy contract of Writer's represented fields. */
export interface SwField<Field> {
  GetTyp(): { GetDoc(): SwDoc };
  Copy(): Field;
  CopyToDocument(document: SwDoc): Field;
  Dispose(): void;
}
