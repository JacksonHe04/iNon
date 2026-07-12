import React from 'react';
import type { HardwareInfo } from '../ProductsBlock';

interface HardwareGridProps {
  myHardware: HardwareInfo;
}

export function HardwareGrid({ myHardware }: HardwareGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 text-xs">
      <div className="p-3 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20">
        <span className="text-[10px] text-gray-400 font-mono">📱 PHONE</span>
        <p className="font-bold text-gray-800 dark:text-white mt-0.5">{myHardware.phone}</p>
      </div>
      <div className="p-3 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20">
        <span className="text-[10px] text-gray-400 font-mono">💻 COMPUTER</span>
        <p className="font-bold text-gray-800 dark:text-white mt-0.5">
          {myHardware.computer}
        </p>
      </div>
      <div className="p-3 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20">
        <span className="text-[10px] text-gray-400 font-mono">📟 TABLET</span>
        <p className="font-bold text-gray-800 dark:text-white mt-0.5">{myHardware.tablet}</p>
      </div>
      <div className="p-3 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20">
        <span className="text-[10px] text-gray-400 font-mono">⌚ WATCH</span>
        <p className="font-bold text-gray-800 dark:text-white mt-0.5">
          {myHardware.smartwatch}
        </p>
      </div>
      <div className="col-span-2 p-3 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20">
        <span className="text-[10px] text-gray-400 font-mono">🎧 HEADPHONES</span>
        <p className="font-bold text-gray-800 dark:text-white mt-0.5">
          {myHardware.headphones.join(' 、 ')}
        </p>
      </div>
    </div>
  );
}
export default HardwareGrid;
