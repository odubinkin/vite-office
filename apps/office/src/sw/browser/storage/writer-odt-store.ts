/** @fileoverview Writer ODT domain adapter over the shared primary package store;preserves the existing database identity. */
import { IndexedDbDocumentStore } from "../../../framework/browser/storage/document-store";
export type {
  BrowserStoredDocument as BrowserWriterDocument,
  BrowserDocumentStore as WriterOdtStore,
} from "../../../framework/browser/storage/document-store";
/** Writer retains its established primary database,independent from other suites. */
export class IndexedDbWriterOdtStore extends IndexedDbDocumentStore {
  /** Binds the Writer database to the shared storage implementation. @param name - Existing database name. @param factory - Browser storage factory. @returns Store. */
  constructor(name = "vite-office-writer-workbench", factory: IDBFactory = globalThis.indexedDB) {
    super(name, factory);
  }
}
