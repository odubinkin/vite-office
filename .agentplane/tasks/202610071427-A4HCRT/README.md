---
id: "202610071427-A4HCRT"
title: "Restore native list-level marking and descendant notification owners"
result_summary: "Restored SwList marked depth, SwNumberTree root/depth dispatch, SwDoc delegation and SwTextNode marked-label query; shell repaint leaves serialized content generation and modified state unchanged. All586 prior acceptance and298 metadata states/defaults/exceptions preserved. Exact same-agent evaluation passes at implementation SHA; cursor/view shading/ruler wiring remains follow-up."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 23
origin:
  system: "manual"
depends_on: []
tags:
  - "parity"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-07T14:46:14.966Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-07T14:53:21.619Z"
  updated_by: "CODER"
  note: "Native list marking and render invalidation verified at implementation 26cf7851bcef7db761ea51798a9247de8b68a7ae:13551app110inventory14infra278Chrome,zero uncaught/unresolved/passing replay,actual100app/inventory;8paths586prior acceptance byte-identical298metadata retained. Same-agent exact evaluation pass,explicitly not independent; whole parity ACTIVE."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-07T14:52:48.288Z"
  updated_by: "EVALUATOR"
  note: "Same current agent, explicitly not independent: implementation 26cf7851bcef7db761ea51798a9247de8b68a7ae reconstructed and audited; native list marking and render invalidation verified."
  evaluated_sha: "26cf7851bcef7db761ea51798a9247de8b68a7ae"
  blueprint_digest: "609a3d9f356f174ef014a75dd6c03776917223f496d811d52fa6eaaa8b7fc37b"
  evidence_refs:
    - ".agentplane/tasks/202610071427-A4HCRT/README.md"
    - ".agentplane/tasks/202610071427-A4HCRT/quality/20261007-145248288-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610071427-A4HCRT/quality/20261007-145248288-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610071427-A4HCRT/quality/20261007-145248288-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610071427-A4HCRT/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610071427-A4HCRT/evidence/exact-sha-review.json"
    - ".agentplane/tasks/202610071427-A4HCRT/evidence/source-review.json"
    - ".agentplane/tasks/202610071427-A4HCRT/evidence/final-coverage.json"
    - ".agentplane/tasks/202610071427-A4HCRT/evidence/case-census.json"
    - ".agentplane/tasks/202610071427-A4HCRT/evidence/terminal-error-census.json"
  findings:
    - "13551 app,110 inventory,14 infrastructure,278 Chromium cases; zero unresolved,uncaught or passing replay. Actual current-source app/inventory all4 coverage metrics100, complete source/map or contiguous full declaration/body/enclosing branch/location certificates."
    - "8 approved semantic paths, all586 prior acceptance byte-identical,0 migrations; all298 metadata records, fields, defaults, statuses and save/open/recovery exceptions preserved. ONE full upstream-absent runtime;2 focused new/original-failure closures. No repeated build."
commit:
  hash: "26cf7851bcef7db761ea51798a9247de8b68a7ae"
  message: "🧩 A4HCRT parity: restore native list marking and render invalidation"
comments:
  -
    author: "CODER"
    body: "Start: restore native list marked-level state, depth notifications and actual owner queries under standing iterative authorization."
  -
    author: "CODER"
    body: "Verified: native marked-list owners, depth notifications, actual membership queries and render-only shell invalidation match pinned source contracts;13551app110inventory14infra278Chrome,actual100app/inventory,zero unresolved/uncaught/passing replay. Whole parity remains ACTIVE."
events:
  -
    type: "status"
    at: "2026-10-07T14:28:56.664Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore native list marked-level state, depth notifications and actual owner queries under standing iterative authorization."
  -
    type: "verify"
    at: "2026-10-07T14:53:21.619Z"
    author: "CODER"
    state: "ok"
    note: "Native list marking and render invalidation verified at implementation 26cf7851bcef7db761ea51798a9247de8b68a7ae:13551app110inventory14infra278Chrome,zero uncaught/unresolved/passing replay,actual100app/inventory;8paths586prior acceptance byte-identical298metadata retained. Same-agent exact evaluation pass,explicitly not independent; whole parity ACTIVE."
  -
    type: "status"
    at: "2026-10-07T14:53:39.192Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: native marked-list owners, depth notifications, actual membership queries and render-only shell invalidation match pinned source contracts;13551app110inventory14infra278Chrome,actual100app/inventory,zero unresolved/uncaught/passing replay. Whole parity remains ACTIVE."
