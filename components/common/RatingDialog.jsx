"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const RatingDialog = ({
  isOpen,
  onClose,
  onConfirm,
  bookingInfo,
  existingReview = null,
}) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (existingReview) {
        setRating(existingReview.rating);
        setComment(existingReview.comment || "");
      } else {
        setRating(0);
        setComment("");
      }
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, existingReview]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá");
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm({ rating, comment: comment.trim() });
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setRating(existingReview?.rating || 0);
    setComment(existingReview?.comment || "");
    setHoveredRating(0);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0  flex items-start justify-center pt-20 pb-8 px-4 overflow-y-auto animate-fadeIn backdrop-blur-md bg-white/20"
        onClick={handleCancel}
      >
        {/* Dialog Box */}
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full my-auto transform transition-all duration-300 scale-100 animate-fadeIn border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                  <i className="fas fa-star text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Đánh giá phòng
                  </h3>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Chia sẻ trải nghiệm của bạn
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors hover:bg-white/50 rounded-full p-2 w-8 h-8 flex items-center justify-center"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            {bookingInfo && (
              <div className="mb-5 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-semibold text-gray-800">Phòng:</span>{" "}
                  <span className="text-gray-700">{bookingInfo.roomName}</span>
                </p>
                {bookingInfo.hotelName && (
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold text-gray-800">Khách sạn:</span>{" "}
                    <span className="text-gray-700">{bookingInfo.hotelName}</span>
                  </p>
                )}
                {bookingInfo.checkIn && bookingInfo.checkOut && (
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-800">Ngày:</span>{" "}
                    <span className="text-gray-700">{bookingInfo.checkIn} - {bookingInfo.checkOut}</span>
                  </p>
                )}
              </div>
            )}

            {/* Rating Stars */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-800 mb-4">
                Đánh giá <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none transition-all duration-200 hover:scale-125 active:scale-95"
                  >
                    <i
                      className={`fas fa-star text-4xl transition-all duration-200 ${
                        star <= (hoveredRating || rating)
                          ? "text-amber-400 drop-shadow-md"
                          : "text-gray-300"
                      }`}
                    ></i>
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-3 text-base font-medium text-gray-700 bg-amber-50 px-3 py-1.5 rounded-lg">
                    {rating === 1
                      ? "Rất tệ"
                      : rating === 2
                      ? "Tệ"
                      : rating === 3
                      ? "Bình thường"
                      : rating === 4
                      ? "Tốt"
                      : "Tuyệt vời"}
                  </span>
                )}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Nhận xét (tùy chọn)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về phòng này..."
                className="w-full p-4 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 text-gray-700 placeholder-gray-400"
                rows="4"
                maxLength={500}
              />
              <p className="text-xs text-gray-400 mt-2 text-right">
                {comment.length}/500 ký tự
              </p>
            </div>

            <div className="mt-5 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
              <p className="text-sm text-blue-800 flex items-start">
                <i className="fas fa-info-circle mr-2 mt-0.5 text-blue-500"></i>
                <span>Đánh giá của bạn sẽ giúp người khác có thêm thông tin để quyết định đặt phòng.</span>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-gray-700 font-medium transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-times"></i>
              <span>Hủy</span>
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting || rating === 0}
              className="px-6 py-2.5 rounded-xl text-white font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i>
                  <span>Gửi đánh giá</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RatingDialog;

