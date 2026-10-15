---
id: "202610150608-A7TA3A"
title: "Implement native brush color values for Calc background defaults"
result_summary: "Implemented shared brush color values and native scalar transparency/shading contracts, preserved source getter/hash and reserved transparency behavior, added actual published declarations and honest missing graphic/interface boundaries; UI localization deferred."
status: "DONE"
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
  updated_at: "2026-10-15T06:09:36.557Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-15T06:19:41.798Z"
  updated_by: "CODER"
  note: "Verified20related,186Calc,39boundary tests, strict shared/Calc raw100; all13source gates/build/inventory pass;20paths/3895hashes/10pins/4links audited. Native quirks preserved, graphics/interface services pending, localization deferred; same-agent review not independent."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-15T06:19:40.728Z"
  updated_by: "EVALUATOR"
  note: "Same-agent review, not independent: original non-graphic brush color/default/member family is source-grounded, with explicit unported real graphics/interface providers and deferred UI localization."
  evaluated_sha: "5baebf61e7c4f5e64ccb22ac8bd688cf23bb0ffd"
  blueprint_digest: "fcbe6b407bf1139fa404c02e569e78698773f06a4c8b2d6caa90caa72f5cb2ff"
  evidence_refs:
    - ".agentplane/tasks/202610150608-A7TA3A/README.md"
    - ".agentplane/tasks/202610150608-A7TA3A/quality/20261015-061940728-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610150608-A7TA3A/quality/20261015-061940728-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610150608-A7TA3A/quality/20261015-061940728-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610150608-A7TA3A/blueprint/resolved-snapshot.json"
    - "output/playwright/task147-checks/verification.json"
    - "output/playwright/task147-checks/native-source-audit.json"
    - "output/playwright/task147-checks/source-gates.json"
    - "output/playwright/task147-checks/build-manifest.json"
  findings:
    - "Shared Color/ComplexColor/Any/hash reused; actual color constructors/clone/equality/non-graphic hash/borrowed values/scalar member rules preserve native semantics. No fake Graphic object, security/load code, browser projection or memory manager."
    - "Source-backed regression preserves alpha1 at100percent and getter-induced hash change without equality change (CALC126/127 with CALC113 linkage). Initial test assumption was corrected, not native code altered."
    - "20related,186Calc,39boundary tests pass; every raw counter in3changedsharedowners and33Calcowners positive100. All13source gates/build/inventory pass, zero semantic violations."
    - "Native audit63shading declarations/12positions/version/12members/Calc148;20intentional paths/3895source hashes/10native pins/4restored links. Necessary native source responsibility split documented; no full parity promotion."
commit:
  hash: "5baebf61e7c4f5e64ccb22ac8bd688cf23bb0ffd"
  message: "Implement A7TA3A core: native brush color values"
comments:
  -
    author: "CODER"
    body: "Start: actual non-graphic brush color/default/copy/member behavior for Calc background; shared values reused and missing real graphic/complex providers explicit, localization deferred."
  -
    author: "CODER"
    body: "Verified: native non-graphic brush color family and Calc148default;20related,186Calc,39boundary tests pass with shared/Calc raw100, all source/inventory/build gates and exact native/hash audit."
events:
  -
    type: "status"
    at: "2026-10-15T06:09:43.552Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: actual non-graphic brush color/default/copy/member behavior for Calc background; shared values reused and missing real graphic/complex providers explicit, localization deferred."
  -
    type: "verify"
    at: "2026-10-15T06:19:41.798Z"
    author: "CODER"
    state: "ok"
    note: "Verified20related,186Calc,39boundary tests, strict shared/Calc raw100; all13source gates/build/inventory pass;20paths/3895hashes/10pins/4links audited. Native quirks preserved, graphics/interface services pending, localization deferred; same-agent review not independent."
  -
    type: "status"
    at: "2026-10-15T06:20:19.217Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: native non-graphic brush color family and Calc148default;20related,186Calc,39boundary tests pass with shared/Calc raw100, all source/inventory/build gates and exact native/hash audit."
