"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookings, updateBookingStatus } from "../../../app/store/features/bookingsSlide";
import { selectUser, selectUserStatus } from "../../../app/store/features/userSlice";
import Loading from "@/components/common/Loading";
import CancelBookingDialog from "@/components/common/CancelBookingDialog";
import RatingDialog from "@/components/common/RatingDialog";
import { toast } from "react-toastify";

const MyBookingsPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector(selectUser);
  const userStatus = useSelector(selectUserStatus);
  const { list: bookings, loading, error } = useSelector(
    (state) => state.bookings
  );
  const [cancelDialog, setCancelDialog] = useState({
    isOpen: false,
    booking: null,
  });
  const [ratingDialog, setRatingDialog] = useState({
    isOpen: false,
    booking: null,
    room: null,
    existingReview: null,
  });
  const [reviews, setReviews] = useState({}); // { bookingId_roomId: review }

  // Fetch reviews cho các booking đã completed
  const fetchReviews = async () => {
    try {
      const completedBookings = bookings.filter(b => b.status === "completed");
      const reviewPromises = completedBookings.map(async (booking) => {
        if (!booking.hotel_id) return;
        
        try {
          const res = await fetch(
            `/api/reviews?hotel_id=${booking.hotel_id}&user_id=${user?.id}`,
            { credentials: "include" }
          );
          if (res.ok) {
            const data = await res.json();
            // Tìm review của user hiện tại cho hotel này
            const userReview = data.find(r => r.user_id === user?.id && r.hotel_id === booking.hotel_id);
            if (userReview) {
              return {
                key: `${booking.id}_${booking.hotel_id}`,
                review: userReview,
              };
            }
          }
        } catch (err) {
          console.error("Error fetching review:", err);
        }
        return null;
      });
      
      const allReviews = (await Promise.all(reviewPromises)).filter(Boolean);
      const reviewsMap = {};
      allReviews.forEach(({ key, review }) => {
        reviewsMap[key] = review;
      });
      setReviews(reviewsMap);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    // Chờ cho đến khi fetch user profile hoàn tất
    if (userStatus === 'loading' || userStatus === 'idle') {
      return;
    }

    // Nếu fetch thất bại hoặc không có user, redirect về login
    if (userStatus === 'failed' || !user) {
      router.push("/login");
      return;
    }

    // Nếu có user, fetch bookings
    dispatch(fetchBookings());
  }, [dispatch, user, userStatus, router]);

  useEffect(() => {
    if (bookings.length > 0 && user) {
      fetchReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings.length, user?.id]);

  // Tự động cập nhật status thành completed nếu quá check-out và đã confirmed
  useEffect(() => {
    const autoUpdateBookings = async () => {
      if (!bookings.length || !user) return;

      const bookingsToUpdate = bookings.filter(
        (booking) =>
          booking.status === "confirmed" &&
          booking.check_out &&
          isAfterCheckOut(booking.check_out) &&
          parseInt(booking.user_id) === parseInt(user.id) // Đảm bảo booking thuộc về user hiện tại
      );

      if (bookingsToUpdate.length > 0) {
        // Cập nhật từng booking
        let hasUpdates = false;
        for (const booking of bookingsToUpdate) {
          try {
            await dispatch(
              updateBookingStatus({
                bookingId: booking.id,
                status: "completed",
              })
            ).unwrap();
            hasUpdates = true;
          } catch (error) {
            // Chỉ log lỗi nếu không phải lỗi đã hoàn thành hoặc permission
            const errorMessage = error?.message || error?.toString() || "";
            if (
              !errorMessage.includes("đã hoàn thành") &&
              !errorMessage.includes("đã bị hủy") &&
              !errorMessage.includes("chỉ có thể hủy")
            ) {
              console.error(
                `Error auto-updating booking ${booking.id}:`,
                error
              );
            }
          }
        }
        // Chỉ refresh nếu có ít nhất một booking được cập nhật thành công
        if (hasUpdates) {
          dispatch(fetchBookings());
        }
      }
    };

    autoUpdateBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings.length, user]);

  // Tự động cập nhật status thành cancelled nếu quá check-out và vẫn pending (chưa được xác nhận)
  useEffect(() => {
    const autoCancelPendingBookings = async () => {
      if (!bookings.length || !user) return;

      const bookingsToCancel = bookings.filter(
        (booking) =>
          booking.status === "pending" &&
          booking.check_out &&
          isAfterCheckOut(booking.check_out) &&
          parseInt(booking.user_id) === parseInt(user.id) // Đảm bảo booking thuộc về user hiện tại
      );

      if (bookingsToCancel.length > 0) {
        // Cập nhật từng booking
        let hasUpdates = false;
        for (const booking of bookingsToCancel) {
          try {
            await dispatch(
              updateBookingStatus({
                bookingId: booking.id,
                status: "cancelled",
                cancellation_reason: "Phòng đã bị hủy do chưa được xác nhận",
              })
            ).unwrap();
            hasUpdates = true;
          } catch (error) {
            // Chỉ log lỗi nếu không phải lỗi đã hủy hoặc permission
            const errorMessage = error?.message || error?.toString() || "";
            if (
              !errorMessage.includes("đã bị hủy") &&
              !errorMessage.includes("đã hoàn thành") &&
              !errorMessage.includes("chỉ có thể hủy")
            ) {
              console.error(
                `Error auto-cancelling booking ${booking.id}:`,
                error
              );
            }
          }
        }
        // Chỉ refresh nếu có ít nhất một booking được cập nhật thành công
        if (hasUpdates) {
          dispatch(fetchBookings());
        }
      }
    };

    autoCancelPendingBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings.length, user]);

  // Format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Kiểm tra xem đã tới check-in chưa
  const isAfterCheckIn = (checkInDate) => {
    if (!checkInDate) return false;
    const checkIn = new Date(checkInDate);
    const now = new Date();
    checkIn.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return now >= checkIn;
  };

  // Kiểm tra xem đã QUÁ check-out chưa (12:00 PM ngày checkout)
  const isAfterCheckOut = (checkOutDate) => {
    if (!checkOutDate) return false;
    try {
      // Lấy thời gian hiện tại
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Parse ngày check-out
      let checkOut;
      if (typeof checkOutDate === 'string') {
        // Xử lý string: có thể là "YYYY-MM-DD" hoặc "YYYY-MM-DD HH:mm:ss" hoặc ISO format
        const dateStr = checkOutDate.split(' ')[0].split('T')[0];
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          checkOut = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        } else {
          checkOut = new Date(checkOutDate);
        }
      } else if (checkOutDate instanceof Date) {
        checkOut = new Date(checkOutDate);
      } else {
        checkOut = new Date(checkOutDate);
      }
      
      // Lấy ngày check-out (không tính giờ)
      const checkOutDateOnly = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
      
      // Tạo thời điểm 12:00 PM ngày checkout
      const checkOutAt12PM = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate(), 12, 0, 0);
      
      // Kiểm tra nếu parse không thành công
      if (isNaN(checkOutDateOnly.getTime())) {
        console.error("Invalid check-out date:", checkOutDate);
        return false;
      }
      
      // Logic: đã quá checkout nếu:
      // 1. Ngày checkout < hôm nay HOẶC
      // 2. Ngày checkout = hôm nay VÀ giờ hiện tại >= 12:00 PM
      if (checkOutDateOnly < today) {
        return true; // Đã qua ngày checkout
      }
      
      if (checkOutDateOnly.getTime() === today.getTime()) {
        return now >= checkOutAt12PM; // Cùng ngày, kiểm tra giờ >= 12:00 PM
      }
      
      return false; // Chưa tới ngày checkout
    } catch (error) {
      console.error("Error checking check-out date:", error, checkOutDate);
      return false;
    }
  };

  // Format payment method
  const getPaymentMethodDisplay = (paymentMethod) => {
    if (!paymentMethod) {
      return {
        text: "Chưa thanh toán",
        icon: "fas fa-question-circle",
        color: "text-gray-500",
        bgColor: "bg-gray-100",
      };
    }

    const paymentMap = {
      momo: {
        text: "MoMo",
        icon: "fas fa-mobile-alt",
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      },
      vnpay: {
        text: "VNPay",
        icon: "fas fa-wallet",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      bank_transfer: {
        text: "Chuyển khoản",
        icon: "fas fa-university",
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      cod: {
        text: "Thanh toán tại khách sạn",
        icon: "fas fa-money-bill-wave",
        color: "text-amber-600",
        bgColor: "bg-amber-50",
      },
      credit_card: {
        text: "Thẻ tín dụng",
        icon: "fas fa-credit-card",
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
      },
    };

    return paymentMap[paymentMethod] || {
      text: paymentMethod,
      icon: "fas fa-credit-card",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    };
  };

  // Format status
  const getStatusBadge = (status, checkOut) => {
    // Kiểm tra nếu đã qua check-out
    if (checkOut) {
      const isAfter = isAfterCheckOut(checkOut);
      
      // Debug log để kiểm tra - BẬT LOG ĐỂ DEBUG
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const checkOutStr = typeof checkOut === 'string' 
        ? checkOut.split(' ')[0].split('T')[0] 
        : `${new Date(checkOut).getFullYear()}-${String(new Date(checkOut).getMonth() + 1).padStart(2, '0')}-${String(new Date(checkOut).getDate()).padStart(2, '0')}`;
      
      console.log("🔍 Status badge check:", { 
        status, 
        checkOut: checkOut,
        checkOutStr: checkOutStr,
        todayStr: todayStr,
        isAfter: isAfter,
        comparison: `${todayStr} >= ${checkOutStr} = ${todayStr >= checkOutStr}`
      });
      
      if (isAfter) {
        console.log("✅ Đã quá check-out! Status:", status);
        // Nếu quá check-out mà vẫn pending (chưa được xác nhận)
        if (status === "pending") {
          console.log("🚨 Hiển thị: Phòng đã bị hủy do chưa được xác nhận");
          return (
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
              Phòng đã bị hủy do chưa được xác nhận
            </span>
          );
        }
        // Nếu quá check-out và đã confirmed, sẽ tự động cập nhật thành completed
        // Nhưng nếu vẫn hiển thị confirmed (chưa kịp cập nhật), hiển thị completed
        if (status === "confirmed") {
          return (
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
              Hoàn thành
            </span>
          );
        }
      } else {
        console.log("⏰ Chưa quá check-out hoặc logic so sánh sai");
      }
    } else {
      console.log("⚠️ Không có checkOut date");
    }

    const statusMap = {
      pending: { text: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800" },
      confirmed: { text: "Đã xác nhận", color: "bg-green-100 text-green-800" },
      cancelled: { text: "Đã hủy", color: "bg-red-100 text-red-800" },
      completed: { text: "Hoàn thành", color: "bg-blue-100 text-blue-800" },
    };
    const statusInfo = statusMap[status] || {
      text: status,
      color: "bg-gray-100 text-gray-800",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}
      >
        {statusInfo.text}
      </span>
    );
  };

  // Handle cancel booking
  const handleCancelBooking = (booking) => {
    setCancelDialog({
      isOpen: true,
      booking: booking,
    });
  };

  const handleConfirmCancel = async (cancellationReason) => {
    if (!cancelDialog.booking) return;

    try {
      const result = await dispatch(
        updateBookingStatus({
          bookingId: cancelDialog.booking.id,
          status: "cancelled",
          cancellation_reason: cancellationReason,
        })
      );

      if (updateBookingStatus.fulfilled.match(result)) {
        toast.success("Hủy đặt phòng thành công!");
        dispatch(fetchBookings()); // Refresh danh sách
        setCancelDialog({ isOpen: false, booking: null });
      } else {
        // Hiển thị lỗi chi tiết hơn
        const errorMessage = result.payload || result.error?.message || "Không thể hủy đặt phòng";
        console.error("Cancel booking error details:", {
          payload: result.payload,
          error: result.error,
          type: result.type,
          meta: result.meta
        });
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Cancel booking exception:", error);
      toast.error(error.message || "Có lỗi xảy ra khi hủy đặt phòng");
    }
  };

  // Handle rating dialog
  const handleOpenRatingDialog = (booking, room) => {
    const reviewKey = booking.hotel_id 
      ? `${booking.id}_${booking.hotel_id}` 
      : `${booking.id}_${room.room_id}`;
    const existingReview = reviews[reviewKey] || null;
    
    setRatingDialog({
      isOpen: true,
      booking: booking,
      room: room,
      existingReview: existingReview,
    });
  };

  const handleSubmitReview = async ({ rating, comment }) => {
    if (!ratingDialog.booking || !ratingDialog.room) return;

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          booking_id: ratingDialog.booking.id,
          room_id: ratingDialog.room.room_id,
          rating: rating,
          comment: comment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Có lỗi xảy ra khi gửi đánh giá");
        return;
      }

      toast.success(
        ratingDialog.existingReview
          ? "Cập nhật đánh giá thành công!"
          : "Gửi đánh giá thành công!"
      );
      
      // Refresh reviews và bookings
      await fetchReviews();
      dispatch(fetchBookings());
      
      setRatingDialog({
        isOpen: false,
        booking: null,
        room: null,
        existingReview: null,
      });
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Có lỗi xảy ra khi gửi đánh giá");
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Loading 
        message="Đang tải danh sách đặt phòng..." 
        fullScreen={true}
        color="amber"
        className="bg-[#f9f9f9]"
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#5a4330] mb-2">
            Đặt phòng của tôi
          </h1>
          <p className="text-gray-600">
            Quản lý và xem chi tiết các đặt phòng của bạn
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && bookings.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Chưa có đặt phòng nào
            </h2>
            <p className="text-gray-500 mb-6">
              Bạn chưa có đặt phòng nào. Hãy khám phá và đặt phòng ngay!
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-amber-700 hover:bg-amber-800 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Khám phá khách sạn
            </button>
          </div>
        )}

        {bookings.length > 0 && (
          <div className="space-y-6">
            {bookings.map((booking) => {
              // Lấy phòng đầu tiên để hiển thị (có thể có nhiều phòng)
              const firstRoom = booking.rooms && booking.rooms.length > 0 
                ? booking.rooms[0] 
                : null;
              
              const roomName = firstRoom?.room_name || "N/A";
              const roomId = firstRoom?.room_id || null;

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Thông tin */}
                  <div className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl sm:text-2xl font-semibold text-[#5a4330]">
                              {booking.rooms?.length > 1 
                                ? `${booking.rooms.length} phòng` 
                                : roomName}
                            </h3>
                            {getStatusBadge(booking.status, booking.check_out)}
                          </div>
                          {booking.hotel_name && (
                            <p className="text-sm sm:text-base text-gray-600 mb-1">
                              📍 {booking.hotel_name}
                            </p>
                          )}
                          {booking.hotel_address && (
                            <p className="text-xs sm:text-sm text-gray-500">
                              {booking.hotel_address}
                            </p>
                          )}
                          {booking.rooms && booking.rooms.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs sm:text-sm text-gray-600">
                                Phòng: {booking.rooms.map(r => r.room_name).join(", ")}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Check-in</p>
                          <p className="font-semibold text-gray-800">
                            {formatDate(booking.check_in)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Check-out</p>
                          <p className="font-semibold text-gray-800">
                            {formatDate(booking.check_out)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Số đêm</p>
                          <p className="font-semibold text-gray-800">
                            {Math.ceil(
                              (new Date(booking.check_out) -
                                new Date(booking.check_in)) /
                                (1000 * 60 * 60 * 24)
                            )}{" "}
                            đêm
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Tổng tiền</p>
                          <p className="font-semibold text-amber-700 text-lg">
                            {Number(booking.total_price).toLocaleString("vi-VN")}{" "}
                            VNĐ
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Phương thức thanh toán</p>
                          {(() => {
                            const paymentInfo = getPaymentMethodDisplay(booking.payment_method);
                            return (
                              <div className={`inline-flex items-center px-2 py-1 rounded-lg text-xs sm:text-sm font-medium ${paymentInfo.bgColor} ${paymentInfo.color}`}>
                                <i className={`${paymentInfo.icon} mr-1.5`}></i>
                                <span>{paymentInfo.text}</span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t">
                        <p className="text-xs sm:text-sm text-gray-500">
                          Đặt ngày: {formatDate(booking.created_at)}
                        </p>
                        <div className="flex items-center flex-wrap gap-2">
                          {booking.status !== "cancelled" && 
                           booking.status !== "completed" && 
                           !isAfterCheckIn(booking.check_in) && 
                           !isAfterCheckOut(booking.check_out) && (
                            <button
                              onClick={() => handleCancelBooking(booking)}
                              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
                            >
                              <i className="fas fa-times-circle"></i>
                              <span>Hủy đặt phòng</span>
                            </button>
                          )}
                          {booking.status === "completed" && (
                            <>
                              {booking.hotel_id && reviews[`${booking.id}_${booking.hotel_id}`] ? (
                                <div className="px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-800 flex items-center space-x-2">
                                  <i className="fas fa-check-circle"></i>
                                  <span>Đã đánh giá</span>
                                  <span className="ml-1">
                                    ({reviews[`${booking.id}_${booking.hotel_id}`].rating}⭐)
                                  </span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    // Lấy phòng đầu tiên để hiển thị thông tin
                                    const firstRoom = booking.rooms && booking.rooms.length > 0 
                                      ? booking.rooms[0] 
                                      : null;
                                    if (firstRoom) {
                                      handleOpenRatingDialog(booking, firstRoom);
                                    } else {
                                      toast.error("Không tìm thấy thông tin phòng");
                                    }
                                  }}
                                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
                                >
                                  <i className="fas fa-star"></i>
                                  <span>Đánh giá</span>
                                </button>
                              )}
                            </>
                          )}
                          {roomId && (
                            <button
                              onClick={() =>
                                router.push(`/rooms/${roomId}`)
                              }
                              className="text-amber-700 hover:text-amber-800 font-semibold text-sm"
                            >
                              Xem chi tiết phòng →
                            </button>
                          )}
                        </div>
                      </div>
                      {booking.status === "cancelled" && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg space-y-2">
                          {booking.cancellation_type && (
                            <p className="text-sm text-red-800">
                              <span className="font-semibold">Người hủy:</span>{" "}
                              {booking.cancellation_type === "admin"
                                ? "Admin hủy"
                                : booking.cancellation_type === "user"
                                ? "Bạn đã hủy"
                                : booking.cancellation_type === "system"
                                ? "Hệ thống tự động hủy (quá hạn)"
                                : "Không xác định"}
                            </p>
                          )}
                          {booking.cancellation_reason && (
                            <p className="text-sm text-red-800">
                              <span className="font-semibold">Lý do hủy:</span> {booking.cancellation_reason}
                            </p>
                          )}
                        </div>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Cancel Booking Dialog */}
        <CancelBookingDialog
          isOpen={cancelDialog.isOpen}
          onClose={() => setCancelDialog({ isOpen: false, booking: null })}
          onConfirm={handleConfirmCancel}
          bookingInfo={
            cancelDialog.booking
              ? {
                  roomName:
                    cancelDialog.booking.rooms?.length > 0
                      ? cancelDialog.booking.rooms[0].room_name
                      : "N/A",
                  checkIn: formatDate(cancelDialog.booking.check_in),
                  checkOut: formatDate(cancelDialog.booking.check_out),
                }
              : null
          }
        />

        {/* Rating Dialog */}
        <RatingDialog
          isOpen={ratingDialog.isOpen}
          onClose={() =>
            setRatingDialog({
              isOpen: false,
              booking: null,
              room: null,
              existingReview: null,
            })
          }
          onConfirm={handleSubmitReview}
          bookingInfo={
            ratingDialog.booking && ratingDialog.room
              ? {
                  roomName: ratingDialog.room.room_name || "N/A",
                  hotelName: ratingDialog.booking.hotel_name,
                  checkIn: formatDate(ratingDialog.booking.check_in),
                  checkOut: formatDate(ratingDialog.booking.check_out),
                }
              : null
          }
          existingReview={ratingDialog.existingReview}
        />
      </div>
    </div>
  );
};

export default MyBookingsPage;

