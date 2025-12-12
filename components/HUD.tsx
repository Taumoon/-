import React from 'react';
import { GameState } from '../types';
import { AlertTriangle, Clock, Wallet, Activity, Pill } from 'lucide-react';

interface HUDProps {
  state: GameState;
}

const HUD: React.FC<HUDProps> = ({ state }) => {
  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute top-4 left-4 text-white z-10 text-sm md:text-base space-y-2 select-none pointer-events-none">
      <div className="bg-gray-900/80 p-3 rounded border border-gray-700 shadow-lg backdrop-blur-sm">
        <p className="flex items-center gap-2 mb-1">
            <Clock size={16} className="text-cyan-400"/> 
            当前时间: <span className="font-mono text-cyan-400 font-bold">{formatTime(state.time)}</span>
        </p>
        <p className="flex items-center gap-2 mb-1">
            <Wallet size={16} className="text-yellow-400"/>
            存款余额: <span className="font-mono text-yellow-400 font-bold">{state.money}</span> 元
        </p>
        <p className="flex items-center gap-2 mb-1">
            <Activity size={16} className="text-blue-300"/>
            剩余精力: <span className="font-mono text-blue-300">{state.energy}</span>/100
        </p>
        <p className="flex items-center gap-2 mb-1">
            <span className="text-xl">👵</span>
            奶奶状况: <span className={`font-bold ${state.grandmaHealth > 80 ? 'text-green-400' : 'text-yellow-500'}`}>{state.grandmaHealth > 80 ? '稳定' : '需关注'}</span>
        </p>
        <p className="flex items-center gap-2 mb-1">
            <Pill size={16} className="text-red-300"/>
            药物库存: <span className="font-mono text-red-300">{state.meds}</span> 份
        </p>
        
        <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-400">
          按 <span className="border border-gray-600 px-1 rounded bg-gray-800 text-white">[U]</span> 电脑 / <span className="border border-gray-600 px-1 rounded bg-gray-800 text-white">[E]</span> 手机
        </div>
      </div>
    </div>
  );
};

export default HUD;