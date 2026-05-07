import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/mail";
import { getInterviewLinkEmailHtml } from "@/components/shared/EmailTemplates";

export const dynamic = "force-dynamic";

// POST /api/applications/[id]/actions - trigger a structured action
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // Fetch user and check role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== "EMPLOYER") {
      return NextResponse.json({ message: "Forbidden: Only employers can trigger interview actions" }, { status: 403 });
    }

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

    // Send Email if it's a meeting link
    if (type === "SEND_LINK") {
      try {
        await sendEmail({
          to: action.application.seeker.email,
          subject: `Interview Link: ${action.application.job.title}`,
          html: getInterviewLinkEmailHtml(
            action.application.seeker.name || "Candidate",
            action.application.job.title,
            action.application.job.company,
            metadata.url as string,
            metadata.instructions as string || "Follow the link to join the interview."
          )
        });
      } catch (emailErr) {
        console.error("Failed to send interview link email:", emailErr);
      }
    }

    return NextResponse.json(action);
  } catch (error: unknown) {
    console.error("POST /api/applications/[id]/actions error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
