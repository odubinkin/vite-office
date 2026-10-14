---
id: "202610140601-N2Q20N"
title: "Implement shared XML pull reader for Calc configuration schemas"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-14T06:05:17.442Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-14T06:44:12.308Z"
  updated_by: "CODER"
  note: "Passed Calc152 and XML33 source-absent tests/raw100; current16gates and inventory123/raw100; static/Calc0UI/exact3425hashes. Same-agent eval is not independent review; first failures retained and boundaries explicit."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-14T06:44:10.070Z"
  updated_by: "EVALUATOR"
  note: "Task110 source2693bff00e45 satisfies approved logical reader scope and explicit browser boundaries; all16 current gates pass."
  evaluated_sha: "2693bff00e45dc40a73c266fa9a9e9f7238ada1e"
  blueprint_digest: "11245beca0e13567fa4fc14acf3bae3cc6fc23935617169d522f288e784f6e5d"
  evidence_refs:
    - ".agentplane/tasks/202610140601-N2Q20N/README.md"
    - ".agentplane/tasks/202610140601-N2Q20N/quality/20261014-064410070-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610140601-N2Q20N/quality/20261014-064410070-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610140601-N2Q20N/quality/20261014-064410070-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610140601-N2Q20N/blueprint/resolved-snapshot.json"
    - "output/playwright/task110-checks/exact-review.json"
    - "output/playwright/task110-checks/original-source-review.json"
  findings:
    - "Exact3425 committed/current non-task hashes match, only28 planned paths changed. Actual source-absent Calc152tests/raw100 and XML33tests/8owners/raw100, actual static/Calc0UI and all4links restored. Original10source hashes reviewed; CALC094-096 preserved, native hex dead guard proven unreachable. First lint/docs/provenance failures and unrelated inventory fixture timeout retained, corrected without guard weakening; final inventory123pass/raw100. Same-agent separate evaluator phase is not independent review. Native OS/debug/UB/private visibility/ABI/fullQA and configuration/default/document/ODS integration remain excluded or pending."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-10-14T06:10:10.636Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-10-14T06:44:12.308Z"
    author: "CODER"
    state: "ok"
    note: "Passed Calc152 and XML33 source-absent tests/raw100; current16gates and inventory123/raw100; static/Calc0UI/exact3425hashes. Same-agent eval is not independent review; first failures retained and boundaries explicit."
