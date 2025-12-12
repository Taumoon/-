import React from 'react';
import { DialogueState } from '../types';

interface DialogueBoxProps {
  dialogue: DialogueState;
}

const DialogueBox: React.FC<DialogueBoxProps> = ({ dialogue }) => {
  if (!dialogue.visible) return null;

  return (
    <div className="absolute bottom-0 left-0 w-full p-0 z-30 pointer-events-none">
      <div 
        className="w-full flex flex-col justify-end pb-12 px-8 md:px-20 h-[220px]"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 20%, transparent)' }}
      >
        <div className="max-w-4xl mx-auto w-full animate-[slideUp_0.5s_ease-out]">
          <p className="text-yellow-400 font-bold text-xl mb-2 tracking-wide font-sans">
            {dialogue.speaker}
          </p>
          <p className="text-2xl leading-relaxed text-white font-medium drop-shadow-md font-sans">
            {dialogue.text}
          </p>
          <p className="text-sm text-gray-400 mt-4 animate-pulse">
            按 [空格键] 继续
          </p>
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default DialogueBox;