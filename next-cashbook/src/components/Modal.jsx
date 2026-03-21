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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        id="ConfirmationModal"
        className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            {type === 'danger' && <AlertCircle className="text-red-500" size={20} />}
            {title}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="px-6 py-6 text-gray-300">
          <p>{message}</p>
        </div>

        <div className="px-6 py-4 bg-gray-900/50 border-t border-gray-800 flex gap-3">
          <button
            id="CancelBtn"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
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
              type === 'danger' ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'
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
