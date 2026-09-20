-- Phase 1 — AI Affiliate OS Database Schema
-- Run via: supabase migration up

-- Enable extensions
create extension if not exists pgcrypto;

-- ============================================
-- Profiles
-- ============================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- ============================================
-- Platform Accounts
-- ============================================
create table if not exists public.platform_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  platform text not null check (platform in ('youtube', 'tiktok', 'instagram', 'twitter', 'facebook')),
  provider_account_id text not null,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  scope text,
  token_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.platform_accounts enable row level security;

create policy "platform_accounts_select_own" on public.platform_accounts
  for select using (auth.uid() = user_id);

create policy "platform_accounts_insert_own" on public.platform_accounts
  for insert with check (auth.uid() = user_id);

-- ============================================
-- Product Sources
-- ============================================
create table if not exists public.product_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text,
  provider_type text not null check (provider_type in (' amazon', 'clickbank', 'shareasale', 'custom')),
  config jsonb default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- Products
-- ============================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price decimal(10, 2),
  commission_rate decimal(5, 2) not null default 0,
  affiliate_url text,
  product_source_id uuid references public.product_sources(id) on delete set null,
  status text not null check (status in ('active', 'paused', 'archived')) default 'active',
  confidence_score decimal(5, 2) default 0,
  historical_performance jsonb default '{"views": 0, "clicks": 0, "orders": 0, "revenue": 0}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- Trends
-- ============================================
create table if not exists public.trends (
  id uuid primary key default gen_random_uuid(),
  keyword text not null,
  source text,
  signal_score decimal(5, 2) default 0,
  trend_data jsonb default '{}',
  recorded_at timestamptz not null default now(),
  product_id uuid references public.products(id) on delete cascade
);

-- ============================================
-- Content Ideas
-- ============================================
create table if not exists public.content_ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  product_id uuid references public.products(id) on delete cascade,
  trend_id uuid references public.trends(id) on delete set null,
  status text not null check (status in ('ideated', 'in_review', 'approved', 'rejected')) default 'ideated',
  content_type text not null check (content_type in ('script', 'article', 'video', 'post')),
  ai_model text,
  ai_prompt_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- Content Items
-- ============================================
create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid references public.content_ideas(id) on delete cascade,
  title text not null,
  script text,
  status text not null check (status in ('draft', 'under_review', 'approved', 'rejected', 'published', 'evaluated')) default 'draft',
  platform text check (platform in ('youtube', 'tiktok', 'instagram', 'twitter', 'facebook')),
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- Creative Assets
-- ============================================
create table if not exists public.creative_assets (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid references public.content_items(id) on delete cascade,
  asset_type text not null check (asset_type in ('thumbnail', 'cover_image', 'b_roll', 'voiceover', 'music')),
  file_url text,
  generation_prompt text,
  status text not null check (status in ('pending', 'generating', 'ready', 'failed')) default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- Content Performance
-- ============================================
create table if not exists public.content_performance (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid references public.content_items(id) on delete cascade,
  views integer default 0,
  watch_time integer default 0,
  retention decimal(5, 2) default 0,
  likes integer default 0,
  comments integer default 0,
  shares integer default 0,
  saves integer default 0,
  profile_visits integer default 0,
  clicks integer default 0,
  orders integer default 0,
  commission decimal(10, 2) default 0,
  ctr decimal(5, 2) default 0,
  cvr decimal(5, 2) default 0,
  earnings_per_1k_views decimal(10, 2) default 0,
  profit_per_content decimal(10, 2) default 0,
  recorded_at timestamptz not null default now()
);

-- ============================================
-- Orders
-- ============================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  content_item_id uuid references public.content_items(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  amount decimal(10, 2) not null,
  order_date timestamptz not null default now(),
  platform text check (platform in ('youtube', 'tiktok', 'instagram', 'twitter', 'facebook')),
  order_id text unique,
  status text not null check (status in ('pending', 'completed', 'refunded')) default 'pending'
);

-- ============================================
-- Commissions
-- ============================================
create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  amount decimal(10, 2) not null,
  rate decimal(5, 2) not null,
  paid boolean not null default false,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================
-- Expenses
-- ============================================
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  amount decimal(10, 2) not null,
  category text not null check (category in ('ad_spend', 'software', 'creative_production', 'platform_fee', 'other')),
  description text,
  occurred_at timestamptz not null default now(),
  receipt_url text,
  created_at timestamptz not null default now()
);

