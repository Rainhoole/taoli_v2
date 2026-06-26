# 12 - Add Deployment And Secret Hardening

Status: ready-for-agent

## Goal

Prepare the system for a single cloud VPS deployment with safe API key handling and authenticated dashboard access.

## Scope

- Document VPS deployment steps.
- Configure HTTPS through reverse proxy or platform support.
- Require single-user authentication for dashboard access.
- Ensure exchange API keys are trade-only, withdrawal-disabled, IP-whitelisted, and preferably subaccount-scoped.
- Add operational runbook for kill switch, reduce-only mode, and manual rescue.

## Acceptance Criteria

- No secrets are committed to source control.
- Dashboard is not reachable without authentication.
- Deployment docs explain API key permission requirements.
- Runbook explains how to stop new trading and close exposure.

## Depends On

- 01-scaffold-application-and-runtime-config.md
- 11-build-web-dashboard.md

## Comments
