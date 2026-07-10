-- Public profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  birthdate date,
  gender text,
  looking_for text,
  bio text,
  height_cm integer,
  interests text[],
  photos text[],
  lat double precision,
  lng double precision,
  is_online boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Swipes table
create table if not exists public.swipes (
  id uuid default gen_random_uuid() primary key,
  swiper_id uuid references public.profiles(id) on delete cascade not null,
  swipee_id uuid references public.profiles(id) on delete cascade not null,
  direction text check (direction in ('like', 'pass', 'super')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (swiper_id, swipee_id)
);

-- Matches table
create table if not exists public.matches (
  id uuid default gen_random_uuid() primary key,
  user_a uuid references public.profiles(id) on delete cascade not null,
  user_b uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null
);

-- Messages table
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references public.matches(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  body text not null,
  kind text default 'text' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.swipes enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;

-- Drop existing policies if they exist to allow clean reload
drop policy if exists "Allow public read access to profiles" on public.profiles;
drop policy if exists "Allow users to update their own profile" on public.profiles;
drop policy if exists "Allow users to insert their own profile" on public.profiles;
drop policy if exists "Allow users to read their own swipes" on public.swipes;
drop policy if exists "Allow users to insert their own swipes" on public.swipes;
drop policy if exists "Allow users to read matches they are part of" on public.matches;
drop policy if exists "Allow users to read messages in matches they are part of" on public.messages;
drop policy if exists "Allow users to insert messages in matches they are part of" on public.messages;

-- RLS Policies
create policy "Allow public read access to profiles" on public.profiles for select using (true);
create policy "Allow users to update their own profile" on public.profiles for update using (auth.uid() = id);
create policy "Allow users to insert their own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "Allow users to read their own swipes" on public.swipes for select using (auth.uid() = swiper_id);
create policy "Allow users to insert their own swipes" on public.swipes for insert with check (auth.uid() = swiper_id);

create policy "Allow users to read matches they are part of" on public.matches for select using (auth.uid() = user_a or auth.uid() = user_b);

create policy "Allow users to read messages in matches they are part of" on public.messages for select 
using (exists (select 1 from public.matches m where m.id = match_id and (m.user_a = auth.uid() or m.user_b = auth.uid())));
create policy "Allow users to insert messages in matches they are part of" on public.messages for insert 
with check (sender_id = auth.uid() and exists (select 1 from public.matches m where m.id = match_id and (m.user_a = auth.uid() or m.user_b = auth.uid())));

-- Swipe match function
create or replace function public.handle_swipe_match() 
returns trigger as $$
declare
  has_matching_like boolean;
begin
  if new.direction = 'like' or new.direction = 'super' then
    select exists (
      select 1 from public.swipes 
      where swiper_id = new.swipee_id 
        and swipee_id = new.swiper_id 
        and (direction = 'like' or direction = 'super')
    ) into has_matching_like;
    
    if has_matching_like then
      -- Idempotently insert match (ordering user_a < user_b keeps unique keys easy if needed)
      insert into public.matches (user_a, user_b, expires_at)
      values (
        case when new.swiper_id < new.swipee_id then new.swiper_id else new.swipee_id end,
        case when new.swiper_id < new.swipee_id then new.swipee_id else new.swiper_id end,
        now() + interval '24 hours'
      );
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for swipe match
drop trigger if exists on_swipe_match on public.swipes;
create trigger on_swipe_match
  after insert on public.swipes
  for each row execute function public.handle_swipe_match();

-- Helper function to query discovery profiles
create or replace function public.get_discovery_profiles(
  user_id uuid,
  target_gender text,
  target_looking_for text,
  limit_count integer default 20
)
returns table (
  id uuid,
  name text,
  birthdate date,
  gender text,
  looking_for text,
  bio text,
  height_cm integer,
  interests text[],
  photos text[],
  lat double precision,
  lng double precision,
  is_online boolean,
  match_percent integer
) as $$
begin
  return query
  select 
    p.id,
    p.name,
    p.birthdate,
    p.gender,
    p.looking_for,
    p.bio,
    p.height_cm,
    p.interests,
    p.photos,
    p.lat,
    p.lng,
    p.is_online,
    coalesce(
      (
        select count(*)::integer * 20
        from unnest(p.interests) interest
        where interest = any(
          select unnest(interests) from public.profiles where id = user_id
        )
      ), 
      50
    ) as match_percent
  from public.profiles p
  where p.id != user_id
    and (target_gender is null or p.gender = target_gender)
    -- Exclude already swiped profiles
    and p.id not in (
      select swipee_id from public.swipes where swiper_id = user_id
    )
  limit limit_count;
end;
$$ language plpgsql security definer;
