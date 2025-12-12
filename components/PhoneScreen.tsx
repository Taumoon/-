import React from 'react';
import { GameState } from '../types';
import { Phone, MessageCircle, Video, LogOut } from 'lucide-react';

interface PhoneScreenProps {
  state: GameState;
  onClose: () => void;
  onCallGrandma: () => void;
  onCheckWeChat: () => void;
  onCheckCamera: () => void;
}

const PhoneScreen: React.FC<PhoneScreenProps> = ({ state, onClose, onCallGrandma, onCheckWeChat, onCheckCamera }) => {
  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
      <div className="w-80 h-[600px] bg-gray-900 border-4 border-gray-700 rounded-[30px] shadow-2xl overflow-hidden flex flex-col p-4 text-white pointer-events-auto transform transition-transform animate-[fadeIn_0.3s_ease-out]">
        <div className="text-center text-sm mb-2 text-gray-400">📞 NanoOS</div>
        <div className="text-center text-4xl font-bold mb-8 text-yellow-400 font-mono tracking-wider">
            {formatTime(state.time)}
        </div>
        
        <div className="flex-1 space-y-4 pt-4 px-2">
            <button onClick={onCallGrandma} className="w-full bg-green-700 hover:bg-green-600 p-4 rounded-xl flex items-center justify-start transition-colors gap-4">
                <div className="bg-green-800 p-2 rounded-full"><Phone size={24} /></div>
                <div className="text-left">
                    <div className="font-bold">与奶奶通话</div>
                    <div className="text-xs text-green-200 opacity-70">耗时 20 分钟</div>
                </div>
            </button>
            
            <button onClick={onCheckWeChat} className="w-full bg-blue-700 hover:bg-blue-600 p-4 rounded-xl flex items-center justify-start transition-colors gap-4">
                <div className="bg-blue-800 p-2 rounded-full"><MessageCircle size={24} /></div>
                <div className="text-left">
                    <div className="font-bold">查看微信 (王阿姨)</div>
                    <div className="text-xs text-blue-200 opacity-70">查看消息</div>
                </div>
            </button>
            
            <button onClick={onCheckCamera} className="w-full bg-red-700 hover:bg-red-600 p-4 rounded-xl flex items-center justify-start transition-colors gap-4">
                <div className="bg-red-800 p-2 rounded-full"><Video size={24} /></div>
                <div className="text-left">
                    <div className="font-bold">远程监控</div>
                    <div className="text-xs text-red-200 opacity-70">耗时 10 分钟</div>
                </div>
            </button>
        </div>
        
        <button onClick={onClose} className="mt-auto bg-gray-800 hover:bg-gray-700 p-3 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-colors">
            <LogOut size={16}/> 返回桌面 [E]
        </button>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default PhoneScreen;