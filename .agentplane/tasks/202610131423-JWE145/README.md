---
id: "202610131423-JWE145"
title: "Support native popup auxiliary mouse buttons"
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
  updated_at: "2026-10-13T14:30:04.977Z"
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
    body: "Start: human-authorized native click/auxclick ingress and existing submenu button handler, no custom press/release machinery; original native bindings/resource/status, exact1oldcase migration, whole source100four, cadence5/10."
events:
  -
    type: "status"
    at: "2026-10-13T14:30:39.079Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: human-authorized native click/auxclick ingress and existing submenu button handler, no custom press/release machinery; original native bindings/resource/status, exact1oldcase migration, whole source100four, cadence5/10."
doc_version: 3
doc_updated_at: "2026-10-13T14:30:39.079Z"
doc_updated_by: "CODER"
description: "Use existing browser click plus native auxclick for middle/right activation through original bindings; preserve left input and existing submenu handler, extend admitted buttons per source. No custom press/release state machine. Whole module100four, native mounted/Chromium, precise1oldcase migration, cadence5/10."
sections:
  Summary: "Support native popup auxiliary mouse buttons through browser-native events."
  Scope: "One production CommandPopupMenu.tsx and2shared canonical runtime/provenance append-only records; new sw/browser/presentation/native-popup-mouse.test.tsx and e2e/writer-native-popup-mouse.spec.ts. Exact one native-popup-delay.test.tsx keyboard/direct button case may migrate only source-contradicting middle-button restriction; all other old bodies/imports/files unchanged. Task/parent evidence. Original bindings/resources/registered IO/recovery/shared menubar unchanged. Browser click/auxclick are the authorized native implementation; no custom low-level press/release handlers/state machine or click-capture compatibility layer."
  Plan: "Human steering supersedes earlier unimplemented low-level proposal: retain native browser click for left command activation, use auxclick for middle/right through the same original binding callback, and expand existing submenu direct activation to all buttons per source. Prevent browser context menu within the owned popup. Use built-in JS/browser mechanisms when they provide required behavior; port observable upstream contracts without recreating lower-level machinery. Standing goal and explicit human steering authorize safe local work/internal lifecycle."
  Verify Steps: "Genuine red with original native WriterSession/frame/bindings; middle/right auxclick enabled command executes once and closes/restores source focus before native dispatch, disabled commands stay disabled/no native execution. Left/native keyboard and programmatic binding clicks unchanged. Existing submenu direct handler accepts0/1/2buttons with immediate native first preselection; nested auxiliary command uses original child binding. Cancel browser context menu while original popup resource remains owned. Exact1oldcase middle-button migration only; every other old statement/import byte-identical. Whole original production module Istanbul100lines/statements/functions/branches, positive raw original counters/IDs/locations/current-source hashes, no provider/exclusion/normalization/threshold change. Fresh/related/tooling/TS7/format/lint/docs/size/deps/build/static; actual Chromium middle/right submenu/Paragraph native dialog at1280/390, left preserved, plus11context/delay/highlight/disabled/table regressions.4LO/mdds/ICU/boost refs physically absent every runtime/static producer/exact finally restored; no source/test/ref mutation while live. Final9restored-only metadata source-tree/provenance/registry/resources--check/invariants/parity/routing/doctor/diff. Canonical history/status/default/class/IO/recovery preserved. Exact semanticSHA same-agent non-independent review and clean closure. Full press/release/POPUPSELECT/first-move/synthetic/NOSELECT/scroll/mnemonic/platform parity remains unverified, no low-level imitation per human. Cadence5/10; full once10, human pause after next full+repairs."
  Verification: "Pending genuine red, implementation and whole current-source proof."
  Rollback Plan: "Revert scoped semantic commit only if needed; preserve human history and exact4reference link restoration finally. No network/global access/publication/history rewrite."
  Findings: "Previous turn is verified progress:9N15Q3 at cbfdb607, exact reviewed544751a5, current writer clean. Pinned LO9bc445578031fecf56086729d8e4940c77e14d65 MouseButtonDown/ImplHighlightItem do not restrict button; MouseButtonUp executes enabled ordinary current entry. Human explicitly rejects unnecessary low-level press/release recreation and directs use of native JS/browser functions where equivalent. Earlier lower-level task proposal was not implemented and is superseded before start; click/auxclick native ingress retained. Detailed unmatched release/POPUPSELECT/platform and complete pointer parity are unverified, not promoted. General principle applies onward to goal; registered IO/recovery preserved."
