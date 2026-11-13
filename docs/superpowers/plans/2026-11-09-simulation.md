# Mahila Samuha Simulation Implementation Plan

Goal: Add an isolated, realistic simulation to the existing React application, preserving live data.
Architecture: A query-selected in-memory adapter reuses the existing domain mutations and all existing screens. Twelve separately scoped groups each contain 30 synthetic members. No simulation action calls a live API. Reload/reset restores generated data. The test center runs assertions against real domain functions and labels missing capabilities as gaps.
Tech Stack: Existing React, Vite, node:test.
Approved scope: Conversation proposal accepted by the user on 2026-11-09.

1. Create deterministic synthetic fixtures and domain scenario runner; verify counts, separation, money, attendance, role restrictions, duplicate and quorum findings.
2. Add in-memory hook and simulation center with group/role controls, seed regeneration, results export, reset and coverage gaps.
3. Integrate existing screens through the hook and add a visible simulation entry link. Never send simulation records to the backend.
4. Run the full existing test suite, production build and desktop/mobile browser checks. Publish with existing owner-private access.

Review focus: domain errors leave data intact; role scope hides other members; group switch does not mix ledger records; denied actions are distinguishable from passing happy paths; gaps never appear as passed checks. Communication, transfer and offline replay remain explicit future work where absent.
