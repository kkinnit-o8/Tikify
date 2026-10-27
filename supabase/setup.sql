-- Tikify public playlists: the database behind "Make public" and "Find playlists".
-- Paste all of it into your Supabase project (SQL Editor → New query) and press Run. Running it
-- again is safe: it updates the functions and keeps the playlists.
--
-- The app reaches the data only through the functions below: the tables themselves can't be read
-- or changed with the publishable key. A playlist holds TikTok links with their titles and
-- artists, never audio. Whoever publishes one gets a secret edit key, kept in their app, which is
-- needed to update or unpublish it.
--
-- Moderating, in Table Editor → public_playlists:
--   featured = true   shown first in Find playlists, with a "Featured" badge (your theme playlists)
--   hidden = true     no longer listed or downloadable (set by 3 reports too, until you set it back)
--   delete the row    gone for good
-- Reports are in playlist_reports.

-- ---------- tables ----------
create table if not exists public.public_playlists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  sounds jsonb not null,             -- [{ "url": "https://www.tiktok.com/@…/video/…", "title": "…", "artist": "…" }]
  sound_count int not null,
  search_text text not null,         -- lower-case name, description, titles and artists
  featured boolean not null default false,
  hidden boolean not null default false,
  downloads int not null default 0,
  reports int not null default 0,
  edit_key_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Who published or reported, for the limits below: a salted hash of their IP address, not the address.
create table if not exists public.playlist_publishes (
  who text not null,
  at timestamptz not null default now()
);
create index if not exists playlist_publishes_at on public.playlist_publishes (at);

create table if not exists public.playlist_reports (
  playlist_id uuid not null references public.public_playlists (id) on delete cascade,
  who text not null,
  reason text not null default '',
  at timestamptz not null default now(),
  primary key (playlist_id, who)
);

create table if not exists public.playlist_salt (
  only_row boolean primary key default true check (only_row),
  salt text not null
);
insert into public.playlist_salt (salt)
  values (replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''))
  on conflict do nothing;

-- Locked: row level security with no policies, and no table grants for the app's roles.
alter table public.public_playlists enable row level security;
alter table public.playlist_publishes enable row level security;
alter table public.playlist_reports enable row level security;
alter table public.playlist_salt enable row level security;
revoke all on public.public_playlists, public.playlist_publishes, public.playlist_reports, public.playlist_salt
  from public, anon, authenticated;

-- ---------- helpers (not callable by the app) ----------
create or replace function public.tikify_requester() returns text
language sql stable security definer set search_path = public, pg_temp as $$
  select encode(sha256(convert_to(coalesce(
      nullif(trim(nullif(current_setting('request.headers', true), '')::json ->> 'cf-connecting-ip'), ''),
      nullif(trim(split_part(nullif(current_setting('request.headers', true), '')::json ->> 'x-forwarded-for', ',', 1)), ''),
      'unknown'
    ) || (select salt from public.playlist_salt), 'UTF8')), 'hex');
$$;

create or replace function public.tikify_key_hash(edit_key text) returns text
language sql immutable as $$
  select encode(sha256(convert_to(coalesce(edit_key, ''), 'UTF8')), 'hex');
$$;

-- Checks and tidies a playlist's name, description and sounds; raises a message the app shows as-is.
create or replace function public.tikify_check(pl_name text, pl_description text, pl_sounds jsonb,
  out clean_name text, out clean_description text, out clean_sounds jsonb, out clean_search text)
language plpgsql immutable as $$
declare
  s jsonb;
  url text;
begin
  clean_name := regexp_replace(trim(coalesce(pl_name, '')), '\s+', ' ', 'g');
  clean_description := trim(coalesce(pl_description, ''));
  if clean_name = '' then raise exception 'Give the playlist a name.'; end if;
  if char_length(clean_name) > 60 then raise exception 'The name can be at most 60 characters.'; end if;
  if char_length(clean_description) > 300 then raise exception 'The description can be at most 300 characters.'; end if;
  if pl_sounds is null or jsonb_typeof(pl_sounds) <> 'array' or jsonb_array_length(pl_sounds) = 0 then
    raise exception 'A public playlist needs at least one sound with a TikTok link.';
  end if;
  if jsonb_array_length(pl_sounds) > 200 then raise exception 'A public playlist can have at most 200 sounds.'; end if;
  clean_sounds := '[]'::jsonb;
  clean_search := lower(clean_name || ' ' || clean_description);
  for s in select * from jsonb_array_elements(pl_sounds) loop
    url := trim(coalesce(s ->> 'url', ''));
    if jsonb_typeof(s) <> 'object' or char_length(url) > 300 or url !~* '^https?://([a-z0-9-]+\.)*tiktok\.com/[^\s<>"]*$' then
      raise exception 'Every sound needs a TikTok link.';
    end if;
    clean_sounds := clean_sounds || jsonb_build_object(
      'url', url,
      'title', left(trim(coalesce(s ->> 'title', '')), 150),
      'artist', left(trim(coalesce(s ->> 'artist', '')), 150));
    clean_search := clean_search || ' ' || lower(left(trim(coalesce(s ->> 'title', '')), 150) || ' ' || left(trim(coalesce(s ->> 'artist', '')), 150));
  end loop;
end;
$$;