doc_version: 3
doc_updated_at: "2026-10-07T14:53:39.194Z"
doc_updated_by: "CODER"
description: "Iteration217: implement pinned SwList marked-level state, SwNumberTree level-depth notifications, SwDoc marking delegate and SwTextNode HasMarkedLabel query for existing native lists. Preserve source order/defaults and prepare direct UI consumption without React-owned list state; cursor/view shading and ruler integration remain subsequent bounded work."
sections:
  Summary: "Restore source-shaped list-level marking and descendant notifications in the existing native list owners; prevent their render-only paragraph notifications from falsely marking shell content modified. Preserve original list items, derived depths, counters, Undo and existing serialization contracts."
  Scope: "Standing iterative user authorization: restore missing native marked-level owner/query/notification contracts for existing lists. Pinned list.cxx32,134-176 stores MAXLEVEL10 sentinel, no clamp; marking samelevel noops, switching notifies former depth before state update then new depth afterward; clearing notifies former level before resetting sentinel regardless suppliedlevel. SwNumberTree.cxx1140-1174 chooses actual root for child calls, negative level returns, recursive depth dispatch invokes each actual child NotifyNode without adding notifiable/phantom policy guards. SwDoc docnum.cxx2786-2796 delegates only existing list. SwTextNode ndtxt.cxx3066-3078 HasMarkedLabel queries actual list/derived level only. Keep single represented list tree ownership; no public DTO/private React marker state, no new document edit or undo entries. Four production,one new acceptance,two metadata7paths;586prior acceptance all byte-identical and298metadata fields/defaults/statuses/exceptions retained, bounded evidence append only. No UI shade/ruler/all redline-range tree certification until native cursor/view options/painting follow-up. Preserve save/open/recovery deviations; no upstream/source/Python/scripts/raw maps/results in AP, raw ignoredcache only. One full upstream-absent runtime once; then original failures/genuinelynew cases only,0passing replay; six initial static once and laterchanged-input/failures only; current-source actual100 app/inventory complete byte/maps/full declarations/enclosing branches/locations. Freeze source/AP/audit while actual runtime live; poll samehandle terminal,restorevendorfinally,sourcegatesonlyafterrestored. English artifacts,actualphysical<1000,same-agent exact implementation evaluator explicitlynotindependent,final prosebeforecanonicalverify,finishimplSHA,parentfull599969prefixSHA365f53475ce4c2f1865c0568bac22581381f7aca64b20c7450d8adb7e1c00167 unchanged. Deferredstash andDONEimmutable retained. Refinement under standing authorization: add existing docsh.ts serialization-hint classification bridge (5 production/1 new acceptance/2 metadata,8paths). Pinned ndtxt.cxx3031-3057 NumRuleChgd sends same-old/new noop layout invalidation, without modifying content. Indexed paragraph numbering-only hints must still repaint but not mark shell modified/advance serialized content generation; ruleName-bearing or unqualified numbering changes retain mutation semantics. Add genuinely new actual SwDocShell acceptance; all5 already passing native cases and all prior586 tests remain unreplayed. Run changed-input static/type/source closure only; coverage requires complete changed predicate current function/branches, all unchanged coverage uses whole-source or complete-region proof. Full runtime stays once."
  Plan: "Standing iterative user authorization: restore missing native marked-level owner/query/notification contracts for existing lists. Pinned list.cxx32,134-176 stores MAXLEVEL10 sentinel, no clamp; marking samelevel noops, switching notifies former depth before state update then new depth afterward; clearing notifies former level before resetting sentinel regardless suppliedlevel. SwNumberTree.cxx1140-1174 chooses actual root for child calls, negative level returns, recursive depth dispatch invokes each actual child NotifyNode without adding notifiable/phantom policy guards. SwDoc docnum.cxx2786-2796 delegates only existing list. SwTextNode ndtxt.cxx3066-3078 HasMarkedLabel queries actual list/derived level only. Keep single represented list tree ownership; no public DTO/private React marker state, no new document edit or undo entries. Four production,one new acceptance,two metadata7paths;586prior acceptance all byte-identical and298metadata fields/defaults/statuses/exceptions retained, bounded evidence append only. No UI shade/ruler/all redline-range tree certification until native cursor/view options/painting follow-up. Preserve save/open/recovery deviations; no upstream/source/Python/scripts/raw maps/results in AP, raw ignoredcache only. One full upstream-absent runtime once; then original failures/genuinelynew cases only,0passing replay; six initial static once and laterchanged-input/failures only; current-source actual100 app/inventory complete byte/maps/full declarations/enclosing branches/locations. Freeze source/AP/audit while actual runtime live; poll samehandle terminal,restorevendorfinally,sourcegatesonlyafterrestored. English artifacts,actualphysical<1000,same-agent exact implementation evaluator explicitlynotindependent,final prosebeforecanonicalverify,finishimplSHA,parentfull599969prefixSHA365f53475ce4c2f1865c0568bac22581381f7aca64b20c7450d8adb7e1c00167 unchanged. Deferredstash andDONEimmutable retained. Refinement under standing authorization: add existing docsh.ts serialization-hint classification bridge (5 production/1 new acceptance/2 metadata,8paths). Pinned ndtxt.cxx3031-3057 NumRuleChgd sends same-old/new noop layout invalidation, without modifying content. Indexed paragraph numbering-only hints must still repaint but not mark shell modified/advance serialized content generation; ruleName-bearing or unqualified numbering changes retain mutation semantics. Add genuinely new actual SwDocShell acceptance; all5 already passing native cases and all prior586 tests remain unreplayed. Run changed-input static/type/source closure only; coverage requires complete changed predicate current function/branches, all unchanged coverage uses whole-source or complete-region proof. Full runtime stays once."
  Verify Steps: "Six initial gates once:format:check,lint,typecheck,check:dependencies,check:docs,check:file-size; later failed/changed-input closures only. New native acceptance proves MAXLEVEL10 default, exact switching/clearing observer order and level filtering, samelevel no-op, negative/unbounded depth/native root versus child/phantom traversal, missing list and HasMarkedLabel membership/derived-level queries, original vectors/itemowners/history unchanged. ONE full upstream-absent build/app/inventory/infra/Chromium with explicit terminal uncaught-error census; lateroriginalfailed/newcases only,0passing replay. All586prior acceptance byte-identical,298metadata fields/statuses/defaults/exceptions preserved. Actualcurrent-source100 all4 app/inventory metrics using entire identical sources/maps or complete contiguous declarations/bodies/enclosing branches/every mapped location; no fake/clamping/exclusions/skippromotion. Restorevendorfinally then5source/resource/provenance/invariant/parity gates. JSDoc/actualphysical<1000,doctor/routing/diff and wholeAPforbidden artifacts0. Same-agent exact implementation evaluator explicitlynotindependent; finalFindings/Verification beforecanonicalverify, finishactualimplSHA, full parent599969charSHA365f53475ce4c2f1865c0568bac22581381f7aca64b20c7450d8adb7e1c00167 append. Refinement under standing authorization: add existing docsh.ts serialization-hint classification bridge (5 production/1 new acceptance/2 metadata,8paths). Pinned ndtxt.cxx3031-3057 NumRuleChgd sends same-old/new noop layout invalidation, without modifying content. Indexed paragraph numbering-only hints must still repaint but not mark shell modified/advance serialized content generation; ruleName-bearing or unqualified numbering changes retain mutation semantics. Add genuinely new actual SwDocShell acceptance; all5 already passing native cases and all prior586 tests remain unreplayed. Run changed-input static/type/source closure only; coverage requires complete changed predicate current function/branches, all unchanged coverage uses whole-source or complete-region proof. Full runtime stays once."
  Verification: |-
    Command: ONE full upstream-absent build/app/inventory/infrastructure/Chromium plus2 focused genuinely-new/original-failure shell closures; current-source coverage/case/scope reconstruction; six initial static gates and changed-input/failure closures;5 restored source/resource/provenance/invariant/parity gates; JSDoc/physical/doctor/routing/diff/artifact checks; exact implementation same-agent evaluation.
    Result: pass. Evidence:13551 app,110 inventory,14 infrastructure,278 Chromium, zero unresolved/uncaught/passing replay;10 focused skipped observations retained. Actual app L16460/S18070/F4198/B13583 and inventory L1464/S1523/F384/B1081 all100 with entire source/maps or complete declaration/body/enclosing branch/location certificates.294 whole app files,38 whole inventory,4 complete prior app source-region certificates; current shell predicate covered by the new actual-shell scenario.8 semantic paths,586 prior acceptance byte-identical,0 migrations,298 prior metadata records and all fields/statuses/defaults/exceptions retained. All profiles terminal and vendor restored; no repeated full runtime or build. Max physical999, doctor0 errors2 existing warnings, forbidden/raw AP paths0. No mandatory check skipped. Scope: native marked-list owner/depth notification/query and existing shell render-only versus content-mutation classification. Cursor/view shading/ruler and full native frame/word-count notification graph remain explicit follow-ups.
    Exact implementation:26cf7851bcef7db761ea51798a9247de8b68a7ae. Source-bound audit and same-agent quality verdict pass; evaluation explicitly not independent, report quality/20261007-145248288-recovery-context/quality-report.json. Required reports reconstructed byte-identically at implementation HEAD.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-07T14:53:21.619Z — VERIFY — ok

    By: CODER

    Note: Native list marking and render invalidation verified at implementation 26cf7851bcef7db761ea51798a9247de8b68a7ae:13551app110inventory14infra278Chrome,zero uncaught/unresolved/passing replay,actual100app/inventory;8paths586prior acceptance byte-identical298metadata retained. Same-agent exact evaluation pass,explicitly not independent; whole parity ACTIVE.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-07T14:53:18.808Z, excerpt_hash=sha256:d300cf1a19f347be7812c973a978f731ee32f4643e59a5aefe4b1e26fc89c5d9

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610071427-A4HCRT/blueprint/resolved-snapshot.json
    - old_digest: 609a3d9f356f174ef014a75dd6c03776917223f496d811d52fa6eaaa8b7fc37b
    - current_digest: 609a3d9f356f174ef014a75dd6c03776917223f496d811d52fa6eaaa8b7fc37b
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610071427-A4HCRT

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610071427-A4HCRT
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the task's intentional semantic commit; retain task traceability and other work. No upstream snapshots or external writes."
  Findings: |-
    Implemented the missing native list-marking owners in SwList, SwNumberTreeNode, SwDoc and SwTextNode. Pinned list.cxx32,134-176 retains MAXLEVEL10, notifies the former depth before changing state and the new depth afterward, ignores the supplied depth when clearing, and makes same-depth marking a no-op. SwNumberTree.cxx1140-1174 dispatches from the actual root through sorted descendants, including phantom ancestry, with no invented clamps or generic reading/notification gates. docnum.cxx2786-2796 delegates only to an existing list; ndtxt.cxx3066-3078 queries original membership and derived depth.
    The bounded refinement fixes an existing browser shell classification layer: native ndtxt.cxx3031-3057 NumRuleChgd emits a same-old/new noop layout invalidation. Indexed paragraph-only numbering notifications remain observable but no longer mark serializable content dirty or advance its generation. Rule-bearing and unqualified numbering mutations retain existing semantics. Actual shell acceptance verifies clean repaint delivery and genuine text, attribute, style, node, numbering-rule, line-number and mixed-transaction edits. No new React state, transport flags, history edits or list ownership copies.
    ONE full upstream-absent runtime reached terminal: build pass;13550 app assertions pass (raw coverage threshold exit1);110 inventory,14 infrastructure and278 Chromium pass, zero uncaught errors. All4 priority native-label-width browser cases pass, retaining the earlier bullet-overlap fix. Two focused upstream-absent closures ran only one genuinely new shell case and then its original failure. Closure1 fixture expected standalone hints although the shell publishes transactions; corrected observation reads nested hints and closure2 passed. The5 earlier passing native cases were skipped in both closures,10 skipped observations retained as skipped; zero passing replay. Final census13551 app,110 inventory,14 infrastructure,278 Chromium; zero unresolved or uncaught.
    Actual current-source app coverage L16460/S18070/F4198/B13583 and inventory L1464/S1523/F384/B1081, all100. Entire byte-identical source/maps cover294 app and38 inventory files; the changed shell predicate uses current focused coverage and complete unchanged declarations/bodies/enclosing branches/locations. Four complete prior source-region certificates bind core additions. Unchanged edit-window branch uses its whole prior certificate; negative inferred V8 paintfrm counts use an entire previously verified byte-identical source/map/counter certificate, never individual clamping. Complete raw maps/results/snapshots stay only in ignored dependency cache.
    Scope8 semantic paths:5 production,1 fresh acceptance,2 metadata. All586 prior acceptance files byte-identical; no migrations. All298 metadata records, prior fields/statuses/defaults/prefixes and registered save/open/recovery exceptions preserved; bounded evidence appended only. Six initial static gates once; initial new-file format failure resolved with scoped formatting. Refinement TypeScript found2 wrong public fixture signatures, corrected before runtime. Final changed-input format/lint/type checks, JSDoc and actual physical-line counts pass, maximum999. Restored5 source/resource/provenance/invariant/parity gates pass. Doctor0 errors,2 existing warnings; routing/diff pass; no forbidden source/Python/raw artifacts in AP. No repeated build.
    Process observations: initial doc output helper shadowing occurred after successful Summary update; route recovered and remaining docs written. Initial JSDoc evidence writer used an incorrect date prefix and failed ENOENT; no incorrect artifact created, corrected validator passed. Neither affected production source.
    Residual: cursor-shell MarkListLevel/UpdateMarkedListLevel, view field shading, marker paint/ruler integration, native hidden-redline/original tree variants and full NumRuleChgd SwTextFrame/word-count invalidation remain individually unverified. This leaf does not certify whole UI/core parity. Persistent parent goal stays ACTIVE. Deferred stash c85f4a0e453dfd06d6e199554784f2c286737472 untouched. Full parent599969-character prefix SHA365f53475ce4c2f1865c0568bac22581381f7aca64b20c7450d8adb7e1c00167 must be preserved. Exact implementation audit passed at 26cf7851bcef7db761ea51798a9247de8b68a7ae: source-bound coverage/case/scope reports reconstructed byte-identically, full map/counter/source certificates and all raw result digests checked. Same current agent EVALUATOR phase, explicitly not independent; report quality/20261007-145248288-recovery-context/quality-report.json. Final Findings/Verification recorded before canonical verification; finish must reference the implementation SHA.
