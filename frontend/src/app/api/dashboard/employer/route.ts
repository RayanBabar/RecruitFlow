import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const employerId = session.user.id;

    const [jobs, applications] = await Promise.all([
      prisma.job.findMany({
        where: { employerId },
        include: { _count: { select: { applications: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.application.findMany({
        where: { job: { employerId } },
      }),
    ]);

    const activeCount = jobs.filter((j) => j.status === "OPEN").length;
    const totalApplicants = applications.length;
    const shortlisted = applications.filter((a) => a.status === "SHORTLISTED").length;

    return NextResponse.json({
      stats: {
        activeListings: activeCount,
        totalApplicants,
        shortlisted,
      },
      activeJobs: jobs.slice(0, 5).map((j) => ({
        id: j.id,
        title: j.title,
        company: j.company,
        type: j.type,
        location: j.location,
        date: new Date(j.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        applicants: j._count.applications,
        status: j.status,
      })),
    });
  } catch (error) {
    console.error("GET /api/dashboard/employer error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
