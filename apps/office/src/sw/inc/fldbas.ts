/** @fileoverview Consumed native Writer field ownership from fldbas.hxx. */
import type { SwDoc } from "../source/core/doc/doc";

/** Original date, time and fixed subtype bits. */
export enum SwDateTimeSubType {
  None = 0,
  Fixed = 1,
  Date = 2,
  Time = 4,
}

/** Common document and copy contract of Writer's represented fields. */
export interface SwField<Field> {
  GetTyp(): { GetDoc(): SwDoc };
  Copy(): Field;
  CopyToDocument(document: SwDoc): Field;
  Dispose(): void;
}
