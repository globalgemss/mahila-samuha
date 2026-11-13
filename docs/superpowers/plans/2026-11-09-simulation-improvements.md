# Simulation review improvements

User requested improvements to the deployed simulation. Fix the two observed domain gaps while preserving existing live records.

- [x] Add normalized duplicate-name/shared-phone review in KYC and server. Persist reason, reviewer and candidate IDs. Reject identical national ID or identical citizenship number + issuing district even with override. Exclude the edited member and avoid re-review for unrelated updates.
- [x] Add explicit per-meeting minimum attendance configuration by owner/president. Do not invent a rule for existing meetings. Count present + late. Require completed closed attendance and threshold before approving minutes. Invalidate approval after attendance/roster/reopening changes.
- [x] Reuse actual domain rules in simulation probes; exercise rejected and successful paths. All 168 checks pass across 12 generated groups.
- [x] Reset page/form selection on group, role or dataset reset. Export the applied seed and actual test timestamp.
- [x] Review duplicate workflow and blocked approval in browser. Inspect dashboard and meeting form at 390px iframe viewport (375px content after scrollbar); no horizontal document overflow. This is responsive layout QA, not physical-device/touch testing.
- [x] Run full suite: 33 tests pass. Production build succeeds.

Remaining: real SMS delivery, offline replay end-to-end, production multi-group isolation, transfer workflow and physical print/device verification. Existing approved historical minutes are preserved; new approvals require explicit quorum configuration. No live records were written during testing.
