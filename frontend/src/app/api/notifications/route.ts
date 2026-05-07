import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id, unread } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const updated = await prisma.notification.update({
      where: { 
        id,
        userId: user.id // Security check
      },
      data: { unread },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/notifications error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
