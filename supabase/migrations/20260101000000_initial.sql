-- Plataforma de Ayuda Economica Verificada
-- Migracion inicial

create extension if not exists "pgcrypto";

-- Profiles
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text not null,
  role text not null default 'applicant' check (role in ('applicant','donor','company_donor','reviewer','admin','superadmin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Organizations
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text,
  contact_email text,
  created_at timestamptz not null default now()
);

create table if not exists organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

-- Categories
create table if not exists request_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null
);

create table if not exists request_subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references request_categories(id) on delete cascade,
  label text not null
);

-- Providers
create table if not exists request_providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  verified boolean not null default false,
  region text,
  created_at timestamptz not null default now()
);

-- Requests
create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references profiles(id) on delete cascade,
  category text not null,
  subcategory text not null,
  title text not null,
  description text not null,
  amount_requested bigint not null check (amount_requested > 0),
  amount_received bigint not null default 0,
  amount_confirmed bigint not null default 0,
  amount_paid bigint not null default 0,
  urgency text not null check (urgency in ('emergency','high','medium','normal')),
  region text not null,
  commune text,
  status text not null default 'draft' check (status in (
    'draft','submitted','under_review','documentation_required','verification_in_progress',
    'verified','approved','published','partially_funded','fully_funded','payment_pending',
    'payment_processing','paid','closed','rejected','suspended','cancelled','refund_processing','refunded'
  )),
  provider_id uuid references request_providers(id),
  verification_score jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Documents
create table if not exists request_documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  request_id uuid references requests(id) on delete cascade,
  category text not null,
  file_name text not null,
  mime_type text not null,
  size bigint not null,
  bucket text not null,
  path text not null,
  is_private boolean not null default true,
  created_at timestamptz not null default now()
);

-- Reviews
create table if not exists request_reviews (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests(id) on delete cascade,
  reviewer_id uuid not null references profiles(id),
  observations text,
  recommendation text not null check (recommendation in ('approve','reject','more_info')),
  created_at timestamptz not null default now()
);

-- Status history
create table if not exists request_status_history (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by uuid references profiles(id),
  note text,
  created_at timestamptz not null default now()
);

-- Verifications
create table if not exists request_verifications (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests(id) on delete cascade,
  identity_score int not null default 0,
  need_score int not null default 0,
  vulnerability_score int not null default 0,
  urgency_score int not null default 0,
  destination_score int not null default 0,
  total int generated always as (identity_score+need_score+vulnerability_score+urgency_score+destination_score) stored,
  notes text,
  created_at timestamptz not null default now()
);

-- Donations
create table if not exists donations (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references profiles(id),
  request_id uuid not null references requests(id),
  amount bigint not null check (amount > 0),
  anonymous_public boolean not null default false,
  status text not null default 'pledged' check (status in ('pledged','confirmed','paid','refunded','cancelled')),
  transaction_id uuid,
  created_at timestamptz not null default now()
);

-- Payment transactions
create table if not exists payment_transactions (
  id uuid primary key default gen_random_uuid(),
  donation_id uuid references donations(id),
  request_id uuid references requests(id),
  provider text not null,
  external_id text not null,
  amount bigint not null,
  currency text not null default 'CLP',
  status text not null default 'pending' check (status in ('pending','processing','completed','failed','refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table donations add constraint donations_transaction_fk foreign key (transaction_id) references payment_transactions(id);

-- Webhooks
create table if not exists payment_webhooks (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  payload jsonb not null,
  signature text,
  valid boolean not null default false,
  processed boolean not null default false,
  created_at timestamptz not null default now()
);

-- Payouts
create table if not exists payout_transactions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests(id),
  provider_id uuid references request_providers(id),
  amount bigint not null,
  status text not null default 'pending',
  evidence_path text,
  created_at timestamptz not null default now()
);

-- Refunds
create table if not exists refund_transactions (
  id uuid primary key default gen_random_uuid(),
  payment_transaction_id uuid not null references payment_transactions(id),
  amount bigint not null,
  reason text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- Milestones
create table if not exists milestones (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests(id) on delete cascade,
  title text not null,
  description text,
  amount bigint not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists milestone_documents (
  id uuid primary key default gen_random_uuid(),
  milestone_id uuid not null references milestones(id) on delete cascade,
  document_id uuid not null references request_documents(id) on delete cascade
);

-- Impact reports
create table if not exists impact_reports (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references requests(id),
  summary text not null,
  aggregated_data jsonb,
  created_at timestamptz not null default now()
);

-- Favorites
create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  request_id uuid not null references requests(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, request_id)
);

-- Notifications
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Fraud
create table if not exists fraud_flags (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  reason text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists fraud_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references profiles(id),
  entity_type text not null,
  entity_id uuid not null,
  description text not null,
  created_at timestamptz not null default now()
);

-- Audit
create table if not exists admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  actor_role text,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Consents
create table if not exists consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null,
  granted boolean not null,
  created_at timestamptz not null default now()
);

-- Platform settings
create table if not exists platform_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Sponsors
create table if not exists sponsor_programs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists sponsor_contributions (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references sponsor_programs(id),
  request_id uuid references requests(id),
  amount bigint not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_requests_status on requests(status);
create index if not exists idx_requests_category on requests(category);
create index if not exists idx_requests_applicant on requests(applicant_id);
create index if not exists idx_donations_request on donations(request_id);
create index if not exists idx_documents_owner on request_documents(owner_id);

-- Enable RLS
alter table profiles enable row level security;
alter table requests enable row level security;
alter table request_documents enable row level security;
alter table donations enable row level security;
alter table notifications enable row level security;
alter table admin_audit_logs enable row level security;

-- RLS Policies (basic)
create policy "profiles self read" on profiles for select using (auth.uid() = id);
create policy "profiles self update" on profiles for update using (auth.uid() = id);

create policy "requests public read published" on requests for select using (status in ('published','partially_funded','fully_funded','paid','closed'));
create policy "requests owner read" on requests for select using (auth.uid() = applicant_id);
create policy "requests owner insert" on requests for insert with check (auth.uid() = applicant_id);
create policy "requests owner update draft" on requests for update using (auth.uid() = applicant_id and status = 'draft');

create policy "documents owner read" on request_documents for select using (auth.uid() = owner_id);
create policy "documents owner insert" on request_documents for insert with check (auth.uid() = owner_id);

create policy "donations donor read own" on donations for select using (auth.uid() = donor_id);
create policy "donations public read aggregate" on donations for select using (true);

create policy "notifications owner read" on notifications for select using (auth.uid() = user_id);
create policy "notifications owner update" on notifications for update using (auth.uid() = user_id);