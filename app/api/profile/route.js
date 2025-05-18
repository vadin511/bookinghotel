import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined");
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }

  try {
    const userData = jwt.verify(token, JWT_SECRET);
    console.log(userData);

    if (!userData) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, user: userData }, { status: 200 });
  } catch (error) {
    console.error("JWT verification error:", error);
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}

export async function PUT(req) {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token || !JWT_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const userData = jwt.verify(token, JWT_SECRET);
    const body = await req.json();
    const result = updateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid data", errors: result.error.flatten() },
        { status: 400 }
      );
    }

    const { full_name, email, avatar_url } = result.data;

    const updated = await db.User.update(
      { full_name, email, avatar_url },
      { where: { id: userData.id } }
    );

    if (updated[0] === 0) {
      return NextResponse.json({ message: "Update failed" }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Profile updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
