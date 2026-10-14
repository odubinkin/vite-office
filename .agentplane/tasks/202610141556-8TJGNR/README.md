---
id: "202610141556-8TJGNR"
title: "Restore canonical shared font-family attribute state and migrate Writer consumers"
result_summary: "Restore canonical font-family values and shared ODF font metadata"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-14T15:57:05.680Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-14T16:55:43.500Z"
  updated_by: "CODER"
  note: "Verified canonical shared font values and actual Writer/ODF consumers:411related cases/68files and175Calc cases/68files;10shared and33Calc owners every raw counter positive,100percent;8Chromium and36boundary cases,production build,12source gates. Exact97source paths/24runtime-provenance pairs/3751hashes/10native pins/calcbranch. SixWriter-only gaps explicitly exempt; fullUI/ODS/nativeFontDescriptor remain pending. Same-agent quality is not independent."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-14T16:55:19.026Z"
  updated_by: "EVALUATOR"
  note: "Canonical shared font values, actual Writer consumers and ODF metadata satisfy approved task135 scope; same-agent review is not independent."
  evaluated_sha: "a16c186d0c61b9c5ee322ddbb0a7e904f052a78d"
  blueprint_digest: "7b20c3203d26737c6466960d4b24cecde434bda00edaf1efccd6c52adb70724b"
  evidence_refs:
    - ".agentplane/tasks/202610141556-8TJGNR/README.md"
    - ".agentplane/tasks/202610141556-8TJGNR/quality/20261014-165519026-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610141556-8TJGNR/quality/20261014-165519026-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610141556-8TJGNR/quality/20261014-165519026-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610141556-8TJGNR/blueprint/resolved-snapshot.json"
    - "output/playwright/task135-checks/verification.json"
    - "output/playwright/task135-checks/inventory-final.log"
  findings:
    - "Compared native five-field defaults/constructors/setters/equality/hash, full pool comparator/name allocation and original Add return with pinned sources; reuses existing shared SortedVector and SAL/o3tl without a second lifetime engine."
    - "Actual history/browser/3script ODT tests,411related cases and175Calc cases pass; all10changedshared and33Calc owners have positive raw coverage counters. Build and8Chromium cases pass without reference links;36boundary cases and12source gates pass."
    - "Exact97paths within100approved,24runtime/provenance pairs, zero semantic inventory violations,3751source hashes and10native pins audited. Writer-only gaps in6owners remain explicitly exempt, not silently certified."
commit:
  hash: "a16c186d0c61b9c5ee322ddbb0a7e904f052a78d"
  message: "Implement 8TJGNR core: canonical font values and shared ODF metadata"
comments:
  -
    author: "CODER"
    body: "Start: restore canonical shared font attribute and migrate actual Writer consumers under explicit human authorization; no duplicate or compatibility item."
  -
    author: "CODER"
    body: "Verified: canonical shared font values and complete supported Writer ODF metadata;411related,175Calc,8browser and36boundary cases pass; changedshared/Calc raw100; exact97paths and native pins retained."
events:
  -
    type: "status"
    at: "2026-10-14T15:57:16.976Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore canonical shared font attribute and migrate actual Writer consumers under explicit human authorization; no duplicate or compatibility item."
  -
    type: "verify"
    at: "2026-10-14T16:55:43.500Z"
    author: "CODER"
    state: "ok"
    note: "Verified canonical shared font values and actual Writer/ODF consumers:411related cases/68files and175Calc cases/68files;10shared and33Calc owners every raw counter positive,100percent;8Chromium and36boundary cases,production build,12source gates. Exact97source paths/24runtime-provenance pairs/3751hashes/10native pins/calcbranch. SixWriter-only gaps explicitly exempt; fullUI/ODS/nativeFontDescriptor remain pending. Same-agent quality is not independent."
  -
    type: "status"
    at: "2026-10-14T16:55:53.652Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: canonical shared font values and complete supported Writer ODF metadata;411related,175Calc,8browser and36boundary cases pass; changedshared/Calc raw100; exact97paths and native pins retained."
