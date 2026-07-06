import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_PROFILE_SLUG } from '@/lib/content/constants';

type MessagePayload = {
  nickname?: string;
  contact?: string;
  content?: string;
};

function hashIp(ip: string): string {
  let hash = 0;
  for (let index = 0; index < ip.length; index += 1) {
    hash = (hash << 5) - hash + ip.charCodeAt(index);
    hash |= 0;
  }
  return String(hash);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as MessagePayload;
    const nickname = body.nickname?.trim() || '访客';
    const contact = body.contact?.trim() || '';
    const content = body.content?.trim() || '';

    if (!content) {
      return NextResponse.json({ error: '留言内容不能为空' }, { status: 400 });
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: '留言过长，请控制在 1000 字以内' }, { status: 400 });
    }

    const supabase = await createClient();
    const profileResult = await supabase
      .from('profiles')
      .select('id')
      .eq('slug', DEFAULT_PROFILE_SLUG)
      .eq('is_published', true)
      .maybeSingle();

    if (profileResult.error || !profileResult.data) {
      return NextResponse.json({ error: '未找到可留言的档案' }, { status: 500 });
    }

    const forwardedFor = req.headers.get('x-forwarded-for') || '';
    const clientIp = forwardedFor.split(',')[0]?.trim() || 'unknown';
    const userAgent = req.headers.get('user-agent') || '';

    const insertResult = await supabase.from('messages').insert({
      profile_id: profileResult.data.id,
      nickname,
      contact,
      content,
      ip_hash: hashIp(clientIp),
      user_agent: userAgent,
      status: 'pending',
    });

    if (insertResult.error) {
      return NextResponse.json(
        { error: '留言写入失败', detail: insertResult.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: '请求处理失败', detail: (error as Error).message },
      { status: 500 }
    );
  }
}