id_source: "generated"
---
## Summary

Support native popup auxiliary mouse buttons through browser-native events.

## Scope

One production CommandPopupMenu.tsx and2shared canonical runtime/provenance append-only records; new sw/browser/presentation/native-popup-mouse.test.tsx and e2e/writer-native-popup-mouse.spec.ts. Exact one native-popup-delay.test.tsx keyboard/direct button case may migrate only source-contradicting middle-button restriction; all other old bodies/imports/files unchanged. Task/parent evidence. Original bindings/resources/registered IO/recovery/shared menubar unchanged. Browser click/auxclick are the authorized native implementation; no custom low-level press/release handlers/state machine or click-capture compatibility layer.

## Plan

Human steering supersedes earlier unimplemented low-level proposal: retain native browser click for left command activation, use auxclick for middle/right through the same original binding callback, and expand existing submenu direct activation to all buttons per source. Prevent browser context menu within the owned popup. Use built-in JS/browser mechanisms when they provide required behavior; port observable upstream contracts without recreating lower-level machinery. Standing goal and explicit human steering authorize safe local work/internal lifecycle.

## Verify Steps

Genuine red with original native WriterSession/frame/bindings; middle/right auxclick enabled command executes once and closes/restores source focus before native dispatch, disabled commands stay disabled/no native execution. Left/native keyboard and programmatic binding clicks unchanged. Existing submenu direct handler accepts0/1/2buttons with immediate native first preselection; nested auxiliary command uses original child binding. Cancel browser context menu while original popup resource remains owned. Exact1oldcase middle-button migration only; every other old statement/import byte-identical. Whole original production module Istanbul100lines/statements/functions/branches, positive raw original counters/IDs/locations/current-source hashes, no provider/exclusion/normalization/threshold change. Fresh/related/tooling/TS7/format/lint/docs/size/deps/build/static; actual Chromium middle/right submenu/Paragraph native dialog at1280/390, left preserved, plus11context/delay/highlight/disabled/table regressions.4LO/mdds/ICU/boost refs physically absent every runtime/static producer/exact finally restored; no source/test/ref mutation while live. Final9restored-only metadata source-tree/provenance/registry/resources--check/invariants/parity/routing/doctor/diff. Canonical history/status/default/class/IO/recovery preserved. Exact semanticSHA same-agent non-independent review and clean closure. Full press/release/POPUPSELECT/first-move/synthetic/NOSELECT/scroll/mnemonic/platform parity remains unverified, no low-level imitation per human. Cadence5/10; full once10, human pause after next full+repairs.

## Verification

Pending genuine red, implementation and whole current-source proof.

## Rollback Plan

Revert scoped semantic commit only if needed; preserve human history and exact4reference link restoration finally. No network/global access/publication/history rewrite.

## Findings

Previous turn is verified progress:9N15Q3 at cbfdb607, exact reviewed544751a5, current writer clean. Pinned LO9bc445578031fecf56086729d8e4940c77e14d65 MouseButtonDown/ImplHighlightItem do not restrict button; MouseButtonUp executes enabled ordinary current entry. Human explicitly rejects unnecessary low-level press/release recreation and directs use of native JS/browser functions where equivalent. Earlier lower-level task proposal was not implemented and is superseded before start; click/auxclick native ingress retained. Detailed unmatched release/POPUPSELECT/platform and complete pointer parity are unverified, not promoted. General principle applies onward to goal; registered IO/recovery preserved.
