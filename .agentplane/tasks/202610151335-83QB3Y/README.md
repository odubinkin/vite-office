---
id: "202610151335-83QB3Y"
title: "Canonicalize tab-stop values transport and Writer consumers"
result_summary: "Canonical tab core and Writer I/O migration complete;348related/187Calc/19browser tests, strict100coverage and all source gates pass."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 22
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-15T13:36:16.687Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-15T15:47:49.926Z"
  updated_by: "CODER"
  note: "Native tab values/container/typed Any and Writer I/O migration verified at07554c5e7521.348related/187Calc/19browser pass; exact10shared/33Calc owners raw100 with every counter positive,13source gates/build/inventory and302native pins pass; all4references restored. Source audit4017hashes/102cumulative paths. Same-agent quality pass; no whole-module/UI/ODS or full-regression claim."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-15T15:47:44.460Z"
  updated_by: "EVALUATOR"
  note: "Same-agent review of commit07554c5e7521: native tab core and Writer migration satisfy the approved bounded contract."
  evaluated_sha: "07554c5e7521c16834a7ed89af66b25cad5d4c13"
  blueprint_digest: "b762e2cf24b5dd138d9e1a2923a423feaa0cfe8885f2a5cfc75aeb23dd0b0587"
  evidence_refs:
    - ".agentplane/tasks/202610151335-83QB3Y/README.md"
    - ".agentplane/tasks/202610151335-83QB3Y/quality/20261015-154744460-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610151335-83QB3Y/quality/20261015-154744460-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610151335-83QB3Y/quality/20261015-154744460-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610151335-83QB3Y/blueprint/resolved-snapshot.json"
    - "output/playwright/task156-checks/item-stage-verification.json"
    - "output/playwright/task156-checks/item-stage-source-hashes.json"
    - "output/playwright/task156-checks/item-native-audit.json"
    - "output/playwright/task156-checks/item-post-source-gates.json"
    - "output/playwright/task156-checks/build-browser-manifest.json"
  findings:
    - "Compared the102cumulative task paths and4017exact tracked hashes with the pre-task baseline; reviewed actual native property/collection bodies and302pinned source files. All13source gates,348related tests,187Calc tests, raw positive counters for exact10shared/33Calc owners, production build and19browser scenarios pass. No independent review or full application parity is claimed."
commit:
  hash: "40fa58378e1c3aeaac601e53fb774f5f9d29147c"
  message: "✅ 83QB3Y verify: record native tab boundary checks"
comments:
  -
    author: "CODER"
    body: "Start: native tab-stop values, sorted item state and real UNO transport; source numeric-locale behavior and every Writer I/O consumer canonicalized without localization or an ownership manager."
  -
    author: "CODER"
    body: "Verified: canonical tab value/container/typed UNO contracts and migrated Writer adapters pass348related,187Calc and19browser tests, strict raw100 coverage for10shared/33Calc owners,13source gates/build/inventory and302native source pins. Exact4017source hashes and102cumulative paths verified; all4references restored. Same-agent quality review recorded. Actual Calc document/UI/ODS remain pending; goal stays active."
events:
  -
    type: "status"
    at: "2026-10-15T13:36:28.302Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: native tab-stop values, sorted item state and real UNO transport; source numeric-locale behavior and every Writer I/O consumer canonicalized without localization or an ownership manager."
  -
    type: "verify"
    at: "2026-10-15T15:47:49.926Z"
    author: "CODER"
    state: "ok"
    note: "Native tab values/container/typed Any and Writer I/O migration verified at07554c5e7521.348related/187Calc/19browser pass; exact10shared/33Calc owners raw100 with every counter positive,13source gates/build/inventory and302native pins pass; all4references restored. Source audit4017hashes/102cumulative paths. Same-agent quality pass; no whole-module/UI/ODS or full-regression claim."
  -
    type: "status"
    at: "2026-10-15T15:48:39.421Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: canonical tab value/container/typed UNO contracts and migrated Writer adapters pass348related,187Calc and19browser tests, strict raw100 coverage for10shared/33Calc owners,13source gates/build/inventory and302native source pins. Exact4017source hashes and102cumulative paths verified; all4references restored. Same-agent quality review recorded. Actual Calc document/UI/ODS remain pending; goal stays active."
