# Meeting and member page update

Existing React/JavaScript theme and browser-local data store are retained. User selected meeting attendance/decisions and personal member pages; this iteration implements both as a working local demo. No login, real identity enforcement, delivery service or payment gateway is implied.

## Meeting flow
- Snapshot participant IDs for each meeting. Legacy checked attendance becomes present; unchecked becomes pending, never automatically absent.
- Mutually exclusive native radios: present, absent, late; optional arrival time and comment. Clear selection returns to pending.
- All-present action, live counts, participant picker, close only when every participant is marked, reopen only with a reason. Close/reopen history and generic change audit use Demo administrator identity.
- Minutes save clears approval. Explicit approve requires saved nonempty minutes.
- Independent decision entries link to meeting; create a single task per decision with member ID and due date. Existing task UI updates that same task. Task ownership is now chosen from members.

## Member view
- Explicit administrator preview selector, not a login. No access-control claim.
- Fees: per-member charges, pending receipts, approved paid amount and remaining balance; no guessing how historic aggregate transactions should be allocated.
- Finance page can register a fee and a receipt; receipt enters existing approval flow. Approved transaction is the single source for both group balance and member paid amount. Pending receipts reserve remaining amount to prevent duplicate overcollection.
- Programs: explicit member enrollment picker. Legacy attendance IDs are preserved as enrolled; aggregate participant counts are planning totals and never fabricated as named enrollment.
- Notices: only published notices matching all-member/committee/explicit member scope.
- Meeting attendance and ID card with selected member's basic details. No KYC identifiers included; no authenticated QR validation.

## Validation and limits
Node tests cover migration idempotence, attendance exclusivity and locking, decision duplicate prevention and links, pending/approved fee calculation, and notice scope. Browser exercised late attendance and closure, decision-to-task and portal rendering, fee/pending receipt and member ledger, and member ID rendering. Build passed.

Storage remains localStorage. Browser UI rules are not security boundaries. SQL reference is not deployed. Production needs authenticated member mapping, organization/RLS policies, server-side atomic commands and audited actors. No dates or fee records are injected into existing user data.
