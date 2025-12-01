"use client";
import { useState, useEffect } from "react";

const CancelBookingDialog = ({
  isOpen,
  onClose,
  onConfirm,
  bookingInfo,
}) => {
  const [cancellationReason, setCancellationReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setCancellationReason("");
      setError("");
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!cancellationReason.trim()) {
      setError("Vui lòng nhập lý do hủy đặt phòng");
      return;
    }
    if (cancellationReason.trim().length < 10) {
      setError("Lý do hủy phải có ít nhất 10 ký tự");
      return;
    }
    onConfirm(cancellationReason.trim());
  };

  const handleCancel = () => {
    setCancellationReason("");
    setError("");
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn"
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
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-100">
                <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Hủy đặt phòng</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Vui lòng nhập lý do hủy đặt phòng của bạn
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            {bookingInfo && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">Phòng:</span> {bookingInfo.roomName}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Ngày:</span> {bookingInfo.checkIn} - {bookingInfo.checkOut}
                </p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do hủy <span className="text-red-500">*</span>
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => {
                  setCancellationReason(e.target.value);
                  setError("");
                }}
                placeholder="Ví dụ: Thay đổi kế hoạch, không thể đi được, tìm được phòng khác phù hợp hơn..."
                className={`w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 ${
                  error
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-amber-500"
                }`}
                rows="4"
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-1">
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
                <p className="text-xs text-gray-500 ml-auto">
                  {cancellationReason.length}/500 ký tự
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                <i className="fas fa-info-circle mr-1"></i>
                Lưu ý: Sau khi hủy, bạn sẽ không thể hoàn tác hành động này.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
            >
              <i className="fas fa-times"></i>
              <span>Đóng</span>
            </button>
            <button
              onClick={handleConfirm}
              disabled={!cancellationReason.trim() || cancellationReason.trim().length < 10}
              className="px-5 py-2.5 rounded-lg text-white font-medium transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
            >
              <i className="fas fa-trash-alt"></i>
              <span>Xác nhận hủy</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CancelBookingDialog;

