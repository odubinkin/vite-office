/** @fileoverview Browser primary storage for raw ODF XML and binary resources; listings read metadata only. */
import type { XmlPackage } from "../../../svl/source/misc/storage";
const DOCUMENTS = "xml-documents";
const METADATA = "document-metadata";

/** Identity, title and generation needed for browser listings. */
export interface BrowserDocumentSummary {
  readonly id: string;
  readonly title: string;
  readonly version: number;
}

/** One browser document with raw XML streams and binary resources. */
export interface BrowserStoredDocument extends BrowserDocumentSummary {
  readonly content: XmlPackage;
}

/** Browser persistence operations required by suite workflows. */
export interface BrowserDocumentStore {
  list(): Promise<readonly BrowserDocumentSummary[]>;
  load(id: string): Promise<BrowserStoredDocument | undefined>;
  save(record: BrowserStoredDocument): Promise<void>;
  saveAs(record: BrowserStoredDocument): Promise<void>;
  rename(record: BrowserStoredDocument, previousTitle: string): Promise<void>;
  replace(record: BrowserStoredDocument, previousId: string): Promise<void>;
}

/** IndexedDB v3 XML store with atomic title uniqueness. */
export class IndexedDbDocumentStore implements BrowserDocumentStore {
  /**
   * Handles the browser storage operation.
   * @param name - Input value.
   * @param factory - Input value.
   * @returns Operation result.
   */ public constructor(
    private readonly name: string,
    private readonly factory: IDBFactory = globalThis.indexedDB,
  ) {}

  /**
   * Handles the browser storage operation.
   * @returns Operation result.
   */ public async list(): Promise<readonly BrowserDocumentSummary[]> {
    const db = await this.open();
    try {
      return await new Promise(
        /**
         * Handles the browser storage operation.
         * @param resolve - Input value.
         * @param reject - Input value.
         * @returns Operation result.
         */ (resolve, reject) => {
          const transaction = db.transaction(METADATA, "readonly");
          const request = transaction.objectStore(METADATA).getAll();
          request.onsuccess =
            /**
             * Handles the browser storage operation.
             * @returns Operation result.
             */ () => resolve(request.result as BrowserDocumentSummary[]);
          request.onerror =
            /**
             * Handles the browser storage operation.
             * @returns Operation result.
             */ () => reject(request.error);
          transaction.onabort =
            /**
             * Handles the browser storage operation.
             * @returns Operation result.
             */ () => reject(transaction.error);
        },
      );
    } finally {
      db.close();
    }
  }

  /**
   * Handles the browser storage operation.
   * @param id - Input value.
   * @returns Operation result.
   */ public async load(id: string): Promise<BrowserStoredDocument | undefined> {
    const db = await this.open();
    try {
      return await new Promise(
        /**
         * Handles the browser storage operation.
         * @param resolve - Input value.
         * @param reject - Input value.
         * @returns Operation result.
         */ (resolve, reject) => {
          const transaction = db.transaction(DOCUMENTS, "readonly");
          const request = transaction.objectStore(DOCUMENTS).get(id);
          request.onsuccess =
            /**
             * Handles the browser storage operation.
             * @returns Operation result.
             */ () => resolve(request.result as BrowserStoredDocument | undefined);
          request.onerror =
            /**
             * Handles the browser storage operation.
             * @returns Operation result.
             */ () => reject(request.error);
          transaction.onabort =
            /**
             * Handles the browser storage operation.
             * @returns Operation result.
             */ () => reject(transaction.error);
        },
      );
    } finally {
      db.close();
    }
  }

  /**
   * Handles the browser storage operation.
   * @param record - Input value.
   * @returns Operation result.
   */ public save(record: BrowserStoredDocument): Promise<void> {
    return this.write(record, "save");
  }

  /**
   * Handles the browser storage operation.
   * @param record - Input value.
   * @returns Operation result.
   */ public saveAs(record: BrowserStoredDocument): Promise<void> {
    return this.write(record, "copy");
  }

  /**
   * Handles the browser storage operation.
   * @param record - Input value.
   * @param previousTitle - Input value.
   * @returns Operation result.
   */ public rename(record: BrowserStoredDocument, previousTitle: string): Promise<void> {
    return this.write(record, "rename", previousTitle);
  }

  /** Atomically replaces one colliding target record and removes the current record. @param record - Replacement bytes under the target identity. @param previousId - Current document identity to remove. @returns Completion. */
  public async replace(record: BrowserStoredDocument, previousId: string): Promise<void> {
    if (!record.title.trim()) throw new Error("Document name is required.");
    const db = await this.open();
    try {
      await new Promise<void>(
        /** Performs one atomic target replacement. @param resolve - Success completion. @param reject - Failure completion. @returns Nothing. */ (
          resolve,
          reject,
        ) => {
          const transaction = db.transaction([DOCUMENTS, METADATA], "readwrite");
          const store = transaction.objectStore(DOCUMENTS);
          const target = transaction.objectStore(METADATA).get(record.id);
          target.onsuccess =
            /** Confirms that the selected conflict still owns its title. @returns Nothing. */ () => {
              const existing = target.result as BrowserStoredDocument | undefined;
              if (existing === undefined || existing.title !== record.title) {
                transaction.abort();
                reject(new Error("The conflicting document changed in another tab."));
                return;
              }
              store.put(record);
              transaction.objectStore(METADATA).put(summary(record));
              if (previousId !== record.id) {
                store.delete(previousId);
                transaction.objectStore(METADATA).delete(previousId);
              }
            };
          target.onerror = /** Reports target lookup failure. @returns Nothing. */ () =>
            reject(target.error);
          transaction.oncomplete = /** Reports committed replacement. @returns Nothing. */ () =>
            resolve();
          transaction.onerror = /** Reports transaction failure. @returns Nothing. */ () =>
            reject(transaction.error);
          transaction.onabort = /** Reports transaction abort. @returns Nothing. */ () =>
            reject(transaction.error ?? new Error("Storage write failed."));
        },
      );
    } finally {
      db.close();
    }
  }

