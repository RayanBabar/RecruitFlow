import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST /api/applications/[id]/actions - trigger a structured action
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { type, metadata } = body;

    const action = await prisma.applicationAction.create({
      data: {
        applicationId: id,
        type,
        metadata,
      },
      include: {
        application: {
          include: {
            seeker: true,
            job: true
          }
        }
      }
    });

    // Notify seeker
    await prisma.notification.create({
      data: {
        userId: action.application.seekerId,
        title: type === "REQUEST_SLOTS" ? "Interview Availability Requested" : "Meeting Link Received",
        message: type === "REQUEST_SLOTS" 
          ? `The employer for ${action.application.job.title} has requested your availability.`
          : `A meeting link has been shared for your interview with ${action.application.job.company}.`,
        link: `/seeker/applications`,
        unread: true,
      }
    });

    return NextResponse.json(action);
  } catch (error: unknown) {
    console.error("POST /api/applications/[id]/actions error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
