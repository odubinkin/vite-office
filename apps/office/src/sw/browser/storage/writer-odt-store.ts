/** @fileoverview Browser primary storage for complete ODT documents. */

const DOCUMENTS = "documents";

/** One committed browser document; the ODT package is the only durable body. */
export interface BrowserWriterDocument {
  readonly bytes: Uint8Array;
  readonly id: string;
  readonly title: string;
  readonly version: number;
}

/** Browser persistence operations required by Writer workflows. */
export interface WriterOdtStore {
  list(): Promise<readonly BrowserWriterDocument[]>;
  load(id: string): Promise<BrowserWriterDocument | undefined>;
  save(record: BrowserWriterDocument): Promise<void>;
  saveAs(record: BrowserWriterDocument): Promise<void>;
  rename(record: BrowserWriterDocument, previousTitle: string): Promise<void>;
}

/** IndexedDB v2 store with atomic title uniqueness. */
export class IndexedDbWriterOdtStore implements WriterOdtStore {
  /**
   * Handles the Writer browser operation.
   * @param name - Input value.
   * @param factory - Input value.
   * @returns Operation result.
   */ public constructor(
    private readonly name = "vite-office-writer-workbench",
    private readonly factory: IDBFactory = globalThis.indexedDB,
  ) {}

  /**
   * Handles the Writer browser operation.
   * @returns Operation result.
   */ public async list(): Promise<readonly BrowserWriterDocument[]> {
    const db = await this.open();
    try {
      return await new Promise(
        /**
         * Handles the Writer browser operation.
         * @param resolve - Input value.
         * @param reject - Input value.
         * @returns Operation result.
         */ (resolve, reject) => {
          const transaction = db.transaction(DOCUMENTS, "readonly");
          const request = transaction.objectStore(DOCUMENTS).getAll();
          request.onsuccess =
            /**
             * Handles the Writer browser operation.
             * @returns Operation result.
             */ () => resolve(request.result as BrowserWriterDocument[]);
          request.onerror =
            /**
             * Handles the Writer browser operation.
             * @returns Operation result.
             */ () => reject(request.error);
          transaction.onabort =
            /**
             * Handles the Writer browser operation.
             * @returns Operation result.
             */ () => reject(transaction.error);
        },
      );
    } finally {
      db.close();
    }
  }

  /**
   * Handles the Writer browser operation.
   * @param id - Input value.
   * @returns Operation result.
   */ public async load(id: string): Promise<BrowserWriterDocument | undefined> {
    const db = await this.open();
    try {
      return await new Promise(
        /**
         * Handles the Writer browser operation.
         * @param resolve - Input value.
         * @param reject - Input value.
         * @returns Operation result.
         */ (resolve, reject) => {
          const transaction = db.transaction(DOCUMENTS, "readonly");
          const request = transaction.objectStore(DOCUMENTS).get(id);
          request.onsuccess =
            /**
             * Handles the Writer browser operation.
             * @returns Operation result.
             */ () => resolve(request.result as BrowserWriterDocument | undefined);
          request.onerror =
            /**
             * Handles the Writer browser operation.
             * @returns Operation result.
             */ () => reject(request.error);
          transaction.onabort =
            /**
             * Handles the Writer browser operation.
             * @returns Operation result.
             */ () => reject(transaction.error);
        },
      );
    } finally {
      db.close();
    }
  }

  /**
   * Handles the Writer browser operation.
   * @param record - Input value.
   * @returns Operation result.
   */ public save(record: BrowserWriterDocument): Promise<void> {
    return this.write(record, "save");
  }

  /**
   * Handles the Writer browser operation.
   * @param record - Input value.
   * @returns Operation result.
   */ public saveAs(record: BrowserWriterDocument): Promise<void> {
    return this.write(record, "copy");
  }

  /**
   * Handles the Writer browser operation.
   * @param record - Input value.
   * @param previousTitle - Input value.
   * @returns Operation result.
   */ public rename(record: BrowserWriterDocument, previousTitle: string): Promise<void> {
    return this.write(record, "rename", previousTitle);
  }

  /**
   * Handles the Writer browser operation.
   * @param record - Input value.
   * @param operation - Input value.
   * @param previousTitle - Input value.
   * @returns Operation result.
   */ private async write(
    record: BrowserWriterDocument,
    operation: "copy" | "rename" | "save",
    previousTitle?: string,
  ): Promise<void> {
    if (!record.title.trim()) throw new Error("Document name is required.");
    const db = await this.open();
    try {
      await new Promise<void>(
        /**
         * Handles the Writer browser operation.
         * @param resolve - Input value.
         * @param reject - Input value.
         * @returns Operation result.
         */ (resolve, reject) => {
          const transaction = db.transaction(DOCUMENTS, "readwrite");
          const store = transaction.objectStore(DOCUMENTS);
          const byTitle = store.index("title").get(record.title);
          byTitle.onsuccess =
            /**
             * Handles the Writer browser operation.
             * @returns Operation result.
             */ () => {
              const conflicting = byTitle.result as BrowserWriterDocument | undefined;
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
                const existing = store.get(record.id);
                existing.onsuccess =
                  /**
                   * Handles the Writer browser operation.
                   * @returns Operation result.
                   */ () => {
                    const old = existing.result as BrowserWriterDocument | undefined;
                    if (old === undefined || old.title !== previousTitle) {
                      transaction.abort();
                      reject(new Error("The document name changed in another tab."));
                    } else store.put(record);
                  };
              } else store.put(record);
            };
          byTitle.onerror =
            /**
             * Handles the Writer browser operation.
             * @returns Operation result.
             */ () => reject(byTitle.error);
          transaction.oncomplete =
            /**
             * Handles the Writer browser operation.
             * @returns Operation result.
             */ () => resolve();
          transaction.onerror =
            /**
             * Handles the Writer browser operation.
             * @returns Operation result.
             */ () => reject(transaction.error);
          transaction.onabort =
            /**
             * Handles the Writer browser operation.
             * @returns Operation result.
             */ () => reject(transaction.error ?? new Error("Storage write failed."));
        },
      );
    } finally {
      db.close();
    }
  }

  /**
   * Handles the Writer browser operation.
   * @returns Operation result.
   */ private async open(): Promise<IDBDatabase> {
    const db = await new Promise<IDBDatabase>(
      /**
       * Handles the Writer browser operation.
       * @param resolve - Input value.
       * @param reject - Input value.
       * @returns Operation result.
       */ (resolve, reject) => {
        const request = this.factory.open(this.name, 2);
        request.onupgradeneeded =
          /**
           * Handles the Writer browser operation.
           * @returns Operation result.
           */ () => {
            const database = request.result;
            if (!database.objectStoreNames.contains(DOCUMENTS)) {
              const store = database.createObjectStore(DOCUMENTS, { keyPath: "id" });
              store.createIndex("title", "title", { unique: true });
            }
          };
        request.onsuccess =
          /**
           * Handles the Writer browser operation.
           * @returns Operation result.
           */ () => resolve(request.result);
        request.onerror =
          /**
           * Handles the Writer browser operation.
           * @returns Operation result.
           */ () => reject(request.error);
      },
    );
    return db;
  }
}
