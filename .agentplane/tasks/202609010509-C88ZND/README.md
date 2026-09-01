---
id: "202609010509-C88ZND"
title: "Add Docker deployment files"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "ops"
verify:
  - "npm run build"
  - "APP_DOMAIN=example.test docker compose config"
plan_approval:
  state: "approved"
  updated_at: "2026-09-01T05:11:01.356Z"
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
    body: "Start: implementing the approved Docker and Traefik deployment configuration in the current checkout."
events:
  -
    type: "status"
    at: "2026-09-01T05:11:06.601Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implementing the approved Docker and Traefik deployment configuration in the current checkout."
doc_version: 3
doc_updated_at: "2026-09-01T05:11:06.601Z"
doc_updated_by: "CODER"
description: "Add a production Docker image and Traefik-enabled Compose configuration for the Vite office application, modeled on delfin-platform-site."
sections:
  Summary: |-
    Add Docker deployment files

    Add a production Docker image and Traefik-enabled Compose configuration for the Vite office application, modeled on delfin-platform-site.
  Scope: |-
    - In scope: Add a production Docker image and Traefik-enabled Compose configuration for the Vite office application, modeled on delfin-platform-site.
    - Out of scope: unrelated refactors not required for "Add Docker deployment files".
  Plan: |-
    1. Add a multi-stage Dockerfile that installs workspace dependencies, builds the Vite application, and serves apps/office/dist with Nginx on port 80.
    2. Add .dockerignore to exclude dependencies, build output, Git metadata, AgentPlane artifacts, and environment files from the image context.
    3. Add docker-compose.yml with a production app service, Traefik routing labels, and the external configurable Traefik network, following the referenced project’s deployment pattern.
    4. Verify the Vite production build and render the Compose configuration with a local example domain.
    Rollback: delete Dockerfile, .dockerignore, and docker-compose.yml.
  Verify Steps: |-
    1. Run `npm run build`; expected: TypeScript validation and the Vite production build complete successfully.
    2. Run `APP_DOMAIN=example.test docker compose config`; expected: Compose renders an app service with the external Traefik network and port 80 service label.
    3. Inspect the Dockerfile; expected: it uses a multi-stage build and copies only `apps/office/dist` into the Nginx runtime image.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Add Docker deployment files

Add a production Docker image and Traefik-enabled Compose configuration for the Vite office application, modeled on delfin-platform-site.

## Scope

- In scope: Add a production Docker image and Traefik-enabled Compose configuration for the Vite office application, modeled on delfin-platform-site.
- Out of scope: unrelated refactors not required for "Add Docker deployment files".

## Plan

1. Add a multi-stage Dockerfile that installs workspace dependencies, builds the Vite application, and serves apps/office/dist with Nginx on port 80.
2. Add .dockerignore to exclude dependencies, build output, Git metadata, AgentPlane artifacts, and environment files from the image context.
3. Add docker-compose.yml with a production app service, Traefik routing labels, and the external configurable Traefik network, following the referenced project’s deployment pattern.
4. Verify the Vite production build and render the Compose configuration with a local example domain.
Rollback: delete Dockerfile, .dockerignore, and docker-compose.yml.

## Verify Steps

1. Run `npm run build`; expected: TypeScript validation and the Vite production build complete successfully.
2. Run `APP_DOMAIN=example.test docker compose config`; expected: Compose renders an app service with the external Traefik network and port 80 service label.
3. Inspect the Dockerfile; expected: it uses a multi-stage build and copies only `apps/office/dist` into the Nginx runtime image.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
