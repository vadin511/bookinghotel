"use client";
import { useEffect } from "react";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận",
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  type = "danger", // 'danger', 'warning', 'info'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "danger":
        return "fas fa-exclamation-triangle text-red-500";
      case "warning":
        return "fas fa-exclamation-circle text-amber-500";
      case "info":
        return "fas fa-info-circle text-blue-500";
      default:
        return "fas fa-question-circle text-gray-500";
    }
  };

  const getButtonColors = () => {
    switch (type) {
      case "danger":
        return "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700";
      case "warning":
        return "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700";
      case "info":
        return "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700";
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 backdrop-blur-sm z-500 flex items-center justify-center animate-fadeIn"
        onClick={handleCancel}
      >
        {/* Dialog Box */}
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-opacity-10 ${
                type === "danger" ? "bg-red-100" : type === "warning" ? "bg-amber-100" : "bg-blue-100"
              }`}>
                <i className={`${getIcon()} text-2xl`}></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <p className="text-base text-gray-600 leading-relaxed">{message}</p>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
            >
              <i className="fas fa-times"></i>
              <span>{cancelText}</span>
            </button>
            <button
              onClick={handleConfirm}
              className={`px-5 py-2.5 rounded-lg text-white font-medium transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg ${getButtonColors()}`}
            >
              <i className={`fas ${type === "danger" ? "fa-trash-alt" : type === "warning" ? "fa-exclamation-triangle" : "fa-check-circle"}`}></i>
              <span>{confirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmDialog;

