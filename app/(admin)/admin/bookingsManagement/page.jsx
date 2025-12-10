"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  fetchBookings,
  updateBookingStatus,
} from "../../../store/features/bookingsSlide";
import ConfirmDialog from "../../../../components/common/ConfirmDialog";
import Loading from "@/components/common/Loading";
import ActionDropdown from "@/components/common/ActionDropdown";

const BookingsPage = () => {
  const dispatch = useDispatch();
  const { list: bookings, loading, error } = useSelector(
    (state) => state.bookings
  );
  const [updatingId, setUpdatingId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "info",
  });
  const [cancellationReasonDialog, setCancellationReasonDialog] = useState({
    isOpen: false,
    booking: null,
  });
  const [adminCancelDialog, setAdminCancelDialog] = useState({
    isOpen: false,
    booking: null,
    reason: "",
    error: "",
  });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" or "oldest"

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  // Tự động cập nhật status thành cancelled nếu quá check-out và vẫn pending (chưa được xác nhận)
  useEffect(() => {
    const autoCancelPendingBookings = async () => {
      if (!bookings.length) return;

      const bookingsToCancel = bookings.filter(
        (booking) =>
          booking.status === "pending" &&
          booking.check_out &&
          isAfterCheckOut(booking.check_out)
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
                cancellation_type: "system",
              })
            ).unwrap();
            hasUpdates = true;
          } catch (error) {
            // Chỉ log lỗi nếu không phải lỗi đã hủy
            const errorMessage = error?.message || error?.toString() || "";
            if (
              !errorMessage.includes("đã bị hủy") &&
              !errorMessage.includes("đã hoàn thành")
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
  }, [bookings.length]);

  // Tự động cập nhật status thành completed nếu quá check-out và đã confirmed
  useEffect(() => {
    const autoUpdateBookings = async () => {
      if (!bookings.length) return;

      const bookingsToUpdate = bookings.filter(
        (booking) =>
          booking.status === "confirmed" &&
          booking.check_out &&
          isAfterCheckOut(booking.check_out)
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
            // Chỉ log lỗi nếu không phải lỗi đã hoàn thành
            const errorMessage = error?.message || error?.toString() || "";
            if (
              !errorMessage.includes("đã hoàn thành") &&
              !errorMessage.includes("đã bị hủy")
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
  }, [bookings.length]);

  // Kiểm tra xem đã qua check-in chưa
  const isAfterCheckIn = (checkInDate) => {
    if (!checkInDate) return false;
    const checkIn = new Date(checkInDate);
    const now = new Date();
    checkIn.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return now >= checkIn;
  };

  // Kiểm tra xem đã QUÁ check-out chưa (phải là ngày sau check-out, không tính ngày check-out)
  const isAfterCheckOut = (checkOutDate) => {
    if (!checkOutDate) return false;
    try {
      const checkOut = new Date(checkOutDate);
      const now = new Date();
      
      // Reset về 00:00:00 để so sánh chỉ theo ngày
      checkOut.setHours(0, 0, 0, 0);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Kiểm tra nếu parse không thành công
      if (isNaN(checkOut.getTime())) {
        console.error("Invalid check-out date:", checkOutDate);
        return false;
      }
      
      // So sánh: chỉ trả về true nếu hôm nay > ngày check-out (đã QUÁ check-out)
      // Nếu hôm nay = ngày check-out thì vẫn chưa quá
      return today > checkOut;
    } catch (error) {
      console.error("Error checking check-out date:", error, checkOutDate);
      return false;
    }
  };

  // Filter and sort bookings
  const filteredBookings = bookings
    .filter((booking) => {
      // Kiểm tra nếu booking pending nhưng đã quá thời gian check-out
      const isPendingAfterCheckOut = booking.status === "pending" && isAfterCheckOut(booking.check_out);
      
      // Filter by status
      if (statusFilter !== "all") {
        if (statusFilter === "cancelled") {
          // Khi lọc "cancelled", bao gồm cả những booking pending đã quá thời gian
          if (booking.status !== "cancelled" && !isPendingAfterCheckOut) {
            return false;
          }
        } else if (statusFilter === "pending") {
          // Khi lọc "pending", loại trừ những booking đã quá thời gian check-out
          if (booking.status !== "pending" || isPendingAfterCheckOut) {
            return false;
          }
        } else {
          // Các trạng thái khác, lọc bình thường
          if (booking.status !== statusFilter) {
            return false;
          }
        }
      }
      
      // Filter by search term (name or email)
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        const userName = (booking.user_name || "").toLowerCase();
        const userEmail = (booking.user_email || booking.email || "").toLowerCase();
        if (!userName.includes(searchLower) && !userEmail.includes(searchLower)) {
          return false;
        }
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by created_at if available, otherwise by id
      const dateA = a.created_at ? new Date(a.created_at) : new Date(a.id);
      const dateB = b.created_at ? new Date(b.created_at) : new Date(b.id);
      
      if (sortOrder === "newest") {
        return dateB - dateA; // Newest first
      } else {
        return dateA - dateB; // Oldest first
      }
    });

  // Format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

  // Format status badge
  const getStatusBadge = (status, checkOut, cancellationType) => {
    // Kiểm tra nếu đã qua check-out
    if (checkOut) {
      const isAfter = isAfterCheckOut(checkOut);
      
      if (isAfter) {
        // Nếu quá check-out mà vẫn pending (chưa được xác nhận)
        if (status === "pending") {
          return (
            <span className="px-3 py-1 rounded-full text-sm font-semibold border bg-red-100 text-red-800 border-red-300">
              Phòng đã bị hủy do chưa được xác nhận
            </span>
          );
        }
        // Nếu quá check-out và đã confirmed, sẽ tự động cập nhật thành completed
        // Nhưng nếu vẫn hiển thị confirmed (chưa kịp cập nhật), hiển thị completed
        if (status === "confirmed") {
          return (
            <span className="px-3 py-1 rounded-full text-sm font-semibold border bg-blue-100 text-blue-800 border-blue-300">
              Hoàn thành
            </span>
          );
        }
      }
    }

    const statusMap = {
      pending: {
        text: "Chờ xác nhận",
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      },
      confirmed: {
        text: "Đã xác nhận",
        color: "bg-green-100 text-green-800 border-green-300",
      },
      cancelled: {
        text: cancellationType === "admin" 
          ? "Đã hủy (Admin)" 
          : cancellationType === "user"
          ? "Đã hủy (Người dùng)"
          : cancellationType === "system"
          ? "Đã hủy (Hệ thống)"
          : "Đã hủy",
        color: "bg-red-100 text-red-800 border-red-300",
      },
      completed: {
        text: "Hoàn thành",
        color: "bg-blue-100 text-blue-800 border-blue-300",
      },
    };
    const statusInfo = statusMap[status] || {
      text: status,
      color: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusInfo.color}`}
      >
        {statusInfo.text}
      </span>
    );
  };

  const handleCancelBooking = (booking) => {
    // Kiểm tra xem đã qua check-in chưa
    if (isAfterCheckIn(booking.check_in)) {
      toast.error("Không thể hủy đặt phòng sau thời gian check-in!");
      return;
    }

    // Admin phải nhập lý do hủy
    setAdminCancelDialog({
      isOpen: true,
      booking: booking,
      reason: "",
      error: "",
    });
  };

  const handleAdminCancelConfirm = async () => {
    const { booking, reason } = adminCancelDialog;
    
    if (!reason.trim()) {
      setAdminCancelDialog({
        ...adminCancelDialog,
        error: "Vui lòng nhập lý do hủy đặt phòng",
      });
      return;
    }
    
    if (reason.trim().length < 10) {
      setAdminCancelDialog({
        ...adminCancelDialog,
        error: "Lý do hủy phải có ít nhất 10 ký tự",
      });
      return;
    }

    setUpdatingId(booking.id);
    try {
      await dispatch(
        updateBookingStatus({ 
          bookingId: booking.id, 
          status: "cancelled",
          cancellation_reason: reason.trim(),
          cancellation_type: "admin"
        })
      ).unwrap();
      // Refresh danh sách booking để cập nhật UI ngay lập tức
      await dispatch(fetchBookings());
      toast.success("Hủy đặt phòng thành công!");
      setAdminCancelDialog({
        isOpen: false,
        booking: null,
        reason: "",
        error: "",
      });
    } catch (err) {
      toast.error(err || "Có lỗi xảy ra khi hủy đặt phòng");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCompleteBooking = (booking) => {
    const isEarlyCheckout = !isAfterCheckOut(booking.check_out);
    
    if (isEarlyCheckout) {
      // Chưa tới thời gian check-out, hiển thị cảnh báo
      setConfirmDialog({
        isOpen: true,
        title: "Xác nhận trả phòng sớm",
        message: `Chưa tới thời gian check-out (${formatDate(booking.check_out)}). Bạn có chắc chắn muốn đánh dấu booking #${booking.id} là đã trả phòng?`,
        confirmText: "Xác nhận",
        type: "warning",
        onConfirm: async () => {
          setUpdatingId(booking.id);
          try {
            await dispatch(
              updateBookingStatus({ bookingId: booking.id, status: "completed" })
            ).unwrap();
            // Refresh danh sách booking để cập nhật UI ngay lập tức
            await dispatch(fetchBookings());
            toast.success("Đánh dấu đã trả phòng thành công!");
          } catch (err) {
            toast.error(err || "Có lỗi xảy ra khi cập nhật trạng thái");
          } finally {
            setUpdatingId(null);
          }
        },
      });
    } else {
      // Đã tới thời gian check-out, cho phép hoàn thành bình thường
      setConfirmDialog({
        isOpen: true,
        title: "Hoàn thành đặt phòng",
        message: `Bạn có chắc chắn muốn đánh dấu booking #${booking.id} là đã trả phòng?`,
        confirmText: "Xác nhận",
        type: "info",
        onConfirm: async () => {
          setUpdatingId(booking.id);
          try {
            await dispatch(
              updateBookingStatus({ bookingId: booking.id, status: "completed" })
            ).unwrap();
            // Refresh danh sách booking để cập nhật UI ngay lập tức
            await dispatch(fetchBookings());
            toast.success("Đánh dấu đã trả phòng thành công!");
          } catch (err) {
            toast.error(err || "Có lỗi xảy ra khi cập nhật trạng thái");
          } finally {
            setUpdatingId(null);
          }
        },
      });
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus, closeModal = false) => {
    // Nếu admin hủy booking, phải hiển thị dialog nhập lý do
    if (newStatus === "cancelled") {
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        handleCancelBooking(booking);
      }
      return;
    }

    const statusText = 
      newStatus === "confirmed"
        ? "xác nhận"
        : "hoàn thành";
    
    const statusTitle = 
      newStatus === "confirmed"
        ? "Xác nhận đặt phòng"
        : "Hoàn thành đặt phòng";

    setConfirmDialog({
      isOpen: true,
      title: statusTitle,
      message: `Bạn có chắc chắn muốn ${statusText} booking #${bookingId}?`,
      confirmText: statusText.charAt(0).toUpperCase() + statusText.slice(1),
      type: "info",
      onConfirm: async () => {
        setUpdatingId(bookingId);
        try {
          await dispatch(
            updateBookingStatus({ bookingId, status: newStatus })
          ).unwrap();
          // Refresh danh sách booking để cập nhật UI ngay lập tức
          await dispatch(fetchBookings());
          // Cập nhật selectedBooking nếu đang mở modal
          if (selectedBooking && selectedBooking.id === bookingId) {
            setSelectedBooking({
              ...selectedBooking,
              status: newStatus,
            });
            // Đóng modal nếu được yêu cầu
            if (closeModal) {
              setIsDetailModalOpen(false);
            }
          }
          toast.success("Cập nhật trạng thái đặt phòng thành công!");
        } catch (err) {
          toast.error(err || "Có lỗi xảy ra khi cập nhật trạng thái");
        } finally {
          setUpdatingId(null);
        }
      },
    });
  };

  const openDetailModal = (booking) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Quản lý đặt phòng
        </h1>
        <p className="text-gray-600 text-lg">
          Xem và quản lý tất cả các đặt phòng của khách hàng
        </p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search by name or email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm (tên/email):
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập tên hoặc email khách hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            {/* Filter by status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo trạng thái:
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
              >
                <option value="all">Tất cả</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="cancelled">Đã hủy</option>
                <option value="completed">Hoàn thành</option>
              </select>
            </div>

            {/* Sort order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sắp xếp:
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading && bookings.length === 0 && (
        <Loading 
          message="Đang tải danh sách booking..." 
          color="indigo"
          className="py-12"
        />
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 text-base">{error}</p>
        </div>
      )}

      {!loading && bookings.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-3xl font-semibold text-gray-700 mb-2">
            Chưa có booking nào
          </h2>
          <p className="text-gray-500 text-lg">Hiện tại chưa có đặt phòng nào trong hệ thống.</p>
        </div>
      )}

      {!loading && bookings.length > 0 && filteredBookings.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-3xl font-semibold text-gray-700 mb-2">
            Không tìm thấy booking
          </h2>
          <p className="text-gray-500 text-lg">
            {searchTerm || statusFilter !== "all"
              ? "Không có đặt phòng nào phù hợp với bộ lọc đã chọn."
              : "Không có đặt phòng nào với trạng thái đã chọn."}
          </p>
        </div>
      )}

      {filteredBookings.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Phòng
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-base font-medium text-gray-900">
                        #{booking.id}
                      </div>
                      <div className="text-base text-gray-500">
                        {formatDate(booking.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-base text-gray-900">
                        {booking.user_name || `User #${booking.user_id}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.user_email || booking.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-base text-gray-900">
                        {booking.rooms && booking.rooms.length > 0
                          ? booking.rooms.map((r) => r.room_name).join(", ")
                          : "N/A"}
                      </div>
                      {booking.hotel_name && (
                        <div className="text-sm text-gray-500">
                          {booking.hotel_name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base font-semibold text-gray-900">
                      {Number(booking.total_price).toLocaleString("vi-VN")} VNĐ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.status, booking.check_out, booking.cancellation_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {(() => {
                        const actions = [];
                        
                        // Thêm nút xem chi tiết
                        actions.push({
                          label: "Xem chi tiết",
                          icon: "fas fa-eye",
                          onClick: () => openDetailModal(booking),
                        });
                        
                        // Kiểm tra nếu quá thời gian check-out và status là pending
                        const isPendingAfterCheckOut = booking.status === "pending" && isAfterCheckOut(booking.check_out);
                        
                        if (isPendingAfterCheckOut) {
                          return <ActionDropdown actions={actions} />;
                        }
                        
                        actions.push({ divider: true });
                        
                        if (booking.status === "pending") {
                          actions.push(
                            {
                              label: "Xác nhận",
                              icon: updatingId === booking.id ? "fas fa-spinner fa-spin" : "fas fa-check-circle",
                              onClick: () => handleUpdateStatus(booking.id, "confirmed"),
                              disabled: updatingId === booking.id,
                              success: true,
                            },
                            {
                              label: "Hủy",
                              icon: updatingId === booking.id ? "fas fa-spinner fa-spin" : "fas fa-times-circle",
                              onClick: () => handleUpdateStatus(booking.id, "cancelled"),
                              disabled: updatingId === booking.id,
                              danger: true,
                            }
                          );
                        } else if (booking.status === "confirmed") {
                          const canCancel = !isAfterCheckIn(booking.check_in);
                          actions.push(
                            {
                              label: "Hủy",
                              icon: updatingId === booking.id ? "fas fa-spinner fa-spin" : "fas fa-times-circle",
                              onClick: () => handleCancelBooking(booking),
                              disabled: updatingId === booking.id || !canCancel,
                              danger: true,
                              title: !canCancel ? "Không thể hủy sau thời gian check-in" : "Hủy đặt phòng",
                            },
                            {
                              label: "Đã trả phòng",
                              icon: updatingId === booking.id ? "fas fa-spinner fa-spin" : "fas fa-key",
                              onClick: () => handleCompleteBooking(booking),
                              disabled: updatingId === booking.id,
                              title: "Đánh dấu đã trả phòng",
                            }
                          );
                        } else if (booking.status === "cancelled") {
                          actions.push({
                            label: "Xem lý do hủy",
                            icon: "fas fa-info-circle",
                            onClick: () => setCancellationReasonDialog({
                              isOpen: true,
                              booking: booking,
                            }),
                            title: booking.cancellation_reason ? "Xem lý do hủy" : "Xem thông tin booking",
                          });
                        } else if (booking.status === "pending" && isAfterCheckOut(booking.check_out)) {
                          // Booking đã quá hạn nhưng chưa được cập nhật
                          actions.push({
                            label: "Xem chi tiết",
                            icon: "fas fa-eye",
                            onClick: () => openDetailModal(booking),
                          });
                        }
                        
                        return <ActionDropdown actions={actions} />;
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm || (() => {})}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        type={confirmDialog.type}
      />

      {/* Admin Cancel Dialog */}
      {adminCancelDialog.isOpen && adminCancelDialog.booking && (
        <div
          className="fixed inset-0 backdrop-blur-sm bg-opacity-50 z-50 flex items-center justify-center animate-fadeIn"
          onClick={() =>
            setAdminCancelDialog({ isOpen: false, booking: null, reason: "", error: "" })
          }
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-100">
                    <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Hủy đặt phòng
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Booking #{adminCancelDialog.booking.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setAdminCancelDialog({ isOpen: false, booking: null, reason: "", error: "" })
                  }
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">Khách hàng:</span>{" "}
                  {adminCancelDialog.booking.user_name ||
                    `User #${adminCancelDialog.booking.user_id}`}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">Phòng:</span>{" "}
                  {adminCancelDialog.booking.rooms &&
                  adminCancelDialog.booking.rooms.length > 0
                    ? adminCancelDialog.booking.rooms
                        .map((r) => r.room_name)
                        .join(", ")
                    : "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Ngày:</span>{" "}
                  {formatDate(adminCancelDialog.booking.check_in)} -{" "}
                  {formatDate(adminCancelDialog.booking.check_out)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do hủy <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={adminCancelDialog.reason}
                  onChange={(e) =>
                    setAdminCancelDialog({
                      ...adminCancelDialog,
                      reason: e.target.value,
                      error: "",
                    })
                  }
                  placeholder="Ví dụ: Khách hàng không thanh toán, phòng không còn trống, khách hàng yêu cầu hủy..."
                  className={`w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 ${
                    adminCancelDialog.error
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300 focus:ring-red-500"
                  }`}
                  rows="4"
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-1">
                  {adminCancelDialog.error && (
                    <p className="text-sm text-red-600">{adminCancelDialog.error}</p>
                  )}
                  <p className="text-xs text-gray-500 ml-auto">
                    {adminCancelDialog.reason.length}/500 ký tự
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
                onClick={() =>
                  setAdminCancelDialog({ isOpen: false, booking: null, reason: "", error: "" })
                }
                className="px-5 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
              >
                <i className="fas fa-times"></i>
                <span>Đóng</span>
              </button>
              <button
                onClick={handleAdminCancelConfirm}
                disabled={
                  !adminCancelDialog.reason.trim() ||
                  adminCancelDialog.reason.trim().length < 10 ||
                  updatingId === adminCancelDialog.booking.id
                }
                className="px-5 py-2.5 rounded-lg text-white font-medium transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
              >
                {updatingId === adminCancelDialog.booking.id ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash-alt"></i>
                    <span>Xác nhận hủy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Reason Dialog */}
      {cancellationReasonDialog.isOpen && cancellationReasonDialog.booking && (
        <div
          className="fixed inset-0 backdrop-blur-sm  bg-opacity-50 z-50 flex items-center justify-center animate-fadeIn"
          onClick={() =>
            setCancellationReasonDialog({ isOpen: false, booking: null })
          }
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-100">
                    <i className="fas fa-info-circle text-red-500 text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Thông tin hủy đặt phòng
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Booking #{cancellationReasonDialog.booking.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setCancellationReasonDialog({ isOpen: false, booking: null })
                  }
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">Khách hàng:</span>{" "}
                  {cancellationReasonDialog.booking.user_name ||
                    `User #${cancellationReasonDialog.booking.user_id}`}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">Phòng:</span>{" "}
                  {cancellationReasonDialog.booking.rooms &&
                  cancellationReasonDialog.booking.rooms.length > 0
                    ? cancellationReasonDialog.booking.rooms
                        .map((r) => r.room_name)
                        .join(", ")
                    : "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Ngày:</span>{" "}
                  {formatDate(cancellationReasonDialog.booking.check_in)} -{" "}
                  {formatDate(cancellationReasonDialog.booking.check_out)}
                </p>
              </div>

              {cancellationReasonDialog.booking.cancellation_type && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Người hủyhủy:
                  </label>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-base font-medium text-gray-800">
                      {cancellationReasonDialog.booking.cancellation_type === "admin"
                        ? "Admin hủy"
                        : cancellationReasonDialog.booking.cancellation_type === "user"
                        ? "Người dùng hủy"
                        : cancellationReasonDialog.booking.cancellation_type === "system"
                        ? "Hệ thống tự động hủy (quá hạn)"
                        : "Không xác định"}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do hủy:
                </label>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {cancellationReasonDialog.booking.cancellation_reason ||
                      "Không có lý do được cung cấp"}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() =>
                  setCancellationReasonDialog({ isOpen: false, booking: null })
                }
                className="px-5 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
              >
                <i className="fas fa-times"></i>
                <span>Đóng</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedBooking && (
        <div 
          className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn p-4"
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-700 to-indigo-800 text-white p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">Booking #{selectedBooking.id}</h2>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center">
                      <i className="fas fa-user mr-2"></i>
                      {selectedBooking.user_name || `User #${selectedBooking.user_id}`}
                    </span>
                    {selectedBooking.user_email && (
                      <span className="flex items-center">
                        <i className="fas fa-envelope mr-2"></i>
                        {selectedBooking.user_email || selectedBooking.email}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="ml-4 p-2 hover:bg-indigo-600 rounded-lg transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <div className="mt-4">
                {getStatusBadge(selectedBooking.status, selectedBooking.check_out, selectedBooking.cancellation_type)}
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Booking Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  <i className="fas fa-calendar-alt mr-2 text-indigo-700"></i>
                  Thông tin đặt phòng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">ID Booking</p>
                    <p className="font-medium text-gray-900">#{selectedBooking.id}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Tổng tiền</p>
                    <p className="font-medium text-gray-900 text-lg">
                      {Number(selectedBooking.total_price).toLocaleString("vi-VN")} VNĐ
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Check-in</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedBooking.check_in)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Check-out</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedBooking.check_out)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Phương thức thanh toán</p>
                    {(() => {
                      const paymentInfo = getPaymentMethodDisplay(selectedBooking.payment_method);
                      return (
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${paymentInfo.bgColor} ${paymentInfo.color}`}>
                          <i className={`${paymentInfo.icon} mr-2`}></i>
                          <span>{paymentInfo.text}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Rooms */}
              {selectedBooking.rooms && selectedBooking.rooms.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    <i className="fas fa-bed mr-2 text-indigo-700"></i>
                    Phòng đã đặt
                  </h3>
                  <div className="space-y-2">
                    {selectedBooking.rooms.map((room, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="font-medium text-gray-900">{room.room_name || `Phòng #${room.room_id}`}</p>
                        {room.room_price && (
                          <p className="text-sm text-gray-600">
                            Giá: {Number(room.room_price).toLocaleString("vi-VN")} VNĐ
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div className="mb-6 border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  <i className="fas fa-user-circle mr-2 text-indigo-700"></i>
                  Thông tin khách hàng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Tên</p>
                    <p className="font-medium text-gray-900">
                      {selectedBooking.user_name || `User #${selectedBooking.user_id}`}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="font-medium text-gray-900">
                      {selectedBooking.user_email || selectedBooking.email || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cancellation Reason */}
              {selectedBooking.status === "cancelled" && (
                <div className="mb-6 border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    <i className="fas fa-exclamation-triangle mr-2 text-red-700"></i>
                    Thông tin hủy đặt phòng
                  </h3>
                  <div className="space-y-3">
                    {selectedBooking.cancellation_type && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600 mb-1">Loại hủy:</p>
                        <p className="font-medium text-gray-900">
                          {selectedBooking.cancellation_type === "admin" 
                            ? "Admin hủy" 
                            : selectedBooking.cancellation_type === "user"
                            ? "Người dùng hủy"
                            : selectedBooking.cancellation_type === "system"
                            ? "Hệ thống tự động hủy (quá hạn)"
                            : "Không xác định"}
                        </p>
                      </div>
                    )}
                    {selectedBooking.cancellation_reason && (
                      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <p className="text-sm text-gray-600 mb-2 font-semibold">Lý do hủy:</p>
                        <p className="text-gray-800 whitespace-pre-wrap">
                          {selectedBooking.cancellation_reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer with action buttons for pending bookings */}
            {selectedBooking.status === "pending" && !isAfterCheckOut(selectedBooking.check_out) && (
              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => handleCancelBooking(selectedBooking)}
                    disabled={updatingId === selectedBooking.id || isAfterCheckIn(selectedBooking.check_in)}
                    className="px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isAfterCheckIn(selectedBooking.check_in) ? "Không thể hủy sau thời gian check-in" : "Hủy đặt phòng"}
                  >
                    {updatingId === selectedBooking.id ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-times-circle"></i>
                        <span>Hủy đặt phòng</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking.id, "confirmed", false)}
                    disabled={updatingId === selectedBooking.id}
                    className="px-5 py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingId === selectedBooking.id ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check-circle"></i>
                        <span>Xác nhận đặt phòng</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
