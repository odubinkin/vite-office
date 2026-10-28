---
id: "202610281658-B8TCAE"
title: "Close integrated runtime coverage gaps without changing upstream behavior"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 20
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-28T16:59:07.481Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Close the user-approved integrated runtime coverage gaps while preserving upstream behavior and strict verification gates."
events:
  -
    type: "status"
    at: "2026-10-28T16:59:17.464Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Close the user-approved integrated runtime coverage gaps while preserving upstream behavior and strict verification gates."
doc_version: 3
doc_updated_at: "2026-10-28T20:12:49.965Z"
doc_updated_by: "CODER"
description: "User explicitly approved expanding the integration work to100 percent coverage, with individually reviewed unreachable branches. Add meaningful source-backed regression tests for the255-file diagnostic gap set, repair actual bugs from evidence, preserve coverage thresholds and native contracts, record suspected upstream issues, and validate current-code full coverage before unblocking the integration publication task."
sections:
  Summary: "Close the full integration coverage gaps before publication. On2026-10-28 (Asia/Bangkok), the user explicitly chose100 percent coverage and separate review of unreachable branches."
  Scope: "The255-file diagnostic gap set from integration task581KM2, meaningful tests and evidence-backed bug repairs across ICU/calendars, formatting, Writer and remaining runtime owners. Preserve upstream contracts,100 percent thresholds and test discovery. Suspected native defects go into the named Writer/Calc journals. No automatic exclusions or acceptance of unreachable branches."
  Plan: "Execute the user-approved full coverage expansion across the255-file gap set using actual-owner source-backed tests, individual unreachable-branch review, unchanged strict gates and final complete verification."
  Verify Steps: |-
    1. Run targeted Vitest/Istanbul profiles for changed runtime owners and meaningful regression cases; retain raw counters and report any unresolved source-domain branches.
    2. Keep coverage thresholds and discovery unchanged; obtain explicit user decision before any unreachable-branch exception.
    3. Run npm run verify on final code, plus ap doctor and policy routing; record exact results. No broad success claim from a narrowed profile.
  Verification: "In progress; final complete verifier still required. Current source:9 ICU suites70 grouped tests pass, replaying69989 original native observations plus real owner lifecycle tests. Source/archives/witness hashes are in portable fixtures; no native build is needed for ordinary replay. OOX utility and3 full stream owners pass strict100 (177/177 statements,81/81 branch arms,33/33 functions,164/164 lines) across10 tests, including102 unchanged-template C++20 observations. Source provenance1862 modules,deps1861sources/10030imports,full typecheck,changed-file lint,JSDoc4159files,size,discovery,invariants/parity pass. Earlier fixture omitted RuleBasedTimeZone.complete and was corrected from native precondition. Generated witness/build artifacts are under ignored test-results/native; existing Calc native output was read only. Same-map baseline+ICU aggregation is diagnostic,not a final current-code global certificate; remaining runtime coverage gaps still prevent publication."
  Rollback Plan: "Keep test and source changes in traceable commits. Revert a faulty change through a new commit; never rewrite published history. Preserve existing Calc untracked output."
  Findings: |-
    The BinaryInputStream smaller remaining-count arm is theoretically reachable after281474976710655 full32768-byte reads; EOF before that terminates the loop. No exception has been approved. User asked for explanation and explicitly chose to expand coverage work. Integration task202610281559-581KM2 awaits this deliverable.

    - Observation: Portable native fixture replay now covers69989 original ICU observations:8666 standard calendar,21664 protected-hook,16302 EraRules,5312 rule-based timezone,2445 cache and15600 Calendar factory cases. Nine current suites70 grouped tests pass. Native source/archive/witness hashes are retained. Additional direct cases use actual SharedObject/CalendarCache/astronomer owners. A fixture initially omitted RuleBasedTimeZone.complete; fixed from original rbtz.h precondition, without changing core behavior.
      Impact: Same-map raw coverage aggregation with the initial baseline closes1654 statements and257 functions before OOX restoration; broad global100 remains incomplete. Initial raw baseline includes prior integration source changes, so this is diagnostic progress rather than a final-current-code certificate.
      Resolution: Continue remaining runtime gap closure. Preserve unchanged thresholds/source contracts and individually review genuinely unreachable branches; no exceptions approved.

    - Observation: The original OOX copy loop calls getLimitedValue<sal_Int32,sal_Int64> from helper.hxx; the prior port had flattened that original helper into copy/seek conditionals. Exact unchanged-template C++20 observations cover102 signed64/clamp/signed32 boundaries.
      Impact: The theoretical final stream request still needs281474976710655 full reads, but the original shared utility exposes its boundary cases directly. This source-owner restoration eliminates the need to waive that helper comparison while leaving the original loop bound and transport order unchanged.
      Resolution: Restore the actual header owner and source call sites, not a new test seam. Current helper plus three full stream owners pass strict100:177/177 statements,81/81 branch arms,33/33 functions,164/164 lines across10 tests. Runtime provenance1862 modules, dependency boundaries and typecheck pass. Update native-binary-streams documentation; remaining project coverage gaps still require work.

    - Observation: Public scanner conversion tests expose original incomplete-date trailing separator TODO; German TT.MM. becomes English MM/DD/.
      Impact: New CALC-385 documents source-level suspected upstream behavior without altering scanner contracts; targeted conversion coverage remains in progress.
      Resolution: Retain original output and independently specified regression expectations; continue strict coverage expansion.

    - Observation: Incremental source-backed regression suites now add29484 scanner/color native rows,23 actual locale conversions,2226 LibreOffice temporal native rows,28 ICU checked month-normalization rows and27 public date-input cases.
      Impact: Assertions pass; partial coverage profiles still correctly fail mandatory global100. No coverage exclusions or thresholds changed. CALC-385 records original trailing-separator TODO.
      Resolution: Retain exact-source map diagnostic merging and final full-current-code verification requirement; continue remaining gaps and await individual EraRules exception decision.

    - Observation: Original host parser6110 native observations plus existing URL tests pass202 tests with strict100% for urlobj.host.ts. Original format locale182059 comparisons/17804 portable rows plus existing value and real checked-boundary tests pass26 tests at strict100% for zformat.locale.ts and zformat.locale-calendar.ts.
      Impact: Three more runtime owners reach all required coverage metrics without runtime changes or exclusions. Native scalar-context scope and the distinction between TS assertion Error and native assertion abort are explicit.
      Resolution: Preserve independent native fixtures/provenance; continue remaining whole-project coverage work. Final full verifier and Git publication/backmerges remain pending.

    - Observation: New genuine HTML block regressions exposed an existing missing Sender materialization path. Pinned upstream DocumentStylePoolManager.cxx1005 specifies all-script italic in HTML,3pt lower spacing outside HTML and disabled line counting in both. The port now admits that internal style and applies those defaults.
      Impact: ADDRESS imports and Worker snapshot roundtrips now pass. Real CJK/CTL native bold was already preserved; the initial broad assertion had incorrectly used the Western-only browser projection as its oracle. Correct source-item assertions pass without changing native script logic.
      Resolution: Six Writer suites106 tests pass, with strict100 coverage for both changed pool/style owners. Add source provenance and retain full final verification requirement; no upstream issue is inferred from this local missing implementation.

    - Observation: Additional actual byte-stream parser interruption tests invoke the original NextToken handler before a derived virtual consumer aborts. Live nested inline owners and both initial HTML_MODE states are verified during SourceDispose.
      Impact: All6 Writer suites108 assertions pass. The broader HTML+style coverage profile still fails the configured100% threshold for remaining HTML paths; the separate strict100% profile for2 changed style owners remains valid.
      Resolution: Record raw profile and exact scope, keep all coverage policy unchanged, and continue remaining gaps. No parser state, resource counter, original handler return or expected native value is fabricated.

    - Observation: Pinned swhtml.cxx1499..1524 shares PRE LINEBREAK with NEWPARA by fallthrough. The port had duplicated that body and retained an always-true NEWPARA-only condition; it also inserted raw TABCHAR through a case absent in original SwHTMLParser.
      Impact: Restore the shared body through grouped TypeScript cases while keeping compiler fallthrough enforcement. Remove the unsourced raw TAB callback path; real PRE tabs still expand through original HTMLParser FilterPRE. New actual-byte and context-owner regressions pass119 assertions across7 suites.
      Resolution: Preserve source token behavior and all coverage policy. Retain current raw maps, treat prior HTML coverage as historical, and continue remaining gaps; this is a local port-structure correction, not a suspected upstream bug or a coverage exception.

    - Observation: Original ICU witness now compares22892 protected-hook inputs, including324 consistent-time/base-cache field snapshots,864 large-month cycle cases and12 Hebrew checked cycle/year errors in addition to the28 prior checked normalization cases.
      Impact: All9 ICU suites70 grouped assertions pass against71217 independent native rows in total. Protected field calls use real public preparation and incoming error/warning status; no original method or private state is replaced.
      Resolution: Retain current raw profile and source hashes. ICU runtime code and coverage policy are unchanged; strict whole-project coverage, individual unreachable-branch review and final Git publication/sync remain pending.

    - Observation: Two individual coverage candidates are recorded with proof in unreachable-coverage-candidates.json: U01 hasEnd always true in original EraRules; U02 missing LC_INFO identity is impossible for the fixed284-key generated catalogs, whose key sets and hashes were checked.
      Impact: Both decisions remain pending. Runtime guards, thresholds, counters and exclusions are unchanged; static artifact corruption is distinguished from an admitted runtime input.
      Resolution: Request explicit individual user approval only for the stated alternatives; continue other reachable coverage work independently.

    - Observation: Three real200000-unit Locale field cases reproduced RangeError in the local argument-spread text conversion, including ignored non-qlt Variant. Reusing the existing counted UTF16 projection fixes the local binding while preserving all original units and lookup fallback.
      Impact: Ten calendar/locale suites48 tests pass; all original wrapper/service/field functions in the profile are executed. Actual FormatElement Sequence copies retain strings after temporary destruction and a copied General value retains its real refcount1 after Sequence destruction (6 focused ownership tests pass).
      Resolution: Record bounded integration/provenance and current maps, keep all coverage thresholds/exclusions unchanged, and request U02 separately for the remaining fixed-catalog identity failure alternative. No suspected upstream bug is inferred from this JavaScript binding failure.

    - Observation: B8TCAE adds86 normal-constructor prefix/condition/locale tests,34 actual RTL assembly/comparison tests,2 rich-text release tests and3 automatic-input admission/formula tests. Final focused constructor2files91tests, RTL27files173tests, Calc data90files394tests and document import2files11tests pass their assertions; raw diagnostic report hashes and unchanged thresholds are retained.
      Impact: These profiles close actual legal runtime paths without source mutation, manufactured provider returns, private-field writes, exclusions or coverage-counter edits. Constructor remaining guards include source fixed-state/EOF/locale alternatives and require further audit; narrow coverage failures remain failures. Cached calendar timezone failure reuse is documented as conditional source evidence in CALC-386; no normal unknown-zone failure is claimed.
      Resolution: Continue remaining full100 coverage work and individual unreachable-branch reviews. U01/U02 remain pending, main publication/reverse merges and final full verifier are still outstanding.

    - Observation: The previous RTL port flattened the original raw-span replacement into its owning overload, leaving a full-range raw branch inaccessible and omitting its C entry point. B8TCAE restores the original overload boundary and rtl_uString_newReplaceStrAtUtf16L. Unchanged original C++ regeneration/check and portable replay agree on2304 complete initialized value/terminator/sharing/refcount observations, including acquired destination aliases.
      Impact: The raw replacement full-range/append cases now execute through the original public API, without an exception or artificial test seam. Current28 RTL suites176tests and focused3suites42tests pass. Broad partial coverage still fails100; historical strtmpl/ustring maps must not be merged with these current owners.
      Resolution: Preserve source/C wrapper contracts and native scope limitations. Continue actual remaining coverage and pending individual U01/U02 decisions; no full-project success or publication is recorded.