doc_version: 3
doc_updated_at: "2026-10-15T15:48:39.426Z"
doc_updated_by: "CODER"
description: "Task156 restores native SvxTabStop and SvxTabStopItem value/container/typed Any contracts, real TabStop/TabAlign IDL bindings and required numeric-locale decimal behavior; reuses SortedVector/CPPU and migrates Writer I/O consumers without retaining a browser persistence facade in shared core."
sections:
  Summary: "Task156 canonicalizes shared native tab-stop values, sorted item state and actual typed transport, with the required decimal-locale semantics and migrated Writer consumers."
  Scope: "At most130intentional non-agent paths: editeng tab values/header/enums/selectors, original offapi style TabStop and TabAlign values, existing CPPU/SortedVector only where required, source-backed minimum numeric-locale providers/data under their actual unotools/i18npool/i18nlangtag boundaries, necessary module dependency records/guards, Writer model/filter/persistence/layout/dialog consumers, direct tests and matched inventory/capability/docs. No translated UI labels, full ICU replacement, new lifetime/refcount/ownership machinery, native compiler/probes or unrelated Writer feature work."
  Plan: "Canonical tab value/item/typed transport and required source numeric-locale behavior, every Writer consumer and inventory within130paths; reuse shared SortedVector/CPPU, no localization/native probes/lifetime machinery. Complete this coherent boundary across continuations rather than creating bookkeeping-only tasks for each declaration."
  Verify Steps: "Pinned tstpitem.hxx/paraitem.cxx/svxenum.hxx/memberids.h, TabStop.idl/TabAlign.idl and actual locale data/provider/fallback behavior are authoritative. Native defaults ten1134Default stops, counted zero-distance deduplication, independent caller/copy/Clone values, defaultDistance signed32 direct setter versus nonnegative UNO property, position-only sorted lookup, replacement and two-pass item merge, Which-independent payload equality and hash omissions preserved. Actual TabStop IDL long Position/enum Alignment/char DecimalChar/FillChar default/copy/assignment/typed metadata and real Sequence/Any transport; enum native generated size sentinel. Typed sequence and nested Any4fields accept native enum or long and char or one-unit OUString fallbacks, extraction failure nonmutation, conversion narrowing/order and duplicate last-wins. MID_TABSTOPS0/MID_STD_TAB1/MID_TABSTOP_DEFAULT_DISTANCE2 and unknown-member success/untouched behavior; first-tab members have original nonempty precondition. Native decimal0 is resolved from system numeric locale, not retained or guessed as dot; probe comparison of all285source locales found230matches and55differences against current Intl, so direct unconditional substitution is rejected. Verify locale resolution/fallback at real provider boundary, original separators and copy stability, without translated language names or fabricated service facades. Writer XML/snapshot/format/ruler/layout/history round trips use core getters/setters and explicit adapters, old snapshots decoded only at I/O. Entire changed/new executable shared owners and all Calc raw S/B/F/L100 with every raw counter positive; related Writer tests and existing relevant browser scenarios, Writer-only coverage gaps exempt. Four references absent during tests/build and restored finally; all13source gates/build/inventory/boundaries and exact130path/pin/hash/clean calc proof. No native compiler/probe. Full all-app suite deferred until genuine minimum connected UI+same-model ODS readiness then applicable fixes/pause per user."
  Verification: |-
    Command: node output/playwright/task156-checks/portable.mjs. Result: pass. Evidence:348related tests/30files and187Calc tests/76files. Exact measured owner sets are all10changed/new shared and33Calc executable modules. Shared raw S626/B337/F105/L575 and Calc S4179/B2731/F821/L3727 are100, every raw counter positive. Scope: real TabStop/TabAlign/Sequence, source numeric locale providers, original SvxTabStop and full collection/typed-property SvxTabStopItem plus related Writer consumers. Tests preserve original defaults/copies/const access, position replacement/two-pass/self merge, count/sentinel narrowing, payload equality/hash omissions, actual typed/nested Any transport and nonmutation on failed extraction. Writer JSON is outside core and explicit post-construction nul fields survive restoration. No Writer-only coverage repair, native compiler/generator/probe or new memory owner.

    Command: thirteen exact argv recorded in item-stage-verification.json, including subsequent focused source-gate reruns. Result: pass. Evidence:format/lint/typecheck/JSDoc/size/dependencies/tree/provenance/inventory/routing/doctor/diff and41boundary tests; inventory semanticViolationCount0 and provenance687runtime modules. Scope: cumulative102intentional non-agent paths within approved130, including new canonical tstpitem boundary and necessary238+322line paraitem responsibility split. Existing13boundary/cycle function bodies remain unchanged; original script source hashes match the prior proven value checkpoint. Historical inventory statuses are preserved; no whole-module/presentation/UI/ODS parity promotion.

    Command: node output/playwright/task156-checks/build-browser-portable.mjs. Result: pass. Evidence:production build and19browser scenarios/7Writer files, including exact ruler glyphs/anchors/replacement, native numbering tabs, automatic body layout, cell format/history/ODT reopen and native paragraph text surfaces. Scope: actual production application. All4source-reference links are absent during both suites/build/browser and restored in finally. Browser collection initially rejected missing JSON import attributes; standard repository import syntax fixed this without a loader workaround.

    Command: python3 output/playwright/task156-checks/audit-item.py. Result: pass. Evidence:4017exact non-agent source hashes against3989pre-task baseline,102cumulative intentional paths (74existing/28new), all302native pins at9bc445578031fecf56086729d8e4940c77e14d65, raw positive counters and exact owner sets, all13gates/build/browser, all4original reference links restored and branchcalc. Ignored evidence is under output/playwright/task156-checks; implementation and direct regression tests are tracked. CALC-134/135/136 preserve source typo/self-alias/count-width concerns. Final commit/clean-state proof follows source commit.

    Boundaries: full original tab core value/container/typed transport and migrated Writer boundary acceptance complete. Translated item presentation/diagnostic XML, general locale-service/LanguageTag construction, full EditEngine/EditTextObject and real Calc pool/document/connected UI/same-model ODS remain pending. Deliberate browser I/O/recovery deviations retained. Full all-app regression remains deferred until genuine minimum connected UI+same-model ODS readiness, then relevant repairs and goal pause per user. This task does not complete or pause the goal. Quality review is same-agent, not independent.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-15T15:47:49.926Z — VERIFY — ok

    By: CODER

    Note: Native tab values/container/typed Any and Writer I/O migration verified at07554c5e7521.348related/187Calc/19browser pass; exact10shared/33Calc owners raw100 with every counter positive,13source gates/build/inventory and302native pins pass; all4references restored. Source audit4017hashes/102cumulative paths. Same-agent quality pass; no whole-module/UI/ODS or full-regression claim.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T15:47:05.697Z, excerpt_hash=sha256:b204767b0d0da9c299ff8123844e429d8ff97b56a9e220f7cd971a2a7bad9310

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610151335-83QB3Y/blueprint/resolved-snapshot.json
    - old_digest: b762e2cf24b5dd138d9e1a2923a423feaa0cfe8885f2a5cfc75aeb23dd0b0587
    - current_digest: b762e2cf24b5dd138d9e1a2923a423feaa0cfe8885f2a5cfc75aeb23dd0b0587
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610151335-83QB3Y

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610151335-83QB3Y -m 🧩 83QB3Y task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task intentional changes and lifecycle artifacts, preserve unrelated tasks/user merges; no destructive history operations."
  Findings: |-
    Preflight clean calc at38822fdd9e9074dca7daf5a717bb26537f073d13. Existing tab values retain unresolved nul decimal, readonly fields, caller aliases and Which-sensitive equality; shared JSON constructors/projection mix browser persistence with native core. Native requires genuine SortedVector reuse and value copies, typed sequence transport, decimal resolution and distinct direct/UNO distance constraints. Read-only comparison resolved all285LC_CTYPE source decimal values including aliases;230matched current Node Intl and55differed, including fr-CH native dot versus Intl comma, lo-LA native dot versus Intl comma, ar-OM native dot versus Intl Arabic separator. Some requested locales fell back to en-US in Intl, distinct from support detection. This does not justify implementing ICU or interface localization; source numeric data and native locale fallback must be honored at the provider boundary. Existing Sequence/Any are available and must be reused without introducing another memory manager. One CODER task owns the complete coherent boundary; do not close after adding IDL declarations alone.

    - Observation: First real Sequence<TabStop> extraction test supplied an uninitialized null handle instead of an initialized Sequence object lvalue; generic C assignment correctly attempted to replace the prior value.
      Impact: Existing shared Sequence needs an explicit erased C++ object-address binding for Any extraction; copying into a detached raw handle would not update its original value owner.
      Resolution: Expose the existing sole pointer cell through a documented getAddress compiler binding, without allocating another owner or changing lifetime/counter algorithms. Test extraction into a normal constructed Sequence; include existing Sequence tests in whole-owner coverage.

    - Observation: Checkpoint: actual TabStop/TabAlign IDL bindings and initialized Sequence object-address syntax now pass9tests/3files; whole3shared runtime owners raw S108/B54/F41/L103100. Full native tab item and locale/Writer migration remain pending.
      Impact: Real typed transport dependency is implemented and source inventory updated, without adding another allocator/counter/lifetime engine. This is not task completion or Calc UI/ODS readiness.
      Resolution: Continue same task156 at source numeric-locale providers/fallback and SvxTabStop/SvxTabStopItem; retain complete130path acceptance contract and run whole Calc/build/browser/final gates only when the approved boundary is ready. Preliminary docs/lint type-only fixture issues fixed; inventory/provenance/size/typecheck pass.

    - Observation: Native tab values now use independent scalar-reference cells and SortedVector value-copy insertion; numeric resource binding embeds285source decimal fields and306source language fallback projections. Initial scoped run32passed/3failed.
      Impact: Two failures are old Which-sensitive equality and enum-range assertions; one new golden mistakenly expected Portuguese dot despite the source comma. Initial typecheck failures were native const-reference input typing and using JS strings directly in OUString constructors.
      Resolution: Keep source payload equality and integer enum admission, correct Portuguese golden from native resource, accept const borrowed tab inputs and use actual known-length OUString construction. No fake locale-service or lifetime facade; full transport/Writer migration still pending.

    - Observation: Resource provenance records were rejected because the canonical provenance schema accepts runtime TypeScript modules, not JSON assets. A build invocation also referenced a nonexistent task155 standalone wrapper before any build started.
      Impact: No implementation or verification criteria change is needed; data files remain explicit capability/provider evidence with296source pins. No build result was claimed.
      Resolution: Remove only the two newly created invalid resource-only provenance records, keep resource paths in the existing capability/provider evidence and use the existing task154 portable build wrapper adapted to task156. Preserve failed logs and rerun only affected gates/build.

    - Observation: Value/resource checkpoint passes54related/187Calc/41boundary tests, raw100 for7shared/33Calc owners, all13gates/build and296source pins. Nonvirtual native value-copy semantics, real locale data, ASCII-only lookup/case and numeric variant/script distinction are corrected.
      Impact: Writer now reuses real resolved decimal defaults and independent sorted tab values. No general locale service/LanguageTag facade or translated UI names added. Native SvxTabStopItem typed transport/merge/hash and explicit Writer persistence migration still require completion within this task.
      Resolution: Keep task156 DOING and preserve complete acceptance scope. Resource JSON is recorded as capability/provider evidence under existing inventory schema, not by relaxing runtime provenance. After completing tab contracts, audit actual ScDocumentPool/model UI+ODS blockers instead of unrelated Writer features or localization. Keep user full-run readiness/pause rule.

    - Observation: Item/Writer migration initially failed typecheck because old static JSON constructors, detached-list getters and tab JSON QueryValue assertions remained in dependent tests and four browser scenarios. A follow-up narrowed snapshot value with an intersection that retained the generic JSON array overload and still rejected object spreads. An optional user-instructions read also reported the file absent; no instruction content was assumed.
      Impact: These are in-scope migration/type declaration failures, not grounds for preserving the nonnative core API. Logs typecheck-item-migration.log and typecheck-item-migration2.log are retained.
      Resolution: Use original item construction/Count/At in core consumers and the existing Writer codec at JSON boundaries, including test fixtures. Add a concrete browser snapshot overload with the generic value property replaced, rather than intersected. Typecheck-item-migration3.log passes. New real typed item regression tests and related Writer coverage are running; full task verification remains pending.

    - Observation: First complete item migration selection reports322passed and25failed across30files. Failures are an incorrect string-address input in the new UNO test, a stale numeric host QueryValue call in a Writer test helper, former unresolved-nul decimal goldens, and deep structural equality comparing closure-valued native vector comparators.
      Impact: Actual source-default decimal is now resolved at construction. The core must not regain JSON/numeric host overloads to satisfy outdated tests. No full verification or coverage success is claimed.
      Resolution: Use OUString.getDataAddress at actual Any construction, explicit Writer codec in the helper, source-backed dot expectations under the test locale, and the native item equality contract. Retain initial failure logs and rerun the related selection.

    - Observation: Related347tests/30files pass and all10expected shared executable owners are measured, every raw S624/B337/F105/L523counter positive. Initial source gate batch has9passes/4failures: lint rejects13test-only non-null assertions, docs finds8imports inserted before required opening fileoverview; provenance and inventory were mistakenly started while the portable Calc run temporarily removed source links.
      Impact: The two source-evidence failures are invalid scheduling, not missing upstream data or permission. Do not accept their results or weaken validations. Calc run remains live; source evidence must be rechecked after its finally restores references.
      Resolution: Keep item-source-gates-results.json and failure logs. Replace test-only assertions with tuple/iteration structure, restore opening comments, and rerun lint/docs and both native-dependent checks after reference restoration. No native reference reads while source-absent suites are running.

    - Observation: Final shared347/Calc187tests pass at raw100, all13source gates pass with references present, and portable build passes. Browser collection fails before tests because Node ESM requires JSON import attributes for the two embedded locale data imports. Review also found Writer snapshot decoding would resolve an explicitly post-construction nul decimal again, losing saved state. CLI help for an assumed task persist command was rejected; no lifecycle change resulted.
      Impact: Browser acceptance is not passed. The JSON import issue is a standard module declaration fix; snapshot restoration must preserve actual scalar fields without changing native constructor/UNO behavior.
      Resolution: Use the repository's existing with type json import syntax, restore decoded decimal through the native mutable getter after constructor validation, add an explicit nul field codec regression, and rerun affected acceptance. Retain browser failure log and prior passed raw audits. No new compatibility/core JSON facade or native lifetime library.

    - Observation: All remaining migration failures are resolved. Final348related/187Calc/19browser scenarios, all13source gates and302native pins pass. Whole shared/Calc raw coverage is100 with exact expected owner sets and all counters positive. Standard JSON import attributes repair Node collection; explicit mutable decimal restoration preserves saved nul without changing core constructor or UNO normalization. Historical source-document formatting was retained after removing unintended formatter reflow; no source formatting waiver or validation relaxation.
      Impact: Approved tab-stop boundary and Writer consumers are complete within102cumulative non-agent paths. This closes the native paragraph tab dependency, not actual Calc document/UI/ODS readiness.
      Resolution: Record final audit item-stage-verification.json and source hashes, perform same-agent quality review, commit only scoped source/task artifacts and finish this task. Next work must inspect real ScDocumentPool/model and actual text-object blockers needed for UI/ODS, not unrelated Writer/localization work. Preserve user's readiness-triggered full-run/pause rule.

    - Observation: Initial implementation commit was rejected by the installed subject validator after staging81intentional paths; the gateway generic example does not satisfy the enforced emoji/task-suffix/scope format. No commit or source change occurred.
      Impact: Verification evidence and reviewed source hashes remain unchanged. Staged paths are the intended80source files plus this task README.
      Resolution: Reuse the same scoped index, record this finding through CLI, and retry with the enforced83QB3Ysubject format. No force, bypass, unstage-other or broad staging operation.
