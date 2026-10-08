-- ==============================================================================
-- BẢNG LƯU TRỮ LỊCH SỬ XEM PHIM (WATCH HISTORY) TRÊN SUPABASE CHO TÀI KHOẢN HAIYEN
-- Copy và chạy script này tại: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Tạo bảng watch_history
CREATE TABLE IF NOT EXISTS public.watch_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL DEFAULT 'haiyen',
    movie_slug TEXT NOT NULL,
    movie_name TEXT NOT NULL,
    origin_name TEXT,
    poster_url TEXT,
    quality TEXT,
    year TEXT,
    last_episode_slug TEXT NOT NULL,
    last_episode_name TEXT NOT NULL,
    last_position_seconds NUMERIC DEFAULT 0,
    duration_seconds NUMERIC DEFAULT 1,
    progress_percent NUMERIC DEFAULT 0,
    total_episodes INTEGER DEFAULT 1,
    watched_episodes JSONB DEFAULT '[]'::jsonb,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT watch_history_user_movie_unique UNIQUE (user_id, movie_slug)
);

-- 2. Đánh Index tăng tốc độ truy vấn
CREATE INDEX IF NOT EXISTS idx_watch_history_user_updated 
ON public.watch_history (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_watch_history_user_movie 
ON public.watch_history (user_id, movie_slug);

-- 3. Bật Row Level Security (RLS) và thiết lập Policy cho phép client anon đọc/ghi dữ liệu
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all on watch_history" ON public.watch_history;

CREATE POLICY "Allow anon all on watch_history"
ON public.watch_history
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 4. Bật Realtime (tùy chọn để sync tức thì giữa các thiết bị)
ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_history;
