-- PostgreSQL reference schema only: NOT applied to a database.
-- Application must use verified identity and enforce organization + role permissions.
CREATE TABLE organizations(id uuid PRIMARY KEY,name text NOT NULL,address text,introduction text,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE app_users(id uuid PRIMARY KEY,auth_subject text UNIQUE NOT NULL,display_name text NOT NULL);
CREATE TABLE organization_users(organization_id uuid REFERENCES organizations(id),user_id uuid REFERENCES app_users(id),role text NOT NULL CHECK(role IN ('chair','secretary','treasurer','member')),active boolean NOT NULL DEFAULT true,PRIMARY KEY(organization_id,user_id));
CREATE TABLE members(id uuid PRIMARY KEY,organization_id uuid NOT NULL REFERENCES organizations(id),member_number text NOT NULL,full_name text NOT NULL,phone varchar(10) CHECK(phone IS NULL OR phone ~ '^[0-9]{10}$'),position text,skill text,status text NOT NULL CHECK(status IN ('active','renewal_due','inactive')),UNIQUE(organization_id,member_number),UNIQUE(organization_id,id));
CREATE TABLE meetings(id uuid PRIMARY KEY,organization_id uuid NOT NULL REFERENCES organizations(id),title text NOT NULL,starts_at timestamptz,venue text,agenda text,minutes text,status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','review','approved')),approved_by uuid REFERENCES app_users(id),UNIQUE(organization_id,id));
CREATE TABLE meeting_attendance(organization_id uuid NOT NULL,meeting_id uuid NOT NULL,member_id uuid NOT NULL,response text CHECK(response IN ('yes','no','pending')),present boolean DEFAULT false,PRIMARY KEY(meeting_id,member_id),FOREIGN KEY(organization_id,meeting_id) REFERENCES meetings(organization_id,id),FOREIGN KEY(organization_id,member_id) REFERENCES members(organization_id,id));
CREATE TABLE programs(id uuid PRIMARY KEY,organization_id uuid NOT NULL REFERENCES organizations(id),title text NOT NULL,status text NOT NULL CHECK(status IN ('upcoming','active','completed')),budget numeric(14,2) DEFAULT 0 CHECK(budget>=0),start_date date,end_date date,report text,CHECK(end_date IS NULL OR start_date IS NULL OR end_date>=start_date),UNIQUE(organization_id,id));
CREATE TABLE program_participants(organization_id uuid NOT NULL,program_id uuid NOT NULL,member_id uuid NOT NULL,PRIMARY KEY(program_id,member_id),FOREIGN KEY(organization_id,program_id) REFERENCES programs(organization_id,id),FOREIGN KEY(organization_id,member_id) REFERENCES members(organization_id,id));
CREATE TABLE program_attendance(organization_id uuid NOT NULL,program_id uuid NOT NULL,member_id uuid NOT NULL,session_date date NOT NULL,present boolean NOT NULL DEFAULT false,PRIMARY KEY(program_id,member_id,session_date),FOREIGN KEY(organization_id,program_id) REFERENCES programs(organization_id,id),FOREIGN KEY(organization_id,member_id) REFERENCES members(organization_id,id));
CREATE TABLE tasks(id uuid PRIMARY KEY,organization_id uuid NOT NULL REFERENCES organizations(id),title text NOT NULL,assigned_member_id uuid,program_id uuid,meeting_id uuid,due_date date,status text NOT NULL CHECK(status IN ('todo','in_progress','review','completed')),progress_note text,FOREIGN KEY(organization_id,assigned_member_id) REFERENCES members(organization_id,id),FOREIGN KEY(organization_id,program_id) REFERENCES programs(organization_id,id),FOREIGN KEY(organization_id,meeting_id) REFERENCES meetings(organization_id,id));
CREATE TABLE transactions(id uuid PRIMARY KEY,organization_id uuid NOT NULL REFERENCES organizations(id),reference text NOT NULL,description text NOT NULL,direction text NOT NULL CHECK(direction IN ('income','expense')),amount numeric(14,2) NOT NULL CHECK(amount>0),method text NOT NULL CHECK(method IN ('cash','bank')),status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','reversed')),program_id uuid,created_by uuid NOT NULL REFERENCES app_users(id),approved_by uuid REFERENCES app_users(id),created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(organization_id,reference),FOREIGN KEY(organization_id,program_id) REFERENCES programs(organization_id,id),CHECK(status!='approved' OR approved_by IS NOT NULL));
CREATE TABLE posts(id uuid PRIMARY KEY,organization_id uuid NOT NULL REFERENCES organizations(id),title text NOT NULL,body text NOT NULL,category text NOT NULL,cover_asset_key text,consent_confirmed boolean NOT NULL DEFAULT false,reviewed_by uuid REFERENCES app_users(id),status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','review','published')),published_at timestamptz,CHECK(status!='published' OR (consent_confirmed AND reviewed_by IS NOT NULL AND published_at IS NOT NULL)));
CREATE TABLE notices(id uuid PRIMARY KEY,organization_id uuid NOT NULL REFERENCES organizations(id),title text NOT NULL,body text NOT NULL,status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','scheduled','published')),scheduled_at timestamptz,UNIQUE(organization_id,id));
CREATE TABLE notice_recipients(organization_id uuid NOT NULL,notice_id uuid NOT NULL,member_id uuid NOT NULL,delivered_at timestamptz,read_at timestamptz,response text,PRIMARY KEY(notice_id,member_id),FOREIGN KEY(organization_id,notice_id) REFERENCES notices(organization_id,id),FOREIGN KEY(organization_id,member_id) REFERENCES members(organization_id,id));
CREATE TABLE audit_logs(id uuid PRIMARY KEY,organization_id uuid NOT NULL REFERENCES organizations(id),actor_id uuid NOT NULL REFERENCES app_users(id),entity_type text NOT NULL,entity_id uuid NOT NULL,action text NOT NULL,before_value jsonb,after_value jsonb,created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX members_org_status ON members(organization_id,status);
CREATE INDEX transactions_org_date ON transactions(organization_id,created_at);
CREATE INDEX tasks_org_due ON tasks(organization_id,due_date);
CREATE INDEX posts_org_status ON posts(organization_id,status);
-- Deny by default for non-owner DB roles. Add identity-based policies at integration.
-- Never expose owner/service credentials to browsers.
DO $$ DECLARE tbl text; BEGIN FOREACH tbl IN ARRAY ARRAY['organizations','app_users','organization_users','members','meetings','meeting_attendance','programs','program_participants','program_attendance','tasks','transactions','posts','notices','notice_recipients','audit_logs'] LOOP EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',tbl); END LOOP; END $$;

-- KYC extension: reference only. Keep outside public member projections.
-- profile contains personal/contact fields; addresses contains permanent/current
-- province, district, municipality, ward, tole, house, latitude/longitude;
-- identity contains citizenship, national ID and OPTIONAL voter details.
CREATE TABLE member_kyc (
 organization_id uuid NOT NULL,
 member_id uuid NOT NULL,
 profile jsonb NOT NULL DEFAULT '{}'::jsonb CHECK(jsonb_typeof(profile)='object'),
 addresses jsonb NOT NULL DEFAULT '{}'::jsonb CHECK(jsonb_typeof(addresses)='object'),
 identity_details jsonb NOT NULL DEFAULT '{}'::jsonb CHECK(jsonb_typeof(identity_details)='object'),
 consent_recorded boolean NOT NULL DEFAULT false,
 verification_status text NOT NULL DEFAULT 'unverified' CHECK(verification_status IN ('unverified','review','verified','rejected')),
 reviewed_by uuid REFERENCES app_users(id), reviewed_at timestamptz,
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(organization_id,member_id),
 FOREIGN KEY(organization_id,member_id) REFERENCES members(organization_id,id)
);
CREATE TABLE member_family (
 id uuid PRIMARY KEY, organization_id uuid NOT NULL, member_id uuid NOT NULL,
 full_name text NOT NULL, relationship text NOT NULL,
 phone varchar(10) CHECK(phone IS NULL OR phone ~ '^[0-9]{10}$'),
 FOREIGN KEY(organization_id,member_id) REFERENCES members(organization_id,id)
);
ALTER TABLE member_kyc ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_family ENABLE ROW LEVEL SECURITY;
-- No policies: deny by default. Add verified administrator-only policies before use.
-- Do not expose KYC through public views or write raw identifiers into audit logs.

-- Meeting/member portal extension (reference only; not deployed).
ALTER TABLE meetings ADD COLUMN attendance_closed boolean NOT NULL DEFAULT false;
ALTER TABLE meetings ADD COLUMN minutes_approved boolean NOT NULL DEFAULT false;
ALTER TABLE meeting_attendance ADD COLUMN attendance_status text CHECK(attendance_status IN ('pending','present','absent','late'));
-- Only TRUE legacy present values can safely migrate to present; FALSE may mean unmarked.
UPDATE meeting_attendance SET attendance_status=CASE WHEN present IS TRUE THEN 'present' ELSE 'pending' END;
ALTER TABLE meeting_attendance ALTER COLUMN attendance_status SET DEFAULT 'pending';
ALTER TABLE meeting_attendance ALTER COLUMN attendance_status SET NOT NULL;
ALTER TABLE meeting_attendance ADD COLUMN arrival_time time;
ALTER TABLE meeting_attendance ADD COLUMN note text;
CREATE TABLE meeting_participants (
 organization_id uuid NOT NULL, meeting_id uuid NOT NULL, member_id uuid NOT NULL,
 PRIMARY KEY(meeting_id,member_id),
 FOREIGN KEY(organization_id,meeting_id) REFERENCES meetings(organization_id,id),
 FOREIGN KEY(organization_id,member_id) REFERENCES members(organization_id,id)
);
CREATE TABLE meeting_decisions (
 id uuid PRIMARY KEY, organization_id uuid NOT NULL, meeting_id uuid NOT NULL,
 description text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(organization_id,id), FOREIGN KEY(organization_id,meeting_id) REFERENCES meetings(organization_id,id)
);
ALTER TABLE tasks ADD COLUMN decision_id uuid;
ALTER TABLE tasks ADD CONSTRAINT tasks_decision_fk FOREIGN KEY(organization_id,decision_id) REFERENCES meeting_decisions(organization_id,id);
CREATE UNIQUE INDEX one_task_per_decision ON tasks(organization_id,decision_id) WHERE decision_id IS NOT NULL;
CREATE TABLE member_fees (
 id uuid PRIMARY KEY, organization_id uuid NOT NULL, member_id uuid NOT NULL,
 description text NOT NULL, amount numeric(14,2) NOT NULL CHECK(amount>0), due_date date,
 UNIQUE(organization_id,id), UNIQUE(organization_id,id,member_id),
 FOREIGN KEY(organization_id,member_id) REFERENCES members(organization_id,id)
);
ALTER TABLE transactions ADD COLUMN fee_id uuid;
ALTER TABLE transactions ADD COLUMN member_id uuid;
ALTER TABLE transactions ADD CONSTRAINT transactions_member_fk FOREIGN KEY(organization_id,member_id) REFERENCES members(organization_id,id);
ALTER TABLE transactions ADD CONSTRAINT transactions_fee_member_fk FOREIGN KEY(organization_id,fee_id,member_id) REFERENCES member_fees(organization_id,id,member_id);
ALTER TABLE transactions ADD CONSTRAINT fee_receipt_requires_member CHECK(fee_id IS NULL OR (member_id IS NOT NULL AND direction='income'));
CREATE TABLE member_user_links (
 organization_id uuid NOT NULL, member_id uuid NOT NULL, user_id uuid NOT NULL REFERENCES app_users(id),
 PRIMARY KEY(organization_id,user_id), UNIQUE(organization_id,member_id),
 FOREIGN KEY(organization_id,member_id) REFERENCES members(organization_id,id)
);
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_user_links ENABLE ROW LEVEL SECURITY;
-- No permissive policies. Implement authenticated member views and admin policies server-side.
-- Server transactions must lock meeting rows before writes, reject closed attendance changes,
-- enforce fee balance limits, and audit the authenticated actor; UI checks are not security.