extensions:
  implementation_commit:
    hash: "07554c5e7521c16834a7ed89af66b25cad5d4c13"
    message: "🚧 83QB3Y calc: canonicalize tab item transport and Writer adapters"
id_source: "generated"
---
## Summary

Task156 canonicalizes shared native tab-stop values, sorted item state and actual typed transport, with the required decimal-locale semantics and migrated Writer consumers.

## Scope

At most130intentional non-agent paths: editeng tab values/header/enums/selectors, original offapi style TabStop and TabAlign values, existing CPPU/SortedVector only where required, source-backed minimum numeric-locale providers/data under their actual unotools/i18npool/i18nlangtag boundaries, necessary module dependency records/guards, Writer model/filter/persistence/layout/dialog consumers, direct tests and matched inventory/capability/docs. No translated UI labels, full ICU replacement, new lifetime/refcount/ownership machinery, native compiler/probes or unrelated Writer feature work.

## Plan

Canonical tab value/item/typed transport and required source numeric-locale behavior, every Writer consumer and inventory within130paths; reuse shared SortedVector/CPPU, no localization/native probes/lifetime machinery. Complete this coherent boundary across continuations rather than creating bookkeeping-only tasks for each declaration.

## Verify Steps

Pinned tstpitem.hxx/paraitem.cxx/svxenum.hxx/memberids.h, TabStop.idl/TabAlign.idl and actual locale data/provider/fallback behavior are authoritative. Native defaults ten1134Default stops, counted zero-distance deduplication, independent caller/copy/Clone values, defaultDistance signed32 direct setter versus nonnegative UNO property, position-only sorted lookup, replacement and two-pass item merge, Which-independent payload equality and hash omissions preserved. Actual TabStop IDL long Position/enum Alignment/char DecimalChar/FillChar default/copy/assignment/typed metadata and real Sequence/Any transport; enum native generated size sentinel. Typed sequence and nested Any4fields accept native enum or long and char or one-unit OUString fallbacks, extraction failure nonmutation, conversion narrowing/order and duplicate last-wins. MID_TABSTOPS0/MID_STD_TAB1/MID_TABSTOP_DEFAULT_DISTANCE2 and unknown-member success/untouched behavior; first-tab members have original nonempty precondition. Native decimal0 is resolved from system numeric locale, not retained or guessed as dot; probe comparison of all285source locales found230matches and55differences against current Intl, so direct unconditional substitution is rejected. Verify locale resolution/fallback at real provider boundary, original separators and copy stability, without translated language names or fabricated service facades. Writer XML/snapshot/format/ruler/layout/history round trips use core getters/setters and explicit adapters, old snapshots decoded only at I/O. Entire changed/new executable shared owners and all Calc raw S/B/F/L100 with every raw counter positive; related Writer tests and existing relevant browser scenarios, Writer-only coverage gaps exempt. Four references absent during tests/build and restored finally; all13source gates/build/inventory/boundaries and exact130path/pin/hash/clean calc proof. No native compiler/probe. Full all-app suite deferred until genuine minimum connected UI+same-model ODS readiness then applicable fixes/pause per user.