id_source: "generated"
---
## Summary

Restore source-shaped list-level marking and descendant notifications in the existing native list owners; prevent their render-only paragraph notifications from falsely marking shell content modified. Preserve original list items, derived depths, counters, Undo and existing serialization contracts.

## Scope

Standing iterative user authorization: restore missing native marked-level owner/query/notification contracts for existing lists. Pinned list.cxx32,134-176 stores MAXLEVEL10 sentinel, no clamp; marking samelevel noops, switching notifies former depth before state update then new depth afterward; clearing notifies former level before resetting sentinel regardless suppliedlevel. SwNumberTree.cxx1140-1174 chooses actual root for child calls, negative level returns, recursive depth dispatch invokes each actual child NotifyNode without adding notifiable/phantom policy guards. SwDoc docnum.cxx2786-2796 delegates only existing list. SwTextNode ndtxt.cxx3066-3078 HasMarkedLabel queries actual list/derived level only. Keep single represented list tree ownership; no public DTO/private React marker state, no new document edit or undo entries. Four production,one new acceptance,two metadata7paths;586prior acceptance all byte-identical and298metadata fields/defaults/statuses/exceptions retained, bounded evidence append only. No UI shade/ruler/all redline-range tree certification until native cursor/view options/painting follow-up. Preserve save/open/recovery deviations; no upstream/source/Python/scripts/raw maps/results in AP, raw ignoredcache only. One full upstream-absent runtime once; then original failures/genuinelynew cases only,0passing replay; six initial static once and laterchanged-input/failures only; current-source actual100 app/inventory complete byte/maps/full declarations/enclosing branches/locations. Freeze source/AP/audit while actual runtime live; poll samehandle terminal,restorevendorfinally,sourcegatesonlyafterrestored. English artifacts,actualphysical<1000,same-agent exact implementation evaluator explicitlynotindependent,final prosebeforecanonicalverify,finishimplSHA,parentfull599969prefixSHA365f53475ce4c2f1865c0568bac22581381f7aca64b20c7450d8adb7e1c00167 unchanged. Deferredstash andDONEimmutable retained. Refinement under standing authorization: add existing docsh.ts serialization-hint classification bridge (5 production/1 new acceptance/2 metadata,8paths). Pinned ndtxt.cxx3031-3057 NumRuleChgd sends same-old/new noop layout invalidation, without modifying content. Indexed paragraph numbering-only hints must still repaint but not mark shell modified/advance serialized content generation; ruleName-bearing or unqualified numbering changes retain mutation semantics. Add genuinely new actual SwDocShell acceptance; all5 already passing native cases and all prior586 tests remain unreplayed. Run changed-input static/type/source closure only; coverage requires complete changed predicate current function/branches, all unchanged coverage uses whole-source or complete-region proof. Full runtime stays once.