doc_version: 3
doc_updated_at: "2026-10-14T06:44:12.433Z"
doc_updated_by: "CODER"
description: "Task110: full logical upstream xmlreader event/state/namespace/attribute/text/reference parser over actual Span/Pad and existing shared values, with browser supplied bytes and URL instead of native filesystem/mmap ownership. Preserve source quirks and record them; no SAX substitution or memory/provider library. Calc/affected raw100, static/Calc0UI/16serialgates. Next task111full thenpause."
sections:
  Summary: "Task110 implements the complete logical original xmlreader event/state/namespace/attribute/text/reference parser needed by real configmgr schema loading over actual Span/Pad/OUString/UNO values."
  Scope: "Seven runtime/header files xmlreader/source/xmlreader.ts, xmlreader.state.ts,xmlreader.lexical.ts,xmlreader.references.ts,xmlreader.tags.ts,xmlreader.text.ts and xmlreader/inc/xmlreader.ts; three tests for events/namespaces, text/attributes, errors/reference cases; fourteen runtime/provenance records, one shared capability and Calc core/GC/suspected issues docs. Twenty-eight planned non-task paths, no existing shared runtime changes. Original900line body is sharded by actual lexical/reference/tag/text scopes to honor500line cap. Helpers operate the actual Reader through an erased private-state type view, never a new state wrapper/fake provider. Browser constructor takes actual preloaded Uint8Array plus original URL instead of native synchronous open/mmap/close; event/namespace/output contracts retained. Native OS I/O errors/destruction/memory mapping/ABI/debug/invalid native ranges/postmutation pointers/private access excluded, host byte range failures use native DataView errors. No new allocator/pointer/refcount/library/cache or SAX substitute."
  Plan: "Port original private/public state defaults, Text/Result/state enums and namespace IDs, registrations incl legacy undeclared xsi compatibility, reverse prefix scope/shadowing, attributes iteration/output timing/normalization, tags/end/default namespaces/Done behavior, all three text modes/comments/PI/DTD/CDATA/name scanning/lineends/entities/numeric refs over real Span/Pad. Numeric file indices and native DataView/Uint8Array replace pointer/mmap syntax without a pointer or allocation engine; exact output Span fields and primitive tuple writes. Private-state view is an erased type over actual class fields with no runtime object duplication; actual byte owner copied on construction, URL copied. Omit native hex scalar overflow guard proven unreachable after digit0..15 and invalid sentinel break; retain source hex value overwrite/sentinel and release encoding outcome without inventing a correct accumulated hex value. Use native parseInt on single byte with exhaustive256byte proof vs original convertToHex. Preserve normalized CDATA prefix markup and nonnormalized attribute CR global-peek behavior; record CALC-094..096 with source-only release/debug boundaries. Preserve root Done/trailing-input and explicit empty namespace handling. No native UB/debug/memory experiment, C++ generator or compiled differential claim. Source-backed real Reader input streams and public event protocols exercise all meaningful cases/outputs/bytes/error classes; no fake reader/private-state forcing. WholeCalc and complete XML owner/header profile raw100 with existingSpanPad tests/native UTF8 proof, actual source-absent static/Calc0UI/four links restored/16serialgates/exacthashes/separate same-agent EVAL/DONE/clean. Goalactive until nexttask111full and relevantrepairs then requestedpause; no Writer-only repair."
  Verify Steps: |-
    1. Review complete original Reader header/body plus Span/Pad and actual SAL/o3tl helper scopes. Real public Reader tests over provided byte input verify defaults/enums/URL ownership/state/events/namespace registration and shadowing/default/legacyxsi/unknown/duplicate/empty URI/attribute iteration and both normalizations/all text modes/lineends/comments/PI/DTD/CDATA/references/all defined error messages/output timing/root Done. Single-byte native parseInt hex matches all256source char classes. Source-backed suspicioushex/CDATA/CR cases preserved; native redundant unreachable hex guard proof recorded. No private state forcing/fake reader/provider, native debug/UB/OS/ABI/postmutation pointer/compiled/fullQA outcome claim. Host preloaded-byte constructor and native DataView range errors are explicit browser boundaries, not fake OS results.
    2. Whole source-absent Calc coverage and complete all actual XML reader runtime/header files including unchanged Span/Pad/native UTF8 tests, rawS/B/F/L100/everycounterpositive. Pure types/header aggregates no executable counters. Unchanged SAL/cppu reused without remeasured-owner claims. Actual source-absent static/Calc0UI/four exact links restored; no Writer-only repair/full office before111.
    3. All16existing repository gates serial afterlastedit and currentintentionalformat; truthful source/runtime/capability/GC/suspected issue records, no source-routing/threshold weakening or private state/counter forcing. Retain failures before bounded corrections.
    4. Exact3400baseline/current/committed hashes and only28intentionalpaths, source/gate/coverage manifests sourceSHA-bound; separate same-agent EVAL not independent review, APverify/DONE/cleanbranchcalc. Goalactive until immediately following full111/relevantrepairs requestedpause.
  Verification: |-
    Passed actual source-absent wholeCalc152tests/raw100 and XML33tests/raw100 everycounterpositive; actual static/Calc0UI/all4exactlinksrestored; all16current repository gates including inventory123tests/raw100; exact3425source hashes/source2693bff00e45 and28intentionalpaths; same-agent separate evaluator pass, native/source scope limits retained. See output/playwright/task110-checks/exact-review.json, value-coverage-audit.json, gates-results.json and first-gates preserved failures. Full111 next then requestedpause.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-14T06:44:12.308Z — VERIFY — ok

    By: CODER

    Note: Passed Calc152 and XML33 source-absent tests/raw100; current16gates and inventory123/raw100; static/Calc0UI/exact3425hashes. Same-agent eval is not independent review; first failures retained and boundaries explicit.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-14T06:44:11.380Z, excerpt_hash=sha256:4067c4827a46d01f14cebf6b8dc970e8ad447c3ebad1b4560e95035490b259d6

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610140601-N2Q20N/blueprint/resolved-snapshot.json
    - old_digest: 11245beca0e13567fa4fc14acf3bae3cc6fc23935617169d522f288e784f6e5d
    - current_digest: 11245beca0e13567fa4fc14acf3bae3cc6fc23935617169d522f288e784f6e5d
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610140601-N2Q20N

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610140601-N2Q20N -m 🧩 N2Q20N task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Finally restore four exact source links on every test exit. Revert only intentional task changes via a new task if necessary; no branch merge/history rewrite/unrelated work changes."
  Findings: |-
    Command: node output/playwright/task110-checks/portable.mjs; --shared-only and --checks-only after JSDoc/explicit-return corrections. Result: pass. Evidence: Calc152tests/52files/32owners S4006 B2654 F787 L3570; XML33tests/4files/8owners S563 B280 F54 L504; all raw counters positive and S/B/F/L100. Actual static and Calc0UI pass, all4reference links absent during runs and exactly restored. Scope: complete Calc and all XMLreader runtime/header owners; unchanged SAL/cppu reused without owner coverage claim.

    Command: node output/playwright/task110-checks/gates.mjs. Result: pass,16/16 current gates. Inventory123tests/38files S1734 B1292 F436 L1668 raw100; tooling38tests/10files; all routing/doctor/registry/provenance/static code gates pass. First full gate failures retained under first-gates; Initial app typecheck TS6133 for private fields used only by helper shards; fields are protected for erased implementation access with native private visibility parity excluded. Initial test creation used incorrect cwd and wrote no tests; corrected root cwd. First reader test attempt:9/10reader tests passed, last-colon declaration expected namespace1 incorrectly; source uses last colon for attribute too, so xmlns:a:b is ordinary attribute and lookup remains unknown. Corrected expectation to-1 without runtime change. First16gates: format/typecheck/size/dependencies/Writerresources/tree/routing/doctor/diff/tooling passed; lint failed missing state JSDoc, never-throw switch terminal recognition and owned scratch probe JSDoc; docs failed state/callback JSDoc. Added descriptive docs and return fail to terminal throw branches, deleted own ignored scratch; focused lint/docs passed. Provenance/registry/invariants initially failed missing filenameDivergence for five original reader shards. Added responsibility-split explanation inside the existing five planned provenance records; no scope expansion or guard weakening. First inventory123test run had121pass/2fail: one30000msCppunit filesystem-fixture timeout and same missing filenameDivergence registry failure. Preserved all first logs/results in first-gates; no timeout/threshold/test assertions/source-routing change. Current-source affected profile and actual static/Calc0UI rechecked after comments/explicit return fail; all pass. Existing Calc runtime32owners unchanged from actual wholeCalc run; no repeat needed for XML-only corrections.

    Command: python3 output/playwright/task110-checks/exact-review.py. Result: pass. Evidence: source2693bff00e45dc40a73c266fa9a9e9f7238ada1e,3400baseline hashes,3425current/committed exact hashes,3changed25added=28planned paths,10original source hashes. No native compilation/network/Cppgenerator/sanitizer/memory experiments. Scope: approved logical shared reader; native I/O/debug/UB/private visibility/ABI/postmutation pointers/fullQA excluded, real config/Calc defaults/document/grid/ODS pending. Same-agent EVALUATOR separate phase passed but is not independent review. Goal remains active until immediately following full111 and relevant repairs, then requested pause; no Writer-only repair.
