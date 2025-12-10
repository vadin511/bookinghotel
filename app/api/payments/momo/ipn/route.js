import { NextResponse } from "next/server";
import { verifySignature } from "../../../../utils/momo";
import db from "../../../../lib/db";

/**
 * API endpoint để xử lý IPN (Instant Payment Notification) từ MoMo
 * POST /api/payments/momo/ipn
 */
export async function POST(req) {
  try {
    const body = await req.json();

    const {
      resultCode,
      orderId,
      amount,
      orderInfo,
      orderType,
      transId,
      message,
      payType,
      responseTime,
      extraData = "",
      signature,
      partnerCode,
      requestId,
    } = body;

    // Validate các tham số bắt buộc
    if (
      !resultCode ||
      !orderId ||
      !amount ||
      !signature ||
      !transId ||
      !partnerCode
    ) {
      return NextResponse.json(
        { message: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Verify signature
    const isValid = verifySignature({
      amount,
      extraData,
      message: message || "",
      orderId,
      orderInfo: orderInfo || "",
      orderType: orderType || "",
      partnerCode,
      payType: payType || "",
      requestId: requestId || "",
      responseTime: responseTime || "",
      resultCode,
      transId,
      signature,
    });

    if (!isValid) {
      console.error("Invalid MoMo IPN signature");
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 400 }
      );
    }

    // Parse extraData để lấy bookingId
    // extraData từ MoMo là base64 encoded
    let bookingId = null;
    try {
      if (extraData) {
        // Decode base64
        const decodedExtraData = Buffer.from(extraData, "base64").toString("utf8");
        const extraDataObj = JSON.parse(decodedExtraData);
        if (extraDataObj.bookingId) {
          bookingId = extraDataObj.bookingId;
        }
      }
    } catch (e) {
      console.error("Error parsing extraData:", e);
    }

    // Xử lý kết quả thanh toán
    if (resultCode === "0") {
      // Thanh toán thành công
      if (bookingId) {
        try {
          // Kiểm tra xem booking đã được cập nhật chưa
          const [bookings] = await db.query(
            "SELECT status FROM bookings WHERE id = ?",
            [bookingId]
          );

          if (bookings.length > 0 && bookings[0].status !== "paid") {
            // Cập nhật booking status thành 'paid'
            await db.query(
              `UPDATE bookings 
               SET status = 'paid', 
                   payment_method = 'momo',
                   updated_at = NOW()
               WHERE id = ?`,
              [bookingId]
            );

            // Lưu thông tin thanh toán vào bảng payments nếu có
            // TODO: Tạo bảng payments để lưu chi tiết thanh toán
            console.log(
              `MoMo IPN: Booking ${bookingId} updated to paid. OrderId: ${orderId}, TransId: ${transId}`
            );
          }
        } catch (dbError) {
          console.error("Error updating booking from IPN:", dbError);
          // Vẫn trả về success để MoMo không gửi lại IPN
        }
      }

      return NextResponse.json({
        message: "IPN processed successfully",
        resultCode: 0,
      });
    } else {
      // Thanh toán thất bại
      console.log(
        `MoMo IPN: Payment failed. OrderId: ${orderId}, Message: ${message}`
      );
      return NextResponse.json({
        message: "Payment failed",
        resultCode: resultCode,
      });
    }
  } catch (error) {
    console.error("POST /api/payments/momo/ipn error:", error);
    return NextResponse.json(
      {
        message: "Server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
