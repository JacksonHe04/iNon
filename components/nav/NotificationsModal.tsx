import React from 'react';
import Modal from '@/components/Modal';
import pkg from '@/package.json';

interface NotificationItem {
  date: string;
  text: string;
  type: string;
}

interface NotificationsModalProps {
  open: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
}

export function NotificationsModal({ open, onClose, notifications }: NotificationsModalProps) {
  return (
    <Modal open={open} onClose={onClose} position="top-right" className="max-w-sm">
      <div className="flex items-center justify-between mb-2 pb-1 border-b border-gray-100 dark:border-gray-800">
        <h3 className="font-bold text-gray-900 dark:text-white">通知</h3>
        <span className="text-[10px] font-bold font-mono text-gray-400 dark:text-gray-500">v{pkg.version}</span>
      </div>
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {notifications.map((notif, idx) => (
          <div key={idx} className="text-sm border-b border-gray-200 pb-2 last:border-0">
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">{notif.date}</span>
              <span className="text-xs px-2 py-0.5 bg-blue-100 rounded text-blue-700">{notif.type}</span>
            </div>
            <p className="mt-1 text-gray-700">{notif.text}</p>
          </div>
        ))}
      </div>
    </Modal>
  );
}
export default NotificationsModal;
