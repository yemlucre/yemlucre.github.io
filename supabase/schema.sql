-- ============================================================
-- 茶语 · Supabase 后端初始化脚本
-- ------------------------------------------------------------
-- 用法：Supabase 控制台 → SQL Editor → 整段粘贴 → Run（执行一次）。
-- 内容：数据表、注册触发器（邀请码原子校验，可重复使用）、预检查
--       RPC、行级安全策略（RLS）、初始创始人邀请码。
-- 脚本可重复执行（幂等）；已部署过旧版本的库重新执行一遍即可完成迁移。
-- ============================================================

-- ---------- 1. 数据表 ----------

-- 用户档案：显示名 + 专属邀请码（由注册触发器自动创建）
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null unique,
  invite_code text not null unique,
  created_at  timestamptz not null default now()
);

-- 用户名大小写不敏感唯一（与前端校验行为保持一致）
create unique index if not exists profiles_name_lower_uidx
  on public.profiles (lower(name));

-- 邀请码台账：owner 为空 = 官方/创始人码。邀请码可重复使用、不消耗；
-- used_by / used_at 仅为旧版本（一码一用）留下的历史记录，新版本不再写入。
create table if not exists public.invite_codes (
  code       text primary key,
  owner      uuid references public.profiles(id) on delete set null,
  used_by    uuid references public.profiles(id) on delete set null,
  used_at    timestamptz,
  created_at timestamptz not null default now()
);

-- 茶友评分（云端版）：按「茶 × 品牌」维度保存，每位用户对每款茶的
-- 每个品牌仅一条，可随时更新/删除
create table if not exists public.reviews (
  tea_id     text not null,
  variety    text not null,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  user_name  text not null,
  rating     int  not null check (rating between 1 and 5),
  review     text not null default '',
  updated_at timestamptz not null default now(),
  primary key (tea_id, variety, user_id)
);

-- 旧库迁移：为已存在的 reviews 表补 variety 列并切换到新主键（可重复执行）。
-- 旧版按茶整体保存的评价行 variety 为空串，保留在库中，前端不再展示。
alter table public.reviews add column if not exists variety text not null default '';
alter table public.reviews drop constraint if exists reviews_pkey;
alter table public.reviews add constraint reviews_pkey primary key (tea_id, variety, user_id);

-- 旧库迁移：十分制 → 五分制。先把旧的 6-10 分按 round(rating / 2) 折算为
-- 1-5 分（已是 1-5 分的行保持不变），再把取值约束收紧为 1-5（可重复执行）。
update public.reviews set rating = (greatest(1, round(rating / 2.0)))::int where rating > 5;
alter table public.reviews drop constraint if exists reviews_rating_check;
do $$
begin
  alter table public.reviews add constraint reviews_rating_check check (rating between 1 and 5);
exception when duplicate_object then null;
end $$;

-- ---------- 2. 注册触发器：邀请码原子校验 ----------
-- 注册请求通过元数据携带 display_name / invite_code。
-- 校验失败会抛出异常，整个注册事务（含 auth.users 插入）一并回滚。
-- 邀请码可重复使用：只校验「存在」，不消耗、不限次数。

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_code text;
  v_new  text;
begin
  -- 显示名：取注册元数据，缺省取邮箱前缀
  v_name := coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), split_part(new.email, '@', 1));
  if length(v_name) < 2 or length(v_name) > 16 then
    raise exception '用户名需为 2-16 位字符';
  end if;

  -- 锁定邀请码所在行，原子校验「邀请码存在」（可重复使用，不消耗）
  v_code := upper(trim(coalesce(new.raw_user_meta_data->>'invite_code', '')));
  perform 1 from public.invite_codes where code = v_code for update;
  if not found then
    raise exception '邀请码无效';
  end if;

  -- 生成新用户自己的专属邀请码
  v_new := 'TEA-' || upper(substr(md5(random()::text || clock_timestamp()::text || new.id::text), 1, 8));

  -- 建档案（用户名唯一约束由上方索引兜底）
  insert into public.profiles (id, name, invite_code) values (new.id, v_name, v_new);

  -- 登记新码（邀请人的码不消耗，可继续给其他茶友使用）
  insert into public.invite_codes (code, owner) values (v_new, new.id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- 3. RPC：注册预检查 ----------

-- 注册前预检查：邀请码是否存在（可重复使用；最终校验在触发器中原子完成）
create or replace function public.check_invite(p_code text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.invite_codes
    where code = upper(trim(coalesce(p_code, '')))
  );
$$;

-- 邀请码可重复使用后不再需要「生成新邀请码」，移除旧版本函数（若存在）
drop function if exists public.request_new_invite();

-- 注册前预检查：用户名是否已被占用（不区分大小写）
create or replace function public.name_taken(p_name text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where lower(name) = lower(trim(coalesce(p_name, '')))
  );
$$;

-- ---------- 4. 行级安全（RLS） ----------
-- 原则：读自己的、写自己的；写入只允许发生在触发器与 RPC（security definer）中。

alter table public.profiles     enable row level security;
alter table public.invite_codes enable row level security;
alter table public.reviews      enable row level security;

-- 档案：仅本人可读（评价展示用的是 reviews 里冗余的昵称，无需公开档案）
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (id = auth.uid());

-- 邀请码：仅能看到自己拥有 / 自己消耗过的码
drop policy if exists "invite_codes_select_own" on public.invite_codes;
create policy "invite_codes_select_own"
  on public.invite_codes for select
  using (owner = auth.uid() or used_by = auth.uid());

-- 评分：所有人可读（游客也能看到茶友平均分）；仅能增删改自己的一条
drop policy if exists "reviews_select_all" on public.reviews;
create policy "reviews_select_all"
  on public.reviews for select
  using (true);
drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own"
  on public.reviews for insert
  with check (user_id = auth.uid());
drop policy if exists "reviews_update_own" on public.reviews;
create policy "reviews_update_own"
  on public.reviews for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
drop policy if exists "reviews_delete_own" on public.reviews;
create policy "reviews_delete_own"
  on public.reviews for delete
  using (user_id = auth.uid());

-- ---------- 5. 初始创始人邀请码 ----------
-- 与其他邀请码一样可重复使用。⚠️ 部署后建议到 Table Editor →
-- invite_codes 把 code 改成你自己的随机串再用它注册。
-- 以后想再发“官方码”：在该表插入新行、owner 留空即可。
insert into public.invite_codes (code) values ('TEA-FOUNDER-0001')
on conflict (code) do nothing;