## Plan

Standing iterative user authorization: restore missing native marked-level owner/query/notification contracts for existing lists. Pinned list.cxx32,134-176 stores MAXLEVEL10 sentinel, no clamp; marking samelevel noops, switching notifies former depth before state update then new depth afterward; clearing notifies former level before resetting sentinel regardless suppliedlevel. SwNumberTree.cxx1140-1174 chooses actual root for child calls, negative level returns, recursive depth dispatch invokes each actual child NotifyNode without adding notifiable/phantom policy guards. SwDoc docnum.cxx2786-2796 delegates only existing list. SwTextNode ndtxt.cxx3066-3078 HasMarkedLabel queries actual list/derived level only. Keep single represented list tree ownership; no public DTO/private React marker state, no new document edit or undo entries. Four production,one new acceptance,two metadata7paths;586prior acceptance all byte-identical and298metadata fields/defaults/statuses/exceptions retained, bounded evidence append only. No UI shade/ruler/all redline-range tree certification until native cursor/view options/painting follow-up. Preserve save/open/recovery deviations; no upstream/source/Python/scripts/raw maps/results in AP, raw ignoredcache only. One full upstream-absent runtime once; then original failures/genuinelynew cases only,0passing replay; six initial static once and laterchanged-input/failures only; current-source actual100 app/inventory complete byte/maps/full declarations/enclosing branches/locations. Freeze source/AP/audit while actual runtime live; poll samehandle terminal,restorevendorfinally,sourcegatesonlyafterrestored. English artifacts,actualphysical<1000,same-agent exact implementation evaluator explicitlynotindependent,final prosebeforecanonicalverify,finishimplSHA,parentfull599969prefixSHA365f53475ce4c2f1865c0568bac22581381f7aca64b20c7450d8adb7e1c00167 unchanged. Deferredstash andDONEimmutable retained. Refinement under standing authorization: add existing docsh.ts serialization-hint classification bridge (5 production/1 new acceptance/2 metadata,8paths). Pinned ndtxt.cxx3031-3057 NumRuleChgd sends same-old/new noop layout invalidation, without modifying content. Indexed paragraph numbering-only hints must still repaint but not mark shell modified/advance serialized content generation; ruleName-bearing or unqualified numbering changes retain mutation semantics. Add genuinely new actual SwDocShell acceptance; all5 already passing native cases and all prior586 tests remain unreplayed. Run changed-input static/type/source closure only; coverage requires complete changed predicate current function/branches, all unchanged coverage uses whole-source or complete-region proof. Full runtime stays once.