doc_version: 3
doc_updated_at: "2026-10-15T06:20:19.219Z"
doc_updated_by: "CODER"
description: "Task147 ports original SvxBrushItem non-graphic color/copy/hash/scalar Any contracts and ShadingPattern declarations for actual Calc ATTR_BACKGROUND148. Reuse shared Color/ComplexColor/Any/hash primitives. Real graphic constructors/loaders/interfaces and complex-interface transport remain explicit missing providers; no fake Graphic object or localized presentation work."
sections:
  Summary: "Task147 implements actual brush color-constructor family used by Calc background defaults, not a replacement graphic layer. Reuse shared Color/ComplexColor/Any/hash primitives; retain upstream numeric/default/side-effect contracts. UI localization deferred per latest user instruction."
  Scope: "At most32intentional non-agent paths: editeng frmitems.brush.ts and canonical brushitem.ts header; original SvxGraphicPosition/BRUSH_GRAPHIC_VERSION declarations, published full ShadingPattern constant group; background/shading/transparency member IDs and actual Calc ATTR_BACKGROUND148; related value/Calc tests, matched runtime/provenance/capability and calc-core/suspected-source docs. Port Which-only,Color,Color+ComplexColor,copy/Clone family, native non-graphic equality/hash/isUsed, mutable Color, complex getter final-color side effect, filterColor, shading and numeric graphic-transparency state, actual supported scalar Any methods. Graphics constructors/positions/links/filter/URL/XGraphic loading and actual XComplexColor interfaces remain unported, known unsupported selectors returnfalse explicitly; no fake object/service or security/load code. No extra browser no-argument projection: base unsupported form remains undefined. Localization/GetPresentation deferred; no native memory/move/instance managers. Existing module boundaries reused unchanged."
  Plan: "Port original brush non-graphic value constructor family and actual supported scalar Any behavior using shared values, preserve native transparency/getter side effects and declarations, test actual Calc148default and related shared owners at raw100, honest inventory/source audits/portable build,32path clean calc closure. No fake graphics/complex interfaces, localized UI, memory managers or broad full suite."
  Verify Steps: "Source compare brushitem.hxx/frmitems.cxx/memberids.h/ShadingPattern.idl/docpool/scitems. Transparent factory/Calc148 default, independent full color value copies and Which-independent payload equality/hash, borrowed mutable color and ComplexColor getter side effect, color/filter/shading/graphic-transparency state, isUsed for full/partial transparency. Supported actual Any color/RGB/percent/fully-transparent/graphic-percent/shading queries and writes: RGB retains alpha, full Color replaces it; typed failures/nonmutation, native invalid-graphic-percent behavior and unknown unchanged success; unsigned8 member masks and private signed8 percent conversion including100percent -> alpha1. Native declarations all source-audited. No fake graphics/interface/localization/legacy codec. Entire changed shared owners and whole Calc every raw S/B/F/L counter positive100; related Color/ComplexColor/Any tests, existing boundary suite.4references absent/restored finally in tests/build. All13 scoped source gates, inventory zero violations/provenance necessary filename split, source hashes/native pins32path audit/clean calc. Full suite deferred until actual minimum connected UI+same-model ODS then fix/pause; Writer-only coverage gaps exempt."
  Verification: |-
    - Command: `node output/playwright/task147-checks/portable.mjs` (exact argv/cwd/reference absence in value-shared-manifest.json and value-calc-manifest.json).
      Result: pass after correcting a new hash assertion to reflect native getter behavior, with initial log retained in Findings.
      Evidence:20related tests/3files,186whole Calc tests/76files. Entire3changed shared executable owners raw S155/B69/F21/L147 and33Calc owners S4179/B2731/F821/L3727 at100, every raw counter positive. No repository threshold/exclusion/counter/source-map edits, no Writer coverage repair.
      Scope: native non-graphic brush constructor/copy/clone/default payloads, Color/ComplexColor/filter/shading/graphic-percent values, Which-independent equality/hash, mutable borrowing and getter/hash side effect; typed Color/RGB/transparency/shading members, extraction failures, native percent0xfe/signed8 rules and unknown success. Actual Calc transparent148default. Existing shared Color/ComplexColor tests run. Four reference links absent during portable tests and restored finally.
    - Command: every exact argv in `output/playwright/task147-checks/source-gates.json`; `git diff --check`.
      Result: pass.
      Evidence: all13 gates exit0: scoped prettier/eslint, TS typecheck, JSDoc1922authored files, size, dependency graph653runtime sources/2882relative imports/95allowed edges, tree, provenance654runtime modules, inventory zero semantic violations, routing, doctor, diff and39boundary cases. No boundary/cycle algorithm changes or policy exceptions. Explicit brush source responsibility split respects source limit while existing726line frmitems.ts is untouched.
      Scope:20intentional non-agent paths within32approved bound, including honest native runtime/provenance/capability records and CALC126/127 source notes. Full ShadingPattern constant group is a published long group, not a fake UNO enum or graphic service.
    - Command: `node output/playwright/task147-checks/build-portable.mjs`.
      Result: pass.
      Evidence: production npm run build exit0 with4source references absent/restored finally; exact targets/argv in build-manifest.json. Existing build/hook advisories do not fail checks.
      Scope: portable core/module build; no browser UI runtime or Writer consumer changed. UI localization/GetPresentation deferred per latest user instruction, not a core readiness prerequisite. Full all-app suite remains deferred until actual minimum connected UI+same-model ODS readiness, then repair applicable failures and pause.
    - Command: `npx tsx output/playwright/task147-checks/audit-native.ts`; `python3 output/playwright/task147-checks/audit-final.py`.
      Result: pass.
      Evidence:63published shading values,12graphic-position declarations/version,12native member IDs, actual Calc148default and source percent/getter rules match.10native pins at9bc445578031fecf56086729d8e4940c77e14d65,4exact reference targets restored;3895source hashes (3883baseline,8changed existing,12new,3875unchanged),20intentional paths; detailed verification.json/native-source-audit.json/hashes retained. Native100percent -> alpha1 and getter-induced equal-value/different-hash behavior preserved, linked to existing CALC113.
      Scope: actual non-graphic constructor family only; real Graphic/GraphicObject/XGraphic/loading/position/link/filter and XComplexColor interfaces remain unported with known provider selectors explicitly unsupportedfalse. No dummy object, security/load implementation, new browser snapshot projection, native binary-hash claim, compiler or memory probe. Native generic CellProperties CellBackColor QA is a broader unported property witness, not a claimed native execution. Same-agent evaluator is not independent. Full Calc pool/model/UI/ODS remains pending; final clean calc/hash proof required at closure.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-15T06:19:41.798Z — VERIFY — ok

    By: CODER

    Note: Verified20related,186Calc,39boundary tests, strict shared/Calc raw100; all13source gates/build/inventory pass;20paths/3895hashes/10pins/4links audited. Native quirks preserved, graphics/interface services pending, localization deferred; same-agent review not independent.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T06:19:06.378Z, excerpt_hash=sha256:9f5f18d8f95803b8e6ad3b38419035642e4519e8a643fa39c684c28fd3897585

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610150608-A7TA3A/blueprint/resolved-snapshot.json
    - old_digest: fcbe6b407bf1139fa404c02e569e78698773f06a4c8b2d6caa90caa72f5cb2ff
    - current_digest: fcbe6b407bf1139fa404c02e569e78698773f06a4c8b2d6caa90caa72f5cb2ff
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610150608-A7TA3A

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610150608-A7TA3A -m 🧩 A7TA3A task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only intentional task paths in a later authorized task; no reset, merge or publication."
  Findings: |-
    Source reserves0xff transparency:100percent color transparency produces alpha1, so fully-transparent bool/isUsed differ from intuitive100percent expectations. Complex-color const getter writes its final color. Preserve/record these source cases without calling them confirmed bugs. Port actual non-graphic constructor/method behavior while explicitly leaving real graphic/interface services pending; do not fabricate unreachable graphic states to satisfy coverage. Same-agent evaluator is not independent.

    - Observation: Initial brush test assumed equal copies retain equal hashes after invoking getComplexColor on only one copy; native source shows that getter changes final color, which participates in hash but not equality (existing CALC113).
      Impact: One new assertion failed while production value behavior matches source. A const brush getter can change hash independently of equality; this is a source concern, not a reason to alter shared ComplexColor.
      Resolution: Synchronize getter state in the ordinary copy/hash witness and add an explicit native regression for unequal hashes of still-equal copies after one getter. Record CALC127 linked to CALC113, preserve source behavior and failed log, rerun shared/Calc validation without native probes.
