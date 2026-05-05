import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/applications — seeker's applications OR employer's applicants for a job
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");
    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    let applications;

    if (role === "SEEKER") {
      // Seeker sees their own applications
      applications = await prisma.application.findMany({
        where: { seekerId: userId },
        include: {
          job: { select: { id: true, title: true, company: true, location: true, type: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (role === "EMPLOYER" && jobId) {
      // Employer sees applicants for a specific job
      applications = await prisma.application.findMany({
        where: { jobId },
        include: {
          seeker: {
            select: { id: true, name: true, email: true },
            include: { profile: true } as any,
          },
        },
        orderBy: { matchScore: "desc" },
      });
    } else {
      // Employer sees all applicants across all their jobs
      const employerJobs = await prisma.job.findMany({
        where: { employerId: userId },
        select: { id: true },
      });
      const jobIds = employerJobs.map((j) => j.id);

      applications = await prisma.application.findMany({
        where: { jobId: { in: jobIds } },
        include: {
          job: { select: { id: true, title: true, company: true } },
          seeker: { select: { id: true, name: true, email: true } },
        },
        orderBy: { matchScore: "desc" },
      });
    }

    return NextResponse.json(applications);
  } catch (error) {
    console.error("GET /api/applications error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/applications — seeker applies to a job (with optional AI resume parse)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "SEEKER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { jobId, matchScore, aiFeedback } = body;

    if (!jobId) {
      return NextResponse.json({ message: "jobId is required" }, { status: 400 });
    }

    const seekerId = (session.user as any).id;

    // Prevent duplicate applications
    const existing = await prisma.application.findFirst({
      where: { jobId, seekerId },
    });

    if (existing) {
      return NextResponse.json({ message: "Already applied to this job" }, { status: 400 });
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        seekerId,
        status: "APPLIED",
        matchScore: matchScore ?? null,
        aiFeedback: aiFeedback ?? null,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("POST /api/applications error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
