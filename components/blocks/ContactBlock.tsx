'use client';

import GlassCard from '@/components/GlassCard';
import { Users, Mail, MessageCircle, Send } from 'lucide-react';

export interface ContactItem {
  name: string;
  role: string;
  avatar?: string;
  link: string;
}

interface ContactBlockProps {
  contacts: ContactItem[];
  title?: string;
}

export default function ContactBlock({ contacts, title }: ContactBlockProps) {
  return (
    <GlassCard className="p-5 space-y-4 hover:border-blue-400/40 transition">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          {title && <h3 className="font-bold text-base text-gray-900 dark:text-white">{title}</h3>}
        </div>
        <span className="text-xs text-gray-400 font-mono">{contacts.length} 位</span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {contacts.map((c, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 hover:border-blue-400/50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow">
                {c.name[0]}
              </div>
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">{c.name}</div>
                <div className="text-[10px] text-gray-500">{c.role}</div>
              </div>
            </div>

            <a
              href={c.link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-300 text-xs font-semibold hover:bg-blue-500/20 transition flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              <span>沟通</span>
            </a>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
