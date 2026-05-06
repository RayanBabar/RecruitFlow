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
      include: { notificationSettings: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.notificationSettings) {
      // Create defaults if not exists
      const newSettings = await prisma.notificationSettings.create({
        data: { userId: user.id },
      });
      return NextResponse.json(newSettings);
    }

    return NextResponse.json(user.notificationSettings);
  } catch (error) {
    console.error("GET /api/user/settings error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { emailAlerts, pushAlerts, marketingEmails } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const updated = await prisma.notificationSettings.upsert({
      where: { userId: user.id },
      update: { emailAlerts, pushAlerts, marketingEmails },
      create: {
        userId: user.id,
        emailAlerts,
        pushAlerts,
        marketingEmails,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/user/settings error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
