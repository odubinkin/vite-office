/** @fileoverview Original configmgr Parser abstract event contract; ordinary references replace SimpleReferenceObject lifetime. */
import type { OUStringConstReference } from "../../sal/inc/rtl/ustring";
import type { XmlReader, Text } from "../../xmlreader/inc/xmlreader";
import type { Span } from "../../xmlreader/inc/span";
/** Actual original parser interface; dependency sets are forwarded unchanged by the driver. */
export abstract class Parser {
  /** Original selected text mode. @returns Native mode. */
  public abstract getTextMode(): Text;
  /** Original start may suspend before consuming the current begin event. @param reader - Actual reader. @param nsId - Native namespace. @param name - Borrowed local name. @param existingDependencies - Borrowed dependency set or null. @returns Whether consumed. */
  public abstract startElement(
    reader: XmlReader,
    nsId: number,
    name: Span,
    existingDependencies: ReadonlySet<OUStringConstReference> | null,
  ): boolean;
  /** Original end callback. @param reader - Actual reader. @returns Nothing. */
  public abstract endElement(reader: XmlReader): void;
  /** Original character callback. @param text - Borrowed byte span. @returns Nothing. */
  public abstract characters(text: Span): void;
}
