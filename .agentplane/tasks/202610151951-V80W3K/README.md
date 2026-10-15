---
id: "202610151951-V80W3K"
title: "Implement original shared string pool interning and purge"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-15T19:51:45.557Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-15T19:58:41.977Z"
  updated_by: "CODER"
  note: "PASS: node output/playwright/task167-checks/portable.mjs:67 related tests/6files,187Calc/76files; exact1 shared pool owner raw S83/B18/F16/L77 and33Calc S4179/B2731/F821/L3727 all positive100. All4 original pool QA scenarios, aliases/static/empty/locale/nul/surrogates/collisions/caller survival/exception ordering covered. native-audit.mjs pins8 blobs and unchanged key tokens; guard-proof.mjs30 unchanged function bodies. source-gates.mjs all13,including43 boundary tests, pass. build-browser-portable.mjs production build and1 actual Chromium pool scenario pass. Four reference links absent during runtime, restored exactly. final-verification.json retained; no full-suite/UI+ODS milestone or independent review claim."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-15T19:58:43.419Z"
  updated_by: "EVALUATOR"
  note: "Same-agent review: actual SharedStringPool identity mapping and two-pass purge follow source and all4 native QA scenarios."
  evaluated_sha: "d334f72d208d105b6a13488a3c18e6ceea14b8d4"
  blueprint_digest: "729b990e69ba7cefae9cf244d20b34a8da6cb2dfbf244bca7632a2640428675a"
  evidence_refs:
    - ".agentplane/tasks/202610151951-V80W3K/README.md"
    - ".agentplane/tasks/202610151951-V80W3K/quality/20261015-195843419-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610151951-V80W3K/quality/20261015-195843419-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610151951-V80W3K/quality/20261015-195843419-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610151951-V80W3K/blueprint/resolved-snapshot.json"
    - "output/playwright/task167-checks/final-verification.json"
    - "output/playwright/task167-checks/native-audit.json"
    - "output/playwright/task167-checks/guard-proof.json"
  findings:
    - "Reviewed original initial insertion, uppercase equality/existing-key/new-key paths and purge order over real shared values. JS UTF16 Map/Set is a documented value-equality binding; no new native hash/lifetime engine or fake full CharClass provider."
    - "67 related tests,187Calc,production build,Chromium pool scenario and13 gates pass. Raw100 exact owner sets,8 native pins,unchanged StringWithHash/hash declarations and30 guard bodies verified."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement actual original string-pool map and two-pass purge using existing string values and a bounded borrowed uppercase contract without new lifetime machinery."
events:
  -
    type: "status"
    at: "2026-10-15T19:51:46.801Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement actual original string-pool map and two-pass purge using existing string values and a bounded borrowed uppercase contract without new lifetime machinery."
  -
    type: "verify"
    at: "2026-10-15T19:58:41.977Z"
    author: "CODER"
    state: "ok"
    note: "PASS: node output/playwright/task167-checks/portable.mjs:67 related tests/6files,187Calc/76files; exact1 shared pool owner raw S83/B18/F16/L77 and33Calc S4179/B2731/F821/L3727 all positive100. All4 original pool QA scenarios, aliases/static/empty/locale/nul/surrogates/collisions/caller survival/exception ordering covered. native-audit.mjs pins8 blobs and unchanged key tokens; guard-proof.mjs30 unchanged function bodies. source-gates.mjs all13,including43 boundary tests, pass. build-browser-portable.mjs production build and1 actual Chromium pool scenario pass. Four reference links absent during runtime, restored exactly. final-verification.json retained; no full-suite/UI+ODS milestone or independent review claim."