## Verification

Command: node output/playwright/task156-checks/portable.mjs. Result: pass. Evidence:348related tests/30files and187Calc tests/76files. Exact measured owner sets are all10changed/new shared and33Calc executable modules. Shared raw S626/B337/F105/L575 and Calc S4179/B2731/F821/L3727 are100, every raw counter positive. Scope: real TabStop/TabAlign/Sequence, source numeric locale providers, original SvxTabStop and full collection/typed-property SvxTabStopItem plus related Writer consumers. Tests preserve original defaults/copies/const access, position replacement/two-pass/self merge, count/sentinel narrowing, payload equality/hash omissions, actual typed/nested Any transport and nonmutation on failed extraction. Writer JSON is outside core and explicit post-construction nul fields survive restoration. No Writer-only coverage repair, native compiler/generator/probe or new memory owner.

Command: thirteen exact argv recorded in item-stage-verification.json, including subsequent focused source-gate reruns. Result: pass. Evidence:format/lint/typecheck/JSDoc/size/dependencies/tree/provenance/inventory/routing/doctor/diff and41boundary tests; inventory semanticViolationCount0 and provenance687runtime modules. Scope: cumulative102intentional non-agent paths within approved130, including new canonical tstpitem boundary and necessary238+322line paraitem responsibility split. Existing13boundary/cycle function bodies remain unchanged; original script source hashes match the prior proven value checkpoint. Historical inventory statuses are preserved; no whole-module/presentation/UI/ODS parity promotion.

