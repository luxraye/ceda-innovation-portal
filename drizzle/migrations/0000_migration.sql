
create type public.app_role as enum ('submitter','evaluator','adjudicator','admin');
create type public.idea_stage as enum ('draft','submitted','screening','evaluation','adjudication','revision_requested','approved','awarded','rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  company_name text,
  phone text,
  age int,
  youth_shareholding int,
  created_at timestamptz not null default now()
);
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique(user_id, role)
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('evaluator','adjudicator','admin'))
$$;

create policy "own profile read or staff" on public.profiles for select to authenticated using (id = auth.uid() or public.is_staff(auth.uid()));
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid());
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "read own roles or admin" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), new.email);
  insert into public.user_roles (user_id, role) values (new.id, 'submitter');
  if (select count(*) from public.user_roles where role = 'admin') = 0 then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  reference text not null default ('CEDA-' || upper(substr(md5(random()::text),1,6))),
  title text not null,
  category text not null default 'Other',
  problem text not null default '',
  solution text not null default '',
  impact text not null default '',
  target_market text not null default '',
  company_name text not null default '',
  youth_shareholding int not null default 51,
  team_size int not null default 1,
  stage public.idea_stage not null default 'draft',
  avg_score numeric,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.idea_events (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas(id) on delete cascade,
  actor_id uuid,
  from_stage public.idea_stage,
  to_stage public.idea_stage not null,
  note text,
  created_at timestamptz not null default now()
);
create table public.criteria (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  weight int not null default 20,
  max_score int not null default 10,
  active boolean not null default true,
  sort int not null default 0
);
create table public.scores (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas(id) on delete cascade,
  evaluator_id uuid not null,
  criterion_id uuid not null references public.criteria(id) on delete cascade,
  score int not null,
  comment text,
  created_at timestamptz not null default now(),
  unique(idea_id, evaluator_id, criterion_id)
);
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.ideas(id) on delete cascade,
  author_id uuid not null,
  author_name text,
  is_staff boolean not null default false,
  message text not null,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.ideas, public.idea_events, public.criteria, public.scores, public.feedback to authenticated;
grant all on public.ideas, public.idea_events, public.criteria, public.scores, public.feedback to service_role;
alter table public.ideas enable row level security;
alter table public.idea_events enable row level security;
alter table public.criteria enable row level security;
alter table public.scores enable row level security;
alter table public.feedback enable row level security;

create policy "ideas read" on public.ideas for select to authenticated using (owner_id = auth.uid() or public.is_staff(auth.uid()));
create policy "ideas insert" on public.ideas for insert to authenticated with check (owner_id = auth.uid() and stage = 'draft');
create policy "ideas owner edit" on public.ideas for update to authenticated using (owner_id = auth.uid() and stage in ('draft','revision_requested')) with check (owner_id = auth.uid() and stage in ('draft','revision_requested'));
create policy "ideas owner delete draft" on public.ideas for delete to authenticated using (owner_id = auth.uid() and stage = 'draft');

create policy "events read" on public.idea_events for select to authenticated using (exists (select 1 from public.ideas i where i.id = idea_id and (i.owner_id = auth.uid() or public.is_staff(auth.uid()))));

create policy "criteria read" on public.criteria for select to authenticated using (true);
create policy "criteria admin write" on public.criteria for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "scores staff read" on public.scores for select to authenticated using (public.is_staff(auth.uid()));
create policy "scores evaluator write" on public.scores for insert to authenticated with check (evaluator_id = auth.uid() and (public.has_role(auth.uid(),'evaluator') or public.has_role(auth.uid(),'admin')));
create policy "scores evaluator update" on public.scores for update to authenticated using (evaluator_id = auth.uid());

create policy "feedback read" on public.feedback for select to authenticated using (exists (select 1 from public.ideas i where i.id = idea_id and (i.owner_id = auth.uid() or public.is_staff(auth.uid()))));
create policy "feedback write" on public.feedback for insert to authenticated with check (author_id = auth.uid() and exists (select 1 from public.ideas i where i.id = idea_id and (i.owner_id = auth.uid() or public.is_staff(auth.uid()))));