doc_version: 3
doc_updated_at: "2026-10-15T19:58:42.036Z"
doc_updated_by: "CODER"
description: "Task167: implement actual SharedStringPool with original uppercase mapping identity and two-pass purge through existing OUString/SharedString owners; borrowed uppercase receiver contract, no fake full CharClass/UNO or new lifetime engine."
sections:
  Summary: "Task167 adds the real shared SharedStringPool interning/uppercase identity map, two-pass purge and counts required by Calc document construction. Reuse existing actual string owners and task166 uppercase operation; native heap management remains JS GC."
  Scope: "svl/source/misc/sharedstringpool.ts existing key owner plus actual pool, new svl/inc/sharedstringpool.ts public boundary, erased CharClassUppercaseReference borrowed operation contract in unotools/inc/charclass.ts, focused native-sharedstringpool.test.ts, related shared e2e pool test if useful. Associated exact runtime/provenance/capability records (including existing string key and CharClass header records), calc-ui-readiness.md and necessary source-backed dependency edges. Up to20 non-task paths. No new CharClass/UNO implementation, new reference counters, weak/finalization/lifetime allocator, native compiler/probe, compatibility shim, full suite or UI/ODS readiness claim."
  Plan: "1. Preserve original SharedStringPool map algorithm and static empty identity using genuine OUString, StringWithHash and SharedString. Bind std::unordered_map value equality to native JS UTF16 Map keys; no custom hash-table library. 2. Preserve existing uppercase and upper->upper reuse paths, caller state, default empty entry, original two-pass purge conditions through existing SAL value state, unit-test counts and map-owned value release. No additional memory manager. 3. Express only source-consumed borrowed uppercase receiver type; tests bind actual task166 operation to actual prepared Locale, not a fake production service. Full CharClass construction remains explicit missing dependency. 4. Port all4 native SharedStringPool QA scenarios and meaningful locale/alias/collision/nul/surrogate/throw paths, test held strings survive purge/pool destruction. 5. Strict raw100 changed shared/allCalc, related Writer tests,13 source gates, native source audit, truthful inventory and same-agent evaluator closure."
  Verify Steps: "Audit pinned include/svl/sharedstringpool.hxx, svl/source/misc/sharedstringpool.cxx and svl/qa/unit/svl.cxx testSharedStringPool/testSharedStringPoolPurge/testSharedStringPoolPurgeBug1/testSharedStringPoolEmptyString. Preserve existing StringWithHash declaration token hash. Run related Vitest pool/key/sharedstring/uppercase and Writer tests with4 reference links absent/restored. Require exact changed shared executable owner raw positive S/B/F/L100 and exact33 Calc owners raw100. Exercise original identity mappings/count/purge scenarios, live caller OUString or SharedString views, static/empty values, Unicode locales and equal-hash unequal keys. Run13 source gates including boundary tests/inventory/provenance, production build plus focused shared browser pool acceptance. Record native audit without compilation, commit and same-agent evaluator; no full all-app run before minimum UI+ODS milestone."
  Verification: |-
    Pending source implementation and checks.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-15T19:58:41.977Z — VERIFY — ok

    By: CODER

    Note: PASS: node output/playwright/task167-checks/portable.mjs:67 related tests/6files,187Calc/76files; exact1 shared pool owner raw S83/B18/F16/L77 and33Calc S4179/B2731/F821/L3727 all positive100. All4 original pool QA scenarios, aliases/static/empty/locale/nul/surrogates/collisions/caller survival/exception ordering covered. native-audit.mjs pins8 blobs and unchanged key tokens; guard-proof.mjs30 unchanged function bodies. source-gates.mjs all13,including43 boundary tests, pass. build-browser-portable.mjs production build and1 actual Chromium pool scenario pass. Four reference links absent during runtime, restored exactly. final-verification.json retained; no full-suite/UI+ODS milestone or independent review claim.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T19:57:10.978Z, excerpt_hash=sha256:c3826c55c6f7ad5b78c036ca219df5d3d916b4f7d49a835b516384c95358b934

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610151951-V80W3K/blueprint/resolved-snapshot.json
    - old_digest: 729b990e69ba7cefae9cf244d20b34a8da6cb2dfbf244bca7632a2640428675a
    - current_digest: 729b990e69ba7cefae9cf244d20b34a8da6cb2dfbf244bca7632a2640428675a
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610151951-V80W3K

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610151951-V80W3K
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task167 source/test/registry/docs changes via a follow-up task; retain task166/166a and existing string owners. No git reset, branch merge or global files."
  Findings: |-
    - Observation: Initial related run:66 pass,1 new collision assertion fails. The test assumed Java String hash collision Aa/BB, but the reused native OUString hash is different (5240 versus5246). All four original pool QA scenarios and existing full key/shared-value corpora pass.
      Impact: The collision witness was invalid; no production equality or hash change is warranted.
      Resolution: Use Ag/BB, whose actual native37-based OUString hashes coincide, retain unequal UTF16 keys and rerun the affected profile. Preserve failed log before rerun.

    - Observation: Related67/6files and Calc187/76files pass; exact pool owner raw S83/B18/F16/L77 and33Calc S4179/B2731/F821/L3727 all positive100. Source dependency gate requires original svl->unotools edge, witnessed by SharedStringPool include and Library_svl utl linkage. Native source audit initially named an inline constructor in sharedstring.cxx; the actual cxx marker is SharedString::getEmptyString.
      Impact: Only genuine source edge registration and evidence-marker correction were needed; no runtime production defect or new lifetime mechanism found.
      Resolution: Register the single source-backed edge, retain guard algorithms, rerun failed/pending source checks, then production build and actual Chromium pool acceptance. Native audit pins8 original blobs and preserves both existing key declaration token hashes.
id_source: "generated"
---
## Summary

Task167 adds the real shared SharedStringPool interning/uppercase identity map, two-pass purge and counts required by Calc document construction. Reuse existing actual string owners and task166 uppercase operation; native heap management remains JS GC.

## Scope

