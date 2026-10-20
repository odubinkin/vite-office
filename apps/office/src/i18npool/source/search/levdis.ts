/** @fileoverview Original weighted Levenshtein distance and relaxed SplitCount from pinned i18npool/source/search/levdis.cxx and levdis.hxx. Works on UTF-16 units and a NUL-terminated pattern; word segmentation/service dispatch remain separate responsibilities. */
/** Erases std::lcm over the original nonnegative, representable native integer domain. @param left - First integer. @param right - Second integer. @returns Least common multiple. */
function lcm(left: number, right: number): number {
  let a = left,
    b = right;
  while (b !== 0) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }
  return a === 0 ? 0 : (left / a) * right;
}
/** Native weighted distance owner. JS-owned arrays erase only unique_ptr allocation/destruction; no substitute distance or Unicode normalization is used. */
export class WLevDistance {
  private nPatternLen: number;
  private cpPattern: Uint16Array;
  private bpPatIsWild: boolean[];
  private nArrayLen: number;
  private npDistance: Int32Array;
  private nLimit = 0;
  private nRepP0 = 0;
  private nInsQ0 = 0;
  private nDelR0 = 0;
  private nStars = 0;
  private bSplitCount = false;
  /** Original user-value constructor or independent native copy constructor. Pattern pointers must contain a terminating zero. @param pattern - Terminated UTF16 input or copied owner. @param nOtherX - Replacements. @param nShorterY - Insertions into data to reach pattern. @param nLongerZ - Deletions from data. @param bRelaxed - Split-count policy. @returns Owned calculator. */
  public constructor(
    pattern: Uint16Array,
    nOtherX: number,
    nShorterY: number,
    nLongerZ: number,
    bRelaxed: boolean,
  );
  /** Original independent copy constructor. @param pattern - Source calculator. @returns Owned calculator. */
  public constructor(pattern: WLevDistance);
  /** Constructs one of the original declared overloads. @param pattern - Original input. @param nOtherX - Replacements. @param nShorterY - Insertions. @param nLongerZ - Deletions. @param bRelaxed - Split count. @returns Calculator. */
  public constructor(
    pattern: Uint16Array | WLevDistance,
    nOtherX = 0,
    nShorterY = 0,
    nLongerZ = 0,
    bRelaxed = false,
  ) {
    if (pattern instanceof WLevDistance) {
      this.nPatternLen = pattern.nPatternLen;
      this.cpPattern = pattern.cpPattern.slice();
      this.bpPatIsWild = pattern.bpPatIsWild.slice();
      this.nArrayLen = this.nPatternLen + 1;
      this.npDistance = new Int32Array(Math.max(3, this.nArrayLen));
      this.nLimit = pattern.nLimit;
      this.nRepP0 = pattern.nRepP0;
      this.nInsQ0 = pattern.nInsQ0;
      this.nDelR0 = pattern.nDelR0;
      this.nStars = pattern.nStars;
      this.bSplitCount = pattern.bSplitCount;
    } else {
      this.nPatternLen = pattern.indexOf(0);
      if (this.nPatternLen < 0)
        throw new Error("WLevDistance pattern pointer must be NUL-terminated.");
      this.cpPattern = new Uint16Array(this.nPatternLen + 1);
      this.bpPatIsWild = Array<boolean>(this.nPatternLen + 1).fill(false);
      this.nArrayLen = this.nPatternLen + 1;
      this.npDistance = new Int32Array(Math.max(3, this.nArrayLen));
      this.InitData(pattern);
      this.CalcLPQR(nOtherX, nShorterY, nLongerZ, bRelaxed);
    }
  }
  /** Original configured threshold. Negative WLD values are successful relaxed results. @returns Source limit. */
  public GetLimit(): number {
    return this.nLimit;
  }
  /** Original user count to weights conversion; negative counts clamp to zero. The documented representable native domain is 0..33. @param nX - Other characters. @param nY - Shorter data. @param nZ - Longer data. @param bRelaxed - Split-count policy. @returns Nothing. */
  public CalcLPQR(nX: number, nY: number, nZ: number, bRelaxed: boolean): void {
    if (nX < 0) nX = 0;
    if (nY < 0) nY = 0;
    if (nZ < 0) nZ = 0;
    if (Math.min(nX, nY, nZ) === 0) {
      const nMax = Math.max(nX, nY, nZ),
        nMid = WLevDistance.Mid3(nX, nY, nZ);
      this.nLimit = nMid === 0 ? nMax : lcm(nMid, nMax);
    } else this.nLimit = lcm(lcm(nX, nY), nZ);
    this.nRepP0 = nX ? this.nLimit / nX : this.nLimit + 1;
    this.nInsQ0 = nY ? this.nLimit / nY : this.nLimit + 1;
    this.nDelR0 = nZ ? this.nLimit / nZ : this.nLimit + 1;
    this.bSplitCount = bRelaxed;
  }
  /** Native middle of three including repeated and zero values. @param x - First. @param y - Second. @param z - Third. @returns Middle value. */
  private static Mid3(x: number, y: number, z: number): number {
    const min = Math.min(x, y, z);
    if (x === min) return Math.min(y, z);
    else if (y === min) return Math.min(x, z);
    else return Math.min(x, y);
  }
  /** Native NUL-delimited copy, backslash escapes only '*' and '?'. @param pattern - Source pointer. @returns Nothing. */
  private InitData(pattern: Uint16Array): void {
    this.nStars = 0;
    let cp1 = 0,
      cp2 = 0;
    while (pattern[cp1] !== 0) {
      if (pattern[cp1] === 92) {
        if (pattern[cp1 + 1] === 42 || pattern[cp1 + 1] === 63) {
          ++cp1;
          --this.nPatternLen;
        }
        this.bpPatIsWild[cp2] = false;
      } else if (pattern[cp1] === 42 || pattern[cp1] === 63) {
        if (pattern[cp1] === 42) ++this.nStars;
        this.bpPatIsWild[cp2] = true;
      } else this.bpPatIsWild[cp2] = false;
      this.cpPattern[cp2++] = pattern[cp1++] as number;
    }
    this.cpPattern[cp2] = 0;
  }
  /** Original character-balance correction used by relaxed replacement counting, comparing UTF16 units. @param jj - Pattern index. @param ii - Data index. @param c - Compared unit. @param cString - Data pointer. @param nStringLen - Data length. @returns Original balance. */
  private levdisbalance(
    jj: number,
    ii: number,
    c: number,
    cString: Uint16Array,
    nStringLen: number,
  ): number {
    let nBalance = 0;
    if (jj !== ii) {
      if (jj > 0) for (let k = 0; k < jj; ++k) if (this.cpPattern[k] === c) ++nBalance;
      if (ii > 0) for (let k = 0; k < ii; ++k) if (cString[k] === c) --nBalance;
      if (!nBalance) {
        for (let k = jj + 1; k < this.nPatternLen; ++k) if (this.cpPattern[k] === c) ++nBalance;
        for (let k = ii + 1; k < nStringLen; ++k) if (cString[k] === c) --nBalance;
      }
    }
    return nBalance;
  }
  /** Original weighted/relaxed distance including initial-column policy, early limits, wildcard states and negative relaxed success. @param cString - UTF16 data pointer. @param nStringLen - Explicit data length. @returns Distance, negative relaxed success, or limit plus one. */
  public WLD(cString: Uint16Array, nStringLen: number): number {
    let nSPMin = 0; // penalty point Minimum
    let nRepS = 0; // for SplitCount

    // length difference between pattern and string
    const nLenDiff = this.nPatternLen - this.nStars - nStringLen;
    // more insertions or deletions necessary as the limit? Then leave
    if (
      nLenDiff * this.nInsQ0 > this.nLimit ||
      (this.nStars == 0 && nLenDiff * this.nDelR0 < -this.nLimit)
    )
      return this.nLimit + 1;

    // comparative String greater than  instantaneous array
    // -> adapt array size
    if (nStringLen >= this.nArrayLen) {
      // increase size much more to avoid reallocation
      if (nStringLen < 2048) this.nArrayLen = 2 * nStringLen;
      else this.nArrayLen = nStringLen + 1;
      this.npDistance = new Int32Array(Math.max(3, this.nArrayLen));
    }

    // Calculate start values of the second column (first pattern value).
    // First column (0-Len pattern) is always zero .. nStringLen * nInsQ0,
    // therefore the minimum is 0
    if (this.nPatternLen == 0) {
      // Count of deletions to reach pattern
      for (let i = 0; i <= nStringLen; i++) this.npDistance[i] = i * this.nDelR0;
    } else if ((this.cpPattern[0] as number) == 42 && this.bpPatIsWild[0]) {
      // instead of a '*' you can fit in anything
      for (let i = 0; i <= nStringLen; i++) this.npDistance[i] = 0;
    } else {
      const c = this.cpPattern[0] as number;
      let nP: number;
      if (c == 63 && this.bpPatIsWild[0])
        nP = 0; // a '?' could be any character.
      else
        // Minimum of replacement and deletion+insertion weighting
        nP = Math.min(this.nRepP0, this.nRepP0, this.nDelR0 + this.nInsQ0);
      this.npDistance[0] = this.nInsQ0; // start with simple insert
      this.npDistance[1] = this.nInsQ0;
      this.npDistance[2] = this.nInsQ0;
      let nReplacePos = -1; // tristate flag
      let nDelCnt = 0;
      for (let i = 1; i <= nStringLen; i++, nDelCnt += this.nDelR0) {
        if (cString[i - 1] == c) nP = 0; // Replace from this position is 0
        // Deletions to match pattern + Replace
        this.npDistance[i] = nDelCnt + nP;
        if (this.bSplitCount) {
          if (nReplacePos < 0 && nP) {
            // this position will be replaced
            nRepS++;
            nReplacePos = i;
          } else if (nReplacePos > 0 && !nP) {
            // same count of c
            const nBalance = this.levdisbalance(0, i - 1, c, cString, nStringLen);
            if (!nBalance) {
              // one was replaced that was an insertion instead
              nRepS--;
              nReplacePos = 0;
            }
          }
        }
      }
      nSPMin = Math.min(
        this.npDistance[0] as number,
        this.npDistance[1] as number,
        this.npDistance[2] as number,
      );
    }

    // calculate distance matrix
    let j = 0; // for all columns of the pattern, till limit is not reached
    while (
      j < this.nPatternLen - 1 &&
      nSPMin <= (this.bSplitCount ? 2 * this.nLimit : this.nLimit)
    ) {
      let nP: number, nQ: number, nR: number, nPij: number, d2: number;

      j++;
      const c = this.cpPattern[j] as number;
      if (this.bpPatIsWild[j])
        // '*' or '?' not escaped
        nP = 0; // could be replaced without penalty
      else nP = this.nRepP0;
      if (c == 42 && this.bpPatIsWild[j]) {
        nQ = 0; // insertion and deletion without penalty
        nR = 0;
      } else {
        nQ = this.nInsQ0; // usual weighting
        nR = this.nDelR0;
      }
      d2 = this.npDistance[0] as number;
      // increase insert count to get from null string to pattern
      this.npDistance[0] = (this.npDistance[0] as number) + nQ;
      nSPMin = this.npDistance[0] as number;
      let nReplacePos = -1; // tristate flag
      // for each pattern column run through the string
      for (let i = 1; i <= nStringLen; i++) {
        const d1 = d2; // WLD( X(i-1), Y(j-1) )
        d2 = this.npDistance[i] as number; // WLD( X(i)  , Y(j-1) )
        if (cString[i - 1] == c) {
          nPij = 0; // p(i,j)
          if (nReplacePos < 0) {
            // same count of c
            const nBalance = this.levdisbalance(j, i - 1, c, cString, nStringLen);
            if (!nBalance) nReplacePos = 0; // no replacement
          }
        } else nPij = nP;
        // WLD( X(i), Y(j) ) = min( WLD( X(i-1), Y(j-1) ) + p(i,j) ,
        //                          WLD( X(i)  , Y(j-1) ) + q      ,
        //                          WLD( X(i-1), Y(j)   ) + r      )
        this.npDistance[i] = Math.min(d1 + nPij, d2 + nQ, (this.npDistance[i - 1] as number) + nR);
        if ((this.npDistance[i] as number) < nSPMin) nSPMin = this.npDistance[i] as number;
        if (this.bSplitCount) {
          if (nReplacePos < 0 && nPij && (this.npDistance[i] as number) == d1 + nPij) {
            // this position will be replaced
            nRepS++;
            nReplacePos = i;
          } else if (nReplacePos > 0 && !nPij) {
            // character is equal in string and pattern
            //
            // If from this point:
            // * pattern and string have the same count of this
            //   character
            // * and character count is the same before this position
            // then the replace was none.
            //
            // Scrambled letters are recognized here and the nRepS
            // replacement is withdrawn, whereby the double limit kicks
            // in.

            // Same count of c
            const nBalance = this.levdisbalance(j, i - 1, c, cString, nStringLen);
            if (!nBalance) {
              // one was replaced that was an insertion instead
              nRepS--;
              nReplacePos = 0;
            }
          }
        }
      }
    }
    if (nSPMin <= this.nLimit && (this.npDistance[nStringLen] as number) <= this.nLimit)
      return this.npDistance[nStringLen] as number;
    else {
      if (this.bSplitCount) {
        if (nRepS && nLenDiff > 0) nRepS -= nLenDiff; // Inserts were counted
        if (
          nSPMin <= 2 * this.nLimit &&
          (this.npDistance[nStringLen] as number) <= 2 * this.nLimit &&
          nRepS * this.nRepP0 <= this.nLimit
        )
          return -(this.npDistance[nStringLen] as number);
        return this.nLimit + 1;
      }
      return this.nLimit + 1;
    }
  }
}
