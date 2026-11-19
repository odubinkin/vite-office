# Local R1C1 address prerequisites

The existing `ScAddress`/`ScRange` owner now dispatches local Excel R1C1 references through the original axis-parser control flow. Absolute and relative coordinates, bare zero-offset axes, whole-row/column fallback, single/range admission, malformed suffix flags and partial coordinate mutations are retained. Formatting preserves row-before-column order, base-relative offsets, distinct endpoint absolute flags and whole-axis singleton abbreviation. `ParseAny` retains the original fallback.

The common signed64 scanner is the original `sal_Unicode_strtol` algorithm and is also used by the existing local Excel A1 row path. Its compiled C++/UBSan witness records pointer/value results for 24 boundary inputs. Public R1C1 parser tests consume those numeric witnesses with a zero row base, avoiding signed-overflow additions. The witness does not execute the complete native parser or sheet/external header. CALC689 documents the preserved sign-only relative-offset behavior.

The local values from upstream `testToggleRefFlag` are asserted at the real scalar parse/format owner. The complete ScRefFinder/editor test is not claimed executed. Related OOO/ODF coordinate regressions cover the existing supported value path; they do not certify the earlier regex-based OOO parser as a complete native parser. Qualified/external/name/error-token services and whole document import/export remain unfinished.

Chromium main and DOM-free Worker parse an R1C1 reference into the original `CellModel` address, pass that address into actual `ScDocumentImport`, then query the model referring to the imported document. This establishes the represented numeric path, not XLSX file or mounted UI acceptance. ScServiceProvider concrete factories, complete XModel/model factory, original address-conversion services and full filter/storage/UI orchestration remain required.

The new private helpers remain in the original `address.ts` counterpart, below the existing file-size limit. No artificial provider, test-only state setter, replacement header resolver, coverage exclusion or threshold change is introduced.
