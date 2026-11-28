/** @fileoverview Calc ODF annotation import context over native note and edit text data. */
import {
  SvXMLIgnoreContext,
  SvXMLImportContext,
  type FastAttributeList,
} from "../../../../xmloff/source/core/xmlimp";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import { SvXMLUnitConverter } from "../../../../xmloff/source/core/xmluconv";
import type { ScAddress } from "../../../inc/address";
import {
  ScNoteUtil,
  ScThreadedCommentData,
  ScThreadedCommentEntry,
  type ScPostIt,
} from "../../../inc/postit";
import { ScXMLCellTextParaContext } from "./celltextparacontext";
import { ScXMLImportContext } from "./importcontext";
import { createCellEditText } from "./xmlcelli.edit";
import type { ScXMLImport } from "./xmlimprt";
import type { CellTextParagraph } from "./xmlexprt.celltext";

/** Accumulates one annotation metadata element in parser order. */
class ScXMLContentContext extends SvXMLImportContext {
  /** Binds the destination buffer. @param append - Metadata consumer. @returns The initialized ScXMLContentContext instance. */
  constructor(private readonly append: (value: string) => void) {
    super();
  }

  /** Appends decoded metadata. @param value - Characters. @returns Nothing. */
  override characters(value: string): void {
    this.append(value);
  }
}

/** Reads one native threaded entry's lexical attributes. @param entry - Comment or reply. @param attributes - Original metadata. @returns Nothing. */
function readThreadEntry(entry: ScThreadedCommentEntry, attributes: FastAttributeList): void {
  entry.maGuid = attributes.get(XMLToken.LOEXT_ID) ?? "";
  entry.maPersonId = attributes.get(XMLToken.LOEXT_PERSON_ID) ?? "";
  entry.maDateTime = attributes.get(XMLToken.LOEXT_DATE_TIME) ?? "";
}

/** Collects one reply under its native thread owner. */
class ScXMLThreadedCommentReplyContext extends SvXMLImportContext {
  private readonly entry = new ScThreadedCommentEntry();

  /** Reads the original reply attributes. @param data - Owning thread. @param attributes - Reply attributes. @returns The initialized ScXMLThreadedCommentReplyContext instance. */
  constructor(
    private readonly data: ScThreadedCommentData,
    attributes: FastAttributeList,
  ) {
    super();
    readThreadEntry(this.entry, attributes);
  }

  /** Accumulates the text of this reply. @param element - Child token. @returns Child context. */
  override createFastChildContext(element: XMLToken): SvXMLImportContext | null {
    return element === XMLToken.LOEXT_TEXT
      ? new ScXMLContentContext(
          /** Appends decoded reply text. @param value - Characters. @returns Nothing. */
          (value) => {
            this.entry.maText += value;
          },
        )
      : null;
  }

  /** Commits the entry in source order. @returns Nothing. */
  override endFastElement(): void {
    this.data.maReplies.push(this.entry);
  }
}

/** Collects the native comment root and its independent reply sequence. */
class ScXMLThreadedCommentContext extends SvXMLImportContext {
  /** Reads the original thread attributes. @param data - Newly owned thread metadata. @param attributes - Root attributes. @returns The initialized ScXMLThreadedCommentContext instance. */
  constructor(
    private readonly data: ScThreadedCommentData,
    attributes: FastAttributeList,
  ) {
    super();
    readThreadEntry(data.maRoot, attributes);
    data.mbDone = attributes.get(XMLToken.LOEXT_RESOLVED) === "true";
  }

  /** Dispatches root text and replies. @param element - Child token. @param attributes - Child metadata. @returns Child context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element === XMLToken.LOEXT_TEXT)
      return new ScXMLContentContext(
        /** Appends decoded root text. @param value - Characters. @returns Nothing. */
        (value) => {
          this.data.maRoot.maText += value;
        },
      );
    return element === XMLToken.LOEXT_REPLY
      ? new ScXMLThreadedCommentReplyContext(this.data, attributes)
      : null;
  }
}

