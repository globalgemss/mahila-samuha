CREATE TABLE IF NOT EXISTS public_requests (
 id TEXT PRIMARY KEY, kind TEXT NOT NULL, target_id TEXT NOT NULL DEFAULT '', target_title TEXT NOT NULL DEFAULT '',
 name TEXT NOT NULL, phone TEXT NOT NULL, area TEXT NOT NULL DEFAULT '', message TEXT NOT NULL DEFAULT '',
 consent_at TEXT NOT NULL, created_at TEXT NOT NULL, ip_hash TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new',
 revision INTEGER NOT NULL DEFAULT 0, review_note TEXT NOT NULL DEFAULT '', reviewed_by TEXT NOT NULL DEFAULT '', reviewed_at TEXT NOT NULL DEFAULT '', review_event TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS public_requests_rate ON public_requests(ip_hash,created_at);
CREATE INDEX IF NOT EXISTS public_requests_created ON public_requests(created_at);
CREATE TABLE IF NOT EXISTS public_request_history (
 id TEXT PRIMARY KEY, request_id TEXT NOT NULL, from_status TEXT NOT NULL, to_status TEXT NOT NULL, note TEXT NOT NULL, actor TEXT NOT NULL, created_at TEXT NOT NULL
);
