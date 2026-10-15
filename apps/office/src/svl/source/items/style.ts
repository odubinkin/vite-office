/** @fileoverview Original SfxStyleSheetIterator and search predicate from svl/source/items/style.cxx; full style/pool owners remain separate unimplemented responsibilities. */
import {
  SfxStyleFamily,
  SfxStyleSearchBits,
  type SfxStyleSheetBasePoolIndexReference,
  type SfxStyleSheetSearchReference,
  type SfxStyleSheetNameReference,
} from "../../inc/style-values";
import { SearchBehavior } from "./IndexedStyleSheets";
import type { StyleSheetPredicate } from "../../inc/IndexedStyleSheets";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";

/** Original anonymous predicate, including deliberately disabled visibility filtering. */
class DoesStyleMatchStyleSheetPredicate implements StyleSheetPredicate {
  /** Borrows the actual iterator. @param mIterator - Search state. @returns Predicate. */
  public constructor(private readonly mIterator: SfxStyleSheetIterator) {}
  /** Original family/mask/usage/hidden expression and virtual-call order. @param value - Indexed style. @returns Whether matching. */
  public Check(value: SfxStyleSheetNameReference): boolean {
    const styleSheet = value as SfxStyleSheetSearchReference;
    const matchFamily =
      this.mIterator.GetSearchFamily() === SfxStyleFamily.All ||
      styleSheet.GetFamily() === this.mIterator.GetSearchFamily();
    const used = this.mIterator.SearchUsed() && styleSheet.IsUsed();
    const onlyHidden =
      this.mIterator.GetSearchMask() === SfxStyleSearchBits.Hidden && styleSheet.IsHidden();
    return (
      matchFamily &&
      Boolean(
        styleSheet.GetMask() & (this.mIterator.GetSearchMask() & ~SfxStyleSearchBits.Used) ||
        used ||
        onlyHidden ||
        (this.mIterator.GetSearchMask() & SfxStyleSearchBits.AllVisible) ===
          SfxStyleSearchBits.AllVisible,
      )
    );
  }
}

