import { NextResponse } from "next/server";
import { verifySignature } from "../../../../utils/momo";
import db from "../../../../lib/db";

/**
 * API endpoint để xử lý callback từ MoMo sau khi thanh toán
 * GET /api/payments/momo/callback
 */
export async function GET(req) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const bookingId = searchParams.get("booking_id");

    // Lấy các tham số từ MoMo callback
    const resultCode = searchParams.get("resultCode");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");
    const orderInfo = searchParams.get("orderInfo");
    const orderType = searchParams.get("orderType");
    const transId = searchParams.get("transId");
    const message = searchParams.get("message");
    const payType = searchParams.get("payType");
    const responseTime = searchParams.get("responseTime");
    const extraData = searchParams.get("extraData") || "";
    const signature = searchParams.get("signature");
    const partnerCode = searchParams.get("partnerCode");
    const requestId = searchParams.get("requestId");

    // Validate các tham số bắt buộc
    if (
      !resultCode ||
      !orderId ||
      !amount ||
      !signature ||
      !transId ||
      !partnerCode
    ) {
      return NextResponse.redirect(
        new URL(
          `/payment?error=missing_params&booking_id=${bookingId || ""}`,
          req.url
        )
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
      console.error("Invalid MoMo signature");
      return NextResponse.redirect(
        new URL(
          `/payment?error=invalid_signature&booking_id=${bookingId || ""}`,
          req.url
        )
      );
    }

    // Xử lý kết quả thanh toán
    if (resultCode === "0") {
      // Thanh toán thành công
      // Parse extraData để lấy bookingId nếu có
      // extraData từ MoMo là base64 encoded
      let parsedBookingId = bookingId;
      try {
        if (extraData) {
          // Decode base64
          const decodedExtraData = Buffer.from(extraData, "base64").toString("utf8");
          const extraDataObj = JSON.parse(decodedExtraData);
          if (extraDataObj.bookingId) {
            parsedBookingId = extraDataObj.bookingId;
          }
        }
      } catch (e) {
        console.error("Error parsing extraData:", e);
      }

      // Cập nhật booking status nếu có bookingId
      if (parsedBookingId) {
        try {
          // Cập nhật booking status thành 'paid'
          await db.query(
            `UPDATE bookings 
             SET status = 'paid', 
                 payment_method = 'momo',
                 updated_at = NOW()
             WHERE id = ?`,
            [parsedBookingId]
          );

          // Lưu thông tin thanh toán vào bảng payments nếu có
          // TODO: Tạo bảng payments để lưu chi tiết
        } catch (dbError) {
          console.error("Error updating booking:", dbError);
        }
      }

      // Redirect về trang thành công
      return NextResponse.redirect(
        new URL(
          `/payment/success?booking_id=${parsedBookingId || ""}&order_id=${orderId}&trans_id=${transId}`,
          req.url
        )
      );
    } else {
      // Thanh toán thất bại
      return NextResponse.redirect(
        new URL(
          `/payment?error=payment_failed&message=${encodeURIComponent(message || "Thanh toán thất bại")}&booking_id=${bookingId || ""}`,
          req.url
        )
      );
    }
  } catch (error) {
    console.error("GET /api/payments/momo/callback error:", error);
    return NextResponse.redirect(
      new URL(
        `/payment?error=server_error&message=${encodeURIComponent(error.message)}`,
        req.url
      )
    );
  }
}
