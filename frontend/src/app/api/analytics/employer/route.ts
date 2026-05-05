import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "EMPLOYER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const employerId = (session.user as any).id;

    // Fetch all jobs for this employer
    const jobs = await prisma.job.findMany({
      where: { employerId },
      include: {
        _count: { select: { applications: true } },
        applications: { select: { matchScore: true, status: true, createdAt: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalApplications = jobs.reduce((sum, j) => sum + j._count.applications, 0);
    const totalViews = jobs.reduce((sum, j) => sum + (j.views || 0), 0);

    // Average time to hire (days since posting for OFFER applications)
    const offerApps = jobs.flatMap((j) =>
      j.applications
        .filter((a) => a.status === "OFFER")
        .map((a) => Math.ceil((Date.now() - new Date(a.createdAt).getTime()) / 86400000))
    );
    const avgTimeToHire = offerApps.length
      ? Math.round(offerApps.reduce((s, d) => s + d, 0) / offerApps.length)
      : null;

    // Offer accept rate
    const offersTotal = jobs.flatMap((j) => j.applications.filter((a) => a.status === "OFFER")).length;
    const offerAcceptRate = totalApplications > 0 ? Math.round((offersTotal / totalApplications) * 100) : 0;

    // Per-job performance table
    const topJobs = jobs
      .map((j) => {
        const avgMatch =
          j.applications.length > 0
            ? Math.round(
                j.applications.reduce((s, a) => s + (a.matchScore ?? 0), 0) / j.applications.length
              )
            : null;
        return {
          id: j.id,
          title: j.title,
          applicants: j._count.applications,
          views: j.views || 0,
          avgMatch,
          status: j.status,
        };
      })
      .sort((a, b) => b.applicants - a.applicants)
      .slice(0, 8);

    return NextResponse.json({
      stats: {
        totalViews,
        totalApplications,
        avgTimeToHire,
        offerAcceptRate,
      },
      topJobs,
    });
  } catch (error) {
    console.error("GET /api/analytics/employer error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
