/**
 * @fileoverview Reimplements the bounded Writer document-shell load/save boundary from pinned `sw/source/uibase/app/docsh.cxx` and `docshini.cxx`.
 */

import { markDocumentSaved, type OfficeDocument } from "../../../../sfx2/source/doc/docfac";
import { ODT_MIMETYPE } from "../../../../package/source/manifest/ManifestExport";
import { SwDoc } from "../../core/doc/doc";
import { readOdtDocument } from "../../filter/xml/swxml";
import { writeOdtDocument } from "../../filter/xml/wrtxml";

/** Writer document shell that owns the active SwDoc across new, load, and save operations. */
export class SwDocShell {
  /** MIME type used by Writer's OpenDocument Text filter. */
  public static readonly ODT_MEDIA_TYPE = ODT_MIMETYPE;

  /** Creates a shell around an existing Writer document. @param document - Active canonical document. @returns Nothing. */
  public constructor(private document: SwDoc) {}

  /** Returns the shell-owned Writer document. @returns Active SwDoc. */
  public GetDoc(): SwDoc {
    return this.document;
  }

  /** Replaces the shell document with a new empty Writer graph. @param metadata - New document identity. @param initialTextNodeId - Initial body node identity. @returns New SwDoc. */
  public InitNew(metadata: OfficeDocument, initialTextNodeId: string): SwDoc {
    this.document = new SwDoc(metadata, initialTextNodeId);
    return this.document;
  }

  /** Loads an ODT into a candidate graph before atomically replacing the active document. @param bytes - Complete ODT bytes. @param metadata - Fallback identity and title. @returns Loaded saved-state SwDoc. */
  public async Load(bytes: Uint8Array, metadata: OfficeDocument): Promise<SwDoc> {
    const loaded = await readOdtDocument(bytes, metadata);
    loaded.document = markDocumentSaved(loaded.document);
    this.document = loaded;
    return loaded;
  }

  /** Serializes the active document through Writer's ODT package filter. @returns Complete ODT bytes. */
  public SaveAs(): Uint8Array {
    return writeOdtDocument(this.document);
  }
}