doc_version: 3
doc_updated_at: "2026-10-14T16:55:53.653Z"
doc_updated_by: "CODER"
description: "Task135: source-faithful SvxFontItem value fields/constructors/default/copy/get-set/equality/hash/clone, shared FontFamily/FontPitch and charset declarations, exact Calc100/111/116 IDs and owned defaults tests; remove item-local resolved/generic CSS state and migrate Writer/filter/browser snapshot consumers to canonical state. Native Any FontDescriptor transport remains separately unported, no fake helper/lifecycle. Standing human shared/Writer canonical correction authorization and UI/ODS priority."
sections:
  Summary: "Task135 restores source-faithful shared SvxFontItem value state required by ScDocPool and removes non-native resolved/generic CSS fields. Reuse the one shared class and migrate actual Writer/browser/ODT/history consumers. Explicit human authorization permits canonical shared/Writer fixes; native JS immutable strings adapt OUString character values at this existing browser item boundary, without a new lifetime engine. Only calc checkout/branch."
  Scope: "At most100paths, expected about50-75 including inventory: existing textitem font body moved into canonical textitem.font.ts native shard plus fontitem.ts header; tools FontFamily/FontPitch and SAL textenc numeric declarations; native font item tests, all materially affected Writer/filter/browser constructors/readers/snapshots/tests; canonical ODF generic-family mapping in shared xmloff if needed; existing native font default device adapter corrected where it stored resolution in the item; Calc100/111/116 declarations/default tests. Exact affected runtime/provenance/capability records, dependency ownership tests and calc-core progress. No duplicate font item, legacy compatibility fields/constructor, fake font discovery, C++ generation/build/native probes or new memory machinery. Native Any FontDescriptor transport and full font/device/config services remain explicit pending rather than stubbed."
  Plan: "Task135: restore one native shared font-family value owner, original family/pitch/charset declarations, full field constructors/default/copy/get-set/clone/equality/hash; remove non-native item-local CSS/device fields and migrate actual Writer/ODT/history/browser consumers and relevant tests. Calc100/111/116 real item-set default ownership. Scope100paths incl exact inventory, expected50-75. Strict changedshared/Calc100; Writer-only coverage exemption, related browser/build if needed;12gates/boundaries/nativepins/exactsource clean. No C++/memory engine or fake Any FontDescriptor; full UI/ODS checkpoint still pending. Standing human shared/Writer canonical correction authorization."
  Verify Steps: "Source-faithful native font defaults empty names/FAMILY_SWISS/PITCH_VARIABLE/DONTKNOW and Which0default, all native value ctor fields, valid empty/whitespace strings, independent copy/clone, idempotent and changed setters, all5field equality and native hash order including Which. Actual enum/encoding values and JS UTF16 string hash must use existing SAL/o3tl mechanisms, no replacement hash library or binary layout claim. Browser snapshot keeps all fields across item-codec/SwAttrPool/history; ODT family/pitch/name/style mapping reflects native enums and retains relevant document properties, no item-local resolved CSS metadata. Writer default device presentation and stored value behavior source-reviewed; actual generic-family mapping source-reviewed. Materially related tests and narrow browser formatting/ODT cases pass. Strict raw S/B/F/L100 and every raw counter positive for all changed shared executable owners; npm run test:coverage:calc100,4native links absent/restoredfinally. Writer-only uncovered counters are reported and left unchanged per explicit human exemption; no threshold or counter-map change.12format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff gates and boundaries. Exact task allowlist/nativepins/sourcehashes/final clean calc. Native FontDescriptor Any, full services/rendering/font discovery/ABI/full UI/ODS remain unverified, no full-checkpoint claim."
  Verification: |-
    - Command: `node output/playwright/task135-checks/final-portable.mjs` and `node output/playwright/task135-checks/portable.mjs --calc-only`.
    - Result: pass.
    - Evidence: 411 related tests/68files, 10complete changed shared executable owners raw S1177/B965/F180/L1110 all positive; 175Calc tests/68files, 33owners raw S4165/B2731/F821/L3713 all positive. Production build and8Chromium cases in4Writer spec files pass. All4native reference links absent throughout portable commands and restored in finally.
    - Scope: native font value/default/copy/mutation/hash, actual Writer history/snapshot, full supported3script ODF font metadata, comparator/naming/return behavior and resource aliases. Existing shared SortedVector tests included. The combined related instrumentation uses command-local aggregate thresholds0 solely to measure exempt Writer owners; the runner independently rejects any nonpositive raw shared counter. No repository test threshold, counter map or runtime exclusion was changed. Six Writer-only gap owners remain reported and unrepaired per human instruction.

    - Command: `npm run format:check`, final `npx prettier --check` over46changed source paths; scoped `npx eslint ... --max-warnings 0`; `npm run typecheck`; `npm run check:docs`; `npm run check:file-size`; `npm run check:dependencies`; `npm run check:source-tree`; `npm run check:source-provenance`; `npm run inventory:parity`; `node .agentplane/policy/check-routing.mjs`; `ap doctor`; `git diff --check`; `npx vitest run scripts/check-module-boundaries.test.ts`.
    - Result: pass.
    - Evidence: 1862authored JSDoc files, 617runtime dependency owners/2768relative imports/91allowed edges, 114required source-tree paths/33retired roots, 618provenance/runtime records, zero semantic violations,36boundary cases. Existing doctor hook-shim warning remains outside scope. txtparae.ts984lines remains below enforced1000limit through type-only handoff extraction.
    - Scope: exact97approved source/doc/inventory paths, 24runtime/provenance pairs and one new bounded capability; no existing broad parity/default/status promotion. Source fingerprint3731to3751files,77existing changes/20new/3654unchanged;10native source pins and4reference symlinks retained, calcbranch. Evidence: `output/playwright/task135-checks/verification.json` and final gate logs.

    No full-suite command was run: human moved that checkpoint to actual minimal connected UI plus same-model ODS readiness. That milestone is not reached. Full native FontDescriptor Any/presentation/device services and real Calc document/pool/storage/UI/ODS remain pending; no native memory/lifetime emulation added. Same-agent EVALUATOR review is not independent.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-14T16:55:43.500Z — VERIFY — ok

    By: CODER

    Note: Verified canonical shared font values and actual Writer/ODF consumers:411related cases/68files and175Calc cases/68files;10shared and33Calc owners every raw counter positive,100percent;8Chromium and36boundary cases,production build,12source gates. Exact97source paths/24runtime-provenance pairs/3751hashes/10native pins/calcbranch. SixWriter-only gaps explicitly exempt; fullUI/ODS/nativeFontDescriptor remain pending. Same-agent quality is not independent.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-14T16:54:55.811Z, excerpt_hash=sha256:18f629acf415e6f0cbbbe60fa9163a0001a6af0486d3763fec2ebe686f4d12c4

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610141556-8TJGNR/blueprint/resolved-snapshot.json
    - old_digest: 7b20c3203d26737c6466960d4b24cecde434bda00edaf1efccd6c52adb70724b
    - current_digest: 7b20c3203d26737c6466960d4b24cecde434bda00edaf1efccd6c52adb70724b
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610141556-8TJGNR

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610141556-8TJGNR -m 🧩 8TJGNR task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task intentional changes in a later authorized task; never reset unrelated work, merge or publish."
  Findings: |-
    Task135 finishes the existing canonical shared-font migration, including actual Writer/browser/ODT consumers under explicit human authorization. Old resolved/generic CSS item fields and legacy constructors are removed; native five-field values are retained across actual owned clones, history and browser persistence. Native ODF key equivalence, naming, pitch/family mapping, default encoding and Symbol-only charset export are preserved. Add first-insertion empty return is recorded as CALC-114, not repaired. Shared SortedVector is reused instead of a second ordered container, with JS GC owning entries and no custom lifetime/refcount mechanism. FontDescriptor Any and full device/config/font services remain genuinely pending, not stubbed.

    Focused validation initially exposed obsolete old font snapshots, missing source-backed metadata evidence and reexport-versus-local-declaration inventory markers. These were corrected in the actual source/test/records without weakening validators. A real ODT embedded-resource alias conflict was fixed: native fontFilesMap permits distinct declaration face names for one package URI, while existing resource family/style/weight/format conflicts remain rejected. The pre-existing Manbow fixture now compares resource payload independently of declaration-local aliases. Original numeric fixture expectations and all unrelated source hashes remain intact. Native OUString trim removes ASCIIcontrol/space prefixes only; non-ASCII spaces are retained and tested.

    Writer-only coverage gaps remain in item-codec, writer-view-projection, swatrset, doc, poolfmt-defaults and xmlimp. They are measured and explicitly exempt per human instruction, with every changed shared counter still positive. Production build keeps the existing chunk-size advisory; doctor keeps the existing managed hook-shim warning. No scope expansion beyond97of100approved paths, network, external write, C++probe/build/generator, sanitizer, fake provider or native memory engine. Full goal remains incomplete; next full run only at actual UI/ODS minimum then requested pause. Same-agent EVALUATOR evidence is explicitly not independent.
