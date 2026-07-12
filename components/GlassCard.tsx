'use client';

import { motion } from 'framer-motion';
import { ReactNode, createContext, useContext } from 'react';
import { MOTION_TOKENS } from '@/lib/motion';

export const GlassCardContext = createContext({ hoverEnabled: true });

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function GlassCard({ children, className = '', hover = true, onClick }: GlassCardProps) {
  const { hoverEnabled } = useContext(GlassCardContext);
  const shouldHover = hover && hoverEnabled;

  return (
    <motion.div
      className={`backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 rounded-xl p-6 ${className}`}
      whileHover={shouldHover ? { scale: 1.02, y: -4 } : {}}
      transition={MOTION_TOKENS.spring.bouncy}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