id_source: "generated"
---
## Summary

Task147 implements actual brush color-constructor family used by Calc background defaults, not a replacement graphic layer. Reuse shared Color/ComplexColor/Any/hash primitives; retain upstream numeric/default/side-effect contracts. UI localization deferred per latest user instruction.

## Scope

At most32intentional non-agent paths: editeng frmitems.brush.ts and canonical brushitem.ts header; original SvxGraphicPosition/BRUSH_GRAPHIC_VERSION declarations, published full ShadingPattern constant group; background/shading/transparency member IDs and actual Calc ATTR_BACKGROUND148; related value/Calc tests, matched runtime/provenance/capability and calc-core/suspected-source docs. Port Which-only,Color,Color+ComplexColor,copy/Clone family, native non-graphic equality/hash/isUsed, mutable Color, complex getter final-color side effect, filterColor, shading and numeric graphic-transparency state, actual supported scalar Any methods. Graphics constructors/positions/links/filter/URL/XGraphic loading and actual XComplexColor interfaces remain unported, known unsupported selectors returnfalse explicitly; no fake object/service or security/load code. No extra browser no-argument projection: base unsupported form remains undefined. Localization/GetPresentation deferred; no native memory/move/instance managers. Existing module boundaries reused unchanged.

## Plan

Port original brush non-graphic value constructor family and actual supported scalar Any behavior using shared values, preserve native transparency/getter side effects and declarations, test actual Calc148default and related shared owners at raw100, honest inventory/source audits/portable build,32path clean calc closure. No fake graphics/complex interfaces, localized UI, memory managers or broad full suite.