id_source: "generated"
---
## Summary

Close the full integration coverage gaps before publication. On2026-10-28 (Asia/Bangkok), the user explicitly chose100 percent coverage and separate review of unreachable branches.

## Scope

The255-file diagnostic gap set from integration task581KM2, meaningful tests and evidence-backed bug repairs across ICU/calendars, formatting, Writer and remaining runtime owners. Preserve upstream contracts,100 percent thresholds and test discovery. Suspected native defects go into the named Writer/Calc journals. No automatic exclusions or acceptance of unreachable branches.

## Plan

Execute the user-approved full coverage expansion across the255-file gap set using actual-owner source-backed tests, individual unreachable-branch review, unchanged strict gates and final complete verification.

## Verify Steps

1. Run targeted Vitest/Istanbul profiles for changed runtime owners and meaningful regression cases; retain raw counters and report any unresolved source-domain branches.
2. Keep coverage thresholds and discovery unchanged; obtain explicit user decision before any unreachable-branch exception.
3. Run npm run verify on final code, plus ap doctor and policy routing; record exact results. No broad success claim from a narrowed profile.

## Verification

In progress; final complete verifier still required. Current source:9 ICU suites70 grouped tests pass, replaying69989 original native observations plus real owner lifecycle tests. Source/archives/witness hashes are in portable fixtures; no native build is needed for ordinary replay. OOX utility and3 full stream owners pass strict100 (177/177 statements,81/81 branch arms,33/33 functions,164/164 lines) across10 tests, including102 unchanged-template C++20 observations. Source provenance1862 modules,deps1861sources/10030imports,full typecheck,changed-file lint,JSDoc4159files,size,discovery,invariants/parity pass. Earlier fixture omitted RuleBasedTimeZone.complete and was corrected from native precondition. Generated witness/build artifacts are under ignored test-results/native; existing Calc native output was read only. Same-map baseline+ICU aggregation is diagnostic,not a final current-code global certificate; remaining runtime coverage gaps still prevent publication.