/** Handles the annotation subtree independently of the owning cell value. */
export class ScXMLAnnotationContext extends ScXMLImportContext {
  private author: string;
  private date: string;
  private dateString: string;
  private readonly shown: boolean;
  private simpleText = "";
  private threaded: ScThreadedCommentData | null = null;
  private readonly paragraphs: CellTextParagraph[] = [];

  /** Reads legacy annotation attributes before child elements. @param owner - Native importer. @param tab - Current sheet. @param attributes - Annotation attributes. @returns The initialized ScXMLAnnotationContext instance. */
  constructor(
    owner: ScXMLImport,
    private readonly tab: number,
    attributes: FastAttributeList,
  ) {
    super(owner);
    this.author = attributes.get(XMLToken.OFFICE_AUTHOR) ?? "";
    this.date = attributes.get(XMLToken.OFFICE_CREATE_DATE) ?? "";
    this.dateString = attributes.get(XMLToken.OFFICE_CREATE_DATE_STRING) ?? "";
    this.shown = attributes.get(XMLToken.OFFICE_DISPLAY) === "true";
  }

  /** Collects a caption paragraph. @param paragraph - Decoded paragraph. @returns Nothing. */
  setParagraph(paragraph: CellTextParagraph): void {
    this.paragraphs.push(paragraph);
  }

  /** Dispatches native metadata and supported caption paragraphs. @param element - Child token. @param attributes - Child metadata. @returns Child context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    switch (element) {
      case XMLToken.DC_CREATOR:
        return new ScXMLContentContext(
          /** Appends creator text. @param value - Text. @returns Nothing. */
          (value) => {
            this.author += value;
          },
        );
      case XMLToken.DC_DATE:
        return new ScXMLContentContext(
          /** Appends a date. @param value - Text. @returns Nothing. */
          (value) => {
            this.date += value;
          },
        );
      case XMLToken.META_DATE_STRING:
        return new ScXMLContentContext(
          /** Appends a fallback date. @param value - Text. @returns Nothing. */
          (value) => {
            this.dateString += value;
          },
        );
      case XMLToken.LOEXT_THREADED_COMMENT:
        this.threaded = new ScThreadedCommentData();
        return new ScXMLThreadedCommentContext(this.threaded, attributes);
      case XMLToken.TEXT_P:
        return new ScXMLCellTextParaContext(this, this.tab);
      default:
        return new SvXMLIgnoreContext(true);
    }
  }

  /** Skips unrepresented children as the native annotation context does. @returns Ignore context. */
  override createUnknownChildContext(): SvXMLImportContext {
    return new SvXMLIgnoreContext(true);
  }

  /** Accumulates the original simple-text fallback. @param value - Direct characters. @returns Nothing. */
  override characters(value: string): void {
    this.simpleText += value;
  }

  /** Installs the represented caption contents and native metadata at the actual cell. @param position - Cell address. @returns Nothing. */
  SetAnnotation(position: ScAddress): void {
    const importer = this.GetScImport();
    const document = importer.GetDocument();
    let note: ScPostIt | null;
    if (
      this.paragraphs.some(
        /** Checks whether the caption contains actual text or a field. @param paragraph - Paragraph. @returns Whether a text run exists. */
        (paragraph) => paragraph.length > 0,
      )
    ) {
      note = ScNoteUtil.CreateNoteFromObjectData(
        document,
        position,
        createCellEditText(importer, this.paragraphs),
        this.shown,
      );
    } else {
      note = ScNoteUtil.CreateNoteFromString(
        document,
        position,
        this.simpleText.trim() ? this.simpleText : "",
        this.shown,
      );
    }
    if (!note) return;
    const date = this.date || this.dateString;
    const serial: [number] = [0];
    if (
      SvXMLUnitConverter.convertDateTimeToDays(
        serial,
        date,
        document.GetFormatTable().GetNullDate(),
      )
    )
      note.SetDate(date);
    note.SetAuthor(this.author);
    if (this.threaded) {
      note.SetThreadedCommentData(this.threaded);
      this.threaded = null;
    }
  }
}