-- Workflow RPCs
create or replace function public.submit_idea(_idea_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare i public.ideas;
begin
  select * into i from public.ideas where id = _idea_id;
  if i.owner_id is distinct from auth.uid() then raise exception 'Not your idea'; end if;
  if i.stage not in ('draft','revision_requested') then raise exception 'Idea cannot be submitted from this stage'; end if;
  if length(trim(i.title))=0 or length(trim(i.problem))<20 or length(trim(i.solution))<20 or length(trim(i.impact))<10 or length(trim(i.company_name))=0 then
    raise exception 'All mandatory fields must be completed';
  end if;
  if i.youth_shareholding <= 50 then raise exception 'Youth shareholding must be more than 50%%'; end if;
  update public.ideas set stage='submitted', submitted_at = coalesce(submitted_at, now()), updated_at=now() where id=_idea_id;
  insert into public.idea_events(idea_id, actor_id, from_stage, to_stage, note) values (_idea_id, auth.uid(), i.stage, 'submitted', case when i.stage='revision_requested' then 'Resubmitted after revision' else 'Idea submitted' end);
end; $$;

create or replace function public.advance_idea(_idea_id uuid, _to public.idea_stage, _note text)
returns void language plpgsql security definer set search_path = public as $$
declare i public.ideas; uid uuid := auth.uid();
  ok boolean := false;
begin
  select * into i from public.ideas where id = _idea_id;
  if i.id is null then raise exception 'Not found'; end if;
  if public.has_role(uid,'admin') then ok := true;
  elsif public.has_role(uid,'evaluator') and i.stage in ('submitted','screening','evaluation') and _to in ('screening','evaluation','adjudication','revision_requested','rejected') then ok := true;
  elsif public.has_role(uid,'adjudicator') and i.stage in ('adjudication','approved') and _to in ('approved','awarded','rejected','revision_requested','evaluation') then ok := true;
  end if;
  if not ok then raise exception 'Your role cannot move this idea to %', _to; end if;
  update public.ideas set stage=_to, updated_at=now() where id=_idea_id;
  insert into public.idea_events(idea_id, actor_id, from_stage, to_stage, note) values (_idea_id, uid, i.stage, _to, _note);
end; $$;

create or replace function public.recompute_avg()
returns trigger language plpgsql security definer set search_path = public as $$
declare _id uuid := coalesce(new.idea_id, old.idea_id);
begin
  update public.ideas set avg_score = (
    select round(sum(s.score::numeric / c.max_score * c.weight) / nullif(sum(c.weight),0) * 100 / count(distinct s.evaluator_id) * count(distinct s.evaluator_id), 1)
    from public.scores s join public.criteria c on c.id = s.criterion_id where s.idea_id = _id
  ) where id = _id;
  return null;
end; $$;
create trigger scores_avg after insert or update or delete on public.scores for each row execute function public.recompute_avg();

create or replace function public.set_user_role(_user_id uuid, _role public.app_role, _grant boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'Admins only'; end if;
  if _grant then insert into public.user_roles(user_id, role) values (_user_id, _role) on conflict do nothing;
  else delete from public.user_roles where user_id=_user_id and role=_role; end if;
end; $$;

grant execute on function public.submit_idea(uuid), public.advance_idea(uuid, public.idea_stage, text), public.set_user_role(uuid, public.app_role, boolean) to authenticated;

alter publication supabase_realtime add table public.ideas;
alter publication supabase_realtime add table public.idea_events;
alter publication supabase_realtime add table public.feedback;

insert into public.criteria (name, description, weight, max_score, sort) values
('Innovation & Originality','Novelty of the idea and its differentiation from existing solutions',25,10,1),
('Market Potential','Size of addressable market and commercial viability in Botswana and beyond',20,10,2),
('Socio-economic Impact','Job creation, SDG alignment and contribution to national transformation',20,10,3),
('Technical Feasibility','Ability of the team to build, scale and secure the solution',20,10,4),
('Team Capability','Youth ownership, skills mix and execution track record',15,10,5);

insert into public.ideas (owner_id, title, category, problem, solution, impact, target_market, company_name, youth_shareholding, team_size, stage, submitted_at, avg_score, created_at) values
('00000000-0000-0000-0000-000000000001','Morogo Fresh — cold-chain for smallholder farmers','Agritech','Smallholder vegetable farmers lose up to 40% of produce post-harvest due to lack of cold storage.','Solar-powered modular cold rooms with mobile booking and buyer marketplace.','Reduce waste, raise farmer incomes and create 120 rural jobs.','Smallholder farmers in Central & Kgatleng','Morogo Ventures (Pty) Ltd',80,4,'evaluation',now()-interval '6 days',null,now()-interval '9 days'),
('00000000-0000-0000-0000-000000000001','PulaPay Micro-ledger for informal traders','Fintech','Informal traders lack credit histories and cannot access CEDA loans.','USSD bookkeeping that builds a verifiable credit score from daily sales.','Unlock financing for 10,000 street vendors within two years.','Informal sector traders nationally','Kgotla Digital',100,3,'adjudication',now()-interval '8 days',null,now()-interval '12 days'),
('00000000-0000-0000-0000-000000000001','Thuto AI — Setswana tutoring assistant','Edtech','Learners in rural schools have limited access to after-hours tutoring.','Offline-first AI tutor delivering the BGCSE syllabus in Setswana and English.','Improve pass rates in Maths and Science across 50 schools.','Junior and senior secondary learners','Thuto Labs',67,5,'submitted',now()-interval '1 day',null,now()-interval '3 days'),
('00000000-0000-0000-0000-000000000001','Kalahari Craft Exchange','Creative Industries','Basket weavers in remote villages cannot reach international buyers.','E-commerce storefront with logistics pooling and artisan provenance certificates.','Increase artisan income by 3x and preserve cultural heritage.','Global buyers of authentic crafts','Lefatshe Creative',90,2,'approved',now()-interval '10 days',null,now()-interval '14 days'),
('00000000-0000-0000-0000-000000000001','WaterWise Smart Meters','Cleantech','Municipal water losses exceed 30% due to undetected leaks.','LoRa-connected meters with leak-detection analytics dashboards.','Save millions of litres annually for Water Utilities Corporation.','Municipal councils and utilities','Metsi Tech',55,6,'screening',now()-interval '2 days',null,now()-interval '5 days');

insert into public.idea_events (idea_id, to_stage, note, created_at)
select id, 'submitted', 'Idea submitted', submitted_at from public.ideas;
