import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/applications/[id] — fetch a single application with seeker profile
export async function GET(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        seeker: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            requirements: true,
          },
        },
      },
    });

    if (!application) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(application);
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/applications/[id] — employer updates status
export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { status } = body;

    const validStatuses = ["APPLIED", "SHORTLISTED", "REJECTED", "INTERVIEWING", "OFFER"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const application = await prisma.application.update({
      where: { id },
      data: { status },
      include: {
        job: {
          select: {
            title: true,
            company: true,
          },
        },
      },
    });

    // Create notification for seeker
    try {
      await prisma.notification.create({
        data: {
          userId: application.seekerId,
          title: "Application Update",
          message: `Your application for ${application.job.title} at ${application.job.company} has been moved to ${status}.`,
          type: status === "REJECTED" ? "ERROR" : status === "SHORTLISTED" || status === "OFFER" ? "SUCCESS" : "INFO",
          link: "/seeker/applications",
          unread: true,
        },
      });
    } catch (notifError) {
      console.error("Failed to create status notification:", notifError);
      // Don't fail the status update if notification fails
    }

    return NextResponse.json(application);
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
