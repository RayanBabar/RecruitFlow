import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "SEEKER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const seekerId = (session.user as any).id;

    const [applications, user] = await Promise.all([
      prisma.application.findMany({
        where: { seekerId },
        include: {
          job: { select: { title: true, company: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findUnique({
        where: { id: seekerId },
        select: { name: true, email: true },
      }),
    ]);

    const total = applications.length;
    const shortlisted = applications.filter((a) => a.status === "SHORTLISTED").length;
    const interviewing = applications.filter((a) => a.status === "INTERVIEWING").length;

    return NextResponse.json({
      user,
      stats: { total, shortlisted, interviewing },
      recentActivity: applications.slice(0, 5).map((a) => ({
        id: a.id,
        company: a.job.company,
        role: a.job.title,
        date: new Date(a.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        status: a.status,
        matchScore: a.matchScore,
      })),
    });
  } catch (error) {
    console.error("GET /api/dashboard/seeker error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