## Verify Steps

Six initial gates once:format:check,lint,typecheck,check:dependencies,check:docs,check:file-size; later failed/changed-input closures only. New native acceptance proves MAXLEVEL10 default, exact switching/clearing observer order and level filtering, samelevel no-op, negative/unbounded depth/native root versus child/phantom traversal, missing list and HasMarkedLabel membership/derived-level queries, original vectors/itemowners/history unchanged. ONE full upstream-absent build/app/inventory/infra/Chromium with explicit terminal uncaught-error census; lateroriginalfailed/newcases only,0passing replay. All586prior acceptance byte-identical,298metadata fields/statuses/defaults/exceptions preserved. Actualcurrent-source100 all4 app/inventory metrics using entire identical sources/maps or complete contiguous declarations/bodies/enclosing branches/every mapped location; no fake/clamping/exclusions/skippromotion. Restorevendorfinally then5source/resource/provenance/invariant/parity gates. JSDoc/actualphysical<1000,doctor/routing/diff and wholeAPforbidden artifacts0. Same-agent exact implementation evaluator explicitlynotindependent; finalFindings/Verification beforecanonicalverify, finishactualimplSHA, full parent599969charSHA365f53475ce4c2f1865c0568bac22581381f7aca64b20c7450d8adb7e1c00167 append. Refinement under standing authorization: add existing docsh.ts serialization-hint classification bridge (5 production/1 new acceptance/2 metadata,8paths). Pinned ndtxt.cxx3031-3057 NumRuleChgd sends same-old/new noop layout invalidation, without modifying content. Indexed paragraph numbering-only hints must still repaint but not mark shell modified/advance serialized content generation; ruleName-bearing or unqualified numbering changes retain mutation semantics. Add genuinely new actual SwDocShell acceptance; all5 already passing native cases and all prior586 tests remain unreplayed. Run changed-input static/type/source closure only; coverage requires complete changed predicate current function/branches, all unchanged coverage uses whole-source or complete-region proof. Full runtime stays once.