Command: node output/playwright/task156-checks/build-browser-portable.mjs. Result: pass. Evidence:production build and19browser scenarios/7Writer files, including exact ruler glyphs/anchors/replacement, native numbering tabs, automatic body layout, cell format/history/ODT reopen and native paragraph text surfaces. Scope: actual production application. All4source-reference links are absent during both suites/build/browser and restored in finally. Browser collection initially rejected missing JSON import attributes; standard repository import syntax fixed this without a loader workaround.

Command: python3 output/playwright/task156-checks/audit-item.py. Result: pass. Evidence:4017exact non-agent source hashes against3989pre-task baseline,102cumulative intentional paths (74existing/28new), all302native pins at9bc445578031fecf56086729d8e4940c77e14d65, raw positive counters and exact owner sets, all13gates/build/browser, all4original reference links restored and branchcalc. Ignored evidence is under output/playwright/task156-checks; implementation and direct regression tests are tracked. CALC-134/135/136 preserve source typo/self-alias/count-width concerns. Final commit/clean-state proof follows source commit.

Boundaries: full original tab core value/container/typed transport and migrated Writer boundary acceptance complete. Translated item presentation/diagnostic XML, general locale-service/LanguageTag construction, full EditEngine/EditTextObject and real Calc pool/document/connected UI/same-model ODS remain pending. Deliberate browser I/O/recovery deviations retained. Full all-app regression remains deferred until genuine minimum connected UI+same-model ODS readiness, then relevant repairs and goal pause per user. This task does not complete or pause the goal. Quality review is same-agent, not independent.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-15T15:47:49.926Z — VERIFY — ok

