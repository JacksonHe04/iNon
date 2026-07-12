import React from 'react';
import GlassCard from '@/components/GlassCard';
import type { ReadmeData } from '@/types';

interface ContactBlockProps {
  contactInfo: ReadmeData['contact']['contact_info'];
  title: string;
}

export function ContactBlock({ contactInfo, title }: ContactBlockProps) {
  return (
    <GlassCard className="p-6 space-y-4">
      <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
        {title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        {contactInfo.map((c, idx) => {
          const isEmail = c.method_name === '邮箱' || c.content.includes('@');
          const isLink = c.content.startsWith('http') || c.method_name === '个人网站';
          return (
            <div key={idx} className="p-3 rounded-xl bg-white/40 border border-white/20 hover:border-teal-500/30 transition">
              <div className="text-[10px] text-gray-400 font-mono">{c.method_name}</div>
              {isEmail ? (
                <a href={`mailto:${c.content}`} className="font-bold text-teal-600 dark:text-teal-400 hover:underline mt-1 block">
                  {c.content}
                </a>
              ) : isLink ? (
                <a href={c.content} target="_blank" rel="noopener noreferrer" className="font-bold text-teal-600 dark:text-teal-400 hover:underline mt-1 block truncate">
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