## Rollback Plan

Keep test and source changes in traceable commits. Revert a faulty change through a new commit; never rewrite published history. Preserve existing Calc untracked output.

## Findings

The BinaryInputStream smaller remaining-count arm is theoretically reachable after281474976710655 full32768-byte reads; EOF before that terminates the loop. No exception has been approved. User asked for explanation and explicitly chose to expand coverage work. Integration task202610281559-581KM2 awaits this deliverable.

- Observation: Portable native fixture replay now covers69989 original ICU observations:8666 standard calendar,21664 protected-hook,16302 EraRules,5312 rule-based timezone,2445 cache and15600 Calendar factory cases. Nine current suites70 grouped tests pass. Native source/archive/witness hashes are retained. Additional direct cases use actual SharedObject/CalendarCache/astronomer owners. A fixture initially omitted RuleBasedTimeZone.complete; fixed from original rbtz.h precondition, without changing core behavior.
  Impact: Same-map raw coverage aggregation with the initial baseline closes1654 statements and257 functions before OOX restoration; broad global100 remains incomplete. Initial raw baseline includes prior integration source changes, so this is diagnostic progress rather than a final-current-code certificate.
  Resolution: Continue remaining runtime gap closure. Preserve unchanged thresholds/source contracts and individually review genuinely unreachable branches; no exceptions approved.

