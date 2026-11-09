/** @fileoverview Loads the original ICU Dict assets at the browser Markdown import boundary. */
import { ICULanguageBreakFactory } from "../../../external/icu/source/common/brkeng";

let pending: Promise<ICULanguageBreakFactory> | undefined;

/** Reads one of the actual built-in binary resources. @param url - Local Vite asset URL. @returns Native resource bytes. */
async function loadDictionary(url: URL): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Writer word dictionary resources could not be loaded.");
  return new Uint8Array(await response.arrayBuffer());
}

/** Prepares one shared native language factory for browser imports, with retry after a resource error. @returns Native factory. */
export function prepareWriterWordDictionaries(): Promise<ICULanguageBreakFactory> {
  pending ??= Promise.all([
    loadDictionary(
      new URL("../../../external/icu/source/data/brkitr/thaidict.dict", import.meta.url),
    ),
    loadDictionary(
      new URL("../../../external/icu/source/data/brkitr/laodict.dict", import.meta.url),
    ),
    loadDictionary(
      new URL("../../../external/icu/source/data/brkitr/burmesedict.dict", import.meta.url),
    ),
    loadDictionary(
      new URL("../../../external/icu/source/data/brkitr/khmerdict.dict", import.meta.url),
    ),
    loadDictionary(
      new URL("../../../external/icu/source/data/brkitr/cjdict.dict", import.meta.url),
    ),
  ]).then(
    /** Installs the actual packaged Dict resources. @param resources - Ordered loaded files. @returns Native factory. */ ([
      thaidict,
      laodict,
      burmesedict,
      khmerdict,
      cjdict,
    ]) => new ICULanguageBreakFactory({ thaidict, laodict, burmesedict, khmerdict, cjdict }),
    /** Releases the failed promise so a subsequent import can retry. @param error - Loading error. @returns Never. */ (
      error: unknown,
    ) => {
      pending = undefined;
      throw error;
    },
  );
  return pending;
}