## Verification

Command: ONE full upstream-absent build/app/inventory/infrastructure/Chromium plus2 focused genuinely-new/original-failure shell closures; current-source coverage/case/scope reconstruction; six initial static gates and changed-input/failure closures;5 restored source/resource/provenance/invariant/parity gates; JSDoc/physical/doctor/routing/diff/artifact checks; exact implementation same-agent evaluation.
Result: pass. Evidence:13551 app,110 inventory,14 infrastructure,278 Chromium, zero unresolved/uncaught/passing replay;10 focused skipped observations retained. Actual app L16460/S18070/F4198/B13583 and inventory L1464/S1523/F384/B1081 all100 with entire source/maps or complete declaration/body/enclosing branch/location certificates.294 whole app files,38 whole inventory,4 complete prior app source-region certificates; current shell predicate covered by the new actual-shell scenario.8 semantic paths,586 prior acceptance byte-identical,0 migrations,298 prior metadata records and all fields/statuses/defaults/exceptions retained. All profiles terminal and vendor restored; no repeated full runtime or build. Max physical999, doctor0 errors2 existing warnings, forbidden/raw AP paths0. No mandatory check skipped. Scope: native marked-list owner/depth notification/query and existing shell render-only versus content-mutation classification. Cursor/view shading/ruler and full native frame/word-count notification graph remain explicit follow-ups.
Exact implementation:26cf7851bcef7db761ea51798a9247de8b68a7ae. Source-bound audit and same-agent quality verdict pass; evaluation explicitly not independent, report quality/20261007-145248288-recovery-context/quality-report.json. Required reports reconstructed byte-identically at implementation HEAD.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-07T14:53:21.619Z — VERIFY — ok