  /**
   * Handles the browser storage operation.
   * @param record - Input value.
   * @param operation - Input value.
   * @param previousTitle - Input value.
   * @returns Operation result.
   */ private async write(
    record: BrowserStoredDocument,
    operation: "copy" | "rename" | "save",
    previousTitle?: string,
  ): Promise<void> {
    if (!record.title.trim()) throw new Error("Document name is required.");
    const db = await this.open();
    try {
      await new Promise<void>(
        /**
         * Handles the browser storage operation.
         * @param resolve - Input value.
         * @param reject - Input value.
         * @returns Operation result.
         */ (resolve, reject) => {
          const transaction = db.transaction([DOCUMENTS, METADATA], "readwrite");
          const store = transaction.objectStore(DOCUMENTS);
          const byTitle = transaction.objectStore(METADATA).index("title").get(record.title);
          byTitle.onsuccess =
            /**
             * Handles the browser storage operation.
             * @returns Operation result.
             */ () => {
              const conflicting = byTitle.result as BrowserStoredDocument | undefined;
              if (conflicting !== undefined && conflicting.id !== record.id) {
                transaction.abort();
                reject(new Error("A document with this name already exists."));
                return;
              }
              if (operation === "copy" && conflicting !== undefined) {
                transaction.abort();
                reject(new Error("A document with this name already exists."));
                return;
              }
              if (operation === "rename" && previousTitle !== undefined) {
                const existing = transaction.objectStore(METADATA).get(record.id);
                existing.onsuccess =
                  /**
                   * Handles the browser storage operation.
                   * @returns Operation result.
                   */ () => {
                    const old = existing.result as BrowserStoredDocument | undefined;
                    if (old === undefined || old.title !== previousTitle) {
                      transaction.abort();
                      reject(new Error("The document name changed in another tab."));
                    } else {
                      store.put(record);
                      transaction.objectStore(METADATA).put(summary(record));
                    }
                  };
              } else {
                store.put(record);
                transaction.objectStore(METADATA).put(summary(record));
              }
            };
          byTitle.onerror =
            /**
             * Handles the browser storage operation.
             * @returns Operation result.
             */ () => reject(byTitle.error);
          transaction.oncomplete =
            /**
             * Handles the browser storage operation.
             * @returns Operation result.
             */ () => resolve();
          transaction.onerror =
            /**
             * Handles the browser storage operation.
             * @returns Operation result.
             */ () => reject(transaction.error);
          transaction.onabort =
            /**
             * Handles the browser storage operation.
             * @returns Operation result.
             */ () => reject(transaction.error ?? new Error("Storage write failed."));
        },
      );
    } finally {
      db.close();
    }
  }

  /**
   * Handles the browser storage operation.
   * @returns Operation result.
   */ private async open(): Promise<IDBDatabase> {
    const db = await new Promise<IDBDatabase>(
      /**
       * Handles the browser storage operation.
       * @param resolve - Input value.
       * @param reject - Input value.
       * @returns Operation result.
       */ (resolve, reject) => {
        const request = this.factory.open(this.name, 3);
        request.onupgradeneeded =
          /**
           * Handles the browser storage operation.
           * @returns Operation result.
           */ () => {
            const database = request.result;
            if (!database.objectStoreNames.contains(DOCUMENTS)) {
              database.createObjectStore(DOCUMENTS, { keyPath: "id" });
              const metadata = database.createObjectStore(METADATA, { keyPath: "id" });
              metadata.createIndex("title", "title", { unique: true });
            }
          };
        request.onsuccess =
          /**
           * Handles the browser storage operation.
           * @returns Operation result.
           */ () => resolve(request.result);
        request.onerror =
          /**
           * Handles the browser storage operation.
           * @returns Operation result.
           */ () => reject(request.error);
      },
    );
    return db;
  }
}

/** Allocates the first unused browser title by appending a one-based parenthesized index. @param baseTitle - Requested display name. @param documents - Existing browser records. @returns Unique normalized title. */
export function getUniqueDocumentTitle(
  baseTitle: string,
  documents: readonly BrowserDocumentSummary[],
): string {
  const normalized = baseTitle.trim();
  if (normalized.length === 0) throw new Error("Document name is required.");
  const occupied = new Set(
    documents.map(
      /** Selects one occupied browser title. @param document - Stored record. @returns Record title. */ (
        document,
      ) => document.title,
    ),
  );
  if (!occupied.has(normalized)) return normalized;
  const indexed = /^(.*) \((\d+)\)$/u.exec(normalized);
  const root = indexed?.[1]?.trim() || normalized;
  let index = indexed === null ? 1 : Number(indexed[2]) + 1;
  while (occupied.has(`${root} (${index})`)) index += 1;
  return `${root} (${index})`;
}

/** Copies only fields needed for listings and title checks. @param record - Full body. @returns Metadata. */
function summary(record: BrowserStoredDocument): BrowserDocumentSummary {
  return { id: record.id, title: record.title, version: record.version };
}
