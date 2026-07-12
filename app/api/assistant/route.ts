import { NextResponse } from 'next/server';
import { getReadmeData } from '@/lib/content';
import { readmeDataToMarkdown } from '@/lib/markdown';
import { ReadmeData } from '@/types';
import { getAuthorNickname } from '@/lib/utils';

const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: '消息格式不正确' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: '缺少 API KEY' }, { status: 500 });
    }

    const readmeData = (await getReadmeData()) as ReadmeData;
    const profileMarkdown = readmeDataToMarkdown(readmeData);
    const nickname = getAuthorNickname(readmeData.basic.name);
    const systemPrompt = `你是小${nickname}，是${nickname}的数字花园的主人。请根据以下关于你的 Markdown 资料回答访客的问题，保持温柔、简洁且富有创意。\n\n${profileMarkdown}`;

    const payload = {
      model: 'openrouter/free',
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((msg) => ({ role: msg.role, content: msg.content })),
      ],
    };

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok || !response.body) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: '大模型接口异常', detail: errorText },
        { status: response.status }
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        let buffer = '';
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              if (trimmed === 'data: [DONE]') {
                controller.close();
                return;
              }
              if (trimmed.startsWith('data:')) {
                const data = trimmed.replace(/^data:\s*/, '');
                try {
                  const json = JSON.parse(data);
                  const delta =
                    json.choices?.[0]?.delta?.content ??
                    json.choices?.[0]?.message?.content ??
                    '';
                  if (delta) {
                    controller.enqueue(encoder.encode(delta));
                  }
                } catch {
                  // ignore malformed chunk
                }
              }
            }
          }
          if (buffer.trim().startsWith('data:')) {
            try {
              const json = JSON.parse(buffer.replace(/^data:\s*/, ''));
              const delta =
                json.choices?.[0]?.delta?.content ??
                json.choices?.[0]?.message?.content ??
                '';
              if (delta) {
                controller.enqueue(encoder.encode(delta));
              }
            } catch {
              // ignore
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    return NextResponse.json(
      { error: '请求处理失败', detail: (error as Error).message },
      { status: 500 }
    );
  }
}