- Observation: The original OOX copy loop calls getLimitedValue<sal_Int32,sal_Int64> from helper.hxx; the prior port had flattened that original helper into copy/seek conditionals. Exact unchanged-template C++20 observations cover102 signed64/clamp/signed32 boundaries.
  Impact: The theoretical final stream request still needs281474976710655 full reads, but the original shared utility exposes its boundary cases directly. This source-owner restoration eliminates the need to waive that helper comparison while leaving the original loop bound and transport order unchanged.
  Resolution: Restore the actual header owner and source call sites, not a new test seam. Current helper plus three full stream owners pass strict100:177/177 statements,81/81 branch arms,33/33 functions,164/164 lines across10 tests. Runtime provenance1862 modules, dependency boundaries and typecheck pass. Update native-binary-streams documentation; remaining project coverage gaps still require work.

- Observation: Public scanner conversion tests expose original incomplete-date trailing separator TODO; German TT.MM. becomes English MM/DD/.
  Impact: New CALC-385 documents source-level suspected upstream behavior without altering scanner contracts; targeted conversion coverage remains in progress.
  Resolution: Retain original output and independently specified regression expectations; continue strict coverage expansion.

- Observation: Incremental source-backed regression suites now add29484 scanner/color native rows,23 actual locale conversions,2226 LibreOffice temporal native rows,28 ICU checked month-normalization rows and27 public date-input cases.
  Impact: Assertions pass; partial coverage profiles still correctly fail mandatory global100. No coverage exclusions or thresholds changed. CALC-385 records original trailing-separator TODO.
  Resolution: Retain exact-source map diagnostic merging and final full-current-code verification requirement; continue remaining gaps and await individual EraRules exception decision.

