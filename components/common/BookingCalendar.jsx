"use client";

import { useEffect, useState, useRef } from "react";

const BookingCalendar = ({ 
  checkIn, 
  checkOut, 
  onCheckInChange, 
  onCheckOutChange,
  roomId,
  pricePerNight,
  disabledDates = [],
  onClose,
  disableBookedDates = true // Mặc định disable ngày đã booking
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookedDates, setBookedDates] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const calendarRef = useRef(null);

  // Format date to YYYY-MM-DD (local time, no timezone conversion)
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format date to display (like: Fri, 12 Dec)
  const formatDisplayDate = (dateString) => {
    // Parse date string safely without timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const months = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];
    const dayName = days[date.getDay()];
    const dayNum = date.getDate();
    const monthName = months[date.getMonth()];
    return `${dayName}, ${dayNum} ${monthName}`;
  };

  // Load booked dates (chỉ khi disableBookedDates = true và có roomId)
  useEffect(() => {
    if (!roomId || !disableBookedDates) return;

    const loadBookedDates = async () => {
      setLoading(true);
      try {
        const startDate = new Date(currentMonth);
        startDate.setDate(1);
        
        const endDate = new Date(currentMonth);
        endDate.setMonth(endDate.getMonth() + 2);
        endDate.setDate(0); // Last day of next month

        const res = await fetch(
          `/api/rooms/${roomId}/booked-dates?start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}`
        );
        
        if (res.ok) {
          const data = await res.json();
          setBookedDates(new Set(data.booked_dates || []));
        }
      } catch (error) {
        console.error("Error loading booked dates:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBookedDates();
  }, [roomId, currentMonth]);

  // Get first day of month and number of days
  const getMonthData = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Adjust Monday as first day (0 = Monday)
    const adjustedStartingDay = (startingDayOfWeek + 6) % 7;
    
    return {
      year,
      month,
      daysInMonth,
      startingDayOfWeek: adjustedStartingDay,
      monthName: date.toLocaleDateString("vi-VN", { month: "long", year: "numeric" })
    };
  };

  // Navigate months
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Parse date string to Date object (local time, no timezone issues)
  const parseDateString = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Check if date is disabled
  const isDateDisabled = (dateStr) => {
    const date = parseDateString(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Disable past dates
    if (date < today) return true;
    
    // Disable booked dates (chỉ khi disableBookedDates = true)
    if (disableBookedDates && bookedDates.has(dateStr)) return true;
    
    // Disable if in disabledDates prop
    if (disabledDates.includes(dateStr)) return true;
    
    return false;
  };

  // Check if date is in selected range
  const isDateInRange = (dateStr) => {
    if (!checkIn || !checkOut) return false;
    const date = parseDateString(dateStr);
    const start = parseDateString(checkIn);
    const end = parseDateString(checkOut);
    return date >= start && date < end;
  };

  // Check if date is selected (start or end)
  const isDateSelected = (dateStr) => {
    return dateStr === checkIn || dateStr === checkOut;
  };

  // Handle date click
  const handleDateClick = (dateStr) => {
    if (isDateDisabled(dateStr)) return;

    const date = parseDateString(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If no dates selected or both selected, start new selection
    if (!checkIn || (checkIn && checkOut)) {
      onCheckInChange(dateStr);
      onCheckOutChange("");
      return;
    }

    // If only checkIn selected
    if (checkIn && !checkOut) {
      const checkInDate = parseDateString(checkIn);
      
      // If clicked date is before checkIn, make it the new checkIn
      if (date < checkInDate) {
        onCheckInChange(dateStr);
        onCheckOutChange("");
        return;
      }

      // Check if there are any booked dates in between
      let hasBooking = false;
      let current = new Date(checkInDate);
      current.setDate(current.getDate() + 1);
      
      while (current < date) {
        const currentStr = formatDate(current);
        if (bookedDates.has(currentStr) || isDateDisabled(currentStr)) {
          hasBooking = true;
          break;
        }
        current.setDate(current.getDate() + 1);
      }

      if (!hasBooking) {
        onCheckOutChange(dateStr);
      } else {
        // If there's a booking in between, start new selection
        onCheckInChange(dateStr);
        onCheckOutChange("");
      }
    }
  };

  // Render calendar month
  const renderMonth = (date, isSecondMonth = false) => {
    const monthData = getMonthData(date);
    const days = [];
    
    // Empty cells for days before month starts (past dates in previous month)
    for (let i = monthData.startingDayOfWeek - 1; i >= 0; i--) {
      const prevMonthDate = new Date(monthData.year, monthData.month, -i);
      days.push(
        <div key={`prev-${i}`} className="h-14 w-full flex items-center justify-center text-gray-300">
          <span className="text-xs">{prevMonthDate.getDate()}</span>
        </div>
      );
    }

    // Days of the month
    for (let day = 1; day <= monthData.daysInMonth; day++) {
      const dateObj = new Date(monthData.year, monthData.month, day);
      const dateStr = formatDate(dateObj);
      const disabled = isDateDisabled(dateStr);
      const inRange = isDateInRange(dateStr);
      const selected = isDateSelected(dateStr);
      const isBooked = bookedDates.has(dateStr);
      
      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateClick(dateStr)}
          disabled={disabled}
          className={`
            relative h-14 w-full flex items-center justify-center text-sm transition-all rounded
            ${disabled || (disableBookedDates && isBooked)
              ? "text-gray-300 cursor-not-allowed opacity-50" 
              : "hover:bg-amber-50 cursor-pointer"
            }
            ${selected 
              ? "bg-[#5a3f26] text-white font-semibold" 
              : ""
            }
            ${inRange && !selected 
              ? "bg-amber-100" 
              : ""
            }
            ${!disabled && !selected && !inRange && !isBooked
              ? "text-gray-700" 
              : ""
            }
          `}
        >
          <span className={`text-xs font-medium ${selected ? "text-white" : ""}`}>{day}</span>
        </button>
      );
    }

    // Fill remaining cells to ensure exactly 6 rows (42 cells total) for alignment
    const totalCells = days.length;
    const remainingCells = 42 - totalCells;
    if (remainingCells > 0) {
      for (let i = 0; i < remainingCells; i++) {
        const nextMonthDate = new Date(monthData.year, monthData.month + 1, i + 1);
        days.push(
          <div key={`next-${i}`} className="h-14 w-full flex items-center justify-center text-gray-300">
            <span className="text-xs">{nextMonthDate.getDate()}</span>
          </div>
        );
      }
    }

    return (
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center justify-center mb-4 h-8">
          <h3 className="text-base font-semibold text-[#5a3f26] capitalize">
            {date.toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}
          </h3>
        </div>
        <div className="grid grid-cols-7 gap-0.5 mb-2">
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
            <div key={day} className="h-6 flex items-center justify-center text-xs font-medium text-gray-600 uppercase">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5" style={{ gridTemplateRows: 'repeat(6, 3.5rem)', height: '21rem' }}>
          {days}
        </div>
      </div>
    );
  };

  // Calculate nights
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = parseDateString(checkIn);
    const end = parseDateString(checkOut);
    const diffTime = end - start;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();

  // Close calendar when clicking outside - handled by parent component

  const firstMonth = currentMonth;
  const secondMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);

  return (
    <div 
      ref={calendarRef}
      className="absolute top-full left-0 right-0 md:right-auto mt-2 bg-white border border-gray-300 rounded-lg shadow-xl p-6 z-50 w-full md:w-auto md:min-w-[650px]"
    >
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
          <div className="text-[#5a3f26]">Đang tải...</div>
        </div>
      )}
      
      {/* Calendar Grid */}
      <div className="relative flex items-start gap-6 mb-6">
        <button
          type="button"
          onClick={prevMonth}
          className="flex-shrink-0 text-[#5a3f26] hover:text-amber-700 transition-colors z-10 bg-white rounded-full p-2 shadow-sm border border-gray-200 w-8 h-8 flex items-center justify-center mt-12"
        >
          <i className="fas fa-chevron-left text-sm"></i>
        </button>
        <div className="flex-1 min-w-0">
          {renderMonth(firstMonth, false)}
        </div>
        <div className="flex-1 min-w-0">
          {renderMonth(secondMonth, true)}
        </div>
        <button
          type="button"
          onClick={nextMonth}
          className="flex-shrink-0 text-[#5a3f26] hover:text-amber-700 transition-colors z-10 bg-white rounded-full p-2 shadow-sm border border-gray-200 w-8 h-8 flex items-center justify-center mt-12"
        >
          <i className="fas fa-chevron-right text-sm"></i>
        </button>
      </div>

      {/* Selected Date Summary and Search Button */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-[#5a3f26]">
          {checkIn && checkOut ? (
            <>
              <span className="font-semibold">
                {formatDisplayDate(checkIn)} — {formatDisplayDate(checkOut)}
              </span>
              <span className="text-gray-600 ml-2">({nights} đêm)</span>
            </>
          ) : (
            <span className="text-gray-500">Chọn ngày nhận phòng và trả phòng</span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={!checkIn || !checkOut}
          className={`px-6 py-2.5 rounded-lg text-white font-semibold transition-colors ${
            checkIn && checkOut
              ? "bg-[#5a3f26] hover:bg-[#4a3320]"
              : "bg-gray-300 cursor-not-allowed text-gray-500"
          }`}
        >
          Tìm kiếm
        </button>
      </div>
    </div>
  );
};

export default BookingCalendar;
