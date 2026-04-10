-- ========================================
-- 消費期限管理アプリ Supabase スキーマ
-- ========================================

create table if not exists items (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users not null,
  name          text not null,
  category      text not null default 'other',  -- 'condiment' | 'disaster' | 'other'
  expiry_date   date not null,
  location      text,
  quantity      integer default 1,
  is_disaster   boolean default false,
  barcode       text,
  image_url     text,
  notify_days   integer default 14,
  notified_at   timestamp,
  created_at    timestamp default now()
);

-- RLS（Row Level Security）
alter table items enable row level security;

create policy "ユーザーは自分のアイテムのみ操作可能"
  on items for all
  using (auth.uid() = user_id);