By: CODER

Note: Native list marking and render invalidation verified at implementation 26cf7851bcef7db761ea51798a9247de8b68a7ae:13551app110inventory14infra278Chrome,zero uncaught/unresolved/passing replay,actual100app/inventory;8paths586prior acceptance byte-identical298metadata retained. Same-agent exact evaluation pass,explicitly not independent; whole parity ACTIVE.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-07T14:53:18.808Z, excerpt_hash=sha256:d300cf1a19f347be7812c973a978f731ee32f4643e59a5aefe4b1e26fc89c5d9

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610071427-A4HCRT/blueprint/resolved-snapshot.json
- old_digest: 609a3d9f356f174ef014a75dd6c03776917223f496d811d52fa6eaaa8b7fc37b
- current_digest: 609a3d9f356f174ef014a75dd6c03776917223f496d811d52fa6eaaa8b7fc37b
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610071427-A4HCRT

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610071427-A4HCRT
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the task's intentional semantic commit; retain task traceability and other work. No upstream snapshots or external writes.

## Findings

Implemented the missing native list-marking owners in SwList, SwNumberTreeNode, SwDoc and SwTextNode. Pinned list.cxx32,134-176 retains MAXLEVEL10, notifies the former depth before changing state and the new depth afterward, ignores the supplied depth when clearing, and makes same-depth marking a no-op. SwNumberTree.cxx1140-1174 dispatches from the actual root through sorted descendants, including phantom ancestry, with no invented clamps or generic reading/notification gates. docnum.cxx2786-2796 delegates only to an existing list; ndtxt.cxx3066-3078 queries original membership and derived depth.
The bounded refinement fixes an existing browser shell classification layer: native ndtxt.cxx3031-3057 NumRuleChgd emits a same-old/new noop layout invalidation. Indexed paragraph-only numbering notifications remain observable but no longer mark serializable content dirty or advance its generation. Rule-bearing and unqualified numbering mutations retain existing semantics. Actual shell acceptance verifies clean repaint delivery and genuine text, attribute, style, node, numbering-rule, line-number and mixed-transaction edits. No new React state, transport flags, history edits or list ownership copies.
ONE full upstream-absent runtime reached terminal: build pass;13550 app assertions pass (raw coverage threshold exit1);110 inventory,14 infrastructure and278 Chromium pass, zero uncaught errors. All4 priority native-label-width browser cases pass, retaining the earlier bullet-overlap fix. Two focused upstream-absent closures ran only one genuinely new shell case and then its original failure. Closure1 fixture expected standalone hints although the shell publishes transactions; corrected observation reads nested hints and closure2 passed. The5 earlier passing native cases were skipped in both closures,10 skipped observations retained as skipped; zero passing replay. Final census13551 app,110 inventory,14 infrastructure,278 Chromium; zero unresolved or uncaught.
Actual current-source app coverage L16460/S18070/F4198/B13583 and inventory L1464/S1523/F384/B1081, all100. Entire byte-identical source/maps cover294 app and38 inventory files; the changed shell predicate uses current focused coverage and complete unchanged declarations/bodies/enclosing branches/locations. Four complete prior source-region certificates bind core additions. Unchanged edit-window branch uses its whole prior certificate; negative inferred V8 paintfrm counts use an entire previously verified byte-identical source/map/counter certificate, never individual clamping. Complete raw maps/results/snapshots stay only in ignored dependency cache.
Scope8 semantic paths:5 production,1 fresh acceptance,2 metadata. All586 prior acceptance files byte-identical; no migrations. All298 metadata records, prior fields/statuses/defaults/prefixes and registered save/open/recovery exceptions preserved; bounded evidence appended only. Six initial static gates once; initial new-file format failure resolved with scoped formatting. Refinement TypeScript found2 wrong public fixture signatures, corrected before runtime. Final changed-input format/lint/type checks, JSDoc and actual physical-line counts pass, maximum999. Restored5 source/resource/provenance/invariant/parity gates pass. Doctor0 errors,2 existing warnings; routing/diff pass; no forbidden source/Python/raw artifacts in AP. No repeated build.
Process observations: initial doc output helper shadowing occurred after successful Summary update; route recovered and remaining docs written. Initial JSDoc evidence writer used an incorrect date prefix and failed ENOENT; no incorrect artifact created, corrected validator passed. Neither affected production source.
Residual: cursor-shell MarkListLevel/UpdateMarkedListLevel, view field shading, marker paint/ruler integration, native hidden-redline/original tree variants and full NumRuleChgd SwTextFrame/word-count invalidation remain individually unverified. This leaf does not certify whole UI/core parity. Persistent parent goal stays ACTIVE. Deferred stash c85f4a0e453dfd06d6e199554784f2c286737472 untouched. Full parent599969-character prefix SHA365f53475ce4c2f1865c0568bac22581381f7aca64b20c7450d8adb7e1c00167 must be preserved. Exact implementation audit passed at 26cf7851bcef7db761ea51798a9247de8b68a7ae: source-bound coverage/case/scope reports reconstructed byte-identically, full map/counter/source certificates and all raw result digests checked. Same current agent EVALUATOR phase, explicitly not independent; report quality/20261007-145248288-recovery-context/quality-report.json. Final Findings/Verification recorded before canonical verification; finish must reference the implementation SHA.
