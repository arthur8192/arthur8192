create extension if not exists "pgcrypto";

create table profiles (
  id uuid references auth.users(id) primary key,
  username text unique not null,
  display_name text,
  created_at timestamptz default now()
);

create table arthurs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) not null,
  username text not null,
  seed text not null,
  birth_timestamp timestamptz default now(),
  is_alive boolean default true,
  archive_reason text,
  created_at timestamptz default now()
);

create table genome (
  arthur_id uuid references arthurs(id) primary key,
  chaos_r float not null,
  chaos_x float not null,
  growth_rate float not null,
  mutation_volatility float not null,
  color_seed integer not null,
  symmetry_bias float not null,
  bioluminescence_potential float not null,
  movement_tendency float not null,
  metabolism_base float not null,
  lifespan_days integer not null,
  created_at timestamptz default now()
);

create table arthur_state (
  arthur_id uuid references arthurs(id) primary key,
  day_number integer default 1,
  body_size float default 10.0,
  body_shape text default 'cell',
  appendage_count integer default 0,
  eye_count integer default 0,
  tentacle_count integer default 0,
  has_membrane boolean default true,
  has_bioluminescence boolean default false,
  color_primary_r integer default 180,
  color_primary_g integer default 80,
  color_primary_b integer default 120,
  color_secondary_r integer default 100,
  color_secondary_g integer default 200,
  color_secondary_b integer default 160,
  glow_r integer default 0,
  glow_g integer default 200,
  glow_b integer default 180,
  glow_intensity float default 0.0,
  transparency float default 0.3,
  texture text default 'smooth',
  pulse_rate float default 0.5,
  movement_speed float default 0.1,
  movement_pattern text default 'drift',
  metabolic_rate float default 0.5,
  hunger float default 0.3,
  fatigue float default 0.1,
  behavior_state text default 'dormant',
  stage integer default 1,
  pending_stimuli jsonb default '[]',
  last_evolution_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table mutation_log (
  id uuid primary key default gen_random_uuid(),
  arthur_id uuid references arthurs(id) not null,
  day_number integer not null,
  event_type text not null,
  trait_changed text,
  description text not null,
  is_public boolean default true,
  recorded_at timestamptz default now()
);

create index idx_mutation_log_arthur on mutation_log (arthur_id, day_number desc);

create table stimuli_log (
  id uuid primary key default gen_random_uuid(),
  arthur_id uuid references arthurs(id) not null,
  applied_by uuid references profiles(id) not null,
  stimulus_type text not null,
  applied_at timestamptz default now(),
  outcome_description text,
  day_number integer not null
);

create table system_log (
  id uuid primary key default gen_random_uuid(),
  run_at timestamptz default now(),
  event_type text not null,
  status text not null,
  processed integer default 0,
  outcome jsonb,
  error_message text
);

alter table profiles enable row level security;
create policy "public_read" on profiles for select using (true);
create policy "own_update" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);

alter table arthurs enable row level security;
create policy "public_read" on arthurs for select using (true);
create policy "service_write" on arthurs
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table genome enable row level security;
create policy "public_read" on genome for select using (true);
create policy "service_write" on genome
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table arthur_state enable row level security;
create policy "public_read" on arthur_state for select using (true);
create policy "service_write" on arthur_state
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table mutation_log enable row level security;
create policy "public_read" on mutation_log for select using (is_public = true);
create policy "service_write" on mutation_log
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table stimuli_log enable row level security;
create policy "owner_read" on stimuli_log
  for select using (arthur_id in (select id from arthurs where owner_id = auth.uid()));
create policy "service_write" on stimuli_log
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter table system_log enable row level security;
create policy "service_read" on system_log for select using (auth.role() = 'service_role');
create policy "service_write" on system_log
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