## Verify Steps

Source compare brushitem.hxx/frmitems.cxx/memberids.h/ShadingPattern.idl/docpool/scitems. Transparent factory/Calc148 default, independent full color value copies and Which-independent payload equality/hash, borrowed mutable color and ComplexColor getter side effect, color/filter/shading/graphic-transparency state, isUsed for full/partial transparency. Supported actual Any color/RGB/percent/fully-transparent/graphic-percent/shading queries and writes: RGB retains alpha, full Color replaces it; typed failures/nonmutation, native invalid-graphic-percent behavior and unknown unchanged success; unsigned8 member masks and private signed8 percent conversion including100percent -> alpha1. Native declarations all source-audited. No fake graphics/interface/localization/legacy codec. Entire changed shared owners and whole Calc every raw S/B/F/L counter positive100; related Color/ComplexColor/Any tests, existing boundary suite.4references absent/restored finally in tests/build. All13 scoped source gates, inventory zero violations/provenance necessary filename split, source hashes/native pins32path audit/clean calc. Full suite deferred until actual minimum connected UI+same-model ODS then fix/pause; Writer-only coverage gaps exempt.

## Verification

- Command: `node output/playwright/task147-checks/portable.mjs` (exact argv/cwd/reference absence in value-shared-manifest.json and value-calc-manifest.json).
  Result: pass after correcting a new hash assertion to reflect native getter behavior, with initial log retained in Findings.
  Evidence:20related tests/3files,186whole Calc tests/76files. Entire3changed shared executable owners raw S155/B69/F21/L147 and33Calc owners S4179/B2731/F821/L3727 at100, every raw counter positive. No repository threshold/exclusion/counter/source-map edits, no Writer coverage repair.
  Scope: native non-graphic brush constructor/copy/clone/default payloads, Color/ComplexColor/filter/shading/graphic-percent values, Which-independent equality/hash, mutable borrowing and getter/hash side effect; typed Color/RGB/transparency/shading members, extraction failures, native percent0xfe/signed8 rules and unknown success. Actual Calc transparent148default. Existing shared Color/ComplexColor tests run. Four reference links absent during portable tests and restored finally.
