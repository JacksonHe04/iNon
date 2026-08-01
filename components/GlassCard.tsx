'use client';

import { motion } from 'framer-motion';
import { ReactNode, createContext, useContext } from 'react';

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
      className={`archive-paper-surface p-6 ${className}`}
      data-hover={shouldHover ? 'true' : 'false'}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