/** Complete native iterator state and operations; JS references borrow the original pool/index and style identities. */
export class SfxStyleSheetIterator {
  protected pBasePool: SfxStyleSheetBasePoolIndexReference;
  protected nSearchFamily: SfxStyleFamily;
  protected nMask: SfxStyleSearchBits;
  private pCurrentStyle: SfxStyleSheetSearchReference | null = null;
  private mnCurrentPosition = 0;
  private readonly bSearchUsed: boolean;
  /** Original native pool/family/mask constructor. @param pool - Borrowed pool. @param family - Family. @param mask - Search mask. @returns Iterator. */
  public constructor(
    pool: SfxStyleSheetBasePoolIndexReference,
    family: SfxStyleFamily,
    mask = SfxStyleSearchBits.All,
  ) {
    this.pBasePool = pool;
    this.nSearchFamily = family;
    this.bSearchUsed =
      (mask & SfxStyleSearchBits.AllVisible) !== SfxStyleSearchBits.AllVisible &&
      (mask & SfxStyleSearchBits.Used) === SfxStyleSearchBits.Used;
    if (this.bSearchUsed) mask &= ~SfxStyleSearchBits.Used;
    this.nMask = mask;
  }
  /** Native unfiltered all-family fast path. @returns Whether trivial. */
  private IsTrivialSearch(): boolean {
    return (
      (this.nMask & SfxStyleSearchBits.AllVisible) === SfxStyleSearchBits.AllVisible &&
      this.GetSearchFamily() === SfxStyleFamily.All
    );
  }
  /** Original search family. @returns Family. */
  public GetSearchFamily(): SfxStyleFamily {
    return this.nSearchFamily;
  }
  /** Original usage-search flag. @returns Whether usage is tested. */
  public SearchUsed(): boolean {
    return this.bSearchUsed;
  }
  /** Original externally visible mask restores the separated Used bit. @returns Mask. */
  public GetSearchMask(): SfxStyleSearchBits {
    let mask = this.nMask;
    if (this.bSearchUsed) mask |= SfxStyleSearchBits.Used;
    return mask;
  }
  /** Original three-path count; fast-path counts deliberately narrow to uint16. @returns Native signed count. */
  public Count(): number {
    const index = this.pBasePool.GetIndexedStyleSheets();
    if (this.IsTrivialSearch()) return index.GetNumberOfStyleSheets() & 0xffff;
    if (this.nMask === SfxStyleSearchBits.All)
      return index.GetStyleSheetsByFamily(this.nSearchFamily).length & 0xffff;
    return (
      index.GetNumberOfStyleSheetsWithPredicate(new DoesStyleMatchStyleSheetPredicate(this)) | 0
    );
  }
  /** Original operator[] language binding; preserves family bounds errors and cursor assignment rules. @param position - Native signed index. @returns Matching style or null. */
  public at(position: number): SfxStyleSheetSearchReference | null {
    const index = this.pBasePool.GetIndexedStyleSheets();
    let result: SfxStyleSheetNameReference | null = null;
    if (this.IsTrivialSearch()) {
      result = index.GetStyleSheetByPosition(position);
      this.mnCurrentPosition = position;
    } else if (this.nMask === SfxStyleSearchBits.All) {
      const family = index.GetStyleSheetsByFamily(this.nSearchFamily);
      if (position < 0 || position >= family.length)
        throw new RangeError("SfxStyleSheetIterator family vector position out of range");
      result = family[position] as SfxStyleSheetNameReference;
      this.mnCurrentPosition = position;
    } else {
      const found = index.GetNthStyleSheetThatMatchesPredicate(
        position,
        new DoesStyleMatchStyleSheetPredicate(this),
      );
      if (found[0]) {
        this.mnCurrentPosition = found[1];
        result = found[0];
      }
    }
    return result as SfxStyleSheetSearchReference | null;
  }
  /** Original count-before-index first operation. @returns First style or null. */
  public First(): SfxStyleSheetSearchReference | null {
    return this.Count() !== 0 ? this.at(0) : null;
  }
  /** Original three-path cursor advancement, with no invented end/reset state. @returns Next style or null. */
  public Next(): SfxStyleSheetSearchReference | null {
    const index = this.pBasePool.GetIndexedStyleSheets();
    let result: SfxStyleSheetNameReference | null = null;
    if (this.IsTrivialSearch()) {
      const next = this.mnCurrentPosition + 1;
      if (index.GetNumberOfStyleSheets() > next) {
        this.mnCurrentPosition = next;
        result = index.GetStyleSheetByPosition(next);
      }
    } else if (this.nMask === SfxStyleSearchBits.All) {
      const next = this.mnCurrentPosition + 1,
        family = index.GetStyleSheetsByFamily(this.nSearchFamily);
      if (family.length > next) {
        this.mnCurrentPosition = next;
        result = family[next] as SfxStyleSheetNameReference;
      }
    } else {
      const found = index.GetNthStyleSheetThatMatchesPredicate(
        0,
        new DoesStyleMatchStyleSheetPredicate(this),
        this.mnCurrentPosition + 1,
      );
      result = found[0];
      if (result !== null) this.mnCurrentPosition = found[1];
    }
    this.pCurrentStyle = result as SfxStyleSheetSearchReference | null;
    return this.pCurrentStyle;
  }
  /** Original exact-name predicate lookup stores the primary-vector position, even for family fast paths. @param name - Native name. @returns First matching style or null. */
  public Find(name: OUStringConstReference): SfxStyleSheetSearchReference | null {
    const index = this.pBasePool.GetIndexedStyleSheets();
    const positions = index.FindPositionsByNameAndPredicate(
      name,
      new DoesStyleMatchStyleSheetPredicate(this),
      SearchBehavior.ReturnFirst,
    );
    if (positions.length === 0) return null;
    const position = positions[0] as number;
    this.mnCurrentPosition = position;
    this.pCurrentStyle = index.GetStyleSheetByPosition(
      position,
    ) as SfxStyleSheetSearchReference | null;
    return this.pCurrentStyle;
  }
}
