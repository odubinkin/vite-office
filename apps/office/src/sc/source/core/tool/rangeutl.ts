/** @fileoverview Original ScRangeStringConverter token/address/range parsing used by OOXML AddressConverter. UTF16 views use the existing host string boundary; original offsets, partial mutations and document-convention fallback remain intact. Full sheet/external parsing depends on the still-partial ScAddress/ScRange owners. */
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScAddress, ScRange, ScRefFlags } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import { ScRangeList } from "../../../inc/rangelst";
import type { AddressConvention } from "../../../../formula/inc/grammar";

/** Original static token and reference conversion members; unconsumed naming/API/formatting members remain unported. */
export const ScRangeStringConverter = {
  /** Original append-only list conversion retains valid tokens even when another token fails. @param ranges - Actual output list. @param source - UTF16 view. @param doc - Actual document. @param convention - Requested convention. @param separator - Default space. @param quote - Default apostrophe. @returns Whether every encountered token parsed. */
  GetRangeListFromString(
    ranges: ScRangeList,
    source: string,
    doc: ScDocument,
    convention: AddressConvention,
    separator = 32,
    quote = 39,
  ): boolean {
    let result = true;
    const offset: [number] = [0];
    while (offset[0] >= 0) {
      const range = new ScRange();
      if (
        this.GetRangeFromString(range, source, doc, convention, offset, separator, quote) &&
        offset[0] >= 0
      )
        ranges.push_back(range);
      else if (offset[0] > -1) result = false;
    }
    return result;
  },
  /** Original quote-toggling search; negative offsets retain their native value. @param source - UTF16 view. @param search - Unicode code unit. @param offset - Signed32 offset. @param quote - Quote unit, default apostrophe. @returns Matching offset or native negative sentinel. */
  IndexOf(source: string, search: number, offset: number, quote = 39): number {
    search &= 0xffff;
    quote &= 0xffff;
    let index = offset | 0,
      quoted = false,
      exit = false;
    while (!exit && index >= 0 && index < source.length) {
      const code = source.charCodeAt(index);
      exit = code === search && !quoted;
      quoted = quoted !== (code === quote);
      if (!exit) ++index;
    }
    return index < source.length ? index : -1;
  },
  /** Original run-of-separator skip, including unchanged negative input offsets. @param source - UTF16 view. @param search - Separator code unit. @param offset - Signed32 offset. @returns First different unit or negative sentinel. */
  IndexOfDifferent(source: string, search: number, offset: number): number {
    search &= 0xffff;
    let index = offset | 0,
      exit = false;
    while (!exit && index >= 0 && index < source.length) {
      exit = source.charCodeAt(index) !== search;
      if (!exit) ++index;
    }
    return index < source.length ? index : -1;
  },
  /** Original output-reference tokenization: final token leaves offset at length, next call clears it. Valid substring offsets are caller preconditions. @param token - Actual Unicode output owner. @param source - UTF16 view. @param offset - Native signed32 in/out reference. @param separator - Default space. @param quote - Default apostrophe. @returns Nothing. */
  GetTokenByOffset(
    token: OUString,
    source: string,
    offset: [number],
    separator = 32,
    quote = 39,
  ): void {
    offset[0] |= 0;
    if (offset[0] === -1 || offset[0] >= source.length) {
      token.clear();
      offset[0] = -1;
    } else {
      let end = this.IndexOf(source, separator, offset[0], quote);
      if (end < 0) end = source.length;
      const value = unicode(source.substring(offset[0], end));
      try {
        token.assign(value);
      } finally {
        value.dispose();
      }
      const next = this.IndexOfDifferent(source, separator, end);
      offset[0] = next < 0 ? source.length : next;
    }
  },
  /** Original argument order deliberately passes apostrophe as separator and the requested separator as quote. @param source - UTF16 view. @param separator - Requested code unit, default space. @returns Original token count. */
  GetTokenCount(source: string, separator = 32): number {
    const token = new OUString(),
      offset: [number] = [0];
    let count = 0;
    try {
      while (offset[0] >= 0) {
        this.GetTokenByOffset(token, source, offset, 39, separator);
        if (offset[0] >= 0) ++count;
      }
      return count;
    } finally {
      token.dispose();
    }
  },
  /** Original token parse followed by the actual document UI-convention retry. Exceptions from unported owner services remain explicit. @param address - Actual output owner. @param source - UTF16 view. @param doc - Actual document. @param convention - Requested convention. @param offset - Native in/out offset. @param separator - Default space. @param quote - Default apostrophe. @returns Native validity. */
  GetAddressFromString(
    address: ScAddress,
    source: string,
    doc: ScDocument,
    convention: AddressConvention,
    offset: [number],
    separator = 32,
    quote = 39,
  ): boolean {
    const token = new OUString();
    try {
      this.GetTokenByOffset(token, source, offset, separator, quote);
      if (offset[0] >= 0) {
        if (address.Parse(token, doc, new ScAddress.Details(convention)) & ScRefFlags.VALID)
          return true;
        const ui = doc.GetAddressConvention();
        if (convention !== ui)
          return !!(address.Parse(token, doc, new ScAddress.Details(ui)) & ScRefFlags.VALID);
      }
      return false;
    } finally {
      token.dispose();
    }
  },
  /** Original range parse, leading-dot removal and two-address/chart fallback with short-circuit mutation. @param range - Actual output owner. @param source - UTF16 view. @param doc - Actual document. @param convention - Requested convention. @param offset - Native in/out offset. @param separator - Default space. @param quote - Default apostrophe. @returns Original validity; failed parsing may modify endpoints. */
  GetRangeFromString(
    range: ScRange,
    source: string,
    doc: ScDocument,
    convention: AddressConvention,
    offset: [number],
    separator = 32,
    quote = 39,
  ): boolean {
    const token = new OUString();
    try {
      this.GetTokenByOffset(token, source, offset, separator, quote);
      if (offset[0] < 0) return false;
      let uiString = text(token),
        index = this.IndexOf(uiString, 58, 0, quote);
      const details = new ScAddress.Details(convention);
      if (index < 0) {
        if (uiString[0] === ".") uiString = uiString.substring(1);
        const value = unicode(uiString);
        try {
          let result = !!(range.aStart.Parse(value, doc, details) & ScRefFlags.VALID);
          const ui = doc.GetAddressConvention();
          if (!result && convention !== ui)
            result = !!(
              range.aStart.Parse(value, doc, new ScAddress.Details(ui)) & ScRefFlags.VALID
            );
          range.aEnd.assign(range.aStart);
          return result;
        } finally {
          value.dispose();
        }
      }
      if (uiString[0] === ".") {
        uiString = uiString.substring(1);
        --index;
      }
      if (index < uiString.length - 1 && uiString[index + 1] === ".")
        uiString = uiString.substring(0, index + 1) + uiString.substring(index + 2);
      const value = unicode(uiString);
      try {
        let result = !!(range.Parse(value, doc, details) & ScRefFlags.VALID);
        if (!result) {
          const first = value.copy(0, index),
            last = value.copy(index + 1);
          try {
            result =
              !!(range.aStart.Parse(first, doc, details) & ScRefFlags.VALID) &&
              !!(range.aEnd.Parse(last, doc, details) & ScRefFlags.VALID);
            const ui = doc.GetAddressConvention();
            if (!result && convention !== ui) {
              const uiDetails = new ScAddress.Details(ui);
              result =
                !!(range.aStart.Parse(first, doc, uiDetails) & ScRefFlags.VALID) &&
                !!(range.aEnd.Parse(last, doc, uiDetails) & ScRefFlags.VALID);
            }
          } finally {
            first.dispose();
            last.dispose();
          }
        }
        return result;
      } finally {
        value.dispose();
      }
    } finally {
      token.dispose();
    }
  },
};
