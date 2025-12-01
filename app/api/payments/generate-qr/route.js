// app/api/payments/generate-qr/route.js
import { NextResponse } from "next/server";
import { getUserFromToken } from "../../../lib/auth";

// Tạo QR code cho chuyển khoản
export async function POST(req) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { amount, order_info } = await req.json();

    if (!amount) {
      return NextResponse.json(
        { message: "Thiếu số tiền" },
        { status: 400 }
      );
    }

    // Tạo thông tin QR code
    // Có thể tích hợp với API ngân hàng để tạo QR code thực tế
    // Tạm thời tạo QR code với thông tin thanh toán
    const qrData = {
      amount: amount,
      order_info: order_info || "Thanh toan dat phong",
      bank_account: "1234567890", // Số tài khoản ngân hàng
      bank_name: "Vietcombank",
      account_holder: "BOOKING HOTEL",
    };

    // Tạo QR code URL từ QR code generator service
    // Hoặc có thể sử dụng API từ ngân hàng
    const qrCodeData = JSON.stringify(qrData);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCodeData)}`;

    return NextResponse.json({
      qr_code_url: qrCodeUrl,
      qr_data: qrData,
    });
  } catch (error) {
    console.error("POST /api/payments/generate-qr error:", error);
    return NextResponse.json(
      {
        message: "Lỗi server khi tạo QR code",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