- Observation: Original host parser6110 native observations plus existing URL tests pass202 tests with strict100% for urlobj.host.ts. Original format locale182059 comparisons/17804 portable rows plus existing value and real checked-boundary tests pass26 tests at strict100% for zformat.locale.ts and zformat.locale-calendar.ts.
  Impact: Three more runtime owners reach all required coverage metrics without runtime changes or exclusions. Native scalar-context scope and the distinction between TS assertion Error and native assertion abort are explicit.
  Resolution: Preserve independent native fixtures/provenance; continue remaining whole-project coverage work. Final full verifier and Git publication/backmerges remain pending.

- Observation: New genuine HTML block regressions exposed an existing missing Sender materialization path. Pinned upstream DocumentStylePoolManager.cxx1005 specifies all-script italic in HTML,3pt lower spacing outside HTML and disabled line counting in both. The port now admits that internal style and applies those defaults.
  Impact: ADDRESS imports and Worker snapshot roundtrips now pass. Real CJK/CTL native bold was already preserved; the initial broad assertion had incorrectly used the Western-only browser projection as its oracle. Correct source-item assertions pass without changing native script logic.
  Resolution: Six Writer suites106 tests pass, with strict100 coverage for both changed pool/style owners. Add source provenance and retain full final verification requirement; no upstream issue is inferred from this local missing implementation.

- Observation: Additional actual byte-stream parser interruption tests invoke the original NextToken handler before a derived virtual consumer aborts. Live nested inline owners and both initial HTML_MODE states are verified during SourceDispose.
  Impact: All6 Writer suites108 assertions pass. The broader HTML+style coverage profile still fails the configured100% threshold for remaining HTML paths; the separate strict100% profile for2 changed style owners remains valid.
  Resolution: Record raw profile and exact scope, keep all coverage policy unchanged, and continue remaining gaps. No parser state, resource counter, original handler return or expected native value is fabricated.

- Observation: Pinned swhtml.cxx1499..1524 shares PRE LINEBREAK with NEWPARA by fallthrough. The port had duplicated that body and retained an always-true NEWPARA-only condition; it also inserted raw TABCHAR through a case absent in original SwHTMLParser.
  Impact: Restore the shared body through grouped TypeScript cases while keeping compiler fallthrough enforcement. Remove the unsourced raw TAB callback path; real PRE tabs still expand through original HTMLParser FilterPRE. New actual-byte and context-owner regressions pass119 assertions across7 suites.
  Resolution: Preserve source token behavior and all coverage policy. Retain current raw maps, treat prior HTML coverage as historical, and continue remaining gaps; this is a local port-structure correction, not a suspected upstream bug or a coverage exception.

