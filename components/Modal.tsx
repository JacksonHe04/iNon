'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  position?: 'center' | 'top-right';
}

export default function Modal({ open, onClose, children, className = '', position = 'center' }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const containerClass =
    position === 'top-right'
      ? 'items-start justify-end pt-24 pr-6'
      : 'items-center justify-center';

  const modalElement = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-50 flex bg-slate-900/35 backdrop-blur-xl px-4 ${containerClass}`}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            className={`max-w-lg w-full rounded-3xl border border-white/40 bg-white/60 p-6 shadow-2xl backdrop-blur-2xl text-gray-900 ${className}`}
            onClick={(event) => event.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;

  return createPortal(modalElement, document.body);
}

