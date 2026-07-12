import React from 'react';
import GlassCard from '@/components/GlassCard';
import type { ReadmeData } from '@/types';

interface ContactBlockProps {
  contactInfo: ReadmeData['contact']['contact_info'];
  title: string;
}

type ContactLink =
  | { kind: 'email'; href: string }
  | { kind: 'phone'; href: string }
  | { kind: 'url'; href: string }
  | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_METHOD_RE = /(电话|手机|phone|tel|mobile)/i;
const PHONE_CONTENT_RE = /^\+?[0-9][0-9\s().-]{5,}$/;
const DOMAIN_RE = /^[a-z0-9-]+(\.[a-z0-9-]+)+([/?#].*)?$/i;

function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const candidate = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : DOMAIN_RE.test(trimmed)
      ? `https://${trimmed}`
      : null;

  if (!candidate) return null;

  try {
    const url = new URL(candidate);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.toString();
  } catch {
    return null;
  }
}

function getContactLink(methodName: string, content: string): ContactLink {
  const value = content.trim();
  if (!value) return null;

  if (EMAIL_RE.test(value)) {
    return { kind: 'email', href: `mailto:${value}` };
  }

  if (PHONE_METHOD_RE.test(methodName) || PHONE_CONTENT_RE.test(value)) {
    const phone = value.replace(/[^\d+]/g, '');
    return phone ? { kind: 'phone', href: `tel:${phone}` } : null;
  }

  const url = normalizeUrl(value);
  return url ? { kind: 'url', href: url } : null;
}

export function ContactBlock({ contactInfo, title }: ContactBlockProps) {
  return (
    <GlassCard className="p-6 space-y-4">
      <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
        {title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        {contactInfo.map((c, idx) => {
          const link = getContactLink(c.method_name, c.content);
          return (
            <div key={idx} className="p-3 rounded-xl bg-white/40 border border-white/20 hover:border-teal-500/30 transition">
              <div className="text-[10px] text-gray-400 font-mono">{c.method_name}</div>
              {link ? (
                <a
                  href={link.href}
                  target={link.kind === 'url' ? '_blank' : undefined}
                  rel={link.kind === 'url' ? 'noopener noreferrer' : undefined}
                  className="font-bold text-teal-600 dark:text-teal-400 hover:underline mt-1 block truncate"
                >
                  {c.content}
                </a>
              ) : (
                <div className="font-bold text-gray-800 dark:text-gray-200 mt-1">{c.content}</div>
              )}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
export default ContactBlock;
