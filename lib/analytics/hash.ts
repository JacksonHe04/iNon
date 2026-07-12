import { createHash } from 'node:crypto';

/**
 * 读取并校验 IP 哈希盐。
 * 服务端 env 缺失时直接抛错，避免在缺少盐的情况下退化为"无盐 hash"，
 * 那样所有环境的 ip_hash 会相同，UV 去重跨环境失效。
 */
export function getIpSalt(): string {
  const salt = process.env.ANALYTICS_IP_SALT;
  if (!salt || salt.length < 16) {
    throw new Error(
      'ANALYTICS_IP_SALT 未设置或过短（需 ≥ 16 字符）。' +
        '请在 .env.local 中生成：openssl rand -hex 32'
    );
  }
  return salt;
}

/**
 * 从 x-forwarded-for / x-real-ip 中提取客户端 IP。
 * 多层代理时取最左侧（最原始客户端）；空值返回 null。
 */
export function extractClientIp(headers: Headers): string | null {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return null;
}

/**
 * SHA-256(ip + salt) → hex。空 IP 返回空串（写库时不阻塞）。
 */
export function hashIp(ip: string | null, salt: string): string {
  if (!ip) return '';
  return createHash('sha256').update(`${ip}${salt}`).digest('hex');
}

/**
 * 提取 referrer 域名。空字符串视为"直接访问"。
 * 简单实现：去除协议与路径，限制长度避免超长污染聚合 jsonb。
 */
export function extractReferrerDomain(referrer: string | null | undefined): string {
  if (!referrer) return '';
  try {
    const url = new URL(referrer);
    return url.hostname.toLowerCase().slice(0, 128);
  } catch {
    // 非完整 URL（如有些客户端发的 bare host），尽量兜底
    const m = referrer.match(/^(?:https?:\/\/)?([^/?#]+)/i);
    return (m?.[1] ?? '').toLowerCase().slice(0, 128);
  }
}

/**
 * 极简 UA 解析：仅识别 device_type / browser / os。
 * 比 ua-parser-js 轻量，且不引入新依赖。
 * 命中失败返回空字符串，控制台会归类为"未知"。
 */
export function parseUserAgent(
  ua: string | null | undefined
): { device_type: 'desktop' | 'mobile' | 'tablet' | 'bot' | ''; browser: string; os: string } {
  if (!ua) return { device_type: '', browser: '', os: '' };

  const lower = ua.toLowerCase();

  // ---- device ----
  let device_type: 'desktop' | 'mobile' | 'tablet' | 'bot' | '' = '';
  if (/bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|preview/i.test(ua)) {
    device_type = 'bot';
  } else if (/ipad|tablet|playbook|silk/i.test(ua)) {
    device_type = 'tablet';
  } else if (/iphone|ipod|android.*mobile|windows phone|blackberry|opera mini|mobile/i.test(lower)) {
    device_type = 'mobile';
  } else if (/mozilla|chrome|safari|firefox|edge/i.test(lower)) {
    device_type = 'desktop';
  }

  // ---- browser ----
  let browser = '';
  if (/edg\//i.test(ua)) browser = 'Edge';
  else if (/opr\/|opera/i.test(ua)) browser = 'Opera';
  else if (/chrome|chromium|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua)) browser = 'Safari';
  browser = browser.slice(0, 64);

  // ---- os ----
  let os = '';
  if (/windows nt/i.test(ua)) os = 'Windows';
  else if (/mac os x|macintosh/i.test(ua)) os = 'macOS';
  else if (/iphone os|ipad os/i.test(ua)) os = 'iOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/cros/i.test(ua)) os = 'ChromeOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  return { device_type, browser, os };
}