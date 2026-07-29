-- BM67 Curriculum Tracker: initial secure data model
create type public.app_role as enum ('student', 'advisor', 'admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null check (lower(email) like '%@pgvim.ac.th'),
  full_name text,
  student_id text unique,
  instrument text,
  module text,
  year_level smallint check (year_level between 1 and 8),
  role public.app_role not null default 'student',
  advisor_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_course_records (
  id bigint generated always as identity primary key,
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_code text not null,
  grade text,
  status text not null default 'planned' check (status in ('planned','in_progress','completed')),
  academic_year smallint,
  semester smallint check (semester in (1,2,3)),
  updated_at timestamptz not null default now(),
  unique(student_id, course_code)
);

alter table public.profiles enable row level security;
alter table public.student_course_records enable row level security;

create or replace function public.current_role()
returns public.app_role language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

create policy "profiles self read" on public.profiles for select using (id = auth.uid());
create policy "profiles advisor read" on public.profiles for select using (advisor_id = auth.uid() or public.current_role() = 'admin');
create policy "profiles self update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "records self read" on public.student_course_records for select using (student_id = auth.uid());
create policy "records advisor read" on public.student_course_records for select using (
  public.current_role() = 'admin' or exists(select 1 from public.profiles p where p.id = student_id and p.advisor_id = auth.uid())
);
create policy "records self insert" on public.student_course_records for insert with check (student_id = auth.uid());
create policy "records self update" on public.student_course_records for update using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "records self delete" on public.student_course_records for delete using (student_id = auth.uid());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if lower(new.email) not like '%@pgvim.ac.th' then
    raise exception 'Only @pgvim.ac.th accounts are allowed';
  end if;
  insert into public.profiles (id,email,full_name)
  values (new.id,lower(new.email),coalesce(new.raw_user_meta_data->>'full_name',new.raw_user_meta_data->>'name'));
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();