id_source: "generated"
---
## Summary

Task110 implements the complete logical original xmlreader event/state/namespace/attribute/text/reference parser needed by real configmgr schema loading over actual Span/Pad/OUString/UNO values.

## Scope

Seven runtime/header files xmlreader/source/xmlreader.ts, xmlreader.state.ts,xmlreader.lexical.ts,xmlreader.references.ts,xmlreader.tags.ts,xmlreader.text.ts and xmlreader/inc/xmlreader.ts; three tests for events/namespaces, text/attributes, errors/reference cases; fourteen runtime/provenance records, one shared capability and Calc core/GC/suspected issues docs. Twenty-eight planned non-task paths, no existing shared runtime changes. Original900line body is sharded by actual lexical/reference/tag/text scopes to honor500line cap. Helpers operate the actual Reader through an erased private-state type view, never a new state wrapper/fake provider. Browser constructor takes actual preloaded Uint8Array plus original URL instead of native synchronous open/mmap/close; event/namespace/output contracts retained. Native OS I/O errors/destruction/memory mapping/ABI/debug/invalid native ranges/postmutation pointers/private access excluded, host byte range failures use native DataView errors. No new allocator/pointer/refcount/library/cache or SAX substitute.

## Plan

Port original private/public state defaults, Text/Result/state enums and namespace IDs, registrations incl legacy undeclared xsi compatibility, reverse prefix scope/shadowing, attributes iteration/output timing/normalization, tags/end/default namespaces/Done behavior, all three text modes/comments/PI/DTD/CDATA/name scanning/lineends/entities/numeric refs over real Span/Pad. Numeric file indices and native DataView/Uint8Array replace pointer/mmap syntax without a pointer or allocation engine; exact output Span fields and primitive tuple writes. Private-state view is an erased type over actual class fields with no runtime object duplication; actual byte owner copied on construction, URL copied. Omit native hex scalar overflow guard proven unreachable after digit0..15 and invalid sentinel break; retain source hex value overwrite/sentinel and release encoding outcome without inventing a correct accumulated hex value. Use native parseInt on single byte with exhaustive256byte proof vs original convertToHex. Preserve normalized CDATA prefix markup and nonnormalized attribute CR global-peek behavior; record CALC-094..096 with source-only release/debug boundaries. Preserve root Done/trailing-input and explicit empty namespace handling. No native UB/debug/memory experiment, C++ generator or compiled differential claim. Source-backed real Reader input streams and public event protocols exercise all meaningful cases/outputs/bytes/error classes; no fake reader/private-state forcing. WholeCalc and complete XML owner/header profile raw100 with existingSpanPad tests/native UTF8 proof, actual source-absent static/Calc0UI/four links restored/16serialgates/exacthashes/separate same-agent EVAL/DONE/clean. Goalactive until nexttask111full and relevantrepairs then requestedpause; no Writer-only repair.