- Command: every exact argv in `output/playwright/task147-checks/source-gates.json`; `git diff --check`.
  Result: pass.
  Evidence: all13 gates exit0: scoped prettier/eslint, TS typecheck, JSDoc1922authored files, size, dependency graph653runtime sources/2882relative imports/95allowed edges, tree, provenance654runtime modules, inventory zero semantic violations, routing, doctor, diff and39boundary cases. No boundary/cycle algorithm changes or policy exceptions. Explicit brush source responsibility split respects source limit while existing726line frmitems.ts is untouched.
  Scope:20intentional non-agent paths within32approved bound, including honest native runtime/provenance/capability records and CALC126/127 source notes. Full ShadingPattern constant group is a published long group, not a fake UNO enum or graphic service.
- Command: `node output/playwright/task147-checks/build-portable.mjs`.
  Result: pass.
  Evidence: production npm run build exit0 with4source references absent/restored finally; exact targets/argv in build-manifest.json. Existing build/hook advisories do not fail checks.
  Scope: portable core/module build; no browser UI runtime or Writer consumer changed. UI localization/GetPresentation deferred per latest user instruction, not a core readiness prerequisite. Full all-app suite remains deferred until actual minimum connected UI+same-model ODS readiness, then repair applicable failures and pause.
- Command: `npx tsx output/playwright/task147-checks/audit-native.ts`; `python3 output/playwright/task147-checks/audit-final.py`.
  Result: pass.
  Evidence:63published shading values,12graphic-position declarations/version,12native member IDs, actual Calc148default and source percent/getter rules match.10native pins at9bc445578031fecf56086729d8e4940c77e14d65,4exact reference targets restored;3895source hashes (3883baseline,8changed existing,12new,3875unchanged),20intentional paths; detailed verification.json/native-source-audit.json/hashes retained. Native100percent -> alpha1 and getter-induced equal-value/different-hash behavior preserved, linked to existing CALC113.
  Scope: actual non-graphic constructor family only; real Graphic/GraphicObject/XGraphic/loading/position/link/filter and XComplexColor interfaces remain unported with known provider selectors explicitly unsupportedfalse. No dummy object, security/load implementation, new browser snapshot projection, native binary-hash claim, compiler or memory probe. Native generic CellProperties CellBackColor QA is a broader unported property witness, not a claimed native execution. Same-agent evaluator is not independent. Full Calc pool/model/UI/ODS remains pending; final clean calc/hash proof required at closure.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-15T06:19:41.798Z — VERIFY — ok

By: CODER

Note: Verified20related,186Calc,39boundary tests, strict shared/Calc raw100; all13source gates/build/inventory pass;20paths/3895hashes/10pins/4links audited. Native quirks preserved, graphics/interface services pending, localization deferred; same-agent review not independent.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T06:19:06.378Z, excerpt_hash=sha256:9f5f18d8f95803b8e6ad3b38419035642e4519e8a643fa39c684c28fd3897585

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610150608-A7TA3A/blueprint/resolved-snapshot.json
- old_digest: fcbe6b407bf1139fa404c02e569e78698773f06a4c8b2d6caa90caa72f5cb2ff
- current_digest: fcbe6b407bf1139fa404c02e569e78698773f06a4c8b2d6caa90caa72f5cb2ff
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610150608-A7TA3A

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610150608-A7TA3A -m 🧩 A7TA3A task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only intentional task paths in a later authorized task; no reset, merge or publication.

## Findings

Source reserves0xff transparency:100percent color transparency produces alpha1, so fully-transparent bool/isUsed differ from intuitive100percent expectations. Complex-color const getter writes its final color. Preserve/record these source cases without calling them confirmed bugs. Port actual non-graphic constructor/method behavior while explicitly leaving real graphic/interface services pending; do not fabricate unreachable graphic states to satisfy coverage. Same-agent evaluator is not independent.

- Observation: Initial brush test assumed equal copies retain equal hashes after invoking getComplexColor on only one copy; native source shows that getter changes final color, which participates in hash but not equality (existing CALC113).
  Impact: One new assertion failed while production value behavior matches source. A const brush getter can change hash independently of equality; this is a source concern, not a reason to alter shared ComplexColor.
  Resolution: Synchronize getter state in the ordinary copy/hash witness and add an explicit native regression for unequal hashes of still-equal copies after one getter. Record CALC127 linked to CALC113, preserve source behavior and failed log, rerun shared/Calc validation without native probes.
