---
id: "202610150539-NBVZWN"
title: "Restore native shared text-line item hierarchy for Calc overline"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 16
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-15T05:39:40.816Z"
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
    body: "Start: replace incorrect scalar underline with original shared text-line hierarchy, reuse Tools/ComplexColor/Any values and migrate Writer enum users; record missing interface/presentation services explicitly."
events:
  -
    type: "status"
    at: "2026-10-15T05:39:50.404Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: replace incorrect scalar underline with original shared text-line hierarchy, reuse Tools/ComplexColor/Any values and migrate Writer enum users; record missing interface/presentation services explicitly."
doc_version: 3
doc_updated_at: "2026-10-15T05:53:21.502Z"
doc_updated_by: "CODER"
description: "Task145 replaces scalar-only shared underline with original SvxTextLineItem enum/color/complex value base and actual underline/overline derivatives; canonical Tools FontLineStyle declarations and consumer migration, source defaults and bool/scalar Any semantics. Missing native localized resource and actual XComplexColor interface transport explicitly recorded, never replaced by fake services or memory mechanisms."
sections:
  Summary: "Task145 restores the actual text-line pooled-value hierarchy used by Calc underline/overline defaults and shared Writer consumers. Source-faithful core values replace the scalar-only underline; complete document/UI/ODS goal remains unchanged."
  Scope: "At most55intentional non-agent paths: new textitem.line.ts and canonical udlnitem.ts header; Tools FontLineStyle/native sentinel declarations and memberids; remove old duplicate enum/scalar-only class from textitem.ts and reexport real owners; migrate all actual enum consumers to source LINESTYLE names, update source-backed equality/range expectations, add whole value/Any tests and actual Calc105/106 witness/constants if needed. Existing shared runtime owners changed must retain complete raw100. Native Color/ComplexColor/SfxEnumItem/Any reused. Logical GC only, no item instance manager. Actual typed XComplexColor transport and localized EditResId/GetColorString presentation require unported original providers and stay explicit gaps, never fake returned objects/resources. Match inventory/docs/suspected cases; no module cycle changes, full app suite or unrelated fixes."
  Plan: "Restore native shared text-line value hierarchy, canonical enum/member IDs and real underline/overline classes; migrate Writer enum users/equality tests, reuse real color/complex/Any without memory mechanisms, retain explicit missing interface/presentation services. Validate whole changed shared/Calc raw100 and related Writer/browser behavior, honest inventory/native source audit and clean calc within55paths."
  Verify Steps: "Compare native udlnitem.hxx/textitem.cxx/fontenum.hxx/memberids.h and actual Calc docpool defaults; all19styles/native sentinel, transparent default color, independent copy/clone and concrete-type/value/color/complex equality ignoringWhich; bool Get/Set and style mutation; actual typed bool/int16/color/hascolor queries and Put int32 extraction/failure/nonmutation/alpha preservation/member mask/unknown unchanged success. Explicitly reject unsupported real complex-interface transport, do not claim full UNO/presentation parity. Migrate every old enum member consumer, preserve scalar browser projection and real Writer font/ODT/history behavior. Entire changed shared executable owners and whole Calc every raw S/B/F/L counter positive100, related Writer and enum/value suites, Writer-only coverage gaps measured/left.4references absent/restored finally for tests/build/selected existing character-formatting and numbering-font Chromium specs. All13 scoped source gates including inventory/provenance/routing/doctor, production build, native pins/exact55path/source hashes/clean calc; same-agent EVALUATOR explicitly not independent. Full suite remains gated to minimal connected UI plus same-model ODS, then fix applicable errors and pause."
  Verification: |-
    - Command: `node output/playwright/task145-checks/portable.mjs`; intermediate `--shared-only` invocation after the related selection gained the existing font-effects.test.ts (exact final argv/cwd/reference absence in value-shared-manifest.json and value-calc-manifest.json).
      Result: pass.
      Evidence: final102 related tests/17files and184whole Calc tests/74files. Entire3 changed shared executable owners raw S275/B113/F58/L258 and33 Calc executable owners S4175/B2731/F821/L3723 at100, every raw counter positive. Four Writer-only coverage-gap owners measured and left as user authorized; no repository thresholds/exclusions/raw maps/counters changed. Initial wrong native Any test input and initial incomplete shared-owner selection retained and corrected in Findings; after source folding, actual final shared/Calc runs both pass.
      Scope: native text-line hierarchy/defaults/copy/clone/Which-independent concrete equality, full color/complex payloads, bool/style methods, typed bool/int16/style/color/own-color member behavior, original alpha preservation and unknown-member success. Existing text/font/ODT/history and Writer rendering consumers; actual Calc104/105 defaults. All4 source-reference links absent during portable execution and restored finally.
    - Command: every exact argv in `output/playwright/task145-checks/source-gates.json`; `git diff --check`.
      Result: pass.
      Evidence: all13 gates exit0: scoped format/lint, TS typecheck, JSDoc1912 authored files, size, dependency graph647runtime sources/2866relative imports/94cross-module edges, tree, provenance648runtime modules, inventory zero semantic violations, routing, doctor, diff and38boundary tests. Earlier typecheck/provenance/invariant failures corrected and retained. Main source451lines; no filename or import-cycle exception. Stable invariant now witnesses actual Tools enum owner. Unused test parameter correction and metadata changes required no behavioral test replay.
      Scope:40intentional non-agent source/test/doc/inventory paths within55 approved bound. Writer bodies change canonical enum references only; source-backed shared equality/range expectation corrections are in textitem.test.ts. No unrelated policy/boundary algorithm edits or Writer-only coverage repair.
    - Command: `node output/playwright/task145-checks/build-browser-portable.mjs`.
      Result: pass.
      Evidence: production npm run build exit0;3 actual existing Chromium cases in writer-character-formatting.spec.ts and native-numbering-font.spec.ts pass. Fresh configured preview server; no new specs.4reference links absent/restored finally, exact argv/targets/results in build-browser-manifest.json. Existing chunk/hook advisories do not fail checks.
      Scope: actual affected Writer character formatting and native numbering font import/render/edit/history behavior at desktop/mobile widths. Full all-app suite remains deferred until actual minimum connected UI plus same-model ODS readiness, then applicable failures must be repaired and goal paused.
    - Command: `npx tsx output/playwright/task145-checks/audit-native.ts`; `python3 output/playwright/task145-checks/audit-final.py`.
      Result: pass.
      Evidence:20 native enum declarations (19styles plus size sentinel),5 actual member IDs and2Calc WhichIds match;9 Writer source/test bodies AST-identical except canonical enum names.10native pins at9bc445578031fecf56086729d8e4940c77e14d65,4exact reference targets restored,3871source hashes (3865baseline,34changed existing,6new,3831unchanged),40intentional paths. Detailed verification.json, native-source-audit.json, hash/intentional-path files retained. Canonical textitem.ts owns all3line classes; no duplicate enum/class/storage or fake resource provider.
      Scope: shared core value prerequisite only. Actual XComplexColor transport is explicitly unsupportedfalse and localized EditResId/GetColorString presentation remains unported; these are honest missing native services, not parity claims. Existing no-argument browser style projection is bounded and documented. Full Calc pool/document/UI/ODS remains pending. Native CharacterProperties Java QA reference is its real generic CharUnderline declaration, not an invented method or a claimed executed native suite. Same-agent evaluator is not independent; clean calc/post-commit hash proof required at closure.
  Rollback Plan: "Revert intentional task paths through a later authorized task; no reset, merge or publication."
  Findings: |-
    Current underline incorrectly compares Which and lacks the native shared value base/color fields. Correct shared code and canonical enum consumers rather than preserving the bad implementation. Existing browser scalar transport is an explicit established adaptation; real missing complex interface/localized resources remain unverified, not fabricated. Same-agent evaluation is not independent.

    - Observation: Initial scope prose transposed the Calc underline/overline identities as105/106; direct native scitems.hxx evidence gives104/105.
      Impact: Documentation typo only; no implementation or test used the wrong identities.
      Resolution: Use actual104/105 constants and witnesses; the approved scope remains the same two default items, without expansion.

    - Observation: New wrong-type Any witness passed a JS string as the native OUString payload; low-level Any construction correctly requires the real typed owner.
      Impact: One new assertion setup failed;98 related cases already passed. Production text-line behavior was not implicated.
      Resolution: Use a real bool Any as the incompatible style type, preserving the intended extraction-failure/nonmutation test without adding string or memory wrappers. Retain initial log and rerun affected shared suite.

    - Observation: All99 selected related tests and184Calc cases pass, but raw coverage audit finds existing bool/relief methods of changed shared textitem.ts unexercised by the initial selection.
      Impact: Whole-owner shared100 criterion is not yet satisfied; passing new text-line classes and Calc are insufficient alone.
      Resolution: Add the existing font-effects.test.ts suite to related selection and rerun only shared coverage. Retain the passing Calc command and map; no exclusions, threshold changes, source edits or unnecessary Calc replay.

    - Observation: Static gates found an undocumented filename divergence for textitem.line.ts and an unused callback parameter in a new test.
      Impact: The shared implementation can be closer to upstream: combined original textitem.ts and text-line bodies total455lines before deduplicating imports, below the enforced500line limit.
      Resolution: Fold the unchanged new class bodies into canonical textitem.ts and point udlnitem.ts there, removing the uncommitted split source and its metadata instead of inventing a filename exception. Rename unused test parameter with underscore. Scope shrinks within approved native hierarchy/owners; refresh related shared and Calc checks for the real source relocation.

    - Observation: After canonical folding, typecheck still found the multiline unused test parameter and inventory found its pre-existing FontLineStyle invariant pointing to the removed duplicate Editeng enum.
      Impact: The invariant must follow the actual Tools declaration; retaining the old path would falsely document the source owner. The initial parameter replacement had only changed its JSDoc.
      Resolution: Rename the actual callback parameter, move the invariant witness to canonical Tools FontLineStyle with the same native ordering contract, preserve its stable id and native reference, rerun affected source gates only. Native runtime behavior and passing coverage are unchanged.