svl/source/misc/sharedstringpool.ts existing key owner plus actual pool, new svl/inc/sharedstringpool.ts public boundary, erased CharClassUppercaseReference borrowed operation contract in unotools/inc/charclass.ts, focused native-sharedstringpool.test.ts, related shared e2e pool test if useful. Associated exact runtime/provenance/capability records (including existing string key and CharClass header records), calc-ui-readiness.md and necessary source-backed dependency edges. Up to20 non-task paths. No new CharClass/UNO implementation, new reference counters, weak/finalization/lifetime allocator, native compiler/probe, compatibility shim, full suite or UI/ODS readiness claim.

## Plan

1. Preserve original SharedStringPool map algorithm and static empty identity using genuine OUString, StringWithHash and SharedString. Bind std::unordered_map value equality to native JS UTF16 Map keys; no custom hash-table library. 2. Preserve existing uppercase and upper->upper reuse paths, caller state, default empty entry, original two-pass purge conditions through existing SAL value state, unit-test counts and map-owned value release. No additional memory manager. 3. Express only source-consumed borrowed uppercase receiver type; tests bind actual task166 operation to actual prepared Locale, not a fake production service. Full CharClass construction remains explicit missing dependency. 4. Port all4 native SharedStringPool QA scenarios and meaningful locale/alias/collision/nul/surrogate/throw paths, test held strings survive purge/pool destruction. 5. Strict raw100 changed shared/allCalc, related Writer tests,13 source gates, native source audit, truthful inventory and same-agent evaluator closure.

## Verify Steps

Audit pinned include/svl/sharedstringpool.hxx, svl/source/misc/sharedstringpool.cxx and svl/qa/unit/svl.cxx testSharedStringPool/testSharedStringPoolPurge/testSharedStringPoolPurgeBug1/testSharedStringPoolEmptyString. Preserve existing StringWithHash declaration token hash. Run related Vitest pool/key/sharedstring/uppercase and Writer tests with4 reference links absent/restored. Require exact changed shared executable owner raw positive S/B/F/L100 and exact33 Calc owners raw100. Exercise original identity mappings/count/purge scenarios, live caller OUString or SharedString views, static/empty values, Unicode locales and equal-hash unequal keys. Run13 source gates including boundary tests/inventory/provenance, production build plus focused shared browser pool acceptance. Record native audit without compilation, commit and same-agent evaluator; no full all-app run before minimum UI+ODS milestone.

## Verification

Pending source implementation and checks.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-15T19:58:41.977Z — VERIFY — ok

By: CODER

Note: PASS: node output/playwright/task167-checks/portable.mjs:67 related tests/6files,187Calc/76files; exact1 shared pool owner raw S83/B18/F16/L77 and33Calc S4179/B2731/F821/L3727 all positive100. All4 original pool QA scenarios, aliases/static/empty/locale/nul/surrogates/collisions/caller survival/exception ordering covered. native-audit.mjs pins8 blobs and unchanged key tokens; guard-proof.mjs30 unchanged function bodies. source-gates.mjs all13,including43 boundary tests, pass. build-browser-portable.mjs production build and1 actual Chromium pool scenario pass. Four reference links absent during runtime, restored exactly. final-verification.json retained; no full-suite/UI+ODS milestone or independent review claim.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T19:57:10.978Z, excerpt_hash=sha256:c3826c55c6f7ad5b78c036ca219df5d3d916b4f7d49a835b516384c95358b934

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610151951-V80W3K/blueprint/resolved-snapshot.json
- old_digest: 729b990e69ba7cefae9cf244d20b34a8da6cb2dfbf244bca7632a2640428675a
- current_digest: 729b990e69ba7cefae9cf244d20b34a8da6cb2dfbf244bca7632a2640428675a
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610151951-V80W3K

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610151951-V80W3K
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task167 source/test/registry/docs changes via a follow-up task; retain task166/166a and existing string owners. No git reset, branch merge or global files.

## Findings

- Observation: Initial related run:66 pass,1 new collision assertion fails. The test assumed Java String hash collision Aa/BB, but the reused native OUString hash is different (5240 versus5246). All four original pool QA scenarios and existing full key/shared-value corpora pass.
  Impact: The collision witness was invalid; no production equality or hash change is warranted.
  Resolution: Use Ag/BB, whose actual native37-based OUString hashes coincide, retain unequal UTF16 keys and rerun the affected profile. Preserve failed log before rerun.

- Observation: Related67/6files and Calc187/76files pass; exact pool owner raw S83/B18/F16/L77 and33Calc S4179/B2731/F821/L3727 all positive100. Source dependency gate requires original svl->unotools edge, witnessed by SharedStringPool include and Library_svl utl linkage. Native source audit initially named an inline constructor in sharedstring.cxx; the actual cxx marker is SharedString::getEmptyString.
  Impact: Only genuine source edge registration and evidence-marker correction were needed; no runtime production defect or new lifetime mechanism found.
  Resolution: Register the single source-backed edge, retain guard algorithms, rerun failed/pending source checks, then production build and actual Chromium pool acceptance. Native audit pins8 original blobs and preserves both existing key declaration token hashes.