id_source: "generated"
---
## Summary

Task135 restores source-faithful shared SvxFontItem value state required by ScDocPool and removes non-native resolved/generic CSS fields. Reuse the one shared class and migrate actual Writer/browser/ODT/history consumers. Explicit human authorization permits canonical shared/Writer fixes; native JS immutable strings adapt OUString character values at this existing browser item boundary, without a new lifetime engine. Only calc checkout/branch.

## Scope

At most100paths, expected about50-75 including inventory: existing textitem font body moved into canonical textitem.font.ts native shard plus fontitem.ts header; tools FontFamily/FontPitch and SAL textenc numeric declarations; native font item tests, all materially affected Writer/filter/browser constructors/readers/snapshots/tests; canonical ODF generic-family mapping in shared xmloff if needed; existing native font default device adapter corrected where it stored resolution in the item; Calc100/111/116 declarations/default tests. Exact affected runtime/provenance/capability records, dependency ownership tests and calc-core progress. No duplicate font item, legacy compatibility fields/constructor, fake font discovery, C++ generation/build/native probes or new memory machinery. Native Any FontDescriptor transport and full font/device/config services remain explicit pending rather than stubbed.

## Plan

Task135: restore one native shared font-family value owner, original family/pitch/charset declarations, full field constructors/default/copy/get-set/clone/equality/hash; remove non-native item-local CSS/device fields and migrate actual Writer/ODT/history/browser consumers and relevant tests. Calc100/111/116 real item-set default ownership. Scope100paths incl exact inventory, expected50-75. Strict changedshared/Calc100; Writer-only coverage exemption, related browser/build if needed;12gates/boundaries/nativepins/exactsource clean. No C++/memory engine or fake Any FontDescriptor; full UI/ODS checkpoint still pending. Standing human shared/Writer canonical correction authorization.