## Verify Steps

1. Review complete original Reader header/body plus Span/Pad and actual SAL/o3tl helper scopes. Real public Reader tests over provided byte input verify defaults/enums/URL ownership/state/events/namespace registration and shadowing/default/legacyxsi/unknown/duplicate/empty URI/attribute iteration and both normalizations/all text modes/lineends/comments/PI/DTD/CDATA/references/all defined error messages/output timing/root Done. Single-byte native parseInt hex matches all256source char classes. Source-backed suspicioushex/CDATA/CR cases preserved; native redundant unreachable hex guard proof recorded. No private state forcing/fake reader/provider, native debug/UB/OS/ABI/postmutation pointer/compiled/fullQA outcome claim. Host preloaded-byte constructor and native DataView range errors are explicit browser boundaries, not fake OS results.
2. Whole source-absent Calc coverage and complete all actual XML reader runtime/header files including unchanged Span/Pad/native UTF8 tests, rawS/B/F/L100/everycounterpositive. Pure types/header aggregates no executable counters. Unchanged SAL/cppu reused without remeasured-owner claims. Actual source-absent static/Calc0UI/four exact links restored; no Writer-only repair/full office before111.
3. All16existing repository gates serial afterlastedit and currentintentionalformat; truthful source/runtime/capability/GC/suspected issue records, no source-routing/threshold weakening or private state/counter forcing. Retain failures before bounded corrections.
4. Exact3400baseline/current/committed hashes and only28intentionalpaths, source/gate/coverage manifests sourceSHA-bound; separate same-agent EVAL not independent review, APverify/DONE/cleanbranchcalc. Goalactive until immediately following full111/relevantrepairs requestedpause.

## Verification

