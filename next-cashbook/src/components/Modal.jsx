import React, { useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

const Modal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "info" 
}) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#17120c]/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        id="ConfirmationModal"
        className="bg-[#fffdfa] border border-[#d9c6a8] rounded-2xl w-full max-w-md overflow-hidden shadow-[0_20px_60px_rgba(94,61,28,0.18)] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#eadfce] flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#17120c] flex items-center gap-2">
            {type === 'danger' && <AlertCircle className="text-[#b91c1c]" size={20} />}
            {title}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-[#fff4e7] rounded-full transition-colors text-[#6f655a] hover:text-[#17120c]">
            <X size={20} />
          </button>
        </div>
        
        <div className="px-6 py-6 text-[#433a31]">
          <p>{message}</p>
        </div>

        <div className="px-6 py-4 bg-[#fff8ef] border-t border-[#eadfce] flex gap-3">
          <button
            id="CancelBtn"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-[#f7efe4] text-[#17120c] border border-[#d9c6a8] rounded-lg hover:bg-[#efe1c7] transition-colors font-semibold"
          >
            {cancelText}
          </button>
          <button
            id="DeleteBtn"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors font-semibold ${
              type === 'danger' ? 'bg-[#b91c1c] hover:bg-[#991b1b] text-white' : 'bg-[#c46d12] hover:bg-[#9a4c00] text-white'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