## Verify Steps

Source-faithful native font defaults empty names/FAMILY_SWISS/PITCH_VARIABLE/DONTKNOW and Which0default, all native value ctor fields, valid empty/whitespace strings, independent copy/clone, idempotent and changed setters, all5field equality and native hash order including Which. Actual enum/encoding values and JS UTF16 string hash must use existing SAL/o3tl mechanisms, no replacement hash library or binary layout claim. Browser snapshot keeps all fields across item-codec/SwAttrPool/history; ODT family/pitch/name/style mapping reflects native enums and retains relevant document properties, no item-local resolved CSS metadata. Writer default device presentation and stored value behavior source-reviewed; actual generic-family mapping source-reviewed. Materially related tests and narrow browser formatting/ODT cases pass. Strict raw S/B/F/L100 and every raw counter positive for all changed shared executable owners; npm run test:coverage:calc100,4native links absent/restoredfinally. Writer-only uncovered counters are reported and left unchanged per explicit human exemption; no threshold or counter-map change.12format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff gates and boundaries. Exact task allowlist/nativepins/sourcehashes/final clean calc. Native FontDescriptor Any, full services/rendering/font discovery/ABI/full UI/ODS remain unverified, no full-checkpoint claim.

## Verification

- Command: `node output/playwright/task135-checks/final-portable.mjs` and `node output/playwright/task135-checks/portable.mjs --calc-only`.
- Result: pass.
- Evidence: 411 related tests/68files, 10complete changed shared executable owners raw S1177/B965/F180/L1110 all positive; 175Calc tests/68files, 33owners raw S4165/B2731/F821/L3713 all positive. Production build and8Chromium cases in4Writer spec files pass. All4native reference links absent throughout portable commands and restored in finally.
- Scope: native font value/default/copy/mutation/hash, actual Writer history/snapshot, full supported3script ODF font metadata, comparator/naming/return behavior and resource aliases. Existing shared SortedVector tests included. The combined related instrumentation uses command-local aggregate thresholds0 solely to measure exempt Writer owners; the runner independently rejects any nonpositive raw shared counter. No repository test threshold, counter map or runtime exclusion was changed. Six Writer-only gap owners remain reported and unrepaired per human instruction.