By: CODER

Note: Native tab values/container/typed Any and Writer I/O migration verified at07554c5e7521.348related/187Calc/19browser pass; exact10shared/33Calc owners raw100 with every counter positive,13source gates/build/inventory and302native pins pass; all4references restored. Source audit4017hashes/102cumulative paths. Same-agent quality pass; no whole-module/UI/ODS or full-regression claim.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T15:47:05.697Z, excerpt_hash=sha256:b204767b0d0da9c299ff8123844e429d8ff97b56a9e220f7cd971a2a7bad9310

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610151335-83QB3Y/blueprint/resolved-snapshot.json
- old_digest: b762e2cf24b5dd138d9e1a2923a423feaa0cfe8885f2a5cfc75aeb23dd0b0587
- current_digest: b762e2cf24b5dd138d9e1a2923a423feaa0cfe8885f2a5cfc75aeb23dd0b0587
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610151335-83QB3Y

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610151335-83QB3Y -m 🧩 83QB3Y task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task intentional changes and lifecycle artifacts, preserve unrelated tasks/user merges; no destructive history operations.

## Findings

Preflight clean calc at38822fdd9e9074dca7daf5a717bb26537f073d13. Existing tab values retain unresolved nul decimal, readonly fields, caller aliases and Which-sensitive equality; shared JSON constructors/projection mix browser persistence with native core. Native requires genuine SortedVector reuse and value copies, typed sequence transport, decimal resolution and distinct direct/UNO distance constraints. Read-only comparison resolved all285LC_CTYPE source decimal values including aliases;230matched current Node Intl and55differed, including fr-CH native dot versus Intl comma, lo-LA native dot versus Intl comma, ar-OM native dot versus Intl Arabic separator. Some requested locales fell back to en-US in Intl, distinct from support detection. This does not justify implementing ICU or interface localization; source numeric data and native locale fallback must be honored at the provider boundary. Existing Sequence/Any are available and must be reused without introducing another memory manager. One CODER task owns the complete coherent boundary; do not close after adding IDL declarations alone.