id_source: "generated"
---
## Summary

Task145 restores the actual text-line pooled-value hierarchy used by Calc underline/overline defaults and shared Writer consumers. Source-faithful core values replace the scalar-only underline; complete document/UI/ODS goal remains unchanged.

## Scope

At most55intentional non-agent paths: new textitem.line.ts and canonical udlnitem.ts header; Tools FontLineStyle/native sentinel declarations and memberids; remove old duplicate enum/scalar-only class from textitem.ts and reexport real owners; migrate all actual enum consumers to source LINESTYLE names, update source-backed equality/range expectations, add whole value/Any tests and actual Calc105/106 witness/constants if needed. Existing shared runtime owners changed must retain complete raw100. Native Color/ComplexColor/SfxEnumItem/Any reused. Logical GC only, no item instance manager. Actual typed XComplexColor transport and localized EditResId/GetColorString presentation require unported original providers and stay explicit gaps, never fake returned objects/resources. Match inventory/docs/suspected cases; no module cycle changes, full app suite or unrelated fixes.

## Plan

Restore native shared text-line value hierarchy, canonical enum/member IDs and real underline/overline classes; migrate Writer enum users/equality tests, reuse real color/complex/Any without memory mechanisms, retain explicit missing interface/presentation services. Validate whole changed shared/Calc raw100 and related Writer/browser behavior, honest inventory/native source audit and clean calc within55paths.