- Observation: Original ICU witness now compares22892 protected-hook inputs, including324 consistent-time/base-cache field snapshots,864 large-month cycle cases and12 Hebrew checked cycle/year errors in addition to the28 prior checked normalization cases.
  Impact: All9 ICU suites70 grouped assertions pass against71217 independent native rows in total. Protected field calls use real public preparation and incoming error/warning status; no original method or private state is replaced.
  Resolution: Retain current raw profile and source hashes. ICU runtime code and coverage policy are unchanged; strict whole-project coverage, individual unreachable-branch review and final Git publication/sync remain pending.

- Observation: Two individual coverage candidates are recorded with proof in unreachable-coverage-candidates.json: U01 hasEnd always true in original EraRules; U02 missing LC_INFO identity is impossible for the fixed284-key generated catalogs, whose key sets and hashes were checked.
  Impact: Both decisions remain pending. Runtime guards, thresholds, counters and exclusions are unchanged; static artifact corruption is distinguished from an admitted runtime input.
  Resolution: Request explicit individual user approval only for the stated alternatives; continue other reachable coverage work independently.

- Observation: Three real200000-unit Locale field cases reproduced RangeError in the local argument-spread text conversion, including ignored non-qlt Variant. Reusing the existing counted UTF16 projection fixes the local binding while preserving all original units and lookup fallback.
  Impact: Ten calendar/locale suites48 tests pass; all original wrapper/service/field functions in the profile are executed. Actual FormatElement Sequence copies retain strings after temporary destruction and a copied General value retains its real refcount1 after Sequence destruction (6 focused ownership tests pass).
  Resolution: Record bounded integration/provenance and current maps, keep all coverage thresholds/exclusions unchanged, and request U02 separately for the remaining fixed-catalog identity failure alternative. No suspected upstream bug is inferred from this JavaScript binding failure.

- Observation: B8TCAE adds86 normal-constructor prefix/condition/locale tests,34 actual RTL assembly/comparison tests,2 rich-text release tests and3 automatic-input admission/formula tests. Final focused constructor2files91tests, RTL27files173tests, Calc data90files394tests and document import2files11tests pass their assertions; raw diagnostic report hashes and unchanged thresholds are retained.
  Impact: These profiles close actual legal runtime paths without source mutation, manufactured provider returns, private-field writes, exclusions or coverage-counter edits. Constructor remaining guards include source fixed-state/EOF/locale alternatives and require further audit; narrow coverage failures remain failures. Cached calendar timezone failure reuse is documented as conditional source evidence in CALC-386; no normal unknown-zone failure is claimed.
  Resolution: Continue remaining full100 coverage work and individual unreachable-branch reviews. U01/U02 remain pending, main publication/reverse merges and final full verifier are still outstanding.

- Observation: The previous RTL port flattened the original raw-span replacement into its owning overload, leaving a full-range raw branch inaccessible and omitting its C entry point. B8TCAE restores the original overload boundary and rtl_uString_newReplaceStrAtUtf16L. Unchanged original C++ regeneration/check and portable replay agree on2304 complete initialized value/terminator/sharing/refcount observations, including acquired destination aliases.
  Impact: The raw replacement full-range/append cases now execute through the original public API, without an exception or artificial test seam. Current28 RTL suites176tests and focused3suites42tests pass. Broad partial coverage still fails100; historical strtmpl/ustring maps must not be merged with these current owners.
  Resolution: Preserve source/C wrapper contracts and native scope limitations. Continue actual remaining coverage and pending individual U01/U02 decisions; no full-project success or publication is recorded.