- Command: `npm run format:check`, final `npx prettier --check` over46changed source paths; scoped `npx eslint ... --max-warnings 0`; `npm run typecheck`; `npm run check:docs`; `npm run check:file-size`; `npm run check:dependencies`; `npm run check:source-tree`; `npm run check:source-provenance`; `npm run inventory:parity`; `node .agentplane/policy/check-routing.mjs`; `ap doctor`; `git diff --check`; `npx vitest run scripts/check-module-boundaries.test.ts`.
- Result: pass.
- Evidence: 1862authored JSDoc files, 617runtime dependency owners/2768relative imports/91allowed edges, 114required source-tree paths/33retired roots, 618provenance/runtime records, zero semantic violations,36boundary cases. Existing doctor hook-shim warning remains outside scope. txtparae.ts984lines remains below enforced1000limit through type-only handoff extraction.
- Scope: exact97approved source/doc/inventory paths, 24runtime/provenance pairs and one new bounded capability; no existing broad parity/default/status promotion. Source fingerprint3731to3751files,77existing changes/20new/3654unchanged;10native source pins and4reference symlinks retained, calcbranch. Evidence: `output/playwright/task135-checks/verification.json` and final gate logs.

No full-suite command was run: human moved that checkpoint to actual minimal connected UI plus same-model ODS readiness. That milestone is not reached. Full native FontDescriptor Any/presentation/device services and real Calc document/pool/storage/UI/ODS remain pending; no native memory/lifetime emulation added. Same-agent EVALUATOR review is not independent.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-14T16:55:43.500Z — VERIFY — ok

By: CODER

Note: Verified canonical shared font values and actual Writer/ODF consumers:411related cases/68files and175Calc cases/68files;10shared and33Calc owners every raw counter positive,100percent;8Chromium and36boundary cases,production build,12source gates. Exact97source paths/24runtime-provenance pairs/3751hashes/10native pins/calcbranch. SixWriter-only gaps explicitly exempt; fullUI/ODS/nativeFontDescriptor remain pending. Same-agent quality is not independent.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-14T16:54:55.811Z, excerpt_hash=sha256:18f629acf415e6f0cbbbe60fa9163a0001a6af0486d3763fec2ebe686f4d12c4

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610141556-8TJGNR/blueprint/resolved-snapshot.json
- old_digest: 7b20c3203d26737c6466960d4b24cecde434bda00edaf1efccd6c52adb70724b
- current_digest: 7b20c3203d26737c6466960d4b24cecde434bda00edaf1efccd6c52adb70724b
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610141556-8TJGNR

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610141556-8TJGNR -m 🧩 8TJGNR task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task intentional changes in a later authorized task; never reset unrelated work, merge or publish.

## Findings

Task135 finishes the existing canonical shared-font migration, including actual Writer/browser/ODT consumers under explicit human authorization. Old resolved/generic CSS item fields and legacy constructors are removed; native five-field values are retained across actual owned clones, history and browser persistence. Native ODF key equivalence, naming, pitch/family mapping, default encoding and Symbol-only charset export are preserved. Add first-insertion empty return is recorded as CALC-114, not repaired. Shared SortedVector is reused instead of a second ordered container, with JS GC owning entries and no custom lifetime/refcount mechanism. FontDescriptor Any and full device/config/font services remain genuinely pending, not stubbed.

Focused validation initially exposed obsolete old font snapshots, missing source-backed metadata evidence and reexport-versus-local-declaration inventory markers. These were corrected in the actual source/test/records without weakening validators. A real ODT embedded-resource alias conflict was fixed: native fontFilesMap permits distinct declaration face names for one package URI, while existing resource family/style/weight/format conflicts remain rejected. The pre-existing Manbow fixture now compares resource payload independently of declaration-local aliases. Original numeric fixture expectations and all unrelated source hashes remain intact. Native OUString trim removes ASCIIcontrol/space prefixes only; non-ASCII spaces are retained and tested.

Writer-only coverage gaps remain in item-codec, writer-view-projection, swatrset, doc, poolfmt-defaults and xmlimp. They are measured and explicitly exempt per human instruction, with every changed shared counter still positive. Production build keeps the existing chunk-size advisory; doctor keeps the existing managed hook-shim warning. No scope expansion beyond97of100approved paths, network, external write, C++probe/build/generator, sanitizer, fake provider or native memory engine. Full goal remains incomplete; next full run only at actual UI/ODS minimum then requested pause. Same-agent EVALUATOR evidence is explicitly not independent.
