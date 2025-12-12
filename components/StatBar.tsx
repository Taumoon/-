import React from 'react';
import { GameState } from '../types';
import { Banknote, Clock, Zap, HeartPulse } from 'lucide-react';

interface StatBarProps {
  state: GameState;
}

const StatItem = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) => (
  <div className="flex items-center space-x-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50 backdrop-blur-sm">
    <span className={color}>{icon}</span>
    <span className="text-xs text-slate-400 font-medium hidden sm:inline">{label}</span>
    <span className={`font-mono font-bold text-sm ${color}`}>{value}</span>
  </div>
);

const StatBar: React.FC<StatBarProps> = ({ state }) => {
  return (
    <div className="fixed top-0 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg z-20 transition-all duration-300">
      <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <StatItem 
            icon={<Banknote size={16} />} 
            label="FUNDS" 
            value={state.money} 
            color="text-emerald-400" 
          />
          <StatItem 
            icon={<Clock size={16} />} 
            label="TIME" 
            value={state.time} 
            color="text-blue-400" 
          />
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <StatItem 
            icon={<Zap size={16} />} 
            label="ENERGY" 
            value={state.energy} 
            color="text-yellow-400" 
          />
          <StatItem 
            icon={<HeartPulse size={16} />} 
            label="GRANDMA" 
            value={state.grandmaHealth > 50 ? 'Stable' : 'Critical'} 
            color={state.grandmaHealth > 50 ? 'text-rose-400' : 'text-red-600 animate-pulse'} 
          />
        </div>
      </div>
    </div>
  );
};

export default StatBar;