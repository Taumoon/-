import React, { useEffect, useState } from 'react';
import { ModalConfig } from '../types';
import { X } from 'lucide-react';

interface ModalProps {
  config: ModalConfig | null;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ config, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (config) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [config]);

  if (!config && !isVisible) return null;

  const getButtonClass = (variant: string) => {
    const base = "px-4 py-2 rounded-lg font-bold text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white";
    switch (variant) {
      case 'primary': return `${base} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500`;
      case 'success': return `${base} bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500`;
      case 'danger': return `${base} bg-red-600 hover:bg-red-700 text-white focus:ring-red-500`;
      case 'neutral': return `${base} bg-slate-200 hover:bg-slate-300 text-slate-700 focus:ring-slate-400`;
      default: return `${base} bg-slate-200 hover:bg-slate-300 text-slate-700 focus:ring-slate-400`;
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${config ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={!config?.hideCloseButton ? onClose : undefined}
      ></div>

      {/* Content */}
      <div 
        className={`
          relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden
          transform transition-all duration-300 
          ${config ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
        `}
      >
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">{config?.title}</h3>
          {!config?.hideCloseButton && (
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-6 text-slate-600">
          {config?.content}
        </div>

        {/* Footer */}
        {config?.buttons && config.buttons.length > 0 && (
          <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
            {config.buttons.map((btn, index) => (
              <button
                key={index}
                onClick={btn.onClick}
                className={getButtonClass(btn.variant)}
              >
                {btn.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;