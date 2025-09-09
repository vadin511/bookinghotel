"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookings } from "../../../store/features/bookingsSlide";

const BookingsPage = () => {
  const dispatch = useDispatch();
  const { list: bookings, loading, error } = useSelector((state) => state.bookings);
console.log("BookingsPage - bookings:", bookings);

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Danh sách Booking</h1>

      {loading && <p>Đang tải danh sách booking...</p>}
      {error && <p className="text-red-600">Lỗi: {error}</p>}

      {!loading && bookings.length === 0 && <p>Không có booking nào.</p>}

      {bookings.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">ID</th>
                <th className="border p-2">User</th>
                <th className="border p-2">Room</th>
                <th className="border p-2">Check-in</th>
                <th className="border p-2">Check-out</th>
                <th className="border p-2">Total Price</th>
                <th className="border p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="border p-2 text-center">{booking.id}</td>
                  <td className="border p-2">{booking.user_id}</td>
                  <td className="border p-2">{booking.room_name}</td>
                  <td className="border p-2">{booking.check_in}</td>
                  <td className="border p-2">{booking.check_out}</td>
                  <td className="border p-2 text-right">${booking.total_price}</td>
                  <td className="border p-2 text-center">{booking.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