Passed actual source-absent wholeCalc152tests/raw100 and XML33tests/raw100 everycounterpositive; actual static/Calc0UI/all4exactlinksrestored; all16current repository gates including inventory123tests/raw100; exact3425source hashes/source2693bff00e45 and28intentionalpaths; same-agent separate evaluator pass, native/source scope limits retained. See output/playwright/task110-checks/exact-review.json, value-coverage-audit.json, gates-results.json and first-gates preserved failures. Full111 next then requestedpause.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-14T06:44:12.308Z — VERIFY — ok

By: CODER

Note: Passed Calc152 and XML33 source-absent tests/raw100; current16gates and inventory123/raw100; static/Calc0UI/exact3425hashes. Same-agent eval is not independent review; first failures retained and boundaries explicit.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-14T06:44:11.380Z, excerpt_hash=sha256:4067c4827a46d01f14cebf6b8dc970e8ad447c3ebad1b4560e95035490b259d6

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610140601-N2Q20N/blueprint/resolved-snapshot.json
- old_digest: 11245beca0e13567fa4fc14acf3bae3cc6fc23935617169d522f288e784f6e5d
- current_digest: 11245beca0e13567fa4fc14acf3bae3cc6fc23935617169d522f288e784f6e5d
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610140601-N2Q20N

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610140601-N2Q20N -m 🧩 N2Q20N task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Finally restore four exact source links on every test exit. Revert only intentional task changes via a new task if necessary; no branch merge/history rewrite/unrelated work changes.

## Findings

Command: node output/playwright/task110-checks/portable.mjs; --shared-only and --checks-only after JSDoc/explicit-return corrections. Result: pass. Evidence: Calc152tests/52files/32owners S4006 B2654 F787 L3570; XML33tests/4files/8owners S563 B280 F54 L504; all raw counters positive and S/B/F/L100. Actual static and Calc0UI pass, all4reference links absent during runs and exactly restored. Scope: complete Calc and all XMLreader runtime/header owners; unchanged SAL/cppu reused without owner coverage claim.

Command: node output/playwright/task110-checks/gates.mjs. Result: pass,16/16 current gates. Inventory123tests/38files S1734 B1292 F436 L1668 raw100; tooling38tests/10files; all routing/doctor/registry/provenance/static code gates pass. First full gate failures retained under first-gates; Initial app typecheck TS6133 for private fields used only by helper shards; fields are protected for erased implementation access with native private visibility parity excluded. Initial test creation used incorrect cwd and wrote no tests; corrected root cwd. First reader test attempt:9/10reader tests passed, last-colon declaration expected namespace1 incorrectly; source uses last colon for attribute too, so xmlns:a:b is ordinary attribute and lookup remains unknown. Corrected expectation to-1 without runtime change. First16gates: format/typecheck/size/dependencies/Writerresources/tree/routing/doctor/diff/tooling passed; lint failed missing state JSDoc, never-throw switch terminal recognition and owned scratch probe JSDoc; docs failed state/callback JSDoc. Added descriptive docs and return fail to terminal throw branches, deleted own ignored scratch; focused lint/docs passed. Provenance/registry/invariants initially failed missing filenameDivergence for five original reader shards. Added responsibility-split explanation inside the existing five planned provenance records; no scope expansion or guard weakening. First inventory123test run had121pass/2fail: one30000msCppunit filesystem-fixture timeout and same missing filenameDivergence registry failure. Preserved all first logs/results in first-gates; no timeout/threshold/test assertions/source-routing change. Current-source affected profile and actual static/Calc0UI rechecked after comments/explicit return fail; all pass. Existing Calc runtime32owners unchanged from actual wholeCalc run; no repeat needed for XML-only corrections.

Command: python3 output/playwright/task110-checks/exact-review.py. Result: pass. Evidence: source2693bff00e45dc40a73c266fa9a9e9f7238ada1e,3400baseline hashes,3425current/committed exact hashes,3changed25added=28planned paths,10original source hashes. No native compilation/network/Cppgenerator/sanitizer/memory experiments. Scope: approved logical shared reader; native I/O/debug/UB/private visibility/ABI/postmutation pointers/fullQA excluded, real config/Calc defaults/document/grid/ODS pending. Same-agent EVALUATOR separate phase passed but is not independent review. Goal remains active until immediately following full111 and relevant repairs, then requested pause; no Writer-only repair.
