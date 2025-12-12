import React from 'react';
import { DesktopItemProps } from '../types';

const DesktopItem: React.FC<DesktopItemProps> = ({ label, description, icon, onClick, badge, disabled }) => {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative flex flex-col items-center justify-center p-6 
        rounded-2xl transition-all duration-300 w-full aspect-square
        border-b-4 active:border-b-0 active:translate-y-1
        ${disabled 
          ? 'bg-slate-800/50 border-slate-800 cursor-not-allowed opacity-50' 
          : 'bg-slate-800 hover:bg-slate-700 border-slate-950 hover:shadow-xl hover:shadow-cyan-900/10 hover:scale-[1.02]'
        }
      `}
    >
      <div className={`mb-3 transition-transform duration-300 ${!disabled && 'group-hover:scale-110 group-hover:-rotate-3'}`}>
        {icon}
      </div>
      <div className="font-bold text-lg text-slate-200">{label}</div>
      <div className="text-xs text-slate-500 mt-1 font-medium">{description}</div>
      
      {badge && (
        <span className="absolute top-3 right-3 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
        </span>
      )}
    </button>
  );
};

export default DesktopItem;