-- 留言板从"准入制"改为"退出制"：默认可见(approved)，用户可在控制台隐藏(rejected)
ALTER TABLE public.messages ALTER COLUMN status SET DEFAULT 'approved';

-- 兑现"默认全部展示"：把历史遗留的 pending 留言刷为 approved
UPDATE public.messages
SET status = 'approved', approved_at = COALESCE(approved_at, timezone('utc', now()))
WHERE status = 'pending';