## Verify Steps

Compare native udlnitem.hxx/textitem.cxx/fontenum.hxx/memberids.h and actual Calc docpool defaults; all19styles/native sentinel, transparent default color, independent copy/clone and concrete-type/value/color/complex equality ignoringWhich; bool Get/Set and style mutation; actual typed bool/int16/color/hascolor queries and Put int32 extraction/failure/nonmutation/alpha preservation/member mask/unknown unchanged success. Explicitly reject unsupported real complex-interface transport, do not claim full UNO/presentation parity. Migrate every old enum member consumer, preserve scalar browser projection and real Writer font/ODT/history behavior. Entire changed shared executable owners and whole Calc every raw S/B/F/L counter positive100, related Writer and enum/value suites, Writer-only coverage gaps measured/left.4references absent/restored finally for tests/build/selected existing character-formatting and numbering-font Chromium specs. All13 scoped source gates including inventory/provenance/routing/doctor, production build, native pins/exact55path/source hashes/clean calc; same-agent EVALUATOR explicitly not independent. Full suite remains gated to minimal connected UI plus same-model ODS, then fix applicable errors and pause.

## Verification

- Command: `node output/playwright/task145-checks/portable.mjs`; intermediate `--shared-only` invocation after the related selection gained the existing font-effects.test.ts (exact final argv/cwd/reference absence in value-shared-manifest.json and value-calc-manifest.json).
  Result: pass.
  Evidence: final102 related tests/17files and184whole Calc tests/74files. Entire3 changed shared executable owners raw S275/B113/F58/L258 and33 Calc executable owners S4175/B2731/F821/L3723 at100, every raw counter positive. Four Writer-only coverage-gap owners measured and left as user authorized; no repository thresholds/exclusions/raw maps/counters changed. Initial wrong native Any test input and initial incomplete shared-owner selection retained and corrected in Findings; after source folding, actual final shared/Calc runs both pass.
  Scope: native text-line hierarchy/defaults/copy/clone/Which-independent concrete equality, full color/complex payloads, bool/style methods, typed bool/int16/style/color/own-color member behavior, original alpha preservation and unknown-member success. Existing text/font/ODT/history and Writer rendering consumers; actual Calc104/105 defaults. All4 source-reference links absent during portable execution and restored finally.
