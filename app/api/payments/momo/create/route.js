import { NextResponse } from "next/server";
import { getUserFromToken } from "../../../../lib/auth";
import {
  createPaymentRequest,
  sendPaymentRequest,
} from "../../../../utils/momo";

/**
 * API endpoint để tạo payment request với MoMo
 * POST /api/payments/momo/create
 */
export async function POST(req) {
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const {
      orderId,
      amount,
      orderInfo,
      bookingId,
      extraData = "",
    } = await req.json();

    // Validate input
    if (!orderId || amount === undefined || amount === null || !orderInfo) {
      return NextResponse.json(
        { 
          message: "Thiếu thông tin bắt buộc",
          details: { orderId: !!orderId, amount: amount !== undefined && amount !== null, orderInfo: !!orderInfo }
        },
        { status: 400 }
      );
    }

    // Validate amount là số và > 0
    const amountNumber = Number(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      return NextResponse.json(
        { message: "Số tiền không hợp lệ" },
        { status: 400 }
      );
    }

    // Tạo return URL và notify URL
    // Lấy base URL từ request hoặc env variable
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    
    if (!baseUrl) {
      // Trong Next.js App Router, req.url chỉ có pathname
      // Lấy từ headers
      const protocol = req.headers.get("x-forwarded-proto") || 
                      req.headers.get("x-forwarded-protocol") ||
                      "http";
      const host = req.headers.get("host") || 
                   req.headers.get("x-forwarded-host") || 
                   "localhost:3000";
      baseUrl = `${protocol}://${host}`;
      
      console.log("Constructed baseUrl from headers:", {
        protocol,
        host,
        baseUrl,
        headers: {
          "x-forwarded-proto": req.headers.get("x-forwarded-proto"),
          "host": req.headers.get("host"),
          "x-forwarded-host": req.headers.get("x-forwarded-host"),
        }
      });
    }
    
    // Đảm bảo baseUrl không có trailing slash
    baseUrl = baseUrl.replace(/\/$/, "");
    
    // Validate baseUrl
    if (!baseUrl || baseUrl === "undefined" || baseUrl.includes("undefined") || baseUrl === "null") {
      console.error("Invalid baseUrl:", baseUrl);
      return NextResponse.json(
        { 
          message: "Không thể xác định base URL. Vui lòng cấu hình NEXT_PUBLIC_BASE_URL trong .env",
          debug: {
            baseUrl,
            envBaseUrl: process.env.NEXT_PUBLIC_BASE_URL,
            headers: {
              host: req.headers.get("host"),
              "x-forwarded-proto": req.headers.get("x-forwarded-proto"),
            }
          }
        },
        { status: 500 }
      );
    }
    
    // Tạo URLs - đảm bảo không có query params nếu bookingId rỗng
    const redirectUrl = bookingId 
  ? `${baseUrl}/api/payments/momo/callback?booking_id=${bookingId}`
  : `${baseUrl}/api/payments/momo/callback`;

const ipnUrl = `${baseUrl}/api/payments/momo/ipn`;

    
    // Validate URLs một lần nữa sau khi tạo
    if (!redirectUrl || redirectUrl.trim() === "" || redirectUrl.includes("undefined") || redirectUrl.includes("null")) {
      console.error("Invalid redirectUrl after creation:", { redirectUrl, baseUrl, bookingId });
      return NextResponse.json(
        { 
          message: "Không thể tạo return URL",
          debug: { redirectUrl, baseUrl, bookingId }
        },
        { status: 500 }
      );
    }

    if (!ipnUrl || ipnUrl.trim() === "" || ipnUrl.includes("undefined") || ipnUrl.includes("null")) {
      console.error("Invalid ipnUrl after creation:", { ipnUrl, baseUrl });
      return NextResponse.json(
        { 
          message: "Không thể tạo notify URL",
          debug: { ipnUrl, baseUrl }
        },
        { status: 500 }
      );
    }

    console.log("MoMo URLs:", { 
      baseUrl, 
      redirectUrl, 
      ipnUrl,
      redirectUrlLength: redirectUrl.length,
      ipnUrlLength: ipnUrl.length,
    });

    // Tạo payment request
    // Nếu extraData đã được gửi từ client (đã base64), sử dụng nó
    // Nếu không, tạo từ bookingId
    let finalExtraData = extraData;
    if (!finalExtraData && bookingId) {
      // Tạo JSON string từ bookingId (chưa encode base64)
      finalExtraData = JSON.stringify({ bookingId });
    }
    
    const finalOrderInfo = String(orderInfo).substring(0, 255);
    
    const paymentData = createPaymentRequest({
      orderId: String(orderId),
      amount: amountNumber,
      orderInfo: finalOrderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      extraData: finalExtraData, // Sẽ được encode base64 trong createPaymentRequest
    });

    console.log("MoMo payment request data:", {
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      orderInfo: paymentData.orderInfo,
      extraData: paymentData.extraData,
      redirectUrl: paymentData.redirectUrl,
      ipnUrl: paymentData.ipnUrl,
      hasSignature: !!paymentData.signature,
      signatureLength: paymentData.signature?.length,
    });

    // Gửi request đến MoMo
    let momoResponse;
    try {
      console.log("Sending request to MoMo API...");
      momoResponse = await sendPaymentRequest(paymentData);
      console.log("MoMo API response:", JSON.stringify(momoResponse, null, 2));
    } catch (fetchError) {
      console.error("Error sending request to MoMo:", {
        message: fetchError.message,
        stack: fetchError.stack,
      });
      return NextResponse.json(
        {
          message: "Không thể kết nối đến MoMo. Vui lòng thử lại sau.",
          error: fetchError.message,
        },
        { status: 500 }
      );
    }

    // Kiểm tra response từ MoMo
    if (!momoResponse) {
      console.error("MoMo response is null or undefined");
      return NextResponse.json(
        {
          message: "Không nhận được phản hồi từ MoMo",
        },
        { status: 500 }
      );
    }

    // Log full response để debug
    console.log("MoMo response details:", {
      resultCode: momoResponse.resultCode,
      message: momoResponse.message,
      subMessage: momoResponse.subMessage,
      payUrl: momoResponse.payUrl,
      hasPayUrl: !!momoResponse.payUrl,
    });

    if (momoResponse.resultCode === 0) {
      // Thành công, trả về payUrl để redirect
      if (!momoResponse.payUrl) {
        console.error("MoMo returned success but no payUrl");
        return NextResponse.json(
          {
            message: "MoMo trả về thành công nhưng không có URL thanh toán",
          },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
        payUrl: momoResponse.payUrl,
        orderId: orderId,
        requestId: paymentData.requestId,
      });
    } else {
      // Lỗi từ MoMo
      console.error("MoMo API error:", {
        resultCode: momoResponse.resultCode,
        message: momoResponse.message,
        subMessage: momoResponse.subMessage,
        fullResponse: momoResponse,
      });
      return NextResponse.json(
        {
          success: false,
          message: momoResponse.message || momoResponse.subMessage || "Lỗi khi tạo payment request",
          resultCode: momoResponse.resultCode,
          details: momoResponse,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("POST /api/payments/momo/create error:", error);
    return NextResponse.json(
      {
        message: "Lỗi server khi tạo payment request",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