revoke all on function public.tikify_requester(), public.tikify_key_hash(text), public.tikify_check(text, text, jsonb)
  from public, anon, authenticated;

-- ---------- what the app calls ----------
-- Every word of q must appear in the name, description, a title or an artist. With no words:
-- featured first, then the most downloaded.
create or replace function public.search_playlists(q text default '', max_results int default 30)
returns table (id uuid, name text, description text, sound_count int, featured boolean, downloads int, created_at timestamptz)
language sql stable security definer set search_path = public, pg_temp as $$
  select p.id, p.name, p.description, p.sound_count, p.featured, p.downloads, p.created_at
  from public.public_playlists p
  where not p.hidden
    and not exists (
      select 1 from unnest(regexp_split_to_array(lower(trim(coalesce(q, ''))), '\s+')) w
      where w <> '' and position(w in p.search_text) = 0)
  order by p.featured desc, p.downloads desc, p.created_at desc
  limit least(greatest(coalesce(max_results, 30), 1), 50);
$$;

create or replace function public.get_playlist(pid uuid) returns json
language sql stable security definer set search_path = public, pg_temp as $$
  select json_build_object('id', p.id, 'name', p.name, 'description', p.description, 'sounds', p.sounds,
    'sound_count', p.sound_count, 'featured', p.featured, 'downloads', p.downloads,
    'created_at', p.created_at, 'updated_at', p.updated_at)
  from public.public_playlists p
  where p.id = pid and not p.hidden;
$$;

-- At most 10 publishes an hour from one address, and 100 an hour from everyone together.
create or replace function public.publish_playlist(pl_name text, pl_description text, pl_sounds jsonb) returns json
language plpgsql volatile security definer set search_path = public, pg_temp as $$
declare
  c record;
  requester text := public.tikify_requester();
  new_key text := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  new_id uuid;
begin
  select * into c from public.tikify_check(pl_name, pl_description, pl_sounds);
  delete from public.playlist_publishes where at < now() - interval '1 day';
  if (select count(*) from public.playlist_publishes where who = requester and at > now() - interval '1 hour') >= 10
    or (select count(*) from public.playlist_publishes where at > now() - interval '1 hour') >= 100 then
    raise exception 'Too many playlists were published just now. Try again in an hour.';
  end if;
  insert into public.playlist_publishes (who) values (requester);
  insert into public.public_playlists (name, description, sounds, sound_count, search_text, edit_key_hash)
    values (c.clean_name, c.clean_description, c.clean_sounds, jsonb_array_length(c.clean_sounds), c.clean_search, public.tikify_key_hash(new_key))
    returning public_playlists.id into new_id;
  return json_build_object('id', new_id, 'key', new_key);
end;
$$;

-- false: it's gone (unpublished, or you deleted it), and the app forgets it was public.
create or replace function public.update_playlist(pid uuid, edit_key text, pl_name text, pl_description text, pl_sounds jsonb) returns boolean
language plpgsql volatile security definer set search_path = public, pg_temp as $$
declare
  c record;
begin
  select * into c from public.tikify_check(pl_name, pl_description, pl_sounds);
  update public.public_playlists
    set name = c.clean_name, description = c.clean_description, sounds = c.clean_sounds,
        sound_count = jsonb_array_length(c.clean_sounds), search_text = c.clean_search, updated_at = now()
    where id = pid and edit_key_hash = public.tikify_key_hash(edit_key);
  return found;
end;
$$;

create or replace function public.unpublish_playlist(pid uuid, edit_key text) returns void
language sql volatile security definer set search_path = public, pg_temp as $$
  delete from public.public_playlists where id = pid and edit_key_hash = public.tikify_key_hash(edit_key);
$$;

create or replace function public.count_download(pid uuid) returns void
language sql volatile security definer set search_path = public, pg_temp as $$
  update public.public_playlists set downloads = downloads + 1 where id = pid and not hidden;
$$;

-- One report per address and playlist; 3 hide it until you look at it.
create or replace function public.report_playlist(pid uuid, reason text default '') returns void
language plpgsql volatile security definer set search_path = public, pg_temp as $$
begin
  if not exists (select 1 from public.public_playlists where id = pid) then return; end if;
  insert into public.playlist_reports (playlist_id, who, reason)
    values (pid, public.tikify_requester(), left(trim(coalesce(report_playlist.reason, '')), 300))
    on conflict do nothing;
  update public.public_playlists
    set reports = (select count(*) from public.playlist_reports r where r.playlist_id = pid),
        hidden = hidden or (select count(*) from public.playlist_reports r where r.playlist_id = pid) >= 3
    where id = pid;
end;
$$;

revoke all on function
  public.search_playlists(text, int), public.get_playlist(uuid),
  public.publish_playlist(text, text, jsonb), public.update_playlist(uuid, text, text, text, jsonb),
  public.unpublish_playlist(uuid, text), public.count_download(uuid), public.report_playlist(uuid, text)
  from public;
grant execute on function
  public.search_playlists(text, int), public.get_playlist(uuid),
  public.publish_playlist(text, text, jsonb), public.update_playlist(uuid, text, text, text, jsonb),
  public.unpublish_playlist(uuid, text), public.count_download(uuid), public.report_playlist(uuid, text)
  to anon, authenticated;

notify pgrst, 'reload schema';