- Command: every exact argv in `output/playwright/task145-checks/source-gates.json`; `git diff --check`.
  Result: pass.
  Evidence: all13 gates exit0: scoped format/lint, TS typecheck, JSDoc1912 authored files, size, dependency graph647runtime sources/2866relative imports/94cross-module edges, tree, provenance648runtime modules, inventory zero semantic violations, routing, doctor, diff and38boundary tests. Earlier typecheck/provenance/invariant failures corrected and retained. Main source451lines; no filename or import-cycle exception. Stable invariant now witnesses actual Tools enum owner. Unused test parameter correction and metadata changes required no behavioral test replay.
  Scope:40intentional non-agent source/test/doc/inventory paths within55 approved bound. Writer bodies change canonical enum references only; source-backed shared equality/range expectation corrections are in textitem.test.ts. No unrelated policy/boundary algorithm edits or Writer-only coverage repair.
- Command: `node output/playwright/task145-checks/build-browser-portable.mjs`.
  Result: pass.
  Evidence: production npm run build exit0;3 actual existing Chromium cases in writer-character-formatting.spec.ts and native-numbering-font.spec.ts pass. Fresh configured preview server; no new specs.4reference links absent/restored finally, exact argv/targets/results in build-browser-manifest.json. Existing chunk/hook advisories do not fail checks.
  Scope: actual affected Writer character formatting and native numbering font import/render/edit/history behavior at desktop/mobile widths. Full all-app suite remains deferred until actual minimum connected UI plus same-model ODS readiness, then applicable failures must be repaired and goal paused.