- Observation: First real Sequence<TabStop> extraction test supplied an uninitialized null handle instead of an initialized Sequence object lvalue; generic C assignment correctly attempted to replace the prior value.
  Impact: Existing shared Sequence needs an explicit erased C++ object-address binding for Any extraction; copying into a detached raw handle would not update its original value owner.
  Resolution: Expose the existing sole pointer cell through a documented getAddress compiler binding, without allocating another owner or changing lifetime/counter algorithms. Test extraction into a normal constructed Sequence; include existing Sequence tests in whole-owner coverage.

- Observation: Checkpoint: actual TabStop/TabAlign IDL bindings and initialized Sequence object-address syntax now pass9tests/3files; whole3shared runtime owners raw S108/B54/F41/L103100. Full native tab item and locale/Writer migration remain pending.
  Impact: Real typed transport dependency is implemented and source inventory updated, without adding another allocator/counter/lifetime engine. This is not task completion or Calc UI/ODS readiness.
  Resolution: Continue same task156 at source numeric-locale providers/fallback and SvxTabStop/SvxTabStopItem; retain complete130path acceptance contract and run whole Calc/build/browser/final gates only when the approved boundary is ready. Preliminary docs/lint type-only fixture issues fixed; inventory/provenance/size/typecheck pass.

- Observation: Native tab values now use independent scalar-reference cells and SortedVector value-copy insertion; numeric resource binding embeds285source decimal fields and306source language fallback projections. Initial scoped run32passed/3failed.
  Impact: Two failures are old Which-sensitive equality and enum-range assertions; one new golden mistakenly expected Portuguese dot despite the source comma. Initial typecheck failures were native const-reference input typing and using JS strings directly in OUString constructors.
  Resolution: Keep source payload equality and integer enum admission, correct Portuguese golden from native resource, accept const borrowed tab inputs and use actual known-length OUString construction. No fake locale-service or lifetime facade; full transport/Writer migration still pending.

- Observation: Resource provenance records were rejected because the canonical provenance schema accepts runtime TypeScript modules, not JSON assets. A build invocation also referenced a nonexistent task155 standalone wrapper before any build started.
  Impact: No implementation or verification criteria change is needed; data files remain explicit capability/provider evidence with296source pins. No build result was claimed.
  Resolution: Remove only the two newly created invalid resource-only provenance records, keep resource paths in the existing capability/provider evidence and use the existing task154 portable build wrapper adapted to task156. Preserve failed logs and rerun only affected gates/build.

- Observation: Value/resource checkpoint passes54related/187Calc/41boundary tests, raw100 for7shared/33Calc owners, all13gates/build and296source pins. Nonvirtual native value-copy semantics, real locale data, ASCII-only lookup/case and numeric variant/script distinction are corrected.
  Impact: Writer now reuses real resolved decimal defaults and independent sorted tab values. No general locale service/LanguageTag facade or translated UI names added. Native SvxTabStopItem typed transport/merge/hash and explicit Writer persistence migration still require completion within this task.
  Resolution: Keep task156 DOING and preserve complete acceptance scope. Resource JSON is recorded as capability/provider evidence under existing inventory schema, not by relaxing runtime provenance. After completing tab contracts, audit actual ScDocumentPool/model UI+ODS blockers instead of unrelated Writer features or localization. Keep user full-run readiness/pause rule.

