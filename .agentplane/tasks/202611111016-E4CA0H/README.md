---
id: "202611111016-E4CA0H"
title: "Update Node LTS and all npm dependencies to latest stable"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "npm run build"
  - "npm run lint"
  - "npm run test:coverage"
  - "npm run test:e2e"
  - "npm run test:inventory:coverage"
  - "npm run test:tooling"
  - "npm run typecheck"
plan_approval:
  state: "approved"
  updated_at: "2026-11-11T10:17:01.034Z"
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
    body: "Start: Apply approved floating latest LTS Node selectors and registry dependency updates, preserve compiler compatibility and verify the complete upgrade."
events:
  -
    type: "status"
    at: "2026-11-11T10:17:06.379Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Apply approved floating latest LTS Node selectors and registry dependency updates, preserve compiler compatibility and verify the complete upgrade."
doc_version: 3
doc_updated_at: "2026-11-11T10:17:06.379Z"
doc_updated_by: "CODER"
description: "Approved by user: floating latest LTS Node locally and in Docker, update all npm libraries and tools, resolve compatibility and validate in vite-office only. Network access to registry and official documentation approved."
sections:
  Summary: "Use floating latest LTS Node locally and in Docker and update all npm libraries and tooling to latest stable releases."
  Scope: "Root and office workspace manifests, npm lockfile, Node version selector, Dockerfile, development documentation and necessary compatibility fixes. No global runtime modifications, external publication or vendored upstream source replacement."
  Plan: "Implement the user-approved floating Node LTS and latest-stable dependency upgrade within vite-office; preserve intentional TS7/TS6 compatibility, fix upgrade regressions and run the documented verification contract."
  Verify Steps: |-
    - Confirm .nvmrc uses lts/* and Docker uses node:lts-alpine; verify manifest engines is a non-exact supported range.
    - Compare every registry dependency and compiler alias against npm latest tags; npm outdated --workspaces --include-workspace-root must have no updates.
    - Run npm run typecheck, npm run build, npm run lint, npm run test:tooling, npm run test:coverage, npm run test:inventory:coverage and npm run test:e2e.
    - Check formatting of modified files, ap doctor, node .agentplane/policy/check-routing.mjs and final git status.
  Verification: "Pending implementation."
  Rollback Plan: "Revert this task commit and restore the previous dependency tree with npm ci."
  Findings: "User explicitly approved plan and network access; latest LTS must also float in Docker. Existing TypeScript 7 compiler / TypeScript 6 API compatibility aliases are intentional and covered by tooling tests."
id_source: "generated"
---
## Summary

Use floating latest LTS Node locally and in Docker and update all npm libraries and tooling to latest stable releases.

## Scope

Root and office workspace manifests, npm lockfile, Node version selector, Dockerfile, development documentation and necessary compatibility fixes. No global runtime modifications, external publication or vendored upstream source replacement.

## Plan

Implement the user-approved floating Node LTS and latest-stable dependency upgrade within vite-office; preserve intentional TS7/TS6 compatibility, fix upgrade regressions and run the documented verification contract.

## Verify Steps

- Confirm .nvmrc uses lts/* and Docker uses node:lts-alpine; verify manifest engines is a non-exact supported range.
- Compare every registry dependency and compiler alias against npm latest tags; npm outdated --workspaces --include-workspace-root must have no updates.
- Run npm run typecheck, npm run build, npm run lint, npm run test:tooling, npm run test:coverage, npm run test:inventory:coverage and npm run test:e2e.
- Check formatting of modified files, ap doctor, node .agentplane/policy/check-routing.mjs and final git status.

## Verification

Pending implementation.

## Rollback Plan

Revert this task commit and restore the previous dependency tree with npm ci.

## Findings

User explicitly approved plan and network access; latest LTS must also float in Docker. Existing TypeScript 7 compiler / TypeScript 6 API compatibility aliases are intentional and covered by tooling tests.