-- ============================================
-- Experiments
-- ============================================
create table if not exists public.experiments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  product_id uuid references public.products(id) on delete set null,
  hypothesis text,
  status text not null check (status in ('proposed', 'running', 'completed', 'cancelled')) default 'proposed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- Experiment Variants
-- ============================================
create table if not exists public.experiment_variants (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid references public.experiments(id) on delete cascade,
  name text not null,
  description text,
  variant_key text not null,
  config jsonb default '{}',
  views integer default 0,
  clicks integer default 0,
  orders integer default 0,
  commission decimal(10, 2) default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- AI Decisions
-- ============================================
create table if not exists public.ai_decisions (
  id uuid primary key default gen_random_uuid(),
  agent_name text,
  decision_type text not null,
  input_data jsonb not null,
  output_data jsonb not null,
  rationale text,
  confidence decimal(5, 2),
  status text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
  user_id uuid references auth.users(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============================================
-- Agent Runs
-- ============================================
create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent_name text not null,
  status text not null check (status in ('started', 'completed', 'failed', 'cancelled')) default 'started',
  input_data jsonb,
  output_data jsonb,
  error_message text,
  token_usage integer default 0,
  cost decimal(10, 2) default 0,
  duration_ms integer default 0,
  created_at timestamptz not null default now()
);

-- ============================================
-- Approvals
-- ============================================
create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid references public.content_items(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  status text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  compliance_status text check (compliance_status in ('PASS', 'NEEDS_REVISION', 'BLOCKED')) default 'NEEDS_REVISION',
  compliance_issues jsonb default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- Automation Runs
-- ============================================
create table if not exists public.automation_runs (
  id uuid primary key default gen_random_uuid(),
  workflow_name text not null,
  status text not null check (status in ('pending', 'running', 'completed', 'failed')) default 'pending',
  trigger_event text,
  input_data jsonb,
  output_data jsonb,
  error_message text,
  idempotency_key text unique,
  started_at timestamptz default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================
-- Compliance Checks
-- ============================================
create table if not exists public.compliance_checks (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid references public.content_items(id) on delete cascade,
  checked_by uuid references public.profiles(id) on delete set null,
  status text not null check (status in ('PASS', 'NEEDS_REVISION', 'BLOCKED')) default 'NEEDS_REVISION',
  issues jsonb default '[]',
  evidence jsonb default '{}',
  checked_at timestamptz not null default now()
);

-- ============================================
-- System Settings
-- ============================================
create table if not exists public.system_settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

-- ============================================
-- Indexes
-- ============================================
create index idx_products_status on public.products(status);
create index idx_products_source on public.products(product_source_id);
create index idx_trends_product on public.trends(product_id);
create index idx_content_ideas_product on public.content_ideas(product_id);
create index idx_content_ideas_status on public.content_ideas(status);
create index idx_content_items_assigned on public.content_items(assigned_to);
create index idx_content_items_status on public.content_items(status);
create index idx_content_performance_item on public.content_performance(content_item_id);
create index idx_orders_product on public.orders(product_id);
create index idx_orders_content on public.orders(content_item_id);
create index idx_commissions_order on public.commissions(order_id);
create index idx_expenses_user on public.expenses(user_id);
create index idx_experiments_product on public.experiments(product_id);
create index idx_experiment_variants_experiment on public.experiment_variants(experiment_id);
create index idx_ai_decisions_type on public.ai_decisions(decision_type);
create index idx_agent_runs_agent on public.agent_runs(agent_name);
create index idx_approvals_content on public.approvals(content_item_id);
create index idx_automation_workflow on public.automation_runs(workflow_name);

-- ============================================
-- RLS Policies for remaining tables
-- ==========================================--

alter table public.product_sources enable row level security;
create policy "product_sources_select_all" on public.product_sources for select using (true);

alter table public.trends enable row level security;
create policy "trends_select_own" on public.trends for select using (true);

alter table public.content_ideas enable row level security;
create policy "content_ideas_select_own" on public.content_ideas for select using (true);

alter table public.content_items enable row level security;
create policy "content_items_select_own" on public.content_items for select using (auth.uid() = assigned_to or auth.uid() in (select id from public.profiles where id = auth.uid()));

alter table public.creative_assets enable row level security;
create policy "creative_assets_select_own" on public.creative_assets for select using (true);

alter table public.content_performance enable row level security;
create policy "content_performance_select_own" on public.content_performance for select using (true);

alter table public.orders enable row level security;
create policy "orders_select_own" on public.orders for select using (auth.uid() = user_id or true);

alter table public.commissions enable row level security;
create policy "commissions_select_own" on public.commissions for select using (auth.uid() = user_id or true);

alter table public.expenses enable row level security;
create policy "expenses_select_own" on public.expenses for select using (auth.uid() = user_id or true);

alter table public.experiments enable row level security;
create policy "experiments_select_all" on public.experiments for select using (true);

alter table public.experiment_variants enable row level security;
create policy "experiment_variants_select_all" on public.experiment_variants for select using (true);

alter table public.ai_decisions enable row level security;
create policy "ai_decisions_select_own" on public.ai_decisions for select using (auth.uid() = created_by or true);

alter table public.automation_runs enable row level security;
create policy "automation_runs_select_own" on public.automation_runs for select using (true);

alter table public.compliance_checks enable row level security;
create policy "compliance_checks_select_own" on public.compliance_checks for select using (true);

alter table public.system_settings enable row level security;
create policy "system_settings_select_own" on public.system_settings for select using (true);

-- ============================================
-- Product Scores
-- ============================================
create table if not exists public.product_scores (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  demand_score decimal(5, 2) default 0,
  commission_score decimal(5, 2) default 0,
  price_fit_score decimal(5, 2) default 0,
  content_potential_score decimal(5, 2) default 0,
  competition_score decimal(5, 2) default 0,
  confidence_score decimal(5, 2) default 0,
  historical_performance_score decimal(5, 2) default 0,
  overall_score decimal(5, 2) default 0,
  rationale jsonb default '[]',
  scored_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.product_score_history (
  id uuid primary key default gen_random_uuid(),
  product_score_id uuid references public.product_scores(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  scores jsonb not null,
  rationale jsonb not null,
  overall_score decimal(5, 2) not null,
  created_at timestamptz not null default now()
);

-- Indexes for product scores
create index idx_product_scores_product on public.product_scores(product_id);
create index idx_product_score_history_product on public.product_score_history(product_id);

-- ============================================
-- Default system settings
-- ============================================
insert into public.system_settings (key, value) values (
  'app_name',
  jsonb '"AI Affiliate OS"'
) on conflict do nothing;

insert into public.system_settings (key, value) values (
  'approval_required',
  jsonb '"true"'
) on conflict do nothing;

insert into public.system_settings (key, value) values (
  'demo_mode',
  jsonb '{"enabled": true, "seed_data": true}'
) on conflict do nothing;

comment on table public.profiles is 'User profiles extended from auth.users';
comment on table public.products is 'Affiliate products from various sources';
comment on table public.content_items is 'Content items in the pipeline';
comment on table public.approvals is 'Human approval gate for publishing';
comment on table public.ai_decisions is 'Logged AI decision records';
comment on table public.agent_runs is 'Agent execution logs';