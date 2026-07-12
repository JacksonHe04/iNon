import React from 'react';
import { motion } from 'framer-motion';
import Modal from '@/components/Modal';

interface LevelModalProps {
  open: boolean;
  onClose: () => void;
  birthDate: string;
  age: number;
  yearProgress: {
    daysPassed: number;
    totalDays: number;
    percentage: number;
  };
}

export function LevelModal({
  open,
  onClose,
  birthDate,
  age,
  yearProgress,
}: LevelModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4 text-sm text-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">出生日期</p>
            <p className="text-lg font-semibold text-gray-900">{birthDate}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">当前年龄</p>
            <p className="text-lg font-semibold text-gray-900">{age} 岁</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">
            今年 {yearProgress.totalDays} 天 · 已度过 {yearProgress.daysPassed} 天
          </p>
          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${yearProgress.percentage}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
export default LevelModal;
