import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/applications/[id]/messages - fetch history
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const messages = await prisma.message.findMany({
      where: { applicationId: id },
      include: {
        sender: {
          select: { name: true, role: true }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json(messages);
  } catch (error: unknown) {
    console.error("GET /api/applications/[id]/messages error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/applications/[id]/messages - send a message
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const { content } = await req.json();
    if (!content) return NextResponse.json({ message: "Content is required" }, { status: 400 });

    const message = await prisma.message.create({
      data: {
        applicationId: id,
        senderId: user.id,
        content,
      },
      include: {
        application: {
          include: {
            job: true,
            seeker: true
          }
        }
      }
    });

    // Notify the other party
    const isEmployer = user.role === "EMPLOYER";
    const recipientId = isEmployer ? message.application.seekerId : message.application.job.employerId;
    
    if (recipientId) {
      await prisma.notification.create({
        data: {
          userId: recipientId,
          title: "New Message",
          message: `New message regarding ${message.application.job.title}`,
          link: isEmployer ? `/seeker/applications` : `/employer/pipeline/${id}`,
          unread: true,
        }
      });
    }

    return NextResponse.json(message);
  } catch (error: unknown) {
    console.error("POST /api/applications/[id]/messages error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