- Command: `npx tsx output/playwright/task145-checks/audit-native.ts`; `python3 output/playwright/task145-checks/audit-final.py`.
  Result: pass.
  Evidence:20 native enum declarations (19styles plus size sentinel),5 actual member IDs and2Calc WhichIds match;9 Writer source/test bodies AST-identical except canonical enum names.10native pins at9bc445578031fecf56086729d8e4940c77e14d65,4exact reference targets restored,3871source hashes (3865baseline,34changed existing,6new,3831unchanged),40intentional paths. Detailed verification.json, native-source-audit.json, hash/intentional-path files retained. Canonical textitem.ts owns all3line classes; no duplicate enum/class/storage or fake resource provider.
  Scope: shared core value prerequisite only. Actual XComplexColor transport is explicitly unsupportedfalse and localized EditResId/GetColorString presentation remains unported; these are honest missing native services, not parity claims. Existing no-argument browser style projection is bounded and documented. Full Calc pool/document/UI/ODS remains pending. Native CharacterProperties Java QA reference is its real generic CharUnderline declaration, not an invented method or a claimed executed native suite. Same-agent evaluator is not independent; clean calc/post-commit hash proof required at closure.

## Rollback Plan

Revert intentional task paths through a later authorized task; no reset, merge or publication.

## Findings

Current underline incorrectly compares Which and lacks the native shared value base/color fields. Correct shared code and canonical enum consumers rather than preserving the bad implementation. Existing browser scalar transport is an explicit established adaptation; real missing complex interface/localized resources remain unverified, not fabricated. Same-agent evaluation is not independent.

- Observation: Initial scope prose transposed the Calc underline/overline identities as105/106; direct native scitems.hxx evidence gives104/105.
  Impact: Documentation typo only; no implementation or test used the wrong identities.
  Resolution: Use actual104/105 constants and witnesses; the approved scope remains the same two default items, without expansion.

- Observation: New wrong-type Any witness passed a JS string as the native OUString payload; low-level Any construction correctly requires the real typed owner.
  Impact: One new assertion setup failed;98 related cases already passed. Production text-line behavior was not implicated.
  Resolution: Use a real bool Any as the incompatible style type, preserving the intended extraction-failure/nonmutation test without adding string or memory wrappers. Retain initial log and rerun affected shared suite.

- Observation: All99 selected related tests and184Calc cases pass, but raw coverage audit finds existing bool/relief methods of changed shared textitem.ts unexercised by the initial selection.
  Impact: Whole-owner shared100 criterion is not yet satisfied; passing new text-line classes and Calc are insufficient alone.
  Resolution: Add the existing font-effects.test.ts suite to related selection and rerun only shared coverage. Retain the passing Calc command and map; no exclusions, threshold changes, source edits or unnecessary Calc replay.

- Observation: Static gates found an undocumented filename divergence for textitem.line.ts and an unused callback parameter in a new test.
  Impact: The shared implementation can be closer to upstream: combined original textitem.ts and text-line bodies total455lines before deduplicating imports, below the enforced500line limit.
  Resolution: Fold the unchanged new class bodies into canonical textitem.ts and point udlnitem.ts there, removing the uncommitted split source and its metadata instead of inventing a filename exception. Rename unused test parameter with underscore. Scope shrinks within approved native hierarchy/owners; refresh related shared and Calc checks for the real source relocation.

- Observation: After canonical folding, typecheck still found the multiline unused test parameter and inventory found its pre-existing FontLineStyle invariant pointing to the removed duplicate Editeng enum.
  Impact: The invariant must follow the actual Tools declaration; retaining the old path would falsely document the source owner. The initial parameter replacement had only changed its JSDoc.
  Resolution: Rename the actual callback parameter, move the invariant witness to canonical Tools FontLineStyle with the same native ordering contract, preserve its stable id and native reference, rerun affected source gates only. Native runtime behavior and passing coverage are unchanged.
