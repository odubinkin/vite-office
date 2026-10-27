/** @fileoverview Original ICU78.3 LikelySubtagsData/LocaleDistanceData loader from loclikelysubtags.cpp. Loads the complete pinned direct langInfo resource with original ResourceValue/table/array views and logical UniqueCharStrings owners. No precomputed language-result map replaces trie/LSR decoding. */
import { CharStringMap } from "./charstrmap";
import { UniqueCharStrings } from "./uniquecharstr";
import { LSR } from "./lsr";
import { ResourceArray, ResourceTable, ResourceValue } from "./resource";
import { ResourceDataValue } from "./uresdata";
import {
  ures_openDirect,
  ures_getValueWithFallback,
  ures_close,
  UResourceBundle,
} from "./uresbund";
import { uscript_getShortName } from "./unicode/uscript";
import { UErrorCode as E, U_FAILURE } from "./unicode/utypes";
/** Original optional locale distance data owner, loaded alongside likely data even when only maximization is requested. */
export class LocaleDistanceData {
  distanceTrieBytes: readonly number[] | null = null;
  regionToPartitions: readonly number[] | null = null;
  partitions: readonly string[] | null = null;
  paradigms: readonly Readonly<LSR>[] | null = null;
  paradigmsLength = 0;
  distances: readonly number[] | null = null;
  /** Original move constructor invalidates only the owned pointer arrays in the source; there is no move assignment API. @param data - Source. @returns Moved owner. */
  static move(data: LocaleDistanceData): LocaleDistanceData {
    const result = new LocaleDistanceData();
    result.distanceTrieBytes = data.distanceTrieBytes;
    result.regionToPartitions = data.regionToPartitions;
    result.partitions = data.partitions;
    result.paradigms = data.paradigms;
    result.paradigmsLength = data.paradigmsLength;
    result.distances = data.distances;
    data.partitions = null;
    data.paradigms = null;
    return result;
  }
}
/** Original temporary loader owner. */
export class LikelySubtagsData {
  langInfoBundle: UResourceBundle | null = null;
  readonly strings: UniqueCharStrings;
  languageAliases = new CharStringMap();
  regionAliases = new CharStringMap();
  trieBytes: readonly number[] | null = null;
  lsrs: readonly LSR[] | null = null;
  lsrsLength = 0;
  readonly distanceData = new LocaleDistanceData();
  /** Original string-pool construction occurs before load. @param status - Status. @returns Owner. */
  constructor(status: [number]) {
    this.strings = new UniqueCharStrings(status);
  }
  /** Original temporary loader destructor closes its bundle unless moved into the singleton. @returns Nothing. */
  close(): void {
    ures_close(this.langInfoBundle);
    this.langInfoBundle = null;
  }
  /** Original full ordered loader with optional match data, required m49/trie/LSR data and source validation. @param status - Status. @returns Nothing. */
  load(status: [number]): void {
    if (U_FAILURE(status[0])) return;
    this.langInfoBundle = ures_openDirect(null, "langInfo", status);
    if (U_FAILURE(status[0])) return;
    const temp = new UResourceBundle();
    try {
      const value = new ResourceDataValue();
      ures_getValueWithFallback(this.langInfoBundle, "likely", temp, value, status);
      const likelyTable = value.getTable(status);
      if (U_FAILURE(status[0])) return;
      // Preserve the source default-constructed view before conditional resource assignment.
      let m49Array = new ResourceArray();
      if (likelyTable.findValue("m49", value)) m49Array = value.getArray(status);
      else {
        status[0] = E.U_MISSING_RESOURCE_ERROR;
        return;
      }
      const languageIndexes: number[] = [],
        regionIndexes: number[] = [],
        lsrSubtagIndexes: number[] = [];
      if (
        !this.readStrings(likelyTable, "languageAliases", value, languageIndexes, status) ||
        !this.readStrings(likelyTable, "regionAliases", value, regionIndexes, status) ||
        !this.readLSREncodedStrings(
          likelyTable,
          "lsrnum",
          value,
          m49Array,
          lsrSubtagIndexes,
          status,
        )
      )
        return;
      if (
        (languageIndexes.length & 1) !== 0 ||
        (regionIndexes.length & 1) !== 0 ||
        lsrSubtagIndexes.length % 3 !== 0
      ) {
        status[0] = E.U_INVALID_FORMAT_ERROR;
        return;
      }
      if (lsrSubtagIndexes.length === 0) {
        status[0] = E.U_MISSING_RESOURCE_ERROR;
        return;
      }
      if (!likelyTable.findValue("trie", value)) {
        status[0] = E.U_MISSING_RESOURCE_ERROR;
        return;
      }
      const length: [number] = [0];
      this.trieBytes = value.getBinary(length, status);
      if (U_FAILURE(status[0])) return;
      const matchStatus: [number] = [0];
      ures_getValueWithFallback(this.langInfoBundle, "match", temp, value, matchStatus);
      const partitionIndexes: number[] = [],
        paradigmSubtagIndexes: number[] = [];
      if (!U_FAILURE(matchStatus[0])) {
        const matchTable = value.getTable(status);
        if (U_FAILURE(status[0])) return;
        if (matchTable.findValue("trie", value)) {
          this.distanceData.distanceTrieBytes = value.getBinary(length, status);
          if (U_FAILURE(status[0])) return;
        }
        if (matchTable.findValue("regionToPartitions", value)) {
          this.distanceData.regionToPartitions = value.getBinary(length, status);
          if (U_FAILURE(status[0])) return;
          if (length[0] < LSR.REGION_INDEX_LIMIT) {
            status[0] = E.U_INVALID_FORMAT_ERROR;
            return;
          }
        }
        if (
          !this.readStrings(matchTable, "partitions", value, partitionIndexes, status) ||
          !this.readLSREncodedStrings(
            matchTable,
            "paradigmnum",
            value,
            m49Array,
            paradigmSubtagIndexes,
            status,
          )
        )
          return;
        if (paradigmSubtagIndexes.length % 3 !== 0) {
          status[0] = E.U_INVALID_FORMAT_ERROR;
          return;
        }
        if (matchTable.findValue("distances", value)) {
          this.distanceData.distances = value.getIntVector(length, status);
          if (U_FAILURE(status[0])) return;
          if (length[0] < 4) {
            status[0] = E.U_INVALID_FORMAT_ERROR;
            return;
          }
        }
      } else if (matchStatus[0] !== E.U_MISSING_RESOURCE_ERROR) {
        status[0] = matchStatus[0];
        return;
      }
      this.strings.freeze();
      this.languageAliases = new CharStringMap(languageIndexes.length / 2, status);
      for (let i = 0; i < languageIndexes.length; i += 2)
        this.languageAliases.put(
          this.strings.get(languageIndexes[i] as number) as string,
          this.strings.get(languageIndexes[i + 1] as number) as string,
          status,
        );
      this.regionAliases = new CharStringMap(regionIndexes.length / 2, status);
      for (let i = 0; i < regionIndexes.length; i += 2)
        this.regionAliases.put(
          this.strings.get(regionIndexes[i] as number) as string,
          this.strings.get(regionIndexes[i + 1] as number) as string,
          status,
        );
      if (U_FAILURE(status[0])) return;
      this.lsrsLength = lsrSubtagIndexes.length / 3;
      const lsrs: LSR[] = [];
      for (let i = 0; i < lsrSubtagIndexes.length; i += 3)
        lsrs.push(
          new LSR(
            this.strings.get(lsrSubtagIndexes[i] as number) as string,
            this.strings.get(lsrSubtagIndexes[i + 1] as number) as string,
            this.strings.get(lsrSubtagIndexes[i + 2] as number) as string,
            LSR.IMPLICIT_LSR,
          ),
        );
      this.lsrs = lsrs;
      if (partitionIndexes.length > 0)
        this.distanceData.partitions = partitionIndexes.map(
          /** Borrows frozen strings. @param i - Offset. @returns C span. */ (i) =>
            this.strings.get(i) as string,
        );
      if (paradigmSubtagIndexes.length > 0) {
        this.distanceData.paradigmsLength = paradigmSubtagIndexes.length / 3;
        const paradigms: LSR[] = [];
        for (let i = 0; i < paradigmSubtagIndexes.length; i += 3)
          paradigms.push(
            new LSR(
              this.strings.get(paradigmSubtagIndexes[i] as number) as string,
              this.strings.get(paradigmSubtagIndexes[i + 1] as number) as string,
              this.strings.get(paradigmSubtagIndexes[i + 2] as number) as string,
              LSR.DONT_CARE_FLAGS,
            ),
          );
        this.distanceData.paradigms = paradigms;
      }
    } finally {
      ures_close(temp);
    }
  }
  /** Original optional string-array reader. @param table - View. @param key - Key. @param value - Mutable value. @param indexes - Output native offsets. @param status - Status. @returns Success. */
  private readStrings(
    table: ResourceTable,
    key: string,
    value: ResourceValue,
    indexes: number[],
    status: [number],
  ): boolean {
    if (U_FAILURE(status[0])) return false;
    if (table.findValue(key, value)) {
      const array = value.getArray(status);
      if (U_FAILURE(status[0])) return false;
      for (let i = 0; i < array.getSize(); ++i) {
        if (array.getValue(i, value)) {
          const length: [number] = [0];
          indexes[i] = this.strings.add(value.getString(length, status) as string, status);
          if (U_FAILURE(status[0])) return false;
        }
      }
    }
    return true;
  }
  /** Original encoded language decoder. @param encoded - Int32. @returns UTF16 language. */
  private toLanguage(encoded: number): string {
    if (encoded === 0) return "";
    if (encoded === 1) return "skip";
    encoded = (encoded & 0xffffff) % (27 * 27 * 27);
    let s = String.fromCharCode(97 + (encoded % 27) - 1, 97 + (Math.trunc(encoded / 27) % 27) - 1);
    if (Math.trunc(encoded / (27 * 27)) !== 0)
      s += String.fromCharCode(97 + Math.trunc(encoded / (27 * 27)) - 1);
    return s;
  }
  /** Original encoded script decoder, with short-name null handling. @param encoded - Int32. @returns UTF16 script. */
  private toScript(encoded: number): string {
    if (encoded === 0) return "";
    if (encoded === 1) return "script";
    return uscript_getShortName((encoded >> 24) & 255) ?? "";
  }
  /** Original M49 resource lookup. @param array - View. @param value - Output holder. @param index - Index. @param status - Status. @returns UTF16 region. */
  private m49IndexToCode(
    array: ResourceArray,
    value: ResourceValue,
    index: number,
    status: [number],
  ): string {
    if (U_FAILURE(status[0])) return "";
    if (array.getValue(index, value)) return value.getUnicodeString(status);
    status[0] = E.U_MISSING_RESOURCE_ERROR;
    return "";
  }
  /** Original encoded region decoder. @param array - M49 data. @param value - Mutable value. @param encoded - Int32. @param status - Status. @returns UTF16 region. */
  private toRegion(
    array: ResourceArray,
    value: ResourceValue,
    encoded: number,
    status: [number],
  ): string {
    if (U_FAILURE(status[0]) || encoded === 0 || encoded === 1) return "";
    encoded = Math.trunc((encoded & 0xffffff) / (27 * 27 * 27)) % (27 * 27);
    if (encoded < 27) return this.m49IndexToCode(array, value, encoded, status);
    return String.fromCharCode(65 + (encoded % 27) - 1, 65 + (Math.trunc(encoded / 27) % 27) - 1);
  }
  /** Original encoded LSR vector reader. @param table - View. @param key - Vector key. @param value - Holder. @param m49 - M49 array. @param indexes - Output offsets. @param status - Status. @returns Success. */
  private readLSREncodedStrings(
    table: ResourceTable,
    key: string,
    value: ResourceValue,
    m49: ResourceArray,
    indexes: number[],
    status: [number],
  ): boolean {
    if (U_FAILURE(status[0])) return false;
    if (table.findValue(key, value)) {
      const length: [number] = [0],
        vectors = value.getIntVector(length, status);
      if (U_FAILURE(status[0])) return false;
      for (let i = 0; i < length[0]; ++i) {
        const encoded = (vectors as readonly number[])[i] as number;
        indexes[i * 3] = this.strings.addByValue(this.toLanguage(encoded), status);
        indexes[i * 3 + 1] = this.strings.addByValue(this.toScript(encoded), status);
        indexes[i * 3 + 2] = this.strings.addByValue(
          this.toRegion(m49, value, encoded, status),
          status,
        );
        if (U_FAILURE(status[0])) return false;
      }
    }
    return true;
  }
}

/** Original borrowed const locale-distance data reference, including const paradigm elements. */
export type LocaleDistanceDataConstReference = Readonly<LocaleDistanceData>;
