import React, { useEffect, useState } from 'react';
import { GameState } from '../types';

interface CameraOverlayProps {
  onClose: () => void;
  grandmaHealth: number;
}

const CameraOverlay: React.FC<CameraOverlayProps> = ({ onClose, grandmaHealth }) => {
  const [status, setStatus] = useState('正在缓冲视频流数据 (延迟 24ms)...');
  const [statusColor, setStatusColor] = useState('text-yellow-500 animate-pulse');
  const [showFeed, setShowFeed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('🟢 实时连接成功 | 信号强度: 极佳');
      setStatusColor('text-green-500');
      setShowFeed(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const isDay2LowBP = grandmaHealth < 80;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
      <div className="relative w-3/4 h-3/4 bg-gray-900 border-2 border-red-900 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }} />

        <div className="absolute inset-0 p-8 flex flex-col font-mono text-green-500">
          <button onClick={onClose} className="absolute top-4 right-4 text-red-500 hover:text-red-300 border border-red-900 px-3 py-1 z-50">[断开连接]</button>
          <div className="absolute top-4 left-4 text-red-600 animate-pulse font-bold">● REC [客厅摄像头 - 实时]</div>

          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="border border-green-800 p-10 bg-black/90 text-center max-w-lg w-full">
              <p className="text-2xl mb-4 text-green-400">📡 正在建立连接...</p>
              <p className={`text-sm ${statusColor}`}>{status}</p>
              
              {showFeed && (
                <div className="text-left mt-6 bg-gray-900 p-4 border border-gray-700 animate-[fadeIn_0.5s_ease-out]">
                  <p className="text-white font-bold mb-2">{">>"} 画面识别分析：</p>
                  
                  {isDay2LowBP ? (
                     <>
                        <p className="text-gray-300 mt-2">奶奶状态：<span className="text-red-300">正与保姆轻声交谈，表情夹杂着抱怨。</span></p>
                        <p className="text-gray-300">保姆动作：<span className="text-yellow-200">在药物站前检查了很久，表情似乎在确认些什么...</span></p>
                        <div className="mt-4 pt-2 border-t border-gray-600 text-red-400 font-mono font-bold">
                            {">>"} 智能手环同步：心率 95 bpm (偏高) / 血压 90/60 mmHg (低血压)
                        </div>
                     </>
                  ) : (
                     <>
                        <p className="text-gray-300 mt-2">画面中央：<span className="text-yellow-200">一位年迈的女性</span></p>
                        <p className="text-gray-300">动作状态：<span className="text-yellow-200">坐在旧沙发上，正在织毛衣</span></p>
                        <p className="text-gray-300">环境细节：桌上摆放着主角的相框。</p>
                        <div className="mt-4 pt-2 border-t border-gray-600 text-green-400 font-mono">
                            {">>"} 智能手环同步：心率 75 bpm (平稳)
                        </div>
                     </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default CameraOverlay;