- Observation: Item/Writer migration initially failed typecheck because old static JSON constructors, detached-list getters and tab JSON QueryValue assertions remained in dependent tests and four browser scenarios. A follow-up narrowed snapshot value with an intersection that retained the generic JSON array overload and still rejected object spreads. An optional user-instructions read also reported the file absent; no instruction content was assumed.
  Impact: These are in-scope migration/type declaration failures, not grounds for preserving the nonnative core API. Logs typecheck-item-migration.log and typecheck-item-migration2.log are retained.
  Resolution: Use original item construction/Count/At in core consumers and the existing Writer codec at JSON boundaries, including test fixtures. Add a concrete browser snapshot overload with the generic value property replaced, rather than intersected. Typecheck-item-migration3.log passes. New real typed item regression tests and related Writer coverage are running; full task verification remains pending.

- Observation: First complete item migration selection reports322passed and25failed across30files. Failures are an incorrect string-address input in the new UNO test, a stale numeric host QueryValue call in a Writer test helper, former unresolved-nul decimal goldens, and deep structural equality comparing closure-valued native vector comparators.
  Impact: Actual source-default decimal is now resolved at construction. The core must not regain JSON/numeric host overloads to satisfy outdated tests. No full verification or coverage success is claimed.
  Resolution: Use OUString.getDataAddress at actual Any construction, explicit Writer codec in the helper, source-backed dot expectations under the test locale, and the native item equality contract. Retain initial failure logs and rerun the related selection.

- Observation: Related347tests/30files pass and all10expected shared executable owners are measured, every raw S624/B337/F105/L523counter positive. Initial source gate batch has9passes/4failures: lint rejects13test-only non-null assertions, docs finds8imports inserted before required opening fileoverview; provenance and inventory were mistakenly started while the portable Calc run temporarily removed source links.
  Impact: The two source-evidence failures are invalid scheduling, not missing upstream data or permission. Do not accept their results or weaken validations. Calc run remains live; source evidence must be rechecked after its finally restores references.
  Resolution: Keep item-source-gates-results.json and failure logs. Replace test-only assertions with tuple/iteration structure, restore opening comments, and rerun lint/docs and both native-dependent checks after reference restoration. No native reference reads while source-absent suites are running.

- Observation: Final shared347/Calc187tests pass at raw100, all13source gates pass with references present, and portable build passes. Browser collection fails before tests because Node ESM requires JSON import attributes for the two embedded locale data imports. Review also found Writer snapshot decoding would resolve an explicitly post-construction nul decimal again, losing saved state. CLI help for an assumed task persist command was rejected; no lifecycle change resulted.
  Impact: Browser acceptance is not passed. The JSON import issue is a standard module declaration fix; snapshot restoration must preserve actual scalar fields without changing native constructor/UNO behavior.
  Resolution: Use the repository's existing with type json import syntax, restore decoded decimal through the native mutable getter after constructor validation, add an explicit nul field codec regression, and rerun affected acceptance. Retain browser failure log and prior passed raw audits. No new compatibility/core JSON facade or native lifetime library.

- Observation: All remaining migration failures are resolved. Final348related/187Calc/19browser scenarios, all13source gates and302native pins pass. Whole shared/Calc raw coverage is100 with exact expected owner sets and all counters positive. Standard JSON import attributes repair Node collection; explicit mutable decimal restoration preserves saved nul without changing core constructor or UNO normalization. Historical source-document formatting was retained after removing unintended formatter reflow; no source formatting waiver or validation relaxation.
  Impact: Approved tab-stop boundary and Writer consumers are complete within102cumulative non-agent paths. This closes the native paragraph tab dependency, not actual Calc document/UI/ODS readiness.
  Resolution: Record final audit item-stage-verification.json and source hashes, perform same-agent quality review, commit only scoped source/task artifacts and finish this task. Next work must inspect real ScDocumentPool/model and actual text-object blockers needed for UI/ODS, not unrelated Writer/localization work. Preserve user's readiness-triggered full-run/pause rule.

- Observation: Initial implementation commit was rejected by the installed subject validator after staging81intentional paths; the gateway generic example does not satisfy the enforced emoji/task-suffix/scope format. No commit or source change occurred.
  Impact: Verification evidence and reviewed source hashes remain unchanged. Staged paths are the intended80source files plus this task README.
  Resolution: Reuse the same scoped index, record this finding through CLI, and retry with the enforced83QB3Ysubject format. No force, bypass, unstage-other or broad staging operation.
